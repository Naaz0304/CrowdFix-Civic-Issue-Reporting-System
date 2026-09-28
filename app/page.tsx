"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, MapPin, TrendingUp, Users, LogOut, Moon, Sun } from "lucide-react"
import { useEffect } from "react"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, role, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navigation */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CF</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">CrowdFix</h1>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground capitalize">
              {role === "citizen" ? "Citizen Mode" : "Authority Mode"}
            </span>
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            {role === "citizen" ? (
              <>
                <Button variant="ghost" onClick={() => router.push("/citizen-dashboard")}>
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => router.push("/report")}>
                  Report Issue
                </Button>
                <Button variant="ghost" onClick={() => router.push("/community")}>
                  Community
                </Button>
                <Button variant="ghost" onClick={() => router.push("/notifications")}>
                  Notifications
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                View Dashboard
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-foreground mb-6">Make Your Community Better</h2>
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
          {role === "citizen"
            ? "Report local civic issues directly to city officials. Track progress in real-time and help improve your neighborhood."
            : "Monitor and manage reported issues in your city. Respond quickly to citizen reports."}
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {role === "citizen" ? (
            <>
              <Button size="lg" onClick={() => router.push("/report")}>
                Report an Issue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/tracker")}>
                Track Issues
              </Button>
            </>
          ) : (
            <Button size="lg" onClick={() => router.push("/dashboard")}>
              View Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-border">
          <CardHeader className="pb-4">
            <MapPin className="w-8 h-8 text-primary mb-3" />
            <CardTitle>Report with Location</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Include precise geolocation and photos when reporting issues for faster response times.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-4">
            <TrendingUp className="w-8 h-8 text-secondary mb-3" />
            <CardTitle>Track Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Monitor the status of reported issues in real-time and receive updates when resolved.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-4">
            <Users className="w-8 h-8 text-accent mb-3" />
            <CardTitle>Community Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Join thousands of citizens making a difference in their communities.</CardDescription>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
