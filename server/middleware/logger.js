const axios = require("axios")

// Test server configuration
const TEST_SERVER_CONFIG = {
  baseUrl: "http://20.244.56.144/evaluation-service",
  // These should be set as environment variables after registration
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  email: process.env.USER_EMAIL,
  name: process.env.USER_NAME,
  rollNo: process.env.ROLL_NO,
  accessCode: process.env.ACCESS_CODE,
}

class Logger {
  static authToken = null
  static tokenExpiry = null

  static async authenticate() {
    try {
      const response = await axios.post(`${TEST_SERVER_CONFIG.baseUrl}/auth`, {
        email: TEST_SERVER_CONFIG.email,
        name: TEST_SERVER_CONFIG.name,
        rollNo: TEST_SERVER_CONFIG.rollNo,
        accessCode: TEST_SERVER_CONFIG.accessCode,
        clientID: TEST_SERVER_CONFIG.clientId,
        clientSecret: TEST_SERVER_CONFIG.clientSecret,
      })

      this.authToken = response.data.access_token
      this.tokenExpiry = response.data.expires_in * 1000 // Convert to milliseconds

      console.log("Successfully authenticated with test server")
      return true
    } catch (error) {
      console.error("Authentication failed:", error.response?.data || error.message)
      return false
    }
  }

  static async log(stack, level, packageName, message) {
    // Validate parameters according to test server constraints
    const validStacks = ["backend", "frontend"]
    const validLevels = ["debug", "info", "warn", "error", "fatal"]
    const validBackendPackages = [
      "cache",
      "controller",
      "cron_job",
      "db",
      "domain",
      "handler",
      "repository",
      "route",
      "service",
      "auth",
      "config",
      "middleware",
      "utils",
    ]
    const validFrontendPackages = [
      "api",
      "component",
      "hook",
      "ui",
      "state",
      "style",
      "auth",
      "config",
      "middleware",
      "utils",
    ]

    if (!validStacks.includes(stack)) {
      console.error(`Invalid stack: ${stack}. Must be one of: ${validStacks.join(", ")}`)
      return
    }

    if (!validLevels.includes(level)) {
      console.error(`Invalid level: ${level}. Must be one of: ${validLevels.join(", ")}`)
      return
    }

    const validPackages = stack === "backend" ? validBackendPackages : validFrontendPackages
    if (!validPackages.includes(packageName)) {
      console.error(`Invalid package for ${stack}: ${packageName}. Must be one of: ${validPackages.join(", ")}`)
      return
    }

    // Check if we need to authenticate or refresh token
    if (!this.authToken || (this.tokenExpiry && Date.now() > this.tokenExpiry)) {
      const authSuccess = await this.authenticate()
      if (!authSuccess) {
        // Fallback to console logging if test server is unavailable
        console.log(`[${stack.toUpperCase()}] [${level.toUpperCase()}] [${packageName}] ${message}`)
        return
      }
    }

    try {
      const response = await axios.post(
        `${TEST_SERVER_CONFIG.baseUrl}/logs`,
        {
          stack,
          level,
          package: packageName,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            "Content-Type": "application/json",
          },
        },
      )

      console.log(`Log sent successfully. LogID: ${response.data.logID}`)
    } catch (error) {
      console.error("Failed to send log to test server:", error.response?.data || error.message)
      // Fallback to console logging
      console.log(`[${stack.toUpperCase()}] [${level.toUpperCase()}] [${packageName}] ${message}`)
    }
  }

  static async info(packageName, message) {
    await this.log("backend", "info", packageName, message)
  }

  static async error(packageName, message) {
    await this.log("backend", "error", packageName, message)
  }

  static async warn(packageName, message) {
    await this.log("backend", "warn", packageName, message)
  }

  static async debug(packageName, message) {
    await this.log("backend", "debug", packageName, message)
  }

  static async fatal(packageName, message) {
    await this.log("backend", "fatal", packageName, message)
  }
}

const loggingMiddleware = (req, res, next) => {
  const startTime = Date.now()

  Logger.info("middleware", `Incoming ${req.method} request to ${req.url} from ${req.ip}`)

  // Override res.json to log responses
  const originalJson = res.json
  res.json = function (body) {
    const duration = Date.now() - startTime
    Logger.info("middleware", `Response sent: ${res.statusCode} for ${req.method} ${req.url} (${duration}ms)`)
    return originalJson.call(this, body)
  }

  next()
}

module.exports = { Logger, loggingMiddleware }
