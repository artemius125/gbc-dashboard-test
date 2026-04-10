'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function formatMoney(n) {
  return new Intl.NumberFormat('ru-KZ', { maximumFractionDigits: 0 }).format(n) + ' ₸';
}

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error(error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Группировка по дате
  const byDate = {};
  for (const o of orders) {
    const date = o.created_at?.slice(0, 10) || 'unknown';
    if (!byDate[date]) byDate[date] = { date, count: 0, sum: 0 };
    byDate[date].count += 1;
    byDate[date].sum += Number(o.total_sum) || 0;
  }
  const chartData = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));

  // Группировка по статусу
  const byStatus = {};
  for (const o of orders) {
    const s = o.status || 'unknown';
    byStatus[s] = (byStatus[s] || 0) + 1;
  }
  const statusData = Object.entries(byStatus)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  const totalSum = orders.reduce((s, o) => s + (Number(o.total_sum) || 0), 0);
  const avgSum = orders.length ? totalSum / orders.length : 0;
  const bigOrders = orders.filter((o) => Number(o.total_sum) > 50000).length;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#94a3b8', fontSize: 18 }}>
        Загрузка данных...
      </div>
    );
  }

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#f8fafc' }}>
        📦 Dashboard заказов
      </h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>RetailCRM → Supabase</p>

      {/* Карточки */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'Всего заказов', value: orders.length, icon: '🛒' },
          { label: 'Общая сумма', value: formatMoney(totalSum), icon: '💰' },
          { label: 'Средний чек', value: formatMoney(avgSum), icon: '📊' },
          { label: 'Крупных (>50к₸)', value: bigOrders, icon: '🔔' },
        ].map((card) => (
          <div key={card.label} style={{ background: '#1e293b', borderRadius: 12, padding: '20px 24px', border: '1px solid #334155' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc' }}>{card.value}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* График заказов по дням */}
      <div style={{ background: '#1e293b', borderRadius: 12, padding: '24px', marginBottom: 24, border: '1px solid #334155' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#f8fafc' }}>
          Заказы по дням
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#f8fafc' }}
              itemStyle={{ color: '#38bdf8' }}
            />
            <Bar dataKey="count" name="Заказов" fill="#38bdf8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Выручка по дням */}
      <div style={{ background: '#1e293b', borderRadius: 12, padding: '24px', marginBottom: 24, border: '1px solid #334155' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#f8fafc' }}>
          Выручка по дням (₸)
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#f8fafc' }}
              itemStyle={{ color: '#a78bfa' }}
              formatter={(v) => [formatMoney(v), 'Сумма']}
            />
            <Line type="monotone" dataKey="sum" name="Сумма" stroke="#a78bfa" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Заказы по статусу */}
      <div style={{ background: '#1e293b', borderRadius: 12, padding: '24px', marginBottom: 24, border: '1px solid #334155' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#f8fafc' }}>
          По статусу
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={statusData} layout="vertical" margin={{ top: 4, right: 16, left: 80, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="status" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} width={80} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#f8fafc' }}
              itemStyle={{ color: '#34d399' }}
            />
            <Bar dataKey="count" name="Заказов" fill="#34d399" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Таблица последних заказов */}
      <div style={{ background: '#1e293b', borderRadius: 12, padding: '24px', border: '1px solid #334155' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#f8fafc' }}>
          Последние заказы
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['ID', 'Клиент', 'Сумма', 'Статус', 'Город', 'Дата'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...orders].reverse().slice(0, 20).map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '10px 12px', color: '#64748b' }}>#{o.crm_id || o.id}</td>
                  <td style={{ padding: '10px 12px' }}>{o.first_name} {o.last_name}</td>
                  <td style={{ padding: '10px 12px', color: Number(o.total_sum) > 50000 ? '#fbbf24' : '#e2e8f0', fontWeight: Number(o.total_sum) > 50000 ? 600 : 400 }}>
                    {formatMoney(Number(o.total_sum))}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: '#0f172a', padding: '2px 8px', borderRadius: 20, fontSize: 12, color: '#94a3b8' }}>{o.status}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{o.city || '—'}</td>
                  <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 12 }}>{o.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ textAlign: 'center', color: '#334155', marginTop: 32, fontSize: 13 }}>
        Обновлено: {new Date().toLocaleString('ru')}
      </p>
    </div>
  );
}
