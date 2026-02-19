import { Truck, RefreshCw, Clock, ShieldCheck, Facebook, MessageCircle, Youtube, Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="mt-20 font-sans">
            {/* Top Section: Features */}
            <div className="bg-white py-8 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex items-start gap-4 p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                            <Truck className="w-10 h-10 text-gray-700" />
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg mb-1">ส่งฟรีทั่วไทย</h4>
                                <p className="text-gray-500 text-sm">เมื่อช้อปครบ 5,000 ขึ้นไป</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                            <RefreshCw className="w-10 h-10 text-gray-700" />
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg mb-1">เปลี่ยนคืนสินค้าง่าย</h4>
                                <p className="text-gray-500 text-sm">เปลี่ยนใหม่ภายใน 7 วัน</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                            <Clock className="w-10 h-10 text-gray-700" />
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg mb-1">รวดเร็วในการให้บริการ</h4>
                                <p className="text-gray-500 text-sm">ตอบด่วน ตอบไว</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                            <ShieldCheck className="w-10 h-10 text-gray-700" />
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg mb-1">ชำระเงินปลอดภัย</h4>
                                <p className="text-gray-500 text-sm">ด้วยระบบออนไลน์</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Links & Info (Brand Theme Background) */}
            <div className="bg-[#002255] text-white pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                        {/* Column 1: Brand & Slogan */}
                        <div className="md:col-span-1">
                            <h3 className="text-3xl font-black text-white italic tracking-wider mb-6">
                                SUPER<span className="text-[#FF6600]">TECH</span>
                            </h3>
                            <div className="text-sm leading-relaxed mb-6 text-gray-200 space-y-4">
                                <p>
                                    สร้างสรรค์คอมพิวเตอร์ในฝัน ให้เป็นจริงได้ในงบที่<br></br>
                                    คุณกำหนด... เพราะที่ SUPERTECH <br></br>
                                    เราคือเพื่อนที่เข้าใจทุกความต้องการ
                                </p>
                                <p>
                                    จะคอมเครื่องแรก หรือโปรเจกต์อัปเกรดระดับ<br></br>ไฮเอนด์ ให้ประสบการณ์ของเราช่วยคุณตัดสินใจ เราเชี่ยวชาญในการแมตช์ฮาร์ดแวร์ให้ทำงานร่วมกันได้อย่างเต็มประสิทธิภาพ 100% ตั้งแต่<br></br>
                                    การเลือก CPU ที่ใช่ ไปจนถึงการจัดระเบียบเคส<br></br>
                                    ที่สวยงามและถ่ายเทความร้อนได้ดีเยี่ยม <br></br>
                                    คุณแค่บอก 'งบประมาณ' และ 'การใช้งาน' <br></br>
                                    ที่ต้องการ หน้าที่ในการรังสรรค์เครื่องจักรที่ดีที่สุดปล่อยให้เป็นหน้าที่ของทีมงาน SUPERTECH เพราะคอมพิวเตอร์ของคุณ คือความภูมิใจของเรา
                                </p>
                            </div>
                            <div className="text-gray-300 text-sm font-medium">
                                <p className="mb-4">Copyright © SUPERTECH</p>
                                <div className="text-xs text-gray-300 space-y-1 pt-4 border-t border-blue-800">
                                    <p className="font-semibold text-[#FF6600]">รายวิชาโครงงานเพื่อการศึกษา</p>
                                    <p className="pb-1">จัดทำโดย</p>
                                    <p>นาย อชิระ บุณย์เกียรติ</p>
                                    <p>นายนันทวัฒน์ บุญมาปัด</p>
                                    <p>นาย ธนวัฒน์ ยิ่งยืน</p>
                                    <p>นาย ธนากร ประทีปทอง</p>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: About Us */}
                        <div>
                            <h4 className="text-white font-bold text-lg mb-6">เกี่ยวกับเรา</h4>
                            <ul className="space-y-3 text-sm text-gray-200">
                                <li><a href="#" className="hover:text-[#FF6600] transition-colors">ติดต่อเรา</a></li>
                                <li><a href="#" className="hover:text-[#FF6600] transition-colors">เกี่ยวกับเรา</a></li>
                                <li><a href="#" className="hover:text-[#FF6600] transition-colors">ข้อกำหนดและเงื่อนไข</a></li>
                                <li><a href="#" className="hover:text-[#FF6600] transition-colors">นโยบายความเป็นส่วนตัว</a></li>
                            </ul>
                        </div>

                        {/* Column 3: Customer Service */}
                        <div>
                            <h4 className="text-white font-bold text-lg mb-6">บริการลูกค้า</h4>
                            <ul className="space-y-3 text-sm text-gray-200">
                                <li><a href="#" className="hover:text-[#FF6600] transition-colors">การจัดส่งสินค้า</a></li>
                                <li><a href="#" className="hover:text-[#FF6600] transition-colors">การรับประกันสินค้า</a></li>
                                <li><a href="#" className="hover:text-[#FF6600] transition-colors">การยกเลิกการสั่งซื้อสินค้า</a></li>
                                <li><a href="#" className="hover:text-[#FF6600] transition-colors">การคืนสินค้าและการคืนเงิน</a></li>
                                <li><a href="#" className="hover:text-[#FF6600] transition-colors">เช็คสถานะการจัดส่ง</a></li>
                            </ul>
                        </div>

                        {/* Column 4: Contact */}
                        <div>
                            <h4 className="text-white font-bold text-lg mb-6">ติดต่อเรา</h4>
                            <div className="space-y-4 text-sm text-gray-200">
                                <p>
                                    252 ตำบล ในเมือง อำเภอเมืองอุบลราชธานี<br />
                                    จังหวัด อุบลราชธานี 34000
                                </p>
                                <p>โทรศัพท์: 02 105 4757</p>
                                <p>อีเมล: info@supertech.com</p>

                                <div className="flex gap-4 mt-6">
                                    <Facebook className="w-6 h-6 text-white cursor-pointer hover:text-[#FF6600] transition-colors" />
                                    <MessageCircle className="w-6 h-6 text-white cursor-pointer hover:text-[#FF6600] transition-colors" />
                                    <Youtube className="w-6 h-6 text-white cursor-pointer hover:text-[#FF6600] transition-colors" />
                                    <Instagram className="w-6 h-6 text-white cursor-pointer hover:text-[#FF6600] transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
