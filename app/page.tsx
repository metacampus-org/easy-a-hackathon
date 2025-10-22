"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, GraduationCap, Users, BookOpen, Zap, Lock, User, Eye, Clock, DollarSign, Globe, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"

export default function HomePage() {
  const { isConnected, isConnecting, isUniversity, isSuperAdmin, userRole } = useWallet()
  
  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="outline" className="mb-4 text-xs md:text-sm">
            Powered by Algorand Blockchain
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6 text-balance leading-tight">
            Your Academic Records,
            <br />
            <span className="text-primary">Owned by You Forever</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto text-pretty px-4">
            Stop waiting weeks for transcripts. Stop paying verification fees. Stop worrying about lost records.
            <span className="block mt-2 font-semibold text-foreground">
              MetaCAMPUS puts you in control with blockchain-verified academic credentials.
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
            {isConnecting ? (
              // Show loading state while checking wallet
              <Button size="lg" disabled className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </Button>
            ) : isConnected && (isUniversity() || isSuperAdmin()) ? (
              // Show University Portal button for university admins and super admins
              <>
                <Link href="/university-admin" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6">
                    <GraduationCap className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Access University Portal
                  </Button>
                </Link>
                {isSuperAdmin() && (
                  <Link href="/super-admin" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6 bg-transparent">
                      <Shield className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                      Super Admin
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              // Show Student Portal and University Sign Up for students and non-connected users
              <>
                <Link href="/student" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6">
                    <User className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Access Student Portal
                  </Button>
                </Link>
                <Link href="/university-signup" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6 bg-transparent">
                    <GraduationCap className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    University Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-4 md:mt-6 px-4">
            {isConnecting ? (
              '🔄 Checking wallet connection...'
            ) : isConnected && (isUniversity() || isSuperAdmin()) ? (
              `✅ University admin access granted • Role: ${isSuperAdmin() ? 'Super Admin' : 'University'}`
            ) : isConnected ? (
              '✅ Connected as Student'
            ) : (
              '🔒 Connect your wallet to get started • New users automatically get student access'
            )}
          </p>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-12 md:py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
              The Broken System We're Fixing
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Traditional transcript systems are slow, expensive, and vulnerable to fraud
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader className="pb-3 md:pb-4">
                <Clock className="h-8 w-8 md:h-10 md:w-10 text-destructive mb-2 md:mb-3" />
                <CardTitle className="text-base md:text-lg">Weeks of Waiting</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Students wait 2-4 weeks for transcripts to be processed and mailed. Miss deadlines. Lose opportunities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader className="pb-3 md:pb-4">
                <DollarSign className="h-8 w-8 md:h-10 md:w-10 text-destructive mb-2 md:mb-3" />
                <CardTitle className="text-base md:text-lg">Expensive Fees</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  $10-50 per transcript request. Institutions spend millions on manual verification and third-party services.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader className="pb-3 md:pb-4">
                <AlertTriangle className="h-8 w-8 md:h-10 md:w-10 text-destructive mb-2 md:mb-3" />
                <CardTitle className="text-base md:text-lg">Rampant Fraud</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Fake transcripts slip through manual checks. No way to instantly verify authenticity. Trust is broken.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-8 md:mt-12 text-center">
            <p className="text-lg md:text-xl font-semibold text-foreground mb-2">
              The result? Delays, wasted money, and undermined trust in academic credentials.
            </p>
            <p className="text-base md:text-lg text-primary font-bold">
              MetaCAMPUS changes everything.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
              The MetaCAMPUS Solution
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Blockchain-powered academic records that are instant, affordable, and impossible to fake
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3 md:pb-4">
                <Zap className="h-8 w-8 md:h-10 md:w-10 text-primary mb-2 md:mb-3" />
                <CardTitle className="text-base md:text-lg">Instant Access</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  <span className="font-semibold text-foreground">Under 5 seconds.</span> Share your verified transcript with any institution, anywhere in the world. No waiting. No delays.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3 md:pb-4">
                <DollarSign className="h-8 w-8 md:h-10 md:w-10 text-primary mb-2 md:mb-3" />
                <CardTitle className="text-base md:text-lg">Pennies, Not Dollars</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  <span className="font-semibold text-foreground">Fraction-of-a-cent fees.</span> Algorand's low transaction costs make verification affordable for everyone. No more $50 transcript fees.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3 md:pb-4">
                <Shield className="h-8 w-8 md:h-10 md:w-10 text-primary mb-2 md:mb-3" />
                <CardTitle className="text-base md:text-lg">Fraud-Proof</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  <span className="font-semibold text-foreground">Cryptographically verified.</span> Every record is immutable and transparent. Fake transcripts are impossible. Trust is restored.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-12 md:py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-foreground px-4">
            Built for Everyone in Education
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardHeader className="text-center p-4 md:p-6">
                <User className="h-12 w-12 md:h-16 md:w-16 text-primary mx-auto mb-3 md:mb-4" />
                <CardTitle className="text-lg md:text-xl mb-2">Students</CardTitle>
                <CardDescription className="text-sm md:text-base mb-4">
                  <span className="font-semibold text-foreground">Own your academic future.</span> View, share, and control your verified transcript from anywhere in the world.
                </CardDescription>
                <div className="pt-2 md:pt-4">
                  <ul className="text-xs md:text-sm text-muted-foreground space-y-1.5 text-left">
                    <li className="flex items-start">
                      <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Instant access to your verified transcript</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Share with employers in seconds</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Never lose your academic records</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>No more waiting or fees</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 md:pt-6">
                  <Link href="/student" className="block">
                    <Button variant="outline" className="w-full text-sm md:text-base">
                      <User className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                      Access Student Portal
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardHeader className="text-center p-4 md:p-6">
                <GraduationCap className="h-12 w-12 md:h-16 md:w-16 text-primary mx-auto mb-3 md:mb-4" />
                <CardTitle className="text-lg md:text-xl mb-2">Universities</CardTitle>
                <CardDescription className="text-sm md:text-base mb-4">
                  <span className="font-semibold text-foreground">Cut costs, boost trust.</span> Issue tamper-proof credentials and eliminate verification overhead.
                </CardDescription>
                <div className="pt-2 md:pt-4">
                  <ul className="text-xs md:text-sm text-muted-foreground space-y-1.5 text-left">
                    <li className="flex items-start">
                      <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Onboard students to blockchain</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Issue verified academic credentials</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Reduce administrative costs by 90%</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Enhance institutional reputation</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 md:pt-6">
                  <Link href="/university-signup" className="block">
                    <Button variant="outline" className="w-full text-sm md:text-base">
                      <GraduationCap className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                      Register Your Institution
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-border hover:border-primary/50 transition-colors sm:col-span-2 lg:col-span-1">
              <CardHeader className="text-center p-4 md:p-6">
                <Eye className="h-12 w-12 md:h-16 md:w-16 text-accent mx-auto mb-3 md:mb-4" />
                <CardTitle className="text-lg md:text-xl mb-2">Verifiers</CardTitle>
                <CardDescription className="text-sm md:text-base mb-4">
                  <span className="font-semibold text-foreground">Verify in seconds, not weeks.</span> Instantly confirm academic credentials with cryptographic proof.
                </CardDescription>
                <div className="pt-2 md:pt-4">
                  <ul className="text-xs md:text-sm text-muted-foreground space-y-1.5 text-left">
                    <li className="flex items-start">
                      <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                      <span>Instant transcript verification</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                      <span>100% fraud-proof credentials</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                      <span>Download verification reports</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                      <span>No account required</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 md:pt-6">
                  <Link href="/verify" className="block">
                    <Button variant="outline" className="w-full text-sm md:text-base">
                      <Eye className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                      Verify Transcripts Now
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Algorand Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4 px-4">
              Why Algorand Blockchain?
            </h3>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Not all blockchains are created equal. Here's why we chose Algorand over Ethereum and others.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader className="p-4 md:p-6">
                <Zap className="h-10 w-10 md:h-12 md:w-12 text-primary mb-3 md:mb-4" />
                <CardTitle className="text-base md:text-lg mb-2">Lightning Fast & Affordable</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  <span className="font-semibold text-foreground">Sub-5 second finality.</span> Fraction-of-a-cent fees. 
                  <span className="block mt-2 text-destructive">Ethereum? $50+ gas fees and 15+ minute confirmations make it unusable for education.</span>
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader className="p-4 md:p-6">
                <Lock className="h-10 w-10 md:h-12 md:w-12 text-accent mb-3 md:mb-4" />
                <CardTitle className="text-base md:text-lg mb-2">Enterprise-Grade Security</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  <span className="font-semibold text-foreground">Pure Proof-of-Stake.</span> Immediate finality. Carbon-neutral operations. 
                  <span className="block mt-2">Built by MIT cryptographers for mission-critical applications.</span>
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors sm:col-span-2 lg:col-span-1">
              <CardHeader className="p-4 md:p-6">
                <Globe className="h-10 w-10 md:h-12 md:w-12 text-primary mb-3 md:mb-4" />
                <CardTitle className="text-base md:text-lg mb-2">Built for Global Scale</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  <span className="font-semibold text-foreground">Thousands of TPS.</span> Consistent performance under load. 
                  <span className="block mt-2">Perfect for global education networks with millions of students.</span>
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4 px-4">
              Simple Process, Powerful Results
            </h3>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              From enrollment to employment, your academic journey secured on the blockchain
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
            <Card className="text-center border-border hover:shadow-lg transition-shadow">
              <CardHeader className="p-4 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle className="text-base md:text-lg mb-2">Enroll</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Your university creates your unique blockchain identity. One-time setup, lifetime access.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-border hover:shadow-lg transition-shadow">
              <CardHeader className="p-4 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl font-bold text-accent">2</span>
                </div>
                <CardTitle className="text-base md:text-lg mb-2">Earn</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Complete courses. Your verified credentials are automatically added to the blockchain.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-border hover:shadow-lg transition-shadow">
              <CardHeader className="p-4 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle className="text-base md:text-lg mb-2">Share</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Share your transcript hash with employers or schools. Instant access, no waiting.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-border hover:shadow-lg transition-shadow">
              <CardHeader className="p-4 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl font-bold text-accent">4</span>
                </div>
                <CardTitle className="text-base md:text-lg mb-2">Verify</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Institutions verify your credentials in seconds. Cryptographic proof. Zero fraud.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-8 md:mt-12 text-center">
            <Card className="max-w-3xl mx-auto border-primary/30 bg-primary/5">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl mb-2">The Result?</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  <span className="font-semibold text-foreground text-base md:text-lg">
                    Students save time and money. Universities cut costs. Employers trust credentials. Everyone wins.
                  </span>
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-primary bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader className="text-center p-6 md:p-12">
              <Shield className="h-12 w-12 md:h-16 md:w-16 text-primary mx-auto mb-4 md:mb-6" />
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl mb-3 md:mb-4 px-4">
                Ready to Take Control of Your Academic Future?
              </CardTitle>
              <CardDescription className="text-base md:text-lg mb-6 md:mb-8 px-4">
                Join the revolution in academic credential management. Your records, your control, forever.
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
                <Link href="/student" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6">
                    <User className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Get Started as Student
                  </Button>
                </Link>
                <Link href="/university-signup" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6">
                    <GraduationCap className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Register Institution
                  </Button>
                </Link>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-4 md:mt-6 px-4">
                Free to use • Secure by design • Powered by Algorand
              </p>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 md:py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-3 md:mb-4">
            <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <span className="text-base md:text-lg font-semibold text-foreground">MetaCAMPUS</span>
          </div>
          <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 px-4">
            Decentralized academic records on the Algorand blockchain
          </p>
          <div className="text-xs text-muted-foreground px-4">
            <p>© 2025 MetaCAMPUS. Empowering students through blockchain technology.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
