'use client';
import Link from 'next/link';
import { ShoppingCart, User, Search, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="glass sticky top-0 z-50 w-full border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-bold italic tracking-wider">
                            SUPER<span className="text-[var(--primary-red)]">TECH</span>
                        </Link>
                    </div>

                    {/* Desktop Search */}
                    <div className="hidden md:block flex-1 max-w-md mx-8">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="ค้นหาสินค้า..."
                                className="w-full bg-[#2a2a2a] text-white border border-transparent rounded-full py-2 px-4 pl-10 focus:outline-none focus:border-[var(--primary-red)] focus:ring-1 focus:ring-[var(--primary-red)] transition-all"
                            />
                            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5 group-hover:text-white transition-colors" />
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-gray-300 hover:text-white hover:glow-text transition-colors">หน้าแรก</Link>
                        <Link href="/products" className="text-gray-300 hover:text-white hover:glow-text transition-colors">สินค้า</Link>
                        <Link href="/promotions" className="text-gray-300 hover:text-white hover:glow-text transition-colors">โปรโมชั่น</Link>

                        <div className="flex items-center space-x-4 ml-4 border-l border-gray-700 pl-4">
                            <Link href="/cart" className="text-gray-300 hover:text-[var(--primary-red)] transition-colors relative">
                                <ShoppingCart className="h-6 w-6" />
                                <span className="absolute -top-1 -right-1 bg-[var(--primary-red)] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">0</span>
                            </Link>
                            <Link href="/login" className="flex items-center space-x-2 bg-[var(--primary-red)] hover:bg-red-700 text-white px-4 py-2 rounded-full transition-all transform hover:scale-105">
                                <User className="h-4 w-4" />
                                <span>เข้าสู่ระบบ</span>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-300 hover:text-white focus:outline-none"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-[#1a1a1a] border-t border-gray-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700">หน้าแรก</Link>
                        <Link href="/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">สินค้า</Link>
                        <Link href="/promotions" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">โปรโมชั่น</Link>
                        <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-[var(--primary-red)] hover:bg-gray-900">เข้าสู่ระบบ / สมัครสมาชิก</Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
