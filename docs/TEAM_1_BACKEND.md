# Team 1 — Backend Services (4 thành viên)

> **Dự án:** HRM Enterprise — On-Premises SOA  
> **Repo:** `QLDAPM` · **Nhánh làm việc:** `dev`  
> **Port backend:** `4000` · **Tech stack:** Node.js · Express · REST · SOAP  

---

## Phạm vi trách nhiệm

Team 1 phụ trách toàn bộ **core infrastructure** của backend và các **nghiệp vụ nhân sự** (catalog, xác thực, chấm công, tác vụ).

---

## Phân công theo thành viên

| # | Thành viên | Module | Mô tả |
|---|-----------|--------|-------|
| 1 | TV1 | Infrastructure & Auth | Cấu trúc project, middleware, xác thực session |
| 2 | TV2 | Catalog (Chi nhánh + Phòng ban) | CRUD branches, departments |
| 3 | TV3 | Nhân sự (Employees) | CRUD nhân viên, phân quyền |
| 4 | TV4 | Chấm công & Tác vụ | Shifts, check-in/out, tasks |

---

## Module chi tiết

### Module 1 — Infrastructure & Auth (TV1)

#### Cấu trúc thư mục (theo AGENTS.md)

```
backend/src/
├── index.js          ← Entry: mount routes, error handler, listen khi require.main
├── data/store.js     ← In-memory store: branches, users, bankAccounts, payouts
├── routes/health.js  ← GET /health
└── middleware/
    ├── auth.js       ← Kiểm tra header Authorization / cookie hrm-session
    └── errorHandler.js
```

#### API cần implement

| Method | Endpoint | Mô tả |
|--------|---------|-------|
| GET | `/health` | Trạng thái server |
| POST | `/api/auth/login` | Đăng nhập, trả về token/session |
| POST | `/api/auth/logout` | Hủy session |
| GET | `/api/auth/me` | Thông tin user hiện tại |

#### Yêu cầu kỹ thuật
- `require.main === module` mới gọi `app.listen()`, export `app` để test.
- Middleware `auth.js` đọc cookie `hrm-session` và gắn `req.user`.
- Data `store.js` export singleton: `{ branches, users, bankAccounts, payouts }`.
- Seed 3 tài khoản mẫu (admin/manager/staff) khớp với `frontend/src/mock-data/portal.ts`.

---

### Module 2 — Catalog: Chi nhánh & Phòng ban (TV2)

#### File cần tạo

```
backend/src/routes/catalog.js
```

#### API cần implement

| Method | Endpoint | Mô tả |
|--------|---------|-------|
| GET | `/api/branches` | Danh sách chi nhánh |
| GET | `/api/branches/:slug` | Chi tiết chi nhánh theo slug |
| POST | `/api/branches` | Thêm chi nhánh (admin) |
| PUT | `/api/branches/:slug` | Cập nhật chi nhánh |
| DELETE | `/api/branches/:slug` | Xóa chi nhánh |
| GET | `/api/departments` | Danh sách phòng ban |
| POST | `/api/departments` | Thêm phòng ban |

#### Dữ liệu mẫu (store.js)
```js
// branches (đã có 3 bản ghi — giữ nguyên, không đổi id/slug)
{ id: "01", slug: "hn-1", code: "HN-1", name: "Chi nhánh Hoàn Kiếm", address: "..." }
{ id: "02", slug: "hn-2", code: "HN-2", name: "Chi nhánh Cầu Giấy", address: "..." }
{ id: "03", slug: "dn-1", code: "DN-1", name: "Chi nhánh Đà Nẵng", address: "..." }

// departments (thêm mới)
{ id: "d-01", name: "Kế toán", branchSlug: "hn-1" }
{ id: "d-02", name: "Kỹ thuật", branchSlug: "hn-1" }
{ id: "d-03", name: "Kinh doanh", branchSlug: "hn-2" }
```

---

### Module 3 — Nhân sự: Employees (TV3)

#### File cần tạo

```
backend/src/routes/employees.js
```

