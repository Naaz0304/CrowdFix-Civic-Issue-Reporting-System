"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import apiClient from "@/lib/api-client"

export interface Issue {
  id: string
  type: string
  description: string
  email: string
  location: { lat: string; lng: string; address: string }
  status: "pending" | "assigned" | "in_progress" | "completed" | "verified" | "rejected"
  photo: string | null
  createdAt: string
  updatedAt: string
  priority: "low" | "medium" | "high"
  assignedTo: string
  pincode: string
  upvotes: number
  upvoters: string[]
  remarks?: string
  expectedDate?: string
  evidence?: string[]
  statusHistory: Array<{ status: string; date: string; remarks?: string }>
  rating?: number
  feedback?: string
  isResolved?: boolean
  canReopen?: boolean
  notifications: Array<{ message: string; date: string; read: boolean }>
}

interface IssuesContextType {
  issues: Issue[]
  addIssue: (
    issue: Omit<Issue, "id" | "createdAt" | "updatedAt" | "upvotes" | "upvoters" | "statusHistory" | "notifications">,
  ) => void
  updateIssue: (id: string, updates: Partial<Issue>) => void
  getIssueById: (id: string) => Issue | undefined
  upvoteIssue: (issueId: string, userEmail: string) => void
  removeUpvote: (issueId: string, userEmail: string) => void
  rateIssue: (issueId: string, rating: number, feedback: string) => void
  reopenIssue: (issueId: string, reason: string) => void
  addNotification: (issueId: string, message: string) => void
  markNotificationAsRead: (issueId: string) => void
  getUserNotifications: (userEmail: string) => Array<{ issueId: string; message: string; date: string; read: boolean }>
  refreshIssues: () => Promise<void>
  loading: boolean
}

const IssuesContext = createContext<IssuesContextType | undefined>(undefined)

