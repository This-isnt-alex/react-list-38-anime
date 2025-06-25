import type { Anime, AnimeListResponse, AnimeResponse } from '../types/anime';
import type { SearchFilters, Genre } from '../types/search';

const BASE_URL = 'https://api.jikan.moe/v4';

// Rate limiting helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  private lastRequestTime = 0;
  private readonly requestDelay = 500; // 500ms between requests to respect rate limits

  private async makeRequest<T>(url: string): Promise<T> {
    // Ensure we don't make requests too quickly
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestDelay) {
      await delay(this.requestDelay - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get top anime
  async getTopAnime(limit = 25): Promise<Anime[]> {
    try {
      const response = await this.makeRequest<AnimeListResponse>(
        `${BASE_URL}/top/anime?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching top anime:', error);
      return [];
    }
  }

  // Get currently airing anime
  async getCurrentlyAiring(limit = 25): Promise<Anime[]> {
    try {
      const response = await this.makeRequest<AnimeListResponse>(
        `${BASE_URL}/seasons/now?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching currently airing anime:', error);
      return [];
    }
  }

  // Get upcoming anime
  async getUpcomingAnime(limit = 25): Promise<Anime[]> {
    try {
      const response = await this.makeRequest<AnimeListResponse>(
        `${BASE_URL}/seasons/upcoming?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming anime:', error);
      return [];
    }
  }

  // Search anime
  async searchAnime(query: string, limit = 25): Promise<Anime[]> {
    try {
      const response = await this.makeRequest<AnimeListResponse>(
        `${BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error searching anime:', error);
      return [];
    }
  }

  // Get anime by ID
  async getAnimeById(id: number): Promise<Anime | null> {
    try {
      const response = await this.makeRequest<AnimeResponse>(
        `${BASE_URL}/anime/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching anime by ID:', error);
      return null;
    }
  }

  // Get random anime
  async getRandomAnime(): Promise<Anime | null> {
    try {
      const response = await this.makeRequest<AnimeResponse>(
        `${BASE_URL}/random/anime`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching random anime:', error);
      return null;
    }
  }

  // Get anime by genre
  async getAnimeByGenre(genreId: number, limit = 25): Promise<Anime[]> {
    try {
      const response = await this.makeRequest<AnimeListResponse>(
        `${BASE_URL}/anime?genres=${genreId}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching anime by genre:', error);
      return [];
    }
  }

  // Get recent anime recommendations
  async getRecentRecommendations(): Promise<Anime[]> {
    try {
      // This is a workaround since Jikan doesn't have a direct recommendations endpoint
      // We'll get a mix of top anime and currently airing
      const [topAnime, currentAnime] = await Promise.all([
        this.getTopAnime(10),
        this.getCurrentlyAiring(10)
      ]);

      // Shuffle and mix the results
      const mixed = [...topAnime, ...currentAnime].sort(() => Math.random() - 0.5);
      return mixed.slice(0, 20);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }

  // Advanced search with filters
  async searchWithFilters(filters: SearchFilters, page = 1, limit = 25): Promise<Anime[]> {
    try {
      const params = new URLSearchParams();

      if (filters.query) params.append('q', filters.query);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.genres.length > 0) params.append('genres', filters.genres.join(','));

      // Score filtering
      if (filters.minScore > 0) params.append('min_score', filters.minScore.toString());
      if (filters.maxScore < 10) params.append('max_score', filters.maxScore.toString());

      // Year filtering
      if (filters.startYear > 1960) params.append('start_date', `${filters.startYear}-01-01`);
      if (filters.endYear < new Date().getFullYear() + 1) {
        params.append('end_date', `${filters.endYear}-12-31`);
      }

      // Sorting
      params.append('order_by', filters.orderBy);
      params.append('sort', filters.sort);

      // Pagination
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await this.makeRequest<AnimeListResponse>(
        `${BASE_URL}/anime?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error searching with filters:', error);
      return [];
    }
  }

  // Get all genres
  async getGenres(): Promise<Genre[]> {
    try {
      const response = await this.makeRequest<{ data: Genre[] }>(
        `${BASE_URL}/genres/anime`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching genres:', error);
      return [];
    }
  }

  // Get anime by multiple IDs (for favorites/watchlist)
  async getAnimeByIds(ids: number[]): Promise<Anime[]> {
    try {
      if (ids.length === 0) return [];

      // Batch requests to avoid rate limiting
      const batchSize = 5;
      const batches = [];

      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        const promises = batch.map(id => this.getAnimeById(id));
        batches.push(Promise.all(promises));
      }

      const results = await Promise.all(batches);
      const allAnime = results.flat().filter((anime): anime is Anime => anime !== null);

      return allAnime;
    } catch (error) {
      console.error('Error fetching anime by IDs:', error);
      return [];
    }
  }

  // Get anime recommendations based on a specific anime
  async getAnimeRecommendations(animeId: number, limit = 10): Promise<Anime[]> {
    try {
      const response = await this.makeRequest<{ data: Array<{ entry: Anime }> }>(
        `${BASE_URL}/anime/${animeId}/recommendations`
      );

      return response.data.slice(0, limit).map(rec => rec.entry);
    } catch (error) {
      console.error('Error fetching anime recommendations:', error);
      return [];
    }
  }

  // Get trending anime (popular this week)
  async getTrendingAnime(limit = 25): Promise<Anime[]> {
    try {
      // Use currently airing sorted by popularity as a proxy for trending
      const response = await this.makeRequest<AnimeListResponse>(
        `${BASE_URL}/seasons/now?order_by=popularity&sort=asc&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching trending anime:', error);
      return [];
    }
  }
}

export const apiService = new ApiService();
