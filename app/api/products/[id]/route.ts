import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth, logActivity } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const products = await query<any[]>('SELECT * FROM product WHERE id = ?', [params.id])
  if (!products.length) return NextResponse.json({ error: 'ไม่พบสินค้า' }, { status: 404 })
  return NextResponse.json(products[0])
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(['ADMIN', 'MANAGER'])
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await request.json()
    const { barcode, name, description, price, cost, category } = body

    await query(
      'UPDATE product SET barcode=?, name=?, description=?, price=?, cost=?, category=?, updatedAt=NOW() WHERE id=?',
      [barcode || null, name, description || null, price, cost || 0, category || null, params.id]
    )

    await logActivity(auth.session.userId, 'UPDATE_PRODUCT', 'product', Number(params.id), `Updated: ${name}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(['ADMIN'])
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const products = await query<any[]>('SELECT name FROM product WHERE id = ?', [params.id])
    if (!products.length) return NextResponse.json({ error: 'ไม่พบสินค้า' }, { status: 404 })

    await query('DELETE FROM product WHERE id = ?', [params.id])
    await logActivity(auth.session.userId, 'DELETE_PRODUCT', 'product', Number(params.id), `Deleted: ${products[0].name}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'ไม่สามารถลบสินค้าที่มีประวัติการขายได้' }, { status: 400 })
  }
}
