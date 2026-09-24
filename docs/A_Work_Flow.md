# Work_flow_PTPMDV.md — Người A (nhóm trưởng) — Môn Phát triển phần mềm hướng dịch vụ

> File này dành cho AI agent. Đọc hết trước khi sửa code hoặc tạo file. Nguồn: `PTPMDV_PhanCong.docx`.
> Mục có nhãn **(suy ra)** hoặc **(chưa quy định)** không có trong tài liệu phân công gốc. Không coi đó là yêu cầu chắc chắn; hỏi lại người A khi cần.
> Khi làm việc, không đổi cổng, envelope, tên trường hay cấu trúc thư mục chung.

---

## 0. Tóm tắt nhanh

| Mục | Nội dung |
|---|---|
| Môn | Phát triển phần mềm theo hướng dịch vụ (PTPMDV) |
| Đề tài | Hệ thống HRM theo kiến trúc hướng dịch vụ (SOA): nhiều service độc lập giao tiếp qua REST và SOAP |
| Thành viên | A (nhóm trưởng), B, D, E |
| Phần A sở hữu | `backend/api-gateway` (4000), `backend/identity-service` (4001), `mobile/` (Flutter), `frontend/` (Web Portal) |
| Nhiệm vụ cuối | Đấu nối, demo REST idempotent và SOAP end-to-end trên cả web và mobile, optimize |

---

## 1. Phạm vi: được sửa và không được sửa

### Được sửa (thuộc A)
- `backend/api-gateway/`
- `backend/identity-service/`
- `mobile/`
- `frontend/` (Web Portal — Task 5) **(suy ra, chưa có trong tài liệu gốc)**
- `docker-compose.yml` (ở gốc dự án)

### Không sửa (thuộc thành viên khác)
| Thư mục | Cổng | Chủ sở hữu | Chức năng chính |
|---|---|---|---|
| `backend/organization-service/` | 4002 | B | Danh mục tổ chức và nhân sự |
| `backend/work-service/` | 4003 | B | Ca, chấm công, tác vụ |
| `backend/payroll-service/` | 4004 | D | Lương, lệnh chi, phiếu lương |
| `backend/integration-service/` | 4005 | E | SOAP ngân hàng, yêu cầu, thông báo, bảng tin, nội quy, Wi-Fi |

Nếu cần thay đổi ở service của người khác (thiếu endpoint, sai schema, sai envelope), không tự sửa. Ghi lại vấn đề, nêu rõ service, endpoint, kỳ vọng và thực tế, rồi báo cho người A để trao đổi với chủ service.

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

Áp dụng cho `api-gateway` và `identity-service`.

### 2.2 Định dạng response
- Thành công: `{ "data": ... }`
- Lỗi: `{ "error": { "code": "...", "message": "..." } }`

### 2.3 Health check
Mỗi service (kể cả gateway) có `GET /health`. Nghiệm thu yêu cầu chạy được ở đủ **6 điểm**: gateway + 5 service.

Tài liệu PTPMDV không nêu định dạng body của `/health`. Nên giữ thống nhất với chuẩn chung của dự án **(suy ra)**:

```json
{ "status": "ok", "service": "<service-name>", "time": "<thời gian hiện tại>" }
```

### 2.4 Gọi liên service (ràng buộc riêng của môn này)
- Gọi qua HTTP, timeout tối đa **5000ms**.
- **Không import chéo mã nguồn** giữa các service. Mỗi service độc lập, chỉ giao tiếp qua REST hoặc SOAP.
- Áp dụng cho các lệnh gọi từ gateway đến service phía sau **(suy ra)**.

### 2.5 Mobile (Flutter)
- Điều hướng: `go_router`.
- Màu: `AppColors`.
- Font: Public Sans.
- **Không dùng `withOpacity`.**

---

## 3. Git workflow

- Nhánh gốc làm việc: `dev`.
- Tạo nhánh theo mẫu `feat/<service>-<tên>` (ví dụ `feat/api-gateway-proxy`, `feat/identity-auth`, `feat/mobile-salary`).
- Xong thì tạo PR về `dev`.
- **Không commit thẳng vào `dev` hoặc `main`.**
- Mỗi PR nên gọn theo một service hoặc một chức năng.

