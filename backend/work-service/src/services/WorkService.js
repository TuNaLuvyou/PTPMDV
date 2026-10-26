"use strict";

const database = require("../config/database");

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

const seedShifts = [];
const seedTasks = [];
let memoryShifts = [];
let memoryAttendances = [];
let memoryTasks = [];
let memoryRegistrations = [];
let memoryConfig = { id: "default", latePenaltyAmount: 20000, earlyLeavePenaltyAmount: 0, gracePeriodMinutes: 5, autoCloseShift: false, shiftSwapMode: "manual", latePenaltyPct: 10, earlyLeavePenaltyPct: 10, earlyCheckinMinutes: 15, maxPenaltiesPerMonth: 10, deductOnCheckout: true, allowDoubleCheckin: true, maxCheckinsPerDay: 3, maxSwapsPerMonth: 3, requireReasonSwap: true };
let memoryTemplates = [];

// Các cột mà bảng shifts thực sự có — lọc bỏ field lạ trước khi ghi Prisma,
// tránh việc create/update fail âm thầm rồi rơi về memory (mất dữ liệu khi reload).
const SHIFT_WRITABLE_FIELDS = [
  "employeeId",
  "branchSlug",
  "date",
  "template",
  "scheduledStart",
  "scheduledEnd",
  "checkIn",
  "checkOut",
  "status",
  "note",
  "isRecurring",
];

function pickShiftPayload(payload = {}) {
  const data = {};
  for (const key of SHIFT_WRITABLE_FIELDS) {
    if (payload[key] !== undefined) data[key] = payload[key];
  }
  return data;
}

const REGISTRATION_WRITABLE_FIELDS = ["employeeId", "branchSlug", "week", "shiftId", "wish"];function pickRegistrationPayload(payload = {}) {
  const data = {};
  for (const key of REGISTRATION_WRITABLE_FIELDS) {
    if (payload[key] !== undefined) data[key] = payload[key];
  }
  // Mobile gửi `preference`, schema lưu ở cột `wish`.
  if (data.wish === undefined && payload.preference !== undefined) {
    data.wish = payload.preference;
  }
  return data;
}

// Mã ca người dùng nhìn thấy: MC-XXXX. `id` (cuid) vẫn là khóa nội bộ để
// attendance/registration tham chiếu, không đổi.
const SHIFT_CODE_PATTERN = /^MC-(\d+)$/;

function computeNextShiftCode(codes = []) {
  let max = 0;
  for (const code of codes) {
    const match = SHIFT_CODE_PATTERN.exec(typeof code === "string" ? code : "");
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `MC-${String(max + 1).padStart(4, "0")}`;
}

async function nextShiftCode(prisma) {
  if (prisma) {
    const rows = await prisma.shift.findMany({ select: { code: true } });
    return computeNextShiftCode(rows.map((r) => r.code));
  }
  return computeNextShiftCode(memoryShifts.map((s) => s.code));
}

async function ensureSeeded() {
  const prisma = database.getPrisma();
  if (!prisma) return { mode: "memory" };
  // KHÔNG xoá dữ liệu nghiệp vụ khi khởi động (trước đây deleteMany làm mất
  // toàn bộ ca/phân công mỗi lần restart server). Chỉ đảm bảo cấu hình mặc định tồn tại.
  try {
    await prisma.attendanceConfig.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    });
  } catch (e) {
    console.warn("[work-service] Không khởi tạo được cấu hình chấm công:", e.message);
  }
  return { mode: "postgres" };
}

// --- Shifts ---
async function listShifts(query = {}) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      const where = {};
      if (query.branchSlug) where.branchSlug = query.branchSlug;
      if (query.employeeId) where.employeeId = query.employeeId;
      if (query.date) where.date = query.date;
      return await prisma.shift.findMany({ where, orderBy: { date: "desc" } });
    } catch (_) {}
  }
  return memoryShifts.filter((s) => {
    if (query.branchSlug && s.branchSlug !== query.branchSlug) return false;
    if (query.employeeId && s.employeeId !== query.employeeId) return false;
    if (query.date && s.date !== query.date) return false;
    return true;
  });
}

