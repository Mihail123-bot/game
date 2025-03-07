"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from "@solana/web3.js"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Send, RefreshCw, ExternalLink } from "lucide-react"

const HELIUS_API_KEY = "1c14c5e5-3c9d-4a53-97c8-9c27d398532d"
const HELIUS_API_URL = `https://api.helius.xyz/v0/addresses`

const DELAY_BETWEEN_CALLS = 2000 // 2 seconds

interface TokenBalance {
  mint: string
  amount: string
  decimals: number
  tokenAccount: string
}

interface NFT {
  name: string
  image: string
  collection: string
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function SolanaWallet() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const { toast } = useToast()
  const [balance, setBalance] = useState<number | null>(null)
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([])
  const [nfts, setNfts] = useState<NFT[]>([])
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [sendingTransaction, setSendingTransaction] = useState(false)
  const [nftError, setNftError] = useState<string | null>(null)

  const fetchWithRetry = useCallback(async (url: string, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url)
        return response.data
      } catch (error: any) {
        if (error.response && error.response.status === 429) {
          console.log(`Rate limited, waiting ${DELAY_BETWEEN_CALLS}ms before retry`)
          await delay(DELAY_BETWEEN_CALLS)
        } else if (i === retries - 1) {
          throw error
        } else {
          await delay(DELAY_BETWEEN_CALLS)
        }
      }
    }
    throw new Error("Max retries reached")
  }, [])

  const fetchBalanceAndTokens = useCallback(async () => {
    if (publicKey) {
      try {
        setLoading(true)
        const data = await fetchWithRetry(
          `${HELIUS_API_URL}/${publicKey.toBase58()}/balances?api-key=${HELIUS_API_KEY}`,
        )
        setBalance(data.nativeBalance / LAMPORTS_PER_SOL)
        setTokenBalances(data.tokens)
      } catch (error) {
        console.error("Error fetching balance and tokens:", error)
        toast({
          title: "Failed to fetch balance and tokens",
          description: "Please try again later",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
  }, [publicKey, toast, fetchWithRetry])

  const fetchNFTs = useCallback(async () => {
    if (publicKey) {
      try {
        setLoading(true)
        setNftError(null)
        // Instead of using the Helius API, we'll use the Solana connection to fetch NFTs
        const nftAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        })

        const nftData = nftAccounts.value
          .filter((account) => account.account.data.parsed.info.tokenAmount.uiAmount === 1)
          .map((account) => ({
            name: account.account.data.parsed.info.mint,
            image: "/placeholder.svg", // We don't have image URLs, so we use a placeholder
            collection: "Unknown", // We don't have collection info
          }))

        setNfts(nftData)
      } catch (error) {
        console.error("Error fetching NFTs:", error)
        setNftError("Failed to fetch NFTs. Please try again later.")
        setNfts([])
      } finally {
        setLoading(false)
      }
    }
  }, [publicKey, connection])

  const fetchTransactions = useCallback(async () => {
    if (publicKey) {
      try {
        setLoading(true)
        const data = await fetchWithRetry(
          `${HELIUS_API_URL}/${publicKey.toBase58()}/transactions?api-key=${HELIUS_API_KEY}`,
        )
        setTransactions(data.slice(0, 10))
      } catch (error) {
        console.error("Error fetching transactions:", error)
        toast({
          title: "Failed to fetch transactions",
          description: "Please try again later",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
  }, [publicKey, toast, fetchWithRetry])

  useEffect(() => {
    const fetchData = async () => {
      await fetchBalanceAndTokens()
      await delay(DELAY_BETWEEN_CALLS)
      await fetchNFTs()
      await delay(DELAY_BETWEEN_CALLS)
      await fetchTransactions()
    }
    fetchData()
  }, [fetchBalanceAndTokens, fetchNFTs, fetchTransactions])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey) return

    try {
      setSendingTransaction(true)
      const recipientPubkey = new PublicKey(recipient)
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: LAMPORTS_PER_SOL * Number(amount),
        }),
      )

      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, "confirmed")

      toast({
        title: "Transaction sent",
        description: `${amount} SOL sent to ${recipient.slice(0, 4)}...${recipient.slice(-4)}`,
      })

      setRecipient("")
      setAmount("")
      await fetchBalanceAndTokens()
      await delay(DELAY_BETWEEN_CALLS)
      await fetchTransactions()
    } catch (error) {
      console.error("Error sending transaction:", error)
      toast({
        title: "Transaction failed",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setSendingTransaction(false)
    }
  }

  if (!publicKey) return null

  return (
    <div className="space-y-6 p-4 bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl shadow-2xl">
      <Card className="bg-black/50 border-0 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Solana Wallet</CardTitle>
          <CardDescription className="text-gray-300">Your gateway to the Solana ecosystem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Address</p>
              <p className="text-white font-mono">
                {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Balance</p>
              <p className="text-2xl font-bold text-white">
                {balance !== null ? `${balance.toFixed(4)} SOL` : <Loader2 className="h-6 w-6 animate-spin" />}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/50 border-0 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Send SOL</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <Label htmlFor="recipient" className="text-gray-300">
                Recipient Address
              </Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Solana address"
                required
                className="bg-white/10 border-white/20 text-white placeholder-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="amount" className="text-gray-300">
                Amount (SOL)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.000000001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                required
                className="bg-white/10 border-white/20 text-white placeholder-gray-500"
              />
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={sendingTransaction}>
              {sendingTransaction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send SOL
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="tokens" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/30 rounded-lg p-1">
          <TabsTrigger value="tokens" className="text-white">
            Tokens
          </TabsTrigger>
          <TabsTrigger value="nfts" className="text-white">
            NFTs
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-white">
            Transactions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tokens">
          <Card className="bg-black/50 border-0 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Token Balances</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              ) : tokenBalances.length > 0 ? (
                <ul className="space-y-2">
                  {tokenBalances.map((token) => (
                    <li key={token.mint} className="flex items-center justify-between text-sm text-gray-300">
                      <span>
                        {token.mint.slice(0, 4)}...{token.mint.slice(-4)}
                      </span>
                      <span>{(Number(token.amount) / Math.pow(10, token.decimals)).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-400">No token balances found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="nfts">
          <Card className="bg-black/50 border-0 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">NFTs</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              ) : nftError ? (
                <p className="text-center text-red-400">{nftError}</p>
              ) : nfts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {nfts.map((nft, index) => (
                    <div key={index} className="bg-white/10 p-2 rounded-lg">
                      <img
                        src={nft.image || "/placeholder.svg"}
                        alt={nft.name}
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <p className="mt-2 text-sm text-white">{nft.name.slice(0, 8)}...</p>
                      <p className="text-xs text-gray-400">{nft.collection}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400">No NFTs found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transactions">
          <Card className="bg-black/50 border-0 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold text-white">Recent Transactions</CardTitle>
              <Button variant="ghost" size="icon" onClick={fetchTransactions} className="text-white">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              ) : transactions.length > 0 ? (
                <ul className="space-y-2">
                  {transactions.map((tx) => (
                    <li key={tx.signature} className="flex items-center justify-between text-sm text-gray-300">
                      <span>
                        {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                      </span>
                      <a
                        href={`https://explorer.solana.com/tx/${tx.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 flex items-center"
                      >
                        View <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-400">No recent transactions</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

