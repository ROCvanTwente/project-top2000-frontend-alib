"use client";

import { useEffect, useState } from "react";

type Song = {
  songId: number;
  titel: string;
  artistName: string;
  imgUrl: string | null;
  releaseYear: number;
};

const ITEMS_PER_PAGE = 200;

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("https://localhost:7003/song/getallsongs")
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data: Song[]) => {
        setSongs(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Kon songs niet laden");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading songs...</p>;
  if (error) return <p>{error}</p>;

  const totalPages = Math.ceil(songs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSongs = songs.slice(startIndex, endIndex);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <p>
        Showing {currentSongs.length} of {songs.length} songs
      </p>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {currentSongs.map((song) => (
          <li
            key={song.songId}
            style={{
              display: "flex",
              gap: 16,
              padding: "16px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <img
              src={song.imgUrl ?? "/placeholder.png"}
              alt={song.titel}
              width={60}
              height={60}
              style={{ borderRadius: 8 }}
            />

            <div style={{ flex: 1 }}>
              <strong>{song.titel}</strong>
              <div>{song.artistName}</div>
            </div>

            <div style={{ color: "#666" }}>
              Released: {song.releaseYear}
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          marginTop: 24,
        }}
      >
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() =>
            setCurrentPage((p) => Math.min(p + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
