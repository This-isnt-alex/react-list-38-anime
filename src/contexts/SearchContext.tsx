import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { SearchFilters, UserPreferences, Genre } from '../types/search';
import { defaultFilters } from '../types/search';

interface SearchContextType {
  // Search state
  filters: SearchFilters;
  setFilters: (filters: SearchFilters | ((prev: SearchFilters) => SearchFilters)) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;

  // User preferences
  userPreferences: UserPreferences;
  addToFavorites: (animeId: number) => void;
  removeFromFavorites: (animeId: number) => void;
  addToWatchlist: (animeId: number) => void;
  removeFromWatchlist: (animeId: number) => void;
  isFavorite: (animeId: number) => boolean;
  isInWatchlist: (animeId: number) => boolean;

  // Genres
  genres: Genre[];
  setGenres: (genres: Genre[]) => void;

  // Recent searches
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER_PREFERENCES: 'anime-db-preferences',
  RECENT_FILTERS: 'anime-db-recent-filters'
};

export function SearchProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [isSearching, setIsSearching] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    favorites: [],
    watchlist: [],
    recentSearches: [],
    preferredGenres: []
  });

  // Load user preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setUserPreferences(parsed);
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    }

    const savedFilters = localStorage.getItem(STORAGE_KEYS.RECENT_FILTERS);
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        setFilters({ ...defaultFilters, ...parsed });
      } catch (error) {
        console.error('Error loading recent filters:', error);
      }
    }
  }, []);

  // Save user preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(userPreferences));
  }, [userPreferences]);

  // Save filters to localStorage (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(STORAGE_KEYS.RECENT_FILTERS, JSON.stringify(filters));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const addToFavorites = (animeId: number) => {
    setUserPreferences(prev => ({
      ...prev,
      favorites: [...prev.favorites.filter(id => id !== animeId), animeId]
    }));
  };

  const removeFromFavorites = (animeId: number) => {
    setUserPreferences(prev => ({
      ...prev,
      favorites: prev.favorites.filter(id => id !== animeId)
    }));
  };

  const addToWatchlist = (animeId: number) => {
    setUserPreferences(prev => ({
      ...prev,
      watchlist: [...prev.watchlist.filter(id => id !== animeId), animeId]
    }));
  };

  const removeFromWatchlist = (animeId: number) => {
    setUserPreferences(prev => ({
      ...prev,
      watchlist: prev.watchlist.filter(id => id !== animeId)
    }));
  };

  const isFavorite = (animeId: number): boolean => {
    return userPreferences.favorites.includes(animeId);
  };

  const isInWatchlist = (animeId: number): boolean => {
    return userPreferences.watchlist.includes(animeId);
  };

  const addRecentSearch = (query: string) => {
    if (!query.trim()) return;

    setUserPreferences(prev => ({
      ...prev,
      recentSearches: [
        query,
        ...prev.recentSearches.filter(s => s !== query).slice(0, 9) // Keep only 10 recent searches
      ]
    }));
  };

  const clearRecentSearches = () => {
    setUserPreferences(prev => ({
      ...prev,
      recentSearches: []
    }));
  };

  const value: SearchContextType = {
    filters,
    setFilters,
    isSearching,
    setIsSearching,
    userPreferences,
    addToFavorites,
    removeFromFavorites,
    addToWatchlist,
    removeFromWatchlist,
    isFavorite,
    isInWatchlist,
    genres,
    setGenres,
    addRecentSearch,
    clearRecentSearches
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
