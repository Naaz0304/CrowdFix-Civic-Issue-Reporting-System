"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useIssues } from "@/contexts/issues-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ArrowLeft, LogOut, Upload, Calendar, User, MapPin, Mail } from "lucide-react"

interface CitizenInfo {
  name: string
  email: string
  permanentAddress?: string
  temporaryAddress?: string
  profilePhoto?: string
}

export default function ComplaintDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated, role, logout, user } = useAuth()
  const { getIssueById, updateIssue, addNotification } = useIssues()
  const issueId = params.id as string
  const issue = getIssueById(issueId)

  const [status, setStatus] = useState(issue?.status || "pending")
  const [remarks, setRemarks] = useState("")
  const [expectedDate, setExpectedDate] = useState("")
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)
  const [showNotification, setShowNotification] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || role !== "authority") {
      router.push("/login")
    }
  }, [isAuthenticated, role, router])

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Complaint not found</p>
      </div>
    )
  }

  const handleStatusUpdate = () => {
    const statusMessages: Record<string, string> = {
      pending: "Your complaint is pending",
      assigned: "Your complaint has been assigned",
      in_progress: "Work is in progress on your complaint",
      completed: "Work has been completed on your complaint",
      verified: "Your complaint has been resolved and verified",
      rejected: "Your complaint has been rejected",
    }

    updateIssue(issueId, {
      status: status as any,
      remarks: remarks,
      expectedDate: expectedDate,
    })

    const notificationMessage = statusMessages[status] || "Your complaint status has been updated"
    addNotification(issueId, notificationMessage)

    setShowSuccessModal(true)
    setTimeout(() => {
      setShowSuccessModal(false)
      router.push("/assigned-complaints")
    }, 2000)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEvidenceFile(e.target.files[0])
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!isAuthenticated) return null

  const statusConfig = {
    pending: "bg-yellow-100 text-yellow-800",
    assigned: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    verified: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
  }

  const getCitizenInfo = (): CitizenInfo | null => {
    if (!issue) return null
    // Extract citizen info from the issue object
    return {
      name: issue.citizenName || "Unknown",
      email: issue.email || "N/A",
      permanentAddress: issue.citizenPermanentAddress || "Not provided",
      temporaryAddress: issue.citizenTemporaryAddress || "Not provided",
      profilePhoto: issue.citizenPhoto || "",
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 border-border">
            <CardContent className="pt-8 text-center space-y-4">
              <div className="text-5xl">✓</div>
              <h2 className="text-2xl font-bold text-green-600">Status Updated!</h2>
              <p className="text-muted-foreground">Citizen has been notified about the status update.</p>
              <p className="text-sm text-muted-foreground">Redirecting...</p>
            </CardContent>
          </Card>
        </div>
      )}

      {showUserModal && getCitizenInfo() && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-border">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <CardTitle className="text-lg">Citizen Profile</CardTitle>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {getCitizenInfo()?.profilePhoto && (
                <img
                  src={getCitizenInfo()?.profilePhoto || "/placeholder.svg"}
                  alt="Citizen"
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <User className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="font-semibold">{getCitizenInfo()?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <Mail className="w-4 h-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Email Address</p>
                    <p className="font-semibold break-all text-sm">{getCitizenInfo()?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-3 border-b border-border">
                  <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Permanent Address</p>
                    <p className="font-semibold text-sm">{getCitizenInfo()?.permanentAddress}</p>
                  </div>
                </div>
                {getCitizenInfo()?.temporaryAddress && (
                  <div className="flex items-start gap-3 pb-3 border-b border-border">
                    <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Temporary Address</p>
                      <p className="font-semibold text-sm">{getCitizenInfo()?.temporaryAddress}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Complaint Location</p>
                    <p className="font-semibold text-sm">{issue?.location.address || "N/A"}</p>
                  </div>
                </div>
              </div>
              <Button onClick={() => setShowUserModal(false)} className="w-full mt-4">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/assigned-complaints")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Complaint Details</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {showNotification && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg border border-green-200">
            <p className="font-semibold">Notification Sent! 📢 Citizen has been notified about the status update.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{issue.type}</CardTitle>
                    <CardDescription className="mt-2">{issue.id}</CardDescription>
                  </div>
                  <Badge className={statusConfig[issue.status]}>{issue.status.replace("_", " ").toUpperCase()}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Complaint Description</h3>
                  <p className="text-muted-foreground">{issue.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Reported By</p>
                    <p className="font-semibold">{issue.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created Date</p>
                    <p className="font-semibold">{issue.createdAt}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Location</p>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="font-semibold">{issue.location.address}</p>
                    <p className="text-sm text-muted-foreground">
                      Coordinates: {issue.location.lat}, {issue.location.lng}
                    </p>
                    <p className="text-sm text-muted-foreground">Pincode: {issue.pincode}</p>
                  </div>
                </div>

                {issue.photo && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Attached Evidence</p>
                    <img
                      src={issue.photo || "/placeholder.svg"}
                      alt="Issue"
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold mb-4">Update Status</h3>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md mb-4 bg-background"
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Work Completed</option>
                    <option value="verified">Verified & Closed</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Add Remarks</label>
                      <Textarea
                        placeholder="Add remarks about the complaint..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="min-h-24"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold mb-2 block">Expected Resolution Date</label>
                      <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
                    </div>

                    <div>
                      <label className="text-sm font-semibold mb-2 block">Upload Work Evidence</label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          accept="image/*,video/*"
                          className="hidden"
                          id="evidence-upload"
                        />
                        <label htmlFor="evidence-upload" className="cursor-pointer">
                          <p className="text-sm font-medium text-primary">Click to upload</p>
                          <p className="text-xs text-muted-foreground">
                            {evidenceFile ? evidenceFile.name : "PNG, JPG, MP4 up to 50MB"}
                          </p>
                        </label>
                      </div>
                    </div>

                    <Button onClick={handleStatusUpdate} className="w-full">
                      Update Status & Notify Citizen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Citizen Details</CardTitle>
                  <button
                    onClick={() => setShowUserModal(true)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title="View full citizen profile"
                  >
                    <User className="w-5 h-5 text-primary" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {getCitizenInfo() && (
                  <div className="space-y-4">
                    {getCitizenInfo()?.profilePhoto && (
                      <img
                        src={getCitizenInfo()?.profilePhoto || "/placeholder.svg"}
                        alt="Citizen"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-semibold text-sm">{getCitizenInfo()?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-semibold text-sm break-all">{getCitizenInfo()?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Permanent Address</p>
                      <p className="font-semibold text-sm text-justify">{getCitizenInfo()?.permanentAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Complaint Address</p>
                      <p className="font-semibold text-sm text-justify">{issue?.location.address || "N/A"}</p>
                    </div>
                    {getCitizenInfo()?.temporaryAddress && (
                      <div>
                        <p className="text-xs text-muted-foreground">Temporary Address</p>
                        <p className="font-semibold text-sm text-justify">{getCitizenInfo()?.temporaryAddress}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold">Created</p>
                      <p className="text-xs text-muted-foreground">{issue.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold">Last Updated</p>
                      <p className="text-xs text-muted-foreground">{issue.updatedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold">Current Status</p>
                      <Badge className={statusConfig[issue.status]} className="mt-1">
                        {issue.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Complaint Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-semibold text-sm">{issue.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <Badge
                    className={
                      issue.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : issue.priority === "medium"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                    }
                  >
                    {issue.priority.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Upvotes</p>
                  <p className="font-semibold text-sm">{issue.upvotes} 👍</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
