// components/SongDetails.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type ChartPointDto = { year: number; position: number };

type SongDetailDto = {
  songId: number;
  titel: string;
  artistName: string | null;
  artistPhoto: string | null;
  artistBiography: string | null;
  lyrics: string | null;
  releaseYear: number | null;
  chartHistory: ChartPointDto[];
};

function veiligeTekst(v: string | null | undefined, fallback = "—") {
  const t = (v ?? "").trim();
  return t.length ? t : fallback;
}

export default function SongDetails({ songId }: { songId: string }) {
  const [data, setData] = useState<SongDetailDto | null>(null);
  const [laden, setLaden] = useState(true);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLaden(true);
        setFout(null);

        const res = await fetch(
          `https://localhost:7003/song/details?id=${encodeURIComponent(songId)}`
        );

        if (res.status === 404) {
          setData(null);
          setFout("Nummer niet gevonden.");
          return;
        }

        if (!res.ok) {
          const txt = await res.text();
          setData(null);
          setFout(`API-fout (${res.status}): ${txt}`);
          return;
        }

        const raw = await res.json();

        // jouw API kan PascalCase of camelCase teruggeven → normaliseren
        const dto: SongDetailDto = {
          songId: raw.songId ?? raw.SongId,
          titel: raw.titel ?? raw.Titel,
          artistName: raw.artistName ?? raw.ArtistName ?? null,
          artistPhoto: raw.artistPhoto ?? raw.ArtistPhoto ?? null,
          artistBiography: raw.artistBiography ?? raw.ArtistBiography ?? null,
          lyrics: raw.lyrics ?? raw.Lyrics ?? null,
          releaseYear: raw.releaseYear ?? raw.ReleaseYear ?? null,
          chartHistory: (raw.chartHistory ?? raw.ChartHistory ?? []).map((p: any) => ({
            year: p.year ?? p.Year,
            position: p.position ?? p.Position,
          })),
        };

        setData(dto);
      } catch (e: any) {
        setData(null);
        setFout(String(e?.message ?? e));
      } finally {
        setLaden(false);
      }
    };

    run();
  }, [songId]);

  const chartData = useMemo(() => {
    return [...(data?.chartHistory ?? [])].sort((a, b) => a.year - b.year);
  }, [data?.chartHistory]);

  const aantalKeerInTop2000 = chartData.length;

  const bestePositie = useMemo(() => {
    if (!chartData.length) return null;
    return Math.min(...chartData.map((p) => p.position));
  }, [chartData]);

  const slechtstePositie = useMemo(() => {
    if (!chartData.length) return null;
    return Math.max(...chartData.map((p) => p.position));
  }, [chartData]);

  if (laden) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <div className="relative mx-auto mb-8 w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-red-500/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-red-600 border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
            Nummerdetails laden…
          </h2>
          <p className="text-neutral-600 text-base md:text-lg">
            Even geduld, we halen alles op.
          </p>
        </div>
      </div>
    );
  }

  if (fout || !data) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Kan nummer niet laden</h1>
        <p className="text-gray-600 mt-2">{fout ?? "Onbekende fout"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO (rood i.p.v. blauw/paars) */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-neutral-900">
        <div className="max-w-6xl mx-auto px-6 py-8 flex gap-6 items-center">
          {/* Cover placeholder (details DTO heeft geen imgUrl) */}
          <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 border border-white/10">
            <div className="w-full h-full flex items-center justify-center text-white/80 text-sm">
              Geen cover
            </div>
          </div>

          <div className="flex-1 text-white">
            <h1 className="text-2xl font-semibold">
              {veiligeTekst(data.titel)}
            </h1>
            <p className="text-white/90 mt-1">
              {veiligeTekst(data.artistName, "Onbekende artiest")}
            </p>
            <p className="text-white/80 text-sm mt-1">
              {data.releaseYear
                ? `Uitgebracht: ${data.releaseYear}`
                : "Uitgebracht: —"}
            </p>

            {/* ✅ Buttons met iconen + wit (zichtbaar) */}
            <div className="mt-5 flex flex-wrap gap-3">
              {/* Spotify */}
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-green-600 font-semibold shadow hover:bg-green-50 active:scale-[0.99] transition"
                onClick={() => console.log("Spotify koppelen (dummy)")}
              >
                {/* Spotify logo (SVG) */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.438 17.438a.75.75 0 01-1.032.246c-2.829-1.73-6.391-2.123-10.588-1.168a.75.75 0 11-.333-1.463c4.568-1.038 8.488-.596 11.602 1.32a.75.75 0 01.351 1.065zm1.473-3.273a.938.938 0 01-1.289.308c-3.238-1.988-8.176-2.566-12.008-1.404a.938.938 0 11-.545-1.795c4.312-1.31 9.666-.66 13.334 1.566a.938.938 0 01.508 1.325zm.126-3.407C15.16 8.49 8.74 8.262 5.134 9.32a1.125 1.125 0 11-.627-2.161c4.136-1.207 11.028-.977 15.38 1.53a1.125 1.125 0 11-1.062 2.07z" />
                </svg>
                Koppel om af te spelen
              </button>

              {/* Playlist */}
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-red-700 font-semibold shadow hover:bg-red-50 active:scale-[0.99] transition"
                onClick={() => console.log("Toevoegen aan playlist (dummy)")}
              >
                {/* Plus icoon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M11 11V5a1 1 0 112 0v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H5a1 1 0 110-2h6z" />
                </svg>
                Toevoegen aan playlist
              </button>

              {/* YouTube */}
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-red-600 font-semibold shadow hover:bg-red-50 active:scale-[0.99] transition"
                onClick={() => console.log("YouTube openen (dummy)")}
              >
                {/* YouTube logo (SVG) */}
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M23.498 6.186a2.958 2.958 0 00-2.08-2.093C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.418.593A2.958 2.958 0 00.502 6.186 31.87 31.87 0 000 12a31.87 31.87 0 00.502 5.814 2.958 2.958 0 002.08 2.093C4.4 20.5 12 20.5 12 20.5s7.6 0 9.418-.593a2.958 2.958 0 002.08-2.093A31.87 31.87 0 0024 12a31.87 31.87 0 00-.502-5.814zM9.75 15.568V8.432L15.818 12 9.75 15.568z" />
                </svg>
                Bekijk op YouTube
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Chart card */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">Hitlijstgeschiedenis</h2>
            <div className="text-sm text-gray-600">
              {aantalKeerInTop2000 ? (
                <>
                  Keer in TOP2000:{" "}
                  <span className="font-semibold">{aantalKeerInTop2000}</span> •
                  Beste positie:{" "}
                  <span className="font-semibold text-red-600">
                    #{bestePositie}
                  </span>
                </>
              ) : (
                "Geen hitlijstgegevens"
              )}
            </div>
          </div>

          {/* ✅ compacte chart */}
          <div className="mt-4 h-[180px]">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    allowDecimals={false}
                  />
                  {/* positie: lager is beter → reversed */}
                  <YAxis
                    reversed
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    domain={[
                      (min: number) => Math.max(1, min - 10),
                      (max: number) => Math.min(2000, max + 10),
                    ]}
                  />
                  <Tooltip
                    formatter={(v: any) => `#${v}`}
                    labelFormatter={(l: any) => `Jaar ${l}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="position"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Geen hitlijstgeschiedenis beschikbaar.
              </div>
            )}
          </div>

          {/* badges onder chart */}
          {chartData.length ? (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {chartData.map((p) => (
                <div
                  key={p.year}
                  className="bg-gray-50 border rounded-lg px-3 py-2 text-center"
                >
                  <div className="text-xs text-gray-500">{p.year}</div>
                  <div className="text-sm font-semibold text-red-600">
                    #{p.position}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Onderste grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lyrics */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-5">
            <h3 className="text-lg font-semibold">Songtekst</h3>
            <div className="mt-3 whitespace-pre-wrap text-gray-800 leading-relaxed">
              {veiligeTekst(data.lyrics, "Geen songtekst beschikbaar.")}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* About artist */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="text-lg font-semibold">Over de artiest</h3>

              <div className="mt-3 flex gap-3 items-start">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {data.artistPhoto ? (
                    <Image
                      src={data.artistPhoto}
                      alt={veiligeTekst(data.artistName, "Artiest")}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      —
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="font-semibold">
                    {veiligeTekst(data.artistName, "Onbekende artiest")}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 line-clamp-4">
                    {veiligeTekst(
                      data.artistBiography,
                      "Geen biografie beschikbaar."
                    )}
                  </div>
                </div>
              </div>

              <button className="mt-4 w-full border rounded-md px-3 py-2 text-sm hover:bg-gray-50 transition">
                Bekijk artiestprofiel
              </button>
            </div>

            {/* Song details */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="text-lg font-semibold">Nummergegevens</h3>

              <dl className="mt-3 text-sm">
                <div className="flex justify-between py-1">
                  <dt className="text-gray-500">Titel</dt>
                  <dd className="font-medium text-gray-900">
                    {veiligeTekst(data.titel)}
                  </dd>
                </div>

                <div className="flex justify-between py-1">
                  <dt className="text-gray-500">Artiest</dt>
                  <dd className="font-medium text-gray-900">
                    {veiligeTekst(data.artistName)}
                  </dd>
                </div>

                <div className="flex justify-between py-1">
                  <dt className="text-gray-500">Uitgebracht</dt>
                  <dd className="font-medium text-gray-900">
                    {data.releaseYear ?? "—"}
                  </dd>
                </div>

                <div className="flex justify-between py-1">
                  <dt className="text-gray-500">Keer in TOP2000</dt>
                  <dd className="font-medium text-gray-900">
                    {aantalKeerInTop2000}
                  </dd>
                </div>

                <div className="flex justify-between py-1">
                  <dt className="text-gray-500">Beste positie</dt>
                  <dd className="font-medium text-red-600">
                    {bestePositie ? `#${bestePositie}` : "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
