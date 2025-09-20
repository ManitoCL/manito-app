# URGENT AUTH CALLBACK FIX NEEDED

## ROOT CAUSE: verify-email.js NEVER generates mobile deep links

The auth callback service calculates `isMobileApp` but never uses it.

## CRITICAL FIX NEEDED in verify-email.js:

Replace this section (around line 150):

```javascript
// Check User-Agent to determine if request is from mobile app or browser
const userAgent = req.headers['user-agent'] || '';
const isMobileApp = userAgent.includes('Expo') || userAgent.includes('ReactNative') || userAgent.includes('manito');

// ALWAYS redirect to frontend with tokens - let frontend handle app detection
console.log("🌐 Redirecting to frontend with session tokens - frontend will handle mobile app detection");
return redirectToFrontend({
  access_token: data.session.access_token,
  refresh_token: data.session.refresh_token,
  expires_in: data.session.expires_in?.toString() || "3600",
  token_type: data.session.token_type || "bearer",
  type: "success",
  flow: "pkce"
}, res);
```

WITH:

```javascript
// Check User-Agent to determine if request is from mobile app or browser
const userAgent = req.headers['user-agent'] || '';
const isMobileApp = userAgent.includes('Expo') || userAgent.includes('ReactNative') || userAgent.includes('manito');

console.log("🔍 Request analysis:", {
  userAgent: userAgent.substring(0, 100),
  isMobileApp,
  requestSource: isMobileApp ? 'Mobile App' : 'Web Browser'
});

if (isMobileApp) {
  // MOBILE APP: Generate deep link directly
  const deepLinkParams = new URLSearchParams({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at?.toString() || "",
    token_type: data.session.token_type || "bearer",
    auth_method: "email",
    flow_type: "pkce",
    verified: "true"
  });

  const mobileDeepLink = `manito://auth/verified?${deepLinkParams.toString()}`;
  
  console.log("📱 MOBILE DEEP LINK GENERATED:", {
    scheme: "manito://",
    path: "auth/verified",
    hasTokens: !!(data.session.access_token && data.session.refresh_token)
  });

  return res.redirect(302, mobileDeepLink);
} else {
  // WEB BROWSER: Redirect to frontend  
  console.log("🌐 Web browser - redirecting to frontend");
  return redirectToFrontend({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in?.toString() || "3600",
    token_type: data.session.token_type || "bearer",
    type: "success",
    flow: "pkce"
  }, res);
}
```

## RESEND ISSUE ROOT CAUSE:

The resend button also uses the same broken auth callback, generating web redirects instead of mobile deep links.

## IMPACT: 
- Fixes both verification detection AND resend functionality
- Mobile apps will receive proper deep links
- Web browsers continue to work normally