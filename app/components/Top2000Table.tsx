// components/Top2000Table.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Play,
} from "lucide-react";

type Top2000Entry = {
  songId: number;
  year: number;
  position: number;
  positionLastYear: number | null;
  difference: number | null;
  titel: string;
  artistId: number;
  artistName: string;
  releaseYear?: number;
  imageUrl?: string;
};

/* ------------------------------------------
   ✅ Rank badge in de stijl van je YearOverview
------------------------------------------- */
function RankBadge({
  position,
  difference,
}: {
  position: number;
  difference: number | null;
}) {
  // difference:
  //  > 0 = omhoog
  //  < 0 = omlaag
  //  0 = gelijk
  //  null = new entry (zoals in je YearOverview)
  const isNew = difference === null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-700 rounded-full">
        <span className="text-sm font-semibold">#{position}</span>
      </div>

      {isNew ? (
        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold">NEW</span>
        </div>
      ) : difference! > 0 ? (
        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full animate-pulse">
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs font-semibold">+{difference}</span>
        </div>
      ) : difference! < 0 ? (
        <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full">
          <TrendingDown className="h-4 w-4" />
          <span className="text-xs font-semibold">{difference}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          <Minus className="h-4 w-4" />
          <span className="text-xs font-semibold">0</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------ */

export default function Top2000Table() {
  const years = useMemo(
    () =>
      [
        1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010,
        2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022,
        2023, 2024,
      ].reverse(),
    []
  );

  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [data, setData] = useState<Top2000Entry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterText, setFilterText] = useState("");
  const [sortOption, setSortOption] = useState<
    "Rank" | "Artist Name" | "Song Title" | "Release Year"
  >("Rank");
  const [displayLimit, setDisplayLimit] = useState<number>(100);

  // “Meer laden” (zoals je YearOverview)
  const [displayCount, setDisplayCount] = useState<number>(100);

  // Spotify (dummy - jij koppelt dit aan je echte flow)
  const [spotifyConnected] = useState(false);
  const onSpotifyClick = () => {
    console.log("Connect spotify clicked");
  };
  const handlePlay = (songId: number) => {
    if (!spotifyConnected) onSpotifyClick();
    else console.log("Play", songId);
  };

  const fetchYear = async (yr: number) => {
    setLoading(true);
    setFilterText("");
    setSortOption("Rank");
    setDisplayLimit(100);
    setDisplayCount(100);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/top2000/${yr}`);
    const json = await res.json();

    let fetchedData: Top2000Entry[] = [];
    if (Array.isArray(json)) fetchedData = json;
    else if (Array.isArray(json.songs)) fetchedData = json.songs;

    setData(fetchedData.sort((a, b) => a.position - b.position));
    setLoading(false);
  };

  useEffect(() => {
    fetchYear(selectedYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return data;

    return data.filter(
      (song) =>
        song.artistName.toLowerCase().includes(q) ||
        song.titel.toLowerCase().includes(q)
    );
  }, [data, filterText]);

  const sortedData = useMemo(() => {
    const arr = [...filteredData];
    arr.sort((a, b) => {
      switch (sortOption) {
        case "Artist Name":
          return a.artistName.localeCompare(b.artistName);
        case "Song Title":
          return a.titel.localeCompare(b.titel);
        case "Release Year":
          // jouw originele logica: releaseYear desc
          return (b.releaseYear ?? 0) - (a.releaseYear ?? 0);
        default:
          return a.position - b.position;
      }
    });
    return arr;
  }, [filteredData, sortOption]);

  // respecteer displayLimit (100/200/500/etc) + “meer laden” tot max displayLimit
  const limitedData = useMemo(() => {
    return sortedData.slice(0, displayLimit);
  }, [sortedData, displayLimit]);

  const displayedSongs = useMemo(() => {
    return limitedData.slice(0, displayCount);
  }, [limitedData, displayCount]);

  const hasMore = displayCount < limitedData.length;

  const handleResetFilters = () => {
    setFilterText("");
    setSortOption("Rank");
    setDisplayLimit(100);
    setDisplayCount(100);
  };

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center px-6">
        {/* Spinner */}
        <div className="relative mx-auto mb-8 w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-red-500/30"></div>
          <div className="absolute inset-0 rounded-full border-4 border-red-600 border-t-transparent animate-spin"></div>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
          TOP2000 {selectedYear}
        </h2>

        {/* Subtitle */}
        <p className="text-neutral-600 text-base md:text-lg">
          Nummers worden geladen…
        </p>

        {/* Subtle dots */}
        <div className="mt-4 flex items-center justify-center gap-1">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></span>
          <span
            className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.15s" }}
          ></span>
          <span
            className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.3s" }}
          ></span>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ✅ HERO (dynamisch jaar) */}
      <div className="relative w-full h-[320px] md:h-[420px] lg:h-[480px] overflow-hidden bg-gradient-to-br from-neutral-900 to-red-900">
        <div className="absolute inset-0 transition-opacity duration-1000 opacity-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`TOP2000 ${selectedYear}`}
            className="w-full h-full object-cover"
            src="/images/top2000photo.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-red-900/80 to-neutral-900/90 flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-5xl">
              <h1 className="mb-8 text-white drop-shadow-2xl tracking-tight leading-none font-black text-5xl md:text-7xl lg:text-8xl">
                TOP2000 {selectedYear}
              </h1>

              <p className="text-lg md:text-xl lg:text-2xl text-neutral-100 drop-shadow-lg max-w-3xl mx-auto leading-relaxed">
                Ontdek de 2000 beste nummers van het jaar
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-white/90">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">2000 Nummers</span>
                </div>

                <div className="w-px h-4 bg-white/30"></div>

                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 bg-red-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <span className="text-sm font-semibold">1000+ Artiesten</span>
                </div>

                <div className="w-px h-4 bg-white/30"></div>

                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 bg-red-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                  <span className="text-sm font-semibold">25+ Jaar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 mr-2 text-gray-600" />
            <h3 className="font-semibold">Filters & Sortering</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Year */}
            <div>
              <label className="block mb-2 text-sm text-gray-700">Jaar</label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  const yr = Number(e.target.value);
                  setSelectedYear(yr);
                  fetchYear(yr);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              >
                {years.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter */}
            <div>
              <label className="block mb-2 text-sm text-gray-700">
                Filteren
              </label>
              <input
                placeholder="Zoek artiest of titel..."
                value={filterText}
                onChange={(e) => {
                  setFilterText(e.target.value);
                  setDisplayCount(100);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block mb-2 text-sm text-gray-700">
                Sorteer op
              </label>
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value as any);
                  setDisplayCount(100);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="Rank">Rangschikking</option>
                <option value="Artist Name">Artiestennaam</option>
                <option value="Song Title">Nummer Titel</option>
                <option value="Release Year">Release jaar</option>
              </select>
            </div>

            {/* Display limit */}
            <div>
              <label className="block mb-2 text-sm text-gray-700">
                Weergavelimiet
              </label>
              <select
                value={displayLimit}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setDisplayLimit(v);
                  setDisplayCount((prev) => Math.min(prev, v));
                }}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value={100}>100 nummers</option>
                <option value={200}>200 nummers</option>
                <option value={500}>500 nummers</option>
                <option value={1000}>1000 nummers</option>
                <option value={2000}>2000 nummers</option>
              </select>
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700"
              >
                Filters Resetten
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Toon {displayedSongs.length} van {limitedData.length} nummers
            {filterText && ` passend op "${filterText}"`}
          </p>
        </div>

        {/* Desktop Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">Rangschikking</th>
                  <th className="px-6 py-3 text-left">Nummer</th>
                  <th className="px-6 py-3 text-left">Artiest</th>
                  <th className="px-6 py-3 text-left">Jaar</th>
                  <th className="px-6 py-3 text-left">Acties</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {displayedSongs.map((song) => (
                  <tr
                    key={`${song.songId}-${song.year}`}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      <RankBadge
                        position={song.position}
                        difference={song.difference}
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {/* image placeholder (jij kan imageUrl gebruiken) */}
                        <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden">
                          {song.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={song.imageUrl}
                              alt={song.titel}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>

                        <Link
                          href={`/song/${song.songId}`}
                          className="hover:text-red-600 transition"
                        >
                          <span className="font-medium">{song.titel}</span>
                        </Link>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        href={`/artist/${song.artistId}`}
                        className="text-gray-600 hover:text-red-600 transition"
                      >
                        {song.artistName}
                      </Link>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {song.releaseYear ?? song.year}
                    </td>

                    <td className="px-6 py-4">
                      {spotifyConnected ? (
                        <button
                          onClick={() => handlePlay(song.songId)}
                          className="inline-flex items-center px-3 py-2 border rounded-lg text-sm hover:bg-green-50 hover:text-green-600 hover:border-green-600"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Afspelen
                        </button>
                      ) : (
                        <button
                          onClick={onSpotifyClick}
                          className="inline-flex items-center px-3 py-2 border rounded-lg text-sm"
                        >
                          Verbind om af te spelen
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden md:hidden">
          <div className="divide-y divide-gray-200">
            {displayedSongs.map((song) => (
              <div
                key={`${song.songId}-${song.year}`}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 transition"
              >
                {/* Rank */}
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-md shadow-red-500/40">
                    <span className="font-bold text-sm">#{song.position}</span>
                  </div>
                </div>

                {/* Title + Artist */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/song/${song.songId}`}
                    className="hover:text-red-600 transition-colors block"
                  >
                    <h4 className="font-semibold line-clamp-1">
                      {song.titel}
                    </h4>
                  </Link>
                  <Link
                    href={`/artist/${song.artistId}`}
                    className="text-neutral-600 hover:text-red-600 transition-colors block"
                  >
                    <p className="line-clamp-1 text-sm">{song.artistName}</p>
                  </Link>
                </div>

                {/* Play / Connect */}
                <div className="flex-shrink-0">
                  {spotifyConnected ? (
                    <button
                      onClick={() => handlePlay(song.songId)}
                      className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-md shadow-green-600/40 active:scale-95 transition-transform duration-200"
                    >
                      <Play
                        className="h-5 w-5 text-white ml-0.5"
                        fill="white"
                      />
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

        {/* Load more */}
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={() =>
                setDisplayCount((prev) => Math.min(prev + 100, limitedData.length))
              }
              className="px-4 py-2 border rounded-lg border-neutral-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
            >
              Meer Laden ({Math.min(100, limitedData.length - displayCount)} nog
              meer nummers)
            </button>
          </div>
        )}

        {/* Empty */}
        {limitedData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              Geen nummers gevonden die aan je filters voldoen.
            </p>
            <button
              onClick={() => setFilterText("")}
              className="mt-4 px-4 py-2 border rounded-lg"
            >
              Wis Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
