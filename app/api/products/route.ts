import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth, logActivity } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const barcode = searchParams.get('barcode') || ''

  let sql = 'SELECT * FROM product WHERE 1=1'
  const params: any[] = []

  if (barcode) {
    sql += ' AND barcode = ?'
    params.push(barcode)
  } else {
    if (search) {
      sql += ' AND (name LIKE ? OR barcode LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }
    if (category) {
      sql += ' AND category = ?'
      params.push(category)
    }
  }

  sql += ' ORDER BY name ASC'

  const products = await query<any[]>(sql, params)
  return NextResponse.json(products)
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(['ADMIN', 'MANAGER'])
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await request.json()
    const { barcode, name, description, price, cost, stock, category } = body

    if (!name || price == null) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อสินค้าและราคา' }, { status: 400 })
    }

    const result = await query<any>(
      'INSERT INTO product (barcode, name, description, price, cost, stock, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [barcode || null, name, description || null, price, cost || 0, stock || 0, category || null]
    )

    if (stock > 0) {
      await query(
        'INSERT INTO stockmovement (productId, type, quantity, note, userId) VALUES (?, ?, ?, ?, ?)',
        [result.insertId, 'IN', stock, 'เพิ่มสินค้าใหม่', auth.session.userId]
      )
    }

    await logActivity(auth.session.userId, 'CREATE_PRODUCT', 'product', result.insertId, `Created: ${name}`)
    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'บาร์โค้ดนี้มีอยู่แล้ว' }, { status: 400 })
    }
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
