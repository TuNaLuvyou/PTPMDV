# AGENTS.md — HRM Enterprise System (On-Premises SOA)

Tài liệu này mô tả toàn bộ kiến trúc, quy ước code, cấu trúc thư mục và hướng dẫn vận hành cho AI Agent và nhà phát triển khi làm việc trong repository này.

---

## 🏗️ 1. Tổng quan Kiến trúc Hệ thống

- **Tên dự án**: Hệ thống Quản trị Nhân sự & Vận hành Ca kíp Chuỗi (HRM Enterprise System)
- **Mô hình triển khai**: **On-Premises SOA (Kiến trúc Hướng dịch vụ Cài đặt Nội bộ)**
  - Doanh nghiệp sở hữu bản quyền phần mềm và triển khai trực tiếp trên hạ tầng Server nội bộ.
  - **Single-tenant độc lập**: Không phải nền tảng SaaS multi-tenant cho thuê, không dùng `tenantSlug`, `tenantId`, hay trung gian Platform Admin.
  - **Tích hợp Ngân hàng trực tiếp**: Ngân hàng (VietinBank, Vietcombank, ...) gọi **SOAP API trực tiếp** đến Server doanh nghiệp qua giao thức HTTPS bảo mật (`/soap/payroll` WSDL interface).
- **Màu sắc & Nhận diện Thương hiệu**:
  - Màu chủ đạo: **Đỏ đô `#8E1B2F`** (`AppColors.primary` trên mobile, `bg-primary` / text-primary trên web).
  - Typography: **Public Sans** (Web) và hệ font chuẩn Material 3 (Mobile).
  - Ngôn ngữ: Toàn bộ giao diện người dùng sử dụng **tiếng Việt**.

---

## 📁 2. Cấu trúc Thư mục Toàn dự án

```text
QLDAPM/
├── README.md                 # Tài liệu tổng quan & thông tin tài khoản dùng thử
├── AGENTS.md                 # Hướng dẫn chi tiết cho AI Agent và quy ước phát triển
├── agents/                   # Thư mục lưu trữ tài liệu quy chuẩn Agent
│   └── AGENTS.md
├── frontend/                 # Web Portal Quản trị (Next.js 16 App Router + Tailwind CSS v4)
│   ├── src/
│   │   ├── app/              # Route Groups: (auth) & (dashboard)
│   │   │   ├── (auth)/login/ # Màn hình đăng nhập quản trị
│   │   │   └── (dashboard)/dashboard/ # Các phân hệ quản trị
│   │   ├── components/       # UI Primitives & Dashboard Layout Shell
│   │   ├── context/          # AuthContext, TopbarContext
│   │   ├── features/         # Module nghiệp vụ HR chuyên sâu
│   │   ├── mock-data/        # Dữ liệu mẫu portal.ts
│   │   ├── types/            # TypeScript type definitions
│   │   └── middleware.ts     # Route protection & cookie-based auth
│   ├── tsconfig.json         # Path alias: "@/*": ["./src/*"]
│   └── package.json
│
└── mobile/                   # Ứng dụng Di động Nhân viên & Quản lý (Flutter 3.x)
    ├── android/              # Native Android config
    ├── ios/                  # Native iOS config
    ├── lib/
    │   ├── main.dart         # Entry point
    │   └── src/
    │       ├── app.dart      # Root HRMApp, theme & scopes
    │       ├── core/         # Config, theme, models, scopes, router
    │       └── features/     # Feature-driven modules (auth, home, schedule, operations, tasks, salary...)
    ├── test/                 # Widget tests
    └── pubspec.yaml
```

---

## 🔑 3. Hệ thống Phân quyền (RBAC) & Tài khoản Thử nghiệm

Hệ thống phân quyền chuẩn gồm **3 cấp vai trò**:

| Cấp vai trò | Họ và tên | Email đăng nhập | Mật khẩu | Chi nhánh mặc định | Phạm vi quyền hạn | Nền tảng |
|---|---|---|---|---|---|---|
| **Quản trị viên (Admin)** | Trần Minh Tuấn | `admin@company.com` | `123456` | HN-1 (Hoàn Kiếm) | Toàn quyền toàn công ty: tất cả chi nhánh, quản trị nhân sự, phân ca, bảng lương, cấu hình Wi-Fi, chi nhánh. | Web & Mobile |
| **Quản lý Chi nhánh (Manager)** | Vũ Thành Công | `manager@company.com` | `123456` | HN-1 (Hoàn Kiếm) | Vận hành chi nhánh phụ trách: xếp ca, phê duyệt yêu cầu đổi ca/nghỉ phép, giám sát nhân sự trực ca, bảng công. | Web & Mobile |
| **Nhân viên (Staff)** | Nguyễn Thu Hà | `nhanvien@company.com` | `123456` | HN-1 (Hoàn Kiếm) | Tác vụ cá nhân: xem ca làm, đăng ký ca tuần tới, chấm công Wi-Fi, xin nghỉ/đổi ca, xem phiếu lương. | Mobile |

### Danh sách Chi nhánh
- **HN-1** (Mã: `01`): Chi nhánh Hoàn Kiếm — 12 Tràng Thi, Q. Hoàn Kiếm, Hà Nội
- **HN-2** (Mã: `02`): Chi nhánh Cầu Giấy — 88 Cầu Giấy, Q. Cầu Giấy, Hà Nội
- **DN-1** (Mã: `03`): Chi nhánh Đà Nẵng — 120 Nguyễn Văn Linh, Q. Hải Châu, Đà Nẵng

