import React, { useState, useEffect } from 'react';

// Use environment variable for API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch(`${API_URL}/api/tasks`);

            if (!response.ok) {
                throw new Error(`Backend returned status: ${response.status}`);
            }

            const data = await response.json();
            setTasks(data);
            setSuccess(`Connected to backend at ${API_URL}`);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setError(`Failed to connect to backend: ${error.message}. Make sure your backend is running at ${API_URL}`);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async () => {
        if (!newTask.trim()) {
            setError('Please enter a task title');
            return;
        }

        try {
            setError('');
            const response = await fetch(`${API_URL}/api/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: newTask.trim() })
            });

            if (!response.ok) {
                throw new Error(`Failed to add task: ${response.status}`);
            }

            const task = await response.json();
            setTasks([...tasks, task]);
            setNewTask('');
            setSuccess('Task added successfully!');

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error adding task:', error);
            setError(`Error adding task: ${error.message}`);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    };

    return (
        <div className="container">
            <div className="header">
                <h1>TaskMaster 🚀</h1>
                <p>Manage your tasks efficiently</p>
            </div>

            {error && (
                <div className="error">
                    <strong>Error:</strong> {error}
                    <button
                        onClick={fetchTasks}
                        style={{
                            marginLeft: '10px',
                            padding: '5px 10px',
                            background: '#c62828',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                        }}
                    >
                        Retry
                    </button>
                </div>
            )}

            {success && (
                <div className="success">
                    ✅ {success}
                </div>
            )}

            <div className="task-form">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter a new task..."
                    className="task-input"
                />
                <button
                    onClick={addTask}
                    className="add-button"
                    disabled={loading}
                >
                    {loading ? 'Adding...' : 'Add Task'}
                </button>
            </div>

            <div>
                <h2>Your Tasks ({tasks.length})</h2>
                {loading ? (
                    <p className="loading">Loading tasks...</p>
                ) : (
                    <ul className="task-list">
                        {tasks.map(task => (
                            <li key={task.id} className="task-item">
                                <span style={{
                                    textDecoration: task.completed ? 'line-through' : 'none',
                                    color: task.completed ? '#666' : '#333'
                                }}>
                                    {task.title}
                                </span>
                                <span style={{
                                    color: task.completed ? '#2e7d32' : '#666',
                                    fontSize: '14px'
                                }}>
                                    {task.completed ? '✅ Completed' : '⏳ Pending'}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}

                {!loading && tasks.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                        No tasks yet. Add your first task above!
                    </p>
                )}
            </div>

            <div style={{
                marginTop: '40px',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#666'
            }}>
                <strong>Debug Info:</strong><br />
                API URL: {API_URL}<br />
                Environment: {import.meta.env.MODE}<br />
                Backend Status: {error ? '❌ Disconnected' : '✅ Connected'}
            </div>
        </div>
    );
}

export default App;
