'use client';
import { ArrowRight, Zap, Star, Monitor, Smartphone, Cpu, Headphones, Gift, ShieldCheck, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from './context/CartContext';
import { useProducts } from './context/ProductContext'; // Changed source
import HeroSection from './components/home/HeroSection';

export default function Home() {
  const { addToCart } = useCart();
  const { products, loading } = useProducts();

  // Filter products dynamically
  const flashSaleProducts = products.filter(p => p.discount && p.discount.length > 0).slice(0, 4);
  // Filter recommended hardware (CPU, RAM, Mainboard)
  const recommendedHardware = products.filter(p =>
    ['ซีพียู', 'แรม', 'เมนบอร์ด'].includes(p.category || '')
  ).slice(0, 8); // Show top 8 items

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20 font-sans">

      {/* 1. Hero Section (Main Only) */}
      <div className="container mx-auto px-4 py-4 md:py-6 max-w-[1800px]">
        <div className="w-full aspect-[16/9] md:aspect-[1920/600] rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-2xl relative group bg-black">
          <HeroSection />
        </div>
      </div>

      {/* 2. New Arrivals (Horizontal Scroll) */}
      <div className="container mx-auto px-4 max-w-[1200px] mb-8 md:mb-12">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
            <span className="w-1.5 h-6 md:h-8 bg-[var(--primary-orange)] rounded-full"></span>
            สินค้ามาใหม่
          </h2>
          <Link href="/products" className="text-sm font-bold text-gray-500 hover:text-[var(--primary-orange)] flex items-center gap-1 transition-colors">
            ดูทั้งหมด <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative">
          <div className="overflow-x-auto flex gap-3 md:gap-5 pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x">
            {products.slice(0, 10).map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="min-w-[140px] md:min-w-[180px] flex flex-col group snap-start bg-white rounded-xl border border-gray-100 p-2 md:p-3 hover:shadow-lg transition-all"
              >
                <div className="aspect-square rounded-lg bg-gray-50 mb-3 relative overflow-hidden">
                  <div className="absolute top-1 left-1 bg-[#10b981] text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-sm z-10 shadow-sm">
                    NEW
                  </div>
                  <img src={p.image} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="text-[9px] text-gray-400 mb-1 line-clamp-1">{p.category}</div>
                  <h3 className="text-xs md:text-sm font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-[var(--primary-orange)] transition-colors min-h-[2.5em] leading-relaxed">
                    {p.name}
                  </h3>
                  <div className="mt-auto">
                    <div className="mb-2">
                      <span className="text-sm md:text-base font-black text-[var(--primary-red)]">฿{p.price.toLocaleString()}</span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="ml-1 text-[9px] text-gray-400 line-through">฿{p.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(p);
                      }}
                      className="w-full bg-[#111827] text-white text-[10px] md:text-xs font-bold py-2 md:py-2.5 rounded-lg hover:bg-black transition-all shadow-sm flex items-center justify-center"
                    >
                      เพิ่มใส่ตะกร้า
                    </button>
                  </div>
                </div>
              </Link>
            ))}

            {/* View More Card */}
            <Link href="/products" className="min-w-[140px] md:min-w-[180px] flex flex-col items-center justify-center snap-start bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-[var(--primary-orange)] hover:bg-orange-50 transition-all text-gray-400 hover:text-[var(--primary-orange)] group">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <ArrowRight className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs md:text-sm">ดูสินค้าทั้งหมด</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Modern Grid Product Showcase */}
      <div className="container mx-auto px-4 max-w-[1200px] space-y-20">

        {/* Flash Sale Section */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-1 flex items-center gap-2">
                <Zap className="fill-red-600 text-red-600 w-8 h-8 md:w-10 md:h-10 animate-bounce" />
                FLASH SALE
              </h2>
              <p className="text-gray-500 text-sm md:text-base">ดีลเด็ดด่วนจี๋ สินค้ามีจำนวนจำกัด!</p>
            </div>
            <Link href="/flash-sale" className="hidden md:flex items-center gap-2 font-bold text-red-600 hover:gap-4 transition-all">ดูทั้งหมด <ArrowRight className="w-5 h-5" /></Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {flashSaleProducts.map((p) => (
              <Link href={`/product/${p.id}`} key={p.id} className="bg-white rounded-xl md:rounded-2xl p-2 md:p-3 relative group shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-red-100 overflow-hidden">
                <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-md shadow-md uppercase">ลด {p.discount}</div>
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 mb-2 md:mb-3 p-2 md:p-4 relative">
                  <img src={p.image} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                  {/* Overlay Add to Cart Button - Visible on Desktop hover */}
                  <button onClick={(e) => { e.preventDefault(); addToCart(p); }} className="absolute bottom-2 right-2 bg-black text-white p-2 md:p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 shadow-lg hover:bg-red-600 hidden md:block">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1 px-1">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{p.category}</div>
                  <h3 className="text-xs md:text-base font-bold text-gray-900 line-clamp-1 group-hover:text-red-600 transition-colors">{p.name}</h3>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                    <div className="flex flex-col">
                      <span className="text-sm md:text-lg font-black text-red-600 leading-none">฿{p.price.toLocaleString()}</span>
                      <span className="text-[9px] md:text-[10px] text-gray-400 line-through">฿{p.originalPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Big Feature Banner */}
        <div className="rounded-[2rem] overflow-hidden relative h-[300px] md:h-[500px] group shadow-lg">
          <img src="/banners/hero_promo_v2.png" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          {/* Text overlay removed as the new banner has embedded text */}
          <div className="absolute inset-x-0 bottom-8 flex justify-center">
            <button className="bg-[var(--primary-orange)] text-white px-8 py-3 rounded-full font-bold text-base hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30">
              Shop Now
            </button>
          </div>
        </div>

        {/* Recommended Hardware (CPU, RAM, Mainboard) */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-2">จัดสเปคคอมเทพ</h2>
            <p className="text-gray-500">รวมไอเทมชิ้นส่วนคอมพิวเตอร์ยอดนิยม CPU RAM Mainboard</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4">
            {recommendedHardware.map((p) => (
              <Link key={p.id} href={`/product/${p.id}`} className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl hover:shadow-lg transition-all flex flex-col group cursor-pointer h-full border border-transparent hover:border-gray-200">
                <div className="aspect-square rounded-lg md:rounded-xl p-2 md:p-3 mb-2 md:mb-3 relative bg-gray-50">
                  <img src={p.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="mt-auto">
                  <div className="text-[9px] md:text-[10px] text-gray-400 mb-0.5">{p.category}</div>
                  <h4 className="font-bold text-gray-900 text-xs md:text-sm line-clamp-2 min-h-[2.5rem] mb-1">{p.name}</h4>
                  <p className="text-red-600 font-bold text-base md:text-lg mb-2">฿{p.price.toLocaleString()}</p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(p);
                    }}
                    className="w-full bg-gray-900 text-white text-[10px] md:text-xs font-bold py-1.5 md:py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 active:scale-95"
                  >
                    เพิ่มใส่ตะกร้า
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
