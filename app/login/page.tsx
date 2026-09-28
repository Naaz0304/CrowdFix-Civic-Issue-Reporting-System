"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Shield, Users, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const router = useRouter()
  const { user, login, isAuthenticated } = useAuth()
  const [role, setRole] = useState<"citizen" | "authority" | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "citizen") {
        router.push("/")
      } else if (user.role === "authority") {
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, user, router])

  const handleDemoLogin = async (demoRole: "citizen" | "authority") => {
    setRole(demoRole)
    setError("")

    if (demoRole === "citizen") {
      setEmail("citizen@example.com")
      setPassword("citizen123")
    } else {
      setEmail("authority@example.com")
      setPassword("authority123")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!role) {
      setError("Please select a role")
      return
    }

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    setIsLoading(true)
    setError("")

    const result = await login(email, password, role)

    if (!result.success) {
      setError(result.error || "Login failed")
      setIsLoading(false)
    }
  }

  if (role) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-2xl">CF</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">CrowdFix</h1>
            <p className="text-muted-foreground">Login as {role === "citizen" ? "Citizen" : "Authority"}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Enter your credentials</CardTitle>
              <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    setRole(null)
                    setEmail("")
                    setPassword("")
                    setError("")
                  }}
                  disabled={isLoading}
                >
                  Back to Role Selection
                </Button>

                <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">Demo Credentials:</p>
                  <p>Email: {role === "citizen" ? "citizen@example.com" : "authority@example.com"}</p>
                  <p>Password: {role === "citizen" ? "citizen123" : "authority123"}</p>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-primary hover:underline font-medium">
                    Sign up here
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">CF</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">CrowdFix</h1>
          <p className="text-lg text-muted-foreground">Choose your role to get started</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Citizen Card */}
          <Card className="border-2 border-border hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-primary" />
                <CardTitle>Citizen</CardTitle>
              </div>
              <CardDescription>Report civic issues in your community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Report issues with photos
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Add geolocation data
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Track issue status in real-time
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Receive updates and notifications
                </li>
              </ul>
              <Button onClick={() => handleDemoLogin("citizen")} className="w-full mt-4">
                Login as Citizen
              </Button>
            </CardContent>
          </Card>

          {/* Authority Card */}
          <Card className="border-2 border-border hover:border-secondary transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-secondary" />
                <CardTitle>Authority</CardTitle>
              </div>
              <CardDescription>Manage and resolve reported issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  View all reported issues
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  Filter by location and status
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  Update issue status
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  View analytics and reports
                </li>
              </ul>
              <Button
                onClick={() => handleDemoLogin("authority")}
                className="w-full mt-4 bg-secondary hover:bg-secondary/90"
              >
                Login as Authority
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          This is a secure platform for civic engagement. Your data is protected and only shared with authorized
          officials.
        </p>

        <p className="text-center text-sm text-muted-foreground mt-4">
          New user?{" "}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Create account
          </Link>
        </p>
      </div>
    </main>
  )
}
