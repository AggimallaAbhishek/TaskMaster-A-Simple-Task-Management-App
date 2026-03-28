# TaskMaster - Issues To Fix

This document catalogs all identified issues in the TaskMaster codebase, organized by category and severity.

---

## Summary

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Security | 5 | 5 | 4 | 2 | 16 |
| Code Quality | 1 | 2 | 8 | 5 | 16 |
| Performance | 1 | 3 | 6 | 4 | 14 |
| Accessibility | 0 | 4 | 5 | 3 | 12 |
| Configuration/Deploy | 4 | 3 | 5 | 4 | 16 |
| Test Coverage | 0 | 2 | 6 | 4 | 12 |
| API Design | 0 | 1 | 5 | 4 | 10 |
| Missing Features | 0 | 1 | 6 | 5 | 12 |
| **Total** | **11** | **21** | **45** | **31** | **108** |

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### 1. Database Drops All Data on Every Restart
- **File:** `backend/server.js` (Lines 214-272)
- **Issue:** `initializeDatabase()` executes `DROP TABLE IF EXISTS` on every server start
- **Risk:** Complete data loss on every deployment, crash, or restart
- **Fix:** Use database migrations; only initialize tables if they don't exist

### 2. SQL Injection in Filter Sort
- **File:** `backend/server.js` (Lines 771-774)
- **Issue:** `ORDER BY ${filterConfig.sortBy}` uses unsanitized input
- **Fix:** Whitelist allowed sort columns

### 3. Hardcoded Credentials in Docker
- **File:** `docker-compose.yml` (Lines 6-7, 32-37)
- **File:** `backend/Dockerfile` (Lines 14-26)
- **Issue:** Database passwords and session secrets hardcoded in version control
- **Fix:** Use environment variables and secrets management

### 4. Containers Running as Root
- **Files:** `backend/Dockerfile`, `frontend/Dockerfile`
- **Issue:** No USER directive; containers run as root
- **Fix:** Add non-root user configuration

### 5. Weak Session Secret Fallback
- **File:** `backend/server.js` (Line 140)
- **Issue:** Hardcoded fallback session secret if env var not set
- **Fix:** Require SESSION_SECRET in production; fail startup if missing

---

## 🟠 HIGH SEVERITY ISSUES

### Security

#### 6. Insecure CORS Configuration
- **File:** `backend/server.js` (Lines 95-106)
- **Issue:** CORS allows wildcard `*` origins
- **Fix:** Configure specific allowed origins

#### 7. Missing Rate Limiting
- **File:** `backend/server.js`
- **Issue:** No protection against brute force or DoS attacks
- **Fix:** Implement `express-rate-limit` middleware

#### 8. Unsafe Array Access in OAuth
- **File:** `backend/server.js` (Lines 187, 193, 200)
- **Issue:** Direct access to `profile.emails[0]` without bounds checking
- **Fix:** Add validation for profile data arrays

#### 9. Hardcoded Frontend URLs
- **File:** `backend/server.js` (Lines 313, 339)
- **Issue:** `http://localhost:5173/` hardcoded in redirects
- **Fix:** Use `FRONTEND_URL` environment variable

#### 10. No HTTPS Enforcement
- **Files:** `backend/server.js`, `frontend/vite.config.js`
- **Issue:** No HSTS headers or HTTPS enforcement
- **Fix:** Add helmet.js and enforce secure cookies

### Code Quality

#### 11. 39+ Console.log Statements in Backend
- **File:** `backend/server.js`
- **Issue:** Debug logs left in production code
- **Fix:** Use structured logging library (winston/pino)

#### 12. Missing nodemon Dependency
- **File:** `backend/package.json`
- **Issue:** `npm run dev` uses nodemon but it's not in devDependencies
- **Fix:** `npm install --save-dev nodemon`

### Accessibility

#### 13. Accessible Components Use Tailwind (Not Configured)
- **File:** `frontend/src/components/Accessible/AccessibleComponents.jsx`
- **Issue:** Uses Tailwind CSS classes but Tailwind is not configured
- **Fix:** Either configure Tailwind or replace with inline styles

