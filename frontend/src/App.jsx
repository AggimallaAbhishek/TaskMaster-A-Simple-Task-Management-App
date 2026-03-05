import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://taskmaster-a-simple-task-management-app.onrender.com';

function App() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Fetching tasks from:', `${API_URL}/api/tasks`);

            const response = await fetch(`${API_URL}/api/tasks`);
            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Tasks received:', data);
            setTasks(data);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(`Cannot fetch tasks: ${err.message}`);
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
            setLoading(true);

            console.log('Adding task to:', `${API_URL}/api/tasks`);
            console.log('Task data:', { title: newTask });

            const response = await fetch(`${API_URL}/api/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: newTask })
            });

            console.log('Add task response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const task = await response.json();
            console.log('Task added:', task);

            setTasks([...tasks, task]);
            setNewTask('');

            // Refresh tasks to ensure we have the latest
            fetchTasks();

        } catch (err) {
            console.error('Add task error:', err);
            setError(`Error adding task: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
            <h1>TaskMaster 🚀</h1>
            <p><strong>Backend URL:</strong> {API_URL}</p>

            {error && (
                <div style={{
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    padding: '15px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    border: '1px solid #ffcdd2'
                }}>
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

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter a new task..."
                    style={{
                        flex: 1,
                        padding: '10px',
                        border: '2px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '16px'
                    }}
                    disabled={loading}
                />
                <button
                    onClick={addTask}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: loading ? '#ccc' : '#007acc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px'
                    }}
                >
                    {loading ? 'Adding...' : 'Add Task'}
                </button>
            </div>

            <div>
                <h2>Your Tasks ({tasks.length})</h2>
                {loading ? (
                    <p>Loading tasks...</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {tasks.map(task => (
                            <li key={task.id} style={{
                                padding: '15px',
                                margin: '10px 0',
                                backgroundColor: '#f9f9f9',
                                borderRadius: '6px',
                                borderLeft: '4px solid #007acc'
                            }}>
                                <div style={{
                                    textDecoration: task.completed ? 'line-through' : 'none',
                                    color: task.completed ? '#666' : '#333'
                                }}>
                                    {task.title}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                    ID: {task.id} • {task.completed ? 'Completed' : 'Pending'}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Debug info */}
            <div style={{
                marginTop: '40px',
                padding: '15px',
                background: '#f0f0f0',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#666'
            }}>
                <strong>Debug Info:</strong><br />
                Open browser console (F12) to see detailed logs<br />
                Backend: {API_URL}<br />
                Check Network tab for request/response details
            </div>
        </div>
    );
}

export default App;
