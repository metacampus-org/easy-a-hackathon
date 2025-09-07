"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/contexts/wallet-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, GraduationCap, Users, BookOpen, Zap, Lock, User, Eye } from "lucide-react"

export default function HomePage() {
  const { isConnected, userRole } = useWallet()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    if (isConnected && userRole) {
      if (userRole === "admin") {
        router.push("/admin")
      } else {
        router.push("/student")
      }
    }
  }, [isConnected, userRole, router, isClient])

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">
            MetaCAMPUS - Decentralized Academic Records
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
            Secure, transparent, and immutable student academic records powered by Algorand blockchain technology. 
            Enables instant verification and eliminates transcript fraud.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/student">
              <Button size="lg" className="text-lg px-8">
                <User className="mr-2 h-5 w-5" />
                Student Portal
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <GraduationCap className="mr-2 h-5 w-5" />
                University Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">Access by Role</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Link href="/admin/transcript">
              <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="text-center">
                  <GraduationCap className="h-16 w-16 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">College Administrator</CardTitle>
                  <CardDescription className="text-base">
                    Onboard students and manage academic transcripts on the blockchain. 
                    Add course completions and maintain student records.
                  </CardDescription>
                  <div className="pt-4">
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Onboard new students</li>
                      <li>• Add/update transcript data</li>
                      <li>• Manage academic records</li>
                      <li>• Generate student hashes</li>
                    </ul>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/verify">
              <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="text-center">
                  <Shield className="h-16 w-16 text-accent mx-auto mb-4" />
                  <CardTitle className="text-xl">External Institution</CardTitle>
                  <CardDescription className="text-base">
                    Verify student academic records for admissions, transfers, or employment. 
                    Get instant, cryptographically verified transcripts.
                  </CardDescription>
                  <div className="pt-4">
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Verify student transcripts</li>
                      <li>• Download verification reports</li>
                      <li>• Check academic authenticity</li>
                      <li>• Access blockchain records</li>
                    </ul>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/student">
              <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="text-center">
                  <User className="h-16 w-16 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">Student</CardTitle>
                  <CardDescription className="text-base">
                    View your own academic history as stored on the blockchain. 
                    Share your transcript securely with institutions.
                  </CardDescription>
                  <div className="pt-4">
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• View academic transcript</li>
                      <li>• Download transcript data</li>
                      <li>• Share verification hash</li>
                      <li>• Track academic progress</li>
                    </ul>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">Why Blockchain Transcripts?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Immutable Security</CardTitle>
                <CardDescription>
                  Academic records stored on Algorand blockchain ensure permanent, tamper-proof transcripts that cannot be forged or modified
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <Zap className="h-12 w-12 text-accent mb-4" />
                <CardTitle>Instant Verification</CardTitle>
                <CardDescription>
                  Eliminate weeks of transcript verification delays. Get instant, cryptographic proof of academic achievements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <Lock className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Student Privacy</CardTitle>
                <CardDescription>
                  Students control access to their records via unique hash identifiers, maintaining privacy while enabling verification
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <Users className="h-12 w-12 text-accent mb-4" />
                <CardTitle>Global Recognition</CardTitle>
                <CardDescription>
                  Internationally verifiable transcripts enable seamless student mobility between institutions worldwide
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <GraduationCap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Detailed Records</CardTitle>
                <CardDescription>
                  Complete academic history with course details, grades, credits, and GPA calculations stored permanently
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-accent mb-4" />
                <CardTitle>Cost Effective</CardTitle>
                <CardDescription>
                  Reduce administrative costs and eliminate the need for expensive transcript verification services
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Overview */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center border-border">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Student Onboarding</CardTitle>
                <CardDescription>
                  College administrators create a unique blockchain identity for each student
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-border">
              <CardHeader>
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-accent">2</span>
                </div>
                <CardTitle>Transcript Updates</CardTitle>
                <CardDescription>
                  Academic data is added to the blockchain as students complete courses
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-border">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Student Access</CardTitle>
                <CardDescription>
                  Students can view and share their verified academic records using their hash
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-border">
              <CardHeader>
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-accent">4</span>
                </div>
                <CardTitle>Instant Verification</CardTitle>
                <CardDescription>
                  External institutions verify transcripts instantly using the student's hash
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">Decentralized Student Transcript Management</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Secure, transparent, and immutable academic records on the Algorand blockchain
          </p>
          <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
            <span>Built with TypeScript</span>
            <span>•</span>
            <span>Algorand Testnet</span>
            <span>•</span>
            <span>Pera Wallet Compatible</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
