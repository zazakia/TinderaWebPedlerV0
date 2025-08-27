"use client"

import React, { useState } from 'react'
import { Eye, EyeOff, LogIn, User, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/hooks/useAuth'

interface LoginScreenProps {
  onLoginSuccess?: () => void
  onSwitchToRegister?: () => void
  onForgotPassword?: () => void
}

export default function LoginScreen({ 
  onLoginSuccess, 
  onSwitchToRegister, 
  onForgotPassword 
}: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        setError(error.message)
      } else {
        onLoginSuccess?.()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4 max-w-sm mx-auto">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-3xl font-bold text-purple-600">Peddlr</span>
            <div className="w-8 h-6 bg-gradient-to-b from-blue-500 via-white to-red-500 rounded-sm ml-1"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your POS system</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  required
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-12 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  required
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </div>
              )}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 space-y-4">
            {/* Forgot Password */}
            {onForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Forgot your password?
              </button>
            )}

            {/* Switch to Register */}
            {onSwitchToRegister && (
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Sign up here
                </button>
              </div>
            )}
          </div>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500 mb-3">Demo Accounts (for testing)</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded text-center">
                <div className="font-medium text-gray-700">Admin</div>
                <div className="text-gray-500">admin@demo.com</div>
              </div>
              <div className="bg-gray-50 p-2 rounded text-center">
                <div className="font-medium text-gray-700">Cashier</div>
                <div className="text-gray-500">cashier@demo.com</div>
              </div>
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">Password: demo123</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 TinderaWebPedlerV0. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}