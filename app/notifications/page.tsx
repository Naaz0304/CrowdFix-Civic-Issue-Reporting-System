"use client"

import { useAuth } from "@/contexts/auth-context"
import { useIssues } from "@/contexts/issues-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, ArrowLeft, LogOut } from "lucide-react"

export default function Notifications() {
  const router = useRouter()
  const { isAuthenticated, role, user, logout } = useAuth()
  const { getUserNotifications, markNotificationAsRead } = useIssues()

  useEffect(() => {
    if (!isAuthenticated || role !== "citizen") {
      router.push("/login")
    }
  }, [isAuthenticated, role, router])

  if (!isAuthenticated || role !== "citizen" || !user) {
    return null
  }

  const notifications = getUserNotifications(user.email)

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
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/citizen-dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Notifications</h2>
          </div>
          <p className="text-muted-foreground">Stay updated on your complaint status</p>
        </div>

        {/* Notifications */}
        <Card>
          <CardContent className="pt-6">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((notification, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        notification.read ? "bg-background border-border" : "bg-primary/5 border-primary/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p
                            className={`text-sm ${notification.read ? "text-muted-foreground" : "font-semibold text-foreground"}`}
                          >
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.date).toLocaleDateString()}{" "}
                            {new Date(notification.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/complaint-status/${notification.issueId}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
