import React, { useEffect, useState } from "react";
import { Compass, Sparkles, Flame, Calendar } from "lucide-react";
import { AnimeSearchResult } from "@/types";
import { getTrendingAnime, getPopularAnime, getCurrentSeasonAnime } from "@/services/anilist";
import AnimeCard from "./AnimeCard";

interface BrowseViewProps {
  onSelectAnime: (animeId: number) => void;
}

export default function BrowseView({ onSelectAnime }: BrowseViewProps) {
  const [activeTab, setActiveTab] = useState<"trending" | "popular" | "season">("trending");
  const [list, setList] = useState<AnimeSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        let data: AnimeSearchResult[] = [];
        if (activeTab === "trending") {
          data = await getTrendingAnime();
        } else if (activeTab === "popular") {
          data = await getPopularAnime();
        } else if (activeTab === "season") {
          data = await getCurrentSeasonAnime();
        }
        setList(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeTab]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 min-h-screen">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#f5f5f7]">
            Browse Catalog
          </h1>
          <p className="mt-2 text-sm text-[#86868b]">
            Explore curated anime series, seasonal hits, and trending masterpieces.
          </p>
        </div>

        {/* Tab pills */}
        <div className="flex gap-2 rounded-full bg-zinc-950 p-1.5 border border-white/10">
          <button
            onClick={() => setActiveTab("trending")}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${
              activeTab === "trending" ? "bg-white text-black shadow-md font-semibold" : "text-[#86868b] hover:text-white"
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            Trending
          </button>
          <button
            onClick={() => setActiveTab("popular")}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${
              activeTab === "popular" ? "bg-white text-black shadow-md font-semibold" : "text-[#86868b] hover:text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Most Popular
          </button>
          <button
            onClick={() => setActiveTab("season")}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${
              activeTab === "season" ? "bg-white text-black shadow-md font-semibold" : "text-[#86868b] hover:text-white"
            }`}
          >
            <Calendar className="h-3.5 w-3.5 text-emerald-400" />
            This Season
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <p className="text-sm text-[#86868b] animate-pulse">Loading browse catalog...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {list.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              onClick={onSelectAnime}
            />
          ))}
        </div>
      )}
    </main>
  );
}
