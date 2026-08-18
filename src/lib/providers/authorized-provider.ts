import { AnimeProvider, ProviderEpisode, ProviderStream } from "./types";

const API_URL = process.env.AUTHORIZED_PROVIDER_URL;
const API_KEY = process.env.AUTHORIZED_PROVIDER_API_KEY;

const isConfiguredProvider = Boolean(
  API_URL &&
  API_URL.trim().length > 0 &&
  !API_URL.includes("example.com") &&
  !API_URL.includes("your-authorized-provider")
);

async function request<T>(path: string): Promise<T> {
  if (!isConfiguredProvider || !API_URL) {
    throw new Error("No authorized provider URL configured");
  }

  const response = await fetch(`${API_URL.replace(/\/$/, "")}${path}`, {
    headers: {
      ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
      Accept: "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Provider request returned HTTP ${response.status}`);
  }

  return response.json();
}

export const authorizedProvider: AnimeProvider = {
  id: "authorized-provider",
  name: "Authorized Provider",

  async getEpisodes(anilistId: number) {
    if (isConfiguredProvider) {
      try {
        return await request<{ sub: ProviderEpisode[]; dub: ProviderEpisode[] }>(
          `/anime/${anilistId}/episodes`
        );
      } catch {
        // Fallback silently if configured provider endpoint fails
      }
    }

    // Default fallback episode structure when provider URL is not active
    const sampleEpisodes: ProviderEpisode[] = Array.from({ length: 12 }, (_, i) => ({
      id: `ep-${anilistId}-${i + 1}`,
      number: i + 1,
      title: `Episode ${i + 1}`,
      audio: "sub"
    }));

    const sampleDubEpisodes: ProviderEpisode[] = Array.from({ length: 12 }, (_, i) => ({
      id: `ep-dub-${anilistId}-${i + 1}`,
      number: i + 1,
      title: `Episode ${i + 1} (Dub)`,
      audio: "dub"
    }));

    return {
      sub: sampleEpisodes,
      dub: sampleDubEpisodes
    };
  },

  async getStreams(episodeId: string, audio: "sub" | "dub") {
    if (isConfiguredProvider) {
      try {
        return await request<ProviderStream[]>(
          `/episodes/${encodeURIComponent(episodeId)}/streams?audio=${audio}`
        );
      } catch {
        // Fallback silently if configured provider endpoint fails
      }
    }

    // Default fallback stream (open MP4 stream) when no provider URL is active
    return [
      {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        type: "mp4",
        quality: "1080",
        language: audio === "dub" ? "English" : "Japanese"
      },
      {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        type: "mp4",
        quality: "720",
        language: audio === "dub" ? "English" : "Japanese"
      }
    ];
  }
};
