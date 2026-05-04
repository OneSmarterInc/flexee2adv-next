// Create this file: /Users/priyanshujain/Projects/flexee2ui/src/context/ThemeContext.js

"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Create the context
const ThemeContext = createContext(undefined);

// Provider component
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDark(savedTheme === "dark");
    }
    setIsHydrated(true);
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    }
  }, [isDark, isHydrated]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const value = {
    isDark,
    setIsDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
}