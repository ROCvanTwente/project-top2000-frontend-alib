// components/Top2000Table.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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
   ⭐ Nieuw RankBadge zoals jouw screenshot ⭐
------------------------------------------- */
const RankBadge = ({
  position,
  difference,
}: {
  position: number;
  difference: number | null;
}) => {
  if (difference === null) difference = 0;

  const isUp = difference > 0;
  const isDown = difference < 0;
  const isSame = difference === 0;

  const arrow = isUp ? "▲" : isDown ? "▼" : "—";

  // ⭐ Speciale kleuren voor top 3
  let rankColor = "";
  if (position === 1) rankColor = "text-yellow-600 font-extrabold";       // rood
  else if (position === 2) rankColor = "text-gray-400 font-bold";      // zilver
  else if (position === 3) rankColor = "text-amber-700 font-bold";     // brons
  else rankColor = "text-gray-700 font-semibold";                      // standaard

  // ⭐ Badge kleuren voor verschil
  const bg = isUp
    ? "bg-green-100 text-green-700"
    : isDown
    ? "bg-red-100 text-red-700"
    : "bg-gray-100 text-gray-500";

  return (
    <div className="flex items-center gap-3">
      {/* Rank nummer */}
      <div className={`w-8 ${rankColor}`}>#{position}</div>

      {/* Verschil badge */}
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg}`}
        style={{ minWidth: "40px", justifyContent: "center" }}
      >
        <span>{arrow}</span>
        <span>{isSame ? "0" : difference}</span>
      </div>
    </div>
  );
};

/* ------------------------------------------ */

export default function Top2000Table() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [data, setData] = useState<Top2000Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");

  const [sortOption, setSortOption] = useState("Rank");
  const [displayLimit, setDisplayLimit] = useState(100);

  const years = [
    1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010,
    2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022,
    2023, 2024,
  ].reverse();

  useEffect(() => {
    console.clear();
    setPage(1);
    setFilterText("");
    setLoading(true);

    fetch(`https://localhost:7003/top2000/${2024}`)
      .then(async (res) => {
        const json = await res.json();

        let fetchedData: Top2000Entry[] = [];
        if (Array.isArray(json)) fetchedData = json;
        else if (Array.isArray(json.songs)) fetchedData = json.songs;

        setData(fetchedData.sort((a, b) => a.position - b.position));
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4 text-center">Loading…</p>;

  const filteredData = data.filter(
    (song) =>
      song.artistName.toLowerCase().includes(filterText.toLowerCase()) ||
      song.titel.toLowerCase().includes(filterText.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortOption) {
      case "Artist Name":
        return a.artistName.localeCompare(b.artistName);
      case "Song Title":
        return a.titel.localeCompare(b.titel);
      case "Release Year":
        return (b.releaseYear ?? 0) - (a.releaseYear ?? 0);
      default:
        return a.position - b.position;
    }
  });

  const pageSize = displayLimit;
  const totalSongs = sortedData.length;
  const pageCount = Math.ceil(totalSongs / pageSize);

  const startIndex = (page - 1) * pageSize;
  const pageData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleResetFilters = () => {
    setFilterText("");
    setSortOption("Rank");
    setDisplayLimit(100);
    setPage(1);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen font-sans">
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
        <div className="flex space-x-4 items-end">
          <div className="w-1/6">
            <label className="text-sm font-medium text-gray-500 block mb-1">
              Year
            </label>
            <select
              onChange={(e) => {
                fetch(`https://localhost:7003/top2000/${e.target.value}`)
                  .then(async (res) => {
                    const json = await res.json();

                    let fetchedData: Top2000Entry[] = [];
                    if (Array.isArray(json)) fetchedData = json;
                    else if (Array.isArray(json.songs)) fetchedData = json.songs;

                    setData(fetchedData.sort((a, b) => a.position - b.position));
                    setLoading(false);
                  });
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

          <div className="w-1/3">
            <label className="text-sm font-medium text-gray-500 block mb-1">
              Filter by Artist
            </label>
            <input
              type="text"
              placeholder="Search artist name..."
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="w-1/6">
            <label className="text-sm font-medium text-gray-500 block mb-1">
              Sort By
            </label>
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white"
            >
              <option>Rank</option>
              <option>Artist Name</option>
              <option>Song Title</option>
              <option>Release Year</option>
            </select>
          </div>

          <div className="w-1/6">
            <label className="text-sm font-medium text-gray-500 block mb-1">
              Display Limit
            </label>
            <select
              value={displayLimit}
              onChange={(e) => {
                setDisplayLimit(Number(e.target.value));
                setPage(1);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value={100}>100 songs</option>
              <option value={200}>200 songs</option>
            </select>
          </div>

          <button
            onClick={handleResetFilters}
            className="w-auto px-4 py-2 border border-gray-400 text-gray-700 font-medium rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="text-gray-600 mb-4 font-medium">
        {`Showing ${pageData.length} of ${totalSongs} songs`}
      </div>

      <div
        className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200"
        style={{ minHeight: "900px" }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                Song
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                Artist
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                Release Year
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {pageData.map((song) => (
              <tr key={`${song.songId}-${song.year}`} className="hover:bg-red-50/50">
                <td className="px-6 py-3">
                  <RankBadge position={song.position} difference={song.difference} />
                </td>

                <td className="px-6 py-3 flex items-center space-x-3">
                  <div className="relative h-10 w-10 bg-gray-200 rounded-md" />
                  <Link
                    href={`/song/${song.songId}`}
                    className="font-medium text-red-600 hover:underline"
                  >
                    {song.titel}
                  </Link>
                </td>

                <td className="px-6 py-3 text-gray-500">{song.artistName}</td>

                <td className="px-6 py-3 text-gray-500">
                  {song.releaseYear ?? song.year}
                </td>

                <td className="px-6 py-3 text-center">
                  <button className="inline-flex items-center px-4 py-2 border rounded-full text-red-600 bg-red-50 hover:bg-red-100">
                    Connect to Play
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center space-x-2">
        {Array.from({ length: pageCount }, (_, idx) => {
          const p = idx + 1;
          const isActive = p === page;

          return (
            <button
              key={p}
              onClick={() => setPage(p)}
              disabled={isActive}
              className={`px-4 py-2 rounded-lg border ${
                isActive
                  ? "bg-red-600 text-white border-red-700"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
}