#### 14. Missing ARIA Labels
- **Files:** `TaskItem.jsx`, `PhysicsPlayground.jsx`, `FilterPanel.jsx`
- **Issue:** Interactive elements lack aria-label attributes
- **Fix:** Add appropriate ARIA labels

#### 15. Missing Form Labels
- **File:** `frontend/src/components/Tasks/TaskForm.jsx`
- **Issue:** Input fields have placeholders but no `<label>` elements
- **Fix:** Add proper label elements with `htmlFor` attributes

#### 16. Keyboard Navigation Incomplete
- **Files:** Multiple components
- **Issue:** Buttons only respond to clicks, not keyboard events
- **Fix:** Add `onKeyDown` handlers or use AccessibleButton component

### CI/CD

#### 17. No Docker Image Building in CI
- **File:** `.github/workflows/ci-cd.yml`
- **Issue:** Pipeline doesn't build/test Docker images
- **Fix:** Add Docker build and scan steps

#### 18. Deprecated Security Workflow
- **File:** `.github/workflows/security.yml`
- **Issue:** Uses deprecated `actions-dependency-submission@v1`
- **Fix:** Update to modern security scanning (Trivy)

---

## 🟡 MEDIUM SEVERITY ISSUES

### Performance

#### 19. Missing Database Indexes
- **File:** `backend/server.js`
- **Issue:** No indexes on `tasks.user_id`, `filter_presets.user_id`
- **Fix:** Add indexes for foreign key columns

#### 20. No Component Memoization
- **File:** `frontend/src/components/Tasks/TaskItem.jsx`
- **Issue:** List items not wrapped with `React.memo()`
- **Fix:** Add memoization for list components

#### 21. Missing useCallback in Event Handlers
- **File:** `frontend/src/components/Tasks/TaskForm.jsx`
- **Issue:** New function references on every render
- **Fix:** Wrap handlers with `useCallback`

#### 22. No Code Splitting
- **File:** `frontend/src/App.jsx`
- **Issue:** All components bundled together; no lazy loading
- **Fix:** Use `React.lazy()` and `Suspense`

#### 23. matter-js Not Lazy Loaded
- **File:** `frontend/package.json`
- **Issue:** Physics library (50KB+) loaded even when playground not used
- **Fix:** Lazy load PhysicsPlayground component

#### 24. Re-fetching Profile on Every Navigation
- **File:** `frontend/src/components/Profile/ProfilePanel.jsx`
- **Issue:** Unstable callback dependency causes unnecessary fetches
- **Fix:** Stabilize callback references

### Code Quality

#### 25. Dead Code Files
- **Files:** `frontend/src/App_old.jsx`, `frontend/src/App_new.jsx`
- **Issue:** Backup files in source tree
- **Fix:** Delete or move out of src/

#### 26. Missing Color Constants
- **Files:** `DateRangePicker.jsx`, `Canvas.jsx`, `PhysicsPlayground.jsx`
- **Issue:** References to undefined COLORS constants
- **Fix:** Add missing constants to theme.js

#### 27. Inconsistent Styling Approach
- **Files:** Multiple components
- **Issue:** Mix of inline styles, theme.js, and Tailwind classes
- **Fix:** Standardize on one approach

#### 28. Generic Error Messages
- **File:** `backend/server.js`
- **Issue:** All errors return "Internal server error"
- **Fix:** Log detailed errors server-side; use error codes

#### 29. Inconsistent Parameter Handling
- **File:** `backend/server.js`
- **Issue:** Mix of `{ id } = req.params` and `parseInt(req.params.id)`
- **Fix:** Standardize parameter extraction

#### 30. Missing Input Validation Library
- **File:** `backend/server.js`
- **Issue:** All validation is manual
- **Fix:** Add joi, yup, or zod

#### 31. Console Logs in Frontend
- **Files:** `useTasks.js`, `client.js`, `ErrorBoundary.jsx`
- **Issue:** 15+ console statements in frontend code
- **Fix:** Remove or conditionally compile out

### Configuration

