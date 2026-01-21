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

interface SpotifyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  onConnect: () => void;
}

export default function SpotifyPanel({ isOpen, onClose, isConnected, onConnect }: SpotifyPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong] = useState({
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    image: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400'
  });
  const [progress, setProgress] = useState([45]);
  const [volume, setVolume] = useState([70]);
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  
  // Mock user playlists
  const [userPlaylists] = useState([
    { id: '1', name: 'My Favorites', songCount: 42 },
    { id: '2', name: 'Road Trip Mix', songCount: 38 },
    { id: '3', name: 'Workout Playlist', songCount: 25 },
    { id: '4', name: 'Chill Vibes', songCount: 56 },
  ]);

  const handleAddToDefaultPlaylist = () => {
    toast.success(`Added "${currentSong.title}" to your TOP2000 Collection`, {
      description: 'The playlist was created automatically',
    });
  };

  const handleAddToExistingPlaylist = (playlistName: string) => {
    toast.success(`Added "${currentSong.title}" to ${playlistName}`, {
      description: 'Song added successfully',
    });
    setShowPlaylistDialog(false);
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
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white">
              <span className="text-sm">♫</span>
            </div>
            <span>Spotify Player</span>
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
                <h3 className="mb-2">Connect to Spotify</h3>
                <p className="text-gray-600 mb-6">
                  Scan the QR code with your Spotify app to connect
                </p>
              </div>

              {/* Mock QR Code */}
              <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                <div className="grid grid-cols-8 gap-1 p-4">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 ${
                        Math.random() > 0.5 ? 'bg-black' : 'bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Button onClick={onConnect} className="bg-green-600 hover:bg-green-700">
                Connect with Spotify
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                You'll be able to play any song from the TOP2000
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Now Playing */}
              <div className="text-center">
                <h3 className="mb-4">Now Playing</h3>
                <ImageWithFallback
                  src={currentSong.image}
                  alt={currentSong.title}
                  className="w-full aspect-square object-cover rounded-lg mb-4"
                />
                <h4 className="mb-1">{currentSong.title}</h4>
                <p className="text-gray-600">{currentSong.artist}</p>
                <p className="text-gray-500">{currentSong.album}</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={progress}
                  onValueChange={setProgress}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>2:34</span>
                  <span>5:55</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-6">
                <button className="text-gray-600 hover:text-gray-900 transition">
                  <SkipBack className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                </button>
                <button className="text-gray-600 hover:text-gray-900 transition">
                  <SkipForward className="h-6 w-6" />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center space-x-3">
                <Volume2 className="h-5 w-5 text-gray-600" />
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-8">{volume}%</span>
              </div>

              {/* Add to Playlist */}
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
                        <span>Add to TOP2000 Collection</span>
                      </Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Info className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Automatically creates a "TOP2000 Collection" playlist in your Spotify account if it doesn't exist, then adds this song to it.</p>
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

              {/* Queue Info */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="mb-3">Up Next</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded" />
                    <div className="flex-1">
                      <p>Hotel California</p>
                      <p className="text-gray-600">Eagles</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded" />
                    <div className="flex-1">
                      <p>Stairway to Heaven</p>
                      <p className="text-gray-600">Led Zeppelin</p>
                    </div>
                  </div>
                </div>
              </div>
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
              Choose a playlist to add "{currentSong.title}" to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto py-2">
            {userPlaylists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => handleAddToExistingPlaylist(playlist.name)}
                className="w-full p-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-green-500 rounded-lg flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-md flex items-center justify-center">
                    <ListMusic className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-gray-900">{playlist.name}</p>
                    <p className="text-sm text-gray-500">{playlist.songCount} songs</p>
                  </div>
                </div>
                <Plus className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}