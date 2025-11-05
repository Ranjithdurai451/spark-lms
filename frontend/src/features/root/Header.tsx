import { MoonIcon, Sparkles, SunIcon } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
const Header = () => {
  const { theme, setTheme } = useTheme();
  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-50">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              SparkLMS
            </h1>
          </div>
          <div className="hidden sm:block text-xs text-muted-foreground bg-muted px-2 py-1 rounded border">
            Modern Leave Management Made Simple
          </div>
        </div>

        <div className="flex items-center gap-2">
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

          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
