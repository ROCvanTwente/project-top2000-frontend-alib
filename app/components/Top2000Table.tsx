// components/Top2000Table.tsx
"use client";

import LoadingState from "./ui/LoadingState";
import ErrorState from "./ui/ErrorState";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Play,
} from "lucide-react";
import {
  getStoredAccessToken,
  getAccessToken,
  fetchProfile,
  searchTrack,
  playSong,
} from "../spotify/script";

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
  imgUrl?: string;
};

const MAX_FILTER_LEN = 60;

const cleanAndLimit = (value: string) =>
  value.replace(/\s+/g, " ").trim().slice(0, MAX_FILTER_LEN);

const shortenForUI = (value: string, max = 30) => {
  const t = value.trim();
  if (!t) return "";
  return t.length > max ? `${t.slice(0, max)}…` : t;
};

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
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterText, setFilterText] = useState("");
  const [sortOption, setSortOption] = useState<
    "Rank" | "Artist Name" | "Song Title" | "Release Year"
  >("Rank");
  const [displayLimit, setDisplayLimit] = useState<number>(100);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 100;

  // Spotify integratie
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const onSpotifyClick = () => {
    window.location.href = "/spotify";
  };

  // Init Spotify: gebruik bestaande token of ruil code
  useEffect(() => {
    const initSpotify = async () => {
      const existing = getStoredAccessToken();
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (existing) {
        setToken(existing);
        setSpotifyConnected(true);
        try {
          const p = await fetchProfile(existing);
          setProfile(p);
        } catch (e) {
          console.error("Spotify profiel ophalen mislukt", e);
        }
        // als er tóch nog een code in de URL staat, weg ermee
        if (code) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        return;
      }

      if (code) {
        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";
        try {
          const accessToken = await getAccessToken(clientId, code);
          setToken(accessToken);
          setSpotifyConnected(true);
          const p = await fetchProfile(accessToken);
          setProfile(p);
          toast.success("Succesvol verbonden met Spotify!", {
            description: "Je kunt nu nummers afspelen.",
            duration: 4000,
          });
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error("Spotify token ophalen mislukt", err);
          toast.error("Verbinden met Spotify mislukt.", {
            description: "Probeer het opnieuw.",
            duration: 4000,
          });
        }
      }
    };

    initSpotify();
  }, []);

  const handlePlay = async (song: Top2000Entry) => {
    if (!spotifyConnected || !token) {
      toast.error("Verbind eerst met Spotify.");
      onSpotifyClick();
      return;
    }

    try {
      const query = `track:${song.titel} artist:${song.artistName}`;
      const searchResult = await searchTrack(token, query);
      if (!searchResult?.tracks?.items?.length) {
        toast.error("Nummer niet gevonden op Spotify.");
        return;
      }
      const trackUri = searchResult.tracks.items[0].uri;
      await playSong(token, trackUri);
      toast.success("Nummer wordt afgespeeld via Spotify.");
    } catch (e) {
      console.error("Afspelen via Spotify mislukt", e);
      toast.error("Afspelen via Spotify mislukt.");
    }
  };

  const fetchYear = async (yr: number) => {
    setLoading(true);
    setError(null);
    setFilterText("");
    setSortOption("Rank");
    setDisplayLimit(100);
    setCurrentPage(1);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/top2000/${yr}`);
      if (!res.ok) {
        throw new Error(`API fout: ${res.status} ${res.statusText}`);
      }

      const json = await res.json();

      let fetchedData: Top2000Entry[] = [];
      if (Array.isArray(json)) fetchedData = json;
      else if (Array.isArray(json.songs)) fetchedData = json.songs;

      setData(fetchedData.sort((a, b) => a.position - b.position));
    } catch (e: any) {
      setData([]);
      setError(
        e?.message ??
        "Onbekende fout bij het ophalen van de TOP2000. Probeer het later opnieuw."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYear(selectedYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const filteredData = useMemo(() => {
    const qRaw = filterText.trim().toLowerCase();
    if (!qRaw) return data;

    // haal nummers uit tekst als: "#42", "rang 42", "jaar 1999"
    const numberMatch = qRaw.match(/\d+/);
    const qNum = numberMatch ? Number(numberMatch[0]) : null;
    const isNumeric = qNum !== null && !Number.isNaN(qNum);

    return data.filter((song) => {
      const artistMatch = song.artistName.toLowerCase().includes(qRaw);
      const titleMatch = song.titel.toLowerCase().includes(qRaw);

      // Jaar (releaseYear heeft voorrang, anders year)
      const yearValue = song.releaseYear ?? song.year;
      const yearMatch =
        isNumeric &&
          (qRaw.includes("jaar") ||
            qRaw.includes("uit") ||
            qRaw.includes("release") ||
            String(yearValue).includes(qRaw))
          ? yearValue === qNum || String(yearValue).includes(String(qNum))
          : false;

      // Rang / positie
      const rankMatch =
        isNumeric &&
          (qRaw.includes("rang") ||
            qRaw.includes("positie") ||
            qRaw.startsWith("#") ||
            /^\d+$/.test(qRaw))
          ? song.position === qNum || String(song.position).includes(String(qNum))
          : false;

      // fallback: puur numeriek zonder woorden → match zowel jaar als rang
      const genericNumberMatch =
        isNumeric &&
        !qRaw.match(/[a-z]/) &&
        (song.position === qNum || yearValue === qNum);

      return (
        artistMatch ||
        titleMatch ||
        yearMatch ||
        rankMatch ||
        genericNumberMatch
      );
    });
  }, [data, filterText]);

  const filterTextDisplay = useMemo(() => {
    const t = filterText.trim();
    if (!t) return "";
    return t.length > 30 ? `${t.slice(0, 30)}…` : t;
  }, [filterText]);

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

  // respecteer displayLimit (100/200/500/etc)
  const limitedData = useMemo(() => {
    return sortedData.slice(0, displayLimit);
  }, [sortedData, displayLimit]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterText, sortOption, displayLimit, selectedYear]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(limitedData.length / ITEMS_PER_PAGE));
  }, [limitedData.length]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const displayedSongs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return limitedData.slice(start, start + ITEMS_PER_PAGE);
  }, [limitedData, currentPage]);

  const goToPage = (page: number) => {
    const safe = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(safe);
  };

  const handleResetFilters = () => {
    setFilterText("");
    setSortOption("Rank");
    setDisplayLimit(100);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <LoadingState title={`TOP2000 ${selectedYear}`} subtitle="Nummers worden geladen…" />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Oeps… we kunnen de TOP2000 niet laden"
        message="Er ging iets mis bij het ophalen van de TOP2000-gegevens. Probeer het later opnieuw."
        error={error}
        issue="top2000-load-error"
      />
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
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
              <label className="block mb-2 text-sm text-gray-700">Filteren</label>
              <input
                placeholder="Zoek artiest, titel, jaar, rang"
                value={filterText}
                maxLength={MAX_FILTER_LEN}
                onChange={(e) => setFilterText(cleanAndLimit(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />

            </div>

            {/* Sort */}
            <div>
              <label className="block mb-2 text-sm text-gray-700">Sorteer op</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
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
              <label className="block mb-2 text-sm text-gray-700">Weergavelimiet</label>
              <select
                value={displayLimit}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setDisplayLimit(v);
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
            {filterTextDisplay && ` passend op "${filterTextDisplay}"`}
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
                      <RankBadge position={song.position} difference={song.difference} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden">
                          {song.imgUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={song.imgUrl}
                              alt={song.titel}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>

                        <Link href={`/songDetails/${song.songId}`} className="hover:text-red-600 transition">
                          <span className="font-medium">{song.titel}</span>
                        </Link>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        href={`/artistsDetails/${song.artistId}`}
                        className="text-gray-600 hover:text-red-600 transition"
                      >
                        {song.artistName}
                      </Link>
                    </td>

                    <td className="px-6 py-4 text-gray-600">{song.releaseYear ?? song.year}</td>

                    <td className="px-6 py-4">
                      {spotifyConnected ? (
                        <button
                          onClick={() => handlePlay(song)}
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
                    href={`/songDetails/${song.songId}`}
                    className="hover:text-red-600 transition-colors block"
                  >
                    <h4 className="font-semibold line-clamp-1">{song.titel}</h4>
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
                      onClick={() => handlePlay(song)}
                      className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-md shadow-green-600/40 active:scale-95 transition-transform duration-200"
                    >
                      <Play className="h-5 w-5 text-white ml-0.5" fill="white" />
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

        {limitedData.length > 0 && totalPages > 1 && (
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <option key={p} value={p}>
                      Pagina {p}
                    </option>
                  ))}
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

        {/* Empty */}
        {limitedData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Geen nummers gevonden die aan je filters voldoen.</p>
            <button onClick={() => setFilterText("")} className="mt-4 px-4 py-2 border rounded-lg">
              Wis Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}