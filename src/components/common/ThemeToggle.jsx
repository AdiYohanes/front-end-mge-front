// src/components/common/ThemeToggle.jsx

import React from "react";
import { useTheme } from "./ThemeProvider";

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="btn btn-ghost hover:bg-theme-secondary p-2"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === "light" ? (
                <img
                    src="/images/LIGHT MODE.svg"
                    alt="Light Mode"
                    className="h-8 w-8"
                />
            ) : (
                <img
                    src="/images/DARK MODE.svg"
                    alt="Dark Mode"
                    className="h-8 w-8"
                />
            )}
        </button>
    );
};

export default ThemeToggle; 