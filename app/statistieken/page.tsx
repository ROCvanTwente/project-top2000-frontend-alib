'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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
};

type MovementDto = { songId: number; titel: string; artistName: string; position: number; positionLastYear?: number; difference?: number };
type BasicSongDto = { songId: number; titel: string; artistName: string; releaseYear?: number };
type StatisticsDto = { year: number; biggestRises: MovementDto[]; biggestFalls: MovementDto[]; newEntries: BasicSongDto[]; droppedEntries: BasicSongDto[]; allTimeClassics: BasicSongDto[]; artistCounts: Array<{ artistId: number; artistName: string; count: number }>; };

type YearEntry = { year: number; items: SongItem[]; stats: StatisticsDto };

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

const ChartWrapper: React.FC<{ children?: React.ReactNode, className?: string }> = ({ children, className = '' }) => {
    const ref = React.useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (!ref.current || typeof ResizeObserver === 'undefined') return;
        const ro = new ResizeObserver(() => window.dispatchEvent(new Event('resize')));
        ro.observe(ref.current);
        return () => ro.disconnect();
    }, []);
    return <div ref={ref} className={className}>{children}</div>;
};

export default function StatistiekenPage() {
    // Search mode: 'year' | 'range' | 'all'
    const [mode, setMode] = useState<'year' | 'range' | 'all'>('year');
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [minYear, setMinYear] = useState<number>(2000);
    const [maxYear, setMaxYear] = useState<number>(new Date().getFullYear());

    const [query, setQuery] = useState<string>('');
    const [minRelease, setMinRelease] = useState<number | ''>('');
    const [maxRelease, setMaxRelease] = useState<number | ''>('');
    const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
    // top filter: number or 'all' (map 'all' to a large value for the backend)
    const [top, setTop] = useState<number | 'all'>(100);

    const [loading, setLoading] = useState<boolean>(false);
    const [allSongs, setAllSongs] = useState<SongItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    // store full statistics responses per year when available
    const [statsMap, setStatsMap] = useState<Record<number, StatisticsDto | undefined>>({});
    const [openCards, setOpenCards] = useState<Record<string, boolean>>({ artists: true, rises: true, falls: true, new: true, dropped: true, classics: true });

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
                        const res = await fetch(`/statistieken/${y}?top=${topParam}`);
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
                                items.push({ id: m.songId, titel: m.titel, title: m.titel, artistName: m.artistName, year: json.year, rank: m.position });
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

    // derived artist options from loaded songs
    const artistOptions = useMemo(() => {
        const set = new Set<string>();
        for (const s of allSongs) {
            const name = (s.artist || s.artistName || '').trim();
            if (name) set.add(name);
        }
        return Array.from(set).sort();
    }, [allSongs]);

    // filtered view based on query/release/artist
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return allSongs.filter(s => {
            if (selectedArtist && !((s.artist || s.artistName || '').toLowerCase().includes(selectedArtist.toLowerCase()))) return false;
            if (q) {
                const inTitle = (s.title || s.titel || '').toLowerCase().includes(q);
                const inArtist = (s.artist || s.artistName || '').toLowerCase().includes(q);
                if (!inTitle && !inArtist) return false;
            }
            const ry = s.year ?? s.releaseYear ?? 0;
            const minOk = minRelease === '' || ry >= Number(minRelease);
            const maxOk = maxRelease === '' || ry <= Number(maxRelease);
            return minOk && maxOk;
        }).sort((a, b) => {
            // sort by year desc then title
            const ay = (a.year ?? a.releaseYear ?? 0);
            const by = (b.year ?? b.releaseYear ?? 0);
            if (ay !== by) return by - ay;
            return (a.title || a.titel || '').localeCompare(b.title || b.titel || '');
        });
    }, [allSongs, query, minRelease, maxRelease, selectedArtist]);

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

    return (
        <main className="min-h-screen flex flex-col max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex-grow">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Geavanceerd zoeken</h1>
                    <div className="text-sm text-neutral-500">Zoek nummers per jaar of over meerdere jaren</div>
                </div>

                <section className="mb-8">
                    <ExpandableCard title="Geavanceerd zoeken" defaultOpen>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <label className="text-sm">Mode:</label>
                                <label className={`px-2 py-1 border rounded ${mode === 'year' ? 'bg-gray-100' : ''}`}>
                                    <input type="radio" name="mode" checked={mode === 'year'} onChange={() => setMode('year')} />{' '}
                                    Jaar
                                </label>
                                <label className={`px-2 py-1 border rounded ${mode === 'range' ? 'bg-gray-100' : ''}`}>
                                    <input type="radio" name="mode" checked={mode === 'range'} onChange={() => setMode('range')} />{' '}
                                    Bereik
                                </label>
                                <label className={`px-2 py-1 border rounded ${mode === 'all' ? 'bg-gray-100' : ''}`}>
                                    <input type="radio" name="mode" checked={mode === 'all'} onChange={() => setMode('all')} />{' '}
                                    Alle jaren
                                </label>
                            </div>

                            {mode === 'year' && (
                                <div className="flex items-center gap-3">
                                    <label className="text-sm">Jaar</label>
                                    <input type="number" value={year} max={2024} onChange={e => setYear(Number(e.target.value))} className="border px-2 py-1 rounded w-28" />
                                </div>
                            )}

                            {mode === 'range' && (
                                <div className="flex items-center gap-3">
                                    <label className="text-sm">Van</label>
                                    <input type="number" value={minYear} onChange={e => setMinYear(Number(e.target.value))} className="border px-2 py-1 rounded w-28" />
                                    <label className="text-sm">Tot</label>
                                    <input type="number" value={maxYear} onChange={e => setMaxYear(Number(e.target.value))} className="border px-2 py-1 rounded w-28" />
                                </div>
                            )}

                            {mode === 'all' && (
                                <div className="text-sm text-neutral-500">Alle jaren (vanaf 1950 tot nu). Dit kan traag zijn.</div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Zoek titel of artiest" className="border px-2 py-1 rounded" />
                                <input value={minRelease} onChange={e => setMinRelease(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Min release jaar" type="number" className="border px-2 py-1 rounded" />
                                <input value={maxRelease} onChange={e => setMaxRelease(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Max release jaar" type="number" className="border px-2 py-1 rounded" />
                                <select value={selectedArtist ?? ''} onChange={e => setSelectedArtist(e.target.value === '' ? null : e.target.value)} className="border px-2 py-1 rounded">
                                    <option value="">Alle artiesten</option>
                                    {artistOptions.map((a: string) => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                                <select value={String(top)} onChange={e => setTop(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="border px-2 py-1 rounded">
                                    <option value="10">Top 10</option>
                                    <option value="50">Top 50</option>
                                    <option value="100">Top 100</option>
                                    <option value="200">Top 200</option>
                                    <option value="500">Top 500</option>
                                    <option value="all">All songs</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-3">
                                <button onClick={onSearch} className="px-3 py-1 bg-blue-600 text-white rounded">Search</button>
                                <button onClick={() => { setAllSongs([]); setQuery(''); setSelectedArtist(null); }} className="px-3 py-1 bg-neutral-100 rounded">Clear</button>
                                <div className="ml-auto flex items-center gap-2">
                                    <button onClick={() => exportToCsv(filtered, `statistieken-search-${Date.now()}.csv`)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Export CSV</button>
                                </div>
                            </div>

                            {loading && <div className="text-sm text-neutral-500">Loading…</div>}
                            {error && <div className="text-sm text-red-600">{error}</div>}

                            {/* If single-year mode and we have stats for that year, show each topic in its own card */}
                            {mode === 'year' && statsMap[year] ? (() => {
                                const s = statsMap[year] as StatisticsDto;
                                const pieData = (s.artistCounts || []).slice(0, 10).map(a => ({ name: a.artistName, value: a.count }));
                                const risesBar = (s.biggestRises || []).map(r => ({ name: `${r.titel} — ${r.artistName}`, value: Math.max(0, r.difference || 0) }));
                                const fallsBar = (s.biggestFalls || []).map(r => ({ name: `${r.titel} — ${r.artistName}`, value: Math.abs(Math.min(0, r.difference || 0)) }));
                                const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a2d2ff', '#ffd6a5', '#bde0fe', '#cdb4db', '#f8b4d9', '#9bf6ff'];

                                // compute simple maxes for CSS bars
                                const maxRise = risesBar.length ? Math.max(...risesBar.map(r => r.value)) : 0;
                                const maxFall = fallsBar.length ? Math.max(...fallsBar.map(r => r.value)) : 0;

                                return (
                                    <div className="relative">
                                        {loading && (
                                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                                                <svg className="animate-spin h-14 w-14 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                </svg>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                <div className={`${(pieData.length || 0) > 6 ? 'lg:col-span-3' : ''}`}>
                                                    <ExpandableCard title="Artiesten (top)" defaultOpen isOpen={openCards.artists} onToggle={(v) => setOpenCards(p => ({ ...p, artists: v }))}>
                                                        {pieData.length === 0 ? <div className="text-sm text-neutral-500">Geen data</div> : (
                                                            <ChartWrapper>
                                                                <ResponsiveContainer width="100%" height={320}>
                                                                    <PieChart>
                                                                        <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110} label>
                                                                            {pieData.map((entry, index) => (
                                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                            ))}
                                                                        </Pie>
                                                                        <Legend verticalAlign="bottom" height={36} />
                                                                    </PieChart>
                                                                </ResponsiveContainer>
                                                            </ChartWrapper>
                                                        )}
                                                    </ExpandableCard>
                                                </div>

                                                <div>
                                                    <ExpandableCard title="Top stijgingen" defaultOpen isOpen={openCards.rises} onToggle={(v) => setOpenCards(p => ({ ...p, rises: v }))}>
                                                        {risesBar.length === 0 ? (
                                                            <div className="text-sm text-neutral-500">Geen data</div>
                                                        ) : (
                                                            <ul className="space-y-3">
                                                                {risesBar.map((it, idx) => (
                                                                    <li key={String(idx)} className="flex items-center gap-3">
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="text-sm font-medium truncate">{it.name}</div>
                                                                            <div className="w-full h-3 bg-neutral-200 rounded overflow-hidden mt-1">
                                                                                <div className="h-full bg-emerald-500" style={{ width: `${maxRise ? (it.value / maxRise) * 100 : 0}%` }} />
                                                                            </div>
                                                                        </div>
                                                                        <div className="w-14 text-right text-sm text-neutral-600">+{it.value}</div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </ExpandableCard>
                                                </div>

                                                <div>
                                                    <ExpandableCard title="Top dalers" defaultOpen isOpen={openCards.falls} onToggle={(v) => setOpenCards(p => ({ ...p, falls: v }))}>
                                                        {fallsBar.length === 0 ? (
                                                            <div className="text-sm text-neutral-500">Geen data</div>
                                                        ) : (
                                                            <ul className="space-y-3">
                                                                {fallsBar.map((it, idx) => (
                                                                    <li key={String(idx)} className="flex items-center gap-3">
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="text-sm font-medium truncate">{it.name}</div>
                                                                            <div className="w-full h-3 bg-neutral-200 rounded overflow-hidden mt-1">
                                                                                <div className="h-full bg-red-500" style={{ width: `${maxFall ? (it.value / maxFall) * 100 : 0}%` }} />
                                                                            </div>
                                                                        </div>
                                                                        <div className="w-14 text-right text-sm text-neutral-600">-{it.value}</div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </ExpandableCard>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                                                <ExpandableCard title="Nieuwe binnenkomers en verlaters" defaultOpen className={"w-full"}>
                                                  <ExpandableCard title={"nieuwe binnenkomers"}>  <ul className="space-y-2 text-sm">
                                                        {s.newEntries.map(n => <li key={n.songId}>{n.titel} — {n.artistName} {n.releaseYear ? `(${n.releaseYear})` : ''}</li>)}
                                                    </ul>

                                                  </ExpandableCard>
                                                    <ExpandableCard title={"verlaters"}>
                                                        <ul className="space-y-2 text-sm">
                                                            {s.droppedEntries.map(d => <li key={d.songId}>{d.titel} — {d.artistName} {d.releaseYear ? `(${d.releaseYear})` : ''}</li>)}
                                                        </ul>
                                                    </ExpandableCard>
                                                </ExpandableCard>
                                            </div>

                                            {/* All-time classics: full width, placed at the bottom */}
                                            <div className="mt-4">
                                                <ExpandableCard title="All-time classics" defaultOpen className="w-full">
                                                    <ul className="space-y-2 text-sm">
                                                        {s.allTimeClassics.map(c => <li key={c.songId}>{c.titel} — {c.artistName} {c.releaseYear ? `(${c.releaseYear})` : ''}</li>)}
                                                    </ul>
                                                </ExpandableCard>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })() : (
                                <div>
                                    <h4 className="font-semibold mb-2">Resultaten ({filtered.length})</h4>
                                    {filtered.length === 0 ? (
                                        <div className="text-sm text-neutral-500">Geen resultaten</div>
                                    ) : (
                                        <ul className="space-y-2 text-sm">
                                            {filtered.map(s => (
                                                <li key={String(s.id)} className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-medium">{s.title ?? s.titel}</div>
                                                        <div className="text-neutral-500 text-sm">{s.artist ?? s.artistName} {s.year ?? s.releaseYear ? `• ${s.year ?? s.releaseYear}` : ''}</div>
                                                    </div>
                                                    <div className="text-sm text-neutral-500">{s.rank ? `#${s.rank}` : ''}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    </ExpandableCard>
                </section>
            </div>
        </main>
    );
}
