
import React from 'react';
import { Users, Phone, MapPin, Building2, Briefcase, Handshake, Lock, Instagram, ExternalLink } from 'lucide-react';

interface LandingPageProps {
  onApply: () => void;
  onAdminClick: () => void; // New prop
}

// Daftar Semua Logo Klien
const CLIENTS = [
  "https://i.imgur.com/b36W5R3.png", // Adira
  "https://i.imgur.com/6Pl1uTL.png", // BFI
  "https://i.imgur.com/2hwOpGL.png", // SMS
  "https://i.imgur.com/4fCkD7r.png", // MAF
  "https://i.imgur.com/v1JFM1N.png", // MCF
  "https://i.imgur.com/ORauFxv.png", // New 1
  "https://i.imgur.com/HOE3vTp.png", // New 2
  "https://i.imgur.com/8YJzoSf.png", // New 3
  "https://i.imgur.com/6RvLS3Q.png", // New 4
  "https://i.imgur.com/FK6Vmza.png", // New 5
  "https://i.imgur.com/INrbFQC.png", // New 6
  "https://i.imgur.com/I9wCTBo.png", // New 7
  "https://i.imgur.com/yvvPva2.png", // New 8
];

const IG_LINK = "https://www.instagram.com/swaprokarir?igsh=MXdvOW56ZjN6ZXJrMA==";
const TIKTOK_LINK = "https://www.tiktok.com/@swaprointernational_?_r=1&_t=ZS-91vBGI75XfE";

