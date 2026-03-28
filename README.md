# TaskMaster - Full-Stack Task Management App

A modern full-stack task management application demonstrating best practices in web development: modular architecture, comprehensive testing (72 tests), CI/CD automation, and user authentication.

**Status:** Phase 3 Complete - Testing & QA ✅ | **Progress:** 60% (3 of 5 phases)

---

## 🎯 Quick Links

- **[API Documentation](backend/API.md)** - All endpoints with examples
- **[Development Guide](DEVELOPMENT.md)** - Architecture, how to add features, debugging
- **[Database Schema](backend/DATABASE.md)** - Table structure and relationships
- **[Test Summary](PHASE3_SUMMARY.md)** - 72 passing tests and coverage details

---

## 📋 Features

✅ **User Authentication**
- Google OAuth 2.0 integration
- Session-based authentication
- Secure session storage in PostgreSQL

✅ **Task Management**
- Create, read, update, delete tasks
- Task prioritization (low, medium, high)
- Task categorization
- Due dates support
- Task completion tracking

✅ **Advanced Filtering**
- Search by title
- Filter by priority and category
- Filter by completion status
- Sort by title, priority, or date

✅ **User Isolation**
- Each user sees only their tasks
- Database-level enforcement
- Secure session management

✅ **Quality Assurance**
- 57 frontend unit tests (Vitest + React Testing Library)
- 15 backend integration tests (Jest + Supertest)
- 72 total tests passing (100% success rate)
- ~70% coverage on critical paths

✅ **Modern Tech Stack**
- React 18 with Vite bundler
- Express.js backend
- PostgreSQL database
- GitHub Actions CI/CD

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Browser (React 18)              │
│    http://localhost:5173                │
│  ┌─────────────────────────────────┐   │
│  │  Task Management UI             │   │
│  │  - Components: Auth, Tasks,     │   │
│  │    Filters, ErrorBoundary       │   │
│  │  - Hooks: useAuth, useTasks,    │   │
│  │    useFilter                    │   │
│  └─────────────────────────────────┘   │
└──────────────┬──────────────────────────┘
               │ REST API (HTTP/HTTPS)
