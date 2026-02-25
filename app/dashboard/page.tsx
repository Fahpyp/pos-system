"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import {
  Banknote,
  Receipt,
  Package,
  AlertTriangle,
  ShoppingCart,
  Boxes,
  Tag,
  BarChart3,
} from "lucide-react";

interface Summary {
  totalSales: { count: number; revenue: number };
  totalProducts: { count: number };
  lowStock: { count: number };
  todaySales: { revenue: number };
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color }}>
            {value}
          </p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>

        <div className="p-2 rounded-xl bg-teal-50">
          <Icon size={22} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [daily, setDaily] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000)
    .toISOString()
    .split("T")[0];

  useEffect(() => {
    async function load() {
      try {
        const [s, d, tp] = await Promise.all([
          fetch(
            `/api/reports?type=summary&dateFrom=${weekAgo}&dateTo=${today}`
          ).then((r) => r.json()),
          fetch(
            `/api/reports?type=daily&dateFrom=${weekAgo}&dateTo=${today}`
          ).then((r) => r.json()),
          fetch(
            `/api/reports?type=top_products&dateFrom=${weekAgo}&dateTo=${today}`
          ).then((r) => r.json()),
        ]);
        setSummary(s);
        setDaily(d);
        setTopProducts(tp);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-teal-600 flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm font-medium">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">แดชบอร์ด</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            ภาพรวมธุรกิจ 7 วันล่าสุด
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">วันนี้</p>
          <p className="text-sm font-semibold text-teal-700">
            {new Date().toLocaleDateString("th-TH", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Banknote}
          label="ยอดขายวันนี้"
          value={`฿${(summary?.todaySales?.revenue || 0).toLocaleString(
            "th-TH",
            { minimumFractionDigits: 2 }
          )}`}
          color="#0d9488"
        />

        <StatCard
          icon={Receipt}
          label="รายการขาย (7 วัน)"
          value={(summary?.totalSales?.count || 0).toLocaleString()}
          sub={`รวม ฿${(summary?.totalSales?.revenue || 0).toLocaleString(
            "th-TH",
            { minimumFractionDigits: 0 }
          )}`}
          color="#0891b2"
        />

        <StatCard
          icon={Package}
          label="สินค้าทั้งหมด"
          value={(summary?.totalProducts?.count || 0).toLocaleString()}
          color="#0f766e"
        />

        <StatCard
          icon={AlertTriangle}
          label="สต็อกต่ำ"
          value={(summary?.lowStock?.count || 0).toLocaleString()}
          sub="สินค้าต่ำกว่า 10 ชิ้น"
          color={summary?.lowStock?.count ? "#ef4444" : "#22c55e"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100">
          <h3 className="font-semibold text-gray-700 mb-4">
            ยอดขาย 7 วันล่าสุด
          </h3>
          {daily.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                    })
                  }
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: any) => [
                    `฿${Number(v).toLocaleString()}`,
                    "ยอดขาย",
                  ]}
                  labelFormatter={(l) =>
                    new Date(l).toLocaleDateString("th-TH")
                  }
                />
                <Bar dataKey="revenue" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              ไม่มีข้อมูล
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100">
          <h3 className="font-semibold text-gray-700 mb-4">
            สินค้าขายดี (7 วัน)
          </h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background:
                        i === 0
                          ? "#fbbf24"
                          : i === 1
                          ? "#9ca3af"
                          : i === 2
                          ? "#cd7c2c"
                          : "#e5e7eb",
                      color: i < 3 ? "white" : "#6b7280",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                        <div
                          className="h-1.5 bg-teal-400 rounded-full"
                          style={{
                            width: `${
                              (p.totalRevenue / topProducts[0].totalRevenue) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {p.totalQty} ชิ้น
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-teal-700 flex-shrink-0">
                    ฿
                    {Number(p.totalRevenue).toLocaleString("th-TH", {
                      minimumFractionDigits: 0,
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              ไม่มีข้อมูล
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100">
        <h3 className="font-semibold text-gray-700 mb-4">เมนูด่วน</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              href: "/pos",
              icon: ShoppingCart,
              label: "เปิดขาย",
              bg: "from-teal-500 to-teal-600",
            },
            {
              href: "/inventory",
              icon: Boxes,
              label: "เติมสต็อก",
              bg: "from-cyan-500 to-cyan-600",
            },
            {
              href: "/products",
              icon: Tag,
              label: "เพิ่มสินค้า",
              bg: "from-emerald-500 to-emerald-600",
            },
            {
              href: "/reports",
              icon: BarChart3,
              label: "ดูรายงาน",
              bg: "from-blue-500 to-blue-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.href}
                href={item.href}
                className={`group flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br ${item.bg} text-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
              >
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Icon size={24} />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
