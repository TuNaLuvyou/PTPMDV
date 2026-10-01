"use strict";

const database = require("../../../../config/database");

const seedDepartments = [
  { id: "dep-ns", name: "Nhân sự", code: "NS", description: "Quản trị nhân sự", manager: "Trần Minh Tuấn", status: "hoạt động", staff: 3 },
  { id: "dep-kt", name: "Kế toán", code: "KT", description: "Tài chính kế toán", manager: "Vũ Thành Công", status: "hoạt động", staff: 2 },
];
let memory = [...seedDepartments];

async function ensureSeeded() {
  if (database.getPrisma()) {
    const prisma = database.getPrisma();
    for (const d of seedDepartments) {
      const existed = await prisma.department.findUnique({ where: { code: d.code } }).catch(() => null);
      if (!existed) await prisma.department.create({ data: d }).catch(() => {});
    }
  }
}

async function list() {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.department.findMany({ orderBy: { code: "asc" } });
    } catch (_) {}
  }
  return memory;
}

async function getById(id) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.department.findUnique({ where: { id } });
    } catch (_) {}
  }
  return memory.find((d) => d.id === id) || null;
}

async function create(payload) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.department.create({ data: payload });
    } catch (e) {
      if (String(e.code) === "P2002") {
        const err = new Error("Mã phòng ban đã tồn tại");
        err.status = 409;
        err.code = "DUPLICATE_RESOURCE";
        throw err;
      }
      throw e;
    }
  }
  if (memory.some((d) => d.code === payload.code)) {
    const err = new Error("Mã phòng ban đã tồn tại");
    err.status = 409;
    err.code = "DUPLICATE_RESOURCE";
    throw err;
  }
  const row = { id: `dep-${Date.now()}`, staff: 0, status: "hoạt động", ...payload };
  memory.push(row);
  return row;
}

async function update(id, payload) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.department.update({ where: { id }, data: payload });
    } catch (_) {}
  }
  const idx = memory.findIndex((d) => d.id === id);
  if (idx < 0) return null;
  memory[idx] = { ...memory[idx], ...payload };
  return memory[idx];
}

async function remove(id) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      await prisma.department.delete({ where: { id } });
      return true;
    } catch (_) {}
  }
  const idx = memory.findIndex((d) => d.id === id);
  if (idx < 0) return false;
  memory.splice(idx, 1);
  return true;
}

module.exports = { list, getById, create, update, remove, ensureSeeded };
