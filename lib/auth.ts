import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { query } from './db'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

export interface JWTPayload {
  userId: number
  username: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF'
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('pos_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function requireAuth(roles?: string[]) {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized', status: 401 }
  }
  if (roles && !roles.includes(session.role)) {
    return { error: 'Forbidden', status: 403 }
  }
  return { session }
}

export async function logActivity(
  userId: number | null,
  action: string,
  entity?: string,
  entityId?: number,
  details?: string,
  ipAddress?: string
) {
  try {
    await query(
      'INSERT INTO activitylog (userId, action, entity, entityId, details, ipAddress) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, action, entity || null, entityId || null, details || null, ipAddress || null]
    )
  } catch (e) {
    console.error('Log activity error:', e)
  }
}
