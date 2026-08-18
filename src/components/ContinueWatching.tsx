import React, { useRef, useEffect } from "react";
import { Play } from "lucide-react";
import { WatchHistoryItem } from "@/types";

interface ContinueWatchingProps {
  items: WatchHistoryItem[];
  onSelect: (animeId: number, episodeNumber: number) => void;
  onRemove: (animeId: number) => void;
  focusedItemIndex?: number | null;
}

function ContinueWatchingCard({
  item,
  onSelect,
  isFocused
}: {
  item: WatchHistoryItem;
  onSelect: (animeId: number, episodeNumber: number) => void;
  isFocused: boolean;
  key?: React.Key;
}) {
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
      onClick={() => onSelect(item.animeId, item.episodeNumber)}
      className={`group relative flex-shrink-0 w-64 cursor-pointer select-none rounded-2xl p-2.5 transition-all duration-300 border snap-start shadow-xl ${
        isFocused
          ? "scale-[1.08] z-30 bg-zinc-900 border-blue-400 ring-4 ring-blue-500/80 shadow-[0_0_30px_rgba(59,130,246,0.6)]"
          : "scale-100 bg-zinc-900/60 border-white/5 hover:scale-[1.02] hover:bg-zinc-900 hover:border-white/15"
      }`}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-950">
        {item.cover ? (
          <img
            src={item.cover}
            alt={item.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[#86868b]">
            No Image
          </div>
        )}

        {/* Play button overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/40 transition ${
            isFocused ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg transform transition group-hover:scale-110">
            <Play className="h-5 w-5 fill-black ml-0.5" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-3 px-1">
        <h3
          className={`truncate font-medium text-sm transition ${
            isFocused ? "text-blue-400 font-semibold" : "text-[#f5f5f7]"
          }`}
        >
          {item.title}
        </h3>
        <div className="mt-1 flex items-center justify-between text-xs text-[#86868b]">
          <span>Episode {item.episodeNumber}</span>
          <span>{item.progress}%</span>
        </div>
      </div>
    </div>
  );
}

export default function ContinueWatching({
  items,
  onSelect,
  focusedItemIndex = null
}: ContinueWatchingProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-[#f5f5f7]">
          Continue Watching
        </h2>
        <span className="text-xs text-[#86868b]">
          {items.length} active
        </span>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth snap-x">
        {items.map((item, idx) => (
          <ContinueWatchingCard
            key={item.animeId}
            item={item}
            onSelect={onSelect}
            isFocused={focusedItemIndex === idx}
          />
        ))}
      </div>
    </section>
  );
}
