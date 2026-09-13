// ============================================================
// Types cho hệ thống quản lý Nhân sự chung (HR System)
// ============================================================

export interface Employee {
  id: string;
  name: string;
  branch: string;
  role: string;
  status: "đang làm" | "vô hiệu hóa";
  phone: string;
}

export interface ShiftRequest {
  id: string;
  employee: string;
  branch: string;
  from: string;
  to: string;
  reason: string;
  status: "chờ duyệt" | "đã duyệt" | "từ chối";
}

export interface Payslip {
  id: string;
  employee: string;
  month: string;
  days: number;
  salary: number;
  bonus: number;
  penalty: number;
  total: number;
  status: "chưa chốt" | "đã chốt";
  reason?: string;
}

export interface Shift {
  id: string;
  employee: string;
  branch: string;
  date: string;
  template: string;
  scheduled: string;
  checkIn?: string;
  checkOut?: string;
  status: "hoàn thành" | "đang làm" | "vắng" | "trễ";
}

export interface WifiConfig {
  id: string;
  ssid: string;
  bssid: string;
  branch: string;
  status: string;
}

export interface Branch {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  manager: string;
  status: "hoạt động" | "vô hiệu hóa";
  staff: number;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  time: string;
  read: boolean;
  icon?: string;
  tone?: "primary" | "info" | "danger" | "warning" | "success";
}
