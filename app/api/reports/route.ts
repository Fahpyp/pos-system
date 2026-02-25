import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(['ADMIN', 'MANAGER'])
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'daily'
  const dateFrom = searchParams.get('dateFrom') || new Date().toISOString().split('T')[0]
  const dateTo = searchParams.get('dateTo') || new Date().toISOString().split('T')[0]

  if (type === 'summary') {
    const [totalSales] = await query<any[]>(
      'SELECT COUNT(*) as count, COALESCE(SUM(total),0) as revenue FROM sale WHERE DATE(createdAt) BETWEEN ? AND ? AND status="COMPLETED"',
      [dateFrom, dateTo]
    )
    const [totalProducts] = await query<any[]>('SELECT COUNT(*) as count FROM product')
    const [lowStock] = await query<any[]>('SELECT COUNT(*) as count FROM product WHERE stock <= 10')
    const [todaySales] = await query<any[]>(
      'SELECT COALESCE(SUM(total),0) as revenue FROM sale WHERE DATE(createdAt) = CURDATE() AND status="COMPLETED"'
    )

    return NextResponse.json({ totalSales, totalProducts, lowStock, todaySales })
  }

  if (type === 'daily') {
    const data = await query<any[]>(
      `SELECT DATE(createdAt) as date, COUNT(*) as transactions, SUM(total) as revenue, SUM(discount) as discount
       FROM sale WHERE DATE(createdAt) BETWEEN ? AND ? AND status="COMPLETED"
       GROUP BY DATE(createdAt) ORDER BY date`,
      [dateFrom, dateTo]
    )
    return NextResponse.json(data)
  }

  if (type === 'top_products') {
    const data = await query<any[]>(
      `SELECT p.name, p.category, SUM(si.quantity) as totalQty, SUM(si.total) as totalRevenue
       FROM saleitem si
       JOIN product p ON si.productId = p.id
       JOIN sale s ON si.saleId = s.id
       WHERE DATE(s.createdAt) BETWEEN ? AND ? AND s.status="COMPLETED"
       GROUP BY si.productId ORDER BY totalRevenue DESC LIMIT 10`,
      [dateFrom, dateTo]
    )
    return NextResponse.json(data)
  }

  if (type === 'low_stock') {
    const data = await query<any[]>(
      'SELECT * FROM product WHERE stock <= 10 ORDER BY stock ASC'
    )
    return NextResponse.json(data)
  }

  if (type === 'logs') {
    const data = await query<any[]>(
      `SELECT al.*, u.username FROM activitylog al
       LEFT JOIN user u ON al.userId = u.id
       ORDER BY al.createdAt DESC LIMIT 100`
    )
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
}
