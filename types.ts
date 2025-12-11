
export interface FormData {
  // Job Info
  client: string; // This holds ID now
  posisiDilamar: string; // This holds ID now
  penempatan: string; // This holds ID now

  // Personal Info
  namaLengkap: string;
  nik: string;
  noHp: string;
  tempatLahir: string;
  tanggalLahir: string;
  umur: number | '';
  jenisKelamin: 'Laki-laki' | 'Perempuan' | '';
  statusPerkawinan: 'Belum Menikah' | 'Menikah' | 'Cerai' | '';
  agama: string;
  namaAyah: string;
  namaIbu: string;

  // Address
  alamatKtp: string;
  alamatDomisili: string;
  rtRw: string;
  nomorRumah: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  kodePos: string;

  // Education
  tingkatPendidikan: 'SD' | 'SMP' | 'SMA/SMK' | 'D3' | 'S1' | 'S2' | '';
  namaSekolah: string;
  jurusan: string;
  tahunMasuk: string;
  tahunLulus: string;
  ipk: string;

  // Experience
  hasPengalamanKerja: boolean;
  hasPengalamanLeasing: boolean;
  namaPerusahaan: string;
  posisiJabatan: string;
  periodeKerja: string;
  deskripsiTugas: string;

  // Checklist
  kendaraanPribadi: boolean;
  ktpAsli: boolean;
  simC: boolean;
  simA: boolean;
  skck: boolean;
  npwp: boolean;
  riwayatBurukKredit: boolean;

  // Final
  alasanMelamar: string;
  termsAccepted: boolean; // Field baru untuk persetujuan privasi
  
  // Files
  cvFile: File | null;
  ktpFile: File | null;
}

export const INITIAL_DATA: FormData = {
  client: '',
  posisiDilamar: '',
  penempatan: '',
  namaLengkap: '',
  nik: '',
  noHp: '',
  tempatLahir: '',
  tanggalLahir: '',
  umur: '',
  jenisKelamin: '',
  statusPerkawinan: '',
  agama: '',
  namaAyah: '',
  namaIbu: '',
  alamatKtp: '',
  alamatDomisili: '',
  rtRw: '',
  nomorRumah: '',
  kelurahan: '',
  kecamatan: '',
  kota: '',
  kodePos: '',
  tingkatPendidikan: '',
  namaSekolah: '',
  jurusan: '',
  tahunMasuk: '',
  tahunLulus: '',
  ipk: '',
  hasPengalamanKerja: false,
  hasPengalamanLeasing: false,
  namaPerusahaan: '',
  posisiJabatan: '',
  periodeKerja: '',
  deskripsiTugas: '',
  kendaraanPribadi: false,
  ktpAsli: false,
  simC: false,
  simA: false,
  skck: false,
  npwp: false,
  riwayatBurukKredit: false,
  alasanMelamar: '',
  termsAccepted: false,
  cvFile: null,
  ktpFile: null,
};

// Interface untuk Data dari Database (Snake Case)
export interface ApplicantDB {
  id: number;
  created_at: string;
  
  // Relational Fields (New System)
  client_id: number | null;
  position_id: number | null;
  placement_id: number | null;

  // Legacy/Snapshot Fields (Backup Text)
  mitra_klien: string; 
  posisi_dilamar: string;
  penempatan: string;
  
  nama_lengkap: string;
  nik: string;
  no_hp: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  umur: number;
  jenis_kelamin: string;
  status_perkawinan: string;
  agama: string;
  nama_ayah: string;
  nama_ibu: string;
  alamat_ktp: string;
  alamat_domisili: string;
  rt_rw: string;
  nomor_rumah: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  kode_pos: string;
  tingkat_pendidikan: string;
  nama_sekolah: string;
  jurusan: string;
  tahun_masuk: string;
  tahun_lulus: string;
  ipk: string;
  has_pengalaman_kerja: boolean;
  has_pengalaman_leasing: boolean;
  nama_perusahaan: string;
  posisi_jabatan: string;
  periode_kerja: string;
  deskripsi_tugas: string;
  kendaraan_pribadi: boolean;
  ktp_asli: boolean;
  sim_c: boolean;
  sim_a: boolean;
  skck: boolean;
  npwp: boolean;
  riwayat_buruk_kredit: boolean;
  alasan_melamar: string;
  cv_path: string;
  ktp_path: string;
  status: string; // 'new' | 'process' | 'interview' | 'rejected' | 'hired'
  internal_notes: string; // Catatan khusus HRD
}

// Interface untuk Sesi Interview & Proses (UPDATED)
export interface InterviewSession {
  id: number;
  applicant_id: number;
  created_at: string;
  chain_id: string; // ID Unik untuk 1 Rangkaian (misal: timestamp start)
  step_type: 'interview' | 'slik' | 'pemberkasan' | 'join'; // Tipe Langkah
  interview_date: string; // Tanggal utama kegiatan
  location: string;
  interviewer: string; // PIC / Pemeriksa
  status: 'scheduled' | 'passed' | 'failed' | 'cancelled';
  result_note: string;
  meta_data: {
      client?: string;
      position?: string;
      placement?: string;
      interviewer_job?: string; // Jabatan pewawancara
      kol_result?: string; // KOL 1, 2, 5
      contract_date?: string; // Untuk Join
      [key: string]: any;
  };
}

// Interface untuk Master Data
export interface JobClient {
  id: number;
  name: string;
  is_active: boolean; // Fitur Hide
}

export interface JobPosition {
  id: number;
  name: string;
  value: string;
  client_id: number;
  is_active: boolean; // Fitur Hide
}

export interface JobPlacement {
  id: number;
  label: string;
  value: string;
  recruiter_phone: string;
  position_id: number; // CHANGED: Now relates to Position, not Client
  is_active: boolean; // Fitur Hide
}
