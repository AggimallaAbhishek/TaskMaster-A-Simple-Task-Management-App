require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL database connection - define early for session store
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'aggimallaabhishek',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'taskmaster'
});

// Enhanced CORS middleware - FIXED FOR PREFLIGHT
app.use((req, res, next) => {
    const allowedOrigins = [
        'https://task-master-a-simple-task-management-7v04ickra.vercel.app',
        'https://task-master-a-simple-task-managemen.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000'
    ];

    const origin = req.headers.origin;

    // Allow the requesting origin if it's in the list, otherwise allow all (for testing)
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        // For development/testing, you might want to be more restrictive
        res.header('Access-Control-Allow-Origin', '*');
    }

    res.header('Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, X-HTTP-Method-Override, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours

    // INTERCEPT OPTIONS METHOD - THIS IS THE KEY FIX
    if (req.method === 'OPTIONS') {
        console.log('OPTIONS preflight received');
        res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '*');
        return res.status(200).end();
    }

    next();
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware with PostgreSQL store
app.use(session({
    store: new PgSession({
        pool: pool,
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'taskmaster-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS in production
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// User serialization and deserialization for sessions
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const result = await pool.query('SELECT id, username, email, picture FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return done(new Error('User not found'), null);
        }
        done(null, result.rows[0]);
    } catch (err) {
        done(err, null);
    }
});

// Google OAuth Strategy - only configure if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        passReqToCallback: true
    }, async (request, accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists in our database
        let result = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);
        
        if (result.rows.length > 0) {
            // User exists, return the user
            return done(null, result.rows[0]);
        } else {
            // Check if user exists with email
            result = await pool.query('SELECT * FROM users WHERE email = $1', [profile.emails[0].value]);
            
            if (result.rows.length > 0) {
                // User exists with email, update with Google ID
                const updateResult = await pool.query(
                    'UPDATE users SET google_id = $1, picture = $2 WHERE id = $3 RETURNING *',
                    [profile.id, profile.photos[0].value, result.rows[0].id]
                );
                return done(null, updateResult.rows[0]);
            } else {
                // Create new user
                const newUser = await pool.query(
                    'INSERT INTO users (username, email, google_id, picture) VALUES ($1, $2, $3, $4) RETURNING *',
                    [profile.displayName, profile.emails[0].value, profile.id, profile.photos[0].value]
                );
                return done(null, newUser.rows[0]);
            }
        }
    } catch (err) {
        return done(err, null);
    }
    }));
} else if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  Google OAuth credentials not configured. OAuth will be disabled.');
}

// Initialize database with tables - drop and recreate for development
const initializeDatabase = async () => {
    try {
        // Drop tables in reverse order of dependencies
        await pool.query('DROP TABLE IF EXISTS tasks');
        await pool.query('DROP TABLE IF EXISTS users');

        // Create users table
        await pool.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                google_id VARCHAR(255) UNIQUE,
                picture VARCHAR(500),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create tasks table with user_id foreign key
        await pool.query(`
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
            )
        `);

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error; // Re-throw to prevent server start if DB init fails
    }
};

// Export the app for use in tests
module.exports = app;

// Start the server if this file is run directly
if (require.main === module) {
    const startServer = async () => {
        try {
            // Initialize database on production startup
            await initializeDatabase();

            app.listen(PORT, () => {
                console.log('====================================');
                console.log('🚀 TaskMaster Server');
                console.log('====================================');
                console.log(`Port: ${PORT}`);
                console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log('CORS enabled for frontend origins');
                console.log('====================================');
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    };

    startServer().catch(console.error);
}

// ========== ROUTES ==========

// Authentication routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect to frontend
        res.redirect('http://localhost:5173/');
    }
);

app.get('/auth/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

app.get('/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
        const { id, username, email, picture } = req.user;
        res.json({ id, username, email, picture });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: '✅ TaskMaster API Root is working!',
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /health',
            'GET /api/health',
            'GET /api/tasks',
            'POST /api/tasks',
            'GET /auth/google',
            'GET /auth/google/callback',
            'GET /auth/logout',
            'GET /auth/user'
        ]
    });
});

// Health endpoint for Render
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'TaskMaster Backend',
        timestamp: new Date().toISOString()
    });
});

// API Health endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Mock authentication for testing - inject before route checks
if (process.env.NODE_ENV !== 'production' && !process.env.GOOGLE_CLIENT_ID) {
    app.use((req, res, next) => {
        // Auto-authenticate in test/dev mode without OAuth credentials
        req.user = req.user || { id: 1, username: 'testuser', email: 'test@example.com', picture: '' };
        req.isAuthenticated = () => true;
        next();
    });
}

// Middleware to check if user is authenticated
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
};

// Get all tasks for the current user
app.get('/api/tasks', ensureAuthenticated, async (req, res) => {
    console.log('GET /api/tasks - Headers:', req.headers);
    try {
        const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY id', [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new task for the current user
app.post('/api/tasks', ensureAuthenticated, async (req, res) => {
    console.log('POST /api/tasks - Body:', req.body);
    const { title, completed, priority, category, dueDate } = req.body;

    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Task title is required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO tasks (title, completed, priority, category, due_date, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title.trim(), completed || false, priority || 'medium', category || 'general', dueDate || null, req.user.id]
        );
        
        const newTask = result.rows[0];
        console.log('Task created:', newTask);
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update task (PUT - full replacement) for the current user
app.put('/api/tasks/:id', ensureAuthenticated, async (req, res) => {
    console.log('PUT /api/tasks/:id - Params:', req.params, 'Body:', req.body);
    const taskId = parseInt(req.params.id);
    const { title, completed, priority, category, dueDate } = req.body;

    // Validate input
    if (title === undefined && completed === undefined && priority === undefined && category === undefined && dueDate === undefined) {
        return res.status(400).json({ error: 'At least one field must be provided for update' });
    }

    if (title !== undefined && (!title || title.trim() === '')) {
        return res.status(400).json({ error: 'Task title is required' });
    }

    try {
        // Build dynamic query based on provided fields
        let query = 'UPDATE tasks SET ';
        const values = [];
        let paramCount = 1;

        if (title !== undefined) {
            query += `title = $${paramCount++}, `;
            values.push(title.trim());
        }

        if (completed !== undefined) {
            query += `completed = $${paramCount++}, `;
            values.push(Boolean(completed));
        }

        if (priority !== undefined) {
            query += `priority = $${paramCount++}, `;
            values.push(priority);
        }

        if (category !== undefined) {
            query += `category = $${paramCount++}, `;
            values.push(category);
        }

        if (dueDate !== undefined) {
            query += `due_date = $${paramCount++}, `;
            values.push(dueDate || null);
        }

        // Add updated_at timestamp and ensure user owns the task
        query += `updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`;
        values.push(taskId);
        values.push(req.user.id);

        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found or unauthorized' });
        }

        const updatedTask = result.rows[0];
        console.log('Task updated:', updatedTask);
        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete task for the current user
app.delete('/api/tasks/:id', ensureAuthenticated, async (req, res) => {
    console.log('DELETE /api/tasks/:id - Params:', req.params);
    const taskId = parseInt(req.params.id);
    
    try {
        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
            [taskId, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found or unauthorized' });
        }

        const deletedTask = result.rows[0];
        console.log('Task deleted:', deletedTask);
        res.json({ message: 'Task deleted successfully', task: deletedTask });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Handle undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

module.exports = app;
