'use client'
import { useState, useEffect, useRef } from 'react'
import { 
  Check, 
  Printer, 
  Search, 
  Tag, 
  ShoppingCart, 
  X, 
  Minus, 
  Plus, 
  CreditCard, 
  Landmark, 
  Wallet, 
  Trash2, 
  Receipt, 
  Package,
  ChevronRight,
  Percent,
  DollarSign,
  Banknote,
  ShoppingBag,
  Barcode
} from 'lucide-react'

interface Product {
  id: number
  barcode: string
  name: string
  price: number
  stock: number
  category: string
}

interface CartItem extends Product {
  quantity: number
  subtotal: number
}

function formatCurrency(n: number) {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [payment, setPayment] = useState<'CASH' | 'TRANSFER' | 'CARD'>('CASH')
  const [discount, setDiscount] = useState(0)
  const [received, setReceived] = useState(0)
  const [loading, setLoading] = useState(false)
  const [receipt, setReceipt] = useState<any>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadProducts()
    searchRef.current?.focus()
  }, [search, category])

  async function loadProducts() {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    const res = await fetch(`/api/products?${params}`)
    const data = await res.json()
    setProducts(data)
    if (!categories.length) {
      const cats = Array.from(
        new Set(data.map((p: Product) => p.category).filter(Boolean))
      ) as string[]
      setCategories(cats)
    }
  }

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev
        return prev.map(i => i.id === product.id
          ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price }
          : i)
      }
      if (product.stock <= 0) return prev
      return [...prev, { ...product, quantity: 1, subtotal: product.price }]
    })
  }

  function updateQty(id: number, qty: number) {
    if (qty <= 0) { removeFromCart(id); return }
    setCart(prev => prev.map(i => i.id === id
      ? { ...i, quantity: qty, subtotal: qty * i.price }
      : i))
  }

  function removeFromCart(id: number) {
    setCart(prev => prev.filter(i => i.id !== id))
  }

  const subtotal = cart.reduce((s, i) => s + i.subtotal, 0)
  const total = subtotal - discount
  const change = received - total

  async function handleCheckout() {
    if (!cart.length) return
    setLoading(true)
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price })),
          payment, discount, tax: 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setReceipt({ ...data, items: cart, payment, discount, total, received, change })
      setCart([])
      setDiscount(0)
      setReceived(0)
      loadProducts()
    } catch (e: any) {
      alert(e.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  async function handleBarcodeSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && search) {
      const res = await fetch(`/api/products?barcode=${search}`)
      const data = await res.json()
      if (data.length === 1) {
        addToCart(data[0])
        setSearch('')
      }
    }
  }

  if (receipt) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm border border-teal-100 receipt">
          <div className="text-center border-b pb-4 mb-4">
            <div className="w-12 h-12 rounded-xl pos-gradient flex items-center justify-center mx-auto mb-2">
              <Check className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">ชำระเงินสำเร็จ</h2>
            <p className="text-xs text-gray-500 mt-1">เลขที่: {receipt.invoiceNo}</p>
            <p className="text-xs text-gray-400">{new Date().toLocaleString('th-TH')}</p>
          </div>
          
          <div className="space-y-1.5 mb-4">
            {receipt.items.map((item: CartItem) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600 flex-1">{item.name} × {item.quantity}</span>
                <span className="text-gray-800 font-medium">฿{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-3 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>ราคารวม</span><span>฿{formatCurrency(receipt.total + receipt.discount)}</span>
            </div>
            {receipt.discount > 0 && (
              <div className="flex justify-between text-sm text-red-500">
                <span>ส่วนลด</span><span>-฿{formatCurrency(receipt.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-teal-700 pt-1 border-t">
              <span>ยอดสุทธิ</span><span>฿{formatCurrency(receipt.total)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>รับเงิน ({receipt.payment})</span><span>฿{formatCurrency(receipt.received || receipt.total)}</span>
            </div>
            {receipt.change > 0 && (
              <div className="flex justify-between text-sm font-semibold text-emerald-600">
                <span>เงินทอน</span><span>฿{formatCurrency(receipt.change)}</span>
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button onClick={() => window.print()}
              className="py-2.5 px-4 rounded-xl border-2 border-teal-200 text-teal-700 text-sm font-medium hover:bg-teal-50 transition-colors flex items-center justify-center gap-2">
              <Printer className="w-4 h-4" />
              พิมพ์
            </button>
            <button onClick={() => setReceipt(null)}
              className="py-2.5 px-4 rounded-xl text-sm font-medium text-white transition-colors pos-gradient flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              ขายต่อ
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: Products */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-100">
        {/* Search */}
        <div className="p-4 bg-white border-b border-gray-100">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleBarcodeSearch}
                placeholder="ค้นหาสินค้า หรือ สแกนบาร์โค้ด..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
              />
              <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          {/* Categories */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            <button
              onClick={() => setCategory('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors flex items-center gap-1 ${!category ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-teal-50'}`}>
              <Package className="w-3.5 h-3.5" />
              ทั้งหมด
            </button>
            {categories.map(cat => (
              <button key={cat}
                onClick={() => setCategory(cat === category ? '' : cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${category === cat ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-teal-50'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {products.map(product => (
              <button key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className={`bg-white rounded-xl p-3 text-left shadow-sm border transition-all duration-200 ${
                  product.stock <= 0
                    ? 'opacity-50 cursor-not-allowed border-gray-100'
                    : 'border-teal-100 hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5'
                }`}>
                <div className="w-full aspect-square rounded-lg mb-2 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #f0fdfa, #cffafe)' }}>
                  <Tag className="w-8 h-8 text-teal-600" />
                </div>
                <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">{product.name}</p>
                <p className="text-teal-600 font-bold text-sm mt-1">฿{formatCurrency(product.price)}</p>
                <p className={`text-xs mt-0.5 flex items-center gap-0.5 ${product.stock <= 5 ? 'text-red-500' : 'text-gray-400'}`}>
                  <Package className="w-3 h-3" />
                  คงเหลือ: {product.stock}
                </p>
              </button>
            ))}
          </div>
          {products.length === 0 && (
            <div className="text-center text-gray-400 mt-16">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">ไม่พบสินค้า</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-80 xl:w-96 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            ตะกร้าสินค้า
            {cart.length > 0 && (
              <span className="ml-auto text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">
                {cart.length} รายการ
              </span>
            )}
          </h2>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-16">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">ยังไม่มีสินค้าในตะกร้า</p>
              <p className="text-xs mt-1">คลิกสินค้าเพื่อเพิ่ม</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-slate-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-700 leading-tight flex-1">{item.name}</p>
                  <button onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-600 flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200 flex items-center justify-center text-sm font-bold transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200 flex items-center justify-center text-sm font-bold transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-teal-700">฿{formatCurrency(item.subtotal)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 p-4 space-y-3">
            {/* Payment method */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">วิธีชำระเงิน</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setPayment('CASH')}
                  className={`py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${payment === 'CASH' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-teal-50'}`}>
                  <Banknote className="w-3.5 h-3.5" />
                  เงินสด
                </button>
                <button
                  onClick={() => setPayment('TRANSFER')}
                  className={`py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${payment === 'TRANSFER' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-teal-50'}`}>
                  <Landmark className="w-3.5 h-3.5" />
                  โอน
                </button>
                <button
                  onClick={() => setPayment('CARD')}
                  className={`py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${payment === 'CARD' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-teal-50'}`}>
                  <CreditCard className="w-3.5 h-3.5" />
                  บัตร
                </button>
              </div>
            </div>

            {/* Discount */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500 flex-shrink-0 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" />
                ส่วนลด
              </label>
              <input type="number" value={discount || ''}
                onChange={e => setDiscount(Number(e.target.value) || 0)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400"
                min="0" max={subtotal} placeholder="0" />
            </div>

            {/* Received (cash) */}
            {payment === 'CASH' && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-500 flex-shrink-0 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5" />
                  รับเงิน
                </label>
                <input type="number" value={received || ''}
                  onChange={e => setReceived(Number(e.target.value) || 0)}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400"
                  min="0" placeholder={formatCurrency(total)} />
              </div>
            )}

            {/* Summary */}
            <div className="bg-teal-50 rounded-xl p-3 space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>ราคารวม</span><span>฿{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-red-500">
                  <span>ส่วนลด</span><span>-฿{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base text-teal-800 pt-1 border-t border-teal-200">
                <span>ยอดสุทธิ</span><span>฿{formatCurrency(total)}</span>
              </div>
              {payment === 'CASH' && received > 0 && (
                <div className={`flex justify-between text-sm font-semibold ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  <span>เงินทอน</span><span>฿{formatCurrency(change)}</span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setCart([]); setDiscount(0); setReceived(0) }}
                className="py-3 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />
                ล้างตะกร้า
              </button>
              <button onClick={handleCheckout}
                disabled={loading || (payment === 'CASH' && received > 0 && received < total)}
                className="py-3 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-60 pos-gradient hover:opacity-90 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    ชำระ ฿{formatCurrency(total)}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}