"use strict";

// Repository User: ưu tiên Postgres qua Prisma, fallback memory seed 3 TK demo.
// Không import chéo service khác.
const bcrypt = require("bcryptjs");
const database = require("../../../../config/database");

const SEED_DEFS = [
  { id: "e-admin", email: "admin@company.com", name: "Trần Minh Tuấn", role: "admin", roleTitle: "Quản trị viên", branchSlug: "HN-1" },
  { id: "e-mgr-hn1", email: "manager@company.com", name: "Vũ Thành Công", role: "manager", roleTitle: "Quản lý chi nhánh", branchSlug: "HN-1" },
  { id: "e-staff-1", email: "nhanvien@company.com", name: "Nguyễn Thu Hà", role: "staff", roleTitle: "Nhân viên", branchSlug: "HN-1" },
];

const memoryUsers = SEED_DEFS.map((u) => ({
  ...u,
  passwordHash: bcrypt.hashSync("123456", 10),
}));

async function findByEmail(email) {
  const prisma = database.getPrisma();
  if (!prisma) return memoryUsers.find((u) => u.email === email) || null;
  const row = await prisma.user.findUnique({ where: { email } });
  return row || null;
}

async function findById(id) {
  const prisma = database.getPrisma();
  if (!prisma) return memoryUsers.find((u) => u.id === id) || null;
  const row = await prisma.user.findUnique({ where: { id } });
  return row || null;
}

async function ensureSeeded() {
  const prisma = database.getPrisma();
  if (!prisma) return { mode: "memory", count: memoryUsers.length };
  for (const def of SEED_DEFS) {
    const existed = await prisma.user.findUnique({ where: { email: def.email } });
    if (!existed) {
      await prisma.user.create({
        data: { ...def, passwordHash: bcrypt.hashSync("123456", 10) },
      });
    }
  }
  const count = await prisma.user.count();
  return { mode: "postgres", count };
}

async function updatePassword(id, passwordHash) {
  const prisma = database.getPrisma();
  if (!prisma) {
    const u = memoryUsers.find((u) => u.id === id);
    if (u) u.passwordHash = passwordHash;
    return;
  }
  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });
}

module.exports = { findByEmail, findById, updatePassword, ensureSeeded };

