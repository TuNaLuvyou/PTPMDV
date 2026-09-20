# Work_flow_PTPMDV_B.md — Thành viên B — Môn Phát triển phần mềm hướng dịch vụ

> File này dành cho AI agent. Đọc hết trước khi sửa code hoặc tạo file. Nguồn: `PTPMDV_PhanCong.docx`.
> Mục có nhãn **(suy ra)** hoặc **(chưa quy định)** không có trong tài liệu phân công gốc. Không coi đó là yêu cầu chắc chắn; hỏi lại khi cần.
> Cùng codebase với môn QLDAPM (xem các file `Work_flow_QLDAPM_*.md`). Không đổi cổng, envelope, tên trường hay cấu trúc thư mục chung.

---

## 0. Tóm tắt nhanh

| Mục | Nội dung |
|---|---|
| Môn | Phát triển phần mềm hướng dịch vụ |
| Thành viên nhóm | A (nhóm trưởng), B, D, E |
| Phần B sở hữu | `backend/organization-service` (4002) + `backend/work-service` (4003) |
| Chức năng chính | Danh mục tổ chức và nhân sự; ca, chấm công, tác vụ |

---

## 1. Phạm vi: được sửa và không được sửa

### Được sửa (thuộc B)
- `backend/organization-service/` (cổng 4002): Danh mục tổ chức và nhân sự
- `backend/work-service/` (cổng 4003): Ca, chấm công, tác vụ

### Không sửa (thuộc thành viên khác)
| Thư mục | Cổng | Chủ sở hữu | Chức năng chính |
|---|---|---|---|
| `backend/api-gateway/`, `backend/identity-service/`, `mobile/`, `docker-compose.yml` | 4000, 4001 | A | Gateway, xác thực, mobile, compose |
| `backend/payroll-service/` | 4004 | D | Lương, lệnh chi, phiếu lương |
| `backend/integration-service/` | 4005 | E | SOAP ngân hàng, yêu cầu, thông báo, bảng tin, nội quy, Wi-Fi |

Nếu cần thay đổi ở phần của người khác (thiếu endpoint, sai schema, sai envelope), không tự sửa. Ghi lại vấn đề, nêu rõ service, endpoint, kỳ vọng và thực tế, rồi báo cho B để trao đổi với chủ phần đó.

---

## 2. Chuẩn kỹ thuật bắt buộc

### 2.1 Cấu trúc service
Mỗi service nằm trong `backend/<service-name>/` gồm:

```
config/
src/api/
src/domain/
src/services/
src/infrastructure/
tests/
.env.example
Dockerfile
server.js
```

### 2.2 Định dạng response
- Thành công: `{ "data": ... }`
- Lỗi: `{ "error": { "code": "...", "message": "..." } }`

### 2.3 Health check
Mỗi service có `GET /health`. Tài liệu PTPMDV không nêu định dạng body. Nên giữ thống nhất với chuẩn chung của dự án **(suy ra)**:

```json
{ "status": "ok", "service": "<service-name>", "time": "<thời gian hiện tại>" }
```

### 2.4 Gọi liên service (ràng buộc riêng của môn này)
- Gọi qua HTTP, timeout tối đa **5000ms**.
- **Không import chéo mã nguồn** giữa các service. Mỗi service độc lập, chỉ giao tiếp qua REST hoặc SOAP.

---

## 3. Git workflow

- Nhánh gốc làm việc: `dev`.
- Tạo nhánh theo mẫu `feat/<service>-<tên>` (ví dụ `feat/organization-employees`, `feat/work-attendance`).
- Xong thì tạo PR về `dev`.
- **Không commit thẳng vào `dev` hoặc `main`.**
- Mỗi PR nên gọn theo một service hoặc một chức năng.

---

## 4. Danh sách việc của B

Tài liệu PTPMDV chỉ nêu phần việc của B ở mức chức năng. Chi tiết endpoint dưới đây lấy từ tài liệu QLDAPM cho cùng phần việc (cùng codebase) **(suy ra từ tài liệu QLDAPM)**.

### Task 1 — organization-service (cổng 4002)
- [ ] CRUD **branches** và **departments**.
- [ ] CRUD **employees** đúng schema, validate email và role, phân quyền.
- [ ] Tham khảo endpoint: `GET /api/branches`, `GET /api/branches/:slug`, `GET /api/employees?branchSlug=`, `GET /api/employees/:id`, và `POST`/`PUT`/`DELETE` tương ứng.
- [ ] `role` thuộc `admin` / `manager` / `staff`; email không trùng.
- [ ] `GET /health`.

### Task 2 — work-service (cổng 4003)
- [ ] **Shifts.**
- [ ] **Attendance:** checkin/checkout kèm tính phạt (`penaltyAmount`, `penaltyNote`, `status` là `present`/`absent`/`late`/`early_leave`).
- [ ] **Tasks:** CRUD.
- [ ] Tham khảo endpoint: `GET /api/shifts`, `POST /api/shifts`, `GET /api/attendance?employeeId=&month=YYYY-MM`, `POST` checkin/checkout.
- [ ] `GET /health`.

---

## 5. Schema dữ liệu liên quan (phải khớp)

Mục "Dữ liệu và khuôn mẫu thống nhất" của tài liệu phân công là chuẩn chung. Không tự đổi tên trường.