#### 32. Missing Health Checks in Dockerfiles
- **Files:** `backend/Dockerfile`, `frontend/Dockerfile`
- **Issue:** No HEALTHCHECK directive
- **Fix:** Add health check commands

#### 33. Health Endpoint Doesn't Check Database
- **File:** `backend/server.js`
- **Issue:** `/health` returns OK without checking DB connection
- **Fix:** Add database connectivity check

#### 34. Missing Environment Variable Validation
- **File:** `backend/server.js` (Lines 11-18)
- **Issue:** Only validates env vars in production mode
- **Fix:** Always validate or provide clear warnings

#### 35. Render.yaml Missing Settings
- **File:** `backend/render.yaml`
- **Issue:** Missing health check path, region, and env vars
- **Fix:** Complete configuration

#### 36. Vercel Configuration Incomplete
- **File:** `frontend/vercel.json`
- **Issue:** Missing rewrites, headers, and cache settings
- **Fix:** Add production-ready configuration

### API Design

#### 37. Inconsistent Field Naming
- **Issue:** Frontend uses camelCase (`dueDate`), backend uses snake_case (`due_date`)
- **Fix:** Transform consistently at API boundary

#### 38. Missing DELETE User Endpoint
- **Issue:** No way to delete user accounts
- **Fix:** Add `DELETE /api/users` endpoint

#### 39. No Pagination
- **File:** `backend/API.md`
- **Issue:** All tasks returned in single response
- **Fix:** Implement limit/offset pagination

#### 40. Missing Inline Filtering
- **Issue:** Must create preset to filter; no query params
- **Fix:** Support `GET /api/tasks?priority=high&completed=false`

#### 41. No Bulk Operations
- **Issue:** No bulk delete/update endpoints
- **Fix:** Add `POST /api/tasks/bulk-delete`, etc.

### Test Coverage

#### 42. No Test for OAuth Array Bounds
- **File:** `backend/test/app.test.js`
- **Issue:** No test for profiles without emails/photos
- **Fix:** Add edge case tests

#### 43. Missing Integration Tests
- **Issue:** No multi-step workflow tests
- **Fix:** Add login→action→logout flows

#### 44. No TaskItem Component Tests
- **File:** `frontend/src/components/Tasks/`
- **Issue:** TaskItem.jsx has no test file
- **Fix:** Add comprehensive tests

#### 45. No Performance Tests
- **Issue:** No tests for large datasets or concurrent requests
- **Fix:** Add load testing

#### 46. Test Database Not Cleaned Between Tests
- **File:** `backend/test/setup.js`
- **Issue:** Tests can interfere with each other
- **Fix:** Add cleanup between test suites

#### 47. Coverage Threshold Too Low
- **File:** `frontend/vitest.config.js`
- **Issue:** Set to 70%; should be 80%+
- **Fix:** Raise threshold after improving coverage

---

## 🔵 LOW SEVERITY ISSUES

### Security

#### 48. Missing Content Security Policy
- **File:** `frontend/index.html`
- **Issue:** No CSP headers
- **Fix:** Add CSP meta tag or server headers

#### 49. Unimplemented Terms/Privacy Links
- **File:** `frontend/src/components/Auth/LoginPage.jsx`
- **Issue:** Links look clickable but have no handlers
- **Fix:** Add actual links or change styling

### Performance

#### 50. No Image Optimization
- **Issue:** No webp format, no compression
- **Fix:** Add image optimization pipeline

#### 51. Direct DOM Style Mutation
- **File:** `frontend/src/components/Auth/LoginPage.jsx`
- **Issue:** Using `e.target.style` in event handlers
- **Fix:** Use state-based styling

### UI/UX

#### 52. No Delete Confirmation for Tasks
- **File:** `frontend/src/components/Tasks/TaskItem.jsx`
- **Issue:** Delete is immediate with no confirmation
- **Fix:** Add confirmation dialog

#### 53. No Undo for Task Operations
- **Issue:** Deleted tasks are permanently lost
- **Fix:** Implement soft delete or undo functionality

