# AGENTS.md — F&B Management System

Tài liệu này mô tả toàn bộ ngữ cảnh dự án, quy ước code và hướng dẫn cho AI Agent khi làm việc trong repo này.

---

## 🏗️ Tổng quan Dự án

**Tên dự án**: Nền tảng SaaS Quản lý F&B Đa doanh nghiệp (Multi-tenant F&B Management System)  
**Mô tả**: Hệ thống phần mềm dạng dịch vụ (SaaS) cho phép nhiều thương hiệu/doanh nghiệp F&B thuê để vận hành chuỗi cửa hàng.
> ⚠️ **Lưu ý kiến trúc quan trọng**: Dự án **KHÔNG PHẢI** là ứng dụng viết riêng (bespoke) cho một doanh nghiệp cụ thể, mà là **nền tảng SaaS cho thuê đa khách hàng (Multi-tenant SaaS)**. "Highlands Coffee" chỉ là tenant mẫu / mock data để kiểm thử và trình diễn.

```
PTPMDV/
├── backend/        # NestJS + TypeScript — REST API (Multi-tenant core)
├── frontend/       # Next.js + Tailwind CSS — Web Admin Panel (Platform Admin & Tenant Portal)
├── mobile/         # Flutter + Dart — Ứng dụng Nhân sự & Vận hành dành cho các bên thuê SaaS
└── .agents/        # Cấu hình AI Agent cho dự án
```

---

## 📱 Mobile App (Flutter) — Thành phần chính đang phát triển

### Tech Stack
- **Framework**: Flutter 3.x
- **Language**: Dart
- **Architecture**: Feature-Driven (mỗi feature là 1 folder riêng)
- **Design**: Material 3 + custom theme (`AppColors`)

### Cấu trúc thư mục
```
mobile/lib/src/
├── core/
│   └── constants/app_colors.dart    # Màu sắc toàn app
├── features/
│   ├── auth/                        # Đăng nhập (nhân viên / quản trị)
│   ├── home/                        # Trang chủ nhân viên
│   ├── schedule/                    # Lịch làm việc (cá nhân + chung)
│   │   ├── schedule_screen.dart     # Lịch cá nhân (3 tuần, accordion theo ngày)
│   │   ├── shift_detail_screen.dart # Chi tiết ca làm việc (full page)
│   │   └── general_schedule_screen.dart # Lịch chung toàn chi nhánh
│   ├── salary/                      # Kỳ lương & chấm công
│   ├── operations/                  # Tác vụ (Quản lý)
│   ├── revenue/                     # Doanh thu & báo cáo
│   ├── notifications/               # Thông báo
│   └── profile/                     # Tài khoản người dùng
```

### Vai trò người dùng — Canonical Role Set (áp dụng cho cả BE/Web/Mobile)

Chỉ có **4 role chuẩn** dùng chung trên toàn hệ thống (backend cấp role lúc login, 2 app chỉ render theo role này — không tự suy role từ email):

| Canonical role | Mobile | Web 2 (Portal) | Web 1 (Platform) |
|---|---|---|---|
| `platform-admin` | — | — | Chủ sở hữu SaaS (`/platform-admin/*`) |
| `tenant-admin` | `admin` (Quản trị viên — `UserModel.isManager`) | R2 — Quản trị & Thu ngân | — |
| `cashier` | `staff` (Nhân viên thu ngân / ca làm) | R3 — Thu ngân | — |
| `staff` | `staff` | R3 — Thu ngân (alias của `cashier` theo từng miền) | — |

Quy ước:
- **Mobile** hiện dùng 2 role `staff` / `admin`; khi gọi API quy đổi: `admin → tenant-admin`, `staff → cashier/staff`.
- **Web Portal** dùng `tenant-admin` (R2) và `cashier` (R3).
- **`frontend/AGENTS.md` ghi "3 roles"** nhưng portal hiện chỉ implement 2 (R2/R3) — chuẩn mới là **4 canonical role** ở trên.

### Tài khoản test
- **Nhân viên**: `nhanvien@highlands.vn`
- **Quản trị**: `admin@highlands.vn`

---

## 🎨 Quy ước UI/UX

