import 'dotenv/config';
import fetch from 'node-fetch';
import { readFileSync } from 'fs';

const CRM_URL = process.env.RETAILCRM_URL;
const API_KEY = process.env.RETAILCRM_API_KEY;
const orders = JSON.parse(readFileSync('./mock_orders.json', 'utf-8'));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function uploadOrder(orderData, index) {
  // Формируем заказ в формате RetailCRM API v5
  const order = {
    externalId: `mock-${index + 1}`,
    orderType: 'main',
    orderMethod: orderData.orderMethod,
    status: 'new',
    firstName: orderData.firstName,
    lastName: orderData.lastName,
    phone: orderData.phone,
    email: orderData.email,
    items: orderData.items.map((item) => ({
      offer: { name: item.productName },
      productName: item.productName,
      quantity: item.quantity,
      initialPrice: item.initialPrice,
    })),
    delivery: {
      address: orderData.delivery.address,
    },
    customFields: orderData.customFields || {},
  };

  const params = new URLSearchParams();
  params.append('apiKey', API_KEY);
  params.append('order', JSON.stringify(order));

  const res = await fetch(`${CRM_URL}/api/v5/orders/create`, {
    method: 'POST',
    body: params,
  });

  const data = await res.json();

  if (data.success) {
    const total = orderData.items.reduce(
      (sum, i) => sum + i.initialPrice * i.quantity,
      0
    );
    console.log(
      `✅ [${index + 1}/${orders.length}] Заказ #${data.id} — ${orderData.firstName} ${orderData.lastName} — ${total} ₸`
    );
  } else {
    console.error(
      `❌ [${index + 1}/${orders.length}] Ошибка:`,
      data.errorMsg || data.errors
    );
  }

  return data;
}

async function main() {
  console.log(`\n📦 Загрузка ${orders.length} заказов в RetailCRM...\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < orders.length; i++) {
    try {
      const result = await uploadOrder(orders[i], i);
      if (result.success) success++;
      else failed++;
    } catch (err) {
      console.error(`❌ [${i + 1}] Сетевая ошибка:`, err.message);
      failed++;
    }
    await sleep(350); // лимит API
  }

  console.log(`\n📊 Итого: ✅ ${success} загружено, ❌ ${failed} ошибок\n`);
}

main();
