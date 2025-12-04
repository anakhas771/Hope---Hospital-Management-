// src/context/ThemeContext.jsx
import React, { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // default to user's system preference if not set
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const defaultTheme = stored || (prefersDark ? "dark" : "light");

  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    document.documentElement.classList.remove(theme === "dark" ? "light" : "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};
