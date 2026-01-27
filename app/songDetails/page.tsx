"use client";

import { ImageWithFallback } from "@/app/components/ImageWithFallback";
import { Play, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Line, LineChart } from "recharts";
import { useState, useEffect, use } from "react";

export default function SongDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [song, setSong] = useState<any>(null);
    const [artist, setArtist] = useState<any>(null);
    const [spotifyConnected, setSpotifyConnected] = useState(false);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("Fetching song details for ID:", id);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/songdetails/${id}`);
                const data = await response.json();
                console.log("Fetched Song Details:", data);
                setSong(data);
            } catch (error) {
                console.error("Error fetching song details:", error);
            }
        };
        fetchData();
    }, [id]);

    const handlePlay = () => {
        console.log("Play clicked");
    };

    const onSpotifyClick = () => {
        console.log("Connect Spotify clicked");
    };

    if (!song) {
        return <div className="p-8 text-center">Loading song details for ID: {id}... (Check console for fetch result)</div>;
    }

    return (
        <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <ImageWithFallback
              src={song.songImg}
              alt={song.titel}
              className="w-64 h-64 rounded-lg object-cover shadow-xl"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="mb-2">{song.titel}</h1>
              <Link href={`/artistsDetails/${song.artistId}`}>
                <h3 className="text-white text-opacity-90 hover:text-opacity-100 transition mb-4">
                  {song.artistName}
                </h3>
              </Link>
              <p className="text-white text-opacity-90 mb-6">
                Released: {song.releaseYear}
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {spotifyConnected ? (
                  <Button onClick={handlePlay} className="bg-green-600 hover:bg-green-700">
                    <Play className="h-4 w-4 mr-2" />
                    Play on Spotify
                  </Button>
                ) : (
                  <Button onClick={onSpotifyClick} className="bg-green-600 hover:bg-green-700">
                    Connect to Play
                  </Button>
                )}
                <Button variant="secondary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Playlist
                </Button>
                {song.youtubeLink && (
                  <a
                    href={song.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="secondary">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      YouTube
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Chart History */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="mb-6">Chart History</h2>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis 
                  reversed
                  domain={[1, 100]}
                  ticks={[1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                  label={{ value: 'Rank', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: any) => [`#${value}`, 'Rank']}
                />
                <Line 
                  type="monotone" 
                  dataKey="rank" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  dot={{ fill: '#dc2626', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {song.history && song.history.slice(0, 4).map((entry: any) => (
              <div key={entry.year} className="text-center p-3 bg-gray-50 rounded">
                <p className="text-gray-600 mb-1">{entry.year}</p>
                <p className="text-red-600">#{entry.rank}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lyrics */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h3 className="mb-4">Lyrics</h3>
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {song.lyrics}
            </div>
          </div>

          {/* Artist Info */}
          <div className="space-y-6">
            {artist && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h3 className="mb-4">About the Artist</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <ImageWithFallback
                    src={artist.photo}
                    alt={artist.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <Link href={`/artist/${artist.id}`}>
                      <h4 className="hover:text-red-600 transition">{artist.name}</h4>
                    </Link>
                    <p className="text-gray-600">
                      {artist.songCount} {artist.songCount === 1 ? 'song' : 'songs'} in TOP2000
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 line-clamp-4">{artist.bio}</p>
                <Link href={`/artist/${artist.id}`}>
                  <Button variant="outline" className="w-full">
                    View Artist Profile
                  </Button>
                </Link>
              </div>
            )}

            {/* Song Details */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="mb-4">Song Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-gray-600">Title</dt>
                  <dd>{song.title}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Artist</dt>
                  <dd>{song.artist}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Year Released</dt>
                  <dd>{song.year}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Times in TOP2000</dt>
                  <dd>{song.history ? song.history.length : 0} years</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Best Rank</dt>
                  <dd className="text-red-600">
                    #{song.history ? Math.min(...song.history.map((h: any) => h.rank)) : '-'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
}