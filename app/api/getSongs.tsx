"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, parseApiError } from "../../lib/api";

type ApiError = {
    status?: number;
    message?: string;
    errors?: Record<string, string[]>;
}

type Song = {
    id: string;
    title: string;
    artist: string;
    year: number;
    rank: number;
    image: string;
}


const getSongs = async (year: number) => {
    const res = await apiFetch(`/songs/${year}`);
    if (!res.ok) {
        const parsed = await parseApiError(res);
        throw parsed as ApiError;
    }

    const data = await res.json();
    return data as Song[];
}

export { getSongs };
