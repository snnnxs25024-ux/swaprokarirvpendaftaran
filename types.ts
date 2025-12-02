export interface FormData {
  // Job Info
  posisiDilamar: string;
  penempatan: string;

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