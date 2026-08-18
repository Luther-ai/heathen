import { AnimeProvider } from "./types";
import { authorizedProvider } from "./authorized-provider";
import { anilistOfficialProvider } from "./anilist-official";
import { gogoanimeProvider } from "./gogoanime";
import { zoroProvider } from "./zoro";
import { customHlsProvider } from "./custom-hls";

export const providerRegistry: Record<string, AnimeProvider> = {
  "authorized-provider": authorizedProvider,
  "anilist-official": anilistOfficialProvider,
  "gogoanime": gogoanimeProvider,
  "zoro": zoroProvider,
  "custom-hls": customHlsProvider
};

export function getProviderById(id?: string): AnimeProvider {
  if (id && providerRegistry[id]) {
    return providerRegistry[id];
  }
  return authorizedProvider;
}

export function getAllProviders() {
  return [
    { id: "authorized-provider", name: "Authorized Provider", description: "Default REST authenticated provider" },
    { id: "anilist-official", name: "AniList Official Partner", description: "Official licensed streaming partners (Crunchyroll, Hulu)" },
    { id: "gogoanime", name: "GogoAnime Provider", description: "Multi-audio SUB and DUB streams" },
    { id: "zoro", name: "Zoro / HiAnime Provider", description: "High bitrate 1080p dual audio streams" },
    { id: "custom-hls", name: "Custom Direct HLS / M3U8", description: "Plug & play custom stream links" }
  ];
}
