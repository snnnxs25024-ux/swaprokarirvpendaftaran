
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
  LayoutDashboard,
  CheckCircle,
  MessageCircle,
  Trash2,
  Edit,
  Save,
  Plus,
  Copy,
  CheckSquare,
  Square,
  ArrowUpDown,
  Settings,
  StickyNote,
  Building2,
  Briefcase,
  MapPin,
  Eye,
  EyeOff,
  GraduationCap
} from 'lucide-react';

const PIC_OPTIONS = ['SUNAN', 'ADMIN', 'REKRUTER'];

interface DashboardProps {
  onLogout: () => void;
}

type TabType = 'dashboard' | 'talent_pool' | 'process' | 'rejected' | 'hired' | 'master_data';
type DetailTab = 'profile' | 'qualification' | 'documents';

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [applicants, setApplicants] = useState<ApplicantDB[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterEducation, setFilterEducation] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantDB | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('profile'); 
  
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
  
  // Placement Creation State (3 Level)
  const [placementClientFilter, setPlacementClientFilter] = useState(''); 
  const [placementPositionFilter, setPlacementPositionFilter] = useState(''); 
  const [newPlacement, setNewPlacement] = useState({ label: '', recruiter_phone: '' }); 

  // --- REALTIME & INITIAL FETCH ---
  useEffect(() => {
    // 1. Initial Fetch
    fetchApplicants();
    fetchMasterData();

    // 2. Setup Realtime Subscription
    const channel = supabase.channel('realtime-dashboard')
      // Listen for APPLICANTS changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applicants' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Add new applicant to top
            setApplicants((prev) => [payload.new as ApplicantDB, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            // Update existing applicant
            setApplicants((prev) => prev.map((app) => app.id === payload.new.id ? { ...app, ...payload.new } as ApplicantDB : app));
            // Update modal if open
            setSelectedApplicant((prev) => (prev && prev.id === payload.new.id) ? { ...prev, ...payload.new } as ApplicantDB : prev);
          } else if (payload.eventType === 'DELETE') {
            // Remove applicant
            setApplicants((prev) => prev.filter((app) => app.id !== payload.old.id));
            // Close modal if deleted applicant was open
            setSelectedApplicant((prev) => (prev && prev.id === payload.old.id) ? null : prev);
          }
        }
      )
      // Listen for MASTER DATA changes (Just refetch to keep it simple and sorted)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_clients' }, () => fetchMasterData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_positions' }, () => fetchMasterData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_placements' }, () => fetchMasterData())
      .subscribe();

    // 3. Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab, filterClient, filterEducation, searchTerm]);
  
  useEffect(() => {
    if (selectedApplicant) {
      setNoteInput(selectedApplicant.internal_notes || '');
      // Reset tab to profile when opening new applicant
      setActiveDetailTab('profile');
      setIsEditing(false);
    }
  }, [selectedApplicant]);

  const fetchApplicants = async () => {
    try {
      const { data, error } = await supabase.from('applicants').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setApplicants(data || []);
    } catch (err) { console.error(err); } 
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
    try {
      const { error } = await supabase.from('applicants').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      // State updated via Realtime
    } catch (err) { alert('Gagal mengubah status'); }
  };

  const handleSaveNote = async () => {
    if (!selectedApplicant) return;
    setSavingNote(true);
    try {
        const { error } = await supabase.from('applicants').update({ internal_notes: noteInput }).eq('id', selectedApplicant.id);
        if (error) throw error;
        // State updated via Realtime
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
    try {
      const { error } = await supabase.from('applicants').update({ status: newStatus }).in('id', selectedIds);
      if (error) throw error;
      setSelectedIds([]);
      // State updated via Realtime
    } catch (err) { alert("Gagal update massal."); }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`HAPUS ${selectedIds.length} DATA?`)) return;
    try {
      const { error } = await supabase.from('applicants').delete().in('id', selectedIds);
      if (error) throw error;
      setSelectedIds([]);
      // State updated via Realtime
    } catch (err) { alert("Gagal hapus massal."); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus permanen?")) return;
    try {
      await supabase.from('applicants').delete().eq('id', id);
      // State updated via Realtime
    } catch (err) { alert('Gagal hapus.'); }
  };

  const startEditing = () => { 
      if (selectedApplicant) { 
          // Copy all data to edit form
          setEditFormData({ ...selectedApplicant }); 
          setIsEditing(true); 
      } 
  };
  
  const saveChanges = async () => {
    if (!selectedApplicant) return;
    try {
      const { error } = await supabase.from('applicants').update(editFormData).eq('id', selectedApplicant.id);
      if (error) throw error;
      setIsEditing(false);
      // State updated via Realtime
      alert("Data berhasil diperbarui!");
    } catch (err: any) { alert("Gagal update: " + err.message); }
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
  const handleAddClient = async () => {
    if(!newClient.trim()) return;
    const { error } = await supabase.from('job_clients').insert({ name: newClient, is_active: true });
    if (!error) { setNewClient(''); }
  };
  const toggleClient = async (id: number, currentStatus: boolean) => {
    await supabase.from('job_clients').update({ is_active: !currentStatus }).eq('id', id);
  };
  
  const handleDeleteClient = async (id: number) => {
    const confirmMsg = "⚠️ PERINGATAN KERAS!\n\nMenghapus Klien ini akan MENGHAPUS OTOMATIS semua Posisi dan Penempatan yang terhubung.\n\nApakah Anda yakin ingin melanjutkan?";
    if(!window.confirm(confirmMsg)) return;

    try {
        const { data: posToDelete } = await supabase.from('job_positions').select('id').eq('client_id', id);
        if (posToDelete && posToDelete.length > 0) {
             const posIds = posToDelete.map(p => p.id);
             await supabase.from('job_placements').delete().in('position_id', posIds);
             await supabase.from('job_positions').delete().in('id', posIds);
        }
        const { error: errClient } = await supabase.from('job_clients').delete().eq('id', id);
        if (errClient) throw new Error(errClient.message);
        alert("Klien dan data terkait berhasil dihapus.");
        // State update via realtime
    } catch (err: any) { alert("GAGAL MENGHAPUS: " + err.message); }
  };

  const handleAddPosition = async () => {
    if(!newPosition.name.trim() || !newPosition.client_id) return alert("Isi nama dan pilih klien");
    const { error } = await supabase.from('job_positions').insert({ 
        name: newPosition.name, 
        value: newPosition.name.toUpperCase(),
        client_id: parseInt(newPosition.client_id),
        is_active: true
    });
    if (!error) { setNewPosition({name: '', client_id: ''}); }
  };
  const togglePosition = async (id: number, currentStatus: boolean) => {
    await supabase.from('job_positions').update({ is_active: !currentStatus }).eq('id', id);
  };
  const handleDeletePosition = async (id: number) => {
    if(!window.confirm("Yakin ingin menghapus Posisi ini? Semua Penempatan di dalamnya akan terhapus.")) return;
    await supabase.from('job_placements').delete().eq('position_id', id);
    const { error } = await supabase.from('job_positions').delete().eq('id', id);
    if(error) alert("Gagal hapus: " + error.message);
  };

  const handleAddPlacement = async () => {
     if(!newPlacement.label.trim() || !newPlacement.recruiter_phone.trim() || !placementPositionFilter) return alert("Pilih Klien, Posisi, dan lengkapi data");
     const { error } = await supabase.from('job_placements').insert({
        label: newPlacement.label,
        value: newPlacement.label.replace(' - ', ' ').toUpperCase(),
        recruiter_phone: newPlacement.recruiter_phone,
        position_id: parseInt(placementPositionFilter),
        is_active: true
     });
     if (!error) { setNewPlacement({label: '', recruiter_phone: ''}); }
  };
  const togglePlacement = async (id: number, currentStatus: boolean) => {
    await supabase.from('job_placements').update({ is_active: !currentStatus }).eq('id', id);
  };
  const handleDeletePlacement = async (id: number) => {
     if(!window.confirm("Yakin ingin menghapus Penempatan ini?")) return;
     const { error } = await supabase.from('job_placements').delete().eq('id', id);
     if(error) alert("Gagal hapus: " + error.message);
  };

  // --- FILTERS & HELPERS ---
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

  const getPlacementDetails = (p: JobPlacement) => {
      const pos = positions.find(pos => pos.id === p.position_id);
      const cli = pos ? clients.find(c => c.id === pos.client_id) : null;
      return { positionName: pos ? pos.name : 'Unknown Pos', clientName: cli ? cli.name : 'Unknown Client' };
  };

  const renderEditField = (label: string, field: keyof ApplicantDB, type = 'text', options?: string[]) => {
      // @ts-ignore
      const rawVal = isEditing ? (editFormData[field] ?? '') : (selectedApplicant ? selectedApplicant[field] : '-');
      const val = typeof rawVal === 'boolean' ? String(rawVal) : rawVal;
      
      return (
        <div className="mb-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{label}</label>
            {isEditing ? (
                options ? (
                    <select 
                        className="w-full border border-gray-300 rounded p-1.5 text-sm bg-white focus:ring-2 focus:ring-brand-500"
                        // @ts-ignore
                        value={val}
                        // @ts-ignore
                        onChange={e => setEditFormData({...editFormData, [field]: e.target.value})}
                    >
                        <option value="">- Pilih -</option>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ) : (
                    <input 
                        type={type}
                        className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-2 focus:ring-brand-500"
                        value={val as string | number | readonly string[] | undefined}
                        // @ts-ignore
                        onChange={e => setEditFormData({...editFormData, [field]: e.target.value})}
                    />
                )
            ) : (
                <div className="font-medium text-gray-800 text-sm break-words">{val}</div>
            )}
        </div>
      );
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
                 {/* CLIENTS TAB */}
                 {masterTab === 'clients' && (
                    <div className="max-w-xl">
                       <h3 className="font-bold mb-4 flex items-center gap-2"><Building2 size={18}/> Daftar Klien Mitra</h3>
                       <div className="flex gap-4 mb-6">
                          <input className="flex-1 border p-2 rounded" placeholder="Nama Klien (ex: ADIRA)" value={newClient} onChange={e => setNewClient(e.target.value)} />
                          <button onClick={handleAddClient} className="bg-brand-600 text-white px-4 py-2 rounded">Tambah</button>
                       </div>
                       <table className="w-full text-sm border">
                           <thead className="bg-gray-100"><tr><th className="p-3 text-left">Nama Klien</th><th className="p-3 text-center">Visibility</th><th className="p-3 text-right">Aksi</th></tr></thead>
                           <tbody>
                               {clients.map(c => (
                                   <tr key={c.id} className={`border-t ${!c.is_active ? 'bg-gray-50 opacity-60' : ''}`}>
                                       <td className="p-3 font-bold">{c.name}</td>
                                       <td className="p-3 text-center">
                                          <button onClick={() => toggleClient(c.id, c.is_active)} className={`p-1.5 rounded-full transition-colors ${c.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}>
                                             {c.is_active ? <Eye size={20} /> : <EyeOff size={20} />}
                                          </button>
                                       </td>
                                       <td className="p-3 text-right">
                                          <button onClick={() => handleDeleteClient(c.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"><Trash2 size={18}/></button>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                    </div>
                 )}

                 {/* POSITIONS TAB */}
                 {masterTab === 'positions' && (
                    <div className="max-w-2xl">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Briefcase size={18}/> Daftar Posisi</h3>
                        <div className="flex gap-4 mb-6">
                            <select className="border p-2 rounded" value={newPosition.client_id} onChange={e => setNewPosition({...newPosition, client_id: e.target.value})}>
                                <option value="">-- Pilih Klien --</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <input className="flex-1 border p-2 rounded" placeholder="Nama Posisi (ex: SALES)" value={newPosition.name} onChange={e => setNewPosition({...newPosition, name: e.target.value})} />
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

                 {/* PLACEMENTS TAB */}
                 {masterTab === 'placements' && (
                    <div className="max-w-5xl">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><MapPin size={18}/> Daftar Penempatan</h3>
                        <div className="bg-blue-50 p-4 rounded mb-6 text-sm border border-blue-100">
                           <p className="font-bold text-blue-800 mb-2">Tambah Penempatan Baru (3 Level)</p>
                           <div className="flex gap-4 items-end flex-wrap">
                              <div className="flex flex-col gap-1">
                                 <label className="text-xs font-bold text-gray-500">1. Pilih Klien</label>
                                 <select className="border p-2 rounded w-48" value={placementClientFilter} onChange={e => {setPlacementClientFilter(e.target.value); setPlacementPositionFilter('');}}>
                                    <option value="">-- Pilih Klien --</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                 </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                 <label className="text-xs font-bold text-gray-500">2. Pilih Posisi</label>
                                 <select className="border p-2 rounded w-48" value={placementPositionFilter} onChange={e => setPlacementPositionFilter(e.target.value)} disabled={!placementClientFilter}>
                                    <option value="">-- Pilih Posisi --</option>
                                    {positions.filter(p => p.client_id === parseInt(placementClientFilter)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                 </select>
                              </div>
                              <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                 <label className="text-xs font-bold text-gray-500">3. Label Wilayah</label>
                                 <input className="border p-2 rounded w-full" placeholder="ex: JAKARTA SELATAN" value={newPlacement.label} onChange={e => setNewPlacement({...newPlacement, label: e.target.value})} disabled={!placementPositionFilter}/>
                              </div>
                              <div className="flex flex-col gap-1">
                                 <label className="text-xs font-bold text-gray-500">4. No WA Rekruter</label>
                                 <input className="border p-2 rounded w-40" placeholder="628..." value={newPlacement.recruiter_phone} onChange={e => setNewPlacement({...newPlacement, recruiter_phone: e.target.value})} disabled={!placementPositionFilter}/>
                              </div>
                              <button onClick={handleAddPlacement} disabled={!placementPositionFilter} className="bg-brand-600 text-white px-6 py-2 rounded h-[42px] font-bold disabled:bg-gray-300">Simpan</button>
                           </div>
                        </div>

                        <table className="w-full text-sm border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left">Klien</th>
                                    <th className="p-3 text-left">Posisi</th>
                                    <th className="p-3 text-left">Wilayah</th>
                                    <th className="p-3 text-left">No. Rekruter</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {placements.map(p => {
                                    const details = getPlacementDetails(p);
                                    return (
                                        <tr key={p.id} className={`border-t ${!p.is_active ? 'bg-gray-50 opacity-60' : ''}`}>
                                            <td className="p-3 text-gray-500">{details.clientName}</td>
                                            <td className="p-3 text-brand-600 font-medium">{details.positionName}</td>
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

      {/* DETAIL MODAL WITH TABS */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* HEADER MODAL */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
               <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                     {isEditing ? <input className="border rounded px-2" value={editFormData.nama_lengkap} onChange={e=>setEditFormData({...editFormData, nama_lengkap: e.target.value})} /> : selectedApplicant.nama_lengkap}
                     <span className={`text-xs px-2 py-0.5 rounded border ${selectedApplicant.status === 'hired' ? 'bg-green-100 border-green-200 text-green-700' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>{selectedApplicant.status || 'NEW'}</span>
                  </h2>
                  <p className="text-sm text-gray-500">{isEditing ? <input className="border rounded w-40 text-xs px-1" value={editFormData.nik} onChange={e=>setEditFormData({...editFormData, nik: e.target.value})} placeholder="NIK"/> : `NIK: ${selectedApplicant.nik}`} • Tgl: {new Date(selectedApplicant.created_at).toLocaleDateString()}</p>
               </div>
               <div className="flex gap-2">
                  {!isEditing ? (
                     <>
                        <button onClick={openCopyModal} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-sm font-semibold"><Copy size={16}/> Salin Excel</button>
                        <button onClick={startEditing} className="p-2 hover:bg-gray-200 rounded text-gray-500" title="Edit Data"><Edit size={20}/></button>
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

            {/* TAB NAVIGATION */}
            <div className="flex border-b border-gray-100 bg-white px-6">
                <button 
                    onClick={() => setActiveDetailTab('profile')} 
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeDetailTab === 'profile' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <User size={16} /> Profil & Alamat
                </button>
                <button 
                    onClick={() => setActiveDetailTab('qualification')} 
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeDetailTab === 'qualification' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Briefcase size={16} /> Kualifikasi
                </button>
                <button 
                    onClick={() => setActiveDetailTab('documents')} 
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeDetailTab === 'documents' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <FileText size={16} /> Dokumen & Catatan
                </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-8 bg-white">
                
                {/* 1. PROFILE TAB */}
                {activeDetailTab === 'profile' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">Data Pribadi</h3>
                            <div className="space-y-1">
                                {renderEditField("No HP/WA", "no_hp")}
                                {renderEditField("Tempat Lahir", "tempat_lahir")}
                                {renderEditField("Tanggal Lahir", "tanggal_lahir", "date")}
                                {renderEditField("Jenis Kelamin", "jenis_kelamin", "text", ['Laki-laki', 'Perempuan'])}
                                {renderEditField("Status Perkawinan", "status_perkawinan", "text", ['Belum Menikah', 'Menikah', 'Cerai'])}
                                {renderEditField("Agama", "agama", "text", ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Lainnya'])}
                                {renderEditField("Nama Ibu Kandung", "nama_ibu")}
                                {renderEditField("Nama Ayah Kandung", "nama_ayah")}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">Alamat Lengkap</h3>
                            <div className="space-y-1">
                                {renderEditField("Alamat KTP", "alamat_ktp")}
                                {renderEditField("Alamat Domisili", "alamat_domisili")}
                                <div className="grid grid-cols-2 gap-4">
                                    {renderEditField("RT/RW", "rt_rw")}
                                    {renderEditField("No Rumah", "nomor_rumah")}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {renderEditField("Kelurahan", "kelurahan")}
                                    {renderEditField("Kecamatan", "kecamatan")}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {renderEditField("Kota/Kab", "kota")}
                                    {renderEditField("Kode Pos", "kode_pos")}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. QUALIFICATION TAB */}
                {activeDetailTab === 'qualification' && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* PENDIDIKAN */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><GraduationCap size={16}/> Pendidikan</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {renderEditField("Tingkat", "tingkat_pendidikan", "text", ['SD', 'SMP', 'SMA/SMK', 'D3', 'S1', 'S2'])}
                                {renderEditField("Nama Sekolah/Univ", "nama_sekolah")}
                                {renderEditField("Jurusan", "jurusan")}
                                {renderEditField("IPK", "ipk")}
                                {renderEditField("Tahun Masuk", "tahun_masuk")}
                                {renderEditField("Tahun Lulus", "tahun_lulus")}
                            </div>
                        </div>

                        {/* PENGALAMAN */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><Briefcase size={16}/> Pengalaman Kerja</h3>
                            {selectedApplicant.has_pengalaman_kerja || isEditing ? (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {renderEditField("Nama Perusahaan", "nama_perusahaan")}
                                        {renderEditField("Posisi/Jabatan", "posisi_jabatan")}
                                        {renderEditField("Periode Kerja", "periode_kerja")}
                                    </div>
                                    <div className="mt-2">
                                        {renderEditField("Deskripsi Tugas", "deskripsi_tugas")}
                                    </div>
                                    <div className="mt-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Pengalaman Leasing?</label>
                                        <div className="text-sm font-medium">{selectedApplicant.has_pengalaman_leasing ? "YA" : "TIDAK"}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-500 italic p-4 bg-gray-50 rounded">Fresh Graduate / Belum ada pengalaman relevan.</div>
                            )}
                        </div>

                        {/* ASET */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><CheckCircle size={16}/> Checklist Aset</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <span className={selectedApplicant.kendaraan_pribadi ? "text-green-600 font-medium" : "text-gray-400"}>Motor Pribadi</span>
                                <span className={selectedApplicant.ktp_asli ? "text-green-600 font-medium" : "text-gray-400"}>KTP Asli</span>
                                <span className={selectedApplicant.sim_c ? "text-green-600 font-medium" : "text-gray-400"}>SIM C</span>
                                <span className={selectedApplicant.sim_a ? "text-green-600 font-medium" : "text-gray-400"}>SIM A</span>
                                <span className={selectedApplicant.skck ? "text-green-600 font-medium" : "text-gray-400"}>SKCK</span>
                                <span className={selectedApplicant.npwp ? "text-green-600 font-medium" : "text-gray-400"}>NPWP</span>
                                <span className={selectedApplicant.riwayat_buruk_kredit ? "text-red-500 font-bold" : "text-gray-400"}>Bad Credit History</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. DOCUMENTS TAB */}
                {activeDetailTab === 'documents' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                        {/* LEFT COLUMN */}
                        <div className="space-y-6">
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

                             {/* ALASAN MELAMAR */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">Motivasi / Alasan Melamar</h3>
                                {renderEditField("", "alasan_melamar")}
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 h-full">
                                <h4 className="text-amber-800 font-bold text-sm mb-2 flex items-center gap-2"><StickyNote size={16}/> Catatan Internal HRD</h4>
                                <textarea 
                                    className="w-full text-sm p-3 border rounded-lg focus:ring-amber-500 mb-2 h-40" 
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
                        </div>
                    </div>
                )}
            </div>

            {/* COPY MODAL OVERLAY */}
            {isCopyModalOpen && (
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-[60]">
                  <div className="bg-white p-6 rounded-lg w-96 shadow-xl animate-fadeIn">
                     <h3 className="font-bold text-lg mb-4">Salin Data ke Excel</h3>
                     <div className="space-y-3 mb-4">
                        <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1">PIC Rekrutmen</label>
                           <select className="w-full border p-2 rounded" value={copyFormData.pic} onChange={e=>setCopyFormData({...copyFormData, pic: e.target.value})}>
                              {PIC_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1">Sentra</label>
                           <input className="w-full border p-2 rounded" value={copyFormData.sentra} onChange={e=>setCopyFormData({...copyFormData, sentra: e.target.value})} placeholder="Contoh: JAKARTA"/>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1">Cabang</label>
                           <input className="w-full border p-2 rounded" value={copyFormData.cabang} onChange={e=>setCopyFormData({...copyFormData, cabang: e.target.value})} placeholder="Contoh: TEBET"/>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1">Posisi (Singkatan)</label>
                           <input className="w-full border p-2 rounded" value={copyFormData.posisi} onChange={e=>setCopyFormData({...copyFormData, posisi: e.target.value})} />
                        </div>
                     </div>
                     <div className="flex justify-end gap-2">
                        <button onClick={() => setIsCopyModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Batal</button>
                        <button onClick={executeCopy} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-bold">Salin Sekarang</button>
                     </div>
                  </div>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
