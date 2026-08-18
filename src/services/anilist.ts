import { Anime, AnimeSearchResult } from "@/types";

const API = "https://graphql.anilist.co";

async function queryAniList<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const response = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    throw new Error(`AniList HTTP ${response.status}`);
  }

  const json = await response.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0].message || "AniList error");
  }

  return json.data;
}

const SEARCH_QUERY = `
  query SearchAnime($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, search: $search, sort: SEARCH_MATCH) {
        id
        title { english romaji native }
        coverImage { extraLarge large }
        bannerImage
        episodes
        averageScore
        seasonYear
      }
    }
  }
`;

const TRENDING_QUERY = `
  query Trending($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: TRENDING_DESC) {
        id
        title { english romaji native }
        coverImage { extraLarge large }
        bannerImage
        episodes
        averageScore
        seasonYear
      }
    }
  }
`;

const POPULAR_QUERY = `
  query Popular($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: POPULARITY_DESC) {
        id
        title { english romaji native }
        coverImage { extraLarge large }
        bannerImage
        episodes
        averageScore
        seasonYear
      }
    }
  }
`;

const SEASON_QUERY = `
  query Season($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC) {
        id
        title { english romaji native }
        coverImage { extraLarge large }
        bannerImage
        episodes
        averageScore
        seasonYear
      }
    }
  }
`;

const DETAILS_QUERY = `
  query AnimeDetails($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title { english romaji native }
      coverImage { extraLarge large }
      bannerImage
      description(asHtml: false)
      episodes
      duration
      genres
      averageScore
      popularity
      status
      season
      seasonYear
      format
      streamingEpisodes {
        title
        thumbnail
        url
        site
      }
    }
  }
`;

export async function searchAnime(search: string): Promise<AnimeSearchResult[]> {
  const data = await queryAniList<{
    Page: {
      media: Array<{
        id: number;
        title: { english: string | null; romaji: string };
        coverImage: { extraLarge: string | null; large: string | null };
        bannerImage: string | null;
        episodes: number | null;
        averageScore: number | null;
        seasonYear: number | null;
      }>;
    };
  }>(SEARCH_QUERY, { search, page: 1, perPage: 30 });

  return data.Page.media.map((anime) => ({
    id: anime.id,
    title: anime.title.english || anime.title.romaji,
    cover: anime.coverImage.extraLarge || anime.coverImage.large,
    banner: anime.bannerImage,
    episodes: anime.episodes,
    year: anime.seasonYear,
    score: anime.averageScore
  }));
}

export async function getTrendingAnime(): Promise<AnimeSearchResult[]> {
  const data = await queryAniList<{
    Page: {
      media: Array<{
        id: number;
        title: { english: string | null; romaji: string };
        coverImage: { extraLarge: string | null; large: string | null };
        bannerImage: string | null;
        episodes: number | null;
        averageScore: number | null;
        seasonYear: number | null;
      }>;
    };
  }>(TRENDING_QUERY, { page: 1, perPage: 24 });

  return data.Page.media.map((anime) => ({
    id: anime.id,
    title: anime.title.english || anime.title.romaji,
    cover: anime.coverImage.extraLarge || anime.coverImage.large,
    banner: anime.bannerImage,
    episodes: anime.episodes,
    year: anime.seasonYear,
    score: anime.averageScore
  }));
}

export async function getPopularAnime(): Promise<AnimeSearchResult[]> {
  const data = await queryAniList<{
    Page: {
      media: Array<{
        id: number;
        title: { english: string | null; romaji: string };
        coverImage: { extraLarge: string | null; large: string | null };
        bannerImage: string | null;
        episodes: number | null;
        averageScore: number | null;
        seasonYear: number | null;
      }>;
    };
  }>(POPULAR_QUERY, { page: 1, perPage: 24 });

  return data.Page.media.map((anime) => ({
    id: anime.id,
    title: anime.title.english || anime.title.romaji,
    cover: anime.coverImage.extraLarge || anime.coverImage.large,
    banner: anime.bannerImage,
    episodes: anime.episodes,
    year: anime.seasonYear,
    score: anime.averageScore
  }));
}

export async function getCurrentSeasonAnime(): Promise<AnimeSearchResult[]> {
  // Determine current season and year
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  let season: "WINTER" | "SPRING" | "SUMMER" | "FALL" = "SUMMER";
  if (month >= 1 && month <= 3) season = "WINTER";
  else if (month >= 4 && month <= 6) season = "SPRING";
  else if (month >= 7 && month <= 9) season = "SUMMER";
  else season = "FALL";

  try {
    const data = await queryAniList<{
      Page: {
        media: Array<{
          id: number;
          title: { english: string | null; romaji: string };
          coverImage: { extraLarge: string | null; large: string | null };
          bannerImage: string | null;
          episodes: number | null;
          averageScore: number | null;
          seasonYear: number | null;
        }>;
      };
    }>(SEASON_QUERY, { season, seasonYear: year, page: 1, perPage: 24 });

    if (data.Page.media.length > 0) {
      return data.Page.media.map((anime) => ({
        id: anime.id,
        title: anime.title.english || anime.title.romaji,
        cover: anime.coverImage.extraLarge || anime.coverImage.large,
        banner: anime.bannerImage,
        episodes: anime.episodes,
        year: anime.seasonYear,
        score: anime.averageScore
      }));
    }
  } catch {
    // fallback to popular if current season fails
  }
  return getPopularAnime();
}

export async function getAnime(id: number): Promise<Anime | null> {
  const data = await queryAniList<{
    Media: Anime | null;
  }>(DETAILS_QUERY, { id });

  return data.Media;
}
