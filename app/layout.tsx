// app/layout.tsx

import Footer from '@/components/footer'
import Header from '@/components/header'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import type { Metadata, Viewport } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'
// --- НАЧАЛО ИЗМЕНЕНИЯ ---
// 1. Импортируем компонент аналитики
import { Analytics } from '@vercel/analytics/react';
// --- КОНЕЦ ИЗМЕНЕНИЯ ---

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

const title = 'ViOracle'
const description =
  'Versatile Instructional Optimization and Rapid Cognitive Language Engine.'

export const metadata: Metadata = {
  metadataBase: new URL('https://morphic.sh'),
  title,
  description,
  openGraph: {
    title,
    description
  },
  twitter: {
    title,
    description,
    card: 'summary_large_image',
    creator: '@miiura'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn('font-sans antialiased', fontSans.variable)}>
        <Header />
        {children}
        <Footer />
        <Toaster />
        {/* --- НАЧАЛО ИЗМЕНЕНИЯ --- */}
        {/* 2. Добавляем сам компонент в конец body */}
        <Analytics />
        {/* --- КОНЕЦ ИЗМЕНЕНИЯ --- */}
      </body>
    </html>
  )
}
