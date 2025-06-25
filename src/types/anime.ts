// Anime data types for Jikan API (MyAnimeList)
export interface Anime {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  trailer?: {
    youtube_id: string;
    url: string;
    embed_url: string;
  };
  approved: boolean;
  titles: Array<{
    type: string;
    title: string;
  }>;
  title: string;
  title_english?: string;
  title_japanese?: string;
  title_synonyms: string[];
  type: 'TV' | 'Movie' | 'OVA' | 'Special' | 'ONA' | 'Music';
  source: string;
  episodes?: number;
  status: 'Finished Airing' | 'Currently Airing' | 'Not yet aired';
  airing: boolean;
  aired: {
    from: string;
    to?: string;
    prop: {
      from: {
        day?: number;
        month?: number;
        year?: number;
      };
      to?: {
        day?: number;
        month?: number;
        year?: number;
      };
    };
    string: string;
  };
  duration: string;
  rating?: string;
  score?: number;
  scored_by?: number;
  rank?: number;
  popularity?: number;
  members?: number;
  favorites?: number;
  synopsis?: string;
  background?: string;
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  year?: number;
  broadcast?: {
    day?: string;
    time?: string;
    timezone?: string;
    string?: string;
  };
  producers: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  licensors: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  studios: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  genres: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  explicit_genres: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  themes: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  demographics: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
}

export interface Episode {
  mal_id: number;
  url: string;
  title: string;
  title_japanese?: string;
  title_romanji?: string;
  duration?: number;
  aired?: string;
  filler: boolean;
  recap: boolean;
  forum_url?: string;
}

export interface JikanResponse<T> {
  data: T;
  pagination?: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
}

export interface AnimeListResponse extends JikanResponse<Anime[]> {}
export interface AnimeResponse extends JikanResponse<Anime> {}
