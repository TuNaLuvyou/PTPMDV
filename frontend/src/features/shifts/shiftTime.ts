// Tiện ích thời gian ca làm việc dùng chung cho màn hình lịch/phân ca.

function toMinutes(hhmm: string): number | null {
  const [h, m] = (hhmm || "").split(":").map(Number);
  return Number.isNaN(h) || Number.isNaN(m) ? null : h * 60 + m;
}

/**
 * Thời điểm kết thúc ca theo ngày DD/MM/YYYY + khung giờ "HH:MM - HH:MM".
 * Ca qua nửa đêm (VD 22:00 - 06:00) được tính sang ngày hôm sau.
 */
export function getShiftEndDate(fullDate: string, timeRange?: string): Date | null {
  const [dd, mm, yyyy] = (fullDate || "").split("/").map(Number);
  const [startStr = "", endStr = ""] = (timeRange || "").split("-").map((p) => p.trim());
  const startMin = toMinutes(startStr);
  const endMin = toMinutes(endStr);
  if (!dd || !mm || !yyyy || endMin === null) return null;

  const end = new Date(yyyy, mm - 1, dd, Math.floor(endMin / 60), endMin % 60, 0, 0);
  if (startMin !== null && endMin <= startMin) end.setDate(end.getDate() + 1);
  return end;
}

/**
 * Ca đã kết thúc chưa. Chỉ khi đã qua giờ kết thúc mới coi là "quên chấm công";
 * ca hôm nay chưa tới giờ hoặc ca ở tương lai vẫn là "chưa chấm công".
 */
export function isShiftEnded(fullDate: string, timeRange?: string): boolean {
  const end = getShiftEndDate(fullDate, timeRange);
  return end !== null && Date.now() > end.getTime();
}
