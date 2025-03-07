"use client"

import type React from "react"

import { useState } from "react"
import { PublicKey } from "@solana/web3.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useWallet } from "@/hooks/use-wallet"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SendFormProps {
  publicKey: string | null
  balance: number
}

export default function SendForm({ publicKey, balance }: SendFormProps) {
  const { wallet } = useWallet()
  const { toast } = useToast()
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!publicKey || !wallet) {
      setError("Wallet not connected")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Validate recipient address
      let recipientPubkey: PublicKey
      try {
        recipientPubkey = new PublicKey(recipient)
      } catch (err) {
        throw new Error("Invalid recipient address")
      }

      // Validate amount
      const parsedAmount = Number.parseFloat(amount)
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Please enter a valid amount")
      }

      if (parsedAmount > balance) {
        throw new Error("Insufficient balance")
      }

      // In a real app, you would create and send a transaction
      // This is a simplified mock implementation

      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Show success message
      toast({
        title: "Transaction sent",
        description: `${parsedAmount} SOL sent to ${recipient.slice(0, 4)}...${recipient.slice(-4)}`,
      })

      // Reset form
      setRecipient("")
      setAmount("")
    } catch (err: any) {
      setError(err.message || "Failed to send transaction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSend} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="recipient">Recipient Address</Label>
        <Input
          id="recipient"
          placeholder="Enter Solana address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="amount">Amount (SOL)</Label>
          <span className="text-xs text-gray-400">Balance: {balance.toFixed(4)} SOL</span>
        </div>
        <Input
          id="amount"
          type="number"
          step="0.000000001"
          min="0"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs h-6 px-2"
            onClick={() => setAmount(balance.toString())}
          >
            MAX
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send SOL"
        )}
      </Button>
    </form>
  )
}

