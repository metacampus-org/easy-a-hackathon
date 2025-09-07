"use client"

import { useWallet } from "@/contexts/wallet-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const walletProviders = [
  { id: "pera", name: "Pera Wallet", icon: "/pera-logo.svg" },
  { id: "defly", name: "Defly Wallet", icon: "/defly-logo.svg" },
  { id: "exodus", name: "Exodus Wallet", icon: "/exodus-logo.svg" },
  { id: "lute", name: "Lute Wallet", icon: "/lute-logo.svg" },
] as const;

export function WalletConnectionModal() {
  const { isModalOpen, setIsModalOpen, connectWithProvider } = useWallet()

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Connect Wallet</DialogTitle>
          <DialogDescription className="text-center">
            Choose your preferred wallet provider to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {walletProviders.map((provider) => (
            <Button
              key={provider.id}
              onClick={() => connectWithProvider(provider.id)}
              variant="outline"
              size="lg"
              className="w-full flex justify-start items-center gap-4 h-14 text-lg"
            >
              <Image src={provider.icon} alt={`${provider.name} logo`} width={32} height={32} />
              <span>{provider.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
