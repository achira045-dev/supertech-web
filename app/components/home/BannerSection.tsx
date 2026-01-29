'use client';
import Link from 'next/link';

interface Banner {
    image: string;
    link: string;
    alt?: string;
}

interface BannerSectionProps {
    banners: Banner[];
    layout?: 'split' | 'grid-3' | 'grid-4' | 'single' | 'grid-2-1'; // Various layouts
    className?: string;
}

export default function BannerSection({ banners, layout = 'split', className = '' }: BannerSectionProps) {

    // Layout Classes
    const gridClasses = {
        'single': 'grid-cols-1',
        'split': 'grid-cols-1 md:grid-cols-2',
        'grid-3': 'grid-cols-1 md:grid-cols-3',
        'grid-4': 'grid-cols-2 md:grid-cols-4',
        'grid-2-1': 'grid-cols-1 md:grid-cols-3', // Special case logic needed or just use grid-3 with spans
    };

    return (
        <div className={`container mx-auto px-4 my-8 ${className}`}>
            <div className={`grid gap-4 ${gridClasses[layout]}`}>
                {banners.map((banner, index) => {
                    // Special logic for 'grid-2-1' layout (First item spans 2 cols in a 3-col grid)
                    const spanClass = layout === 'grid-2-1' && index === 0 ? 'md:col-span-2' : '';

                    return (
                        <Link
                            key={index}
                            href={banner.link}
                            className={`relative rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-all ${spanClass}`}
                        >
                            <div className="overflow-hidden h-full min-h-[150px] md:min-h-[200px]">
                                <img
                                    src={banner.image}
                                    alt={banner.alt || `Promo Banner ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
