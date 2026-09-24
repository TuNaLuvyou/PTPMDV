"use strict";

const { loginUseCase, getMeUseCase } = require("../../services/AuthService");
const { validateLogin } = require("../validators/authValidator");
const { ValidationError } = require("../../domain/errors");
const { COOKIE_NAME } = require("../middlewares/session");
const config = require("../../../config");

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: config.nodeEnv === "production",
  };
}

async function login(req, res, next) {
  try {
    const errors = validateLogin(req.body);
    if (errors.length) throw new ValidationError(errors.join("; "));
    const result = await loginUseCase(req.body);
    res.cookie(COOKIE_NAME, result.accessToken, cookieOptions());
    return res.status(200).json({
      data: { user: result.user, accessToken: result.accessToken },
      message: "Đăng nhập thành công",
    });
  } catch (e) {
    return next(e);
  }
}

async function me(req, res, next) {
  try {
    const user = await getMeUseCase(req.user.userId);
    return res.status(200).json({ data: user, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function logout(_req, res, next) {
  try {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    return res.status(200).json({ data: { ok: true }, message: "Đăng xuất thành công" });
  } catch (e) {
    return next(e);
  }
}

module.exports = { login, me, logout };
