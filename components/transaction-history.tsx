"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, ExternalLink, RefreshCw, Award, CheckCircle, Clock, XCircle } from "lucide-react"
// Transaction interface
interface Transaction {
  id: string
  txId: string
  type: "badge_request" | "badge_approval" | "badge_mint" | "verification"
  status: "pending" | "confirmed" | "failed"
  timestamp: string
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = () => {
    // Return empty array since we removed the blockchain service
    setTransactions([])
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)

    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    loadTransactions()
    setIsRefreshing(false)
  }

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            Pending
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Confirmed
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Failed
          </Badge>
        )
      default:
        return null
    }
  }

  const getTypeIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "badge_request":
      case "badge_approval":
      case "badge_mint":
        return <Award className="h-4 w-4 text-primary" />
      case "verification":
        return <CheckCircle className="h-4 w-4 text-accent" />
      default:
        return <History className="h-4 w-4 text-muted-foreground" />
    }
  }

  const formatTransactionType = (type: Transaction["type"]) => {
    switch (type) {
      case "badge_request":
        return "Badge Request"
      case "badge_approval":
        return "Badge Approval"
      case "badge_mint":
        return "Badge Mint"
      case "verification":
        return "Badge Verification"
      default:
        return "Transaction"
    }
  }

  const truncateTxId = (txId: string) => {
    return `${txId.slice(0, 8)}...${txId.slice(-8)}`
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <CardDescription>Your blockchain transaction history for metaCAMPUS operations</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No transactions found</p>
            <p className="text-sm text-muted-foreground">Your blockchain transactions will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(transaction.type)}
                      {getStatusIcon(transaction.status)}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{formatTransactionType(transaction.type)}</h4>
                      <p className="text-sm text-muted-foreground font-mono">{truncateTxId(transaction.txId)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusBadge(transaction.status)}
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
