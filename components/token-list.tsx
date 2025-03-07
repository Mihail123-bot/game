"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface TokenListProps {
  publicKey: string | null
}

interface Token {
  mint: string
  symbol: string
  balance: number
  decimals: number
  logo?: string
}

export default function TokenList({ publicKey }: TokenListProps) {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTokens() {
      if (!publicKey) return

      try {
        setLoading(true)
        // In a real app, you would fetch token data from the Solana blockchain
        // This is a simplified mock implementation

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Mock token data
        setTokens([
          {
            mint: "So11111111111111111111111111111111111111112",
            symbol: "SOL",
            balance: 1.5,
            decimals: 9,
            logo: "/placeholder.svg?height=32&width=32",
          },
          {
            mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            symbol: "USDC",
            balance: 25.0,
            decimals: 6,
            logo: "/placeholder.svg?height=32&width=32",
          },
          {
            mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
            symbol: "USDT",
            balance: 10.0,
            decimals: 6,
            logo: "/placeholder.svg?height=32&width=32",
          },
        ])
      } catch (error) {
        console.error("Error fetching tokens:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()
  }, [publicKey])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
            <Skeleton className="h-4 w-[80px] ml-auto" />
          </div>
        ))}
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div className="py-6 text-center text-gray-400">
        <p>No tokens found in this wallet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tokens.map((token) => (
        <div key={token.mint} className="flex items-center p-3 rounded-lg bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
              {token.logo ? (
                <img src={token.logo || "/placeholder.svg"} alt={token.symbol} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-medium">{token.symbol.slice(0, 2)}</span>
              )}
            </div>
            <div>
              <div className="font-medium">{token.symbol}</div>
              <div className="text-xs text-gray-400">
                {token.mint.slice(0, 4)}...{token.mint.slice(-4)}
              </div>
            </div>
          </div>
          <div className="ml-auto font-medium">{token.balance.toFixed(token.decimals === 9 ? 4 : 2)}</div>
        </div>
      ))}
    </div>
  )
}

