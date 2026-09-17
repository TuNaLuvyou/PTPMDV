import type {
  Employee,
  ShiftRequest,
  Payslip,
  Notification,
  Shift,
  WifiConfig,
  Branch,
  Announcement,
  Regulation,
} from "@/types";

export type {
  Employee,
  ShiftRequest,
  Payslip,
  Notification,
  Shift,
  WifiConfig,
  Branch,
  Announcement,
  Regulation,
};

// ---------- HR: Nhân sự (Gồm cả Admin và Manager vì họ cũng là nhân sự) ----------
export const employees: Employee[] = [
  {
    id: "e-admin",
    name: "Trần Minh Tuấn",
    email: "admin@company.com",
    branch: "HN-1",
    role: "Quản trị viên",
    systemRole: "admin",
    status: "đang làm",
    phone: "0901999888",
    joinDate: "01/01/2024",
    baseSalary: 25_000_000,
  },
  {
    id: "e-mgr-hn1",
    name: "Vũ Thành Công",
    email: "manager@company.com",
    branch: "HN-1",
    role: "Quản lý Chi nhánh",
    systemRole: "manager",
    status: "đang làm",
    phone: "0911223344",
    joinDate: "15/03/2024",
    baseSalary: 16_000_000,
  },
  {
    id: "e-mgr-hn2",
    name: "Lê Văn An",
    email: "manager.hn2@company.com",
    branch: "HN-2",
    role: "Quản lý Chi nhánh",
    systemRole: "manager",
    status: "đang làm",
    phone: "0987654321",
    joinDate: "01/06/2024",
    baseSalary: 15_500_000,
  },
  {
    id: "e-staff-1",
    name: "Nguyễn Thu Hà",
    email: "nhanvien@company.com",
    branch: "HN-1",
    role: "Nhân viên kinh doanh",
    systemRole: "staff",
    status: "đang làm",
    phone: "0912345678",
    joinDate: "10/08/2024",
    baseSalary: 8_500_000,
  },
  {
    id: "e-staff-2",
    name: "Phạm Quỳnh Trang",
    email: "trang.pq@company.com",
    branch: "HN-1",
    role: "Kế toán nội bộ",
    systemRole: "staff",
    status: "đang làm",
    phone: "0933221100",
    joinDate: "01/09/2024",
    baseSalary: 9_000_000,
  },
  {
    id: "e-staff-3",
    name: "Hoàng Minh Đức",
    email: "duc.hm@company.com",
    branch: "HN-1",
    role: "Nhân sự & Tuyển dụng",
    systemRole: "staff",
    status: "đang làm",
    phone: "0901122334",
    joinDate: "15/10/2024",
    baseSalary: 8_800_000,
  },
  {
    id: "e-staff-4",
    name: "Trần Bích Ngọc",
    email: "ngoc.tb@company.com",
    branch: "ĐN-1",
    role: "Lễ tân chi nhánh",
    systemRole: "staff",
    status: "đang làm",
    phone: "0977889900",
    joinDate: "01/11/2024",
    baseSalary: 7_500_000,
  },
];

// ---------- Yêu cầu (Đổi ca, Nghỉ phép, Bổ sung công, Tạm ứng) ----------
export const shiftRequests: ShiftRequest[] = [
  {
    id: "srq1",
    employee: "Nguyễn Thu Hà",
    branch: "HN-1",
    type: "đổi ca",
    from: "17/08 14:00",
    to: "17/08 22:00",
    reason: "Đổi ca chiều sang ca tối với bạn Trang do có việc cá nhân",
    status: "chờ duyệt",
    createdAt: "Hôm nay 08:30",
  },
  {
    id: "srq2",
    employee: "Phạm Quỳnh Trang",
    branch: "HN-1",
    type: "nghỉ phép",
    from: "19/08 08:00",
    to: "19/08 17:00",
    reason: "Xin nghỉ phép năm đi khám sức khỏe định kỳ",
    status: "chờ duyệt",
    createdAt: "Hôm qua 15:45",
  },
  {
    id: "srq3",
    employee: "Hoàng Minh Đức",
    branch: "HN-1",
    type: "bổ sung công",
    from: "15/08 08:00",
    to: "15/08 17:00",
    reason: "Quên check-in buổi sáng do Wi-Fi tầng 2 mất kết nối lúc vào ca",
    status: "đã duyệt",
    createdAt: "15/08 17:30",
  },
  {
    id: "srq4",
    employee: "Lê Văn An",
    branch: "HN-2",
    type: "nghỉ phép",
    from: "22/08 08:00",
    to: "23/08 17:00",
    reason: "Xin nghỉ việc gia đình có việc hiếu hỷ",
    status: "đã duyệt",
    createdAt: "14/08 10:00",
  },
  {
    id: "srq5",
    employee: "Nguyễn Thu Hà",
    branch: "HN-1",
    type: "tạm ứng",
    from: "16/08",
    to: "16/08",
    reason: "Xin tạm ứng 2.000.000 đ chi phí phát sinh",
    status: "chờ duyệt",
    createdAt: "16/08 09:15",
  },
];

