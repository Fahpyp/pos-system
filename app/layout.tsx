import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'POS System | ระบบขายหน้าร้าน',
  description: 'ระบบ Point of Sale สำหรับร้านค้า',
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
