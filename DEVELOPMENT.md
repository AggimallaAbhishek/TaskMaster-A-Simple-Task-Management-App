# TaskMaster Development Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Adding Features](#adding-features)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Performance Tips](#performance-tips)
9. [Deployment](#deployment)

---

## Project Overview

**TaskMaster** is a full-stack task management application demonstrating modern web development practices:
- React 18 frontend with Vite bundler
- Express.js backend with PostgreSQL
- Google OAuth 2.0 authentication
- Session-based user management
- Comprehensive test suite (72 tests)
- GitHub Actions CI/CD pipeline

**Status:** Phase 3 Complete - Testing & QA (60% of roadmap complete)

---

## Architecture

### System Design

```
User Browser (React App)
        ↓ HTTPS/HTTP
   Frontend (React 18 + Vite)
     - Modular components
     - Custom hooks for logic
     - Centralized API client
        ↓ REST API calls
   Backend (Express.js)
     - Session middleware
     - Google OAuth 2.0
     - RESTful endpoints
        ↓ SQL queries
   PostgreSQL Database
     - users table
     - tasks table
     - session table
```

### Data Flow

1. **Authentication:**
   - User clicks "Login with Google"
   - Frontend redirects to `/auth/google`
   - Backend initiates Google OAuth flow
   - Google redirects back with auth code
   - Backend creates session, stores in PostgreSQL
   - Frontend retrieves user via `/auth/user`

2. **Task Operations:**
   - Frontend component makes API request
   - Backend middleware checks session
   - Backend queries database (user-scoped)
   - Response sent to frontend
   - Frontend re-renders with new data

3. **User Isolation:**
   - Every task query includes `WHERE user_id = $1`
   - Database enforces foreign key constraints
   - Users cannot access other users' data

---

## Project Structure

### Frontend (`frontend/`)

```
src/
├── App.jsx                          # Main app component (180 lines)
├── api/
│   ├── client.js                    # Centralized API wrapper (65 lines)
│   └── __tests__/
│       └── client.test.js           # 8 tests
├── hooks/
│   ├── useAuth.js                   # Auth logic (50 lines)
│   ├── useTasks.js                  # Task CRUD (110 lines)
│   ├── useFilter.js                 # Filtering/sorting (80 lines)
│   └── __tests__/                   # 21 tests
├── components/
│   ├── Auth/
│   │   ├── AuthPanel.jsx            # Login/logout UI (52 lines)
│   │   └── __tests__/
│   ├── Tasks/
│   │   ├── TaskForm.jsx             # Create form (85 lines)
│   │   ├── TaskList.jsx             # Task list (130 lines)
│   │   ├── TaskItem.jsx             # Single task (180 lines)
│   │   └── __tests__/
│   ├── Filters/
│   │   ├── FilterPanel.jsx          # Filter controls (105 lines)
│   │   └── __tests__/
│   ├── ErrorBoundary.jsx            # Error handling (70 lines)
│   └── __tests__/
├── styles/
│   ├── index.css                    # Global styles
│   └── theme.js                     # Colors, constants (85 lines)
└── __tests__/
    └── setup.js                     # Test configuration
```

**Key Design Principles:**
- Small, focused components (each under 200 lines)
- Custom hooks extract business logic
- Centralized API client prevents duplication
- Theme file for consistent styling
- Mock-based unit tests for speed

### Backend (`backend/`)

```
├── server.js                        # Express app (429 lines)
│   ├── Configuration (middleware, session)
│   ├── Authentication (Passport, OAuth)
│   ├── Database initialization
│   ├── Routes (GET/POST/PUT/DELETE)
│   └── Error handling
├── test/
│   ├── setup.js                     # Test database setup
│   └── app.test.js                  # 15 tests
├── .env.example                     # Environment template
├── package.json                     # Dependencies, scripts
└── DATABASE.md                      # Schema documentation
```

**Key Design Principles:**
- Single Express instance (monolithic, simple to deploy)
- Middleware-based architecture (CORS, session, auth)
- Database queries include user isolation (`WHERE user_id = $1`)
- Error handling on all endpoints
- Session stored in PostgreSQL

### Configuration Files

```
.env.example                         # Root env template
backend/.env.example                 # Backend config
frontend/.env.example                # Frontend config
.github/workflows/ci-cd.yml          # GitHub Actions pipeline
docker-compose.yml                   # Local development
package.json                         # Root-level scripts
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (check with `node --version`)
- npm 9+ (check with `npm --version`)
- PostgreSQL 8+ (local or Docker)
- Git

### Local Setup (5 minutes)

**1. Clone and Install:**
```bash
git clone https://github.com/your-repo/TaskMaster.git
cd TaskMaster

# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

**2. Database Setup:**

**Option A: Using Docker Compose (easiest)**
```bash
docker-compose up -d
# Creates PostgreSQL container on port 5432
```

**Option B: Manual PostgreSQL**
```bash
# Create database
createdb taskmaster

# The backend will auto-create tables on startup
```

**3. Environment Variables:**
```bash
# Copy templates to .env files
cp .env.example backend/.env
cp frontend/.env.example frontend/.env

# Update backend/.env if needed
# Set DB_HOST, DB_PORT, DB_USER, etc.
```

**4. Start Development Servers:**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server at http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App at http://localhost:5173
```

**5. Access the App:**
- Open http://localhost:5173 in browser
- Click "Login with Google" (uses mock auth in dev)
- Create tasks!

---

## Adding Features

### Adding a New Task Field

**Example: Adding a `reminder` field (boolean)**

#### 1. Database Schema
Edit `backend/server.js`, in `initializeDatabase()`:

```javascript
// In the CREATE TABLE tasks section:
await pool.query(`
    CREATE TABLE tasks (
        ...
        reminder BOOLEAN DEFAULT FALSE,
        ...
    )
`);
```

#### 2. Backend API
Update `POST /api/tasks` and `PUT /api/tasks/:id`:

```javascript
app.post('/api/tasks', ensureAuthenticated, async (req, res) => {
    const { title, completed, priority, category, dueDate, reminder } = req.body;

    const result = await pool.query(
        'INSERT INTO tasks (..., reminder) VALUES (..., $7) RETURNING *',
        [..., reminder || false]
    );
    ...
});
```

#### 3. Frontend Components
Update `TaskForm.jsx`:

```jsx
const [reminder, setReminder] = useState(false);

<input
    type="checkbox"
    checked={reminder}
    onChange={(e) => setReminder(e.target.checked)}
    placeholder="Set reminder"
/>
```

Update `TaskItem.jsx` to display reminder badge.

#### 4. API Client
Update `frontend/src/api/client.js` if needed (usually automatic via JSON).

#### 5. Tests
Add tests for new field:

```javascript
// backend/test/app.test.js
it('should create task with reminder', async () => {
    const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task', reminder: true });

    expect(res.body.reminder).toBe(true);
});

// frontend/src/components/Tasks/__tests__/TaskForm.test.jsx
it('should toggle reminder checkbox', async () => {
    ...
    const checkbox = screen.getByLabelText('Set reminder');
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
});
```

---

### Adding a New Component

**Example: Adding TaskStats component**

#### 1. Create Component File
`frontend/src/components/Dashboard/Stats.jsx`:

```jsx
export const Stats = ({ tasks }) => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    return (
        <div className="stats">
            <div>Total: {total}</div>
            <div>Completed: {completed}</div>
            <div>Pending: {pending}</div>
        </div>
    );
};
```

#### 2. Add Tests
`frontend/src/components/Dashboard/__tests__/Stats.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import { Stats } from '../Stats';

