import type React from "react"
import type { Metadata } from "next"

import { Toaster } from "../components/ui/sonner"

import { ErrorBoundary } from "../../components/error-boundary"
import { Suspense } from "react"
import "./globals.css"
import { Navigation } from "../../components/navigation"

export const metadata: Metadata = {
  title: "URL Shortener - Create Short Links",
  description: "Professional URL shortener for creating short, trackable links",
  
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={``}>
        <ErrorBoundary>
          <Navigation />
          <Suspense fallback={null}>
            {children}
            <Toaster />
          </Suspense>
        </ErrorBoundary>
        
      </body>
    </html>
  )
}