┌──────────────▼──────────────────────────┐
│      Express.js Backend                 │
│    http://localhost:5000                │
│  ┌─────────────────────────────────┐   │
│  │  Routes:                        │   │
│  │  - GET/POST/PUT/DELETE /tasks  │   │
│  │  - GET /auth/user              │   │
│  │  - GET /auth/google/*          │   │
│  │  - Middleware: CORS, Session   │   │
│  └─────────────────────────────────┘   │
└──────────────┬──────────────────────────┘
               │ SQL Queries
┌──────────────▼──────────────────────────┐
│      PostgreSQL Database                │
│    localhost:5432 / Render.com          │
│  ┌─────────────────────────────────┐   │
│  │  Tables:                        │   │
│  │  - users (id, username, email)  │   │
│  │  - tasks (id, title, user_id)   │   │
│  │  - session (sid, sess)          │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org))
- PostgreSQL 8+ ([download](https://www.postgresql.org) or use Docker)
- Git

### Local Setup (5 minutes)

**1. Clone Repository:**
```bash
git clone https://github.com/aggimallaabhishek/TaskMaster-A-Simple-Task-Management-App.git
cd TaskMaster-A-Simple-Task-Management-App
```

**2. Install Dependencies:**
```bash
npm install && cd backend && npm install && cd ../frontend && npm install && cd ..
```

**3. Setup Database:**

**Option A - Docker Compose (Recommended):**
```bash
docker-compose up -d
# Creates PostgreSQL on localhost:5432
```

**Option B - Local PostgreSQL:**
```bash
createdb taskmaster
# Backend will auto-create tables
```

**4. Configure Environment:**
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Update backend/.env if using non-default PostgreSQL settings
```

**5. Start Development Servers:**

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run dev
# Runs on http://localhost:5173
```

**6. Open App:**
```
http://localhost:5173
```

Click "Login with Google" (uses mock authentication in development mode).

---

## 📁 Project Structure

```
TaskMaster/
├── backend/                          Express.js API
│   ├── server.js                     Main server (429 lines)
│   ├── test/
│   │   ├── app.test.js               15 tests
│   │   └── setup.js                  Test config
│   ├── API.md                        API documentation
│   ├── DATABASE.md                   Schema docs
│   └── .env.example                  Config template
│
├── frontend/                         React + Vite
│   ├── src/
│   │   ├── App.jsx                   Main component
│   │   ├── api/                      API client
│   │   ├── hooks/                    useAuth, useTasks, useFilter
│   │   ├── components/               Modular components
│   │   ├── styles/                   CSS + theme constants
│   │   └── __tests__/
│   │       └── (8 test files, 57 tests)
│   └── .env.example                  Config template
│
├── .github/workflows/
│   └── ci-cd.yml                     GitHub Actions pipeline
│
├── DEVELOPMENT.md                    Development guide
├── PHASE3_SUMMARY.md                 Testing results
├── PHASE3_EXPANSION.md               Backend tests + CI/CD
└── README.md                         This file
```

**For detailed structure, see [DEVELOPMENT.md](DEVELOPMENT.md)**

---

## 🧪 Testing

### Run Tests

**Backend:**
```bash
cd backend
npm test                    # Run all tests
npm test -- --coverage     # With coverage report
```

**Frontend:**
```bash
cd frontend
npm test                    # Run all tests
npm test:ui                 # Interactive UI
npm test:coverage          # With coverage report
```

### Test Coverage

```
Frontend Tests:     57 passing ✅
  - API client:      8 tests
  - Hooks:          21 tests
  - Components:     28 tests

Backend Tests:      15 passing ✅
  - CRUD:            6 tests
  - Error handling:  3 tests
  - Validation:      2 tests
  - Infrastructure:  4 tests

Total: 72 tests passing | ~70% coverage on critical paths
```

**View detailed results:** [PHASE3_SUMMARY.md](PHASE3_SUMMARY.md)

---

## 🔌 API Overview

All endpoints require authentication (except health checks).

### Quick Examples

**Get All Tasks:**
```bash
curl http://localhost:5000/api/tasks
```

**Create Task:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "priority": "high"}'
```

**Update Task:**
```bash
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

**Delete Task:**
```bash
curl -X DELETE http://localhost:5000/api/tasks/1
```

**Full API documentation:** [backend/API.md](backend/API.md)

---

## 🛠️ Development

### Adding Features

Examples provided for:
- Adding task fields
- Creating new components
- Adding backend endpoints
- Writing tests

**See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed guide**

### Common Tasks

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Debug database
psql taskmaster
```

### Debugging

**Frontend:**
- React DevTools browser extension
- DevTools Network tab (see API requests)
- Check browser console for errors

**Backend:**
- Check console logs in terminal
- Connect to PostgreSQL: `psql taskmaster`
- Review `server.js` middleware and routes

**See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed debugging guide**

---

## 🚢 Deployment

### Backend (Render.com)

1. Connect GitHub repo
2. Create Web Service
3. Set environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL=postgresql://...`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `SESSION_SECRET=<random-string>`
4. Deploy (auto-deploys on push to main)

### Frontend (Vercel)

1. Connect GitHub repo
2. Set root directory: `frontend/`
3. Set environment variable:
   - `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy (auto-deploys on push to main)

**Live Demo:**
- Backend: https://taskmaster-a-simple-task-management-app.onrender.com
- Frontend: https://task-master-a-simple-task-management-7v04ickra.vercel.app

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=aggimallaabhishek
DB_PASSWORD=
DB_NAME=taskmaster
SESSION_SECRET=your-secret-key-change-in-production
GOOGLE_CLIENT_ID=          # Optional for dev mode
GOOGLE_CLIENT_SECRET=      # Optional for dev mode
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
```

**See `.env.example` files for full descriptions.**

---

## 📊 Performance

### Frontend
- Bundle size: ~200KB (Vite optimized)
- First load: <1 second
- Tests run: ~1.4s

### Backend
- Health check: <50ms
- GET /tasks: ~100-200ms
- POST /tasks: ~150-250ms
- Tests run: ~0.4s

**Optimization tips in [DEVELOPMENT.md](DEVELOPMENT.md)**

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 already in use | Kill process: `lsof -i :5000` |
| CORS errors | Check `allowedOrigins` in backend/server.js |
| Database connection failed | Verify PostgreSQL running, DB_* variables set |
| 401 Unauthorized | Check session cookie, try logout/login |
| Tests failing | Run `npm install` in failing directory |

**See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed troubleshooting**

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [API.md](backend/API.md) | Complete API reference with examples |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Architecture, how to add features, debugging |
| [PHASE3_SUMMARY.md](PHASE3_SUMMARY.md) | Test coverage and results |
| [DATABASE.md](backend/DATABASE.md) | Database schema and structure |

---

## 🗺️ Roadmap

**Completed (60%):**
- ✅ Phase 1: STABILIZE - Critical fixes, DB init, session persistence
- ✅ Phase 2: REFACTOR - Modular components, custom hooks, API client
- ✅ Phase 3: TESTING - 72 tests, coverage reporting, CI/CD enhanced

**In Progress:**
- 🔄 Phase 4: DOCUMENTATION - API docs, setup guides (60% done)

**Pending (40%):**
- ⏳ Phase 5: ENHANCEMENTS - User profiles, advanced filters, dashboard

---

## 💡 Tech Stack

**Frontend:**
- React 18
- Vite 7.3 (bundler)
- Vitest 4.1 (testing)
- React Testing Library 16.3

**Backend:**
- Express.js 4.18
- PostgreSQL 8+
- Passport.js (authentication)
- Jest 29.7 (testing)

**DevOps:**
- GitHub Actions (CI/CD)
- Render (backend hosting)
- Vercel (frontend hosting)
- Docker (local development)

---

## 👥 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes and test: `npm test`
4. Commit: `git commit -am 'Add feature'`
5. Push: `git push origin feature/my-feature`
6. Create Pull Request

**Code guidelines:**
- Follow existing code style
- Add tests for new features
- Ensure all tests pass
- Update documentation

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🤝 Support

- Check [DEVELOPMENT.md](DEVELOPMENT.md) for help
- Review [API.md](backend/API.md) for endpoint questions
- See [PHASE3_SUMMARY.md](PHASE3_SUMMARY.md) for test details
- Open GitHub issue for bugs or feature requests

---

## ✨ Key Achievements

✅ **Architecture:** Modular components, clean separation of concerns
✅ **Testing:** 72 tests with ~70% coverage on critical paths
✅ **Performance:** <2s test execution, optimized bundle size
✅ **Quality:** 100% test pass rate, comprehensive error handling
✅ **DevX:** Clear documentation, easy setup, fast development cycle
✅ **Security:** User isolation, secure sessions, OAuth 2.0 integration

---

**Last Updated:** March 28, 2026 | **Phase:** 3 Complete | **Progress:** 60%
