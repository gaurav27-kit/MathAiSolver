# 🧮 MathAI Solver

A full-stack mathematics problem solver with user authentication, history tracking, progress monitoring, and gamification features.

## ✨ Features

- **🔐 User Authentication** - Secure registration and login with session management
- **📊 Math Problem Solver** - Solve algebra, calculus, trigonometry, and more
- **📝 History Tracking** - Save and review your solved problems
- **📈 Progress Monitoring** - Track your learning progress across categories
- **🎮 Gamification** - Earn points, maintain streaks, unlock badges, and compete on leaderboards
- **🎨 Modern UI** - Clean, responsive design with dark/light theme support
- **🔒 Security** - Password hashing, rate limiting, CORS protection, security headers

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

### Installation & Running

**Option 1: One-Click Start (Easiest)**

1. Double-click `install-all.bat` to install dependencies
2. Double-click `start-both.bat` to start both servers
3. Browser will open automatically at http://localhost:5173

**Option 2: Manual Start**

```cmd
# Install dependencies
cd backend
npm install
cd ..\frontend
npm install

# Start backend (in one terminal)
cd backend
npm start

# Start frontend (in another terminal)
cd frontend
npx live-server --port=5173 --host=localhost
```

## 📁 Project Structure

```
maths_solver/
├── backend/                    # Node.js/Express API
│   ├── data/                  # JSON database
│   ├── middleware/            # Auth middleware
│   ├── routes/                # API endpoints
│   │   ├── auth.js           # Authentication
│   │   ├── history.js        # Problem history
│   │   ├── progress.js       # User progress
│   │   └── gamification.js   # Points, badges, leaderboard
│   ├── utils/                 # Utilities
│   │   ├── crypto.js         # Password hashing
│   │   ├── db.js             # Database operations
│   │   ├── session.js        # Session management
│   │   └── validation.js     # Input validation
│   ├── tests/                 # Test suites
│   ├── server.js             # Main server
│   └── package.json
│
├── frontend/                  # HTML/CSS/JS client
│   ├── src/
│   │   ├── pages/            # Page scripts
│   │   ├── services/         # API services
│   │   └── styles/           # CSS
│   ├── index.html            # Landing page
│   ├── login.html            # Login page
│   ├── register.html         # Registration
│   ├── solver.html           # Math solver
│   └── package.json
│
├── docker-compose.yml         # Docker setup
├── SETUP_GUIDE.md            # Detailed setup instructions
└── API_DOCUMENTATION.md       # Complete API reference
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### History
- `GET /api/history` - Get problem history (last 20)
- `POST /api/history` - Save problem to history

### Progress
- `GET /api/progress` - Get user progress
- `POST /api/progress` - Update progress

### Gamification
- `GET /api/gamification` - Get user stats
- `POST /api/gamification/solve` - Record solve (+10 points)
- `GET /api/gamification/badges` - Get all badges
- `POST /api/gamification/badges/unlock` - Unlock badge
- `GET /api/gamification/leaderboard` - Get top 10 users

### Health
- `GET /api/health` - Server health check

See `backend/API_DOCUMENTATION.md` for complete API reference with examples.

## 🧪 Testing

```cmd
cd backend

# Run all tests
npm test

# Run specific test suites
npm run test:auth    # Authentication tests
npm run test:api     # API endpoint tests

# Watch mode
npm run test:watch
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Joi** - Input validation
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **Jest & Supertest** - Testing

### Frontend
- **HTML5/CSS3/JavaScript** - Core technologies
- **Nerdamer** - Math computation library
- **Fetch API** - HTTP requests
- **LocalStorage** - Client-side storage

### Database
- **JSON File Storage** - Lightweight, no setup required

## 🔒 Security Features

- ✅ Password hashing with Node.js scrypt
- ✅ HTTP-only session cookies
- ✅ CORS protection
- ✅ Security headers (Helmet)
- ✅ Rate limiting (100 req/15min general, 5 req/15min auth)
- ✅ Input validation and sanitization
- ✅ XSS protection

## 🐳 Docker Deployment

```cmd
# Build and start
docker-compose up --build

# Access at http://localhost
```

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)** - Complete API reference
- **[implementation_plan.md](implementation_plan.md)** - Development roadmap

## 🎯 Gamification System

### Point System
- Solve a problem: **+10 points**
- Daily streak bonus
- Level progression based on points

### Levels
- 🥉 Beginner: 0-49 points
- 🥈 Intermediate: 50-149 points
- 🥇 Advanced: 150-299 points
- 💎 Expert: 300-499 points
- 👑 Master: 500-799 points
- 🏆 Legend: 800+ points

### Badges
- 🎯 First Steps - Solve your first problem
- 🧩 Problem Solver - Solve 10 problems
- 📐 Math Enthusiast - Solve 50 problems
- 🔥 Streak Master - 7-day streak
- 💯 Century Club - Solve 100 problems
- ⭐ Point Collector - Earn 500 points
- 👑 Math Legend - Earn 1000 points

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📝 License

MIT License - See LICENSE file for details

## 🆘 Troubleshooting

### Port Already in Use
```cmd
# Check what's using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Database Issues
Delete `backend/data/node-db.json` and restart the server for a fresh database.

### CORS Errors
Ensure both servers are running:
- Backend: http://localhost:8080
- Frontend: http://localhost:5173

## 📞 Support

For issues or questions:
1. Check the [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. Review [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)
3. Check console for error messages

---

**Made with ❤️ for math enthusiasts**
"# MathAiSolver" 
