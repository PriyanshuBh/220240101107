const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const { Logger, loggingMiddleware } = require("./middleware/logger");
const urlRoutes = require("./routes/urlRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const FN_URL = process.env.FN_URL || "http://localhost:3000";

// middleware
app.use(cors({ origin: FN_URL, credentials: true }));
app.use(express.json());
app.use(loggingMiddleware);

// routes
app.use("/shorturls", urlRoutes);
app.get("/health", (req, res) => res.json({ status: "OK", timestamp: new Date().toISOString() }));

// connect DB + start server
connectDB().then(() => {
  app.listen(PORT, () =>Logger.info("config", `Server running on port ${PORT}`));

});
