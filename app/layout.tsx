import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Forever Message',
  description: 'Messages in bottles floating in a digital ocean',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
