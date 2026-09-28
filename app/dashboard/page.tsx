"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useIssues } from "@/contexts/issues-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ArrowLeft, MapPin, LogOut, CheckCircle } from "lucide-react"

const CHART_DATA = [
  { date: "Mon", reported: 12, resolved: 5, inProgress: 4 },
  { date: "Tue", reported: 15, resolved: 8, inProgress: 6 },
  { date: "Wed", reported: 10, resolved: 9, inProgress: 7 },
  { date: "Thu", reported: 18, resolved: 12, inProgress: 8 },
  { date: "Fri", reported: 22, resolved: 15, inProgress: 9 },
  { date: "Sat", reported: 14, resolved: 11, inProgress: 5 },
  { date: "Sun", reported: 9, resolved: 7, inProgress: 3 },
]

const ISSUE_BREAKDOWN = [
  { name: "Pothole", value: 35, color: "#3b3d5c" },
  { name: "Street Light", value: 28, color: "#7c6fa1" },
  { name: "Graffiti", value: 18, color: "#d97e3a" },
  { name: "Sidewalk", value: 12, color: "#a0a0a0" },
  { name: "Other", value: 7, color: "#505050" },
]

const MOCK_ISSUES = [
  {
    id: "ISS-001",
    type: "Pothole / Road Damage",
    location: { address: "Main St & 5th Ave" },
    status: "in_progress",
    priority: "high",
    assignedTo: "John Smith",
    createdAt: new Date("2023-10-01").toISOString(),
    upvotes: 10,
  },
  {
    id: "ISS-002",
    type: "Street Light Out",
    location: { address: "Oak Ave & 3rd St" },
    status: "resolved",
    priority: "medium",
    assignedTo: "Jane Doe",
    createdAt: new Date("2023-10-02").toISOString(),
    upvotes: 5,
  },
  {
    id: "ISS-003",
    type: "Graffiti",
    location: { address: "Bridge Ave" },
    status: "pending",
    priority: "low",
    assignedTo: "Unassigned",
    createdAt: new Date("2023-10-03").toISOString(),
    upvotes: 2,
  },
  {
    id: "ISS-004",
    type: "Sidewalk Damage",
    location: { address: "Park Lane" },
    status: "in_progress",
    priority: "high",
    assignedTo: "Mike Johnson",
    createdAt: new Date("2023-10-04").toISOString(),
    upvotes: 8,
  },
]

const statusConfig = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
}

const priorityConfig = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-accent/10 text-accent",
  high: "bg-destructive/10 text-destructive",
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, role, logout, user } = useAuth()
  const { issues, updateIssue } = useIssues()
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (role !== "authority") {
      router.push("/report")
    }
  }, [isAuthenticated, role, router])

  const generateChartData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return days.map((day) => ({
      date: day,
      reported: Math.floor(Math.random() * 25) + 5,
      resolved: Math.floor(Math.random() * 15) + 3,
      inProgress: Math.floor(Math.random() * 12) + 2,
    }))
  }

  const generateIssueBreakdown = () => {
    const breakdown = issues.reduce(
      (acc, issue) => {
        const existing = acc.find((item) => item.name === issue.type)
        if (existing) {
          existing.value += 1
        } else {
          acc.push({ name: issue.type, value: 1, color: `#${Math.floor(Math.random() * 16777215).toString(16)}` })
        }
        return acc
      },
      [] as Array<{ name: string; value: number; color: string }>,
    )
    return breakdown
  }

  const stats = {
    total: issues.length,
    pending: issues.filter((i) => i.status === "pending").length,
    inProgress: issues.filter((i) => i.status === "in_progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
  }

  const sortedIssues = [...issues].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return (
      (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
      (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
    )
  })

  const filteredIssues = sortedIssues.filter(
    (issue) => issue.id.includes(searchTerm) || issue.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleMarkAsDone = (issueId: string) => {
    updateIssue(issueId, { status: "resolved" })
  }

  if (!isAuthenticated) {
    return null
  }

  const chartData = generateChartData()
  const issueBreakdown = generateIssueBreakdown()

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10 dark:bg-slate-900 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">{user?.name}</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/profile")}
              className="text-muted-foreground hover:text-foreground"
            >
              👤 Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/assigned-complaints")}
              className="text-muted-foreground hover:text-foreground"
            >
              📋 Complaints
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/heatmap")}
              className="text-muted-foreground hover:text-foreground"
            >
              🔥 Heatmap
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border dark:border-slate-700 dark:bg-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-2">All reported civic issues</p>
            </CardContent>
          </Card>

          <Card className="border-border dark:border-slate-700 dark:bg-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-2">Awaiting assignment</p>
            </CardContent>
          </Card>

          <Card className="border-border dark:border-slate-700 dark:bg-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground mt-2">Being worked on</p>
            </CardContent>
          </Card>

          <Card className="border-border dark:border-slate-700 dark:bg-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.resolved}</div>
              <p className="text-xs text-muted-foreground mt-2">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Line Chart */}
          <Card className="border-border dark:border-slate-700 dark:bg-slate-800 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Issues Over Time</CardTitle>
              <CardDescription>Weekly trend of reported, resolved, and in-progress issues</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", border: `1px solid var(--color-border)` }}
                    labelStyle={{ color: "var(--color-foreground)" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="reported"
                    stroke="var(--color-primary)"
                    name="Reported"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="inProgress"
                    stroke="var(--color-accent)"
                    name="In Progress"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="var(--color-secondary)"
                    name="Resolved"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="border-border dark:border-slate-700 dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">Issues by Type</CardTitle>
              <CardDescription>Distribution of issue categories</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={issueBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {issueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Issues Table */}
        <Card className="border-border dark:border-slate-700 dark:bg-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Recent Issues</CardTitle>
                <CardDescription>
                  Manage and track all reported civic issues sorted by priority and upvotes
                </CardDescription>
              </div>
              <Input
                placeholder="Search by ID or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 border-border"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Location</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Priority</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Upvotes</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Assigned</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Days Open</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue) => {
                    const daysOpen = Math.floor(
                      (new Date().getTime() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24),
                    )
                    return (
                      <tr key={issue.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono font-semibold text-primary">{issue.id}</span>
                        </td>
                        <td className="py-3 px-4 text-foreground">{issue.type}</td>
                        <td className="py-3 px-4 text-muted-foreground flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {issue.location.address}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={statusConfig[issue.status as keyof typeof statusConfig]}>
                            {issue.status === "pending"
                              ? "Pending"
                              : issue.status === "in_progress"
                                ? "In Progress"
                                : "Resolved"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={priorityConfig[issue.priority as keyof typeof priorityConfig]}>
                            {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-semibold">{issue.upvotes} 👍</td>
                        <td className="py-3 px-4 text-muted-foreground">{issue.assignedTo}</td>
                        <td className="py-3 px-4 text-muted-foreground">{daysOpen}d</td>
                        <td className="py-3 px-4">
                          {issue.status !== "resolved" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsDone(issue.id)}
                              className="gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark Done
                            </Button>
                          ) : (
                            <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Done
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
