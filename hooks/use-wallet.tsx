"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

interface WalletContextType {
  wallet: any | null
  publicKey: string | null
  connecting: boolean
  connected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType>({
  wallet: null,
  publicKey: null,
  connecting: false,
  connected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
})

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<any | null>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)

  // Check if wallet is already connected on mount
  useEffect(() => {
    const storedPublicKey = localStorage.getItem("walletPublicKey")
    if (storedPublicKey) {
      setPublicKey(storedPublicKey)
      setConnected(true)
    }
  }, [])

  const connectWallet = async () => {
    try {
      setConnecting(true)

      // In a real app, you would use @solana/wallet-adapter to connect to a real wallet
      // This is a simplified mock implementation

      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate a mock public key
      const mockPublicKey = "8YLKoCu4MWrxPbc2LMvGmGTcnEHJXQWKNchcMJM8f3ky"

      // Store wallet state
      setWallet({})
      setPublicKey(mockPublicKey)
      setConnected(true)

      // Save to localStorage for persistence
      localStorage.setItem("walletPublicKey", mockPublicKey)
    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWallet(null)
    setPublicKey(null)
    setConnected(false)
    localStorage.removeItem("walletPublicKey")
  }

  return (
    <WalletContext.Provider
      value={{
        wallet,
        publicKey,
        connecting,
        connected,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}

