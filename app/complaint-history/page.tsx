"use client"

import { useAuth } from "@/contexts/auth-context"
import { useIssues } from "@/contexts/issues-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, LogOut, Search } from "lucide-react"

export default function ComplaintHistory() {
  const router = useRouter()
  const { isAuthenticated, role, user, logout } = useAuth()
  const { issues } = useIssues()
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  useEffect(() => {
    if (!isAuthenticated || role !== "citizen") {
      router.push("/login")
    }
  }, [isAuthenticated, role, router])

  if (!isAuthenticated || role !== "citizen" || !user) {
    return null
  }

  const userIssues = issues.filter((issue) => issue.email === user.email)

  // Apply filters
  let filtered = userIssues
  if (filter === "active") {
    filtered = filtered.filter((i) => ["pending", "assigned", "in_progress"].includes(i.status))
  } else if (filter === "resolved") {
    filtered = filtered.filter((i) => ["verified", "completed"].includes(i.status))
  }

  if (categoryFilter !== "all") {
    filtered = filtered.filter((i) => i.type === categoryFilter)
  }

  if (searchTerm) {
    filtered = filtered.filter(
      (i) =>
        i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

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
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/citizen-dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Complaint History</h2>
          <p className="text-muted-foreground">All your reported issues and their status</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by description or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} size="sm">
                All ({userIssues.length})
              </Button>
              <Button
                variant={filter === "active" ? "default" : "outline"}
                onClick={() => setFilter("active")}
                size="sm"
              >
                Active ({userIssues.filter((i) => ["pending", "assigned", "in_progress"].includes(i.status)).length})
              </Button>
              <Button
                variant={filter === "resolved" ? "default" : "outline"}
                onClick={() => setFilter("resolved")}
                size="sm"
              >
                Resolved ({userIssues.filter((i) => ["verified", "completed"].includes(i.status)).length})
              </Button>
            </div>

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={categoryFilter === "all" ? "default" : "outline"}
                  onClick={() => setCategoryFilter("all")}
                  size="sm"
                >
                  All Categories
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={categoryFilter === cat ? "default" : "outline"}
                    onClick={() => setCategoryFilter(cat)}
                    size="sm"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Issues List */}
        <Card>
          <CardContent className="pt-6">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No complaints found matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition"
                    onClick={() => router.push(`/complaint-status/${issue.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{issue.type}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              issue.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : issue.status === "assigned"
                                  ? "bg-blue-100 text-blue-800"
                                  : issue.status === "in_progress"
                                    ? "bg-cyan-100 text-cyan-800"
                                    : "bg-green-100 text-green-800"
                            }`}
                          >
                            {issue.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>ID: {issue.id}</span>
                          <span>Reported: {issue.createdAt}</span>
                          {issue.upvotes > 0 && <span>{issue.upvotes} upvotes</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        {issue.rating && (
                          <div className="text-yellow-400 mb-2">
                            {"★".repeat(issue.rating)}
                            {"☆".repeat(5 - issue.rating)}
                          </div>
                        )}
                        <Button size="sm" onClick={() => router.push(`/complaint-status/${issue.id}`)}>
                          View
                        </Button>
                      </div>
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
