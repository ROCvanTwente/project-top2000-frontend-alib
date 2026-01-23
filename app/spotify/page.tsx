"use client";   

import { useEffect, useState } from "react";
import { redirectToAuthCodeFlow, getAccessToken, fetchProfile, createPlaylist, addTracksToPlaylist, playSong, searchTrack } from "./script";

export default function Spotify() {
    const [profile, setProfile] = useState<any>(null);
    const [token, setToken] = useState<string>("");

    useEffect(() => {
        const clientId = "d816f0a407654135816e64bd94c15bf3";
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
            redirectToAuthCodeFlow(clientId);
        } else {
            const fetchData = async () => {
                const accessToken = await getAccessToken(clientId, code);
                setToken(accessToken);
                const profileData = await fetchProfile(accessToken);
                setProfile(profileData);
                console.log(profileData);
            };
            fetchData();
        }
    }, []);

    const handleCreatePlaylist = async () => {
        if (!profile || !token) return;
        const playlist = await createPlaylist(profile.id, token, "Top 2000 Favorites");
        console.log("Playlist created:", playlist);
        alert(`Playlist created: ${playlist.name}`);
    };

    const handleAddSong = async () => {
        if (!token) return;
        // Search for "Bohemian Rhapsody" as a test
        const searchResult = await searchTrack(token, "Bohemian Rhapsody");
        if (searchResult.tracks.items.length > 0) {
            const trackUri = searchResult.tracks.items[0].uri;
            // Note: You need a playlist ID here. For now, we'll just log the URI.
            // In a real flow, you'd pick the playlist you just created.
            console.log("Found track:", trackUri);
            
            // For testing, let's try to play it immediately
            await playSong(token, trackUri);
        }
    };
}