async function createShift(payload) {
  const data = pickShiftPayload(payload);
  const prisma = database.getPrisma();
  if (prisma) {
    // Sinh mã ca tuần tự; nếu 2 request đồng thời trùng mã thì thử lại.
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await prisma.shift.create({
          data: { ...data, code: await nextShiftCode(prisma) },
        });
      } catch (e) {
        if (e && e.code === "P2002" && String(e.meta?.target || "").includes("code")) continue;
        throw e;
      }
    }
    const err = new Error("Không thể sinh mã ca, vui lòng thử lại");
    err.status = 409;
    err.code = "DUPLICATE_RESOURCE";
    throw err;
  }
  const row = { id: uid("sh"), code: await nextShiftCode(null), status: "đang làm", ...data };
  memoryShifts.push(row);
  return row;
}

async function updateShift(id, payload) {
  const data = pickShiftPayload(payload);
  const prisma = database.getPrisma();
  if (prisma) {
    return await prisma.shift.update({ where: { id }, data });
  }
  const idx = memoryShifts.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  memoryShifts[idx] = { ...memoryShifts[idx], ...data };
  return memoryShifts[idx];
}

async function deleteShift(id) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      await prisma.shift.delete({ where: { id } });
      return true;
    } catch (e) {
      // P2025 = bản ghi không tồn tại -> trả false để controller báo 404.
      if (e.code === "P2025") return false;
      throw e;
    }
  }
  const idx = memoryShifts.findIndex((s) => s.id === id);
  if (idx < 0) return false;
  memoryShifts.splice(idx, 1);
  return true;
}

// Lưu chấm công cho một phân công ca: ghi giờ vào/ra + trạng thái vào bảng
// shifts, đồng thời upsert bản ghi attendances để bảng lương/báo cáo thấy.
async function updateShiftAttendance(shiftId, payload = {}) {
  const checkIn = normalizeAttendanceTime(payload.checkIn, "Giờ check-in");
  const checkOut = normalizeAttendanceTime(payload.checkOut, "Giờ check-out");

  const prisma = database.getPrisma();
  if (prisma) {
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    if (!shift) return null;

    const status = computeShiftAttendanceStatus(shift, checkIn, checkOut);
    const ops = [
      prisma.shift.update({ where: { id: shiftId }, data: { checkIn, checkOut, status } }),
    ];

    if (!checkIn) {
      // Hủy chấm công -> xóa bản ghi attendance tương ứng.
      ops.push(prisma.attendance.deleteMany({ where: { shiftId } }));
    } else {
      const existing = await prisma.attendance.findFirst({
        where: { shiftId },
        orderBy: { createdAt: "desc" },
      });
      const data = {
        employeeId: shift.employeeId,
        shiftId,
        date: String(shift.date || "").replace(/\//g, "-"),
        checkIn,
        checkOut,
        penaltyAmount: 0,
        status: toAttendanceStatus(status),
      };
      ops.push(
        existing
          ? prisma.attendance.update({ where: { id: existing.id }, data })
          : prisma.attendance.create({ data: { id: uid("att"), ...data } })
      );
    }

    const [updated] = await prisma.$transaction(ops);
    return updated;
  }

  const idx = memoryShifts.findIndex((s) => s.id === shiftId);
  if (idx < 0) return null;
  const shift = memoryShifts[idx];
  const status = computeShiftAttendanceStatus(shift, checkIn, checkOut);
  memoryShifts[idx] = { ...shift, checkIn, checkOut, status };

  if (!checkIn) {
    memoryAttendances = memoryAttendances.filter((a) => a.shiftId !== shiftId);
  } else {
    const row = {
      id: uid("att"),
      employeeId: shift.employeeId,
      shiftId,
      date: String(shift.date || "").replace(/\//g, "-"),
      checkIn,
      checkOut,
      penaltyAmount: 0,
      status: toAttendanceStatus(status),
    };
    const attIdx = memoryAttendances.findIndex((a) => a.shiftId === shiftId);
    if (attIdx >= 0) memoryAttendances[attIdx] = { ...memoryAttendances[attIdx], ...row };
    else memoryAttendances.push(row);
  }
  return memoryShifts[idx];
}

async function registerShift(payload) {
  const data = pickRegistrationPayload(payload);
  const prisma = database.getPrisma();
  if (prisma) {
    return await prisma.shiftRegistration.create({ data });
  }
  const row = { id: uid("reg"), ...data };
  memoryRegistrations.push(row);
  return row;
}

async function listRegistrations(query = {}) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      const where = {};
      if (query.branchSlug) where.branchSlug = query.branchSlug;
      if (query.week) where.week = query.week;
      return await prisma.shiftRegistration.findMany({ where });
    } catch (_) {}
  }
  return memoryRegistrations.filter((r) => {
    if (query.branchSlug && r.branchSlug !== query.branchSlug) return false;
    if (query.week && r.week !== query.week) return false;
    return true;
  });
}

