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

    it('should create a new task', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .send({ title: 'Test task from Jest' });

        expect(res.statusCode).toEqual(201);
        expect(res.body.title).toEqual('Test task from Jest');
        expect(res.body.completed).toBe(false);
    });

    it('should reject empty task title', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .send({ title: '' });

        expect(res.statusCode).toEqual(400);
    });
});
