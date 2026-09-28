"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useIssues } from "@/contexts/issues-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Upload, ArrowLeft, AlertCircle, LogOut } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ReportPage() {
  const router = useRouter()
  const { isAuthenticated, role, logout, user } = useAuth()
  const { addIssue } = useIssues()
  const [issueType, setIssueType] = useState("")
  const [description, setDescription] = useState("")
  const [photo, setPhoto] = useState<string | null>(null)
  const [location, setLocation] = useState({ lat: "", lng: "", address: "" })
  const [pincode, setPincode] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (role !== "citizen") {
      router.push("/dashboard")
    }
    if (isAuthenticated && user?.email) {
      setEmail(user.email)
    }
  }, [isAuthenticated, role, router, user])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhoto(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation((prev) => ({
          ...prev,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
        }))
      })
    }
  }

  const handleLocationChange = (field: "lat" | "lng" | "address", value: string) => {
    setLocation((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    addIssue({
      type: issueType,
      description,
      email,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address || `${location.lat}, ${location.lng}`,
      },
      status: "pending",
      photo,
      priority: "medium",
      assignedTo: "Pending Assignment",
      pincode,
    })

    await new Promise((resolve) => setTimeout(resolve, 1500))

    setSuccess(true)
    setLoading(false)

    setTimeout(() => {
      router.push("/tracker")
    }, 2000)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!isAuthenticated) {
    return null
  }

  if (success) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Issue Reported!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-muted-foreground">Your issue has been submitted successfully.</p>
            <p className="text-sm text-muted-foreground">You'll be redirected to track your issue...</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Report an Issue</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/profile")}
              className="text-muted-foreground hover:text-foreground"
            >
              👤 Profile
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Info */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
              <CardDescription>We'll use this to update you on your report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-border"
                />
              </div>
            </CardContent>
          </Card>

          {/* Issue Details */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Issue Details</CardTitle>
              <CardDescription>Provide information about the civic issue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="type">Issue Type</Label>
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pothole">Pothole / Road Damage</SelectItem>
                    <SelectItem value="streetlight">Street Light Out</SelectItem>
                    <SelectItem value="sidewalk">Sidewalk Damage</SelectItem>
                    <SelectItem value="graffiti">Graffiti</SelectItem>
                    <SelectItem value="debris">Debris / Litter</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="border-border resize-none"
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Location
              </CardTitle>
              <CardDescription>Provide precise location information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleGetLocation}
                className="w-full border-border bg-transparent"
              >
                Get My Current Location
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="text"
                    placeholder="40.7128"
                    value={location.lat}
                    onChange={(e) => handleLocationChange("lat", e.target.value)}
                    className="border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="text"
                    placeholder="-74.0060"
                    value={location.lng}
                    onChange={(e) => handleLocationChange("lng", e.target.value)}
                    className="border-border"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Street address or landmark"
                  value={location.address}
                  onChange={(e) => handleLocationChange("address", e.target.value)}
                  className="border-border"
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  type="text"
                  placeholder="Enter your area pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                  maxLength="6"
                  className="border-border"
                />
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-accent" />
                Photo
              </CardTitle>
              <CardDescription>Attach a photo of the issue (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-input" />
                {photo ? (
                  <div className="space-y-4">
                    <img src={photo || "/placeholder.svg"} alt="Preview" className="w-full h-40 object-cover rounded" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("photo-input")?.click()}
                      className="border-border"
                    >
                      Change Photo
                    </Button>
                  </div>
                ) : (
                  <div onClick={() => document.getElementById("photo-input")?.click()} className="cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Validation Alert */}
          {!issueType || !description || !email || !location.lat || !location.lng || !pincode ? (
            <Alert className="border-accent bg-accent/5">
              <AlertCircle className="h-4 w-4 text-accent" />
              <AlertDescription className="text-foreground">
                Please fill in all required fields including location and pincode
              </AlertDescription>
            </Alert>
          ) : null}

          {/* Submit */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/")} className="flex-1 border-border">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !issueType || !description || !email || !location.lat || !location.lng || !pincode}
              className="flex-1"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
