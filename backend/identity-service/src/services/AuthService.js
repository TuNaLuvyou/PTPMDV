"use strict";

const bcrypt = require("bcryptjs");
const { User } = require("../domain/entities/User");
const { UnauthorizedError, ValidationError, NotFoundError } = require("../domain/errors");
const UserRepository = require("../infrastructure/database/repositories/UserRepository");
const DeviceRepository = require("../infrastructure/database/repositories/DeviceRepository");
const config = require("../../config");
const { signAccessToken, signRefreshToken, verifyToken } = require("../utils/jwt");

async function enrichWithEmployee(user) {
  try {
    const orgUrl = config.organizationServiceUrl || "http://localhost:4002";
    let emp = null;
    if (user.id) {
      const resById = await fetch(`${orgUrl}/api/employees/${user.id}`, {
        signal: AbortSignal.timeout(2000),
      }).catch(() => null);
      if (resById && resById.ok) {
        const json = await resById.json();
        emp = json.data;
      }
    }
    if (!emp && user.email) {
      const resByEmail = await fetch(`${orgUrl}/api/employees?email=${encodeURIComponent(user.email)}`, {
        signal: AbortSignal.timeout(2000),
      }).catch(() => null);
      if (resByEmail && resByEmail.ok) {
        const json = await resByEmail.json();
        emp = Array.isArray(json.data) ? json.data[0] : null;
      }
    }
    if (emp) {
      return {
        ...user,
        phone: emp.phone || "",
        gender: emp.gender || "",
        birthDate: emp.birthDate || "",
        province: emp.province || "",
        ward: emp.ward || "",
        street: emp.street || "",
        cccd: emp.cccd || "",
        issueDate: emp.issueDate || "",
        issuePlace: emp.issuePlace || "",
        cccdFront: emp.cccdFront || null,
        cccdBack: emp.cccdBack || null,
        cccdFrontUrl: emp.cccdFront || null,
        cccdBackUrl: emp.cccdBack || null,
        salaryType: emp.salaryType || "monthly",
        hourlySalary: emp.hourlySalary || 0,
        baseSalary: emp.baseSalary || 0,
        bankName: emp.bankName || "",
        bankAccountNumber: emp.bankAccountNumber || "",
        bankAccountName: emp.bankAccountName || "",
        department: emp.department || "",
        status: emp.status || "đang làm",
        joinDate: emp.joinDate || "",
        branchSlug: emp.branchSlug !== undefined ? emp.branchSlug : user.branchSlug,
        branch: emp.branchSlug ? emp.branchSlug.toUpperCase() : "",
      };
    }
  } catch (err) {
    console.warn("[AuthService] Enrich employee thất bại:", err.message);
  }
  return {
    ...user,
    phone: "",
    gender: "",
    birthDate: "",
    province: "",
    ward: "",
    street: "",
    cccd: "",
    issueDate: "",
    issuePlace: "",
    cccdFront: null,
    cccdBack: null,
    cccdFrontUrl: null,
    cccdBackUrl: null,
    salaryType: "monthly",
    hourlySalary: 0,
    baseSalary: 0,
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    department: "",
    status: "đang làm",
    joinDate: "",
    branch: user.branchSlug ? user.branchSlug.toUpperCase() : "",
  };
}

async function loginUseCase({ email, password }, req) {
  if (!email || !password) throw new ValidationError("Thiếu email hoặc mật khẩu");
  const row = await UserRepository.findByEmail(email.toLowerCase().trim());
  if (!row) throw new UnauthorizedError("Email hoặc mật khẩu không đúng");
  const ok = await bcrypt.compare(password, row.passwordHash);
  if (!ok) throw new UnauthorizedError("Email hoặc mật khẩu không đúng");
  const user = new User(row);
  const payload = { userId: user.id, email: user.email, role: user.role, branchSlug: user.branchSlug };

  if (req) {
    try {
      await DeviceRepository.registerDevice(user.id, req);
    } catch (_) {
      // Bỏ qua lỗi ghi nhận thiết bị
    }
  }

  const enrichedUser = await enrichWithEmployee(user.toJSON());

  return {
    user: enrichedUser,
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

async function getMeUseCase(userId) {
  const row = await UserRepository.findById(userId);
  if (!row) {
    throw new UnauthorizedError("Phiên đăng nhập hết hạn");
  }
  const user = new User(row).toJSON();
  return await enrichWithEmployee(user);
}

async function changePasswordUseCase({ userId, currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) {
    throw new ValidationError("Thiếu mật khẩu hiện tại hoặc mật khẩu mới");
  }
  if (newPassword.length < 6) {
    throw new ValidationError("Mật khẩu mới phải có tối thiểu 6 ký tự");
  }
  const row = await UserRepository.findById(userId);
  if (!row) {
    throw new NotFoundError("Không tìm thấy thông tin tài khoản");
  }
  const ok = await bcrypt.compare(currentPassword, row.passwordHash);
  if (!ok) {
    throw new ValidationError("Mật khẩu hiện tại không chính xác");
  }
  const newHash = await bcrypt.hash(newPassword, 10);
  await UserRepository.updatePassword(userId, newHash);
  return { ok: true };
}

async function forgotPasswordUseCase({ email }) {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    throw new ValidationError("Email không hợp lệ");
  }
  const row = await UserRepository.findByEmail(email.toLowerCase().trim());
  if (!row) {
    throw new NotFoundError("Không tìm thấy tài khoản với email này trên hệ thống");
  }
  // Đặt lại mật khẩu về mặc định 123456
  const defaultHash = await bcrypt.hash("123456", 10);
  await UserRepository.updatePassword(row.id, defaultHash);
  return { ok: true, reset: true, defaultPassword: "123456" };
}

async function refreshTokenUseCase({ refreshToken }) {
  if (!refreshToken) {
    throw new ValidationError("Thiếu refresh token");
  }
  let payload;
  try {
    payload = verifyToken(refreshToken);
  } catch (err) {
    throw new UnauthorizedError("Refresh token không hợp lệ hoặc đã hết hạn");
  }
  if (payload.type !== "refresh") {
    throw new UnauthorizedError("Token cung cấp không phải là refresh token");
  }
  const row = await UserRepository.findById(payload.userId);
  if (!row) {
    throw new UnauthorizedError("Người dùng không còn tồn tại");
  }
  const user = new User(row);
  const tokenPayload = { userId: user.id, email: user.email, role: user.role, branchSlug: user.branchSlug };
  return {
    user: user.toJSON(),
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
  };
}

async function getDevicesUseCase(userId) {
  return await DeviceRepository.getDevicesByUserId(userId);
}

async function revokeDeviceUseCase(userId, deviceId) {
  if (!deviceId) throw new ValidationError("Thiếu deviceId");
  return await DeviceRepository.removeDevice(userId, deviceId);
}

module.exports = {
  loginUseCase,
  getMeUseCase,
  changePasswordUseCase,
  forgotPasswordUseCase,
  refreshTokenUseCase,
  getDevicesUseCase,
  revokeDeviceUseCase,
};
