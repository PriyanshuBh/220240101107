class ClientLogger {
    private static authToken: string | null = null
    private static tokenExpiry: number | null = null
  
    // Test server configuration for frontend
    private static readonly TEST_SERVER_CONFIG = {
      baseUrl: "http://20.244.56.144/evaluation-service",
      // These should be set as environment variables
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
      email: process.env.NEXT_PUBLIC_USER_EMAIL,
      name: process.env.NEXT_PUBLIC_USER_NAME,
      rollNo: process.env.NEXT_PUBLIC_ROLL_NO,
      accessCode: process.env.NEXT_PUBLIC_ACCESS_CODE,
    }
  
    private static async authenticate(): Promise<boolean> {
      try {
        const response = await fetch(`${this.TEST_SERVER_CONFIG.baseUrl}/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: this.TEST_SERVER_CONFIG.email,
            name: this.TEST_SERVER_CONFIG.name,
            rollNo: this.TEST_SERVER_CONFIG.rollNo,
            accessCode: this.TEST_SERVER_CONFIG.accessCode,
            clientID: this.TEST_SERVER_CONFIG.clientId,
            clientSecret: this.TEST_SERVER_CONFIG.clientSecret,
          }),
        })
  
        if (!response.ok) {
          throw new Error(`Authentication failed: ${response.status}`)
        }
  
        const data = await response.json()
        this.authToken = data.access_token
        this.tokenExpiry = data.expires_in * 1000 // Convert to milliseconds
  
        console.log("Successfully authenticated with test server")
        return true
      } catch (error) {
        console.error("Authentication failed:", error)
        return false
      }
    }
  
    static async log(
      stack: "frontend" | "backend",
      level: "debug" | "info" | "warn" | "error" | "fatal",
      packageName: string,
      message: string,
    ): Promise<void> {
      // Validate parameters according to test server constraints
      const validStacks = ["backend", "frontend"]
      const validLevels = ["debug", "info", "warn", "error", "fatal"]
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
  
      if (stack === "frontend" && !validFrontendPackages.includes(packageName)) {
        console.error(`Invalid package for frontend: ${packageName}. Must be one of: ${validFrontendPackages.join(", ")}`)
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
        const response = await fetch(`${this.TEST_SERVER_CONFIG.baseUrl}/logs`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stack,
            level,
            package: packageName,
            message,
          }),
        })
  
        if (!response.ok) {
          throw new Error(`Log API failed: ${response.status}`)
        }
  
        const data = await response.json()
        console.log(`Log sent successfully. LogID: ${data.logID}`)
      } catch (error) {
        console.error("Failed to send log to test server:", error)
        // Fallback to console logging
        console.log(`[${stack.toUpperCase()}] [${level.toUpperCase()}] [${packageName}] ${message}`)
      }
    }
  
    static async info(packageName: string, message: string): Promise<void> {
      await this.log("frontend", "info", packageName, message)
    }
  
    static async error(packageName: string, message: string): Promise<void> {
      await this.log("frontend", "error", packageName, message)
    }
  
    static async warn(packageName: string, message: string): Promise<void> {
      await this.log("frontend", "warn", packageName, message)
    }
  
    static async debug(packageName: string, message: string): Promise<void> {
      await this.log("frontend", "debug", packageName, message)
    }
  }
  
  export { ClientLogger }
  