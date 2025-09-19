import { StatisticsDashboard } from "../../../components/statistics-dashboard"

export default function StatisticsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">URL Statistics</h1>
            <p className="text-lg text-muted-foreground">
              View detailed analytics and performance metrics for your shortened URLs.
            </p>
          </div>

          <StatisticsDashboard />
        </div>
      </div>
    </main>
  )
}
