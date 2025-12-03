
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ApplicantDB, JobPlacement, JobPosition, JobClient } from '../types';
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
  Quote,
  Trash2,
  Edit,
  Save,
  Plus,
  Copy,
  ClipboardCheck,
  CheckSquare,
  Square,
  ArrowUpDown,
  ListFilter,
  Settings,
  StickyNote,
  Building2,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

type TabType = 'dashboard' | 'talent_pool' | 'process' | 'rejected' | 'hired' | 'master_data';

const PIC_OPTIONS = ['SUNAN', 'RENDY', 'DENDY', 'REHAN'];

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [applicants, setApplicants] = useState<ApplicantDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterEducation, setFilterEducation] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantDB | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<ApplicantDB>>({});
  
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copyFormData, setCopyFormData] = useState({
    pic: 'SUNAN',
    sentra: '',
    cabang: '',
    posisi: ''
  });

  // MASTER DATA STATES
  const [clients, setClients] = useState<JobClient[]>([]);
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [placements, setPlacements] = useState<JobPlacement[]>([]);
  const [masterTab, setMasterTab] = useState<'clients' | 'positions' | 'placements'>('clients');

  // Input States for Master Data
  const [newClient, setNewClient] = useState('');
  const [newPosition, setNewPosition] = useState({ name: '', client_id: '' });
  const [newPlacement, setNewPlacement] = useState({ label: '', recruiter_phone: '', client_id: '' });

  useEffect(() => {
    fetchApplicants();
    fetchMasterData();
  }, []);

  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab, filterClient, filterEducation, searchTerm]);
  
  useEffect(() => {
    if (selectedApplicant) {
      setNoteInput(selectedApplicant.internal_notes || '');
    }
  }, [selectedApplicant]);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('applicants').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setApplicants(data || []);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const fetchMasterData = async () => {
      const { data: cl } = await supabase.from('job_clients').select('*').order('name');
      if (cl) setClients(cl);

      const { data: pos } = await supabase.from('job_positions').select('*').order('name');
      if (pos) setPositions(pos);

      const { data: place } = await supabase.from('job_placements').select('*').order('label');
      if (place) setPlacements(place);
  };

  const updateStatus = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase.from('applicants').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setApplicants(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
      if (selectedApplicant && selectedApplicant.id === id) setSelectedApplicant(prev => prev ? ({...prev, status: newStatus}) : null);
    } catch (err) { alert('Gagal mengubah status'); } finally { setUpdatingId(null); }
  };

  const handleSaveNote = async () => {
    if (!selectedApplicant) return;
    setSavingNote(true);
    try {
        const { error } = await supabase.from('applicants').update({ internal_notes: noteInput }).eq('id', selectedApplicant.id);
        if (error) throw error;
        const updated = { ...selectedApplicant, internal_notes: noteInput };
        setSelectedApplicant(updated);
        setApplicants(prev => prev.map(a => a.id === updated.id ? updated : a));
        alert("Catatan disimpan.");
    } catch (err) { alert("Gagal menyimpan."); } finally { setSavingNote(false); }
  };

  const toggleSelectAll = (displayedIds: number[]) => {
    if (selectedIds.length === displayedIds.length && displayedIds.length > 0) setSelectedIds([]); 
    else setSelectedIds(displayedIds);
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (!window.confirm(`Update ${selectedIds.length} data?`)) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('applicants').update({ status: newStatus }).in('id', selectedIds);
      if (error) throw error;
      setApplicants(prev => prev.map(app => selectedIds.includes(app.id) ? { ...app, status: newStatus } : app));
      setSelectedIds([]);
    } catch (err) { alert("Gagal update massal."); } finally { setLoading(false); }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`HAPUS ${selectedIds.length} DATA?`)) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('applicants').delete().in('id', selectedIds);
      if (error) throw error;
      setApplicants(prev => prev.filter(app => !selectedIds.includes(app.id)));
      setSelectedIds([]);
    } catch (err) { alert("Gagal hapus massal."); } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus permanen?")) return;
    try {
      await supabase.from('applicants').delete().eq('id', id);
      setApplicants(prev => prev.filter(app => app.id !== id));
      if (selectedApplicant?.id === id) setSelectedApplicant(null);
    } catch (err) { alert('Gagal hapus.'); }
  };

  const startEditing = () => { if (selectedApplicant) { setEditFormData(selectedApplicant); setIsEditing(true); } };
  
  const saveChanges = async () => {
    if (!selectedApplicant) return;
    try {
      await supabase.from('applicants').update(editFormData).eq('id', selectedApplicant.id);
      const updated = { ...selectedApplicant, ...editFormData } as ApplicantDB;
      setApplicants(prev => prev.map(app => app.id === selectedApplicant.id ? updated : app));
      setSelectedApplicant(updated);
      setIsEditing(false);
      alert("Data updated!");
    } catch (err) { alert("Gagal update."); }
  };

  // --- EXCEL COPY ---
  const openCopyModal = () => {
    if (!selectedApplicant) return;
    let shortPos = 'SO';
    const appliedPos = selectedApplicant.posisi_dilamar.toUpperCase();
    if (appliedPos.includes('KOLEKTOR') || appliedPos.includes('REMEDIAL')) shortPos = 'COLLECTION';
    else if (appliedPos.includes('RELATION')) shortPos = 'RO';
    
    setCopyFormData({ pic: 'SUNAN', sentra: '', cabang: '', posisi: shortPos });
    setIsCopyModalOpen(true);
  };

  const executeCopy = () => {
    if (!selectedApplicant) return;
    const rowData = [
        new Date().toLocaleDateString('id-ID'),
        copyFormData.pic, copyFormData.sentra, "'" + selectedApplicant.nik,
        copyFormData.cabang, selectedApplicant.nama_lengkap, copyFormData.posisi, "'" + selectedApplicant.no_hp
    ].join('\t');
    navigator.clipboard.writeText(rowData).then(() => { alert("Disalin!"); setIsCopyModalOpen(false); });
  };

  // --- MASTER DATA HANDLERS ---
  
  // 1. Client Handlers
  const handleAddClient = async () => {
    if(!newClient.trim()) return;
    const { error } = await supabase.from('job_clients').insert({ name: newClient, is_active: true });
    if (!error) { setNewClient(''); fetchMasterData(); }
  };
  const toggleClient = async (id: number, currentStatus: boolean) => {
    await supabase.from('job_clients').update({ is_active: !currentStatus }).eq('id', id);
    fetchMasterData();
  };
  
  const handleDeleteClient = async (id: number) => {
    const confirmMsg = "⚠️ PERINGATAN KERAS!\n\nMenghapus Klien ini akan MENGHAPUS OTOMATIS semua Posisi dan Penempatan yang terhubung.\n\nApakah Anda yakin ingin melanjutkan?";
    if(!window.confirm(confirmMsg)) return;

    try {
        // 1. MANUAL CASCADE: Hapus Anak-anaknya Dulu (Posisi & Penempatan)
        // Ini memastikan penghapusan berhasil walaupun DB tidak diset ON DELETE CASCADE
        const { error: errPos } = await supabase.from('job_positions').delete().eq('client_id', id);
        if (errPos) throw new Error("Gagal hapus Posisi terkait: " + errPos.message);

        const { error: errPlace } = await supabase.from('job_placements').delete().eq('client_id', id);
        if (errPlace) throw new Error("Gagal hapus Penempatan terkait: " + errPlace.message);

        // 2. Hapus Bapaknya (Klien)
        const { error: errClient } = await supabase.from('job_clients').delete().eq('id', id);
        if (errClient) throw new Error("Gagal hapus Klien: " + errClient.message);
        
        alert("Klien dan data terkait berhasil dihapus.");
        fetchMasterData(); 
    } catch (err: any) {
        alert("GAGAL MENGHAPUS! \n\nDetail Error: " + (err.message || JSON.stringify(err)) + "\n\nSaran: Pastikan Policy RLS di Database sudah 'Enable Delete' untuk public/anon key.");
    }
  };

  // 2. Position Handlers
  const handleAddPosition = async () => {
    if(!newPosition.name.trim() || !newPosition.client_id) return alert("Isi nama dan pilih klien");
    const { error } = await supabase.from('job_positions').insert({ 
        name: newPosition.name, 
        value: newPosition.name.toUpperCase(),
        client_id: parseInt(newPosition.client_id),
        is_active: true
    });
    if (!error) { setNewPosition({name: '', client_id: ''}); fetchMasterData(); }
  };
  const togglePosition = async (id: number, currentStatus: boolean) => {
    await supabase.from('job_positions').update({ is_active: !currentStatus }).eq('id', id);
    fetchMasterData();
  };
  const handleDeletePosition = async (id: number) => {
    if(!window.confirm("Yakin ingin menghapus Posisi ini?")) return;
    const { error } = await supabase.from('job_positions').delete().eq('id', id);
    if(!error) fetchMasterData(); 
    else alert("Gagal hapus: " + error.message + "\nCek Policy RLS Database.");
  };

  // 3. Placement Handlers
  const handleAddPlacement = async () => {
     if(!newPlacement.label.trim() || !newPlacement.recruiter_phone.trim() || !newPlacement.client_id) return alert("Lengkapi data");
     const { error } = await supabase.from('job_placements').insert({
        label: newPlacement.label,
        value: newPlacement.label.replace(' - ', ' ').toUpperCase(),
        recruiter_phone: newPlacement.recruiter_phone,
        client_id: parseInt(newPlacement.client_id),
        is_active: true
     });
     if (!error) { setNewPlacement({label: '', recruiter_phone: '', client_id: ''}); fetchMasterData(); }
  };
  const togglePlacement = async (id: number, currentStatus: boolean) => {
    await supabase.from('job_placements').update({ is_active: !currentStatus }).eq('id', id);
    fetchMasterData();
  };
  const handleDeletePlacement = async (id: number) => {
     if(!window.confirm("Yakin ingin menghapus Penempatan ini?")) return;
     const { error } = await supabase.from('job_placements').delete().eq('id', id);
     if(!error) fetchMasterData(); 
     else alert("Gagal hapus: " + error.message + "\nCek Policy RLS Database.");
  };

  // --- FILTERS ---
  const getFilteredApplicants = () => {
    let filtered = applicants;
    if (activeTab === 'talent_pool') filtered = filtered.filter(a => a.status === 'new' || !a.status);
    else if (activeTab === 'process') filtered = filtered.filter(a => ['process', 'interview'].includes(a.status));
    else if (activeTab === 'rejected') filtered = filtered.filter(a => a.status === 'rejected');
    else if (activeTab === 'hired') filtered = filtered.filter(a => a.status === 'hired');

    if (filterClient) filtered = filtered.filter(a => a.penempatan.includes(filterClient));
    if (filterEducation) filtered = filtered.filter(a => a.tingkat_pendidikan === filterEducation);
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(app => app.nama_lengkap.toLowerCase().includes(lowerTerm) || app.penempatan.toLowerCase().includes(lowerTerm));
    }
    return filtered.sort((a, b) => sortOrder === 'newest' ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime() : new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const displayedApplicants = getFilteredApplicants();
  const getFileUrl = (path: string) => path ? supabase.storage.from('documents').getPublicUrl(path).data.publicUrl : '#';
  const generateWaLink = (phone: string, name: string) => `https://wa.me/${phone.replace(/\D/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(`Halo ${name}, info lamaran kerja.`)}`;

  const stats = {
    total: applicants.length,
    new: applicants.filter(a => a.status === 'new' || !a.status).length,
    process: applicants.filter(a => ['process', 'interview'].includes(a.status)).length,
    hired: applicants.filter(a => a.status === 'hired').length,
    rejected: applicants.filter(a => a.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <img src="https://i.imgur.com/Lf2IC1Z.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-white">SWA ADMIN</span>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${activeTab === 'dashboard' ? 'bg-brand-600 text-white' : 'hover:bg-slate-800'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase">Pipeline</div>
          {['talent_pool', 'process', 'hired', 'rejected'].map((tab) => (
             <button key={tab} onClick={() => setActiveTab(tab as any)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg ${activeTab === tab ? 'bg-slate-800 text-white' : 'hover:bg-slate-800'}`}>
                <div className="flex items-center gap-3 capitalize">{tab.replace('_', ' ')}</div>
                {/* @ts-ignore */}
                <span className="bg-slate-700 text-xs px-2 rounded-full">{stats[tab === 'talent_pool' ? 'new' : tab]}</span>
             </button>
          ))}
           <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase">System</div>
            <button onClick={() => setActiveTab('master_data')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${activeTab === 'master_data' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800'}`}>
            <Settings size={18} /> Master Data
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800"><button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-red-400 py-2"><LogOut size={16} /> Keluar</button></div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 capitalize">{activeTab.replace('_', ' ')}</h1>

        {activeTab === 'master_data' ? (
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 flex bg-gray-50">
                 {['clients', 'positions', 'placements'].map(tab => (
                    <button key={tab} onClick={() => setMasterTab(tab as any)} className={`px-6 py-3 text-sm font-bold uppercase ${masterTab === tab ? 'bg-white border-t-2 border-brand-600 text-brand-600' : 'text-gray-500'}`}>
                        {tab}
                    </button>
                 ))}
              </div>
              
              <div className="p-6">
                 {/* 1. CLIENTS TAB */}
                 {masterTab === 'clients' && (
                    <div className="max-w-xl">
                       <h3 className="font-bold mb-4 flex items-center gap-2"><Building2 size={18}/> Daftar Klien Mitra</h3>
                       <div className="flex gap-4 mb-6">
                          <input className="flex-1 border p-2 rounded" placeholder="Nama Klien (ex: ADIRA)" value={newClient} onChange={e => setNewClient(e.target.value)} />
                          <button onClick={handleAddClient} className="bg-brand-600 text-white px-4 py-2 rounded">Tambah</button>
                       </div>
                       <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4 text-sm text-yellow-800 flex items-start gap-2">
                          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                          <p>Hati-hati saat menghapus Klien. Menghapus Klien akan otomatis menghapus semua Posisi & Penempatan terkait.</p>
                       </div>
                       <table className="w-full text-sm border">
                           <thead className="bg-gray-100"><tr><th className="p-3 text-left">Nama Klien</th><th className="p-3 text-center">Visibility</th><th className="p-3 text-right">Aksi</th></tr></thead>
                           <tbody>
                               {clients.map(c => (
                                   <tr key={c.id} className={`border-t ${!c.is_active ? 'bg-gray-50 opacity-60' : ''}`}>
                                       <td className="p-3 font-bold">{c.name}</td>
                                       <td className="p-3 text-center">
                                          <button 
                                            onClick={() => toggleClient(c.id, c.is_active)} 
                                            className={`p-1.5 rounded-full transition-colors ${c.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                                            title={c.is_active ? "Sembunyikan" : "Tampilkan"}
                                          >
                                             {c.is_active ? <Eye size={20} /> : <EyeOff size={20} />}
                                          </button>
                                       </td>
                                       <td className="p-3 text-right">
                                          <button onClick={() => handleDeleteClient(c.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors" title="Hapus Permanen"><Trash2 size={18}/></button>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                    </div>
                 )}

                 {/* 2. POSITIONS TAB */}
                 {masterTab === 'positions' && (
                    <div className="max-w-2xl">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Briefcase size={18}/> Daftar Posisi</h3>
                        <div className="flex gap-4 mb-6">
                            <select 
                                className="border p-2 rounded" 
                                value={newPosition.client_id} 
                                onChange={e => setNewPosition({...newPosition, client_id: e.target.value})}
                            >
                                <option value="">-- Pilih Klien --</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <input 
                                className="flex-1 border p-2 rounded" 
                                placeholder="Nama Posisi (ex: SALES)" 
                                value={newPosition.name} 
                                onChange={e => setNewPosition({...newPosition, name: e.target.value})} 
                            />
                            <button onClick={handleAddPosition} className="bg-brand-600 text-white px-4 py-2 rounded">Tambah</button>
                        </div>
                        <table className="w-full text-sm border">
                            <thead className="bg-gray-100"><tr><th className="p-3 text-left">Klien</th><th className="p-3 text-left">Posisi</th><th className="p-3 text-center">Status</th><th className="p-3 text-right">Aksi</th></tr></thead>
                            <tbody>
                                {positions.map(p => {
                                    const clientName = clients.find(c => c.id === p.client_id)?.name || '-';
                                    return (
                                        <tr key={p.id} className={`border-t ${!p.is_active ? 'bg-gray-50 opacity-60' : ''}`}>
                                            <td className="p-3 text-gray-500">{clientName}</td>
                                            <td className="p-3 font-bold">{p.name}</td>
                                            <td className="p-3 text-center">
                                                <button onClick={() => togglePosition(p.id, p.is_active)} className={`p-1.5 rounded-full ${p.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {p.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                                                </button>
                                            </td>
                                            <td className="p-3 text-right">
                                                <button onClick={() => handleDeletePosition(p.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={18}/></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                 )}

                 {/* 3. PLACEMENTS TAB */}
                 {masterTab === 'placements' && (
                    <div className="max-w-4xl">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><MapPin size={18}/> Daftar Penempatan</h3>
                        <div className="flex gap-4 mb-6">
                            <select 
                                className="border p-2 rounded w-48" 
                                value={newPlacement.client_id} 
                                onChange={e => setNewPlacement({...newPlacement, client_id: e.target.value})}
                            >
                                <option value="">-- Pilih Klien --</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <input 
                                className="flex-1 border p-2 rounded" 
                                placeholder="Label Wilayah (ex: JAKARTA SELATAN)" 
                                value={newPlacement.label} 
                                onChange={e => setNewPlacement({...newPlacement, label: e.target.value})} 
                            />
                            <input 
                                className="w-48 border p-2 rounded" 
                                placeholder="No WA (628...)" 
                                value={newPlacement.recruiter_phone} 
                                onChange={e => setNewPlacement({...newPlacement, recruiter_phone: e.target.value})} 
                            />
                            <button onClick={handleAddPlacement} className="bg-brand-600 text-white px-4 py-2 rounded">Tambah</button>
                        </div>
                        <table className="w-full text-sm border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left">Klien</th>
                                    <th className="p-3 text-left">Wilayah</th>
                                    <th className="p-3 text-left">No. Rekruter</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {placements.map(p => {
                                    const clientName = clients.find(c => c.id === p.client_id)?.name || '-';
                                    return (
                                        <tr key={p.id} className={`border-t ${!p.is_active ? 'bg-gray-50 opacity-60' : ''}`}>
                                            <td className="p-3 text-gray-500">{clientName}</td>
                                            <td className="p-3 font-bold">{p.label}</td>
                                            <td className="p-3 font-mono text-xs">{p.recruiter_phone}</td>
                                            <td className="p-3 text-center">
                                                <button onClick={() => togglePlacement(p.id, p.is_active)} className={`p-1.5 rounded-full ${p.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {p.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                                                </button>
                                            </td>
                                            <td className="p-3 text-right">
                                                <button onClick={() => handleDeletePlacement(p.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={18}/></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                 )}
              </div>
           </div>
        ) : (
          /* STANDARD DASHBOARD TABS */
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="text-slate-500 text-sm mb-1">Total Pelamar</div>
                <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="text-brand-600 text-sm mb-1 font-semibold">Baru Masuk</div>
                <div className="text-3xl font-bold text-brand-600">{stats.new}</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="text-amber-500 text-sm mb-1 font-semibold">Sedang Proses</div>
                <div className="text-3xl font-bold text-amber-500">{stats.process}</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="text-green-600 text-sm mb-1 font-semibold">Diterima</div>
                <div className="text-3xl font-bold text-green-600">{stats.hired}</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2 w-full md:w-auto">
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Cari nama, posisi..." 
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                   </div>
                   <select className="border p-2 rounded-lg text-sm" value={filterClient} onChange={e => setFilterClient(e.target.value)}>
                      <option value="">Semua Klien</option>
                      {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                   </select>
                   <select className="border p-2 rounded-lg text-sm" value={filterEducation} onChange={e => setFilterEducation(e.target.value)}>
                      <option value="">Semua Pendidikan</option>
                      <option value="S1">S1</option><option value="D3">D3</option><option value="SMA/SMK">SMA/SMK</option>
                   </select>
                   <button onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')} className="p-2 border rounded bg-white" title="Sort Date"><ArrowUpDown size={18}/></button>
                </div>

                {selectedIds.length > 0 && (
                   <div className="flex items-center gap-2 animate-fadeIn bg-brand-50 px-3 py-1 rounded-lg border border-brand-100">
                      <span className="text-xs font-bold text-brand-700">{selectedIds.length} Dipilih</span>
                      <select onChange={(e) => { if(e.target.value) handleBulkStatusUpdate(e.target.value); }} className="text-xs border p-1 rounded">
                         <option value="">Ubah Status...</option>
                         <option value="process">Proses</option>
                         <option value="interview">Interview</option>
                         <option value="hired">Terima</option>
                         <option value="rejected">Tolak</option>
                      </select>
                      <button onClick={handleBulkDelete} className="text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 size={16}/></button>
                   </div>
                )}
                
                {/* Manual Add Placeholder */}
                <button className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700" onClick={() => alert("Fitur Tambah Kandidat Manual akan segera hadir.")}>
                   <Plus size={16}/> Tambah Kandidat
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="p-4 w-10"><button onClick={() => toggleSelectAll(displayedApplicants.map(a => a.id))}><CheckSquare size={16} className={selectedIds.length > 0 ? "text-brand-600" : "text-gray-400"} /></button></th>
                      <th className="p-4">Tanggal</th>
                      <th className="p-4">Kandidat</th>
                      <th className="p-4">Posisi & Klien</th>
                      <th className="p-4">Kontak</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedApplicants.map((app) => (
                      <tr key={app.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(app.id) ? 'bg-brand-50' : ''}`}>
                        <td className="p-4">
                           <button onClick={() => toggleSelection(app.id)}>
                              {selectedIds.includes(app.id) ? <CheckSquare size={18} className="text-brand-600"/> : <Square size={18} className="text-gray-300"/>}
                           </button>
                        </td>
                        <td className="p-4 text-sm text-slate-500">
                          {new Date(app.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          <div className="text-xs text-slate-400">{new Date(app.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{app.nama_lengkap}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            {app.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'} • {app.umur} Th • {app.tingkat_pendidikan}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-semibold text-brand-700">{app.posisi_dilamar}</div>
                          <div className="text-xs text-slate-500">{app.penempatan}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-slate-700">{app.no_hp}</div>
                          <div className="text-xs text-slate-400">{app.kota}</div>
                        </td>
                        <td className="p-4">
                           <select 
                              value={app.status || 'new'} 
                              onChange={(e) => updateStatus(app.id, e.target.value)}
                              className={`text-xs font-bold px-2 py-1 rounded-full border-0 cursor-pointer outline-none
                                ${app.status === 'hired' ? 'bg-green-100 text-green-700' : 
                                  app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  ['process', 'interview'].includes(app.status) ? 'bg-amber-100 text-amber-700' :
                                  'bg-blue-50 text-blue-600'}
                              `}
                           >
                              <option value="new">Baru</option>
                              <option value="process">Proses</option>
                              <option value="interview">Interview</option>
                              <option value="hired">Diterima</option>
                              <option value="rejected">Ditolak</option>
                           </select>
                           {app.internal_notes && <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-600"><StickyNote size={10}/> Ada Catatan</div>}
                        </td>
                        <td className="p-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <a href={generateWaLink(app.no_hp, app.nama_lengkap)} target="_blank" rel="noreferrer" className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="WhatsApp"><MessageCircle size={18} /></a>
                              <button onClick={() => setSelectedApplicant(app)} className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg" title="Detail"><FileText size={18} /></button>
                              <button onClick={() => handleDelete(app.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg" title="Hapus"><Trash2 size={18} /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {displayedApplicants.length === 0 && (
                      <tr><td colSpan={7} className="p-8 text-center text-slate-400">Tidak ada data ditemukan.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* DETAIL MODAL */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
               <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                     {isEditing ? <input className="border rounded px-2" value={editFormData.nama_lengkap} onChange={e=>setEditFormData({...editFormData, nama_lengkap: e.target.value})} /> : selectedApplicant.nama_lengkap}
                     <span className={`text-xs px-2 py-0.5 rounded border ${selectedApplicant.status === 'hired' ? 'bg-green-100 border-green-200 text-green-700' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>{selectedApplicant.status || 'NEW'}</span>
                  </h2>
                  <p className="text-sm text-gray-500">NIK: {selectedApplicant.nik} • Tgl Lamar: {new Date(selectedApplicant.created_at).toLocaleDateString()}</p>
               </div>
               <div className="flex gap-2">
                  {!isEditing ? (
                     <>
                        <button onClick={openCopyModal} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-sm font-semibold"><Copy size={16}/> Salin Excel</button>
                        <button onClick={startEditing} className="p-2 hover:bg-gray-200 rounded text-gray-500"><Edit size={20}/></button>
                        <button onClick={() => setSelectedApplicant(null)} className="p-2 hover:bg-gray-200 rounded text-gray-500"><X size={24} /></button>
                     </>
                  ) : (
                     <>
                        <button onClick={saveChanges} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"><Save size={16}/> Simpan</button>
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                     </>
                  )}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                   {/* INTERNAL NOTES SECTION */}
                   <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <h4 className="text-amber-800 font-bold text-sm mb-2 flex items-center gap-2"><StickyNote size={16}/> Catatan Internal HRD</h4>
                      <textarea 
                        className="w-full text-sm p-3 border rounded-lg focus:ring-amber-500 mb-2" 
                        rows={3} 
                        placeholder="Tulis catatan interview atau status kandidat di sini..."
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <button onClick={handleSaveNote} disabled={savingNote} className="bg-amber-600 text-white text-xs px-3 py-1.5 rounded hover:bg-amber-700">
                           {savingNote ? 'Menyimpan...' : 'Simpan Catatan'}
                        </button>
                      </div>
                   </div>

                   {/* DATA PRIBADI */}
                   <section>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Data Pribadi</h3>
                      <div className="grid grid-cols-2 gap-y-4 text-sm">
                         <div><label className="text-gray-500 block text-xs">Tempat, Tgl Lahir</label><span className="font-medium">{selectedApplicant.tempat_lahir}, {selectedApplicant.tanggal_lahir}</span></div>
                         <div><label className="text-gray-500 block text-xs">Jenis Kelamin</label><span className="font-medium">{selectedApplicant.jenis_kelamin}</span></div>
                         <div><label className="text-gray-500 block text-xs">Status Perkawinan</label><span className="font-medium">{selectedApplicant.status_perkawinan}</span></div>
                         <div><label className="text-gray-500 block text-xs">Agama</label><span className="font-medium">{selectedApplicant.agama}</span></div>
                         <div><label className="text-gray-500 block text-xs">Nama Ibu Kandung</label><span className="font-medium">{selectedApplicant.nama_ibu}</span></div>
                         <div><label className="text-gray-500 block text-xs">Nama Ayah Kandung</label><span className="font-medium">{selectedApplicant.nama_ayah}</span></div>
                         <div><label className="text-gray-500 block text-xs">No HP/WA</label><span className="font-medium text-green-600">{selectedApplicant.no_hp}</span></div>
                      </div>
                   </section>

                   {/* PENDIDIKAN */}
                   <section>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Pendidikan</h3>
                      <div className="grid grid-cols-2 gap-y-4 text-sm">
                         <div><label className="text-gray-500 block text-xs">Tingkat</label><span className="font-medium">{selectedApplicant.tingkat_pendidikan}</span></div>
                         <div><label className="text-gray-500 block text-xs">Institusi</label><span className="font-medium">{selectedApplicant.nama_sekolah}</span></div>
                         <div><label className="text-gray-500 block text-xs">Jurusan</label><span className="font-medium">{selectedApplicant.jurusan}</span></div>
                         <div><label className="text-gray-500 block text-xs">IPK</label><span className="font-medium">{selectedApplicant.ipk || '-'}</span></div>
                         <div><label className="text-gray-500 block text-xs">Tahun Masuk</label><span className="font-medium">{selectedApplicant.tahun_masuk}</span></div>
                         <div><label className="text-gray-500 block text-xs">Tahun Lulus</label><span className="font-medium">{selectedApplicant.tahun_lulus}</span></div>
                      </div>
                   </section>

                   {/* PENGALAMAN KERJA */}
                   <section>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Pengalaman Kerja</h3>
                      {selectedApplicant.has_pengalaman_kerja ? (
                         <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            {selectedApplicant.has_pengalaman_leasing && <div className="mb-3"><span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">PENGALAMAN LEASING</span></div>}
                            <div className="font-bold text-lg text-slate-800">{selectedApplicant.nama_perusahaan}</div>
                            <div className="text-brand-600 font-medium mb-2">{selectedApplicant.posisi_jabatan} ({selectedApplicant.periode_kerja})</div>
                            <p className="text-sm text-gray-600 italic">"{selectedApplicant.deskripsi_tugas}"</p>
                         </div>
                      ) : (
                         <div className="text-gray-500 italic">Fresh Graduate / Belum ada pengalaman relevan.</div>
                      )}
                   </section>

                   {/* ALASAN MELAMAR (New) */}
                   <section>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Motivasi & Alasan</h3>
                      <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded italic">"{selectedApplicant.alasan_melamar || '-'}"</p>
                   </section>

                   {/* ALAMAT */}
                   <section>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Alamat Lengkap</h3>
                      <div className="space-y-3 text-sm">
                         <div>
                            <label className="text-gray-500 block text-xs">Alamat KTP</label>
                            <span className="font-medium">{selectedApplicant.alamat_ktp}</span>
                            <div className="text-gray-500 text-xs mt-1">RT/RW: {selectedApplicant.rt_rw}, No: {selectedApplicant.nomor_rumah}, Kel: {selectedApplicant.kelurahan}, Kec: {selectedApplicant.kecamatan}, {selectedApplicant.kota} ({selectedApplicant.kode_pos})</div>
                         </div>
                         <div>
                            <label className="text-gray-500 block text-xs">Alamat Domisili</label>
                            <span className="font-medium">{selectedApplicant.alamat_domisili}</span>
                         </div>
                      </div>
                   </section>
                </div>

                <div className="space-y-6">
                   {/* DOKUMEN DOWNLOAD */}
                   <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><FileText size={18}/> Berkas Lamaran</h4>
                      <div className="space-y-3">
                         <a href={getFileUrl(selectedApplicant.cv_path)} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-600 transition-all group">
                            <div className="bg-red-50 text-red-500 p-2 rounded"><FileText size={20}/></div>
                            <div className="flex-1 text-sm font-medium">Curriculum Vitae</div>
                            <Download size={16} className="text-gray-400 group-hover:text-brand-500"/>
                         </a>
                         <a href={getFileUrl(selectedApplicant.ktp_path)} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-600 transition-all group">
                            <div className="bg-blue-50 text-blue-500 p-2 rounded"><User size={20}/></div>
                            <div className="flex-1 text-sm font-medium">Kartu Tanda Penduduk</div>
                            <Download size={16} className="text-gray-400 group-hover:text-brand-500"/>
                         </a>
                      </div>
                   </div>

                   {/* CHECKLIST ASET */}
                   <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><CheckCircle size={18}/> Checklist Aset</h4>
                      <ul className="space-y-2 text-sm">
                         <li className={`flex items-center gap-2 ${selectedApplicant.kendaraan_pribadi ? 'text-green-700' : 'text-gray-400'}`}>
                            {selectedApplicant.kendaraan_pribadi ? <CheckCircle size={16}/> : <XCircle size={16}/>} Kendaraan Pribadi
                         </li>
                         <li className={`flex items-center gap-2 ${selectedApplicant.ktp_asli ? 'text-green-700' : 'text-gray-400'}`}>
                            {selectedApplicant.ktp_asli ? <CheckCircle size={16}/> : <XCircle size={16}/>} KTP Asli Fisik
                         </li>
                         <li className={`flex items-center gap-2 ${selectedApplicant.sim_c ? 'text-green-700' : 'text-gray-400'}`}>
                            {selectedApplicant.sim_c ? <CheckCircle size={16}/> : <XCircle size={16}/>} SIM C
                         </li>
                         <li className={`flex items-center gap-2 ${selectedApplicant.sim_a ? 'text-green-700' : 'text-gray-400'}`}>
                            {selectedApplicant.sim_a ? <CheckCircle size={16}/> : <XCircle size={16}/>} SIM A
                         </li>
                         <li className={`flex items-center gap-2 ${selectedApplicant.skck ? 'text-green-700' : 'text-gray-400'}`}>
                            {selectedApplicant.skck ? <CheckCircle size={16}/> : <XCircle size={16}/>} SKCK Aktif
                         </li>
                         <li className={`flex items-center gap-2 ${selectedApplicant.npwp ? 'text-green-700' : 'text-gray-400'}`}>
                            {selectedApplicant.npwp ? <CheckCircle size={16}/> : <XCircle size={16}/>} NPWP
                         </li>
                      </ul>
                      {selectedApplicant.riwayat_buruk_kredit && (
                         <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs font-bold border border-red-100 rounded flex items-center gap-2">
                            <AlertTriangle size={16}/> BAD CREDIT HISTORY
                         </div>
                      )}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COPY EXCEL MODAL */}
      {isCopyModalOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ClipboardCheck size={20}/> Salin Data Excel</h3>
               <div className="space-y-3 mb-6">
                  <div>
                     <label className="text-xs font-bold text-gray-500">PIC</label>
                     <select className="w-full border rounded p-2 text-sm" value={copyFormData.pic} onChange={e=>setCopyFormData({...copyFormData, pic: e.target.value})}>
                        {PIC_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="text-xs font-bold text-gray-500">SENTRA</label>
                     <input className="w-full border rounded p-2 text-sm" placeholder="Contoh: JAKARTA" value={copyFormData.sentra} onChange={e=>setCopyFormData({...copyFormData, sentra: e.target.value.toUpperCase()})} />
                  </div>
                  <div>
                     <label className="text-xs font-bold text-gray-500">CABANG</label>
                     <input className="w-full border rounded p-2 text-sm" placeholder="Contoh: TEBET" value={copyFormData.cabang} onChange={e=>setCopyFormData({...copyFormData, cabang: e.target.value.toUpperCase()})} />
                  </div>
                  <div>
                     <label className="text-xs font-bold text-gray-500">POSISI</label>
                     <select className="w-full border rounded p-2 text-sm" value={copyFormData.posisi} onChange={e=>setCopyFormData({...copyFormData, posisi: e.target.value})}>
                        <option value="SO">SO</option>
                        <option value="RO">RO</option>
                        <option value="COLLECTION">COLLECTION</option>
                        <option value="SURVEYOR">SURVEYOR</option>
                        <option value="ADMIN">ADMIN</option>
                     </select>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button onClick={executeCopy} className="flex-1 bg-brand-600 text-white py-2 rounded font-bold hover:bg-brand-700">Salin Sekarang</button>
                  <button onClick={()=>setIsCopyModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded font-bold hover:bg-gray-300">Batal</button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};
