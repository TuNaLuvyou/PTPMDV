"use strict";

const SoapConfigRepository = require("../../infrastructure/database/repositories/SoapConfigRepository");

async function getSoapConfig(_req, res, next) {
  try {
    const cfg = await SoapConfigRepository.getConfig();
    return res.status(200).json({ data: cfg, message: "Thao tác thành công" });
  } catch (e) {
    return next(e);
  }
}

async function updateSoapConfig(req, res, next) {
  try {
    const cfg = await SoapConfigRepository.updateConfig(req.body || {});
    return res.status(200).json({ data: cfg, message: "Cập nhật cấu hình thành công" });
  } catch (e) {
    return next(e);
  }
}

module.exports = { getSoapConfig, updateSoapConfig };
