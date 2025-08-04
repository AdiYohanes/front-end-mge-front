import React, { useState, useRef, useEffect } from 'react';

const TermsModal = ({ isOpen, onClose, onAccept, title = "Terms & Conditions" }) => {
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const scrollRef = useRef(null);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px tolerance
            setHasScrolledToBottom(isAtBottom);

            // Calculate scroll progress
            const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
            setScrollProgress(Math.min(progress, 100));
        }
    };

    const handleCheckboxChange = (e) => {
        if (hasScrolledToBottom) {
            setIsChecked(e.target.checked);
        }
    };

    const handleAccept = () => {
        if (isChecked && hasScrolledToBottom) {
            onAccept();
            onClose();
        }
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setHasScrolledToBottom(false);
            setIsChecked(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-gray-200">
                {/* Header */}
                <div className="border-b border-gray-200 bg-gradient-to-r from-brand-gold/5 to-yellow-50/50">
                    <div className="flex justify-between items-center p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-minecraft text-brand-gold">{title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors duration-200"
                            aria-label="Close modal"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-6 pb-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-brand-gold h-2 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${scrollProgress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">Progress membaca</span>
                            <span className="text-xs text-gray-500">{Math.round(scrollProgress)}%</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#d1d5db #f3f4f6'
                        }}
                    >
                        {/* Scroll indicator */}
                        {scrollProgress < 100 && (
                            <div className="absolute top-2 right-2 bg-brand-gold/90 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                Scroll untuk membaca
                            </div>
                        )}
                        <div className="prose max-w-none">
                            {/* Header */}
                            <div className="text-center mb-8 p-6 bg-gradient-to-r from-brand-gold/10 to-yellow-100/50 rounded-lg border border-brand-gold/20">
                                <h3 className="text-2xl font-minecraft text-brand-gold mb-2">MEDAN GAMING ECOSYSTEM</h3>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    JL. Setiabudi Komplek Tasbi 1, Ruko Setiabudi Mandiri Square No. 3<br />
                                    Kel. Tanjung Sari, Kec. Medan Selayang, Kota Medan.
                                </p>
                            </div>

                            <div className="text-center mb-6">
                                <h4 className="text-xl font-minecraft text-brand-gold">SYARAT & KETENTUAN LAYANAN RENTAL PS MGE</h4>
                                <p className="text-sm text-gray-600 mt-2">PT. Medan Gaming Ecosystem</p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-400">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    Dengan mengakses dan menggunakan layanan rental PlayStation (selanjutnya disebut "Layanan")
                                    di tempat Rental PS MGE, Anda ("Penyewa") setuju untuk mematuhi seluruh Syarat & Ketentuan
                                    yang ditetapkan oleh PT. Medan Gaming Ecosystem ("Kami").
                                </p>
                            </div>

                            {/* Section 1 */}
                            <div className="mb-6">
                                <h5 className="text-lg font-bold text-brand-gold mb-3 flex items-center">
                                    <span className="bg-brand-gold text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">1</span>
                                    Persyaratan Pengguna
                                </h5>
                                <div className="pl-8 space-y-2">
                                    <p className="text-sm text-gray-700">• Usia minimal Penyewa adalah 10 tahun. Bagi Penyewa di bawah 18 tahun, wajib didampingi atau mendapatkan persetujuan dari orang tua/wali yang bertanggung jawab.</p>
                                    <p className="text-sm text-gray-700">• Penyewa wajib memberikan informasi identitas yang valid (misalnya, nama lengkap dan nomor telepon yang bisa dihubungi).</p>
                                    <p className="text-sm text-gray-700">• Kami berhak menolak layanan kepada siapa pun yang tidak memenuhi persyaratan atau dianggap dapat mengganggu ketertiban.</p>
                                </div>
                            </div>

                            {/* Section 2 */}
                            <div className="mb-6">
                                <h5 className="text-lg font-bold text-brand-gold mb-3 flex items-center">
                                    <span className="bg-brand-gold text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">2</span>
                                    Waktu Operasional & Tarif
                                </h5>
                                <div className="pl-8 space-y-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 mb-2">• Waktu Operasional:</p>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm text-gray-700">o Senin - Kamis : 10.00 WIB – 00.00 WIB</p>
                                            <p className="text-sm text-gray-700">o Jumat : 14.00 WIB – 01.00 WIB</p>
                                            <p className="text-sm text-gray-700">o Sabtu : 10.00 WIB – 01.00 WIB</p>
                                            <p className="text-sm text-gray-700">o Minggu : 10.00 WIB – 00.00 WIB</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 mb-2">• Pembayaran:</p>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm text-gray-700">o Pembayaran dilakukan di muka (Cash / Cashless) sebelum waktu bermain dimulai.</p>
                                            <p className="text-sm text-gray-700">o Tarif rental akan diinformasikan dengan jelas sebelum pemesanan atau di area kasir.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3 */}
                            <div className="mb-6">
                                <h5 className="text-lg font-bold text-brand-gold mb-3 flex items-center">
                                    <span className="bg-brand-gold text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">3</span>
                                    Aturan Main & Penggunaan Fasilitas
                                </h5>
                                <div className="pl-8 space-y-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 mb-2">• Peralatan (PS, TV, Stik, dll.):</p>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm text-gray-700">o Dilarang merusak atau membongkar peralatan PS, TV, atau stik. Setiap kerusakan akibat kelalaian atau kesengajaan Penyewa akan dikenakan biaya penggantian penuh sesuai harga pasar.</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 mb-2">• Game:</p>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm text-gray-700">o Dilarang membawa game sendiri dari luar untuk dimainkan di konsol Kami.</p>
                                            <p className="text-sm text-gray-700">o Dilarang memodifikasi, menghapus, atau merusak game yang sudah tersedia.</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 mb-2">• Kebersihan:</p>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm text-gray-700">o Penyewa wajib menjaga kebersihan area bermain dan dilarang membuang sampah sembarangan.</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 mb-2">• Perilaku:</p>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm text-gray-700">o Dilarang bersikap kasar, berkata-kata kotor, atau melakukan tindakan yang dapat mengganggu kenyamanan pemain lain maupun berujung pada perkelahian atau perilaku tidak pantas lainnya.</p>
                                            <p className="text-sm text-gray-700">o Dilarang melakukan tindak asusila dalam bentuk apapun.</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 mb-2">• Stik:</p>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm text-gray-700">o Dilarang menggunakan stik dengan cara yang berpotensi merusak (misalnya, gerakan "jurus kepiting" yang berlebihan dan kasar, membanting stik). Kerusakan pada stik akibat penggunaan tidak wajar akan menjadi tanggung jawab Penyewa.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4 */}
                            <div className="mb-6">
                                <h5 className="text-lg font-bold text-brand-gold mb-3 flex items-center">
                                    <span className="bg-brand-gold text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">4</span>
                                    Kesehatan dan Keselamatan
                                </h5>
                                <div className="pl-8 space-y-2">
                                    <p className="text-sm text-gray-700">• Perangkat: Seluruh perangkat PS dan TV akan diperiksa dan dirawat secara berkala untuk memastikan keamanan dan kenyamanan penggunaan.</p>
                                    <p className="text-sm text-gray-700">• Pemberitahuan: Pengunjung diwajibkan untuk mengikuti peraturan keselamatan yang berlaku di area rental PS dan petunjuk dari staf Kami.</p>
                                </div>
                            </div>

                            {/* Section 5 */}
                            <div className="mb-6">
                                <h5 className="text-lg font-bold text-brand-gold mb-3 flex items-center">
                                    <span className="bg-brand-gold text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">5</span>
                                    Aturan Lain-lain
                                </h5>
                                <div className="pl-8 space-y-2">
                                    <p className="text-sm text-gray-700">• Dilarang Merokok: Dilarang merokok di area bermain rental ps kecuali iqos, pod dan/atau vape. Merokok hanya diperbolehkan di area/ruang terbuka yang telah disediakan.</p>
                                    <p className="text-sm text-gray-700">• Minuman Beralkohol: Dilarang membawa dan/atau mengonsumsi minuman beralkohol di seluruh area rental PS.</p>
                                    <p className="text-sm text-gray-700">• Barang Berharga: Kami tidak bertanggung jawab atas kehilangan atau kerusakan barang berharga milik Penyewa yang terjadi di area rental PS. Penyewa disarankan untuk menjaga barang bawaan masing-masing.</p>
                                    <p className="text-sm text-gray-700">• Makan dan Minum: Dilarang membawa makanan dan/atau minuman dari luar (kecuali botol minum/tumbler). Makanan dan minuman dapat dibeli di area kafe/kantin yang tersedia.</p>
                                    <p className="text-sm text-gray-700">• Rechedule, Cancel dan Refund: Penyewa tidak dapat melakukan pembatalan atau perubahan jadwal, hal ini juga termasuk tidak dapat meminta pengembalian dana dengan alasan apapun.</p>
                                </div>
                            </div>

                            {/* Section 6 */}
                            <div className="mb-6">
                                <h5 className="text-lg font-bold text-brand-gold mb-3 flex items-center">
                                    <span className="bg-brand-gold text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">6</span>
                                    Sanksi Pelanggaran
                                </h5>
                                <div className="pl-8 space-y-3">
                                    <p className="text-sm text-gray-700">Setiap pelanggaran terhadap Syarat & Ketentuan ini akan dikenakan sanksi sebagai berikut:</p>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-700">• Sanksi Ringan: Teguran lisan dari staf Kami.</p>
                                        <p className="text-sm text-gray-700">• Sanksi Sedang: Pembatalan sesi sewa yang sedang berlangsung tanpa pengembalian dana, atau pengusiran dari area rental PS.</p>
                                        <p className="text-sm text-gray-700">• Sanksi Berat: Larangan permanen untuk kembali ke Rental PS MGE dan/atau pengenaan denda* sesuai dengan kerugian yang ditimbulkan (termasuk, namun tidak terbatas pada, biaya penggantian kerusakan peralatan).</p>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-3">*Denda: Jumlah denda akan ditentukan berdasarkan tingkat kerusakan atau pelanggaran yang dilakukan, dan wajib dilunasi oleh Penyewa. Daftar denda untuk kerusakan barang akan dilampirkan.</p>
                                </div>
                            </div>

                            {/* Section 7 */}
                            <div className="mb-6">
                                <h5 className="text-lg font-bold text-brand-gold mb-3 flex items-center">
                                    <span className="bg-brand-gold text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">7</span>
                                    Kebijakan Privasi
                                </h5>
                                <div className="pl-8">
                                    <p className="text-sm text-gray-700">• Informasi pribadi Penyewa akan digunakan sesuai dengan Kebijakan Privasi Kami yang tersedia di website atau di lokasi rental PS.</p>
                                </div>
                            </div>

                            {/* Section 8 */}
                            <div className="mb-6">
                                <h5 className="text-lg font-bold text-brand-gold mb-3 flex items-center">
                                    <span className="bg-brand-gold text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">8</span>
                                    Perubahan Ketentuan
                                </h5>
                                <div className="pl-8">
                                    <p className="text-sm text-gray-700">• Kami berhak mengubah Syarat & Ketentuan ini kapan saja tanpa pemberitahuan sebelumnya. Versi terbaru akan selalu tersedia di website dan di area Rental PS MGE.</p>
                                </div>
                            </div>

                            {/* Section 9 */}
                            <div className="mb-6">
                                <h5 className="text-lg font-bold text-brand-gold mb-3 flex items-center">
                                    <span className="bg-brand-gold text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">9</span>
                                    Kontak Kami
                                </h5>
                                <div className="pl-8">
                                    <p className="text-sm text-gray-700">Jika Anda memiliki pertanyaan, silakan hubungi staf Kami di lokasi atau melalui <span className="text-brand-gold font-semibold">medangamingecosystem@gmail.com</span> / <span className="text-brand-gold font-semibold">+62 851-8606-7134</span>.</p>
                                </div>
                            </div>

                            {/* Daftar Denda */}
                            <div className="mt-8 p-6 bg-red-50 rounded-lg border border-red-200">
                                <h5 className="text-lg font-bold text-red-700 mb-4 text-center">DAFTAR DENDA ATAS KERUSAKAN ASET</h5>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-red-100">
                                                <th className="border border-red-300 px-2 py-2 text-left">No</th>
                                                <th className="border border-red-300 px-2 py-2 text-left">Nama Aset</th>
                                                <th className="border border-red-300 px-2 py-2 text-left">Denda</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr><td className="border border-red-300 px-2 py-1">1</td><td className="border border-red-300 px-2 py-1">TV TCL 55"</td><td className="border border-red-300 px-2 py-1">IDR. 10.000.000</td></tr>
                                            <tr><td className="border border-red-300 px-2 py-1">2</td><td className="border border-red-300 px-2 py-1">TV TCL 43"</td><td className="border border-red-300 px-2 py-1">IDR. 8.000.000</td></tr>
                                            <tr><td className="border border-red-300 px-2 py-1">3</td><td className="border border-red-300 px-2 py-1">PROYEKTOR RUANG VVIP</td><td className="border border-red-300 px-2 py-1">IDR. 26.000.000</td></tr>
                                            <tr><td className="border border-red-300 px-2 py-1">4</td><td className="border border-red-300 px-2 py-1">PS 5/UNIT</td><td className="border border-red-300 px-2 py-1">IDR. 14.000.000</td></tr>
                                            <tr><td className="border border-red-300 px-2 py-1">5</td><td className="border border-red-300 px-2 py-1">DUAL SENSE STICK PS5/UNIT</td><td className="border border-red-300 px-2 py-1">IDR. 2.000.000</td></tr>
                                            <tr><td className="border border-red-300 px-2 py-1">6</td><td className="border border-red-300 px-2 py-1">SOFA "L" VVIP</td><td className="border border-red-300 px-2 py-1">IDR. 10.000.000</td></tr>
                                            <tr><td className="border border-red-300 px-2 py-1">7</td><td className="border border-red-300 px-2 py-1">MEJA RUANGAN VVIP</td><td className="border border-red-300 px-2 py-1">IDR. 5.000.000</td></tr>
                                            <tr><td className="border border-red-300 px-2 py-1">8</td><td className="border border-red-300 px-2 py-1">SOFA RUANGAN VIP</td><td className="border border-red-300 px-2 py-1">IDR. 8.000.000</td></tr>
                                            <tr><td className="border border-red-300 px-2 py-1">9</td><td className="border border-red-300 px-2 py-1">MEJA RUANGAN VIP</td><td className="border border-red-300 px-2 py-1">IDR. 5.000.000</td></tr>
                                            <tr><td className="border border-red-300 px-2 py-1">10</td><td className="border border-red-300 px-2 py-1">PS 4/UNIT</td><td className="border border-red-300 px-2 py-1">IDR. 6.000.000</td></tr>
                                            <tr><td className="border border-red-300 px-2 py-1">11</td><td className="border border-red-300 px-2 py-1">CERMIN/KACA</td><td className="border border-red-300 px-2 py-1">IDR. 2000.000</td></tr>
                                            <tr><td className="border border-red-300 px-2 py-1">12</td><td className="border border-red-300 px-2 py-1">PINTU KACA VIP/VVIP</td><td className="border border-red-300 px-2 py-1">IDR. 5.000.000</td></tr>
                                            <tr><td className="border border-red-300 px-2 py-1">13</td><td className="border border-red-300 px-2 py-1">DUAL SHOCK STICK PS4/UNIT</td><td className="border border-red-300 px-2 py-1">IDR. 600.000</td></tr>
                                            <tr><td className="border border-red-300 px-2 py-1">14</td><td className="border border-red-300 px-2 py-1">MEJA PS REGULER</td><td className="border border-red-300 px-2 py-1">IDR. 1.000.000</td></tr>
                                            <tr><td className="border border-red-300 px-2 py-1">15</td><td className="border border-red-300 px-2 py-1">SOFA REGULER</td><td className="border border-red-300 px-2 py-1">IDR. 6.000.000</td></tr>
                                            <tr><td className="border border-red-300 px-2 py-1">16</td><td className="border border-red-300 px-2 py-1">DINDING/LANTAI/VINYL/LAMPU</td><td className="border border-red-300 px-2 py-1">IDR. 1.000.000</td></tr>
                                            <tr><td className="border border-red-300 px-2 py-1">17</td><td className="border border-red-300 px-2 py-1">DEKORASI/HIASAN & MEJA BAR</td><td className="border border-red-300 px-2 py-1">IDR. 2.000.000</td></tr>
                                            <tr><td className="border border-red-300 px-2 py-1">18</td><td className="border border-red-300 px-2 py-1">NINTENDO SWITCH</td><td className="border border-red-300 px-2 py-1">IDR. 6.000.000</td></tr>
                                            <tr><td className="border border-red-300 px-2 py-1">19</td><td className="border border-red-300 px-2 py-1">JOYCON N'SWITCH/PCS</td><td className="border border-red-300 px-2 py-1">IDR. 2.000.000</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4 p-3 bg-red-100 rounded border border-red-200">
                                    <p className="text-xs text-red-800 font-semibold mb-2">Ketentuan:</p>
                                    <div className="space-y-1 text-xs text-red-700">
                                        <p>• Kerusakan Minor : 10% dari nilai denda yang tertera.</p>
                                        <p>• Kerusakan Sedang : 50% dari nilai denda yang tertera.</p>
                                        <p>• Kerusakan Berat : 100% dari nilai denda yang tertera.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 text-center p-4 bg-gradient-to-r from-brand-gold/10 to-yellow-100/50 rounded-lg border border-brand-gold/20">
                                <h6 className="text-lg font-minecraft text-brand-gold mb-2">MEDAN GAMING ECOSYSTEM</h6>
                                <p className="text-sm text-gray-700">
                                    JL. Setiabudi Komplek Tasbi 1, Ruko Setiabudi Mandiri Square No. 3<br />
                                    Kel. Tanjung Sari, Kec. Medan Selayang, Kota Medan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-yellow-50/30">
                    <div className="flex items-start space-x-3 mb-6">
                        <div className="relative">
                            <input
                                type="checkbox"
                                id="terms-checkbox"
                                checked={isChecked}
                                onChange={handleCheckboxChange}
                                disabled={!hasScrolledToBottom}
                                className="w-5 h-5 text-brand-gold border-brand-gold rounded focus:ring-brand-gold focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {!hasScrolledToBottom && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            )}
                        </div>
                        <label htmlFor="terms-checkbox" className="text-sm flex-1">
                            <span className={`font-medium ${!hasScrolledToBottom ? "text-gray-400" : "text-gray-700"}`}>
                                Saya telah membaca, memahami, dan menyetujui Syarat & Ketentuan
                            </span>
                            {!hasScrolledToBottom && (
                                <div className="flex items-center gap-2 mt-2 text-xs text-red-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <span>Silakan scroll ke bawah untuk membaca semua syarat sebelum menyetujui</span>
                                </div>
                            )}
                        </label>
                        {!hasScrolledToBottom && (
                            <button
                                onClick={scrollToBottom}
                                className="px-3 py-1 text-xs font-medium text-brand-gold bg-brand-gold/10 border border-brand-gold/20 rounded-lg hover:bg-brand-gold/20 transition-colors duration-200 flex items-center gap-1"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                                Scroll ke Bawah
                            </button>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold transition-colors duration-200"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleAccept}
                            disabled={!isChecked || !hasScrolledToBottom}
                            className="px-6 py-2 text-sm font-medium text-white bg-brand-gold border border-transparent rounded-lg hover:bg-brand-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                        >
                            {!isChecked || !hasScrolledToBottom ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Setujui Syarat
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Setujui Syarat
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsModal; 