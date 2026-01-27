'use client';

import React, { useState, useMemo, useEffect } from 'react';

// note: we call the backend `/statistieken/{year}` endpoint directly using fetch

type SongItem = {
    id: string | number;
    title?: string;
    titel?: string;
    artist?: string;
    artistName?: string;
    year?: number;
    releaseYear?: number;
    rank?: number;
    positionLastYear?: number; // accept prev pos when API provides it
};

type MovementDto = { songId: number; titel: string; artistName: string; position: number; positionLastYear?: number; difference?: number; releaseYear?: number };
// basic DTO returned by the statistics API for simple song lists
type BasicSongDto = { songId: number; titel: string; artistName: string; releaseYear?: number; position?: number; positionLastYear?: number };
type StatisticsDto = {
    year: number;
    biggestRises: MovementDto[];
    biggestFalls: MovementDto[];
    newEntries: BasicSongDto[];
    droppedEntries: BasicSongDto[];
    allTimeClassics: BasicSongDto[];
    artistCounts: Array<{ artistId: number; artistName: string; count: number }>;
    // optional server-provided extras (backend should add these when available)
    movements?: MovementDto[]; // full set of movements (difference may be 0 for unchanged)
    reentries?: BasicSongDto[]; // songs that re-entered (present in year, absent in year-1, present earlier)
    samePosition?: MovementDto[]; // movements with difference == 0
    adjacentSequences?: Array<{ artistId: number; artistName: string; positions: number[]; songs: BasicSongDto[] }>;
    singleAppearances?: BasicSongDto[]; // songs that only appeared once in DB range
    artistStats?: Array<{ artistId: number; artistName: string; count: number; avgPosition?: number; bestPosition?: number }>;
};

type YearEntry = { year: number; items: SongItem[]; stats: StatisticsDto };

// Local typed shape for rendering artist rows in the client
type ArtistRow = { artistId: number; artistName: string; count: number; avgPosition?: number; bestPosition?: number };

function isYearEntry(v: unknown): v is YearEntry {
    if (!v || typeof v !== 'object') return false;
    const maybe = v as Partial<YearEntry>;
    return typeof maybe.year === 'number' && Array.isArray(maybe.items) && typeof maybe.stats === 'object' && maybe.stats !== null;
}

