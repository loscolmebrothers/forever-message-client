import { NextRequest, NextResponse } from 'next/server'
import { SiweMessage } from 'siwe'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { message, signature } = await request.json()

    // Parse and verify the SIWE message
    const siweMessage = new SiweMessage(message)
    const fields = await siweMessage.verify({ signature })

    if (!fields.success) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const address = siweMessage.address.toLowerCase()
    const email = `${address}@wallet.local`

    // Try to create user first (will fail if exists)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        wallet_address: address,
      },
    })

    let userId: string

    if (createError) {
      // User already exists - find them by listing all users
      const { data: allUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()

      if (listError || !allUsers) {
        console.error('Failed to list users:', listError)
        return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 })
      }

      const existingUser = allUsers.users.find((u) => u.email === email)

      if (!existingUser) {
        console.error('User not found after creation error:', createError)
        return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 })
      }

      userId = existingUser.id
    } else {
      // New user created
      userId = newUser.user!.id
    }

    // Generate a magic link for the user to create a session
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (linkError || !linkData) {
      console.error('Link generation error:', linkError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    // Extract the hashed token from the magic link URL
    const url = new URL(linkData.properties.action_link)
    const token = url.searchParams.get('token')
    const tokenHash = url.searchParams.get('token_hash')

    if (!token || !tokenHash) {
      console.error('Failed to extract tokens from magic link')
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    // Exchange the token for a session
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'email',
    })

    if (sessionError || !sessionData) {
      console.error('Session exchange error:', sessionError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    return NextResponse.json({
      session: sessionData.session,
      user: sessionData.user,
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
