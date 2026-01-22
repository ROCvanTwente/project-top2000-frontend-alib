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

interface Song {
    songId: string;
    titel: string;
    artistName: string;
    imgUrl: string;
    releaseYear: number;
}

interface SongDetails extends Song {
    artistId: string;
    artistPhoto: string;
    lyrics: string;
    youtube?: string;
}

export default function AdminSongs() {
  const { isAdmin, initialized } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SongDetails>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 100;

  const carouselSlides = [
    {
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
      title: 'Beheer nummers',
      subtitle: 'Bewerk nummerinformatie en details'
    }
  ];

  useEffect(() => {
    const loadSongs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch('/song/getallsongs', { method: 'GET' });
        if (!res.ok) {
          const err = await parseApiError(res);
          throw new Error(err.message || 'Failed to load songs');
        }
        const data = (await res.json()) as Song[];
        setSongs(Array.isArray(data) && data.length ? data : []);
      } catch (e: any) {
        setError(e?.message || 'Kon nummers niet laden.');
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };
    loadSongs();
  }, []);

  const filteredSongs = songs.filter(song =>
    song.titel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artistName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredSongs.length / ITEMS_PER_PAGE));
  const displayedSongs = filteredSongs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page: number) => {
    const safe = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(safe);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const startEdit = async (song: Song) => {
    setEditingId(song.songId);
    setEditLoading(true);
    try {
      const res = await apiFetch(`/song/details?id=${song.songId}`, { method: 'GET' });
      if (!res.ok) {
        const err = await parseApiError(res);
        throw new Error(err.message || 'Failed to load song details');
      }
      const details = (await res.json()) as SongDetails;
      setEditForm({
        lyrics: details.lyrics,
        imgUrl: details.imgUrl,
        youtube: details.youtube || ''
      });
    } catch (e: any) {
      toast.error(e?.message || 'Kon nummers details niet laden.');
      setEditingId(null); // Reset on error
    } finally {
      setEditLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = (songId: string) => {
    const optimistic = songs.map(song => (song.songId === songId ? { ...song, ...editForm } : song));
    setSongs(optimistic);
    (async () => {
      try {
        const res = await apiFetch(`/song/update/${songId}`, {
          method: 'PUT',
          body: JSON.stringify(editForm),
        });
        if (!res.ok) {
          const err = await parseApiError(res);
          throw new Error(err.message || 'Update mislukt');
        }
        toast.success('Nummer succesvol bijgewerkt');
      } catch (e: any) {
        toast.error(e?.message || 'Bijwerken mislukt');
      } finally {
        setEditingId(null);
        setEditForm({});
      }
    })();
  };

  if (loading) {
    return <LoadingState title="Nummers laden..." subtitle="Even geduld..." />;
  }

  if (error) {
    return <ErrorState title="Fout bij laden nummers" message={error} error={error} issue="Probeer de pagina opnieuw te laden" />;
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
            <h3>Zoeken naar nummers</h3>
          </div>
          <Input
            placeholder="Zoeken op titel of artiest..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Toon {displayedSongs.length} van {filteredSongs.length} nummers
            {searchTerm && ` passend op "${searchTerm}"`}
          </p>
        </div>

        {/* Songs List */}
        <div className="space-y-6">
          {displayedSongs.map((song) => (
            <div key={song.songId} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Album Image */}
                <div className="flex-shrink-0">
                  <ImageWithFallback
                    src={song.imgUrl}
                    alt={song.titel}
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                </div>

                {/* Song Info */}
                <div className="flex-1">
                  {editingId === song.songId ? (
                    <div className="space-y-4">
                      {/* Title (Immutable) */}
                      <div>
                        <label className="block mb-2">
                          Titel <span className="text-gray-500">(niet aanpasbaar)</span>
                        </label>
                        <Input value={song.titel} disabled className="bg-gray-100" />
                      </div>

                      {/* Artist (Immutable) */}
                      <div>
                        <label className="block mb-2">
                          Artiest <span className="text-gray-500">(niet aanpasbaar)</span>
                        </label>
                        <Input value={song.artistName} disabled className="bg-gray-100" />
                      </div>

                      {/* Year (Immutable) */}
                      <div>
                        <label className="block mb-2">
                          Uitgebracht <span className="text-gray-500">(niet aanpasbaar)</span>
                        </label>
                        <Input value={song.releaseYear} disabled className="bg-gray-100" />
                      </div>

                      {/* Album Image URL */}
                      <div>
                        <label className="block mb-2">Afbeeldings-URL</label>
                        <Input
                          value={editForm.imgUrl || ''}
                          onChange={(e) => setEditForm({ ...editForm, imgUrl: e.target.value })}
                          placeholder="https://example.com/album.jpg"
                        />
                      </div>

                      {/* Lyrics */}
                      <div>
                        <label className="block mb-2">Lyrics</label>
                        <Textarea
                          value={editForm.lyrics || ''}
                          onChange={(e) => setEditForm({ ...editForm, lyrics: e.target.value })}
                          rows={6}
                          placeholder="Songtekst..."
                        />
                      </div>

                      {/* YouTube Link */}
                      <div>
                        <label className="block mb-2">YouTube Link</label>
                        <Input
                          value={editForm.youtube || ''}
                          onChange={(e) => setEditForm({ ...editForm, youtube: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3 pt-4">
                        <Button onClick={() => saveEdit(song.songId)} className="flex-1" disabled={editLoading}>
                          <Save className="h-4 w-4 mr-2" />
                          {editLoading ? 'Opslaan...' : 'Wijzigingen opslaan'}
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
                          <h3 className="mb-1">{song.titel}</h3>
                          <p className="text-gray-600 mb-2">{song.artistName}</p>
                          <p className="text-gray-500">Uitgebracht: {song.releaseYear}</p>
                        </div>
                        <Button onClick={() => startEdit(song)} size="sm" disabled={editLoading}>
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
        {filteredSongs.length > 0 && totalPages > 1 && (
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
                  <span className="font-medium">{totalPages}</span>
                </div>

                <select
                  value={currentPage}
                  onChange={(e) => goToPage(Number(e.target.value))}
                  className="px-3 py-2 rounded-lg shadow-sm bg-white border border-gray-200 text-gray-700 hover:shadow-md transition"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <option key={p} value={p}>
                      Pagina {p}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg shadow-sm bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition"
              >
                Volgende
              </button>
            </div>
          </div>
        )}

        {filteredSongs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">
              Geen nummers gevonden{searchTerm && ` passend op "${searchTerm}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
