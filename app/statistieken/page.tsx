'use client';

import React, { useEffect, useState } from 'react';
import Footer from "@/app/components/Footer";

type MovementDto = {
    songId: number;
    titel: string;
    artistName: string;
    position: number;
    positionLastYear: number;
    difference: number;
};

type BasicSongDto = {
    songId: number;
    titel: string;
    artistName: string;
    releaseYear: number;
};

type ArtistCountDto = {
    artistId: number;
    artistName: string;
    count: number;
};

type StatisticsDto = {
    year: number;
    biggestRises: MovementDto[];
    biggestFalls: MovementDto[];
    newEntries: BasicSongDto[];
    droppedEntries: BasicSongDto[];
    allTimeClassics: BasicSongDto[];
    artistCounts: ArtistCountDto[];
};

export default function StatistiekenPage() {
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [top, setTop] = useState<number>(10);
    const [stats, setStats] = useState<StatisticsDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async (y: number, t = 10) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/statistieken/${y}?top=${t}`, { cache: 'no-store' });
            if (!res.ok) {
                const json = await res.json().catch(() => null);
                setError(json?.message || `Request failed: ${res.status}`);
                setStats(null);
            } else {
                const data: StatisticsDto = await res.json();
                setStats(data);
            }
        } catch (e) {
            setError((e as Error).message || 'Network error');
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats(year, top);
    }, [year, top]); // fetch when year or top change

    const onLoadClick = () => fetchStats(year, top);

    // derive totals from artistCounts if available
    const totalSongs = stats ? stats.artistCounts.reduce((s, a) => s + a.count, 0) : 0;
    const totalArtists = stats ? stats.artistCounts.length : 0;
    const songsPerArtistAvg = totalArtists > 0 ? (totalSongs / totalArtists).toFixed(2) : '0';

    return (
        // Make main a full-height column flex container so footer can be pushed to bottom
        <main className="min-h-screen flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Content area grows to fill available space */}
            <div className="flex-grow">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Statistieken</h1>
                    <div className="text-sm text-neutral-500">Gegevens: backend API</div>
                </div>

                <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-neutral-600">Jaar</label>
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="border px-2 py-1 rounded"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm text-neutral-600">Top</label>
                        <input
                            type="number"
                            min={1}
                            max={2024}
                            value={top}
                            onChange={(e) => setTop(Math.max(1, Number(e.target.value)))}
                            className="border px-2 py-1 rounded w-20"
                        />
                    </div>

                    <button
                        onClick={onLoadClick}
                        className="ml-0 sm:ml-4 px-3 py-1 bg-blue-600 text-white rounded"
                    >
                        Load
                    </button>

                    {loading && <div className="text-sm text-neutral-500 ml-2">Loading...</div>}
                    {error && <div className="text-sm text-red-600 ml-2">{error}</div>}
                </div>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 border rounded-md bg-white shadow-sm">
                        <div className="text-sm text-neutral-500">Totale nummers (berekend)</div>
                        <div className="text-2xl font-semibold">{totalSongs.toLocaleString()}</div>
                    </div>
                    <div className="p-4 border rounded-md bg-white shadow-sm">
                        <div className="text-sm text-neutral-500">Totale artiesten</div>
                        <div className="text-2xl font-semibold">{totalArtists.toLocaleString()}</div>
                    </div>
                    <div className="p-4 border rounded-md bg-white shadow-sm">
                        <div className="text-sm text-neutral-500">Gem. nummers per artiest</div>
                        <div className="text-2xl font-semibold">{songsPerArtistAvg}</div>
                    </div>
                </section>

                {stats && (
                    <>
                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="p-4 border rounded-md bg-white shadow-sm">
                                <h2 className="text-xl font-semibold mb-3">Top stijgingen</h2>
                                <ol className="list-decimal list-inside space-y-2">
                                    {stats.biggestRises.map((m) => (
                                        <li key={m.songId} className="flex justify-between">
                                            <span>{m.titel} — {m.artistName}</span>
                                            <span className="text-sm text-neutral-500">∆{m.difference} (#{m.positionLastYear} → #{m.position})</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            <div className="p-4 border rounded-md bg-white shadow-sm">
                                <h2 className="text-xl font-semibold mb-3">Top dalers</h2>
                                <ol className="list-decimal list-inside space-y-2">
                                    {stats.biggestFalls.map((m) => (
                                        <li key={m.songId} className="flex justify-between">
                                            <span>{m.titel} — {m.artistName}</span>
                                            <span className="text-sm text-neutral-500">∆{m.difference} (#{m.positionLastYear} → #{m.position})</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </section>

                        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="p-4 border rounded-md bg-white shadow-sm">
                                <h3 className="font-semibold mb-2">Nieuwe binnenkomers</h3>
                                <ul className="space-y-2 text-sm text-neutral-700">
                                    {stats.newEntries.map((s) => (
                                        <li key={s.songId}>{s.titel} — {s.artistName} ({s.releaseYear})</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-4 border rounded-md bg-white shadow-sm">
                                <h3 className="font-semibold mb-2">Uitvallers</h3>
                                <ul className="space-y-2 text-sm text-neutral-700">
                                    {stats.droppedEntries.map((s) => (
                                        <li key={s.songId}>{s.titel} — {s.artistName} ({s.releaseYear})</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-4 border rounded-md bg-white shadow-sm">
                                <h3 className="font-semibold mb-2">All-time classics</h3>
                                <ul className="space-y-2 text-sm text-neutral-700">
                                    {stats.allTimeClassics.map((s) => (
                                        <li key={s.songId}>{s.titel} — {s.artistName} ({s.releaseYear})</li>
                                    ))}
                                </ul>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}
