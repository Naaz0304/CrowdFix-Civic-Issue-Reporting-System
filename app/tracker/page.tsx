"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useIssues } from "@/contexts/issues-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MapPin, Clock, AlertCircle, CheckCircle2, Loader, LogOut, ThumbsUp } from "lucide-react"

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800", icon: Loader },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
}

export default function TrackerPage() {
  const router = useRouter()
  const { isAuthenticated, role, logout, user } = useAuth()
  const { issues, upvoteIssue, removeUpvote } = useIssues()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (role !== "citizen") {
      router.push("/dashboard")
    }
  }, [isAuthenticated, role, router])

  const citizenIssues = issues.filter((issue) => issue.email === user?.email)

  const filteredIssues = citizenIssues.filter((issue) => {
    const matchesSearch =
      issue.id.includes(searchTerm) || issue.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || issue.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleUpvote = (issueId: string) => {
    if (user?.email) {
      const issue = issues.find((i) => i.id === issueId)
      if (issue?.upvoters.includes(user.email)) {
        removeUpvote(issueId, user.email)
      } else {
        upvoteIssue(issueId, user.email)
      }
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Track Issues</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => router.push("/report")}>Report New Issue</Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/community")}
              className="text-muted-foreground hover:text-foreground"
            >
              👥 Community
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search & Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by issue ID or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-border"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === null ? "default" : "outline"}
              onClick={() => setFilterStatus(null)}
              className="border-border"
            >
              All Issues
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              onClick={() => setFilterStatus("pending")}
              className="border-border"
            >
              Pending
            </Button>
            <Button
              variant={filterStatus === "in_progress" ? "default" : "outline"}
              onClick={() => setFilterStatus("in_progress")}
              className="border-border"
            >
              In Progress
            </Button>
            <Button
              variant={filterStatus === "resolved" ? "default" : "outline"}
              onClick={() => setFilterStatus("resolved")}
              className="border-border"
            >
              Resolved
            </Button>
          </div>
        </div>

        {/* Issues List */}
        {filteredIssues.length === 0 ? (
          <Card className="border-border text-center py-12">
            <p className="text-muted-foreground">
              {citizenIssues.length === 0
                ? "You haven't reported any issues yet. Start by reporting your first issue!"
                : "No issues found matching your criteria."}
            </p>
            {citizenIssues.length === 0 && (
              <Button className="mt-4" onClick={() => router.push("/report")}>
                Report an Issue
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredIssues.map((issue) => {
              const statusInfo = statusConfig[issue.status as keyof typeof statusConfig]
              const StatusIcon = statusInfo.icon
              const hasUpvoted = user?.email && issue.upvoters.includes(user.email)
              return (
                <Card
                  key={issue.id}
                  className="border-border hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row gap-4 p-4">
                      {/* Photo */}
                      <div className="w-full md:w-40 h-40 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={issue.photo || "/placeholder.svg"}
                          alt={issue.type}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-mono text-primary font-semibold">{issue.id}</p>
                            <h3 className="text-lg font-semibold text-foreground mt-1">{issue.type}</h3>
                          </div>
                          <Badge className={`${statusInfo.color} flex items-center gap-1 flex-shrink-0`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground text-sm">{issue.description}</p>

                        <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{issue.location.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-secondary" />
                            <span>Reported on {issue.createdAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="text-xs text-muted-foreground">Assigned: {issue.assignedTo}</span>
                          <Button
                            size="sm"
                            variant={hasUpvoted ? "default" : "outline"}
                            onClick={() => handleUpvote(issue.id)}
                            className="gap-2"
                          >
                            <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? "fill-current" : ""}`} />
                            {issue.upvotes}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
