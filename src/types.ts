export type Anime = {
  id: number;
  title: {
    english: string | null;
    romaji: string;
    native: string | null;
  };
  coverImage: {
    extraLarge: string | null;
    large: string | null;
  };
  bannerImage: string | null;
  description: string | null;
  episodes: number | null;
  duration: number | null;
  genres: string[];
  averageScore: number | null;
  popularity: number;
  status: string;
  season: string | null;
  seasonYear: number | null;
  format: string | null;
  streamingEpisodes: StreamingEpisode[];
};

export type StreamingEpisode = {
  title: string;
  thumbnail: string | null;
  url: string;
  site: string;
};

export type AnimeSearchResult = {
  id: number;
  title: string;
  cover: string | null;
  banner: string | null;
  episodes: number | null;
  year: number | null;
  score: number | null;
};

export type WatchHistoryItem = {
  animeId: number;
  title: string;
  cover: string | null;
  episodeNumber: number;
  episodeTitle?: string;
  progress: number; // 0 to 100
  timestamp: number;
  duration?: number;
};

export type ExtensionManifest = {
  id: string;
  name: string;
  pkg?: string;
  version?: string;
  versionCode?: number;
  lang?: string;
  icon?: string;
  apk?: string;
  description?: string;
  type?: string;
};

export type Repository = {
  id: string;
  name: string;
  url: string;
  homepage?: string;
  addedAt: number;
  extensions: ExtensionManifest[];
  status: "online" | "offline" | "error";
  error?: string;
};

export type InstalledSource = {
  id: string;
  repositoryId: string;
  name: string;
  icon?: string;
  enabled: boolean;
  lang?: string;
};
