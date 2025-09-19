const mongoose = require("mongoose");
const { Logger } = require("../middleware/logger");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/urlshortener");
    Logger.info("db", "Connected to MongoDB successfully");
  } catch (error) {
    Logger.error("db", "MongoDB connection failed", { error: error.message });
    process.exit(1);
  }
}



module.exports = connectDB;
