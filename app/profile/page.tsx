"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowUpRight, Link2, CheckCircle2, ListMusic } from 'lucide-react';
import { FaSpotify } from 'react-icons/fa';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import Carousel from '../components/customUI/Carousel';
import { useAuth } from '../auth/AuthProvider';
import LoadingState from '../components/ui/LoadingState';
import { isSpotifyLoggedIn, spotifyLogout } from '../spotify/script';

function decodeJwt(token?: string | null): Record<string, any> | null {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = typeof window !== 'undefined'
      ? atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
      : Buffer.from(base64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function Profile() {
  const { initialized, isAuthenticated, isAdmin, token } = useAuth();
  const [spotifyConnected, setSpotifyConnected] = useState<boolean>(false);

  const claims = useMemo(() => decodeJwt(token), [token]);
  const displayName: string = useMemo(() => {
    return (
      claims?.name ||
      claims?.given_name ||
      claims?.unique_name ||
      claims?.preferred_username ||
      claims?.sub ||
      'Gebruiker'
    );
  }, [claims]);
  const email: string | undefined = useMemo(() => {
    return claims?.email || claims?.upn || undefined;
  }, [claims]);

  useEffect(() => {
    setSpotifyConnected(isSpotifyLoggedIn());
  }, []);

  if (!initialized) return <LoadingState title="Profiel laden" subtitle="Even geduld…" />;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-red-50/30 to-orange-50/20 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-neutral-200 rounded-xl p-8 text-center shadow-sm">
          <h2 className="mb-2 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Inloggen vereist</h2>
          <p className="text-neutral-600 mb-6">Log in om je profiel te bekijken en Spotify te koppelen.</p>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white">Naar inloggen</Button>
          </Link>
        </div>
      </div>
    );
  }

  const carouselSlides = [
    {
      image: 'https://images.unsplash.com/photo-1704726135027-9c6f034cfa41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2VyJTIwcHJvZmlsZSUyMGFjY291bnR8ZW58MXx8fHwxNzY5MDc3MTk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'PROFIEL',
      icon: 'user'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-red-50/30 to-orange-50/20">
      {/* Header Carousel */}
      <Carousel slides={carouselSlides} showBottomBar={false} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Basic user info */}
        <div className="mb-12">
          <Card className="p-8 border-neutral-200">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="text-red-700 font-bold text-xl">{String(displayName).charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="mb-1">{displayName}</h3>
                {email && <p className="text-neutral-600 text-sm">{email}</p>}
                {isAdmin && (
                  <p className="text-xs inline-flex items-center gap-1 mt-3 px-2 py-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
                    <Shield className="w-3 h-3" />
                    Beheerder
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
        
        {/* Quick Access to Playlist */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="mb-2 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Mijn Spotify Bibliotheek
            </h2>
            <p className="text-neutral-600">
              Bekijk en beheer je opgeslagen nummers op Spotify
            </p>
          </div>

          <Card className="p-8 border-neutral-200">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shrink-0">
                <ListMusic className="w-10 h-10 text-white" />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="mb-2">Mijn Favoriete Nummers</h3>
                <p className="text-neutral-600 text-sm mb-4">
                  Bekijk alle nummers die je hebt opgeslagen in je Spotify bibliotheek en exporteer ze naar een nieuwe Top2000 playlist.
                </p>

                <Link href="/my-playlist">
                  <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md shadow-red-200/50">
                    <ListMusic className="w-4 h-4 mr-2" />
                    Bekijk Spotify Bibliotheek
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Spotify Integration Card */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="mb-2 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Spotify Integratie
            </h2>
            <p className="text-neutral-600">
              Koppel je Spotify account om muziek direct af te spelen
            </p>
          </div>

          <Card className="p-8 border-neutral-200">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Spotify Icon */}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center shrink-0 ${
                spotifyConnected 
                  ? 'bg-gradient-to-br from-green-500 to-green-600' 
                  : 'bg-neutral-100'
              }`}>
                <FaSpotify className={`w-10 h-10 ${
                  spotifyConnected ? 'text-white' : 'text-neutral-400'
                }`} />
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="mb-2 flex items-center justify-center md:justify-start gap-2">
                  {spotifyConnected ? (
                    <>
                      Spotify Verbonden
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </>
                  ) : (
                    'Verbind je Spotify Account'
                  )}
                </h3>
                <p className="text-neutral-600 text-sm mb-4">
                  {spotifyConnected 
                    ? 'Je account is succesvol gekoppeld. Je kunt nu muziek afspelen en playlists exporteren.'
                    : 'Koppel je Spotify account om direct muziek af te spelen en playlists te exporteren naar Spotify.'
                  }
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {spotifyConnected ? (
                    <>
                      <Link href="/my-playlist">
                        <Button className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md shadow-red-200/50">
                          <ListMusic className="w-4 h-4 mr-2" />
                          Mijn Spotify Bibliotheek
                        </Button>
                      </Link>
                      <Link href="/spotify">
                        <Button 
                          variant="outline"
                          className="w-full sm:w-auto border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400"
                        >
                          <FaSpotify className="w-4 h-4 mr-2" />
                          Spotify Integratie
                        </Button>
                      </Link>
                      <Button
                        onClick={() => { spotifyLogout(); setSpotifyConnected(false); toast.success('Spotify account ontkoppeld'); }}
                        variant="outline"
                        className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                      >
                        <Link2 className="w-4 h-4 mr-2" />
                        Ontkoppel Account
                      </Button>
                    </>
                  ) : (
                    <Link href="/spotify">
                      <Button 
                        onClick={() => toast.info('Doorsturen naar Spotify…')}
                        className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md shadow-green-200/50"
                      >
                        <Link2 className="w-4 h-4 mr-2" />
                        Verbind met Spotify
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Admin Section - Only visible for admins */}
        {isAdmin && (
          <div>
            <div className="mb-6">
              <h2 className="mb-2 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Beheer
              </h2>
              <p className="text-neutral-600">
                Beheerdersfuncties en tools
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/admin"
                className="relative bg-white p-7 rounded-lg hover:shadow-xl transition-all duration-300 group overflow-hidden border border-neutral-200 hover:border-yellow-300 hover:-translate-y-2 min-h-[200px]"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1080)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/70 to-yellow-600/70 group-hover:from-yellow-500/80 group-hover:to-yellow-600/80 transition-all duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-6 w-6 text-white transition-colors" />
                  </div>
                  <h3 className="mb-2 text-white transition-colors">Beheerders paneel</h3>
                  <p className="text-yellow-100 transition-colors text-sm">
                    Beheer artiesten en nummers
                  </p>
                </div>
                <div className="absolute bottom-4 right-4 z-10 w-8 h-8 bg-white rounded flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <ArrowUpRight className="h-4 w-4 text-yellow-600" />
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}