export function IssuesProvider({ children }: { children: React.ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loading, setLoading] = useState(false)

  const fetchIssues = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        setIsLoading(false)
        return
      }

      const result = await apiClient.getIssues({ limit: "100", sortBy: "created_at", sortOrder: "desc" })
      if (result.success && result.data) {
        const formattedIssues = result.data.issues.map((issue: any) => ({
          ...issue,
          photo: issue.photo || issue.image_url || null,
          type: issue.type || issue.title || "",
          evidence: issue.evidence || [],
          notifications: issue.notifications || [],
          upvoters: issue.upvoters || [],
          statusHistory: issue.statusHistory || [],
        }))
        setIssues(formattedIssues)
      }
    } catch (error) {
      console.error("Failed to fetch issues:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIssues()
  }, [fetchIssues])

  const refreshIssues = async () => {
    setLoading(true)
    await fetchIssues()
    setLoading(false)
  }

  const addIssue = async (
    newIssue: Omit<Issue, "id" | "createdAt" | "updatedAt" | "upvotes" | "upvoters" | "statusHistory" | "notifications">,
  ) => {
    try {
      // Map frontend fields to backend API format
      const categoryMap: Record<string, string> = {
        "Pothole / Road Damage": "pothole",
        "pothole": "pothole",
        "Street Light Out": "streetlight",
        "streetlight": "streetlight",
        "Sidewalk Damage": "sidewalk",
        "sidewalk": "sidewalk",
        "Graffiti": "graffiti",
        "graffiti": "graffiti",
        "Debris / Litter": "debris",
        "debris": "debris",
        "other": "other",
      }

      const apiData = {
        title: newIssue.type || "Untitled Issue",
        description: newIssue.description,
        category: categoryMap[newIssue.type] || categoryMap[newIssue.type?.toLowerCase()] || "other",
        latitude: newIssue.location?.lat ? parseFloat(newIssue.location.lat) : undefined,
        longitude: newIssue.location?.lng ? parseFloat(newIssue.location.lng) : undefined,
        address: newIssue.location?.address || "",
        pincode: newIssue.pincode || "",
        priority: newIssue.priority || "medium",
        image_url: newIssue.photo || undefined,
      }

      const result = await apiClient.createIssue(apiData)
      if (result.success && result.data) {
        const formattedIssue = {
          ...result.data,
          photo: result.data.photo || result.data.image_url || null,
          type: result.data.type || result.data.title || "",
          evidence: [],
          notifications: result.data.notifications || [],
          upvoters: result.data.upvoters || [],
          statusHistory: result.data.statusHistory || [],
        }
        setIssues((prev) => [formattedIssue, ...prev])
      }
    } catch (error) {
      console.error("Failed to create issue:", error)
    }
  }

  const updateIssue = async (id: string, updates: Partial<Issue>) => {
    try {
      // If status is being updated by admin, use the admin endpoint
      if (updates.status) {
        const result = await apiClient.updateIssueStatus(id, updates.status === "pending" ? "reported" : updates.status, updates.remarks)
        if (result.success) {
          await refreshIssues()
          return
        }
      }

      // Regular update
      const result = await apiClient.updateIssue(id, updates)
      if (result.success) {
        await refreshIssues()
      }
    } catch (error) {
      console.error("Failed to update issue:", error)
      // Fallback: update locally
      setIssues((prev) =>
        prev.map((issue) => {
          if (issue.id === id) {
            return { ...issue, ...updates, updatedAt: new Date().toISOString().split("T")[0] }
          }
          return issue
        }),
      )
    }
  }

  const getIssueById = (id: string) => {
    return issues.find((issue) => issue.id === id)
  }

  const upvoteIssue = async (issueId: string, userEmail: string) => {
    try {
      const result = await apiClient.toggleUpvote(issueId)
      if (result.success) {
        setIssues((prev) =>
          prev.map((issue) => {
            if (issue.id === issueId) {
              return {
                ...issue,
                upvotes: result.data.upvote_count,
                upvoters: result.data.upvoted
                  ? [...issue.upvoters, userEmail]
                  : issue.upvoters.filter((e) => e !== userEmail),
              }
            }
            return issue
          }),
        )
      }
    } catch (error) {
      console.error("Failed to toggle upvote:", error)
    }
  }

  const removeUpvote = async (issueId: string, userEmail: string) => {
    // Toggle upvote handles both add and remove
    await upvoteIssue(issueId, userEmail)
  }

  const rateIssue = async (issueId: string, rating: number, feedback: string) => {
    try {
      const result = await apiClient.rateIssue(issueId, rating, feedback)
      if (result.success) {
        setIssues((prev) =>
          prev.map((issue) => {
            if (issue.id === issueId) {
              return { ...issue, rating, feedback, isResolved: true }
            }
            return issue
          }),
        )
      }
    } catch (error) {
      console.error("Failed to rate issue:", error)
    }
  }

  const reopenIssue = async (issueId: string, reason: string) => {
    try {
      await apiClient.updateIssueStatus(issueId, "reported", reason)
      await refreshIssues()
    } catch (error) {
      console.error("Failed to reopen issue:", error)
    }
  }

  const addNotification = (issueId: string, message: string) => {
    // Notifications are handled server-side now
    console.log(`Notification for issue ${issueId}: ${message}`)
  }

  const markNotificationAsRead = async (issueId: string) => {
    // Mark all notifications for this issue as read
    try {
      const notifs = await apiClient.getNotifications()
      if (notifs.success && notifs.data) {
        for (const n of notifs.data.notifications) {
          if (n.issueId === issueId && !n.read) {
            await apiClient.markNotificationRead(n.id)
          }
        }
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
    }
  }

  const getUserNotifications = (userEmail: string) => {
    const userIssues = issues.filter((issue) => issue.email === userEmail)
    return userIssues.flatMap((issue) =>
      (issue.notifications || []).map((n) => ({
        issueId: issue.id,
        message: n.message,
        date: n.date,
        read: n.read,
      })),
    )
  }

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  return (
    <IssuesContext.Provider
      value={{
        issues,
        addIssue,
        updateIssue,
        getIssueById,
        upvoteIssue,
        removeUpvote,
        rateIssue,
        reopenIssue,
        addNotification,
        markNotificationAsRead,
        getUserNotifications,
        refreshIssues,
        loading,
      }}
    >
      {children}
    </IssuesContext.Provider>
  )
}

export function useIssues() {
  const context = useContext(IssuesContext)
  if (!context) {
    throw new Error("useIssues must be used within IssuesProvider")
  }
  return context
}
