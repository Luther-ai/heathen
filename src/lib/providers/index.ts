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

export * from "./ProviderManager";
export type { AnimeProvider, ProviderStream, ProviderEpisode } from "./types";
