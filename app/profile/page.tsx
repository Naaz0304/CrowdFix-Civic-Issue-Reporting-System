"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useIssues } from "@/contexts/issues-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, LogOut, Mail, User, Lock, Calendar, Award, Activity } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const {
    isAuthenticated,
    role,
    logout,
    user,
    updateProfile,
    updatePhone,
    updateEmail,
    uploadProfilePhoto,
    updatePermanentAddress,
    updateTemporaryAddress,
  } = useAuth()
  const { issues } = useIssues()

  const [editMode, setEditMode] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [permanentAddress, setPermanentAddress] = useState("")
  const [temporaryAddress, setTemporaryAddress] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profilePhoto, setProfilePhoto] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
      setPhone(user.phone || "")
      setProfilePhoto(user.profilePhoto || "")
      setPermanentAddress(user.permanentAddress || "")
      setTemporaryAddress(user.temporaryAddress || "")
    }
  }, [isAuthenticated, router, user])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    if (!name.trim()) {
      setErrorMessage("Name cannot be empty")
      setLoading(false)
      return
    }

    if (!phone.trim()) {
      setErrorMessage("Phone number cannot be empty")
      setLoading(false)
      return
    }

    try {
      updateProfile(name, newPassword || undefined)
      updatePhone(phone)
      if (email !== user?.email) {
        updateEmail(email)
      }
      if (profilePhoto) {
        uploadProfilePhoto(profilePhoto)
      }
      updatePermanentAddress(permanentAddress)
      updateTemporaryAddress(temporaryAddress)
      setSuccessMessage("Profile updated successfully!")
      setEditMode(false)
      setNewPassword("")
      setConfirmPassword("")
      setCurrentPassword("")

      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (error) {
      setErrorMessage("Failed to update profile")
    }
    setLoading(false)
  }

  const handlePasswordChange = () => {
    setErrorMessage("")
    setSuccessMessage("")

    if (!newPassword || !confirmPassword) {
      setErrorMessage("Please fill in all password fields")
      return
    }

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match")
      return
    }

    handleSaveProfile()
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Calculate user stats
  const userIssues = issues.filter((i) => i.email === user?.email)
  const resolvedCount = userIssues.filter((i) => i.status === "resolved").length
  const pendingCount = userIssues.filter((i) => i.status === "pending").length
  const inProgressCount = userIssues.filter((i) => i.status === "in_progress").length

  if (!isAuthenticated) {
    return null
  }

  const isAuthority = role === "authority"

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push(isAuthority ? "/dashboard" : "/tracker")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Profile Info Card */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto || "/placeholder.svg"}
                        alt={user?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user?.email}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <span>📱</span>
                      {user?.phone || "No phone added"}
                    </p>
                    <Badge className="mt-2 bg-primary/20 text-primary">
                      {role === "citizen" ? "👤 Citizen" : "🏛️ Authority Official"}
                    </Badge>
                  </div>
                </div>

                <div className="border-t border-border pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-semibold text-foreground">
                        {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Account Status</p>
                      <p className="font-semibold text-green-600">Active</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            {role === "citizen" ? (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Your Contributions</CardTitle>
                  <CardDescription>Overview of your reported issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                      <p className="text-sm text-muted-foreground">Total Reported</p>
                      <p className="text-3xl font-bold text-yellow-600 mt-2">{userIssues.length}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-sm text-muted-foreground">In Progress</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">{inProgressCount}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-sm text-muted-foreground">Resolved</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">{resolvedCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Dashboard Statistics</CardTitle>
                  <CardDescription>System overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm text-muted-foreground">Total Issues</p>
                      <p className="text-3xl font-bold text-primary mt-2">{issues.length}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-3xl font-bold text-accent mt-2">
                        {issues.filter((i) => i.status === "pending").length}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                      <p className="text-sm text-muted-foreground">Resolved</p>
                      <p className="text-3xl font-bold text-secondary mt-2">
                        {issues.filter((i) => i.status === "resolved").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {successMessage && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
                  </Alert>
                )}
                {errorMessage && (
                  <Alert className="bg-destructive/10 border-destructive/20">
                    <AlertDescription className="text-destructive">{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  {/* Profile Photo Upload */}
                  <div>
                    <Label htmlFor="profile-photo">Profile Photo</Label>
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {profilePhoto ? (
                            <img
                              src={profilePhoto || "/placeholder.svg"}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-primary" />
                          )}
                        </div>
                        <div>
                          <input
                            id="profile-photo"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            disabled={!editMode}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                          />
                          <p className="text-xs text-muted-foreground mt-1">JPG, PNG (optional)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!editMode}
                      className="mt-2 border-border"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Your email can be changed if needed</p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1-555-0100"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!editMode}
                      className="mt-2 border-border"
                    />
                  </div>

                  {/* Permanent Address */}
                  <div>
                    <Label htmlFor="permanentAddress">Permanent Address</Label>
                    <Input
                      id="permanentAddress"
                      type="text"
                      placeholder="123 Main Street, City, State, ZIP"
                      value={permanentAddress}
                      onChange={(e) => setPermanentAddress(e.target.value)}
                      disabled={!editMode}
                      className="mt-2 border-border"
                    />
                  </div>

                  {/* Temporary Address */}
                  <div>
                    <Label htmlFor="temporaryAddress">Temporary Address (Optional)</Label>
                    <Input
                      id="temporaryAddress"
                      type="text"
                      placeholder="456 Oak Avenue, City, State, ZIP"
                      value={temporaryAddress}
                      onChange={(e) => setTemporaryAddress(e.target.value)}
                      disabled={!editMode}
                      className="mt-2 border-border"
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!editMode}
                      className="mt-2 border-border"
                    />
                  </div>

                  {/* Change Password */}
                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Change Password
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={!editMode}
                          className="mt-2 border-border"
                        />
                      </div>

                      <div>
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={!editMode}
                          className="mt-2 border-border"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 border-t border-border pt-6">
                  {!editMode ? (
                    <Button onClick={() => setEditMode(true)} className="w-full">
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          setEditMode(false)
                          setName(user?.name || "")
                          setEmail(user?.email || "")
                          setPhone(user?.phone || "")
                          setProfilePhoto(user?.profilePhoto || "")
                          setPermanentAddress(user?.permanentAddress || "")
                          setTemporaryAddress(user?.temporaryAddress || "")
                          setNewPassword("")
                          setConfirmPassword("")
                          setErrorMessage("")
                        }}
                        variant="outline"
                        className="flex-1 border-border"
                        size="sm"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={loading} className="flex-1" size="sm">
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {role === "citizen" ? (
                  userIssues.length > 0 ? (
                    <div className="space-y-3">
                      {userIssues
                        .slice(-5)
                        .reverse()
                        .map((issue) => (
                          <div
                            key={issue.id}
                            className="flex items-start gap-3 pb-3 border-b border-border last:border-0"
                          >
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${
                                issue.status === "resolved"
                                  ? "bg-green-600"
                                  : issue.status === "in_progress"
                                    ? "bg-blue-600"
                                    : "bg-yellow-600"
                              }`}
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{issue.type}</p>
                              <p className="text-sm text-muted-foreground">{issue.location.address}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className="text-xs">
                                  {issue.status === "resolved"
                                    ? "Resolved"
                                    : issue.status === "in_progress"
                                      ? "In Progress"
                                      : "Pending"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">No reported issues yet</p>
                  )
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Authority activity tracking</p>
                    <p className="text-sm text-muted-foreground mt-2">{issues.length} total issues in the system</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
