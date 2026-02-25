import { NextRequest, NextResponse } from 'next/server'
import { getSession, logActivity } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (session) {
    await logActivity(session.userId, 'LOGOUT', 'user', session.userId, 'User logged out')
  }
  const response = NextResponse.json({ success: true })
  response.cookies.delete('pos_token')
  return response
}
