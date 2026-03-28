const { Pool } = require('pg');

let testPool;

// Initialize database before running tests
beforeAll(async () => {
    testPool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'aggimallaabhishek',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'taskmaster'
    });

    try {
        // Drop tables in reverse order of dependencies
        await testPool.query('DROP TABLE IF EXISTS filter_presets');
        await testPool.query('DROP TABLE IF EXISTS tasks');
        await testPool.query('DROP TABLE IF EXISTS users');

        // Create users table
        await testPool.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                google_id VARCHAR(255) UNIQUE,
                picture VARCHAR(500),
                bio TEXT,
                theme VARCHAR(20) DEFAULT 'light',
                notifications_enabled BOOLEAN DEFAULT true,
                avatar_path VARCHAR(500),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create tasks table
        await testPool.query(`
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

        // Create filter_presets table
        await testPool.query(`
            CREATE TABLE filter_presets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                filter_config JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, name)
            )
        `);

        // Insert test user
        await testPool.query(
            'INSERT INTO users (username, email, google_id) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
            ['testuser', 'test@example.com', 'test-google-id']
        );

        console.log('✓ Test database initialized');
    } catch (error) {
        console.error('✗ Failed to initialize test database:', error);
        throw error;
    }
});

// Clean up after tests
afterAll(async () => {
    if (testPool) {
        await testPool.end();
    }
});

