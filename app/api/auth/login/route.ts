import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { signToken, logActivity } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบ' },
        { status: 400 }
      )
    }

    const users = await query<any[]>(
      'SELECT * FROM user WHERE username = ? LIMIT 1',
      [username]
    )

    if (!users.length) {
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    const user = users[0]
    const valid = password === user.password

    if (!valid) {
      await logActivity(
        null,
        'LOGIN_FAILED',
        'user',
        user.id,
        `Failed login for ${username}`,
        request.headers.get('x-forwarded-for') || 'unknown'
      )

      return NextResponse.json(
        { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    const token = await signToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    })

    await logActivity(
      user.id,
      'LOGIN',
      'user',
      user.id,
      'Successful login',
      request.headers.get('x-forwarded-for') || 'unknown'
    )

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set('pos_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    )
  }
}