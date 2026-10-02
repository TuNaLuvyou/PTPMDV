"use strict";

const NotificationRepository = require("../../infrastructure/database/repositories/NotificationRepository");
const { validateCreateNotification } = require("../../domain/entities/NotificationEntity");
const errorCodes = require("../../domain/constants/errorCodes");

async function listNotifications(req, res, next) {
  try {
    const rows = await NotificationRepository.findMany(req.query);
    return res.status(200).json({ data: rows, message: "Thao tác thành công" });
  } catch (error) {
    return next(error);
  }
}

async function getSettings(req, res, next) {
  try {
    const userId = req.headers["x-user-id"] || req.query.userId || "default";
    const settings = await NotificationRepository.getSettings(userId);
    return res.status(200).json({ data: settings, message: "Thao tác thành công" });
  } catch (error) {
    return next(error);
  }
}

async function updateSettings(req, res, next) {
  try {
    const userId = req.headers["x-user-id"] || req.query.userId || "default";
    const updated = await NotificationRepository.updateSettings(userId, req.body || {});
    return res.status(200).json({ data: updated, message: "Cập nhật cài đặt thông báo thành công" });
  } catch (error) {
    return next(error);
  }
}

async function createNotification(req, res, next) {
  try {
    const errors = validateCreateNotification(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        error: { code: errorCodes.VALIDATION_ERROR, message: errors.join("; ") },
      });
    }
    const created = await NotificationRepository.create({
      targetEmployeeId: req.body.targetEmployeeId || null,
      branchSlug: req.body.branchSlug,
      title: req.body.title.trim(),
      body: req.body.body.trim(),
      metadata: req.body.metadata || null,
      requestType: req.body.requestType || null,
      shiftName: req.body.shiftName || null,
      shiftDate: req.body.shiftDate || null,
      shiftTime: req.body.shiftTime || null,
      shiftHours: req.body.shiftHours || null,
      senderName: req.body.senderName || null,
      senderRole: req.body.senderRole || null,
      senderPhone: req.body.senderPhone || null,
    });
    return res.status(201).json({ data: created, message: "Gửi thông báo thành công" });
  } catch (error) {
    return next(error);
  }
}

async function markAsRead(req, res, next) {
  try {
    const row = await NotificationRepository.markAsRead(req.params.id);
    if (!row) {
      return res.status(404).json({
        error: { code: errorCodes.NOT_FOUND, message: "Không tìm thấy thông báo" },
      });
    }
    return res.status(200).json({ data: row, message: "Thao tác thành công" });
  } catch (error) {
    return next(error);
  }
}

async function deleteNotification(req, res, next) {
  try {
    const existing = await NotificationRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        error: { code: errorCodes.NOT_FOUND, message: "Không tìm thấy thông báo" },
      });
    }
    await NotificationRepository.deleteById(req.params.id);
    return res.status(200).json({ data: { ok: true }, message: "Xóa thông báo thành công" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
  getSettings,
  updateSettings,
};
