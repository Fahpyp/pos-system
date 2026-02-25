'use client'
import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [users, setUsers] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'STAFF' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    const res = await fetch('/api/auth/register')
    if (res.ok) setUsers(await res.json())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg('✅ เพิ่มผู้ใช้สำเร็จ')
      setShowModal(false)
      setForm({ username: '', email: '', password: '', role: 'STAFF' })
      loadUsers()
    } catch (e: any) { setMsg(`❌ ${e.message}`) }
    finally { setLoading(false); setTimeout(() => setMsg(''), 4000) }
  }

  const roleLabel: any = { ADMIN: '👑 Admin', MANAGER: '🔧 Manager', STAFF: '👤 Staff' }
  const roleColor: any = { ADMIN: 'bg-red-100 text-red-700', MANAGER: 'bg-purple-100 text-purple-700', STAFF: 'bg-gray-100 text-gray-600' }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">ตั้งค่า</h1>
        <p className="text-gray-500 text-sm mt-0.5">จัดการผู้ใช้งานและการตั้งค่าระบบ</p>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg}
        </div>
      )}

      {/* Users section */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-700">ผู้ใช้งาน</h3>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-semibold pos-gradient hover:opacity-90">
            + เพิ่มผู้ใช้
          </button>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">ชื่อผู้ใช้</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">อีเมล</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">บทบาท</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">สร้างเมื่อ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{u.username}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColor[u.role]}`}>
                    {roleLabel[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(u.createdAt).toLocaleDateString('th-TH')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-5">
        <h3 className="font-semibold text-gray-700 mb-4">ข้อมูลระบบ</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['ระบบ', 'POS System v1.0'],
            ['Framework', 'Next.js 14'],
            ['Database', 'MySQL 8.0+'],
            ['Authentication', 'JWT (jose)'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">{k}</span>
              <span className="font-medium text-gray-700">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-bold text-gray-800">เพิ่มผู้ใช้ใหม่</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อผู้ใช้</label>
                <input required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล</label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">รหัสผ่าน</label>
                <input type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">บทบาท</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                  <option value="STAFF">Staff</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600">ยกเลิก</button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold pos-gradient disabled:opacity-60">
                  {loading ? 'กำลังบันทึก...' : 'เพิ่มผู้ใช้'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