const ExpandableCard: React.FC<{
    title: string;
    defaultOpen?: boolean;
    className?: string;
    children?: React.ReactNode;
    isOpen?: boolean;
    onToggle?: (open: boolean) => void;
}> = ({ title, defaultOpen = true, className = '', children, isOpen, onToggle }) => {
    const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen);
    const open = isOpen !== undefined ? isOpen : internalOpen;

    // when a card opens, dispatch a resize so Recharts can recalculate sizes
    useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
        return () => clearTimeout(t);
    }, [open]);

    const toggle = () => {
        if (isOpen !== undefined && onToggle) onToggle(!open);
        else setInternalOpen(o => !o);
    };

    return (
        <div className={`border rounded-md bg-white shadow-sm ${className}`}>
            <button
                type="button"
                onClick={toggle}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                aria-expanded={open}
            >
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{title}</h3>
                </div>
                <div className={`transform transition-transform ${open ? 'rotate-180' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 8L10 13L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </button>
            {open && <div className="px-4 pb-4 pt-0">{children}</div>}
        </div>
    );
};

export default function StatisticsPage() {
    // Search mode: 'year' | 'range' | 'all'
    const [mode, setMode] = useState<'year' | 'range' | 'all'>('year');
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [minYear, setMinYear] = useState<number>(2000);
    const [maxYear, setMaxYear] = useState<number>(new Date().getFullYear());

    // top filter: number or 'all' (map 'all' to a large value for the backend)
    const [top, setTop] = useState<number | 'all'>(100);

    const [loading, setLoading] = useState<boolean>(false);
    const [allSongs, setAllSongs] = useState<SongItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    // store full statistics responses per year when available
    const [statsMap, setStatsMap] = useState<Record<number, StatisticsDto | undefined>>({});
    const [openCards, setOpenCards] = useState<Record<string, boolean>>({
        artists: true, rises: true, falls: true, new: true, dropped: true, classics: true,
        // detail cards 1..10
        detail1: true, detail2: true, detail3: true, detail4: true, detail5: true, detail6: true, detail7: true, detail8: true, detail9: true, detail10: true
    });

    // derived current artist count to help layout decisions
    const currentArtistCount = statsMap[year]?.artistCounts?.length ?? 0;

    // when artist count changes (or year changes) trigger a resize so charts recalc
    useEffect(() => {
        const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 160);
        return () => clearTimeout(t);
    }, [currentArtistCount, year]);

    // helper to produce year list based on mode
    const yearsToFetch = useMemo(() => {
        if (mode === 'year') return [year];
        if (mode === 'range') {
            const a = Math.min(minYear, maxYear);
            const b = Math.max(minYear, maxYear);
            const arr: number[] = [];
            for (let y = a; y <= b; y++) arr.push(y);
            return arr;
        }
        // 'all' -> use a safe wide range 1950..currentYear
        const cur = new Date().getFullYear();
        const arr: number[] = [];
        for (let y = 1950; y <= cur; y++) arr.push(y);
        return arr;
    }, [mode, year, minYear, maxYear]);

    // fetch statistics for given years (parallel, extract songs from stats DTO)
    const fetchForYears = async (years: number[]) => {
        setLoading(true);
        setError(null);
        setAllSongs([]);
        try {
            // map UI top selection to the backend top query param
            // the backend expects an integer top (positions <= top). Use a large number for 'all'.
            const topParam = top === 'all' ? 2000 : Number(top);
            const batchSize = 6;
            const batches: Promise<(SongItem[] | YearEntry)[]>[] = [];

            for (let i = 0; i < years.length; i += batchSize) {
                const batchYears = years.slice(i, i + batchSize);
                const batchPromises = batchYears.map(async (y) => {
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/statistieken/${y}?top=${topParam}`);
                        if (!res.ok) {
                            // ignore not found years or other non-critical errors
                            return [] as SongItem[];
                        }
                        const json = (await res.json()) as StatisticsDto;

                        // record the stats for this year so we can render the categorized lists & charts
                        return { year: y, items: ((): SongItem[] => {
                            const items: SongItem[] = [];
                            const pushMovement = (m: MovementDto | undefined) => {
                                if (!m) return;
                                items.push({ id: m.songId, titel: m.titel, title: m.titel, artistName: m.artistName, year: json.year, rank: m.position , releaseYear : m.releaseYear ?? json.year});
                            };
                            json.biggestRises?.forEach(m => pushMovement(m));
                            json.biggestFalls?.forEach(m => pushMovement(m));
                            const pushBasic = (b: BasicSongDto | undefined) => {
                                if (!b) return;
                                items.push({ id: b.songId, titel: b.titel, title: b.titel, artistName: b.artistName, releaseYear: b.releaseYear ?? json.year, year: b.releaseYear ?? json.year });
                            };
                            json.newEntries?.forEach(b => pushBasic(b));
                            json.droppedEntries?.forEach(b => pushBasic(b));
                            json.allTimeClassics?.forEach(b => pushBasic(b));
                            return items;
                        })(), stats: json };
                    } catch {
                        return [] as SongItem[];
                    }
                });

                // each batchPromises returns either SongItem[] previously; now they're objects {year, items, stats}
                batches.push(Promise.all(batchPromises).then(parts => parts));
            }

            const results = await Promise.all(batches);

            // results is array of arrays; elements may be SongItem[] or objects {year, items, stats}
            const flat = results.flat() as (SongItem[] | YearEntry)[];

            const itemsCollected: SongItem[] = [];
            const newStatsMap: Record<number, StatisticsDto | undefined> = { ...statsMap };

            for (const entry of flat) {
                if (!entry) continue;
                if (isYearEntry(entry)) {
                    newStatsMap[entry.year] = entry.stats;
                    itemsCollected.push(...entry.items);
                } else if (Array.isArray(entry)) {
                    itemsCollected.push(...entry);
                }
            }

            // deduplicate by song id
            const map = new Map<string | number, SongItem>();
            for (const s of itemsCollected) {
                if (!map.has(s.id)) map.set(s.id, s);
            }

            setStatsMap(newStatsMap);
            setAllSongs(Array.from(map.values()));
            // small delay then trigger resize so charts re-render correctly after data arrives
            setTimeout(() => window.dispatchEvent(new Event('resize')), 120);

            // auto-open cards when content likely needs more space
            // artists: if many artists
            const statsForYear = newStatsMap[year];
            if (statsForYear) {
                const pieCount = (statsForYear.artistCounts || []).length;
                const risesMaxLabel = Math.max(0, ...(statsForYear.biggestRises || []).map(r => (r.titel + ' — ' + r.artistName).length));
                const fallsMaxLabel = Math.max(0, ...(statsForYear.biggestFalls || []).map(r => (r.titel + ' — ' + r.artistName).length));

                setOpenCards(prev => ({
                    ...prev,
                    artists: pieCount > 6 ? true : prev.artists,
                    rises: risesMaxLabel > 40 ? true : prev.rises,
                    falls: fallsMaxLabel > 40 ? true : prev.falls,
                }));
            }
        } catch (e) {
            setError((e as Error).message || 'Failed to fetch statistics');
            setAllSongs([]);
        } finally {
            setLoading(false);
        }
    };

    const onSearch = () => {
        const years = yearsToFetch;
        if (years.length === 0) return;
        // prevent accidental huge fetches
        if (years.length > 40 && !confirm(`You are about to fetch data for ${years.length} years which may be slow. Continue?`)) return;
        fetchForYears(years);
    };

    const exportToCsv = (rows: SongItem[], filename = `statistieken-search.csv`) => {
        if (!rows || rows.length === 0) return;
        const headers = ['title', 'artist', 'year', 'rank'];
        const csv = [headers.join(',')].concat(rows.map(r => [r.title ?? r.titel ?? '', r.artist ?? r.artistName ?? '', r.year ?? r.releaseYear ?? '', r.rank ?? ''].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    // computeDisplayStats: move aggregation out of JSX so it parses correctly
    const computeDisplayStats = (): StatisticsDto | null => {
        const years = yearsToFetch;
        const parts = years.map(y => statsMap[y]).filter(Boolean) as StatisticsDto[];
        if (parts.length === 0) return null;

        const mergeBasicUnique = (arrays: (BasicSongDto[] | undefined)[]) => {
            const m = new Map<number, BasicSongDto>();
            for (const arr of arrays) {
                if (!arr) continue;
                for (const it of arr) {
                    if (!m.has(it.songId)) m.set(it.songId, it);
                }
            }
            return Array.from(m.values());
        };

        const artistMap = new Map<number, { artistId: number; artistName: string; count: number }>();
        for (const p of parts) {
            for (const a of (p.artistCounts || [])) {
                const ex = artistMap.get(a.artistId);
                if (ex) ex.count += a.count;
                else artistMap.set(a.artistId, { artistId: a.artistId, artistName: a.artistName, count: a.count });
            }
        }

        const moveMap = new Map<number, MovementDto>();
        for (const p of parts) {
            for (const m of (p.biggestRises || []).concat(p.biggestFalls || [])) {
                const ex = moveMap.get(m.songId);
                if (!ex) moveMap.set(m.songId, { ...m });
                else {
                    const prev = Math.abs(ex.difference || 0);
                    const cur = Math.abs(m.difference || 0);
                    if (cur > prev) moveMap.set(m.songId, { ...m });
                }
            }
            for (const m of (p.movements || [])) {
                const ex = moveMap.get(m.songId);
                if (!ex) moveMap.set(m.songId, { ...m });
                else {
                    const prev = Math.abs(ex.difference || 0);
                    const cur = Math.abs(m.difference || 0);
                    if (cur > prev) moveMap.set(m.songId, { ...m });
                }
            }
        }

        // build aggregated artistStats without using `any`
        const artistStatsArray = parts.flatMap(p => p.artistStats || []);
        const aggregatedArtistStats: StatisticsDto['artistStats'] = [];
        for (const cur of artistStatsArray) {
            const found = aggregatedArtistStats.find(x => x.artistId === cur.artistId);
            if (found) {
                found.count = Math.max(found.count, cur.count);
                if (typeof cur.avgPosition === 'number') found.avgPosition = cur.avgPosition;
                if (typeof cur.bestPosition === 'number') found.bestPosition = Math.min(found.bestPosition ?? 9999, cur.bestPosition!);
            } else {
                aggregatedArtistStats.push({ ...cur });
            }
        }

        const aggregated: StatisticsDto = {
            year: Math.min(...years),
            biggestRises: Array.from(moveMap.values()).filter(m => (m.difference || 0) > 0),
            biggestFalls: Array.from(moveMap.values()).filter(m => (m.difference || 0) < 0),
            newEntries: mergeBasicUnique(parts.map(p => p.newEntries)),
            droppedEntries: mergeBasicUnique(parts.map(p => p.droppedEntries)),
            allTimeClassics: mergeBasicUnique(parts.map(p => p.allTimeClassics)),
            artistCounts: Array.from(artistMap.values()),
            movements: Array.from(moveMap.values()),
            reentries: mergeBasicUnique(parts.map(p => p.reentries)),
            samePosition: Array.from(moveMap.values()).filter(m => (m.difference || 0) === 0),
            adjacentSequences: parts.flatMap(p => p.adjacentSequences || []),
            singleAppearances: mergeBasicUnique(parts.map(p => p.singleAppearances)),
            artistStats: aggregatedArtistStats
        };

        aggregated.artistCounts.sort((a,b) => b.count - a.count);
        return aggregated;
    };

    const displayStats: StatisticsDto | null = (mode === 'year') ? (statsMap[year] ?? null) : computeDisplayStats();


    // Determine a displayYear for computing "previous year" lookups:
    // - single-year mode: use selected year
    // - range/all: use the latest selected year (so prev = latest - 1)
    const displayYear = useMemo(() => {
        if (mode === 'year') return year;
        const ys = yearsToFetch;
        return ys.length ? Math.max(...ys) : year;
    }, [mode, year, yearsToFetch]);

    // Try to find the previous-year position for a song by scanning the cached stats for (displayYear - 1).
    const getPreviousPosition = (songId: number): number | undefined => {
        const prevYear = displayYear - 1;
        const prevStats = statsMap[prevYear];
        if (!prevStats) return undefined;
        const scan = (arr: MovementDto[] | undefined) => {
            if (!arr) return undefined;
            for (const it of arr) {
                if (!it) continue;
                if (it.songId === songId) return it.position;
            }
            return undefined;
        };

        return scan(prevStats.movements) ?? scan(prevStats.biggestRises) ?? scan(prevStats.biggestFalls) ?? undefined;
    };

    // Compute a display string for the difference (signed) for a movement. Prefer server-provided `difference`.
    const computeDifferenceString = (m: MovementDto): string => {
        if (typeof m.difference === 'number') return m.difference > 0 ? `+${m.difference}` : `${m.difference}`;
        const prev = getPreviousPosition(m.songId);
        if (typeof prev === 'number') {
            const diff = prev - m.position;
            return diff > 0 ? `+${diff}` : `${diff}`;
        }
        return '—';
    };

    return (
        <main className="min-h-screen flex flex-col max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex-grow">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Geavanceerd zoeken</h1>
                    <div className="text-sm text-neutral-500">Zoek nummers per jaar of over meerdere jaren</div>
                </div>

                <section className="mb-8">
                    {/* Compact toolbar (year/range/all, top, search) */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm">Mode</label>
                            <select value={mode} onChange={e => setMode(e.target.value as 'year' | 'range' | 'all')} className="border px-2 py-1 rounded">
                                <option value="year">Jaar</option>
                                <option value="range">Bereik</option>
                                <option value="all">Alle jaren</option>
                            </select>
                        </div>

                        {mode === 'year' && (
                            <div className="flex items-center gap-2">
                                <label className="text-sm">Jaar</label>
                                <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="border px-2 py-1 rounded w-28" />
                            </div>
                        )}

                        {mode === 'range' && (
                            <div className="flex items-center gap-2">
                                <label className="text-sm">Van</label>
                                <input type="number" value={minYear} onChange={e => setMinYear(Number(e.target.value))} className="border px-2 py-1 rounded w-24" />
                                <label className="text-sm">Tot</label>
                                <input type="number" value={maxYear} onChange={e => setMaxYear(Number(e.target.value))} className="border px-2 py-1 rounded w-24" />
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <label className="text-sm">Top</label>
                            <select value={String(top)} onChange={e => setTop(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="border px-2 py-1 rounded">
                                <option value="10">Top 10</option>
                                <option value="50">Top 50</option>
                                <option value="100">Top 100</option>
                                <option value="200">Top 200</option>
                                <option value="500">Top 500</option>
                                <option value="all">All songs</option>
                            </select>
                        </div>

                        <div className="ml-auto flex items-center gap-2 mt-3 sm:mt-0">
                            <button onClick={onSearch} className="px-3 py-1 bg-blue-600 text-white rounded">Laad</button>
                            <button onClick={() => { setAllSongs([]); setStatsMap({}); }} className="px-3 py-1 bg-neutral-100 rounded">Clear</button>
                            <button onClick={() => exportToCsv(allSongs, `statistieken-search-${Date.now()}.csv`)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Export CSV</button>
                        </div>
                    </div>

                    {loading && <div className="text-sm text-neutral-500 mb-4">Loading…</div>}
                    {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

                    {/* Aggregation helper */}
                    {/* merge multiple year stats into one aggregated StatisticsDto */}
                    {/* compute display stats once */}
                    {displayStats ? (() => {
                        const s = displayStats as StatisticsDto;
                        // reuse the existing detailed-overzichten JSX (items 1..10)
                        return (
                            <div className="mt-2">
                                <h2 className="text-xl font-bold mb-4">Gedetailleerde overzichten</h2>
                                <div className="space-y-4">
                                    <ExpandableCard title="1. Grote dalers — positie, vorig jaar, titel, artiest, uitgiftejaar, gedaald" defaultOpen isOpen={openCards.detail1} onToggle={(v) => setOpenCards(p => ({ ...p, detail1: v }))}>
                                        {s.biggestFalls && s.biggestFalls.length > 0 ? (
                                            <table className="w-full text-sm table-fixed">
                                                <thead>
                                                    <tr className="text-left text-neutral-600"><th className="w-16">Positie</th><th className="w-16">Vorige</th><th>Titel</th><th className="w-48">Artiest</th><th className="w-24">Uitg.</th><th className="w-24">Gedaald</th></tr>
                                                </thead>
                                                 <tbody>
                                                    {s.biggestFalls.slice().sort((a,b)=> Math.abs((b.difference||0)) - Math.abs((a.difference||0))).map(f => (
                                                        <tr key={f.songId} className="border-t">
                                                            <td className="py-2">{f.position}</td>
                                                            <td className="py-2">{f.positionLastYear ?? getPreviousPosition(f.songId) ?? '—'}</td>
                                                            <td className="py-2">{f.titel}</td>
                                                            <td className="py-2">{f.artistName}</td>
                                                            <td className="py-2">{f.releaseYear ?? '—'}</td>
                                                            <td className="py-2">{Math.abs(f.difference||0)}</td>
                                                        </tr>
                                                    ))}
                                                 </tbody>
                                             </table>
                                         ) : (
                                             <div className="text-sm text-neutral-500">Geen data — zorg dat de server 'biggestFalls' levert.</div>
                                         )}
                                     </ExpandableCard>

                                    <ExpandableCard title="2. Grote stijgers — positie, vorig jaar, titel, artiest, uitgiftejaar, verschil" defaultOpen isOpen={openCards.detail2} onToggle={(v) => setOpenCards(p => ({ ...p, detail2: v }))}>
                                        {s.biggestRises && s.biggestRises.length > 0 ? (
                                            <table className="w-full text-sm table-fixed">
                                                <thead>
                                                    <tr className="text-left text-neutral-600"><th className="w-16">Positie</th><th className="w-16">Vorige</th><th>Titel</th><th className="w-48">Artiest</th><th className="w-24">Uitg.</th><th className="w-24">Verschil</th></tr>
                                                </thead>
                                                 <tbody>
                                                    {s.biggestRises.slice().sort((a,b)=> Math.abs((b.difference||0)) - Math.abs((a.difference||0))).map(r => (
                                                         <tr key={r.songId} className="border-t">
                                                             <td className="py-2">{r.position}</td>
                                                             <td className="py-2">{r.positionLastYear ?? getPreviousPosition(r.songId) ?? '—'}</td>
                                                             <td className="py-2">{r.titel}</td>
                                                             <td className="py-2">{r.artistName}</td>
                                                             <td className="py-2">{r.releaseYear ?? '—'}</td>
                                                             <td className="py-2 text-emerald-600">{computeDifferenceString(r)}</td>
                                                         </tr>
                                                     ))}
                                                 </tbody>
                                             </table>
                                         ) : (
                                             <div className="text-sm text-neutral-500">Geen data — zorg dat de server 'biggestRises' levert.</div>
                                         )}
                                     </ExpandableCard>

                                    <ExpandableCard title="3. All-time classics — titel, artiest, uitgiftejaar (gesorteerd op titel)" defaultOpen isOpen={openCards.detail3} onToggle={(v) => setOpenCards(p => ({ ...p, detail3: v }))}>
                                        {s.allTimeClassics && s.allTimeClassics.length > 0 ? (
                                            <table className="w-full text-sm table-fixed">
                                                <thead>
                                                    <tr className="text-left text-neutral-600"><th>Titel</th><th className="w-48">Artiest</th><th className="w-24">Uitg.</th></tr>
                                                </thead>
                                                <tbody>
                                                    {s.allTimeClassics.slice().sort((a,b)=> (a.titel||'').localeCompare(b.titel||'')).map(c => (
                                                        <tr key={c.songId} className="border-t">
                                                            <td className="py-2">{c.titel}</td>
                                                            <td className="py-2">{c.artistName}</td>
                                                            <td className="py-2">{c.releaseYear ?? '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="text-sm text-neutral-500">Geen data — zorg dat de server 'allTimeClassics' levert.</div>
                                        )}
                                    </ExpandableCard>

                                    <ExpandableCard title="4. Nieuwe binnenkomers — positie, titel, artiest, uitgiftejaar" defaultOpen isOpen={openCards.detail4} onToggle={(v) => setOpenCards(p => ({ ...p, detail4: v }))}>
                                        {s.newEntries && s.newEntries.length > 0 ? (
                                            <table className="w-full text-sm table-fixed">
                                                <thead>
                                                    <tr className="text-left text-neutral-600"><th className="w-16">Positie</th><th>Titel</th><th className="w-48">Artiest</th><th className="w-24">Uitg.</th></tr>
                                                </thead>
                                                <tbody>
                                                    {s.newEntries.slice().sort((a,b) => (a.position ?? 9999) - (b.position ?? 9999)).map(n => (
                                                        <tr key={n.songId} className="border-t">
                                                            <td className="py-2">{n.position ?? '—'}</td>
                                                            <td className="py-2">{n.titel}</td>
                                                            <td className="py-2">{n.artistName}</td>
                                                            <td className="py-2">{n.releaseYear ?? '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="text-sm text-neutral-500">Geen data — server levert 'newEntries' (voeg positie toe als je wilt).</div>
                                        )}
                                    </ExpandableCard>

                                    <ExpandableCard title="5. Uitvallers — positie vorig jaar, titel, artiest, uitgiftejaar" defaultOpen isOpen={openCards.detail5} onToggle={(v) => setOpenCards(p => ({ ...p, detail5: v }))}>
                                        {s.droppedEntries && s.droppedEntries.length > 0 ? (
                                            <table className="w-full text-sm table-fixed">
                                                <thead>
                                                    <tr className="text-left text-neutral-600"><th className="w-16">Vorige pos.</th><th>Titel</th><th className="w-48">Artiest</th><th className="w-24">Uitg.</th></tr>
                                                </thead>
                                                <tbody>
                                                    {s.droppedEntries.slice().sort((a,b) => (a.positionLastYear ?? Infinity) - (b.positionLastYear ?? Infinity)).map(d => (
                                                        <tr key={d.songId} className="border-t">
                                                            <td className="py-2">{d.positionLastYear ?? getPreviousPosition(d.songId) ?? '—'}</td>
                                                            <td className="py-2">{d.titel}</td>
                                                            <td className="py-2">{d.artistName}</td>
                                                            <td className="py-2">{d.releaseYear ?? '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="text-sm text-neutral-500">Geen data — server levert 'droppedEntries' (voeg vorige positie toe voor sortering).</div>
                                        )}
                                    </ExpandableCard>

                                    <ExpandableCard title="6. Herintreders — positie, titel, artiest, uitgiftejaar" defaultOpen isOpen={openCards.detail6} onToggle={(v) => setOpenCards(p => ({ ...p, detail6: v }))}>
                                        {s.reentries && s.reentries.length > 0 ? (
                                            <table className="w-full text-sm table-fixed">
                                                <thead>
                                                    <tr className="text-left text-neutral-600"><th className="w-16">Positie</th><th>Titel</th><th className="w-48">Artiest</th><th className="w-24">Uitg.</th></tr>
                                                </thead>
                                                <tbody>
                                                    {s.reentries.slice().sort((a,b) => {
                                                        const pa = (a.position ?? (() => {
                                                            // try to find in movements for a
                                                            const m = (s.movements || []).find(x => x.songId === a.songId);
                                                            return m?.position ?? 9999;
                                                        })());
                                                        const pb = (b.position ?? (() => {
                                                            const m = (s.movements || []).find(x => x.songId === b.songId);
                                                            return m?.position ?? 9999;
                                                        })());
                                                        return pa - pb;
                                                    }).map(r => {
                                                        const curPos = r.position ?? (s.movements || []).find(m => m.songId === r.songId)?.position ?? '—';
                                                        return (
                                                            <tr key={r.songId} className="border-t">
                                                                <td className="py-2">{typeof curPos === 'number' ? curPos : '—'}</td>
                                                                <td className="py-2">{r.titel}</td>
                                                                <td className="py-2">{r.artistName}</td>
                                                                <td className="py-2">{r.releaseYear ?? '—'}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="text-sm text-neutral-500">Geen data — server moet historie controleren en 'reentries' leveren.</div>
                                        )}
                                    </ExpandableCard>


                                    <ExpandableCard title="7. Onveranderde posities — positie, titel, artiest, uitgiftejaar" defaultOpen isOpen={openCards.detail7} onToggle={(v) => setOpenCards(p => ({ ...p, detail7: v }))}>
                                        {s.samePosition && s.samePosition.length > 0 ? (
                                            <table className="w-full text-sm table-fixed">
                                                <thead>
                                                    <tr className="text-left text-neutral-600"><th className="w-16">Positie</th><th>Titel</th><th className="w-48">Artiest</th><th className="w-24">Uitg.</th></tr>
                                                </thead>
                                                <tbody>
                                                    {s.samePosition.slice().sort((a,b) => (a.position ?? 9999) - (b.position ?? 9999)).map(x => (
                                                        <tr key={x.songId} className="border-t">
                                                            <td className="py-2">{x.position}</td>
                                                            <td className="py-2">{x.titel}</td>
                                                            <td className="py-2">{x.artistName}</td>
                                                            <td className="py-2">{x.releaseYear ?? '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="text-sm text-neutral-500">Geen data — server kan movements met difference == 0 teruggeven als 'samePosition'.</div>
                                        )}
                                    </ExpandableCard>

                                    <ExpandableCard title="8. Artiesten met 2+ aansluitende posities — artiest, posities, titels" defaultOpen isOpen={openCards.detail8} onToggle={(v) => setOpenCards(p => ({ ...p, detail8: v }))}>
                                        {s.adjacentSequences && s.adjacentSequences.length > 0 ? (
                                            <ul className="space-y-2 text-sm">
                                                {s.adjacentSequences.slice().sort((a,b) => a.artistName.localeCompare(b.artistName)).map(seq => (
                                                    <li key={seq.artistId}><strong>{seq.artistName}</strong>: posities {seq.positions.join(', ')} — songs: {seq.songs.map(ss => ss.titel).join('; ')}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-sm text-neutral-500">Geen data — server moet sequenties van aangrenzende posities per artiest bepalen en teruggeven.</div>
                                        )}
                                    </ExpandableCard>

                                    <ExpandableCard title="9. Nummers met slechts één vermelding in TOP2000 — titel, artiest, uitgiftejaar (gesorteerd op artiest, titel)" defaultOpen isOpen={openCards.detail9} onToggle={(v) => setOpenCards(p => ({ ...p, detail9: v }))}>
                                        {s.singleAppearances && s.singleAppearances.length > 0 ? (
                                            <table className="w-full text-sm table-fixed">
                                                <thead>
                                                    <tr className="text-left text-neutral-600"><th>Artiest</th><th>Titel</th><th className="w-24">Uitg.</th></tr>
                                                </thead>
                                                <tbody>
                                                    {s.singleAppearances.slice().sort((a,b) => {
                                                        const ca = (a.artistName||'').localeCompare(b.artistName||'');
                                                        if (ca !== 0) return ca;
                                                        return (a.titel||'').localeCompare(b.titel||'');
                                                    }).map(x => (
                                                        <tr key={x.songId} className="border-t">
                                                            <td className="py-2">{x.artistName}</td>
                                                            <td className="py-2">{x.titel}</td>
                                                            <td className="py-2">{x.releaseYear ?? '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="text-sm text-neutral-500">Geen data — server moet grouping/counting per song (distinct years == 1) toepassen en 'singleAppearances' leveren.</div>
                                        )}
                                    </ExpandableCard>

                                    <ExpandableCard title="10. Top-artiesten — artiest, aantal, gemiddelde positie, beste positie" defaultOpen isOpen={openCards.detail10} onToggle={(v) => setOpenCards(p => ({ ...p, detail10: v }))}>
                                        { (s.artistStats && s.artistStats.length > 0) || (s.artistCounts && s.artistCounts.length > 0) ? (
                                            (() => {
                                                const artistRows: ArtistRow[] = (s.artistStats && s.artistStats.length > 0)
                                                    ? s.artistStats.map(a => ({ artistId: a.artistId, artistName: a.artistName, count: a.count, avgPosition: a.avgPosition, bestPosition: a.bestPosition }))
                                                    : (s.artistCounts || []).map(a => ({ artistId: a.artistId, artistName: a.artistName, count: a.count }));
                                                artistRows.sort((a,b) => b.count - a.count || a.artistName.localeCompare(b.artistName));
                                                return (
                                                    <table className="w-full text-sm table-fixed">
                                                        <thead>
                                                            <tr className="text-left text-neutral-600"><th>Artiest</th><th className="w-24">Aantal</th><th className="w-32">Gem. pos</th><th className="w-24">Beste pos</th></tr>
                                                        </thead>
                                                        <tbody>
                                                            {artistRows.map(a => (
                                                                <tr key={a.artistId} className="border-t">
                                                                    <td className="py-2">{a.artistName}</td>
                                                                    <td className="py-2">{a.count}</td>
                                                                    <td className="py-2 text-neutral-500">{typeof a.avgPosition === 'number' ? Math.round(a.avgPosition*10)/10 : '—'}</td>
                                                                    <td className="py-2 text-neutral-500">{typeof a.bestPosition === 'number' ? a.bestPosition : '—'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                );
                                            })()
                                        ) : (
                                            <div className="text-sm text-neutral-500">Geen data — server levert 'artistCounts' en bij voorkeur 'artistStats' (avgPosition, bestPosition).</div>
                                        )}
                                    </ExpandableCard>
                                </div>
                            </div>
                        );
                    })() : (
                        <div className="text-sm text-neutral-500">Voer linksboven een zoekopdracht uit (kies Jaar/Bereik/Alle jaren en klik &apos;Laad&apos;).</div>
                    )}
                </section>
            </div>
        </main>
    );
}
