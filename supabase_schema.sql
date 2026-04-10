-- Выполни этот запрос в Supabase → SQL Editor

CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  external_id TEXT UNIQUE,
  crm_id INTEGER,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  status TEXT,
  city TEXT,
  address TEXT,
  total_sum NUMERIC DEFAULT 0,
  items JSONB,
  utm_source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Включаем Row Level Security но разрешаем чтение всем (для дашборда)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Allow service insert/update" ON orders
  FOR ALL USING (true) WITH CHECK (true);
