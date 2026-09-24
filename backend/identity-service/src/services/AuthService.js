"use strict";

const bcrypt = require("bcryptjs");
const { User } = require("../domain/entities/User");
const { UnauthorizedError, ValidationError } = require("../domain/errors");
const UserRepository = require("../infrastructure/database/repositories/UserRepository");
const { signAccessToken, signRefreshToken } = require("../utils/jwt");

async function loginUseCase({ email, password }) {
  if (!email || !password) throw new ValidationError("Thiếu email hoặc mật khẩu");
  const row = await UserRepository.findByEmail(email.toLowerCase().trim());
  if (!row) throw new UnauthorizedError("Email hoặc mật khẩu không đúng");
  const ok = await bcrypt.compare(password, row.passwordHash);
  if (!ok) throw new UnauthorizedError("Email hoặc mật khẩu không đúng");
  const user = new User(row);
  const payload = { userId: user.id, email: user.email, role: user.role, branchSlug: user.branchSlug };
  return {
    user: user.toJSON(),
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

async function getMeUseCase(userId) {
  const row = await UserRepository.findById(userId);
  if (!row) {
    const e = new UnauthorizedError("Phiên đăng nhập hết hạn");
    throw e;
  }
  return new User(row).toJSON();
}

module.exports = { loginUseCase, getMeUseCase };
