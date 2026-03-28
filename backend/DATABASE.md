# TaskMaster Database Schema

## Overview
This document describes the database schema for the TaskMaster application.

## Tables

### Users Table
Stores user account information

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    picture VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Unique user identifier (auto-incrementing)
- `username` - User's display name
- `email` - User's email address (unique)
- `google_id` - Google OAuth ID for authentication
- `picture` - URL to user's profile picture
- `created_at` - Account creation timestamp

### Tasks Table
Stores task items with user association

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(100) DEFAULT 'general',
    due_date TIMESTAMP WITH TIME ZONE,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Unique task identifier (auto-incrementing)
- `title` - Task title (required)
- `completed` - Completion status (default: false)
- `priority` - Priority level: 'high', 'medium', 'low' (default: 'medium')
- `category` - Task category for organization (default: 'general')
- `due_date` - Optional deadline for the task
- `user_id` - Foreign key to tasks.users (task owner)
- `created_at` - Task creation timestamp
- `updated_at` - Last modification timestamp

**Constraints:**
- `user_id` references `users(id)` - ensures tasks are linked to valid users

## Relationships
- One user can have many tasks (1-to-many)
- Each task belongs to exactly one user
- Deleting a user should cascade to delete their tasks (can be configured in production)

## Database Initialization

The database is automatically initialized when:
1. Tests run (via Jest setup file: `test/setup.js`)
2. Production server starts (via `startServer()` function)

The initialization process:
1. Drops existing tables (for development)
2. Creates the schema from scratch
3. Creates a test user (in development/test only)

**Note:** In production with persistent data, consider using migrations instead of dropping tables.
