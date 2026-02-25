import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { requireAuth, logActivity } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const auth = await requireAuth(['ADMIN'])
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { username, email, password, role } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })
    }

    const existing = await query<any[]>(
      'SELECT id FROM user WHERE username = ? OR email = ?',
      [username, email]
    )
    if (existing.length > 0) {
      return NextResponse.json({ error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่แล้ว' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const result = await query<any>(
      'INSERT INTO user (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashed, role || 'STAFF']
    )

    await logActivity(auth.session.userId, 'CREATE_USER', 'user', result.insertId, `Created user: ${username}`)

    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(['ADMIN'])
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const users = await query<any[]>(
    'SELECT id, username, email, role, createdAt FROM user ORDER BY createdAt DESC'
  )
  return NextResponse.json(users)
}
