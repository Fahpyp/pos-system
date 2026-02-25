import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const sales = await query<any[]>(
    'SELECT s.*, u.username FROM sale s LEFT JOIN user u ON s.userId = u.id WHERE s.id = ?',
    [params.id]
  )
  if (!sales.length) return NextResponse.json({ error: 'ไม่พบรายการขาย' }, { status: 404 })

  const items = await query<any[]>(
    `SELECT si.*, p.name as productName, p.barcode
     FROM saleitem si LEFT JOIN product p ON si.productId = p.id
     WHERE si.saleId = ?`,
    [params.id]
  )

  return NextResponse.json({ ...sales[0], items })
}
