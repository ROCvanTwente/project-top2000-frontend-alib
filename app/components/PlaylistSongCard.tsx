import { useState, useEffect } from 'react';
import { Play, Plus, Minus, ArrowUpRight, Heart, HeartOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ImageWithFallback } from './ImageWithFallback';
import { Button } from './ui/button';
import { usePlaylist } from '../hooks/usePlaylist';
import { useAuth } from '../auth/AuthProvider';
import { toast } from 'sonner';

interface PlaylistSongCardProps {
  id: string;
  rank?: number;
  title: string;
  artist: string;
  artistId: string;
  albumImage: string;
  onPlay?: () => void;
  canPlay: boolean;
  showAddToPlaylist?: boolean;
}

export default function PlaylistSongCard({
  id,
  rank,
  title,
  artist,
  artistId,
  albumImage,
  onPlay,
  canPlay,
  showAddToPlaylist = true
}: PlaylistSongCardProps) {
  const { isAuthenticated } = useAuth();
  const { toggleSong, isInPlaylist, spotifyConnected } = usePlaylist();
  const [isToggling, setIsToggling] = useState(false);
  const [songInPlaylist, setSongInPlaylist] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Check if song is in playlist on component mount
  useEffect(() => {
    if (spotifyConnected && showAddToPlaylist) {
      checkPlaylistStatus();
    }
  }, [spotifyConnected, title, artist]);

  const checkPlaylistStatus = async () => {
    if (!spotifyConnected) return;
    
    try {
      setCheckingStatus(true);
      const inPlaylist = await isInPlaylist(title, artist);
      setSongInPlaylist(inPlaylist);
    } catch (error) {
      console.error('Error checking playlist status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleTogglePlaylist = async () => {
    if (!isAuthenticated) {
      toast.error('Je moet ingelogd zijn om nummers aan je playlist toe te voegen');
      return;
    }

    if (!spotifyConnected) {
      toast.error('Je moet verbonden zijn met Spotify om nummers toe te voegen');
      return;
    }

    setIsToggling(true);
    try {
      const success = await toggleSong(title, artist, id);
      if (success) {
        setSongInPlaylist(!songInPlaylist);
      }
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden border border-neutral-200 hover:border-red-300 md:hover:-translate-y-1">
      {/* Desktop View - Card with Image */}
      <div className="hidden md:block">
        <div className="relative overflow-hidden">
          <ImageWithFallback
            src={albumImage}
            alt={title}
            className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {rank && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-red-700 text-white w-11 h-11 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/40 group-hover:scale-110 transition-transform duration-300">
              <span className="font-bold text-sm">#{rank}</span>
            </div>
          )}
          {/* Playlist indicator */}
          {showAddToPlaylist && isAuthenticated && spotifyConnected && (
            <div className="absolute top-3 right-3">
              {checkingStatus ? (
                <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                </div>
              ) : songInPlaylist ? (
                <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/40">
                  <Heart className="w-4 h-4" fill="white" />
                </div>
              ) : null}
            </div>
          )}
          {canPlay && (
            <button
              onClick={onPlay}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-xl shadow-green-600/40 hover:scale-110 transition-transform duration-200">
                <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
              </div>
            </button>
          )}
        </div>
        <div className="p-4">
          <Link href={`/songDetails/${id}`} className="hover:text-red-600 transition-colors duration-200 block">
            <h4 className="mb-1.5 font-semibold line-clamp-2">{title}</h4>
          </Link>
          <div className="flex items-center justify-between mb-3">
            <Link href={`/artistsDetails/${artistId}`} className="text-neutral-600 hover:text-red-600 transition-colors duration-200 block flex-1 min-w-0">
              <p className="line-clamp-1">{artist}</p>
            </Link>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {canPlay && onPlay && (
              <Button 
                onClick={onPlay} 
                size="sm" 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="h-4 w-4 mr-1.5" />
                Afspelen
              </Button>
            )}
            
            {!canPlay && (
              <Link href={`/songDetails/${id}`} className="flex-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full border-neutral-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                >
                  <ArrowUpRight className="h-4 w-4 mr-1.5" />
                  Bekijken
                </Button>
              </Link>
            )}

            {showAddToPlaylist && isAuthenticated && spotifyConnected && (
              <Button
                onClick={handleTogglePlaylist}
                disabled={isToggling || checkingStatus}
                size="sm"
                variant="outline"
                className={`shrink-0 transition-colors ${
                  songInPlaylist 
                    ? 'bg-pink-50 border-pink-300 text-pink-600 hover:bg-pink-100' 
                    : 'border-neutral-300 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600'
                }`}
              >
                {isToggling || checkingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : songInPlaylist ? (
                  <Heart className="h-4 w-4" fill="currentColor" />
                ) : (
                  <HeartOff className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile View - Compact List Item */}
      <div className="flex md:hidden items-center gap-3 p-4">
        {/* Rank Badge */}
        {rank && (
          <div className="flex-shrink-0 bg-gradient-to-r from-red-600 to-red-700 text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-md shadow-red-500/40">
            <span className="font-bold text-sm">#{rank}</span>
          </div>
        )}
        
        {/* Album Image */}
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
          <ImageWithFallback
            src={albumImage}
            alt={`${title} - ${artist}`}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Title and Artist */}
        <div className="flex-1 min-w-0">
          <Link href={`/songDetails/${id}`} className="hover:text-red-600 transition-colors duration-200 block">
            <h4 className="font-semibold line-clamp-1">{title}</h4>
          </Link>
          <Link href={`/artistsDetails/${artistId}`} className="text-neutral-600 hover:text-red-600 transition-colors duration-200 block">
            <p className="line-clamp-1 text-sm">{artist}</p>
          </Link>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Playlist button */}
          {showAddToPlaylist && isAuthenticated && spotifyConnected && (
            <Button
              onClick={handleTogglePlaylist}
              disabled={isToggling || checkingStatus}
              size="sm"
              variant="ghost"
              className={`w-10 h-10 p-0 transition-colors ${
                songInPlaylist 
                  ? 'text-pink-600 hover:bg-pink-50' 
                  : 'text-neutral-400 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              {isToggling || checkingStatus ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : songInPlaylist ? (
                <Heart className="h-4 w-4" fill="currentColor" />
              ) : (
                <HeartOff className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Play or Details button */}
          {canPlay ? (
            <button
              onClick={onPlay}
              className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-md shadow-green-600/40 active:scale-95 transition-transform duration-200"
            >
              <Play className="h-5 w-5 text-white ml-0.5" fill="white" />
            </button>
          ) : (
            <Link href={`/songDetails/${id}`}>
              <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center border border-neutral-300 active:scale-95 transition-transform duration-200">
                <ArrowUpRight className="h-5 w-5 text-neutral-600" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}