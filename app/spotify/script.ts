export async function redirectToAuthCodeFlow(clientId: string) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);
    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "https://project-top2000-frontend-alib.vercel.app/");
    params.append("scope", "user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-modify-playback-state user-library-read user-library-modify streaming user-read-playback-state");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// Start of requesting the user profile
export async function getAccessToken(clientId: string, code: string): Promise<string> {
    const verifier = localStorage.getItem("verifier");
    
    if (!verifier) {
        console.error("No code verifier found in localStorage");
        throw new Error("No code verifier found");
    }

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "https://project-top2000-frontend-alib.vercel.app/");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const data = await result.json();
    console.log("Spotify token response:", data);
    
    if (!result.ok) {
        console.error("Spotify token error:", data);
        throw new Error(data.error_description || data.error || "Token exchange failed");
    }
    
    const { access_token, expires_in } = data;
    
    if (!access_token) {
        console.error("No access_token in response:", data);
        throw new Error("No access token received");
    }
    
    const now = new Date();
    const expiry = now.getTime() + (expires_in || 3600) * 1000;
    localStorage.setItem("spotify_access_token", access_token);
    localStorage.setItem("spotify_token_expiry", expiry.toString());
    return access_token;
}

export function getStoredAccessToken(): string | null {
    const token = localStorage.getItem("spotify_access_token");
    const expiry = localStorage.getItem("spotify_token_expiry");
    if (!token || !expiry) return null;
    
    if (new Date().getTime() > parseInt(expiry)) {
        localStorage.removeItem("spotify_access_token");
        localStorage.removeItem("spotify_token_expiry");
        return null;
    }
    return token;
}

export function isSpotifyLoggedIn(): boolean {
    return getStoredAccessToken() !== null;
}

export async function fetchProfile(token: string): Promise<any> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

export async function createPlaylist(userId: string, accessToken: string, name: string) {
    const result = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: name,
            description: "Created via Top2000 App",
            public: false
        })
    });
    return await result.json();
}

export async function addTracksToPlaylist(playlistId: string, accessToken: string, trackUris: string[]) {
    const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uris: trackUris
        })
    });
    return await result.json();
}

export async function playSong(accessToken: string, trackUri: string, deviceId?: string) {
    const url = deviceId 
        ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
        : `https://api.spotify.com/v1/me/player/play`;
    
    const result = await fetch(url, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uris: [trackUri]
        })
    });
    // Play endpoint returns 204 No Content on success, so we don't parse JSON
    if (result.status === 204) return;
    return await result.json();
}

export async function searchTrack(accessToken: string, query: string) {
    const params = new URLSearchParams({
        q: query,
        type: "track",
        limit: "1"
    });
    const result = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return await result.json();
}

export async function getUserPlaylists(accessToken: string) {
    const result = await fetch(`https://api.spotify.com/v1/me/playlists?limit=50`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    
    if (!result.ok) {
        console.error("Error fetching playlists:", result.status, result.statusText);
        return { items: [] };
    }
    
    const data = await result.json();
    console.log("Fetched playlists:", data);
    return data;
}

export async function saveTracksToLibrary(accessToken: string, trackIds: string[]) {
    await fetch(`https://api.spotify.com/v1/me/tracks`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: trackIds })
    });
}

export async function removeTracksFromLibrary(accessToken: string, trackIds: string[]) {
    await fetch(`https://api.spotify.com/v1/me/tracks`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: trackIds })
    });
}

export async function checkSavedTracks(accessToken: string, trackIds: string[]) {
    const result = await fetch(`https://api.spotify.com/v1/me/tracks/contains?ids=${trackIds.join(',')}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return await result.json();
}

export async function transferPlaybackToDevice(accessToken: string, deviceId: string) {
    await fetch(`https://api.spotify.com/v1/me/player`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            device_ids: [deviceId],
            play: false
        })
    });
}