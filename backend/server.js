const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock database (in production, use a real database)
let tasks = [
    { id: 1, title: 'Learn CI/CD pipeline', completed: false, createdAt: new Date() },
    { id: 2, title: 'Deploy to production', completed: true, createdAt: new Date() },
    { id: 3, title: 'Write automated tests', completed: false, createdAt: new Date() }
];

// Health check endpoint (required by Render)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'TaskMaster Backend',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
    const { title } = req.body;

    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Task title is required' });
    }

    const newTask = {
        id: tasks.length + 1,
        title: title.trim(),
        completed: false,
        createdAt: new Date()
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'TaskMaster API is running! 🚀',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            apiHealth: '/api/health',
            tasks: '/api/tasks',
            documentation: 'Check README for full API docs'
        },
        timestamp: new Date().toISOString()
    });
});

// Error handling for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Start server with proper error handling
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 Local: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
}).on('error', (err) => {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

module.exports = app;
