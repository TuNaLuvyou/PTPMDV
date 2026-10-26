"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faPhone } from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { StaffInShift, GeneralShiftItem } from "./ScheduleOverview";
import { isShiftEnded } from "./shiftTime";

interface Props {
  open: boolean;
  onClose: () => void;
  staff: StaffInShift | null;
  shift: GeneralShiftItem | null;
  day: { name: string; fullDate: string; isToday: boolean } | null;
  onCancelShift: (staffId: string, shiftId: string) => void;
  onCheckIn: (
    staffId: string,
    shiftId: string,
    times?: { checkIn?: string; checkOut?: string }
  ) => void;
  onCancelCheckIn: (staffId: string, shiftId: string) => void;
  onCheckOut?: (staffId: string, shiftId: string) => void;
  onSupplement: (staffId: string, shiftId: string) => void;
  isAdmin?: boolean;
  isOwnShift?: boolean;
}

/** "07:00 - 14:00" -> { start: "07:00", end: "14:00" } */
function splitTimeRange(range?: string): { start: string; end: string } {
  const [start = "", end = ""] = (range || "").split("-").map((part) => part.trim());
  return { start, end };
}

const TIME_INPUT_CLASS =
  "w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 font-mono text-sm font-semibold text-gray-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export default function StaffShiftDetailModal({ open, onClose, staff, shift, day, onCancelShift, onCheckIn, onCancelCheckIn, onCheckOut, onSupplement, isAdmin = true, isOwnShift = false }: Props) {
  // Chế độ nhập giờ chấm công: chỉ hiện 2 nút Hủy / Xác nhận.
  const [isCheckingAttendance, setIsCheckingAttendance] = useState(false);
  const [draftCheckIn, setDraftCheckIn] = useState("");
  const [draftCheckOut, setDraftCheckOut] = useState("");

  useEffect(() => {
    setIsCheckingAttendance(false);
    setDraftCheckIn("");
    setDraftCheckOut("");
  }, [open, staff?.id, shift?.id]);

  if (!staff || !shift || !day) return null;

  const { start: shiftStartTime, end: shiftEndTime } = splitTimeRange(shift.timeRange);

  const isCheckedIn = staff.checkInStatus === "checked_in";
  const isInProgress = staff.checkInStatus === "in_progress";
  const isNotYet = staff.checkInStatus === "not_yet";
  const isCompleted = Boolean(staff.checkOutTime && staff.checkOutTime !== "—");
  // Chỉ ca đã qua giờ kết thúc mà chưa chấm công mới là "Quên chấm công".
  // Ca chưa tới giờ / ca tương lai vẫn hiển thị "Chưa chấm công".
  const isForgot = isNotYet && isShiftEnded(day.fullDate, shift.timeRange);

  const isLate = (() => {
    if (!isCheckedIn || !staff.checkInTime || !shift.timeRange) return false;
    if (!shiftStartTime) return false;
    const [sh, sm] = shiftStartTime.split(":").map(Number);
    const [ch, cm] = staff.checkInTime.split(":").map(Number);
    if ([sh, sm, ch, cm].some((n) => Number.isNaN(n))) return false;
    return ch * 60 + cm - (sh * 60 + sm) > 5;
  })();

  // Check-out sớm hơn giờ kết thúc ca -> "Về sớm" (không tính là hoàn thành).
  const isEarlyLeave = (() => {
    if (!staff.checkOutTime || staff.checkOutTime === "—") return false;
    if (!shiftStartTime || !shiftEndTime) return false;
    const toMinutes = (hms: string) => {
      const [h, m] = hms.split(":").map(Number);
      return Number.isNaN(h) || Number.isNaN(m) ? null : h * 60 + m;
    };
    let start = toMinutes(shiftStartTime);
    let end = toMinutes(shiftEndTime);
    let out = toMinutes(staff.checkOutTime);
    if (start === null || end === null || out === null) return false;
    // Ca qua nửa đêm (VD 22:00 - 06:00).
    if (end <= start) end += 1440;
    if (out < start) out += 1440;
    return out < end;
  })();

  // Giờ check-out hiển thị: ưu tiên giờ đã chấm, nếu ca đã qua ngày/hoàn thành
  // thì lấy đúng giờ kết thúc ca (không cộng thêm giây).
  const effectiveCheckOutTime = (() => {
    if (staff.checkOutTime && staff.checkOutTime !== "—") return staff.checkOutTime;
    if ((shift.status === "completed" || !day.isToday) && (isCheckedIn || staff.checkInTime)) {
      return shiftEndTime || "—";
    }
    return "—";
  })();

  const statusLabel = isCheckedIn
    ? isLate
      ? "Trễ"
      : isEarlyLeave
        ? "Về sớm"
        : isCompleted
          ? "Đã hoàn thành"
          : "Đúng giờ"
    : isInProgress
      ? "Đang trong ca"
      : isForgot
        ? "Quên chấm công"
        : "Chưa chấm công";
  const statusTone = isCheckedIn
    ? isLate || isEarlyLeave
      ? ("warning" as const)
      : ("success" as const)
    : isInProgress
      ? ("primary" as const)
      : isForgot
        ? ("danger" as const)
        : ("gray" as const);

  // Xác định quyền hiển thị nút - Admin/Manager vs Nhân viên
  const isAdminView = isAdmin;
  const isOwn = isOwnShift;
  // Admin: Đúng giờ chỉ Hủy, còn lại Hủy+Chấm công (kể cả xem ca người khác)
  // Nhân viên: chỉ được Bổ sung khi Trễ/Quên trên ca của chính mình, không được tự Hủy, không được thao tác ca người khác
  const showAdminActions = isAdminView;
  const showEmployeeSupplement = !isAdminView && isOwn && (isLate || isForgot);

  const startCheckingAttendance = () => {
    setDraftCheckIn(staff.checkInTime && staff.checkInTime !== "—" ? staff.checkInTime : shiftStartTime);
    setDraftCheckOut(staff.checkOutTime && staff.checkOutTime !== "—" ? staff.checkOutTime : shiftEndTime);
    setIsCheckingAttendance(true);
  };

  const cancelCheckingAttendance = () => {
    setIsCheckingAttendance(false);
  };

  const confirmCheckingAttendance = () => {
    const checkIn = draftCheckIn.trim() || shiftStartTime;
    const checkOut = draftCheckOut.trim() || undefined;
    if (checkIn) onCheckIn(staff.id, shift.id, { checkIn, checkOut });
    setIsCheckingAttendance(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chi tiết ca làm việc"
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2.5">
          {isCheckingAttendance ? (
            <>
              <Button variant="white" onClick={cancelCheckingAttendance} className="px-5 py-2 whitespace-nowrap">
                Hủy
              </Button>
              <Button onClick={confirmCheckingAttendance} className="px-5 py-2 whitespace-nowrap">
                Xác nhận
              </Button>
            </>
          ) : (
            <>
              <Button variant="white" onClick={onClose} className="px-5 py-2">Đóng</Button>
              {showAdminActions ? (
                isCheckedIn || isInProgress || isCompleted ? (
                  <>
                    <Button variant="danger" onClick={() => { onCancelShift(staff.id, shift.id); onClose(); }} className="px-4 py-2 whitespace-nowrap">Hủy ca</Button>
                    <Button variant="white" onClick={() => onCancelCheckIn(staff.id, shift.id)} className="px-4 py-2 whitespace-nowrap">Hủy chấm công</Button>
                  </>
                ) : (
                  <>
                    <Button variant="danger" onClick={() => { onCancelShift(staff.id, shift.id); onClose(); }} className="px-4 py-2 whitespace-nowrap">Hủy ca</Button>
                    <Button onClick={startCheckingAttendance} className="px-5 py-2 whitespace-nowrap">Chấm công</Button>
                  </>
                )
              ) : showEmployeeSupplement ? (
                <Button variant="white" onClick={() => { onSupplement(staff.id, shift.id); onClose(); }} className="px-4 py-2 whitespace-nowrap">Bổ sung chấm công</Button>
              ) : null}
            </>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Thông tin nhân viên */}
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border overflow-hidden ${isCheckedIn ? (isLate ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200") : isInProgress ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
            {staff.avatar ? (
              <img src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
            ) : (
              staff.avatarLetter
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900">{staff.name}</div>
            <div className="text-xs text-gray-500">{staff.role} • Chi nhánh {staff.branch}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge tone={statusTone}>{statusLabel}</Badge>
            </div>
          </div>
          <a href={`tel:${staff.phone.replace(/\s/g, "")}`} className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-primary-50 hover:text-primary shrink-0" title={staff.phone}>
            <FontAwesomeIcon icon={faPhone} fontSize={16} />
          </a>
        </div>

        {/* Thông tin ca */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <FontAwesomeIcon icon={faCalendar} fontSize={18} className="text-primary" />
            <span className="text-[15px] font-bold text-gray-900">{shift.shiftName}</span>
            <span className="text-xs font-mono bg-primary-50 text-primary px-2.5 py-1 rounded border border-primary-200">{shift.timeRange}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-gray-400">Ngày làm việc</div>
              <div className="font-semibold text-gray-800">{day.name}, {day.fullDate} {day.isToday && <span className="ml-1 px-1.5 py-0.5 rounded bg-primary-50 text-primary border border-primary-200 text-[10px]">Hôm nay</span>}</div>
            </div>
            <div>
              <div className="text-gray-400">Trạng thái ca</div>
              <div className="font-semibold text-gray-800">{shift.status === "completed" ? "Đã hoàn thành" : shift.status === "active" ? "Đang diễn ra" : "Sắp diễn ra"}</div>
            </div>
            <div>
              <div className="text-gray-400">Giờ check-in</div>
              {isCheckingAttendance ? (
                <input
                  type="time"
                  aria-label="Giờ check-in"
                  value={draftCheckIn}
                  onChange={(e) => setDraftCheckIn(e.target.value)}
                  className={TIME_INPUT_CLASS}
                />
              ) : (
                <div className="font-mono font-semibold text-gray-800">{staff.checkInTime ?? "—"}</div>
              )}
            </div>
            <div>
              <div className="text-gray-400">Giờ check-out</div>
              {isCheckingAttendance ? (
                <input
                  type="time"
                  aria-label="Giờ check-out"
                  value={draftCheckOut}
                  onChange={(e) => setDraftCheckOut(e.target.value)}
                  className={TIME_INPUT_CLASS}
                />
              ) : (
                <div className="font-mono font-semibold text-gray-800">{effectiveCheckOutTime}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
