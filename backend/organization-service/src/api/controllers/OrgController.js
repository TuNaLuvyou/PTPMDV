"use strict";

const OrgService = require("../../services/OrgService");
const { validateBranch, validateDepartment, validateEmployee } = require("../validators/orgValidator");
const { ValidationError, NotFoundError } = require("../../domain/errors");

async function listBranches(_req, res, next) {
  try {
    const rows = await OrgService.listBranches();
    return res.status(200).json({ data: rows, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function getBranch(req, res, next) {
  try {
    const row = await OrgService.getBranch(req.params.slug);
    return res.status(200).json({ data: row, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function createBranch(req, res, next) {
  try {
    const errors = validateBranch(req.body);
    if (errors.length) throw new ValidationError(errors.join("; "));
    const row = await OrgService.BranchRepository.create(req.body);
    return res.status(201).json({ data: row, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function updateBranch(req, res, next) {
  try {
    const row = await OrgService.BranchRepository.update(req.params.slug, req.body);
    if (!row) throw new NotFoundError("Không tìm thấy chi nhánh");
    return res.status(200).json({ data: row, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function deleteBranch(req, res, next) {
  try {
    const ok = await OrgService.BranchRepository.remove(req.params.slug);
    if (!ok) throw new NotFoundError("Không tìm thấy chi nhánh");
    return res.status(200).json({ data: { ok: true }, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function listDepartments(_req, res, next) {
  try {
    const rows = await OrgService.listDepartments();
    return res.status(200).json({ data: rows, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function getDepartment(req, res, next) {
  try {
    const row = await OrgService.getDepartment(req.params.id);
    return res.status(200).json({ data: row, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function createDepartment(req, res, next) {
  try {
    const errors = validateDepartment(req.body);
    if (errors.length) throw new ValidationError(errors.join("; "));
    const row = await OrgService.DepartmentRepository.create(req.body);
    return res.status(201).json({ data: row, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function updateDepartment(req, res, next) {
  try {
    const row = await OrgService.DepartmentRepository.update(req.params.id, req.body);
    if (!row) throw new NotFoundError("Không tìm thấy phòng ban");
    return res.status(200).json({ data: row, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function deleteDepartment(req, res, next) {
  try {
    const ok = await OrgService.DepartmentRepository.remove(req.params.id);
    if (!ok) throw new NotFoundError("Không tìm thấy phòng ban");
    return res.status(200).json({ data: { ok: true }, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function listEmployees(req, res, next) {
  try {
    const rows = await OrgService.listEmployees(req.query);
    return res.status(200).json({ data: rows, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function getEmployee(req, res, next) {
  try {
    const row = await OrgService.getEmployee(req.params.id);
    return res.status(200).json({ data: row, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function createEmployee(req, res, next) {
  try {
    const errors = validateEmployee(req.body);
    if (errors.length) throw new ValidationError(errors.join("; "));
    const row = await OrgService.EmployeeRepository.create(req.body);

    // Tự động đồng bộ tạo tài khoản đăng nhập sang identity-service
    try {
      const identityUrl = process.env.IDENTITY_SERVICE_URL || "http://localhost:4001";
      await fetch(`${identityUrl}/api/auth/internal/sync-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: row.id,
          email: row.email,
          name: row.name,
          role: row.systemRole || "staff",
          roleTitle: row.role || "Nhân viên",
          branchSlug: row.branchSlug || null,
        }),
        signal: AbortSignal.timeout(3000),
      });
    } catch (syncErr) {
      console.warn("[OrgController] Đồng bộ user sang identity-service:", syncErr.message);
    }

    return res.status(201).json({ data: row, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function updateEmployee(req, res, next) {
  try {
    const errors = validateEmployee(req.body, true);
    if (errors.length) throw new ValidationError(errors.join("; "));
    const row = await OrgService.EmployeeRepository.update(req.params.id, req.body);
    if (!row) {
      const err = new NotFoundError("Không tìm thấy thông tin nhân sự trên hệ thống");
      err.code = "EMPLOYEE_NOT_FOUND";
      throw err;
    }

    // Đồng bộ thông tin cập nhật sang identity-service
    if (row.email) {
      try {
        const identityUrl = process.env.IDENTITY_SERVICE_URL || "http://localhost:4001";
        await fetch(`${identityUrl}/api/auth/internal/sync-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: row.id,
            email: row.email,
            name: row.name,
            role: row.systemRole || "staff",
            roleTitle: row.role || "Nhân viên",
            branchSlug: row.branchSlug || null,
          }),
          signal: AbortSignal.timeout(3000),
        });
      } catch (_) {}
    }

    return res.status(200).json({ data: row, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function deleteEmployee(req, res, next) {
  try {
    const ok = await OrgService.EmployeeRepository.remove(req.params.id);
    if (!ok) {
      const err = new NotFoundError("Không tìm thấy thông tin nhân sự trên hệ thống");
      err.code = "EMPLOYEE_NOT_FOUND";
      throw err;
    }
    return res.status(200).json({ data: { ok: true }, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function leaveEmployee(req, res, next) {
  try {
    const row = await OrgService.EmployeeRepository.update(req.params.id, {
      status: "resigned",
      resignedAt: new Date().toISOString(),
    });
    if (!row) {
      const err = new NotFoundError("Không tìm thấy thông tin nhân sự trên hệ thống");
      err.code = "EMPLOYEE_NOT_FOUND";
      throw err;
    }
    return res.status(200).json({ data: row, message: "Nhân viên đã xác nhận thôi việc" });
  } catch (e) {
    return next(e);
  }
}

module.exports = {
  listBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  leaveEmployee,
};
