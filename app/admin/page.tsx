"use client";

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useAuth } from '../auth/AuthProvider';
import Carousel from '../components/customUI/Carousel';
import { Users, Music, ArrowUpRight } from 'lucide-react';

export default function AdminHome() {
  const { initialized, isAdmin } = useAuth();

  if (!initialized) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-700">Bezig met laden...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return notFound();
  }

  const carouselSlides = [
    {
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200",
      title: "Beheerder",
      subtitle: "Beheer alle TOP2000 inhoud",
    },
  ];

  return (
    <div>
      <Carousel slides={carouselSlides} showBottomBar={false} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            href="/admin/artists"
            className="relative bg-white p-7 rounded-lg hover:shadow-xl transition-all duration-300 group overflow-hidden border border-neutral-200 hover:border-purple-300 hover:-translate-y-2 min-h-[200px]"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1649197506484-16a3a3b61f7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFydGlzdHMlMjBjb25jZXJ0fGVufDF8fHx8MTc2NDc0ODIxOXww&ixlib=rb-4.1.0&q=80&w=1080)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/70 to-purple-700/70 group-hover:from-purple-600/80 group-hover:to-purple-700/80 transition-all duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-white transition-colors">Artiesten beheren</h3>
              <p className="text-purple-100 transition-colors text-sm">
                Bewerk biografie, Wikipedia links en foto's
              </p>
            </div>
            <div className="absolute bottom-4 right-4 z-10 w-8 h-8 bg-white rounded flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
              <ArrowUpRight className="h-4 w-4 text-purple-600" />
            </div>
          </Link>

          <Link
            href="/admin/songs"
            className="relative bg-white p-7 rounded-lg hover:shadow-xl transition-all duration-300 group overflow-hidden border border-neutral-200 hover:border-orange-300 hover:-translate-y-2 min-h-[200px]"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1631692362908-7fcbc77c5104?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZHMlMjBjb2xsZWN0aW9ufGVufDF8fHx8MTc2NDYzOTQ0MHww&ixlib=rb-4.1.0&q=80&w=1080)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/70 to-orange-600/70 group-hover:from-orange-500/80 group-hover:to-orange-600/80 transition-all duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Music className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-white transition-colors">Nummers beheren</h3>
              <p className="text-orange-100 transition-colors text-sm">
                Bewerk lyrics, albumafbeelding en YouTube link
              </p>
            </div>
            <div className="absolute bottom-4 right-4 z-10 w-8 h-8 bg-white rounded flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
              <ArrowUpRight className="h-4 w-4 text-orange-600" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
