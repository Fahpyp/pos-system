import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth, logActivity } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')
  const limit = Number(searchParams.get('limit') || 50)

  let sql = `
    SELECT sm.*, p.name as productName, u.username
    FROM stockmovement sm
    LEFT JOIN product p ON sm.productId = p.id
    LEFT JOIN user u ON sm.userId = u.id
  `
  const params: any[] = []

  if (productId) {
    sql += ' WHERE sm.productId = ?'
    params.push(productId)
  }
  const safeLimit = Number(limit) || 50

  sql += ` ORDER BY sm.createdAt DESC LIMIT ${safeLimit}`
  params.push(limit)

  const movements = await query<any[]>(sql, params)
  return NextResponse.json(movements)
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(['ADMIN', 'MANAGER'])
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { productId, type, quantity, note } = await request.json()

    if (!productId || !type || !quantity) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })
    }

    const products = await query<any[]>('SELECT stock, name FROM product WHERE id = ?', [productId])
    if (!products.length) return NextResponse.json({ error: 'ไม่พบสินค้า' }, { status: 404 })

    const product = products[0]
    const newStock = type === 'IN'
      ? product.stock + quantity
      : product.stock - quantity

    if (newStock < 0) {
      return NextResponse.json({ error: 'สต็อกไม่เพียงพอ' }, { status: 400 })
    }

    await query('UPDATE product SET stock = ?, updatedAt = NOW() WHERE id = ?', [newStock, productId])
    const result = await query<any>(
      'INSERT INTO stockmovement (productId, type, quantity, note, userId) VALUES (?, ?, ?, ?, ?)',
      [productId, type, quantity, note || null, auth.session.userId]
    )

    await logActivity(
      auth.session.userId, 'STOCK_MOVEMENT', 'product', productId,
      `${type}: ${quantity} units for ${product.name}`
    )

    return NextResponse.json({ success: true, id: result.insertId, newStock })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
