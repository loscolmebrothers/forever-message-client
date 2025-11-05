import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    wallet_address: string
    email: string
  }
}

/**
 * Middleware to validate JWT and extract user information
 * Returns the authenticated user or throws an error
 */
export async function validateAuth(request: NextRequest): Promise<{
  user: {
    id: string
    wallet_address: string
    email: string
  }
  error?: never
} | {
  user?: never
  error: NextResponse
}> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        error: NextResponse.json(
          { error: 'Missing or invalid authorization header' },
          { status: 401 }
        ),
      }
    }

    const token = authHeader.substring(7)

    // Verify JWT with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return {
        error: NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        ),
      }
    }

    // Extract wallet address from user metadata
    const wallet_address = user.user_metadata?.wallet_address

    if (!wallet_address) {
      return {
        error: NextResponse.json(
          { error: 'Wallet address not found in user data' },
          { status: 400 }
        ),
      }
    }

    return {
      user: {
        id: user.id,
        wallet_address,
        email: user.email || '',
      },
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return {
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      ),
    }
  }
}

/**
 * Helper function to wrap API route handlers with authentication
 */
export function withAuth(
  handler: (
    request: NextRequest,
    user: { id: string; wallet_address: string; email: string },
    context?: any
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    const authResult = await validateAuth(request)

    if (authResult.error) {
      return authResult.error
    }

    return handler(request, authResult.user, context)
  }
}
