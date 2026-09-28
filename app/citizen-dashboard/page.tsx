"use client"

import { useAuth } from "@/contexts/auth-context"
import { useIssues } from "@/contexts/issues-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle, Clock, TrendingUp, LogOut, Bell, History, Moon, Sun } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"

export default function CitizenDashboard() {
  const router = useRouter()
  const { isAuthenticated, role, user, logout } = useAuth()
  const { issues } = useIssues()
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    if (!isAuthenticated || role !== "citizen") {
      router.push("/login")
    }
  }, [isAuthenticated, role, router])

  if (!isAuthenticated || role !== "citizen" || !user) {
    return null
  }

  // Get user's issues
  const userIssues = issues.filter((issue) => issue.email === user.email)
  const activeComplaints = userIssues.filter((i) => ["pending", "assigned", "in_progress"].includes(i.status))
  const resolvedComplaints = userIssues.filter((i) => ["verified", "completed"].includes(i.status))

  // Calculate average resolution time (in days)
  const avgResolutionTime =
    resolvedComplaints.length > 0
      ? (
          resolvedComplaints.reduce((sum, issue) => {
            const created = new Date(issue.createdAt)
            const updated = new Date(issue.updatedAt)
            return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
          }, 0) / resolvedComplaints.length
        ).toFixed(1)
      : "0"

  // Get complaint categories
  const categories = [...new Set(userIssues.map((i) => i.type))]

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CF</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">CrowdFix</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/notifications")}>
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/complaint-history")}>
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/profile")}>
              Profile
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome, {user.name}</h2>
          <p className="text-muted-foreground">Here's an overview of your reported issues</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{userIssues.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Active Complaints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{activeComplaints.length}</div>
              <p className="text-xs text-muted-foreground mt-1">In progress or pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{resolvedComplaints.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Closed & verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{avgResolutionTime}</div>
              <p className="text-xs text-muted-foreground mt-1">Days</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button className="w-full h-12" onClick={() => router.push("/report")}>
            <FileText className="w-4 h-4 mr-2" />
            Report New Issue
          </Button>
          <Button className="w-full h-12 bg-transparent" variant="outline" onClick={() => router.push("/community")}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Browse Community Issues
          </Button>
        </div>

        {/* Recent Complaints */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Complaints</CardTitle>
            <CardDescription>Latest issues you've reported</CardDescription>
          </CardHeader>
          <CardContent>
            {userIssues.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No complaints yet. Report an issue to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {userIssues.slice(0, 5).map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => router.push(`/complaint-status/${issue.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">{issue.type}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            issue.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : issue.status === "in_progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {issue.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">Reported: {issue.createdAt}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary">{issue.id}</div>
                      {issue.upvotes > 0 && (
                        <div className="text-xs text-muted-foreground mt-2">{issue.upvotes} upvotes</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories */}
        {categories.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Your Complaint Categories</CardTitle>
              <CardDescription>Issues you've reported by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const count = userIssues.filter((i) => i.type === cat).length
                  return (
                    <div key={cat} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {cat} ({count})
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
