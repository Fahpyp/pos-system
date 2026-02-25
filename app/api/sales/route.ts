import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth, logActivity } from '@/lib/auth'
import { generateInvoiceNo } from '@/lib/utils'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if ('error' in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(request.url)
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')
  const limit = Number(searchParams.get('limit') || 50)
  const page = Number(searchParams.get('page') || 1)
  const offset = (page - 1) * limit

  let sql = `
    SELECT s.*, u.username
    FROM sale s
    LEFT JOIN user u ON s.userId = u.id
    WHERE 1=1
  `
  const params: any[] = []

  if (dateFrom) {
    sql += ' AND DATE(s.createdAt) >= ?'
    params.push(dateFrom)
  }

  if (dateTo) {
    sql += ' AND DATE(s.createdAt) <= ?'
    params.push(dateTo)
  }

  // inject limit offset เป็นตัวเลขแทน
  sql += ` ORDER BY s.createdAt DESC LIMIT ${limit} OFFSET ${offset}`

  const sales = await query<any[]>(sql, params)

  return NextResponse.json(sales)
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const { items, payment, discount, tax } = await request.json()

    if (!items || !items.length) {
      return NextResponse.json({ error: 'ไม่มีรายการสินค้า' }, { status: 400 })
    }

    // Validate stock and calculate total
    let subtotal = 0
    for (const item of items) {
      const [rows] = await conn.execute('SELECT stock, price FROM product WHERE id = ? FOR UPDATE', [item.productId])
      const product = (rows as any[])[0]
      if (!product) throw new Error(`ไม่พบสินค้า ID: ${item.productId}`)
      if (product.stock < item.quantity) throw new Error(`สต็อกไม่เพียงพอสำหรับสินค้า`)
      subtotal += (item.price || product.price) * item.quantity
    }

    const discountAmt = discount || 0
    const taxAmt = tax || 0
    const total = subtotal - discountAmt + taxAmt
    const invoiceNo = generateInvoiceNo()

    const [saleResult] = await conn.execute(
      'INSERT INTO sale (invoiceNo, total, tax, discount, payment, status, userId) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [invoiceNo, total, taxAmt, discountAmt, payment || 'CASH', 'COMPLETED', auth.session.userId]
    )
    const saleId = (saleResult as any).insertId

    for (const item of items) {
      const [rows] = await conn.execute('SELECT price FROM product WHERE id = ?', [item.productId])
      const product = (rows as any[])[0]
      const itemTotal = (item.price || product.price) * item.quantity

      await conn.execute(
        'INSERT INTO saleitem (quantity, price, total, productId, saleId) VALUES (?, ?, ?, ?, ?)',
        [item.quantity, item.price || product.price, itemTotal, item.productId, saleId]
      )

      await conn.execute(
        'UPDATE product SET stock = stock - ?, updatedAt = NOW() WHERE id = ?',
        [item.quantity, item.productId]
      )

      await conn.execute(
        'INSERT INTO stockmovement (productId, type, quantity, note, userId) VALUES (?, ?, ?, ?, ?)',
        [item.productId, 'SALE', item.quantity, `ขาย #${invoiceNo}`, auth.session.userId]
      )
    }

    await conn.commit()
    await logActivity(auth.session.userId, 'CREATE_SALE', 'sale', saleId, `Invoice: ${invoiceNo}, Total: ${total}`)

    return NextResponse.json({ success: true, saleId, invoiceNo, total })
  } catch (error: any) {
    await conn.rollback()
    console.error('Sale error:', error)
    return NextResponse.json({ error: error.message || 'เกิดข้อผิดพลาด' }, { status: 500 })
  } finally {
    conn.release()
  }
}
