export default function Footer() {
    return (
        <footer className="bg-[#0f0f0f] border-t border-white/5 py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-2xl font-bold italic tracking-wider mb-4">
                            SUPER<span className="text-[var(--primary-red)]">TECH</span>
                        </h3>
                        <p className="text-gray-400 text-sm">
                            สุดยอดร้านค้าอุปกรณ์เกมมิ่งเกียร์และคอมพิวเตอร์ระดับเทพ เพื่อเกมเมอร์ตัวจริง
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase">เกี่ยวกับเรา</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-[var(--primary-red)]">ประวัติร้าน</a></li>
                            <li><a href="#" className="hover:text-[var(--primary-red)]">ร่วมงานกับเรา</a></li>
                            <li><a href="#" className="hover:text-[var(--primary-red)]">นโยบายความเป็นส่วนตัว</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase">บริการลูกค้า</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-[var(--primary-red)]">การจัดส่งสินค้า</a></li>
                            <li><a href="#" className="hover:text-[var(--primary-red)]">การรับประกัน</a></li>
                            <li><a href="#" className="hover:text-[var(--primary-red)]">แจ้งชำระเงิน</a></li>
                            <li><a href="#" className="hover:text-[var(--primary-red)]">ติดต่อเรา</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase">ติดตามข่าวสาร</h4>
                        <p className="text-gray-400 text-sm mb-4">รับข่าวสารและโปรโมชั่นพิเศษก่อนใคร</p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="อีเมลของคุณ"
                                className="bg-[#2a2a2a] text-white px-4 py-2 rounded-l-md w-full focus:outline-none focus:ring-1 focus:ring-[var(--primary-red)]"
                            />
                            <button className="bg-[var(--primary-red)] text-white px-4 py-2 rounded-r-md hover:bg-red-700 transition-colors">
                                สมัคร
                            </button>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/5 mt-12 pt-8 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Supertech Gaming Store. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
