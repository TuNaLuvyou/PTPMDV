"use strict";

const express = require("express");
const WorkController = require("../controllers/WorkController");

const router = express.Router();

// Shifts — khai báo route cụ thể trước route :id
router.get("/shifts/registrations", WorkController.listRegistrations);
router.post("/shifts/register", WorkController.registerShift);
router.get("/shifts", WorkController.listShifts);
router.post("/shifts", WorkController.createShift);
router.put("/shifts/:id", WorkController.updateShift);
router.delete("/shifts/:id", WorkController.deleteShift);
router.post("/shifts/:id/assign", WorkController.assignShift);

// Attendance — config trước để tránh nuốt bởi query
router.get("/attendance/config", WorkController.getConfig);
router.put("/attendance/config", WorkController.updateConfig);
router.post("/attendance/checkin", WorkController.checkin);
router.post("/attendance/checkout", WorkController.checkout);
router.get("/attendance", WorkController.listAttendance);

// Tasks
router.get("/tasks", WorkController.listTasks);
router.post("/tasks", WorkController.createTask);
router.put("/tasks/:id", WorkController.updateTask);
router.delete("/tasks/:id", WorkController.deleteTask);

module.exports = router;
