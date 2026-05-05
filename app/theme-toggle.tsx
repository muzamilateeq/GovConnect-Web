"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";

function getInitialDarkMode() {
  if (typeof window === "undefined") return false;

  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = savedTheme ? savedTheme === "dark" : prefersDark;

  document.documentElement.classList.toggle("dark", shouldUseDark);
  return shouldUseDark;
}

export function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      aria-pressed={darkMode}
      onClick={toggleTheme}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-900/10 bg-white/70 text-emerald-800 shadow-sm transition hover:bg-emerald-50 dark:border-white/10 dark:bg-white/10 dark:text-emerald-100 dark:hover:bg-white/15"
    >
      {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
