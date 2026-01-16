"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { ImageWithFallback } from "../../components/ImageWithFallback";

type ApiSong = {
  titel: string;
  releaseYear: number;
  highestRank: number;
};

type ApiStats = {
  totalSongsInTop2000: number;
  highestRankOverall: number;
  oldestSong: { titel: string; releaseYear: number };
  newestSong: { titel: string; releaseYear: number };
};

type Artist = {
  artistId: number | string;
  artistName: string;
  wikipediaUrl?: string;
  biography?: string;
  photo?: string;
  stats?: Partial<ApiStats>;
  songs?: ApiSong[];
};

export default function ArtistDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchArtist = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          throw new Error("Geen artiest-id in de route gevonden.");
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL}/artists?artistId=${encodeURIComponent(id)}`;

        const res = await fetch(url, { cache: "no-store" });

        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        const parsed: Artist | null = Array.isArray(data)
          ? (data[0] ?? null)
          : (data ?? null);

        if (!isMounted) return;
        setArtist(parsed);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message ?? "Onbekende fout bij ophalen van artiest");
        setArtist(null);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchArtist();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const songs = useMemo(() => artist?.songs ?? [], [artist]);
  const totalSongs = useMemo(() => {
    return artist?.stats?.totalSongsInTop2000 ?? songs.length ?? 0;
  }, [artist, songs.length]);

  const photo = useMemo(() => {
    const p = artist?.photo?.trim();
    return p ? p : "/fallback-artist.jpg";
  }, [artist]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <p className="text-gray-600">Laden...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <Link
              href="/artists"
              className="inline-flex items-center text-gray-700 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar Artiesten
            </Link>

            <p className="text-gray-600">Kon artiest niet laden.</p>
            <p className="text-sm text-gray-500 mt-2">Fout: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  // No data (bijv. lege response)
  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <Link
              href="/artists"
              className="inline-flex items-center text-gray-700 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar Artiesten
            </Link>

            <p className="text-gray-600">Artiest niet gevonden.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <div className="relative h-96 w-full">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={photo}
            alt={artist.artistName}
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

          <h1 className="text-5xl font-bold text-white mb-4">
            {artist.artistName}
          </h1>

          <div className="flex items-center space-x-6 text-white/90">
            <span className="text-lg">{totalSongs} nummers in TOP2000</span>

            {!!artist.wikipediaUrl?.trim() && (
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
          {/* Bio + Songs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Over</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {artist.biography?.trim()
                  ? artist.biography
                  : "Geen biografie beschikbaar."}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Nummers in TOP2000
              </h2>

              {songs.length ? (
                <div className="space-y-4">
                  {songs.map((song, idx) => (
                    <div
                      key={`${song.titel}-${song.releaseYear}-${idx}`}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {song.titel}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {song.releaseYear}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-medium text-red-600">
                          #{song.highestRank}
                        </div>
                        <div className="text-xs text-gray-500">
                          Hoogste notering
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Geen nummers gevonden.</p>
              )}
            </div>
          </div>

          {/* Sidebar / Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="font-bold text-gray-900 mb-4">Snelle Stats</h3>

              <dl className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <dt className="text-gray-500">Totale Nummers</dt>
                  <dd className="font-medium text-gray-900">{totalSongs}</dd>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-100">
                  <dt className="text-gray-500">Hoogste Rangschikking</dt>
                  <dd className="font-medium text-gray-900">
                    {artist.stats?.highestRankOverall
                      ? `#${artist.stats.highestRankOverall}`
                      : "-"}
                  </dd>
                </div>

                <div className="py-3 border-b border-gray-100">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Oudste Nummer</dt>
                    <dd className="font-medium text-gray-900">
                      {artist.stats?.oldestSong?.releaseYear ?? "-"}
                    </dd>
                  </div>
                  {artist.stats?.oldestSong?.titel && (
                    <div className="text-sm text-gray-600 mt-1">
                      {artist.stats.oldestSong.titel}
                    </div>
                  )}
                </div>

                <div className="py-3 border-b border-gray-100">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Nieuwste Nummer</dt>
                    <dd className="font-medium text-gray-900">
                      {artist.stats?.newestSong?.releaseYear ?? "-"}
                    </dd>
                  </div>
                  {artist.stats?.newestSong?.titel && (
                    <div className="text-sm text-gray-600 mt-1">
                      {artist.stats.newestSong.titel}
                    </div>
                  )}
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
