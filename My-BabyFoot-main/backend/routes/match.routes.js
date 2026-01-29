//backend/routes/match.routes.js
const express = require("express");
const router = express.Router();
const matchController = require("../controllers/match.controller");

router.post("/", matchController.createMatch);
router.get("/", matchController.getAllMatches);
router.get("/:id", matchController.getMatchById);
router.put("/:id/result", matchController.updateResult);

module.exports = router;
