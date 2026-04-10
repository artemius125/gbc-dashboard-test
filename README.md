# GBC Dashboard — Тестовое задание AI Tools Specialist

Мини-дашборд заказов: RetailCRM → Supabase → Vercel.

## Стек

- **RetailCRM** — источник заказов
- **Supabase** — база данных (PostgreSQL)
- **Next.js + Recharts** — дашборд
- **Vercel** — деплой
- **Telegram Bot** — уведомления о крупных заказах (>50 000 ₸)

## Структура

```
gbc-dashboard/
├── upload_orders.js      # Загрузка mock-заказов в RetailCRM
├── sync_to_supabase.js   # Синхронизация CRM → Supabase
├── telegram_bot.js       # Бот с мониторингом заказов
├── supabase_schema.sql   # SQL схема таблицы orders
├── mock_orders.json      # 50 тестовых заказов
└── dashboard/            # Next.js приложение
    └── app/page.jsx      # Дашборд с графиками
```

## Запуск

1. Скопируй `.env.example` в `.env` и заполни ключами
2. `npm install`
3. Создай таблицу в Supabase (SQL Editor → `supabase_schema.sql`)
4. `node upload_orders.js` — загрузить заказы в CRM
5. `node sync_to_supabase.js` — синхронизировать в Supabase
6. `node telegram_bot.js` — запустить бот

## Дашборд (локально)

```bash
cd dashboard
cp .env.local.example .env.local  # заполни ключи Supabase
npm install
npm run dev
```

## Решения

- При загрузке заказов через `upload_orders.js` пришлось исправить маппинг `orderType` — демо-аккаунт RetailCRM поддерживает только тип `main`, тогда как в mock-данных был указан `eshop-individual`.
- Supabase RLS (Row Level Security) по умолчанию блокировал чтение из дашборда — решилось добавлением policy `Allow public read`.
- Vercel не определил Framework Preset автоматически при Root Directory = `dashboard` — потребовалось вручную выставить Next.js.

## Дашборд

[https://project-xz6ye.vercel.app](https://project-xz6ye.vercel.app)
