import React, { useState, ChangeEvent, FormEvent } from 'react';
import { FormData, INITIAL_DATA } from '../types';
import { Section } from './Section';
import { InputField, SelectField, TextAreaField, CheckboxField, FileUpload } from './InputGroup';
import { PrivacyPolicy } from './PrivacyPolicy';
import { 
  Briefcase, 
  User, 
  MapPin, 
  GraduationCap, 
  FileText, 
  CheckSquare, 
  Send,
  ArrowLeft,
  Building2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface JobFormProps {
  onBack: () => void;
}

// Data Opsi Posisi
const POSISI_OPTIONS = [
  { label: 'SALES OFFICER / CMO', value: 'SALES OFFICER / CMO' },
  { label: 'REMEDIAL KOLEKTOR', value: 'REMEDIAL KOLEKTOR' },
  { label: 'RELATION OFFICER', value: 'RELATION OFFICER' },
];

// Data Opsi Penempatan
const PENEMPATAN_OPTIONS = [
  // ADIRA
  { label: 'ADIRA FINANCE - JAKARTA RAYA', value: 'ADIRA JAKARTA RAYA' },
  { label: 'ADIRA FINANCE - BEKASI RAYA', value: 'ADIRA BEKASI RAYA' },
  { label: 'ADIRA FINANCE - DEPOK RAYA', value: 'ADIRA DEPOK RAYA' },
  { label: 'ADIRA FINANCE - BOGOR RAYA', value: 'ADIRA BOGOR RAYA' },
  // MACF
  { label: 'MACF FINANCE - JAKARTA RAYA', value: 'MACF JAKARTA RAYA' },
  { label: 'MACF FINANCE - BEKASI RAYA', value: 'MACF BEKASI RAYA' },
  { label: 'MACF FINANCE - DEPOK RAYA', value: 'MACF DEPOK RAYA' },
  { label: 'MACF FINANCE - BOGOR RAYA', value: 'MACF BOGOR RAYA' },
  // SMSF
  { label: 'SMS FINANCE - JAKARTA RAYA', value: 'SMSF JAKARTA RAYA' },
  { label: 'SMS FINANCE - BEKASI RAYA', value: 'SMSF BEKASI RAYA' },
  { label: 'SMS FINANCE - DEPOK RAYA', value: 'SMSF DEPOK RAYA' },
  { label: 'SMS FINANCE - BOGOR RAYA', value: 'SMSF BOGOR RAYA' },
  // BFI
  { label: 'BFI FINANCE - JAKARTA RAYA', value: 'BFI JAKARTA RAYA' },
  { label: 'BFI FINANCE - BEKASI RAYA', value: 'BFI BEKASI RAYA' },
  { label: 'BFI FINANCE - DEPOK RAYA', value: 'BFI DEPOK RAYA' },
  { label: 'BFI FINANCE - BOGOR RAYA', value: 'BFI BOGOR RAYA' },
];

export const JobForm: React.FC<JobFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // State baru untuk validasi dan policy
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // General Input Handler
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Checkbox Handler
  const handleCheckboxChange = (name: keyof FormData) => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
     // Clear error specifically for terms
    if (name === 'termsAccepted' && checked && validationErrors.termsAccepted) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.termsAccepted;
        return newErrors;
      });
    }
  };

  // Special Handler for Experience Status
  const handleExperienceStatus = (hasExperience: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      hasPengalamanKerja: hasExperience,
      hasPengalamanLeasing: hasExperience ? prev.hasPengalamanLeasing : false 
    }));
  };

  // File Handler
  const handleFileChange = (name: 'cvFile' | 'ktpFile') => (file: File | null) => {
    setFormData(prev => ({ ...prev, [name]: file }));
    if (file && validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // --- VALIDASI MENDALAM ---
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. Validasi NIK (Harus 16 Digit)
    if (!formData.nik) {
      errors.nik = "NIK wajib diisi.";
    } else if (formData.nik.length !== 16) {
      errors.nik = `NIK harus 16 digit. Saat ini: ${formData.nik.length} digit.`;
    }

    // 2. Validasi No HP (Min 10, Max 14)
    if (!formData.noHp) {
      errors.noHp = "Nomor HP wajib diisi.";
    } else {
      // Regex untuk memastikan hanya angka (dan opsional tanda + di depan)
      const phoneRegex = /^[0-9]+$/;
      if (!phoneRegex.test(formData.noHp)) {
         errors.noHp = "Nomor HP hanya boleh berisi angka.";
      } else if (formData.noHp.length < 10) {
         errors.noHp = "Nomor HP terlalu pendek (min 10 digit).";
      } else if (formData.noHp.length > 14) {
         errors.noHp = "Nomor HP terlalu panjang (max 14 digit).";
      }
    }

    // 3. Validasi File
    if (!formData.cvFile) errors.cvFile = "CV wajib diupload.";
    if (!formData.ktpFile) errors.ktpFile = "KTP wajib diupload.";

    // 4. Validasi Kebijakan Privasi
    if (!formData.termsAccepted) {
      errors.termsAccepted = "Anda harus menyetujui Kebijakan Privasi untuk melanjutkan.";
    }

    setValidationErrors(errors);
    
    // Jika ada error, scroll ke elemen error pertama
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementsByName(firstErrorKey)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
         window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const filePath = `${folder}/${Date.now()}_${cleanName}`;
      
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) throw error;
      return data?.path || null;
    } catch (err) {
      console.error('Error uploading file:', err);
      return null;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Jalankan Validasi
    if (!validateForm()) {
      return; // Stop jika tidak valid
    }

    setIsSubmitting(true);
    
    try {
      // 1. Upload Files
      const cvPath = await uploadFile(formData.cvFile!, 'cv');
      const ktpPath = await uploadFile(formData.ktpFile!, 'ktp');

      if (!cvPath || !ktpPath) throw new Error("Gagal mengupload dokumen. Silakan coba lagi.");

      // 2. Insert Data
      const { error } = await supabase
        .from('applicants')
        .insert({
          posisi_dilamar: formData.posisiDilamar,
          penempatan: formData.penempatan,
          
          nama_lengkap: formData.namaLengkap,
          nik: formData.nik,
          no_hp: formData.noHp,
          tempat_lahir: formData.tempatLahir,
          tanggal_lahir: formData.tanggalLahir,
          umur: typeof formData.umur === 'number' ? formData.umur : parseInt(formData.umur as string) || 0,
          jenis_kelamin: formData.jenisKelamin,
          status_perkawinan: formData.statusPerkawinan,
          agama: formData.agama,
          nama_ayah: formData.namaAyah,
          nama_ibu: formData.namaIbu,

          alamat_ktp: formData.alamatKtp,
          alamat_domisili: formData.alamatDomisili,
          rt_rw: formData.rtRw,
          nomor_rumah: formData.nomorRumah,
          kelurahan: formData.kelurahan,
          kecamatan: formData.kecamatan,
          kota: formData.kota,
          kode_pos: formData.kodePos,

          tingkat_pendidikan: formData.tingkatPendidikan,
          nama_sekolah: formData.namaSekolah,
          jurusan: formData.jurusan,
          tahun_masuk: formData.tahunMasuk,
          tahun_lulus: formData.tahunLulus,
          ipk: formData.ipk,

          has_pengalaman_kerja: formData.hasPengalamanKerja,
          has_pengalaman_leasing: formData.hasPengalamanLeasing,
          nama_perusahaan: formData.namaPerusahaan,
          posisi_jabatan: formData.posisiJabatan,
          periode_kerja: formData.periodeKerja,
          deskripsi_tugas: formData.deskripsiTugas,

          kendaraan_pribadi: formData.kendaraanPribadi,
          ktp_asli: formData.ktpAsli,
          sim_c: formData.simC,
          sim_a: formData.simA,
          skck: formData.skck,
          npwp: formData.npwp,
          riwayat_buruk_kredit: formData.riwayatBurukKredit,
          
          alasan_melamar: formData.alasanMelamar,
          
          cv_path: cvPath,
          ktp_path: ktpPath,
          
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: any) {
      console.error("Submission Error:", err);
      setErrorMessage(err.message || "Terjadi kesalahan sistem. Mohon coba lagi.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full p-8 rounded-2xl shadow-xl text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckSquare size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h2>
          <p className="text-gray-600 mb-8">
            Terima kasih, <strong>{formData.namaLengkap}</strong>. Data Anda telah kami simpan di database kami untuk posisi <strong>{formData.posisiDilamar}</strong>. HRD kami akan segera menghubungi Anda.
          </p>
          <div className="flex flex-col gap-3">
            <button 
                onClick={() => {
                setSubmitted(false);
                setFormData(INITIAL_DATA);
                setValidationErrors({});
                }}
                className="bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors w-full"
            >
                Isi Form Baru
            </button>
            <button 
                onClick={onBack}
                className="text-gray-500 hover:text-gray-700 font-medium py-2"
            >
                Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 animate-fadeIn">
      
      <PrivacyPolicy 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />

      {/* Header Image Area with Back Button */}
      <div className="h-64 bg-slate-900 relative overflow-hidden">
         <img 
           src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
           alt="Office Background" 
           className="w-full h-full object-cover opacity-30"
         />
         <div className="absolute top-6 left-6 z-20">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm transition-all"
            >
                <ArrowLeft size={18} /> Kembali
            </button>
         </div>
         <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
           <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight text-center">Formulir Pendaftaran Kerja</h1>
           <p className="text-lg opacity-90 max-w-2xl text-center">Bergabunglah dengan PT Swapro International</p>
         </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-fadeIn">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-red-700">Gagal Mengirim</h4>
              <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
            </div>
          </div>
        )}
        
        {Object.keys(validationErrors).length > 0 && (
           <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-fadeIn">
             <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={20} />
             <div>
               <h4 className="font-semibold text-orange-800">Periksa Inputan Anda</h4>
               <p className="text-sm text-orange-700 mt-1">Terdapat data yang belum lengkap atau format tidak sesuai. Silakan cek bagian yang berwarna merah.</p>
             </div>
           </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Section 1: Posisi */}
          <Section 
            title="Informasi Lowongan" 
            icon={<Briefcase size={20} />}
            description="Pilih posisi dan lokasi penempatan yang Anda inginkan."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField 
                label="Posisi Dilamar" 
                name="posisiDilamar" 
                value={formData.posisiDilamar} 
                onChange={handleChange} 
                required
                options={POSISI_OPTIONS}
              />
              <SelectField 
                label="Penempatan & Klien" 
                name="penempatan" 
                value={formData.penempatan} 
                onChange={handleChange} 
                required 
                options={PENEMPATAN_OPTIONS}
              />
            </div>
          </Section>

          {/* Section 2: Data Diri */}
          <Section 
            title="Data Pribadi" 
            icon={<User size={20} />}
            description="Lengkapi identitas diri Anda sesuai dengan KTP."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Nama Lengkap" name="namaLengkap" value={formData.namaLengkap} onChange={handleChange} required />
              
              {/* NIK VALIDATION */}
              <InputField 
                label="NIK (Nomor Induk Kependudukan)" 
                name="nik" 
                value={formData.nik} 
                onChange={handleChange} 
                required 
                type="number" 
                placeholder="Harus 16 Digit"
                error={validationErrors.nik}
              />
              
              <InputField label="Tempat Lahir" name="tempatLahir" value={formData.tempatLahir} onChange={handleChange} required />
              <InputField label="Tanggal Lahir" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleChange} required type="date" />
              
              <div className="grid grid-cols-2 gap-4">
                 <InputField label="Umur" name="umur" value={formData.umur} onChange={handleChange} required type="number" />
                 <SelectField 
                  label="Jenis Kelamin" 
                  name="jenisKelamin" 
                  value={formData.jenisKelamin} 
                  onChange={handleChange} 
                  required
                  options={[
                    { label: 'Laki-laki', value: 'Laki-laki' },
                    { label: 'Perempuan', value: 'Perempuan' }
                  ]}
                />
              </div>

              <SelectField 
                label="Status Perkawinan" 
                name="statusPerkawinan" 
                value={formData.statusPerkawinan} 
                onChange={handleChange} 
                required
                options={[
                  { label: 'Belum Menikah', value: 'Belum Menikah' },
                  { label: 'Menikah', value: 'Menikah' },
                  { label: 'Cerai', value: 'Cerai' }
                ]}
              />

              <SelectField 
                label="Agama" 
                name="agama" 
                value={formData.agama} 
                onChange={handleChange} 
                required
                options={[
                  { label: 'Islam', value: 'Islam' },
                  { label: 'Kristen', value: 'Kristen' },
                  { label: 'Katolik', value: 'Katolik' },
                  { label: 'Hindu', value: 'Hindu' },
                  { label: 'Buddha', value: 'Buddha' },
                  { label: 'Konghucu', value: 'Konghucu' },
                  { label: 'Lainnya', value: 'Lainnya' }
                ]}
              />
              
              {/* No HP VALIDATION */}
              <InputField 
                label="Nomor HP / WhatsApp" 
                name="noHp" 
                value={formData.noHp} 
                onChange={handleChange} 
                required 
                type="tel" 
                placeholder="08..." 
                error={validationErrors.noHp}
              />
              <InputField label="Nama Ayah Kandung" name="namaAyah" value={formData.namaAyah} onChange={handleChange} required />
              <InputField label="Nama Ibu Kandung" name="namaIbu" value={formData.namaIbu} onChange={handleChange} required />
            </div>
          </Section>

          {/* Section 3: Alamat */}
          <Section 
            title="Alamat & Domisili" 
            icon={<MapPin size={20} />}
          >
            <div className="space-y-6">
              <TextAreaField 
                label="Alamat Sesuai KTP" 
                name="alamatKtp" 
                value={formData.alamatKtp} 
                onChange={handleChange} 
                required 
                rows={3}
                placeholder="Jalan, Gang, Blok..."
              />
               <TextAreaField 
                label="Alamat Domisili Saat Ini" 
                name="alamatDomisili" 
                value={formData.alamatDomisili} 
                onChange={handleChange} 
                required 
                rows={3}
                placeholder="Jika sama dengan KTP, salin alamat di atas."
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <InputField label="RT / RW" name="rtRw" value={formData.rtRw} onChange={handleChange} required placeholder="001/002" />
                 <InputField label="Nomor Rumah" name="nomorRumah" value={formData.nomorRumah} onChange={handleChange} required />
                 <InputField label="Kode Pos" name="kodePos" value={formData.kodePos} onChange={handleChange} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <InputField label="Kelurahan" name="kelurahan" value={formData.kelurahan} onChange={handleChange} required />
                 <InputField label="Kecamatan" name="kecamatan" value={formData.kecamatan} onChange={handleChange} required />
                 <InputField label="Kota / Kabupaten" name="kota" value={formData.kota} onChange={handleChange} required />
              </div>
            </div>
          </Section>

          {/* Section 4: Pendidikan */}
          <Section 
            title="Latar Belakang Pendidikan" 
            icon={<GraduationCap size={20} />}
            description="Pendidikan terakhir yang Anda tempuh."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField 
                label="Tingkat Pendidikan Terakhir" 
                name="tingkatPendidikan" 
                value={formData.tingkatPendidikan} 
                onChange={handleChange} 
                required
                options={[
                  { label: 'SD / Sederajat', value: 'SD' },
                  { label: 'SMP / Sederajat', value: 'SMP' },
                  { label: 'SMA / SMK / Sederajat', value: 'SMA/SMK' },
                  { label: 'Diploma (D3)', value: 'D3' },
                  { label: 'Sarjana (S1)', value: 'S1' },
                  { label: 'Magister (S2)', value: 'S2' }
                ]}
              />
              <InputField label="Nama Sekolah / Universitas" name="namaSekolah" value={formData.namaSekolah} onChange={handleChange} required />
              
              <InputField label="Jurusan" name="jurusan" value={formData.jurusan} onChange={handleChange} required />
              <InputField label="IPK / Nilai Rata-rata" name="ipk" value={formData.ipk} onChange={handleChange} required placeholder="Contoh: 3.50" />

              <InputField label="Tahun Masuk" name="tahunMasuk" value={formData.tahunMasuk} onChange={handleChange} required type="number" placeholder="YYYY" />
              <InputField label="Tahun Lulus" name="tahunLulus" value={formData.tahunLulus} onChange={handleChange} required type="number" placeholder="YYYY" />
            </div>
          </Section>

          {/* Section 5: Pengalaman Kerja */}
          <Section 
            title="Status & Pengalaman Kerja" 
            icon={<Briefcase size={20} />}
            description="Silakan pilih status pengalaman kerja Anda saat ini."
          >
             {/* Pilihan Status: Fresh Graduate vs Berpengalaman */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => handleExperienceStatus(false)}
                  className={`
                    p-6 rounded-xl border-2 text-left transition-all flex items-start gap-4
                    ${!formData.hasPengalamanKerja 
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' 
                      : 'border-gray-200 hover:border-brand-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center shrink-0
                    ${!formData.hasPengalamanKerja ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-400'}
                  `}>
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h4 className={`font-bold ${!formData.hasPengalamanKerja ? 'text-brand-900' : 'text-gray-700'}`}>
                      Fresh Graduate
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Saya baru lulus atau belum memiliki pengalaman kerja formal.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleExperienceStatus(true)}
                  className={`
                    p-6 rounded-xl border-2 text-left transition-all flex items-start gap-4
                    ${formData.hasPengalamanKerja 
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' 
                      : 'border-gray-200 hover:border-brand-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center shrink-0
                    ${formData.hasPengalamanKerja ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-400'}
                  `}>
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h4 className={`font-bold ${formData.hasPengalamanKerja ? 'text-brand-900' : 'text-gray-700'}`}>
                      Berpengalaman
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Saya sudah pernah bekerja dan memiliki pengalaman profesional.
                    </p>
                  </div>
                </button>
             </div>

             {/* Detail Form for Experienced Users */}
             {formData.hasPengalamanKerja ? (
               <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6 animate-fadeIn">
                 
                 {/* Pertanyaan Spesifik Leasing (Nested) */}
                 <div className="bg-white p-4 rounded-lg border border-brand-100 shadow-sm">
                   <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                     <Building2 size={16} className="text-brand-600"/>
                     Apakah Anda memiliki pengalaman spesifik di dunia Leasing / Multifinance?
                   </label>
                   <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="isLeasing"
                          className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                          checked={formData.hasPengalamanLeasing}
                          onChange={() => handleCheckboxChange('hasPengalamanLeasing')(true)}
                        />
                        <span className="text-sm text-gray-700">Ya, Punya</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="isLeasing"
                          className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                          checked={!formData.hasPengalamanLeasing}
                          onChange={() => handleCheckboxChange('hasPengalamanLeasing')(false)}
                        />
                        <span className="text-sm text-gray-700">Tidak, Bidang Lain</span>
                      </label>
                   </div>
                 </div>

                 <div className="border-t border-slate-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Nama Perusahaan Terakhir" name="namaPerusahaan" value={formData.namaPerusahaan} onChange={handleChange} />
                        <InputField label="Posisi / Jabatan" name="posisiJabatan" value={formData.posisiJabatan} onChange={handleChange} />
                    </div>
                    <InputField label="Periode Kerja (Tahun)" name="periodeKerja" value={formData.periodeKerja} onChange={handleChange} placeholder="Contoh: 2020 - 2023" />
                    <TextAreaField 
                      label="Deskripsi Tugas & Tanggung Jawab" 
                      name="deskripsiTugas" 
                      value={formData.deskripsiTugas} 
                      onChange={handleChange} 
                      rows={4}
                      placeholder="Jelaskan secara singkat apa yang Anda kerjakan..."
                    />
                 </div>
               </div>
             ) : (
                <div className="text-center p-8 bg-green-50 rounded-xl border border-green-100 animate-fadeIn">
                  <h5 className="font-semibold text-green-800 mb-1">Terbuka untuk Lulusan Baru!</h5>
                  <p className="text-sm text-green-600">
                    Kami menyambut semangat belajar Anda. Silakan lanjutkan ke tahap berikutnya untuk melengkapi dokumen.
                  </p>
                </div>
             )}
          </Section>

          {/* Section 6: Dokumen & Checklist */}
          <Section 
            title="Kelengkapan Dokumen & Aset" 
            icon={<CheckSquare size={20} />}
          >
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Centang yang Anda miliki/sesuai:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <CheckboxField label="Kendaraan Pribadi" checked={formData.kendaraanPribadi} onChange={handleCheckboxChange('kendaraanPribadi')} />
                <CheckboxField label="KTP Asli" checked={formData.ktpAsli} onChange={handleCheckboxChange('ktpAsli')} />
                <CheckboxField label="SIM C (Motor)" checked={formData.simC} onChange={handleCheckboxChange('simC')} />
                <CheckboxField label="SIM A (Mobil)" checked={formData.simA} onChange={handleCheckboxChange('simA')} />
                <CheckboxField label="SKCK Aktif" checked={formData.skck} onChange={handleCheckboxChange('skck')} />
                <CheckboxField label="NPWP" checked={formData.npwp} onChange={handleCheckboxChange('npwp')} />
                <CheckboxField label="Riwayat Kredit Buruk?" subLabel="Centang jika pernah macet" checked={formData.riwayatBurukKredit} onChange={handleCheckboxChange('riwayatBurukKredit')} />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 mt-6">
               <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                 <FileText size={18} /> Upload Dokumen
               </h4>
               <p className="text-xs text-gray-500 mb-4">Maksimal ukuran file 2MB per dokumen.</p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FileUpload 
                    label="Upload CV / Resume" 
                    accept=".pdf,.doc,.docx" 
                    currentFile={formData.cvFile} 
                    onChange={handleFileChange('cvFile')}
                    required
                    error={validationErrors.cvFile}
                    maxSizeMB={2}
                 />
                 <FileUpload 
                    label="Upload KTP / Identitas" 
                    accept=".jpg,.jpeg,.png,.pdf" 
                    currentFile={formData.ktpFile} 
                    onChange={handleFileChange('ktpFile')}
                    required
                    error={validationErrors.ktpFile}
                    maxSizeMB={2}
                 />
               </div>
            </div>

            <div className="mt-6">
              <TextAreaField 
                label="Alasan Melamar" 
                name="alasanMelamar" 
                value={formData.alasanMelamar} 
                onChange={handleChange} 
                required 
                rows={4}
                placeholder="Jelaskan motivasi Anda bergabung dengan perusahaan kami..."
              />
            </div>
          </Section>

          {/* Section 7: Persetujuan & Submit */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-100 mb-8">
             <div className="flex items-start gap-4">
                <div className="shrink-0 text-brand-600 mt-1">
                   <ShieldCheck size={24} />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-gray-900 mb-2">Persetujuan Data</h3>
                   <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <input 
                        type="checkbox" 
                        id="terms"
                        className="mt-1 w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                        checked={formData.termsAccepted}
                        onChange={(e) => handleCheckboxChange('termsAccepted')(e.target.checked)}
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                        Saya menyatakan bahwa data yang saya isi adalah benar dan saya menyetujui <button type="button" onClick={() => setIsPrivacyModalOpen(true)} className="text-brand-600 font-bold hover:underline">Kebijakan Privasi</button> yang berlaku di PT Swapro International.
                      </label>
                   </div>
                   {validationErrors.termsAccepted && <p className="text-red-500 text-xs mt-2 ml-1">{validationErrors.termsAccepted}</p>}
                </div>
             </div>
          </div>

          {/* Submit Action */}
          <div className="sticky bottom-4 z-20">
            <div className="bg-white p-4 shadow-xl border border-gray-200 rounded-xl flex items-center justify-between max-w-4xl mx-auto">
               <div className="text-sm text-gray-500 hidden sm:block">
                 Pastikan data yang Anda isi sudah benar.
               </div>
               <button 
                type="submit"
                disabled={isSubmitting}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all
                  ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-900 transform hover:-translate-y-0.5'}
                `}
               >
                 {isSubmitting ? (
                   <>Processing...</>
                 ) : (
                   <>
                     <Send size={18} />
                     Kirim Lamaran
                   </>
                 )}
               </button>
            </div>
          </div>

        </form>
      </main>
      
      <footer className="max-w-4xl mx-auto mt-12 text-center text-gray-400 text-sm px-4">
        &copy; {new Date().getFullYear()} PT Swapro International. All rights reserved.
      </footer>
    </div>
  );
};