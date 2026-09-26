"use strict";

const bcrypt = require("bcryptjs");
const { User } = require("../domain/entities/User");
const { UnauthorizedError, ValidationError, NotFoundError } = require("../domain/errors");
const UserRepository = require("../infrastructure/database/repositories/UserRepository");
const DeviceRepository = require("../infrastructure/database/repositories/DeviceRepository");
const { signAccessToken, signRefreshToken, verifyToken } = require("../utils/jwt");

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

  return {
    user: user.toJSON(),
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

async function getMeUseCase(userId) {
  const row = await UserRepository.findById(userId);
  if (!row) {
    throw new UnauthorizedError("Phiên đăng nhập hết hạn");
  }
  return new User(row).toJSON();
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
