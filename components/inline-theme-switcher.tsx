"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"

export function InlineThemeSwitcher() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1">
        <div className="w-8 h-8 rounded-full flex items-center justify-center">
          <Sun className="h-4 w-4" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 space-x-1">
      <button
        onClick={() => setTheme("light")}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          theme === "light" 
            ? "bg-white dark:bg-gray-700 shadow-sm" 
            : "hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
      >
        <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </button>
      
      <button
        onClick={() => setTheme("system")}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          theme === "system" 
            ? "bg-white dark:bg-gray-700 shadow-sm" 
            : "hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
      >
        <Monitor className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </button>
      
      <button
        onClick={() => setTheme("dark")}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          theme === "dark" 
            ? "bg-white dark:bg-gray-700 shadow-sm" 
            : "hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
      >
        <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  )
}