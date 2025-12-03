
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { FormData, INITIAL_DATA, JobPosition, JobPlacement, JobClient } from '../types';
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
  ShieldCheck,
  MessageCircle
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
  const [allClients, setAllClients] = useState<JobClient[]>([]);
  const [allPositions, setAllPositions] = useState<JobPosition[]>([]);
  const [allPlacements, setAllPlacements] = useState<JobPlacement[]>([]);
  
  // Filtered Options
  const [clientOptions, setClientOptions] = useState<{label: string, value: string}[]>([]);
  const [positionOptions, setPositionOptions] = useState<{label: string, value: string}[]>([]);
  const [placementOptions, setPlacementOptions] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    const fetchMasterData = async () => {
      // Fetch Clients
      const { data: clData } = await supabase.from('job_clients').select('*').order('name');
      if (clData) {
        setAllClients(clData);
        // HANYA TAMPILKAN YANG AKTIF
        setClientOptions(clData.filter(c => c.is_active).map(c => ({ label: c.name, value: c.id.toString() })));
      }

      // Fetch Positions
      const { data: posData } = await supabase.from('job_positions').select('*').order('name');
      if (posData) setAllPositions(posData);

      // Fetch Placements
      const { data: placeData } = await supabase.from('job_placements').select('*').order('label');
      if (placeData) setAllPlacements(placeData);
    };

    fetchMasterData();
  }, []);

  // Cascading Logic: When Client changes, update options
  useEffect(() => {
    if (formData.client) {
        const clientId = parseInt(formData.client);
        
        // Filter Positions by Client AND Active Status
        const filteredPos = allPositions.filter(p => p.client_id === clientId && p.is_active);
        setPositionOptions(filteredPos.map(p => ({ label: p.name, value: p.value })));

        // Filter Placements by Client AND Active Status
        const filteredPlace = allPlacements.filter(p => p.client_id === clientId && p.is_active);
        setPlacementOptions(filteredPlace.map(p => ({ label: p.label, value: p.value }))); 

    } else {
        // Reset if no client selected
        setPositionOptions([]);
        setPlacementOptions([]);
    }
  }, [formData.client, allPositions, allPlacements]);


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'nik' && value.length > 16) return; 

    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Reset dependent fields if Client changes
      if (name === 'client') {
          newData.posisiDilamar = '';
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
      hasPengalamanLeasing: hasExperience ? prev.hasPengalamanLeasing : false 
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
    if (!formData.termsAccepted) errors.termsAccepted = "Wajib menyetujui kebijakan privasi.";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
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

      const { error } = await supabase
        .from('applicants')
        .insert({
          posisi_dilamar: formData.posisiDilamar,
          penempatan: formData.penempatan, // Stores the value (e.g. ADIRA JAKARTA)
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
    // Determine WhatsApp Number based on the selected placement VALUE and CLIENT ID
    const selectedPlaceObj = allPlacements.find(p => p.value === formData.penempatan && p.client_id === parseInt(formData.client));
    const recruiterNumber = selectedPlaceObj ? selectedPlaceObj.recruiter_phone : "628123456789";
    const regionName = selectedPlaceObj ? selectedPlaceObj.label : formData.penempatan;

    const waMessage = `Halo Rekruter, saya ${formData.namaLengkap} telah mengisi formulir lamaran untuk posisi ${formData.posisiDilamar} di ${regionName}. Mohon arahan selanjutnya.`;
    const waLink = `https://wa.me/${recruiterNumber}?text=${encodeURIComponent(waMessage)}`;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full p-8 rounded-2xl shadow-xl text-center animate-fadeIn">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckSquare size={40} /></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h2>
          <p className="text-gray-600 mb-8">Terima kasih, <strong>{formData.namaLengkap}</strong>. Data Anda telah kami terima.</p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-left">
             <h4 className="text-green-800 font-bold flex items-center gap-2 mb-2"><MessageCircle size={18} />Langkah Selanjutnya (Wajib):</h4>
             <p className="text-sm text-green-700 mb-4 leading-relaxed">Silakan konfirmasi ke <strong>Rekruter {regionName}</strong> via WhatsApp.</p>
             <a href={waLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-green-600 text-white font-bold py-3.5 rounded-lg hover:bg-green-700 transition-all shadow-lg">
                <MessageCircle size={20} /> Hubungi Rekruter Sekarang
             </a>
          </div>
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-sm py-2">Kembali ke Beranda</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 animate-fadeIn">
      <PrivacyPolicy isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
      <div className="h-64 bg-slate-900 relative overflow-hidden">
         <img src="/images/form-header.jpg" onError={(e)=>e.currentTarget.src="https://i.imgur.com/M3N0POE.jpeg"} alt="Bg" className="w-full h-full object-cover opacity-30"/>
         <div className="absolute top-6 left-6 z-20">
            <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm"><ArrowLeft size={18} /> Kembali</button>
         </div>
         <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
           <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight text-center">Formulir Pendaftaran Kerja</h1>
           <p className="text-lg opacity-90 max-w-1xl text-center">Bergabunglah dengan PT Swapro International</p>
         </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        {errorMessage && <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm"><AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} /><div><h4 className="font-semibold text-red-700">Gagal Mengirim</h4><p className="text-sm text-red-600 mt-1">{errorMessage}</p></div></div>}
        
        <form onSubmit={handleSubmit}>
          {/* Section 1: Lowongan (Cascading) */}
          <Section title="Informasi Lowongan" icon={<Briefcase size={20} />} description="Pilih Klien terlebih dahulu, kemudian Posisi dan Penempatan.">
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
              
              {/* 2. Position & Placement (Dependent) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <SelectField 
                    label="Penempatan & Wilayah" 
                    name="penempatan" 
                    value={formData.penempatan} 
                    onChange={handleChange} 
                    required 
                    disabled={!formData.client} // Disable if no client
                    error={validationErrors.penempatan}
                    options={placementOptions}
                />
              </div>
            </div>
          </Section>

          {/* Section 2: Data Diri */}
          <Section title="Data Pribadi" icon={<User size={20} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Nama Lengkap" name="namaLengkap" value={formData.namaLengkap} onChange={handleChange} required />
              <InputField label="NIK" name="nik" value={formData.nik} onChange={handleChange} required type="number" placeholder="16 Digit" error={validationErrors.nik} />
              <InputField label="Tempat Lahir" name="tempatLahir" value={formData.tempatLahir} onChange={handleChange} required />
              <InputField label="Tanggal Lahir" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleChange} required type="date" />
              <div className="grid grid-cols-2 gap-4">
                 <InputField label="Umur" name="umur" value={formData.umur} onChange={handleChange} required type="number" />
                 <SelectField label="Jenis Kelamin" name="jenisKelamin" value={formData.jenisKelamin} onChange={handleChange} required options={[{ label: 'Laki-laki', value: 'Laki-laki' }, { label: 'Perempuan', value: 'Perempuan' }]} />
              </div>
              <SelectField label="Status Perkawinan" name="statusPerkawinan" value={formData.statusPerkawinan} onChange={handleChange} required options={[{ label: 'Belum Menikah', value: 'Belum Menikah' }, { label: 'Menikah', value: 'Menikah' }, { label: 'Cerai', value: 'Cerai' }]} />
              <SelectField label="Agama" name="agama" value={formData.agama} onChange={handleChange} required options={[{ label: 'Islam', value: 'Islam' }, { label: 'Kristen', value: 'Kristen' }, { label: 'Katolik', value: 'Katolik' }, { label: 'Hindu', value: 'Hindu' }, { label: 'Buddha', value: 'Buddha' }, { label: 'Lainnya', value: 'Lainnya' }]} />
              <InputField label="Nomor HP / WA" name="noHp" value={formData.noHp} onChange={handleChange} required type="tel" error={validationErrors.noHp} />
              <InputField label="Nama Ayah" name="namaAyah" value={formData.namaAyah} onChange={handleChange} required />
              <InputField label="Nama Ibu" name="namaIbu" value={formData.namaIbu} onChange={handleChange} required />
            </div>
          </Section>

          {/* Section 3: Alamat */}
          <Section title="Alamat" icon={<MapPin size={20} />}>
            <div className="space-y-6">
              <TextAreaField label="Alamat KTP" name="alamatKtp" value={formData.alamatKtp} onChange={handleChange} required rows={2} />
              <TextAreaField label="Alamat Domisili" name="alamatDomisili" value={formData.alamatDomisili} onChange={handleChange} required rows={2} />
              <div className="grid grid-cols-3 gap-6"><InputField label="RT/RW" name="rtRw" value={formData.rtRw} onChange={handleChange} required /><InputField label="No Rumah" name="nomorRumah" value={formData.nomorRumah} onChange={handleChange} required /><InputField label="Kode Pos" name="kodePos" value={formData.kodePos} onChange={handleChange} required /></div>
              <div className="grid grid-cols-3 gap-6"><InputField label="Kelurahan" name="kelurahan" value={formData.kelurahan} onChange={handleChange} required /><InputField label="Kecamatan" name="kecamatan" value={formData.kecamatan} onChange={handleChange} required /><InputField label="Kota/Kab" name="kota" value={formData.kota} onChange={handleChange} required /></div>
            </div>
          </Section>

          {/* Section 4: Pendidikan */}
          <Section title="Pendidikan" icon={<GraduationCap size={20} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField label="Tingkat Terakhir" name="tingkatPendidikan" value={formData.tingkatPendidikan} onChange={handleChange} required options={[{ label: 'SD', value: 'SD' }, { label: 'SMP', value: 'SMP' }, { label: 'SMA/SMK', value: 'SMA/SMK' }, { label: 'D3', value: 'D3' }, { label: 'S1', value: 'S1' }, { label: 'S2', value: 'S2' }]} />
              <InputField label="Nama Sekolah/Univ" name="namaSekolah" value={formData.namaSekolah} onChange={handleChange} required />
              <InputField label="Jurusan" name="jurusan" value={formData.jurusan} onChange={handleChange} required />
              {showIPK && <InputField label="IPK" name="ipk" value={formData.ipk} onChange={handleChange} required />}
              <InputField label="Tahun Masuk" name="tahunMasuk" value={formData.tahunMasuk} onChange={handleChange} required type="number" />
              <InputField label="Tahun Lulus" name="tahunLulus" value={formData.tahunLulus} onChange={handleChange} required type="number" />
            </div>
          </Section>

          {/* Section 5: Pengalaman */}
          <Section title="Pengalaman Kerja" icon={<Briefcase size={20} />}>
             <div className="grid grid-cols-2 gap-4 mb-8">
                <button type="button" onClick={() => handleExperienceStatus(false)} className={`p-4 border rounded text-center ${!formData.hasPengalamanKerja ? 'bg-brand-50 border-brand-500 font-bold text-brand-700' : 'bg-white'}`}>Fresh Graduate</button>
                <button type="button" onClick={() => handleExperienceStatus(true)} className={`p-4 border rounded text-center ${formData.hasPengalamanKerja ? 'bg-brand-50 border-brand-500 font-bold text-brand-700' : 'bg-white'}`}>Berpengalaman</button>
             </div>
             {formData.hasPengalamanKerja && (
               <div className="bg-slate-50 p-6 rounded border space-y-4">
                   <label className="block text-sm font-semibold">Pengalaman Leasing?</label>
                   <div className="flex gap-4 mb-4">
                      <label className="flex items-center gap-2"><input type="radio" checked={formData.hasPengalamanLeasing} onChange={() => handleCheckboxChange('hasPengalamanLeasing')(true)} /> Ya</label>
                      <label className="flex items-center gap-2"><input type="radio" checked={!formData.hasPengalamanLeasing} onChange={() => handleCheckboxChange('hasPengalamanLeasing')(false)} /> Tidak</label>
                   </div>
                   <div className="grid md:grid-cols-2 gap-4"><InputField label="Perusahaan" name="namaPerusahaan" value={formData.namaPerusahaan} onChange={handleChange} /><InputField label="Posisi" name="posisiJabatan" value={formData.posisiJabatan} onChange={handleChange} /></div>
                   <InputField label="Periode" name="periodeKerja" value={formData.periodeKerja} onChange={handleChange} />
                   <TextAreaField label="Deskripsi Tugas" name="deskripsiTugas" value={formData.deskripsiTugas} onChange={handleChange} />
               </div>
             )}
          </Section>

          {/* Section 6: Dokumen */}
          <Section title="Dokumen & Aset" icon={<CheckSquare size={20} />}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <CheckboxField label="Motor Pribadi" checked={formData.kendaraanPribadi} onChange={handleCheckboxChange('kendaraanPribadi')} />
                <CheckboxField label="KTP Asli" checked={formData.ktpAsli} onChange={handleCheckboxChange('ktpAsli')} />
                <CheckboxField label="SIM C" checked={formData.simC} onChange={handleCheckboxChange('simC')} />
                <CheckboxField label="SIM A" checked={formData.simA} onChange={handleCheckboxChange('simA')} />
                <CheckboxField label="SKCK" checked={formData.skck} onChange={handleCheckboxChange('skck')} />
                <CheckboxField label="NPWP" checked={formData.npwp} onChange={handleCheckboxChange('npwp')} />
                <CheckboxField label="Bad Credit History" checked={formData.riwayatBurukKredit} onChange={handleCheckboxChange('riwayatBurukKredit')} />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                 <FileUpload label="CV" accept=".pdf,.doc" currentFile={formData.cvFile} onChange={handleFileChange('cvFile')} required error={validationErrors.cvFile} />
                 <FileUpload label="KTP" accept=".jpg,.png,.pdf" currentFile={formData.ktpFile} onChange={handleFileChange('ktpFile')} required error={validationErrors.ktpFile} />
            </div>
            <div className="mt-4"><TextAreaField label="Alasan Melamar" name="alasanMelamar" value={formData.alasanMelamar} onChange={handleChange} required rows={3} /></div>
          </Section>

          <div className="bg-white p-6 rounded shadow mb-8 border">
             <div className="flex gap-3">
                <input type="checkbox" id="terms" checked={formData.termsAccepted} onChange={(e) => handleCheckboxChange('termsAccepted')(e.target.checked)} className="mt-1" />
                <label htmlFor="terms" className="text-sm">Saya setuju dengan <button type="button" onClick={() => setIsPrivacyModalOpen(true)} className="text-brand-600 font-bold">Kebijakan Privasi</button>.</label>
             </div>
             {validationErrors.termsAccepted && <p className="text-red-500 text-xs mt-1 ml-6">{validationErrors.termsAccepted}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-brand-600 text-white font-bold py-4 rounded-lg hover:bg-brand-700 transition shadow-lg mb-8 flex justify-center items-center gap-2">
             {isSubmitting ? "Mengirim..." : <><Send size={18}/> Kirim Lamaran</>}
          </button>
        </form>
      </main>
    </div>
  );
};