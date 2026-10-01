"use strict";

const database = require("../../../../config/database");
const { SEED_REQUESTS } = require("../../../../prisma/seed");

let memoryRequests = JSON.parse(JSON.stringify(SEED_REQUESTS)).map((r) => ({
  ...r,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

async function findMany({ employeeId, branchSlug, status, type } = {}) {
  const prisma = database.getPrisma();
  if (!prisma) {
    return memoryRequests.filter((r) => {
      if (employeeId && r.employeeId !== employeeId) return false;
      if (branchSlug && r.branchSlug !== branchSlug) return false;
      if (status && r.status !== status) return false;
      if (type && r.type !== type) return false;
      return true;
    });
  }
  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (branchSlug) where.branchSlug = branchSlug;
  if (status) where.status = status;
  if (type) where.type = type;
  return prisma.request.findMany({ where, orderBy: { createdAt: "desc" } });
}

async function findById(id) {
  const prisma = database.getPrisma();
  if (!prisma) {
    return memoryRequests.find((r) => r.id === id) || null;
  }
  return prisma.request.findUnique({ where: { id } });
}

async function create(data) {
  const prisma = database.getPrisma();
  if (!prisma) {
    const newReq = {
      id: data.id || `req-${Date.now()}`,
      status: "pending",
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryRequests.unshift(newReq);
    return newReq;
  }
  return prisma.request.create({ data });
}

async function update(id, data) {
  const prisma = database.getPrisma();
  if (!prisma) {
    const idx = memoryRequests.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    memoryRequests[idx] = { ...memoryRequests[idx], ...data, updatedAt: new Date() };
    return memoryRequests[idx];
  }
  return prisma.request.update({ where: { id }, data });
}

async function deleteById(id) {
  const prisma = database.getPrisma();
  if (!prisma) {
    const idx = memoryRequests.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    memoryRequests.splice(idx, 1);
    return true;
  }
  await prisma.request.delete({ where: { id } });
  return true;
}

module.exports = {
  findMany,
  findById,
  create,
  update,
  deleteById,
};
