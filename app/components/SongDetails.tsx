// components/SongDetails.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
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
  artistId: number;
  titel: string;
  imgUrl: string | null;
  artistName: string | null;
  photo: string | null;
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

  // ✅ Songtekst button (rechtsboven) -> open URL of modal
  const [lyricsOpen, setLyricsOpen] = useState(false);

  const lyricsIsUrl = useMemo(() => {
    const t = (data?.lyrics ?? "").trim();
    return /^https?:\/\//i.test(t);
  }, [data?.lyrics]);

  useEffect(() => {
    const run = async () => {
      try {
        setLaden(true);
        setFout(null);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/song/details?id=${encodeURIComponent(
            songId
          )}`
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
          artistId: raw.artistId ?? raw.ArtistId,
          titel: raw.titel ?? raw.Titel,
          artistName: raw.artistName ?? raw.ArtistName ?? null,
          imgUrl: raw.imgUrl ?? raw.ImgUrl ?? null,
          photo: raw.artistPhoto ?? raw.artistPhoto ?? null,
          artistBiography: raw.artistBiography ?? raw.ArtistBiography ?? null,
          lyrics: raw.lyrics ?? raw.Lyrics ?? null,
          releaseYear: raw.releaseYear ?? raw.ReleaseYear ?? null,
          chartHistory: (raw.chartHistory ?? raw.ChartHistory ?? []).map(
            (p: any) => ({
              year: p.year ?? p.Year,
              position: p.position ?? p.Position,
            })
          ),
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
          {/* Cover placeholder */}
          <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 border border-white/10">
            {data.imgUrl ? (
              <img
                src={data.imgUrl}
                alt={veiligeTekst(data.titel)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/80 text-sm">
                —
              </div>
            )}
          </div>

          <div className="flex-1 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
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
              </div>

              {/* ✅ Rechtsboven: terug-link, daaronder songtekst button */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <Link
                  href="/songs"
                  className="inline-flex items-center gap-2 text-white/95 hover:text-white underline-offset-4 transition whitespace-nowrap"
                >
                  <span aria-hidden="true">←</span>
                  Terug naar Nummers
                </Link>

              </div>
            </div>

            {/* ✅ Buttons met iconen + wit (zichtbaar) */}
            <div className="mt-5 flex items-center justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-green-600 font-semibold shadow hover:bg-green-50 active:scale-[0.99] transition"
                  onClick={() => console.log("Spotify koppelen (dummy)")}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.438 17.438a.75.75 0 01-1.032.246c-2.829-1.73-6.391-2.123-10.588-1.168a.75.75 0 11-.333-1.463c4.568-1.038 8.488-.596 11.602 1.32a.75.75 0 01.351 1.065zm1.473-3.273a.938.938 0 01-1.289.308c-3.238-1.988-8.176-2.566-12.008-1.404a.938.938 0 11-.545-1.795c4.312-1.31 9.666-.66 13.334 1.566a.938.938 0 01.508 1.325zm.126-3.407C15.16 8.49 8.74 8.262 5.134 9.32a1.125 1.125 0 11-.627-2.161c4.136-1.207 11.028-.977 15.38 1.53a1.125 1.125 0 11-1.062 2.07z" />
                  </svg>
                </button>

                {/* YouTube */}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-red-600 font-semibold shadow hover:bg-red-50 active:scale-[0.99] transition"
                  onClick={() => console.log("YouTube openen (dummy)")}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M23.498 6.186a2.958 2.958 0 00-2.08-2.093C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.418.593A2.958 2.958 0 00.502 6.186 31.87 31.87 0 000 12a31.87 31.87 0 00.502 5.814 2.958 2.958 0 002.08 2.093C4.4 20.5 12 20.5 12 20.5s7.6 0 9.418-.593a2.958 2.958 0 002.08-2.093A31.87 31.87 0 0024 12a31.87 31.87 0 00-.502-5.814zM9.75 15.568V8.432L15.818 12 9.75 15.568z" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-red-700 font-semibold shadow hover:bg-red-50 active:scale-[0.99] transition"
                  onClick={() => console.log("Toevoegen aan playlist (dummy)")}
                >
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
              </div>

              <div className="flex-shrink-0">
                {/* songtekst button */}
                {lyricsIsUrl ? (
                  <Link
                    href={(data.lyrics ?? "").trim()}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 active:scale-[0.99] transition whitespace-nowrap"
                  >
                    Songtekst
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M14 3h7v7h-2V6.414l-9.293 9.293-1.414-1.414L17.586 5H14V3z" />
                      <path d="M5 5h7v2H7v10h10v-5h2v7H5V5z" />
                    </svg>
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 active:scale-[0.99] transition whitespace-nowrap disabled:opacity-50"
                    onClick={() => setLyricsOpen(true)}
                    disabled={!((data.lyrics ?? "").trim().length)}
                  >
                    Songtekst
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold">Hitlijstgeschiedenis</h2>

            <div className="flex items-center gap-3 flex-wrap justify-end">
              <div className="text-sm text-gray-600">
                {aantalKeerInTop2000 ? (
                  <>
                    Keer in TOP2000:{" "}
                    <span className="font-semibold">{aantalKeerInTop2000}</span>{" "}
                    • Beste positie:{" "}
                    <span className="font-semibold text-red-600">
                      #{bestePositie}
                    </span>
                  </>
                ) : (
                  "Geen hitlijstgegevens"
                )}
              </div>
            </div>
          </div>

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
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-start gap-4">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {data.photo ? (
                  <Image
                    src={data.photo}
                    alt={veiligeTekst(data.artistName, "Artiest")}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    —
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold">Over de artiest</h3>
                <div className="mt-1 font-semibold text-gray-900">
                  {veiligeTekst(data.artistName, "Onbekende artiest")}
                </div>

                <div className="mt-3 text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {veiligeTekst(
                    data.artistBiography,
                    "Geen biografie beschikbaar."
                  )}
                </div>

                <div className="mt-5">
                  <Link
                    href={`/artistsDetails/${data.artistId}`}
                    className="inline-flex items-center justify-center w-full border rounded-md px-3 py-2 text-sm hover:bg-gray-50 transition"
                  >
                    <span className="font-medium">Bekijk artiestprofiel</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
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