### Màu sắc
Luôn dùng `AppColors` thay vì hard-code màu:
```dart
import '../../../core/constants/app_colors.dart';

AppColors.primary       // Màu chủ đạo (đỏ Highlands)
AppColors.background    // Nền app
AppColors.textPrimary   // Chữ chính
AppColors.textSecondary // Chữ phụ
```

### Opacity / Alpha
**KHÔNG dùng** `.withOpacity()` (deprecated). Dùng `.withValues(alpha: ...)`:
```dart
// ❌ Sai
color: AppColors.primary.withOpacity(0.12)

// ✅ Đúng
color: AppColors.primary.withValues(alpha: 0.12)
```

### Layout tránh Overflow
Khi có `Row` chứa `Text` co giãn theo nội dung, bọc trong `Flexible` hoặc `Expanded`:
```dart
// ❌ Có thể tràn
Row(children: [Text(longString), Badge()])

// ✅ Không tràn
Row(children: [Flexible(child: Text(longString, overflow: TextOverflow.ellipsis)), Badge()])
```

### ListTile trong Container màu
**KHÔNG dùng** `ListTile` trực tiếp bên trong `DecoratedBox` / `Container` có màu không phải trắng/trong suốt (gây Material 3 assertion). Dùng `Padding` + `Row` thay thế:
```dart
// ✅ An toàn
Padding(
  padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
  child: Row(
    children: [Icon(...), SizedBox(width: 12), Expanded(child: Text(...))],
  ),
)
```

---

## 🗓️ Lịch làm việc — Quy ước

### Schedule Screen (Lịch cá nhân)
- Cho phép duyệt **không giới hạn các tuần trước và sau** (điều hướng linh hoạt qua lại các tuần)
- Accordion theo từng ngày (T2 → CN)
- Bấm vào ca → điều hướng đến `ShiftDetailScreen` (full page, có nút back)
- **Không** hiển thị tổng số giờ / tổng số ca

### General Schedule Screen (Lịch chung chi nhánh)
- Top: 7 ngày trong tuần (picker ngang)
- List ca làm trong ngày được chọn
- Mỗi ca có accordion xổ xuống → danh sách nhân viên trong ca đó
- Trạng thái ca: Sắp diễn ra / Đang diễn ra / Đã hoàn thành

### Shift Detail Screen
- Full page với AppBar + nút back
- Thông tin ca: tên, khung giờ, đồng phục, giám sát, chi nhánh
- Check-in / Check-out timestamps
- 3 hành động: **Nhờ làm thay**, **Đổi ca**, **Xin nghỉ**

---

## 💰 Kỳ lương — Quy ước

Chi tiết các khoản thu nhập gồm đúng 6 dòng sau (không thêm, không bớt):
1. Số giờ làm việc được phân công
2. Số ca làm việc được phân công
3. Số giờ làm việc tính lương
4. Số ca làm việc tính lương
5. Số lần đi muộn
6. Khấu trừ

---

## 👤 Tài khoản (Profile Screen)

Danh sách tác vụ chỉ gồm:
- **Đổi tài khoản đăng nhập** → về `LoginScreen`
- **Đăng xuất** → về `LoginScreen`

Không có "Lịch làm việc của tôi" hay "Phiếu lương & Thu nhập" trong profile.

---

## ⚙️ Tác vụ (Operations Screen)

Dành cho vai trò manager/admin. Các mục bao gồm:
- **Lịch làm việc chung** → `GeneralScheduleScreen`
- Kỳ lương & Chấm công → `SalaryScreen`
- Báo cáo doanh thu → `RevenueScreen`

AppBar **không có** nút back và **không có** nút "Trang chủ".

---

## 🧩 SOA & Contract dùng chung giữa 3 bề mặt (CHUẨN — các app chỉnh theo mục này)

> Đây là **contract xuyên-app dành cho Backend**. Frontend Web & Mobile đều là **thin client**:
> chúng đọc CÙNG một domain qua CÙNG một REST API và **không bao giờ hardcode dữ liệu nghiệp vụ**
> (menu, ca, chi nhánh, lương, ngân hàng) mà các bề mặt khác phụ thuộc.
> Backend là **1 NestJS API duy nhất** phục vụ cả 3 bề mặt.

