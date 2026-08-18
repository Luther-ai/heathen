import { ExtensionManifest, Repository } from "@/types";

export const DEFAULT_REPOSITORIES = [
  {
    name: "Yūzōnō Anime Extensions",
    url: "https://raw.githubusercontent.com/yuzono/anime-repo/repo/index.min.json"
  },
  {
    name: "Secozzi Anime Extensions",
    url: "https://raw.githubusercontent.com/Secozzi/aniyomi-extensions/refs/heads/repo/index.min.json"
  }
];

function makeId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function normalizeExtensions(raw: unknown): ExtensionManifest[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item: any) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const id = item.pkg || item.id || item.package || item.name;
      if (!id) {
        return null;
      }

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
    })
    .filter(Boolean) as ExtensionManifest[];
}

export async function fetchRepository(url: string): Promise<Repository> {
  const normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith("https://")) {
    throw new Error("Repository URL must start with https://");
  }

  const response = await fetch(normalizedUrl);
  if (!response.ok) {
    throw new Error(`Repository returned HTTP ${response.status}`);
  }

  const raw = await response.json();
  const repoIdSeed = `${raw?.name || ''}-${normalizedUrl}`;
  const extensions = normalizeExtensions(raw?.extensions || raw?.items || raw);

  return {
    id: makeId(repoIdSeed),
    name: raw?.name || raw?.repo || new URL(normalizedUrl).hostname,
    url: normalizedUrl,
    homepage: raw?.website || raw?.homepage,
    addedAt: Date.now(),
    extensions,
    status: "online"
  };
}
