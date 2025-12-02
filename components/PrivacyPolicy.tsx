import React from 'react';
import { X, ShieldCheck, Lock } from 'lucide-react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Kebijakan Privasi Data</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto text-sm text-gray-600 leading-relaxed space-y-4">
          <p>
            <strong>PT Swapro International</strong> ("Kami") sangat menghargai privasi Anda. Dokumen ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda selama proses rekrutmen.
          </p>

          <h4 className="font-bold text-gray-800 text-base mt-4">1. Pengumpulan Data</h4>
          <p>
            Kami mengumpulkan data pribadi yang Anda berikan secara sukarela melalui formulir ini, termasuk namun tidak terbatas pada Nama Lengkap, NIK, Nomor Telepon, Alamat, Riwayat Pendidikan, Pengalaman Kerja, serta dokumen pendukung seperti CV dan KTP.
          </p>

          <h4 className="font-bold text-gray-800 text-base mt-4">2. Penggunaan Data</h4>
          <p>
            Data yang Anda berikan hanya akan digunakan untuk keperluan:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Proses seleksi dan rekrutmen karyawan.</li>
            <li>Menghubungi Anda terkait jadwal wawancara atau hasil seleksi.</li>
            <li>Verifikasi latar belakang (jika diperlukan dan dengan izin Anda).</li>
            <li>Penempatan kerja sesuai dengan klien mitra kami (Adira, BFI, dll).</li>
          </ul>

          <h4 className="font-bold text-gray-800 text-base mt-4">3. Keamanan Data</h4>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3 items-start">
            <Lock className="text-blue-600 shrink-0 mt-0.5" size={16} />
            <p className="text-blue-800 text-xs">
              Kami menerapkan langkah-langkah keamanan teknis untuk melindungi data Anda dari akses yang tidak sah. Data NIK dan KTP disimpan dengan enkripsi standar industri.
            </p>
          </div>

          <h4 className="font-bold text-gray-800 text-base mt-4">4. Pembagian Data</h4>
          <p>
            Kami tidak akan menjual data Anda kepada pihak ketiga manapun. Data Anda mungkin dibagikan kepada Klien Mitra (Perusahaan Pemberi Kerja) hanya jika Anda lolos tahap awal seleksi untuk keperluan wawancara user.
          </p>

          <h4 className="font-bold text-gray-800 text-base mt-4">5. Persetujuan</h4>
          <p>
            Dengan mencentang kotak persetujuan dan mengirimkan formulir ini, Anda menyatakan bahwa data yang Anda berikan adalah benar dan Anda setuju dengan kebijakan privasi ini.
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 text-right">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};