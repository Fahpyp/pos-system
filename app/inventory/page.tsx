'use client'
import { useState, useEffect } from 'react'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [movements, setMovements] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ productId: '', type: 'IN', quantity: 1, note: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [p, m] = await Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/inventory?limit=50').then(r => r.json()),
    ])
    setProducts(p)
    setMovements(m)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg(`✅ อัพเดทสต็อกสำเร็จ (คงเหลือ: ${data.newStock})`)
      setForm({ productId: '', type: 'IN', quantity: 1, note: '' })
      setShowModal(false)
      loadData()
    } catch (e: any) {
      setMsg(`❌ ${e.message}`)
    } finally {
      setLoading(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  const lowStock = products.filter(p => p.stock <= 10)

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">คลังสินค้า</h1>
          <p className="text-gray-500 text-sm mt-0.5">จัดการสต็อกและการเคลื่อนไหวสินค้า</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold pos-gradient hover:opacity-90 transition-opacity shadow-md">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          เพิ่ม/ถอนสต็อก
        </button>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg}
        </div>
      )}

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⚠️</span>
            <h3 className="font-semibold text-amber-800">สินค้าสต็อกต่ำ ({lowStock.length} รายการ)</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-200">
                <span className="text-sm font-medium text-gray-700">{p.name}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                  {p.stock === 0 ? 'หมดสต็อก' : `เหลือ ${p.stock}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Stock Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">สินค้าทั้งหมด ({products.length} รายการ)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">สินค้า</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">หมวดหมู่</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">ต้นทุน</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">ราคาขาย</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">สต็อก</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{p.name}</p>
                    {p.barcode && <p className="text-xs text-gray-400 font-mono">{p.barcode}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{p.category || '-'}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">฿{p.cost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-teal-700">฿{p.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-bold ${p.stock === 0 ? 'text-red-500' : p.stock <= 10 ? 'text-amber-500' : 'text-gray-800'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.stock === 0 ? 'bg-red-100 text-red-600' : p.stock <= 10 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {p.stock === 0 ? 'หมดสต็อก' : p.stock <= 10 ? 'ต่ำ' : 'ปกติ'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement History */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">ประวัติการเคลื่อนไหวสต็อก</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">สินค้า</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">ประเภท</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">จำนวน</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">หมายเหตุ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ผู้ดำเนินการ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">วันที่</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {movements.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-sm text-gray-700">{m.productName}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      m.type === 'IN' ? 'bg-green-100 text-green-700' :
                      m.type === 'OUT' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {m.type === 'IN' ? '📥 รับเข้า' : m.type === 'OUT' ? '📤 จ่ายออก' : '🛒 ขาย'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-bold ${m.type === 'IN' ? 'text-green-600' : 'text-red-500'}`}>
                      {m.type === 'IN' ? '+' : '-'}{m.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{m.note || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{m.username}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(m.createdAt)}</td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">ไม่มีประวัติการเคลื่อนไหว</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-bold text-gray-800">เพิ่ม/ถอนสต็อก</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">สินค้า</label>
                <select value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))} required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                  <option value="">-- เลือกสินค้า --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (คงเหลือ: {p.stock})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภท</label>
                <div className="grid grid-cols-2 gap-2">
                  {['IN', 'OUT'].map(t => (
                    <button key={t} type="button"
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${form.type === t ? (t === 'IN' ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'bg-gray-100 text-gray-600'}`}>
                      {t === 'IN' ? '📥 รับเข้า' : '📤 จ่ายออก'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">จำนวน</label>
                <input type="number" min="1" value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">หมายเหตุ</label>
                <input type="text" value={form.note} placeholder="เช่น รับสินค้าใหม่, ของหาย..."
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                  ยกเลิก
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold pos-gradient hover:opacity-90 disabled:opacity-60">
                  {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
