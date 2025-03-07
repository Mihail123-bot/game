"use client"

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useWallet } from "@solana/wallet-adapter-react"
import SolanaWallet from "@/components/SolanaWallet"

export default function Home() {
  const { connected } = useWallet()

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Solana Wallet
        </h1>

        <div className="flex justify-center mb-8">
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
        </div>

        {connected && <SolanaWallet />}
      </div>
    </main>
  )
}

