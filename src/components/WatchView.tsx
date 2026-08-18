import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [episodeNumber, setEpisodeNumber] = useState(initialEpisode);
  const [audio, setAudio] = useState<"sub" | "dub">("sub");
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string>("Authorized Provider");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [officialSource, setOfficialSource] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getAnime(animeId);
        setAnime(data);
        if (data && data.streamingEpisodes && data.streamingEpisodes[episodeNumber - 1]) {
          setOfficialSource(data.streamingEpisodes[episodeNumber - 1]);
        }

        // Fetch watch stream from backend provider API
        const watchRes = await fetch(`/api/watch/${animeId}/${episodeNumber}?audio=${audio}`);
        if (watchRes.ok) {
          const watchData = await watchRes.json();
          if (watchData.streams && watchData.streams.length > 0) {
            // Pick highest quality stream (e.g., HLS or MP4)
            const sortedStreams = [...watchData.streams].sort(
              (a, b) => parseInt(b.quality || "0") - parseInt(a.quality || "0")
            );
            setStreamUrl(sortedStreams[0].url);
            if (watchData.provider) {
              setProviderName(watchData.provider);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [animeId, episodeNumber, audio]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
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

  if (loading || !anime) {
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
          {official ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
              <div className="mb-4 overflow-hidden rounded-2xl shadow-xl">
                {official.thumbnail ? (
                  <img src={official.thumbnail} alt="" className="h-36 w-64 object-cover" />
                ) : anime.coverImage.large ? (
                  <img src={anime.coverImage.large} alt="" className="h-36 w-24 object-cover" />
                ) : null}
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                {official.title || `Episode ${episodeNumber}`}
              </h3>
              <p className="text-sm text-[#86868b] max-w-md mb-6">
                Official streaming link provided by AniList partner ({official.site}).
              </p>

              <a
                href={official.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 shadow-lg shadow-blue-600/30"
              >
                <ExternalLink className="h-4 w-4" />
                Watch on {official.site}
              </a>
            </div>
          ) : (
            <>
              <video
                key={streamUrl || "default"}
                ref={videoRef}
                poster={anime.bannerImage || anime.coverImage.extraLarge || undefined}
                className="h-full w-full object-cover"
                playsInline
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source
                  src={streamUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>

              {/* Apple TV Player Overlay Controls */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 opacity-0 transition group-hover:opacity-100 flex flex-col gap-3">
                <div className="flex items-center justify-between text-white">
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
