"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"
import { Loader2 } from "lucide-react"

export function WalletMultiButton() {
  const { connecting, connected, connectWallet } = useWallet()

  return (
    <Button
      onClick={connectWallet}
      disabled={connecting || connected}
      className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
    >
      {connecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : connected ? (
        "Connected"
      ) : (
        "Connect Wallet"
      )}
    </Button>
  )
}

