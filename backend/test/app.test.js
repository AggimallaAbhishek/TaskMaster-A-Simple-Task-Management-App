const request = require('supertest');
const app = require('../server');

describe('TaskMaster API', () => {
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
});
