import { getAllArtistsWithSongCount, getArtistSongs } from '../../lib/mockData';
import { notFound } from 'next/navigation';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import Link from 'next/link';
import { ArrowLeft, Globe, ExternalLink } from 'lucide-react';

export default async function ArtistDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artists = getAllArtistsWithSongCount();
  const artist = artists.find(a => a.id === id);

  if (!artist) {
    notFound();
  }

  const songs = getArtistSongs(id);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <div className="relative h-96 w-full">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={artist.photo}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
          <Link 
            href="/artists" 
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar Artiesten
          </Link>
          <h1 className="text-5xl font-bold text-white mb-4">{artist.name}</h1>
          <div className="flex items-center space-x-6 text-white/90">
            <span className="text-lg">{artist.songCount} nummers in TOP2000</span>
            {artist.officialWebsite && (
              <a 
                href={artist.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-red-400 transition-colors"
              >
                <Globe className="mr-2 h-4 w-4" />
                Website
              </a>
            )}
            {artist.wikipediaUrl && (
              <a 
                href={artist.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-red-400 transition-colors"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Wikipedia
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Bio Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Over</h2>
              <p className="text-gray-600 leading-relaxed text-lg">{artist.bio}</p>
            </div>

            {/* Songs List */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Nummers in TOP2000</h2>
              <div className="space-y-4">
                {songs.map((song) => (
                  <div 
                    key={song.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={song.albumImage}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{song.title}</h3>
                        <p className="text-sm text-gray-500">{song.year}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">
                        #{song.history[0]?.rank || '-'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Rangschikking 2024
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar / Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="font-bold text-gray-900 mb-4">Snelle Stats</h3>
              <dl className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <dt className="text-gray-500">Totale Nummers</dt>
                  <dd className="font-medium text-gray-900">{artist.songCount}</dd>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <dt className="text-gray-500">Hoogste Rangschikking</dt>
                  <dd className="font-medium text-gray-900">
                    #{Math.min(...songs.map(s => s.history[0]?.rank || 9999))}
                  </dd>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <dt className="text-gray-500">Oudste Nummer</dt>
                  <dd className="font-medium text-gray-900">
                    {Math.min(...songs.map(s => s.year))}
                  </dd>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <dt className="text-gray-500">Nieuwste Nummer</dt>
                  <dd className="font-medium text-gray-900">
                    {Math.max(...songs.map(s => s.year))}
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