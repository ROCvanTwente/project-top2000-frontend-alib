"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import SongDetail from "../../components/SongDetail";

type SongDetails = {
  songId: number;
  titel: string;
  artistName: string;
  releaseYear: number;
  imageUrl?: string;
  lyrics?: string;
  chartHistory: Array<{ year: number; position: number }>;
};

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [song, setSong] = useState<SongDetails | null>(null);
  const [valid, setValid] = useState<boolean | null>(null);

  useEffect(() => {
    setValid(null);

    fetch(`https://localhost:7003/song/details?id=${id}`)
      .then(async (res) => {
        if (!res.ok) {
          setValid(false);
          return;
        }
        const json = await res.json();
        setSong(json);
        setValid(true);
      })
      .catch(() => setValid(false));
  }, [id]);

  // ❌ Song bestaat niet
  if (valid === false) return notFound();

  // ⏳ Loading
  if (valid === null || !song) return <p className="p-8">Loading…</p>;

  return <SongDetail song={song} />;
}
