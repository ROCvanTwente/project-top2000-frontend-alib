import { toast } from 'sonner';
import { 
  getStoredAccessToken, 
  createPlaylist, 
  addTracksToPlaylist, 
  searchTrack, 
  getUserPlaylists,
  fetchProfile,
  saveTracksToLibrary,
  removeTracksFromLibrary,
  checkSavedTracks,
  getAllSavedTracks
} from '../app/spotify/script';

export interface PlaylistSong {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  year?: number;
  rank?: number;
  albumImage: string;
  addedAt?: string;
  spotifyUri: string;
  spotifyId: string;
}

const TOP2000_PLAYLIST_NAME = 'Mijn Top2000 Favorieten';

/**
 * Add a song to the user's Spotify Liked Songs
 */
export async function addToPlaylist(songTitle: string, artistName: string): Promise<boolean> {
  try {
    const token = getStoredAccessToken();
    if (!token) {
      toast.error('Je moet eerst verbonden zijn met Spotify');
      return false;
    }

    // Search for the track on Spotify
    const searchQuery = `${songTitle} artist:${artistName}`;
    const searchResult = await searchTrack(token, searchQuery);
    
    if (!searchResult.tracks?.items?.length) {
      toast.error('Nummer niet gevonden op Spotify');
      return false;
    }

    const track = searchResult.tracks.items[0];
    const trackId = track.id;

    // Check if already saved
    const savedCheck = await checkSavedTracks(token, [trackId]);
    if (savedCheck[0]) {
      toast.info('Dit nummer staat al in je Spotify bibliotheek');
      return false;
    }

    // Add to Spotify Liked Songs
    await saveTracksToLibrary(token, [trackId]);
    
    toast.success('Nummer toegevoegd aan je Spotify bibliotheek!');
    return true;
  } catch (err: any) {
    console.error('Error adding to playlist:', err);
    toast.error(err.message || 'Er ging iets mis bij het toevoegen aan Spotify');
    return false;
  }
}

/**
 * Remove a song from the user's Spotify Liked Songs
 */
export async function removeFromPlaylist(spotifyId: string): Promise<boolean> {
  try {
    const token = getStoredAccessToken();
    if (!token) {
      toast.error('Je moet eerst verbonden zijn met Spotify');
      return false;
    }

    await removeTracksFromLibrary(token, [spotifyId]);
    
    toast.success('Nummer verwijderd uit Spotify bibliotheek');
    return true;
  } catch (err: any) {
    console.error('Error removing from playlist:', err);
    toast.error(err.message || 'Kon nummer niet verwijderen uit Spotify');
    return false;
  }
}

/**
 * Get the user's Spotify Liked Songs as playlist
 */
export async function getPlaylist(onProgress?: (count: number) => void): Promise<PlaylistSong[]> {
  try {
    const token = getStoredAccessToken();
    if (!token) {
      throw new Error('Je moet eerst verbonden zijn met Spotify');
    }

    const spotifyTracks = await getAllSavedTracks(token, onProgress);
    
    return spotifyTracks.map((track: any, index: number) => ({
      id: track.spotifyId,
      title: track.title,
      artist: track.artist,
      artistId: track.spotifyId, // Using spotifyId as artistId for now
      albumImage: track.albumImage || '/images/placeholder-album.png',
      spotifyUri: track.uri,
      spotifyId: track.spotifyId,
      addedAt: new Date().toISOString() // Spotify doesn't provide exact date in this format
    }));
  } catch (err: any) {
    console.error('Error fetching playlist:', err);
    throw err;
  }
}

/**
 * Check if a song is in the user's Spotify Liked Songs by searching for it
 */
export async function isSongInPlaylist(songTitle: string, artistName: string): Promise<boolean> {
  try {
    const token = getStoredAccessToken();
    if (!token) {
      return false;
    }

    // Search for the track on Spotify
    const searchQuery = `${songTitle} artist:${artistName}`;
    const searchResult = await searchTrack(token, searchQuery);
    
    if (!searchResult.tracks?.items?.length) {
      return false;
    }

    const trackId = searchResult.tracks.items[0].id;
    const savedCheck = await checkSavedTracks(token, [trackId]);
    return savedCheck[0] || false;
  } catch (err) {
    console.error('Error checking playlist:', err);
    return false;
  }
}

/**
 * Export Liked Songs to a new Top2000 playlist
 */
export async function exportToSpotify(): Promise<{ success: boolean; playlistName?: string }> {
  try {
    const token = getStoredAccessToken();
    if (!token) {
      throw new Error('Je moet eerst verbonden zijn met Spotify');
    }

    // Get user profile
    const profile = await fetchProfile(token);
    if (!profile.id) {
      throw new Error('Kon Spotify profiel niet ophalen');
    }

    // Create new playlist
    const playlist = await createPlaylist(profile.id, token, TOP2000_PLAYLIST_NAME);
    if (!playlist.id) {
      throw new Error('Kon playlist niet aanmaken op Spotify');
    }

    // Get all liked songs
    const likedTracks = await getAllSavedTracks(token);
    
    if (likedTracks.length === 0) {
      toast.info('Je hebt geen nummers in je Spotify bibliotheek om te exporteren');
      return { success: false };
    }

    // Add tracks to playlist in batches (max 100 per request)
    const batchSize = 100;
    for (let i = 0; i < likedTracks.length; i += batchSize) {
      const batch = likedTracks.slice(i, i + batchSize);
      const trackUris = batch.map(track => track.uri);
      await addTracksToPlaylist(playlist.id, token, trackUris);
    }

    toast.success(`Playlist "${TOP2000_PLAYLIST_NAME}" aangemaakt met ${likedTracks.length} nummers!`);
    
    return { 
      success: true, 
      playlistName: TOP2000_PLAYLIST_NAME
    };
  } catch (err: any) {
    console.error('Error exporting to Spotify:', err);
    toast.error(err.message || 'Kon playlist niet exporteren naar Spotify');
    return { success: false };
  }
}