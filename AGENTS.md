# AGENTS.md — HRM Enterprise (On-Premises SOA)

## 1. Tổng quan

- Monorepo 3 thành phần: `frontend/` (Next.js 16 App Router), `mobile/` (Flutter 3.x), `backend/` (Express REST + SOAP).
- Single-tenant nội bộ. Tuyệt đối không thêm `tenantId`, `tenantSlug` vào code, schema hay URL.
- Màu chủ đạo đỏ đô `#8E1B2F`. Toàn bộ giao diện tiếng Việt.

## 2. Backend (`backend/`, Express, port 4000)

```text
backend/
├── package.json          # scripts: start (node src/index.js), dev (node --watch)
└── src/
    ├── index.js          # Khởi tạo app, mount routes, error handler
    ├── data/store.js     # Dữ liệu mẫu trong bộ nhớ (branches, users, bankAccounts, payouts)
    ├── routes/health.js  # GET /health
    ├── routes/catalog.js # GET /api/branches, /api/employees
    ├── routes/payroll.js # GET /api/payroll/bank-accounts, GET/POST /api/payroll/payouts
    ├── routes/soap.js    # GET /soap/payroll?wsdl, POST /soap/payroll
    └── soap/wsdl.js      # WSDL + build envelope request/response/fault
```

- Entry kiểm tra: `require.main === module` mới `listen`, export `app` để test.
- Tạo lệnh chi kiểm tra số dư, trừ tiền, sinh `TXN-*` + `BANK-*`, chống trùng bằng `idempotencyKey` (trả lại bản ghi cũ kèm `deduped: true`).
- Dữ liệu đồng bộ với `frontend/src/mock-data/portal.ts` và mock users mobile.

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
