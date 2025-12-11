
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { FormData, INITIAL_DATA, JobPosition, JobPlacement } from '../types';
import { Section } from './Section';
import { InputField, SelectField, TextAreaField, CheckboxField, FileUpload } from './InputGroup';
import { PrivacyPolicy } from './PrivacyPolicy';
import { 
  Briefcase, 
  User, 
  MapPin, 
  GraduationCap, 
  CheckSquare, 
  Send,
  ArrowLeft,
  AlertCircle,
  MessageCircle,
  ShieldCheck,
  Check,
  Info,
  Rocket,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface JobFormProps {
  onBack: () => void;
}

export const JobForm: React.FC<JobFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Master Data
  const [allPositions, setAllPositions] = useState<JobPosition[]>([]);
  const [allPlacements, setAllPlacements] = useState<JobPlacement[]>([]);
  
  // Filtered Options
  const [clientOptions, setClientOptions] = useState<{label: string, value: string}[]>([]);
  const [positionOptions, setPositionOptions] = useState<{label: string, value: string}[]>([]);
  const [placementOptions, setPlacementOptions] = useState<{label: string, value: string}[]>([]);

  // Helpers to get text from IDs
  const getClientName = (id: string) => clientOptions.find(c => c.value === id)?.label || '';
  const getPositionName = (id: string) => positionOptions.find(p => p.value === id)?.label || '';
  const getPlacementName = (id: string) => placementOptions.find(p => p.value === id)?.label || '';

  useEffect(() => {
    const fetchMasterData = async () => {
      // Fetch Clients
      const { data: clData } = await supabase.from('job_clients').select('*').order('name');
      if (clData) {
        setClientOptions(clData.filter((c: any) => c.is_active).map((c: any) => ({ label: c.name, value: c.id.toString() })));
      }

      // Fetch Positions
      const { data: posData } = await supabase.from('job_positions').select('*').order('name');
      if (posData) setAllPositions(posData as JobPosition[]);

      // Fetch Placements
      const { data: placeData } = await supabase.from('job_placements').select('*').order('label');
      if (placeData) setAllPlacements(placeData as JobPlacement[]);
    };

    fetchMasterData();
  }, []);

  // Cascading Logic Level 1: Client -> Filter Positions
  useEffect(() => {
    if (formData.client) {
        const clientId = parseInt(formData.client);
        
        // Filter Positions by Client AND Active Status
        const filteredPos = allPositions.filter(p => p.client_id === clientId && p.is_active);
        // VALUE IS NOW ID (Stringified)
        setPositionOptions(filteredPos.map(p => ({ label: p.name, value: p.id.toString() })));

    } else {
        // Reset
        setPositionOptions([]);
    }
  }, [formData.client, allPositions]);

  // Cascading Logic Level 2: Position -> Filter Placements
  useEffect(() => {
     if (formData.posisiDilamar) {
        const positionId = parseInt(formData.posisiDilamar);
        
        // Filter Placements by POSITION ID
        const filteredPlace = allPlacements.filter(p => p.position_id === positionId && p.is_active);
        // VALUE IS NOW ID (Stringified)
        setPlacementOptions(filteredPlace.map(p => ({ label: p.label, value: p.id.toString() })));

     } else {
        setPlacementOptions([]);
     }
  }, [formData.posisiDilamar, allPlacements]);


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'nik' && value.length > 16) return; 

    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Reset dependent fields if Parent changes
      if (name === 'client') {
          newData.posisiDilamar = '';
          newData.penempatan = '';
      }
      if (name === 'posisiDilamar') {
          newData.penempatan = '';
      }

      if (name === 'tingkatPendidikan') {
         const isCollege = ['D3', 'S1', 'S2'].includes(value);
         if (!isCollege) newData.ipk = ''; 
      }
      return newData;
    });
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const showIPK = ['D3', 'S1', 'S2'].includes(formData.tingkatPendidikan);
  
  const handleCheckboxChange = (name: keyof FormData) => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
    if (name === 'termsAccepted' && checked && validationErrors.termsAccepted) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.termsAccepted;
        return newErrors;
      });
    }
  };

  const handleExperienceStatus = (hasExperience: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      hasPengalamanKerja: hasExperience,
      hasPengalamanLeasing: false // Default to false since UI is removed
    }));
  };

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.client) errors.client = "Klien wajib dipilih.";
    if (!formData.posisiDilamar) errors.posisiDilamar = "Posisi wajib dipilih.";
    if (!formData.penempatan) errors.penempatan = "Penempatan wajib dipilih.";
    
    if (!formData.nik) errors.nik = "NIK wajib diisi.";
    else if (formData.nik.length !== 16) errors.nik = `NIK harus 16 digit.`;

    if (!formData.noHp) errors.noHp = "No HP wajib diisi.";
    else if (formData.noHp.length < 10) errors.noHp = "Min 10 digit.";

    if (!formData.cvFile) errors.cvFile = "CV wajib diupload.";
    if (!formData.ktpFile) errors.ktpFile = "KTP wajib diupload.";
    if (!formData.termsAccepted) errors.termsAccepted = "Anda wajib menyetujui kebijakan privasi.";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      // Find the first error field and scroll to it if possible, or just top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    return true;
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const filePath = `${folder}/${Date.now()}_${cleanName}`;
      const { data, error } = await supabase.storage.from('documents').upload(filePath, file);
      if (error) throw error;
      return data?.path || null;
    } catch (err) { return null; }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return; 

    setIsSubmitting(true);
    
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('applicants')
        .select('id')
        .eq('nik', formData.nik)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingUser) throw new Error("NIK sudah terdaftar. Tidak dapat melamar kembali.");

      const cvPath = await uploadFile(formData.cvFile!, 'cv');
      const ktpPath = await uploadFile(formData.ktpFile!, 'ktp');

      if (!cvPath || !ktpPath) throw new Error("Gagal upload dokumen.");

      // SNAPSHOT DATA (Backup Text)
      const clientName = getClientName(formData.client);
      const posName = getPositionName(formData.posisiDilamar);
      const placeName = getPlacementName(formData.penempatan);

      const { error } = await supabase
        .from('applicants')
        .insert({
          // RELATIONAL IDS (For Dynamic Updates)
          client_id: parseInt(formData.client) || null,
          position_id: parseInt(formData.posisiDilamar) || null,
          placement_id: parseInt(formData.penempatan) || null,

          // SNAPSHOT TEXTS (For Legacy/Backup)
          mitra_klien: clientName, 
          posisi_dilamar: posName,
          penempatan: placeName, 

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
      setErrorMessage(err.message || "Kesalahan sistem.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    // Logic for WA Link based on ID selection
    let recruiterNumber = "628123456789";
    let regionName = "";
    
    // Find placement based on selected ID
    const selectedPlaceObj = allPlacements.find(p => p.id.toString() === formData.penempatan);
    if (selectedPlaceObj) {
        recruiterNumber = selectedPlaceObj.recruiter_phone;
        regionName = selectedPlaceObj.label;
    }

    const posName = getPositionName(formData.posisiDilamar);

    const waMessage = `Halo Rekruter, saya ${formData.namaLengkap} telah mengisi formulir lamaran untuk posisi ${posName} di ${regionName}. Mohon arahan selanjutnya.`;
    const waLink = `https://api.whatsapp.com/send?phone=${recruiterNumber}&text=${encodeURIComponent(waMessage)}`;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-scaleIn">
          {/* Header Celebration */}
          <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="relative z-10">
                <div className="w-24 h-24 bg-gradient-to-tr from-brand-400 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-900/50 border-4 border-slate-800">
                    <Rocket size={48} className="text-white animate-bounce-slow" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Lamaran Terkirim! 🚀</h2>
                <p className="text-brand-100">Terima kasih, {formData.namaLengkap}.</p>
             </div>
          </div>

          <div className="p-8">
             <p className="text-slate-600 text-center mb-8 leading-relaxed">
                Profil Anda luar biasa! Data Anda sudah masuk ke sistem kami.
                <br/>Satu langkah lagi untuk memulai karir impianmu.
             </p>

             {/* Golden Ticket Section */}
             <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-6 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-xs font-bold text-amber-500 uppercase tracking-widest border border-amber-200 rounded-full">
                    Langkah Wajib
                </div>
                
                <div className="text-center">
                    <h4 className="font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
                        <MessageCircle className="text-green-600" /> Konfirmasi ke HRD
                    </h4>
                    <p className="text-sm text-slate-600 mb-4">
                        Segera hubungi <strong>Rekruter {regionName}</strong> untuk validasi data Anda.
                    </p>
                    
                    <a 
                        href={waLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-green-200 hover:-translate-y-1 group"
                    >
                        <span>Lanjut Chat HRD Sekarang</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                    </a>
                </div>
             </div>

             <div className="mt-8 text-center">
                <button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">
                    Kembali ke Halaman Utama
                </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 animate-fadeIn">
      <PrivacyPolicy isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
      
      {/* HEADER SECTION */}
      <div className="h-72 bg-slate-900 relative overflow-hidden group">
         <img 
            src="/images/form-header.jpg" 
            onError={(e)=>e.currentTarget.src="https://i.imgur.com/M3N0POE.jpeg"} 
            alt="Office Background" 
            className="w-full h-full object-cover opacity-40 transition-transform duration-1000 group-hover:scale-105"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-slate-900/20" />
         
         <div className="absolute top-6 left-6 z-20">
            <button onClick={onBack} className="flex items-center gap-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-md transition-all border border-white/10 shadow-lg">
                <ArrowLeft size={18} /> <span className="font-medium text-sm">Kembali ke Beranda</span>
            </button>
         </div>
         
         <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 pt-10">
           <span className="bg-brand-500/20 border border-brand-400/30 text-brand-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-sm">Karir Profesional</span>
           <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight text-center drop-shadow-lg">Formulir Pendaftaran</h1>
           <p className="text-lg text-slate-300 max-w-xl text-center font-light">Lengkapi data diri Anda untuk bergabung dengan tim terbaik PT Swapro International.</p>
         </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 -mt-24 relative z-10">
        {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-lg animate-shake">
                <div className="p-2 bg-red-100 rounded-full text-red-600"><AlertCircle size={20} /></div>
                <div>
                    <h4 className="font-bold text-red-800">Gagal Mengirim Lamaran</h4>
                    <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
                </div>
            </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Section 1: Lowongan (Cascading 3 Level) */}
          <Section title="Informasi Lowongan" icon={<Briefcase size={20} />} description="Pilih Klien > Posisi > Penempatan secara berurutan.">
            <div className="space-y-6">
              {/* 1. Client Select */}
              <SelectField 
                label="Pilih Mitra Klien" 
                name="client" 
                value={formData.client} 
                onChange={handleChange} 
                required
                error={validationErrors.client}
                options={clientOptions}
              />
              
              {/* 2. Position (Depends on Client) */}
              <SelectField 
                    label="Posisi Dilamar" 
                    name="posisiDilamar" 
                    value={formData.posisiDilamar} 
                    onChange={handleChange} 
                    required
                    disabled={!formData.client} // Disable if no client
                    error={validationErrors.posisiDilamar}
                    options={positionOptions}
                />

              {/* 3. Placement (Depends on Position) */}
               <SelectField 
                    label="Penempatan & Wilayah" 
                    name="penempatan" 
                    value={formData.penempatan} 
                    onChange={handleChange} 
                    required 
                    disabled={!formData.posisiDilamar} // Disable if no position
                    error={validationErrors.penempatan}
                    options={placementOptions}
                />
            </div>
          </Section>

          {/* Section 2: Data Diri */}
          <Section title="Data Pribadi" icon={<User size={20} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Nama Lengkap" name="namaLengkap" value={formData.namaLengkap} onChange={handleChange} required />
              <InputField label="NIK (KTP)" name="nik" value={formData.nik} onChange={handleChange} required type="number" placeholder="16 Digit Angka" error={validationErrors.nik} />
              <InputField label="Tempat Lahir" name="tempatLahir" value={formData.tempatLahir} onChange={handleChange} required />
              <InputField label="Tanggal Lahir" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleChange} required type="date" />
              <div className="grid grid-cols-2 gap-4">
                 <InputField label="Umur" name="umur" value={formData.umur} onChange={handleChange} required type="number" />
                 <SelectField label="Jenis Kelamin" name="jenisKelamin" value={formData.jenisKelamin} onChange={handleChange} required options={[{ label: 'Laki-laki', value: 'Laki-laki' }, { label: 'Perempuan', value: 'Perempuan' }]} />
              </div>
              <SelectField label="Status Perkawinan" name="statusPerkawinan" value={formData.statusPerkawinan} onChange={handleChange} required options={[{ label: 'Belum Menikah', value: 'Belum Menikah' }, { label: 'Menikah', value: 'Menikah' }, { label: 'Cerai', value: 'Cerai' }]} />
              <SelectField label="Agama" name="agama" value={formData.agama} onChange={handleChange} required options={[{ label: 'Islam', value: 'Islam' }, { label: 'Kristen', value: 'Kristen' }, { label: 'Katolik', value: 'Katolik' }, { label: 'Hindu', value: 'Hindu' }, { label: 'Buddha', value: 'Buddha' }, { label: 'Lainnya', value: 'Lainnya' }]} />
              <InputField label="Nomor HP / WA" name="noHp" value={formData.noHp} onChange={handleChange} required type="tel" error={validationErrors.noHp} placeholder="08..." />
              <InputField label="Nama Ayah Kandung" name="namaAyah" value={formData.namaAyah} onChange={handleChange} required />
              <InputField label="Nama Ibu Kandung" name="namaIbu" value={formData.namaIbu} onChange={handleChange} required />
            </div>
          </Section>

          {/* Section 3: Alamat */}
          <Section title="Alamat Lengkap" icon={<MapPin size={20} />}>
            <div className="space-y-6">
              <TextAreaField label="Alamat Sesuai KTP" name="alamatKtp" value={formData.alamatKtp} onChange={handleChange} required rows={2} placeholder="Nama jalan, gang, patokan..." />
              <TextAreaField label="Alamat Domisili Saat Ini" name="alamatDomisili" value={formData.alamatDomisili} onChange={handleChange} required rows={2} placeholder="Jika sama dengan KTP, salin alamat KTP..." />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="RT/RW" name="rtRw" value={formData.rtRw} onChange={handleChange} required placeholder="001/002" />
                <InputField label="No Rumah" name="nomorRumah" value={formData.nomorRumah} onChange={handleChange} required />
                <InputField label="Kode Pos" name="kodePos" value={formData.kodePos} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="Kelurahan" name="kelurahan" value={formData.kelurahan} onChange={handleChange} required />
                <InputField label="Kecamatan" name="kecamatan" value={formData.kecamatan} onChange={handleChange} required />
                <InputField label="Kota/Kab" name="kota" value={formData.kota} onChange={handleChange} required />
              </div>
            </div>
          </Section>

          {/* Section 4: Pendidikan */}
          <Section title="Pendidikan Terakhir" icon={<GraduationCap size={20} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField label="Jenjang Pendidikan" name="tingkatPendidikan" value={formData.tingkatPendidikan} onChange={handleChange} required options={[{ label: 'SD', value: 'SD' }, { label: 'SMP', value: 'SMP' }, { label: 'SMA/SMK', value: 'SMA/SMK' }, { label: 'D3', value: 'D3' }, { label: 'S1', value: 'S1' }, { label: 'S2', value: 'S2' }]} />
              <InputField label="Nama Sekolah/Universitas" name="namaSekolah" value={formData.namaSekolah} onChange={handleChange} required />
              <InputField label="Jurusan" name="jurusan" value={formData.jurusan} onChange={handleChange} required />
              {showIPK && <InputField label="IPK" name="ipk" value={formData.ipk} onChange={handleChange} required placeholder="Contoh: 3.50" />}
              <InputField label="Tahun Masuk" name="tahunMasuk" value={formData.tahunMasuk} onChange={handleChange} required type="number" />
              <InputField label="Tahun Lulus" name="tahunLulus" value={formData.tahunLulus} onChange={handleChange} required type="number" />
            </div>
          </Section>

          {/* Section 5: Pengalaman */}
          <Section title="Pengalaman Kerja" icon={<Briefcase size={20} />}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <button 
                    type="button" 
                    onClick={() => handleExperienceStatus(false)} 
                    className={`p-5 border-2 rounded-xl text-center transition-all duration-300 relative overflow-hidden group ${!formData.hasPengalamanKerja ? 'bg-brand-50 border-brand-500 shadow-md' : 'bg-white border-gray-200 hover:border-brand-200'}`}
                >
                    {!formData.hasPengalamanKerja && <div className="absolute top-2 right-2 text-brand-600"><CheckSquare size={18}/></div>}
                    <div className={`font-bold text-lg mb-1 ${!formData.hasPengalamanKerja ? 'text-brand-700' : 'text-gray-600 group-hover:text-brand-600'}`}>Fresh Graduate</div>
                    <div className="text-xs text-gray-400">Belum memiliki pengalaman kerja</div>
                </button>
                <button 
                    type="button" 
                    onClick={() => handleExperienceStatus(true)} 
                    className={`p-5 border-2 rounded-xl text-center transition-all duration-300 relative overflow-hidden group ${formData.hasPengalamanKerja ? 'bg-brand-50 border-brand-500 shadow-md' : 'bg-white border-gray-200 hover:border-brand-200'}`}
                >
                    {formData.hasPengalamanKerja && <div className="absolute top-2 right-2 text-brand-600"><CheckSquare size={18}/></div>}
                    <div className={`font-bold text-lg mb-1 ${formData.hasPengalamanKerja ? 'text-brand-700' : 'text-gray-600 group-hover:text-brand-600'}`}>Berpengalaman</div>
                    <div className="text-xs text-gray-400">Sudah pernah bekerja sebelumnya</div>
                </button>
             </div>

             {formData.hasPengalamanKerja && (
               <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl space-y-4 animate-fadeIn">
                   <h4 className="font-bold text-slate-700 mb-2">Detail Pekerjaan Terakhir</h4>
                   <div className="grid md:grid-cols-2 gap-4"><InputField label="Nama Perusahaan" name="namaPerusahaan" value={formData.namaPerusahaan} onChange={handleChange} /><InputField label="Posisi/Jabatan" name="posisiJabatan" value={formData.posisiJabatan} onChange={handleChange} /></div>
                   <InputField label="Periode Kerja (Tahun - Tahun)" name="periodeKerja" value={formData.periodeKerja} onChange={handleChange} placeholder="Contoh: 2019 - 2022"/>
                   <TextAreaField label="Deskripsi Tugas Singkat" name="deskripsiTugas" value={formData.deskripsiTugas} onChange={handleChange} />
               </div>
             )}
          </Section>

          {/* Section 6: Dokumen */}
          <Section title="Dokumen & Aset" icon={<CheckSquare size={20} />}>
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Kelengkapan (Centang yang dimiliki)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <CheckboxField label="Motor Pribadi" checked={formData.kendaraanPribadi} onChange={handleCheckboxChange('kendaraanPribadi')} />
                    <CheckboxField label="KTP Asli" checked={formData.ktpAsli} onChange={handleCheckboxChange('ktpAsli')} />
                    <CheckboxField label="SIM C" checked={formData.simC} onChange={handleCheckboxChange('simC')} />
                    <CheckboxField label="SIM A" checked={formData.simA} onChange={handleCheckboxChange('simA')} />
                    <CheckboxField label="SKCK Aktif" checked={formData.skck} onChange={handleCheckboxChange('skck')} />
                    <CheckboxField label="NPWP" checked={formData.npwp} onChange={handleCheckboxChange('npwp')} />
                    <CheckboxField label="Riwayat Kredit Buruk" checked={formData.riwayatBurukKredit} onChange={handleCheckboxChange('riwayatBurukKredit')} error="Centang jika ada (BI Checking Kol 5)" />
                </div>
            </div>
            
            <div className="border-t border-gray-100 pt-6 mt-6">
                <div className="grid md:grid-cols-2 gap-8">
                    <FileUpload label="Upload CV Terbaru" accept=".pdf,.doc,.docx" currentFile={formData.cvFile} onChange={handleFileChange('cvFile')} required error={validationErrors.cvFile} />
                    <FileUpload label="Foto KTP (Jelas)" accept=".jpg,.jpeg,.png,.pdf" currentFile={formData.ktpFile} onChange={handleFileChange('ktpFile')} required error={validationErrors.ktpFile} />
                </div>
            </div>
            <div className="mt-6"><TextAreaField label="Motivasi Melamar" name="alasanMelamar" value={formData.alasanMelamar} onChange={handleChange} required rows={3} placeholder="Jelaskan secara singkat mengapa Anda tertarik dengan posisi ini..." /></div>
          </Section>

          {/* TRUST CARD - PRIVACY POLICY & SUBMIT */}
          <div className="bg-gradient-to-br from-brand-50 via-white to-brand-50 border border-brand-100 rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-sm">
             {/* Decorative Background Element */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>
             
             <div className="flex gap-5 relative z-10 flex-col md:flex-row">
                <div className="shrink-0 text-brand-600 bg-white p-3 rounded-full shadow-sm h-fit w-fit border border-brand-100 hidden md:block">
                    <ShieldCheck size={28} />
                </div>
                
                <div className="flex-1">
                   <div className="flex items-center gap-2 mb-2">
                        <div className="md:hidden text-brand-600"><ShieldCheck size={20} /></div>
                        <h4 className="font-bold text-gray-900 text-base">Pernyataan & Privasi Data</h4>
                   </div>
                   
                   <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                      Dengan mengirimkan formulir ini, Anda menyatakan bahwa seluruh data yang diisi adalah benar dan dapat dipertanggungjawabkan. Data Anda dilindungi enkripsi dan hanya digunakan untuk kepentingan rekrutmen PT Swapro International.
                   </p>
                   
                   <label className={`flex items-start gap-3 cursor-pointer group p-3 rounded-lg border transition-all duration-200 ${formData.termsAccepted ? 'bg-brand-50 border-brand-200' : 'bg-white border-gray-200 hover:border-brand-200'}`}>
                      <div className="relative flex items-center mt-0.5">
                          <input 
                              type="checkbox" 
                              className="sr-only" // Hide default checkbox
                              checked={formData.termsAccepted} 
                              onChange={(e) => handleCheckboxChange('termsAccepted')(e.target.checked)} 
                          />
                          <div className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center ${formData.termsAccepted ? 'bg-brand-600 border-brand-600' : 'bg-white border-gray-300 group-hover:border-brand-400'}`}>
                              {formData.termsAccepted && <Check size={14} className="text-white" strokeWidth={3} />}
                          </div>
                      </div>
                      <div className="text-sm text-gray-700 select-none">
                         Saya telah membaca dan menyetujui <button type="button" onClick={(e) => { e.preventDefault(); setIsPrivacyModalOpen(true); }} className="text-brand-600 font-bold hover:underline hover:text-brand-700">Kebijakan Privasi</button>.
                      </div>
                   </label>
                   {validationErrors.termsAccepted && <p className="text-red-500 text-xs mt-2 flex items-center gap-1 font-medium ml-1"><Info size={12}/> {validationErrors.termsAccepted}</p>}
                </div>
             </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="sticky bottom-4 z-30">
            <button 
                type="submit" 
                disabled={isSubmitting || !formData.termsAccepted} 
                className={`w-full font-bold py-4 rounded-xl transition-all shadow-xl flex justify-center items-center gap-3 text-lg
                    ${isSubmitting || !formData.termsAccepted 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:shadow-brand-500/30 hover:-translate-y-1'
                    }
                `}
            >
                {isSubmitting ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sedang Mengirim...
                    </>
                ) : (
                    <>
                        <Send size={20} className={formData.termsAccepted ? "animate-pulse" : ""} /> 
                        Kirim Lamaran Sekarang
                    </>
                )}
            </button>
            {!formData.termsAccepted && (
                <p className="text-center text-xs text-gray-400 mt-2 bg-white/80 backdrop-blur py-1 rounded">
                    Mohon centang persetujuan privasi di atas untuk mengaktifkan tombol kirim.
                </p>
            )}
          </div>

        </form>
      </main>
    </div>
  );
};
