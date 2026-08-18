import React from "react";
import { Play, Plus, Check, Star, Info } from "lucide-react";
import { AnimeSearchResult } from "@/types";

interface HeroProps {
  anime: AnimeSearchResult | null;
  onWatch: (animeId: number) => void;
  onDetails: (animeId: number) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (anime: AnimeSearchResult) => void;
}

export default function Hero({
  anime,
  onWatch,
  onDetails,
  isWatchlisted,
  onToggleWatchlist
}: HeroProps) {
  if (!anime) {
    return (
      <div className="relative h-[65vh] min-h-[500px] w-full bg-zinc-950 animate-pulse flex items-end p-12">
        <div className="max-w-2xl space-y-4">
          <div className="h-6 w-32 bg-white/10 rounded" />
          <div className="h-14 w-96 bg-white/10 rounded" />
          <div className="h-20 w-full bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  const bgImage = anime.banner || anime.cover;

  return (
    <div className="relative h-[72vh] min-h-[540px] w-full overflow-hidden bg-black select-none">
      {/* Background artwork with Apple TV cinematic gradient overlay */}
      {bgImage && (
        <div className="absolute inset-0">
          <img
            src={bgImage}
            alt={anime.title}
            className="h-full w-full object-cover object-center filter blur-[1px] transform scale-105 transition duration-1000"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.1) 75%),
                linear-gradient(0deg, #000000 0%, rgba(0,0,0,0.4) 40%, transparent 100%)
              `
            }}
          />
        </div>
      )}

      {/* Content wrapper */}
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16 pt-32">
        <div className="max-w-2xl">
          {/* Metadata pill */}
          <div className="flex items-center gap-3 mb-3 text-xs font-medium text-[#86868b]">
            {anime.score && (
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-white backdrop-blur-md">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {anime.score}% AniList
              </span>
            )}
            <span>{anime.year || "2026"}</span>
            <span>•</span>
            <span>{anime.episodes ? `${anime.episodes} Episodes` : "Series"}</span>
          </div>

          {/* Hero title */}
          <h1 className="text-4xl font-bold tracking-tight text-[#f5f5f7] sm:text-6xl md:text-7xl leading-[1.05]">
            {anime.title}
          </h1>

          {/* Subtitle / summary */}
          <p className="mt-4 text-sm sm:text-base text-[#86868b] line-clamp-2 max-w-xl font-normal leading-relaxed">
            Experience the cinematic journey of {anime.title}. Stream in pristine high definition with complete episode navigation and chapter support.
          </p>

          {/* Action buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onWatch(anime.id)}
              className="flex items-center gap-2.5 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-95 shadow-lg shadow-white/10"
            >
              <Play className="h-4 w-4 fill-black" />
              Watch Now
            </button>

            <button
              onClick={() => onToggleWatchlist(anime)}
              className="flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-[#f5f5f7] backdrop-blur-xl transition hover:bg-white/25 active:scale-95 border border-white/10"
            >
              {isWatchlisted ? (
                <>
                  <Check className="h-4 w-4 text-blue-400" />
                  In Library
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  + Library
                </>
              )}
            </button>

            <button
              onClick={() => onDetails(anime.id)}
              className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-[#f5f5f7] backdrop-blur-xl transition hover:bg-white/20 active:scale-95 border border-white/5"
            >
              <Info className="h-4 w-4 text-[#86868b]" />
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
