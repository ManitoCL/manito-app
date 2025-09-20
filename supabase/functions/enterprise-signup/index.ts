/**
 * ENTERPRISE SIGNUP - Meta/Instagram Pattern
 * Admin API + SendGrid Direct Integration
 * Scalable, resilient, production-ready
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// Inline CORS headers for web editor compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-forwarded-for',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 hours
}

// Enterprise configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJseHN5dGxlc29xYmNnYm5od2hxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzcxNjgzNiwiZXhwIjoyMDczMjkyODM2fQ.5mzwLCo3wk6-3gwf6BWRXXVa9j-JlhRH9XDOf5cghes'
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')!
const SENDGRID_TEMPLATE_VERIFICATION = Deno.env.get('SENDGRID_TEMPLATE_VERIFICATION')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@manito.cl'

// Initialize Supabase Admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Enterprise validation schema - Chilean-optimized
interface SignupRequest {
  email: string
  password?: string
  fullName?: string  // Backward compatibility
  nombres?: string   // Chilean first names
  apellidos?: string // Chilean surnames
  userType?: 'customer' | 'provider'
  phoneNumber?: string
  resend?: boolean // Flag for resend requests
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Enterprise-grade validation
function validateSignupRequest(data: any): ValidationResult {
  const errors: string[] = []

  // Email validation (always required)
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format')
  }

  // For resend requests, only email validation is needed
  if (data.resend) {
    return { isValid: errors.length === 0, errors }
  }

  // Password validation (must match Supabase provider settings)
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required')
  } else if (data.password.length < 8) {
    errors.push('Password must be at least 8 characters')
  } else {
    // Check complexity requirements (lowercase, uppercase, numbers)
    const hasLowercase = /[a-z]/.test(data.password)
    const hasUppercase = /[A-Z]/.test(data.password)
    const hasNumbers = /\d/.test(data.password)

    if (!hasLowercase || !hasUppercase || !hasNumbers) {
      errors.push('Password must contain lowercase, uppercase, and numbers')
    }
  }

  // Chilean name validation (with backward compatibility)
  if (data.nombres && data.apellidos) {
    // New Chilean structure
    if (!data.nombres || typeof data.nombres !== 'string') {
      errors.push('Nombres is required')
    } else if (data.nombres.trim().length < 2) {
      errors.push('Nombres must be at least 2 characters')
    }

    if (!data.apellidos || typeof data.apellidos !== 'string') {
      errors.push('Apellidos is required')
    } else if (data.apellidos.trim().length < 2) {
      errors.push('Apellidos must be at least 2 characters')
    }

    // Construct fullName for backward compatibility
    data.fullName = `${data.nombres.trim()} ${data.apellidos.trim()}`
  } else {
    // Fallback to legacy fullName validation
    if (!data.fullName || typeof data.fullName !== 'string') {
      errors.push('Full name is required')
    } else if (data.fullName.trim().length < 2) {
      errors.push('Full name must be at least 2 characters')
    }
  }

  // User type validation
  if (!data.userType || !['customer', 'provider'].includes(data.userType)) {
    errors.push('User type must be customer or provider')
  }

  // Chilean phone validation (optional) - strip spaces first
  if (data.phoneNumber) {
    const cleanPhone = data.phoneNumber.replace(/\s/g, '') // Remove all spaces
    if (!/^\+56[2-9]\d{8}$/.test(cleanPhone)) {
      errors.push('Phone number must be Chilean format: +56912345678')
    }
    // Update data with cleaned phone number
    data.phoneNumber = cleanPhone
  }

  return { isValid: errors.length === 0, errors }
}

// Enterprise email service
async function sendVerificationEmail(
  email: string,
  fullName: string,
  verificationUrl: string,
  userType: string
): Promise<boolean> {
  try {
    console.log('🚀 Enterprise: Sending verification email via SendGrid', {
      email,
      fullName,
      userType,
      hasUrl: !!verificationUrl,
    })

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: {
          email: FROM_EMAIL,
          name: 'Manito Chile'
        },
        personalizations: [{
          to: [{ email, name: fullName }],
          dynamic_template_data: {
            user_name: fullName.split(' ')[0], // First name
            full_name: fullName,
            verification_url: verificationUrl,
            user_type: userType,
            user_type_display: userType === 'provider' ? 'Proveedor' : 'Cliente',
            current_year: new Date().getFullYear(),
          }
        }],
        template_id: SENDGRID_TEMPLATE_VERIFICATION,
        // ENTERPRISE: Disable click tracking for auth emails
        tracking_settings: {
          click_tracking: { enable: false },
          open_tracking: { enable: true },
          subscription_tracking: { enable: false },
        },
        // ENTERPRISE: High priority for auth emails
        priority: 1,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ SendGrid API error:', response.status, errorText)
      return false
    }

    console.log('✅ Enterprise: Verification email sent successfully')
    return true

  } catch (error) {
    console.error('❌ Enterprise: Email sending failed:', error)
    return false
  }
}

// Rate limiting (enterprise pattern)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxAttempts = 5 // 5 signups per 15 minutes per IP

  const record = rateLimitMap.get(ip)
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxAttempts) {
    return false
  }

  record.count++
  return true
}

// Main enterprise signup handler
serve(async (req) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Enterprise Signup: Request received')

    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(clientIP)) {
      console.warn('⚠️ Rate limit exceeded for IP:', clientIP)
      return new Response(
        JSON.stringify({ error: 'Too many signup attempts. Please try again later.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse and validate request
    const requestData = await req.json()
    const validation = validateSignupRequest(requestData)

    if (!validation.isValid) {
      console.warn('❌ Validation failed:', validation.errors)
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { email, password, fullName, nombres, apellidos, userType, phoneNumber, resend }: SignupRequest = requestData

    // Handle resend verification email requests
    if (resend) {
      console.log('📧 Enterprise: Resending verification email for:', email)

      // Look up existing user
      const { data: existingUser, error: lookupError } = await supabase.auth.admin.getUserByEmail(email.toLowerCase().trim())

      if (lookupError || !existingUser.user) {
        console.error('❌ User not found for resend:', email)
        return new Response(
          JSON.stringify({ error: 'User not found or invalid email' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Check if user is already verified
      if (existingUser.user.email_confirmed_at) {
        console.log('✅ User already verified:', email)
        return new Response(
          JSON.stringify({
            success: true,
            message: 'User already verified',
            already_verified: true
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Generate new verification token and send email
      try {
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'signup',
          email: email.toLowerCase().trim(),
          options: {
            emailRedirectTo: 'https://auth.manito.cl/verified'
          }
        })

        if (linkError || !linkData.properties?.action_link) {
          throw new Error('Failed to generate verification link')
        }

        const verificationUrl = linkData.properties.action_link
        const userName = existingUser.user.user_metadata?.full_name || existingUser.user.user_metadata?.display_name || 'Usuario'
        const userType = existingUser.user.user_metadata?.user_type || 'customer'

        const emailSent = await sendVerificationEmail(
          email.toLowerCase().trim(),
          userName,
          verificationUrl,
          userType
        )

        if (!emailSent) {
          throw new Error('Failed to send verification email')
        }

        console.log('✅ Verification email resent successfully to:', email)
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Verification email sent successfully',
            email: email.toLowerCase().trim()
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      } catch (error) {
        console.error('❌ Resend email failed:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to resend verification email' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    console.log('📝 Enterprise: Creating user via Admin API', {
      email,
      fullName,
      userType,
      hasPhoneNumber: !!phoneNumber,
    })

    // ENTERPRISE PATTERN: Admin API - No automatic email
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: false, // User starts unverified
      user_metadata: {
        full_name: fullName.trim(),
        nombres: nombres?.trim() || null,
        apellidos: apellidos?.trim() || null,
        user_type: userType,
        phone_number: phoneNumber?.trim(),
        display_name: fullName.trim(), // Full name for display
        first_name: nombres?.trim().split(' ')[0] || fullName.trim().split(' ')[0], // For greetings
        onboarding_completed: false,
        created_via: 'enterprise_signup',
        signup_timestamp: new Date().toISOString(),
      },
    })

    if (userError) {
      console.error('❌ User creation failed:', userError)
      return new Response(
        JSON.stringify({
          error: 'Account creation failed',
          message: userError.message
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const user = userData.user
    console.log('✅ Enterprise: User created successfully', { userId: user.id })

    // ENTERPRISE FALLBACK: Manual profile creation (triggers may not be active)
    try {
      console.log('🔄 Enterprise: Creating profile fallback for user:', user.id)

      const { data: existingProfile, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (checkError && checkError.code === 'PGRST116') {
        // Profile doesn't exist, create it manually
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            full_name: fullName.trim(),
            user_type: userType,
            phone_number: phoneNumber?.trim(),
            display_name: fullName.trim(),
            is_verified: false,
            email_verified_at: null,
            onboarding_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
            // Chilean fields
            nombres: nombres?.trim() || null,
            apellidos: apellidos?.trim() || null,
          })

        if (profileError) {
          console.error('❌ Enterprise: Manual profile creation failed:', profileError)
          // Log but don't fail - user creation succeeded
        } else {
          console.log('✅ Enterprise: Manual profile created successfully')

          // Create provider profile if needed
          if (userType === 'provider') {
            const { error: providerError } = await supabase
              .from('provider_profiles')
              .insert({
                user_id: user.id,
                business_name: null,
                description: 'Proveedor de servicios profesionales en Chile',
                verification_status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })

            if (providerError) {
              console.error('❌ Enterprise: Provider profile creation failed:', providerError)
            } else {
              console.log('✅ Enterprise: Provider profile created successfully')
            }
          }
        }
      } else if (!checkError) {
        console.log('✅ Enterprise: Profile already exists (trigger worked)')
      } else {
        console.error('❌ Enterprise: Profile check failed:', checkError)
      }
    } catch (error) {
      console.error('❌ Enterprise: Profile creation fallback failed:', error)
      // Continue with verification link generation - user creation succeeded
    }

    // ENTERPRISE PATTERN: Generate clean verification link
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: user.email!,
      options: {
        emailRedirectTo: 'https://auth.manito.cl/verified'
      },
    })

    if (linkError) {
      console.error('❌ Link generation failed:', linkError)

      // Cleanup: Delete user if link generation fails
      await supabase.auth.admin.deleteUser(user.id)

      return new Response(
        JSON.stringify({
          error: 'Verification link generation failed',
          message: linkError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const verificationUrl = linkData.properties?.action_link
    console.log('🔗 Enterprise: Verification link generated', {
      hasActionLink: !!verificationUrl,
    })

    // ENTERPRISE PATTERN: Send email via SendGrid
    const emailSent = await sendVerificationEmail(
      user.email!,
      fullName,
      verificationUrl!,
      userType
    )

    if (!emailSent) {
      console.error('❌ Email sending failed')

      // Cleanup: Delete user if email fails
      await supabase.auth.admin.deleteUser(user.id)

      return new Response(
        JSON.stringify({
          error: 'Email delivery failed. Please try again.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Success response
    console.log('✅ Enterprise Signup: Complete success', {
      userId: user.id,
      email: user.email,
      userType,
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account created successfully. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          full_name: fullName,
          user_type: userType,
          needs_verification: true,
        },
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Enterprise Signup: Unexpected error:', error)

    return new Response(
      JSON.stringify({
        error: 'Internal server error. Please try again later.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})