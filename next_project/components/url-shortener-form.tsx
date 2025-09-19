"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "../hooks/use-toast"
import { Copy, Link, Clock } from "lucide-react"
import { apiClient, type ShortUrl } from "../lib/api"
import { ClientLogger } from "../lib/logger"

interface UrlShortenerFormProps {
  onUrlCreated?: (url: ShortUrl) => void
}

export function UrlShortenerForm({ onUrlCreated }: UrlShortenerFormProps) {
  const [originalUrl, setOriginalUrl] = useState("")
  const [customCode, setCustomCode] = useState("")
  const [validityPeriod, setValidityPeriod] = useState(30)
  const [isLoading, setIsLoading] = useState(false)
  const [createdUrls, setCreatedUrls] = useState<ShortUrl[]>([])
  const { toast } = useToast()

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (createdUrls.length >= 5) {
      ClientLogger.warn("component", "URL creation blocked - session limit reached (5 URLs)")
      toast({
        title: "Limit Reached",
        description: "You can only create up to 5 URLs per session.",
        variant: "destructive",
      })
      return
    }

    if (!originalUrl.trim()) {
      ClientLogger.warn("component", "URL creation failed - empty URL provided")
      toast({
        title: "URL Required",
        description: "Please enter a URL to shorten.",
        variant: "destructive",
      })
      return
    }

    if (!validateUrl(originalUrl)) {
      ClientLogger.warn("component", `URL creation failed - invalid URL format: ${originalUrl}`)
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (including http:// or https://).",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    ClientLogger.info("component", `Submitting URL shortening form: ${originalUrl}`)

    try {
      const shortUrl = await apiClient.createShortUrl({
        url: originalUrl,
        customCode: customCode || undefined,
        validityPeriod,
      })

      setCreatedUrls((prev) => [...prev, shortUrl])
      onUrlCreated?.(shortUrl)

      // Reset form
      setOriginalUrl("")
      setCustomCode("")
      setValidityPeriod(30)

      toast({
        title: "URL Shortened Successfully",
        description: `Created short URL: ${shortUrl.shortCode}`,
      })

      ClientLogger.info("component", `URL shortened successfully: ${shortUrl.shortCode}`)
    } catch (error) {
      ClientLogger.error("component", `URL shortening failed: ${(error as Error).message}`)
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "URL copied to clipboard.",
      })
      ClientLogger.info("component", `URL copied to clipboard: ${text}`)
    } catch (error) {
      ClientLogger.error("component", `Failed to copy URL to clipboard: ${(error as Error).message}`)
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            URL Shortener
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Original URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/very-long-url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customCode">Custom Short Code (Optional)</Label>
                <Input
                  id="customCode"
                  placeholder="my-custom-code"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validity">Validity Period (Minutes)</Label>
                <Input
                  id="validity"
                  type="number"
                  min="1"
                  max="1440"
                  value={validityPeriod}
                  onChange={(e) => setValidityPeriod(Number.parseInt(e.target.value) || 30)}
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading || createdUrls.length >= 5} className="w-full">
              {isLoading ? "Creating..." : "Shorten URL"}
            </Button>

            {createdUrls.length >= 5 && (
              <p className="text-sm text-muted-foreground text-center">Maximum of 5 URLs per session reached</p>
            )}
          </form>
        </CardContent>
      </Card>

      {createdUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Shortened URLs ({createdUrls.length}/5)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {createdUrls.map((url) => (
                <div key={url.shortCode} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{url.originalUrl}</p>
                      <p className="text-sm text-muted-foreground">{url.shortUrl}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(url.shortUrl)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Expires: {new Date(url.validUntil).toLocaleString()}
                    </span>
                    <span>Code: {url.shortCode}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
