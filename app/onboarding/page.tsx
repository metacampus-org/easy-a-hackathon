"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { GraduationCap, User, Calendar, Hash, Wallet } from 'lucide-react'
import { useWallet } from '@/contexts/wallet-context'
import { WalletButton } from '@/components/wallet-button'
import { fileStorageService } from '@/lib/file-storage-service'

export default function StudentOnboardingPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [studentHash, setStudentHash] = useState("")
  
  const { toast } = useToast()
  const router = useRouter()
  const { isConnected, accountAddress } = useWallet()

  const generateStudentHash = (personalInfo: any) => {
    const dataString = JSON.stringify({
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      dateOfBirth: personalInfo.dateOfBirth,
      nationalId: personalInfo.nationalId,
      institutionId: "UNIV001",
      timestamp: Date.now()
    })
    
    // Convert to hex for hash-like appearance
    const encoder = new TextEncoder()
    const data = encoder.encode(dataString)
    return Array.from(data).map(byte => byte.toString(16).padStart(2, '0')).join('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!firstName.trim() || !lastName.trim() || !dateOfBirth.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const personalInfo = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        nationalId: nationalId.trim()
      }

      const hash = generateStudentHash(personalInfo)
      setStudentHash(hash)

      // Create student record
      const studentRecord = {
        studentHash: hash,
        personalInfo,
        institutionId: "UNIV001",
        institutionName: "University College",
        enrollmentDate: new Date().toISOString(),
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      // Save to storage
      const storage = await fileStorageService.loadData()
      if (!storage.data.students) {
        storage.data.students = []
      }
      
      storage.data.students.push(studentRecord)
      
      // Create wallet mapping if connected
      if (isConnected && accountAddress) {
        if (!storage.data.walletMappings) {
          storage.data.walletMappings = {}
        }
        storage.data.walletMappings[accountAddress] = {
          studentHash: hash,
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          registeredAt: new Date().toISOString()
        }
      }

      await fileStorageService.saveData(storage)

      toast({
        title: "Registration Successful!",
        description: "Your student account has been created. Save your student hash for future access.",
      })

    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration Failed",
        description: "Failed to create student account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyHash = async () => {
    if (studentHash) {
      try {
        await navigator.clipboard.writeText(studentHash)
        toast({
          title: "Hash Copied!",
          description: "Your student hash has been copied to clipboard",
        })
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Could not copy hash to clipboard",
          variant: "destructive",
        })
      }
    }
  }

  const handleGoToStudent = () => {
    router.push('/student')
  }

  if (studentHash) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span>Registration Complete!</span>
            </CardTitle>
            <CardDescription>
              Your student account has been successfully created
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Hash className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Your Student Hash</h3>
              </div>
              <p className="text-sm text-green-600 mb-3">
                This is your unique identifier. Save it securely and share it with your university when needed.
              </p>
              <div className="bg-green-100 p-3 rounded border">
                <code className="text-xs break-all font-mono">{studentHash}</code>
              </div>
              <div className="flex space-x-3 mt-4">
                <Button onClick={handleCopyHash} variant="outline" size="sm">
                  Copy Hash
                </Button>
                <Button onClick={handleGoToStudent} size="sm">
                  Go to Student Portal
                </Button>
              </div>
            </div>

            {isConnected && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Wallet className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-blue-800">Wallet Connected</h4>
                </div>
                <p className="text-sm text-blue-600">
                  Your wallet has been linked to this student account for easy access.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>Student Registration</span>
          </CardTitle>
          <CardDescription>
            Create your MetaCAMPUS student account to access transcripts and request badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID (Optional)</Label>
              <Input
                id="nationalId"
                placeholder="123456789"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
              />
            </div>

            {!isConnected && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Wallet className="h-4 w-4 text-amber-600" />
                    <h4 className="font-medium text-amber-800">Optional: Connect Wallet</h4>
                  </div>
                  <p className="text-sm text-amber-600 mb-4">
                    Connect your wallet for automatic access to your student records
                  </p>
                  <WalletButton />
                </CardContent>
              </Card>
            )}

            {isConnected && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Wallet className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Wallet Connected</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Your account will be linked to: {accountAddress?.substring(0, 8)}...
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Create Student Account
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
