"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import Link from "next/link";
import { useAuth } from "./auth/AuthProvider";
import { getAccessToken, getStoredAccessToken, fetchProfile, getUserPlaylists } from "./spotify/script";

// Components import
import Top5 from "./components/Top5";
import QuickInfo from "./components/QuickInfo";
import Carousel from "./components/Hero";
import Footer from "./components/Footer";
import CallToActionCard from "./components/CallToActionCard";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [userResult, setUserResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);

  // Handle Spotify OAuth callback
  useEffect(() => {
    const handleSpotifyCallback = async () => {
      // Check if we already have a stored token
      const storedToken = getStoredAccessToken();
      if (storedToken) {
        setSpotifyConnected(true);
        return;
      }

      // Check for OAuth code in URL
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      
      if (code) {
        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";
        try {
          const accessToken = await getAccessToken(clientId, code);
          console.log("Spotify token obtained and saved!");
          setSpotifyConnected(true);
          
          // Clear code from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
          console.error("Error getting Spotify access token:", e);
        }
      }
    };
    
    handleSpotifyCallback();
  }, []);

  useEffect(() => {
    const check = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/test/user`, {}, { suppressUnauthorized: true });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          setUserResult(`Error: ${res.status}`);
        } else {
          const data = await res.json().catch(() => null);
          setUserResult(data ? JSON.stringify(data) : "OK");
        }
      } catch (e: any) {
        setUserResult(`Request error: ${e?.message || e}`);
      }
      setLoading(false);
    };
    check();
  }, []);

  return (
    <main className="min-h-[calc(100vh-6rem)] bg-muted flex flex-col items-center justify-center">
      {/* <div className="max-w-xl w-full bg-card text-card-foreground rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-4">Welcome to Top2000</h1>
        <p className="mb-2">{isAuthenticated ? "You are signed in." : "You are not signed in."}</p>
        <p className="mb-4">API test: {loading ? "Checking..." : userResult ?? "Not checked"}</p>
        <div className="flex gap-3">
          {isAuthenticated ? (
            <Link href="/logout" className="px-4 py-2 rounded bg-destructive text-destructive-foreground">Logout</Link>
          ) : (
            <Link href="/login" className="px-4 py-2 rounded bg-primary text-primary-foreground">Login</Link>
          )}
          <Link href="/" className="px-4 py-2 rounded border">Refresh</Link>
        </div>
      </div> */}
      <div className="flex w-full flex-col gap-3" id="MainContent">
        <Carousel />
        {/* <CallToActionCard /> */}
        <Top5 selectedYear={2024} onSpotifyClick={() => {}} spotifyConnected={spotifyConnected} />
        <QuickInfo />
      </div>
    </main>
  );
}