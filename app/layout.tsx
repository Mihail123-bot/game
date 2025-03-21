import type React from "react"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
import { ToastProvider } from "@/components/ui/toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Multi-Chain Wallet",
  description: "A secure wallet for Solana and Ethereum",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ToastProvider>{children}</ToastProvider>
        </Providers>
      </body>
    </html>
  )
}



import './globals.css'