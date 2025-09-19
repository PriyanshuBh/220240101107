const mongoose = require("mongoose")

const shortUrlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    validUntil: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 60 * 1000), 
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    lastAccessed: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)


// shortUrlSchema.index({ shortCode: 1 })
// shortUrlSchema.index({ validUntil: 1 })

module.exports = mongoose.model("ShortUrl", shortUrlSchema)
