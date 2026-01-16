"use client";

import { useParams } from "next/navigation";
import SongDetails from "../../components/SongDetails";

export default function SongPage() {
  const params = useParams();
  const songId = params.songId as string;

  return <SongDetails songId={songId} />;
}
