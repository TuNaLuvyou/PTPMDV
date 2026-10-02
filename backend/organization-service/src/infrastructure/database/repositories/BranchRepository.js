"use strict";

// Repository Branch: Postgres qua Prisma, fallback memory.
const database = require("../../../../config/database");

const seedBranches = [
  { name: "Chi nhánh Hoàn Kiếm", slug: "hn-1", address: "123 Trương Định, Hoàn Kiếm, Hà Nội", phone: "02438230000", status: "hoạt động" },
  { name: "Chi nhánh Hà Đông", slug: "hn-2", address: "200 Quang Trung, Hà Đông, Hà Nội", phone: "02438380000", status: "hoạt động" },
  { name: "Chi nhánh Đống Đa", slug: "dn-1", address: "45 Chùa Bộc, Đống Đa, Hà Nội", phone: "02438560000", status: "hoạt động" },
];
let memory = [...seedBranches];

async function ensureSeeded() {
  const prisma = database.getPrisma();
  if (prisma) {
    // Chỉ tạo chi nhánh mặc định khi bảng còn trống — không xoá dữ liệu đang có.
    const count = await prisma.branch.count().catch(() => 0);
    if (count === 0) {
      for (const b of seedBranches) {
        await prisma.branch.upsert({
          where: { slug: b.slug },
          update: {},
          create: { ...b, staff: 0 },
        }).catch(() => {});
      }
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
      return await prisma.branch.findFirst({
        where: {
          OR: [
            { slug },
            { id: slug },
            { slug: { equals: slug, mode: "insensitive" } },
          ],
        },
      });
    } catch (_) {}
  }
  return (
    memory.find(
      (b) =>
        b.slug === slug ||
        b.id === slug ||
        (b.slug && b.slug.toLowerCase() === slug.toLowerCase())
    ) || null
  );
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
      const existing = await prisma.branch.findFirst({
        where: {
          OR: [
            { slug },
            { id: slug },
            { slug: { equals: slug, mode: "insensitive" } },
          ],
        },
      });
      if (existing) {
        const oldSlug = existing.slug;
        const updated = await prisma.branch.update({
          where: { id: existing.id },
          data: payload,
        });
        // Cascade: update employees' branchSlug if slug changed
        if (payload.slug && payload.slug !== oldSlug) {
          await prisma.employee.updateMany({
            where: { branchSlug: oldSlug },
            data: { branchSlug: payload.slug },
          });
        }
        return updated;
      }
    } catch (_) {}
  }
  const idx = memory.findIndex(
    (b) =>
      b.slug === slug ||
      b.id === slug ||
      (b.slug && b.slug.toLowerCase() === slug.toLowerCase())
  );
  if (idx < 0) return null;
  memory[idx] = { ...memory[idx], ...payload };
  return memory[idx];
}

async function remove(identifier) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      const existing = await prisma.branch.findFirst({
        where: {
          OR: [
            { slug: identifier },
            { id: identifier },
            { slug: { equals: identifier, mode: "insensitive" } },
          ],
        },
      });
      if (existing) {
        await prisma.employee
          .updateMany({
            where: { branchSlug: existing.slug },
            data: { branchSlug: null },
          })
          .catch(() => {});
        await prisma.branch.delete({ where: { id: existing.id } });
        return true;
      }
    } catch (e) {
      console.warn("[BranchRepository] remove prisma error:", e.message);
    }
  }
  const idx = memory.findIndex(
    (b) =>
      b.slug === identifier ||
      b.id === identifier ||
      (b.slug && b.slug.toLowerCase() === identifier.toLowerCase())
  );
  if (idx < 0) return false;
  memory.splice(idx, 1);
  return true;
}

module.exports = { list, getBySlug, create, update, remove, ensureSeeded };
