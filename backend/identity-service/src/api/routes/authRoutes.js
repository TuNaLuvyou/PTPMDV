"use strict";

const express = require("express");
const AuthController = require("../controllers/AuthController");
const { sessionMiddleware } = require("../middlewares/session");

const router = express.Router();

router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/me", sessionMiddleware, AuthController.me);

module.exports = router;
