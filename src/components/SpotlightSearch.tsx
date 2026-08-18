import React, { useEffect, useState, useRef } from "react";
import { Search, X, Star, Loader2 } from "lucide-react";
import { AnimeSearchResult } from "@/types";
import { searchAnime } from "@/services/anilist";

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAnime: (animeId: number) => void;
}

export default function SpotlightSearch({
  isOpen,
  onClose,
  onSelectAnime
}: SpotlightSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnimeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Keyboard shortcut ⌘K / Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // Toggle handled by parent or window listener
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await searchAnime(trimmed);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden z-10">
        {/* Search input header */}
        <div className="flex items-center px-5 py-4 border-b border-white/10 bg-zinc-900/50">
          <Search className="h-5 w-5 text-[#86868b] mr-3" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anime, movies, series..."
            className="flex-1 bg-transparent text-lg text-[#f5f5f7] placeholder:text-[#86868b] outline-none"
          />
          {loading && <Loader2 className="h-5 w-5 text-blue-400 animate-spin mr-2" />}
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[#86868b] hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2">
          {!query && (
            <div className="py-12 text-center text-[#86868b]">
              <p className="text-sm">Type to search across AniList repository</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["One Piece", "Demon Slayer", "Naruto", "Jujutsu Kaisen", "Attack on Titan"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-[#f5f5f7] hover:bg-white/10 transition border border-white/5"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && !loading && results.length === 0 && (
            <div className="py-12 text-center text-[#86868b]">
              <p className="text-sm">No anime found matching "{query}"</p>
            </div>
          )}

          {results.map((anime) => (
            <div
              key={anime.id}
              onClick={() => {
                onSelectAnime(anime.id);
                onClose();
              }}
              className="flex items-center gap-4 rounded-xl p-3 hover:bg-white/10 cursor-pointer transition group"
            >
              <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-900 border border-white/5">
                {anime.cover && (
                  <img
                    src={anime.cover}
                    alt={anime.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-[#f5f5f7] truncate group-hover:text-blue-400 transition">
                  {anime.title}
                </h4>
                <div className="mt-1 flex items-center gap-3 text-xs text-[#86868b]">
                  <span>{anime.year || "—"}</span>
                  <span>•</span>
                  <span>{anime.episodes ? `${anime.episodes} episodes` : "Series"}</span>
                  {anime.score && (
                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                      <Star className="h-3 w-3 fill-amber-400" />
                      {anime.score}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