---

## 4. Danh sách việc của A

### Task 1 — api-gateway (cổng 4000) — ✅ XONG (PR `feat/api-gateway-proxy`)
- [x] Dựng gateway proxy về các service 4001–4005.
- [x] Cấu hình CORS.
- [x] Xử lý lỗi tập trung, trả đúng envelope `{error: {code, message}}`.
- [x] `GET /health` cho gateway.
- [x] Viết `docker-compose` chạy đủ 6 thành phần (gateway + 5 service).
- [x] Đặt timeout tối đa 5000ms khi proxy về service phía sau (suy ra từ mục 2.4).
- [ ] Rate-limiting và xác thực JWT đầu vào tại gateway (Tech.md §4.5) **(suy ra — chưa làm)**.

Gợi ý kỹ thuật **(suy ra)**: phiên dùng cookie `hrm-session`, nên CORS cần cho phép credentials và chỉ định origin cụ thể, không dùng `*`.

### Task 2 — identity-service (cổng 4001) — ✅ XONG (PR `feat/identity-auth`)
- [x] `POST /api/auth/login`
- [x] `POST /api/auth/logout`
- [x] `GET /api/auth/me`
- [x] Middleware phiên `hrm-session`.
- [x] Phân quyền theo vai trò: `admin`, `manager`, `staff`.
- [x] Seed 3 tài khoản: `admin`, `manager`, `staff`.
- [x] `GET /health`.
- [ ] `POST /api/auth/refresh` — cấp lại access token bằng refresh token (Tech.md §2.3, code đã có `signRefreshToken`) **(suy ra)**.
- [ ] `POST /api/auth/change-password` — phục vụ màn Bảo mật → Đổi mật khẩu trên mobile (`profile/password.dart`) **(suy ra)**.
- [ ] `POST /api/auth/forgot-password` — phục vụ nút "Quên mật khẩu?" trên web và mobile **(suy ra)**.
- [ ] `GET /api/auth/devices` và `DELETE /api/auth/devices/:id` — danh sách và gỡ thiết bị/phiên đăng nhập (màn Bảo mật → Thiết bị đăng nhập trên mobile) **(suy ra)**.

> Quyết định đã chốt (xóa mục hỏi ở §9): DB dùng **Supabase Postgres + Prisma**; auth dùng **JWT + cookie `hrm-session` HttpOnly**; migration chuẩn `prisma/migrations`, seed `prisma/seed.js` (pass `123456`).

