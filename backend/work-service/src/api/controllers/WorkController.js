"use strict";

const WorkRepository = require("../../infrastructure/database/repositories/WorkRepository");
const { validateShift, validateTask, validateAttendance } = require("../validators/workValidator");
const { ValidationError, NotFoundError } = require("../../domain/errors");

async function listShifts(req, res, next) {
  try {
    const rows = await WorkRepository.listShifts(req.query);
    return res.status(200).json({ data: rows, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function createShift(req, res, next) {
  try {
    const errors = validateShift(req.body);
    if (errors.length) throw new ValidationError(errors.join("; "));
    const row = await WorkRepository.createShift(req.body);
    return res.status(201).json({ data: row, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function updateShift(req, res, next) {
  try {
    const row = await WorkRepository.updateShift(req.params.id, req.body);
    if (!row) throw new NotFoundError("Không tìm thấy ca làm việc");
    return res.status(200).json({ data: row, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function deleteShift(req, res, next) {
  try {
    const ok = await WorkRepository.deleteShift(req.params.id);
    if (!ok) throw new NotFoundError("Không tìm thấy ca làm việc");
    return res.status(200).json({ data: { ok: true }, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function assignShift(req, res, next) {
  try {
    if (!req.body.employeeId) throw new ValidationError("Thiếu employeeId để phân công");
    const row = await WorkRepository.updateShift(req.params.id, { employeeId: req.body.employeeId });
    if (!row) throw new NotFoundError("Không tìm thấy ca làm việc");
    return res.status(200).json({ data: row, message: "Phân công ca thành công" });
  } catch (e) {
    return next(e);
  }
}

async function registerShift(req, res, next) {
  try {
    if (!req.body.employeeId) throw new ValidationError("Thiếu employeeId để đăng ký ca");
    const row = await WorkRepository.registerShift(req.body);
    return res.status(201).json({ data: row, message: "Đăng ký ca thành công" });
  } catch (e) {
    return next(e);
  }
}

async function listRegistrations(req, res, next) {
  try {
    const rows = await WorkRepository.listRegistrations(req.query);
    return res.status(200).json({ data: rows, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function checkin(req, res, next) {
  try {
    const errors = validateAttendance(req.body);
    if (errors.length) throw new ValidationError(errors.join("; "));
    const row = await WorkRepository.checkin(req.body);
    return res.status(201).json({ data: row, message: "Chấm công vào thành công" });
  } catch (e) {
    return next(e);
  }
}

async function checkout(req, res, next) {
  try {
    const errors = validateAttendance(req.body);
    if (errors.length) throw new ValidationError(errors.join("; "));
    const row = await WorkRepository.checkout(req.body);
    return res.status(200).json({ data: row, message: "Chấm công ra thành công" });
  } catch (e) {
    return next(e);
  }
}

async function listAttendance(req, res, next) {
  try {
    const rows = await WorkRepository.listAttendance(req.query);
    return res.status(200).json({ data: rows, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function getConfig(_req, res, next) {
  try {
    const cfg = await WorkRepository.getConfig();
    return res.status(200).json({ data: cfg, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function updateConfig(req, res, next) {
  try {
    const cfg = await WorkRepository.updateConfig(req.body);
    return res.status(200).json({ data: cfg, message: "Cập nhật cấu hình thành công" });
  } catch (e) {
    return next(e);
  }
}

async function listTasks(req, res, next) {
  try {
    const rows = await WorkRepository.listTasks(req.query);
    return res.status(200).json({ data: rows, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function createTask(req, res, next) {
  try {
    const errors = validateTask(req.body);
    if (errors.length) throw new ValidationError(errors.join("; "));
    const row = await WorkRepository.createTask(req.body);
    return res.status(201).json({ data: row, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function updateTask(req, res, next) {
  try {
    const errors = validateTask({ title: "x", ...req.body });
    if (errors.length && !req.body.title) {
      // Cho phép update từng phần, chỉ check status
      if (req.body.status && !["pending", "in_progress", "done"].includes(req.body.status)) {
        throw new ValidationError(errors.join("; "));
      }
    } else if (errors.length) throw new ValidationError(errors.join("; "));
    const row = await WorkRepository.updateTask(req.params.id, req.body);
    if (!row) throw new NotFoundError("Không tìm thấy tác vụ");
    return res.status(200).json({ data: row, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function deleteTask(req, res, next) {
  try {
    const ok = await WorkRepository.deleteTask(req.params.id);
    if (!ok) throw new NotFoundError("Không tìm thấy tác vụ");
    return res.status(200).json({ data: { ok: true }, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function getShift(req, res, next) {
  try {
    const row = await WorkRepository.getShiftById(req.params.id);
    if (!row) throw new NotFoundError("Không tìm thấy ca làm việc");
    return res.status(200).json({ data: row, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function getTask(req, res, next) {
  try {
    const row = await WorkRepository.getTaskById(req.params.id);
    if (!row) throw new NotFoundError("Không tìm thấy tác vụ");
    return res.status(200).json({ data: row, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function listTemplates(_req, res, next) {
  try {
    const rows = await WorkRepository.listTemplates();
    return res.status(200).json({ data: rows, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function createTemplate(req, res, next) {
  try {
    if (!req.body.name || !req.body.startTime || !req.body.endTime) {
      throw new ValidationError("Thiếu name, startTime hoặc endTime");
    }
    const row = await WorkRepository.createTemplate({
      name: req.body.name,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
    });
    return res.status(201).json({ data: row, message: "Tạo khung ca thành công" });
  } catch (e) {
    return next(e);
  }
}

async function updateTemplate(req, res, next) {
  try {
    const row = await WorkRepository.updateTemplate(req.params.id, req.body);
    if (!row) throw new NotFoundError("Không tìm thấy khung ca");
    return res.status(200).json({ data: row, message: "Cập nhật khung ca thành công" });
  } catch (e) {
    return next(e);
  }
}

async function deleteTemplate(req, res, next) {
  try {
    const ok = await WorkRepository.deleteTemplate(req.params.id);
    if (!ok) throw new NotFoundError("Không tìm thấy khung ca");
    return res.status(200).json({ data: { ok: true }, message: "Xóa khung ca thành công" });
  } catch (e) {
    return next(e);
  }
}

module.exports = {
  listShifts,
  createShift,
  updateShift,
  deleteShift,
  assignShift,
  registerShift,
  listRegistrations,
  getShift,
  checkin,
  checkout,
  listAttendance,
  getConfig,
  updateConfig,
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  getTask,
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
