
import React from 'react';
import { X, ShieldCheck, Lock, FileText, CheckCircle } from 'lucide-react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center border border-brand-100 shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900">Kebijakan Privasi Data</h3>
                <p className="text-xs text-gray-500">PT Swapro International</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto text-sm text-gray-600 leading-relaxed space-y-6">
          <div className="bg-brand-50 border border-brand-100 rounded-lg p-4 flex gap-3">
             <div className="shrink-0 text-brand-600 mt-0.5"><FileText size={18}/></div>
             <p className="text-brand-800 text-xs leading-5">
                Dokumen ini menjelaskan prosedur standar kami dalam mengelola data pribadi pelamar kerja sesuai peraturan perundang-undangan yang berlaku di Indonesia.
             </p>
          </div>

          <section>
            <h4 className="font-bold text-gray-800 text-base mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs">1</span>
                Pengumpulan Data
            </h4>
            <p className="pl-8">
                Kami mengumpulkan data pribadi yang Anda berikan secara sukarela melalui formulir ini, termasuk namun tidak terbatas pada Nama Lengkap, NIK, Nomor Telepon, Alamat, Riwayat Pendidikan, Pengalaman Kerja, serta dokumen pendukung seperti CV dan KTP.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-gray-800 text-base mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs">2</span>
                Tujuan Penggunaan
            </h4>
            <ul className="list-disc pl-12 space-y-1 marker:text-brand-500">
                <li>Proses seleksi administrasi dan rekrutmen karyawan.</li>
                <li>Menghubungi kandidat terkait jadwal wawancara atau hasil seleksi.</li>
                <li>Verifikasi latar belakang (background check) jika diperlukan.</li>
                <li>Penempatan kerja sesuai dengan kebutuhan klien mitra kami.</li>
            </ul>
          </section>

          <section>
            <h4 className="font-bold text-gray-800 text-base mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs">3</span>
                Keamanan & Kerahasiaan
            </h4>
            <div className="pl-8">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex gap-3 items-start">
                    <Lock className="text-slate-600 shrink-0 mt-0.5" size={16} />
                    <p className="text-slate-700 text-xs">
                    Kami menerapkan enkripsi data pada informasi sensitif seperti NIK dan KTP. Akses terhadap data ini dibatasi hanya untuk tim HRD dan Rekrutmen yang berwenang.
                    </p>
                </div>
            </div>
          </section>

          <section>
            <h4 className="font-bold text-gray-800 text-base mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs">4</span>
                Pernyataan Pelamar
            </h4>
            <p className="pl-8">
                Dengan melanjutkan proses ini, Anda menyatakan bahwa seluruh informasi yang Anda berikan adalah <strong>benar, akurat, dan dapat dipertanggungjawabkan</strong>. Pemalsuan data dapat mengakibatkan diskualifikasi atau pemutusan hubungan kerja di kemudian hari.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center gap-2 active:scale-95"
          >
            <CheckCircle size={18} />
            Saya Mengerti & Setuju
          </button>
        </div>
      </div>
    </div>
  );
};
