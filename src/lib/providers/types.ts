export type ProviderEpisode = {
  id: string;
  number: number;
  title: string;
  audio: "sub" | "dub";
};

export type ProviderStream = {
  url: string;
  type: "hls" | "dash" | "mp4";
  quality?: string;
  language?: string;
};

export interface AnimeProvider {
  id: string;
  name: string;

  getEpisodes(
    anilistId: number
  ): Promise<{
    sub: ProviderEpisode[];
    dub: ProviderEpisode[];
  }>;

  getStreams(
    episodeId: string,
    audio: "sub" | "dub"
  ): Promise<ProviderStream[]>;
}
