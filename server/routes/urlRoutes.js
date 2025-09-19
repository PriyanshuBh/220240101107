const express = require("express");
const { createShortUrl, getStats, redirectShortUrl } = require("../controller/urlController");

const router = express.Router();

router.post("/", createShortUrl);
router.get("/:shortcode", getStats);
router.get("/:shortcode", redirectShortUrl);

module.exports = router;