describe('Stats Component', () => {
    it('should display task statistics', () => {
        const tasks = [
            { id: 1, completed: true },
            { id: 2, completed: false },
        ];

        render(<Stats tasks={tasks} />);

        expect(screen.getByText('Total: 2')).toBeInTheDocument();
        expect(screen.getByText('Completed: 1')).toBeInTheDocument();
        expect(screen.getByText('Pending: 1')).toBeInTheDocument();
    });
});
```

#### 3. Integrate into App
Update `App.jsx`:

```jsx
import { Stats } from './components/Dashboard/Stats';

// In App component:
<Stats tasks={tasks} />
```

---

### Adding a Backend Endpoint

**Example: Adding `GET /api/tasks/stats`**

#### 1. Add Endpoint
In `backend/server.js`:

```javascript
app.get('/api/tasks/stats', ensureAuthenticated, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed,
                COUNT(DISTINCT priority) as priority_count
            FROM tasks
            WHERE user_id = $1
        `, [req.user.id]);

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
```

#### 2. Add Tests
In `backend/test/app.test.js`:

```javascript
it('should return task statistics', async () => {
    const res = await request(app).get('/api/tasks/stats');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('completed');
});
```

#### 3. Update API Client
In `frontend/src/api/client.js`:

```javascript
async getTaskStats() {
    return this.request('/api/tasks/stats');
}
```

#### 4. Use in Frontend
In `App.jsx` or custom hook:

```jsx
const stats = await apiClient.getTaskStats();
console.log(`Total: ${stats.total}, Completed: ${stats.completed}`);
```

---

## Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage report

# Frontend tests
cd frontend
npm test                    # Run all tests
npm test:ui                 # Interactive UI
npm test:coverage          # With coverage report
```

### Test Structure

**Frontend:**
- Components: `src/components/**/__tests__/*.test.jsx`
- Hooks: `src/hooks/__tests__/*.test.js`
- API: `src/api/__tests__/client.test.js`

**Backend:**
- Integration: `test/app.test.js`

### Writing Tests

**Frontend Component Test:**
```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '../TaskForm';

describe('TaskForm', () => {
    it('should update title input', async () => {
        const user = userEvent.setup();
        render(<TaskForm onSubmit={vi.fn()} />);

        const input = screen.getByPlaceholderText('Task title');
        await user.type(input, 'New task');

        expect(input.value).toBe('New task');
    });
});
```

**Backend Test:**
```javascript
it('should create task', async () => {
    const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test' });

    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toEqual('Test');
});
```

### Coverage Goals

- Frontend: >70% on critical paths (auth, CRUD, filtering)
- Backend: >80% on API endpoints
- Focus on happy path + error cases, skip UI edge cases

---

## Debugging

### Backend Debugging

**Enable Request Logging:**
Already enabled in `server.js` with `console.log` statements.

**Check Database Directly:**
```bash
# Connect to PostgreSQL
psql taskmaster

# View tables
\dt

# Query tasks
SELECT * FROM tasks;
SELECT * FROM users;
SELECT * FROM session;
```

**Common Issues:**

| Problem | Cause | Solution |
|---------|-------|----------|
| Tasks not showing | User ID mismatch | Check `req.user.id` logs |
| 404 on tasks | Server not running | `npm run dev` in backend/ |
| CORS errors | Frontend URL not in allowlist | Update `allowedOrigins` in server.js |
| Session lost | PostgreSQL connection failed | Check DB_CONNECTION_STRING |

### Frontend Debugging

**React DevTools:**
- Install React DevTools browser extension
- Inspect component state, props, renders

**Vite Debug:**
Enable with environment variable:
```bash
DEBUG=* npm run dev
```

**Network Inspection:**
- Open DevTools → Network tab
- Check API requests/responses
- Look for 401 (auth) or 404 (not found) errors

**Common Issues:**

| Problem | Cause | Solution |
|---------|-------|----------|
| API 401 Unauthorized | Not authenticated | Check session cookie |
| Tasks list empty | Filter too strict | Reset filters |
| Buttons not working | Async operation hung | Check browser console |
| Styles not loading | CSS file missing | Check `frontend/src/styles/` |

### VS Code Debugging Setup

**1. Install Debugger:**
```bash
npm install -D vite-inspector
```

**2. Update `backend/.babelrc`:**
```json
{
  "presets": [["@babel/preset-env", { "targets": { "node": "18" } }]]
}
```

**3. Debug Configuration (`launch.json`):**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend",
      "cwd": "${workspaceFolder}/backend",
      "program": "${workspaceFolder}/backend/server.js",
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

---

## Performance Tips

### Frontend Optimization

1. **Memoization:**
   ```jsx
   const tasks = useMemo(() => {
       return filteredTasks.sort(...);
   }, [filteredTasks]);
   ```

2. **Code Splitting:**
   ```jsx
   const StatsComponent = React.lazy(() => import('./Stats'));
   ```

3. **Avoid Re-renders:**
   - Use `useCallback` for stable function references
   - Memoize expensive computations

4. **Network Optimization:**
   - Batch API calls when possible
   - Cache responses with custom hooks

### Backend Optimization

1. **Database Indexing:**
   ```sql
   CREATE INDEX idx_tasks_user_id ON tasks(user_id);
   CREATE INDEX idx_tasks_completed ON tasks(completed);
   ```

2. **Query Optimization:**
   - Use `SELECT *` only when needed
   - Add `LIMIT` for pagination

3. **Connection Pooling:**
   - Already configured in `server.js` via `Pool`
   - Default: min 2, max 10 connections

---

## Deployment

### Backend (Render.com)

1. Connect GitHub repository
2. Create new Web Service
3. Set environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL=postgresql://...`
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - `SESSION_SECRET` (use strong random value)
4. Deploy

**Production Checklist:**
- [ ] Environment variables set
- [ ] Database migrated and tables created
- [ ] Google OAuth credentials configured
- [ ] CORS whitelist updated with frontend URL
- [ ] Tests passing
- [ ] No console.log statements for sensitive data

### Frontend (Vercel)

1. Connect GitHub repository
2. Select `frontend/` as root directory
3. Set environment variables:
   - `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy

**Production Checklist:**
- [ ] Environment variables set
- [ ] Backend API URL correct
- [ ] Build succeeds locally (`npm run build`)
- [ ] No API keys committed to repo

---

## Useful Commands

### Development
```bash
npm run dev              # Start all servers (root)
cd backend && npm run dev      # Backend only
cd frontend && npm run dev     # Frontend only
```

### Testing
```bash
npm test                 # Run tests from respective directory
npm run test:coverage    # Coverage report (frontend)
```

### Building
```bash
cd frontend && npm run build   # Production build
npm run build                  # Preview build
```

### Database
```bash
docker-compose up        # Start PostgreSQL
docker-compose down      # Stop PostgreSQL
```

---

## Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [PostgreSQL Manual](https://www.postgresql.org/docs)
- [Vite Guide](https://vitejs.dev)
- [Vitest Documentation](https://vitest.dev)

---

## Support

For questions or issues:
1. Check existing GitHub issues
2. Review code comments in relevant files
3. Refer to `backend/API.md` for endpoint details
4. Check `PHASE3_SUMMARY.md` for test details