### ⚠️ Mobile cũng là SaaS multi-tenant giống Web — KHÔNG phải app single-tenant Highlands
**Nguyên tắc quan trọng**: toàn bộ project (Web1, Web2, **Mobile**) là **1 SaaS multi-tenant**.
Mobile KHÔNG phải app build riêng cho 1 doanh nghiệp cố định (Highlands) — các tenant của SaaS đều phục vụ Mobile.

- Mobile là **thin client multi-tenant** của cùng BE: nhân viên đăng nhập vào 1 tenant (JWT mang `tenantId`), rồi mới được filter theo branch của tenant đó.
- **Mobile không có `tenantSlug` trong URL** (không có route kiểu `/portal/...`) — thay vào đó mobile **lấy tenant từ session/JWT** và tự-scope toàn bộ dữ liệu theo tenant.
- Mọi dữ liệu nghiệp vụ (brand, menu, chi nhánh, ngân hàng, lương) phải đọc từ API **theo tenant** — **KHÔNG bao giờ hardcode 1 tenant** (Highlands) trong mobile.
- **Kết luận**: "Mobile = app doanh nghiệp đơn lẻ" là SAI. Mobile là **SaaS multi-tenant giống Web**.

### 3 bề mặt — SAAS multi-tenant (mobile cũng vậy)
- **Web 1 — Platform Admin** (`/platform-admin/*`, role `platform-admin`): tenants, gói cước, webhooks, báo cáo/sự cố, audit log. Scope: toàn bộ nền tảng.
- **Web 2 — Restaurant Portal** (`/portal/{role}/{tenantSlug}/{branchSlug}/*`): Thu ngân + Quản trị theo tenant + branch (menu, kho, ca, HR, bank, wifi). Scope: `tenantSlug`+`branchSlug` trong URL.
- **Mobile App** (`mobile/*`, role `staff`/`admin`): chấm công, lịch cá nhân + lịch chung, lương, đổi ca, revenue (admin). Scope: **JWT `tenantId`** — mobile không có `tenantSlug` ở URL; tự filter theo tenant + branch của nhân viên.

Đây **cố ý KHÔNG phải 2 app y hệt nhau** (ví dụ FB Web vs FB Mobile) — Web tối ưu quản trị màn hình lớn, Mobile tối ưu hành động nhanh. **UX khác nhau là được, nhưng DOMAIN dùng chung & scoped theo tenant.**

### 🔒 Canonical entities — các điểm phải thống nhất (chốt TRƯỚC khi/trong khi xây BE)
| # | Entity | Hiện đang lệch thế nào | Chuẩn thống nhất |
|---|---|---|---|
| 1 | **Menu item** | Web `management/menu` (loại `Món ăn/Món nước`) vs Mobile `menu_availability_screen.dart` (catalog hardcode + `IconData`/màu) | **1 catalog `menu` chung**; Mobile chỉ map `category` → icon/màu, KHÔNG đưa icon vào domain model |
| 2 | **ShiftTemplate (khung ca)** | Web `Ca Sáng 07:00-14:00 / Ca Chiều 14:00-22:00 / Ca Tối 18:00-23:00` vs Mobile `general_schedule` `07:00-12:00 / 12:00-17:00` | **1 entity `ShiftTemplate` chung**; lịch cá nhân/chung + phân công đọc chung khung giờ này |
| 3 | **Branch định danh** | Mobile `id='01'..'03'` (`Highlands Coffee 01..03`) vs Web `branchSlug='hn-1'` (`HN-1/HN-2/ĐN-1`) | BE trả `Branch {id, slug, code, name, address, ...}`; Mobile dùng `id`, Web dùng `slug` |
| 4 | **Role (RBAC)** | Mobile `staff/admin` vs Web `tenant-admin/cashier` vs literal "3 roles" ở trên | **Canonical** `platform-admin / tenant-admin / cashier / staff` (xem bảng ở mục Vai trò) |
| 5 | **Payroll engine & Payslip** | Mobile `salary_screen` 6 dòng (giờ/ca phân công, giờ/ca tính lương, đi muộn, khấu trừ) vs Web payslip `số công ngày + lương cơ bản + bonus − penalty` (+ config phạt trễ/về sớm, grace) | **1 payroll DTO chung** (6 dòng) tính trong BE; Web đặt bonus/penalty/reason/status qua `PATCH` |
| 6 | **ShiftSession ("mở ca/kết ca")** | Web gate toàn bộ POS sau `isShiftOpen(branchSlug)` | Backend có `ShiftSession` (open/close) để tính doanh thu/đối soát/kết ca |
| 8 | **Notification** | Mobile payload giàu (cover/swap: senderName, shift..., reason, requestStatus) vs Web `NotificationPanel` chỉ title/content/time/tone | **1 service `notifications`** với `type` phân biệt (`shift_request | system | report`) — Web cũng render/action được |
| 9 | **Report (portal→platform)** | Web `report`/`report-center` gửi, Web 1 `reports` nhận | 1 DTO `Report` chung (`reporter`, `priority`, `status`) dùng giữa Web/BE |
| 10 | **Tenant brand** | Mobile "Highlands Coffee", Web "ABC Restaurant" | Lấy từ `Tenant/TenantBrand` — cả 2 bề mặt hiển thị cùng brand |

