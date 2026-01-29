'use client';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
}

interface CategoryShowcaseProps {
    title: string;
    bannerImage: string;
    bannerLink: string;
    products: Product[];
    colorTheme?: string; // Hex color or class
}

export default function CategoryShowcase({ title, bannerImage, bannerLink, products, colorTheme = 'var(--primary-orange)' }: CategoryShowcaseProps) {
    const { addToCart } = useCart();

    return (
        <div className="container mx-auto px-4 my-12">
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-1.5 h-8 rounded-full" style={{ backgroundColor: colorTheme }}></span>
                    {title}
                </h2>
                <Link href={bannerLink} className="text-sm font-medium text-gray-500 hover:text-[var(--primary-orange)] transition-colors">
                    ดูทั้งหมด &gt;
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
                {/* Large Banner (Left) */}
                <div className="lg:col-span-1 hidden lg:block rounded-xl overflow-hidden relative group h-full min-h-[600px]">
                    <Link href={bannerLink} className="absolute inset-0">
                        <img
                            src={bannerImage}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                            <h3 className="text-white text-2xl font-bold mb-2">{title}</h3>
                            <button className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm w-fit hover:bg-[var(--primary-orange)] hover:text-white transition-colors">
                                ช้อปเลย
                            </button>
                        </div>
                    </Link>
                </div>

                {/* Product Grid (Right) */}
                <div className="col-span-1 lg:col-span-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.slice(0, 8).map((product) => (
                        <div key={product.id} className="bg-white border border-gray-100 rounded-xl p-3 hover:border-[var(--primary-orange)] hover:shadow-lg transition-all group flex flex-col relative">
                            <Link href={`/product/${product.id}`} className="absolute inset-0 z-10" />

                            <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-50 p-2">
                                <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                            </div>

                            <div className="mt-auto pointer-events-none">
                                <div className="text-[10px] text-gray-400 mb-1 line-clamp-1">{product.category}</div>
                                <h4 className="font-bold text-gray-800 line-clamp-2 text-sm mb-2">{product.name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-[var(--primary-orange)] font-bold text-lg">฿{product.price.toLocaleString()}</span>
                                    {product.originalPrice && (
                                        <span className="text-xs text-gray-400 line-through">฿{product.originalPrice.toLocaleString()}</span>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    addToCart(product);
                                }}
                                className="w-full z-20 bg-gray-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-[var(--primary-orange)] transition-colors flex items-center justify-center gap-1 active:scale-95 mt-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-200 absolute bottom-3 left-3 right-3 w-[calc(100%-1.5rem)] shadow-lg"
                            >
                                <ShoppingCart className="w-3 h-3" /> ใส่ตะกร้า
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
