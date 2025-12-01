"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
        <button 
            disabled 
            className="flex items-center justify-center p-2 rounded-md border border-border text-muted-foreground opacity-50"
        >
            <Sun className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Toggle theme</span>
        </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center justify-center p-2 rounded-md border border-border hover:border-cyan-500/50 text-foreground/80 hover:text-cyan-400 hover:bg-muted dark:hover:bg-slate-900 transition-all cursor-pointer"
      aria-label="Toggle theme"
    >
        {theme === 'dark' ? (
             <Sun className="h-[1.2rem] w-[1.2rem]" />
        ) : (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
        )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

