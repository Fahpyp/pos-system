'use client'
import { useState, useEffect } from 'react'

interface Product {
  id: number; barcode: string; name: string; description: string
  price: number; cost: number; stock: number; category: string
}

const EMPTY: Omit<Product, 'id'> = { barcode: '', name: '', description: '', price: 0, cost: 0, stock: 0, category: '' }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<Omit<Product, 'id'>>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { loadProducts() }, [search])

  async function loadProducts() {
    const res = await fetch(`/api/products?search=${search}`)
    setProducts(await res.json())
  }

  function openCreate() { setEditing(null); setForm(EMPTY); setShowModal(true) }
  function openEdit(p: Product) { setEditing(p); setForm({ barcode: p.barcode, name: p.name, description: p.description, price: p.price, cost: p.cost, stock: p.stock, category: p.category }); setShowModal(true) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editing ? `/api/products/${editing.id}` : '/api/products'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showMsg(`✅ ${editing ? 'แก้ไข' : 'เพิ่ม'}สินค้าสำเร็จ`)
      setShowModal(false)
      loadProducts()
    } catch (e: any) { showMsg(`❌ ${e.message}`) }
    finally { setLoading(false) }
  }

  async function handleDelete(p: Product) {
    if (!confirm(`ต้องการลบ "${p.name}" ?`)) return
    const res = await fetch(`/api/products/${p.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { showMsg(`❌ ${data.error}`); return }
    showMsg('✅ ลบสินค้าสำเร็จ')
    loadProducts()
  }

  function showMsg(m: string) { setMsg(m); setTimeout(() => setMsg(''), 4000) }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการสินค้า</h1>
          <p className="text-gray-500 text-sm mt-0.5">สินค้าทั้งหมด {products.length} รายการ</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold pos-gradient hover:opacity-90 shadow-md">
          + เพิ่มสินค้า
        </button>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg}
        </div>
      )}

      {/* Search */}
      <input type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="🔍 ค้นหาสินค้า..."
        className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm" />

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">บาร์โค้ด</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ชื่อสินค้า</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">หมวดหมู่</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">ต้นทุน</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">ราคาขาย</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">กำไร%</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">สต็อก</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => {
                const margin = p.price > 0 ? ((p.price - p.cost) / p.price * 100).toFixed(1) : '0'
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{p.barcode || '-'}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{p.name}</p>
                      {p.description && <p className="text-xs text-gray-400 truncate max-w-xs">{p.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{p.category || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">฿{p.cost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-teal-700">฿{p.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-medium ${Number(margin) >= 20 ? 'text-green-600' : 'text-orange-500'}`}>
                        {margin}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${p.stock <= 0 ? 'text-red-500' : p.stock <= 10 ? 'text-amber-500' : 'text-gray-700'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(p)}
                          className="text-teal-600 hover:text-teal-800 p-1.5 hover:bg-teal-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(p)}
                          className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {products.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">ไม่พบสินค้า</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
              <h3 className="font-bold text-gray-800">{editing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อสินค้า *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="ชื่อสินค้า" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">บาร์โค้ด</label>
                  <input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 font-mono"
                    placeholder="8850000000000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">หมวดหมู่</label>
                  <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="เช่น เครื่องดื่ม" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ต้นทุน (฿)</label>
                  <input type="number" step="0.01" min="0" value={form.cost}
                    onChange={e => setForm(f => ({ ...f, cost: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ราคาขาย (฿) *</label>
                  <input type="number" step="0.01" min="0" required value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                </div>
                {!editing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">สต็อกเริ่มต้น</label>
                    <input type="number" min="0" value={form.stock}
                      onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">รายละเอียด</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                    placeholder="รายละเอียดสินค้า (ถ้ามี)" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                  ยกเลิก
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold pos-gradient hover:opacity-90 disabled:opacity-60">
                  {loading ? 'กำลังบันทึก...' : editing ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
