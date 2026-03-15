require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 5000;

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

// PostgreSQL database connection
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'aggimallaabhishek',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'taskmaster'
});

// Initialize database with tasks table - drop and recreate for development
const initializeDatabase = async () => {
    try {
        await pool.query('DROP TABLE IF EXISTS tasks');
        await pool.query(`
            CREATE TABLE tasks (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                priority VARCHAR(20) DEFAULT 'medium',
                category VARCHAR(100) DEFAULT 'general',
                due_date TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Insert initial tasks
        await pool.query(
            'INSERT INTO tasks (title, completed, priority, category) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)',
            ['Learn CI/CD pipeline', false, 'high', 'learning', 'Deploy to production', true, 'medium', 'deployment']
        );
        
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
            await initializeDatabase();
            
            app.listen(PORT, () => {
                console.log('====================================');
                console.log('🚀 TaskMaster Server with CORS Fix');
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

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: '✅ TaskMaster API Root is working!',
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /health',
            'GET /api/health',
            'GET /api/tasks',
            'POST /api/tasks'
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

// Get all tasks
app.get('/api/tasks', async (req, res) => {
    console.log('GET /api/tasks - Headers:', req.headers);
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY id');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new task
app.post('/api/tasks', async (req, res) => {
    console.log('POST /api/tasks - Body:', req.body);
    const { title, completed, priority, category, dueDate } = req.body;

    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Task title is required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO tasks (title, completed, priority, category, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title.trim(), completed || false, priority || 'medium', category || 'general', dueDate || null]
        );
        
        const newTask = result.rows[0];
        console.log('Task created:', newTask);
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update task (PUT - full replacement)
app.put('/api/tasks/:id', async (req, res) => {
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

        // Add updated_at timestamp
        query += `updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`;
        values.push(taskId);

        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const updatedTask = result.rows[0];
        console.log('Task updated:', updatedTask);
        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
    console.log('DELETE /api/tasks/:id - Params:', req.params);
    const taskId = parseInt(req.params.id);
    
    try {
        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 RETURNING *',
            [taskId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
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

// Start server
app.listen(PORT, () => {
    console.log('====================================');
    console.log('🚀 TaskMaster Server with CORS Fix');
    console.log('====================================');
    console.log(`Port: ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('CORS enabled for frontend origins');
    console.log('====================================');
});

module.exports = app;
