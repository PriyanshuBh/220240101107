const ShortUrl = require("../db/ShortUrl");
const generateCode = require("../utils/generateCode");
const { Logger } = require("../middleware/logger");

const isValidUrl = (string) => {
  try { new URL(string); return true; } catch (_) { return false; }
};

// POST /shorturls
exports.createShortUrl = async (req, res) => {
  try {
    const { url, customCode, validityPeriod } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });
    if (!isValidUrl(url)) return res.status(400).json({ error: "Invalid URL format" });

    let shortCode = customCode || generateCode();

    if (await ShortUrl.findOne({ shortCode })) {
      return res.status(409).json({ error: "Custom short code already exists" });
    }

    const minutes = validityPeriod || 30;
    const validUntil = new Date(Date.now() + minutes * 60 * 1000);

    const shortUrl = await ShortUrl.create({ originalUrl: url, shortCode, validUntil });

    Logger.info("Short URL created", { shortCode, url });
    res.status(201).json({
      shortCode,
      originalUrl: url,
      shortUrl: `http://localhost:${process.env.PORT || 5000}/${shortCode}`,
      validUntil: validUntil.toISOString(),
      createdAt: shortUrl.createdAt.toISOString()
    });
  } catch (error) {
    Logger.error("controller","Error creating short URL", { error: error.message });
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /shorturls/:shortcode
exports.getStats = async (req, res) => {
  try {
    const { shortcode } = req.params;
    const shortUrl = await ShortUrl.findOne({ shortCode: shortcode });
    if (!shortUrl) return res.status(404).json({ error: "Short URL not found" });

    res.json({
      shortCode: shortUrl.shortCode,
      originalUrl: shortUrl.originalUrl,
      clickCount: shortUrl.clickCount,
      validUntil: shortUrl.validUntil.toISOString(),
      lastAccessed: shortUrl.lastAccessed ? shortUrl.lastAccessed.toISOString() : null,
      createdAt: shortUrl.createdAt.toISOString(),
      isExpired: new Date() > shortUrl.validUntil
    });
  } catch (error) {
    Logger.error("controller","Error retrieving statistics", { error: error.message });
    res.status(500).json({ error: "Internal server error" });
  }
};


// GET /:shortcode
exports.redirectShortUrl = async (req, res) => {
  try {
    const { shortcode } = req.params;
    const shortUrl = await ShortUrl.findOne({ shortCode: shortcode });

    if (!shortUrl) return res.status(404).json({ error: "Short URL not found" });
    if (new Date() > shortUrl.validUntil) return res.status(410).json({ error: "Short URL has expired" });

    shortUrl.clickCount += 1;
    shortUrl.lastAccessed = new Date();
    await shortUrl.save();

    Logger.info("Redirect successful", { shortcode, target: shortUrl.originalUrl });
    res.redirect(shortUrl.originalUrl);
  } catch (error) {
    Logger.error("controller", "Error creating short URL", { error: err.message });
    res.status(500).json({ error: "Internal server error" });
  }
};
