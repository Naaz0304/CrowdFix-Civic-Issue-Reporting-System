"use client"

import { useAuth } from "@/contexts/auth-context"
import { useIssues } from "@/contexts/issues-context"
import { useTheme } from "@/contexts/theme-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MapPin, Clock, User, Star, RefreshCw, LogOut, Moon, Sun } from "lucide-react"

export default function ComplaintStatus() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated, role, user, logout } = useAuth()
  const { issues, getIssueById, rateIssue, reopenIssue } = useIssues()
  const { isDark, toggleTheme } = useTheme()
  const [rating, setRating] = useState<number>(0)
  const [feedback, setFeedback] = useState("")
  const [showRating, setShowRating] = useState(false)
  const [showReopen, setShowReopen] = useState(false)
  const [reopenReason, setReopenReason] = useState("")
  const [, setRefreshTrigger] = useState(0)

  const issueId = params.id as string
  const issue = getIssueById(issueId)

  useEffect(() => {
    if (!isAuthenticated || role !== "citizen") {
      router.push("/login")
    }
  }, [isAuthenticated, role, router])

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  if (!isAuthenticated || role !== "citizen" || !issue) {
    return null
  }

  const handleRateIssue = () => {
    if (rating > 0) {
      rateIssue(issueId, rating, feedback)
      setShowRating(false)
      alert("Thank you for your feedback!")
    }
  }

  const handleReopen = () => {
    if (reopenReason.trim()) {
      reopenIssue(issueId, reopenReason)
      setShowReopen(false)
      setReopenReason("")
      alert("Complaint reopened successfully!")
    }
  }

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

        {/* Main Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{issue.type}</CardTitle>
                <CardDescription className="text-base">{issue.description}</CardDescription>
              </div>
              <span
                className={`px-4 py-2 rounded-full font-semibold ${
                  issue.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : issue.status === "assigned"
                      ? "bg-blue-100 text-blue-800"
                      : issue.status === "in_progress"
                        ? "bg-cyan-100 text-cyan-800"
                        : issue.status === "completed" || issue.status === "verified"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                }`}
              >
                {issue.status.replace(/_/g, " ")}
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Complaint Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Complaint Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Complaint ID</p>
                <p className="font-semibold text-foreground">{issue.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Reported Date</p>
                <p className="font-semibold text-foreground">{issue.createdAt}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Category</p>
                <p className="font-semibold text-foreground">{issue.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Priority</p>
                <p
                  className={`font-semibold ${
                    issue.priority === "high"
                      ? "text-red-600"
                      : issue.priority === "medium"
                        ? "text-orange-600"
                        : "text-green-600"
                  }`}
                >
                  {issue.priority.toUpperCase()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Address</p>
                  <p className="font-semibold text-foreground">{issue.location.address}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Coordinates</p>
                <p className="font-mono text-sm text-foreground">
                  {issue.location.lat}, {issue.location.lng}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pincode</p>
                <p className="font-semibold text-foreground">{issue.pincode}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Officer Details & Remarks */}
        {issue.assignedTo && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Assigned To</p>
                  <p className="font-semibold text-foreground">{issue.assignedTo}</p>
                </div>
              </div>
              {issue.remarks && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Officer Remarks</p>
                  <p className="text-foreground bg-muted p-3 rounded-lg">{issue.remarks}</p>
                </div>
              )}
              {issue.expectedDate && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Expected Resolution</p>
                    <p className="font-semibold text-foreground">{issue.expectedDate}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Evidence from Authority */}
        {issue.evidence && issue.evidence.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Work Evidence</CardTitle>
              <CardDescription>Before & After photos and proof of work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {issue.evidence.map((img, idx) => (
                  <div key={idx} className="bg-muted rounded-lg overflow-hidden">
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`Evidence ${idx + 1}`}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Status Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {issue.statusHistory.map((history, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mt-2" />
                    {idx < issue.statusHistory.length - 1 && <div className="w-0.5 h-8 bg-border mt-2" />}
                  </div>
                  <div className="pb-4">
                    <p className="font-semibold text-foreground capitalize">{history.status.replace(/_/g, " ")}</p>
                    <p className="text-sm text-muted-foreground">{history.date}</p>
                    {history.remarks && <p className="text-sm text-muted-foreground mt-1">{history.remarks}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rating Section */}
        {["verified", "completed"].includes(issue.status) && !issue.rating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Rate This Resolution</CardTitle>
              <CardDescription>Help us improve our service by rating this complaint resolution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showRating ? (
                <Button onClick={() => setShowRating(true)} className="w-full">
                  <Star className="w-4 h-4 mr-2" />
                  Provide Feedback
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-3">How would you rate the resolution?</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`text-3xl transition ${rating >= star ? "text-yellow-400" : "text-muted-foreground"}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Comments (Optional)</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full p-3 border border-border rounded-lg bg-background"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleRateIssue} className="flex-1">
                      Submit Rating
                    </Button>
                    <Button variant="outline" onClick={() => setShowRating(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Rating Display */}
        {issue.rating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Your Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-2xl ${issue.rating! >= star ? "text-yellow-400" : "text-muted-foreground"}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              {issue.feedback && <p className="text-foreground">{issue.feedback}</p>}
            </CardContent>
          </Card>
        )}

        {/* Reopen Button */}
        {["verified", "completed"].includes(issue.status) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Issue Not Resolved?</CardTitle>
              <CardDescription>If the issue persists, you can reopen this complaint</CardDescription>
            </CardHeader>
            <CardContent>
              {!showReopen ? (
                <Button onClick={() => setShowReopen(true)} variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reopen Complaint
                </Button>
              ) : (
                <div className="space-y-4">
                  <textarea
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    placeholder="Please explain why you want to reopen this complaint..."
                    className="w-full p-3 border border-border rounded-lg bg-background"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleReopen} className="flex-1">
                      Confirm Reopen
                    </Button>
                    <Button variant="outline" onClick={() => setShowReopen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
