import React, { useState, useEffect, useMemo } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://taskmaster-a-simple-task-management-app.onrender.com';

function App() {
    // Auth state
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState('');
    
    // Task state
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [newPriority, setNewPriority] = useState('medium');
    const [newCategory, setNewCategory] = useState('general');
    const [newDueDate, setNewDueDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editTaskTitle, setEditTaskTitle] = useState('');
    const [editPriority, setEditPriority] = useState('medium');
    const [editCategory, setEditCategory] = useState('general');
    const [editDueDate, setEditDueDate] = useState('');
    const [filter, setFilter] = useState({
        search: '',
        priority: '',
        category: '',
        completed: ''
    });
    const [sortBy, setSortBy] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');

    useEffect(() => {
        checkAuthStatus();
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        if (!user) return; // Don't fetch tasks if not logged in
        
        try {
            setLoading(true);
            setError('');
            console.log('Fetching tasks from:', `${API_URL}/api/tasks`);

            const response = await fetch(`${API_URL}/api/tasks`, {
                credentials: 'include' // Important for sending cookies with the request
            });
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

    // Authentication functions
    const checkAuthStatus = async () => {
        try {
            setAuthLoading(true);
            setAuthError('');
            
            const response = await fetch(`${API_URL}/auth/user`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error('Auth check error:', err);
            setAuthError('Failed to check authentication status');
            setUser(null);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogin = () => {
        window.location.href = `${API_URL}/auth/google`;
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                credentials: 'include'
            });
            setUser(null);
            setTasks([]); // Clear tasks when logging out
        } catch (err) {
            console.error('Logout error:', err);
            setAuthError('Failed to logout');
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
        console.log('Task data:', { 
            title: newTask, 
            priority: newPriority,
            category: newCategory,
            dueDate: newDueDate
        });

        const response = await fetch(`${API_URL}/api/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                title: newTask,
                priority: newPriority,
                category: newCategory,
                dueDate: newDueDate || null
            })
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
        setNewPriority('medium');
        setNewCategory('general');
        setNewDueDate('');
        // No need to refresh tasks as we already added the task optimistically

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

const updateTask = async (taskId, updates) => {
    try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const updatedTask = await response.json();
        console.log('Task updated:', updatedTask);

        // Update the task in state
        setTasks(prevTasks => 
            prevTasks.map(task => 
                task.id === taskId ? updatedTask : task
            )
        );

        // If we were editing this task, stop editing
        if (editingTaskId === taskId) {
            setEditingTaskId(null);
            setEditTaskTitle('');
            setEditPriority('medium');
            setEditCategory('general');
            setEditDueDate('');
        }

    } catch (err) {
        console.error('Update task error:', err);
        setError(`Error updating task: ${err.message}`);
    } finally {
        setLoading(false);
    }
};

    const deleteTask = async (taskId) => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            await response.json(); // We don't need the response body for delete
            console.log('Task deleted:', taskId);

            // Remove the task from state
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

        } catch (err) {
            console.error('Delete task error:', err);
            setError(`Error deleting task: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get priority color
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#dc3545';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#007acc';
        }
    };

    // Filter and sort tasks
    const filteredAndSortedTasks = React.useMemo(() => {
        return tasks
            .filter(task => {
                const matchesSearch = task.title.toLowerCase().includes(filter.search.toLowerCase());
                const matchesPriority = !filter.priority || task.priority === filter.priority;
                const matchesCategory = !filter.category || task.category === filter.category;
                const matchesCompleted = !filter.completed || task.completed.toString() === filter.completed;
                return matchesSearch && matchesPriority && matchesCategory && matchesCompleted;
            })
            .sort((a, b) => {
                if (sortBy === 'completed') {
                    return sortDirection === 'asc' 
                        ? (a.completed === b.completed ? 0 : a.completed ? 1 : -1) 
                        : (a.completed === b.completed ? 0 : a.completed ? -1 : 1);
                }
                
                if (a[sortBy] < b[sortBy]) return sortDirection === 'asc' ? -1 : 1;
                if (a[sortBy] > b[sortBy]) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
    }, [tasks, filter, sortBy, sortDirection]);

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>TaskMaster 🚀</h1>
                <div>
                    {authLoading ? (
                        <span>Checking authentication...</span>
                    ) : (
                        <>
                            {user ? (
                                <>
                                    <span>Logged in as: {user.username}</span>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            marginLeft: '10px',
                                            padding: '6px 12px',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleLogin}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#4285f4',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Login with Google
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
            
            {!user && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    <p>Please log in to access your tasks</p>
                </div>
            )}
            
            {user && (
                <>
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

<div style={{ marginBottom: '20px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        <div>
            <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter a new task..."
                style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                }}
                disabled={loading}
            />
        </div>
        
        <div>
            <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                }}
                disabled={loading}
            >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
            </select>
        </div>
        
        <div>
            <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                }}
                disabled={loading}
            >
                <option value="general">General</option>
                <option value="learning">Learning</option>
                <option value="development">Development</option>
                <option value="deployment">Deployment</option>
                <option value="personal">Personal</option>
                <option value="work">Work</option>
            </select>
        </div>
        
        <div>
            <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                }}
                disabled={loading}
            />
        </div>
    </div>
    
    <button
        onClick={addTask}
        disabled={loading}
        style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
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
    <>
        {/* Filter Controls */}
        <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '10px', 
            marginBottom: '20px', 
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px'
        }}>
            <div>
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={filter.search}
                    onChange={(e) => setFilter({...filter, search: e.target.value})}
                    style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        minWidth: '200px'
                    }}
                />
            </div>
            
            <div>
                <select
                    value={filter.priority}
                    onChange={(e) => setFilter({...filter, priority: e.target.value})}
                    style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                    }}
                >
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>
            
            <div>
                <select
                    value={filter.category}
                    onChange={(e) => setFilter({...filter, category: e.target.value})}
                    style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                    }}
                >
                    <option value="">All Categories</option>
                    <option value="learning">Learning</option>
                    <option value="deployment">Deployment</option>
                    <option value="development">Development</option>
                    <option value="general">General</option>
                </select>
            </div>
            
            <div>
                <select
                    value={filter.completed}
                    onChange={(e) => setFilter({...filter, completed: e.target.value})}
                    style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                    }}
                >
                    <option value="">All Tasks</option>
                    <option value="true">Completed Only</option>
                    <option value="false">Pending Only</option>
                </select>
            </div>
            
            <div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                    }}
                >
                    <option value="id">ID</option>
                    <option value="title">Title</option>
                    <option value="priority">Priority</option>
                    <option value="category">Category</option>
                    <option value="due_date">Due Date</option>
                    <option value="completed">Completion Status</option>
                </select>
            </div>
            
            <div>
                <select
                    value={sortDirection}
                    onChange={(e) => setSortDirection(e.target.value)}
                    style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                    }}
                >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>
            
            <div>
                <button
                    onClick={() => {
                        setFilter({search: '', priority: '', category: '', completed: ''});
                        setSortBy('id');
                        setSortDirection('asc');
                    }}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Reset Filters
                </button>
            </div>
        </div>
        
        {/* Tasks List */}
        <ul style={{ listStyle: 'none', padding: 0 }}>
            {filteredAndSortedTasks.map(task => (
                <li key={task.id} style={{
                    padding: '15px',
                    margin: '10px 0',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '6px',
                    borderLeft: `4px solid ${getPriorityColor(task.priority)}`
                }}>
                    {editingTaskId === task.id ? (
                        <div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    value={editTaskTitle}
                                    onChange={(e) => setEditTaskTitle(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            updateTask(task.id, { 
                                                title: editTaskTitle,
                                                priority: editPriority,
                                                category: editCategory,
                                                dueDate: editDueDate || null
                                            });
                                        }
                                    }}
                                    onBlur={() => {
                                        updateTask(task.id, { 
                                            title: editTaskTitle,
                                            priority: editPriority,
                                            category: editCategory,
                                            dueDate: editDueDate || null
                                        });
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '16px'
                                    }}
                                />
                                <select
                                    value={editPriority}
                                    onChange={(e) => setEditPriority(e.target.value)}
                                    style={{
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        minWidth: '80px'
                                    }}
                                >
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                                <select
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    style={{
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        minWidth: '100px'
                                    }}
                                >
                                    <option value="learning">Learning</option>
                                    <option value="deployment">Deployment</option>
                                    <option value="development">Development</option>
                                    <option value="general">General</option>
                                </select>
                                <input
                                    type="date"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)}
                                    style={{
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => updateTask(task.id, { 
                                        title: editTaskTitle,
                                        priority: editPriority,
                                        category: editCategory,
                                        dueDate: editDueDate || null
                                    })}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#007acc',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingTaskId(null);
                                        setEditTaskTitle('');
                                        setEditPriority('medium');
                                        setEditCategory('general');
                                        setEditDueDate('');
                                    }}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#ccc',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{
                                        textDecoration: task.completed ? 'line-through' : 'none',
                                        color: task.completed ? '#666' : '#333',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                        fontWeight: 'bold'
                                        }}
                                        onDoubleClick={() => {
                                            setEditingTaskId(task.id);
                                            setEditTaskTitle(task.title);
                                            setEditPriority(task.priority);
                                            setEditCategory(task.category);
                                            setEditDueDate(task.due_date ? task.due_date.split('T')[0] : '');
                                        }}>
                                        {task.title}
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '5px', fontSize: '14px' }}>
                                        <span>Priority: <strong>{task.priority}</strong></span>
                                        <span>Category: <strong>{task.category}</strong></span>
                                        {task.due_date && (
                                            <span>Due: <strong>{new Date(task.due_date).toLocaleDateString()}</strong></span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => updateTask(task.id, { completed: !task.completed })}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: task.completed ? '#28a745' : '#ffc107',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {task.completed ? 'Undo' : 'Complete'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingTaskId(task.id);
                                            setEditTaskTitle(task.title);
                                            setEditPriority(task.priority);
                                            setEditCategory(task.category);
                                            setEditDueDate(task.due_date ? task.due_date.split('T')[0] : '');
                                        }}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#007acc',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                                ID: {task.id} • 
                                Created: {new Date(task.created_at).toLocaleString()} • 
                                Updated: {new Date(task.updated_at).toLocaleString()}
                            </div>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    </>
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
