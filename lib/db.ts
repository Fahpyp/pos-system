import mysql from 'mysql2/promise'
import { RowDataPacket } from 'mysql2'

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pos_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00',
})

export async function query<T = RowDataPacket[]>(
  sql: string,
  params: any[] = []
): Promise<T> {
  const [rows] = await pool.execute<RowDataPacket[]>(sql, params)
  return rows as T
}