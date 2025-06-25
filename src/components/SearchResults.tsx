import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { FavoriteButton } from './FavoriteButton';
import { useSearch } from '@/contexts/SearchContext';
import { apiService } from '@/services/api';
import type { Anime } from '@/types/anime';

interface SearchResultsProps {
  searchTrigger: number; // Used to trigger new searches
  className?: string;
}

export function SearchResults({ searchTrigger, className }: SearchResultsProps) {
  const { filters, isSearching, setIsSearching, addRecentSearch } = useSearch();
  const [results, setResults] = useState<Anime[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const resultsPerPage = 25;

  // Perform search when filters change or search is triggered
  useEffect(() => {
    if (searchTrigger > 0) {
      performSearch(1);
    }
  }, [searchTrigger, filters]);

  const performSearch = async (page = 1) => {
    setIsSearching(true);
    setError(null);
    setCurrentPage(page);

    try {
      const searchResults = await apiService.searchWithFilters(filters, page, resultsPerPage);

      setResults(searchResults);
      setHasNextPage(searchResults.length === resultsPerPage);
      setTotalResults(searchResults.length); // Note: Jikan API doesn't provide total count

      // Add to recent searches if there's a query
      if (filters.query) {
        addRecentSearch(filters.query);
      }
    } catch (err) {
      setError('Failed to search anime. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (newPage === 1 || hasNextPage || newPage < currentPage)) {
      performSearch(newPage);
    }
  };

  const getDisplayedGenres = (anime: Anime) => {
    return anime.genres.slice(0, 3); // Show only first 3 genres
  };

  const hasActiveFilters = () => {
    return filters.query ||
           filters.genres.length > 0 ||
           filters.type ||
           filters.status ||
           filters.minScore > 0 ||
           filters.maxScore < 10 ||
           filters.startYear > 1960 ||
           filters.endYear < new Date().getFullYear() + 1;
  };

  if (!hasActiveFilters() && results.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-muted-foreground">
          <p className="text-lg mb-2">Start searching for anime</p>
          <p className="text-sm">Use the search bar or filters above to find your favorite anime</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-destructive">
          <p className="text-lg mb-2">Search Error</p>
          <p className="text-sm mb-4">{error}</p>
          <Button onClick={() => performSearch(currentPage)} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Search Info */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Search Results</h2>
          {results.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {filters.query && `Searching for "${filters.query}" • `}
              Page {currentPage} • {results.length} results
            </p>
          )}
        </div>

        {/* Pagination Controls */}
        {(currentPage > 1 || hasNextPage) && !isSearching && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm px-2">Page {currentPage}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span className="text-lg">Searching anime...</span>
        </div>
      )}

      {/* No Results */}
      {!isSearching && results.length === 0 && hasActiveFilters() && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <p className="text-lg mb-2">No anime found</p>
            <p className="text-sm">Try adjusting your search criteria or filters</p>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {!isSearching && results.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((anime) => (
              <Card key={anime.mal_id} className="anime-card cursor-pointer group relative">
                {/* Favorite Button Overlay */}
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FavoriteButton
                    animeId={anime.mal_id}
                    variant="dropdown"
                    size="sm"
                    className="bg-background/80 backdrop-blur-sm"
                  />
                </div>

                <div className="aspect-[3/4] overflow-hidden rounded-t-lg">
                  <img
                    src={anime.images.jpg.large_image_url}
                    alt={anime.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 text-sm">
                    {anime.title}
                  </h3>

                  {/* Anime Info */}
                  <div className="space-y-2 text-xs">
                    {/* Score and Type */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="font-medium">{anime.score || 'N/A'}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {anime.type}
                      </Badge>
                    </div>

                    {/* Status and Episodes */}
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{anime.status}</span>
                      {anime.episodes && <span>{anime.episodes} episodes</span>}
                    </div>

                    {/* Genres */}
                    {getDisplayedGenres(anime).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {getDisplayedGenres(anime).map((genre) => (
                          <Badge key={genre.mal_id} variant="outline" className="text-xs">
                            {genre.name}
                          </Badge>
                        ))}
                        {anime.genres.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{anime.genres.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Year */}
                    {anime.year && (
                      <div className="text-muted-foreground">
                        {anime.year}
                      </div>
                    )}
                  </div>

                  {/* Synopsis Preview */}
                  {anime.synopsis && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                      {anime.synopsis.slice(0, 120)}...
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom Pagination */}
          {(currentPage > 1 || hasNextPage) && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous Page
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {currentPage}
              </span>

              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
              >
                Next Page
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