// --- Attendance ---
function minutesOf(hhmm) {
  if (!hhmm || !hhmm.includes(":")) return null;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

const ATTENDANCE_TIME_PATTERN = /^([01]?\d|2[0-3]):[0-5]\d$/;

function normalizeAttendanceTime(value, label) {
  if (value === null || value === undefined || value === "") return null;
  const raw = String(value).trim();
  if (!ATTENDANCE_TIME_PATTERN.test(raw)) {
    const err = new Error(`${label} không hợp lệ (định dạng HH:MM)`);
    err.status = 400;
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  const [h, m] = raw.split(":");
  return `${h.padStart(2, "0")}:${m}`;
}

// Trạng thái ca sau khi chấm công: ưu tiên Trễ, rồi Về sớm, còn lại Đúng giờ.
function computeShiftAttendanceStatus(shift, checkIn, checkOut) {
  if (!checkIn) return "Chưa làm";
  const start = minutesOf(shift.scheduledStart);
  const end = minutesOf(shift.scheduledEnd);
  const inMin = minutesOf(checkIn);
  const outMin = minutesOf(checkOut);

  if (start !== null && inMin !== null && inMin - start > 5) return "Trễ";

  if (end !== null && outMin !== null) {
    let endMin = end;
    let outAdj = outMin;
    const startAdj = start ?? 0;
    // Ca qua nửa đêm (VD 22:00 - 06:00).
    if (endMin <= startAdj) endMin += 1440;
    if (outAdj < startAdj) outAdj += 1440;
    if (outAdj < endMin) return "Về sớm";
  }

  return "Đúng giờ";
}

function toAttendanceStatus(shiftStatus) {
  if (shiftStatus === "Trễ") return "late";
  if (shiftStatus === "Về sớm") return "early_leave";
  return "present";
}

async function getConfig() {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      const cfg = await prisma.attendanceConfig.findUnique({ where: { id: "default" } });
      if (cfg) return cfg;
    } catch (_) {}
  }
  return memoryConfig;
}

async function updateConfig(payload) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.attendanceConfig.update({ where: { id: "default" }, data: payload });
    } catch (_) {}
  }
  memoryConfig = { ...memoryConfig, ...payload };
  return memoryConfig;
}

