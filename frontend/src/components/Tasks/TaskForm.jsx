import React from 'react';
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
    return (
        <div style={{ marginBottom: '20px' }}>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                }}
            >
                <div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        onKeyPress={onKeyPress}
                        placeholder="Enter a new task..."
                        style={{
                            width: '100%',
                            ...COMMON_STYLES.input,
                        }}
                        disabled={loading}
                    />
                </div>

                <div>
                    <select
                        value={priority}
                        onChange={(e) => onPriorityChange(e.target.value)}
                        style={{
                            width: '100%',
                            ...COMMON_STYLES.input,
                        }}
                        disabled={loading}
                    >
                        {PRIORITY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <select
                        value={category}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        style={{
                            width: '100%',
                            ...COMMON_STYLES.input,
                        }}
                        disabled={loading}
                    >
                        {CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => onDueDateChange(e.target.value)}
                        style={{
                            width: '100%',
                            ...COMMON_STYLES.input,
                        }}
                        disabled={loading}
                    />
                </div>
            </div>

            <button
                onClick={onSubmit}
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
            >
                {loading ? 'Adding...' : 'Add Task'}
            </button>
        </div>
    );
}
