"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, GraduationCap, User } from "lucide-react"
import { WalletButton } from "@/components/wallet-button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home", icon: Shield },
  { href: "/student", label: "Student Portal", icon: User },
  { href: "/admin/transcript", label: "College Admin", icon: GraduationCap },
] as const;

export function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <Shield className="h-7 w-7 text-primary" />
            <span className="hidden sm:inline">MetaCAMPUS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  pathname === link.href && "text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <WalletButton />
      </div>
    </header>
  )
}
