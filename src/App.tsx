import React, { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ContinueWatching from "@/components/ContinueWatching";
import AnimeRail from "@/components/AnimeRail";
import SpotlightSearch from "@/components/SpotlightSearch";
import AnimeDetailModal from "@/components/AnimeDetailModal";
import WatchView from "@/components/WatchView";
import BrowseView from "@/components/BrowseView";
import LibraryView from "@/components/LibraryView";
import SourcesView from "@/components/SourcesView";
import RepositoriesView from "@/components/RepositoriesView";
import SettingsView from "@/components/SettingsView";

import { AnimeSearchResult, WatchHistoryItem, Repository, InstalledSource } from "@/types";
import { getTrendingAnime, getPopularAnime, getCurrentSeasonAnime } from "@/services/anilist";
import { DEFAULT_REPOSITORIES, fetchRepository } from "@/services/repositories";
import { useFocusNavigation, RailData } from "@/hooks/useFocusNavigation";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [selectedAnimeId, setSelectedAnimeId] = useState<number | null>(null);
  const [watchSession, setWatchSession] = useState<{ animeId: number; episodeNumber: number } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Home data
  const [trending, setTrending] = useState<AnimeSearchResult[]>([]);
  const [popular, setPopular] = useState<AnimeSearchResult[]>([]);
  const [season, setSeason] = useState<AnimeSearchResult[]>([]);
  const [loadingHome, setLoadingHome] = useState(true);

  // Persistence state
  const [watchlist, setWatchlist] = useState<AnimeSearchResult[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [sources, setSources] = useState<InstalledSource[]>([]);

  // Load persistence and fetch home data on mount
  useEffect(() => {
    // 1. Load LocalStorage
    const savedWatchlist = localStorage.getItem("apple-anime-watchlist");
    if (savedWatchlist) {
      try { setWatchlist(JSON.parse(savedWatchlist)); } catch {}
    }

    const savedHistory = localStorage.getItem("apple-anime-history");
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch {}
    }

    const savedRepos = localStorage.getItem("apple-anime-repos");
    if (savedRepos) {
      try { setRepos(JSON.parse(savedRepos)); } catch {}
    } else {
      // Seed default repositories
      fetchRepository(DEFAULT_REPOSITORIES[0].url)
        .then((repo) => {
          setRepos([repo]);
          localStorage.setItem("apple-anime-repos", JSON.stringify([repo]));
          // Seed sources
          if (repo.extensions.length > 0) {
            const initialSources: InstalledSource[] = repo.extensions.slice(0, 3).map((ext) => ({
              id: ext.id,
              repositoryId: repo.id,
              name: ext.name,
              icon: ext.icon,
              enabled: true,
              lang: ext.lang
            }));
            setSources(initialSources);
            localStorage.setItem("apple-anime-sources", JSON.stringify(initialSources));
          }
        })
        .catch(() => {});
    }

    const savedSources = localStorage.getItem("apple-anime-sources");
    if (savedSources) {
      try { setSources(JSON.parse(savedSources)); } catch {}
    }

    // 2. Fetch Home Catalog
    async function loadHome() {
      try {
        setLoadingHome(true);
        const [t, p, s] = await Promise.all([
          getTrendingAnime(),
          getPopularAnime(),
          getCurrentSeasonAnime()
        ]);
        setTrending(t);
        setPopular(p);
        setSeason(s);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingHome(false);
      }
    }
    loadHome();
  }, []);

  // Save watchlist helper
  const updateWatchlist = (newList: AnimeSearchResult[]) => {
    setWatchlist(newList);
    localStorage.setItem("apple-anime-watchlist", JSON.stringify(newList));
  };

  const handleToggleWatchlist = (anime: AnimeSearchResult) => {
    const exists = watchlist.some((item) => item.id === anime.id);
    if (exists) {
      updateWatchlist(watchlist.filter((item) => item.id !== anime.id));
    } else {
      updateWatchlist([...watchlist, anime]);
    }
  };

  // Add history helper
  const recordHistory = (animeId: number, title: string, cover: string | null, episodeNumber: number) => {
    const newItem: WatchHistoryItem = {
      animeId,
      title,
      cover,
      episodeNumber,
      progress: 72,
      timestamp: Date.now()
    };
    const filtered = history.filter((h) => h.animeId !== animeId);
    const updated = [newItem, ...filtered];
    setHistory(updated);
    localStorage.setItem("apple-anime-history", JSON.stringify(updated));
  };

  // Watch action
  const handleWatch = (animeId: number, episodeNumber: number = 1) => {
    // Find anime in trending/popular/season or watchlist to grab title/cover
    const found = [...trending, ...popular, ...season, ...watchlist].find((a) => a.id === animeId);
    if (found) {
      recordHistory(animeId, found.title, found.cover, episodeNumber);
    }
    setWatchSession({ animeId, episodeNumber });
    setSelectedAnimeId(null);
  };

  // Focus navigation rails setup for TV / Keyboard D-Pad
  const homeRailsConfig = useMemo(() => {
    const list: RailData[] = [];

    if (history.length > 0) {
      list.push({
        id: "history",
        count: history.length,
        onSelect: (idx) => {
          const item = history[idx];
          if (item) handleWatch(item.animeId, item.episodeNumber);
        }
      });
    }

    if (trending.length > 0) {
      list.push({
        id: "trending",
        count: trending.length,
        onSelect: (idx) => {
          const item = trending[idx];
          if (item) setSelectedAnimeId(item.id);
        }
      });
    }

    if (season.length > 0) {
      list.push({
        id: "season",
        count: season.length,
        onSelect: (idx) => {
          const item = season[idx];
          if (item) setSelectedAnimeId(item.id);
        }
      });
    }

    if (popular.length > 0) {
      list.push({
        id: "popular",
        count: popular.length,
        onSelect: (idx) => {
          const item = popular[idx];
          if (item) setSelectedAnimeId(item.id);
        }
      });
    }

    return list;
  }, [history, trending, season, popular]);

  const { focus, isKeyboardActive } = useFocusNavigation(
    homeRailsConfig,
    currentTab === "home" && !selectedAnimeId && !watchSession && !isSearchOpen
  );

  // Determine rail index order for rendering
  let railIdxCounter = 0;
  const historyRailIdx = history.length > 0 ? railIdxCounter++ : -1;
  const trendingRailIdx = trending.length > 0 ? railIdxCounter++ : -1;
  const seasonRailIdx = season.length > 0 ? railIdxCounter++ : -1;
  const popularRailIdx = popular.length > 0 ? railIdxCounter++ : -1;

  // If in watch session, render fullscreen watch view
  if (watchSession) {
    return (
      <WatchView
        animeId={watchSession.animeId}
        initialEpisode={watchSession.episodeNumber}
        onBack={() => setWatchSession(null)}
        onSelectEpisode={(ep) => {
          setWatchSession({ animeId: watchSession.animeId, episodeNumber: ep });
        }}
      />
    );
  }

  const heroAnime = trending[0] || null;

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        watchlistCount={watchlist.length}
      />

      <div className="flex-1">
        {currentTab === "home" && (
          <div>
            <Hero
              anime={heroAnime}
              onWatch={(id) => handleWatch(id, 1)}
              onDetails={(id) => setSelectedAnimeId(id)}
              isWatchlisted={heroAnime ? watchlist.some((w) => w.id === heroAnime.id) : false}
              onToggleWatchlist={handleToggleWatchlist}
            />

            <ContinueWatching
              items={history}
              onSelect={(animeId, ep) => handleWatch(animeId, ep)}
              onRemove={(animeId) => {
                const next = history.filter((h) => h.animeId !== animeId);
                setHistory(next);
                localStorage.setItem("apple-anime-history", JSON.stringify(next));
              }}
              focusedItemIndex={
                isKeyboardActive && focus.railIndex === historyRailIdx
                  ? focus.itemIndex
                  : null
              }
            />

            {loadingHome ? (
              <div className="py-24 text-center text-[#86868b] animate-pulse">
                Loading Apple TV catalog...
              </div>
            ) : (
              <div className="space-y-4 pb-16">
                <AnimeRail
                  title="Trending Now"
                  animeList={trending}
                  onSelectAnime={(id) => setSelectedAnimeId(id)}
                  onSeeAll={() => setCurrentTab("browse")}
                  focusedItemIndex={
                    isKeyboardActive && focus.railIndex === trendingRailIdx
                      ? focus.itemIndex
                      : null
                  }
                />
                <AnimeRail
                  title="Popular This Season"
                  animeList={season}
                  onSelectAnime={(id) => setSelectedAnimeId(id)}
                  onSeeAll={() => setCurrentTab("browse")}
                  focusedItemIndex={
                    isKeyboardActive && focus.railIndex === seasonRailIdx
                      ? focus.itemIndex
                      : null
                  }
                />
                <AnimeRail
                  title="All-Time Favorites"
                  animeList={popular}
                  onSelectAnime={(id) => setSelectedAnimeId(id)}
                  onSeeAll={() => setCurrentTab("browse")}
                  focusedItemIndex={
                    isKeyboardActive && focus.railIndex === popularRailIdx
                      ? focus.itemIndex
                      : null
                  }
                />
              </div>
            )}
          </div>
        )}

        {currentTab === "browse" && (
          <BrowseView onSelectAnime={(id) => setSelectedAnimeId(id)} />
        )}

        {currentTab === "library" && (
          <LibraryView
            watchlist={watchlist}
            history={history}
            onSelectAnime={(id) => setSelectedAnimeId(id)}
            onWatchHistory={(id, ep) => handleWatch(id, ep)}
          />
        )}

        {currentTab === "sources" && (
          <SourcesView
            sources={sources}
            onToggleSource={(sourceId) => {
              const next = sources.map((s) => s.id === sourceId ? { ...s, enabled: !s.enabled } : s);
              setSources(next);
              localStorage.setItem("apple-anime-sources", JSON.stringify(next));
            }}
            onGoToRepositories={() => setCurrentTab("repositories")}
          />
        )}

        {currentTab === "repositories" && (
          <RepositoriesView
            repos={repos}
            sources={sources}
            onAddRepo={(repo) => {
              const next = [...repos.filter((r) => r.url !== repo.url), repo];
              setRepos(next);
              localStorage.setItem("apple-anime-repos", JSON.stringify(next));
            }}
            onRemoveRepo={(repoId) => {
              const next = repos.filter((r) => r.id !== repoId);
              setRepos(next);
              localStorage.setItem("apple-anime-repos", JSON.stringify(next));
            }}
            onInstallExtension={(repo, ext) => {
              if (sources.some((s) => s.id === ext.id)) return;
              const newSrc: InstalledSource = {
                id: ext.id,
                repositoryId: repo.id,
                name: ext.name,
                icon: ext.icon,
                enabled: true,
                lang: ext.lang
              };
              const nextSources = [...sources, newSrc];
              setSources(nextSources);
              localStorage.setItem("apple-anime-sources", JSON.stringify(nextSources));
            }}
          />
        )}

        {currentTab === "settings" && <SettingsView />}
      </div>

      {/* Spotlight Search Modal */}
      <SpotlightSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAnime={(id) => setSelectedAnimeId(id)}
      />

      {/* Anime Detail Modal */}
      <AnimeDetailModal
        animeId={selectedAnimeId}
        onClose={() => setSelectedAnimeId(null)}
        onWatch={(id, ep) => handleWatch(id, ep)}
        isWatchlisted={selectedAnimeId ? watchlist.some((w) => w.id === selectedAnimeId) : false}
        onToggleWatchlist={handleToggleWatchlist}
      />

      {/* Apple TV D-Pad Focus Indicator */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-xs font-medium text-[#86868b] backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300">
        <span className="flex items-center gap-1 font-mono text-blue-400 font-semibold bg-white/10 px-1.5 py-0.5 rounded">
          ← ↑ ↓ →
        </span>
        <span>Apple TV Remote / Arrow Keys active</span>
      </div>
    </div>
  );
}
