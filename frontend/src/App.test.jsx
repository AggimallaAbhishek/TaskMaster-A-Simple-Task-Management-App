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
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should create a new task', async () => {
        const testTask = { title: 'Test task from automated test' };

        const res = await request(app)
            .post('/api/tasks')
            .send(testTask);

        expect(res.statusCode).toEqual(201);
        expect(res.body.title).toEqual(testTask.title);
        expect(res.body.completed).toBe(false);
        expect(res.body.id).toBeDefined();
    });

    it('should reject empty task title', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .send({ title: '' });

        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toContain('required');
    });

    it('should handle undefined routes with 404', async () => {
        const res = await request(app).get('/api/nonexistent');
        expect(res.statusCode).toEqual(404);
    });
});