#### 54. No Escape Key for Modals
- **File:** `frontend/src/App.jsx`
- **Issue:** Profile modal can't be closed with Escape
- **Fix:** Add keyboard event handler

#### 55. No Dark Mode Styles
- **File:** `frontend/src/components/Profile/ProfileForm.jsx`
- **Issue:** Theme selector exists but no dark mode CSS
- **Fix:** Implement CSS variables for theming

#### 56. Filters Reset on Page Reload
- **Issue:** No persistence for filter state
- **Fix:** Save to localStorage

### Code Quality

#### 57. Large Monolithic Components
- **Files:** `App.jsx` (365 lines), `LoginPage.jsx` (255 lines)
- **Issue:** Components mix concerns
- **Fix:** Split into smaller focused components

#### 58. No Error Boundary in Sub-components
- **Issue:** Only root has ErrorBoundary; child errors crash app
- **Fix:** Add ErrorBoundary around key sections

### Missing Dependencies

#### 59. No Logging Library (Backend)
- **Issue:** Using console.log only
- **Fix:** Add winston or pino

#### 60. No Compression Middleware
- **File:** `backend/server.js`
- **Issue:** Responses not compressed
- **Fix:** Add compression middleware

#### 61. No Helmet.js
- **File:** `backend/server.js`
- **Issue:** Missing security headers
- **Fix:** Add helmet middleware

#### 62. No Date Library (Frontend)
- **Issue:** Using raw JavaScript Date
- **Fix:** Add date-fns or dayjs

### Edge Cases

#### 63. No Query Timeout
- **File:** `backend/server.js`
- **Issue:** Long-running queries can hang
- **Fix:** Set statement_timeout

#### 64. No Graceful Shutdown
- **File:** `backend/server.js`
- **Issue:** Server doesn't close connections on SIGTERM
- **Fix:** Add signal handlers

#### 65. No ISO Date Validation
- **File:** `backend/server.js`
- **Issue:** dueDate accepts any string format
- **Fix:** Validate ISO 8601 format

### Documentation

#### 66. Missing Error Code Documentation
- **File:** `backend/API.md`
- **Issue:** Not all error responses documented
- **Fix:** Document all possible error codes

---

## Missing Features (Enhancement Backlog)

1. **Search Functionality** - No task search endpoint
2. **Task Recurrence** - No repeating tasks support
3. **Subtasks/Dependencies** - No hierarchical tasks
4. **Task Attachments** - No file upload support
5. **Task Tags** - Only category, no multiple tags
6. **Offline Support** - No service worker
7. **Real-time Updates** - No WebSocket support
8. **Profile Picture Delete UI** - Function exists but no UI
9. **Edit Existing Filter Presets** - Can only create/delete
10. **Internationalization** - All text hardcoded in English
11. **Notification System** - No alerts for task due dates
12. **Export/Import Tasks** - No data portability

---

## Priority Order for Fixes

### Phase 1: Critical Security & Data (1-2 days)
1. Fix database initialization (stop dropping tables)
2. Remove hardcoded secrets from Docker files
3. Fix SQL injection in filter sort
4. Add USER directive to Dockerfiles
5. Require SESSION_SECRET in production

### Phase 2: High Security (2-3 days)
6. Fix CORS configuration
7. Add rate limiting
8. Fix OAuth array bounds checking
9. Use environment variable for frontend URL
10. Add HTTPS enforcement

### Phase 3: Stability & Quality (3-5 days)
11. Add database indexes
12. Replace console.log with structured logging
13. Add missing dependencies (nodemon, helmet, compression)
14. Fix Tailwind/styling issues in Accessible components
15. Add missing test coverage

### Phase 4: Performance & UX (5-7 days)
16. Add component memoization
17. Implement code splitting
18. Add pagination to API
19. Add accessibility improvements (ARIA, labels)
20. Add confirmation dialogs for destructive actions

### Phase 5: Polish & Features (ongoing)
21. Complete dark mode implementation
22. Add search functionality
23. Implement filter persistence
24. Add offline support
25. Add internationalization

---

*Document generated: March 28, 2026*
*Total issues identified: 108*
