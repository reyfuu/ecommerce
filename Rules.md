# Engineering Rules & Guidelines Document (Rules / SOP)

**Versi:** 1.0  
**Tujuan:** Panduan standar penulisan kode, konvensi arsitektur, dan proses pengembangan tim.  

---

## 1. Prinsip Utama Rekayasa Perangkat Lunak (Engineering Principles)

1. **Clean Code & Self-Documenting**: Tulis kode yang mudah dibaca oleh manusia. Gunakan nama variabel, fungsi, dan tipe data yang ekspresif.
2. **KISS (Keep It Simple, Stupid)**: Hindari over-engineering. Buat solusi paling sederhana yang memenuhi persyaratan tanpa kompleksitas yang tidak perlu.
3. **DRY (Don't Repeat Yourself)**: Ekstraksi logika yang berulang menjadi modul/helper terpisah, namun jangan melakukan abstraksi prematur.
4. **Decoupling**: Pisahkan tanggung jawab antar modul secara tegas (Layered Architecture).

---

## 2. Standar Penulisan Kode Backend (Go / Golang)

### 2.1. Structure & Layout Directory
```text
backend/
├── cmd/
│   └── api/
│       └── main.go           # Entry point aplikasi backend
├── internal/
│   ├── config/               # Load environment variables & app config
│   ├── handler/              # HTTP Request Controller / Handlers
│   ├── middleware/           # Auth JWT, CORS, Logger, Panic Recovery
│   ├── model/                # Structs Data, DTO, Database Entities
│   ├── repository/           # SQL / Database Queries (Data Access Layer)
│   └── service/              # Business Logic Layer
├── pkg/                      # Shared helper packages (jwt, hasher, validator)
├── go.mod
└── go.sum
```

### 2.2. Konvensi Penamaan (Naming Conventions)
- **Paket (Package)**: Nama paket menggunakan huruf kecil tanpa garis bawah (`package handler`, `package service`).
- **Ekspor Variable / Function**:
  - `PascalCase` untuk fungsi/struct/field yang di-export (akses publik).
  - `camelCase` untuk fungsi/variable internal paket (private).
  - `snake_case` untuk tag JSON dan tag Database (`json:"user_id"` `db:"created_at"`).

### 2.3. Penanganan Error (Explicit Error Handling)
- **Jangan pernah mengabaikan error** (`_ = err`). Selalu periksa dan tangani `if err != nil`.
- Kembalikan error domain terstruktur ke handler untuk diterjemahkan menjadi HTTP response JSON yang sesuai.

```go
// CONTOH YANG BENAR
user, err := s.userRepo.FindByID(ctx, userID)
if err != nil {
    if errors.Is(err, repository.ErrNotFound) {
        return nil, fmt.Errorf("%w: user not found", service.ErrInvalidInput)
    }
    return nil, fmt.Errorf("failed to fetch user: %w", err)
}
```

---

## 3. Standar Penulisan Kode Frontend (Next.js / TypeScript)

### 3.1. Structure & Layout Directory
```text
front-end/
├── src/
│   ├── app/                  # Next.js App Router (pages & layouts)
│   │   ├── (auth)/           # Route group auth (login, register)
│   │   ├── (customer)/       # Customer pages (catalog, cart, checkout)
│   │   ├── admin/            # Admin dashboard pages
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/           # Reusable UI components
│   │   ├── ui/               # Base UI elements (buttons, inputs, cards)
│   │   ├── layout/           # Navbar, Footer, Sidebar
│   │   └── modules/          # Feature specific components (CartItem, ProductCard)
│   ├── lib/                  # Helper libraries, API client instance
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API request calls to backend
│   └── types/                # TypeScript interface/type definitions
├── public/                   # Static assets
└── package.json
```

### 3.2. TypeScript Strictness & Styling
- **Strict Type Checking**: Hindari penggunaan `any`. Selalu definisikan `interface` atau `type` untuk prop komponen dan payload data API.
- **Design Tokens**: Gunakan CSS Variables atau utility classes konsisten. Hindari penyertaan hardcoded pixel offset yang tidak berdasar.
- **Micro-Animations & Hover Effects**: Tambahkan efek transisi halus (`transition-all duration-200`) pada elemen interaktif.

---

## 4. Standar Restful API & Git Workflow

### 4.1. Endpoint Naming Convention
- Gunakan kata benda plural untuk resource API (`/api/v1/products`, `/api/v1/orders`).
- Gunakan HTTP Methods secara semantik:
  - `GET`: Membaca data
  - `POST`: Membuat data baru
  - `PUT` / `PATCH`: Perbarui data yang ada
  - `DELETE`: Menghapus data

### 4.2. Standar Commit Git (Conventional Commits)
Format pesan commit WAJIB mengikuti konvensi berikut:
- `feat: <deskripsi singkat>` -> Untuk penambahan fitur baru
- `fix: <deskripsi singkat>` -> Untuk perbaikan bug
- `docs: <deskripsi singkat>` -> Untuk dokumentasi
- `refactor: <deskripsi singkat>` -> Perapihan kode tanpa mengubah fungsionalitas
- `style: <deskripsi singkat>` -> Perubahan format CSS/UI visual

Contoh: `feat: implement jwt auth middleware in backend`

---

## 5. Prosedur Verifikasi (Verification SOP)

> [!CAUTION]
> Jangan pernah menyatakan fitur/tugas selesai sebelum menjalankan verifikasi kode runtime atau tes kompilasi.

1. **Pengujian Kompilasi Backend**: Jalankan `go build ./...` atau `go test ./...` di folder [backend/](file:///home/reyfuu/e-commerce/backend) untuk memastikan tidak ada kesalahan sintaks atau import.
2. **Pengujian Build Frontend**: Jalankan `npm run build` atau `npm run dev` di folder [front-end/](file:///home/reyfuu/e-commerce/front-end) untuk memverifikasi tipe TypeScript dan render komponen.
