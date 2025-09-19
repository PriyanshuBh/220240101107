import { ClientLogger } from "../../loggingMiddleware/logger"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface ShortUrl {
  shortCode: string
  originalUrl: string
  shortUrl: string
  validUntil: string
  createdAt: string
}

export interface UrlStats {
  shortCode: string
  originalUrl: string
  clickCount: number
  validUntil: string
  lastAccessed: string | null
  createdAt: string
  isExpired: boolean
}

export interface CreateUrlRequest {
  url: string
  customCode?: string
  validityPeriod?: number
}

class ApiClient {
  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout - please try again")
        }
        throw error
      }

      throw new Error("Network error - please check your connection")
    }
  }

  async createShortUrl(data: CreateUrlRequest): Promise<ShortUrl> {
    ClientLogger.info("api", `Creating short URL for: ${data.url}`)

    try {
      const result = await this.makeRequest<ShortUrl>("/shorturls", {
        method: "POST",
        body: JSON.stringify(data),
      })

      ClientLogger.info("api", `Short URL created successfully: ${result.shortCode}`)
      return result
    } catch (error) {
      ClientLogger.error("api", `Failed to create short URL: ${(error as Error).message}`)
      throw error
    }
  }

  async getUrlStats(shortCode: string): Promise<UrlStats> {
    ClientLogger.info("api", `Fetching statistics for: ${shortCode}`)

    try {
      const result = await this.makeRequest<UrlStats>(`/shorturls/${shortCode}`)

      ClientLogger.info("api", `Statistics retrieved for ${shortCode}: ${result.clickCount} clicks`)
      return result
    } catch (error) {
      ClientLogger.error("api", `Failed to fetch statistics: ${(error as Error).message}`)
      throw error
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      return await this.makeRequest<{ status: string; timestamp: string }>("/health")
    } catch (error) {
      ClientLogger.error("api", `Health check failed: ${(error as Error).message}`)
      throw error
    }
  }
}

export const apiClient = new ApiClient()
