// src/components/common/ThemeToggle.jsx

import React from "react";
import { useTheme } from "./ThemeProvider";
import { FaSun, FaMoon } from "react-icons/fa";

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle border-2 border-black dark:border-white hover:bg-theme-secondary"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === "light" ? (
                <FaMoon className="h-5 w-5 text-black" />
            ) : (
                <FaSun className="h-5 w-5 text-white" />
            )}
        </button>
    );
};

export default ThemeToggle; 