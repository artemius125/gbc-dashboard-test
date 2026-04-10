import 'dotenv/config';
import fetch from 'node-fetch';

const CRM_URL = process.env.RETAILCRM_URL;
const API_KEY = process.env.RETAILCRM_API_KEY;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const CHECK_INTERVAL = 60_000; // проверять раз в минуту
const THRESHOLD = 50_000;

let lastCheckedAt = new Date().toISOString();

async function sendTelegram(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: 'HTML',
    }),
  });
  const data = await res.json();
  if (!data.ok) console.error('❌ Telegram ошибка:', data.description);
  return data;
}

async function checkNewOrders() {
  const url = `${CRM_URL}/api/v5/orders?apiKey=${API_KEY}&filter[createdAtFrom]=${encodeURIComponent(lastCheckedAt)}&limit=100`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.success) {
      console.error('❌ CRM ошибка:', data.errorMsg);
      return;
    }

    for (const order of data.orders || []) {
      const total = (order.items || []).reduce(
        (sum, item) => sum + (item.initialPrice || 0) * (item.quantity || 1),
        0
      );

      if (total > THRESHOLD) {
        const msg =
          `🔔 <b>Крупный заказ!</b>\n\n` +
          `👤 ${order.firstName} ${order.lastName}\n` +
          `💰 Сумма: <b>${total.toLocaleString('ru')} ₸</b>\n` +
          `📦 Товаров: ${order.items?.length || 0}\n` +
          `🏙 ${order.delivery?.address?.city || '—'}\n` +
          `📱 ${order.phone || '—'}`;

        await sendTelegram(msg);
        console.log(`📨 Уведомление: заказ #${order.id} на ${total} ₸`);
      }
    }

    if (data.orders?.length > 0) {
      console.log(
        `🔍 Проверено ${data.orders.length} новых заказов (${new Date().toLocaleTimeString()})`
      );
    }
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
  }

  lastCheckedAt = new Date().toISOString();
}

async function main() {
  console.log('\n🤖 Telegram-бот запущен!');
  console.log(`   Порог: ${THRESHOLD.toLocaleString('ru')} ₸`);
  console.log(`   Интервал: ${CHECK_INTERVAL / 1000} сек\n`);

  // Тестовое сообщение при запуске
  await sendTelegram('✅ Бот мониторинга заказов запущен!');

  // Первая проверка — берём ВСЕ заказы, чтобы отправить уведомления
  // о существующих крупных заказах (для скриншота)
  lastCheckedAt = '2020-01-01T00:00:00+00:00';
  await checkNewOrders();

  // Дальше — только новые
  setInterval(checkNewOrders, CHECK_INTERVAL);
}

main();
