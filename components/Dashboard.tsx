
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
  Filter,
  Trash2,
  Edit,
  Save,
  Plus,
  Copy,
  Building2,
  Phone,
  Quote,
  ClipboardCheck
} from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

type TabType = 'dashboard' | 'talent_pool' | 'process' | 'rejected' | 'hired';

const PIC_OPTIONS = ['SUNAN', 'ADMIN'];

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

  const handleEditChange = (field: keyof ApplicantDB, value: any) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- EXCEL COPY LOGIC ---
  const openCopyModal = () => {
    if (!selectedApplicant) return;

    // Auto-map position logic
    let shortPos = 'SO';
    const appliedPos = (selectedApplicant.posisi_dilamar || '').toUpperCase();
    
    if (appliedPos.includes('KOLEKTOR') || appliedPos.includes('REMEDIAL')) {
        shortPos = 'COLLECTION';
    } else if (appliedPos.includes('RELATION')) {
        shortPos = 'RO';
    } else if (appliedPos.includes('SALES')) {
        shortPos = 'SO';
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

    const date = new Date().toLocaleDateString('id-ID'); // Format: DD/MM/YYYY
    
    // Format Urutan: TANGGAL PENGIRIMAN | PIC | SENTRA | NIK | CABANG | NAMA KANDIDAT | POSISI | NO TELP
    const rowData = [
        date,
        copyFormData.pic,
        copyFormData.sentra,
        "'" + selectedApplicant.nik, // Add quote to force string in Excel
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
        alert("Gagal menyalin ke clipboard. Izin browser mungkin ditolak.");
    });
  };


  // --- FILTERS ---
  const getFilteredApplicants = () => {
    let filtered = applicants;

    if (activeTab === 'talent_pool') {
      filtered = applicants.filter(a => a.status === 'new' || !a.status);
    } else if (activeTab === 'process') {
      filtered = applicants.filter(a => ['process', 'interview'].includes(a.status));
    } else if (activeTab === 'rejected') {
      filtered = applicants.filter(a => a.status === 'rejected');
    } else if (activeTab === 'hired') {
      filtered = applicants.filter(a => a.status === 'hired');
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        (app.nama_lengkap || '').toLowerCase().includes(lowerTerm) ||
        (app.posisi_dilamar || '').toLowerCase().includes(lowerTerm) ||
        (app.penempatan || '').toLowerCase().includes(lowerTerm)
      );
    }

    return filtered;
  };

  const getFileUrl = (path: string) => {
    if (!path) return '#';
    const { data } = supabase.storage.from('documents').getPublicUrl(path);
    return data.publicUrl;
  };

  const generateWaLink = (phone: string, name: string) => {
    if (!phone) return '#';
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const text = `Halo Sdr/i ${name}, kami dari HRD PT Swapro International ingin menginfokan terkait lamaran kerja Anda.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const stats = {
    total: applicants.length,
    new: applicants.filter(a => a.status === 'new' || !a.status).length,
    process: applicants.filter(a => ['process', 'interview'].includes(a.status)).length,
    hired: applicants.filter(a => a.status === 'hired').length,
    rejected: applicants.filter(a => a.status === 'rejected').length
  };

  const locationStats = applicants.reduce((acc, curr) => {
    const loc = (curr.penempatan || '').split('-')[0] || 'Lainnya'; 
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedLocations = Object.entries(locationStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

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
               {activeTab !== 'dashboard' && (
                 <button 
                    onClick={() => alert("Fitur Tambah Kandidat Manual akan segera hadir.")} 
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
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
                  <div className="text-sm text-slate-500">Total Pelamar</div>
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
                  <div className="text-sm text-slate-500">Diterima</div>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-2 bg-red-50 text-red-600 rounded-lg"><XCircle size={24}/></div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{stats.rejected}</div>
                  <div className="text-sm text-slate-500">Tidak Lolos</div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-6">Pelamar per Klien (Top 5)</h3>
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
                                <div className="text-xs text-slate-500 truncate w-48">{app.posisi_dilamar}</div>
                             </div>
                             <div className="text-xs text-slate-400">
                                {new Date(app.created_at).toLocaleDateString()}
                             </div>
                          </div>
                       ))}
                    </div>
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
                    <h3 className="text-lg font-semibold text-slate-900">Belum ada data pelamar.</h3>
                    <p className="text-slate-500">Data pelamar akan muncul di sini setelah ada yang mendaftar.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-gray-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Kandidat</th>
                                <th className="px-6 py-4">Posisi & Penempatan</th>
                                <th className="px-6 py-4">Kontak</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {getFilteredApplicants().map((app) => (
                                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center font-bold">
                                                {app.nama_lengkap.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">{app.nama_lengkap}</div>
                                                <div className="text-xs text-slate-500">{app.jenis_kelamin}, {app.umur} Thn</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-800">{app.posisi_dilamar}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{app.penempatan}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <a 
                                              href={generateWaLink(app.no_hp, app.nama_lengkap)} 
                                              target="_blank" 
                                              rel="noreferrer"
                                              className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-800 font-medium"
                                            >
                                                <MessageCircle size={14}/> {app.no_hp}
                                            </a>
                                            <span className="text-xs text-slate-400">{app.kota || 'Kota -'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select 
                                           value={app.status || 'new'}
                                           onChange={(e) => updateStatus(app.id, e.target.value)}
                                           disabled={updatingId === app.id}
                                           className={`
                                             text-xs font-semibold px-2 py-1 rounded-full border bg-white focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer
                                             ${app.status === 'new' ? 'text-blue-600 border-blue-200' : 
                                               app.status === 'rejected' ? 'text-red-600 border-red-200' :
                                               app.status === 'hired' ? 'text-emerald-600 border-emerald-200' :
                                               'text-yellow-600 border-yellow-200'}
                                           `}
                                        >
                                            <option value="new">Baru</option>
                                            <option value="process">Proses</option>
                                            <option value="interview">Interview</option>
                                            <option value="hired">Diterima</option>
                                            <option value="rejected">Ditolak</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => setSelectedApplicant(app)}
                                                className="text-brand-600 hover:bg-brand-50 p-2 rounded-lg transition-colors"
                                                title="Lihat Detail"
                                            >
                                                <FileText size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(app.id)}
                                                className="text-red-400 hover:bg-red-50 hover:text-red-600 p-2 rounded-lg transition-colors"
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

      {/* DETAIL MODAL */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => {setSelectedApplicant(null); setIsEditing(false);}}></div>
           <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-fadeIn overflow-hidden">
              
              {/* Header Modal */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50 shrink-0">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-slate-700 shadow-sm">
                        {selectedApplicant.nama_lengkap.charAt(0)}
                     </div>
                     <div>
                        <h2 className="text-xl font-bold text-slate-800">{selectedApplicant.nama_lengkap}</h2>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                           <Briefcase size={14}/> {selectedApplicant.posisi_dilamar}
                           <span>•</span>
                           <MapPin size={14}/> {selectedApplicant.penempatan}
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     {/* Edit Button */}
                     {!isEditing ? (
                        <button 
                          onClick={startEditing} 
                          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                        >
                            <Edit size={16} /> Edit Data
                        </button>
                     ) : (
                        <button 
                          onClick={saveChanges} 
                          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-brand-600 border border-brand-600 rounded-lg hover:bg-brand-700"
                        >
                            <Save size={16} /> Simpan
                        </button>
                     )}

                     {/* Copy Excel Button */}
                     <button 
                        onClick={openCopyModal}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                        title="Salin untuk Excel"
                     >
                        <Copy size={16} /> Salin Excel
                     </button>

                     <button 
                        onClick={() => {setSelectedApplicant(null); setIsEditing(false);}}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                     >
                        <X size={24} />
                     </button>
                  </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8 bg-white">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* LEFT COLUMN: Data Diri & Kontak */}
                    <div className="space-y-8">
                        {/* Dokumen */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText size={18} /> Dokumen Pelamar</h3>
                           <div className="flex gap-4">
                              <a href={getFileUrl(selectedApplicant.cv_path)} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-lg text-sm font-medium text-brand-600 hover:bg-brand-50 hover:border-brand-200 transition-colors">
                                 <Download size={16} /> Download CV
                              </a>
                              <a href={getFileUrl(selectedApplicant.ktp_path)} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-lg text-sm font-medium text-brand-600 hover:bg-brand-50 hover:border-brand-200 transition-colors">
                                 <Download size={16} /> Foto KTP
                              </a>
                           </div>
                        </div>

                        {/* Data Pribadi */}
                        <div>
                           <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2"><User size={18} /> Data Pribadi</h3>
                           <div className="space-y-4 text-sm">
                              <div className="grid grid-cols-2">
                                 <span className="text-slate-500">NIK (KTP)</span>
                                 {isEditing ? (
                                    <input className="border p-1 rounded" value={editFormData.nik || ''} onChange={e => handleEditChange('nik', e.target.value)} />
                                 ) : (
                                    <span className="font-medium text-slate-900">{selectedApplicant.nik}</span>
                                 )}
                              </div>
                              <div className="grid grid-cols-2">
                                 <span className="text-slate-500">Tempat, Tgl Lahir</span>
                                 <span className="font-medium text-slate-900">{selectedApplicant.tempat_lahir}, {new Date(selectedApplicant.tanggal_lahir).toLocaleDateString()}</span>
                              </div>
                              <div className="grid grid-cols-2">
                                 <span className="text-slate-500">Usia & Gender</span>
                                 <span className="font-medium text-slate-900">{selectedApplicant.umur} Tahun / {selectedApplicant.jenis_kelamin}</span>
                              </div>
                              <div className="grid grid-cols-2">
                                 <span className="text-slate-500">Status Perkawinan</span>
                                 <span className="font-medium text-slate-900">{selectedApplicant.status_perkawinan}</span>
                              </div>
                              <div className="grid grid-cols-2">
                                 <span className="text-slate-500">Agama</span>
                                 <span className="font-medium text-slate-900">{selectedApplicant.agama}</span>
                              </div>
                              <div className="grid grid-cols-2">
                                 <span className="text-slate-500">No HP / WA</span>
                                 {isEditing ? (
                                    <input className="border p-1 rounded" value={editFormData.no_hp || ''} onChange={e => handleEditChange('no_hp', e.target.value)} />
                                 ) : (
                                    <a href={generateWaLink(selectedApplicant.no_hp, selectedApplicant.nama_lengkap)} target="_blank" rel="noreferrer" className="font-medium text-green-600 hover:underline flex items-center gap-1">
                                       <MessageCircle size={14}/> {selectedApplicant.no_hp}
                                    </a>
                                 )}
                              </div>
                              <div className="grid grid-cols-2">
                                 <span className="text-slate-500">Nama Ibu Kandung</span>
                                 <span className="font-medium text-slate-900">{selectedApplicant.nama_ibu}</span>
                              </div>
                              <div className="grid grid-cols-2">
                                 <span className="text-slate-500">Nama Ayah Kandung</span>
                                 <span className="font-medium text-slate-900">{selectedApplicant.nama_ayah || '-'}</span>
                              </div>
                           </div>
                        </div>
                        
                        {/* Alamat */}
                        <div>
                           <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2"><MapPin size={18} /> Detail Alamat</h3>
                           <div className="bg-yellow-50 p-4 rounded-lg text-sm space-y-3">
                              <div>
                                 <span className="block text-xs text-yellow-600 font-bold uppercase mb-1">Alamat KTP</span>
                                 <p className="text-slate-800 leading-relaxed">
                                    {selectedApplicant.alamat_ktp}
                                 </p>
                              </div>
                              <div className="flex gap-4 border-t border-yellow-200 pt-3">
                                 <div><span className="text-xs text-slate-500 block">RT/RW</span> {selectedApplicant.rt_rw}</div>
                                 <div><span className="text-xs text-slate-500 block">No Rumah</span> {selectedApplicant.nomor_rumah}</div>
                                 <div><span className="text-xs text-slate-500 block">Kode Pos</span> {selectedApplicant.kode_pos}</div>
                              </div>
                              <div>
                                 <span className="block text-xs text-yellow-600 font-bold uppercase mb-1 mt-2">Wilayah</span>
                                 <p className="text-slate-800">
                                    Kel. {selectedApplicant.kelurahan}, Kec. {selectedApplicant.kecamatan}, {selectedApplicant.kota}
                                 </p>
                              </div>
                              {selectedApplicant.alamat_domisili !== selectedApplicant.alamat_ktp && (
                                 <div className="mt-3 pt-3 border-t border-yellow-200">
                                    <span className="block text-xs text-yellow-600 font-bold uppercase mb-1">Domisili Saat Ini</span>
                                    <p className="text-slate-800">{selectedApplicant.alamat_domisili}</p>
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Motivasi */}
                         <div>
                           <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2"><Quote size={18} /> Alasan Melamar</h3>
                           <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 italic border-l-4 border-brand-300">
                              "{selectedApplicant.alasan_melamar || 'Tidak ada keterangan.'}"
                           </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Pendidikan & Pengalaman */}
                    <div className="space-y-8">
                       
                       {/* Pendidikan */}
                       <div>
                           <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2"><Building2 size={18} /> Pendidikan Terakhir</h3>
                           <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                              <div className="flex justify-between items-start mb-2">
                                 <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-1 rounded">{selectedApplicant.tingkat_pendidikan}</span>
                                 <span className="text-sm text-slate-500">{selectedApplicant.tahun_masuk} - {selectedApplicant.tahun_lulus}</span>
                              </div>
                              <div className="font-bold text-slate-900 text-lg">{selectedApplicant.nama_sekolah}</div>
                              <div className="text-slate-600 text-sm mb-2">Jurusan: {selectedApplicant.jurusan}</div>
                              {selectedApplicant.ipk && (
                                 <div className="text-sm font-medium text-slate-800">IPK / Nilai: {selectedApplicant.ipk}</div>
                              )}
                           </div>
                       </div>

                       {/* Pengalaman Kerja */}
                       <div>
                           <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2"><Briefcase size={18} /> Riwayat Pekerjaan</h3>
                           
                           {selectedApplicant.has_pengalaman_kerja ? (
                              <div className={`p-5 rounded-xl border ${selectedApplicant.has_pengalaman_leasing ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                                 {selectedApplicant.has_pengalaman_leasing && (
                                    <div className="flex items-center gap-2 mb-3 text-green-700 font-bold text-xs uppercase bg-green-100 px-2 py-1 rounded w-fit">
                                       <CheckCircle size={12} /> Pengalaman Leasing / Multifinance
                                    </div>
                                 )}
                                 <h4 className="font-bold text-slate-900 text-lg">{selectedApplicant.posisi_jabatan}</h4>
                                 <div className="text-brand-600 font-medium mb-1">{selectedApplicant.nama_perusahaan}</div>
                                 <div className="text-xs text-slate-400 mb-4">{selectedApplicant.periode_kerja}</div>
                                 
                                 <div className="text-sm text-slate-700 leading-relaxed bg-white/50 p-3 rounded border border-black/5">
                                    <span className="block text-xs font-bold text-slate-400 mb-1 uppercase">Deskripsi Tugas:</span>
                                    {selectedApplicant.deskripsi_tugas}
                                 </div>
                              </div>
                           ) : (
                              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
                                 <span className="text-slate-400 font-medium">Fresh Graduate / Belum Berpengalaman</span>
                              </div>
                           )}
                       </div>

                       {/* Checklist Aset */}
                       <div>
                           <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2"><CheckCircle size={18} /> Aset & Kelengkapan</h3>
                           <div className="flex flex-wrap gap-2">
                              {[
                                 { label: 'Kendaraan Pribadi', val: selectedApplicant.kendaraan_pribadi },
                                 { label: 'KTP Asli', val: selectedApplicant.ktp_asli },
                                 { label: 'SIM C', val: selectedApplicant.sim_c },
                                 { label: 'SIM A', val: selectedApplicant.sim_a },
                                 { label: 'SKCK', val: selectedApplicant.skck },
                                 { label: 'NPWP', val: selectedApplicant.npwp },
                              ].map((item, idx) => (
                                 <span key={idx} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${item.val ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-100 line-through'}`}>
                                    {item.label}
                                 </span>
                              ))}
                           </div>
                           
                           {selectedApplicant.riwayat_buruk_kredit && (
                              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-700 text-sm font-medium">
                                 <XCircle size={16} /> Memiliki Riwayat Kredit Buruk / Macet
                              </div>
                           )}
                       </div>

                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- COPY TO EXCEL MODAL --- */}
      {isCopyModalOpen && selectedApplicant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCopyModalOpen(false)}></div>
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ClipboardCheck size={20} className="text-brand-600" /> 
                    Salin Data ke Excel
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                    Lengkapi data berikut sebelum menyalin. Format salinan disesuaikan untuk Paste di Excel.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PIC Rekruter</label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                            value={copyFormData.pic}
                            onChange={(e) => setCopyFormData({...copyFormData, pic: e.target.value})}
                        >
                            {PIC_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sentra</label>
                            <input 
                                type="text" 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="Isi Sentra"
                                value={copyFormData.sentra}
                                onChange={(e) => setCopyFormData({...copyFormData, sentra: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cabang</label>
                            <input 
                                type="text" 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="Isi Cabang"
                                value={copyFormData.cabang}
                                onChange={(e) => setCopyFormData({...copyFormData, cabang: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Posisi (Short)</label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                            value={copyFormData.posisi}
                            onChange={(e) => setCopyFormData({...copyFormData, posisi: e.target.value})}
                        >
                            <option value="SO">SO (Sales Officer)</option>
                            <option value="RO">RO (Relation Officer)</option>
                            <option value="COLLECTION">COLLECTION</option>
                        </select>
                        <p className="text-xs text-slate-400 mt-1">Otomatis dipilih berdasarkan lamaran: <b>{selectedApplicant.posisi_dilamar}</b></p>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button 
                        onClick={() => setIsCopyModalOpen(false)}
                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={executeCopy}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                    >
                        <ClipboardCheck size={18} />
                        Salin Sekarang
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};
