import React from 'react';
import { Users, Phone, MapPin, Building2, Briefcase, Handshake } from 'lucide-react';

interface LandingPageProps {
  onApply: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onApply }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-700 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
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
            Karir / Lamar
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Office" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/70" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center lg:text-left">
          <div className="lg:w-2/3">
            <span className="inline-block py-1 px-3 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-sm font-semibold mb-6 backdrop-blur-sm">
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
                Bergabung Sekarang
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
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
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

      {/* Clients Section - NEW */}
      <section id="clients" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-3 text-brand-600 font-semibold uppercase tracking-wider text-sm">
               <Handshake size={18} />
               <span>Klien Kami</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Dipercaya Oleh Lembaga Keuangan Terkemuka</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-100 hover:border-brand-200 transition-colors group">
                <div className="text-2xl font-black text-gray-400 group-hover:text-yellow-500 transition-colors">adira</div>
                <div className="text-xs font-bold text-gray-400 group-hover:text-black uppercase tracking-widest mt-1">Finance</div>
             </div>
             <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-100 hover:border-brand-200 transition-colors group">
                <div className="text-2xl font-black text-gray-400 group-hover:text-blue-600 transition-colors">MACF</div>
                <div className="text-xs font-bold text-gray-400 group-hover:text-black uppercase tracking-widest mt-1">Finance</div>
             </div>
             <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-100 hover:border-brand-200 transition-colors group">
                <div className="text-2xl font-black text-gray-400 group-hover:text-red-600 transition-colors">SMS</div>
                <div className="text-xs font-bold text-gray-400 group-hover:text-black uppercase tracking-widest mt-1">Finance</div>
             </div>
             <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-100 hover:border-brand-200 transition-colors group">
                <div className="text-2xl font-black text-gray-400 group-hover:text-blue-500 transition-colors">BFI</div>
                <div className="text-xs font-bold text-gray-400 group-hover:text-black uppercase tracking-widest mt-1">Finance</div>
             </div>
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
                <div className="flex items-center gap-3 mb-6 text-brand-400">
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
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-bold text-slate-800">PT SWAPRO INTERNATIONAL</span>
          </div>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Hak Cipta Dilindungi Undang-Undang.
          </p>
        </div>
      </footer>
    </div>
  );
};