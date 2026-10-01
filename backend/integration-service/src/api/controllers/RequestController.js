"use strict";

const RequestRepository = require("../../infrastructure/database/repositories/RequestRepository");
const NotificationRepository = require("../../infrastructure/database/repositories/NotificationRepository");
const WorkClient = require("../../infrastructure/external-clients/WorkClient");
const { validateCreateRequest, canDeleteRequest } = require("../../domain/entities/RequestEntity");
const errorCodes = require("../../domain/constants/errorCodes");

async function listRequests(req, res, next) {
  try {
    const rows = await RequestRepository.findMany(req.query);
    return res.status(200).json({ data: rows, message: "Thao tác thành công" });
  } catch (error) {
    return next(error);
  }
}

async function getRequestById(req, res, next) {
  try {
    const row = await RequestRepository.findById(req.params.id);
    if (!row) {
      return res.status(404).json({
        error: { code: errorCodes.NOT_FOUND, message: "Không tìm thấy yêu cầu" },
      });
    }
    return res.status(200).json({ data: row, message: "Thao tác thành công" });
  } catch (error) {
    return next(error);
  }
}

async function createRequest(req, res, next) {
  try {
    const errors = validateCreateRequest(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        error: { code: errorCodes.VALIDATION_ERROR, message: errors.join("; ") },
      });
    }
    const created = await RequestRepository.create({
      type: req.body.type,
      employeeId: req.body.employeeId,
      branchSlug: req.body.branchSlug,
      title: req.body.title.trim(),
      content: req.body.content.trim(),
      attachmentUrl: req.body.attachmentUrl,
      sourceShiftId: req.body.sourceShiftId,
      targetShiftId: req.body.targetShiftId,
    });
    return res.status(201).json({ data: created, message: "Tạo yêu cầu thành công" });
  } catch (error) {
    return next(error);
  }
}

async function reviewRequest(req, res, approved) {
  const row = await RequestRepository.findById(req.params.id);
  if (!row) {
    return res.status(404).json({
      error: { code: errorCodes.NOT_FOUND, message: "Không tìm thấy yêu cầu" },
    });
  }
  if (row.status !== "pending") {
    return res.status(400).json({
      error: { code: errorCodes.VALIDATION_ERROR, message: "Chỉ duyệt hoặc từ chối yêu cầu đang chờ xử lý" },
    });
  }
  const reviewedBy = req.body.reviewedBy || "admin";
  const reviewNote = req.body.reviewNote || "";
  const updated = await RequestRepository.update(req.params.id, {
    status: approved ? "approved" : "rejected",
    reviewedBy,
    reviewNote,
  });

  // Duyệt/từ chối tự sinh thông báo cho nhân viên.
  await NotificationRepository.create({
    targetEmployeeId: row.employeeId,
    branchSlug: row.branchSlug,
    title: approved ? "Yêu cầu của bạn đã được duyệt" : "Yêu cầu của bạn đã bị từ chối",
    body: `${approved ? "Đã duyệt" : "Đã từ chối"}: ${row.title}${reviewNote ? ` — ${reviewNote}` : ""}`,
  });

  // Duyệt đổi ca: đẩy cập nhật sang work-service (best-effort, không chặn luồng duyệt).
  if (approved && row.type === "shift_swap" && row.sourceShiftId) {
    try {
      await WorkClient.updateShift(row.sourceShiftId, {
        employeeId: row.employeeId,
      });
    } catch (e) {
      console.warn("[integration-service] Đồng bộ đổi ca sang work-service thất bại:", e.message);
    }
  }
  return res.status(200).json({
    data: updated,
    message: approved ? "Duyệt yêu cầu thành công" : "Từ chối yêu cầu thành công",
  });
}

async function approveRequest(req, res, next) {
  try {
    return await reviewRequest(req, res, true);
  } catch (error) {
    return next(error);
  }
}

async function rejectRequest(req, res, next) {
  try {
    return await reviewRequest(req, res, false);
  } catch (error) {
    return next(error);
  }
}

async function deleteRequest(req, res, next) {
  try {
    const row = await RequestRepository.findById(req.params.id);
    if (!row) {
      return res.status(404).json({
        error: { code: errorCodes.NOT_FOUND, message: "Không tìm thấy yêu cầu" },
      });
    }
    if (!canDeleteRequest(row.status)) {
      return res.status(400).json({
        error: { code: errorCodes.VALIDATION_ERROR, message: "Chỉ được xóa yêu cầu đang chờ xử lý" },
      });
    }
    await RequestRepository.deleteById(req.params.id);
    return res.status(200).json({ data: { ok: true }, message: "Xóa yêu cầu thành công" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listRequests,
  getRequestById,
  createRequest,
  approveRequest,
  rejectRequest,
  deleteRequest,
};
