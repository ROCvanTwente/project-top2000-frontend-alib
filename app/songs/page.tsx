"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import Carousel from "../components/customUI/Carousel";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { Input } from "../components/ui/input";
import { useEffect, useMemo, useState } from "react";

import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";

type SongDto = {
  songId: number;
  titel: string;
  artistName: string | null;
  releaseYear: number;
  imgUrl: string | null;
};

type UISong = {
  id: number;
  title: string;
  artist: string;
  year: number;
  albumImage: string;
};

const MAX_FILTER_LEN = 60;

const cleanAndLimit = (value: string) =>
  value.replace(/\s+/g, " ").trim().slice(0, MAX_FILTER_LEN);

export default function Songs() {
  const [searchTerm, setSearchTerm] = useState("");

  const [songs, setSongs] = useState<UISong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 100;

  const carouselSlides = [
    {
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200",
      title: "Alle Nummers",
      subtitle: "Verken door elk nummer in de TOP2000",
    },
  ];

  const fetchAllSongs = async () => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/song/getallsongs`
      );
      if (!res.ok) {
        throw new Error(`API fout: ${res.status} ${res.statusText}`);
      }

      const json = await res.json();
      const arr: SongDto[] = Array.isArray(json) ? json : [];

      const mapped: UISong[] = arr.map((s) => ({
        id: s.songId,
        title: s.titel,
        artist: s.artistName ?? "Onbekende artiest",
        year: s.releaseYear,
        albumImage: s.imgUrl ?? "/images/placeholder-album.png",
      }));

      setSongs(mapped);
    } catch (e: any) {
      setSongs([]);
      setError(
        e?.message ??
          "Onbekende fout bij het ophalen van songs. Probeer het later opnieuw."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSongs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredSongs = useMemo(() => {
    const qRaw = searchTerm.trim().toLowerCase();
    if (!qRaw) return songs;

    const numberMatch = qRaw.match(/\d+/);
    const qNum = numberMatch ? Number(numberMatch[0]) : null;
    const isNumeric = qNum !== null && !Number.isNaN(qNum);

    return songs.filter((song) => {
      const titleMatch = song.title.toLowerCase().includes(qRaw);
      const artistMatch = song.artist.toLowerCase().includes(qRaw);

      const yearStr = String(song.year);
      const yearTextMatch =
        qRaw.includes("uitgebracht") ||
        qRaw.includes("release") ||
        qRaw.includes("jaar");

      const yearMatch =
        (isNumeric && song.year === qNum) ||
        yearStr.includes(qRaw) ||
        (isNumeric && yearTextMatch && yearStr.includes(String(qNum)));

      // fallback: puur numeriek zonder woorden → match op jaar
      const genericNumberMatch = isNumeric && !qRaw.match(/[a-z]/) && song.year === qNum;

      return titleMatch || artistMatch || yearMatch || genericNumberMatch;
    });
  }, [songs, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredSongs.length / ITEMS_PER_PAGE));
  }, [filteredSongs.length]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const displayedSongs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSongs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSongs, currentPage]);

  const goToPage = (page: number) => {
    const safe = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(safe);
  };

  const searchTermDisplay = useMemo(() => {
    const t = searchTerm.trim();
    if (!t) return "";
    return t.length > 30 ? `${t.slice(0, 30)}…` : t;
  }, [searchTerm]);

  if (loading) {
    return (
      <LoadingState title="Alle Nummers" subtitle="Nummers worden geladen…" />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Oeps… we kunnen de nummers niet laden"
        message="Er ging iets mis bij het ophalen van de nummers."
        error={error}
        issue="songs-load-error"
      />
    );
  }

  return (
    <div>
      <Carousel slides={carouselSlides} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-4">
            <Search className="h-5 w-5 mr-2 text-gray-600" />
            <h3>Zoek nummers</h3>
          </div>

          <Input
            placeholder='Zoek op nummer, artiest of jaar...'
            value={searchTerm}
            maxLength={MAX_FILTER_LEN}
            onChange={(e) => setSearchTerm(cleanAndLimit(e.target.value))}
            className="max-w-md"
          />
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Toon {displayedSongs.length} van {filteredSongs.length} nummers
            {searchTermDisplay && ` passend op "${searchTermDisplay}"`}
          </p>
        </div>

        {/* Songs List */}
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
          {displayedSongs.map((song) => (
            <Link
              key={song.id}
              href={`/songDetails/${song.id}`}
              className="flex items-center space-x-4 p-4 hover:bg-gray-50 transition"
            >
              <ImageWithFallback
                src={song.albumImage}
                alt={song.title}
                className="w-16 h-16 rounded object-cover"
              />

              <div className="flex-1 min-w-0">
                <h4 className="mb-1 truncate hover:text-red-600 transition">
                  {song.title}
                </h4>
                <p className="text-gray-600 truncate">{song.artist}</p>
              </div>

              <div className="text-right">
                <p className="text-gray-600">Uitgebracht: {song.year}</p>
              </div>
            </Link>
          ))}
        </div>

        {filteredSongs.length > 0 && totalPages > 1 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg shadow-sm bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition"
              >
                Vorige
              </button>

              <div className="flex items-center gap-3 text-gray-600">
                <div>
                  Pagina <span className="font-medium">{currentPage}</span> van{" "}
                  <span className="font-medium">{totalPages}</span>
                </div>

                <select
                  value={currentPage}
                  onChange={(e) => goToPage(Number(e.target.value))}
                  className="px-3 py-2 rounded-lg shadow-sm bg-white border border-gray-200 text-gray-700 hover:shadow-md transition"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <option key={p} value={p}>
                        Pagina {p}
                      </option>
                    )
                  )}
                </select>
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg shadow-sm bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition"
              >
                Volgende
              </button>
            </div>
          </div>
        )}

        {filteredSongs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">
              Geen nummers gevonden passend op "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
