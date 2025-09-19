import { UrlShortenerForm } from "../../components/url-shortener-form"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">URL Shortener</h1>
            <p className="text-lg text-muted-foreground">
              Create short, memorable links for your long URLs. Perfect for sharing and tracking.
            </p>
          </div>

          <UrlShortenerForm />
        </div>
      </div>
    </main>
  )
}
