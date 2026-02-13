"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { getStoredAccessToken, transferPlaybackToDevice } from '../spotify/script';

interface SpotifyTrack {
    name: string;
    artists: { name: string }[];
    album: {
        name: string;
        images: { url: string }[];
    };
    duration_ms: number;
    uri: string;
}

interface PlayerState {
    isPlaying: boolean;
    currentTrack: SpotifyTrack | null;
    position: number;
    duration: number;
    volume: number;
}

interface UseSpotifyPlayerReturn {
    isReady: boolean;
    deviceId: string | null;
    playerState: PlayerState;
    togglePlay: () => Promise<void>;
    nextTrack: () => Promise<void>;
    previousTrack: () => Promise<void>;
    seek: (position: number) => Promise<void>;
    setVolume: (volume: number) => Promise<void>;
    error: string | null;
}

export function useSpotifyPlayer(token: string | null): UseSpotifyPlayerReturn {
    const [isReady, setIsReady] = useState(false);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [playerState, setPlayerState] = useState<PlayerState>({
        isPlaying: false,
        currentTrack: null,
        position: 0,
        duration: 0,
        volume: 50
    });
    
    const playerRef = useRef<Spotify.Player | null>(null);
    const scriptLoadedRef = useRef(false);

    // Load Spotify SDK script
    useEffect(() => {
        if (scriptLoadedRef.current) return;
        
        // Only load script if we have a token or if we want to preload it
        // But better to wait for token to avoid unnecessary loads
        if (!token) return;

        // Check if script already exists
        if (document.getElementById('spotify-player-script')) {
            scriptLoadedRef.current = true;
            return;
        }

        const script = document.createElement('script');
        script.id = 'spotify-player-script';
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;

        document.body.appendChild(script);
        scriptLoadedRef.current = true;

        return () => {
            // Don't remove script on cleanup as it might be used by other components
        };
    }, [token]);

    // Initialize player when SDK is ready
    useEffect(() => {
        if (!token) return;

        const initPlayer = () => {
            if (playerRef.current) return;

            const player = new window.Spotify.Player({
                name: 'Top 2000 Web Player',
                getOAuthToken: (cb) => {
                    cb(token);
                },
                volume: 0.5
            });

            // Error handling
            player.addListener('initialization_error', ({ message }) => {
                console.error('Spotify initialization error:', message);
                setError(`Initialization error: ${message}`);
            });

            player.addListener('authentication_error', ({ message }) => {
                console.error('Spotify authentication error:', message);
                setError(`Authentication error: ${message}`);
            });

            player.addListener('account_error', ({ message }) => {
                console.error('Spotify account error:', message);
                setError(`Account error: ${message}. Premium required.`);
            });

            player.addListener('playback_error', ({ message }) => {
                console.error('Spotify playback error:', message);
                setError(`Playback error: ${message}`);
            });

            // Ready
            player.addListener('ready', ({ device_id }) => {
                console.log('Spotify player ready with Device ID:', device_id);
                setDeviceId(device_id);
                setIsReady(true);
                setError(null);
                try {
                    localStorage.setItem('spotify_device_id', device_id);
                } catch {}
                
                // Transfer playback to this device
                transferPlaybackToDevice(token, device_id);
            });

            // Not Ready
            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline:', device_id);
                setIsReady(false);
                try {
                    const stored = localStorage.getItem('spotify_device_id');
                    if (stored === device_id) localStorage.removeItem('spotify_device_id');
                } catch {}
            });

            // Player state changed
            player.addListener('player_state_changed', (state) => {
                if (!state) {
                    setPlayerState(prev => ({ ...prev, currentTrack: null }));
                    return;
                }

                const track = state.track_window.current_track;
                setPlayerState({
                    isPlaying: !state.paused,
                    currentTrack: track ? {
                        name: track.name,
                        artists: track.artists,
                        album: track.album,
                        duration_ms: track.duration_ms,
                        uri: track.uri
                    } : null,
                    position: state.position,
                    duration: state.duration,
                    volume: playerState.volume
                });
            });

            player.connect();
            playerRef.current = player;
        };

        // Check if SDK is already loaded
        if (window.Spotify) {
            initPlayer();
        } else {
            window.onSpotifyWebPlaybackSDKReady = initPlayer;
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.disconnect();
                playerRef.current = null;
            }
            try {
                localStorage.removeItem('spotify_device_id');
            } catch {}
        };
    }, [token]);

    const togglePlay = useCallback(async () => {
        if (playerRef.current) {
            await playerRef.current.togglePlay();
        }
    }, []);

    const nextTrack = useCallback(async () => {
        if (playerRef.current) {
            await playerRef.current.nextTrack();
        }
    }, []);

    const previousTrack = useCallback(async () => {
        if (playerRef.current) {
            await playerRef.current.previousTrack();
        }
    }, []);

    const seek = useCallback(async (position: number) => {
        if (playerRef.current) {
            await playerRef.current.seek(position);
        }
    }, []);

    const setVolume = useCallback(async (volume: number) => {
        if (playerRef.current) {
            await playerRef.current.setVolume(volume / 100);
            setPlayerState(prev => ({ ...prev, volume }));
        }
    }, []);

    return {
        isReady,
        deviceId,
        playerState,
        togglePlay,
        nextTrack,
        previousTrack,
        seek,
        setVolume,
        error
    };
}
