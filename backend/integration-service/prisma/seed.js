"use strict";

const database = require("../config/database");

const SEED_REQUESTS = [
  {
    id: "srq1",
    type: "shift_swap",
    employeeId: "e-staff-1",
    branchSlug: "HN-1",
    title: "Đổi ca chiều sang tối",
    content: "Đổi ca chiều sang ca tối với bạn Trang do có việc cá nhân",
    status: "pending",
    sourceShiftId: "sh-hn1-01",
    targetShiftId: "sh-hn1-02",
  },
  {
    id: "srq2",
    type: "leave",
    employeeId: "e-staff-2",
    branchSlug: "HN-1",
    title: "Xin nghỉ phép năm",
    content: "Xin nghỉ phép năm đi khám sức khỏe định kỳ",
    status: "pending",
  },
  {
    id: "srq3",
    type: "work_supplement",
    employeeId: "e-staff-3",
    branchSlug: "HN-1",
    title: "Bổ sung công ngày 15/08",
    content: "Quên check-in buổi sáng do Wi-Fi tầng 2 mất kết nối lúc vào ca",
    status: "approved",
    reviewedBy: "e-mgr-hn1",
    reviewNote: "Đã xác nhận có mặt qua camera",
  },
  {
    id: "srq4",
    type: "leave",
    employeeId: "e-mgr-hn2",
    branchSlug: "HN-2",
    title: "Nghỉ việc gia đình",
    content: "Xin nghỉ việc gia đình có việc hiếu hỷ",
    status: "approved",
    reviewedBy: "e-admin",
  },
  {
    id: "srq5",
    type: "advance",
    employeeId: "e-staff-1",
    branchSlug: "HN-1",
    title: "Xin tạm ứng lương",
    content: "Xin tạm ứng 2.000.000 đ chi phí phát sinh",
    status: "pending",
  },
];

const SEED_NOTIFICATIONS = [
  {
    id: "notif-1",
    targetEmployeeId: null, // broadcast toàn hệ thống
    branchSlug: null,
    title: "Chào mừng phiên bản mới",
    body: "Hệ thống HRM Enterprise đã nâng cấp kiến trúc microservices phân tán.",
    isRead: false,
  },
  {
    id: "notif-2",
    targetEmployeeId: "e-staff-1",
    branchSlug: "HN-1",
    title: "Yêu cầu đổi ca đang chờ duyệt",
    body: "Yêu cầu đổi ca của bạn đã được gửi tới Quản lý chi nhánh.",
    isRead: false,
  },
  {
    id: "notif-3",
    targetEmployeeId: "e-staff-3",
    branchSlug: "HN-1",
    title: "Yêu cầu bổ sung công được duyệt",
    body: "Quản lý Vũ Thành Công đã duyệt yêu cầu bổ sung công ngày 15/08 của bạn.",
    isRead: true,
  },
];

const SEED_NEWS = [
  {
    id: "ann-1",
    title: "Thông báo lịch nghỉ lễ Quốc khánh 02/09",
    summary: "Ban Giám đốc thông báo lịch nghỉ lễ và kế hoạch trực ca hưởng phụ cấp 300% lương.",
    content: "Toàn thể CBNV được nghỉ lễ từ ngày 01/09 đến hết ngày 03/09. Các bộ phận trực ca vận hành vui lòng đăng ký lịch trước ngày 25/08. Công ca trong ngày lễ được tính x3 hệ số lương.",
    author: "Phòng Nhân sự",
    date: "12-08-2026",
    tag: "Thông báo chung",
    tagTone: "primary",
    pinned: true,
  },
  {
    id: "ann-2",
    title: "Cập nhật quy định chấm công xác thực Wi-Fi văn phòng",
    summary: "Nhắc nhở nhân sự kết nối đúng SSID Wi-Fi chi nhánh để hệ thống ghi nhận giờ công chính xác.",
    content: "Hệ thống HRM hiện đã cập nhật chuẩn Wi-Fi mới tại toàn bộ các chi nhánh. Thời gian grace period cho phép là 5 phút. Trường hợp mất kết nối mạng, nhân viên có thể sử dụng tính năng Bổ sung chấm công.",
    author: "Ban Quản trị Kỹ thuật",
    date: "10-08-2026",
    tag: "Quy định",
    tagTone: "warning",
    pinned: false,
  },
];

const SEED_REGULATIONS = [
  {
    id: "reg-1",
    code: "NQ-2026-001",
    title: "Nội quy lao động chung toàn công ty",
    category: "Nội quy lao động",
    summary: "Quy định giờ làm việc, nghỉ phép, tác phong và trách nhiệm chung áp dụng cho toàn bộ nhân sự.",
    content: "Quy định giờ làm việc, nghỉ phép, tác phong và trách nhiệm chung áp dụng cho toàn bộ nhân sự...",
    status: "hiệu lực",
    scope: "Toàn công ty",
    effectiveDate: "01-01-2026",
    author: "Ban Giám Đốc",
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
    content: "1. Nhân viên bắt buộc kết nối đúng SSID Wi-Fi chi nhánh để chấm công...",
    status: "hiệu lực",
    scope: "Toàn công ty",
    effectiveDate: "10-08-2026",
    author: "Ban Quản trị Kỹ thuật",
    version: "1.1",
    pinned: false,
    attachments: 1,
  },
];

const SEED_WIFI_CONFIGS = [
  { id: "wf1", ssid: "HRM_HN1_OFFICE", bssid: "00:1A:2B:3C:4D:01", branch: "HN-1", status: "hoạt động" },
  { id: "wf2", ssid: "HRM_HN1_BACKUP", bssid: "00:1A:2B:3C:4D:02", branch: "HN-1", status: "hoạt động" },
  { id: "wf3", ssid: "HRM_HN2_OFFICE", bssid: "00:1A:2B:3C:4D:11", branch: "HN-2", status: "hoạt động" },
  { id: "wf4", ssid: "HRM_DN1_OFFICE", bssid: "00:1A:2B:3C:4D:21", branch: "ĐN-1", status: "hoạt động" },
];

async function seed() {
  const prisma = database.getPrisma();
  if (!prisma) {
    console.log("[seed] Đang ở chế độ memory, bỏ qua seed Postgres.");
    return { mode: "memory" };
  }

  for (const item of SEED_REQUESTS) {
    await prisma.request.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  for (const item of SEED_NOTIFICATIONS) {
    await prisma.notification.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  for (const item of SEED_NEWS) {
    await prisma.news.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  for (const item of SEED_REGULATIONS) {
    await prisma.regulation.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  for (const item of SEED_WIFI_CONFIGS) {
    await prisma.wifiConfig.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  console.log("[seed] Đã nạp thành công dữ liệu mẫu cho hrm_integration");
  return { mode: "postgres" };
}

if (require.main === module) {
  database.connect().then(seed).then(() => process.exit(0)).catch((e) => {
    console.error("[seed] Thất bại:", e);
    process.exit(1);
  });
}

module.exports = {
  seed,
  SEED_REQUESTS,
  SEED_NOTIFICATIONS,
  SEED_NEWS,
  SEED_REGULATIONS,
  SEED_WIFI_CONFIGS,
};
