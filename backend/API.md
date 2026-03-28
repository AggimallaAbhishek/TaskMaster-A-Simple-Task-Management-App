# TaskMaster API Documentation

## Base URL
- **Development:** `http://localhost:5000`
- **Production:** `https://taskmaster-a-simple-task-management-app.onrender.com`

## Authentication
All protected endpoints require authentication via session cookies. The `/auth/user` endpoint can be used to verify the current session state.

---

## Endpoints

### Health & Status

#### GET `/health`
Basic health check endpoint for Render.com uptime monitoring.

**Response:**
```json
{
  "status": "OK",
  "service": "TaskMaster Backend",
  "timestamp": "2026-03-28T11:10:57.004Z"
}
```

#### GET `/api/health`
API-specific health check with version information.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-03-28T11:10:57.004Z",
  "version": "1.0.0"
}
```

---

### Authentication

#### GET `/auth/google`
Initiates Google OAuth 2.0 authentication flow.

**Query Parameters:** None

**Redirect:** Redirects to Google's OAuth consent screen

**Note:** This endpoint requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables.

---

#### GET `/auth/google/callback`
Google OAuth callback endpoint (handled automatically by Passport.js).

**Triggered by:** Google after user grant

**Redirect:** Redirects to `http://localhost:5173/` on success

**Session:** Automatically creates session cookie

---

#### GET `/auth/user`
Retrieve current authenticated user information.

**Authentication:** Required ✓

**Response (Authenticated):**
```json
{
  "id": 1,
  "username": "John Doe",
  "email": "john@example.com",
  "picture": "https://example.com/photo.jpg"
}
```

**Response (Not Authenticated):**
```json
{
  "error": "Not authenticated"
}
```

**Status Codes:**
- `200` - User authenticated
- `401` - Not authenticated

---

#### GET `/auth/logout`
Terminates the current session and logs out the user.

**Authentication:** Required ✓

**Behavior:**
- Destroys session cookie
- Redirects to `/`

**Response:** Redirect response

---

### Tasks

#### GET `/api/tasks`
Retrieve all tasks for the authenticated user.

**Authentication:** Required ✓

**Query Parameters:** None

**Response:**
```json
[
  {
    "id": 1,
    "title": "Complete project documentation",
    "completed": false,
    "priority": "high",
    "category": "work",
    "due_date": "2026-04-15T00:00:00.000Z",
    "user_id": 1,
    "created_at": "2026-03-28T11:10:57.004Z",
    "updated_at": "2026-03-28T11:10:57.004Z"
  },
  {
    "id": 2,
    "title": "Review pull requests",
    "completed": true,
    "priority": "medium",
    "category": "work",
    "due_date": null,
    "user_id": 1,
    "created_at": "2026-03-27T10:20:00.000Z",
    "updated_at": "2026-03-28T09:15:30.000Z"
  }
]
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

#### POST `/api/tasks`
Create a new task for the authenticated user.

**Authentication:** Required ✓

**Request Body:**
```json
{
  "title": "Learn TypeScript",
  "priority": "high",
  "category": "learning",
  "dueDate": "2026-04-30T00:00:00.000Z",
  "completed": false
}
```

**Required Fields:**
- `title` (string, 1-255 characters, non-empty after trim)

**Optional Fields:**
- `priority` (string, default: `"medium"`)
  - Valid values: `"low"`, `"medium"`, `"high"`
- `category` (string, default: `"general"`)
- `dueDate` (ISO 8601 timestamp or null)
- `completed` (boolean, default: `false`)

**Response (Success):**
```json
{
  "id": 3,
  "title": "Learn TypeScript",
  "completed": false,
  "priority": "high",
  "category": "learning",
  "due_date": "2026-04-30T00:00:00.000Z",
  "user_id": 1,
  "created_at": "2026-03-28T11:25:14.000Z",
  "updated_at": "2026-03-28T11:25:14.000Z"
}
```

**Status Codes:**
- `201` - Created
- `400` - Bad request (missing/empty title)
- `401` - Unauthorized
- `500` - Server error

---

#### PUT `/api/tasks/:id`
Update an existing task (partial update - only provided fields are updated).

**Authentication:** Required ✓

**URL Parameters:**
- `id` (number) - Task ID

**Request Body:**
```json
{
  "title": "Updated task title",
  "completed": true,
  "priority": "low",
  "category": "updated-category",
  "dueDate": "2026-05-15T00:00:00.000Z"
}
```

**Fields:**
- All fields optional
- At least one field must be provided
- `title` cannot be empty after trim

**Response (Success):**
```json
{
  "id": 3,
  "title": "Updated task title",
  "completed": true,
  "priority": "low",
  "category": "updated-category",
  "due_date": "2026-05-15T00:00:00.000Z",
  "user_id": 1,
  "created_at": "2026-03-28T11:25:14.000Z",
  "updated_at": "2026-03-28T11:30:45.000Z"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (no fields, empty title, etc.)
- `401` - Unauthorized
- `404` - Task not found or unauthorized
- `500` - Server error

---

#### DELETE `/api/tasks/:id`
Delete a task permanently.

**Authentication:** Required ✓

**URL Parameters:**
- `id` (number) - Task ID

**Response (Success):**
```json
{
  "message": "Task deleted successfully",
  "task": {
    "id": 3,
    "title": "Updated task title",
    "completed": true,
    "priority": "low",
    "category": "updated-category",
    "due_date": "2026-05-15T00:00:00.000Z",
    "user_id": 1,
    "created_at": "2026-03-28T11:25:14.000Z",
    "updated_at": "2026-03-28T11:30:45.000Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Task not found or unauthorized
- `500` - Server error

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error description"
}
```

### Common Error Cases

**400 Bad Request - Missing Title:**
```json
{
  "error": "Task title is required"
}
```

**400 Bad Request - No Update Fields:**
```json
{
  "error": "At least one field must be provided for update"
}
```

**404 Not Found:**
```json
{
  "error": "Task not found or unauthorized"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## CORS Headers

All responses include CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Credentials: true
```

---

## Session Management

### Session Storage
- **Store:** PostgreSQL (via connect-pg-simple)
- **Cookie Name:** `connect.sid`
- **Max Age:** 24 hours
- **Secure Flag:** Enabled in production (HTTPS only)
- **SameSite:** Default (Lax)

### Session Persistence
Sessions are stored in the PostgreSQL `session` table and persist across server restarts.

---

## Rate Limiting

Currently not implemented. Recommended for production deployment.

---

## Pagination

Currently not implemented. All tasks returned in single response. Recommended for future enhancement.

---

## Data Constraints

### Task Fields
- `title`: 1-255 characters, trimmed, required
- `completed`: boolean, default false
- `priority`: one of `low`, `medium`, `high`; default `medium`
- `category`: string, default `general`
- `due_date`: ISO 8601 timestamp or null
- `user_id`: integer, automatically set from authenticated user

### User Isolation
Users can only see, modify, or delete their own tasks. The `user_id` field is automatically enforced via database constraints.

---

## Examples

### Complete Task Creation Flow

**1. Login:**
```bash
curl -L http://localhost:5000/auth/google
# Browser redirects to Google OAuth, user grants permission
# Session cookie created
```

**2. Create Task:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "title": "Buy groceries",
    "priority": "high",
    "category": "personal",
    "dueDate": "2026-03-31T17:00:00Z"
  }'
