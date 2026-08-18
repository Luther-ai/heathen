import { AnimeProvider, ProviderEpisode, ProviderStream } from "./types";

export const zoroProvider: AnimeProvider = {
  id: "zoro",
  name: "Zoro / HiAnime Provider",

  async getEpisodes(anilistId: number) {
    const totalEps = 24;
    const subEpisodes: ProviderEpisode[] = Array.from({ length: totalEps }, (_, i) => ({
      id: `zoro-sub-${anilistId}-${i + 1}`,
      number: i + 1,
      title: `HiAnime Ep ${i + 1}`,
      audio: "sub"
    }));

    const dubEpisodes: ProviderEpisode[] = Array.from({ length: totalEps }, (_, i) => ({
      id: `zoro-dub-${anilistId}-${i + 1}`,
      number: i + 1,
      title: `HiAnime Ep ${i + 1} (Dub)`,
      audio: "dub"
    }));

    return { sub: subEpisodes, dub: dubEpisodes };
  },

  async getStreams(episodeId: string, audio: "sub" | "dub") {
    return [
      {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        type: "mp4",
        quality: "1080p Master",
        language: audio === "dub" ? "English Dual Audio" : "Japanese Original Sub"
      },
      {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        type: "mp4",
        quality: "720p HD",
        language: audio === "dub" ? "English Dual Audio" : "Japanese Original Sub"
      }
    ];
  }
};
