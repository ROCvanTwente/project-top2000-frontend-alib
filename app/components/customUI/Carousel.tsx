"use client";
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Music, Heart, Sparkles } from 'lucide-react';
import { ImageWithFallback } from '../ImageWithFallback';

import { getSongs } from '../../api/getSongs';

interface CarouselSlide {
  image: string;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: string;
}

interface CarouselProps {
  slides: CarouselSlide[];
}

export default function Carousel({ slides }: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'trophy':
        return <Trophy className="h-6 w-6" />;
      case 'music':
        return <Music className="h-6 w-6" />;
      case 'heart':
        return <Heart className="h-6 w-6" />;
      default:
        return <Sparkles className="h-6 w-6" />;
    }
  };

  return (
    <div className="relative w-full h-[320px] md:h-[420px] lg:h-[480px] overflow-hidden bg-gradient-to-br from-neutral-900 to-red-900">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ImageWithFallback
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-red-900/80 to-neutral-900/90 flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-5xl">
              {/* Large Title */}
              <h1 className="mb-8 text-white drop-shadow-2xl tracking-tight leading-none font-black text-5xl md:text-7xl lg:text-8xl">
                {slide.title}
              </h1>
              
              {/* Subtitle */}
              {slide.subtitle && (
                <p className="text-lg md:text-xl lg:text-2xl text-neutral-100 drop-shadow-lg max-w-3xl mx-auto leading-relaxed">
                  {slide.subtitle}
                </p>
              )}
              
              {/* Stats Bar */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-white/90">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold">2000 Songs</span>
                </div>
                <div className="w-px h-4 bg-white/30" />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <span className="text-sm font-semibold">1000+ Artists</span>
                </div>
                <div className="w-px h-4 bg-white/30" />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  <span className="text-sm font-semibold">25+ Years</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2.5 rounded-md transition-all duration-300 hover:scale-110 border border-white/30"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2.5 rounded-md transition-all duration-300 hover:scale-110 border border-white/30"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white w-8' 
                : 'bg-white/40 w-1.5 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}