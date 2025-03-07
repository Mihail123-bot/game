"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import Web3Modal from "web3modal"

let web3Modal: Web3Modal | null = null

export function useEthereumWallet() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [account, setAccount] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      web3Modal = new Web3Modal({
        network: "mainnet",
        cacheProvider: true,
      })
    }
  }, [])

  const connect = async () => {
    if (web3Modal) {
      try {
        const instance = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(instance)
        const accounts = await provider.listAccounts()

        setProvider(provider)
        setAccount(accounts[0])

        instance.on("accountsChanged", (accounts: string[]) => {
          setAccount(accounts[0])
        })

        instance.on("chainChanged", () => {
          window.location.reload()
        })
      } catch (error) {
        console.error("Failed to connect to Ethereum wallet:", error)
      }
    }
  }

  const disconnect = async () => {
    if (web3Modal) {
      web3Modal.clearCachedProvider()
      setProvider(null)
      setAccount(null)
    }
  }

  return { provider, account, connect, disconnect }
}

