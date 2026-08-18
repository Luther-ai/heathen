import React, { useEffect, useState } from "react";
import { Play, Plus, Check, Star, X, Calendar, Clock, Film } from "lucide-react";
import { Anime } from "@/types";
import { getAnime } from "@/services/anilist";

interface AnimeDetailModalProps {
  animeId: number | null;
  onClose: () => void;
  onWatch: (animeId: number, episodeNumber: number) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (anime: any) => void;
}

export default function AnimeDetailModal({
  animeId,
  onClose,
  onWatch,
  isWatchlisted,
  onToggleWatchlist
}: AnimeDetailModalProps) {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  useEffect(() => {
    if (!animeId) {
      setAnime(null);
      return;
    }

    async function load() {
      try {
        setLoading(true);
        const data = await getAnime(animeId!);
        setAnime(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [animeId]);

  if (!animeId) return null;

  const title = anime?.title.english || anime?.title.romaji || "Loading...";
  const cover = anime?.coverImage.extraLarge || anime?.coverImage.large;
  const banner = anime?.bannerImage || cover;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-xl overflow-y-auto animate-fadeIn">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-5xl rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition border border-white/10"
        >
          <X className="h-5 w-5" />
        </button>

        {loading || !anime ? (
          <div className="flex h-96 items-center justify-center">
            <div className="text-sm text-[#86868b] animate-pulse">Loading cinematic overview...</div>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {/* Cinematic banner header */}
            <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-zinc-900">
              {banner && (
                <img
                  src={banner}
                  alt={title}
                  className="h-full w-full object-cover filter blur-[2px] transform scale-105"
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(9,9,11,0.8) 75%, #09090b 100%)
                  `
                }}
              />

              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end gap-6">
                <div className="hidden sm:block h-48 w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-zinc-900 border border-white/15 shadow-2xl">
                  {cover && (
                    <img src={cover} alt={title} className="h-full w-full object-cover" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-[#86868b]">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-white backdrop-blur-md border border-white/5">
                      {anime.format || "TV Series"}
                    </span>
                    <span>•</span>
                    <span>{anime.seasonYear || "2026"}</span>
                    <span>•</span>
                    <span>{anime.status}</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-bold text-[#f5f5f7] tracking-tight">
                    {title}
                  </h1>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <span
                        key={genre}
                        className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-[#86868b] border border-white/5"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Content body */}
            <div className="p-6 sm:p-10 space-y-8">
              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => {
                    onClose();
                    onWatch(anime.id, selectedEpisode);
                  }}
                  className="flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-95 shadow-lg"
                >
                  <Play className="h-4 w-4 fill-black" />
                  Play Episode {selectedEpisode}
                </button>

                <button
                  onClick={() =>
                    onToggleWatchlist({
                      id: anime.id,
                      title,
                      cover,
                      banner,
                      episodes: anime.episodes,
                      year: anime.seasonYear,
                      score: anime.averageScore
                    })
                  }
                  className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3.5 text-sm font-semibold text-[#f5f5f7] backdrop-blur-xl transition hover:bg-white/20 active:scale-95 border border-white/10"
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
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-zinc-900/60 p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-xs text-[#86868b]">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    AniList Score
                  </div>
                  <div className="mt-2 text-xl font-semibold text-[#f5f5f7]">
                    {anime.averageScore ? `${anime.averageScore}%` : "N/A"}
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-900/60 p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-xs text-[#86868b]">
                    <Film className="h-4 w-4 text-blue-400" />
                    Total Episodes
                  </div>
                  <div className="mt-2 text-xl font-semibold text-[#f5f5f7]">
                    {anime.episodes || "Ongoing"}
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-900/60 p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-xs text-[#86868b]">
                    <Clock className="h-4 w-4 text-purple-400" />
                    Episode Duration
                  </div>
                  <div className="mt-2 text-xl font-semibold text-[#f5f5f7]">
                    {anime.duration ? `${anime.duration} min` : "24 min"}
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-900/60 p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-xs text-[#86868b]">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    Release Season
                  </div>
                  <div className="mt-2 text-xl font-semibold text-[#f5f5f7]">
                    {anime.season} {anime.seasonYear}
                  </div>
                </div>
              </div>

              {/* Synopsis */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#f5f5f7]">Synopsis</h3>
                <p className="text-sm leading-relaxed text-[#86868b]">
                  {anime.description || "No synopsis available for this title."}
                </p>
              </div>

              {/* Episode selector */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#f5f5f7]">Episodes</h3>
                  <span className="text-xs text-[#86868b]">
                    Select episode to stream
                  </span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 max-h-60 overflow-y-auto p-1">
                  {Array.from({ length: anime.episodes || 12 }, (_, i) => i + 1).map((ep) => (
                    <button
                      key={ep}
                      onClick={() => setSelectedEpisode(ep)}
                      className={`flex h-11 items-center justify-center rounded-xl text-xs font-semibold transition ${
                        selectedEpisode === ep
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                          : "bg-zinc-900 text-[#f5f5f7] hover:bg-zinc-800 border border-white/5"
                      }`}
                    >
                      {ep}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