### 💡 REST API (map module backend → miền dùng chung)
```
auth        POST /auth/login | POST /auth/logout | GET /auth/me        # trả 4 canonical role
tenant      GET/POST/PUT /tenants ; GET /subscriptions ; GET /audit-logs   # Web 1
branch      GET/POST/PUT /branches ; GET /branches/{id}                # id + slug
menu        GET /menu ; GET/POST/PUT/DELETE /menu/{id} ; GET/POST /menu/categories ; PATCH /menu/{id}/status
order       GET /tables ; POST /orders ; PATCH /orders/{id}
shift       POST /shifts/open ; GET /shifts/current ; PATCH /shifts/{id}/close ; GET/POST/PUT/DELETE /shift-templates
schedule    GET /schedules?staff= ; GET /schedules/branch?branch&week ; POST /shift-assignments
shiftreq    POST /shift-requests (cover|swap|leave) ; PATCH /shift-requests/{id} ; sinh notification
attendance  POST /attendance/checkin|checkout ; GET /attendance?month&staff
salary      GET /salary/me?month (6 dòng) ; GET /salary?branch&month ; PATCH /payslips/{id} (bonus/penalty/reason/status)
revenue     GET /revenue/shift?branch&date ; dashboard stats & charts
report      GET/POST /reports ; export pdf/excel
loyalty     GET/POST /members ; PATCH /members/{id}/points ; GET /vouchers
stock       GET /inventory ; GET/POST /stock-receipts
config      GET/POST /banks ; GET/POST /wifi-configs
notify      GET /notifications ; POST /notifications/{id}/read ; DELETE
```

### Thống nhất ID & định dạng
- **ID trong DB**: UUID; các code hiển thị (VD `ORD-20260817-0001`) tạo human-readable cho người dùng.
- **Trạng thái (status)** dùng chung một bộ enum nhất quán giữa 3 bề mặt, ví dụ ca: `Sắp diễn ra / Đang diễn ra / Đã hoàn thành`; thanh toán: `Tiền mặt / VietQR`.
- Ngôn ngữ hiển thị UI: **Tiếng Việt** (đã ghi ở Quy tắc chung).

## 🔧 Lệnh thường dùng

```bash
# Kiểm tra lỗi Dart
cd mobile && flutter analyze

# Chạy app trên iPhone simulator
cd mobile/ios && flutter run -d iphone

# Hot reload (trong terminal đang chạy flutter run)
r     # Hot reload
R     # Hot restart
```

---

## 📋 Quy tắc chung cho Agent

1. **Luôn chạy `flutter analyze`** sau khi sửa file `.dart` để kiểm tra lỗi.
2. **Dùng `withValues(alpha:)`** thay vì `withOpacity()`.
3. **Dùng `Flexible` / `Expanded`** trong `Row` chứa text dài để tránh overflow.
4. **Không tạo ListTile** bên trong `Container` có màu nền — dùng `Padding + Row` thay thế.
5. Khi sửa một screen, **không làm thay đổi logic / UI các screen khác** trừ khi được yêu cầu.
6. Ngôn ngữ hiển thị trong app: **Tiếng Việt**.
7. **Kiến trúc Multi-tenant SaaS**: Code và UI phải luôn giữ tính trung tính đa doanh nghiệp; khi tạo mock data, dùng dữ liệu mẫu thương hiệu F&B (VD: Highlands Coffee làm tenant thử nghiệm), tuyệt đối không hardcode logic gắn chặt vào một thương hiệu duy nhất.
