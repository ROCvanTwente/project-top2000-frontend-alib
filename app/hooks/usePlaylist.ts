import { useState, useEffect, useCallback } from 'react';
import { getPlaylist, addToPlaylist, removeFromPlaylist, isSongInPlaylist, PlaylistSong } from '../../lib/playlist';
import { useAuth } from '../auth/AuthProvider';
import { getStoredAccessToken, isSpotifyLoggedIn } from '../spotify/script';

export function usePlaylist() {
  const { isAuthenticated } = useAuth();
  const [playlist, setPlaylist] = useState<PlaylistSong[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spotifyConnected, setSpotifyConnected] = useState(false);

  // Check Spotify connection status
  useEffect(() => {
    setSpotifyConnected(isSpotifyLoggedIn());
  }, []);

  // Fetch the full playlist
  const fetchPlaylist = useCallback(async () => {
    if (!isAuthenticated || !spotifyConnected) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getPlaylist();
      setPlaylist(data);
    } catch (err: any) {
      setError(err.message || 'Er ging iets mis bij het ophalen van je Spotify bibliotheek');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, spotifyConnected]);

  // Add song to playlist
  const addSong = useCallback(async (songTitle: string, artistName: string) => {
    if (!spotifyConnected) {
      return false;
    }
    
    const success = await addToPlaylist(songTitle, artistName);
    if (success) {
      // Refresh playlist to get the updated list
      await fetchPlaylist();
    }
    return success;
  }, [fetchPlaylist, spotifyConnected]);

  // Remove song from playlist
  const removeSong = useCallback(async (spotifyId: string) => {
    if (!spotifyConnected) {
      return false;
    }
    
    const success = await removeFromPlaylist(spotifyId);
    if (success) {
      // Update local state
      setPlaylist(prev => prev.filter(song => song.spotifyId !== spotifyId));
    }
    return success;
  }, [spotifyConnected]);

  // Check if song is in playlist
  const isInPlaylist = useCallback(async (songTitle: string, artistName: string) => {
    if (!spotifyConnected) {
      return false;
    }
    return await isSongInPlaylist(songTitle, artistName);
  }, [spotifyConnected]);

  // Toggle song in playlist
  const toggleSong = useCallback(async (songTitle: string, artistName: string, spotifyId?: string) => {
    if (!spotifyConnected) {
      return false;
    }
    
    const inPlaylist = await isInPlaylist(songTitle, artistName);
    
    if (inPlaylist && spotifyId) {
      return await removeSong(spotifyId);
    } else {
      return await addSong(songTitle, artistName);
    }
  }, [isInPlaylist, addSong, removeSong, spotifyConnected]);

  useEffect(() => {
    if (isAuthenticated && spotifyConnected) {
      fetchPlaylist();
    } else {
      setPlaylist([]);
      setError(null);
    }
  }, [isAuthenticated, spotifyConnected, fetchPlaylist]);

  return {
    playlist,
    loading,
    error,
    spotifyConnected,
    fetchPlaylist,
    addSong,
    removeSong,
    toggleSong,
    isInPlaylist,
    playlistCount: playlist.length
  };
}