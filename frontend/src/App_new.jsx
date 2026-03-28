import React, { useState, useEffect } from 'react';
import { useAuth, useTasks, useFilter } from './hooks';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthPanel } from './components/Auth/AuthPanel';
import { TaskForm } from './components/Tasks/TaskForm';
import { TaskList } from './components/Tasks/TaskList';
import apiClient from './api/client';
import { COLORS } from './styles/theme';

const API_URL =
    import.meta.env.VITE_API_URL ||
    'https://taskmaster-a-simple-task-management-app.onrender.com';

function AppContent() {
    const { user, loading: authLoading, login, logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const { loading, error, setError, fetchTasks, addTask, updateTask, deleteTask } = useTasks(
        tasks,
        setTasks,
        user
    );

    // New task form state
    const [newTask, setNewTask] = useState('');
    const [newPriority, setNewPriority] = useState('medium');
    const [newCategory, setNewCategory] = useState('general');
    const [newDueDate, setNewDueDate] = useState('');

    // Edit mode state
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editData, setEditData] = useState({
        title: '',
        priority: 'medium',
        category: 'general',
        dueDate: '',
    });

    // Filter and sort
    const {
        filter,
        setFilter,
        sortBy,
        setSortBy,
        sortDirection,
        setSortDirection,
        filteredAndSortedTasks,
        resetFilters,
    } = useFilter(tasks);

    // Fetch tasks when user logs in
    useEffect(() => {
        if (user) {
            fetchTasks();
        }
    }, [user, fetchTasks]);

    // Handle add task
    const handleAddTask = async () => {
        const task = await addTask({
            title: newTask,
            priority: newPriority,
            category: newCategory,
            dueDate: newDueDate || null,
        });

        if (task) {
            setNewTask('');
            setNewPriority('medium');
            setNewCategory('general');
            setNewDueDate('');
        }
    };

    // Handle key press for add task
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddTask();
        }
    };

    // Handle edit start
    const handleEditStart = (task) => {
        setEditingTaskId(task.id);
        setEditData({
            title: task.title,
            priority: task.priority,
            category: task.category,
            dueDate: task.due_date ? task.due_date.split('T')[0] : '',
        });
    };

    // Handle edit save
    const handleEditSave = async (taskId) => {
        await updateTask(taskId, {
            title: editData.title,
            priority: editData.priority,
            category: editData.category,
            dueDate: editData.dueDate || null,
        });
        setEditingTaskId(null);
        setEditData({
            title: '',
            priority: 'medium',
            category: 'general',
            dueDate: '',
        });
    };

    // Handle toggle complete
    const handleToggleComplete = async (taskId) => {
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
            await updateTask(taskId, { completed: !task.completed });
        }
    };

    if (authLoading) {
        return (
            <div
                style={{
                    padding: '20px',
                    textAlign: 'center',
                    fontFamily: 'Arial',
                }}
            >
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div
            style={{
                padding: '20px',
                maxWidth: '600px',
                margin: '0 auto',
                fontFamily: 'Arial',
            }}
        >
            <AuthPanel
                user={user}
                loading={authLoading}
                onLogin={login}
                onLogout={logout}
            />

            {!user ? (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: COLORS.TEXT_MUTED,
                    }}
                >
                    <p>Please log in to access your tasks</p>
                </div>
            ) : (
                <>
                    <TaskForm
                        title={newTask}
                        onTitleChange={setNewTask}
                        priority={newPriority}
                        onPriorityChange={setNewPriority}
                        category={newCategory}
                        onCategoryChange={setNewCategory}
                        dueDate={newDueDate}
                        onDueDateChange={setNewDueDate}
                        onSubmit={handleAddTask}
                        onKeyPress={handleKeyPress}
                        loading={loading}
                    />

                    <TaskList
                        tasks={tasks}
                        loading={loading}
                        error={error}
                        filter={filter}
                        onFilterChange={setFilter}
                        sortBy={sortBy}
                        onSortByChange={setSortBy}
                        sortDirection={sortDirection}
                        onSortDirectionChange={setSortDirection}
                        onResetFilters={resetFilters}
                        filteredAndSortedTasks={filteredAndSortedTasks}
                        editingTaskId={editingTaskId}
                        editData={editData}
                        onEditStart={handleEditStart}
                        onEditChange={setEditData}
                        onEditSave={handleEditSave}
                        onEditCancel={() => {
                            setEditingTaskId(null);
                            setEditData({
                                title: '',
                                priority: 'medium',
                                category: 'general',
                                dueDate: '',
                            });
                        }}
                        onToggleComplete={handleToggleComplete}
                        onUpdate={updateTask}
                        onDelete={deleteTask}
                        apiUrl={API_URL}
                        onRetry={fetchTasks}
                    />
                </>
            )}
        </div>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <AppContent />
        </ErrorBoundary>
    );
}
