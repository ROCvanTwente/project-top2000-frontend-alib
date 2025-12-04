"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import Link from "next/link";
import { useAuth } from "./auth/AuthProvider";

// Components import
import Top5 from "./components/Top5";
import QuickInfo from "./components/QuickInfo";
import Carousel from "./components/Hero";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [userResult, setUserResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        <Top5 selectedYear={2024} onSpotifyClick={() => {}} spotifyConnected={false} />
        <QuickInfo />
      </div>
    </main>
  );
}