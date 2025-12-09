
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ApplicantDB, JobPlacement, JobPosition, JobClient } from '../types';
import { 
  LogOut, Search, FileText, Download, X, User, LayoutDashboard,
  CheckCircle, MessageCircle, Trash2, Edit, Save, Plus, Copy,
  CheckSquare, Square, ArrowUpDown, Settings, StickyNote, Building2,
  Briefcase, MapPin, Eye, EyeOff, GraduationCap, Send, ArrowLeft,
  ChevronLeft, ChevronRight, Loader2, TrendingUp, PieChart, BarChart3,
  Users, Calendar, Clock, Video, History, MoreVertical, Bell, Filter
} from 'lucide-react';

// --- STYLES & UTILS ---

// Generate pastel color based on name
const getAvatarColor = (name: string) => {
    const colors = [
        'bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 
        'bg-pink-100 text-pink-600', 'bg-emerald-100 text-emerald-600', 
        'bg-amber-100 text-amber-600', 'bg-cyan-100 text-cyan-600'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

// --- TOAST NOTIFICATION COMPONENT ---
interface Toast { id: number; message: string; type: 'success' | 'error' | 'info'; }
const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: number) => void }) => (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
            <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md animate-slideInRight transition-all min-w-[300px]
                ${t.type === 'success' ? 'bg-white/90 border-green-200 text-green-800' : 
                  t.type === 'error' ? 'bg-white/90 border-red-200 text-red-800' : 
                  'bg-white/90 border-blue-200 text-blue-800'}`}
            >
                <div className={`p-1 rounded-full ${t.type === 'success' ? 'bg-green-100' : t.type === 'error' ? 'bg-red-100' : 'bg-blue-100'}`}>
                    {t.type === 'success' ? <CheckCircle size={16}/> : t.type === 'error' ? <X size={16}/> : <Bell size={16}/>}
                </div>
                <p className="text-sm font-medium flex-1">{t.message}</p>
                <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
            </div>
        ))}
    </div>
);

// --- ENHANCED CHART COMPONENTS ---
const EnhancedLineChart = ({ data, color = '#3b82f6', gradientId }: { data: number[], color?: string, gradientId: string }) => {
    if (data.length < 2) return <div className="h-32 flex items-center justify-center text-gray-400 text-xs font-medium bg-gray-50/50 rounded-xl border border-dashed border-gray-200">Data tidak cukup untuk grafik</div>;
    const max = Math.max(...data, 1) * 1.2; // Add padding top
    
    // Create smooth bezier curves
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (val / max) * 100;
        return [x, y];
    });

    const pathD = points.reduce((acc, [x, y], i, arr) => {
        if (i === 0) return `M ${x},${y}`;
        const [px, py] = arr[i - 1];
        const cp1x = px + (x - px) / 2;
        const cp1y = py;
        const cp2x = px + (x - px) / 2;
        const cp2y = y;
        return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x},${y}`;
    }, "");

    return (
        <div className="h-48 w-full relative group">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Area Fill */}
                <path d={`${pathD} L 100,100 L 0,100 Z`} fill={`url(#${gradientId})`} />
                {/* Line Stroke */}
                <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="drop-shadow-sm" />
                {/* Interactive Dots */}
                {points.map(([x, y], i) => (
                    <g key={i} className="group/dot">
                        <circle cx={x} cy={y} r="3" fill="white" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" 
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                        {/* Tooltip */}
                        <foreignObject x={x - 10} y={y - 20} width="20" height="20" className="overflow-visible opacity-0 group-hover/dot:opacity-100 transition-opacity">
                            <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg -translate-x-1/2 -translate-y-full whitespace-nowrap">
                                {data[i]} Lamaran
                            </div>
                        </foreignObject>
                    </g>
                ))}
            </svg>
        </div>
    );
};

const ModernDonutChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    if (total === 0) return <div className="h-48 flex items-center justify-center text-gray-400 text-xs bg-gray-50/50 rounded-xl border border-dashed border-gray-200">Belum ada data</div>;

    let cumulativePercent = 0;
    const gradientParts = data.map(item => {
        const start = cumulativePercent;
        const percent = (item.value / total) * 100;
        cumulativePercent += percent;
        return `${item.color} ${start}% ${cumulativePercent}%`;
    }).join(', ');

    return (
        <div className="flex items-center gap-8">
            <div className="relative w-40 h-40 group">
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-full blur-xl opacity-20 bg-gradient-to-tr from-blue-500 to-purple-500"></div>
                <div 
                    className="w-full h-full rounded-full relative shrink-0 transition-transform duration-500 hover:scale-105"
                    style={{ background: `conic-gradient(${gradientParts})` }}
                >
                    <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center flex-col shadow-inner">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total</span>
                        <span className="text-3xl font-bold text-slate-800 tracking-tight">{total}</span>
                    </div>
                </div>
            </div>
            <div className="flex-1 space-y-3">
                {data.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm group">
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full shadow-sm ring-2 ring-white" style={{background: item.color}}></span>
                            <span className="text-gray-600 group-hover:text-gray-900 transition-colors">{item.label}</span>
                        </div>
                        <div className="text-right">
                             <span className="font-bold text-gray-800 block">{item.value}</span>
                             <span className="text-[10px] text-gray-400 block">{Math.round((item.value/total)*100)}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- SKELETON LOADER ---
const TableSkeleton = () => (
    <div className="space-y-3 w-full animate-pulse">
        {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-gray-50 rounded-xl w-full border border-gray-100 flex items-center px-6 gap-4">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="w-24 h-8 bg-gray-200 rounded-full"></div>
            </div>
        ))}
    </div>
);

// TEMPLATE WHATSAPP (Keep existing logic)
const WA_TEMPLATES = [
    { id: 'interview', label: '📅 Undangan Interview', color: 'bg-blue-50 text-blue-700 border-blue-200', getMessage: (name: string, pos: string) => `Halo Sdr/i *${name}*, kami dari Tim Rekrutmen PT Swapro International.\n\nBerdasarkan lamaran Anda untuk posisi *${pos}*, kami ingin mengundang Anda untuk mengikuti sesi Interview pada:\n\nHari/Tgl: \nJam: \nLokasi: \n\nMohon konfirmasi kehadirannya. Terima kasih.` },
    { id: 'lolos', label: '✅ Lolos Berkas', color: 'bg-green-50 text-green-700 border-green-200', getMessage: (name: string, pos: string) => `Selamat Pagi/Siang *${name}*,\n\nSelamat! Berkas lamaran Anda untuk posisi *${pos}* telah lolos seleksi administrasi di PT Swapro International.\n\nMohon kesediaannya untuk menunggu jadwal interview selanjutnya yang akan kami informasikan segera.` },
    { id: 'revisi', label: '⚠️ Minta Revisi Data', color: 'bg-amber-50 text-amber-700 border-amber-200', getMessage: (name: string, _pos: string) => `Halo *${name}*,\n\nMohon maaf kami belum dapat memproses lamaran Anda lebih lanjut dikarenakan foto dokumen (KTP/CV) yang terlampir kurang jelas/buram.\n\nMohon kirimkan ulang foto dokumen yang jelas ke nomor ini agar bisa kami proses. Terima kasih.` },
    { id: 'tolak', label: '❌ Penolakan Halus', color: 'bg-red-50 text-red-700 border-red-200', getMessage: (name: string, pos: string) => `Halo *${name}*,\n\nTerima kasih telah melamar di PT Swapro International. Untuk saat ini kualifikasi Anda belum sesuai dengan kebutuhan kami untuk posisi *${pos}*.\n\nData Anda akan kami simpan untuk kebutuhan lowongan di masa mendatang. Sukses selalu!` },
    { id: 'custom', label: '💬 Chat Manual', color: 'bg-gray-50 text-gray-700 border-gray-200', getMessage: (name: string, _pos: string) => `Halo ${name}, ` }
];

