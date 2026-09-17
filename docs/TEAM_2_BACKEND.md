# Team 2 — Backend Services (3 thành viên)

> **Dự án:** HRM Enterprise — On-Premises SOA  
> **Repo:** `PTPMDV` · **Nhánh làm việc:** `dev`  
> **Port backend:** `4000` · **Tech stack:** Node.js · Express · REST · SOAP  

---

## Phạm vi trách nhiệm

Team 2 phụ trách **nghiệp vụ tài chính & vận hành**: lương, chi lương qua cổng SOAP ngân hàng, phiếu lương, và quản lý yêu cầu nội bộ.

---

## Phân công theo thành viên

| # | Thành viên | Module | Mô tả |
|---|-----------|--------|-------|
| 1 | TV1 | Payroll (Lương + Phiếu lương) | Tính lương, phiếu lương tháng |
| 2 | TV2 | SOAP Gateway (Chi lương NH) | Cổng SOAP tích hợp ngân hàng |
| 3 | TV3 | Yêu cầu nội bộ & Thông báo | Requests, notifications |

---

## Module chi tiết

### Module 1 — Payroll: Lương & Phiếu lương (TV1)

#### File cần tạo

```
backend/src/routes/payroll.js
```

#### API cần implement

| Method | Endpoint | Mô tả |
|--------|---------|-------|
| GET | `/api/payroll/bank-accounts` | Danh sách tài khoản trích nợ |
| GET | `/api/payroll/payouts` | Lịch sử lệnh chi |
| POST | `/api/payroll/payouts` | Tạo lệnh chi (chống trùng bằng idempotencyKey) |
| GET | `/api/payroll/payslips` | Danh sách phiếu lương (`?employeeId=&month=YYYY-MM`) |
| GET | `/api/payroll/payslips/:id` | Chi tiết phiếu lương |
| POST | `/api/payroll/payslips/generate` | Sinh phiếu lương tháng cho toàn chi nhánh |

#### Logic tạo lệnh chi (đã có trong `app.js` — tái cấu trúc)
```js
// Kiểm tra số dư trước khi trừ
if (account.balance < totalAmount) return { error: 422 };
account.balance -= totalAmount;

// Sinh ID
transactionId: `TXN-${String(seq++).padStart(6, "0")}`
bankReference: `BANK-${Date.now().toString().slice(-8)}`

// Chống trùng
const existing = payouts.find(p => p.idempotencyKey === key);
if (existing) return { payout: existing, deduped: true };
```

#### Schema phiếu lương
```js
{
  id: "ps-xxx",
  employeeId: String,
  month: String,          // "YYYY-MM"
  baseSalary: Number,     // Lương cơ bản
  totalPenalty: Number,   // Tổng tiền phạt trong tháng
  netSalary: Number,      // baseSalary - totalPenalty
  payoutId: String,       // TXN-xxx (liên kết lệnh chi)
  status: "pending" | "paid" | "cancelled",
  issuedAt: String        // ISO datetime
}
```

#### Yêu cầu
- `POST /api/payroll/payslips/generate` tổng hợp toàn bộ `attendance` tháng đó, tính `totalPenalty`, sinh phiếu cho từng nhân viên.
- `netSalary = baseSalary - totalPenalty` (không cộng/trừ giờ OT).
- Không tạo phiếu trùng: kiểm tra `(employeeId, month)` đã tồn tại chưa.

---

### Module 2 — SOAP Gateway: Tích hợp Ngân hàng (TV2)

#### File cần tạo

```
backend/src/routes/soap.js
backend/src/soap/wsdl.js
```

#### API cần implement

| Method | Endpoint | Mô tả |
|--------|---------|-------|
| GET | `/soap/payroll?wsdl` | Trả về WSDL |
| POST | `/soap/payroll` | Nhận SOAP request, xử lý lệnh chi |

#### WSDL namespace
```
targetNamespace: "http://hrm.company.local/soap/payroll"
operation: CreatePayout
```

#### Envelope request (ngân hàng gửi)
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <PayoutRequest xmlns="http://hrm.company.local/soap/payroll">
      <idempotencyKey>KEY-001</idempotencyKey>
      <debitAccount>102008899776</debitAccount>
      <content>Luong thang 9/2025</content>
      <totalAmount>50000000</totalAmount>
      <beneficiaryCount>5</beneficiaryCount>
    </PayoutRequest>
  </soap:Body>
