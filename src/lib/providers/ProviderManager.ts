import { AnimeProvider, ProviderStream } from "./types";
import { authorizedProvider } from "./authorized-provider";
import { anilistOfficialProvider } from "./anilist-official";
import { gogoanimeProvider } from "./gogoanime";
import { zoroProvider } from "./zoro";
import { customHlsProvider } from "./custom-hls";

export class ProviderManager {
  private providers: Map<string, AnimeProvider> = new Map();
  private enabledStates: Map<string, boolean> = new Map();

  constructor() {
    // Register default providers
    this.registerProvider(authorizedProvider);
    this.registerProvider(gogoanimeProvider);
    this.registerProvider(zoroProvider);
    this.registerProvider(anilistOfficialProvider);
    this.registerProvider(customHlsProvider);
  }

  public registerProvider(provider: AnimeProvider, enabled: boolean = true) {
    this.providers.set(provider.id, provider);
    if (!this.enabledStates.has(provider.id)) {
      this.enabledStates.set(provider.id, enabled);
    }
  }

  public getProviders(): AnimeProvider[] {
    return Array.from(this.providers.values());
  }

  public getEnabledProviders(): AnimeProvider[] {
    return Array.from(this.providers.values()).filter((p) =>
      this.enabledStates.get(p.id) !== false
    );
  }

  public getProvider(id: string): AnimeProvider | undefined {
    return this.providers.get(id);
  }

  public setProviderEnabled(id: string, enabled: boolean) {
    if (this.providers.has(id)) {
      this.enabledStates.set(id, enabled);
    }
  }

  public isProviderEnabled(id: string): boolean {
    return this.enabledStates.get(id) !== false;
  }

  public async getStreams(
    anilistId: number,
    episodeNumber: number,
    audio: "sub" | "dub",
    preferredProviderId?: string
  ): Promise<{ provider: AnimeProvider; streams: ProviderStream[] }> {
    const enabledProviders = this.getEnabledProviders();

    if (enabledProviders.length === 0) {
      throw new Error("No enabled providers available in ProviderManager");
    }

    // Try preferred provider first if specified
    if (preferredProviderId) {
      const preferred = enabledProviders.find((p) => p.id === preferredProviderId);
      if (preferred) {
        try {
          const episodes = await preferred.getEpisodes(anilistId);
          const list = audio === "dub" ? episodes.dub : episodes.sub;
          const selected = list.find((ep) => ep.number === episodeNumber) || list[0];
          if (selected) {
            const streams = await preferred.getStreams(selected.id, audio);
            if (streams && streams.length > 0) {
              return { provider: preferred, streams };
            }
          }
        } catch (e) {
          console.warn(`[ProviderManager] Preferred provider ${preferredProviderId} failed:`, e);
        }
      }
    }

    // Automatic real-time failover across remaining enabled providers
    for (const provider of enabledProviders) {
      if (provider.id === preferredProviderId) continue;
      try {
        const episodes = await provider.getEpisodes(anilistId);
        const list = audio === "dub" ? episodes.dub : episodes.sub;
        const selected = list.find((ep) => ep.number === episodeNumber) || list[0];
        if (selected) {
          const streams = await provider.getStreams(selected.id, audio);
          if (streams && streams.length > 0) {
            return { provider, streams };
          }
        }
      } catch (e) {
        console.warn(`[ProviderManager] Fallback provider ${provider.id} failed:`, e);
      }
    }

    throw new Error("All enabled providers failed to return streams");
  }
}

export const providerManager = new ProviderManager();
