"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useIssues } from "@/contexts/issues-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, LogOut, FileText } from "lucide-react"

const statusConfig = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  verified: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
}

export default function AssignedComplaintsPage() {
  const router = useRouter()
  const { isAuthenticated, role, logout, user } = useAuth()
  const { issues } = useIssues()
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!isAuthenticated || role !== "authority") {
      router.push("/login")
    }
  }, [isAuthenticated, role, router])

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = issue.id.includes(searchTerm) || issue.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || issue.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "severity":
        const severityOrder = { high: 3, medium: 2, low: 1 }
        return (severityOrder[b.priority] || 0) - (severityOrder[a.priority] || 0)
      case "location":
        return a.location.address.localeCompare(b.location.address)
      default:
        return 0
    }
  })

  const stats = {
    pending: issues.filter((i) => i.status === "pending").length,
    assigned: issues.filter((i) => i.status === "assigned").length,
    inProgress: issues.filter((i) => i.status === "in_progress").length,
    completed: issues.filter((i) => i.status === "completed").length,
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!isAuthenticated) return null

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted dark:from-slate-950 dark:to-slate-900">
      <div className="border-b border-border bg-card sticky top-0 z-10 dark:bg-slate-900 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Assigned Complaints</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">{user?.name}</div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Assigned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.assigned}</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle>Complaint List</CardTitle>
                <CardDescription>View and manage assigned complaints</CardDescription>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Search by ID or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="md:w-64"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background dark:bg-slate-800 dark:text-foreground"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background dark:bg-slate-800 dark:text-foreground"
                >
                  <option value="date">Sort by Date</option>
                  <option value="severity">Sort by Severity</option>
                  <option value="location">Sort by Location</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedIssues.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 dark:text-slate-400">No complaints found</p>
              ) : (
                sortedIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition dark:border-slate-700 dark:hover:bg-slate-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground dark:text-slate-100">{issue.id}</h3>
                        <p className="text-sm text-muted-foreground dark:text-slate-400">{issue.type}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={statusConfig[issue.status] + " dark:text-slate-100"}>
                          {issue.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <Badge
                          className={
                            issue.priority === "high"
                              ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                              : issue.priority === "medium"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                          }
                        >
                          {issue.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div>
                        <span className="text-muted-foreground dark:text-slate-400">Location:</span>
                        <p className="text-foreground dark:text-slate-100">{issue.location.address}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground dark:text-slate-400">Pincode:</span>
                        <p className="text-foreground dark:text-slate-100">{issue.pincode}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/complaint-details/${issue.id}`)}
                      className="gap-2 dark:text-slate-100"
                    >
                      <FileText className="w-4 h-4 dark:text-slate-100" />
                      View Details
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
