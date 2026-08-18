import React, { useRef, useEffect } from "react";
import { Star } from "lucide-react";
import { AnimeSearchResult } from "@/types";

interface AnimeCardProps {
  anime: AnimeSearchResult;
  onClick: (animeId: number) => void;
  isFocused?: boolean;
  key?: string | number;
}

export default function AnimeCard({ anime, onClick, isFocused }: AnimeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });
    }
  }, [isFocused]);

  return (
    <div
      ref={cardRef}
      onClick={() => onClick(anime.id)}
      className={`group flex-shrink-0 w-48 cursor-pointer select-none flex flex-col snap-start transition-all duration-300 ${
        isFocused ? "scale-[1.08] z-30" : "scale-100"
      }`}
    >
      <div
        className={`relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-900 border transition-all duration-300 ${
          isFocused
            ? "border-blue-400 ring-4 ring-blue-500/80 shadow-[0_0_30px_rgba(59,130,246,0.6)]"
            : "border-white/5 group-hover:scale-[1.03] group-hover:shadow-2xl group-hover:border-white/20"
        }`}
      >
        {anime.cover ? (
          <img
            src={anime.cover}
            alt={anime.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[#86868b]">
            No Cover
          </div>
        )}

        {/* Score badge */}
        {anime.score && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md border border-white/10">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {anime.score}%
          </div>
        )}
      </div>

      <div className="mt-2.5 px-0.5">
        <h3
          className={`truncate text-sm font-medium transition ${
            isFocused ? "text-blue-400 font-semibold" : "text-[#f5f5f7] group-hover:text-blue-400"
          }`}
        >
          {anime.title}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-[#86868b]">
          <span>{anime.year || "—"}</span>
          <span>•</span>
          <span>{anime.episodes ? `${anime.episodes} eps` : "Series"}</span>
        </div>
      </div>
    </div>
  );
}
