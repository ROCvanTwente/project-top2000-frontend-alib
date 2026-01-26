"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Music, Play, Trash2, Share2, Download } from 'lucide-react';
import { FaSpotify } from 'react-icons/fa';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import Carousel from '../components/customUI/Carousel';
import { useAuth } from '../auth/AuthProvider';
import LoadingState from '../components/ui/LoadingState';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { exportToSpotify } from '../../lib/playlist';
import { usePlaylist } from '../hooks/usePlaylist';

export default function MyPlaylist() {
  const { initialized, isAuthenticated } = useAuth();
  const { 
    playlist, 
    loading, 
    error, 
    removeSong, 
    fetchPlaylist,
    spotifyConnected
  } = usePlaylist();

  const handleRemoveFromPlaylist = async (spotifyId: string) => {
    await removeSong(spotifyId);
  };

  const handleExportToSpotify = async () => {
    await exportToSpotify();
  };

  const handlePlayOnSpotify = (spotifyUri: string) => {
    if (spotifyUri && typeof window !== 'undefined') {
      // Open Spotify link
      window.open(spotifyUri, '_blank');
    } else {
      toast.error('Spotify link niet beschikbaar voor dit nummer');
    }
  };

  if (!initialized) {
    return <LoadingState title="Playlist laden" subtitle="Even geduld…" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-red-50/30 to-orange-50/20 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-neutral-200 rounded-xl p-8 text-center shadow-sm">
          <h2 className="mb-2 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
            Inloggen vereist
          </h2>
          <p className="text-neutral-600 mb-6">
            Log in om je persoonlijke Top2000 playlist te bekijken.
          </p>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white">
              Naar inloggen
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!spotifyConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-red-50/30 to-orange-50/20 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-neutral-200 rounded-xl p-8 text-center shadow-sm">
          <FaSpotify className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="mb-2 bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            Spotify verbinding vereist
          </h2>
          <p className="text-neutral-600 mb-6">
            Verbind met Spotify om je favoriete nummers te bekijken en beheren.
          </p>
          <Link href="/spotify">
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
              Verbind met Spotify
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const carouselSlides = [
    {
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHBsYXlsaXN0fGVufDF8fHx8MTc2OTA3NzE5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'MIJN TOP2000 PLAYLIST',
      icon: 'music'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-red-50/30 to-orange-50/20">
      {/* Header Carousel */}
      <Carousel slides={carouselSlides} showBottomBar={false} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/profile">
            <Button variant="outline" className="hover:bg-red-50 hover:border-red-300 hover:text-red-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar profiel
            </Button>
          </Link>
        </div>

        {/* Playlist Header */}
        <div className="mb-8">
          <Card className="p-8 border-neutral-200">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Music className="w-10 h-10 text-red-700" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="mb-2 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  Mijn Spotify Bibliotheek
                </h1>
                <p className="text-neutral-600 mb-4">
                  {playlist.length} {playlist.length === 1 ? 'nummer' : 'nummers'} opgeslagen in je Spotify bibliotheek
                </p>
                
                {/* Action buttons */}
                {playlist.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleExportToSpotify}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                    >
                      <FaSpotify className="w-4 h-4 mr-2" />
                      Exporteer naar nieuwe playlist
                    </Button>
                    <Button variant="outline" className="hover:bg-red-50 hover:border-red-300 hover:text-red-600">
                      <Share2 className="w-4 h-4 mr-2" />
                      Deel playlist
                    </Button>
                    <Button variant="outline" className="hover:bg-red-50 hover:border-red-300 hover:text-red-600">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Playlist Content */}
        {loading ? (
          <LoadingState title="Playlist laden" subtitle="Je nummers worden opgehaald..." />
        ) : error ? (
          <Card className="p-8 border-red-200 bg-red-50">
            <div className="text-center">
              <h3 className="text-red-800 mb-2">Fout bij het laden</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button 
                onClick={fetchPlaylist}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Probeer opnieuw
              </Button>
            </div>
          </Card>
        ) : playlist.length === 0 ? (
          <Card className="p-8 border-neutral-200">
            <div className="text-center">
              <Music className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-neutral-800 mb-2">Geen nummers gevonden</h3>
              <p className="text-neutral-600 mb-6">
                Je hebt nog geen nummers opgeslagen in je Spotify bibliotheek.
                Ga naar nummers en voeg je favorieten toe!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/songs">
                  <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white">
                    Bekijk alle nummers
                  </Button>
                </Link>
                <Link href="/year">
                  <Button variant="outline" className="hover:bg-red-50 hover:border-red-300 hover:text-red-600">
                    Bekijk per jaar
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {playlist.map((song, index) => (
              <Card key={song.id} className="p-6 border-neutral-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {/* Song image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                    <ImageWithFallback
                      src={song.albumImage}
                      alt={`${song.title} - ${song.artist}`}
                      fallbackSrc="/images/music-placeholder.jpg"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Song info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-neutral-900 truncate">
                          {song.title}
                        </h3>
                        <Link 
                          href={`/artistsDetails/${song.artistId}`}
                          className="text-neutral-600 hover:text-red-600 transition-colors truncate block"
                        >
                          {song.artist}
                        </Link>
                        <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                          <span>Jaar: {song.year}</span>
                          {song.rank && <span>Ranking: #{song.rank}</span>}
                          <span>Toegevoegd: {song.addedAt ? new Date(song.addedAt).toLocaleDateString('nl-NL') : 'Onbekend'}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {song.spotifyUri && (
                          <Button
                            size="sm"
                            onClick={() => handlePlayOnSpotify(song.spotifyUri!)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Link href={`/songDetails/${song.id}`}>
                          <Button size="sm" variant="outline" className="hover:bg-red-50 hover:border-red-300 hover:text-red-600">
                            Details
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveFromPlaylist(song.spotifyId)}
                          className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}