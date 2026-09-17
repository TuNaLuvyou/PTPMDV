<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Hướng dẫn dự án — Frontend HRM System (On-Premises SOA)

## Tổng quan

Hệ thống Quản trị Nhân sự & Ca kíp Nội bộ (**HRM System**) triển khai theo mô hình **On-Premises SOA** (cài đặt trực tiếp lên Server nội bộ của doanh nghiệp, Ngân hàng gọi SOAP API trực tiếp đến server nội bộ).

- Thiết kế: Màu chủ đạo **đỏ đô `#8e1b2f`**, font **Public Sans**, Tailwind CSS v4 thuần.
- Stack: **Next.js 16** (App Router) + **React 19** + **TypeScript** + **Tailwind v4** + Font Awesome (`@fortawesome/react-fontawesome`).

## Lệnh thường dùng

```bash
npm run dev        # dev server (http://localhost:3000)
npm run build      # production build
npm run lint       # eslint
npx tsc --noEmit   # typecheck
```

## Cấu trúc Route (Phẳng & Tinh gọn)

```
/                          → redirect → /login
/login                     → Đăng nhập quản trị (Admin / Manager)
/dashboard/employees       → Quản lý nhân sự
/dashboard/shifts          → Phân ca làm việc & Quản lý đăng ký ca
/dashboard/payslips        → Bảng lương & Chốt công
/dashboard/requests        → Phê duyệt yêu cầu (đổi ca, nghỉ phép, tạm ứng)
/dashboard/tasks           → Giao việc & Quản lý nhiệm vụ
/dashboard/news            → Bảng tin & Thông báo nội bộ
/dashboard/regulations     → Nội quy & Quy chế lao động
/dashboard/wifi            → Cấu hình Wi-Fi chấm công
/dashboard/branches        → Quản lý Chi nhánh doanh nghiệp
```

## Cấu trúc thư mục (Chuẩn Next.js App Router với src/)

```
frontend/
├── public/                        # Static assets (icons, fonts, images)
├── src/                           # 🌟 Toàn bộ application code nằm trong src/
│   ├── app/
│   │   ├── (auth)/                # Route Group: Xác thực
│   │   │   ├── layout.tsx         # Layout riêng cho Auth (căn giữa, không sidebar)
│   │   │   └── login/page.tsx     # /login
│   │   ├── (dashboard)/           # Route Group: Quản trị HRM
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx     # DashboardShell (Sidebar + Topbar theo quyền hạn)
│   │   │       ├── page.tsx       # /dashboard (Tổng quan quản trị)
│   │   │       ├── employees/page.tsx
│   │   │       ├── shifts/page.tsx
│   │   │       ├── payslips/page.tsx
│   │   │       ├── requests/page.tsx
│   │   │       ├── tasks/page.tsx
│   │   │       ├── news/page.tsx
│   │   │       ├── regulations/page.tsx
│   │   │       ├── wifi/page.tsx
│   │   │       └── branches/page.tsx
│   │   ├── globals.css            # Design tokens (@theme) + base styles
│   │   ├── layout.tsx             # RootLayout bọc AuthProvider + font Public Sans
│   │   ├── loading.tsx            # Loading fallback chuẩn App Router
│   │   ├── error.tsx              # Error boundary chuẩn App Router
│   │   ├── not-found.tsx          # 404 chuẩn App Router
│   │   └── page.tsx               # Redirect → /login
│   ├── components/
│   │   ├── ui/                    # Button, Badge, Card, StatCard, Table, Modal, ConfirmDialog...
│   │   └── layout/                # Sidebar, Topbar, NotificationPanel, DashboardShell
│   ├── features/                  # Module components nghiệp vụ HR (shifts, tasks, branches...)
│   ├── context/                   # AuthContext, TopbarContext
│   ├── hooks/                     # useCurrentUser
│   ├── lib/                       # utils.ts, permissions.tsx
│   ├── mock-data/                 # portal.ts (mock & enterprise initial data)
│   ├── types/                     # TypeScript types (index.ts)
│   └── middleware.ts              # Route protection middleware
├── next.config.ts
├── tsconfig.json                  # Path alias: "@/*": ["./src/*"]
└── package.json
```

## Phân quyền & Quản lý phiên

- Phiên đăng nhập được quản lý qua `AuthContext` (`useCurrentUser()`), lưu vào `localStorage` và cookie `hrm-session`.
- Tuyệt đối không đưa `role`, `branchSlug`, hay `tenant` vào URL params.
- `middleware.ts` kiểm tra cookie và tự động chuyển hướng về `/login` nếu chưa đăng nhập.
- Menu bên trái được xây dựng tự động qua `buildMenuItems(role)`.

## Quy ước code

- Component có tương tác/state: thêm `"use client"` ở đầu file.
- Icon: Font Awesome (`<FontAwesomeIcon icon={faX} fontSize={16} />`, import từ `@fortawesome/free-solid-svg-icons`).
- Tiền tệ: `formatVND()` từ `@/lib/utils`; ghép class dùng `cn()`.
- Toàn bộ nội dung giao diện bằng **tiếng Việt**.
