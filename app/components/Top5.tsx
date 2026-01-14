import Link from 'next/link';
import { Calendar, Users, Music, TrendingUp, Radio, ArrowUpRight } from 'lucide-react';
import SongCard from './Songcard';
import { allMockSongs } from '../lib/mockData';
import { Button } from './ui/button';
import { ImageWithFallback } from './ImageWithFallback';

interface Top5Props {
  selectedYear: number;
  onSpotifyClick: () => void;
  spotifyConnected: boolean;
}

export default function Top5({ selectedYear, onSpotifyClick, spotifyConnected }: Top5Props) {
  const top5Songs = allMockSongs.slice(0, 5);

  const handlePlay = (songId: string) => {
    if (!spotifyConnected) {
      onSpotifyClick();
    } else {
      // Play song logic
      console.log('Playing song:', songId);
    }
  };

  return (
    <div>
      {/* Top 5 Songs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <div className="inline-block px-4 py-1.5 bg-red-100 rounded-full">
              <span className="text-red-700 font-semibold">Uitgelicht</span>
            </div>
            <Button variant="outline" size="sm" className="border-neutral-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600" asChild>
              <Link href={`/year/${selectedYear}`}>
                Volledige Lijst Bekijken
              </Link>
            </Button>
          </div>
          <h2 className="mb-2 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
            Top 5 Nummers van {selectedYear}
          </h2>
          <p className="text-neutral-600">De best geclassificeerde nummers dit jaar</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {top5Songs.map((song, index) => (
            <div key={song.id} className="hidden sm:block">
              <SongCard
                id={song.id}
                rank={index + 1}
                title={song.title}
                artist={song.artist}
                artistId={song.artistId}
                albumImage={song.albumImage}
                onPlay={() => handlePlay(song.id)}
                canPlay={spotifyConnected}
              />
            </div>
          ))}
        </div>

        {/* Mobile Top 5 - List Style */}
        <div className="sm:hidden bg-white rounded-lg shadow-sm overflow-hidden">
          {top5Songs.map((song, index) => (
            <div key={song.id} className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50 transition">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md shrink-0">
                <span className="font-bold text-xs">#{index + 1}</span>
              </div>
              <ImageWithFallback
                src={song.albumImage}
                alt={song.title}
                className="w-12 h-12 rounded object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link href={`/song/${song.id}`} className="hover:text-red-600 transition">
                  <p className="font-semibold text-sm line-clamp-1">{song.title}</p>
                </Link>
                <Link href={`/artist/${song.artistId}`} className="text-neutral-600 hover:text-red-600 transition">
                  <p className="text-xs line-clamp-1">{song.artist}</p>
                </Link>
              </div>
              <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-neutral-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700" asChild>
                <Link href={`/song/${song.id}`} className="shrink-0">
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}