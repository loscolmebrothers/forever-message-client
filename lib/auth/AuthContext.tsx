'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useAccount, useDisconnect, useSignMessage } from 'wagmi'
import { SiweMessage } from 'siwe'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  address: string | undefined
  isConnected: boolean
  isAuthenticated: boolean
  isLoading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address: wagmiAddress, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authenticatedAddress, setAuthenticatedAddress] = useState<string | undefined>(undefined)
  const signingInProgress = useRef(false)

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)

        // Extract wallet address from session metadata
        if (session?.user?.user_metadata?.wallet_address) {
          setAuthenticatedAddress(session.user.user_metadata.wallet_address)
        }
      } catch (error) {
        console.error('Error checking session:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)

      // Update authenticated address from session
      if (session?.user?.user_metadata?.wallet_address) {
        setAuthenticatedAddress(session.user.user_metadata.wallet_address)
      } else {
        setAuthenticatedAddress(undefined)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async () => {
    if (!wagmiAddress || !isConnected) {
      throw new Error('Wallet not connected')
    }

    // Prevent multiple concurrent sign-in attempts
    if (signingInProgress.current) {
      console.warn('Sign-in already in progress, skipping duplicate request')
      return
    }

    try {
      signingInProgress.current = true
      setIsLoading(true)

      // Get nonce from server
      const nonceResponse = await fetch('/api/auth/nonce')
      const { nonce } = await nonceResponse.json()

      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address: wagmiAddress,
        statement: 'Sign in to Forever Message',
        uri: window.location.origin,
        version: '1',
        chainId: 84532, // Base Sepolia
        nonce,
      })

      // Sign message with wallet
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      })

      // Verify signature and create session
      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature }),
      })

      if (!verifyResponse.ok) {
        throw new Error('Authentication failed')
      }

      const { session } = await verifyResponse.json()

      // Set Supabase session
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      })

      setIsAuthenticated(true)
      setAuthenticatedAddress(wagmiAddress.toLowerCase())
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      signingInProgress.current = false
      setIsLoading(false)
    }
  }, [wagmiAddress, isConnected, signMessageAsync])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      disconnect()
      setIsAuthenticated(false)
      setAuthenticatedAddress(undefined)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }, [disconnect])

  // Use authenticated address when available, fallback to wagmi address
  const address = isAuthenticated ? authenticatedAddress : wagmiAddress

  return (
    <AuthContext.Provider
      value={{
        address,
        isConnected,
        isAuthenticated,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
