# MathAI Solver - API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication

All authenticated endpoints require a session cookie that is automatically set upon successful registration or login.

### Error Responses

All endpoints return errors in the following format:
```json
{
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"] // Optional
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Rate Limit:** 5 requests per 15 minutes per IP

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Validation Rules:**
- `fullName`: Required, 2-100 characters
- `email`: Required, valid email format
- `password`: Required, 6-120 characters

**Success Response:** `201 Created`
```json
{
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400` - Validation failed or email already exists

---

### Login

Authenticate an existing user.

**Endpoint:** `POST /api/auth/login`

**Rate Limit:** 5 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400` - Validation failed
- `401` - Invalid email or password

---

### Get Current User

Get the currently authenticated user's profile.

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required

**Success Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `401` - Not authenticated

---

### Logout

End the current user session.

**Endpoint:** `POST /api/auth/logout`

**Success Response:** `200 OK`
```json
{
  "message": "Logged out."
}
```

---

## History Endpoints

### Get History

Fetch the last 20 history entries for the current user.

**Endpoint:** `GET /api/history`

**Authentication:** Required

**Success Response:** `200 OK`
```json
{
  "history": [
    {
      "id": 1,
      "section": "algebra",
      "question": "2x + 5 = 15",
      "answer": "x = 5",
      "createdAt": "2026-05-17T10:30:00.000Z"
    },
    {
      "id": 2,
      "section": "calculus",
      "question": "d/dx(x^2)",
      "answer": "2x",
      "createdAt": "2026-05-17T11:00:00.000Z"
    }
  ]
}
```

---

### Save History Entry

Save a new problem-solving history entry.

**Endpoint:** `POST /api/history`

**Authentication:** Required

**Request Body:**
```json
{
  "section": "algebra",
  "question": "2x + 5 = 15",
  "answer": "x = 5"
}
```

**Validation Rules:**
- `section`: Required, 1-100 characters
- `question`: Required, 1-4000 characters
- `answer`: Required, 1-4000 characters

**Success Response:** `201 Created`
```json
{
  "message": "History saved."
}
```

**Error Responses:**
- `400` - Validation failed
- `401` - Not authenticated

---

## Progress Endpoints

### Get Progress

Fetch the current user's saved progress.

**Endpoint:** `GET /api/progress`

**Authentication:** Required

**Success Response:** `200 OK`
```json
{
  "progress": {
    "currentSection": "algebra",
    "lastQuestion": "2x + 5 = 15",
    "updatedAt": "2026-05-17T10:30:00.000Z"
  }
}
```

**Note:** Returns `{ "progress": null }` if no progress has been saved yet.

---

### Save Progress

Save or update the current user's progress.

**Endpoint:** `POST /api/progress`

**Authentication:** Required

**Request Body:**
```json
{
  "currentSection": "algebra",
  "lastQuestion": "2x + 5 = 15"
}
```

**Validation Rules:**
- `currentSection`: Required, 1-100 characters
- `lastQuestion`: Optional, max 4000 characters

**Success Response:** `200 OK`
```json
{
  "message": "Progress saved."
}
```

**Error Responses:**
- `400` - Validation failed
- `401` - Not authenticated

---

## Gamification Endpoints

### Get Gamification Stats

Fetch the current user's gamification statistics.

**Endpoint:** `GET /api/gamification`

**Authentication:** Required

**Success Response:** `200 OK`
```json
{
  "gamification": {
    "points": 150,
    "streak": 7,
    "lastStreakDate": "Sun May 17 2026",
    "todaySolves": 3,
    "lastSolveDate": "Sun May 17 2026",
    "level": "Advanced"
  }
}
```

**Level Tiers:**
- Beginner: 0-49 points
- Intermediate: 50-149 points
- Advanced: 150-299 points
- Expert: 300-499 points
- Master: 500-799 points
- Legend: 800+ points

---

### Record Problem Solve

Record a problem solve, award XP, and update streak.

**Endpoint:** `POST /api/gamification/solve`

**Authentication:** Required

**Success Response:** `200 OK`
```json
{
  "gamification": {
    "points": 160,
    "streak": 7,
    "lastStreakDate": "Sun May 17 2026",
    "todaySolves": 4,
    "lastSolveDate": "Sun May 17 2026"
  },
  "leveledUp": false,
  "newBadge": "Advanced"
}
```

**Notes:**
- Awards 10 points per solve
- Increments streak if solving on consecutive days
- Resets streak if a day is missed
- Returns `leveledUp: true` if user reached a new tier

---

### Get Badges

Get all available badges with unlock status for the current user.

**Endpoint:** `GET /api/gamification/badges`

**Authentication:** Required

**Success Response:** `200 OK`
```json
{
  "badges": [
    {
      "id": 1,
      "name": "First Steps",
      "icon": "🎯",
      "description": "Solve your first problem",
      "unlocked": true,
      "unlockedAt": "2026-05-17T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Problem Solver",
      "icon": "🧩",
      "description": "Solve 10 problems",
      "unlocked": false,
      "unlockedAt": null
    }
  ]
}
```

**Available Badges:**
1. First Steps (🎯) - Solve your first problem
2. Problem Solver (🧩) - Solve 10 problems
3. Math Enthusiast (📐) - Solve 50 problems
4. Streak Master (🔥) - Maintain a 7-day streak
5. Century Club (💯) - Solve 100 problems
6. Point Collector (⭐) - Earn 500 points
7. Math Legend (👑) - Earn 1000 points

---

### Unlock Badge

Manually unlock a specific badge for the current user.

**Endpoint:** `POST /api/gamification/badges/unlock`

**Authentication:** Required

**Request Body:**
```json
{
  "badgeId": 1
}
```

**Success Response:** `200 OK`
```json
{
  "badge": {
    "id": 1,
    "name": "First Steps",
    "icon": "🎯"
  },
  "unlocked": true
}
```

**Error Responses:**
- `400` - Invalid badge ID or badge already unlocked
- `404` - Badge not found

---

### Get Leaderboard

Get the top 10 users by points.

**Endpoint:** `GET /api/gamification/leaderboard`

**Authentication:** Required

**Success Response:** `200 OK`
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user": "John Doe",
      "points": 1500,
      "streak": 15
    },
    {
      "rank": 2,
      "user": "Jane Smith",
      "points": 1200,
      "streak": 10
    }
  ]
}
```

---

## Health Check

### Server Health

Check if the server is running.

**Endpoint:** `GET /api/health`

**Success Response:** `200 OK`
```json
{
  "status": "ok",
  "ts": "2026-05-17T10:30:00.000Z"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General API endpoints:** 100 requests per 15 minutes per IP
- **Authentication endpoints:** 5 requests per 15 minutes per IP

When rate limit is exceeded, the API returns:
```json
{
  "message": "Too many requests, please try again later."
}
```

---

## Security Features

1. **Password Hashing:** All passwords are hashed using Node.js scrypt
2. **Session Management:** Secure HTTP-only cookies with 7-day expiration
3. **CORS Protection:** Only allowed origins can access the API
4. **Security Headers:** Helmet.js for security headers
5. **Input Validation:** Joi validation on all inputs
6. **Rate Limiting:** Protection against brute force attacks

---

## Example Usage

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","email":"john@example.com","password":"password123"}' \
  -c cookies.txt
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' \
  -c cookies.txt
```

**Get Current User:**
```bash
curl http://localhost:8080/api/auth/me \
  -b cookies.txt
```

**Save History:**
```bash
curl -X POST http://localhost:8080/api/history \
  -H "Content-Type: application/json" \
  -d '{"section":"algebra","question":"2x+5=15","answer":"x=5"}' \
  -b cookies.txt
```

**Get Gamification Stats:**
```bash
curl http://localhost:8080/api/gamification \
  -b cookies.txt
```

---

## JavaScript Fetch Examples

**Register:**
```javascript
const response = await fetch('http://localhost:8080/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    fullName: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await response.json();
console.log(data.user);
```

**Get History:**
```javascript
const response = await fetch('http://localhost:8080/api/history', {
  credentials: 'include'
});

const data = await response.json();
console.log(data.history);
```

---

## Database Schema

### Users
```javascript
{
  id: Number,
  fullName: String,
  email: String,
  passwordHash: String,
  createdAt: String (ISO 8601)
}
```

### History
```javascript
{
  id: Number,
  userId: Number,
  section: String,
  question: String,
  answer: String,
  createdAt: String (ISO 8601)
}
```

### Progress
```javascript
{
  userId: Number,
  currentSection: String,
  lastQuestion: String,
  updatedAt: String (ISO 8601)
}
```

### Gamification
```javascript
{
  userId: Number,
  points: Number,
  streak: Number,
  lastStreakDate: String,
  todaySolves: Number,
  lastSolveDate: String
}
```

### Badges
```javascript
{
  userId: Number,
  badgeId: Number,
  unlockedAt: String (ISO 8601)
}
```
