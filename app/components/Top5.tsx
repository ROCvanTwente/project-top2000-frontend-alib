import Link from 'next/link';
import { Calendar, Users, Music, TrendingUp, Radio, ArrowUpRight } from 'lucide-react';
import SongCard from './Songcard';
import { getYearsList } from '../lib/mockData';
import { Button } from './ui/button';
import { ImageWithFallback } from './ImageWithFallback';
import { useState, useEffect } from 'react';

interface Top5Props {
  selectedYear: number;
  onSpotifyClick: () => void;
  spotifyConnected: boolean;
}

interface Top2000Entry {
  songId: number;
  year: number;
  position: number;
  positionLastYear: number;
  difference: number;
  titel: string;
  artistId: number;
  artistName: string;
  releaseYear: number;
  songImg: string;
}

export default function Top5({ selectedYear, onSpotifyClick, spotifyConnected }: Top5Props) {
  const [data, setData] = useState<Top2000Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(selectedYear);

  const fetchData = (year: number) => {
    setLoading(true);
    fetch(`https://localhost:7003/top5/${year}`)
      .then(async (res) => {
        
        const json = await res.json();
        console.log('API Response:', json);
        let fetchedData: Top2000Entry[] = [];
        if (Array.isArray(json)) fetchedData = json;
        // Handle potential nested structure if API changes, but prioritize array
        else if (json && Array.isArray(json.songs)) fetchedData = json.songs;
        
        setData(fetchedData.sort((a, b) => a.position - b.position));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(currentYear);
  }, []);

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

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {data.slice(0, 5).map((song, index) => (
                <div key={song.songId || index} className="hidden sm:block">
                  <SongCard
                    id={song.songId.toString()}
                    rank={song.position}
                    title={song.titel}
                    artist={song.artistName}
                    artistId={song.artistId.toString()}
                    albumImage={song.imgUrl || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400'}
                    onPlay={() => handlePlay(song.songId.toString())}
                    canPlay={spotifyConnected}
                  />
                </div>
              ))}
            </div>

            {/* Mobile Top 5 - List Style */}
            <div className="sm:hidden bg-white rounded-lg shadow-sm overflow-hidden">
              {data.slice(0, 5).map((song, index) => (
                <div key={song.songId || index} className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md shrink-0">
                    <span className="font-bold text-xs">#{song.position}</span>
                  </div>
                  <ImageWithFallback
                    src={song.imgUrl}
                    alt={song.titel}
                    className="w-12 h-12 rounded object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link href={`/songDetails/${song.songId}`} className="hover:text-red-600 transition">
                      <p className="font-semibold text-sm line-clamp-1">{song.titel}</p>
                    </Link>
                    <Link href={`/artist/${song.artistId}`} className="text-neutral-600 hover:text-red-600 transition">
                      <p className="text-xs line-clamp-1">{song.artistName}</p>
                    </Link>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-neutral-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700" asChild>
                    <Link href={`/songDetails/${song.songId}`} className="shrink-0">
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}