<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Hướng dẫn dự án — Frontend (PTPMDV)

## Tổng quan

UI/UX cho **2 Web** (thiết kế học từ `dasher-ui-1.0.0`, dựng lại bằng **Tailwind CSS v4 thuần**, màu chủ đạo **đỏ đô `#8e1b2f`**, font **Public Sans**):

- **Web 1 — Platform Admin** (`/platform-admin/*`): dashboard, gói cước, tenants, webhooks, báo cáo & sự cố, audit log.
- **Web 2 — Restaurant Portal** (`/portal/*`): thu ngân (đơn hàng, trạng thái món, loyalty, báo cáo ca) + quản trị (dashboard, chi nhánh, thực đơn, kho, ca, HR, ngân hàng, Wi-Fi, hỗ trợ).

Stack: **Next.js 16** (App Router) + **React 19** + **TypeScript** + **Tailwind v4** + `@tabler/icons-react`.

## Lệnh thường dùng

```bash
npm run dev        # dev server (http://localhost:3000)
npm run build      # production build
npm run lint       # eslint
npx tsc --noEmit   # typecheck
```

## Cấu trúc thư mục

```
app/
  page.tsx                            # redirect → /platform-admin/login
  globals.css                         # design tokens (@theme) + base styles
  layout.tsx                          # font Public Sans + metadata
  platform-admin/
    login/page.tsx                    # Web 1 login (card giữa màn hình)
    (admin)/layout.tsx                # DashboardShell (sidebar + topbar)
    (admin)/dashboard|subscriptions|tenants|webhooks|reports|audit-logs/...
  portal/
    login/page.tsx                    # Web 2 login (chọn vai trò R2/R3)
    [role]/[tenantSlug]/[branchSlug]/
      layout.tsx                      # layout tối giản (chỉ nền)
      shift/page.tsx                  # Mở ca FULLSCREEN (ngoài route group)
      (portal)/layout.tsx             # DashboardShell
      (portal)/orders|menu-status|loyalty|report/...        # Thu ngân
      (portal)/management/dashboard|menu|stock|shifts|hr|bank|wifi|...  # Quản trị
components/
  ui/        # Button, Badge (+StatusBadge), Card, StatCard, Table, Modal,
             # ConfirmDialog, PageHeader, Form (Field/Input/Select/Textarea/
             # Checkbox/Toggle), Charts (Line/Donut)
  layout/    # Sidebar, Topbar, NotificationPanel, DashboardShell
lib/utils.ts # formatVND, formatNumber, cn
mock-data/   # DỮ LIỆU GIẢ (types.ts, platform.ts, portal.ts)
             # ⚠️ TẠM THỜI — user tự xóa sau khi test xong
```

## Quy ước routing (Next.js 16)

- **Dynamic segments**: `params` là **Promise** — page/layout phải là `async` và dùng `await params`:

```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

- **Route group `(admin)` / `(portal)`**: bọc trang có sidebar/topbar; các trang **fullscreen** (login, mở ca) đặt **ngoài** group.
- **Web 2 URL pattern**: `/portal/{role}/{tenantSlug}/{branchSlug}/...` — `role` là `tenant-admin` (R2) hoặc `cashier` (R3).

## Design system (Tailwind v4)

Tất cả token khai báo trong `@theme` của `app/globals.css` — **không hardcode màu/radius/shadow**:

| Nhóm | Token |
|---|---|
| Màu chủ đạo | `primary` → `primary-50..900` (đỏ đô `#8e1b2f`) |
| Xám | `gray-50..900` (bảng gray Dasher) |
| Semantic | `success` (+100/700), `warning` (+100/700), `danger` (+100/700), `info` (+100/700), `secondary`, `light`, `dark` |
| Radius | `rounded` (0.5rem), `rounded-xl` (1rem — card), `rounded-lg` (0.75rem) |
| Shadow | `shadow-card` (0 12px 24px -4px rgba(145,158,171,.16)) |

Ví dụ: `bg-primary`, `text-primary-600`, `bg-success-100 text-success-700`, `rounded-xl border border-gray-300 shadow-card`.

## UI components (dùng chung)

- `Button` — `variant`: primary | white | ghost | dark | link | danger | success | outline; `size`: sm/md/lg; `block`.
- `Badge` — `tone`: primary/success/warning/danger/info/gray/dark; `dot`. Dùng `StatusBadge` để tự map trạng thái tiếng Việt (VD: "Hoạt động", "Bị khóa", "Đã thanh toán"...).
- `Card` / `CardHeader` / `CardTitle` / `CardBody`.
- `StatCard` — `title`, `value`, `icon`, `diff` (%), `tone`, `onClick`.
- `Table` — generic: `columns` (`key`, `header`, `render`), `data`, `rowKey`, `onRowClick`.
- `Modal` — `open`, `onClose`, `title`, `size` (sm/md/lg/xl), `footer`.
- `ConfirmDialog` — `tone` danger/primary/warning, `children` để thêm ô nhập lý do.
- `PageHeader` — `title`, `breadcrumb`, `actions`.
- `Form` — `Field` (label + required + hint) bọc `Input` / `Select` / `Textarea` / `Checkbox` / `Toggle`.
- `Charts` — `LineChart`, `DonutChart` (SVG thuần, màu mặc định `#8e1b2f`).

## Layout

- `DashboardShell` (client): Sidebar thu/mở (mặc định **thu nhỏ 72px**, bấm logo → mở rộng ~260px, nút mũi tên thu lại) + Topbar (thanh tìm kiếm, thông báo) + content.
- `NotificationPanel`: offcanvas thông báo phải (kiểu Dasher).
- Sidebar item tự nhận diện active theo pathname.

## Quy ước code

- Component có state/tương tác: thêm `"use client"` ở đầu file; trang/layout mặc định là server component.
- Icon: `@tabler/icons-react` (`import { IconX } from "@tabler/icons-react"`).
- Tiền tệ: `formatVND()` từ `@/lib/utils`; ghép class dùng `cn()`.
- Nội dung UI bằng **tiếng Việt** (theo spec 2 Web).
- Mock data import qua `@/mock-data/platform` và `@/mock-data/portal` (có alias `@` → project root, xem `tsconfig.json`).
