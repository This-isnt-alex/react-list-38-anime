import { useState, useEffect } from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSearch } from '@/contexts/SearchContext';
import { animeTypes, animeStatuses, sortOptions, defaultFilters } from '@/types/search';
import { apiService } from '@/services/api';

interface SearchFiltersProps {
  onSearch: () => void;
  className?: string;
}

export function SearchFilters({ onSearch, className }: SearchFiltersProps) {
  const { filters, setFilters, genres, setGenres } = useSearch();
  const [localFilters, setLocalFilters] = useState(filters);
  const [isOpen, setIsOpen] = useState(false);

  // Load genres on mount
  useEffect(() => {
    const loadGenres = async () => {
      if (genres.length === 0) {
        const fetchedGenres = await apiService.getGenres();
        setGenres(fetchedGenres);
      }
    };
    loadGenres();
  }, [genres.length, setGenres]);

  const handleApplyFilters = () => {
    setFilters(localFilters);
    onSearch();
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    setLocalFilters(defaultFilters);
    setFilters(defaultFilters);
    onSearch();
  };

  const handleGenreToggle = (genreId: number) => {
    setLocalFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter(id => id !== genreId)
        : [...prev.genres, genreId]
    }));
  };

  const getSelectedGenreNames = () => {
    return localFilters.genres
      .map(id => genres.find(g => g.mal_id === id)?.name)
      .filter(Boolean)
      .slice(0, 3); // Show only first 3
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (localFilters.query) count++;
    if (localFilters.genres.length > 0) count++;
    if (localFilters.type) count++;
    if (localFilters.status) count++;
    if (localFilters.minScore > 0 || localFilters.maxScore < 10) count++;
    if (localFilters.startYear > 1960 || localFilters.endYear < new Date().getFullYear() + 1) count++;
    return count;
  };

  return (
    <div className={className}>
      {/* Mobile Filter Button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="md:hidden">
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2 px-1 min-w-5 h-5">
                {activeFiltersCount()}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Search Filters</SheetTitle>
            <SheetDescription>
              Filter anime by genre, year, rating, and more
            </SheetDescription>
          </SheetHeader>
          <FilterContent
            localFilters={localFilters}
            setLocalFilters={setLocalFilters}
            genres={genres}
            handleGenreToggle={handleGenreToggle}
          />
          <SheetFooter className="gap-2">
            <Button variant="outline" onClick={handleResetFilters}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Desktop Filters */}
      <div className="hidden md:flex items-center gap-4 flex-wrap">
        {/* Genre Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-between min-w-32">
              <span>
                {localFilters.genres.length === 0
                  ? 'Genres'
                  : localFilters.genres.length === 1
                    ? getSelectedGenreNames()[0]
                    : `${localFilters.genres.length} genres`
                }
              </span>
              <Filter className="w-4 h-4 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <h4 className="font-medium">Select Genres</h4>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {genres.map((genre) => (
                  <div key={genre.mal_id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`genre-${genre.mal_id}`}
                      checked={localFilters.genres.includes(genre.mal_id)}
                      onCheckedChange={() => handleGenreToggle(genre.mal_id)}
                    />
                    <label
                      htmlFor={`genre-${genre.mal_id}`}
                      className="text-sm cursor-pointer"
                    >
                      {genre.name}
                    </label>
                  </div>
                ))}
              </div>
              {localFilters.genres.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {getSelectedGenreNames().map((name) => (
                    <Badge key={name} variant="secondary">
                      {name}
                    </Badge>
                  ))}
                  {localFilters.genres.length > 3 && (
                    <Badge variant="secondary">
                      +{localFilters.genres.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Type Filter */}
        <Select
          value={localFilters.type}
          onValueChange={(value) => setLocalFilters(prev => ({ ...prev, type: value }))}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {animeTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={localFilters.status}
          onValueChange={(value) => setLocalFilters(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {animeStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Filter */}
        <Select
          value={localFilters.orderBy}
          onValueChange={(value) => setLocalFilters(prev => ({
            ...prev,
            orderBy: value as typeof localFilters.orderBy
          }))}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Apply/Reset Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleApplyFilters} size="sm">
            Apply
          </Button>
          {activeFiltersCount() > 0 && (
            <Button variant="outline" onClick={handleResetFilters} size="sm">
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount() > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{activeFiltersCount()} filter{activeFiltersCount() !== 1 ? 's' : ''} active</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Separate component for the filter content to reuse in mobile sheet
function FilterContent({
  localFilters,
  setLocalFilters,
  genres,
  handleGenreToggle
}: {
  localFilters: any;
  setLocalFilters: any;
  genres: any[];
  handleGenreToggle: (id: number) => void;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6 py-4">
      {/* Score Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Score Range</label>
        <div className="px-2">
          <Slider
            value={[localFilters.minScore, localFilters.maxScore]}
            onValueChange={([min, max]) =>
              setLocalFilters((prev: any) => ({ ...prev, minScore: min, maxScore: max }))
            }
            max={10}
            min={0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>{localFilters.minScore}</span>
            <span>{localFilters.maxScore}</span>
          </div>
        </div>
      </div>

      {/* Year Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Year Range</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">From</label>
            <Input
              type="number"
              value={localFilters.startYear}
              onChange={(e) => setLocalFilters((prev: any) => ({
                ...prev,
                startYear: Number(e.target.value)
              }))}
              min={1960}
              max={currentYear + 1}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">To</label>
            <Input
              type="number"
              value={localFilters.endYear}
              onChange={(e) => setLocalFilters((prev: any) => ({
                ...prev,
                endYear: Number(e.target.value)
              }))}
              min={1960}
              max={currentYear + 1}
            />
          </div>
        </div>
      </div>

      {/* Genres */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Genres</label>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {genres.map((genre) => (
            <div key={genre.mal_id} className="flex items-center space-x-2">
              <Checkbox
                id={`mobile-genre-${genre.mal_id}`}
                checked={localFilters.genres.includes(genre.mal_id)}
                onCheckedChange={() => handleGenreToggle(genre.mal_id)}
              />
              <label
                htmlFor={`mobile-genre-${genre.mal_id}`}
                className="text-sm cursor-pointer"
              >
                {genre.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select
          value={localFilters.type}
          onValueChange={(value) => setLocalFilters((prev: any) => ({ ...prev, type: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {animeTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select
          value={localFilters.status}
          onValueChange={(value) => setLocalFilters((prev: any) => ({ ...prev, status: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {animeStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Sort by</label>
        <Select
          value={localFilters.orderBy}
          onValueChange={(value) => setLocalFilters((prev: any) => ({
            ...prev,
            orderBy: value
          }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
