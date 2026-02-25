"use client";
import { useState, useEffect } from "react";
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
  BarChart3,
  Trophy,
  ClipboardList,
  Calendar,
  Receipt,
  Target,
  Wallet,
  TrendingUp,
  Loader2,
} from "lucide-react";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReportsPage() {
  const [tab, setTab] = useState<"sales" | "products" | "logs">("sales");
  const [dateFrom, setDateFrom] = useState(
    () => new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [daily, setDaily] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [dateFrom, dateTo, tab]);

  async function loadData() {
    setLoading(true);
    try {
      if (tab === "sales") {
        const [d, s] = await Promise.all([
          fetch(
            `/api/reports?type=daily&dateFrom=${dateFrom}&dateTo=${dateTo}`
          ).then((r) => r.json()),
          fetch(
            `/api/sales?dateFrom=${dateFrom}&dateTo=${dateTo}&limit=100`
          ).then((r) => r.json()),
        ]);
        setDaily(d);
        setSales(s);
      } else if (tab === "products") {
        const tp = await fetch(
          `/api/reports?type=top_products&dateFrom=${dateFrom}&dateTo=${dateTo}`
        ).then((r) => r.json());
        setTopProducts(tp);
      } else if (tab === "logs") {
        const l = await fetch("/api/reports?type=logs").then((r) => r.json());
        setLogs(l);
      }
    } finally {
      setLoading(false);
    }
  }

  const totalRevenue = daily.reduce((s, d) => s + Number(d.revenue || 0), 0);
  const totalTx = daily.reduce((s, d) => s + Number(d.transactions || 0), 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">รายงาน</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          วิเคราะห์ข้อมูลการขายและกิจกรรม
        </p>
      </div>

      {/* Date range */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">จาก</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">ถึง</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
        {[
          {
            label: "วันนี้",
            from: new Date().toISOString().split("T")[0],
            to: new Date().toISOString().split("T")[0],
          },
          {
            label: "7 วัน",
            from: new Date(Date.now() - 7 * 86400000)
              .toISOString()
              .split("T")[0],
            to: new Date().toISOString().split("T")[0],
          },
          {
            label: "30 วัน",
            from: new Date(Date.now() - 30 * 86400000)
              .toISOString()
              .split("T")[0],
            to: new Date().toISOString().split("T")[0],
          },
        ].map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setDateFrom(p.from);
              setDateTo(p.to);
            }}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: "sales", label: "ยอดขาย", icon: BarChart3 },
          { key: "products", label: "สินค้าขายดี", icon: Trophy },
          { key: "logs", label: "ล็อก", icon: ClipboardList },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon
                size={16}
                className={`transition-colors ${
                  isActive ? "text-teal-600" : "text-gray-400"
                }`}
              />
              {item.label}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-teal-600 text-sm py-4">
          <Loader2 className="animate-spin" size={18} />
          กำลังโหลด...
        </div>
      )}

      {/* Sales Tab */}
      {tab === "sales" && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "ยอดขายรวม",
                value: `฿${totalRevenue.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                })}`,
                icon: Wallet,
                color: "#0d9488",
              },
              {
                label: "รายการทั้งหมด",
                value: totalTx.toLocaleString(),
                icon: Receipt,
                color: "#0891b2",
              },
              {
                label: "เฉลี่ยต่อวัน",
                value: `฿${(daily.length
                  ? totalRevenue / daily.length
                  : 0
                ).toLocaleString("th-TH", { minimumFractionDigits: 0 })}`,
                icon: Calendar,
                color: "#0f766e",
              },
              {
                label: "เฉลี่ยต่อบิล",
                value: `฿${(totalTx
                  ? totalRevenue / totalTx
                  : 0
                ).toLocaleString("th-TH", { minimumFractionDigits: 0 })}`,
                icon: Target,
                color: "#7c3aed",
              },
            ].map((s, i) => {
              const Icon = s.icon;

              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        {s.label}
                      </p>
                      <p
                        className="text-xl font-bold mt-1"
                        style={{ color: s.color }}
                      >
                        {s.value}
                      </p>
                    </div>

                    <div
                      className="p-2 rounded-xl"
                      style={{ backgroundColor: `${s.color}15` }}
                    >
                      <Icon size={20} style={{ color: s.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100">
            <h3 className="font-semibold text-gray-700 mb-4">ยอดขายรายวัน</h3>
            {daily.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
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
                  <Bar
                    dataKey="revenue"
                    fill="#14b8a6"
                    radius={[6, 6, 0, 0]}
                    name="ยอดขาย"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">
                ไม่มีข้อมูล
              </div>
            )}
          </div>

          {/* Sales list */}
          <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-700">รายการขาย</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                      เลขที่
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                      ยอดรวม
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">
                      ชำระ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                      พนักงาน
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                      วันที่
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-xs font-mono text-teal-600">
                        {s.invoiceNo}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">
                        ฿
                        {Number(s.total).toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            s.payment === "CASH"
                              ? "bg-green-100 text-green-700"
                              : s.payment === "TRANSFER"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {s.payment === "CASH"
                            ? "เงินสด"
                            : s.payment === "TRANSFER"
                            ? "โอน"
                            : "บัตร"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {s.username}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {formatDate(s.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        ไม่มีข้อมูล
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Top Products Tab */}
      {tab === "products" && !loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-700">สินค้าขายดี</h3>
          </div>
          {topProducts.length > 0 ? (
            <>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topProducts.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      width={120}
                    />
                    <Tooltip
                      formatter={(v: any) => [
                        `฿${Number(v).toLocaleString()}`,
                        "ยอดขาย",
                      ]}
                    />
                    <Bar
                      dataKey="totalRevenue"
                      fill="#06b6d4"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                        สินค้า
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">
                        จำนวนขาย
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                        ยอดขาย
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {topProducts.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs font-bold ${
                              i === 0
                                ? "bg-yellow-400 text-white"
                                : i === 1
                                ? "bg-gray-300 text-white"
                                : i === 2
                                ? "bg-orange-400 text-white"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-800">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-400">{p.category}</p>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">
                          {p.totalQty} ชิ้น
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-teal-700">
                          ฿
                          {Number(p.totalRevenue).toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-gray-400">ไม่มีข้อมูล</div>
          )}
        </div>
      )}

      {/* Logs Tab */}
      {tab === "logs" && !loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-700">
              ล็อกกิจกรรม (100 รายการล่าสุด)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    ผู้ใช้
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    กิจกรรม
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    รายละเอียด
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    วันที่
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-teal-700">
                      {log.username || "ระบบ"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          log.action.includes("LOGIN")
                            ? "bg-blue-100 text-blue-700"
                            : log.action.includes("SALE")
                            ? "bg-green-100 text-green-700"
                            : log.action.includes("DELETE")
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {log.details || "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
