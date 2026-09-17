# AGENTS.md — HRM Enterprise (On-Premises SOA)

## 1. Tổng quan

- Monorepo 3 thành phần: `frontend/` (Next.js 16 App Router), `mobile/` (Flutter 3.x), `backend/` (Express REST + SOAP).
- Single-tenant nội bộ. Tuyệt đối không thêm `tenantId`, `tenantSlug` vào code, schema hay URL.
- Màu chủ đạo đỏ đô `#8E1B2F`. Toàn bộ giao diện tiếng Việt.

## 2. Backend (`backend/`, Multi-service SOA, Clean Architecture)

Backend được xây dựng theo kiến trúc đa dịch vụ (Multi-service SOA) áp dụng nguyên lý Clean / Hexagonal Architecture. **Mọi AI Agent và lập trình viên khi tạo hoặc phát triển bất kỳ service nào đều BẮT BUỘC tuân thủ 100% cấu trúc đồng bộ sau:**

### 2.1. Quy chuẩn cấu trúc thư mục của MỖI Service (BẮT BUỘC)

Mỗi service là một thư mục độc lập nằm trong `backend/<service-name>/`. Môi trường Node.js nằm độc lập trong từng thư mục service đó (bắt buộc có `package.json`, `node_modules/`, và `.env.example` riêng).

Cấu trúc chuẩn của một service:
```text
backend/<service-name>/
├── config/                     # Cấu hình môi trường (env, db, logger)
│   ├── index.js
│   └── database.js
├── src/
│   ├── api/                    # Delivery / Presentation Layer
│   │   ├── controllers/        # Xử lý Request / Response HTTP
│   │   ├── middlewares/        # Auth, Validation, Error Handler, Rate Limit
│   │   ├── routes/             # Định tuyến URL API
│   │   ├── validators/         # Schema validation (Joi / Zod)
│   │   └── grpc/               # Handler cho gRPC (nếu có)
│   │
│   ├── domain/                 # Core Business Rules (Thuần JS/TS, không dính framework)
│   │   ├── entities/           # Business Objects (Employee, Payout, Shift, Request, ...)
│   │   ├── errors/             # Domain Custom Errors
│   │   └── value-objects/      # Money, Address, Status
│   │
│   ├── services/               # Application / Use Cases Layer
│   │   ├── CreateXxxUseCase.js
│   │   └── ProcessYyyUseCase.js
│   │
│   ├── infrastructure/         # External Interfaces / Adapters
│   │   ├── database/
│   │   │   ├── models/         # ORM / ODM Schemas (Prisma, TypeORM, Mongoose, in-memory)
│   │   │   └── repositories/   # Đọc / ghi DB thực tế
│   │   ├── messaging/          # Producers & Consumers (Kafka / RabbitMQ)
│   │   ├── external-clients/   # Gọi sang các API bên thứ 3 hoặc service khác
│   │   └── logging/            # Winston / Pino logger
│   │
│   ├── utils/                  # Utility functions
│   └── app.js                  # Khởi tạo Express app & gắn middlewares
│
├── tests/                      # Unit, Integration & End-to-End Tests
│   ├── unit/
│   └── integration/
│
├── .env.example                # Mẫu biến môi trường (BẮT BUỘC)
├── Dockerfile                  # Container build cho service (BẮT BUỘC)
├── docker-compose.yml          # Cấu hình chạy service & dependencies cục bộ (BẮT BUỘC)
├── package.json                # Dependencies & scripts độc lập (BẮT BUỘC)
└── server.js                   # Entry point (kết nối DB, lắng nghe Port, GET /health)
```

### 2.2. Chi tiết trách nhiệm của từng tầng trong Service

1. **Môi trường Node độc lập (`package.json` & `node_modules`)**:
   - Chạy lệnh cài đặt và khởi động ngay tại thư mục của service: `cd backend/<service-name> && npm install && npm run dev`.
   - Mỗi service quản lý dependencies riêng, không phụ thuộc chéo ra ngoài thư mục service.
   - Bắt buộc luôn có `.env.example` chứa toàn bộ mẫu biến môi trường cần thiết (`PORT`, `SERVICE_NAME`, `DB_URL`, `JWT_SECRET`,...).

2. **Cấu hình (`config/`)**:
   - `config/index.js`: Đọc và validate biến môi trường từ `process.env`.
   - `config/database.js`: Cấu hình kết nối cơ sở dữ liệu hoặc in-memory store.

3. **Tầng Presentation (`src/api/`)**:
   - `controllers/`: Chỉ tiếp nhận `req`, gọi xuống Use Case ở `src/services/`, trả về response chuẩn `{ data: ... }` hoặc `{ error: ... }`. Tuyệt đối không viết business logic tại controller.
   - `middlewares/`: Xác thực token/session, phân quyền, validate schema, xử lý lỗi tập trung.
   - `routes/`: Định tuyến Express Router map URL vào controller tương ứng.
   - `validators/`: Khai báo schema validate input (Joi/Zod).

4. **Tầng Domain (`src/domain/`)**:
   - Thuần JS/TS, độc lập hoàn toàn với Express hay database library.
   - Định nghĩa `entities/`, `value-objects/` và các lỗi domain `errors/`.

5. **Tầng Use Cases / Application (`src/services/`)**:
   - Chứa các Use Case thực thi logic nghiệp vụ cụ thể (vd: `CreatePayoutUseCase`, `GeneratePayslipUseCase`).
   - Tương tác với cơ sở dữ liệu thông qua repository interface.

6. **Tầng Infrastructure (`src/infrastructure/`)**:
   - Triển khai cụ thể cho database (`models/`, `repositories/`), gọi service khác (`external-clients/`), logging và messaging.
   - Dữ liệu nhân sự, chi nhánh, ngân hàng phải luôn đồng bộ với schema của Web (`frontend/src/mock-data/portal.ts`) và Mobile (`mobile/lib/src/core/models/`).

7. **File `server.js` & `src/app.js`**:
   - `src/app.js`: Khởi tạo Express app, cấu hình CORS, parser, gắn middleware và routes từ `src/api/routes/`.
   - `server.js`: Entry point nạp env, kết nối DB/infrastructure, khởi động HTTP server khi `require.main === module`, export `app` để test.
   - Bắt buộc luôn có endpoint `GET /health` trả về `{ status: "ok", service: "<service-name>", time: new Date().toISOString() }`.

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