### Task 3 — Mobile (Flutter, thư mục `mobile/`) — 🟡 LÀM MỘT PHẦN
- [x] Đồng bộ models mobile với schema backend (mục 6) — đã thêm `payslip/payout/leave_request/app_notification/attendance` (PR `feat/mobile-api`).
- [x] Đấu màn hình `salary` về API thật qua gateway (kèm fallback mock khi payroll của D chưa có).
- [ ] Đấu màn hình `notifications` về API thật — ⏳ chờ E xong integration-service (4005). Repository đã viết sẵn.
- [ ] Đấu màn hình `leave_request` về API thật — ⏳ chờ E (4005). Repository đã viết sẵn.
- [ ] Đấu màn hình `approvals` về API thật — ⏳ chờ E (4005). Repository đã viết sẵn.
- [ ] Đấu màn hình `salary_advance` về API thật (`POST /api/requests` với `type: advance`) — ⏳ chờ E (4005).
- [ ] Đấu màn hình `tasks` về API thật (`GET/POST /api/tasks`) — ⏳ chờ B (4003).
- [ ] Đấu màn hình `attendance` (checkin/checkout) về API thật — ⏳ chờ B (4003).
- [ ] Đấu màn hình `general_schedule` + `staff_monitor` về API thật (`GET /api/shifts`, `GET /api/attendance`) — ⏳ chờ B (4003).
- [ ] Đấu màn hình `shift_assignment` (phân ca) + `schedule_registration` (đăng ký ca) về API thật — ⏳ chờ B (4003).
- [ ] Đấu màn hình `news` về API thật — ⏳ chờ E (4005).
- [ ] Đấu màn hình `regulations` về API thật — ⏳ chờ E (4005).
- [ ] Đấu màn hình `wifi_config` về API thật — ⏳ chờ E (4005).
- [x] Cấu hình base URL và company, trỏ về gateway; tự nhận diện iOS (localhost) vs Android (10.0.2.2) **(đã sửa 24-09-2026)**.
- [x] Đấu màn hình login + splash về API thật (phiên `hrm-session`, PR `feat/mobile-auth`).
- [ ] Đấu màn hình `schedule` (lịch cá nhân, `shift_detail`, `shift_form`) về API thật — ⏳ chờ B (4003) **(suy ra)**.
- [ ] Đấu màn hình `home` (nút check-in/check-out) về API `attendance` thật — ⏳ chờ B (4003) **(suy ra)**.
- [ ] Đấu màn hình `profile` (hồ sơ, bảo mật, thiết bị đăng nhập, cài đặt thông báo) về API thật — ⏳ cần `change-password` + `devices` của identity + notifications của E **(suy ra)**.
- [ ] Đấu màn hình `attendance/adjustment` (điều chỉnh chấm công) về API thật — ⏳ chờ B (4003) + gói `work_supplement` của E **(suy ra)**.
- [ ] Đấu màn hình `notifications/request_detail` về API thật — ⏳ chờ E (4005) **(suy ra)**.
- [ ] Đấu màn hình `help` về API thật hoặc xác nhận nội dung tĩnh **(suy ra)**.
- [ ] Build và kiểm thử bản iOS.
- [x] `flutter analyze` pass (0 issues).
- [x] `flutter test` pass.

> Ngoài phạm vi gốc nhưng đã được A duyệt: đấu login web về API thật (PR `feat/frontend-auth`); sửa lỗi iOS AppIcon thiếu (24-09-2026); sửa base URL tự nhận diện platform (24-09-2026).

### Task 4 — Đấu nối, demo và optimize (làm cuối) — ⏳ CHƯA LÀM (chờ D xong payouts 4004, E xong SOAP/requests 4005)
- [ ] Đấu nối toàn hệ thống khi các service khác đã xong.
- [ ] Demo **REST idempotent** end-to-end trên cả web và mobile: gửi lệnh chi hai lần với cùng `idempotencyKey`, lần hai trả bản ghi cũ kèm `deduped: true`.
- [ ] Demo **SOAP end-to-end** trên cả web và mobile: gọi `/soap/payroll`, tạo được lệnh chi, lỗi trả `soap:Fault`.
- [ ] Optimize sau khi luồng chạy đúng.
- [ ] Demo **SAGA compensating transaction** cho luồng chi lương khi thất bại giữa chừng (Tech.md §4.2, phối hợp cùng D và E) **(suy ra)**.
- [ ] **API Composition** cho trang dashboard web (gộp organization + work + payroll) và **BFF** payload gọn cho mobile (Tech.md §4.4, §4.5) **(suy ra)**.

### Task 5 — Web Portal (`frontend/`) — ⏳ CHƯA LÀM — Phụ trách: **A** (Tech.md yêu cầu demo trên web)
> Tài liệu phân công gốc không giao web cho ai; A nhận phụ trách (đã từng đấu `feat/frontend-auth`) **(suy ra — xác nhận với nhóm)**.
- [x] Chủ sở hữu `frontend/`: **A**.
- [ ] Đấu 13 trang dashboard (employees, departments, branches, shifts, tasks, requests, payslips, bank, news, regulations, wifi, dashboard tổng, login) về API thật qua gateway.
- [ ] Nút "Quên mật khẩu?" của web nối với `POST /api/auth/forgot-password`.
- [ ] RBAC menu theo `buildMenuItems(role)` nối với role thật từ identity-service.
- [ ] Chốt ma trận phân quyền theo vai trò cho từng endpoint — **Phụ trách: A** (B §9 ghi chưa quy định) **(suy ra)**.

---

## 5. Bảng route qua gateway

