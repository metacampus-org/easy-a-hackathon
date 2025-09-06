import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Award, Users, BookOpen, Zap, Lock } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">metaCAMPUS</h1>
            <Badge variant="secondary" className="ml-2">
              Algorand
            </Badge>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/student" className="text-muted-foreground hover:text-foreground">
              Student Portal
            </Link>
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">
              Admin Dashboard
            </Link>
            <Button variant="outline">Connect Wallet</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">
            Secure Educational Credentials on Algorand Blockchain
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
            Transform higher education credentialing with immutable, verifiable digital badges powered by Algorand's
            sustainable blockchain technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              <Award className="mr-2 h-5 w-5" />
              Request Badge
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              <BookOpen className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">Why Choose metaCAMPUS?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Immutable Security</CardTitle>
                <CardDescription>
                  Credentials stored on Algorand blockchain ensure permanent, tamper-proof records
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <Zap className="h-12 w-12 text-accent mb-4" />
                <CardTitle>Instant Verification</CardTitle>
                <CardDescription>
                  Fast, automated verification process with real-time blockchain confirmation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <Lock className="h-12 w-12 text-primary mb-4" />
                <CardTitle>FERPA Compliant</CardTitle>
                <CardDescription>
                  Student-controlled privacy with off-chain data storage and on-chain verification
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <Users className="h-12 w-12 text-accent mb-4" />
                <CardTitle>Multi-Institution</CardTitle>
                <CardDescription>Seamless integration across universities and educational institutions</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <Award className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Granular Badges</CardTitle>
                <CardDescription>
                  Detailed learning outcomes and competency verification for each course
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-accent mb-4" />
                <CardTitle>API Integration</CardTitle>
                <CardDescription>
                  Connect with existing curriculum and student information management systems
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Overview */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-border">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Student Request</CardTitle>
                <CardDescription>
                  Students submit badge requests for completed courses through the portal
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-border">
              <CardHeader>
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-accent">2</span>
                </div>
                <CardTitle>Institution Validation</CardTitle>
                <CardDescription>
                  Administrators verify student enrollment and course completion via integrated systems
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-border">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Blockchain Badge</CardTitle>
                <CardDescription>
                  Approved credentials are minted as immutable badges on the Algorand blockchain
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
            <span className="text-lg font-semibold text-foreground">metaCAMPUS</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Powered by Algorand blockchain technology for secure, sustainable educational credentialing
          </p>
          <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/support" className="hover:text-foreground">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
