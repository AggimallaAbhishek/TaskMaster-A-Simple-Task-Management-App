import React, { useCallback } from 'react';
import { COLORS, COMMON_STYLES, PRIORITY_OPTIONS, CATEGORY_OPTIONS } from '../../styles/theme';

export function TaskForm({
    title,
    onTitleChange,
    priority,
    onPriorityChange,
    category,
    onCategoryChange,
    dueDate,
    onDueDateChange,
    onSubmit,
    onKeyPress,
    loading,
}) {
    // Use useCallback to prevent unnecessary re-renders
    const handleTitleChange = useCallback((e) => onTitleChange(e.target.value), [onTitleChange]);
    const handlePriorityChange = useCallback((e) => onPriorityChange(e.target.value), [onPriorityChange]);
    const handleCategoryChange = useCallback((e) => onCategoryChange(e.target.value), [onCategoryChange]);
    const handleDueDateChange = useCallback((e) => onDueDateChange(e.target.value), [onDueDateChange]);

    const labelStyle = {
        display: 'block',
        fontSize: '12px',
        fontWeight: 500,
        color: COLORS.TEXT_MUTED,
        marginBottom: '4px',
    };

    return (
        <form 
            onSubmit={(e) => { e.preventDefault(); onSubmit(); }} 
            style={{ marginBottom: '20px' }}
            aria-label="Add new task form"
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                }}
            >
                <div>
                    <label htmlFor="task-title" style={labelStyle}>
                        Task Title
                    </label>
                    <input
                        id="task-title"
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        onKeyPress={onKeyPress}
                        placeholder="Enter a new task..."
                        style={{
                            width: '100%',
                            ...COMMON_STYLES.input,
                        }}
                        disabled={loading}
                        aria-required="true"
                        aria-describedby="task-title-hint"
                    />
                    <span id="task-title-hint" style={{ display: 'none' }}>
                        Press Enter to quickly add task
                    </span>
                </div>

                <div>
                    <label htmlFor="task-priority" style={labelStyle}>
                        Priority
                    </label>
                    <select
                        id="task-priority"
                        value={priority}
                        onChange={handlePriorityChange}
                        style={{
                            width: '100%',
                            ...COMMON_STYLES.input,
                        }}
                        disabled={loading}
                        aria-label="Select task priority"
                    >
                        {PRIORITY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="task-category" style={labelStyle}>
                        Category
                    </label>
                    <select
                        id="task-category"
                        value={category}
                        onChange={handleCategoryChange}
                        style={{
                            width: '100%',
                            ...COMMON_STYLES.input,
                        }}
                        disabled={loading}
                        aria-label="Select task category"
                    >
                        {CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="task-due-date" style={labelStyle}>
                        Due Date
                    </label>
                    <input
                        id="task-due-date"
                        type="date"
                        value={dueDate}
                        onChange={handleDueDateChange}
                        style={{
                            width: '100%',
                            ...COMMON_STYLES.input,
                        }}
                        disabled={loading}
                        aria-label="Select due date"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: loading ? COLORS.GRAY : COLORS.PRIMARY,
                    color: COLORS.TEXT_WHITE,
                    ...COMMON_STYLES.button,
                    marginTop: '10px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                }}
                aria-busy={loading}
                aria-label={loading ? 'Adding task...' : 'Add task'}
            >
                {loading ? 'Adding...' : 'Add Task'}
            </button>
        </form>
    );
}
