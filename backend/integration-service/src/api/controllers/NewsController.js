"use strict";

const NewsRepository = require("../../infrastructure/database/repositories/NewsRepository");
const { validateCreateNews } = require("../../domain/entities/NewsEntity");
const errorCodes = require("../../domain/constants/errorCodes");

async function getAllNews(_req, res, next) {
  try {
    const list = await NewsRepository.findMany();
    return res.status(200).json({ data: list });
  } catch (error) {
    next(error);
  }
}

async function getNewsById(req, res, next) {
  try {
    const { id } = req.params;
    const item = await NewsRepository.findById(id);
    if (!item) {
      return res.status(404).json({
        error: { code: errorCodes.NOT_FOUND, message: "Không tìm thấy tin tức" },
      });
    }
    return res.status(200).json({ data: item });
  } catch (error) {
    next(error);
  }
}

async function createNews(req, res, next) {
  try {
    const errors = validateCreateNews(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        error: { code: errorCodes.VALIDATION_ERROR, message: errors.join(", ") },
      });
    }

    const created = await NewsRepository.create({
      title: req.body.title.trim(),
      summary: req.body.summary.trim(),
      content: req.body.content.trim(),
      author: req.body.author ? req.body.author.trim() : "Ban Quản trị",
      date: req.body.date || new Date().toLocaleDateString("vi-VN").replace(/\//g, "-"),
      tag: req.body.tag ? req.body.tag.trim() : "Thông báo chung",
      tagTone: req.body.tagTone || "primary",
      pinned: Boolean(req.body.pinned),
    });

    // Đồng bộ tạo thông báo toàn hệ thống để ứng dụng di động nhận được thông báo
    try {
      const NotificationRepository = require("../../infrastructure/database/repositories/NotificationRepository");
      await NotificationRepository.create({
        title: `📢 Bảng tin: ${created.title}`,
        body: created.summary || created.content,
        requestType: "NEWS",
        senderName: created.author || "Ban Quản trị",
        senderRole: "Quản trị viên",
        metadata: { newsId: created.id, tag: created.tag },
      });
    } catch (e) {
      console.warn("[NewsController] Không thể tự động tạo thông báo:", e.message);
    }

    return res.status(201).json({
      data: created,
      message: "Tạo tin tức thành công",
    });
  } catch (error) {
    next(error);
  }
}

async function updateNews(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await NewsRepository.findById(id);
    if (!existing) {
      return res.status(404).json({
        error: { code: errorCodes.NOT_FOUND, message: "Không tìm thấy tin tức để cập nhật" },
      });
    }

    const updated = await NewsRepository.update(id, req.body);
    return res.status(200).json({
      data: updated,
      message: "Cập nhật tin tức thành công",
    });
  } catch (error) {
    next(error);
  }
}

async function deleteNews(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await NewsRepository.findById(id);
    if (!existing) {
      return res.status(404).json({
        error: { code: errorCodes.NOT_FOUND, message: "Không tìm thấy tin tức để xóa" },
      });
    }

    await NewsRepository.deleteById(id);
    return res.status(200).json({
      data: { id, deleted: true },
      message: "Xóa tin tức thành công",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
};
