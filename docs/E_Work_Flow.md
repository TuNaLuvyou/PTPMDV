# Work_flow_PTPMDV_E.md — Thành viên E — Môn Phát triển phần mềm hướng dịch vụ

> File này dành cho AI agent. Đọc hết trước khi sửa code hoặc tạo file. Nguồn: `PTPMDV_PhanCong.docx`.
> Mục có nhãn **(suy ra)** hoặc **(chưa quy định)** không có trong tài liệu phân công gốc. Không coi đó là yêu cầu chắc chắn; hỏi lại khi cần.
> Cùng codebase với môn QLDAPM (xem các file `Work_flow_QLDAPM_*.md`). Không đổi cổng, envelope, tên trường hay cấu trúc thư mục chung.

---

## 0. Tóm tắt nhanh

| Mục | Nội dung |
|---|---|
| Môn | Phát triển phần mềm hướng dịch vụ |
| Thành viên nhóm | A (nhóm trưởng), B, D, E |
| Phần E sở hữu | `backend/integration-service` (4005) |
| Chức năng chính | SOAP ngân hàng, yêu cầu, thông báo, bảng tin, nội quy, Wi-Fi |

---

## 1. Phạm vi: được sửa và không được sửa

### Được sửa (thuộc E)
- `backend/integration-service/` (cổng 4005): SOAP ngân hàng, yêu cầu, thông báo, bảng tin, nội quy, Wi-Fi

### Không sửa (thuộc thành viên khác)
| Thư mục | Cổng | Chủ sở hữu | Chức năng chính |
|---|---|---|---|
| `backend/api-gateway/`, `backend/identity-service/`, `mobile/`, `docker-compose.yml` | 4000, 4001 | A | Gateway, xác thực, mobile, compose |
| `backend/organization-service/` | 4002 | B | Danh mục tổ chức và nhân sự |
| `backend/work-service/` | 4003 | B | Ca, chấm công, tác vụ |
| `backend/payroll-service/` | 4004 | D | Lương, lệnh chi, phiếu lương |

Nếu cần thay đổi ở phần của người khác (thiếu endpoint, sai schema, sai envelope), không tự sửa. Ghi lại vấn đề, nêu rõ service, endpoint, kỳ vọng và thực tế, rồi báo cho E để trao đổi với chủ phần đó.

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
- Tạo nhánh theo mẫu `feat/<service>-<tên>` (ví dụ `feat/integration-soap`, `feat/integration-news`).
- Xong thì tạo PR về `dev`.
- **Không commit thẳng vào `dev` hoặc `main`.**
- Mỗi PR nên gọn theo một service hoặc một chức năng.

---

## 4. Danh sách việc của E

### Task 1 — integration-service (cổng 4005)
- [ ] **SOAP:** `GET /soap/payroll?wsdl` (WSDL hợp lệ) và `POST /soap/payroll` (nhận `PayoutRequest`, trả `PayoutResponse`, lỗi trả `soap:Fault`). SOAP phải tạo được lệnh chi.
- [ ] **Requests:** `GET`, `POST`, `PUT` approve/reject (tự sinh thông báo), `DELETE` khi đang `pending`.
- [ ] **Notifications:** `GET` (gồm cả broadcast), `POST`, `PUT` read, `DELETE`.
- [ ] **Bảng tin:** `GET /api/news`, `GET /api/news/:id`, `POST /api/news`, `PUT /api/news/:id`, `DELETE /api/news/:id` (tạo/sửa/xóa: `admin`/`manager`).
- [ ] **Nội quy:** `GET /api/regulations`, `GET /api/regulations/:id`, `POST`, `PUT`, `DELETE`.
- [ ] **Wi-Fi chấm công:** `GET /api/wifi-configs?branch=`, `POST`, `PUT /api/wifi-configs/:id`, `DELETE`.
- [ ] `GET /health`.

---

## 5. Schema dữ liệu liên quan (phải khớp)

Mục "Dữ liệu và khuôn mẫu thống nhất" của tài liệu phân công là chuẩn chung. Không tự đổi tên trường.

- **Khuôn SOAP:** `POST /soap/payroll` nhận `PayoutRequest (idempotencyKey, debitAccount, content, totalAmount, beneficiaryCount)`, trả `PayoutResponse (transactionId (TXN-xxxxxx), bankReference (BANK-xxxxxxxx), status)`. Lỗi trả `soap:Fault` với `faultcode = soap:Client` và `faultstring` mô tả lỗi (ví dụ: Số dư không đủ).
- **Yêu cầu nội bộ:** `id, type (leave/overtime/advance/other), employeeId, branchSlug, title, content, attachmentUrl, status (pending/approved/rejected), reviewedBy, reviewNote, createdAt, updatedAt`
- **Thông báo:** `id, targetEmployeeId (null là gửi toàn hệ thống), branchSlug, title, body, isRead, createdAt`
- **Bảng tin:** `id, title, summary, content, author, date, tag, tagTone (danger/warning/success/primary/gray), pinned`
- **Nội quy:** `id, code, title, category, summary, content, status, scope (Toàn công ty hoặc mã chi nhánh), effectiveDate, expiryDate, author, createdAt`
- **Wi-Fi chấm công:** `id, ssid, bssid, branch (mã chi nhánh), status`

Ghi chú định dạng: `createdAt`, `updatedAt`, `date` của các thực thể trên không được quy định định dạng cụ thể. Hỏi A nếu cần thống nhất với mobile.

