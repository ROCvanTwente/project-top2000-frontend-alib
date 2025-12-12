"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import { FaSpotify } from 'react-icons/fa';
import { useAuth } from '../auth/AuthProvider';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { getYearsList, getDJList } from '../lib/mockData';

interface HeaderProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  onSpotifyClick: () => void;
}

function AuthSpotifyAndUser({ onSpotifyClick }: { onSpotifyClick: () => void }) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="flex items-center space-x-2">
      {isAuthenticated && (
        <button
          onClick={onSpotifyClick}
          aria-label="Connect Spotify"
          className="p-2 flex items-center justify-center text-[#1ED760] hover:text-[#17c44f] transition transform duration-150 ease-in-out hover:scale-105 cursor-pointer"
          title="Connect Spotify"
        >
          <FaSpotify className="h-5 w-5" />
        </button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer">
            <User className="h-5 w-5" />
            <ChevronDown className="ml-1 h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-red-100">
          {!isAuthenticated ? (
            <>
              <DropdownMenuItem asChild>
                <Link href="/login">Login</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/register">Register</Link>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => logout()}>
                <div className="flex items-center space-x-2"><LogOut className="h-4 w-4" /><span>Logout</span></div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function Header({ selectedYear, onYearChange, onSpotifyClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const years = getYearsList();
  const djList = getDJList();

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-red-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Image
              src="/images/logo_v2.png"
              alt="TOP2000 logo"
              width={140}
              height={48}
              className="object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/" className="px-3 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
              Home
            </Link>
            <Link href={`/top2000/`} className="px-3 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
              Top2000
            </Link>
            <Link href="/artists" className="px-3 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
              Artists
            </Link>
            <Link href="/songPage" className="px-3 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
              Songs
            </Link>
            <Link href="/statistics" className="px-3 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
              Statistics
            </Link>
            <Link href="/history" className="px-3 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
              History
            </Link>
            
            {/* Bart Arends DJ Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center px-3 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
                Bart Arends <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-red-100">
                {djList.map((dj) => (
                  <DropdownMenuItem key={dj.name} asChild>
                    <a href={dj.url} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                      {dj.name}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/faq" className="px-3 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
              FAQ
            </Link>
            <Link href="/contact" className="px-3 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
              Contact
            </Link>
          </nav>

          {/* Year Selector & Spotify/User */}
          <div className="hidden md:flex items-center space-x-3">

            {/* Spotify connect only when authenticated */}
            {/** will render a compact spotify icon button when logged in */}
            {/** user prop coming from AuthProvider */}
            {/** render user dropdown */}
            <AuthSpotifyAndUser onSpotifyClick={onSpotifyClick} />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-neutral-700 hover:text-red-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-red-100 bg-white/95 backdrop-blur-md">
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto px-3 py-3">
            <nav className="flex flex-col gap-1 text-sm">
              <Link href="/" className="block px-2 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href={`/top2000/${selectedYear}`} className="px-3 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
                Top2000
            </Link>
              <Link href="/artists" className="block px-2 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50" onClick={() => setMobileMenuOpen(false)}>
                Artists
              </Link>
              <Link href="/songs" className="block px-2 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50" onClick={() => setMobileMenuOpen(false)}>
                Songs
              </Link>
              <Link href="/statistics" className="block px-2 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50" onClick={() => setMobileMenuOpen(false)}>
                Statistics
              </Link>
              <Link href="/history" className="block px-2 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50" onClick={() => setMobileMenuOpen(false)}>
                History
              </Link>
              <Link href="/faq" className="block px-2 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50" onClick={() => setMobileMenuOpen(false)}>
                FAQ
              </Link>
              <Link href="/contact" className="block px-2 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </Link>
            </nav>

            <div className="mt-3 border-t border-red-100 pt-3">
              {isAuthenticated && (
                <button
                  onClick={() => { onSpotifyClick(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-2 py-2 rounded-md text-[#1ED760] hover:bg-green-50 transition-colors duration-150 ease-in-out hover:text-[#17c44f] cursor-pointer text-sm"
                >
                  <FaSpotify className="h-5 w-5" />
                  Connect Spotify
                </button>
              )}

              <div className="mt-2 grid gap-2">
                {!isAuthenticated ? (
                  <>
                    <Link href="/login" className="block px-2 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50 text-sm" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                    <Link href="/register" className="block px-2 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50 text-sm" onClick={() => setMobileMenuOpen(false)}>
                      Register
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/profile" className="block px-2 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50 text-sm" onClick={() => setMobileMenuOpen(false)}>
                      Profile
                    </Link>
                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-left px-2 py-2 rounded-md text-neutral-700 hover:text-red-600 hover:bg-red-50 text-sm">
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}