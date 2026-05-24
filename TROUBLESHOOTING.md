# Troubleshooting Guide

## Common Errors and Solutions

### Error: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"

**What it means:** The frontend is trying to parse JSON from an empty or invalid response.

**Common causes:**
1. Backend server is not running
2. Backend returned an error without JSON body
3. CORS is blocking the request
4. Wrong API URL configuration

**Solutions:**

#### 1. Check if Backend is Running

Open your browser and go to:
```
http://localhost:8080/api/health
```

**Expected response:**
```json
{"status":"ok","ts":"2026-05-17T..."}
```

**If you see an error:**
- Backend is not running
- Start it with: `cd backend && npm start`

#### 2. Check Browser Console

Open Developer Tools (F12) and check the Console tab for errors:

**If you see "Failed to fetch":**
- Backend is not running on port 8080
- Start the backend server

**If you see CORS errors:**
- Make sure both servers are running
- Backend should be on http://localhost:8080
- Frontend should be on http://localhost:5173

#### 3. Verify Both Servers Are Running

You need TWO terminal windows:

**Terminal 1 - Backend:**
```cmd
cd C:\Users\QUIKCARE COMPUTERS\Desktop\maths_solver\backend
npm start
```

Should show:
```
✅ MathAI Solver backend running → http://localhost:8080
```

**Terminal 2 - Frontend:**
```cmd
cd C:\Users\QUIKCARE COMPUTERS\Desktop\maths_solver\frontend
npx live-server --port=5173 --host=localhost
```

Should show:
```
Serving "..." at http://localhost:5173
```

#### 4. Clear Browser Cache

Sometimes old JavaScript files are cached:
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page (`Ctrl + F5`)

#### 5. Check Network Tab

1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Try to login/register
4. Look for the request to `/api/auth/login` or `/api/auth/register`
5. Click on it and check:
   - **Status:** Should be 200 or 201 for success
   - **Response:** Should show JSON data
   - **Headers:** Should include `Content-Type: application/json`

**If Status is 404:**
- Backend route not found
- Check backend is running

**If Status is 500:**
- Backend error
- Check backend terminal for error messages

**If Status is 0 or request is "cancelled":**
- CORS issue or backend not reachable
- Verify backend is running on port 8080

---

## Other Common Issues

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::8080`

**Solution:**
```cmd
# Find what's using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### npm is not recognized

**Error:** `'npm' is not recognized as an internal or external command`

**Solution:**
- Node.js is not installed or not in PATH
- Download and install from: https://nodejs.org/
- Restart your terminal after installation

### Cannot find module

**Error:** `Cannot find module 'express'` or similar

**Solution:**
```cmd
cd backend
npm install
```

### Frontend shows blank page

**Possible causes:**
1. JavaScript error - Check browser console (F12)
2. Files not loading - Check Network tab
3. Wrong URL - Should be http://localhost:5173

**Solution:**
- Check browser console for errors
- Make sure live-server is running
- Try hard refresh: `Ctrl + F5`

### Database errors

**Error:** Database file is corrupted or has errors

**Solution:**
```cmd
# Stop the backend server (Ctrl + C)
# Delete the database file
del backend\data\node-db.json
# Restart the backend (it will create a fresh database)
cd backend
npm start
```

### CORS errors in browser

**Error:** `Access to fetch at 'http://localhost:8080/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution:**
- Make sure backend is running
- Backend CORS is configured for localhost:5173
- Both servers must be running simultaneously

---

## Testing Checklist

Use this checklist to verify everything is working:

- [ ] Node.js is installed (`node --version` works)
- [ ] Backend dependencies installed (`backend/node_modules` exists)
- [ ] Frontend dependencies installed (`frontend/node_modules` exists)
- [ ] Backend server is running on port 8080
- [ ] Frontend server is running on port 5173
- [ ] Health check works: http://localhost:8080/api/health
- [ ] Frontend loads: http://localhost:5173
- [ ] No errors in browser console (F12)
- [ ] Can register a new account
- [ ] Can login with credentials
- [ ] Can solve a math problem

---

## Still Having Issues?

1. **Read the setup guide:** `SETUP_GUIDE.md`
2. **Check API documentation:** `backend/API_DOCUMENTATION.md`
3. **Review the quick start:** `START_HERE.txt`
4. **Check both terminal windows** for error messages
5. **Look at browser console** (F12) for JavaScript errors

---

## Quick Reset

If everything is broken and you want to start fresh:

```cmd
# Stop both servers (Ctrl + C in both terminals)

# Delete node_modules and database
rmdir /s /q backend\node_modules
rmdir /s /q frontend\node_modules
del backend\data\node-db.json

# Reinstall everything
cd backend
npm install
cd ..\frontend
npm install

# Start backend
cd ..\backend
npm start

# In new terminal, start frontend
cd frontend
npx live-server --port=5173 --host=localhost
```

---

## Getting Help

When asking for help, provide:
1. Error message (exact text)
2. Browser console output (F12 → Console tab)
3. Backend terminal output
4. What you were trying to do
5. Operating system and Node.js version
