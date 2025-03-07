"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TransactionHistoryProps {
  publicKey: string | null
}

interface Transaction {
  signature: string
  type: "send" | "receive"
  amount: number
  timestamp: number
  otherParty: string
}

export default function TransactionHistory({ publicKey }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTransactions() {
      if (!publicKey) return

      try {
        setLoading(true)
        // In a real app, you would fetch transaction data from the Solana blockchain
        // This is a simplified mock implementation

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Mock transaction data
        setTransactions([
          {
            signature: "5UfgJ5sVQKQrUhsKHkNLm9T9GmYw3s9xnVMTb1L1zzYBs9aTVFUiXpXTBTuxxZBo6JeUMKcCpUxQ5QDUokBLkXKE",
            type: "receive",
            amount: 0.1,
            timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
            otherParty: "8YLKoCu4MWrxPbc2LMvGmGTcnEHJXQWKNchcMJM8f3ky",
          },
          {
            signature: "4xA2UW9u3Rj1NqKJnxXCxLUQxffNzQnHZbVnTQ6Vn7UD7z8LcWzwJLjA1k2i9g6XHqVCsKQnKWnKHk8QJJf4Bnxs",
            type: "send",
            amount: 0.05,
            timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
            otherParty: "DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy",
          },
          {
            signature: "2JQm5YT3KKfKTZYqJ5xUzpCeuPxGVrA8fXzYtdKdHxTNnbLG8AjZ8xnGfk6KqeahU4KVJUxqZ2WJYFmjkEZcRFqd",
            type: "receive",
            amount: 0.2,
            timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
            otherParty: "6YR1MrGu1tmk5sWNGjmJYXQxTNNcy1aFRvmKQtqHhUKr",
          },
        ])
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
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

  if (transactions.length === 0) {
    return (
      <div className="py-6 text-center text-gray-400">
        <p>No transaction history found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div key={tx.signature} className="flex items-center p-3 rounded-lg bg-gray-800">
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-700">
            {tx.type === "receive" ? (
              <ArrowDownLeft className="w-5 h-5 text-green-400" />
            ) : (
              <ArrowUpRight className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <div className="font-medium">{tx.type === "receive" ? "Received" : "Sent"}</div>
            <div className="text-xs text-gray-400">
              {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString()}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className={`font-medium ${tx.type === "receive" ? "text-green-400" : "text-red-400"}`}>
              {tx.type === "receive" ? "+" : "-"}
              {tx.amount} SOL
            </div>
            <Button variant="ghost" size="sm" className="h-6 px-1" asChild>
              <a
                href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-xs text-gray-400 hover:text-white"
              >
                View <ExternalLink className="ml-1 w-3 h-3" />
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

