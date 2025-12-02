
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ApplicantDB } from '../types';
import { 
  LogOut, 
  Search, 
  FileText, 
  Download, 
  X, 
  User, 
  MapPin, 
  Briefcase, 
  Calendar,
  LayoutDashboard,
  Inbox,
  RefreshCcw,
  XCircle,
  CheckCircle,
  MessageCircle,
  ChevronRight,
  Filter,
  Quote,
  Trash2,
  Edit,
  Save,
  Plus,
  Copy,
  ClipboardCheck
} from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

type TabType = 'dashboard' | 'talent_pool' | 'process' | 'rejected' | 'hired';

// PIC Options
const PIC_OPTIONS = ['SUNAN', 'RENDY', 'DENDY', 'REHAN'];

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [applicants, setApplicants] = useState<ApplicantDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection & Editing
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantDB | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<ApplicantDB>>({});

  // COPY DATA EXCEL STATES
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copyFormData, setCopyFormData] = useState({
    pic: 'SUNAN',
    sentra: '',
    cabang: '',
    posisi: ''
  });

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplicants(data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('applicants')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Optimistic Update
      setApplicants(prev => prev.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));
      
      if (selectedApplicant && selectedApplicant.id === id) {
        setSelectedApplicant(prev => prev ? ({...prev, status: newStatus}) : null);
      }

    } catch (err) {
      console.error('Error updating status:', err);
      alert('Gagal mengubah status');
    } finally {
      setUpdatingId(null);
    }
  };

  // --- CRUD OPERATIONS ---

  // DELETE
  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data kandidat ini secara permanen?")) return;

    try {
      const { error } = await supabase
        .from('applicants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update Local State
      setApplicants(prev => prev.filter(app => app.id !== id));
      
      if (selectedApplicant?.id === id) {
        setSelectedApplicant(null);
        setIsEditing(false);
      }
      
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Gagal menghapus data.');
    }
  };

  // UPDATE (Open Edit Mode)
  const startEditing = () => {
    if (selectedApplicant) {
      setEditFormData(selectedApplicant);
      setIsEditing(true);
    }
  };

  // UPDATE (Save Changes)
  const saveChanges = async () => {
    if (!selectedApplicant || !editFormData) return;

    try {
      const { error } = await supabase
        .from('applicants')
        .update(editFormData)
        .eq('id', selectedApplicant.id);

      if (error) throw error;

      // Update Local State
      const updatedApplicant = { ...selectedApplicant, ...editFormData } as ApplicantDB;
      
      setApplicants(prev => prev.map(app => 
        app.id === selectedApplicant.id ? updatedApplicant : app
      ));
      
      setSelectedApplicant(updatedApplicant);
      setIsEditing(false);
      alert("Data berhasil diperbarui!");

    } catch (err) {
      console.error("Error updating:", err);
      alert("Gagal menyimpan perubahan.");
    }
  };

  // Helper for inputs in edit mode
  const handleEditChange = (field: keyof ApplicantDB, value: any) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- EXCEL COPY LOGIC ---
  const openCopyModal = () => {
    if (!selectedApplicant) return;

    // Auto-map position
    let shortPos = 'SO';
    const appliedPos = selectedApplicant.posisi_dilamar.toUpperCase();
    if (appliedPos.includes('KOLEKTOR') || appliedPos.includes('REMEDIAL')) {
        shortPos = 'COLLECTION';
    } else if (appliedPos.includes('RELATION')) {
        shortPos = 'RO';
    }

    setCopyFormData({
        pic: 'SUNAN',
        sentra: '',
        cabang: '',
        posisi: shortPos
    });
    setIsCopyModalOpen(true);
  };

  const executeCopy = () => {
    if (!selectedApplicant) return;

    const date = new Date().toLocaleDateString('id-ID'); // Format: DD/MM/YYYY or similar based on locale
    
    // Format Urutan: TANGGAL PENGIRIMAN | PIC | SENTRA | NIK | CABANG | NAMA KANDIDAT | POSISI | NO TELP
    const rowData = [
        date,
        copyFormData.pic,
        copyFormData.sentra,
        "'" + selectedApplicant.nik, // Add quote to prevent Excel scientific notation
        copyFormData.cabang,
        selectedApplicant.nama_lengkap,
        copyFormData.posisi,
        "'" + selectedApplicant.no_hp
    ].join('\t'); // Tab separated

    navigator.clipboard.writeText(rowData).then(() => {
        alert("Data berhasil disalin! Silakan Paste (Ctrl+V) di Excel.");
        setIsCopyModalOpen(false);
    }).catch(err => {
        console.error('Failed to copy', err);
        alert("Gagal menyalin ke clipboard.");
    });
  };


  // --- FILTERS ---
  const getFilteredApplicants = () => {
    let filtered = applicants;

    // Filter by Tab
    if (activeTab === 'talent_pool') {
      filtered = applicants.filter(a => a.status === 'new' || !a.status);
    } else if (activeTab === 'process') {
      filtered = applicants.filter(a => ['process', 'interview'].includes(a.status));
    } else if (activeTab === 'rejected') {
      filtered = applicants.filter(a => a.status === 'rejected');
    } else if (activeTab === 'hired') {
      filtered = applicants.filter(a => a.status === 'hired');
    }

    // Filter by Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.nama_lengkap.toLowerCase().includes(lowerTerm) ||
        app.posisi_dilamar.toLowerCase().includes(lowerTerm) ||
        app.penempatan.toLowerCase().includes(lowerTerm)
      );
    }

    return filtered;
  };

  // --- HELPERS ---
  const getFileUrl = (path: string) => {
    if (!path) return '#';
    const { data } = supabase.storage.from('documents').getPublicUrl(path);
    return data.publicUrl;
  };

  const generateWaLink = (phone: string, name: string) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const text = `Halo Sdr/i ${name}, kami dari HRD PT Swapro International ingin menginfokan terkait lamaran kerja Anda.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // --- STATS CALCULATION ---
  const stats = {
    total: applicants.length,
    new: applicants.filter(a => a.status === 'new' || !a.status).length,
    process: applicants.filter(a => ['process', 'interview'].includes(a.status)).length,
    hired: applicants.filter(a => a.status === 'hired').length,
    rejected: applicants.filter(a => a.status === 'rejected').length
  };

  const locationStats = applicants.reduce((acc, curr) => {
    const loc = curr.penempatan.split('-')[0] || curr.penempatan; // Simple grouping
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedLocations = Object.entries(locationStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5); // Top 5

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-brand-600 rounded flex items-center justify-center text-white font-bold">A</div>
          <span className="font-bold text-white tracking-wide">HR PORTAL</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>

          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pipeline</div>
          
          <button 
            onClick={() => setActiveTab('talent_pool')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'talent_pool' ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3"><Inbox size={18} /> Talent Pool</div>
            {stats.new > 0 && <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{stats.new}</span>}
          </button>

          <button 
            onClick={() => setActiveTab('process')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'process' ? 'bg-yellow-600/20 text-yellow-400' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3"><RefreshCcw size={18} /> Proses Seleksi</div>
            {stats.process > 0 && <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded-full">{stats.process}</span>}
          </button>

          <button 
            onClick={() => setActiveTab('hired')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'hired' ? 'bg-emerald-600/20 text-emerald-400' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3"><CheckCircle size={18} /> Diterima</div>
            {stats.hired > 0 && <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">{stats.hired}</span>}
          </button>

           <button 
            onClick={() => setActiveTab('rejected')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'rejected' ? 'bg-red-600/20 text-red-400' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3"><XCircle size={18} /> Ditolak</div>
            {stats.rejected > 0 && <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">{stats.rejected}</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 py-2 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} /> Keluar Sistem
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 ml-64 p-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
           <div>
              <h1 className="text-2xl font-bold text-slate-900 capitalize">
                {activeTab === 'dashboard' ? 'Overview' : activeTab.replace('_', ' ')}
              </h1>
              <p className="text-slate-500 text-sm">
                {activeTab === 'dashboard' ? 'Ringkasan aktivitas rekrutmen.' : 'Kelola data kandidat di tahap ini.'}
              </p>
           </div>
           
           <div className="flex items-center gap-4">
               {/* Add Manual Candidate Button (Placeholder) */}
               {activeTab !== 'dashboard' && (
                 <button 
                    onClick={() => alert("Fitur Tambah Kandidat Manual akan membuka form kosong (Segera Hadir).")} 
                    className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm"
                 >
                    <Plus size={18} /> Tambah Kandidat
                 </button>
               )}

               {activeTab !== 'dashboard' && (
                 <div className="relative w-72">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Cari kandidat..." 
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
               )}
           </div>
        </div>

        {/* DASHBOARD VIEW */}
        {activeTab === 'dashboard' ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Inbox size={24}/></div>
                     <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">+12%</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
                  <div className="text-sm text-slate-500">Total Pelamar Masuk</div>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><RefreshCcw size={24}/></div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{stats.process}</div>
                  <div className="text-sm text-slate-500">Sedang Diproses</div>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={24}/></div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{stats.hired}</div>
                  <div className="text-sm text-slate-500">Kandidat Diterima</div>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-2 bg-red-50 text-red-600 rounded-lg"><XCircle size={24}/></div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{stats.rejected}</div>
                  <div className="text-sm text-slate-500">Tidak Lolos</div>
               </div>
            </div>

            {/* Simple Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-6">Pelamar per Wilayah (Top 5)</h3>
                    <div className="space-y-4">
                        {sortedLocations.map(([loc, count], idx) => (
                           <div key={idx}>
                              <div className="flex justify-between text-sm mb-1">
                                 <span className="font-medium text-slate-700">{loc}</span>
                                 <span className="text-slate-500">{count} Orang</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2.5">
                                 <div 
                                    className="bg-brand-600 h-2.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${(count / stats.total) * 100}%` }}
                                 ></div>
                              </div>
                           </div>
                        ))}
                        {sortedLocations.length === 0 && <p className="text-gray-400 text-sm">Belum ada data cukup.</p>}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Aktivitas Terbaru</h3>
                    <div className="space-y-4">
                       {applicants.slice(0, 5).map(app => (
                          <div key={app.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                             <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                                {app.nama_lengkap.charAt(0)}
                             </div>
                             <div className="flex-1">
                                <div className="font-semibold text-slate-800 text-sm">{app.nama_lengkap}</div>
                                <div className="text-xs text-slate-500">Melamar sebagai {app.posisi_dilamar}</div>
                             </div>
                             <div className="text-xs text-slate-400">
                                {new Date(app.created_at).toLocaleDateString()}
                             </div>
                          </div>
                       ))}
                    </div>
                    <button onClick={() => setActiveTab('talent_pool')} className="w-full mt-4 text-brand-600 text-sm font-medium hover:underline">Lihat Semua</button>
                </div>
            </div>
          </div>
        ) : (
          /* TABLE VIEW FOR OTHER TABS */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
              {loading ? (
                <div className="p-12 text-center text-gray-500">Memuat data...</div>
              ) : getFilteredApplicants().length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                        <Filter size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">Tidak ada data</h3>
                    <p className="text-slate-500 mt-1">Belum ada kandidat di kategori ini.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-gray-200">
                        <th className="px-6 py-4 font-bold">Kandidat</th>
                        <th className="px-6 py-4 font-bold">Posisi</th>
                        <th className="px-6 py-4 font-bold">Domisili & Kontak</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                      {getFilteredApplicants().map((applicant) => (
                        <tr key={applicant.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-50 text-brand-700 rounded-full flex items-center justify-center font-bold">
                                    {applicant.nama_lengkap.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">{applicant.nama_lengkap}</div>
                                    <div className="text-xs text-slate-500">{new Date(applicant.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-800">{applicant.posisi_dilamar}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{applicant.penempatan}</div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="text-slate-800">{applicant.kota}</div>
                             <div className="text-xs text-slate-500">{applicant.no_hp}</div>
                          </td>
                          <td className="px-6 py-4">
                             <select 
                                value={applicant.status || 'new'}
                                onChange={(e) => updateStatus(applicant.id, e.target.value)}
                                disabled={updatingId === applicant.id}
                                className={`
                                    text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-brand-500
                                    ${applicant.status === 'new' ? 'bg-blue-100 text-blue-700' : 
                                      ['process', 'interview'].includes(applicant.status) ? 'bg-yellow-100 text-yellow-800' :
                                      applicant.status === 'hired' ? 'bg-emerald-100 text-emerald-800' : 
                                      'bg-red-100 text-red-800'}
                                `}
                             >
                                <option value="new">Baru</option>
                                <option value="process">Diproses</option>
                                <option value="interview">Interview</option>
                                <option value="hired">Diterima</option>
                                <option value="rejected">Ditolak</option>
                             </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a 
                                href={generateWaLink(applicant.no_hp, applicant.nama_lengkap)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Hubungi WhatsApp"
                              >
                                <MessageCircle size={18} />
                              </a>
                              <button 
                                onClick={() => { setSelectedApplicant(applicant); setIsEditing(false); }}
                                className="p-2 text-slate-600 hover:bg-slate-100 hover:text-brand-600 rounded-lg transition-colors"
                                title="Lihat Detail"
                              >
                                <FileText size={18} />
                              </button>
                               <button 
                                onClick={() => handleDelete(applicant.id)}
                                className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                                title="Hapus Data"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        )}
      </main>

      {/* DETAIL MODAL (Overlay) */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedApplicant(null)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  {selectedApplicant.nama_lengkap.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                      {selectedApplicant.nama_lengkap}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">Status: </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                          selectedApplicant.status === 'hired' ? 'bg-emerald-100 text-emerald-700' :
                          selectedApplicant.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                      }`}>
                          {selectedApplicant.status || 'NEW'}
                      </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                 
                 {/* COPY TO EXCEL BUTTON */}
                 {!isEditing && (
                    <button 
                        onClick={openCopyModal}
                        className="flex items-center gap-2 px-3 py-2 text-emerald-600 border border-emerald-200 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition shadow-sm"
                        title="Salin Data ke Excel"
                    >
                        <Copy size={16} /> <span className="hidden sm:inline">Salin Excel</span>
                    </button>
                 )}

                 {/* EDIT BUTTON */}
                 {isEditing ? (
                    <button 
                        onClick={saveChanges}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
                    >
                        <Save size={16} /> Simpan
                    </button>
                 ) : (
                    <button 
                        onClick={startEditing}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                        <Edit size={16} /> Edit
                    </button>
                 )}

                 <button onClick={() => setSelectedApplicant(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                    <X size={24} />
                 </button>
              </div>
            </div>

            {/* Modal Content - UPDATED FOR FULL DETAIL & EDITING */}
            <div className="p-8 overflow-y-auto bg-white space-y-8">
               {isEditing && (
                   <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4 text-yellow-800 text-sm">
                       Anda sedang dalam mode <strong>Edit</strong>. Silakan ubah data di bawah ini dan klik <strong>Simpan</strong>.
                   </div>
               )}

               {/* Files */}
               <div className="flex gap-4">
                  <a href={getFileUrl(selectedApplicant.cv_path)} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors">
                     <div className="flex items-center gap-3">
                        <FileText className="text-blue-600" />
                        <div><div className="font-semibold text-blue-900">CV / Resume</div></div>
                     </div>
                     <Download size={18} className="text-blue-400"/>
                  </a>
                  <a href={getFileUrl(selectedApplicant.ktp_path)} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors">
                     <div className="flex items-center gap-3">
                        <User className="text-emerald-600" />
                        <div><div className="font-semibold text-emerald-900">KTP / ID</div></div>
                     </div>
                     <Download size={18} className="text-emerald-400"/>
                  </a>
               </div>

               {/* Data Grids */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                      <h4 className="font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2"><User size={18}/> Data Pribadi</h4>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                          <dt className="text-gray-500 self-center">Nama Lengkap</dt>
                          <dd className="font-medium">
                              {isEditing ? <input className="w-full border p-1 rounded" value={editFormData.nama_lengkap || ''} onChange={e => handleEditChange('nama_lengkap', e.target.value)} /> : selectedApplicant.nama_lengkap}
                          </dd>

                          <dt className="text-gray-500 self-center">NIK</dt>
                          <dd className="font-medium">
                              {isEditing ? <input className="w-full border p-1 rounded" value={editFormData.nik || ''} onChange={e => handleEditChange('nik', e.target.value)} /> : selectedApplicant.nik}
                          </dd>

                          <dt className="text-gray-500">TTL</dt><dd className="font-medium">{selectedApplicant.tempat_lahir}, {new Date(selectedApplicant.tanggal_lahir).toLocaleDateString()}</dd>
                          <dt className="text-gray-500">Usia/JK</dt><dd className="font-medium">{selectedApplicant.umur} Thn / {selectedApplicant.jenis_kelamin}</dd>
                          <dt className="text-gray-500">Status</dt><dd className="font-medium">{selectedApplicant.status_perkawinan}</dd>
                          <dt className="text-gray-500">Agama</dt><dd className="font-medium">{selectedApplicant.agama}</dd>
                          <dt className="text-gray-500">Ibu Kandung</dt><dd className="font-medium">{selectedApplicant.nama_ibu}</dd>
                          <dt className="text-gray-500">Ayah Kandung</dt><dd className="font-medium">{selectedApplicant.nama_ayah}</dd>
                      </dl>
                  </div>
                  <div>
                      <h4 className="font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2"><MapPin size={18}/> Domisili & Kontak</h4>
                      <dl className="grid grid-cols-[80px_1fr] gap-y-2 text-sm">
                          <dt className="text-gray-500 self-center">No HP</dt>
                          <dd className="font-bold text-brand-600">
                             {isEditing ? <input className="w-full border p-1 rounded" value={editFormData.no_hp || ''} onChange={e => handleEditChange('no_hp', e.target.value)} /> : selectedApplicant.no_hp}
                          </dd>

                          <dt className="text-gray-500 self-center">Domisili</dt>
                          <dd className="font-medium">
                             {isEditing ? <textarea className="w-full border p-1 rounded" rows={2} value={editFormData.alamat_domisili || ''} onChange={e => handleEditChange('alamat_domisili', e.target.value)} /> : selectedApplicant.alamat_domisili}
                          </dd>

                          <dt className="text-gray-500">KTP</dt><dd className="font-medium text-gray-500">{selectedApplicant.alamat_ktp}</dd>
                          <dt className="text-gray-500">Detail</dt><dd className="font-medium">RT/RW {selectedApplicant.rt_rw}, Rumah No. {selectedApplicant.nomor_rumah}</dd>
                          <dt className="text-gray-500">Area</dt><dd className="font-medium">Kel. {selectedApplicant.kelurahan}, Kec. {selectedApplicant.kecamatan}, {selectedApplicant.kota} ({selectedApplicant.kode_pos})</dd>
                      </dl>
                  </div>
               </div>

               {/* Experience & Education */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                      <h4 className="font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2"><Briefcase size={18}/> Pendidikan</h4>
                      <div className="bg-gray-50 p-4 rounded-lg text-sm">
                          <div className="font-bold text-gray-900">{selectedApplicant.tingkat_pendidikan} - {selectedApplicant.nama_sekolah}</div>
                          <div className="text-gray-600">{selectedApplicant.jurusan}</div>
                          <div className="text-gray-500 mt-2 text-xs">Periode: {selectedApplicant.tahun_masuk} - {selectedApplicant.tahun_lulus} • IPK {selectedApplicant.ipk}</div>
                      </div>
                  </div>
                  <div>
                      <h4 className="font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2"><Calendar size={18}/> Pengalaman</h4>
                      {selectedApplicant.has_pengalaman_kerja ? (
                          <div className="bg-gray-50 p-4 rounded-lg text-sm">
                              {selectedApplicant.has_pengalaman_leasing && (
                                <div className="mb-2 bg-brand-50 text-brand-700 px-3 py-1 rounded text-xs font-bold inline-block border border-brand-200">
                                   Pengalaman Leasing / Multifinance
                                </div>
                              )}
                              <div className="font-bold text-gray-900">{selectedApplicant.nama_perusahaan}</div>
                              <div className="text-brand-700 font-medium">{selectedApplicant.posisi_jabatan}</div>
                              <div className="text-xs text-gray-500 mt-1">{selectedApplicant.periode_kerja}</div>
                              <div className="mt-2 text-gray-600 italic">"{selectedApplicant.deskripsi_tugas}"</div>
                          </div>
                      ) : (
                          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm italic">Fresh Graduate</div>
                      )}
                  </div>
               </div>
               
               {/* Assets */}
               <div>
                   <h4 className="font-bold text-gray-900 border-b pb-2 mb-4">Aset & Lainnya</h4>
                   <div className="flex flex-wrap gap-2">
                      {[
                            { label: 'KTP Asli', val: selectedApplicant.ktp_asli },
                            { label: 'Motor', val: selectedApplicant.kendaraan_pribadi },
                            { label: 'SIM C', val: selectedApplicant.sim_c },
                            { label: 'SIM A', val: selectedApplicant.sim_a },
                            { label: 'NPWP', val: selectedApplicant.npwp },
                            { label: 'SKCK', val: selectedApplicant.skck },
                            { label: 'Bad Credit', val: selectedApplicant.riwayat_buruk_kredit, alert: true },
                        ].map((item, idx) => (
                            <span key={idx} className={`px-3 py-1 rounded-full text-xs font-bold border ${item.val ? (item.alert ? 'bg-red-50 text-red-700 border-red-200' : 'bg-brand-50 text-brand-700 border-brand-200') : 'bg-gray-50 text-gray-400 border-gray-100 opacity-50'}`}>
                                {item.label}
                            </span>
                        ))}
                   </div>
               </div>

               {/* UPDATED: Added Motivation / Alasan Melamar */}
               <div className="col-span-1 md:col-span-2 mt-4 bg-yellow-50 p-6 rounded-lg border border-yellow-100">
                  <h4 className="font-bold text-yellow-900 mb-2 text-sm flex items-center gap-2">
                      <Quote size={16}/> Alasan Melamar
                  </h4>
                  <p className="text-sm text-yellow-800 italic leading-relaxed whitespace-pre-wrap">
                      "{selectedApplicant.alasan_melamar || "Tidak ada data."}"
                  </p>
               </div>

            </div>
          </div>
        </div>
      )}

      {/* EXCEL COPY MODAL */}
      {isCopyModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsCopyModalOpen(false)}></div>
              <div className="relative bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm animate-fadeIn">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <ClipboardCheck className="text-emerald-600"/> Salin Data Kandidat
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Lengkapi data berikut sebelum disalin ke Clipboard untuk ditempel ke Excel.</p>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">PIC (Pilih)</label>
                          <select 
                             className="w-full border rounded p-2 text-sm"
                             value={copyFormData.pic}
                             onChange={(e) => setCopyFormData({...copyFormData, pic: e.target.value})}
                          >
                             {PIC_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Sentra (Manual)</label>
                          <input 
                             type="text" 
                             className="w-full border rounded p-2 text-sm"
                             placeholder="Isi Sentra..."
                             value={copyFormData.sentra}
                             onChange={(e) => setCopyFormData({...copyFormData, sentra: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Cabang (Manual)</label>
                          <input 
                             type="text" 
                             className="w-full border rounded p-2 text-sm"
                             placeholder="Isi Cabang..."
                             value={copyFormData.cabang}
                             onChange={(e) => setCopyFormData({...copyFormData, cabang: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Posisi (Code)</label>
                          <select 
                             className="w-full border rounded p-2 text-sm"
                             value={copyFormData.posisi}
                             onChange={(e) => setCopyFormData({...copyFormData, posisi: e.target.value})}
                          >
                             <option value="SO">SO</option>
                             <option value="RO">RO</option>
                             <option value="COLLECTION">COLLECTION</option>
                          </select>
                      </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                      <button 
                        onClick={executeCopy}
                        className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition"
                      >
                          Salin Sekarang
                      </button>
                      <button 
                        onClick={() => setIsCopyModalOpen(false)}
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50"
                      >
                          Batal
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
