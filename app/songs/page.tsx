"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import Carousel from "../components/customUI/Carousel";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { Input } from "../components/ui/input";
import { useState } from "react";
import { allMockSongs } from "../lib/mockData";

export default function Songs() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSongs = allMockSongs.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const carouselSlides = [
        {
            image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
            title: 'All Songs',
            subtitle: 'Browse every song in the TOP2000'
        }
    ];
    return (
        <div>
            <Carousel slides={carouselSlides} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex items-center mb-4">
                        <Search className="h-5 w-5 mr-2 text-gray-600" />
                        <h3>Search Songs</h3>
                    </div>
                    <Input
                        placeholder="Search by song title or artist..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        Showing {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'}
                        {searchTerm && ` matching "${searchTerm}"`}
                    </p>
                </div>

                {/* Songs List */}
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
                    {filteredSongs.map((song) => (
                        <Link
                            key={song.id}
                            href={`/songDetails/${song.id}`}
                            className="flex items-center space-x-4 p-4 hover:bg-gray-50 transition"
                        >
                            <ImageWithFallback
                                src={song.albumImage}
                                alt={song.title}
                                className="w-16 h-16 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="mb-1 truncate hover:text-red-600 transition">
                                    {song.title}
                                </h4>
                                <p className="text-gray-600 truncate">{song.artist}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-600">Released: {song.year}</p>
                                <p className="text-gray-500">
                                    {song.history.length} {song.history.length === 1 ? 'year' : 'years'} in chart
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredSongs.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-600">No songs found matching "{searchTerm}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}