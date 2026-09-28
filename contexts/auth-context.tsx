"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import apiClient from "@/lib/api-client"

export type UserRole = "citizen" | "authority" | null

interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  profilePhoto?: string
  permanentAddress?: string
  temporaryAddress?: string
}

interface AuthContextType {
  user: User | null
  role: UserRole
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>
  signup: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  updateProfile: (updatedName: string, updatedPassword?: string) => void
  updatePhone: (phone: string) => void
  updateEmail: (newEmail: string) => void
  uploadProfilePhoto: (photoUrl: string) => void
  updatePermanentAddress: (address: string) => void
  updateTemporaryAddress: (address: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    const accessToken = localStorage.getItem("accessToken")
    if (storedUser && accessToken) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem("currentUser")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (
    email: string,
    password: string,
    role: UserRole,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await apiClient.login(email, password, role || "citizen")

      if (!result.success) {
        return { success: false, error: result.error || "Invalid email or password" }
      }

      const userData = result.data.user
      const newUser: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role as UserRole,
        phone: userData.phone,
        profilePhoto: userData.profilePhoto,
        permanentAddress: userData.permanentAddress,
        temporaryAddress: userData.temporaryAddress,
      }

      setUser(newUser)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "Login failed" }
    }
  }

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await apiClient.register(name, email, password, role || "citizen")

      if (!result.success) {
        return { success: false, error: result.error || "Signup failed" }
      }

      const userData = result.data.user
      const newUser: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role as UserRole,
        phone: userData.phone,
        profilePhoto: userData.profilePhoto,
        permanentAddress: userData.permanentAddress,
        temporaryAddress: userData.temporaryAddress,
      }

      setUser(newUser)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "Signup failed" }
    }
  }

  const logout = () => {
    apiClient.logout()
    setUser(null)
  }

  const updateProfile = async (updatedName: string, updatedPassword?: string) => {
    if (!user) return
    const data: any = { name: updatedName }
    if (updatedPassword) data.password = updatedPassword

    const result = await apiClient.updateProfile(data)
    if (result.success && result.data) {
      const updatedUser = { ...user, name: result.data.name }
      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    }
  }

  const updatePhone = async (phone: string) => {
    if (!user) return
    const result = await apiClient.updateProfile({ phone })
    if (result.success) {
      const updatedUser = { ...user, phone }
      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    }
  }

  const updateEmail = async (newEmail: string) => {
    if (!user) return
    const result = await apiClient.updateProfile({ email: newEmail })
    if (result.success) {
      const updatedUser = { ...user, email: newEmail }
      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    }
  }

  const uploadProfilePhoto = async (photoUrl: string) => {
    if (!user) return
    const result = await apiClient.updateProfile({ profile_photo: photoUrl })
    if (result.success) {
      const updatedUser = { ...user, profilePhoto: photoUrl }
      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    }
  }

  const updatePermanentAddress = async (address: string) => {
    if (!user) return
    const result = await apiClient.updateProfile({ perm_address: address })
    if (result.success) {
      const updatedUser = { ...user, permanentAddress: address }
      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    }
  }

  const updateTemporaryAddress = async (address: string) => {
    if (!user) return
    const result = await apiClient.updateProfile({ temp_address: address })
    if (result.success) {
      const updatedUser = { ...user, temporaryAddress: address }
      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        login,
        signup,
        logout,
        isAuthenticated: user !== null,
        updateProfile,
        updatePhone,
        updateEmail,
        uploadProfilePhoto,
        updatePermanentAddress,
        updateTemporaryAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
