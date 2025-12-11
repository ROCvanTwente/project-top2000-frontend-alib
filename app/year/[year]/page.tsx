"use client";
import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Filter, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import Carousel from '../../components/customUI/Carousel';
import { getSongsForYear } from '../../lib/mockData';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import Link from 'next/link';

interface YearOverviewProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  onSpotifyClick: () => void;
  spotifyConnected: boolean;
}

export default function YearOverview({ selectedYear, onYearChange, onSpotifyClick, spotifyConnected }: YearOverviewProps) {
  const { year } = useParams();
  const router = useRouter();
  const currentYear = year ? parseInt(year) : selectedYear;

  const [artistFilter, setArtistFilter] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [displayCount, setDisplayCount] = useState(100);

  const songs = useMemo(() => {
    let filtered = getSongsForYear(currentYear);

    if (artistFilter) {
      filtered = filtered.filter(song =>
        song.artist.toLowerCase().includes(artistFilter.toLowerCase())
      );
    }

    if (sortBy === 'artist') {
      filtered = [...filtered].sort((a, b) => a.artist.localeCompare(b.artist));
    } else if (sortBy === 'title') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [currentYear, artistFilter, sortBy]);

  const displayedSongs = songs.slice(0, displayCount);
  const hasMore = displayCount < songs.length;

  const carouselSlides = [
    {
      image: 'https://images.unsplash.com/photo-1672841821756-fc04525771c2?w=1200',
      title: `TOP2000 ${currentYear}`,
      subtitle: `Discover the ${songs.length} best songs of the year`
    }
  ];

  const handlePlay = (songId: string) => {
    if (!spotifyConnected) {
      onSpotifyClick();
    } else {
      console.log('Playing song:', songId);
    }
  };

  return (
    <div>
      <Carousel slides={carouselSlides} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 mr-2 text-gray-600" />
            <h3>Filters & Sorting</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-2">Filter by Artist</label>
              <Input
                placeholder="Search artist name..."
                value={artistFilter}
                onChange={(e) => setArtistFilter(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rank">Rank</SelectItem>
                  <SelectItem value="artist">Artist Name</SelectItem>
                  <SelectItem value="title">Song Title</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2">Display Limit</label>
              <Select value={displayCount.toString()} onValueChange={(value) => setDisplayCount(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 songs</SelectItem>
                  <SelectItem value="200">200 songs</SelectItem>
                  <SelectItem value="300">300 songs</SelectItem>
                  <SelectItem value="500">500 songs</SelectItem>
                  <SelectItem value="1000">1000 songs</SelectItem>
                  <SelectItem value="2000">2000 songs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setArtistFilter('');
                  setSortBy('rank');
                  setDisplayCount(100);
                }}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {displayedSongs.length} of {songs.length} {songs.length === 1 ? 'song' : 'songs'}
            {artistFilter && ` matching "${artistFilter}"`}
          </p>
        </div>

        {/* Songs Table - Desktop */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">Rank</th>
                  <th className="px-6 py-3 text-left">Song</th>
                  <th className="px-6 py-3 text-left">Artist</th>
                  <th className="px-6 py-3 text-left">Year</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedSongs.map((song) => (
                  <tr key={song.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-700 rounded-full">
                          <span>#{song.yearRank}</span>
                        </div>
                        {song.rankChange !== null && song.rankChange !== undefined && (
                          <div className="flex flex-col items-center">
                            {song.rankChange > 0 ? (
                              // Improved position (moved up)
                              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full animate-pulse">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-xs font-semibold">+{song.rankChange}</span>
                              </div>
                            ) : song.rankChange < 0 ? (
                              // Dropped position (moved down)
                              <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                <TrendingDown className="h-4 w-4" />
                                <span className="text-xs font-semibold">{song.rankChange}</span>
                              </div>
                            ) : (
                              // No change
                              <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                <Minus className="h-4 w-4" />
                                <span className="text-xs font-semibold">0</span>
                              </div>
                            )}
                          </div>
                        )}
                        {song.rankChange === null && (
                          // New entry
                          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-xs font-semibold">NEW</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <ImageWithFallback
                          src={song.albumImage}
                          alt={song.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <Link to={`/song/${song.id}`} className="hover:text-red-600 transition">
                          <span>{song.title}</span>
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/artist/${song.artistId}`} className="text-gray-600 hover:text-red-600 transition">
                        {song.artist}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{song.year}</td>
                    <td className="px-6 py-4">
                      {spotifyConnected ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePlay(song.id)}
                          className="hover:bg-green-50 hover:text-green-600 hover:border-green-600"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Play
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={onSpotifyClick}
                        >
                          Connect to Play
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Songs List - Mobile */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden md:hidden">
          <div className="divide-y divide-gray-200">
            {displayedSongs.map((song) => (
              <div key={song.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition">
                {/* Rank Badge */}
                <div className="flex-shrink-0 bg-gradient-to-r from-red-600 to-red-700 text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-md shadow-red-500/40">
                  <span className="font-bold text-sm">#{song.yearRank}</span>
                </div>
                
                {/* Title and Artist */}
                <div className="flex-1 min-w-0">
                  <Link to={`/song/${song.id}`} className="hover:text-red-600 transition-colors duration-200 block">
                    <h4 className="font-semibold line-clamp-1">{song.title}</h4>
                  </Link>
                  <Link to={`/artist/${song.artistId}`} className="text-neutral-600 hover:text-red-600 transition-colors duration-200 block">
                    <p className="line-clamp-1 text-sm">{song.artist}</p>
                  </Link>
                </div>

                {/* Play or Connect Icon */}
                <div className="flex-shrink-0">
                  {spotifyConnected ? (
                    <button
                      onClick={() => handlePlay(song.id)}
                      className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-md shadow-green-600/40 active:scale-95 transition-transform duration-200"
                    >
                      <Play className="h-5 w-5 text-white ml-0.5" fill="white" />
                    </button>
                  ) : (
                    <button
                      onClick={onSpotifyClick}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 active:scale-95 transition-transform duration-200"
                    >
                      <span className="text-green-600 text-lg">♫</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => setDisplayCount(prev => Math.min(prev + 100, songs.length))}
              className="border-neutral-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
            >
              Load More ({Math.min(100, songs.length - displayCount)} more songs)
            </Button>
          </div>
        )}

        {songs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No songs found matching your filters.</p>
            <Button
              variant="outline"
              onClick={() => setArtistFilter('')}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}