import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Excellence University — Graduation 2026',
  description: 'Virtual Graduation Ceremony 2026 — Experience the milestone together, wherever you are.',
  openGraph: {
    title: 'Excellence University Graduation 2026',
    description: 'Join us for a premium virtual graduation celebration',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-navy text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
