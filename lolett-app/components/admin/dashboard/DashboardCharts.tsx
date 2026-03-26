'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { DailyRevenue, StatusCount } from './getDashboardStats';
import { formatPrice } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  pending: '#B89547',
  paid: '#1B0B94',
  shipped: '#6366f1',
  delivered: '#22c55e',
  cancelled: '#ef4444',
  refunded: '#a3a3a3',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

function formatDay(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
}

interface Props {
  ordersByDay: DailyRevenue[];
  ordersByStatus: StatusCount[];
}

export function DashboardCharts({ ordersByDay, ordersByStatus }: Props) {
  const statusData = ordersByStatus
    .map((s) => ({
      ...s,
      label: STATUS_LABELS[s.status] || s.status,
      fill: STATUS_COLORS[s.status] || '#B89547',
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Revenue chart */}
      <div className="bg-white border border-gray-200/50 shadow-none rounded-xl p-6">
        <h3 className="font-[family-name:var(--font-newsreader)] text-lg text-[#1a1510] mb-1">
          Revenus — 7 derniers jours
        </h3>
        <p className="font-[family-name:var(--font-montserrat)] text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40 mb-6">
          Chiffre d&apos;affaires quotidien
        </p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ordersByDay} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B89547" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#B89547" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="none" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDay}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#1a151066', fontFamily: 'var(--font-montserrat)' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#1a151066', fontFamily: 'var(--font-montserrat)' }}
                tickFormatter={(v: number) => `${v}€`}
              />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e5e7eb80',
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: 'var(--font-montserrat)',
                }}
                formatter={(value: number | undefined) => [formatPrice(value ?? 0), 'Revenu']}
                labelFormatter={(label: unknown) => formatDay(String(label))}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#B89547"
                strokeWidth={2}
                fill="url(#goldGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status distribution */}
      <div className="bg-white border border-gray-200/50 shadow-none rounded-xl p-6">
        <h3 className="font-[family-name:var(--font-newsreader)] text-lg text-[#1a1510] mb-1">
          Commandes par statut
        </h3>
        <p className="font-[family-name:var(--font-montserrat)] text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40 mb-6">
          Distribution actuelle
        </p>
        <div className="h-56">
          {statusData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-[#1a1510]/30">
              Aucune commande
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="none" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#1a151066', fontFamily: 'var(--font-montserrat)' }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  width={90}
                  tick={{ fontSize: 11, fill: '#1a1510aa', fontFamily: 'var(--font-montserrat)' }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e5e7eb80',
                    borderRadius: 10,
                    fontSize: 12,
                    fontFamily: 'var(--font-montserrat)',
                  }}
                  formatter={(value: number | undefined) => [value ?? 0, 'Commandes']}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
