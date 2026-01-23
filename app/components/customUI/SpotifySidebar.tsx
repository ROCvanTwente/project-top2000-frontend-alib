import { useState } from 'react';
import { X, Play, Pause, SkipForward, SkipBack, Volume2, Plus, ListMusic, Info } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Slider } from '../ui/slider';
import { ImageWithFallback } from '../ImageWithFallback';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { getStoredAccessToken, addTracksToPlaylist, createPlaylist, fetchProfile, getUserPlaylists } from '../../spotify/script';

interface PlayerState {
  isPlaying: boolean;
  currentTrack: {
    name: string;
    artists: { name: string }[];
    album: {
      name: string;
      images: { url: string }[];
    };
    duration_ms: number;
    uri: string;
  } | null;
  position: number;
  duration: number;
  volume: number;
}

interface SpotifyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  onConnect: () => void;
  playerReady?: boolean;
  playerState?: PlayerState;
  onTogglePlay?: () => Promise<void>;
  onNextTrack?: () => Promise<void>;
  onPreviousTrack?: () => Promise<void>;
  onSeek?: (position: number) => Promise<void>;
  onVolumeChange?: (volume: number) => Promise<void>;
  playerError?: string | null;
  playlists?: any[];
  deviceId?: string | null;
}

export default function SpotifyPanel({ 
  isOpen, 
  onClose, 
  isConnected, 
  onConnect,
  playerReady = false,
  playerState,
  onTogglePlay,
  onNextTrack,
  onPreviousTrack,
  onSeek,
  onVolumeChange,
  playerError,
  playlists = [],
  deviceId
}: SpotifyPanelProps) {
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [localVolume, setLocalVolume] = useState([playerState?.volume ?? 50]);

  const currentTrack = playerState?.currentTrack;
  const isPlaying = playerState?.isPlaying ?? false;
  const position = playerState?.position ?? 0;
  const duration = playerState?.duration ?? 0;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddToDefaultPlaylist = async () => {
    if (!currentTrack) return;
    
    const token = getStoredAccessToken();
    if (!token) {
      toast.error("Not connected to Spotify");
      return;
    }

    try {
      const profile = await fetchProfile(token);
      const userPlaylists = await getUserPlaylists(token);
      
      let targetPlaylist = userPlaylists.items?.find((p: any) => p.name === "Top 2000 Favorites");
      
      if (!targetPlaylist) {
        targetPlaylist = await createPlaylist(profile.id, token, "Top 2000 Favorites");
      }
      
      await addTracksToPlaylist(targetPlaylist.id, token, [currentTrack.uri]);
      
      toast.success(`Added "${currentTrack.name}" to Top 2000 Favorites`, {
        description: 'Song added successfully',
      });
    } catch (error) {
      console.error("Error adding to playlist:", error);
      toast.error("Failed to add song to playlist");
    }
  };

  const handleAddToExistingPlaylist = async (playlistId: string, playlistName: string) => {
    if (!currentTrack) return;
    
    const token = getStoredAccessToken();
    if (!token) {
      toast.error("Not connected to Spotify");
      return;
    }

    try {
      await addTracksToPlaylist(playlistId, token, [currentTrack.uri]);
      toast.success(`Added "${currentTrack.name}" to ${playlistName}`, {
        description: 'Song added successfully',
      });
      setShowPlaylistDialog(false);
    } catch (error) {
      console.error("Error adding to playlist:", error);
      toast.error("Failed to add song to playlist");
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setLocalVolume(value);
    onVolumeChange?.(value[0]);
  };

  const handleSeek = (value: number[]) => {
    onSeek?.(value[0]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black opacity-50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 ${playerReady ? 'bg-green-600' : 'bg-gray-400'} rounded-full flex items-center justify-center text-white`}>
              <span className="text-sm">♫</span>
            </div>
            <div>
              <span className="font-medium">Spotify Player</span>
              {playerReady && <span className="ml-2 text-xs text-green-600">● Connected</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="text-center">
                <h3 className="mb-2 text-lg font-semibold">Connect to Spotify</h3>
                <p className="text-gray-600 mb-6">
                  Log in with your Spotify Premium account to use the web player
                </p>
              </div>

              {/* Spotify Logo */}
              <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.438 17.438a.75.75 0 01-1.032.246c-2.829-1.73-6.391-2.123-10.588-1.168a.75.75 0 11-.333-1.463c4.568-1.038 8.488-.596 11.602 1.32a.75.75 0 01.351 1.065zm1.473-3.273a.938.938 0 01-1.289.308c-3.238-1.988-8.176-2.566-12.008-1.404a.938.938 0 11-.545-1.795c4.312-1.31 9.666-.66 13.334 1.566a.938.938 0 01.508 1.325zm.126-3.407C15.16 8.49 8.74 8.262 5.134 9.32a1.125 1.125 0 11-.627-2.161c4.136-1.207 11.028-.977 15.38 1.53a1.125 1.125 0 11-1.062 2.07z" />
                </svg>
              </div>

              <Button onClick={onConnect} className="bg-green-600 hover:bg-green-700">
                Connect with Spotify
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Requires Spotify Premium for playback
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Error message */}
              {playerError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {playerError}
                </div>
              )}

              {/* Loading state */}
              {!playerReady && !playerError && (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Initializing player...</p>
                </div>
              )}

              {/* Now Playing */}
              {playerReady && (
                <>
                  <div className="text-center">
                    <h3 className="mb-4 text-sm font-medium text-gray-500">Now Playing</h3>
                    {currentTrack ? (
                      <>
                        <ImageWithFallback
                          src={currentTrack.album.images[0]?.url || ''}
                          alt={currentTrack.name}
                          className="w-full aspect-square object-cover rounded-lg mb-4 shadow-lg"
                        />
                        <h4 className="mb-1 font-semibold text-lg">{currentTrack.name}</h4>
                        <p className="text-gray-600">{currentTrack.artists.map(a => a.name).join(', ')}</p>
                        <p className="text-gray-500 text-sm">{currentTrack.album.name}</p>
                      </>
                    ) : (
                      <div className="bg-gray-100 w-full aspect-square rounded-lg mb-4 flex items-center justify-center">
                        <p className="text-gray-500">No track playing</p>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Slider
                      value={[position]}
                      onValueChange={handleSeek}
                      max={duration || 100}
                      step={1000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatTime(position)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center space-x-6">
                    <button 
                      onClick={onPreviousTrack}
                      className="text-gray-600 hover:text-gray-900 transition"
                    >
                      <SkipBack className="h-6 w-6" />
                    </button>
                    <button
                      onClick={onTogglePlay}
                      className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition shadow-lg"
                    >
                      {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
                    </button>
                    <button 
                      onClick={onNextTrack}
                      className="text-gray-600 hover:text-gray-900 transition"
                    >
                      <SkipForward className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Volume */}
                  <div className="flex items-center space-x-3">
                    <Volume2 className="h-5 w-5 text-gray-600" />
                    <Slider
                      value={localVolume}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-8">{localVolume[0]}%</span>
                  </div>

                  {/* Add to Playlist */}
                  {currentTrack && (
                    <div className="border-t border-gray-200 pt-6 space-y-3">
                      <p className="text-sm text-gray-600 mb-3">Add to Playlist</p>
                      <TooltipProvider>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={handleAddToDefaultPlaylist}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center space-x-2"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add to Top 2000 Favorites</span>
                            </Button>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                  <Info className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Adds this song to your "Top 2000 Favorites" playlist (creates it if needed).</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => setShowPlaylistDialog(true)}
                              variant="outline"
                              className="flex-1 rounded-md flex items-center justify-center space-x-2"
                            >
                              <ListMusic className="h-4 w-4" />
                              <span>Add to Existing Playlist</span>
                            </Button>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                  <Info className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Choose from your existing Spotify playlists to add this song to.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </TooltipProvider>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Playlist Dialog */}
      <Dialog open={showPlaylistDialog} onOpenChange={setShowPlaylistDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add to Playlist</DialogTitle>
            <DialogDescription>
              Choose a playlist to add "{currentTrack?.name}" to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto py-2">
            {playlists.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No playlists found</p>
            ) : (
              playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToExistingPlaylist(playlist.id, playlist.name)}
                  className="w-full p-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-green-500 rounded-lg flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-md flex items-center justify-center">
                      <ListMusic className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-gray-900">{playlist.name}</p>
                      <p className="text-sm text-gray-500">{playlist.tracks?.total || 0} songs</p>
                    </div>
                  </div>
                  <Plus className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}