# 🛒 POS System - ระบบจัดการร้านค้า

ระบบ Point of Sale สมบูรณ์แบบ พัฒนาด้วย **Next.js 14**, **Tailwind CSS**, **shadcn/ui** และ **MySQL2**

## ✨ ฟีเจอร์

- 🛒 **หน้าขายหน้าร้าน (POS)** - เพิ่มสินค้าลงตะกร้า, ส่วนลด, หลายวิธีชำระเงิน, ใบเสร็จ
- 📦 **จัดการสต็อก** - รับเข้า/จ่ายออก, แจ้งเตือนสต็อกต่ำ, ประวัติการเคลื่อนไหว
- 🏷️ **จัดการสินค้า** - CRUD พร้อมคำนวณกำไร, ค้นหาบาร์โค้ด
- 📊 **แดชบอร์ด** - ภาพรวม, กราฟยอดขาย, สินค้าขายดี
- 📈 **รายงาน** - ยอดขายรายวัน, สินค้าขายดี, ล็อกกิจกรรม
- 👥 **จัดการผู้ใช้** - 3 บทบาท (ADMIN, MANAGER, STAFF)
- 🔐 **ระบบ Auth** - JWT + bcrypt, session cookie
- 📋 **Activity Log** - บันทึกกิจกรรมทุก action

## 🚀 การติดตั้ง

### 1. ติดตั้ง Dependencies

```bash
cd pos-system
npm install
```

### 2. สร้างฐานข้อมูล MySQL

```bash
mysql -u root -p < database.sql
```

### 3. ตั้งค่า Environment

แก้ไขไฟล์ `.env.local`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pos_db
JWT_SECRET=your_super_secret_random_string_here
```

### 4. รัน Development Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

### 5. Login เข้าระบบ

- **Username:** admin
- **Password:** admin123

---

## 📁 โครงสร้างไฟล์

```
pos-system/
├── app/
│   ├── api/
│   │   ├── auth/login/      # POST - เข้าสู่ระบบ
│   │   ├── auth/logout/     # POST - ออกจากระบบ
│   │   ├── auth/register/   # GET/POST - จัดการผู้ใช้
│   │   ├── products/        # CRUD สินค้า
│   │   ├── inventory/       # จัดการสต็อก
│   │   ├── sales/           # บันทึกการขาย
│   │   └── reports/         # รายงาน
│   ├── dashboard/           # แดชบอร์ด
│   ├── pos/                 # หน้าขาย
│   ├── inventory/           # คลังสินค้า
│   ├── products/            # จัดการสินค้า
│   ├── reports/             # รายงาน
│   ├── settings/            # ตั้งค่า
│   └── login/               # เข้าสู่ระบบ
├── components/
│   └── AppLayout.tsx        # Sidebar layout
├── lib/
│   ├── db.ts                # MySQL connection pool
│   ├── auth.ts              # JWT helpers
│   └── utils.ts             # Utility functions
├── middleware.ts             # Route protection
├── database.sql             # SQL setup script
└── .env.local               # Environment variables
```

## 🔐 API Authentication

ทุก API (ยกเว้น `/api/auth/login`) ต้องส่ง Token:

```
Cookie: pos_token=<jwt_token>
# หรือ
Authorization: Bearer <jwt_token>
```

## 🏗️ Build สำหรับ Production

```bash
npm run build
npm start
```

---

**โทน:** 🟢 ฟ้า-เขียว (Teal + Cyan) | **Font:** Kanit (ภาษาไทย)