// Custom TikTok Icon (Since older Lucide versions might not have it)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    height="1em" 
    width="1em" 
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onApply, onAdminClick }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://i.imgur.com/Lf2IC1Z.png" 
              alt="Logo Swapro" 
              className="w-10 h-10 object-contain" 
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight text-slate-800 tracking-tight">PT SWAPRO</span>
              <span className="text-xs font-semibold text-brand-600 tracking-widest">INTERNATIONAL</span>
            </div>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-brand-600 transition-colors">Tentang Kami</a>
            <a href="#services" className="hover:text-brand-600 transition-colors">Layanan</a>
            <a href="#clients" className="hover:text-brand-600 transition-colors">Klien</a>
            <a href="#coverage" className="hover:text-brand-600 transition-colors">Jangkauan</a>
          </nav>
          <button 
            onClick={onApply}
            className="px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-full hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
          >
            Daftar
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-bg.jpg" 
            onError={(e) => e.currentTarget.src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"}
            alt="Office" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/70" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center lg:text-left">
          <div className="lg:w-2/3">
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold mb-6 backdrop-blur-sm">
              Solusi SDM Terintegrasi Sejak 2008
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Mitra Terpercaya untuk <br/>
              <span className="text-brand-400">Pertumbuhan Bisnis</span> Anda
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-2xl">
              Kami hadir memberikan solusi terbaik dalam pelayanan penyedia sumber daya tenaga kerja, telemarketing, dan alihdaya untuk berbagai industri.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={onApply}
                className="px-8 py-4 bg-brand-600 text-white rounded-lg font-semibold text-lg hover:bg-brand-700 transition-all shadow-xl hover:-translate-y-1"
              >
                Lamar Sekarang
              </button>
              <a 
                href="#about"
                className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                Pelajari Lebih Lanjut
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* History & About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="/images/about-us.jpg" 
                onError={(e) => e.currentTarget.src="https://i.imgur.com/w36D0Nb.jpeg"}
                alt="Meeting" 
                className="rounded-2xl shadow-2xl relative z-10"
              />
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-brand-50 rounded-full -z-0"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 border-2 border-brand-100 rounded-full -z-0"></div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Tentang Swapro International</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Berawal dari sesuatu yang sederhana, melayani grup perusahaan <strong>SWATAMA Group</strong> dalam penyediaan SDM, SwaPro berdiri menjadi sebuah entitas mandiri di tahun 2008.
                </p>
                <p>
                  Selanjutnya, SwaPro melebarkan sayap ke layanan terintegrasi di dunia <strong>telemarketing dan call center</strong>, mulai dari penyediaan perangkat, teknologi, manajemen pelanggan hingga petugasnya.
                </p>
                <p>
                  Tidak lama untuk SwaPro berkembang merambah bidang <strong>alihdaya</strong> berkat etos kerja, prinsip layanan dan solusi prima sehingga setiap kontrak berjalan dan fungsi alihdaya terbukti efektif dan efisien bagi Perusahaan yang menjadi kliennya.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-brand-900 py-16 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <div className="text-4xl font-bold text-brand-400 mb-2">15+</div>
              <div className="text-sm opacity-80">Tahun Pengalaman</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-brand-400 mb-2">10</div>
              <div className="text-sm opacity-80">Kantor Perwakilan</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-brand-400 mb-2">70+</div>
              <div className="text-sm opacity-80">Kota Jangkauan</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-brand-400 mb-2">1000+</div>
              <div className="text-sm opacity-80">Tenaga Kerja</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Layanan Unggulan Kami</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Solusi komprehensif untuk kebutuhan operasional dan sumber daya manusia perusahaan Anda.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
              <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-6">
                <Phone size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Telemarketing & Call Center</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Layanan terintegrasi mulai dari penyediaan perangkat, teknologi, manajemen pelanggan hingga penyediaan petugas profesional.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
              <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-6">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Rekrutmen & SDM</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Penyediaan tenaga kerja berkualitas yang telah melalui proses seleksi ketat untuk berbagai posisi di industri Finansial maupun Non-Finansial.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
              <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-6">
                <Building2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Alihdaya (Outsourcing)</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Solusi alihdaya yang efektif dan efisien, memungkinkan perusahaan Anda fokus pada bisnis inti sementara kami mengelola operasional pendukung.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section (Marquee Animation) */}
      <section id="clients" className="py-16 bg-white border-t border-slate-100 overflow-hidden">
        {/* Style for animation */}
        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 40s linear infinite;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="max-w-full mx-auto px-4 mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3 text-brand-600 font-semibold uppercase tracking-wider text-sm">
             <Handshake size={18} />
             <span>Klien Kami</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Dipercaya Oleh Lembaga Keuangan Terkemuka</h2>
        </div>
        
        <div className="relative w-full overflow-hidden group">
           {/* Fade Effect on Edges */}
           <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
           <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

           {/* Scrolling Container */}
           <div className="flex animate-scroll w-max hover:cursor-pointer">
              {/* Duplicate array to create seamless loop */}
              {[...CLIENTS, ...CLIENTS].map((src, idx) => (
                 <div key={idx} className="mx-4 w-40 h-24 flex items-center justify-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <img src={src} alt={`Client Logo ${idx}`} className="max-w-full max-h-full object-contain" />
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* Coverage Section */}
      <section id="coverage" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="grid md:grid-cols-2 items-center">
              <div className="p-10 md:p-16">
                <div className="flex items-center gap-3 mb-6 text-white">
                  <MapPin size={24} />
                  <span className="font-bold tracking-wider uppercase">Jangkauan Nasional</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Hadir di 10 Kota Besar, Melayani 70+ Kota
                </h2>
                <p className="text-slate-300 mb-8 leading-relaxed">
                  Kami semakin yakin dapat membantu perusahaan Anda dalam memberikan solusi terbaik dengan dukungan jaringan yang luas di seluruh Indonesia.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                    Perwakilan di 10 Kota Besar Indonesia
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                    Klien Industri Finansial & Non-Finansial
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                    Ribuan Tenaga Kerja Aktif
                  </li>
                </ul>
              </div>
              <div className="h-full min-h-[300px] bg-slate-800 relative">
                 <img 
                  src="/images/map-coverage.jpg" 
                  onError={(e) => e.currentTarget.src="https://i.imgur.com/WqOCug5.jpeg"}
                  alt="Indonesia Map Concept" 
                  className="w-full h-full object-cover opacity-60"
                 />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-50 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Siap Mengembangkan Karir Bersama Kami?</h2>
          <p className="text-slate-600 mb-10 text-lg">
            Bergabunglah dengan ribuan profesional lainnya di PT Swapro International. Temukan peluang karir yang sesuai dengan potensi Anda.
          </p>
          <button 
            onClick={onApply}
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-200 hover:-translate-y-1"
          >
            <Briefcase size={20} />
            Lamar Pekerjaan Sekarang
          </button>
        </div>
      </section>

      {/* SOCIAL MEDIA / LIFE AT SWAPRO SECTION */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Life at Swapro</h2>
              <p className="text-slate-500">Ikuti keseruan dan aktivitas kami di media sosial</p>
           </div>

           <div className="grid md:grid-cols-2 gap-6">
              {/* Instagram Card */}
              <a 
                href={IG_LINK} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl p-8 h-64 flex flex-col justify-between transition-all hover:scale-[1.02] hover:shadow-xl"
              >
                 <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500"></div>
                 <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                 
                 <div className="relative z-10 text-white">
                    <Instagram size={40} className="mb-4" />
                    <h3 className="text-2xl font-bold">Instagram</h3>
                    <p className="text-white/80">@swaprokarir</p>
                 </div>
                 <div className="relative z-10 flex items-center gap-2 text-white font-semibold group-hover:translate-x-2 transition-transform">
                    Follow Kami <ExternalLink size={16} />
                 </div>
              </a>

              {/* TikTok Card */}
              <a 
                href={TIKTOK_LINK} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl p-8 h-64 flex flex-col justify-between transition-all hover:scale-[1.02] hover:shadow-xl bg-black"
              >
                 {/* Decorative circles for TikTok vibe */}
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00f2ea] rounded-full blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                 <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#ff0050] rounded-full blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                 
                 <div className="relative z-10 text-white">
                    <TikTokIcon className="w-10 h-10 mb-4" />
                    <h3 className="text-2xl font-bold">TikTok</h3>
                    <p className="text-white/80">@swaprointernational_</p>
                 </div>
                 <div className="relative z-10 flex items-center gap-2 text-white font-semibold group-hover:translate-x-2 transition-transform">
                    Tonton Video <ExternalLink size={16} />
                 </div>
              </a>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 relative">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="https://i.imgur.com/Lf2IC1Z.png" 
                alt="Logo Swapro" 
                className="w-8 h-8 object-contain" 
              />
              <span className="font-bold text-slate-800">PT SWAPRO INTERNATIONAL</span>
            </div>
            
            {/* Social Icons in Footer */}
            <div className="flex gap-4">
               <a href={IG_LINK} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-pink-50 hover:text-pink-600 transition-colors" title="Instagram">
                  <Instagram size={16} />
               </a>
               <a href={TIKTOK_LINK} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white transition-colors" title="TikTok">
                  <TikTokIcon className="w-4 h-4" />
               </a>
            </div>
          </div>
          
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Hak Cipta Dilindungi Undang-Undang.
          </p>

          {/* BACKDOOR ADMIN BUTTON */}
          <button 
             onClick={onAdminClick}
             className="absolute bottom-0 right-4 p-2 text-gray-200 hover:text-gray-400 transition-colors opacity-50 hover:opacity-100"
             title="Admin Access"
          >
            <Lock size={14} />
          </button>

        </div>
      </footer>
    </div>
  );
};
