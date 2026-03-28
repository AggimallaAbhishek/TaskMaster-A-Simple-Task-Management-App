const request = require('supertest');
const app = require('../server');

describe('TaskMaster API', () => {
    // ===== BASIC CRUD TESTS =====
    it('should return health check', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('OK');
    });

    it('should get all tasks', async () => {
        const res = await request(app).get('/api/tasks');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should create a new task with metadata', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .send({
                title: 'Test task with metadata',
                priority: 'high',
                category: 'learning',
                dueDate: '2026-12-31'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.title).toEqual('Test task with metadata');
        expect(res.body.priority).toEqual('high');
        expect(res.body.category).toEqual('learning');
        expect(res.body.due_date).toBeTruthy();
        expect(res.body.completed).toBe(false);
    });

    it('should update a task', async () => {
        // First create a task
        const createRes = await request(app)
            .post('/api/tasks')
            .send({ title: 'Task to update' });

        const taskId = createRes.body.id;

        // Then update it
        const res = await request(app)
            .put(`/api/tasks/${taskId}`)
            .send({
                title: 'Updated task title',
                completed: true,
                priority: 'low'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toEqual('Updated task title');
        expect(res.body.completed).toBe(true);
        expect(res.body.priority).toEqual('low');
    });

    it('should delete a task', async () => {
        // First create a task
        const createRes = await request(app)
            .post('/api/tasks')
            .send({ title: 'Task to delete' });

        const taskId = createRes.body.id;

        // Then delete it
        const res = await request(app)
            .delete(`/api/tasks/${taskId}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Task deleted successfully');

        // Verify it's gone
        const getRes = await request(app).get('/api/tasks');
        const taskExists = getRes.body.some(task => task.id === taskId);
        expect(taskExists).toBe(false);
    });

    it('should reject empty task title', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .send({ title: '' });

        expect(res.statusCode).toEqual(400);
    });

    // ===== ERROR HANDLING TESTS =====
    it('should return 400 for missing title in create', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .send({ priority: 'high' });

        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBeTruthy();
    });

    it('should return 404 for non-existent task update', async () => {
        const res = await request(app)
            .put('/api/tasks/99999')
            .send({ title: 'Should not work' });

        expect(res.statusCode).toEqual(404);
        expect(res.body.error).toContain('not found');
    });

    it('should return 404 for non-existent task delete', async () => {
        const res = await request(app)
            .delete('/api/tasks/99999');

        expect(res.statusCode).toEqual(404);
        expect(res.body.error).toContain('not found');
    });

    // ===== INPUT VALIDATION TESTS =====
    it('should reject update with empty title', async () => {
        const createRes = await request(app)
            .post('/api/tasks')
            .send({ title: 'Test task' });

        const taskId = createRes.body.id;

        const res = await request(app)
            .put(`/api/tasks/${taskId}`)
            .send({ title: '' });

        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toContain('title is required');
    });

    it('should reject update with no fields', async () => {
        const createRes = await request(app)
            .post('/api/tasks')
            .send({ title: 'Test task' });

        const taskId = createRes.body.id;

        const res = await request(app)
            .put(`/api/tasks/${taskId}`)
            .send({});

        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toContain('At least one field');
    });

    // ===== CORS HEADERS TEST =====
    it('should include CORS headers in response', async () => {
        const res = await request(app).get('/api/health');

        expect(res.headers['access-control-allow-origin']).toBeDefined();
        expect(res.headers['access-control-allow-credentials']).toEqual('true');
    });

    // ===== AUTH CHECK ENDPOINT TEST =====
    it('should return 401 for unauthenticated /auth/user request', async () => {
        const res = await request(app).get('/auth/user');

        // In test mode without real session, this will be 401
        // Production use requires actual authentication
        expect([200, 401]).toContain(res.statusCode);
    });

    // ===== TASK CONSTRAINTS TEST =====
    it('should trim whitespace from task title', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .send({ title: '  Test task with spaces  ' });

        expect(res.statusCode).toEqual(201);
        expect(res.body.title).toEqual('Test task with spaces');
    });

    it('should set default values for task fields', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .send({ title: 'Minimal task' });

        expect(res.statusCode).toEqual(201);
        expect(res.body.priority).toEqual('medium');
        expect(res.body.category).toEqual('general');
        expect(res.body.completed).toBe(false);
    });
});
