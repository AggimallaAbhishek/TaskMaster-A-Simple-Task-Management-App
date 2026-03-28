import React from 'react';
import { COLORS, COMMON_STYLES, PRIORITY_OPTIONS, CATEGORY_OPTIONS, getPriorityColor } from '../../styles/theme';

export function TaskItem({
    task,
    isEditing,
    editData,
    onEditStart,
    onEditChange,
    onEditSave,
    onEditCancel,
    onToggleComplete,
    onDelete,
}) {
    if (isEditing) {
        return (
            <li
                style={{
                    ...COMMON_STYLES.card,
                    backgroundColor: '#fff9e6',
                    border: `2px solid ${COLORS.WARNING}`,
                }}
            >
                <div style={{ display: 'grid', gap: '10px' }}>
                    <input
                        type="text"
                        value={editData.title}
                        onChange={(e) =>
                            onEditChange({
                                ...editData,
                                title: e.target.value,
                            })
                        }
                        style={{
                            ...COMMON_STYLES.input,
                        }}
                    />

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '10px',
                        }}
                    >
                        <select
                            value={editData.priority}
                            onChange={(e) =>
                                onEditChange({
                                    ...editData,
                                    priority: e.target.value,
                                })
                            }
                            style={COMMON_STYLES.input}
                        >
                            {PRIORITY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={editData.category}
                            onChange={(e) =>
                                onEditChange({
                                    ...editData,
                                    category: e.target.value,
                                })
                            }
                            style={COMMON_STYLES.input}
                        >
                            {CATEGORY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={editData.dueDate}
                            onChange={(e) =>
                                onEditChange({
                                    ...editData,
                                    dueDate: e.target.value,
                                })
                            }
                            style={COMMON_STYLES.input}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={onEditSave}
                            style={{
                                flex: 1,
                                padding: '8px',
                                backgroundColor: COLORS.SUCCESS,
                                color: COLORS.TEXT_WHITE,
                                ...COMMON_STYLES.button,
                            }}
                        >
                            Save
                        </button>
                        <button
                            onClick={onEditCancel}
                            style={{
                                flex: 1,
                                padding: '8px',
                                backgroundColor: COLORS.GRAY,
                                color: COLORS.TEXT_WHITE,
                                ...COMMON_STYLES.button,
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </li>
        );
    }

    const priorityColor = getPriorityColor(task.priority);

    return (
        <li
            style={{
                ...COMMON_STYLES.card,
                backgroundColor: task.completed ? '#e8f5e9' : '#fff',
                opacity: task.completed ? 0.7 : 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                cursor: 'pointer',
                transition: 'all 0.2s',
            }}
            onDoubleClick={onEditStart}
        >
            <div style={{ flex: 1 }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '8px',
                    }}
                >
                    <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={onToggleComplete}
                        style={{
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                        }}
                    />
                    <strong
                        style={{
                            textDecoration: task.completed
                                ? 'line-through'
                                : 'none',
                            color: task.completed ? COLORS.TEXT_MUTED : COLORS.TEXT_DARK,
                        }}
                    >
                        {task.title}
                    </strong>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap',
                        fontSize: '12px',
                        color: COLORS.TEXT_MUTED,
                    }}
                >
                    <span
                        style={{
                            backgroundColor: priorityColor,
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '3px',
                        }}
                    >
                        {task.priority}
                    </span>
                    <span>{task.category}</span>
                    {task.due_date && (
                        <span>
                            Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                    )}
                    <span>#{task.id}</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '5px', marginLeft: '10px' }}>
                <button
                    onClick={onEditStart}
                    style={{
                        padding: '4px 8px',
                        backgroundColor: COLORS.PRIMARY,
                        color: COLORS.TEXT_WHITE,
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px',
                    }}
                >
                    Edit
                </button>
                <button
                    onClick={onDelete}
                    style={{
                        padding: '4px 8px',
                        backgroundColor: COLORS.DANGER,
                        color: COLORS.TEXT_WHITE,
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px',
                    }}
                >
                    Delete
                </button>
            </div>
        </li>
    );
}
