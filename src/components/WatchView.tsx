import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, ExternalLink, ChevronLeft, ChevronRight, AlertTriangle, RefreshCw, ServerCrash } from "lucide-react";
import { Anime } from "@/types";
import { getAnime } from "@/services/anilist";

interface WatchViewProps {
  animeId: number;
  initialEpisode: number;
  onBack: () => void;
  onSelectEpisode: (ep: number) => void;
}

export default function WatchView({
  animeId,
  initialEpisode,
  onBack,
  onSelectEpisode
}: WatchViewProps) {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isChangingStream, setIsChangingStream] = useState(false);
  const [episodeNumber, setEpisodeNumber] = useState(initialEpisode);
  const [audio, setAudio] = useState<"sub" | "dub">("sub");
  const [providers, setProviders] = useState<{ id: string; name: string; description: string }[]>([
    { id: "authorized-provider", name: "Authorized Provider", description: "Default authenticated provider" },
    { id: "gogoanime", name: "GogoAnime Provider", description: "Multi-audio SUB and DUB streams" },
    { id: "zoro", name: "Zoro / HiAnime Provider", description: "High bitrate 1080p dual audio streams" },
    { id: "anilist-official", name: "AniList Official Partner", description: "Official licensed partners" },
    { id: "custom-hls", name: "Custom Direct HLS", description: "Plug & play direct streams" }
  ]);
  const [selectedProvider, setSelectedProvider] = useState<string>(() => {
    return localStorage.getItem("apple-anime-selected-provider") || "authorized-provider";
  });
  const [streamUrl, setStreamUrl] = useState<string | null>("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
  const [streamError, setStreamError] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string>("Authorized Provider");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [officialSource, setOfficialSource] = useState<any | null>(null);

  // Fetch installed providers list on mount
  useEffect(() => {
    async function fetchProviders() {
      try {
        const res = await fetch("/api/providers");
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            setProviders(list);
          }
        }
      } catch (e) {
        console.error("Failed to load providers list:", e);
      }
    }
    fetchProviders();
  }, []);

  // Load main anime metadata on mount
  useEffect(() => {
    let isSubscribed = true;
    async function loadAnimeData() {
      try {
        setInitialLoading(true);
        const data = await getAnime(animeId);
        if (isSubscribed) {
          setAnime(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isSubscribed) {
          setInitialLoading(false);
        }
      }
    }
    loadAnimeData();
    return () => {
      isSubscribed = false;
    };
  }, [animeId]);

  // Load stream metadata when episode, audio track, or provider changes
  useEffect(() => {
    let isSubscribed = true;
    async function loadStream() {
      try {
        setIsChangingStream(true);
        setStreamError(null);

        if (anime && anime.streamingEpisodes && anime.streamingEpisodes[episodeNumber - 1]) {
          setOfficialSource(anime.streamingEpisodes[episodeNumber - 1]);
        } else {
          setOfficialSource(null);
        }

        const watchRes = await fetch(`/api/watch/${animeId}/${episodeNumber}?audio=${audio}&provider=${selectedProvider}`);
        if (watchRes.ok && isSubscribed) {
          const watchData = await watchRes.json();
          if (watchData.streams && watchData.streams.length > 0) {
            const sortedStreams = [...watchData.streams].sort(
              (a, b) => parseInt(b.quality || "0") - parseInt(a.quality || "0")
            );
            const newUrl = sortedStreams[0].url;
            setStreamUrl(newUrl);
            setStreamError(null);
            if (watchData.provider) {
              setProviderName(watchData.provider);
            }
            if (watchData.providerId) {
              setSelectedProvider(watchData.providerId);
            }

            // Trigger autoplay on stream load
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.load();
                const playPromise = videoRef.current.play();
                if (playPromise !== undefined) {
                  playPromise.catch((e) => console.debug("Autoplay handled:", e));
                }
              }
            }, 100);
          } else {
            setStreamUrl(null);
            const provObj = providers.find((p) => p.id === selectedProvider);
            setStreamError(`Provider "${provObj?.name || selectedProvider}" did not return a valid stream for Episode ${episodeNumber} (${audio.toUpperCase()}).`);
          }
        } else if (isSubscribed) {
          setStreamUrl(null);
          const provObj = providers.find((p) => p.id === selectedProvider);
          setStreamError(`Provider "${provObj?.name || selectedProvider}" responded with an error when fetching Episode ${episodeNumber}.`);
        }
      } catch (err: any) {
        if (isSubscribed) {
          setStreamUrl(null);
          const provObj = providers.find((p) => p.id === selectedProvider);
          setStreamError(`Failed to connect to provider "${provObj?.name || selectedProvider}".`);
        }
      } finally {
        if (isSubscribed) {
          setIsChangingStream(false);
        }
      }
    }
    loadStream();
    return () => {
      isSubscribed = false;
      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch {}
      }
    };
  }, [animeId, episodeNumber, audio, selectedProvider, anime, providers]);

  // Handle play/pause with promise catch to prevent interrupted play errors
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        try {
          videoRef.current.pause();
        } catch {}
        setIsPlaying(false);
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((err) => {
              // Ignore play interruption error when media is reloaded or removed
              console.debug("Play call safely handled:", err);
              setIsPlaying(false);
            });
        }
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  if (initialLoading || !anime) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-[#86868b]">
        <p className="animate-pulse">Loading Apple TV player...</p>
      </div>
    );
  }

  const title = anime.title.english || anime.title.romaji;
  const official = anime.streamingEpisodes?.[episodeNumber - 1];

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] flex flex-col">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between px-6 py-4 apple-glass z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-[#86868b] hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Overview</span>
        </button>

        <div className="text-center">
          <h2 className="text-sm font-semibold text-[#f5f5f7] truncate max-w-md">
            {title}
          </h2>
          <p className="text-xs text-[#86868b]">Episode {episodeNumber}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Provider Selector Dropdown */}
          <div className="flex items-center rounded-full bg-white/10 px-3 py-1.5 border border-white/10 text-xs">
            <span className="text-[#86868b] mr-2 hidden sm:inline">Provider:</span>
            <select
              value={selectedProvider}
              onChange={(e) => {
                const newProvider = e.target.value;
                setSelectedProvider(newProvider);
                localStorage.setItem("apple-anime-selected-provider", newProvider);
              }}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub / Dub Selector */}
          <div className="flex items-center rounded-full bg-white/10 p-1 border border-white/10 text-xs">
            <button
              onClick={() => setAudio("sub")}
              className={`rounded-full px-3 py-1 font-medium transition ${
                audio === "sub" ? "bg-white text-black font-semibold shadow" : "text-[#86868b] hover:text-white"
              }`}
            >
              SUB
            </button>
            <button
              onClick={() => setAudio("dub")}
              className={`rounded-full px-3 py-1 font-medium transition ${
                audio === "dub" ? "bg-white text-black font-semibold shadow" : "text-[#86868b] hover:text-white"
              }`}
            >
              DUB
            </button>
          </div>
        </div>
      </div>

      {/* Main player arena */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full px-6 py-8">
        <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl group">
          {streamError ? (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 sm:p-8 bg-zinc-950/95 text-center backdrop-blur-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4 animate-bounce">
                <AlertTriangle className="h-7 w-7" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Stream Unavailable
              </h3>

              <p className="text-xs sm:text-sm text-[#86868b] max-w-lg mb-6 leading-relaxed">
                {streamError}
              </p>

              {/* Alternative Provider Selector */}
              <div className="w-full max-w-lg bg-zinc-900/90 border border-white/10 rounded-2xl p-4 mb-6">
                <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3 text-left">
                  Select an Alternative Provider:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {providers.map((p) => {
                    const isSelected = p.id === selectedProvider;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedProvider(p.id);
                          localStorage.setItem("apple-anime-selected-provider", p.id);
                        }}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                          isSelected
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-white/5 text-white hover:bg-white/15 border border-white/5"
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        {isSelected && (
                          <span className="ml-2 text-[10px] font-extrabold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                            Failing
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setStreamError(null);
                    const currentProv = selectedProvider;
                    setSelectedProvider("");
                    setTimeout(() => setSelectedProvider(currentProv), 50);
                  }}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition border border-white/10"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry Stream
                </button>

                <button
                  onClick={() => setAudio(audio === "sub" ? "dub" : "sub")}
                  className="rounded-full bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/30"
                >
                  Switch to {audio === "sub" ? "DUB" : "SUB"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                poster={anime.bannerImage || anime.coverImage.extraLarge || undefined}
                className="h-full w-full object-cover"
                playsInline
                controls
                autoPlay
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source
                  src={streamUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>

              {/* Provider & Audio Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
                <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white border border-white/10">
                  {providerName} ({audio.toUpperCase()})
                </span>
                {official && (
                  <a
                    href={official.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto flex items-center gap-1 rounded-full bg-blue-600/80 hover:bg-blue-600 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white transition"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {official.site}
                  </a>
                )}
              </div>

              {/* Apple TV Player Overlay Controls */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 opacity-0 transition group-hover:opacity-100 flex flex-col gap-3 pointer-events-none">
                <div className="flex items-center justify-between text-white pointer-events-auto">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition"
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-white" />}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-[#86868b]">
                      Episode {episodeNumber} of {anime.episodes || "?"}
                    </span>
                    <button
                      onClick={toggleFullscreen}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition"
                    >
                      <Maximize className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Episode selector and navigation bar */}
        <div className="mt-8 w-full flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#f5f5f7]">
              Select Episode
            </h3>

            <div className="flex items-center gap-2">
              <button
                disabled={episodeNumber <= 1}
                onClick={() => {
                  const prev = episodeNumber - 1;
                  setEpisodeNumber(prev);
                  onSelectEpisode(prev);
                }}
                className="flex items-center gap-1 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white disabled:opacity-30 hover:bg-white/20 transition"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>
              <button
                disabled={anime.episodes ? episodeNumber >= anime.episodes : false}
                onClick={() => {
                  const next = episodeNumber + 1;
                  setEpisodeNumber(next);
                  onSelectEpisode(next);
                }}
                className="flex items-center gap-1 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white disabled:opacity-30 hover:bg-white/20 transition"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
            {Array.from({ length: anime.episodes || 12 }, (_, i) => i + 1).map((ep) => (
              <button
                key={ep}
                onClick={() => {
                  setEpisodeNumber(ep);
                  onSelectEpisode(ep);
                }}
                className={`flex-shrink-0 h-12 w-14 rounded-xl text-xs font-semibold transition flex flex-col items-center justify-center ${
                  episodeNumber === ep
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                    : "bg-zinc-900 text-[#86868b] hover:bg-zinc-800 hover:text-white border border-white/5"
                }`}
              >
                <span>{ep}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