// ---------- Phiếu lương (Gồm cả Admin, Manager và Staff) ----------
export const payslips: Payslip[] = [
  {
    id: "ps-admin",
    employee: "Trần Minh Tuấn",
    branch: "HN-1",
    month: "07/2026",
    days: 26,
    salary: 25_000_000,
    bonus: 3_000_000,
    penalty: 0,
    total: 28_000_000,
    status: "đã chốt",
    reason: "Thưởng điều hành quý 2",
  },
  {
    id: "ps-mgr",
    employee: "Vũ Thành Công",
    branch: "HN-1",
    month: "07/2026",
    days: 26,
    salary: 16_000_000,
    bonus: 1_500_000,
    penalty: 0,
    total: 17_500_000,
    status: "đã chốt",
    reason: "Thưởng hiệu quả chi nhánh HN-1",
  },
  {
    id: "ps1",
    employee: "Nguyễn Thu Hà",
    branch: "HN-1",
    month: "07/2026",
    days: 26,
    salary: 8_500_000,
    bonus: 800_000,
    penalty: 0,
    total: 9_300_000,
    status: "đã chốt",
    reason: "Thưởng hoàn thành KPIs tháng 7",
  },
  {
    id: "ps2",
    employee: "Phạm Quỳnh Trang",
    branch: "HN-1",
    month: "07/2026",
    days: 26,
    salary: 9_000_000,
    bonus: 1_000_000,
    penalty: 100_000,
    total: 9_900_000,
    status: "đã chốt",
    reason: "Thưởng chuyên cần, trừ 100k đi trễ 1 lần",
  },
  {
    id: "ps3",
    employee: "Hoàng Minh Đức",
    branch: "HN-1",
    month: "08/2026",
    days: 22,
    salary: 8_800_000,
    bonus: 0,
    penalty: 0,
    total: 8_800_000,
    status: "chưa chốt",
  },
  {
    id: "ps4",
    employee: "Lê Văn An",
    branch: "HN-2",
    month: "08/2026",
    days: 20,
    salary: 15_500_000,
    bonus: 0,
    penalty: 0,
    total: 15_500_000,
    status: "chưa chốt",
  },
];

export const attendanceConfig = {
  latePenalty: "20.000đ / lần trễ (> 5 phút)",
  earlyPenalty: "20.000đ / lần về sớm",
  gracePeriod: "5 phút",
  autoCloseShift: true,
  shiftSwapMode: "Quản lý duyệt",
};

// ---------- Thông báo hệ thống ----------
export const portalNotifications: Notification[] = [
  {
    id: "pn1",
    title: "Yêu cầu đổi ca & nghỉ phép mới",
    content: "Nguyễn Thu Hà gửi yêu cầu đổi ca chờ quản lý phê duyệt",
    time: "10 phút trước",
    read: false,
    tone: "warning",
  },
  {
    id: "pn2",
    title: "Phiếu lương tháng 07/2026",
    content: "Phiếu lương tháng 07/2026 đã được Quản trị viên duyệt và chốt",
    time: "2 giờ trước",
    read: false,
    tone: "success",
  },
  {
    id: "pn3",
    title: "Lịch nghỉ lễ Quốc khánh 2/9",
    content: "Phòng Nhân sự đã ban hành lịch nghỉ lễ và lịch trực lễ cho các chi nhánh",
    time: "1 ngày trước",
    read: true,
    tone: "primary",
  },
];

