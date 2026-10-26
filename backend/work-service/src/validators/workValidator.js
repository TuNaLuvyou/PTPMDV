"use strict";

function validateShift(body = {}) {
  const errors = [];
  if (!body.employeeId && !body.branchSlug) errors.push("Thiếu employeeId hoặc branchSlug");
  if (!body.date) errors.push("Ngày ca (date DD-MM-YYYY) là bắt buộc");
  return errors;
}

const TASK_STATUSES = ["pending", "in_progress", "overdue", "done", "completed"];

function validateTask(body = {}) {
  const errors = [];
  if (!body.title || !String(body.title).trim()) errors.push("Tiêu đề tác vụ là bắt buộc");
  if (body.status && !TASK_STATUSES.includes(body.status)) {
    errors.push(`Trạng thái chỉ nhận ${TASK_STATUSES.join("/")}`);
  }
  return errors;
}

function validateAttendance(body = {}) {
  const errors = [];
  if (!body.employeeId) errors.push("Thiếu employeeId");
  return errors;
}

module.exports = { validateShift, validateTask, validateAttendance };
