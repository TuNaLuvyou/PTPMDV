"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { validateLogin } = require("../../src/api/validators/authValidator");
const { User } = require("../../src/domain/entities/User");

test("validateLogin từ chối body trống", () => {
  assert.ok(validateLogin({}).length > 0);
});

test("User entity từ chối role lạ", () => {
  assert.throws(() => new User({ id: "x", email: "a@b.c", name: "A", role: "boss" }));
});
