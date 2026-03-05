const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS middleware
app.use((req, res, next) => {
    const allowedOrigins = [
        'https://task-master-a-simple-task-management-7v04ickra.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000'
    ];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }

    res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

// Rest of your server code remains the same...
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let tasks = [
    { id: 1, title: 'Learn CI/CD', completed: false },
    { id: 2, title: 'Deploy to production', completed: true }
];

app.get('/', (req, res) => {
    res.json({ message: '✅ TaskMaster API Root is working!', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'TaskMaster Backend' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', api: 'healthy' });
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

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;
