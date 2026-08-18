import React from "react";
import { Search, Compass, Bookmark, Cpu, Database, Settings, Tv } from "lucide-react";

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSearch: () => void;
  watchlistCount: number;
}

export default function Navbar({
  currentTab,
  onSelectTab,
  onOpenSearch,
  watchlistCount
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 apple-glass transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo / Brand */}
        <button
          onClick={() => onSelectTab("home")}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-white shadow-sm transition group-hover:bg-white/25">
            <Tv className="h-4 w-4" />
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight text-[#f5f5f7]">
              AniStream
            </span>
            <span className="ml-1.5 rounded-md bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">
              tvOS
            </span>
          </div>
        </button>

        {/* Navigation Tabs (Desktop) */}
        <div className="hidden items-center gap-1 md:flex rounded-full bg-white/5 p-1 border border-white/5">
          <button
            onClick={() => onSelectTab("home")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              currentTab === "home"
                ? "bg-white/15 text-white shadow-sm"
                : "text-[#86868b] hover:text-[#f5f5f7]"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onSelectTab("browse")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              currentTab === "browse"
                ? "bg-white/15 text-white shadow-sm"
                : "text-[#86868b] hover:text-[#f5f5f7]"
            }`}
          >
            Browse
          </button>
          <button
            onClick={() => onSelectTab("library")}
            className={`relative rounded-full px-4 py-1.5 text-xs font-medium transition ${
              currentTab === "library"
                ? "bg-white/15 text-white shadow-sm"
                : "text-[#86868b] hover:text-[#f5f5f7]"
            }`}
          >
            Library
            {watchlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white">
                {watchlistCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onSelectTab("sources")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              currentTab === "sources"
                ? "bg-white/15 text-white shadow-sm"
                : "text-[#86868b] hover:text-[#f5f5f7]"
            }`}
          >
            Sources
          </button>
          <button
            onClick={() => onSelectTab("repositories")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              currentTab === "repositories"
                ? "bg-white/15 text-white shadow-sm"
                : "text-[#86868b] hover:text-[#f5f5f7]"
            }`}
          >
            Repositories
          </button>
          <button
            onClick={() => onSelectTab("settings")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              currentTab === "settings"
                ? "bg-white/15 text-white shadow-sm"
                : "text-[#86868b] hover:text-[#f5f5f7]"
            }`}
          >
            Settings
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-xs font-medium text-[#f5f5f7] transition hover:bg-white/20 border border-white/5"
            title="Search (⌘K)"
          >
            <Search className="h-3.5 w-3.5 text-[#86868b]" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-[#86868b] sm:inline">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="flex items-center justify-around border-t border-white/5 bg-black/90 px-2 py-2 md:hidden">
        <button
          onClick={() => onSelectTab("home")}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentTab === "home" ? "text-white" : "text-[#86868b]"
          }`}
        >
          <Tv className="h-4 w-4" />
          Home
        </button>
        <button
          onClick={() => onSelectTab("browse")}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentTab === "browse" ? "text-white" : "text-[#86868b]"
          }`}
        >
          <Compass className="h-4 w-4" />
          Browse
        </button>
        <button
          onClick={() => onSelectTab("library")}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentTab === "library" ? "text-white" : "text-[#86868b]"
          }`}
        >
          <Bookmark className="h-4 w-4" />
          Library
        </button>
        <button
          onClick={() => onSelectTab("sources")}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentTab === "sources" ? "text-white" : "text-[#86868b]"
          }`}
        >
          <Cpu className="h-4 w-4" />
          Sources
        </button>
        <button
          onClick={() => onSelectTab("repositories")}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentTab === "repositories" ? "text-white" : "text-[#86868b]"
          }`}
        >
          <Database className="h-4 w-4" />
          Repos
        </button>
        <button
          onClick={() => onSelectTab("settings")}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentTab === "settings" ? "text-white" : "text-[#86868b]"
          }`}
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </nav>
  );
}
