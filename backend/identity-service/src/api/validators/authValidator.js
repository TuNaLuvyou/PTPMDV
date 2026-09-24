"use strict";

function validateLogin(body = {}) {
  const errors = [];
  if (!body.email || typeof body.email !== "string" || !body.email.includes("@")) {
    errors.push("email phải là địa chỉ email hợp lệ");
  }
  if (!body.password || typeof body.password !== "string" || body.password.length < 4) {
    errors.push("password tối thiểu 4 ký tự");
  }
  return errors;
}

module.exports = { validateLogin };
