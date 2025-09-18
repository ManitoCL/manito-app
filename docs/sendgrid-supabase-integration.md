# SendGrid + Supabase Production Integration Guide

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Supabase      │────│    SendGrid      │────│   Your App         │
│   Auth System   │    │   Email Service  │    │   Deep Links       │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
         │                        │                        │
         │                        │                        │
    Generates              Tracks & Delivers          Processes
    Auth Tokens           via links.manito.cl        Deep Link URLs
```

## SendGrid Configuration Steps

### 1. Domain Authentication (Required for Production)
- **Purpose**: Proves you own manito.cl domain
- **Impact**: Dramatically improves email deliverability
- **Setup**: SendGrid Dashboard → Settings → Sender Authentication → Authenticate Domain

```
Domain: manito.cl
Subdomain: mail (optional, recommended)
Final domain: mail.manito.cl
```

### 2. Link Branding (Your Tracking Domain)
- **Purpose**: All email links will use links.manito.cl instead of sendgrid.net
- **Impact**: Better user trust, branding consistency
- **Setup**: SendGrid Dashboard → Settings → Sender Authentication → Brand Link

```
Domain: manito.cl
Subdomain: links
Final domain: links.manito.cl
```

### 3. Required DNS Records (Add to Cloudflare)

```dns
# Domain Authentication (Replace with your actual values from SendGrid)
CNAME s1._domainkey.manito.cl → s1.domainkey.u[ID].wl[ID].sendgrid.net
CNAME s2._domainkey.manito.cl → s2.domainkey.u[ID].wl[ID].sendgrid.net

# Link Branding (Replace with your actual values)
CNAME links.manito.cl → sendgrid.net
CNAME [ID].links.manito.cl → sendgrid.net

# MX Record (if using SendGrid for all email)
MX manito.cl → mx.sendgrid.net (priority 10)
```

## Supabase Configuration

### 1. SMTP Settings (Supabase Dashboard → Settings → Auth)
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587 (or 465 for SSL)
SMTP Username: apikey
SMTP Password: [Your SendGrid API Key]
SMTP Sender Name: Manito
SMTP Sender Email: noreply@manito.cl
```

### 2. Email Templates Configuration
```
# Site URL: https://manito.cl (production) or http://localhost:8081 (development)
# Redirect URLs: Add both:
- manito://auth/callback (mobile deep link)
- https://manito.cl/auth/callback (web fallback)
- exp://192.168.1.131:8081/--/auth/callback (development)
```

## Email Flow Architecture

### Development Flow
```
1. User signs up
2. Supabase generates confirmation email
3. SendGrid sends email with tracking via url8888.manito.cl
4. User clicks → SendGrid processes → Redirects to manito://auth/callback
5. App receives deep link and completes authentication
```

### Production Flow
```
1. User signs up
2. Supabase generates confirmation email
3. SendGrid sends email with tracking via links.manito.cl
4. User clicks → SendGrid processes → Redirects to https://manito.cl/auth/callback
5. Web handler or deep link completes authentication
```

## Required App Configuration

### 1. Handle Multiple Redirect Patterns
```typescript
// In your auth service
const getEmailRedirectUrl = () => {
  if (__DEV__) {
    return Linking.createURL('/auth/callback'); // manito://auth/callback
  }

  // Production: web URL that can redirect to mobile
  return 'https://manito.cl/auth/callback';
};
```

### 2. Web Callback Handler (Required for Production)
```typescript
// Create: https://manito.cl/auth/callback
// This page should:
// 1. Extract auth tokens from URL
// 2. Store in browser temporarily
// 3. Redirect to mobile app with deep link
```

## Why This Architecture?

### SendGrid Benefits:
- **Deliverability**: 99%+ inbox delivery rate
- **Analytics**: Email open/click tracking
- **Scalability**: Handles millions of emails
- **Compliance**: CAN-SPAM, GDPR compliant
- **Security**: Link scanning, malware protection

### Domain Benefits:
- **Trust**: Users see manito.cl, not sendgrid.net
- **Branding**: Consistent domain experience
- **Control**: You own the email experience
- **Analytics**: Track engagement on your domain

## Implementation Priority

### Phase 1 (Immediate - Development)
1. ✅ Fix current deep link handling
2. Add url8888.manito.cl to allowed redirects
3. Test complete signup → email → confirmation flow

### Phase 2 (Pre-Production)
1. Set up domain authentication in SendGrid
2. Add DNS records to Cloudflare
3. Configure link branding
4. Test with links.manito.cl

### Phase 3 (Production)
1. Create web callback handler at manito.cl/auth/callback
2. Update Supabase redirect URLs
3. Monitor email deliverability metrics
4. Set up email analytics dashboard

## Security Considerations

- Never expose SendGrid API keys in client code
- Use environment variables for all credentials
- Implement rate limiting on auth endpoints
- Monitor for suspicious email patterns
- Set up SPF/DKIM/DMARC records for maximum security

## Monitoring & Analytics

Track these metrics:
- Email delivery rate
- Open rate
- Click-through rate
- Signup completion rate
- Deep link success rate