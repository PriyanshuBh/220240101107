"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "../hooks/use-toast"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Search, TrendingUp, Clock, MousePointer, ExternalLink } from "lucide-react"

import { apiClient, UrlStats } from "../lib/api"
import { ClientLogger } from "../lib/logger"

export function StatisticsDashboard() {
  const [shortCode, setShortCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<UrlStats | null>(null)
  const [searchHistory, setSearchHistory] = useState<UrlStats[]>([])
  const { toast } = useToast()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!shortCode.trim()) {
      ClientLogger.warn("component", "Statistics search failed - empty short code provided")
      toast({
        title: "Short Code Required",
        description: "Please enter a short code to view statistics.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    ClientLogger.info("component", `Searching for URL statistics: ${shortCode.trim()}`)

    try {
      const urlStats = await apiClient.getUrlStats(shortCode.trim())
      setStats(urlStats)

      // Add to search history if not already present
      setSearchHistory((prev) => {
        const exists = prev.find((item) => item.shortCode === urlStats.shortCode)
        if (!exists) {
          return [urlStats, ...prev.slice(0, 4)] // Keep only last 5 searches
        }
        return prev
      })

      toast({
        title: "Statistics Retrieved",
        description: `Found statistics for ${urlStats.shortCode}`,
      })

      ClientLogger.info(
        "component",
        `Statistics retrieved successfully: ${urlStats.shortCode} (${urlStats.clickCount} clicks)`,
      )
    } catch (error) {
      ClientLogger.error("component", `Statistics search failed: ${(error as Error).message}`)
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
      setStats(null)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (isExpired: boolean) => {
    return isExpired ? "text-destructive" : "text-chart-3"
  }

  const getStatusText = (isExpired: boolean) => {
    return isExpired ? "Expired" : "Active"
  }

  const chartData = stats
    ? [
        {
          name: "Clicks",
          value: stats.clickCount,
          color: "var(--chart-1)",
        },
      ]
    : []

  const handleHistoryItemClick = (item: UrlStats) => {
    ClientLogger.info("component", `Selected URL from search history: ${item.shortCode}`)
    setShortCode(item.shortCode)
    setStats(item)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            URL Statistics Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shortCode">Short Code</Label>
              <div className="flex gap-2">
                <Input
                  id="shortCode"
                  placeholder="Enter short code (e.g., abc123)"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold">{stats.clickCount}</p>
                </div>
                <MousePointer className="h-8 w-8 text-chart-1" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className={`text-2xl font-bold ${getStatusColor(stats.isExpired)}`}>
                    {getStatusText(stats.isExpired)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-chart-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm font-bold">{new Date(stats.createdAt).toLocaleDateString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-chart-3" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Accessed</p>
                  <p className="text-sm font-bold">
                    {stats.lastAccessed ? new Date(stats.lastAccessed).toLocaleDateString() : "Never"}
                  </p>
                </div>
                <ExternalLink className="h-8 w-8 text-chart-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>URL Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Short Code</Label>
                <p className="font-mono text-sm bg-muted p-2 rounded">{stats.shortCode}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Original URL</Label>
                <p className="text-sm break-all bg-muted p-2 rounded">{stats.originalUrl}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                  <p className="text-sm">{formatDate(stats.createdAt)}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Valid Until</Label>
                  <p className="text-sm">{formatDate(stats.validUntil)}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Last Accessed</Label>
                <p className="text-sm">{formatDate(stats.lastAccessed)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Click Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--chart-1)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {searchHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchHistory.map((item) => (
                <div
                  key={item.shortCode}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => handleHistoryItemClick(item)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.shortCode}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.originalUrl}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{item.clickCount} clicks</span>
                    <span className={getStatusColor(item.isExpired)}>{getStatusText(item.isExpired)}</span>
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