#### API cần implement

| Method | Endpoint | Mô tả |
|--------|---------|-------|
| GET | `/api/employees` | Danh sách (filter: `?branchSlug=`) |
| GET | `/api/employees/:id` | Chi tiết nhân viên |
| POST | `/api/employees` | Thêm nhân viên mới |
| PUT | `/api/employees/:id` | Cập nhật thông tin |
| DELETE | `/api/employees/:id` | Xóa nhân viên |

#### Schema nhân viên (đồng bộ Mobile + Web)
```js
{
  id: "e-xxx",
  name: String,
  email: String,
  phone: String,
  cccd: String,           // Số CCCD
  address: String,
  role: "admin" | "manager" | "staff",
  roleTitle: String,
  branchSlug: String,
  departmentId: String,
  baseSalary: Number,     // Lương cơ bản (VND)
  bankName: String,
  bankAccount: String,
  startDate: String,      // ISO date
  status: "active" | "inactive"
}
```

#### Yêu cầu
- `GET /api/employees` trả `{ data: [...] }`.
- `POST/PUT` validate: email không trùng, role nằm trong enum.
- Phân quyền: staff chỉ xem chính mình, manager xem branch, admin xem tất cả.

---

### Module 4 — Chấm công & Tác vụ (TV4)

#### File cần tạo

```
backend/src/routes/attendance.js
backend/src/routes/tasks.js
```

#### API Chấm công

| Method | Endpoint | Mô tả |
|--------|---------|-------|
| GET | `/api/attendance` | Lịch sử (`?employeeId=&month=YYYY-MM`) |
| POST | `/api/attendance/checkin` | Ghi nhận check-in |
| POST | `/api/attendance/checkout` | Ghi nhận check-out, tính tiền phạt |
| GET | `/api/shifts` | Danh sách ca làm việc |
| POST | `/api/shifts` | Tạo ca mới |

#### Schema bản ghi chấm công
```js
{
  id: "att-xxx",
  employeeId: String,
  shiftId: String,
  date: String,           // "YYYY-MM-DD"
  checkIn: String,        // ISO datetime
  checkOut: String,       // ISO datetime | null
  penaltyAmount: Number,  // Tiền phạt nếu vi phạm (mặc định 0)
  penaltyNote: String,    // Lý do phạt
  status: "present" | "absent" | "late" | "early_leave"
}
```

#### API Tác vụ

| Method | Endpoint | Mô tả |
|--------|---------|-------|
| GET | `/api/tasks` | Danh sách (`?assignedTo=&status=`) |
| POST | `/api/tasks` | Tạo tác vụ mới |
| PUT | `/api/tasks/:id` | Cập nhật trạng thái |
| DELETE | `/api/tasks/:id` | Xóa tác vụ |

#### Schema tác vụ
```js
{
  id: "task-xxx",
  title: String,
  description: String,
  assignedTo: String,     // employeeId
  assignedBy: String,     // employeeId
  branchSlug: String,
  dueDate: String,        // ISO date
  status: "pending" | "in_progress" | "done" | "cancelled",
  createdAt: String
}
```

---

## Quy trình làm việc

1. **Tạo nhánh feature**: `git checkout -b feature/<module>-<tên>` từ `dev`.
2. **Không commit trực tiếp vào `dev`** — tạo PR để merge.
3. **Kiểm tra trước khi PR**:
   - `node src/index.js` chạy OK, `GET /health` trả `{"status":"ok"}`.
   - Không có `console.error` không xử lý.
4. **Dữ liệu đồng bộ**: mọi thay đổi schema user phải cập nhật `frontend/src/mock-data/portal.ts` và mobile mock users.

---

## Checklist hoàn thành

- [ ] `GET /health` → `{ status: "ok" }`
- [ ] Auth middleware hoạt động
- [ ] CRUD branches + departments
- [ ] CRUD employees (đủ schema)
- [ ] Check-in / Check-out với tính tiền phạt
- [ ] CRUD tasks
- [ ] Tất cả route mount trong `index.js`
