//backend/routes/user.routes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.get("/:id/profile", userController.getProfile);
router.put("/:id/profile", userController.updateProfile);
router.put("/:id/elo", userController.updateElo);

module.exports = router;

