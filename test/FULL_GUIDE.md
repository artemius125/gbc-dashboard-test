# 🚀 Полная инструкция — Fedora

## 0. Подготовка

```bash
# Установи Node.js если нет
sudo dnf install nodejs npm git -y
node -v   # нужен 18+
```

---

## 1. Собери ключи (запиши в блокнот)

### RetailCRM API Key:
1. Зайди в свой RetailCRM → Администрирование → Интеграция → API-ключи
2. Создай новый ключ с доступом к заказам
3. Запиши URL (например `https://myshop.retailcrm.ru`) и ключ

### Supabase:
1. https://supabase.com → твой проект → Settings → API
2. Запиши **Project URL** и **anon public key**

### Telegram:
1. Бот уже создан — запиши токен от BotFather
2. Напиши своему боту `/start` в Telegram
3. Открой в браузере: `https://api.telegram.org/bot<ТВОЙ_ТОКЕН>/getUpdates`
4. Найди в JSON свой `chat_id` (число в `"chat":{"id": 123456789}`)

---

## 2. Создай проект

```bash
mkdir ~/gbc-dashboard && cd ~/gbc-dashboard
```

Скопируй сюда все файлы которые я создал:
- `package.json`
- `upload_orders.js`
- `sync_to_supabase.js`
- `telegram_bot.js`
- `supabase_schema.sql`
- `mock_orders.json` (из репо задания)

---

## 3. Создай файл .env

```bash
cp .env.example .env
nano .env
```

Заполни реальными значениями и сохрани (Ctrl+O, Ctrl+X).

---

## 4. Установи зависимости

```bash
npm install
```

---

## 5. Создай таблицу в Supabase

1. Зайди в Supabase → SQL Editor
2. Скопируй содержимое `supabase_schema.sql`
3. Нажми "Run"

---

## 6. Загрузи заказы в RetailCRM (Шаг 2 задания)

```bash
node upload_orders.js
```

Должно показать 50 строк с ✅. Проверь в интерфейсе RetailCRM что заказы появились.

---

## 7. Синхронизируй в Supabase (Шаг 3 задания)

```bash
node sync_to_supabase.js
```

Проверь в Supabase → Table Editor → orders.

---

## 8. Создай дашборд (Шаг 4 задания)

```bash
npx create-next-app@latest dashboard --yes --app --src-dir=false
cd dashboard
npm install @supabase/supabase-js recharts
```

Замени главную страницу:
```bash
cp ../dashboard-page.jsx app/page.jsx
```

Создай .env.local:
```bash
cp ../dashboard-env-local.example .env.local
nano .env.local   # заполни своими ключами Supabase
```

Проверь локально:
```bash
npm run dev
# Открой http://localhost:3000
```

---

## 9. Деплой на Vercel (Шаг 4 задания)

```bash
# Установи Vercel CLI
npm i -g vercel

# Залей на GitHub сначала
cd ~/gbc-dashboard
git init
git add .
git commit -m "initial commit"
# Создай репо на github.com, потом:
git remote add origin https://github.com/ТВОЙ_ЮЗЕР/gbc-dashboard.git
git branch -M main
git push -u origin main
```

Далее:
1. Зайди на https://vercel.com
2. Import Git Repository → выбери gbc-dashboard
3. Root Directory → `dashboard`
4. Environment Variables → добавь `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

Получишь ссылку вида `https://gbc-dashboard-xxx.vercel.app`

---

## 10. Telegram-бот (Шаг 5 задания)

```bash
cd ~/gbc-dashboard
node telegram_bot.js
```

Бот при первом запуске:
- Пришлёт тестовое сообщение "Бот запущен"
- Проверит ВСЕ заказы и пришлёт уведомления о тех что > 50 000 ₸

**Сделай скриншот уведомлений в Telegram!**

---

## 11. Сдача

Отправь @DmitriyKrasnikov:
- ✅ Ссылку на Vercel-дашборд
- ✅ Ссылку на GitHub-репо
- ✅ Скриншот Telegram-уведомления
- ✅ В README опиши промпты которые давал Claude