- **Employee:** `id, name, email, phone, cccd, address, role, roleTitle, branchSlug, departmentId, baseSalary, bankName, bankAccount, startDate, status`
- **Attendance:** `id, employeeId, shiftId, date (DD-MM-YYYY), checkIn, checkOut, penaltyAmount, penaltyNote, status (present/absent/late/early_leave)`

Ghi chú: schema của Branch, Department, Shift, Task không có trong mục chung (xem mục 9).

Ghi chú định dạng ngày: `Attendance.date` dùng `DD-MM-YYYY`, `Payslip.month` dùng `MM-YYYY`, query attendance dùng `month=YYYY-MM`. Ba định dạng này khác nhau, chú ý khi parse và sinh dữ liệu.

---

## 6. Phụ thuộc và phối hợp

- Mọi request từ web và mobile đi qua `api-gateway` (4000) của A. Client không gọi thẳng vào service của bạn.
- Đăng nhập và phiên `hrm-session` do `identity-service` (4001) của A xử lý.
- **D (payroll-service, 4004):** D sinh phiếu lương bằng cách "tổng hợp phạt theo tháng". Dữ liệu phạt nằm ở work-service của bạn. Cách D lấy dữ liệu là gọi HTTP đến attendance của bạn **(suy ra)**. Giữ `GET /api/attendance?employeeId=&month=YYYY-MM` ổn định và trả `penaltyAmount` đúng.
- **Ràng buộc PTPMDV:** service của bạn tự chứa dữ liệu. Nếu cần dữ liệu của service khác, gọi qua HTTP (timeout tối đa 5000ms), không import chéo mã nguồn.
- **A:** cần route `/api/branches`, `/api/departments`, `/api/employees`, `/api/shifts`, `/api/attendance`, `/api/tasks` cấu hình trên gateway. Đường dẫn tasks là **(suy ra)**.

---

## 7. Mốc kiểm tra

| Mốc | Việc của B |
|---|---|
| 1 | Xong organization-service + work-service |

Mốc đầu tiên của A là gateway + identity. Cần bám sát để chạy được qua gateway khi tích hợp.

---

## 8. Nghiệm thu (Definition of Done)

- Danh mục, nhân sự, chấm công, tác vụ đúng chuẩn.

### Checklist trước khi mở PR
- [ ] Đúng cấu trúc thư mục service (mục 2.1).
- [ ] Response đúng envelope `{data}` hoặc `{error: {code, message}}`.
- [ ] Có `GET /health`.
- [ ] Có `.env.example` và `Dockerfile`.
- [ ] Email trùng bị từ chối, `role` chỉ nhận `admin`/`manager`/`staff`.
- [ ] Chấm công tính phạt đúng; `Attendance.date` dùng `DD-MM-YYYY`.
- [ ] Gọi liên service (nếu có) qua HTTP, timeout tối đa 5000ms, không import chéo mã nguồn.
- [ ] Nhánh đặt tên `feat/<service>-<tên>`, PR về `dev`.
- [ ] Không sửa file thuộc phần của người khác.

---

## 9. Điểm chưa quy định

Các mục sau không có trong tài liệu phân công. Không tự quyết định rồi coi như đã chốt. Hỏi A (nhóm trưởng) hoặc ghi rõ giả định trong PR.

- **Cơ sở dữ liệu và ORM:** tài liệu không nhắc Prisma, ORM hay loại CSDL nào. Lớp lưu trữ đặt trong `src/infrastructure`. Hỏi A trước khi chọn.
- **Cách service nhận danh tính người dùng (vai trò `admin`/`manager`/`staff`):** tài liệu chỉ nêu middleware `hrm-session` gắn `req.user` ở identity-service. Cách các service khác lấy được danh tính và vai trò chưa được quy định. Hỏi A trước khi làm phần phân quyền.
- **Schema Branch, Department, Shift, Task:** không có trong mục schema chung.
- **Luật tính phạt chấm công:** ngưỡng đi muộn, về sớm, vắng mặt và mức phạt không được nêu.
- **Đường dẫn chính xác của shifts, attendance, tasks:** tài liệu PTPMDV chỉ nêu chức năng.
- **Ma trận phân quyền chi tiết theo vai trò cho từng endpoint:** không được nêu.
- **Định dạng body của `/health`:** tài liệu PTPMDV không nêu, xem mục 2.3.

---

## 10. Quy tắc làm việc cho agent

1. Đọc mục 1 trước. Chỉ sửa trong phạm vi của B.
2. Không tự bịa endpoint, tên trường hay hành vi. Nếu tài liệu không nêu, dùng nhãn **(suy ra)** và hỏi lại.
3. Bám đúng envelope, tên trường và định dạng ngày ở mục 5.
4. Không commit thẳng vào `dev` hoặc `main`. Mỗi thay đổi đi qua nhánh `feat/...` và PR về `dev`.
5. Không import chéo mã nguồn giữa các service. Muốn dùng dữ liệu của service khác thì gọi qua HTTP.
6. Sau mỗi thay đổi, kiểm tra `GET /health` và chạy test của service (`tests/`).
7. Khi báo kết quả, nói rõ đã chạy lệnh nào và kết quả ra sao. Không báo "pass" khi chưa chạy.
8. Ưu tiên: hoàn thành cả organization-service và work-service trước mốc 1, vì D và mobile phụ thuộc vào dữ liệu này.
