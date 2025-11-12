import { Menu } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick?: () => void;
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
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