Gateway proxy các đường dẫn sau về service tương ứng. Đường dẫn ghi trong tài liệu gốc được đánh dấu ✔. Đường dẫn còn lại là **(suy ra)** từ tên chức năng, cần xác nhận với chủ service trước khi cấu hình.

| Đường dẫn | Service (cổng) | Nguồn |
|---|---|---|
| `/api/auth/*` | identity (4001) | ✔ |
| `/api/branches`, `/api/departments`, `/api/employees` | organization (4002) | ✔ |
| `/api/shifts`, `/api/attendance` | work (4003) | (suy ra: chỉ ghi "Shifts, attendance checkin/checkout, tasks CRUD") |
| `/api/tasks` | work (4003) | (suy ra) |
| `/api/payroll/*` (`bank-accounts`, `payouts`, `payslips`) | payroll (4004) | ✔ |
| `/soap/payroll` (`?wsdl` và POST) | integration (4005) | ✔ |
| `/api/news`, `/api/regulations`, `/api/wifi-configs` | integration (4005) | ✔ |
| `/api/requests` | integration (4005) | (suy ra) |
| `/api/notifications` | integration (4005) | (suy ra) |

Lưu ý: `/soap/payroll` nhận và trả XML, và trả `soap:Fault` khi lỗi. Gateway phải chuyển tiếp nguyên vẹn body, header và status của SOAP, không bọc lại thành `{data}` hay `{error}`.

---

## 6. Schema dữ liệu thống nhất (mobile và web đều phải khớp)

Đây là chuẩn chung SSOT. Không tự đổi tên trường. Mọi thay đổi schema phải cập nhật file này trước.

### Khuôn SOAP
- **Request:** `PayoutRequest` gồm `idempotencyKey, debitAccount, content, totalAmount, beneficiaryCount`.
- **Response:** `PayoutResponse` gồm `transactionId (TXN-xxxxxx), bankReference (BANK-xxxxxxxx), status`.
- **Lỗi:** trả `soap:Fault` với `faultcode = soap:Client` và `faultstring` mô tả lỗi (ví dụ: "Số dư không đủ").

### Các thực thể

- **Branch:** `id, name, slug, address, phone, manager (tên hiển thị), status (hoạt động/vô hiệu hóa), staff (số lượng nhân sự)`

- **Department:** `id, name, code, description, manager (tên hiển thị), status (hoạt động/tạm dừng), staff, createdAt`

- **Employee:** `id, name, email, phone, gender, birthDate, province, ward, street, cccd, issueDate, issuePlace, cccdFront, cccdBack, branch (slug chi nhánh, ví dụ "HN-1"), department (tên phòng ban), role (chức danh hiển thị), systemRole (admin/manager/staff), status (đang làm/vô hiệu hóa), joinDate, baseSalary, salaryType (hourly/monthly), hourlySalary, bankName, bankAccountNumber, bankAccountName`

- **Shift (lịch sử ca / phân ca):** `id, employeeId, branch (slug), date (DD-MM-YYYY), template (tên ca), scheduledStart (HH:MM), scheduledEnd (HH:MM), checkIn (HH:MM), checkOut (HH:MM), status (hoàn thành/đang làm/vắng/trễ)`

- **Attendance (chấm công):** `id, employeeId, shiftId, date (DD-MM-YYYY), checkIn (HH:MM), checkOut (HH:MM), penaltyAmount, penaltyNote, status (present/absent/late/early_leave)`

- **AttendanceConfig:** `latePenaltyAmount (số tiền/lần, mặc định 20000), earlyLeavePenaltyAmount, gracePeriodMinutes (mặc định 5), autoCloseShift (bool), shiftSwapMode (string)`
  > Chủ sở hữu: **B** (work-service 4003). Endpoint gợi ý: `GET /api/attendance/config`, `PUT /api/attendance/config`.

- **Task:** `id, title, description, assignedTo (employeeId), branchSlug, dueDate, status (pending/in_progress/done), createdAt`

- **Payslip:** `id, employeeId, month (MM-YYYY), baseSalary, bonus, totalPenalty, netSalary (= baseSalary + bonus - totalPenalty), payoutId, status (chưa chốt/đã chốt), issuedAt`
  > Ghi chú: `bonus` được bổ sung so với tài liệu gốc để khớp với frontend và mobile.

