# Session Expiration Fix

## Problem

After solving 10-15 questions, you get logged out automatically and see "Sign in to see history/gamification" even though you were logged in.

## Root Cause

The sessions were stored **in-memory** using a JavaScript Map. This means:
- ❌ Sessions are lost when backend restarts
- ❌ Sessions can be garbage collected
- ❌ No persistence across server restarts
- ❌ Short 7-day expiration

## Solution Applied

### 1. Database-Persisted Sessions ✅

Sessions are now stored in the database (`backend/data/node-db.json`) instead of memory:

```javascript
// OLD (in-memory)
const sessions = new Map();

// NEW (database-persisted)
db.sessions = [
  { sessionId: "abc123...", userId: 1, expiresAt: 1234567890 }
]
```

**Benefits:**
- ✅ Sessions survive backend restarts
- ✅ Sessions are saved to disk
- ✅ Can view/debug sessions in database file
- ✅ More reliable

### 2. Extended Session Duration ✅

Changed from 7 days to 30 days:

```javascript
// OLD
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// NEW
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
```

### 3. Rolling Expiry ✅

Every time you use the app, your session is extended by another 30 days:

```javascript
// Each request extends the session
session.expiresAt = Date.now() + SESSION_MAX_AGE_MS;
```

This means as long as you use the app, you'll stay logged in!

### 4. Automatic Cleanup ✅

Expired sessions are automatically cleaned up every hour:

```javascript
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
```

### 5. Better Logging ✅

Added debug logging to track session issues:

```javascript
console.log(`[auth] Session ${sessionId}... not found or expired`);
console.log(`[session] Cleaned up 5 expired sessions`);
```

## How to Apply the Fix

### Step 1: Restart Backend

The code has been updated. You need to restart the backend:

```cmd
# In backend terminal, press Ctrl + C to stop
# Then restart:
npm start
```

Or use the simple server:
```cmd
node server-simple.js
```

### Step 2: Clear Old Sessions (Optional)

If you want to start fresh:

1. Stop the backend
2. Open `backend/data/node-db.json`
3. Find the `"sessions"` array
4. Delete all entries: `"sessions": []`
5. Save the file
6. Restart backend

### Step 3: Test

1. Register or login
2. Solve 10-15 problems
3. Check if history and gamification still show
4. Should stay logged in! ✅

## Verification

### Check Session in Database

Open `backend/data/node-db.json` and look for:

```json
{
  "sessions": [
    {
      "sessionId": "abc123...",
      "userId": 1,
      "expiresAt": 1234567890000,
      "createdAt": "2026-05-17T..."
    }
  ]
}
```

### Check Backend Logs

Look at the backend terminal for session logs:

```
[session] Cleaned up 0 expired sessions
[auth] Session abc123... not found or expired
```

### Check Browser Cookies

1. Open Developer Tools (F12)
2. Go to "Application" tab
3. Click "Cookies" → "http://localhost:5173"
4. Look for `maths_solver_sid` cookie
5. Should have Max-Age of 2592000 (30 days)

## Session Lifecycle

```
1. User registers/logs in
   → createSession() called
   → Session saved to database
   → Cookie sent to browser

2. User makes requests
   → getSession() called
   → Session found in database
   → Expiry extended (rolling)
   → User stays logged in

3. User inactive for 30 days
   → Session expires
   → getSession() returns null
   → User sees "Please log in"

4. Hourly cleanup
   → cleanupExpiredSessions() runs
   → Removes expired sessions from database
```

## Troubleshooting

### Still Getting Logged Out?

**Check 1: Backend Restarted?**
- Sessions persist across restarts now
- But you need to restart backend for new code to load

**Check 2: Cookie Being Sent?**
- Open Network tab (F12)
- Make a request to `/api/history`
- Check "Request Headers"
- Should see: `Cookie: maths_solver_sid=...`

**Check 3: Session in Database?**
- Open `backend/data/node-db.json`
- Check `sessions` array
- Should have your session

**Check 4: Backend Logs?**
- Look at backend terminal
- Any session-related errors?

### Session Not Found After Restart?

If sessions are lost after backend restart:
- Check if `node-db.json` is being saved
- Check file permissions
- Check if database is in correct location

### Multiple Sessions?

The code allows multiple sessions per user (login from multiple devices).

To limit to one session per user, uncomment this line in `session.js`:

```javascript
// Remove any existing sessions for this user
db.sessions = db.sessions.filter(s => s.userId !== userId);
```

## Benefits of This Fix

✅ **Stay logged in longer** - 30 days instead of 7
✅ **Survive restarts** - Sessions saved to database
✅ **Rolling expiry** - Active users never expire
✅ **Automatic cleanup** - Old sessions removed hourly
✅ **Better debugging** - Logs show session issues
✅ **More reliable** - No in-memory data loss

## Security Notes

- Sessions are still secure (HttpOnly cookies)
- Session IDs are cryptographically random
- Expired sessions are automatically cleaned
- Sessions can be manually revoked via logout

## Production Recommendations

For production, consider:
1. Use Redis for session storage (faster)
2. Add session fingerprinting (IP, User-Agent)
3. Implement "Remember Me" checkbox
4. Add session management UI (view/revoke sessions)
5. Log session activity for security auditing

---

**The fix is complete! Just restart the backend and you should stay logged in.** 🎉
