import React from 'react';
import { COLORS } from '../../styles/theme';

export function AuthPanel({ user, loading, onLogin, onLogout }) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
            }}
        >
            <h1>TaskMaster 🚀</h1>
            <div>
                {loading ? (
                    <span>Checking authentication...</span>
                ) : (
                    <>
                        {user ? (
                            <>
                                <span>Logged in as: {user.username}</span>
                                <button
                                    onClick={onLogout}
                                    style={{
                                        marginLeft: '10px',
                                        padding: '6px 12px',
                                        backgroundColor: COLORS.DANGER,
                                        color: COLORS.TEXT_WHITE,
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onLogin}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: COLORS.SECONDARY,
                                    color: COLORS.TEXT_WHITE,
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                }}
                            >
                                Login with Google
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
