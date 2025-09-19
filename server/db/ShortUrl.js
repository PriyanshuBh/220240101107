const mongoose = require("mongoose");

const shortUrlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  validUntil: { type: Date, required: true },
  clickCount: { type: Number, default: 0 },
  lastAccessed: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("ShortUrl", shortUrlSchema);