- **Payout:** `id (TXN-xxxxxx), bankReference (BANK-xxxxxxxx), debitAccount, totalAmount, content, beneficiaryCount, idempotencyKey, status, createdAt`

- **Yêu cầu nội bộ (Request):** `id, type, employeeId, branchSlug, title, content, attachmentUrl, status (pending/approved/rejected), reviewedBy, reviewNote, createdAt, updatedAt`
  > Các giá trị `type` hợp lệ: `leave` (nghỉ phép), `overtime` (tăng ca), `advance` (tạm ứng lương), `shift_swap` (đổi ca), `work_supplement` (bổ sung công), `other`.
  > Chủ sở hữu: **E** (integration-service 4005). Lưu ý: `shift_swap` cần tham chiếu `shiftId` nguồn và đích — xác nhận với B trước.

- **Thông báo (Notification):** `id, targetEmployeeId (null = toàn hệ thống), branchSlug, title, body, isRead, createdAt`

- **Bảng tin (Announcement/News):** `id, title, summary, content, author, date, tag, tagTone (danger/warning/success/primary/gray), pinned (bool)`

- **Nội quy (Regulation):** `id, code, title, category, summary, content, status (hiệu lực/dự thảo/hết hiệu lực), scope (Toàn công ty hoặc slug chi nhánh), effectiveDate (DD-MM-YYYY), expiryDate, author, createdAt, updatedAt, version, pinned, attachments (số file đính kèm)`

- **Wi-Fi chấm công:** `id, ssid, bssid, branch (slug chi nhánh), status (hoạt động/vô hiệu hóa)`

Ghi chú định dạng ngày: `date` và `joinDate` dùng `DD-MM-YYYY`; `Payslip.month` dùng `MM-YYYY`; query attendance dùng `month=YYYY-MM`. Ba định dạng này khác nhau — chú ý khi parse.

Quy tắc cần biết khi đấu:
- Payout trùng `idempotencyKey` trả lại bản ghi cũ kèm `deduped: true`.
- Payout hết số dư trả HTTP `422`.
- Duyệt hoặc từ chối yêu cầu tự sinh thông báo. Màn hình `approvals` và `notifications` phản ánh đúng liên động này.
- Chỉ xóa yêu cầu khi đang `pending`.
- `netSalary = baseSalary + bonus - totalPenalty`.

---

## 7. Mốc kiểm tra

| Mốc | Việc của A | Việc của người khác (phụ thuộc) |
|---|---|---|
| 1 | Xong gateway + identity + đấu API mobile | B xong organization + work; D xong lệnh chi; E xong requests, notifications, SOAP |
| 2 | Xong build và kiểm thử iOS, đấu nối, demo REST idempotent và SOAP end-to-end, rồi optimize | E xong bảng tin, nội quy, Wi-Fi |

Thứ tự ưu tiên: hoàn thành gateway và identity trước, vì các thành viên khác và mobile phụ thuộc vào chúng.

> **Tiến độ A (cập nhật 24-09-2026):** Task 1 + Task 2 xong và đã lên Supabase thật; Task 3 xong phần không phụ thuộc D/E (models, salary, base URL, login/splash mobile, login web; analyze/test pass); Task 4 + 3 màn còn lại chờ B/D/E. Chi tiết theo từng checkbox ở mục 4.

---

## 8. Nghiệm thu (Definition of Done)

- Gateway và xác thực chạy.
- `GET /health` đủ 6 điểm.
- Compose chạy full hệ thống.
- App mobile gọi API lương, phiếu lương, thông báo pass.
- `flutter analyze` và `flutter test` pass.
- Demo pass.