const PIC_OPTIONS = ['SUNAN', 'ADMIN', 'REKRUTER'];
const ITEMS_PER_PAGE = 20;

type TabType = 'dashboard' | 'talent_pool' | 'process' | 'interview_schedule' | 'rejected' | 'hired' | 'master_data';
type DetailTab = 'profile' | 'qualification' | 'documents';

interface DashboardProps { onLogout: () => void; }
interface LogEntry { date: string; admin: string; text: string; type?: 'note' | 'interview' | 'status'; }
interface InterviewEvent { id: number; applicant_id: number; applicant_name: string; position: string; client_name: string; branch_name: string; date: string; time: string; type: 'Online' | 'Offline'; location: string; interviewer?: string; status?: 'Scheduled' | 'Passed' | 'Failed' | 'Rescheduled' | 'No Show'; result_note?: string; }

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  // --- STATES ---
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  const [applicants, setApplicants] = useState<ApplicantDB[]>([]);
  const [loading, setLoading] = useState(false);
  const [dashboardMetrics, setDashboardMetrics] = useState({ trend: [] as number[], education: [] as any[], positions: [] as any[], gender: { male: 0, female: 0 } });
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterEducation, setFilterEducation] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantDB | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('profile'); 
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<ApplicantDB>>({});
  const [noteLogs, setNoteLogs] = useState<LogEntry[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copyFormData, setCopyFormData] = useState({ pic: 'SUNAN', sentra: '', cabang: '', posisi: '' });

  const [waTarget, setWaTarget] = useState<ApplicantDB | null>(null);
  const [waStep, setWaStep] = useState<'selection' | 'editing'>('selection');
  const [waDraft, setWaDraft] = useState('');

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<InterviewEvent | null>(null);
  const [scheduleData, setScheduleData] = useState<Partial<InterviewEvent>>({ date: new Date().toISOString().split('T')[0], time: '10:00', type: 'Online', location: 'Google Meet', interviewer: 'HRD Team' });
  const [interviewResult, setInterviewResult] = useState({ status: 'Passed', note: '', nextAction: 'next_interview' });
  const [interviewEvents, setInterviewEvents] = useState<InterviewEvent[]>([]);

  const [clients, setClients] = useState<JobClient[]>([]);
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [placements, setPlacements] = useState<JobPlacement[]>([]);
  const [masterTab, setMasterTab] = useState<'clients' | 'positions' | 'placements'>('clients');
  const [newClient, setNewClient] = useState('');
  const [newPosition, setNewPosition] = useState({ name: '', client_id: '' });
  const [placementClientFilter, setPlacementClientFilter] = useState(''); 
  const [placementPositionFilter, setPlacementPositionFilter] = useState(''); 
  const [newPlacement, setNewPlacement] = useState({ label: '', recruiter_phone: '' }); 

  const [stats, setStats] = useState({ total: 0, new: 0, process: 0, hired: 0, rejected: 0, interview: 0 });

  // --- FETCHING LOGIC ---
  const fetchDashboardData = useCallback(async () => {
      const { data: rawData } = await supabase.from('applicants').select('created_at, tingkat_pendidikan, posisi_dilamar, jenis_kelamin');
      if (!rawData) return;
      const last7Days = Array.from({length: 7}, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split('T')[0]; });
      const trendCounts = last7Days.map(date => rawData.filter((r: any) => r.created_at.startsWith(date)).length);
      const eduCounts = rawData.reduce((acc: any, curr: any) => { acc[curr.tingkat_pendidikan] = (acc[curr.tingkat_pendidikan] || 0) + 1; return acc; }, {});
      const eduData = [ { label: 'SMA/SMK', value: eduCounts['SMA/SMK'] || 0, color: '#3b82f6' }, { label: 'D3', value: eduCounts['D3'] || 0, color: '#8b5cf6' }, { label: 'S1', value: eduCounts['S1'] || 0, color: '#f59e0b' }, { label: 'Lainnya', value: (eduCounts['SD']||0)+(eduCounts['SMP']||0)+(eduCounts['S2']||0), color: '#94a3b8' } ].filter(x => x.value > 0);
      const posCounts = rawData.reduce((acc: any, curr: any) => { const pos = curr.posisi_dilamar || 'Unspecified'; acc[pos] = (acc[pos] || 0) + 1; return acc; }, {});
      const topPos = Object.entries(posCounts).map(([label, value]) => ({ label, value: value as number })).sort((a, b) => b.value - a.value).slice(0, 5);
      const male = rawData.filter((r: any) => r.jenis_kelamin === 'Laki-laki').length;
      const female = rawData.filter((r: any) => r.jenis_kelamin === 'Perempuan').length;
      setDashboardMetrics({ trend: trendCounts, education: eduData, positions: topPos, gender: { male, female } });
  }, []);

  const fetchApplicants = useCallback(async () => {
    if (activeTab === 'dashboard' || activeTab === 'interview_schedule') return; 
    setLoading(true);
    try {
      let query = supabase.from('applicants').select('*', { count: 'exact' });
      if (activeTab === 'talent_pool') query = query.or('status.eq.new,status.is.null');
      else if (activeTab === 'process') query = query.in('status', ['process', 'interview']);
      else if (activeTab === 'rejected') query = query.eq('status', 'rejected');
      else if (activeTab === 'hired') query = query.eq('status', 'hired');

      if (searchTerm) query = query.or(`nama_lengkap.ilike.%${searchTerm}%,penempatan.ilike.%${searchTerm}%,nik.ilike.%${searchTerm}%`);
      if (filterClient) query = query.ilike('penempatan', `%${filterClient}%`);
      if (filterEducation) query = query.eq('tingkat_pendidikan', filterEducation);

      query = query.order('created_at', { ascending: sortOrder === 'oldest' });
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;
      setApplicants(data || []);
      if (count !== null) setTotalCount(count);
    } catch (err: any) { addToast("Gagal memuat data: " + err.message, 'error'); } 
    finally { setLoading(false); }
  }, [activeTab, currentPage, searchTerm, filterClient, filterEducation, sortOrder]);

  const fetchStats = async () => {
    const getCount = async (statusFilter: string) => {
        let q = supabase.from('applicants').select('id', { count: 'exact', head: true });
        if (statusFilter === 'new') q = q.or('status.eq.new,status.is.null');
        else if (statusFilter === 'process') q = q.in('status', ['process', 'interview']);
        else if (statusFilter === 'all') { /* no filter */ }
        else q = q.eq('status', statusFilter);
        const { count } = await q;
        return count || 0;
    };
    const [total, newCount, process, hired, rejected, interview] = await Promise.all([ getCount('all'), getCount('new'), getCount('process'), getCount('hired'), getCount('rejected'), getCount('interview') ]);
    setStats({ total, new: newCount, process, hired, rejected, interview });
  };

  const fetchMasterData = async () => {
      const { data: cl } = await supabase.from('job_clients').select('*').order('name'); if (cl) setClients(cl);
      const { data: pos } = await supabase.from('job_positions').select('*').order('name'); if (pos) setPositions(pos);
      const { data: place } = await supabase.from('job_placements').select('*').order('label'); if (place) setPlacements(place);
  };

  useEffect(() => {
    if (activeTab === 'dashboard') { fetchStats(); fetchDashboardData(); } else if (activeTab === 'master_data') { fetchMasterData(); } else if (activeTab === 'interview_schedule') { /* fetch events */ } else { fetchApplicants(); fetchStats(); }
  }, [activeTab, fetchApplicants, fetchDashboardData]);

  useEffect(() => { setCurrentPage(1); }, [activeTab, searchTerm, filterClient, filterEducation]);
  useEffect(() => { setSelectedIds([]); }, [activeTab, currentPage]);
  useEffect(() => { if (selectedApplicant) { try { if (selectedApplicant.internal_notes && selectedApplicant.internal_notes.startsWith('[')) { setNoteLogs(JSON.parse(selectedApplicant.internal_notes)); } else if (selectedApplicant.internal_notes) { setNoteLogs([{ date: new Date().toISOString(), admin: 'System', text: selectedApplicant.internal_notes }]); } else { setNoteLogs([]); } } catch (e) { setNoteLogs([]); } setNoteInput(''); setActiveDetailTab('profile'); setIsEditing(false); } }, [selectedApplicant]);

  const updateStatus = async (id: number, newStatus: string) => { await supabase.from('applicants').update({ status: newStatus }).eq('id', id); addToast("Status berhasil diperbarui"); };
  const addLogToApplicant = async (applicantId: number, text: string, type: 'note' | 'interview' | 'status' = 'note') => {
      const { data } = await supabase.from('applicants').select('internal_notes').eq('id', applicantId).single();
      let currentLogs: LogEntry[] = []; try { currentLogs = data?.internal_notes ? JSON.parse(data.internal_notes) : []; } catch (e) {}
      const updatedLogs = [{ date: new Date().toISOString(), admin: 'Admin', text, type }, ...currentLogs];
      await supabase.from('applicants').update({ internal_notes: JSON.stringify(updatedLogs) }).eq('id', applicantId);
      if(selectedApplicant && selectedApplicant.id === applicantId) setNoteLogs(updatedLogs);
  };
  const handleAddNote = async () => { if (!selectedApplicant || !noteInput.trim()) return; setSavingNote(true); await addLogToApplicant(selectedApplicant.id, noteInput); setNoteInput(''); setSavingNote(false); addToast("Catatan ditambahkan"); };
  const handleDeleteLog = async (index: number) => { if(!window.confirm("Hapus catatan ini?")) return; if (!selectedApplicant) return; const updatedLogs = noteLogs.filter((_, i) => i !== index); setNoteLogs(updatedLogs); await supabase.from('applicants').update({ internal_notes: JSON.stringify(updatedLogs) }).eq('id', selectedApplicant.id); };
  const toggleSelectAll = () => { if (selectedIds.length === applicants.length && applicants.length > 0) setSelectedIds([]); else setSelectedIds(applicants.map(a => a.id)); };
  const toggleSelection = (id: number) => { setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); };
  const handleBulkStatusUpdate = async (newStatus: string) => { if (!window.confirm(`Update ${selectedIds.length} data?`)) return; await supabase.from('applicants').update({ status: newStatus }).in('id', selectedIds); setSelectedIds([]); addToast(`${selectedIds.length} data diperbarui`, 'success'); };
  const handleBulkDelete = async () => { if (!window.confirm(`HAPUS ${selectedIds.length} DATA?`)) return; await supabase.from('applicants').delete().in('id', selectedIds); setSelectedIds([]); addToast(`${selectedIds.length} data dihapus`, 'info'); };
  const handleDelete = async (id: number) => { if (!window.confirm("Hapus permanen?")) return; await supabase.from('applicants').delete().eq('id', id); addToast("Data dihapus", 'info'); };
  const startEditing = () => { if (selectedApplicant) { setEditFormData({ ...selectedApplicant }); setIsEditing(true); } };
  const saveChanges = async () => { if (!selectedApplicant) return; try { const { error } = await supabase.from('applicants').update(editFormData).eq('id', selectedApplicant.id); if (error) throw error; setIsEditing(false); addToast("Data berhasil disimpan", 'success'); } catch (err: any) { addToast("Gagal update: " + err.message, 'error'); } };
  
  const handleOpenSchedule = (applicant: ApplicantDB, preFill?: Partial<InterviewEvent>) => { setSelectedApplicant(applicant); setScheduleData({ date: new Date().toISOString().split('T')[0], time: '10:00', type: 'Online', location: 'Google Meet', interviewer: 'HRD Team', client_name: applicant.penempatan.split(' ')[0] || 'Client', position: applicant.posisi_dilamar, ...preFill }); setScheduleModalOpen(true); };
  const handleSaveSchedule = async () => { if(!selectedApplicant) return; const newEvent: InterviewEvent = { id: Date.now(), applicant_id: selectedApplicant.id, applicant_name: selectedApplicant.nama_lengkap, position: scheduleData.position || '', client_name: scheduleData.client_name || '', branch_name: selectedApplicant.penempatan, date: scheduleData.date || '', time: scheduleData.time || '', type: scheduleData.type as any, location: scheduleData.location || '', interviewer: scheduleData.interviewer, status: 'Scheduled' }; setInterviewEvents(prev => [...prev, newEvent]); setScheduleModalOpen(false); const logText = `[INTERVIEW TERJADWAL]\nPosisi: ${newEvent.position} (${newEvent.client_name})\nTgl: ${newEvent.date} Jam ${newEvent.time}\nTipe: ${newEvent.type} @ ${newEvent.location}\nPewawancara: ${newEvent.interviewer}`; await addLogToApplicant(selectedApplicant.id, logText, 'interview'); addToast("Jadwal interview dibuat!", 'success'); if(selectedApplicant.status !== 'interview') updateStatus(selectedApplicant.id, 'interview'); };
  const handleOpenResult = (event: InterviewEvent) => { setSelectedInterview(event); setResultModalOpen(true); };
  const handleSaveResult = async () => { if(!selectedInterview) return; setInterviewEvents(prev => prev.map(ev => ev.id === selectedInterview.id ? { ...ev, status: interviewResult.status as any, result_note: interviewResult.note } : ev)); const resultText = `[HASIL INTERVIEW]\nStatus: ${interviewResult.status}\nCatatan: ${interviewResult.note}`; await addLogToApplicant(selectedInterview.applicant_id, resultText, 'interview'); setResultModalOpen(false); if (interviewResult.nextAction === 'next_interview') { const { data } = await supabase.from('applicants').select('*').eq('id', selectedInterview.applicant_id).single(); if (data) { handleOpenSchedule(data as ApplicantDB, { position: selectedInterview.position, client_name: selectedInterview.client_name, interviewer: 'User / Manager' }); } } else if (interviewResult.nextAction === 'hired') { updateStatus(selectedInterview.applicant_id, 'hired'); addToast("Kandidat ditandai sebagai DITERIMA"); } else if (interviewResult.nextAction === 'rejected') { updateStatus(selectedInterview.applicant_id, 'rejected'); } addToast("Hasil interview disimpan"); };
  
  const openCopyModal = () => { if (!selectedApplicant) return; let shortPos = 'SO'; const appliedPos = selectedApplicant.posisi_dilamar.toUpperCase(); if (appliedPos.includes('KOLEKTOR') || appliedPos.includes('REMEDIAL')) shortPos = 'COLLECTION'; else if (appliedPos.includes('RELATION')) shortPos = 'RO'; setCopyFormData({ pic: 'SUNAN', sentra: '', cabang: '', posisi: shortPos }); setIsCopyModalOpen(true); };
  const executeCopy = () => { if (!selectedApplicant) return; const rowData = [ new Date().toLocaleDateString('id-ID'), copyFormData.pic, copyFormData.sentra, "'" + selectedApplicant.nik, copyFormData.cabang, selectedApplicant.nama_lengkap, copyFormData.posisi, "'" + selectedApplicant.no_hp ].join('\t'); navigator.clipboard.writeText(rowData).then(() => { addToast("Data tersalin ke Clipboard"); setIsCopyModalOpen(false); }); };
  const handleOpenWa = (applicant: ApplicantDB) => { setWaTarget(applicant); setWaStep('selection'); };
  const handleSelectTemplate = (template: typeof WA_TEMPLATES[0]) => { if (!waTarget) return; const msg = template.getMessage(waTarget.nama_lengkap, waTarget.posisi_dilamar); setWaDraft(msg); setWaStep('editing'); };
  const handleSendWaFinal = () => { if (!waTarget) return; const phone = waTarget.no_hp.replace(/\D/g, '').replace(/^0/, '62'); const link = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(waDraft)}`; window.open(link, '_blank'); setWaTarget(null); };
  
  const handleAddClient = async () => { if(!newClient.trim()) return; const { error } = await supabase.from('job_clients').insert({ name: newClient, is_active: true }); if (!error) { setNewClient(''); addToast("Klien ditambahkan"); } };
  const toggleClient = async (id: number, currentStatus: boolean) => { await supabase.from('job_clients').update({ is_active: !currentStatus }).eq('id', id); };
  const handleDeleteClient = async (id: number) => { if(!window.confirm("Yakin hapus? Data terkait juga akan hilang.")) return; try { const { data: posToDelete } = await supabase.from('job_positions').select('id').eq('client_id', id); if (posToDelete && posToDelete.length > 0) { const posIds = posToDelete.map(p => p.id); await supabase.from('job_placements').delete().in('position_id', posIds); await supabase.from('job_positions').delete().in('id', posIds); } await supabase.from('job_clients').delete().eq('id', id); addToast("Klien dihapus"); } catch (err: any) { addToast("Gagal: " + err.message, 'error'); } };
  const handleAddPosition = async () => { if(!newPosition.name.trim() || !newPosition.client_id) return addToast("Data tidak lengkap", 'error'); await supabase.from('job_positions').insert({ name: newPosition.name, value: newPosition.name.toUpperCase(), client_id: parseInt(newPosition.client_id), is_active: true }); setNewPosition({name: '', client_id: ''}); addToast("Posisi ditambahkan"); };
  const togglePosition = async (id: number, currentStatus: boolean) => { await supabase.from('job_positions').update({ is_active: !currentStatus }).eq('id', id); };
  const handleDeletePosition = async (id: number) => { if(!window.confirm("Hapus posisi ini?")) return; await supabase.from('job_placements').delete().eq('position_id', id); await supabase.from('job_positions').delete().eq('id', id); addToast("Posisi dihapus"); };
  const handleAddPlacement = async () => { if(!newPlacement.label.trim() || !newPlacement.recruiter_phone.trim() || !placementPositionFilter) return addToast("Data tidak lengkap", 'error'); await supabase.from('job_placements').insert({ label: newPlacement.label, value: newPlacement.label.replace(' - ', ' ').toUpperCase(), recruiter_phone: newPlacement.recruiter_phone, position_id: parseInt(placementPositionFilter), is_active: true }); setNewPlacement({label: '', recruiter_phone: ''}); addToast("Penempatan ditambahkan"); };
  const togglePlacement = async (id: number, currentStatus: boolean) => { await supabase.from('job_placements').update({ is_active: !currentStatus }).eq('id', id); };
  const handleDeletePlacement = async (id: number) => { if(!window.confirm("Hapus penempatan?")) return; await supabase.from('job_placements').delete().eq('id', id); addToast("Penempatan dihapus"); };
  
  const getFileUrl = (path: string) => path ? supabase.storage.from('documents').getPublicUrl(path).data.publicUrl : '#';
  const getPlacementDetails = (p: JobPlacement) => { const pos = positions.find(pos => pos.id === p.position_id); const cli = pos ? clients.find(c => c.id === pos.client_id) : null; return { positionName: pos ? pos.name : 'Unknown Pos', clientName: cli ? cli.name : 'Unknown Client' }; };
  const renderEditField = (label: string, field: keyof ApplicantDB, type = 'text', options?: string[]) => {
      // @ts-ignore
      const rawVal = isEditing ? (editFormData[field] ?? '') : (selectedApplicant ? selectedApplicant[field] : '-'); const val = typeof rawVal === 'boolean' ? String(rawVal) : rawVal;
      return ( <div className="mb-4"> <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{label}</label> {isEditing ? ( options ? ( <select className="w-full border border-gray-300 rounded p-1.5 text-sm bg-white focus:ring-2 focus:ring-brand-500" value={val} onChange={e => setEditFormData({...editFormData, [field]: e.target.value})} > <option value="">- Pilih -</option> {options.map(opt => <option key={opt} value={opt}>{opt}</option>)} </select> ) : ( <input type={type} className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-2 focus:ring-brand-500" value={val as string | number | readonly string[] | undefined} onChange={e => setEditFormData({...editFormData, [field]: e.target.value})} /> ) ) : ( <div className="font-medium text-gray-800 text-sm break-words">{val}</div> )} </div> );
  };
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE); const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1; const endItem = Math.min(startItem + ITEMS_PER_PAGE - 1, totalCount);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-[#0B1120] text-slate-300 flex flex-col fixed h-full z-30 shadow-2xl border-r border-white/5 backdrop-blur-3xl">
        <div className="h-24 flex items-center gap-3 px-8 border-b border-white/5 bg-gradient-to-r from-transparent to-white/5">
          <div className="relative">
             <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 rounded-full"></div>
             <img src="https://i.imgur.com/Lf2IC1Z.png" alt="Logo" className="w-10 h-10 object-contain relative z-10" />
          </div>
          <div className="flex flex-col">
             <span className="font-bold text-white text-lg tracking-tight">SWA ADMIN</span>
             <span className="text-[10px] font-medium text-blue-400 uppercase tracking-widest">Recruitment</span>
          </div>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <button onClick={() => setActiveTab('dashboard')} className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/40' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}>
            <LayoutDashboard size={20} className={activeTab === 'dashboard' ? 'text-white' : 'text-slate-500 group-hover:text-white'} /> 
            <span className="font-medium">Dashboard</span>
          </button>
          
          <div className="pt-6 pb-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pipeline Kandidat</div>
          {[
              { id: 'talent_pool', label: 'Talent Pool', icon: Users, color: 'text-blue-400' },
              { id: 'process', label: 'Proses Seleksi', icon: Loader2, color: 'text-amber-400' },
              { id: 'interview_schedule', label: 'Jadwal Interview', icon: Calendar, color: 'text-purple-400' },
              { id: 'hired', label: 'Diterima', icon: CheckCircle, color: 'text-emerald-400' },
              { id: 'rejected', label: 'Ditolak', icon: X, color: 'text-red-400' }
          ].map((item) => (
             <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}>
                <div className="flex items-center gap-3">
                    <item.icon size={18} className={activeTab === item.id ? item.color : 'text-slate-500 group-hover:text-slate-300'} />
                    <span className="font-medium">{item.label}</span>
                </div>
                {item.id !== 'interview_schedule' && (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold min-w-[28px] text-center ${activeTab === item.id ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}>
                        {stats[item.id === 'talent_pool' ? 'new' : item.id] || 0}
                    </span>
                )}
             </button>
          ))}

          <div className="pt-6 pb-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">System</div>
            <button onClick={() => setActiveTab('master_data')} className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'master_data' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}>
            <Settings size={20} className={activeTab === 'master_data' ? 'text-white' : 'text-slate-500 group-hover:text-white'} /> 
            <span className="font-medium">Master Data</span>
          </button>
        </nav>
        
        <div className="p-6 border-t border-white/5">
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-red-400 py-3 hover:bg-red-500/10 rounded-xl transition-colors font-medium text-sm border border-transparent hover:border-red-500/20">
                <LogOut size={16} /> Keluar Sistem
            </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 ml-72 p-6 lg:p-10 transition-all">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3 mb-1">
                    {activeTab === 'dashboard' ? <LayoutDashboard className="text-blue-600"/> : activeTab === 'interview_schedule' ? <Calendar className="text-purple-600"/> : null}
                    {activeTab === 'interview_schedule' ? 'Jadwal Interview' : activeTab.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h1>
                <p className="text-slate-500 text-sm font-medium">
                    {activeTab === 'dashboard' ? 'Overview performa rekrutmen terkini.' : `Manajemen data ${activeTab.replace('_', ' ')}`}
                </p>
            </div>
            {activeTab !== 'dashboard' && activeTab !== 'master_data' && activeTab !== 'interview_schedule' && ( 
                <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200">
                    <span className="text-sm text-slate-500 font-medium">Total Kandidat</span>
                    <span className="h-4 w-px bg-slate-200"></span>
                    <span className="font-bold text-slate-900 text-lg">{totalCount}</span> 
                </div> 
            )}
        </div>

        {activeTab === 'dashboard' ? (
            /* --- DASHBOARD VIEW --- */
            <div className="space-y-8 animate-fadeIn">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Pelamar', val: stats.total, sub: 'Semua Waktu', icon: User, from: 'from-blue-500', to: 'to-blue-600', shadow: 'shadow-blue-200' },
                        { label: 'Perlu Proses', val: stats.new, sub: 'Menunggu Review', icon: FileText, from: 'from-violet-500', to: 'from-violet-600', shadow: 'shadow-violet-200' },
                        { label: 'Sedang Interview', val: stats.process, sub: 'Dalam Tahapan', icon: Loader2, from: 'from-amber-400', to: 'to-amber-500', shadow: 'shadow-amber-200' },
                        { label: 'Diterima', val: stats.hired, sub: 'Karyawan Baru', icon: CheckCircle, from: 'from-emerald-400', to: 'to-emerald-600', shadow: 'shadow-emerald-200' },
                    ].map((s, i) => (
                        <div key={i} className={`relative group bg-gradient-to-br ${s.from} ${s.to} rounded-3xl p-6 text-white shadow-xl ${s.shadow} hover:-translate-y-1 transition-all duration-300 overflow-hidden`}>
                            <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110"><s.icon size={120}/></div>
                            <div className="relative z-10">
                                <div className="text-white/80 text-sm font-medium mb-1 flex items-center gap-2"><s.icon size={16}/> {s.label}</div>
                                <div className="text-4xl font-bold mb-4 tracking-tight">{s.val}</div>
                                <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">{s.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><TrendingUp className="text-blue-500" size={20}/> Tren Pendaftaran</h3>
                            <select className="text-xs border-none bg-slate-50 text-slate-500 rounded-lg px-3 py-1 font-medium"><option>7 Hari Terakhir</option></select>
                        </div>
                        <EnhancedLineChart data={dashboardMetrics.trend} gradientId="trendGradient" />
                    </div>
                    
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 text-lg mb-8 flex items-center gap-2"><PieChart className="text-purple-500" size={20}/> Pendidikan</h3>
                        <ModernDonutChart data={dashboardMetrics.education} />
                    </div>
                </div>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2"><BarChart3 className="text-indigo-500" size={20}/> Top 5 Posisi Dilamar</h3>
                        <div className="space-y-4">
                            {dashboardMetrics.positions.map((p, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">{p.label}</span>
                                        <span className="font-bold text-slate-800">{p.value}</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full w-0 animate-slideRight" style={{width: `${(p.value / Math.max(...dashboardMetrics.positions.map(x=>x.value))) * 100}%`, animationDelay: `${i*100}ms`, animationFillMode: 'forwards'}}></div>
                                    </div>
                                </div>
                            ))}
                            {dashboardMetrics.positions.length === 0 && <div className="text-center text-gray-400 py-4">Belum ada data</div>}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
                         <h3 className="font-bold text-slate-800 text-lg mb-8 flex items-center gap-2"><Users className="text-pink-500" size={20}/> Demografi Gender</h3>
                         <div className="flex items-center justify-around">
                            <div className="text-center group cursor-default">
                                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mx-auto mb-3 transition-transform group-hover:scale-110 shadow-sm"><User size={40}/></div>
                                <div className="text-3xl font-bold text-slate-800">{dashboardMetrics.gender.male}</div>
                                <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Laki-laki</div>
                            </div>
                            <div className="h-24 w-px bg-slate-100"></div>
                            <div className="text-center group cursor-default">
                                <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 mx-auto mb-3 transition-transform group-hover:scale-110 shadow-sm"><User size={40}/></div>
                                <div className="text-3xl font-bold text-slate-800">{dashboardMetrics.gender.female}</div>
                                <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Perempuan</div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        ) : activeTab === 'interview_schedule' ? (
            /* --- INTERVIEW CALENDAR --- */
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn p-8 min-h-[600px]">
                {/* Same interview logic, just enhanced styling */}
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                    <h3 className="font-bold text-xl text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Calendar size={24}/></div> 
                        Kalender Interview
                    </h3>
                    <button className="text-sm font-medium text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"><Plus size={16}/> Buat Jadwal Baru</button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {interviewEvents.length === 0 ? (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><Calendar size={40}/></div>
                            <h4 className="text-slate-600 font-bold mb-1">Tidak ada jadwal</h4>
                            <p className="text-slate-400 text-sm">Gunakan menu kandidat untuk membuat jadwal baru.</p>
                        </div>
                    ) : (
                        interviewEvents.map(event => (
                            <div key={event.id} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xl transition-all group relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1 h-full ${event.status === 'Passed' ? 'bg-green-500' : event.status === 'Failed' ? 'bg-red-500' : 'bg-purple-500'}`}></div>
                                <div className="flex justify-between items-start mb-3 pl-3">
                                    <div className="font-bold text-slate-800 truncate pr-2">{event.applicant_name}</div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${event.status === 'Passed' ? 'bg-green-100 text-green-700' : event.status === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-purple-50 text-purple-700'}`}>{event.status}</span>
                                </div>
                                <div className="pl-3 space-y-2">
                                    <p className="text-xs text-slate-500 font-medium">{event.position}</p>
                                    <div className="flex items-center gap-2 text-sm text-slate-700"><Calendar size={14} className="text-slate-400"/> {new Date(event.date).toLocaleDateString()}</div>
                                    <div className="flex items-center gap-2 text-sm text-slate-700"><Clock size={14} className="text-slate-400"/> {event.time} WIB</div>
                                    <div className="flex items-center gap-2 text-sm text-slate-700"><Video size={14} className="text-slate-400"/> {event.type}</div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-50 pl-3 flex gap-2">
                                    <button onClick={() => handleOpenResult(event)} className="flex-1 bg-slate-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-slate-800 transition-colors">Input Hasil</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        ) : activeTab === 'master_data' ? (
           /* --- MASTER DATA --- */
           <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
              {/* Keep Master Data logic mostly same, just update classes for rounded corners and spacing */}
              <div className="border-b border-gray-100 flex bg-slate-50/50 p-2 gap-2">
                 {['clients', 'positions', 'placements'].map(tab => (
                    <button key={tab} onClick={() => setMasterTab(tab as any)} className={`px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all ${masterTab === tab ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`}>
                        {tab}
                    </button>
                 ))}
              </div>
              <div className="p-8">
                 {/* ... Master Data Content (Simplified for brevity, similar to original but with updated p-8 and rounded classes) ... */}
                 {/* Reusing logic from original code, just wrapped in cleaner container */}
                 {masterTab === 'clients' && (
                    <div className="max-w-xl">
                       <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Building2 size={20}/> Kelola Klien Mitra</h3>
                       <div className="flex gap-3 mb-8"><input className="flex-1 border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Nama Klien Baru..." value={newClient} onChange={e => setNewClient(e.target.value)} /><button onClick={handleAddClient} className="bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">Tambah</button></div>
                       <table className="w-full text-sm"><thead className="text-slate-400 border-b border-slate-100"><tr><th className="p-4 text-left font-medium">Nama Klien</th><th className="p-4 text-center font-medium">Visibility</th><th className="p-4 text-right font-medium">Aksi</th></tr></thead><tbody className="divide-y divide-slate-50">{clients.map(c => (<tr key={c.id} className="group hover:bg-slate-50 transition-colors"><td className="p-4 font-bold text-slate-700">{c.name}</td><td className="p-4 text-center"><button onClick={() => toggleClient(c.id, c.is_active)} className="text-slate-400 hover:text-blue-600">{c.is_active ? <Eye size={18} /> : <EyeOff size={18} />}</button></td><td className="p-4 text-right"><button onClick={() => handleDeleteClient(c.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button></td></tr>))}</tbody></table>
                    </div>
                 )}
                 {/* Other tabs follow similar pattern */}
                  {masterTab === 'positions' && (
                    <div className="max-w-3xl">
                        <div className="flex gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100"><select className="bg-white border-none rounded-lg p-2 text-sm font-medium" value={newPosition.client_id} onChange={e => setNewPosition({...newPosition, client_id: e.target.value})}><option value="">Pilih Klien</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input className="flex-1 bg-white rounded-lg p-2 text-sm" placeholder="Nama Posisi..." value={newPosition.name} onChange={e => setNewPosition({...newPosition, name: e.target.value})} /><button onClick={handleAddPosition} className="bg-blue-600 text-white px-4 rounded-lg text-sm font-bold">Simpan</button></div>
                        <table className="w-full text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3 text-left rounded-l-lg">Klien</th><th className="p-3 text-left">Posisi</th><th className="p-3 text-right rounded-r-lg">Aksi</th></tr></thead><tbody className="divide-y divide-slate-50">{positions.map(p => (<tr key={p.id}><td className="p-3">{clients.find(c=>c.id===p.client_id)?.name}</td><td className="p-3 font-bold">{p.name}</td><td className="p-3 text-right"><button onClick={()=>handleDeletePosition(p.id)} className="text-red-400"><Trash2 size={16}/></button></td></tr>))}</tbody></table>
                    </div>
                 )}
                 {masterTab === 'placements' && (
                    <div className="max-w-4xl">
                        <div className="bg-blue-50 p-6 rounded-2xl mb-8 border border-blue-100"><h4 className="font-bold text-blue-900 mb-4">Tambah Penempatan</h4><div className="grid grid-cols-4 gap-4"><select className="p-2 rounded-lg border-none" value={placementClientFilter} onChange={e=>{setPlacementClientFilter(e.target.value);setPlacementPositionFilter('');}}><option value="">1. Klien</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select className="p-2 rounded-lg border-none" value={placementPositionFilter} onChange={e=>setPlacementPositionFilter(e.target.value)} disabled={!placementClientFilter}><option value="">2. Posisi</option>{positions.filter(p=>p.client_id===parseInt(placementClientFilter)).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><input className="p-2 rounded-lg border-none" placeholder="3. Wilayah" value={newPlacement.label} onChange={e=>setNewPlacement({...newPlacement, label: e.target.value})} /><button onClick={handleAddPlacement} className="bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Simpan</button></div><div className="mt-3"><input className="w-full p-2 rounded-lg border-none" placeholder="No WA Rekruter (628...)" value={newPlacement.recruiter_phone} onChange={e=>setNewPlacement({...newPlacement, recruiter_phone: e.target.value})}/></div></div>
                        <table className="w-full text-sm"><thead className="text-slate-400 border-b"><tr><th className="p-3 text-left">Posisi</th><th className="p-3 text-left">Wilayah</th><th className="p-3 text-left">Rekruter</th><th className="p-3 text-right">#</th></tr></thead><tbody>{placements.map(p => (<tr key={p.id} className="hover:bg-slate-50"><td className="p-3 font-medium text-blue-600">{getPlacementDetails(p).positionName}</td><td className="p-3 font-bold">{p.label}</td><td className="p-3 font-mono text-xs text-slate-500">{p.recruiter_phone}</td><td className="p-3 text-right"><button onClick={()=>handleDeletePlacement(p.id)} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button></td></tr>))}</tbody></table>
                    </div>
                 )}
              </div>
           </div>
        ) : (
          /* --- FLOATING TABLE VIEW --- */
          <div className="space-y-6 animate-fadeIn">
              {/* Toolbar */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-center sticky top-0 z-10 backdrop-blur-md bg-white/80">
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Cari kandidat..." className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm w-full lg:w-72 focus:ring-2 focus:ring-blue-500/20 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                    </div>
                    <div className="h-8 w-px bg-slate-200 hidden lg:block"></div>
                    <div className="flex gap-2">
                        <select className="bg-slate-50 border-none py-2.5 px-4 rounded-xl text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-100" value={filterClient} onChange={e => setFilterClient(e.target.value)}><option value="">Klien</option>{clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select>
                        <select className="bg-slate-50 border-none py-2.5 px-4 rounded-xl text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-100" value={filterEducation} onChange={e => setFilterEducation(e.target.value)}><option value="">Pendidikan</option><option value="S1">S1</option><option value="D3">D3</option><option value="SMA/SMK">SMA/SMK</option></select>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 animate-fadeIn bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg shadow-slate-900/20">
                            <span className="text-xs font-bold">{selectedIds.length} Selected</span>
                            <div className="h-4 w-px bg-white/20"></div>
                            <button onClick={() => handleBulkStatusUpdate('process')} className="hover:text-amber-300 text-xs font-bold uppercase">Proses</button>
                            <button onClick={() => handleBulkStatusUpdate('rejected')} className="hover:text-red-300 text-xs font-bold uppercase">Tolak</button>
                        </div>
                    )}
                    <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all" onClick={() => alert("Fitur Tambah Kandidat Manual akan segera hadir.")}><Plus size={18}/> Baru</button>
                </div>
              </div>

              {/* Data List - Using "Floating Rows" instead of standard table */}
              <div className="min-h-[400px]">
                {loading ? <TableSkeleton /> : (
                    <table className="w-full border-separate border-spacing-y-3">
                        <thead className="hidden lg:table-header-group text-slate-400 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="pl-4 pb-2 text-left w-10"><button onClick={toggleSelectAll}><CheckSquare size={18} className={selectedIds.length > 0 ? "text-blue-600" : "text-slate-300 hover:text-slate-500"} /></button></th>
                                <th className="pb-2 text-left">Kandidat</th>
                                <th className="pb-2 text-left">Posisi</th>
                                <th className="pb-2 text-left">Kualifikasi</th>
                                <th className="pb-2 text-center">Status</th>
                                <th className="pb-2 text-right pr-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants.map((app) => {
                                const isSelected = selectedIds.includes(app.id);
                                return (
                                    <tr key={app.id} className={`group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 relative ${isSelected ? 'ring-2 ring-blue-500 z-10' : ''}`}>
                                        <td className="pl-4 py-4 rounded-l-2xl border-t border-b border-l border-transparent">
                                            <button onClick={() => toggleSelection(app.id)}>{isSelected ? <CheckSquare size={20} className="text-blue-600"/> : <Square size={20} className="text-slate-200 group-hover:text-slate-300"/>}</button>
                                        </td>
                                        
                                        <td className="py-4 border-t border-b border-transparent">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-inner ${getAvatarColor(app.nama_lengkap)}`}>
                                                    {app.nama_lengkap.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{app.nama_lengkap}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                        {formatTimeAgo(app.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="py-4 border-t border-b border-transparent">
                                            <div className="text-sm font-bold text-slate-700">{app.posisi_dilamar}</div>
                                            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded w-fit mt-1">{app.penempatan}</div>
                                        </td>

                                        <td className="py-4 border-t border-b border-transparent">
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">{app.tingkat_pendidikan}</span>
                                                <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">{app.umur} Th</span>
                                                <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">{app.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}</span>
                                            </div>
                                        </td>

                                        <td className="py-4 text-center border-t border-b border-transparent">
                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                                                app.status === 'hired' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                ['process', 'interview'].includes(app.status || '') ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-slate-50 text-slate-600 border-slate-100'
                                            }`}>
                                                {app.status === 'hired' && <CheckCircle size={12} className="mr-1"/>}
                                                {app.status ? app.status.toUpperCase() : 'BARU'}
                                            </div>
                                            {app.internal_notes && <div className="text-[10px] text-amber-500 font-medium mt-1 flex items-center justify-center gap-1"><StickyNote size={10}/> Ada Catatan</div>}
                                        </td>

                                        <td className="pr-4 py-4 rounded-r-2xl text-right border-t border-b border-r border-transparent">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenWa(app)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="WhatsApp"><MessageCircle size={18} /></button>
                                                <button onClick={() => setSelectedApplicant(app)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Detail"><FileText size={18} /></button>
                                                <button onClick={() => handleDelete(app.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {applicants.length === 0 && ( <tr><td colSpan={6} className="py-20 text-center"><div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><Search size={40}/></div><p className="text-slate-500 font-medium">Tidak ada kandidat ditemukan.</p></td></tr> )}
                        </tbody>
                    </table>
                )}
              </div>

              {/* PAGINATION */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                 <span className="text-sm text-slate-500 font-medium">Hal {currentPage} dari {Math.max(totalPages, 1)}</span>
                 <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50"><ChevronLeft size={18}/></button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50"><ChevronRight size={18}/></button>
                 </div>
              </div>
          </div>
        )}
      </main>

      {/* --- MODALS (Enhanced Styles) --- */}
      
      {/* 1. WA MODAL */}
      {waTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><div className="bg-green-100 p-1.5 rounded-full text-green-600"><MessageCircle size={18}/></div> WhatsApp</h3>
              <button onClick={() => setWaTarget(null)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full border border-slate-100 hover:bg-slate-50"><X size={18}/></button>
            </div>
            <div className="p-5 overflow-y-auto">
              {waStep === 'selection' ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-500 mb-2">Pilih template pesan untuk <span className="text-slate-900 font-bold">{waTarget.nama_lengkap}</span>:</p>
                    {WA_TEMPLATES.map(t => ( <button key={t.id} onClick={() => handleSelectTemplate(t)} className={`w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all hover:scale-[1.02] hover:shadow-lg ${t.color}`} > <div className="font-bold text-sm">{t.label}</div> </button> ))}
                  </div>
              ) : (
                  <div className="space-y-4">
                      <textarea className="w-full h-48 border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-slate-50" value={waDraft} onChange={(e) => setWaDraft(e.target.value)} />
                      <div className="flex gap-3"><button onClick={() => setWaStep('selection')} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-bold flex items-center justify-center gap-2">Kembali</button><button onClick={handleSendWaFinal} className="flex-[2] py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200"><Send size={18} /> Kirim Sekarang</button></div>
                  </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. DETAIL MODAL (Sheet Style) */}
      {selectedApplicant && !scheduleModalOpen && !resultModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-hidden flex flex-col animate-slideInRight">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm ${getAvatarColor(selectedApplicant.nama_lengkap)}`}>{selectedApplicant.nama_lengkap.substring(0,2).toUpperCase()}</div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 leading-tight">
                        {isEditing ? <input className="border rounded px-2 py-0.5" value={editFormData.nama_lengkap} onChange={e=>setEditFormData({...editFormData, nama_lengkap: e.target.value})} /> : selectedApplicant.nama_lengkap}
                    </h2>
                    <p className="text-sm text-slate-500">{selectedApplicant.posisi_dilamar} • {selectedApplicant.penempatan}</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => setSelectedApplicant(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
               </div>
            </div>

            {/* Actions Bar */}
            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-3 overflow-x-auto">
                {!isEditing ? (
                    <>
                        <button onClick={openCopyModal} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:border-blue-400 hover:text-blue-600 text-xs font-bold shadow-sm transition-all whitespace-nowrap"><Copy size={14}/> Salin Data</button>
                        <button onClick={startEditing} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:border-amber-400 hover:text-amber-600 text-xs font-bold shadow-sm transition-all whitespace-nowrap"><Edit size={14}/> Edit Info</button>
                        <div className="h-6 w-px bg-slate-300 mx-2"></div>
                        <select className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-blue-500" value={selectedApplicant.status} onChange={(e) => updateStatus(selectedApplicant.id, e.target.value)}>
                            <option value="new">BARU</option>
                            <option value="process">PROSES</option>
                            <option value="hired">DITERIMA</option>
                            <option value="rejected">DITOLAK</option>
                        </select>
                    </>
                ) : (
                    <>
                        <button onClick={saveChanges} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-bold shadow-md"><Save size={14}/> Simpan Perubahan</button>
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-bold">Batal</button>
                    </>
                )}
            </div>

            {/* Tabs */}
            <div className="flex px-6 border-b border-slate-100">
                {['profile', 'qualification', 'documents'].map(t => (
                    <button key={t} onClick={() => setActiveDetailTab(t as any)} className={`px-6 py-4 text-sm font-bold border-b-2 transition-all capitalize ${activeDetailTab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                        {t === 'profile' ? 'Data Diri' : t === 'qualification' ? 'Kualifikasi' : 'Dokumen'}
                    </button>
                ))}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                {activeDetailTab === 'profile' && (
                    <div className="space-y-8 animate-fadeIn">
                        <section>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><User size={14}/> Identitas & Kontak</h3>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-2 gap-x-6 gap-y-4">
                                {renderEditField("NIK (KTP)", "nik")}
                                {renderEditField("No HP / WhatsApp", "no_hp")}
                                {renderEditField("Tempat Lahir", "tempat_lahir")}
                                {renderEditField("Tanggal Lahir", "tanggal_lahir", "date")}
                                {renderEditField("Jenis Kelamin", "jenis_kelamin", "text", ['Laki-laki', 'Perempuan'])}
                                {renderEditField("Status", "status_perkawinan", "text", ['Belum Menikah', 'Menikah', 'Cerai'])}
                            </div>
                        </section>
                        <section>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><MapPin size={14}/> Alamat Domisili</h3>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                                {renderEditField("Alamat Lengkap", "alamat_domisili")}
                                <div className="grid grid-cols-3 gap-4">
                                    {renderEditField("Kota", "kota")}
                                    {renderEditField("Kecamatan", "kecamatan")}
                                    {renderEditField("Kelurahan", "kelurahan")}
                                </div>
                            </div>
                        </section>
                    </div>
                )}
                {/* ... (Keep other tab contents qualification/documents similar but wrapped in improved containers) ... */}
                {activeDetailTab === 'qualification' && (
                     <div className="space-y-6 animate-fadeIn">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><GraduationCap size={18} className="text-blue-500"/> Pendidikan Terakhir</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {renderEditField("Jenjang", "tingkat_pendidikan", "text", ['SMA/SMK', 'D3', 'S1'])}
                                {renderEditField("Jurusan", "jurusan")}
                                <div className="col-span-2">{renderEditField("Nama Sekolah / Universitas", "nama_sekolah")}</div>
                                {renderEditField("Thn Lulus", "tahun_lulus")}
                                {renderEditField("IPK/Nilai", "ipk")}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                             <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Briefcase size={18} className="text-amber-500"/> Pengalaman Kerja</h4>
                             {selectedApplicant.has_pengalaman_kerja || isEditing ? (
                                <div className="space-y-3">
                                    {renderEditField("Perusahaan Terakhir", "nama_perusahaan")}
                                    {renderEditField("Posisi", "posisi_jabatan")}
                                    {renderEditField("Lama Bekerja", "periode_kerja")}
                                    {renderEditField("Deskripsi", "deskripsi_tugas")}
                                </div>
                             ) : <div className="p-4 bg-slate-50 rounded text-center text-slate-400 italic">Fresh Graduate</div>}
                        </div>
                     </div>
                )}
                 {activeDetailTab === 'documents' && (
                    <div className="space-y-6 animate-fadeIn h-full flex flex-col">
                        <div className="flex gap-4">
                             <a href={getFileUrl(selectedApplicant.cv_path)} target="_blank" className="flex-1 bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-3 group">
                                <div className="bg-red-50 text-red-500 p-2.5 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors"><FileText size={24}/></div>
                                <div><div className="font-bold text-slate-700">CV.pdf</div><div className="text-xs text-slate-400">Klik untuk lihat</div></div>
                             </a>
                             <a href={getFileUrl(selectedApplicant.ktp_path)} target="_blank" className="flex-1 bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-3 group">
                                <div className="bg-blue-50 text-blue-500 p-2.5 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors"><User size={24}/></div>
                                <div><div className="font-bold text-slate-700">KTP.jpg</div><div className="text-xs text-slate-400">Klik untuk lihat</div></div>
                             </a>
                        </div>
                        
                        {/* Interactive Notes Section */}
                        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm"><History size={16}/> Timeline Aktivitas</h4>
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                                {noteLogs.length === 0 && <div className="text-center text-gray-300 py-10">Belum ada catatan aktivitas.</div>}
                                {noteLogs.map((log, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="flex flex-col items-center"><div className={`w-2 h-2 rounded-full mt-2 ${log.type === 'interview' ? 'bg-purple-500' : 'bg-blue-500'}`}></div><div className="w-px h-full bg-slate-100 my-1"></div></div>
                                        <div className="flex-1 bg-slate-50 p-3 rounded-xl rounded-tl-none text-sm">
                                            <div className="flex justify-between mb-1"><span className="font-bold text-slate-700 text-xs">{log.admin}</span><span className="text-[10px] text-slate-400">{formatTimeAgo(log.date)}</span></div>
                                            <p className="text-slate-600 whitespace-pre-line">{log.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="relative">
                                <input className="w-full bg-slate-50 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-blue-100" placeholder="Tulis catatan internal..." value={noteInput} onChange={e=>setNoteInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && handleAddNote()}/>
                                <button onClick={handleAddNote} disabled={!noteInput.trim()} className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"><Send size={14}/></button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* --- CSS INJS FOR ANIMATIONS --- */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slideInRight { animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes slideRight { from { width: 0; } }
        .animate-slideRight { animation: slideRight 1s ease-out forwards; }
      `}</style>
    </div>
  );
};
