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

    // Create or get user in Supabase
    // Using a custom JWT with the wallet address as the user ID
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createUser({
      email: `${address}@wallet.local`, // Placeholder email
      email_confirm: true,
      user_metadata: {
        wallet_address: address,
      },
    })

    if (sessionError) {
      // If user already exists, sign them in
      const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: `${address}@wallet.local`,
        password: address, // Using address as password (hashed by Supabase)
      })

      if (signInError) {
        console.error('Sign in error:', signInError)
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
      }

      return NextResponse.json({
        session: signInData.session,
        user: signInData.user,
      })
    }

    // Generate session for new user
    const { data: sessionResponse, error: tokenError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: `${address}@wallet.local`,
    })

    if (tokenError || !sessionResponse) {
      console.error('Token generation error:', tokenError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    return NextResponse.json({
      session: {
        access_token: sessionResponse.properties.action_link,
        refresh_token: sessionResponse.properties.action_link,
      },
      user: sessionData.user,
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
