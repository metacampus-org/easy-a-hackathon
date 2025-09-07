"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowLeft, Blocks, Award, Users, TrendingUp } from "lucide-react"
import { TransactionHistory } from "@/components/transaction-history"

export default function BlockchainDashboard() {
  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Algorand Blockchain Dashboard</h2>
          <p className="text-muted-foreground">Monitor and manage your metaCAMPUS blockchain operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Blocks className="h-4 w-4 mr-2" />
                Smart Contracts
              </CardTitle>
              <div className="text-2xl font-bold text-foreground">3</div>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Badges Minted
              </CardTitle>
              <div className="text-2xl font-bold text-foreground">142</div>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Active Wallets
              </CardTitle>
              <div className="text-2xl font-bold text-foreground">89</div>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Total Transactions
              </CardTitle>
              <div className="text-2xl font-bold text-foreground">1,247</div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Smart Contract Info */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Blocks className="h-5 w-5" />
                Smart Contract Status
              </CardTitle>
              <CardDescription>metaCAMPUS smart contract deployment information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Contract Address</p>
                  <p className="text-xs text-muted-foreground font-mono">App ID: 123456789</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Network</p>
                  <p className="text-xs text-muted-foreground">Algorand TestNet</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Version</p>
                  <p className="text-xs text-muted-foreground">v1.0.0</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <div className="mt-8">
          <TransactionHistory />
        </div>
      </div>
    </div>
  )
}