async function checkin({ employeeId, shiftId, time }) {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const row = {
    id: uid("att"),
    employeeId,
    shiftId: shiftId || null,
    date: `${dd}-${mm}-${yyyy}`,
    checkIn: time || `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    checkOut: null,
    penaltyAmount: 0,
    penaltyNote: null,
    status: "present",
  };
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.attendance.create({ data: row });
    } catch (_) {}
  }
  memoryAttendances.push(row);
  return row;
}

async function checkout({ employeeId, shiftId, time }) {
  const cfg = await getConfig();
  const prisma = database.getPrisma();
  // Tìm bản ghi hôm nay chưa checkout
  let target = null;
  if (prisma) {
    try {
      const rows = await prisma.attendance.findMany({ where: { employeeId }, orderBy: { createdAt: "desc" } });
      target = rows.find((r) => !r.checkOut) || null;
      if (target) {
        const out = time || "17:30";
        // Phạt đơn giản: checkout rỗng -> về sớm nếu có giờ chuẩn? Giữ tối thiểu: không phạt khi đủ, phạt earlyLeave khi time < 17:00
        let penalty = 0;
        let status = "present";
        const outMin = minutesOf(out);
        if (outMin !== null && outMin < 17 * 60) {
          penalty = cfg.earlyLeavePenaltyAmount || 0;
          status = "early_leave";
        }
        return await prisma.attendance.update({ where: { id: target.id }, data: { checkOut: out, penaltyAmount: penalty, status } });
      }
    } catch (_) {}
  }
  target = [...memoryAttendances].reverse().find((r) => r.employeeId === employeeId && !r.checkOut) || null;
  const out = time || "17:30";
  if (!target) {
    const ci = await checkin({ employeeId, shiftId, time: "08:00" });
    target = ci;
  }
  let penalty = 0;
  let status = "present";
  const outMin = minutesOf(out);
  if (outMin !== null && outMin < 17 * 60) {
    penalty = cfg.earlyLeavePenaltyAmount || 0;
    status = "early_leave";
  }
  target.checkOut = out;
  target.penaltyAmount = penalty;
  target.status = status;
  return target;
}

async function listAttendance(query = {}) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      const where = {};
      if (query.employeeId) where.employeeId = query.employeeId;
      if (query.branchSlug) {
        // attendance không lưu branchSlug: lọc theo shift
        const shifts = await prisma.shift.findMany({ where: { branchSlug: query.branchSlug } });
        const ids = new Set(shifts.map((s) => s.id));
        const all = await prisma.attendance.findMany({ orderBy: { createdAt: "desc" } });
        let out = all.filter((a) => (query.employeeId ? a.employeeId === query.employeeId : true));
        if (query.date) out = out.filter((a) => a.date === query.date);
        if (query.branchSlug) out = out.filter((a) => (a.shiftId ? ids.has(a.shiftId) : false));
        // month=YYYY-MM -> lọc theo date DD-MM-YYYY
        if (query.month) {
          const [yy, mon] = query.month.split("-");
          out = out.filter((a) => {
            const parts = a.date.split("-");
            return parts[2] === yy && parts[1] === mon;
          });
        }
        return out;
      }
      let rows = await prisma.attendance.findMany({ where, orderBy: { createdAt: "desc" } });
      if (query.date) rows = rows.filter((a) => a.date === query.date);
      if (query.month) {
        const [yy, mon] = query.month.split("-");
        rows = rows.filter((a) => {
          const parts = a.date.split("-");
          return parts[2] === yy && parts[1] === mon;
        });
      }
      return rows;
    } catch (_) {}
  }
  let out = [...memoryAttendances];
  if (query.employeeId) out = out.filter((a) => a.employeeId === query.employeeId);
  if (query.date) out = out.filter((a) => a.date === query.date);
  if (query.month) {
    const [yy, mon] = query.month.split("-");
    out = out.filter((a) => {
      const parts = a.date.split("-");
      return parts[2] === yy && parts[1] === mon;
    });
  }
  return out;
}

// --- Tasks ---
// Cột thật của bảng tasks. Lọc bỏ field lạ để Prisma không ném lỗi rồi
// service âm thầm ghi vào memory (mất dữ liệu khi reload).
const TASK_WRITABLE_FIELDS = [
  "title",
  "description",
  "assignedTo",
  "assignedToName",
  "assignedToEmail",
  "assignedByName",
  "branchSlug",
  "shiftName",
  "sourceType",
  "priority",
  "dueDate",
  "status",
  "completedAt",
  "requirePhoto",
  "proofPhotoUrl",
  "photoSubmittedBy",
  "photoSubmittedAt",
];

// Mobile cũ gửi tên field khác -> map về cột chuẩn.
const TASK_PAYLOAD_ALIASES = {
  assigneeId: "assignedTo",
  proofUrl: "proofPhotoUrl",
};

const TASK_NULLABLE_STRINGS = [
  "description",
  "assignedTo",
  "assignedToName",
  "assignedToEmail",
  "assignedByName",
  "branchSlug",
  "shiftName",
  "dueDate",
  "completedAt",
  "proofPhotoUrl",
  "photoSubmittedBy",
  "photoSubmittedAt",
];

function pickTaskPayload(payload = {}) {
  const source = { ...payload };
  for (const [alias, field] of Object.entries(TASK_PAYLOAD_ALIASES)) {
    if (source[field] === undefined && source[alias] !== undefined) source[field] = source[alias];
  }

  const data = {};
  for (const key of TASK_WRITABLE_FIELDS) {
    if (source[key] !== undefined) data[key] = source[key];
  }

  if (typeof data.title === "string") data.title = data.title.trim();
  for (const key of TASK_NULLABLE_STRINGS) {
    if (typeof data[key] === "string") {
      data[key] = data[key].trim();
      if (data[key] === "") data[key] = null;
    }
  }
  if (typeof data.requirePhoto === "string") {
    data.requirePhoto = data.requirePhoto === "true" || data.requirePhoto === "1";
  }
  return data;
}

async function listTasks(query = {}) {
  const prisma = database.getPrisma();
  if (prisma) {
    const where = {};
    if (query.branchSlug) where.branchSlug = query.branchSlug;
    if (query.assignedTo) where.assignedTo = query.assignedTo;
    if (query.status) where.status = query.status;
    return await prisma.task.findMany({ where, orderBy: { createdAt: "desc" } });
  }
  return memoryTasks.filter((t) => {
    if (query.branchSlug && t.branchSlug !== query.branchSlug) return false;
    if (query.assignedTo && t.assignedTo !== query.assignedTo) return false;
    if (query.status && t.status !== query.status) return false;
    return true;
  });
}

async function createTask(payload) {
  const data = pickTaskPayload(payload);
  const prisma = database.getPrisma();
  if (prisma) {
    return await prisma.task.create({ data });
  }
  const row = { id: uid("t"), status: "pending", createdAt: new Date(), updatedAt: new Date(), ...data };
  memoryTasks.unshift(row);
  return row;
}

async function updateTask(id, payload) {
  const data = pickTaskPayload(payload);
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.task.update({ where: { id }, data });
    } catch (e) {
      if (e && e.code === "P2025") return null;
      throw e;
    }
  }
  const idx = memoryTasks.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  memoryTasks[idx] = { ...memoryTasks[idx], ...data, updatedAt: new Date() };
  return memoryTasks[idx];
}

async function deleteTask(id) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      await prisma.task.delete({ where: { id } });
      return true;
    } catch (e) {
      if (e && e.code === "P2025") return false;
      throw e;
    }
  }
  const idx = memoryTasks.findIndex((t) => t.id === id);
  if (idx < 0) return false;
  memoryTasks.splice(idx, 1);
  return true;
}

async function getShiftById(id) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      const row = await prisma.shift.findUnique({ where: { id } });
      if (row) return row;
    } catch (_) {}
  }
  return memoryShifts.find((s) => s.id === id) || null;
}

async function getTaskById(id) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      const row = await prisma.task.findUnique({ where: { id } });
      if (row) return row;
    } catch (_) {}
  }
  return memoryTasks.find((t) => t.id === id) || null;
}

async function listTemplates() {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.shiftTemplate.findMany({ orderBy: { createdAt: "asc" } });
    } catch (_) {}
  }
  return memoryTemplates;
}

async function createTemplate(payload) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.shiftTemplate.create({ data: payload });
    } catch (_) {}
  }
  const row = { id: uid("st"), ...payload };
  memoryTemplates.push(row);
  return row;
}

async function updateTemplate(id, payload) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.shiftTemplate.update({ where: { id }, data: payload });
    } catch (_) {}
  }
  const idx = memoryTemplates.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  memoryTemplates[idx] = { ...memoryTemplates[idx], ...payload };
  return memoryTemplates[idx];
}

async function deleteTemplate(id) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      await prisma.shiftTemplate.delete({ where: { id } });
      return true;
    } catch (_) {}
  }
  const idx = memoryTemplates.findIndex((t) => t.id === id);
  if (idx < 0) return false;
  memoryTemplates.splice(idx, 1);
  return true;
}

module.exports = {
  ensureSeeded,
  listShifts,
  createShift,
  updateShift,
  deleteShift,
  updateShiftAttendance,
  registerShift,
  listRegistrations,
  getShiftById,
  getConfig,
  updateConfig,
  checkin,
  checkout,
  listAttendance,
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
