import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { getProviderById, getAllProviders } from "./src/lib/providers";

const ANILIST_API = "https://graphql.anilist.co";

async function queryAniList(query: string, variables: Record<string, unknown>) {
  const response = await fetch(ANILIST_API, {
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/anime/search", async (req, res) => {
    try {
      const query = String(req.query.q || "").trim();
      if (!query) {
        return res.json([]);
      }
      const data = await queryAniList(SEARCH_QUERY, { search: query, page: 1, perPage: 30 }) as any;
      const results = data.Page.media.map((anime: any) => ({
        id: anime.id,
        title: anime.title.english || anime.title.romaji,
        cover: anime.coverImage.extraLarge || anime.coverImage.large,
        banner: anime.bannerImage,
        episodes: anime.episodes,
        year: anime.seasonYear,
        score: anime.averageScore
      }));
      res.json(results);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Search failed" });
    }
  });

  app.get("/api/discover", async (req, res) => {
    try {
      const data = await queryAniList(TRENDING_QUERY, { page: 1, perPage: 24 }) as any;
      const results = data.Page.media.map((anime: any) => ({
        id: anime.id,
        title: anime.title.english || anime.title.romaji,
        cover: anime.coverImage.extraLarge || anime.coverImage.large,
        banner: anime.bannerImage,
        episodes: anime.episodes,
        year: anime.seasonYear,
        score: anime.averageScore
      }));
      res.json(results);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Discover failed" });
    }
  });

  app.get("/api/anime/:id", async (req, res) => {
    try {
      const animeId = Number(req.params.id);
      if (!Number.isInteger(animeId)) {
        return res.status(400).json({ error: "Invalid anime ID" });
      }
      const data = await queryAniList(DETAILS_QUERY, { id: animeId }) as any;
      if (!data.Media) {
        return res.status(404).json({ error: "Anime not found" });
      }
      res.json(data.Media);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to load anime" });
    }
  });

  app.post("/api/repository", async (req, res) => {
    try {
      const repositoryUrl = String(req.body.url || "").trim();
      if (!repositoryUrl.startsWith("https://")) {
        return res.status(400).json({ error: "Repository URL must start with https://" });
      }
      const response = await fetch(repositoryUrl);
      if (!response.ok) {
        return res.status(400).json({ error: `Repository returned HTTP ${response.status}` });
      }
      const raw = await response.json() as any;
      
      function makeId(value: string) {
        return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
      }

      const rawExts = raw?.extensions || raw?.items || raw;
      const extensions = Array.isArray(rawExts) ? rawExts.map((item: any) => {
        if (!item || typeof item !== "object") return null;
        const id = item.pkg || item.id || item.package || item.name;
        if (!id) return null;
        return {
          id: String(id),
          name: String(item.name || item.label || item.pkg || "Unknown Extension"),
          pkg: item.pkg,
          version: item.versionName || item.version || item.version_name,
          versionCode: Number(item.versionCode || 0) || undefined,
          lang: item.lang,
          icon: item.icon,
          apk: item.apk,
          description: item.description,
          type: item.type || "anime"
        };
      }).filter(Boolean) : [];

      const repoObj = {
        id: makeId(raw?.name || new URL(repositoryUrl).hostname),
        name: raw?.name || raw?.repo || new URL(repositoryUrl).hostname,
        url: repositoryUrl,
        homepage: raw?.website || raw?.homepage,
        addedAt: Date.now(),
        extensions,
        status: "online"
      };

      res.json(repoObj);
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ error: error.message || "Repository failed" });
    }
  });

  app.get("/api/player/official", async (req, res) => {
    try {
      const id = Number(req.query.id);
      const episode = Number(req.query.episode || "1");
      if (!Number.isInteger(id)) {
        return res.status(400).json({ error: "Invalid anime ID" });
      }
      const data = await queryAniList(DETAILS_QUERY, { id }) as any;
      if (!data.Media) {
        return res.status(404).json({ error: "Anime not found" });
      }
      const streamingEpisodes = data.Media.streamingEpisodes || [];
      const selected = streamingEpisodes[Math.max(0, episode - 1)];
      if (!selected) {
        return res.json({ playable: false, official: null });
      }
      res.json({
        playable: true,
        official: {
          title: selected.title,
          url: selected.url,
          site: selected.site,
          thumbnail: selected.thumbnail
        }
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to resolve episode" });
    }
  });

  app.get("/api/providers", (req, res) => {
    res.json(getAllProviders());
  });

  app.get("/api/watch/:animeId/:episode", async (req, res) => {
    try {
      const animeId = Number(req.params.animeId);
      const episodeNum = Number(req.params.episode);
      const audio = req.query.audio === "dub" ? "dub" : "sub";
      const providerId = String(req.query.provider || "authorized-provider");

      if (!Number.isInteger(animeId) || !Number.isInteger(episodeNum)) {
        return res.status(400).json({ error: "Invalid anime ID or episode number" });
      }

      const activeProvider = getProviderById(providerId);
      const episodes = await activeProvider.getEpisodes(animeId);
      const list = audio === "dub" ? episodes.dub : episodes.sub;
      const selected = list.find((item) => item.number === episodeNum) || list[0];

      if (!selected) {
        return res.status(404).json({ error: "Episode unavailable" });
      }

      const streams = await activeProvider.getStreams(selected.id, audio);

      res.json({
        providerId: activeProvider.id,
        provider: activeProvider.name,
        animeId,
        episode: selected.number,
        title: selected.title,
        audio,
        streams
      });
    } catch (error: any) {
      console.error("[WatchAPI] Error resolving episode:", error);
      res.status(500).json({ error: "Unable to resolve episode stream" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
