'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useProducts } from '../context/ProductContext';
import { ShoppingCart, Filter, ArrowUpDown, Star, ChevronDown, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSearchParams } from 'next/navigation';

export default function ProductsPage() {
    const { products } = useProducts();
    const { addToCart } = useCart();
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'All');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('popular'); // popular, priceAsc, priceDesc
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Initial Load & URL Params Change
    useEffect(() => {
        if (searchParam) {
            const query = searchParam.toLowerCase();
            setSearchQuery(query);

            // INTELLIGENT SEARCH: Check if query matches a known Category or Subcategory
            let foundCategory: string | null = null;
            let foundSub: string | null = null;

            // 1. Check Subcategories first (more specific)
            for (const cat of CATEGORIES) {
                if (cat.subcategories) {
                    const matchedSub = cat.subcategories.find(sub => sub.toLowerCase() === query);
                    if (matchedSub) {
                        foundCategory = cat.name;
                        foundSub = matchedSub;
                        break;
                    }
                }
            }

            // 2. If not found, check Main Categories
            if (!foundCategory) {
                const matchedCat = CATEGORIES.find(c => c.name.toLowerCase() === query);
                if (matchedCat) {
                    foundCategory = matchedCat.name;
                }
            }

            if (foundCategory) {
                // If matched known category structure, Switch to that view!
                setSelectedCategory(foundCategory);
                setSelectedSubCategory(foundSub);
                setExpandedCategory(foundCategory);
            } else {
                // If generic search
                setSelectedCategory('All');
                setSelectedSubCategory(null);
            }

        } else if (categoryParam) {
            setSearchQuery('');
            setSelectedCategory(categoryParam);
            setSelectedSubCategory(null);

            const match = CATEGORIES.find(c => c.name === categoryParam);
            if (match && match.subcategories) {
                setExpandedCategory(categoryParam);
            }
        } else {
            setSearchQuery('');
            setSelectedCategory('All');
            setSelectedSubCategory(null);
        }
    }, [categoryParam, searchParam]);

    const CATEGORIES = [
        {
            name: 'โน๊ตบุ๊ค',
            icon: '💻',
            subcategories: ['โน๊ตบุ๊คเล่นเกม', 'โน๊ตบุ๊คบางเบา', 'โน๊ตบุ๊คสำหรับองค์กร']
        },
        {
            name: 'จอมอนิเตอร์',
            icon: '🖥️',
            subcategories: ['49 นิ้ว', '34 นิ้ว', '32 นิ้ว', '27 นิ้ว', '24 นิ้ว']
        },
        { name: 'แท็บเล็ต', icon: '📱' },
        {
            name: 'ซีพียู',
            icon: '🧠',
            subcategories: ['INTEL', 'AMD']
        },
        {
            name: 'การ์ดจอ',
            icon: '🎮',
            subcategories: ['INTEL ARC', 'AMD RADEON', 'NVIDIA GEFORCE']
        },
        {
            name: 'เมนบอร์ด',
            icon: '🔌',
            subcategories: ['INTEL', 'AMD']
        },
        {
            name: 'แรม',
            icon: '💾',
            subcategories: ['RAM NOTEBOOK', 'DDR5', 'DDR4']
        },
        {
            name: 'ฮาร์ดดิสก์ และ เอสเอสดี',
            icon: '💽',
            subcategories: ['การ์ด M.2', 'SSD', 'HDD']
        },
        {
            name: 'พาวเวอร์ซัพพลาย',
            icon: '⚡',
            subcategories: ['1000W+', '850W', '750W', '650W']
        },
        {
            name: 'เคส',
            icon: '🕋',
            subcategories: ['Full-Tower', 'Mid-Tower', 'Mini-Tower']
        },
        {
            name: 'ชุดระบายความร้อน',
            icon: '❄️',
            subcategories: ['ชุดน้ำปิด', 'พัดลมซีพียู', 'พัดลมเคส']
        },
        { name: 'คีย์บอร์ด', icon: '⌨️' },
        { name: 'เมาส์', icon: '🖱️' },
        { name: 'ลำโพง', icon: '🔊' },
    ];

    const handleCategoryClick = (categoryName: string) => {
        setSelectedCategory(categoryName);
        setSelectedSubCategory(null);
        setSearchQuery(''); // Clear search when manually browsing
        if (CATEGORIES.find(c => c.name === categoryName)?.subcategories) {
            setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
        }
    };

    const handleSubCategoryClick = (categoryName: string, subCategoryName: string) => {
        setSelectedCategory(categoryName);
        setSelectedSubCategory(subCategoryName);
        setSearchQuery(''); // Clear search when manually browsing
    };

    // Filter and Sort
    const filteredProducts = useMemo(() => {
        let res = [...products];

        // 1. Filter by Search Query (Global Text Search if no category selected via logic)
        if (searchQuery && selectedCategory === 'All') {
            const lowerQuery = searchQuery.toLowerCase();
            res = res.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.category.toLowerCase().includes(lowerQuery) ||
                p.description.toLowerCase().includes(lowerQuery)
            );
        } else {
            // 2. Filter by Main Category (If selected via click OR intelligent search)
            if (selectedCategory !== 'All') {
                res = res.filter(p => p.category === selectedCategory);
            }

            // 3. Filter by Sub Category
            if (selectedSubCategory) {
                const lowerSub = selectedSubCategory.toLowerCase();
                res = res.filter(p =>
                    p.name.toLowerCase().includes(lowerSub) ||
                    p.description.toLowerCase().includes(lowerSub)
                );
            }
        }

        // Sort
        if (sortBy === 'priceAsc') {
            res.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'priceDesc') {
            res.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'popular') {
            res.sort((a, b) => {
                const soldA = a.sold ? parseFloat(a.sold.replace('k', '000')) : 0;
                const soldB = b.sold ? parseFloat(b.sold.replace('k', '000')) : 0;
                return soldB - soldA;
            });
        }

        return res;
    }, [selectedCategory, selectedSubCategory, searchQuery, sortBy, products]);

    return (
        <div className="bg-[#f8f9fa] min-h-screen pb-20 pt-4 md:pt-8 font-sans">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2 line-clamp-1">
                            {searchQuery && selectedCategory === 'All' ? `ผลการค้นหา: "${searchQuery}"` :
                                (selectedCategory === 'All' ? 'สินค้าทั้งหมด' : selectedCategory)
                            }
                            {selectedSubCategory && <span className="text-[var(--primary-orange)]">: {selectedSubCategory}</span>}
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500">เลือกซื้อสินค้าไอทีคุณภาพจาก SuperTech</p>
                    </div>

                    <div className="flex w-full md:w-auto gap-2">
                        {/* Mobile Filter Button */}
                        <button
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="lg:hidden flex-1 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center justify-center gap-2"
                        >
                            <Filter className="w-4 h-4" /> กรองสินค้า
                        </button>

                        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex-1 md:flex-none justify-center">
                            <button
                                onClick={() => setSortBy('popular')}
                                className={`flex-1 md:flex-none px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap ${sortBy === 'popular' ? 'bg-[var(--primary-orange)] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                ยอดนิยม
                            </button>
                            <button
                                onClick={() => setSortBy('priceAsc')}
                                className={`flex-1 md:flex-none px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap ${sortBy === 'priceAsc' ? 'bg-[var(--primary-orange)] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                ราคาต่ำ-สูง
                            </button>
                            <button
                                onClick={() => setSortBy('priceDesc')}
                                className={`flex-1 md:flex-none px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap ${sortBy === 'priceDesc' ? 'bg-[var(--primary-orange)] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                ราคาสูง-ต่ำ
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">

                    {/* Sidebar / Mobile Drawer */}
                    {/* Overlay */}
                    {isMobileFilterOpen && (
                        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden user-select-none" onClick={() => setIsMobileFilterOpen(false)} />
                    )}

                    <div className={`
                        fixed lg:static inset-y-0 left-0 w-[280px] lg:w-auto bg-white lg:bg-transparent z-50 lg:z-auto transition-transform duration-300 ease-in-out
                        ${isMobileFilterOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
                    `}>
                        <div className="h-full lg:h-auto overflow-y-auto bg-white lg:bg-transparent lg:rounded-xl lg:shadow-sm lg:border lg:border-gray-100 lg:sticky lg:top-28 lg:max-h-[70vh] custom-scrollbar">
                            <div className="flex items-center justify-between lg:justify-start gap-2 font-bold text-lg text-gray-800 border-b lg:border-none sticky top-0 bg-white z-10 p-4 lg:px-6 lg:py-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-[var(--primary-orange)]" />
                                    หมวดหมู่สินค้า
                                </div>
                                <button onClick={() => setIsMobileFilterOpen(false)} className="lg:hidden p-2 text-gray-400">
                                    <ChevronRight className="w-5 h-5 rotate-180" />
                                </button>
                            </div>
                            <div className="p-4 lg:px-6 lg:pb-24 lg:pt-2 space-y-1">
                                <button
                                    onClick={() => {
                                        setSelectedCategory('All');
                                        setSelectedSubCategory(null);
                                        setIsMobileFilterOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${selectedCategory === 'All' ? 'bg-orange-50 text-[var(--primary-orange)] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <span className="text-lg">🏠</span> สินค้าทั้งหมด
                                </button>

                                {CATEGORIES.map((cat, idx) => (
                                    <div key={idx}>
                                        <button
                                            onClick={() => handleCategoryClick(cat.name)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${selectedCategory === cat.name ? 'bg-orange-50 text-[var(--primary-orange)] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{cat.icon}</span>
                                                {cat.name}
                                            </div>
                                            {cat.subcategories && (
                                                <ChevronDown className={`w-4 h-4 transition-transform ${expandedCategory === cat.name ? 'rotate-180' : ''}`} />
                                            )}
                                        </button>

                                        {cat.subcategories && expandedCategory === cat.name && (
                                            <div className="ml-8 space-y-1 border-l-2 border-gray-100 pl-2 my-1 animate-in slide-in-from-top-1">
                                                {cat.subcategories.map(sub => (
                                                    <button
                                                        key={sub}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSubCategoryClick(cat.name, sub);
                                                            setIsMobileFilterOpen(false);
                                                        }}
                                                        className={`w-full text-left px-2 py-1.5 rounded text-sm ${selectedSubCategory === sub ? 'text-[var(--primary-orange)] font-bold' : 'text-gray-500 hover:text-gray-800'}`}
                                                    >
                                                        {sub}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-[var(--primary-orange)] hover:shadow-lg transition-all duration-300 group flex flex-col relative">
                                    <Link href={`/product/${product.id}`} className="absolute inset-0 z-10" />

                                    <div className="aspect-square p-2 md:p-4 bg-gray-50 relative overflow-hidden">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                                        />
                                        {product.discount && (
                                            <span className="absolute top-1 right-1 md:top-2 md:right-2 bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full shadow-sm">
                                                {product.discount}
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-3 md:p-4 flex flex-col flex-1">
                                        <div className="text-[10px] md:text-xs text-gray-400 mb-1 truncate">{product.category}</div>
                                        <h3 className="font-bold text-gray-800 line-clamp-2 text-xs md:text-sm mb-2 group-hover:text-[var(--primary-orange)] transition-colors h-8 md:h-10">
                                            {product.name}
                                        </h3>

                                        <div className="mt-auto">
                                            <div className="flex flex-col mb-2 md:mb-3">
                                                <span className="text-sm md:text-lg font-bold text-[var(--primary-orange)]">฿{product.price.toLocaleString()}</span>
                                                {product.originalPrice && product.originalPrice > product.price && (
                                                    <span className="text-[10px] md:text-xs text-gray-400 line-through">฿{product.originalPrice.toLocaleString()}</span>
                                                )}
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addToCart(product);
                                                }}
                                                className="w-full bg-gray-900 text-white text-xs md:text-sm font-bold py-1.5 md:py-2 rounded-lg hover:bg-[var(--primary-orange)] transition-colors flex items-center justify-center gap-1 md:gap-2 active:scale-95 z-20 relative shadow-sm"
                                            >
                                                <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">เพิ่มใส่ตะกร้า</span><span className="md:hidden">ซื้อเลย</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500 text-lg">ไม่พบสินค้าในหมวดหมู่นี้</p>
                                <button onClick={() => setSelectedCategory('All')} className="text-[var(--primary-orange)] mt-2 hover:underline">
                                    ดูสินค้าทั้งหมด
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
