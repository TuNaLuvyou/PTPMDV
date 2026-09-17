# HRM Enterprise — Hệ thống Quản trị Nhân sự & Vận hành Ca kíp (On-Premises SOA)

Hệ thống Quản trị Nhân sự, Phân ca làm việc, Chấm công Wi-Fi & Tính lương nội bộ cho doanh nghiệp chuỗi, được thiết kế theo kiến trúc **On-Premises SOA** kết hợp giữa **Web Portal Quản trị (Next.js 16 App Router)** và **Ứng dụng Di động Nhân viên & Quản lý (Flutter 3.x)**.

---

## 🔑 Danh sách Tài khoản Mock Đăng nhập (Test Accounts)

Hệ thống đã thiết lập sẵn 3 tài khoản mẫu chuẩn đại diện cho 3 cấp phân quyền. Sử dụng thông tin này để đăng nhập vào cả Web Portal và Mobile App:

| Cấp vai trò | Họ và tên | Email đăng nhập | Mật khẩu | Chi nhánh mặc định | Phạm vi quyền hạn & Nơi sử dụng |
|---|---|---|---|---|---|
| **Quản trị viên (Admin)** | Trần Minh Tuấn | `admin@company.com` | `123456` | HN-1 (Hoàn Kiếm) | **Web & Mobile**: Toàn quyền toàn công ty (tất cả chi nhánh, quản trị nhân sự, bảng lương, phân ca, cấu hình Wi-Fi). |
| **Quản lý Chi nhánh (Manager)** | Vũ Thành Công | `manager@company.com` | `123456` | HN-1 (Hoàn Kiếm) | **Web & Mobile**: Quản lý vận hành chi nhánh (xếp ca, duyệt yêu cầu đổi ca/nghỉ phép, giám sát nhân sự, theo dõi bảng công chi nhánh). |
| **Nhân viên (Staff)** | Nguyễn Thu Hà | `nhanvien@company.com` | `123456` | HN-1 (Hoàn Kiếm) | **Mobile App**: Tác vụ nhân viên (xem ca làm cá nhân, đăng ký ca tuần tới, tạo đơn nghỉ phép/đổi ca, chấm công Wi-Fi, xem phiếu lương). |

> **Lưu ý**:
> - Cổng thông tin **Web** dành riêng cho cấp quản trị (**Admin** và **Manager**).
> - Ứng dụng **Mobile** hỗ trợ toàn bộ cả 3 vai trò (**Admin**, **Manager**, và **Nhân viên**).

### 🏢 Danh sách Chi nhánh Doanh nghiệp

- **HN-1** (Mã: `01`): Chi nhánh Hoàn Kiếm — 12 Tràng Thi, Hoàn Kiếm, Hà Nội
- **HN-2** (Mã: `02`): Chi nhánh Cầu Giấy — 88 Cầu Giấy, Q. Cầu Giấy, Hà Nội
- **DN-1** (Mã: `03`): Chi nhánh Đà Nẵng — 120 Nguyễn Văn Linh, Q. Hải Châu, Đà Nẵng

---

## 📁 Cấu trúc Dự án

```text
QLDAPM/
├── README.md                 # Tài liệu hướng dẫn & danh sách tài khoản tổng hợp
├── frontend/                 # Web Portal Quản trị (Next.js 16 App Router + Tailwind CSS v4)
│   ├── src/
│   │   ├── app/              # Route Groups: (auth)/login, (dashboard)/dashboard/...
│   │   ├── components/       # UI Primitives & Dashboard Layout Shell
│   │   ├── context/          # AuthContext, TopbarContext
│   │   ├── features/         # Feature modules: branches, employees, shifts, wifi, tasks, payslips, bank...
│   │   ├── mock-data/        # Mock data trung tâm chuẩn doanh nghiệp
│   │   └── types/            # TypeScript type definitions
│   └── package.json
│
├── mobile/                   # Ứng dụng Di động Nhân viên & Quản lý (Flutter 3.x)
│   ├── android/              # Cấu hình native Android
│   ├── ios/                  # Cấu hình native iOS
│   ├── lib/
│   │   ├── main.dart         # Entry point ứng dụng
│   │   └── src/
│   │       ├── app.dart      # Root HRMApp, theme & global scopes
│   │       ├── core/         # Config, theme, models (user, branch), scopes, router
│   │       └── features/     # Feature-driven modules:
│   │           ├── auth/     # Đăng nhập & khởi động
│   │           ├── home/     # Trang chủ chấm công, ca hôm nay
│   │           ├── schedule/ # Lịch làm cá nhân, xin nghỉ, nhờ làm thay
│   │           ├── general_schedule/ # Lịch làm chung chi nhánh
│   │           ├── operations/ # Danh mục tác vụ: giám sát, đổi ca, duyệt đơn, Wi-Fi, SOAP Ngân hàng
│   │           ├── tasks/    # Giao việc & nhiệm vụ theo ca
│   │           ├── salary/   # Bảng lương & phiếu lương
│   │           ├── notifications/ # Thông báo hệ thống
│   │           └── profile/  # Hồ sơ cá nhân, đổi mật khẩu
│   ├── test/                 # Widget tests
│   └── pubspec.yaml
│
└── AGENTS.md                 # Quy ước phân quyền, kiến trúc On-Premises SOA & hướng dẫn Agent
```

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### 1. Web Portal (Frontend)

**Yêu cầu môi trường**: Node.js 18+ và npm

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt thư viện dependencies
npm install

# Khởi chạy server phát triển
npm run dev

# Kiểm tra build sản phẩm (Next.js production build)
npm run build
```

- **Địa chỉ truy cập**: [http://localhost:3000](http://localhost:3000)
- Trình duyệt sẽ tự động chuyển hướng tới `/login`. Đăng nhập bằng tài khoản `admin@company.com` hoặc `manager@company.com` (mật khẩu: `123456`).

---

### 2. Ứng dụng Di động (Mobile App)

**Yêu cầu môi trường**: Flutter SDK 3.x, iOS Simulator (Xcode trên macOS) hoặc Android Emulator

```bash
# Di chuyển vào thư mục mobile
cd mobile

# Cài đặt dependencies
flutter pub get

# Kiểm tra phân tích mã nguồn
flutter analyze

# Chạy kiểm thử tự động
flutter test

# Khởi chạy trên máy ảo iPhone (ví dụ: iPhone 15 Pro Max)
flutter run -d "iPhone 15 Pro Max"

# Hoặc khởi chạy trực tiếp trên macOS Desktop
flutter run -d macos
```

- Nhập email và mật khẩu tương ứng của Admin, Manager hoặc Nhân viên để đăng nhập và trải nghiệm các tính năng theo phân quyền.
