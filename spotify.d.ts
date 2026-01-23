// Spotify Web Playback SDK Type Declarations

interface Window {
  onSpotifyWebPlaybackSDKReady: () => void;
  Spotify: typeof Spotify;
}

declare namespace Spotify {
  interface Album {
    images: { url: string }[];
    name: string;
    uri: string;
  }

  interface Artist {
    name: string;
    uri: string;
  }

  interface Track {
    album: Album;
    artists: Artist[];
    duration_ms: number;
    id: string | null;
    is_playable: boolean;
    name: string;
    uri: string;
  }

  interface PlaybackState {
    context: {
      uri: string | null;
      metadata: any;
    };
    disallows: {
      pausing: boolean;
      peeking_next: boolean;
      peeking_prev: boolean;
      resuming: boolean;
      seeking: boolean;
      skipping_next: boolean;
      skipping_prev: boolean;
    };
    duration: number;
    paused: boolean;
    position: number;
    repeat_mode: number;
    shuffle: boolean;
    track_window: {
      current_track: Track;
      next_tracks: Track[];
      previous_tracks: Track[];
    };
  }

  interface PlayerInit {
    name: string;
    getOAuthToken: (callback: (token: string) => void) => void;
    volume?: number;
  }

  interface WebPlaybackError {
    message: string;
  }

  class Player {
    constructor(options: PlayerInit);
    
    connect(): Promise<boolean>;
    disconnect(): void;
    
    addListener(event: 'ready', callback: (data: { device_id: string }) => void): void;
    addListener(event: 'not_ready', callback: (data: { device_id: string }) => void): void;
    addListener(event: 'player_state_changed', callback: (state: PlaybackState | null) => void): void;
    addListener(event: 'initialization_error', callback: (error: WebPlaybackError) => void): void;
    addListener(event: 'authentication_error', callback: (error: WebPlaybackError) => void): void;
    addListener(event: 'account_error', callback: (error: WebPlaybackError) => void): void;
    addListener(event: 'playback_error', callback: (error: WebPlaybackError) => void): void;
    
    removeListener(event: string, callback?: () => void): void;
    
    getCurrentState(): Promise<PlaybackState | null>;
    setName(name: string): Promise<void>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(position_ms: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
    
    activateElement(): Promise<void>;
  }
}
