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

## Промпты, которые давал Claude Code

Проект создавался с помощью Claude Code CLI. Ключевые промпты:

1. **"Помоги мне выполнить тестовое задание. Описание лежит в папке test, есть почти готовый проект, нужно лишь связать все."** — Claude изучил все файлы, понял архитектуру и выстроил план.

2. Claude создал Next.js дашборд (`dashboard/app/page.jsx`) с:
   - 4 карточками метрик (всего заказов, сумма, средний чек, крупные заказы)
   - Bar chart — заказы по дням
   - Line chart — выручка по дням
   - Horizontal bar chart — заказы по статусу
   - Таблица последних 20 заказов

3. Claude настроил `.env.example`, структуру деплоя на Vercel, `.gitignore`.

## Дашборд

[https://project-xz6ye.vercel.app](https://project-xz6ye.vercel.app)
