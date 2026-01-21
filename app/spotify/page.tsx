"use client";   

import { useEffect } from "react";
import { redirectToAuthCodeFlow } from "./script";

export default function Spotify() {
    useEffect(() => {
        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
            redirectToAuthCodeFlow(clientId);
        } else {
            // const accessToken = await getAccessToken(clientId, code);
            // const profile = await fetchProfile(accessToken);
            // populateUI(profile);
        }
    }, []);

    return (
        <div>
            <h1>Spotify</h1>
        </div>
    );
}