// ---------- Lịch sử chấm công & phân ca ----------
export const shiftHistory: Shift[] = [
  {
    id: "shift-0816-01",
    employee: "Nguyễn Thu Hà",
    branch: "HN-1",
    date: "16/08/2026",
    template: "Ca Sáng",
    scheduled: "07:00-14:00",
    checkIn: "06:58",
    checkOut: "14:02",
    status: "hoàn thành",
  },
  {
    id: "shift-0816-02",
    employee: "Phạm Quỳnh Trang",
    branch: "HN-1",
    date: "16/08/2026",
    template: "Ca Sáng",
    scheduled: "07:00-14:00",
    checkIn: "07:06",
    checkOut: "14:00",
    status: "trễ",
  },
  {
    id: "shift-0817-01",
    employee: "Hoàng Minh Đức",
    branch: "HN-1",
    date: "17/08/2026",
    template: "Ca Chiều",
    scheduled: "14:00-22:00",
    checkIn: "13:55",
    checkOut: "22:05",
    status: "hoàn thành",
  },
  {
    id: "shift-0817-02",
    employee: "Vũ Thành Công",
    branch: "HN-1",
    date: "17/08/2026",
    template: "Ca Hành chính",
    scheduled: "08:00-17:00",
    checkIn: "07:55",
    checkOut: "17:05",
    status: "hoàn thành",
  },
  {
    id: "shift-0817-03",
    employee: "Trần Minh Tuấn",
    branch: "HN-1",
    date: "17/08/2026",
    template: "Ca Điều hành",
    scheduled: "08:00-17:30",
    checkIn: "07:50",
    checkOut: "17:35",
    status: "hoàn thành",
  },
];

// ---------- Cấu hình Wi-Fi chấm công theo chi nhánh ----------
export const wifiConfigs: WifiConfig[] = [
  { id: "wf1", ssid: "HRM_HN1_OFFICE", bssid: "00:1A:2B:3C:4D:01", branch: "HN-1", status: "hoạt động" },
  { id: "wf2", ssid: "HRM_HN1_BACKUP", bssid: "00:1A:2B:3C:4D:02", branch: "HN-1", status: "hoạt động" },
  { id: "wf3", ssid: "HRM_HN2_OFFICE", bssid: "00:1A:2B:3C:4D:11", branch: "HN-2", status: "hoạt động" },
  { id: "wf4", ssid: "HRM_DN1_OFFICE", bssid: "00:1A:2B:3C:4D:21", branch: "ĐN-1", status: "hoạt động" },
];

// ---------- Danh sách Chi nhánh Doanh nghiệp ----------
export const branches: Branch[] = [
  {
    id: "b1",
    name: "Chi nhánh Hoàn Kiếm",
    slug: "hn-1",
    address: "12 Tràng Thi, P. Hàng Trống, Q. Hoàn Kiếm, Hà Nội",
    phone: "024 3822 1234",
    manager: "Vũ Thành Công",
    status: "hoạt động",
    staff: 18,
  },
  {
    id: "b2",
    name: "Chi nhánh Cầu Giấy",
    slug: "hn-2",
    address: "88 Cầu Giấy, P. Quan Hoa, Q. Cầu Giấy, Hà Nội",
    phone: "024 3783 5678",
    manager: "Lê Văn An",
    status: "hoạt động",
    staff: 14,
  },
  {
    id: "b3",
    name: "Chi nhánh Đà Nẵng",
    slug: "dn-1",
    address: "120 Nguyễn Văn Linh, Q. Hải Châu, TP. Đà Nẵng",
    phone: "0236 3822 9999",
    manager: "Phạm Ngọc Anh",
    status: "hoạt động",
    staff: 12,
  },
];

