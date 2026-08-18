import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimeSearchResult } from "@/types";
import AnimeCard from "./AnimeCard";

interface AnimeRailProps {
  title: string;
  animeList: AnimeSearchResult[];
  onSelectAnime: (animeId: number) => void;
  onSeeAll?: () => void;
  focusedItemIndex?: number | null;
}

export default function AnimeRail({
  title,
  animeList,
  onSelectAnime,
  onSeeAll,
  focusedItemIndex = null
}: AnimeRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const offset = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: "smooth" });
    }
  };

  if (!animeList || animeList.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-[#f5f5f7]">
          {title}
        </h2>

        <div className="flex items-center gap-3">
          {onSeeAll && (
            <button
              onClick={onSeeAll}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 transition"
            >
              See All →
            </button>
          )}

          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => scroll("left")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-[#f5f5f7] border border-white/5 transition"
              title="Scroll Left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-[#f5f5f7] border border-white/5 transition"
              title="Scroll Right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative group/rail">
        {/* Edge fade gradient indicators */}
        <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-black/80 to-transparent pointer-events-none z-10 opacity-60 transition-opacity" />
        <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-black/80 to-transparent pointer-events-none z-10 opacity-60 transition-opacity" />

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {animeList.map((anime, idx) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              onClick={onSelectAnime}
              isFocused={focusedItemIndex === idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
