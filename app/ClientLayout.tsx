"use client";

import React, { useState, useRef, useEffect } from "react";
import Header from "./components/Header";
import LoadingBar from "react-top-loading-bar";
import Footer from "./components/Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [spotifyPanelOpen, setSpotifyPanelOpen] = useState(false);
  const loadingRef = useRef<any>(null);
  const pendingRef = useRef<number>(0);
  const originalFetchRef = useRef<typeof fetch | null>(null);

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

  return (
    <>
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
    </>
  );
}
