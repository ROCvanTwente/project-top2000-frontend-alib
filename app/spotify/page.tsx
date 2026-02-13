"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "../auth/AuthProvider";
import {
    redirectToAuthCodeFlow,
    getAccessToken,
    fetchProfile,
    createPlaylist,
    playSong,
    searchTrack,
} from "./script";

export default function Spotify() {
    const [profile, setProfile] = useState<any>(null);
    const [token, setToken] = useState<string>("");
    const router = useRouter();
    const { initialized, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!initialized) return;
        if (!isAuthenticated) {
            router.replace("/login?redirect=/spotify");
            return;
        }

        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";
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
                toast.success("Succesvol verbonden met Spotify!", {
                    description: "Je kunt nu muziek afspelen via Spotify.",
                    duration: 4000,
                });
            };
            fetchData();
        }
    }, [initialized, isAuthenticated, router]);
}