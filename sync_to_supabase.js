import 'dotenv/config';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const CRM_URL = process.env.RETAILCRM_URL;
const API_KEY = process.env.RETAILCRM_API_KEY;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function fetchOrdersFromCRM() {
  let allOrders = [];
  let page = 1;

  while (true) {
    const url = `${CRM_URL}/api/v5/orders?apiKey=${API_KEY}&page=${page}&limit=100`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.success) {
      console.error('❌ Ошибка API:', data.errorMsg || data.errors);
      break;
    }

    allOrders = allOrders.concat(data.orders);
    console.log(`📥 Страница ${page}: получено ${data.orders.length} заказов`);

    if (page >= data.pagination.totalPageCount) break;
    page++;
  }

  return allOrders;
}

function transformOrder(order) {
  const totalSum = (order.items || []).reduce(
    (sum, item) => sum + (item.initialPrice || 0) * (item.quantity || 1),
    0
  );

  return {
    external_id: order.externalId || `crm-${order.id}`,
    crm_id: order.id,
    first_name: order.firstName || '',
    last_name: order.lastName || '',
    phone: order.phone || '',
    email: order.email || '',
    status: order.status || '',
    city: order.delivery?.address?.city || '',
    address: order.delivery?.address?.text || '',
    total_sum: totalSum,
    items: JSON.stringify(order.items || []),
    utm_source: order.customFields?.utm_source || '',
    created_at: order.createdAt || new Date().toISOString(),
  };
}

async function syncToSupabase(orders) {
  const rows = orders.map(transformOrder);

  // Upsert батчами по 50
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase
      .from('orders')
      .upsert(batch, { onConflict: 'external_id' });

    if (error) {
      console.error(`❌ Ошибка Supabase (batch ${i}):`, error.message);
    } else {
      console.log(`✅ Записано ${Math.min(i + 50, rows.length)}/${rows.length}`);
    }
  }
}

async function main() {
  console.log('\n🔄 Синхронизация RetailCRM → Supabase...\n');

  const orders = await fetchOrdersFromCRM();
  console.log(`\n📦 Всего получено: ${orders.length} заказов\n`);

  if (orders.length > 0) {
    await syncToSupabase(orders);
    console.log('\n✅ Синхронизация завершена!\n');
  }
}

main();
