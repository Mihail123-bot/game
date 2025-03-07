"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { X } from "lucide-react"

interface Toast {
  id: string
  title: string
  description?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  toast: (toast: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = ({ title, description, duration = 5000 }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, description, duration }])
  }

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 max-w-md">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss()
    }, toast.duration)

    return () => clearTimeout(timer)
  }, [toast.duration, onDismiss])

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 flex gap-3 items-start animate-in slide-in-from-bottom-5">
      <div className="flex-1">
        <div className="font-medium">{toast.title}</div>
        {toast.description && <div className="text-sm text-gray-400">{toast.description}</div>}
      </div>
      <button onClick={onDismiss} className="text-gray-400 hover:text-white">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

