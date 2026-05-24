# MathAI Solver - Complete Setup Guide

## Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

## Quick Start

### Option 1: Using Helper Scripts (Recommended)

**Windows:**
```cmd
# Install dependencies for both frontend and backend
install-all.bat

# Start backend server
start-backend.bat

# In a new terminal, start frontend server
start-frontend.bat
```

### Option 2: Manual Setup

#### Step 1: Install Backend Dependencies

```cmd
cd backend
npm install
```

#### Step 2: Install Frontend Dependencies

```cmd
cd ..\frontend
npm install
```

#### Step 3: Start Backend Server

```cmd
cd ..\backend
npm start
```

The backend will start on **http://localhost:8080**

#### Step 4: Start Frontend Server (New Terminal)

Open a new terminal window:

```cmd
cd frontend
npx live-server --port=5173 --host=localhost
```

The frontend will start on **http://localhost:5173**

## Testing the Application

### 1. Open Your Browser

Navigate to: **http://localhost:5173**

### 2. Register a New Account

- Click "Register" or go to `register.html`
- Fill in your details:
  - Full Name: Your Name
  - Email: your@email.com
  - Password: (at least 6 characters)
- Click "Register"

### 3. Login

- Use your registered credentials
- You'll be redirected to the solver page

### 4. Try the Math Solver

- Select a math category (Algebra, Calculus, etc.)
- Enter a math problem
- Click "Solve"
- View your history and progress

## Running Tests

### Backend Tests

```cmd
cd backend
npm test
```

Run specific test suites:
```cmd
npm run test:auth    # Test authentication endpoints
npm run test:api     # Test all API endpoints
```

## API Endpoints

The backend provides the following endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### History
- `GET /api/history` - Get user's problem history
- `POST /api/history` - Save a problem to history

### Progress
- `GET /api/progress` - Get user's progress
- `POST /api/progress` - Update progress

### Gamification
- `GET /api/gamification` - Get user stats
- `POST /api/gamification/solve` - Record a solve
- `GET /api/gamification/badges` - Get all badges
- `POST /api/gamification/badges/unlock` - Unlock a badge
- `GET /api/gamification/leaderboard` - Get top users

### Health Check
- `GET /api/health` - Check server status

## Testing API with cURL

### Register a User
```cmd
curl -X POST http://localhost:8080/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"fullName\":\"Test User\",\"email\":\"test@test.com\",\"password\":\"password123\"}" ^
  -c cookies.txt
```

### Login
```cmd
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@test.com\",\"password\":\"password123\"}" ^
  -c cookies.txt
```

### Get Current User
```cmd
curl http://localhost:8080/api/auth/me -b cookies.txt
```

### Save History
```cmd
curl -X POST http://localhost:8080/api/history ^
  -H "Content-Type: application/json" ^
  -d "{\"section\":\"algebra\",\"question\":\"2x+5=15\",\"answer\":\"x=5\"}" ^
  -b cookies.txt
```

## Project Structure

```
maths_solver/
├── backend/                 # Node.js/Express backend
│   ├── data/               # JSON database storage
│   ├── middleware/         # Express middleware
│   ├── routes/             # API route handlers
│   ├── utils/              # Utility functions
│   ├── tests/              # Test suites
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
│
├── frontend/               # HTML/CSS/JS frontend
│   ├── src/
│   │   ├── pages/         # Page-specific JavaScript
│   │   ├── services/      # API service layer
│   │   └── styles/        # CSS styles
│   ├── *.html             # HTML pages
│   └── package.json       # Frontend dependencies
│
├── docker-compose.yml     # Docker configuration
└── README.md              # Project documentation
```

## Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
PORT=8080
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8080/api
VITE_AUTH_TOKEN_KEY=mathai_token
```

## Troubleshooting

### Backend won't start

1. Check if port 8080 is already in use:
   ```cmd
   netstat -ano | findstr :8080
   ```

2. Make sure dependencies are installed:
   ```cmd
   cd backend
   npm install
   ```

3. Check for errors in the console output

### Frontend won't start

1. Check if port 5173 is already in use
2. Install live-server globally:
   ```cmd
   npm install -g live-server
   ```

### CORS Errors

Make sure:
- Backend is running on port 8080
- Frontend is running on port 5173
- Both servers are running simultaneously

### Database Issues

The database is stored in `backend/data/node-db.json`. If you encounter issues:
1. Stop the backend server
2. Delete the `backend/data` folder
3. Restart the backend (it will create a fresh database)

## Docker Deployment

### Build and Run with Docker Compose

```cmd
docker-compose up --build
```

This will:
- Build both frontend and backend containers
- Start the backend on port 8080
- Start the frontend on port 80
- Create a persistent volume for the database

Access the application at: **http://localhost**

### Stop Docker Containers

```cmd
docker-compose down
```

## Production Deployment

### Backend Deployment Options

1. **Heroku**
2. **Railway**
3. **AWS EC2**
4. **DigitalOcean**
5. **Render**

### Frontend Deployment Options

1. **Vercel**
2. **Netlify**
3. **GitHub Pages**
4. **AWS S3 + CloudFront**

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## Security Notes

- Change default session secrets in production
- Use HTTPS in production
- Set proper CORS origins
- Enable rate limiting (already configured)
- Regular security updates

## Support

For issues or questions:
1. Check the API documentation: `backend/API_DOCUMENTATION.md`
2. Review the troubleshooting section above
3. Check the console for error messages

## License

MIT License - See LICENSE file for details
