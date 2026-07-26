# Full-Stack E-Commerce Platform

Platform e-commerce full-stack modern menggunakan **Go (Golang) REST API** sebagai backend dan **Next.js (TypeScript)** sebagai frontend dengan desain **dark glassmorphism** premium.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Go (Golang) + Gin Framework + GORM |
| **Database** | PostgreSQL (Production) / SQLite (Local Dev fallback) |
| **Auth** | JWT (JSON Web Token) + Bcrypt |

---

## Cara Menjalankan Proyek (Development Mode)

### 1. Jalankan Backend (Go API)
```bash
cd backend
go run ./cmd/api/main.go
```
Server berjalan di: `http://localhost:8080`

> **Default Admin Account:** `admin@ecommerce.com` / `admin123`

### 2. Jalankan Frontend (Next.js)
```bash
cd front-end
npm run dev
```
App berjalan di: `http://localhost:3000`

---

## Struktur Direktori Proyek

```
e-commerce/
├── backend/                     # Go REST API
│   ├── cmd/api/main.go          # Entry point server
│   ├── internal/
│   │   ├── handler/             # HTTP handlers
│   │   ├── middleware/          # JWT auth middleware
│   │   ├── model/               # Entity models & DTOs
│   │   ├── repository/          # Database access layer (GORM)
│   │   └── service/             # Business logic layer
│   └── pkg/
│       ├── hasher/              # Bcrypt helper
│       └── jwt/                 # JWT token helper
│
├── front-end/                   # Next.js Frontend
│   └── src/
│       ├── app/                 # Pages (App Router)
│       ├── components/          # Layout & UI components
│       ├── context/             # Auth & Cart Context
│       ├── lib/                 # Axios client & utilities
│       └── types/               # TypeScript types
│
├── PRD.md                       # Product requirements
├── Architecture.md              # System architecture
├── Design.md                    # UI/UX design spec
├── Schema.md                    # Database schema & ERD
├── Rules.md                     # Engineering rules & SOP
└── AGENTS.md                    # AI agent guidelines
```

---

## API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | ❌ | Daftar akun baru |
| `POST` | `/api/v1/auth/login` | ❌ | Login & dapatkan JWT token |
| `GET` | `/api/v1/auth/me` | ✅ | Info profil pengguna |
| `GET` | `/api/v1/categories` | ❌ | Daftar kategori |
| `GET` | `/api/v1/products` | ❌ | Katalog produk (filter + sort) |
| `GET` | `/api/v1/products/:id` | ❌ | Detail produk |
| `GET` | `/api/v1/cart` | ✅ | Keranjang belanja |
| `POST` | `/api/v1/cart/items` | ✅ | Tambah item ke keranjang |
| `PUT` | `/api/v1/cart/items/:itemId` | ✅ | Update kuantitas item |
| `DELETE` | `/api/v1/cart/items/:itemId` | ✅ | Hapus item dari keranjang |
| `POST` | `/api/v1/orders/checkout` | ✅ | Buat pesanan dari keranjang |
| `GET` | `/api/v1/orders` | ✅ | Riwayat pesanan pelanggan |
| `POST` | `/api/v1/admin/categories` | 🔒 Admin | Buat kategori baru |
| `POST` | `/api/v1/admin/products` | 🔒 Admin | Buat produk baru |
| `PUT` | `/api/v1/admin/products/:id` | 🔒 Admin | Edit produk |
| `DELETE` | `/api/v1/admin/products/:id` | 🔒 Admin | Hapus produk |
| `GET` | `/api/v1/admin/orders` | 🔒 Admin | Semua pesanan masuk |
| `PUT` | `/api/v1/admin/orders/:id/status` | 🔒 Admin | Update status pesanan |