### Checklist trước khi mở PR
- [ ] Đúng cấu trúc thư mục service (mục 2.1).
- [ ] Response đúng envelope `{data}` hoặc `{error: {code, message}}`.
- [ ] Có `GET /health`.
- [ ] Có `.env.example` và `Dockerfile`.
- [ ] Gọi liên service qua HTTP, timeout tối đa 5000ms, không import chéo mã nguồn.
- [ ] Nhánh đặt tên `feat/<service>-<tên>`, PR về `dev`.
- [ ] Mobile không dùng `withOpacity`, dùng `AppColors`, `go_router`, Public Sans.
- [ ] Không sửa file thuộc service của người khác.
- [ ] Cập nhật tiến độ vào file `Work_flow` của mình (đánh dấu `[x]`, ghi PR liên quan) trước khi nhờ review/merge PR.

---

## 9. Điểm chưa quy định

Các mục sau không có trong tài liệu phân công. Không tự quyết định rồi coi như đã chốt. Hỏi người A hoặc ghi rõ giả định trong PR.

- **Cơ sở dữ liệu và ORM:** tài liệu không nhắc Prisma, ORM hay loại CSDL nào. Lớp lưu trữ đặt trong `src/infrastructure`. Nếu cần chọn cho `identity-service`, hỏi trước.
- **Ai soạn schema chung:** không có người được giao riêng việc thiết kế dữ liệu. Mỗi người tự lo model của service mình, còn mục 6 là chuẩn chung.
- **Body request và response của `/api/auth/login`, `/api/auth/me`:** không được quy định chi tiết, chỉ bắt buộc đúng envelope.
- **Mật khẩu và thông tin 3 tài khoản seed:** không được nêu.
- **Đường dẫn chính xác của shifts, attendance, tasks, requests, notifications:** xem mục 5, cần xác nhận.
- **Định dạng body của `/health`:** tài liệu PTPMDV không nêu, xem mục 2.3.
- **Ứng dụng web:** tài liệu nhắc demo trên web nhưng không giao ai làm web. Đã phân công cho **A** (Task 5) **(suy ra)**.
- **API versioning `/api/v1/`:** Tech.md §4.6 yêu cầu versioning nhưng toàn bộ route ở mục 5 dùng `/api/...`. Cần chốt trước nghiệm thu **(suy ra)**. **Phụ trách: A** (cấu hình route ở gateway).
- **Công thức `netSalary` đang lệch 3 bản:** A §6 và B ghi `baseSalary + bonus - totalPenalty`; D ghi `baseSalary - totalPenalty`; `AGENTS.md` §2.6 ghi `baseSalary - totalPenalties + allowances`. Cần chốt một bản duy nhất **(đã chỉnh D theo A §6 ngày 24-09-2026)**. **Phụ trách chốt: A** cùng D.

---

## 10. Quy tắc làm việc cho agent

1. Đọc mục 1 trước. Chỉ sửa trong phạm vi của A.
2. Không tự bịa endpoint, tên trường hay hành vi. Nếu tài liệu không nêu, dùng nhãn **(suy ra)** và hỏi lại.
3. Bám đúng envelope, tên trường và định dạng ngày ở mục 6.
4. Không import chéo mã nguồn giữa các service. Mọi giao tiếp qua HTTP, timeout tối đa 5000ms.
5. Không commit thẳng vào `dev` hoặc `main`. Mỗi thay đổi đi qua nhánh `feat/...` và PR về `dev`.
6. Sau mỗi thay đổi ở mobile, chạy `flutter analyze` và `flutter test`. Sau mỗi thay đổi ở backend, kiểm tra `GET /health` và chạy test của service.
7. Khi báo kết quả, nói rõ đã chạy lệnh nào và kết quả ra sao. Không báo "pass" khi chưa chạy.
8. Ưu tiên theo thứ tự: gateway + identity, đến đấu API mobile, đến build iOS, cuối cùng là đấu nối, demo REST idempotent và SOAP end-to-end, optimize.
9. **Luật cập nhật tiến độ (bắt buộc):** sau khi hoàn thành mỗi task và trước khi nhờ review/merge PR, phải cập nhật file `Work_flow` của mình — đánh dấu `[x]` các việc đã xong, ghi rõ nhánh/PR liên quan và việc nào đang chờ thành viên khác. File `Work_flow` là kênh thông báo tiến độ chính cho cả nhóm; không để người khác phải hỏi mới biết làm đến đâu.
