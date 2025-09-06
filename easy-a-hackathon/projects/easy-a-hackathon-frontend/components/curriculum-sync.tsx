"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, CheckCircle, AlertCircle, Database } from "lucide-react"
import { CurriculumService } from "@/lib/curriculum-api"

interface SyncStatus {
  isLoading: boolean
  lastSync?: string
  success?: boolean
  error?: string
  coursesUpdated?: number
  objectivesUpdated?: number
  enrollmentsUpdated?: number
}

export function CurriculumSync() {
  const [selectedCMS, setSelectedCMS] = useState<string>("")
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ isLoading: false })

  const handleSync = async () => {
    if (!selectedCMS) return

    setSyncStatus({ isLoading: true })

    try {
      await CurriculumService.syncWithExternalCMS(selectedCMS as "curriqunet" | "koali" | "other")

      setSyncStatus({
        isLoading: false,
        success: true,
        lastSync: new Date().toISOString(),
        coursesUpdated: 5,
        objectivesUpdated: 23,
        enrollmentsUpdated: 156,
      })
    } catch (error) {
      setSyncStatus({
        isLoading: false,
        success: false,
        error: error instanceof Error ? error.message : "Sync failed",
      })
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          External CMS Integration
        </CardTitle>
        <CardDescription>Synchronize curriculum data with external curriculum management systems</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Select value={selectedCMS} onValueChange={setSelectedCMS}>
              <SelectTrigger>
                <SelectValue placeholder="Select CMS to sync with" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="curriqunet">CurriQunet</SelectItem>
                <SelectItem value="koali">Koali</SelectItem>
                <SelectItem value="other">Other CMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleSync}
            disabled={!selectedCMS || syncStatus.isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncStatus.isLoading ? "animate-spin" : ""}`} />
            {syncStatus.isLoading ? "Syncing..." : "Sync Now"}
          </Button>
        </div>

        {syncStatus.success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p>Synchronization completed successfully!</p>
                <div className="flex gap-4 text-xs">
                  <span>Courses: {syncStatus.coursesUpdated}</span>
                  <span>Objectives: {syncStatus.objectivesUpdated}</span>
                  <span>Enrollments: {syncStatus.enrollmentsUpdated}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last sync: {syncStatus.lastSync && new Date(syncStatus.lastSync).toLocaleString()}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {syncStatus.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Synchronization failed: {syncStatus.error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">CurriQunet</div>
            <Badge variant="outline" className="mt-1">
              Available
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">Koali</div>
            <Badge variant="outline" className="mt-1">
              Available
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">Custom API</div>
            <Badge variant="outline" className="mt-1">
              Configurable
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