// ---------- Bảng tin nội bộ ----------
export const announcements: Announcement[] = [
  {
    id: "ann-1",
    title: "Thông báo lịch nghỉ lễ Quốc khánh 02/09",
    summary: "Ban Giám đốc thông báo lịch nghỉ lễ và kế hoạch trực ca hưởng phụ cấp 300% lương.",
    content: "Toàn thể CBNV được nghỉ lễ từ ngày 01/09 đến hết ngày 03/09. Các bộ phận trực ca vận hành vui lòng đăng ký lịch trước ngày 25/08. Công ca trong ngày lễ được tính x3 hệ số lương.",
    author: "Phòng Nhân sự",
    date: "12/08/2026",
    tag: "Thông báo chung",
  },
  {
    id: "ann-2",
    title: "Cập nhật quy định chấm công xác thực Wi-Fi văn phòng",
    summary: "Nhắc nhở nhân sự kết nối đúng SSID Wi-Fi chi nhánh để hệ thống ghi nhận giờ công chính xác.",
    content: "Hệ thống HRM hiện đã cập nhật chuẩn Wi-Fi mới tại toàn bộ các chi nhánh. Thời gian grace period cho phép là 5 phút. Trường hợp mất kết nối mạng, nhân viên có thể sử dụng tính năng Bổ sung chấm công.",
    author: "Ban Quản trị Kỹ thuật",
    date: "10/08/2026",
    tag: "Quy định",
  },
  {
    id: "ann-3",
    title: "Vinh danh nhân viên xuất sắc tháng 07/2026",
    summary: "Chúc mừng bạn Nguyễn Thu Hà (Chi nhánh Hoàn Kiếm) đạt danh hiệu Best Employee tháng 7.",
    content: "Với thành tích vượt 125% chỉ tiêu KPIs và sự tận tụy trong công việc, xin nhiệt liệt chúc mừng bạn Nguyễn Thu Hà. Phần thưởng trị giá 2.000.000 đ đã được cộng vào phiếu lương tháng 7.",
    author: "Ban Giám đốc",
    date: "05/08/2026",
    tag: "Khen thưởng",
  },
];

