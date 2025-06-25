export interface Genre {
  mal_id: number;
  name: string;
  url: string;
  count: number;
}

export interface SearchFilters {
  query: string;
  genres: number[];
  type: string;
  status: string;
  minScore: number;
  maxScore: number;
  startYear: number;
  endYear: number;
  orderBy: 'title' | 'score' | 'scored_by' | 'rank' | 'popularity' | 'members' | 'episodes';
  sort: 'asc' | 'desc';
}

export interface UserPreferences {
  favorites: number[];
  watchlist: number[];
  recentSearches: string[];
  preferredGenres: number[];
}

export const defaultFilters: SearchFilters = {
  query: '',
  genres: [],
  type: '',
  status: '',
  minScore: 0,
  maxScore: 10,
  startYear: 1960,
  endYear: new Date().getFullYear() + 1,
  orderBy: 'score',
  sort: 'desc'
};

export const animeTypes = [
  { value: '', label: 'All Types' },
  { value: 'tv', label: 'TV' },
  { value: 'movie', label: 'Movie' },
  { value: 'ova', label: 'OVA' },
  { value: 'special', label: 'Special' },
  { value: 'ona', label: 'ONA' },
  { value: 'music', label: 'Music' }
];

export const animeStatuses = [
  { value: '', label: 'All Status' },
  { value: 'airing', label: 'Currently Airing' },
  { value: 'complete', label: 'Finished Airing' },
  { value: 'upcoming', label: 'Not yet aired' }
];

export const sortOptions = [
  { value: 'score', label: 'Score' },
  { value: 'scored_by', label: 'Popularity' },
  { value: 'rank', label: 'Rank' },
  { value: 'title', label: 'Title' },
  { value: 'episodes', label: 'Episodes' },
  { value: 'members', label: 'Members' }
];
