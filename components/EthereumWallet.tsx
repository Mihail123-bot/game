"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { useEthereumWallet } from "@/hooks/useEthereumWallet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function EthereumWallet() {
  const { account, provider } = useEthereumWallet()
  const { toast } = useToast()
  const [balance, setBalance] = useState<string | null>(null)
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    if (account && provider) {
      provider.getBalance(account).then((bal) => {
        setBalance(ethers.utils.formatEther(bal))
      })
      fetchTransactions()
    }
  }, [account, provider])

  const fetchTransactions = async () => {
    if (account && provider) {
      const history = await provider.getHistory(account)
      setTransactions(history.slice(0, 10))
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!account || !provider) return

    try {
      const signer = provider.getSigner()
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.utils.parseEther(amount),
      })
      await tx.wait()

      toast({
        title: "Transaction sent",
        description: `${amount} ETH sent to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
      })

      setRecipient("")
      setAmount("")
      fetchTransactions()
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  if (!account) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ethereum Wallet</CardTitle>
          <CardDescription>Your Ethereum wallet details and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Address: {account}</p>
          <p>Balance: {balance !== null ? `${Number(balance).toFixed(4)} ETH` : "Loading..."}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send ETH</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Ethereum address"
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount (ETH)</Label>
              <Input
                id="amount"
                type="number"
                step="0.000000000000000001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                required
              />
            </div>
            <Button type="submit">Send</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {transactions.map((tx) => (
              <li key={tx.hash} className="text-sm">
                <a
                  href={`https://etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {tx.hash.slice(0, 8)}...{tx.hash.slice(-8)}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

