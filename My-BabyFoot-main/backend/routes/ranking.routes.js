//backend/routes/ranking.routes.js
const express = require("express");
const router = express.Router();
const rankingController = require("../controllers/ranking.controller");

router.get("/", rankingController.getRanking);
router.get("/:id", rankingController.getUserRanking);

module.exports = router;

