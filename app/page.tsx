'use client';
import { ArrowRight, Star, Clock, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const categories = [
    { name: 'Gaming Mouse', icon: '🖱️' },
    { name: 'Keyboard', icon: '⌨️' },
    { name: 'Headset', icon: '🎧' },
    { name: 'Monitor', icon: '🖥️' },
    { name: 'Gaming Chair', icon: '💺' },
    { name: 'Console', icon: '🎮' },
  ];

  const flashSaleProducts = [
    { id: 1, name: 'Pro Wireless Mouse', price: '2,590', originalPrice: '3,290', discount: '-21%', image: 'https://placehold.co/400x400/1a1a1a/ff0033?text=Mouse' },
    { id: 2, name: 'Mechanical Keyboard RGB', price: '4,500', originalPrice: '5,900', discount: '-24%', image: 'https://placehold.co/400x400/1a1a1a/ff0033?text=Keyboard' },
    { id: 3, name: 'Surround Sound Headset', price: '1,990', originalPrice: '2,590', discount: '-23%', image: 'https://placehold.co/400x400/1a1a1a/ff0033?text=Headset' },
    { id: 4, name: '4K 144Hz Monitor', price: '12,900', originalPrice: '15,900', discount: '-18%', image: 'https://placehold.co/400x400/1a1a1a/ff0033?text=Monitor' },
  ];

  const newArrivals = [
    { id: 5, name: 'RTX 4090 Gaming OC', price: '65,000', rating: 5, image: 'https://placehold.co/400x400/1a1a1a/00f2ff?text=GPU' },
    { id: 6, name: 'Intel Core i9-14900K', price: '24,500', rating: 5, image: 'https://placehold.co/400x400/1a1a1a/00f2ff?text=CPU' },
    { id: 7, name: 'Gaming Laptop Z1', price: '45,900', rating: 4, image: 'https://placehold.co/400x400/1a1a1a/00f2ff?text=Laptop' },
    { id: 8, name: 'Stream Deck XL', price: '8,900', rating: 5, image: 'https://placehold.co/400x400/1a1a1a/00f2ff?text=Stream+Deck' },
  ];

  return (
    <div className="space-y-12 pb-20">

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10"></div>
        <div className="absolute inset-0 bg-[url('https://placehold.co/1920x600/1a1a1a/333333?text=Hero+Banner')] bg-cover bg-center opacity-50"></div>
        <div className="container relative z-20 text-center px-4">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-6">
            LEVEL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-red)] to-[var(--neon-blue)]">UP</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            สัมผัสประสบการณ์เกมมิ่งที่เหนือกว่าด้วยอุปกรณ์ระดับ Pro Player
          </p>
          <button className="bg-[var(--primary-red)] hover:bg-red-600 text-white text-xl font-bold py-3 px-8 rounded-full transform hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,0,51,0.5)]">
            ช้อปเลย
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="w-2 h-8 bg-[var(--primary-red)] rounded-full"></span>
          หมวดหมู่สินค้า
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, idx) => (
            <div key={idx} className="glass p-6 rounded-xl flex flex-col items-center justify-center hover:border-[var(--primary-red)] cursor-pointer transition-all hover:-translate-y-1 group">
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="font-medium text-gray-300 group-hover:text-white">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-2 italic">
            <Zap className="text-[var(--primary-red)] fill-current" />
            FLASH <span className="text-[var(--primary-red)]">SALE</span>
          </h2>
          <div className="flex items-center gap-2 text-[var(--primary-red)] border border-[var(--primary-red)] px-4 py-1 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">02:15:45</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashSaleProducts.map((product) => (
            <div key={product.id} className="bg-[#1f1f1f] rounded-xl overflow-hidden hover:shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all group border border-transparent hover:border-gray-700">
              <div className="relative">
                <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
                <span className="absolute top-3 right-3 bg-[var(--primary-red)] text-white text-sm font-bold px-2 py-1 rounded">
                  {product.discount}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 truncate">{product.name}</h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-gray-500 text-sm line-through">฿{product.originalPrice}</p>
                    <p className="text-2xl font-bold text-[var(--primary-red)]">฿{product.price}</p>
                  </div>
                  <button className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promotion Banner */}
      <section className="container mx-auto px-4 py-8">
        <div className="relative rounded-2xl overflow-hidden h-[300px] flex items-center bg-gradient-to-r from-[var(--primary-red)] to-purple-900">
          <div className="absolute inset-0 bg-[url('https://placehold.co/1200x300/330000/ff0033?text=Mid+Year+Sale')] opacity-20 bg-cover bg-center"></div>
          <div className="relative z-10 px-10 md:px-20">
            <h2 className="text-4xl md:text-6xl font-black italic mb-4">MID YEAR SALE</h2>
            <p className="text-xl md:text-2xl mb-8">ลดสูงสุด 80% ตลอดเดือนนี้</p>
            <button className="bg-white text-[var(--primary-red)] font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors">
              ดูรายละเอียด
            </button>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="w-2 h-8 bg-[var(--neon-blue)] rounded-full"></span>
          สินค้ามาใหม่
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <div key={product.id} className="glass rounded-xl overflow-hidden hover:border-[var(--neon-blue)] transition-all group">
              <div className="relative">
                <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
                <span className="absolute top-3 left-3 bg-[var(--neon-blue)] text-black text-xs font-bold px-2 py-1 rounded">
                  NEW
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 mb-2 text-yellow-400 text-sm">
                  {[...Array(product.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                </div>
                <h3 className="font-bold text-lg mb-2 truncate group-hover:text-[var(--neon-blue)] transition-colors">{product.name}</h3>
                <p className="text-xl font-bold">฿{product.price}</p>
                <button className="w-full mt-4 border border-white/20 hover:bg-white hover:text-black text-sm font-medium py-2 rounded-lg transition-all">
                  เพิ่มลงตะกร้า
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
