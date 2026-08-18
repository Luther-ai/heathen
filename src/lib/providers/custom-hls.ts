import { AnimeProvider, ProviderEpisode, ProviderStream } from "./types";

export const customHlsProvider: AnimeProvider = {
  id: "custom-hls",
  name: "Custom Direct HLS / M3U8",

  async getEpisodes(anilistId: number) {
    const totalEps = 24;
    return {
      sub: Array.from({ length: totalEps }, (_, i) => ({
        id: `custom-sub-${anilistId}-${i + 1}`,
        number: i + 1,
        title: `Episode ${i + 1}`,
        audio: "sub"
      })),
      dub: Array.from({ length: totalEps }, (_, i) => ({
        id: `custom-dub-${anilistId}-${i + 1}`,
        number: i + 1,
        title: `Episode ${i + 1} (Dub)`,
        audio: "dub"
      }))
    };
  },

  async getStreams(episodeId: string, audio: "sub" | "dub") {
    return [
      {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
        type: "mp4",
        quality: "Auto / Direct",
        language: audio === "dub" ? "English" : "Japanese"
      }
    ];
  }
};
