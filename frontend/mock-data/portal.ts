import type {
  Employee,
  ShiftRequest,
  Payslip,
  Notification,
  Shift,
  WifiConfig,
  Branch,
} from "./types";

export type {
  Employee,
  ShiftRequest,
  Payslip,
  Notification,
  Shift,
  WifiConfig,
  Branch,
};

// ---------- HR: Nhân sự ----------
export const employees: Employee[] = [
  { id: "e1", name: "Nguyễn Thu Hà", branch: "HN-1", role: "Nhân viên", status: "đang làm", phone: "0912345678" },
  { id: "e2", name: "Lê Văn An", branch: "HN-2", role: "Trưởng nhóm", status: "đang làm", phone: "0987654321" },
  { id: "e3", name: "Phạm Quỳnh Trang", branch: "HN-1", role: "Kế toán", status: "đang làm", phone: "0933221100" },
  { id: "e4", name: "Hoàng Minh Đức", branch: "HN-1", role: "Nhân sự", status: "đang làm", phone: "0901122334" },
  { id: "e5", name: "Trần Bích Ngọc", branch: "ĐN-1", role: "Lễ tân", status: "vô hiệu hóa", phone: "0977889900" },
  { id: "e6", name: "Vũ Thành Công", branch: "HN-1", role: "Quản lý", status: "đang làm", phone: "0911223344" },
];

export const shiftRequests: ShiftRequest[] = [
  { id: "srq1", employee: "Nguyễn Thu Hà", branch: "HN-1", from: "17/08 14:00", to: "17/08 22:00", reason: "Đổi ca với đồng nghiệp do việc gia đình", status: "chờ duyệt" },
  { id: "srq2", employee: "Lê Văn An", branch: "HN-2", from: "18/08 07:00", to: "18/08 14:00", reason: "Xin nghỉ ca sáng thứ 3", status: "đã duyệt" },
  { id: "srq3", employee: "Phạm Quỳnh Trang", branch: "HN-1", from: "19/08 07:00", to: "19/08 14:00", reason: "Xin đổi ca đi khám bệnh", status: "từ chối" },
];

export const payslips: Payslip[] = [
  { id: "ps1", employee: "Nguyễn Thu Hà", month: "07/2026", days: 26, salary: 6_500_000, bonus: 800_000, penalty: 0, total: 7_300_000, status: "đã chốt", reason: "Thưởng hoàn thành KPIs tháng 7" },
  { id: "ps2", employee: "Phạm Quỳnh Trang", month: "07/2026", days: 26, salary: 7_000_000, bonus: 1_200_000, penalty: 100_000, total: 8_100_000, status: "đã chốt", reason: "Thưởng hiệu quả công việc, trừ 100k đi trễ" },
  { id: "ps3", employee: "Hoàng Minh Đức", month: "08/2026", days: 22, salary: 8_000_000, bonus: 0, penalty: 0, total: 8_000_000, status: "chưa chốt" },
  { id: "ps4", employee: "Lê Văn An", month: "08/2026", days: 20, salary: 6_000_000, bonus: 0, penalty: 200_000, total: 5_800_000, status: "chưa chốt", reason: "Phạt vi phạm nội quy" },
];

export const attendanceConfig = {
  latePenalty: "20.000đ / lần trễ",
  earlyPenalty: "20.000đ / lần về sớm",
  gracePeriod: "5 phút",
  autoCloseShift: true,
  shiftSwapMode: "Quản lý duyệt",
};

// ---------- Notifications (HR) ----------
export const portalNotifications: Notification[] = [
  { id: "pn1", title: "Yêu cầu đổi ca mới", content: "Nguyễn Thu Hà gửi yêu cầu đổi ca chờ duyệt", time: "10 phút trước", read: false, tone: "warning" },
  { id: "pn2", title: "Phiếu lương đã chốt", content: "Phiếu lương 07/2026 đã được chốt", time: "2 giờ trước", read: false, tone: "success" },
  { id: "pn3", title: "Nhân viên mới", content: "Vũ Thành Công đã được thêm vào chi nhánh HN-1", time: "1 ngày trước", read: true, tone: "primary" },
];

// ---------- Shift History (Lịch sử chấm công chung) ----------
export const shiftHistory: Shift[] = [
  { id: "shift-0816-01", employee: "Nguyễn Thu Hà", branch: "HN-1", date: "16/08/2026", template: "Ca Sáng", scheduled: "07:00-14:00", checkIn: "06:58", checkOut: "14:02", status: "hoàn thành" },
  { id: "shift-0816-02", employee: "Phạm Quỳnh Trang", branch: "HN-1", date: "16/08/2026", template: "Ca Sáng", scheduled: "07:00-14:00", checkIn: "07:06", checkOut: "14:00", status: "trễ" },
  { id: "shift-0817-01", employee: "Hoàng Minh Đức", branch: "HN-1", date: "17/08/2026", template: "Ca Chiều", scheduled: "14:00-22:00", checkIn: "13:55", checkOut: "22:05", status: "hoàn thành" },
  { id: "shift-0817-02", employee: "Vũ Thành Công", branch: "HN-1", date: "17/08/2026", template: "Ca Chiều", scheduled: "14:00-22:00", checkIn: "14:01", checkOut: "22:00", status: "hoàn thành" },
];

// ---------- Wifi Configs (Cấu hình Wi-Fi chấm công) ----------
export const wifiConfigs: WifiConfig[] = [
  { id: "wf1", ssid: "HR-HN1", bssid: "00:1A:2B:3C:4D:01", branch: "HN-1", status: "hoạt động" },
  { id: "wf2", ssid: "HR-HN1-Guest", bssid: "00:1A:2B:3C:4D:02", branch: "HN-1", status: "hoạt động" },
  { id: "wf3", ssid: "HR-HN2", bssid: "00:1A:2B:3C:4D:11", branch: "HN-2", status: "hoạt động" },
];

// ---------- Branches (Quản lý Chi nhánh) ----------
export const branches: Branch[] = [
  { id: "b1", name: "Chi nhánh HN-1", slug: "hn-1", address: "12 Tràng Thi, Hoàn Kiếm, Hà Nội", phone: "024 3822 1234", manager: "Trần Thị Mai", status: "hoạt động", staff: 18 },
  { id: "b2", name: "Chi nhánh HN-2", slug: "hn-2", address: "88 Cầu Giấy, Hà Nội", phone: "024 3783 5678", manager: "Lê Quốc Bảo", status: "hoạt động", staff: 14 },
  { id: "b3", name: "Chi nhánh ĐN-1", slug: "dn-1", address: "120 Nguyễn Văn Linh, Đà Nẵng", phone: "0236 3822 9999", manager: "Phạm Ngọc Anh", status: "hoạt động", staff: 12 },
  { id: "b4", name: "Chi nhánh HCM-1", slug: "hcm-1", address: "55 Lê Lợi, Quận 1, TP.HCM", phone: "028 3822 4455", manager: "Hoàng Đức Minh", status: "vô hiệu hóa", staff: 0 },
];
