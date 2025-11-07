import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="outline"
      size="icon"
      className="size-8 rounded-md"
      onClick={() => {
        setTheme(theme == "dark" ? "light" : "dark");
      }}
    >
      <SunIcon className="dark:-rotate-90 h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:scale-0" />
      <MoonIcon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle mode</span>
    </Button>
  );
};

export default ThemeToggle;
