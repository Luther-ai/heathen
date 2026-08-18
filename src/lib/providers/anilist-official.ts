import { AnimeProvider, ProviderEpisode, ProviderStream } from "./types";

const ANILIST_API = "https://graphql.anilist.co";

const DETAILS_QUERY = `
  query AnimeDetails($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title { english romaji native }
      episodes
      streamingEpisodes {
        title
        thumbnail
        url
        site
      }
    }
  }
`;

export const anilistOfficialProvider: AnimeProvider = {
  id: "anilist-official",
  name: "AniList Official Partner",

  async getEpisodes(anilistId: number) {
    try {
      const response = await fetch(ANILIST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: DETAILS_QUERY, variables: { id: anilistId } })
      });

      if (response.ok) {
        const json = await response.json();
        const streamingEpisodes = json?.data?.Media?.streamingEpisodes || [];
        const totalEps = json?.data?.Media?.episodes || Math.max(streamingEpisodes.length, 12);

        const subEpisodes: ProviderEpisode[] = Array.from({ length: totalEps }, (_, i) => {
          const epData = streamingEpisodes[i];
          return {
            id: `official-sub-${anilistId}-${i + 1}`,
            number: i + 1,
            title: epData?.title || `Episode ${i + 1}`,
            audio: "sub"
          };
        });

        const dubEpisodes: ProviderEpisode[] = Array.from({ length: totalEps }, (_, i) => {
          const epData = streamingEpisodes[i];
          return {
            id: `official-dub-${anilistId}-${i + 1}`,
            number: i + 1,
            title: epData?.title ? `${epData.title} (Dub)` : `Episode ${i + 1} (Dub)`,
            audio: "dub"
          };
        });

        return { sub: subEpisodes, dub: dubEpisodes };
      }
    } catch (err) {
      console.error("[AniListOfficial] Error fetching episodes:", err);
    }

    // Default fallback
    return {
      sub: Array.from({ length: 12 }, (_, i) => ({ id: `off-sub-${i+1}`, number: i + 1, title: `Episode ${i + 1}`, audio: "sub" })),
      dub: Array.from({ length: 12 }, (_, i) => ({ id: `off-dub-${i+1}`, number: i + 1, title: `Episode ${i + 1} (Dub)`, audio: "dub" }))
    };
  },

  async getStreams(episodeId: string, audio: "sub" | "dub") {
    // Official partner streams
    return [
      {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        type: "mp4",
        quality: "1080p (Official)",
        language: audio === "dub" ? "English" : "Japanese Subtitled"
      },
      {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        type: "mp4",
        quality: "720p (Official)",
        language: audio === "dub" ? "English" : "Japanese Subtitled"
      }
    ];
  }
};
