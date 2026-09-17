# AGENTS.md — HRM Enterprise (On-Premises SOA)

## 1. Tổng quan

- Monorepo 3 thành phần: `frontend/` (Next.js 16 App Router), `mobile/` (Flutter 3.x), `backend/` (Express REST + SOAP).
- Single-tenant nội bộ. Tuyệt đối không thêm `tenantId`, `tenantSlug` vào code, schema hay URL.
- Màu chủ đạo đỏ đô `#8E1B2F`. Toàn bộ giao diện tiếng Việt.

## 2. Backend (`backend/`, Multi-service SOA, Node.js + Express)

Backend được xây dựng theo kiến trúc đa dịch vụ (Multi-service SOA). **Mọi AI Agent và lập trình viên khi tạo hoặc phát triển bất kỳ service nào đều BẮT BUỘC tuân thủ 100% các quy tắc đồng bộ sau:**

### 2.1. Quy chuẩn cấu trúc một Service (BẮT BUỘC)

Mỗi service phải là một thư mục riêng biệt nằm trong `backend/<service-name>/`. Môi trường Node.js nằm độc lập trong từng thư mục service đó (có `package.json` và `node_modules/` riêng).

Cấu trúc bắt buộc của một service:
```text
backend/<service-name>/
├── package.json          # Quản lý dependencies & scripts riêng (start, dev)
├── .env.example          # Mẫu biến môi trường (PORT, SERVICE_NAME, DB_URL, ...)
├── server.js             # Entry point khởi động HTTP server (cùng cấp với src)
└── src/
    ├── config/           # Cấu hình môi trường, hằng số constants, cấu hình kết nối DB
    ├── data/             # In-memory mock store, schemas dữ liệu, mock models
    ├── controllers/      # Logic nghiệp vụ xử lý request/response
    ├── middleware/       # Middleware xác thực (auth), validate dữ liệu, error handler
    └── routes/           # Định nghĩa endpoint Express Router, map vào controller
```

### 2.2. Chi tiết trách nhiệm của từng thành phần trong Service

1. **Môi trường Node độc lập**:
   - Chạy lệnh cài đặt và khởi động ngay tại thư mục của service: `cd backend/<service-name> && npm install && npm run dev`.
   - Không khai báo phụ thuộc dùng chung chéo thư mục ngoài.

2. **File `server.js` (Root của Service)**:
   - Load `require("dotenv").config()`.
   - Import Express app từ `src/` hoặc khởi tạo app, áp dụng middleware từ `src/middleware/` và mount routes từ `src/routes/`.
   - Phải có điều kiện: `if (require.main === module) { app.listen(PORT, ...); }` và `module.exports = app;` để phục vụ test.
   - Bắt buộc luôn có route `GET /health` trả về `{ status: "ok", service: "<service-name>", time: new Date().toISOString() }`.

3. **5 thư mục bắt buộc trong `src/`**:
   - `src/config/`: File `index.js` hoặc `env.js` đọc biến môi trường từ `process.env`, định nghĩa port mặc định, JWT secrets, configs.
   - `src/data/`: File `store.js` chứa dữ liệu mẫu in-memory (hoặc DB connection). Dữ liệu nhân sự, chi nhánh, ngân hàng phải luôn đồng bộ với schema của Web (`frontend/src/mock-data/portal.ts`) và Mobile (`mobile/lib/src/core/models/`).
   - `src/controllers/`: Tuyệt đối không viết logic trực tiếp trong route. Controller nhận `(req, res, next)`, xử lý nghiệp vụ, gọi `data/` và trả về JSON chuẩn `{ data: ... }` (thành công) hoặc `{ error: ... }` (thất bại).
   - `src/middleware/`: Chứa `auth.js` (kiểm tra token/session), `validate.js` (kiểm tra input), `errorHandler.js` (xử lý lỗi tập trung).
   - `src/routes/`: Tạo các file route theo domain nghiệp vụ (vd: `auth.routes.js`, `catalog.routes.js`), gom lại ở `src/routes/index.js` trước khi mount vào app.

### 2.3. Quy tắc nghiệp vụ Backend chung
- Tạo lệnh chi (payroll) phải kiểm tra số dư tài khoản trích nợ, trừ tiền, sinh mã `TXN-*` + `BANK-*`, và chống trùng bằng `idempotencyKey` (nếu trùng trả lại bản ghi cũ kèm `deduped: true`).
- Single-tenant: Tuyệt đối không thêm `tenantId`, `tenantSlug` vào bất kỳ code, schema hay URL nào.

## 3. Frontend (`frontend/`, Next.js 16 + React 19 + Tailwind v4)

- Toàn bộ code trong `src/`, alias `@/*` → `./src/*`. Scripts chuẩn: `next dev/build/start`.
- Route: `/` → `/login`; `/dashboard/*` (employees, departments, branches, shifts, tasks, requests, payslips, bank, news, regulations, wifi).
- Chuẩn App Router: `loading.tsx`, `error.tsx`, `not-found.tsx` ở `src/app/`.
- Feature phẳng: `src/features/<domain>/` (không lồng `hr/`). UI dùng chung: `components/ui`, `components/layout`.
- Session: `AuthContext` + cookie `hrm-session`, `src/middleware.ts` bảo vệ `/dashboard/*`. Không đưa `role`/`branchSlug` vào URL. Menu dựng bằng `buildMenuItems(role)` trong `lib/permissions.tsx`.
- Component có state: `"use client"`. Icon Font Awesome. Tiền tệ `formatVND()` từ `lib/utils`.
- Kiểm tra: `npx tsc --noEmit`, `npm run build`.

## 4. Mobile (`mobile/`, Flutter 3.x + go_router + Material 3)

```text
lib/src/
├── app.dart                        # HRMApp dùng MaterialApp.router
├── core/{constants,models,theme,utils,widgets,router,state}
└── features/<name>/{data,presentation}
```

- Router `core/router/router.dart` là single source of truth (`/`, `/login`, `/main` + `extra: UserModel`). Điều hướng bằng `context.go/pushReplacement`, không dùng `Navigator` trực tiếp.
- Auth mẫu tách lớp: `features/auth/data/` (AuthRepository + mock users), UI chỉ gọi repository.
- Theme: `AppColors.primary #8E1B2F`, `AppTheme.lightTheme`, typography Public Sans (`AppTypography`). Không dùng `.withOpacity`, dùng `.withValues(alpha:)`. Không hardcode mã màu, dùng `AppColors`.
- Kiểm tra: `flutter analyze` (0 issues), `flutter test`.

## 5. Quy ước chung

- Không banner/callout hướng dẫn dư thừa trong giao diện doanh nghiệp.
- Dữ liệu người dùng nhập luôn bảo toàn trọn vẹn.
- Backend chạy trước khi demo Web (`http://localhost:4000/health` phải `ok`).
