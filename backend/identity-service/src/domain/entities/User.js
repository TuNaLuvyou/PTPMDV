"use strict";

const ALLOWED_ROLES = ["admin", "manager", "staff"];

class User {
  constructor({ id, email, name, role, roleTitle, branchSlug }) {
    if (!email || !email.includes("@")) {
      const e = new Error("Email không hợp lệ");
      e.code = "VALIDATION_ERROR";
      e.status = 400;
      throw e;
    }
    if (!ALLOWED_ROLES.includes(role)) {
      const e = new Error("Vai trò không hợp lệ");
      e.code = "VALIDATION_ERROR";
      e.status = 400;
      throw e;
    }
    this.id = id;
    this.email = email;
    this.name = name;
    this.role = role;
    this.roleTitle = roleTitle;
    this.branchSlug = branchSlug || null;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      roleTitle: this.roleTitle,
      branchSlug: this.branchSlug,
    };
  }
}

module.exports = { User, ALLOWED_ROLES };
