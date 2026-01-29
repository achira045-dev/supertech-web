'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const CAROUSEL_SLIDES = [
    { id: 1, image: '/banners/hero_slide_1.jpg', link: '/products' },
    { id: 2, image: '/banners/hero_slide_2.jpg', link: '/products' },
    { id: 3, image: '/banners/hero_slide_3.jpg', link: '/products' },
    { id: 4, image: '/banners/hero_slide_4.png', link: '/products' },
    { id: 5, image: '/banners/hero_slide_5.png', link: '/products' },
];

export default function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
    };

    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-full group">
            {/* Slides */}
            {CAROUSEL_SLIDES.map((slide, index) => (
                <Link
                    key={slide.id}
                    href={slide.link}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <img
                        src={slide.image}
                        alt="Promotional Banner"
                        className="w-full h-full object-cover"
                    />
                </Link>
            ))}

            {/* Navigation Arrows */}
            <button
                onClick={(e) => { e.preventDefault(); prevSlide(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>
            <button
                onClick={(e) => { e.preventDefault(); nextSlide(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
            >
                <ChevronRight className="w-8 h-8" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                {CAROUSEL_SLIDES.map((_, index) => (
                    <button
                        key={index}
                        onClick={(e) => { e.preventDefault(); setCurrentSlide(index); }}
                        className={`h-2 rounded-full transition-all duration-300 shadow-sm ${index === currentSlide ? 'w-10 bg-red-600' : 'w-2 bg-white/70 hover:bg-white'}`}
                    />
                ))}
            </div>
        </div>
    );
}