// ---------- Nội quy & Quy định nội bộ ----------
export const regulations: Regulation[] = [
  {
    id: "reg-1",
    code: "NQ-2026-001",
    title: "Nội quy lao động chung toàn công ty",
    category: "Nội quy lao động",
    summary: "Quy định giờ làm việc, nghỉ phép, tác phong và trách nhiệm chung áp dụng cho toàn bộ nhân sự.",
    content: `CHƯƠNG I - QUY ĐỊNH CHUNG

Điều 1. Phạm vi áp dụng: Toàn bộ nhân sự đang làm việc tại công ty, bao gồm nhân viên chính thức, thử việc và thực tập.

Điều 2. Thời gian làm việc:
- Ca Sáng: 07:00 - 14:00
- Ca Chiều: 14:00 - 22:00
- Ca Hành chính: 08:00 - 17:00
- Đi trễ quá 5 phút bị ghi nhận trễ, quá 30 phút tính vắng nửa ca.

Điều 3. Nghỉ phép:
- Phép năm 12 ngày/năm, đăng ký trước 2 ngày qua hệ thống.
- Nghỉ ốm có giấy xác nhận y tế.
- Nghỉ không lương cần duyệt của Quản lý + HR.

Điều 4. Tác phong: Đồng phục gọn gàng, đeo thẻ tên, thái độ lịch sự với khách hàng.`,
    status: "hiệu lực",
    scope: "Toàn công ty",
    effectiveDate: "01/01/2026",
    author: "Ban Giám Đốc",
    createdAt: "15/12/2025",
    updatedAt: "15/12/2025",
    version: "2.0",
    pinned: true,
    attachments: 2,
  },
  {
    id: "reg-2",
    code: "NQ-2026-002",
    title: "Quy định chấm công xác thực Wi-Fi",
    category: "Chấm công & Kỷ luật",
    summary: "Hướng dẫn chấm công vào/ra ca bằng Wi-Fi chi nhánh, grace period và xử lý khi mất kết nối.",
    content: `1. Nhân viên bắt buộc kết nối đúng SSID Wi-Fi chi nhánh (HRM_[MÃ_CN]_OFFICE) để chấm công hợp lệ.

2. Grace period: 5 phút sau giờ ca. Trong 5 phút này vẫn tính đúng giờ.

3. Quên check-in/check-out: Tạo yêu cầu "Bổ sung công" trong 24h, kèm lý do và được Quản lý duyệt.

4. Trễ/Về sớm: Phạt 20.000đ/lần, trừ trực tiếp vào phiếu lương. Đi trễ >=3 lần/tháng sẽ nhận cảnh báo.

5. Check-in kép: Cho phép 1 thao tác check-out ca trước và check-in ca sau liên tiếp.`,
    status: "hiệu lực",
    scope: "Toàn công ty",
    effectiveDate: "10/08/2026",
    author: "Ban Quản trị Kỹ thuật",
    createdAt: "10/08/2026",
    updatedAt: "10/08/2026",
    version: "1.1",
    attachments: 1,
  },
  {
    id: "reg-3",
    code: "NQ-2026-003",
    title: "Quy chế thưởng & kỷ luật nhân sự",
    category: "Thưởng & Kỷ luật",
    summary: "Tiêu chí xét thưởng chuyên cần, KPIs, Best Employee và các mức kỷ luật khi vi phạm.",
    content: `A. KHEN THƯỞNG
- Thưởng chuyên cần: Đi làm đủ 26 công/tháng, không trễ/vắng.
- Thưởng KPIs: Vượt 100% chỉ tiêu doanh số/tháng.
- Best Employee: Bình chọn hàng tháng, thưởng 2.000.000đ.

B. KỶ LUẬT
- Nhắc nhở: Trễ 1-2 lần/tháng.
- Cảnh cáo: Trễ >=3 lần hoặc vắng không phép 1 ngày.
- Đình chỉ: Vắng không phép >=3 ngày/tháng hoặc vi phạm an toàn nghiêm trọng.`,
    status: "hiệu lực",
    scope: "Toàn công ty",
    effectiveDate: "01/07/2026",
    author: "Phòng Nhân sự",
    createdAt: "01/07/2026",
    updatedAt: "01/07/2026",
    version: "1.0",
  },
  {
    id: "reg-4",
    code: "NQ-2026-004",
    title: "Quy định an toàn vệ sinh thực phẩm - Chi nhánh Hoàn Kiếm",
    category: "An toàn lao động",
    summary: "Quy trình vệ sinh khu bếp, bảo quản thực phẩm và kiểm tra định kỳ áp dụng riêng tại HN-1.",
    content: `1. Vệ sinh bếp trước và sau mỗi ca, ghi checklist hàng ngày.

2. Thực phẩm bảo quản đúng nhiệt độ: Tủ mát 0-4°C, tủ đông -18°C.

3. Nhân viên bếp đeo găng tay, khẩu trang, mũ trùm đầu khi chế biến.

4. Kiểm tra VSATTP định kỳ mỗi tuần bởi Quản lý chi nhánh.

5. Vi phạm: Nhắc nhở lần 1, phạt 200.000đ lần 2, đình chỉ nếu tái phạm lần 3.`,
    status: "hiệu lực",
    scope: "HN-1",
    effectiveDate: "15/08/2026",
    expiryDate: "15/08/2027",
    author: "Quản lý Chi nhánh HN-1",
    createdAt: "15/08/2026",
    updatedAt: "15/08/2026",
    version: "1.0",
    pinned: true,
  },
  {
    id: "reg-5",
    code: "NQ-2026-005",
    title: "Dự thảo - Quy định bảo mật dữ liệu khách hàng",
    category: "Bảo mật & Dữ liệu",
    summary: "Dự thảo quy định về bảo mật thông tin khách hàng, tài khoản và dữ liệu vận hành.",
    content: `DỰ THẢO - CHƯA CÓ HIỆU LỰC

1. Không chia sẻ tài khoản đăng nhập cho người khác.

2. Không chụp ảnh, sao chép dữ liệu khách hàng ra ngoài hệ thống.

3. Mọi truy xuất dữ liệu nhạy cảm phải được ghi log.

4. Vi phạm bảo mật sẽ xử lý kỷ luật nặng và chịu trách nhiệm pháp lý.

(Dự thảo đang lấy ý kiến, dự kiến hiệu lực 01/09/2026)`,
    status: "dự thảo",
    scope: "Toàn công ty",
    effectiveDate: "01/09/2026",
    author: "Ban Giám Đốc",
    createdAt: "12/08/2026",
    updatedAt: "12/08/2026",
    version: "0.9",
  },
];
