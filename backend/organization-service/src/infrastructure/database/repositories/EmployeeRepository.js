"use strict";

const database = require("../../../../config/database");
const BranchRepository = require("./BranchRepository");

const seedEmployees = [
  { id: "e-admin", name: "Trần Minh Tuấn", email: "admin@company.com", branchSlug: null, department: null, role: "Quản trị viên", systemRole: "admin", status: "đang làm", joinDate: "01-01-2024", baseSalary: 20000000, salaryType: "monthly" },
];
let memory = [...seedEmployees];

async function ensureSeeded() {
  if (database.getPrisma()) {
    const prisma = database.getPrisma();
    for (const e of seedEmployees) {
      const existed = await prisma.employee.findUnique({ where: { email: e.email } }).catch(() => null);
      if (!existed) await prisma.employee.create({ data: e }).catch(() => {});
    }
  }
}

function applyFilter(rows, query) {
  let out = rows;
  if (query.email) out = out.filter((e) => e.email && e.email.toLowerCase() === query.email.toLowerCase().trim());
  if (query.branchSlug) out = out.filter((e) => e.branchSlug === query.branchSlug);
  if (query.departmentId || query.department) {
    const dep = query.departmentId || query.department;
    out = out.filter((e) => e.department === dep);
  }
  if (query.systemRole) out = out.filter((e) => e.systemRole === query.systemRole);
  return out;
}

function formatEmployee(r) {
  if (!r) return null;
  return {
    ...r,
    branch: r.branchSlug ? r.branchSlug.toUpperCase() : "",
    cccdFrontUrl: r.cccdFront || null,
    cccdBackUrl: r.cccdBack || null,
  };
}

async function list(query = {}) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      const where = {};
      if (query.email) where.email = query.email.toLowerCase().trim();
      if (query.branchSlug) where.branchSlug = query.branchSlug;
      if (query.systemRole) where.systemRole = query.systemRole;
      if (query.departmentId || query.department) where.department = query.departmentId || query.department;
      const rows = await prisma.employee.findMany({ where, orderBy: { createdAt: "desc" } });
      return rows.map(formatEmployee);
    } catch (err) {
      console.error("[EmployeeRepository.list] Lỗi Prisma:", err.message);
    }
  }
  return applyFilter(memory, query).map(formatEmployee);
}

async function getById(id) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      const r = await prisma.employee.findUnique({ where: { id } });
      return formatEmployee(r);
    } catch (err) {
      console.error("[EmployeeRepository.getById] Lỗi Prisma:", err.message);
    }
  }
  const found = memory.find((e) => e.id === id) || null;
  return formatEmployee(found);
}

function validationError(message) {
  const err = new Error(message);
  err.status = 400;
  err.code = "VALIDATION_ERROR";
  return err;
}

async function resolveBranchSlug(payload, { required, strict } = {}) {
  const { branch, ...data } = payload;
  const raw = data.branchSlug !== undefined ? data.branchSlug : branch;
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    if (required) throw validationError("Mã chi nhánh làm việc là bắt buộc");
    data.branchSlug = null;
    return data;
  }
  const code = String(raw).trim();
  const branches = await BranchRepository.list().catch(() => []);
  const matched = (branches || []).find(
    (b) => String(b.slug || "").toUpperCase() === code.toUpperCase() || String(b.id) === code
  );
  if (!matched) {
    if (strict) {
      throw validationError(`Mã chi nhánh "${code}" không tồn tại. Vui lòng chọn chi nhánh trong danh sách.`);
    }
    data.branchSlug = null;
    return data;
  }
  data.branchSlug = matched.slug;
  return data;
}