```

**3. Get Tasks:**
```bash
curl http://localhost:5000/api/tasks \
  -b cookies.txt
```

**4. Update Task:**
```bash
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "completed": true
  }'
```

**5. Delete Task:**
```bash
curl -X DELETE http://localhost:5000/api/tasks/1 \
  -b cookies.txt
```

**6. Logout:**
```bash
curl http://localhost:5000/auth/logout \
  -b cookies.txt \
  -L
```

---

## Testing Endpoints

For local testing without OAuth, use cURL or Postman:

```bash
# Health check (no auth required)
curl http://localhost:5000/api/health

# Get tasks (uses mock auth in dev mode)
curl http://localhost:5000/api/tasks

# Create task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task"}'
```

---

## Environment Variables

Backend requires these environment variables (see `.env.example`):

```
NODE_ENV=development              # development or production
PORT=5000                         # Express server port
DB_HOST=localhost                 # PostgreSQL host
DB_PORT=5432                      # PostgreSQL port
DB_USER=aggimallaabhishek         # PostgreSQL user
DB_PASSWORD=                      # PostgreSQL password
DB_NAME=taskmaster                # Database name
SESSION_SECRET=your-secret-key    # Session encryption key
GOOGLE_CLIENT_ID=                 # Optional: Google OAuth ID
GOOGLE_CLIENT_SECRET=             # Optional: Google OAuth secret
```

---

## Deployment

### Production Considerations

1. **Environment Variables:** Set all required variables in deployment platform
2. **Database:** Use managed PostgreSQL service (Render, AWS RDS, etc.)
3. **Session Storage:** Sessions automatically use PostgreSQL
4. **HTTPS:** Enable in production for secure sessions
5. **CORS:** Update `allowedOrigins` in `server.js` for production frontend URL
6. **Google OAuth:** Register application in Google Cloud Console

### Deployment Platforms

**Backend:**
- Render.com (recommended - auto-deploys from GitHub)
- Heroku
- AWS Lambda (requires architectural changes)

**Frontend:**
- Vercel (recommended - auto-deploys from GitHub)
- Netlify
- GitHub Pages (static only)

---

## Support & Issues

For issues, questions, or API improvements, refer to:
- `README.md` - Setup and overview
- `DEVELOPMENT.md` - Architecture and codebase guide
- Backend code: `backend/server.js`
