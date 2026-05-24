"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeSelector() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Alternar modo escuro"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 bg-white/10 dark:bg-black/20 text-foreground border border-border rounded-full shadow-lg backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-300"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-400 fill-yellow-400/20 animate-pulse" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-600/20" />
      )}
    </button>
  );
}
