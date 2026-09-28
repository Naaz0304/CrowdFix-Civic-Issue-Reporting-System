"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useIssues } from "@/contexts/issues-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, LogOut, MapPin, Flame } from "lucide-react"
import { useEffect, useState } from "react"

interface LocationDensity {
  address: string
  lat: number
  lng: number
  count: number
  severity: "low" | "medium" | "high" | "critical"
}

export default function HeatmapPage() {
  const router = useRouter()
  const { isAuthenticated, role, logout, user } = useAuth()
  const { issues } = useIssues()
  const [locationDensities, setLocationDensities] = useState<LocationDensity[]>([])

  useEffect(() => {
    if (!isAuthenticated || role !== "authority") {
      router.push("/login")
    }
  }, [isAuthenticated, role, router])

  useEffect(() => {
    const densityMap = new Map<string, { lat: number; lng: number; count: number }>()

    issues.forEach((issue) => {
      const key = issue.location.address
      if (densityMap.has(key)) {
        const existing = densityMap.get(key)!
        existing.count += 1
      } else {
        densityMap.set(key, {
          lat: Number.parseFloat(issue.location.lat) || 0,
          lng: Number.parseFloat(issue.location.lng) || 0,
          count: 1,
        })
      }
    })

    const densities: LocationDensity[] = Array.from(densityMap.entries()).map(([address, data]) => {
      let severity: "low" | "medium" | "high" | "critical"
      if (data.count >= 10) severity = "critical"
      else if (data.count >= 6) severity = "high"
      else if (data.count >= 3) severity = "medium"
      else severity = "low"

      return {
        address,
        lat: data.lat,
        lng: data.lng,
        count: data.count,
        severity,
      }
    })

    setLocationDensities(densities.sort((a, b) => b.count - a.count))
  }, [issues])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!isAuthenticated) return null

  const severityConfig = {
    low: { bg: "bg-green-100 text-green-800", color: "🟢" },
    medium: { bg: "bg-yellow-100 text-yellow-800", color: "🟡" },
    high: { bg: "bg-orange-100 text-orange-800", color: "🔥" },
    critical: { bg: "bg-red-100 text-red-800", color: "🔥🔥" },
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10 dark:bg-slate-900 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Flame className="w-6 h-6 text-red-500" />
                Complaint Heatmap
              </h1>
              <p className="text-sm text-muted-foreground">Visualize high-complaint zones for resource planning</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Card */}
        <Card className="mb-8 border-border dark:border-slate-700 dark:bg-slate-800">
          <CardHeader>
            <CardTitle>Heat Zone Analysis</CardTitle>
            <CardDescription>Areas with highest complaint density to prioritize resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Locations</p>
                <p className="text-2xl font-bold">{locationDensities.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical Zones</p>
                <p className="text-2xl font-bold text-red-600">
                  {locationDensities.filter((l) => l.severity === "critical").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">
                  {locationDensities.filter((l) => l.severity === "high").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Complaints/Location</p>
                <p className="text-2xl font-bold">
                  {(locationDensities.reduce((sum, l) => sum + l.count, 0) / locationDensities.length).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locationDensities.map((location) => (
            <Card
              key={location.address}
              className={`border-2 cursor-pointer transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 ${
                location.severity === "critical"
                  ? "border-red-200 bg-red-50 dark:bg-red-900/20"
                  : location.severity === "high"
                    ? "border-orange-200 bg-orange-50 dark:bg-orange-900/20"
                    : location.severity === "medium"
                      ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20"
                      : "border-green-200 bg-green-50 dark:bg-green-900/20"
              }`}
              onClick={() => router.push(`/assigned-complaints?location=${location.address}`)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <MapPin className="w-5 h-5 mt-1 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{location.address}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{severityConfig[location.severity].color}</span>
                    <Badge className={severityConfig[location.severity].bg}>{location.severity.toUpperCase()}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{location.count}</p>
                    <p className="text-xs text-muted-foreground">complaints</p>
                  </div>
                </div>

                {/* Density Bar */}
                <div className="mt-3">
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        location.severity === "critical"
                          ? "bg-red-500"
                          : location.severity === "high"
                            ? "bg-orange-500"
                            : location.severity === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                      }`}
                      style={{
                        width: `${(location.count / Math.max(...locationDensities.map((l) => l.count))) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {locationDensities.length === 0 && (
          <Card className="border-border dark:border-slate-700 dark:bg-slate-800">
            <CardContent className="pt-8 text-center">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No complaints reported yet. Heatmap will appear as complaints are submitted.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
