import { AnimeProvider, ProviderEpisode, ProviderStream } from "./types";

export const gogoanimeProvider: AnimeProvider = {
  id: "gogoanime",
  name: "GogoAnime Provider",

  async getEpisodes(anilistId: number) {
    const defaultTotal = 24;
    const subEpisodes: ProviderEpisode[] = Array.from({ length: defaultTotal }, (_, i) => ({
      id: `gogo-sub-${anilistId}-${i + 1}`,
      number: i + 1,
      title: `Gogo Episode ${i + 1}`,
      audio: "sub"
    }));

    const dubEpisodes: ProviderEpisode[] = Array.from({ length: defaultTotal }, (_, i) => ({
      id: `gogo-dub-${anilistId}-${i + 1}`,
      number: i + 1,
      title: `Gogo Episode ${i + 1} (English Dub)`,
      audio: "dub"
    }));

    return { sub: subEpisodes, dub: dubEpisodes };
  },

  async getStreams(episodeId: string, audio: "sub" | "dub") {
    return [
      {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        type: "mp4",
        quality: "1080p Ultra",
        language: audio === "dub" ? "English Dubbed" : "Japanese Subtitled"
      },
      {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        type: "mp4",
        quality: "720p HD",
        language: audio === "dub" ? "English Dubbed" : "Japanese Subtitled"
      }
    ];
  }
};
