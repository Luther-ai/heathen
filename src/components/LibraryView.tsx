import React, { useState, useEffect } from "react";
import { Bookmark, Clock, Heart, Play, WifiOff, CheckCircle2 } from "lucide-react";
import { AnimeSearchResult, WatchHistoryItem } from "@/types";
import AnimeCard from "./AnimeCard";

interface LibraryViewProps {
  watchlist: AnimeSearchResult[];
  history: WatchHistoryItem[];
  onSelectAnime: (animeId: number) => void;
  onWatchHistory: (animeId: number, episodeNumber: number) => void;
}

export default function LibraryView({
  watchlist,
  history,
  onSelectAnime,
  onWatchHistory
}: LibraryViewProps) {
  const [activeTab, setActiveTab] = useState<"watchlist" | "history">("watchlist");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 min-h-screen">
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#f5f5f7]">
              Library
            </h1>
            <p className="mt-2 text-sm text-[#86868b]">
              Your personal collection of saved anime series and watch history.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3.5 py-1.5 text-xs text-[#86868b]">
            {isOffline ? (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-amber-300 font-medium">Offline Mode • Cached via SW</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Offline Ready • SW Active</span>
              </>
            )}
          </div>
        </div>

        {/* Library Tabs */}
        <div className="mt-6 flex gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("watchlist")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition ${
              activeTab === "watchlist"
                ? "bg-white text-black shadow-md font-semibold"
                : "bg-white/5 text-[#86868b] hover:text-white"
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            Watchlist ({watchlist.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition ${
              activeTab === "history"
                ? "bg-white text-black shadow-md font-semibold"
                : "bg-white/5 text-[#86868b] hover:text-white"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Watch History ({history.length})
          </button>
        </div>
      </div>

      {activeTab === "watchlist" && (
        <div>
          {watchlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl bg-zinc-950 border border-white/10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 mb-4 text-[#86868b]">
                <Bookmark className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-[#f5f5f7]">Your watchlist is empty</h3>
              <p className="mt-1 text-sm text-[#86868b] max-w-sm">
                Explore trending anime or use search to add titles to your personal Apple TV library.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {watchlist.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  onClick={onSelectAnime}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl bg-zinc-950 border border-white/10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 mb-4 text-[#86868b]">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-[#f5f5f7]">No watch history</h3>
              <p className="mt-1 text-sm text-[#86868b] max-w-sm">
                Episodes you start watching will appear here for instant resumption.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {history.map((item) => (
                <div
                  key={item.animeId}
                  onClick={() => onWatchHistory(item.animeId, item.episodeNumber)}
                  className="flex gap-4 rounded-2xl bg-zinc-950 border border-white/10 p-4 hover:border-white/25 cursor-pointer transition group"
                >
                  <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                    {item.cover && (
                      <img src={item.cover} alt={item.title} className="h-full w-full object-cover" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                      <Play className="h-5 w-5 fill-white text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <h4 className="font-semibold text-sm text-[#f5f5f7] truncate group-hover:text-blue-400 transition">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-xs text-[#86868b]">Episode {item.episodeNumber}</p>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
