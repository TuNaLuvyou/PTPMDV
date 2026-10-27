"use client";

import { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faClock,
  faCloudSun,
  faFilter,
  faMoon,
  faStore,
  faSun,
  faUserCheck,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { apiGet } from "@/lib/api";
import type { Branch } from "@/types";
import type { WeeklyRegistration, ShiftTemplate } from "./types";
import { usePersistentState } from "@/hooks/usePersistentState";

export interface StaffInRegistration {
  id: string;
  originalId: string;
  name: string;
  avatar?: string;
  role: string;
  branch: string;
  avatarLetter: string;
  requestedCount: number;
  registeredAt?: string;
  days?: Record<string, string>;
  note?: string;
}

export interface RegistrationShiftGroup {
  id: string;
  templateId?: string;
  shiftName: string;
  timeRange: string;
  iconType: "morning" | "afternoon" | "evening";
  status: "completed" | "active" | "upcoming";
  staffList: StaffInRegistration[];
}

interface Props {
  registrations: WeeklyRegistration[];
  templates?: ShiftTemplate[];
  defaultBranch?: string;
  isManager?: boolean;
  managerBranch?: string;
}

function getMondayOfCurrentWeek(): Date {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // Thứ 2 = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - day);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default function RegistrationTimetableSection({
  registrations,
  templates = [],
  defaultBranch = "all",
  isManager = false,
  managerBranch,
}: Props) {
  const effectiveDefaultBranch = isManager && managerBranch ? managerBranch : defaultBranch;
  // Nhớ thao tác xem lịch qua localStorage (đồng bộ tuần/ngày/chi nhánh với Lịch làm việc chung).
  const [weekOffset, setWeekOffset] = usePersistentState<number>("hrm.shifts.view.weekOffset", 0);
  const [selectedDayIndex, setSelectedDayIndex] = usePersistentState<number>("hrm.shifts.view.dayIndex", 0); // 0: Thứ 2 ... 6: Chủ nhật
  const [branchFilter, setBranchFilter] = usePersistentState<string>(
    "hrm.shifts.view.branch",
    effectiveDefaultBranch
  );
  // Manager luôn bị khóa theo chi nhánh phụ trách, không dùng giá trị đã lưu.
  const selectedBranch = isManager && managerBranch ? managerBranch : branchFilter;
  const [statusFilter, setStatusFilter] = usePersistentState<"all" | "has_note" | "no_note">(
    "hrm.shifts.reg.status",
    "all"
  );
  const [expandedShifts, setExpandedShifts] = useState<Record<string, boolean>>({
    "shift_0": true,
    "shift_1": true,
    "shift_2": true,
  });
  const [detailStaff, setDetailStaff] = useState<StaffInRegistration | null>(null);
  const [detailGroup, setDetailGroup] = useState<RegistrationShiftGroup | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    apiGet<Branch[]>("/api/branches").then((d) => setBranches(d || [])).catch(() => {});
  }, []);

  // Chi nhánh đã lưu không còn tồn tại -> quay về "Tất cả chi nhánh".
  useEffect(() => {
    if (isManager || branches.length === 0 || branchFilter === "all") return;
    const exists = branches.some((b) => b.slug.toUpperCase() === branchFilter.toUpperCase());
    if (!exists) setBranchFilter("all");
  }, [branches, isManager, branchFilter, setBranchFilter]);

  // Tính toán các ngày trong tuần được chọn (tuần hiện tại thật + offset)
  const weekDays = useMemo(() => {
    const baseMonday = getMondayOfCurrentWeek();
    const monday = new Date(baseMonday);
    monday.setDate(baseMonday.getDate() + weekOffset * 7);

    const dayKeys = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const dayNames = [
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
      "Chủ Nhật",
    ];

    return dayKeys.map((key, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dayNum = String(d.getDate()).padStart(2, "0");
      const monthNum = String(d.getMonth() + 1).padStart(2, "0");
      const yearNum = d.getFullYear();
      const dateStr = `${dayNum}/${monthNum}`;
      const fullDate = `${dayNum}/${monthNum}/${yearNum}`;
      const today = new Date();
      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();

      return {
        key,
        name: dayNames[idx],
        date: dateStr,
        fullDate,
        isToday,
      };
    });
  }, [weekOffset]);

  const currentDay = weekDays[selectedDayIndex] || weekDays[0];

  const getWeekTitle = () => {
    if (weekOffset === 0) return "Tuần này";
    if (weekOffset === -1) return "Tuần trước";
    if (weekOffset === 1) return "Tuần sau";
    if (weekOffset < -1) return `${Math.abs(weekOffset)} tuần trước`;
    return `${weekOffset} tuần sau`;
  };

  const getWeekRange = () => {
    if (weekDays.length < 7) return "";
    const year = weekDays[6].fullDate.split("/")[2] || "";
    return `${weekDays[0].date} - ${weekDays[6].date}/${year}`;
  };

  const filteredRegs = useMemo(() => {
    if (selectedBranch === "all") return registrations;
    const target = (selectedBranch || "").toLowerCase().replace(/[\s-_]/g, "");
    return registrations.filter(
      (r) =>
        (r.branch || "").toLowerCase().replace(/[\s-_]/g, "") === target
    );
  }, [registrations, selectedBranch]);

  // Xây dựng danh sách ca & nhân sự đăng ký trong ngày được chọn
  const dayGroups: RegistrationShiftGroup[] = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [dd, mm, yyyy] = currentDay.fullDate.split("/").map(Number);
    const dayDate = new Date(yyyy, (mm || 1) - 1, dd || 1);
    dayDate.setHours(0, 0, 0, 0);

    const calcStatus = (
      startTime: string,
      endTime: string
    ): RegistrationShiftGroup["status"] => {
      if (dayDate.getTime() < today.getTime()) return "completed";
      if (dayDate.getTime() > today.getTime()) return "upcoming";
      const toMinutes = (hms: string) => {
        const [h, m] = (hms || "00:00").split(":").map(Number);
        return (h || 0) * 60 + (m || 0);
      };
      const startMin = toMinutes(startTime);
      let endMin = toMinutes(endTime);
      if (endMin <= startMin) endMin += 1440;
      const nowMin = new Date();
      nowMin.setHours(0, 0, 0, 0);
      const elapsed = (Date.now() - nowMin.getTime()) / 60000;
      if (elapsed >= endMin) return "completed";
      if (elapsed < startMin) return "upcoming";
      return "active";
    };

    const iconFor = (start: string): RegistrationShiftGroup["iconType"] => {
      const h = Number((start || "07:00").split(":")[0]);
      if (h >= 17) return "evening";
      if (h >= 12) return "afternoon";
      return "morning";
    };

    // Chỉ dùng khung ca thật từ DB — chưa tạo cấu hình ca thì để rỗng,
    // hiển thị empty state, không fallback mockdata.
    const baseTemplates =
      templates && templates.length > 0 ? templates : [];

    return baseTemplates.map((t, ti) => {
      const matchesTemplate = (regShiftVal?: string) => {
        if (!regShiftVal || regShiftVal === "Nghỉ") return false;
        const cleanReg = regShiftVal.trim().toLowerCase();
        const cleanTName = t.name.trim().toLowerCase();
        return (
          cleanReg === cleanTName ||
          cleanReg === t.id.toLowerCase() ||
          cleanReg.includes(cleanTName) ||
          cleanTName.includes(cleanReg)
        );
      };

      const staffList = filteredRegs
        .filter((r) => matchesTemplate(r.days?.[currentDay.key]))
        .map((r, idx): StaffInRegistration => ({
          id: `reg-${r.id}-${ti}-${idx}`,
          originalId: r.id,
          name: r.employeeName,
          avatar: r.avatar,
          role: r.role || "Nhân viên",
          branch: r.branch,
          avatarLetter: (r.employeeName || "?").charAt(0).toUpperCase(),
          requestedCount:
            r.requestedCount ||
            (r.days ? Object.values(r.days).filter((v) => v !== "Nghỉ").length : 5),
          registeredAt: r.registeredAt,
          days: r.days,
          note: r.note,
        }));

      return {
        id: `shift_${ti}`,
        templateId: t.id,
        shiftName: t.name,
        timeRange: `${t.startTime} - ${t.endTime}`,
        iconType: iconFor(t.startTime),
        status: calcStatus(t.startTime, t.endTime),
        staffList,
      };
    });
  }, [templates, filteredRegs, currentDay]);

  const toggleExpand = (shiftId: string) => {
    setExpandedShifts((prev) => ({
      ...prev,
      [shiftId]: !prev[shiftId],
    }));
  };

  // Tổng số lượt nhân sự đăng ký trong ngày
  const totalStaffInDay = dayGroups.reduce(
    (sum, g) => sum + g.staffList.length,
    0
  );

  return (
    <div className="flex flex-col gap-5">
      {/* ── THANH ĐIỀU HƯỚNG TUẦN & BỘ LỌC CHI NHÁNH - ngang hàng cùng kích thước ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Chuyển tuần */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2.5 h-[38px] shadow-xs shrink-0">
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                title="Tuần trước"
              >
                <FontAwesomeIcon icon={faChevronLeft} fontSize={16} />
              </button>
              <div className="text-center w-[130px] shrink-0">
                <div className="font-bold text-gray-900 text-xs leading-tight">
                  {getWeekTitle()}
                </div>
                <div className="text-[11px] text-gray-400 font-normal leading-tight">
                  {getWeekRange()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                title="Tuần sau"
              >
                <FontAwesomeIcon icon={faChevronRight} fontSize={16} />
              </button>
            </div>
            {weekOffset !== 0 && (
              <button
                type="button"
                onClick={() => {
                  setWeekOffset(0);
                  setSelectedDayIndex(0);
                }}
                className="text-xs font-semibold text-primary hover:underline px-2 py-1 whitespace-nowrap"
              >
                Về hôm nay
              </button>
            )}
          </div>

          {/* Bộ lọc chi nhánh & lọc trạng thái - cố định kích thước và chống wrap lệch vị trí */}
          <div className="flex items-center gap-2.5 shrink-0">
            {isManager ? (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 h-[38px] text-xs font-medium text-gray-700 w-[230px] shrink-0">
                <FontAwesomeIcon icon={faStore} fontSize={15} className="text-primary shrink-0" />
                <span className="shrink-0">Chi nhánh: <strong className="text-gray-900">{managerBranch}</strong></span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary border border-primary-200 ml-auto">Cố định</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 h-[38px] text-xs font-medium text-gray-700 w-[230px] shrink-0">
                <FontAwesomeIcon icon={faStore} fontSize={15} className="text-primary shrink-0" />
                <span className="shrink-0">Chi nhánh:</span>
                <select
                  value={selectedBranch}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-gray-900 focus:outline-hidden cursor-pointer flex-1 min-w-0 truncate"
                >
                  <option value="all">Tất cả</option>
                  {branches.map((b) => (
                    <option key={b.id || b.slug} value={b.slug.toUpperCase()}>
                      {b.slug.toUpperCase()} ({b.name})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 h-[38px] text-xs text-gray-700 w-[175px] shrink-0">
              <FontAwesomeIcon icon={faFilter} fontSize={14} className="text-gray-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | "has_note" | "no_note")
                }
                className="bg-transparent border-none text-xs text-gray-700 focus:outline-hidden cursor-pointer flex-1 min-w-0"
              >
                <option value="all">Tất cả</option>
                <option value="has_note">Có ghi chú</option>
                <option value="no_note">Không ghi chú</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── THẺ CHỌN 7 NGÀY TRONG TUẦN (GIỐNG MOBILE) ── */}
        <div className="grid grid-cols-7 gap-2 mt-4 pt-4 border-t border-gray-100">
          {weekDays.map((day, idx) => {
            const isSelected = idx === selectedDayIndex;
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all cursor-pointer border min-h-[78px] ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20 scale-[1.02]"
                    : day.isToday
                    ? "bg-primary-50 text-primary border-primary-200 hover:bg-primary-100/50"
                    : "bg-gray-50/70 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                }`}
              >
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider ${
                    isSelected
                      ? "text-white/90"
                      : day.isToday
                      ? "text-primary font-bold"
                      : "text-gray-500"
                  }`}
                >
                  {day.key}
                </span>
                <span
                  className={`text-base font-extrabold my-0.5 ${
                    isSelected ? "text-white" : "text-gray-900"
                  }`}
                >
                  {day.date.split("/")[0]}
                </span>
                <div className="flex items-center justify-center gap-1 h-[16px] min-h-[16px]">
                  {day.isToday ? (
                    <span
                      className={`text-[10px] px-1 py-0.5 rounded font-bold leading-none ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-primary text-white"
                      }`}
                    >
                      Hôm nay
                    </span>
                  ) : (
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isSelected ? "bg-white" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TIÊU ĐỀ NGÀY ĐANG CHỌN & THỐNG KÊ ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">
              {currentDay.name}, Ngày {currentDay.fullDate}
            </h2>
            {currentDay.isToday && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary border border-primary-200">
                Hôm nay
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Thời gian biểu đăng ký ca của nhân sự chi nhánh • Chạm vào từng ca để xem chi tiết
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone="primary">
            <FontAwesomeIcon icon={faCalendar} fontSize={13} /> {dayGroups.length} ca làm việc
          </Badge>
          <Badge tone="gray">
            <FontAwesomeIcon icon={faUsers} fontSize={13} /> {totalStaffInDay} lượt đăng ký
          </Badge>
        </div>
      </div>

      {/* ── DANH SÁCH CÁC CA LÀM VIỆC TRONG NGÀY (ACCORDION GIỐNG MOBILE) ── */}
      <div className="flex flex-col gap-4">
        {dayGroups.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <FontAwesomeIcon icon={faCalendar} fontSize={30} className="text-gray-200" />
            <p className="text-sm text-gray-400 mt-3">
              {templates.length === 0
                ? "Chưa có cấu hình ca làm việc — hãy tạo khung ca ở tab Quản lý & cấu hình ca trước."
                : "Chưa có ca làm việc nào trong ngày này"}
            </p>
          </div>
        )}
        {dayGroups.map((group) => {
          const isExpanded = !!expandedShifts[group.id];

          // Lọc nhân sự theo bộ lọc trạng thái
          const visibleStaff = group.staffList.filter((s) => {
            if (statusFilter === "has_note") return Boolean(s.note && s.note.trim() !== "");
            if (statusFilter === "no_note") return !s.note || s.note.trim() === "";
            return true;
          });

          const getStatusBadge = () => {
            if (group.status === "completed") {
              return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <FontAwesomeIcon icon={faCheck} fontSize={13} /> Đã hoàn thành
                </span>
              );
            }
            if (group.status === "active") {
              return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Đang diễn ra
                </span>
              );
            }
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                <FontAwesomeIcon icon={faClock} fontSize={13} /> Sắp diễn ra
              </span>
            );
          };

          const getShiftIcon = () => {
            if (group.iconType === "morning") {
              return (
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                  <FontAwesomeIcon icon={faSun} fontSize={22} />
                </div>
              );
            }
            if (group.iconType === "afternoon") {
              return (
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200 shrink-0">
                  <FontAwesomeIcon icon={faCloudSun} fontSize={22} />
                </div>
              );
            }
            return (
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 shrink-0">
                <FontAwesomeIcon icon={faMoon} fontSize={22} />
              </div>
            );
          };

          return (
            <div
              key={group.id}
              className={`bg-white border rounded-xl overflow-hidden transition-all shadow-xs ${
                isExpanded
                  ? "border-primary/40 ring-1 ring-primary/10"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Header ca làm việc (Clickable để xổ xuống) */}
              <div
                onClick={() => toggleExpand(group.id)}
                className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-gray-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getShiftIcon()}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">
                        {group.shiftName}
                      </h3>
                      {getStatusBadge()}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1 font-mono font-medium text-gray-700">
                        <FontAwesomeIcon icon={faClock} fontSize={13} className="text-gray-400" />
                        {group.timeRange}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
                    <FontAwesomeIcon icon={faUsers} fontSize={14} className="text-primary" />
                    {group.staffList.length} nhân sự
                  </span>

                  <div className="text-gray-400 p-1">
                    {isExpanded ? (
                      <FontAwesomeIcon icon={faChevronUp} fontSize={20} className="text-primary" />
                    ) : (
                      <FontAwesomeIcon icon={faChevronDown} fontSize={20} />
                    )}
                  </div>
                </div>
              </div>

              {/* Danh sách nhân sự trong ca khi mở rộng */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                  {visibleStaff.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-xs">
                      Trống
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {visibleStaff.map((staff) => (
                        <div
                          key={staff.id}
                          onClick={() => {
                            setDetailStaff(staff);
                            setDetailGroup(group);
                            setDetailOpen(true);
                          }}
                          className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-start justify-between gap-3 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer hover:border-primary/30"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border overflow-hidden bg-emerald-50 text-emerald-700 border-emerald-200"
                            >
                              {staff.avatar ? (
                                <img src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
                              ) : (
                                staff.avatarLetter
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="font-bold text-gray-900 text-sm truncate">
                                {staff.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {staff.role} • Chi nhánh {staff.branch}
                              </div>

                              {/* Trạng thái đăng ký & Nguyện vọng */}
                              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <FontAwesomeIcon icon={faUserCheck} fontSize={12} />
                                  Đã đăng ký
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                  {staff.requestedCount} ca/tuần
                                </span>
                              </div>

                              {staff.note && (
                                <div
                                  className="mt-1.5 text-[11px] text-amber-700 italic truncate max-w-[220px] bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/60"
                                  title={staff.note}
                                >
                                  “{staff.note}”
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── MODAL CHI TIẾT ĐĂNG KÝ NGUYỆN VỌNG CA ── */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Chi tiết nguyện vọng đăng ký ca"
        size="lg"
        footer={
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <Button variant="white" onClick={() => setDetailOpen(false)} className="px-5 py-2">
              Đóng
            </Button>
          </div>
        }
      >
        {detailStaff && detailGroup && (
          <div className="flex flex-col gap-5">
            {/* Header nhân sự */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base border overflow-hidden bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0">
                {detailStaff.avatar ? (
                  <img src={detailStaff.avatar} alt={detailStaff.name} className="w-full h-full object-cover" />
                ) : (
                  detailStaff.avatarLetter
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-base">{detailStaff.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {detailStaff.role} • Chi nhánh {detailStaff.branch}
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge tone="success">
                    <FontAwesomeIcon icon={faUserCheck} fontSize={12} /> Đã gửi đăng ký
                  </Badge>
                  <Badge tone="gray">
                    {detailStaff.requestedCount} ca / tuần
                  </Badge>
                  {detailStaff.registeredAt && detailStaff.registeredAt !== "—" && (
                    <span className="text-xs text-gray-400">
                      Đăng ký lúc: {detailStaff.registeredAt}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Thông tin ca đang chọn */}
            <div className="p-4 bg-primary-50/50 rounded-xl border border-primary-200 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-primary">
                  Ca đăng ký trong ngày ({currentDay.name}, {currentDay.fullDate})
                </div>
                <div className="text-sm font-bold text-gray-900 mt-0.5">
                  {detailGroup.shiftName} ({detailGroup.timeRange})
                </div>
              </div>
              <Badge tone="primary">{detailGroup.shiftName}</Badge>
            </div>

            {/* Bảng nguyện vọng cả tuần của nhân sự */}
            {detailStaff.days && (
              <div>
                <div className="text-xs font-bold text-gray-700 mb-2">
                  Lịch đăng ký cả tuần (Thứ 2 - Chủ Nhật):
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((dayKey) => {
                    const shiftVal = detailStaff.days?.[dayKey] || "Nghỉ";
                    const isOff = shiftVal === "Nghỉ";
                    const isCurrentDay = dayKey === currentDay.key;
                    return (
                      <div
                        key={dayKey}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          isCurrentDay
                            ? "ring-2 ring-primary border-primary bg-primary-50"
                            : isOff
                            ? "bg-gray-50 border-gray-200 text-gray-400"
                            : "bg-blue-50/80 border-blue-200 text-blue-800"
                        }`}
                      >
                        <div
                          className={`text-[11px] font-bold ${
                            isCurrentDay ? "text-primary" : "text-gray-500"
                          }`}
                        >
                          {dayKey}
                        </div>
                        <div
                          className={`text-xs font-semibold mt-1 truncate ${
                            isOff ? "text-gray-400" : "text-gray-800"
                          }`}
                          title={shiftVal}
                        >
                          {isOff ? "Nghỉ" : shiftVal.replace("Ca ", "")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ghi chú / Nguyện vọng đặc biệt */}
            {detailStaff.note && (
              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200">
                <div className="text-xs font-bold text-amber-800 mb-1">
                  Ghi chú & Nguyện vọng đặc biệt:
                </div>
                <div className="text-xs text-amber-900 italic">“{detailStaff.note}”</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
