import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { WalletProvider } from "@/contexts/wallet-context"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from '@vercel/analytics/next'
import { validateEnvironment, logValidationResults } from "@/lib/env-validation"

// Validate environment variables on app startup
if (typeof window === 'undefined') {
  const validationResult = validateEnvironment()
  logValidationResults(validationResult)
  
  if (!validationResult.isValid && process.env.NODE_ENV === 'development') {
    console.error('\n⚠️  The application may not function correctly with invalid environment configuration.')
    console.error('Please fix the errors above before continuing.\n')
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "MetaCAMPUS Badge Manager",
  description: "Blockchain-powered academic credential management",
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <WalletProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </WalletProvider>
      </body>
    </html>
  )
}
