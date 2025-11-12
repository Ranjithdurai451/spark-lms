import { Sparkles, Menu } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick?: () => void; // Optional for mobile sidebar toggle
}

const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="w-full border-b  border-border  bg-background sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Button */}
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-md hover:bg-accent hover:text-accent-foreground transition"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}

          {/* Logo + Title */}
          {/* <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                SparkLMS
              </h1>
            </div>
            <span className="hidden sm:inline text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md border border-border">
              Modern Leave Management Made Simple
            </span>
          </div> */}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* <ThemeToggle /> */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
