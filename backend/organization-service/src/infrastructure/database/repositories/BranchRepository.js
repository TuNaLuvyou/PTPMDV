"use strict";

// Repository Branch: Postgres qua Prisma, fallback memory.
const database = require("../../../../config/database");

const seedBranches = [
  { id: "br-hn1", name: "Hoàn Kiếm", slug: "HN-1", address: "Hà Nội", phone: "0240001", manager: "Trần Minh Tuấn", status: "hoạt động", staff: 10 },
  { id: "br-hn2", name: "Cầu Giấy", slug: "HN-2", address: "Hà Nội", phone: "0240002", manager: "Vũ Thành Công", status: "hoạt động", staff: 8 },
  { id: "br-dn1", name: "Đà Nẵng", slug: "DN-1", address: "Đà Nẵng", phone: "0236001", manager: "Nguyễn Thu Hà", status: "hoạt động", staff: 5 },
];
let memory = [...seedBranches];

async function ensureSeeded() {
  if (database.getPrisma()) {
    const prisma = database.getPrisma();
    for (const b of seedBranches) {
      const existed = await prisma.branch.findUnique({ where: { slug: b.slug } }).catch(() => null);
      if (!existed) await prisma.branch.create({ data: b }).catch(() => {});
    }
  }
}

async function list() {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.branch.findMany({ orderBy: { slug: "asc" } });
    } catch (_) {}
  }
  return memory;
}

async function getBySlug(slug) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.branch.findUnique({ where: { slug } });
    } catch (_) {}
  }
  return memory.find((b) => b.slug === slug) || null;
}

async function create(payload) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.branch.create({ data: payload });
    } catch (e) {
      if (String(e.code) === "P2002") {
        const err = new Error("Slug chi nhánh đã tồn tại");
        err.status = 409;
        err.code = "DUPLICATE_RESOURCE";
        throw err;
      }
      throw e;
    }
  }
  if (memory.some((b) => b.slug === payload.slug)) {
    const err = new Error("Slug chi nhánh đã tồn tại");
    err.status = 409;
    err.code = "DUPLICATE_RESOURCE";
    throw err;
  }
  const row = { id: `br-${Date.now()}`, staff: 0, status: "hoạt động", ...payload };
  memory.push(row);
  return row;
}

async function update(slug, payload) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.branch.update({ where: { slug }, data: payload });
    } catch (_) {}
  }
  const idx = memory.findIndex((b) => b.slug === slug);
  if (idx < 0) return null;
  memory[idx] = { ...memory[idx], ...payload };
  return memory[idx];
}

async function remove(slug) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      await prisma.branch.delete({ where: { slug } });
      return true;
    } catch (_) {}
  }
  const idx = memory.findIndex((b) => b.slug === slug);
  if (idx < 0) return false;
  memory.splice(idx, 1);
  return true;
}

module.exports = { list, getBySlug, create, update, remove, ensureSeeded };
