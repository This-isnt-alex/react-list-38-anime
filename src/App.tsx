import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Search, Star, Calendar, Zap, RotateCcw, Heart, Plus } from 'lucide-react';
import { SearchFilters } from '@/components/SearchFilters';
import { SearchResults } from '@/components/SearchResults';
import { FavoriteButton } from '@/components/FavoriteButton';
import { useSearch } from '@/contexts/SearchContext';
import type { Anime } from './types/anime';
import { apiService } from './services/api';

function App() {
  const {
    filters,
    setFilters,
    userPreferences,
    addRecentSearch
  } = useSearch();

  const [featuredAnime, setFeaturedAnime] = useState<Anime[]>([]);
  const [currentlyAiring, setCurrentlyAiring] = useState<Anime[]>([]);
  const [topAnime, setTopAnime] = useState<Anime[]>([]);
  const [favoriteAnime, setFavoriteAnime] = useState<Anime[]>([]);
  const [watchlistAnime, setWatchlistAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [featured, airing, top] = await Promise.all([
          apiService.getRecentRecommendations(),
          apiService.getCurrentlyAiring(12),
          apiService.getTopAnime(6)
        ]);

        setFeaturedAnime(featured.slice(0, 5));
        setCurrentlyAiring(airing);
        setTopAnime(top);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load user's favorites and watchlist
  useEffect(() => {
    const loadUserAnime = async () => {
      if (userPreferences.favorites.length > 0) {
        const favorites = await apiService.getAnimeByIds(userPreferences.favorites);
        setFavoriteAnime(favorites);
      } else {
        setFavoriteAnime([]);
      }

      if (userPreferences.watchlist.length > 0) {
        const watchlist = await apiService.getAnimeByIds(userPreferences.watchlist);
        setWatchlistAnime(watchlist);
      } else {
        setWatchlistAnime([]);
      }
    };

    loadUserAnime();
  }, [userPreferences.favorites, userPreferences.watchlist]);

  const handleSearch = (query?: string) => {
    if (query !== undefined) {
      setFilters(prev => ({ ...prev, query }));
      if (query) {
        addRecentSearch(query);
      }
    }
    setSearchTrigger(prev => prev + 1);
    setActiveTab('search');
  };

  const handleQuickSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    handleSearch(query);
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      {/* Navigation Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-primary">AnimeDB</div>
              <div className="text-sm text-muted-foreground">Database</div>
            </div>

            {/* Navigation Menu */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className="text-foreground hover:text-primary cursor-pointer"
                    onClick={() => setActiveTab('home')}
                  >
                    Home
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className="text-foreground hover:text-primary cursor-pointer"
                    onClick={() => setActiveTab('search')}
                  >
                    Search
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className="text-foreground hover:text-primary cursor-pointer"
                    onClick={() => setActiveTab('favorites')}
                  >
                    My Lists
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Search Bar */}
            <form onSubmit={handleQuickSearch} className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  name="search"
                  placeholder="Search anime..."
                  className="pl-10 w-64"
                  defaultValue={filters.query}
                />
              </div>
              <Button type="submit" variant="outline" size="icon">
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Mobile Tab List */}
          <TabsList className="grid w-full grid-cols-3 md:hidden mb-8">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="favorites">My Lists</TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-12">
            {/* Featured Section */}
            <section>
              <h1 className="section-title flex items-center gap-2">
                <Zap className="w-8 h-8 text-primary" />
                Featured Anime
              </h1>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={`featured-loading-${i}`} className="anime-card">
                      <div className="aspect-[3/4] bg-muted animate-pulse rounded-t-lg" />
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                        <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {featuredAnime.map((anime) => (
                    <Card key={anime.mal_id} className="anime-card cursor-pointer group relative">
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
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{anime.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{anime.score || 'N/A'}</span>
                          <span>•</span>
                          <span>{anime.type}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <Separator />

            {/* Currently Airing Section */}
            <section>
              <h2 className="section-title flex items-center gap-2">
                <Calendar className="w-6 h-6 text-accent" />
                Latest Episodes
              </h2>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Card key={`episode-loading-${i}`} className="episode-card">
                      <div className="aspect-video bg-muted animate-pulse rounded-t-lg" />
                      <CardContent className="p-3">
                        <div className="h-3 bg-muted rounded animate-pulse mb-1" />
                        <div className="h-2 bg-muted rounded animate-pulse w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {currentlyAiring.map((anime) => (
                    <Card key={anime.mal_id} className="episode-card cursor-pointer group relative">
                      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <FavoriteButton
                          animeId={anime.mal_id}
                          variant="heart"
                          size="sm"
                          className="bg-background/80 backdrop-blur-sm"
                        />
                      </div>
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={anime.images.jpg.image_url}
                          alt={anime.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-3">
                        <h4 className="font-medium text-xs mb-1 line-clamp-2">{anime.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {anime.episodes ? `Episode ${anime.episodes}` : 'Ongoing'}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <Separator />

            {/* Top Anime Section */}
            <section>
              <h2 className="section-title flex items-center gap-2">
                <RotateCcw className="w-6 h-6 text-destructive" />
                Top Rated Anime
              </h2>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={`top-loading-${i}`} className="anime-card">
                      <div className="aspect-[3/4] bg-muted animate-pulse rounded-t-lg" />
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                        <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topAnime.map((anime) => (
                    <Card key={anime.mal_id} className="anime-card cursor-pointer group relative">
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
                        <h3 className="font-semibold mb-2 line-clamp-2">{anime.title}</h3>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">{anime.score || 'N/A'}</span>
                          </div>
                          <span>#{anime.rank || 'N/A'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                          {anime.synopsis?.slice(0, 120)}...
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Search Anime</h1>
              </div>

              <SearchFilters onSearch={() => handleSearch()} />
              <SearchResults searchTrigger={searchTrigger} />
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">My Lists</h1>

              <Tabs defaultValue="favorites" className="w-full">
                <TabsList>
                  <TabsTrigger value="favorites" className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Favorites ({userPreferences.favorites.length})
                  </TabsTrigger>
                  <TabsTrigger value="watchlist" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Watchlist ({userPreferences.watchlist.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="favorites" className="mt-6">
                  {favoriteAnime.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg text-muted-foreground mb-2">No favorites yet</p>
                      <p className="text-sm text-muted-foreground">
                        Add anime to your favorites by clicking the heart icon
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {favoriteAnime.map((anime) => (
                        <Card key={anime.mal_id} className="anime-card cursor-pointer group relative">
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
                            <h3 className="font-semibold mb-2 line-clamp-2">{anime.title}</h3>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="font-medium">{anime.score || 'N/A'}</span>
                              </div>
                              <span>{anime.type}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="watchlist" className="mt-6">
                  {watchlistAnime.length === 0 ? (
                    <div className="text-center py-12">
                      <Plus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg text-muted-foreground mb-2">No items in watchlist</p>
                      <p className="text-sm text-muted-foreground">
                        Add anime to your watchlist to keep track of what you want to watch
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {watchlistAnime.map((anime) => (
                        <Card key={anime.mal_id} className="anime-card cursor-pointer group relative">
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
                            <h3 className="font-semibold mb-2 line-clamp-2">{anime.title}</h3>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="font-medium">{anime.score || 'N/A'}</span>
                              </div>
                              <span>{anime.type}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-lg font-semibold text-primary mb-2">AnimeDB</div>
            <p className="text-sm text-muted-foreground mb-4">
              Your comprehensive anime database for reviews, ratings, and discovery
            </p>
            <div className="flex justify-center items-center gap-4 text-xs text-muted-foreground">
              <span>© 2025 AnimeDB</span>
              <span>•</span>
              <span>Data provided by Jikan API</span>
              <span>•</span>
              <span>MyAnimeList</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
