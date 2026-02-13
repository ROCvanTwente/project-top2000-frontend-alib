"use client";

import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import Header from "./components/Header";
import LoadingBar from "react-top-loading-bar";
import Footer from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import SpotifyPanel from './components/customUI/SpotifySidebar';
import { useSpotifyPlayer } from './hooks/useSpotifyPlayer';
import { isSpotifyLoggedIn, getStoredAccessToken, getAccessToken, getUserPlaylists } from './spotify/script';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [spotifyPanelOpen, setSpotifyPanelOpen] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const loadingRef = useRef<any>(null);
  const pendingRef = useRef<number>(0);
  const originalFetchRef = useRef<typeof fetch | null>(null);

  // Initialize Spotify player with token
  const {
    isReady: playerReady,
    deviceId,
    playerState,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    error: playerError
  } = useSpotifyPlayer(token);

  // Handle Spotify OAuth callback AND check existing login on mount
  useEffect(() => {
    const handleSpotifyAuth = async () => {
      // Check for OAuth code in URL FIRST (callback from Spotify)
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      
      // First check if we already have a stored token
      const storedToken = getStoredAccessToken();
      console.log("ClientLayout: Checking stored token...", storedToken ? "Found" : "Not found");
      
      // If we have a code but also a stored token, the token was just created - clear the URL and show success
      if (storedToken && code) {
        console.log("ClientLayout: Token exists and code in URL - clearing URL");
        setToken(storedToken);
        setSpotifyConnected(true);
        // Clear code from URL immediately to prevent re-use
        window.history.replaceState({}, document.title, window.location.pathname);
        toast.success("Succesvol verbonden met Spotify!", {
          description: "Je kunt nu muziek afspelen via Spotify.",
          duration: 4000,
        });
        try {
          const userPlaylists = await getUserPlaylists(storedToken);
          setPlaylists(userPlaylists.items || []);
        } catch (e) {
          console.error("Error fetching playlists:", e);
        }
        return;
      }
      
      // If we have a stored token but no code, just use the stored token
      if (storedToken && !code) {
        console.log("ClientLayout: Setting token and connected state");
        setToken(storedToken);
        setSpotifyConnected(true);
        try {
          const userPlaylists = await getUserPlaylists(storedToken);
          setPlaylists(userPlaylists.items || []);
        } catch (e) {
          console.error("Error fetching playlists:", e);
        }
        return;
      }

      // Only if we have a code but NO stored token, exchange it
      if (code && !storedToken) {
        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";
        try {
          const accessToken = await getAccessToken(clientId, code);
          console.log("Spotify token obtained and saved!");
          setToken(accessToken);
          setSpotifyConnected(true);
          
          // Fetch playlists with new token
          const userPlaylists = await getUserPlaylists(accessToken);
          setPlaylists(userPlaylists.items || []);
          
          // Clear code from URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          toast.success("Succesvol verbonden met Spotify!", {
            description: "Je kunt nu muziek afspelen via Spotify.",
            duration: 4000,
          });
        } catch (e) {
          console.error("Error getting Spotify access token:", e);
          toast.error("Verbinding met Spotify mislukt", {
            description: "Probeer het opnieuw.",
            duration: 4000,
          });
        }
      }
    };
    
    handleSpotifyAuth();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!originalFetchRef.current) originalFetchRef.current = window.fetch.bind(window);

    const orig = originalFetchRef.current;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      pendingRef.current += 1;
      if (loadingRef.current && pendingRef.current === 1) {
        loadingRef.current.continuousStart();
      }
      try {
        const res = await orig(...args);
        return res;
      } catch (err) {
        throw err;
      } finally {
        pendingRef.current -= 1;
        if (loadingRef.current && pendingRef.current === 0) {
          loadingRef.current.complete();
        }
      }
    };

    return () => {
      if (originalFetchRef.current) window.fetch = originalFetchRef.current;
    };
  }, []);

  const handleSpotifyConnect = () => {
    window.location.href = "/spotify";
  };

  return (
    <>
      <Toaster />
      <LoadingBar color="var(--primary)" ref={loadingRef} />

      <Header
        selectedYear={selectedYear}
        onYearChange={(y: number) => setSelectedYear(y)}
        onSpotifyClick={() => setSpotifyPanelOpen(true)}
      />

      <div>{children}</div>
      
      <footer className="w-full">
        <Footer />
      </footer>
      <SpotifyPanel 
          isOpen={spotifyPanelOpen}
          onClose={() => setSpotifyPanelOpen(false)}
          isConnected={spotifyConnected}
          onConnect={handleSpotifyConnect}
          playerReady={playerReady}
          playerState={playerState}
          onTogglePlay={togglePlay}
          onNextTrack={nextTrack}
          onPreviousTrack={previousTrack}
          onSeek={seek}
          onVolumeChange={setVolume}
          playerError={playerError}
          playlists={playlists}
          deviceId={deviceId}
        />
    </>
  );
}