function cleanEmployeeData(raw) {
  const allowed = [
    "name", "email", "phone", "gender", "birthDate",
    "province", "ward", "street", "cccd", "issueDate", "issuePlace",
    "cccdFront", "cccdBack", "branchSlug", "department", "role",
    "systemRole", "status", "joinDate", "baseSalary", "salaryType",
    "hourlySalary", "bankName", "bankAccountNumber", "bankAccountName"
  ];

  const out = {};
  for (const k of allowed) {
    if (raw[k] !== undefined) {
      out[k] = raw[k];
    }
  }

  // Hỗ trợ alias từ web & mobile
  if (raw.branch !== undefined && out.branchSlug === undefined) {
    out.branchSlug = raw.branch ? String(raw.branch).toLowerCase() : null;
  }
  if (raw.cccdFrontUrl !== undefined && out.cccdFront === undefined) {
    out.cccdFront = raw.cccdFrontUrl;
  }
  if (raw.cccdBackUrl !== undefined && out.cccdBack === undefined) {
    out.cccdBack = raw.cccdBackUrl;
  }

  // Đảm bảo cccdFront / cccdBack là String URL hợp lệ hoặc null (tuyệt đối không nhận boolean)
  if (typeof out.cccdFront !== "string" || !out.cccdFront.trim()) {
    out.cccdFront = null;
  }
  if (typeof out.cccdBack !== "string" || !out.cccdBack.trim()) {
    out.cccdBack = null;
  }

  // Ép kiểu số cho lương
  if (out.baseSalary !== undefined) {
    out.baseSalary = typeof out.baseSalary === "number" ? out.baseSalary : parseFloat(out.baseSalary) || 0;
  }
  if (out.hourlySalary !== undefined) {
    out.hourlySalary = typeof out.hourlySalary === "number" ? out.hourlySalary : parseFloat(out.hourlySalary) || 0;
  }

  // Bỏ các thuộc tính không được ghi đè
  delete out.id;
  delete out.createdAt;
  delete out.updatedAt;

  return out;
}

async function create(payload) {
  if (!["admin", "manager", "staff"].includes(payload.systemRole || "staff")) {
    throw validationError("Vai trò hệ thống không hợp lệ");
  }
  const resolved = await resolveBranchSlug(payload, { required: false, strict: false });
  const data = cleanEmployeeData(resolved);

  const prisma = database.getPrisma();
  if (prisma) {
    try {
      const created = await prisma.employee.create({ data });
      memory.push(created);
      return formatEmployee(created);
    } catch (e) {
      if (String(e.code) === "P2002") {
        const err = new Error("Email đã tồn tại");
        err.status = 409;
        err.code = "DUPLICATE_RESOURCE";
        throw err;
      }
      console.error("[EmployeeRepository.create] Lỗi Prisma:", e.message);
      throw e;
    }
  }
  if (memory.some((e) => e.email === data.email)) {
    const err = new Error("Email đã tồn tại");
    err.status = 409;
    err.code = "DUPLICATE_RESOURCE";
    throw err;
  }
  const row = { id: `e-${Date.now()}`, status: "đang làm", salaryType: "monthly", baseSalary: 0, ...data };
  memory.push(row);
  return formatEmployee(row);
}

async function update(id, payload) {
  if (payload.systemRole && !["admin", "manager", "staff"].includes(payload.systemRole)) {
    throw validationError("Vai trò hệ thống không hợp lệ");
  }
  const resolved = await resolveBranchSlug(payload, { required: false, strict: false });
  const data = cleanEmployeeData(resolved);

  const prisma = database.getPrisma();
  if (prisma) {
    try {
      const updated = await prisma.employee.update({ where: { id }, data });
      const idx = memory.findIndex((e) => e.id === id);
      if (idx >= 0) memory[idx] = { ...memory[idx], ...updated };
      else memory.push(updated);
      return formatEmployee(updated);
    } catch (err) {
      console.error("[EmployeeRepository.update] Lỗi Prisma:", err.message);
      throw err;
    }
  }
  const idx = memory.findIndex((e) => e.id === id);
  if (idx < 0) return null;
  memory[idx] = { ...memory[idx], ...data };
  return formatEmployee(memory[idx]);
}

async function remove(id) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      await prisma.employee.delete({ where: { id } });
      const idx = memory.findIndex((e) => e.id === id);
      if (idx >= 0) memory.splice(idx, 1);
      return true;
    } catch (err) {
      console.error("[EmployeeRepository.remove] Lỗi Prisma:", err.message);
    }
  }
  const idx = memory.findIndex((e) => e.id === id);
  if (idx < 0) return false;
  memory.splice(idx, 1);
  return true;
}

module.exports = { list, getById, create, update, remove, ensureSeeded };
