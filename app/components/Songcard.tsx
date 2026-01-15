import { Play, Plus, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { ImageWithFallback } from './ImageWithFallback';
import { Button } from './ui/button';

interface SongCardProps {
  id: string;
  rank?: number;
  title: string;
  artist: string;
  artistId: string;
  albumImage: string;
  onPlay?: () => void;
  onAddToPlaylist?: () => void;
  canPlay: boolean;
}

export default function SongCard({
  id,
  rank,
  title,
  artist,
  artistId,
  albumImage,
  onPlay,
  onAddToPlaylist,
  canPlay
}: SongCardProps) {
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
            <h4 className="mb-1.5 font-semibold">{title}</h4>
          </Link>
          <div className="flex items-center justify-between">
            <Link href={`/artist/${artistId}`} className="text-neutral-600 hover:text-red-600 transition-colors duration-200 block flex-1 min-w-0">
              <p className="line-clamp-1">{artist}</p>
            </Link>
            {!canPlay && (
              <Link href={`/songDetails/${id}`} className="ml-2">
                <Button size="sm" variant="outline" className="border-neutral-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
          {canPlay && (
            <div className="flex items-center space-x-2 mt-3">
              {onPlay && (
                <Button onClick={onPlay} size="sm" variant="outline" className="flex-1 border-neutral-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700">
                  <Play className="h-4 w-4 mr-1.5" />
                  Play
                </Button>
              )}
              <Link href={`/song/${id}`}>
                <Button size="sm" variant="outline" className="border-neutral-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
              {onAddToPlaylist && (
                <Button onClick={onAddToPlaylist} size="sm" variant="outline" className="border-neutral-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700">
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
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
        
        {/* Title and Artist */}
        <div className="flex-1 min-w-0">
          <Link href={`/song/${id}`} className="hover:text-red-600 transition-colors duration-200 block">
            <h4 className="font-semibold line-clamp-1">{title}</h4>
          </Link>
          <Link href={`/artist/${artistId}`} className="text-neutral-600 hover:text-red-600 transition-colors duration-200 block">
            <p className="line-clamp-1 text-sm">{artist}</p>
          </Link>
        </div>

        {/* Play or Connect Icon */}
        <div className="flex-shrink-0">
          {canPlay ? (
            <button
              onClick={onPlay}
              className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-md shadow-green-600/40 active:scale-95 transition-transform duration-200"
            >
              <Play className="h-5 w-5 text-white ml-0.5" fill="white" />
            </button>
          ) : (
            <Link href={`/song/${id}`}>
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
