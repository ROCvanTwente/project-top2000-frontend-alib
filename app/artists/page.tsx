"use client";

import { Search, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Carousel from "../components/customUI/Carousel";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { Input } from "../components/ui/input";
import { getAllArtistsWithSongCount } from '../lib/mockData';
import { useState } from "react";

export default function Artist() {

    const [searchTerm, setSearchTerm] = useState('');

    const allArtists = getAllArtistsWithSongCount();
    const filteredArtists = allArtists.filter(artist =>
        artist.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const carouselSlides = [
    {
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200',
      title: 'Alle Artiesten',
      subtitle: 'Verken elke artiest in de TOP2000'
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
                    <h3>Zoeken naar Artiesten</h3>
                </div>
                <Input
                    placeholder="Zoeken op artiestennaam..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                />
                </div>

                {/* Results Count */}
                <div className="mb-6">
                <p className="text-gray-600">
                    Toon {filteredArtists.length} {filteredArtists.length === 1 ? 'artiest' : 'artiesten'}
                    {searchTerm && ` passend op "${searchTerm}"`}
                </p>
                </div>

                {/* Artists Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredArtists.map((artist) => (
                    <Link
                    key={artist.id}
                    href={`/artistsDetails/${artist.id}`}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden group relative"
                    >
                    <div className="relative aspect-square">
                        <ImageWithFallback
                            src={artist.photo}
                            alt={artist.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                    </div>
                    <div className="p-4">
                        <h4 className="mb-2 group-hover:text-red-600 transition">{artist.name}</h4>
                        <p className="text-gray-600">
                        {artist.songCount} {artist.songCount === 1 ? 'nummer' : 'nummers'} in TOP2000
                        </p>
                    </div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 bg-white rounded shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                    </div>
                    </Link>
                ))}
                </div>

                {filteredArtists.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-600">Geen artiesten gevonden passend op \"{searchTerm}\"</p>
                </div>
                )}
            </div>
        </div>
    );
}