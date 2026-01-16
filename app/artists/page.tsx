"use client";

import { Search, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Carousel from "../components/customUI/Carousel";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { Input } from "../components/ui/input";
import { useEffect, useMemo, useState } from "react";

type Artist = {
  artistId: string | number;
  artistName: string;
  photo: string;

  stats?: {
    totalSongsInTop2000?: number;
  };
};

export default function Artist() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 100;

  useEffect(() => {
    let isMounted = true;

    const fetchArtists = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/artists`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        if (!isMounted) return;
        setAllArtists(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message ?? "Onbekende fout bij ophalen van artiesten");
        setAllArtists([]);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchArtists();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredArtists = useMemo(() => {
    return allArtists.filter((artist) =>
      artist.artistName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allArtists, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredArtists.length / ITEMS_PER_PAGE));
  }, [filteredArtists.length]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedArtists = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArtists.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredArtists, currentPage]);

  const goToPage = (page: number) => {
    const safe = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(safe);
  };

  const carouselSlides = [
    {
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200",
      title: "Alle Artiesten",
      subtitle: "Verken elke artiest in de TOP2000",
    },
  ];

  return (
    <div>
      <Carousel slides={carouselSlides} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-4">
            <Search className="h-5 w-5 mr-2 text-gray-600" />
            <h3>Zoeken naar Artiesten</h3>
          </div>
          <Input
            placeholder="Zoeken op artiestennaam..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? (
              "Laden..."
            ) : error ? (
              `Fout: ${error}`
            ) : (
              <>
                Toon {filteredArtists.length}{" "}
                {filteredArtists.length === 1 ? "artiest" : "artiesten"}
                {searchTerm && ` passend op "${searchTerm}"`}
              </>
            )}
          </p>
        </div>

        {/* Artists Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedArtists.map((artist) => {
            const count = artist.stats?.totalSongsInTop2000 ?? 0;

                return (
                  <div
                    key={artist.artistId}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden group relative"
                  >
                    <div className="relative aspect-square">
                      <ImageWithFallback
                        src={artist.photo}
                        alt={artist.artistName}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="mb-2 group-hover:text-red-600 transition">
                        {artist.artistName}
                      </h4>
                      <p className="text-gray-600">
  {count} {count === 1 ? "nummer" : "nummers"} in TOP2000
</p>
                    </div>

                    {/* Alleen het pijltje is klikbaar */}
                    <Link
                      href={`/artistsDetails/${artist.artistId}`}
                      aria-label={`Bekijk details van ${artist.artistName}`}
                      className="absolute bottom-4 right-4 w-8 h-8 bg-white rounded shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    >
                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Pagination UI */}
            {filteredArtists.length > 0 && totalPages > 1 && (
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
                      Pagina <span className="font-medium">{currentPage}</span>{" "}
                      van <span className="font-medium">{totalPages}</span>
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
          </>
        )}

        {/* No results */}
        {!loading && !error && filteredArtists.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">
              Geen artiesten gevonden passend op &quot;{searchTerm}&quot;
            </p>
          </div>
        )}

        {/* Error box */}
        {!loading && error && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">Kon artiesten niet laden.</p>
          </div>
        )}
      </div>
    </div>
  );
}
