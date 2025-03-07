"use client"

import { useState, useEffect } from "react"
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { WalletMultiButton } from "@/components/ui/wallet-multi-button"
import { useWallet } from "@/hooks/use-wallet"
import TokenList from "@/components/token-list"
import TransactionHistory from "@/components/transaction-history"
import SendForm from "@/components/send-form"
import { Copy, ExternalLink } from "lucide-react"

export default function WalletDashboard() {
  const { wallet, connecting, connected, publicKey, connectWallet, disconnectWallet } = useWallet()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function getBalance() {
      if (publicKey) {
        try {
          setLoading(true)
          const connection = new Connection(clusterApiUrl("devnet"), "confirmed")
          const balance = await connection.getBalance(new PublicKey(publicKey))
          setBalance(balance / LAMPORTS_PER_SOL)
        } catch (error) {
          console.error("Error fetching balance:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    if (connected) {
      getBalance()
    } else {
      setBalance(null)
    }
  }, [publicKey, connected])

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex flex-col items-center justify-center mb-10 space-y-4 text-center">
        <div className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-500">
          <div className="p-4 bg-black rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10 text-white"
            >
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Solana Wallet</h1>
        <p className="max-w-[600px] text-gray-400">
          A secure and easy-to-use wallet for Solana blockchain. Manage your SOL and tokens with confidence.
        </p>
      </div>

      {!connected ? (
        <Card className="mx-auto max-w-md bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Connect to access your Solana wallet</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="p-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-16 h-16 mx-auto mb-4 text-gray-500"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M16 14V8a2 2 0 0 0-2-2H8" />
                <path d="M22 9v1" />
              </svg>
            </div>
            <WalletMultiButton />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Wallet</CardTitle>
                <Button variant="outline" size="sm" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
              <CardDescription>
                <div className="flex items-center mt-2 space-x-2">
                  <span className="text-xs text-gray-400">
                    {publicKey?.slice(0, 6)}...{publicKey?.slice(-4)}
                  </span>
                  <Button variant="ghost" size="icon" className="w-6 h-6" onClick={copyAddress} title="Copy address">
                    <Copy className="w-3 h-3" />
                    <span className="sr-only">Copy address</span>
                  </Button>
                  {copied && <span className="text-xs text-green-500">Copied!</span>}
                  <Button variant="ghost" size="icon" className="w-6 h-6" title="View on explorer" asChild>
                    <a
                      href={`https://explorer.solana.com/address/${publicKey}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="sr-only">View on explorer</span>
                    </a>
                  </Button>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-4 space-y-2">
                <div className="text-sm text-gray-400">Balance</div>
                {loading ? (
                  <Skeleton className="w-24 h-10" />
                ) : (
                  <div className="text-3xl font-bold">{balance !== null ? balance.toFixed(4) : "0"} SOL</div>
                )}
                <div className="text-xs text-gray-500">Connected to Devnet</div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="tokens">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900">
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
              <TabsTrigger value="send">Send</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="tokens">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Tokens</CardTitle>
                  <CardDescription>Manage your Solana tokens</CardDescription>
                </CardHeader>
                <CardContent>
                  <TokenList publicKey={publicKey} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="send">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Send SOL</CardTitle>
                  <CardDescription>Send SOL to another wallet</CardDescription>
                </CardHeader>
                <CardContent>
                  <SendForm publicKey={publicKey} balance={balance || 0} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="activity">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Your recent transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionHistory publicKey={publicKey} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

