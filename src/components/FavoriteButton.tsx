import { Heart, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useSearch } from '@/contexts/SearchContext';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  animeId: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'heart' | 'dropdown';
  className?: string;
}

export function FavoriteButton({
  animeId,
  size = 'md',
  variant = 'heart',
  className
}: FavoriteButtonProps) {
  const {
    isFavorite,
    isInWatchlist,
    addToFavorites,
    removeFromFavorites,
    addToWatchlist,
    removeFromWatchlist
  } = useSearch();

  const isFav = isFavorite(animeId);
  const isWatch = isInWatchlist(animeId);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFav) {
      removeFromFavorites(animeId);
    } else {
      addToFavorites(animeId);
    }
  };

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWatch) {
      removeFromWatchlist(animeId);
    } else {
      addToWatchlist(animeId);
    }
  };

  if (variant === 'heart') {
    return (
      <Button
        variant="ghost"
        size={size === 'sm' ? 'sm' : 'icon'}
        onClick={handleFavoriteToggle}
        className={cn(
          'hover:bg-destructive/20 transition-colors',
          isFav && 'text-destructive hover:text-destructive',
          className
        )}
      >
        <Heart
          className={cn(
            size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4',
            isFav && 'fill-current'
          )}
        />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={size === 'sm' ? 'sm' : 'icon'}
          className={cn(
            'hover:bg-primary/20 transition-colors',
            (isFav || isWatch) && 'text-primary',
            className
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Plus className={cn(
            size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
          )} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={handleFavoriteToggle}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Heart className={cn(
              'w-4 h-4',
              isFav && 'fill-current text-destructive'
            )} />
            <span>{isFav ? 'Remove from Favorites' : 'Add to Favorites'}</span>
            {isFav && <Check className="w-4 h-4 ml-auto text-destructive" />}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleWatchlistToggle}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Plus className={cn(
              'w-4 h-4',
              isWatch && 'text-primary'
            )} />
            <span>{isWatch ? 'Remove from Watchlist' : 'Add to Watchlist'}</span>
            {isWatch && <Check className="w-4 h-4 ml-auto text-primary" />}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