---

## 💻 4. Web Frontend (Next.js 16)

### Tech Stack
- **Framework**: Next.js 16.3+ (App Router) trong thư mục `src/`
- **Thư viện UI**: React 19, Tailwind CSS v4 (`@theme` token), Tabler Icons (`@tabler/icons-react`) & Font Awesome
- **Cấu hình Import**: Path alias `@/*` ánh xạ tới `./src/*`

### Cấu trúc Route
```text
/                          → Tự động chuyển hướng về /login
/login                     → Giao diện đăng nhập quản trị (Admin / Manager)
/dashboard                 → Tổng quan Dashboard quản trị
/dashboard/employees       → Quản lý danh sách & hồ sơ nhân sự
/dashboard/shifts          → Phân ca, lịch làm việc tổng hợp & đăng ký ca
/dashboard/payslips        → Bảng lương, chốt công & điều chỉnh thưởng/phạt
/dashboard/requests        → Phê duyệt yêu cầu (đổi ca, nghỉ phép, tạm ứng lương)
/dashboard/tasks           → Giao việc theo ca & quản lý nhiệm vụ
/dashboard/news            → Bảng tin & thông báo nội bộ
/dashboard/regulations     → Quy chế & nội quy lao động
/dashboard/wifi            → Danh sách Wi-Fi chấm công theo chi nhánh
/dashboard/branches        → Quản lý thông tin & địa chỉ các chi nhánh
```

### Cơ chế Xác thực & Quản lý Phiên
- Sử dụng `AuthContext` quản lý người dùng hiện tại (`useCurrentUser()`).
- Lưu trữ session trong `localStorage` và cookie `hrm-session`.
- File `src/middleware.ts` tự động bảo vệ tất cả route `/dashboard/*`.
- Giao diện đăng nhập tinh gọn: nhập Email & Mật khẩu trực tiếp, căn giữa màn hình, không chứa nút bấm chọn vai trò demo.
- Không chứa các banner/callout note hướng dẫn dư thừa trên màn hình và modal.

---

## 📱 5. Mobile Application (Flutter)

### Tech Stack
- **Framework**: Flutter 3.x (Dart 3.x)
- **Kiến trúc**: Feature-Driven Architecture
- **Routing**: `go_router` (`core/router/app_router.dart`)
- **Theme**: Material 3, `AppColors.primary` (`#8E1B2F`)

### Cấu trúc Modules (`mobile/lib/src/features/`)
- `auth`: Đăng nhập sạch sẽ căn giữa, Splash screen kiểm tra phiên
- `home`: Check-in / Check-out Wi-Fi, hiển thị ca hôm nay, tác vụ nhanh
- `schedule`: Xem ca cá nhân, điều hướng đổi ca / xin nghỉ
- `general_schedule`: Xem lịch tổng thể nhân sự chi nhánh theo ngày/tuần
- `operations`: Danh mục tiện ích vận hành (chấm công, giám sát, duyệt ca, Wi-Fi...)
- `approvals`: Màn hình duyệt đơn đề xuất đổi ca / nghỉ phép cho Quản lý
- `staff_monitor`: Giám sát quân số trực ca thời gian thực
- `wifi_config`: Cấu hình SSID / BSSID Wi-Fi chi nhánh (Admin / Manager)
- `tasks`: Danh sách nhiệm vụ ca, check hoàn thành kèm chụp ảnh minh chứng
- `salary`: Bảng lương chi tiết, nhật ký công ca
- `salary_advance`: Đơn xin tạm ứng lương
- `attendance`: Đơn giải trình / bổ sung chấm công
- `leave_request`: Đơn xin nghỉ phép
- `news` & `regulations`: Bảng tin và quy chế công ty
- `schedule_registration`: Đăng ký nguyện vọng ca làm tuần tới
- `shift_assignment`: Phân ca nhanh cho nhân viên
- `notifications`: Trung tâm thông báo và chi tiết yêu cầu đổi ca
- `profile`: Hồ sơ cá nhân, đổi mật khẩu, thiết bị đăng nhập, bảo mật

---

## 🎨 6. Quy tắc & Tiêu chuẩn Lập trình (Agent Best Practices)

1. **Tuân thủ chuẩn On-Premises SOA**: Tuyệt đối không thêm trường `tenantId`, `tenantSlug` vào code, schema hay URL.
2. **Flutter Rules**:
   - Tuyệt đối **KHÔNG dùng** `.withOpacity(...)` (deprecated), luôn dùng `.withValues(alpha: ...)`.
   - Sử dụng `AppColors.primary` thay cho hardcode mã màu.
   - Luôn kiểm tra `flutter analyze` để đảm bảo 0 cảnh báo/lỗi trước khi hoàn thành task.
3. **Next.js Rules**:
   - Toàn bộ code ứng dụng đặt trong `frontend/src/`.
   - Khai báo `"use client"` cho các components có state/interactivity.
   - Luôn kiểm tra `npm run build` để đảm bảo typecheck và build hoàn hảo.
4. **Trải nghiệm Người dùng (UX)**:
   - Giữ giao diện chuyên nghiệp, gọn gàng, không đưa các banner ghi chú hướng dẫn sử dụng hiển nhiên vào giao diện doanh nghiệp.
   - Dữ liệu người dùng nhập (như form ghi chú, lý do) luôn được bảo toàn trọn vẹn.
