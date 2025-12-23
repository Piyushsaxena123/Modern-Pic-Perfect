import { Search, LogIn, Menu } from "lucide-react";

interface TopBarProps {
  onMenuClick: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const TopBar = ({ onMenuClick, searchQuery, onSearchChange }: TopBarProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 lg:left-72">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 text-foreground hover:text-primary transition-colors lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Bar - Centered */}
        <div className="flex-1 flex justify-center px-4 md:px-12">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Collage, Resize..."
              className="search-input pr-12"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-secondary hover:bg-muted rounded-full transition-colors duration-300">
              <Search className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background font-medium rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 opacity-0 animate-slide-in-right whitespace-nowrap">
          <LogIn className="w-4 h-4" />
          <span className="hidden sm:inline">Login</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
