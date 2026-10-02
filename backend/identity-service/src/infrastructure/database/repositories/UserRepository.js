"use strict";

// Repository User: ưu tiên Postgres qua Prisma, fallback memory seed 3 TK demo.
const bcrypt = require("bcryptjs");
const database = require("../../../../config/database");
const config = require("../../../../config");

const SEED_DEFS = [
  { id: "e-admin", email: "admin@company.com", name: "Trần Minh Tuấn", role: "admin", roleTitle: "Quản trị viên", branchSlug: null },
];

const memoryUsers = SEED_DEFS.map((u) => ({
  ...u,
  passwordHash: bcrypt.hashSync("123456", 10),
}));

async function findByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();
  const prisma = database.getPrisma();
  
  let row = null;
  if (!prisma) {
    row = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  } else {
    row = await prisma.user.findUnique({ where: { email: cleanEmail } });
  }

  if (row) return row;

  // Nếu chưa có trong identity users, tự động tìm và đồng bộ từ organization-service
  try {
    const orgUrl = config.organizationServiceUrl || "http://localhost:4002";
    const res = await fetch(`${orgUrl}/api/employees?email=${encodeURIComponent(cleanEmail)}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const json = await res.json();
      const list = json && Array.isArray(json.data) ? json.data : [];
      const emp = list.find((e) => e.email && e.email.toLowerCase().trim() === cleanEmail);
      if (emp && emp.status !== "đã nghỉ" && emp.status !== "resigned") {
        const defaultHash = bcrypt.hashSync("123456", 10);
        const sysRole = ["admin", "manager", "staff"].includes(emp.systemRole) ? emp.systemRole : "staff";
        const userData = {
          id: emp.id || `e-${Date.now()}`,
          email: cleanEmail,
          passwordHash: defaultHash,
          name: emp.name || "Nhân viên",
          role: sysRole,
          roleTitle: emp.role || "Nhân viên",
          branchSlug: emp.branchSlug || null,
        };
        if (prisma) {
          const created = await prisma.user.upsert({
            where: { email: cleanEmail },
            update: {
              name: userData.name,
              role: userData.role,
              roleTitle: userData.roleTitle,
              branchSlug: userData.branchSlug,
            },
            create: userData,
          });
          return created;
        } else {
          memoryUsers.push(userData);
          return userData;
        }
      }
    }
  } catch (err) {
    console.warn("[UserRepository] Auto-sync employee thất bại:", err.message);
  }

  return null;
}

async function findById(id) {
  const prisma = database.getPrisma();
  if (!prisma) return memoryUsers.find((u) => u.id === id) || null;
  const row = await prisma.user.findUnique({ where: { id } });
  return row || null;
}

async function createOrUpdateUser(data) {
  const prisma = database.getPrisma();
  const cleanEmail = (data.email || "").toLowerCase().trim();
  const defaultHash = bcrypt.hashSync(data.password || "123456", 10);
  const sysRole = ["admin", "manager", "staff"].includes(data.role) ? data.role : "staff";
  const userPayload = {
    id: data.id || `e-${Date.now()}`,
    email: cleanEmail,
    passwordHash: defaultHash,
    name: data.name || "Nhân viên",
    role: sysRole,
    roleTitle: data.roleTitle || "Nhân viên",
    branchSlug: data.branchSlug || null,
  };

  if (!prisma) {
    const idx = memoryUsers.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (idx >= 0) {
      memoryUsers[idx] = { ...memoryUsers[idx], ...userPayload, passwordHash: memoryUsers[idx].passwordHash };
      return memoryUsers[idx];
    }
    memoryUsers.push(userPayload);
    return userPayload;
  }

  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    return await prisma.user.update({
      where: { email: cleanEmail },
      data: {
        name: userPayload.name,
        role: userPayload.role,
        roleTitle: userPayload.roleTitle,
        branchSlug: userPayload.branchSlug,
      },
    });
  }
  return await prisma.user.create({ data: userPayload });
}

async function ensureSeeded() {
  const prisma = database.getPrisma();
  if (!prisma) return { mode: "memory", count: memoryUsers.length };

  // Đảm bảo có tài khoản admin
  for (const def of SEED_DEFS) {
    const existed = await prisma.user.findUnique({ where: { email: def.email } });
    if (!existed) {
      await prisma.user.create({
        data: { ...def, passwordHash: bcrypt.hashSync("123456", 10) },
      });
    }
  }

  // Đồng bộ tất cả nhân sự hiện có từ organization-service
  try {
    const orgUrl = config.organizationServiceUrl || "http://localhost:4002";
    const res = await fetch(`${orgUrl}/api/employees`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const json = await res.json();
      const list = json && Array.isArray(json.data) ? json.data : [];
      for (const emp of list) {
        if (!emp.email || emp.status === "đã nghỉ" || emp.status === "resigned") continue;
        const cleanEmail = emp.email.toLowerCase().trim();
        const existed = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (!existed) {
          const sysRole = ["admin", "manager", "staff"].includes(emp.systemRole) ? emp.systemRole : "staff";
          await prisma.user.create({
            data: {
              id: emp.id,
              email: cleanEmail,
              passwordHash: bcrypt.hashSync("123456", 10),
              name: emp.name || "Nhân viên",
              role: sysRole,
              roleTitle: emp.role || "Nhân viên",
              branchSlug: emp.branchSlug || null,
            },
          });
        }
      }
    }
  } catch (_) {}

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

module.exports = { findByEmail, findById, updatePassword, ensureSeeded, createOrUpdateUser };

