// Color palette and constants
export const COLORS = {
    PRIMARY: '#007acc',
    SECONDARY: '#4285f4',
    DANGER: '#dc3545',
    WARNING: '#ffc107',
    SUCCESS: '#28a745',
    GRAY: '#6c757d',
    GRAY_LIGHT: '#f8f9fa',
    GRAY_BORDER: '#ddd',

    // Priority colors
    PRIORITY_HIGH: '#dc3545',
    PRIORITY_MEDIUM: '#ffc107',
    PRIORITY_LOW: '#28a745',

    // Text colors
    TEXT_DARK: '#333',
    TEXT_MUTED: '#666',
    TEXT_WHITE: 'white',

    // Background colors
    BG_ERROR: '#ffebee',
    BG_ERROR_DARK: '#c62828',
};

// Common styles
export const COMMON_STYLES = {
    input: {
        padding: '10px',
        border: `2px solid ${COLORS.GRAY_BORDER}`,
        borderRadius: '4px',
        fontSize: '16px',
    },
    button: {
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
    },
    card: {
        padding: '15px',
        margin: '10px 0',
        borderRadius: '6px',
        border: '1px solid #e9ecef',
    },
};

// Priority labels
export const PRIORITY_OPTIONS = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
];

// Category options
export const CATEGORY_OPTIONS = [
    { value: 'general', label: 'General' },
    { value: 'learning', label: 'Learning' },
    { value: 'development', label: 'Development' },
    { value: 'deployment', label: 'Deployment' },
    { value: 'personal', label: 'Personal' },
    { value: 'work', label: 'Work' },
];

// Helper function for priority color
export const getPriorityColor = (priority) => {
    switch (priority) {
        case 'high':
            return COLORS.PRIORITY_HIGH;
        case 'medium':
            return COLORS.PRIORITY_MEDIUM;
        case 'low':
            return COLORS.PRIORITY_LOW;
        default:
            return COLORS.PRIMARY;
    }
};