</soap:Envelope>
```

#### Envelope response
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <PayoutResponse xmlns="http://hrm.company.local/soap/payroll">
      <transactionId>TXN-000001</transactionId>
      <bankReference>BANK-12345678</bankReference>
      <status>Thành công</status>
    </PayoutResponse>
  </soap:Body>
</soap:Envelope>
```

#### Yêu cầu kỹ thuật
- Parse XML thủ công bằng regex (không dùng thư viện nặng — dự án học thuật).
- `Content-Type` response: `text/xml`.
- Fault khi lỗi:
```xml
<soap:Fault>
  <faultcode>soap:Client</faultcode>
  <faultstring>So du khong du</faultstring>
</soap:Fault>
```
- Tái sử dụng hàm `createPayout()` từ `payroll.js` (không duplicate logic).

---

### Module 3 — Yêu cầu nội bộ & Thông báo (TV3)

#### File cần tạo

```
backend/src/routes/requests.js
backend/src/routes/notifications.js
```

#### API Yêu cầu nội bộ

| Method | Endpoint | Mô tả |
|--------|---------|-------|
| GET | `/api/requests` | Danh sách yêu cầu (`?employeeId=&status=`) |
| POST | `/api/requests` | Gửi yêu cầu mới |
| PUT | `/api/requests/:id/approve` | Duyệt yêu cầu (manager/admin) |
| PUT | `/api/requests/:id/reject` | Từ chối yêu cầu |
| DELETE | `/api/requests/:id` | Hủy yêu cầu (chỉ khi đang pending) |

#### Schema yêu cầu
```js
{
  id: "req-xxx",
  type: "leave" | "overtime" | "advance" | "other",
  employeeId: String,
  branchSlug: String,
  title: String,
  content: String,
  attachmentUrl: String | null,
  status: "pending" | "approved" | "rejected",
  reviewedBy: String | null,   // employeeId người duyệt
  reviewNote: String | null,
  createdAt: String,
  updatedAt: String
}
```

#### API Thông báo

| Method | Endpoint | Mô tả |
|--------|---------|-------|
| GET | `/api/notifications` | Lấy thông báo (`?employeeId=`) |
| POST | `/api/notifications` | Tạo thông báo mới (admin/manager) |
| PUT | `/api/notifications/:id/read` | Đánh dấu đã đọc |
| DELETE | `/api/notifications/:id` | Xóa thông báo |

#### Schema thông báo
```js
{
  id: "notif-xxx",
  targetEmployeeId: String | null,  // null = broadcast toàn hệ thống
  branchSlug: String | null,
  title: String,
  body: String,
  isRead: Boolean,
  createdAt: String
}
```

#### Yêu cầu
- Khi yêu cầu được duyệt/từ chối, tự động tạo thông báo gửi cho nhân viên đó.
- `GET /api/notifications?employeeId=` trả cả thông báo cá nhân + broadcast.

---

## Quy trình làm việc

1. **Tạo nhánh feature**: `git checkout -b feature/<module>-<tên>` từ `dev`.
2. **Không commit trực tiếp vào `dev`** — tạo PR để merge.
3. **Kiểm tra trước khi PR**:
   - `node src/index.js` chạy OK, `GET /health` trả `{"status":"ok"}`.
   - Test SOAP bằng cURL hoặc Postman với Body XML.
4. **Tái sử dụng logic**: `createPayout()` phải ở một nơi duy nhất (`payroll.js` hoặc `data/store.js`), cả REST lẫn SOAP đều dùng chung.

---

## Tích hợp với Team 1

| Team 1 cung cấp | Team 2 cần |
|----------------|-----------|
| `GET /api/employees/:id` | Lấy `baseSalary` để tính phiếu lương |
| `GET /api/attendance?employeeId=&month=` | Tổng hợp tiền phạt cho payslip |
| `data/store.js` (bankAccounts) | TV1 SOAP đọc số dư |
| Middleware auth | Bảo vệ route `/api/payroll/payslips` |

---

## Checklist hoàn thành

- [ ] `GET /api/payroll/bank-accounts` trả danh sách tài khoản
- [ ] `POST /api/payroll/payouts` (idempotencyKey, kiểm tra số dư)
- [ ] `POST /api/payroll/payslips/generate` (tổng hợp penalty, sinh payslip)
- [ ] `GET /soap/payroll?wsdl` trả WSDL hợp lệ
- [ ] `POST /soap/payroll` xử lý XML, trả XML
- [ ] CRUD requests + auto-notification khi duyệt/từ chối
- [ ] CRUD notifications (cá nhân + broadcast)
