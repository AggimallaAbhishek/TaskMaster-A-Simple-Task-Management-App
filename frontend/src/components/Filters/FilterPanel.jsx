import React, { useState } from 'react';
import { COLORS, COMMON_STYLES, PRIORITY_OPTIONS, CATEGORY_OPTIONS } from '../../styles/theme';
import { DateRangePicker } from '../Filter/DateRangePicker';
import { PresetManager } from '../Filter/PresetManager';
import { usePresets } from '../../hooks';

export function FilterPanel({
    filter,
    onFilterChange,
    sortBy,
    onSortByChange,
    sortDirection,
    onSortDirectionChange,
    onReset,
}) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const { presets, loading: presetsLoading, fetchPresets, createPreset, updatePreset, deletePreset, applyPreset } = usePresets();

    React.useEffect(() => {
        fetchPresets();
    }, [fetchPresets]);

    const handleSavePreset = async (name, description, filterConfig) => {
        await createPreset(name, description, filterConfig);
    };

    const handleLoadPreset = async (presetId) => {
        const result = await applyPreset(presetId);
        if (result && result.tasks) {
            // Update filter and tasks through parent component
            onFilterChange(result.preset.filter_config);
        }
    };

    const handleDeletePreset = async (presetId) => {
        await deletePreset(presetId);
    };

    const currentFilters = {
        search: filter.search,
        priority: filter.priority,
        category: filter.category,
        completed: filter.completed,
        dueDateFrom: filter.dueDateFrom,
        dueDateTo: filter.dueDateTo,
    };

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: COLORS.GRAY_LIGHT,
                    borderRadius: '6px',
                }}
            >
                <div>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={filter.search}
                        onChange={(e) =>
                            onFilterChange({ ...filter, search: e.target.value })
                        }
                        style={{
                            ...COMMON_STYLES.input,
                            minWidth: '200px',
                        }}
                    />
                </div>

                <div>
                    <select
                        value={filter.priority}
                        onChange={(e) =>
                            onFilterChange({ ...filter, priority: e.target.value })
                        }
                        style={COMMON_STYLES.input}
                    >
                        <option value="">All Priorities</option>
                        {PRIORITY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label.split(' ')[0]}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <select
                        value={filter.category}
                        onChange={(e) =>
                            onFilterChange({ ...filter, category: e.target.value })
                        }
                        style={COMMON_STYLES.input}
                    >
                        <option value="">All Categories</option>
                        {CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <select
                        value={filter.completed}
                        onChange={(e) =>
                            onFilterChange({ ...filter, completed: e.target.value })
                        }
                        style={COMMON_STYLES.input}
                    >
                        <option value="">All Tasks</option>
                        <option value="true">Completed Only</option>
                        <option value="false">Pending Only</option>
                    </select>
                </div>

                <div>
                    <select
                        value={sortBy}
                        onChange={(e) => onSortByChange(e.target.value)}
                        style={COMMON_STYLES.input}
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
                        onChange={(e) => onSortDirectionChange(e.target.value)}
                        style={COMMON_STYLES.input}
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>

                <div>
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: showAdvanced ? COLORS.PRIMARY : COLORS.GRAY,
                            color: COLORS.TEXT_WHITE,
                            ...COMMON_STYLES.button,
                        }}
                    >
                        {showAdvanced ? 'Hide Advanced' : 'Advanced'}
                    </button>
                </div>

                <div>
                    <button
                        onClick={onReset}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: COLORS.GRAY,
                            color: COLORS.TEXT_WHITE,
                            ...COMMON_STYLES.button,
                        }}
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {showAdvanced && (
                <div style={{ marginBottom: '20px' }}>
                    <DateRangePicker
                        startDate={filter.dueDateFrom || ''}
                        onStartDateChange={(date) => onFilterChange({ ...filter, dueDateFrom: date })}
                        endDate={filter.dueDateTo || ''}
                        onEndDateChange={(date) => onFilterChange({ ...filter, dueDateTo: date })}
                        onClear={() => onFilterChange({ ...filter, dueDateFrom: '', dueDateTo: '' })}
                    />

                    <PresetManager
                        presets={presets}
                        loading={presetsLoading}
                        onSavePreset={handleSavePreset}
                        onLoadPreset={handleLoadPreset}
                        onDeletePreset={handleDeletePreset}
                        currentFilters={currentFilters}
                    />
                </div>
            )}
        </div>
    );
}