---

## 6. Phụ thuộc và phối hợp

- Mọi request từ web và mobile đi qua `api-gateway` (4000) của A. Client không gọi thẳng vào service của bạn.
- Đăng nhập và phiên `hrm-session` do `identity-service` (4001) của A xử lý.
- **D (payroll-service, 4004):** SOAP của bạn tạo lệnh chi và trả `transactionId` (`TXN-xxxxxx`), `bankReference` (`BANK-xxxxxxxx`). Cách tạo là gọi REST payout của D qua HTTP **(suy ra)**, timeout tối đa 5000ms, không import chéo mã nguồn. `idempotencyKey` của `PayoutRequest` cần được chuyển tiếp để tính idempotent nhất quán với REST.
- **D:** khi D trả lỗi hết số dư (422), chuyển thành `soap:Fault` với `faultcode = soap:Client` và `faultstring` mô tả (ví dụ "Số dư không đủ").
- **A:** demo SOAP end-to-end trên web và mobile của A gọi `/soap/payroll` của bạn qua gateway, cần chuyển tiếp nguyên vẹn XML và `soap:Fault`. Màn hình `notifications`, `leave_request`, `approvals` trên mobile của A gọi requests và notifications của bạn.
- **Liên động yêu cầu và thông báo:** duyệt hoặc từ chối yêu cầu tự sinh thông báo. Cả hai nằm trong cùng service của bạn, nhưng phải đúng liên động vì đây là điểm nghiệm thu.

---

## 7. Mốc kiểm tra

| Mốc | Việc của E |
|---|---|
| 1 | Xong requests, notifications, SOAP |
| 2 | Xong bảng tin, nội quy, Wi-Fi |

Mốc đầu tiên của A là gateway + identity. Cần bám sát để chạy được qua gateway khi tích hợp.

---

## 8. Nghiệm thu (Definition of Done)

- WSDL hợp lệ.
- SOAP tạo được lệnh chi.
- Yêu cầu và thông báo liên động đúng.
- CRUD bảng tin, nội quy, Wi-Fi đúng envelope.

### Checklist trước khi mở PR
- [ ] Đúng cấu trúc thư mục service (mục 2.1).
- [ ] Response đúng envelope `{data}` hoặc `{error: {code, message}}`.
- [ ] Có `GET /health`.
- [ ] Có `.env.example` và `Dockerfile`.
- [ ] `GET /soap/payroll?wsdl` hợp lệ; lỗi trả `soap:Fault` với `faultcode = soap:Client`.
- [ ] Duyệt/từ chối yêu cầu tự sinh thông báo; chỉ xóa yêu cầu khi `pending`.
- [ ] Tạo/sửa/xóa bảng tin chỉ cho `admin`/`manager`.
- [ ] Gọi liên service qua HTTP, timeout tối đa 5000ms, không import chéo mã nguồn.
- [ ] Nhánh đặt tên `feat/<service>-<tên>`, PR về `dev`.
- [ ] Không sửa file thuộc phần của người khác.

---

## 9. Điểm chưa quy định

Các mục sau không có trong tài liệu phân công. Không tự quyết định rồi coi như đã chốt. Hỏi A (nhóm trưởng) hoặc ghi rõ giả định trong PR.

- **Cơ sở dữ liệu và ORM:** tài liệu không nhắc Prisma, ORM hay loại CSDL nào. Lớp lưu trữ đặt trong `src/infrastructure`. Hỏi A trước khi chọn.
- **Cách service nhận danh tính người dùng (vai trò `admin`/`manager`/`staff`):** tài liệu chỉ nêu middleware `hrm-session` gắn `req.user` ở identity-service. Cách các service khác lấy được danh tính và vai trò chưa được quy định. Hỏi A trước khi làm phần phân quyền.
- **Đường dẫn chính xác của requests, notifications và thao tác approve/reject/read:** tài liệu PTPMDV chỉ nêu phương thức HTTP, không nêu đường dẫn.
- **Cấu trúc WSDL:** không được nêu chi tiết, chỉ yêu cầu WSDL hợp lệ.
- **Cách SOAP tạo lệnh chi:** không nêu rõ gọi payroll-service bằng cách nào, xem mục 6.
- **Ai được duyệt hoặc từ chối yêu cầu:** không được nêu.
- **Định dạng body của `/health`:** tài liệu PTPMDV không nêu, xem mục 2.3.

---

## 10. Quy tắc làm việc cho agent

1. Đọc mục 1 trước. Chỉ sửa trong phạm vi của E.
2. Không tự bịa endpoint, tên trường hay hành vi. Nếu tài liệu không nêu, dùng nhãn **(suy ra)** và hỏi lại.
3. Bám đúng envelope, tên trường và định dạng ngày ở mục 5.
4. Không commit thẳng vào `dev` hoặc `main`. Mỗi thay đổi đi qua nhánh `feat/...` và PR về `dev`.
5. Không import chéo mã nguồn giữa các service. Muốn dùng dữ liệu của service khác thì gọi qua HTTP.
6. Sau mỗi thay đổi, kiểm tra `GET /health` và chạy test của service (`tests/`).
7. Khi báo kết quả, nói rõ đã chạy lệnh nào và kết quả ra sao. Không báo "pass" khi chưa chạy.
8. Ưu tiên theo thứ tự: requests, notifications, SOAP (mốc 1) trước, rồi bảng tin, nội quy, Wi-Fi (mốc 2).
