import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem("gp_theme");
    if (saved) {
      const isDark = saved === "dark";
      setDark(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, []);
  
  function toggle() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("gp_theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      data-testid="button-theme-toggle"
      className="rounded-full"
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}
