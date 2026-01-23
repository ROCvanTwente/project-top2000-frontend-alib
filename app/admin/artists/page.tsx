"use client";

import { useEffect, useState } from 'react';
import { Search, Edit2, Save, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Carousel from '../../components/customUI/Carousel';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { toast } from 'sonner';
import { apiFetch, parseApiError } from '../../../lib/api';
import { useAuth } from '../../auth/AuthProvider';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';

interface Artist {
    artistId: string;
    artistName: string;
    wikipediaUrl: string;
    biography: string;
    photo: string;
    stats: {
        totalSongsInTop2000: number;
    };
}

type ArtistsApiResponse = {
    page: number;
    pageSize: number;
    totalArtists: number;
    totalPages: number;
    artists: Artist[];
};

export default function AdminArtists() {
    const { isAdmin, initialized } = useAuth();
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Artist>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalArtists, setTotalArtists] = useState(0);
    const ITEMS_PER_PAGE = 100;

    const carouselSlides = [
        {
            image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200',
            title: 'Beheer artiesten',
            subtitle: 'Bewerk artiestinformatie en details'
        }
    ];

    useEffect(() => {
        const loadArtists = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await apiFetch('/artists', { method: 'GET' });
                if (!res.ok) {
                    const err = await parseApiError(res);
                    throw new Error(err.message || 'Failed to load artists');
                }
                const data = (await res.json()) as Artist[];
                setArtists(Array.isArray(data) && data.length ? data : []);
                setTotalArtists(data.length);
            } catch (e: any) {
                setError(e?.message || 'Kon artiesten niet laden.');
                setArtists([]);
            } finally {
                setLoading(false);
            }
        };
        loadArtists();
    }, []);

    const filteredArtists = artists.filter(artist =>
        artist.artistName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Client-side pagination after filtering
    const paginatedArtists = filteredArtists.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const clientTotalPages = Math.max(1, Math.ceil(filteredArtists.length / ITEMS_PER_PAGE));

    const goToPage = (page: number) => {
        const safe = Math.min(Math.max(1, page), clientTotalPages);
        setCurrentPage(safe);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        if (currentPage > clientTotalPages) setCurrentPage(clientTotalPages);
    }, [currentPage, clientTotalPages]);

    const startEdit = (artist: Artist) => {
        setEditingId(artist.artistId);
        setEditForm({
            biography: artist.biography,
            wikipediaUrl: artist.wikipediaUrl,
            photo: artist.photo
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = (artistId: string) => {
        const optimistic = artists.map(artist => (artist.artistId === artistId ? { ...artist, ...editForm } : artist));
        setArtists(optimistic);
        (async () => {
            try {
                const res = await apiFetch(`/artists/update/${artistId}`, {
                    method: 'PUT',
                    body: JSON.stringify(editForm),
                });
                if (!res.ok) {
                    const err = await parseApiError(res);
                    throw new Error(err.message || 'Update mislukt');
                }
                toast.success('Artiest succesvol bijgewerkt');
            } catch (e: any) {
                toast.error(e?.message || 'Bijwerken mislukt');
            } finally {
                setEditingId(null);
                setEditForm({});
            }
        })();
    };

    if (loading) {
        return <LoadingState title="Artiesten laden..." subtitle="Even geduld..." />;
    }

    if (error) {
        return <ErrorState title="Fout bij laden artiesten" message={error} error={error} issue="Probeer de pagina opnieuw te laden" />;
    }

    if (!initialized) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div>Bezig met laden...</div>
            </div>
        );
    }

    if (!isAdmin) {
        return notFound();
    }

    return (
        <div>
            <Carousel slides={carouselSlides} showBottomBar={false} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Back Link */}
                    <Link href="/admin" className="inline-flex items-center text-red-600 hover:text-red-600 mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2 text-red-600" />
                    Terug naar Beheerder
                </Link>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex items-center mb-4">
                        <Search className="h-5 w-5 mr-2 text-gray-600" />
                        <h3>Zoeken naar artiesten</h3>
                    </div>
                    <Input
                        placeholder="Zoeken op artiestnaam..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        {searchTerm ? (
                            <>
                                Toon {paginatedArtists.length} van {filteredArtists.length} artiesten
                                {searchTerm && ` passend op "${searchTerm}"`}
                            </>
                        ) : (
                            <>
                                Pagina {currentPage} van {clientTotalPages} - Totaal {totalArtists} artiesten
                            </>
                        )}
                    </p>
                </div>

            {/* Artist Cards */}
            <div className="space-y-6">
                {paginatedArtists.map((artist) => (
                        <div key={artist.artistId} className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Artist Photo */}
                                <div className="flex-shrink-0">
                                    <ImageWithFallback
                                        src={artist.photo}
                                        alt={artist.artistName}
                                        className="w-32 h-32 rounded-lg object-cover"
                                    />
                                </div>

                                {/* Artist Info */}
                                <div className="flex-1">
                                    {editingId === artist.artistId ? (
                                        <div className="space-y-4">
                                            {/* Name (Immutable) */}
                                            <div>
                                                <label className="block mb-2">
                                                    Artiestnaam <span className="text-gray-500">(niet aanpasbaar)</span>
                                                </label>
                                                <Input value={artist.artistName} disabled className="bg-gray-100" />
                                            </div>

                                            {/* Photo URL */}
                                            <div>
                                                <label className="block mb-2">Foto URL</label>
                                                <Input
                                                    value={editForm.photo || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, photo: e.target.value })}
                                                    placeholder="https://example.com/photo.jpg"
                                                />
                                            </div>

                                            {/* Biography */}
                                            <div>
                                                <label className="block mb-2">Biografie</label>
                                                <Textarea
                                                    value={editForm.biography || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, biography: e.target.value })}
                                                    rows={4}
                                                    placeholder="Artiest biografie..."
                                                />
                                            </div>

                                            {/* Wikipedia URL */}
                                            <div>
                                                <label className="block mb-2">Wikipedia URL</label>
                                                <Input
                                                    value={editForm.wikipediaUrl || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, wikipediaUrl: e.target.value })}
                                                    placeholder="https://nl.wikipedia.org/wiki/..."
                                                />
                                            </div>

                                            {/* Actions */}
                                            <div className="flex space-x-3 pt-4">
                                                <Button onClick={() => saveEdit(artist.artistId)} className="flex-1">
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Opslaan
                                                </Button>
                                                <Button onClick={cancelEdit} variant="outline" className="flex-1">
                                                    <X className="h-4 w-4 mr-2" />
                                                    Annuleren
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="mb-2">{artist.artistName}</h3>
                                                    <p className="text-gray-600">
                                                        {artist.stats.totalSongsInTop2000} {artist.stats.totalSongsInTop2000 === 1 ? 'nummer' : 'nummers'} in TOP2000
                                                    </p>
                                                </div>
                                                <Button onClick={() => startEdit(artist)} size="sm">
                                                    <Edit2 className="h-4 w-4 mr-2" />
                                                    Bewerken
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {filteredArtists.length > ITEMS_PER_PAGE && (
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
                                    <span className="font-medium">{clientTotalPages}</span>
                                </div>

                                <select
                                    value={currentPage}
                                    onChange={(e) => goToPage(Number(e.target.value))}
                                    className="px-3 py-2 rounded-lg shadow-sm bg-white border border-gray-200 text-gray-700 hover:shadow-md transition"
                                >
                                    {Array.from({ length: clientTotalPages }, (_, i) => i + 1).map((p) => (
                                        <option key={p} value={p}>
                                            Pagina {p}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === clientTotalPages}
                                className="px-4 py-2 rounded-lg shadow-sm bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition"
                            >
                                Volgende
                            </button>
                        </div>
                    </div>
                )}

                {filteredArtists.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-600">
                            Geen artiesten gevonden{searchTerm && ` passend op "${searchTerm}"`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
