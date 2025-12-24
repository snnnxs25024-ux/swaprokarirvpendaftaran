
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ApplicantDB, JobPlacement, JobPosition, JobClient, InterviewSession } from '../types';
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
  GraduationCap,
  Send,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  PieChart,
  BarChart3,
  Users,
  History,
  MoreVertical,
  AlertCircle,
  Edit3,
  Pencil,
  Calendar,
  CreditCard,
  FileCheck,
  Flag,
  RefreshCw,
  LayoutGrid,
  ChevronRight as ChevronRightIcon,
  Database,
  PlayCircle
} from 'lucide-react';

const PIC_OPTIONS = ['SUNAN', 'ADMIN', 'REKRUTER'];
const ITEMS_PER_PAGE = 20;

// --- INTERFACES FOR TIMELINE & NOTES ---
interface TimelineNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  author: string;
}

// --- SIMPLE CHART COMPONENTS (SVG/CSS) ---
const SimpleLineChart = ({ data, color = '#3b82f6' }: { data: number[], color?: string }) => {
    if (data.length < 2) return <div className="h-32 flex items-center justify-center text-gray-400 text-xs">Data tidak cukup</div>;
    const max = Math.max(...data, 1);
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (val / max) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="h-40 w-full relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="#f1f5f9" strokeWidth="0.5" />
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    points={points}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
                <polygon 
                    fill={color} 
                    fillOpacity="0.1" 
                    points={`0,100 ${points} 100,100`} 
                />
                {data.map((val, i) => {
                     const x = (i / (data.length - 1)) * 100;
                     const y = 100 - (val / max) * 100;
                     return (
                        <circle key={i} cx={x} cy={y} r="1.5" fill="white" stroke={color} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                     )
                })}
            </svg>
        </div>
    );
};

const SimpleDonutChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    let cumulativePercent = 0;
    
    if (total === 0) return <div className="h-40 flex items-center justify-center text-gray-400 text-xs">Belum ada data</div>;

    const gradientParts = data.map(item => {
        const start = cumulativePercent;
        const percent = (item.value / total) * 100;
        cumulativePercent += percent;
        return `${item.color} ${start}% ${cumulativePercent}%`;
    }).join(', ');

    return (
        <div className="flex items-center gap-6">
            <div 
                className="w-32 h-32 rounded-full relative shrink-0"
                style={{ background: `conic-gradient(${gradientParts})` }}
            >
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col">
                    <span className="text-xs text-gray-400">Total</span>
                    <span className="text-xl font-bold text-gray-800">{total}</span>
                </div>
            </div>
            <div className="flex-1 space-y-2">
                {data.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{background: item.color}}></span>
                            <span className="text-gray-600">{item.label}</span>
                        </div>
                        <span className="font-bold text-gray-800">{item.value} ({Math.round((item.value/total)*100)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SimpleBarChart = ({ data }: { data: { label: string, value: number }[] }) => {
    if (data.length === 0) return <div className="h-40 flex items-center justify-center text-gray-400 text-xs">Belum ada data</div>;
    const max = Math.max(...data.map(d => d.value), 1);
    
    return (
        <div className="space-y-3">
            {data.map((item, idx) => (
                <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-600 font-medium truncate max-w-[150px]">{item.label}</span>
                        <span className="text-gray-800 font-bold">{item.value}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-brand-500 rounded-full transition-all duration-500" 
                            style={{ width: `${(item.value / max) * 100}%` }} 
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

// TEMPLATE WHATSAPP
const WA_TEMPLATES = [
  {
    id: 'interview',
    label: '📅 Undangan Interview',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    getMessage: (name: string, pos: string) => `Halo Sdr/i *${name}*, kami dari Tim Rekrutmen PT Swapro International.\n\nBerdasarkan lamaran Anda untuk posisi *${pos}*, kami ingin mengundang Anda untuk mengikuti sesi Interview pada:\n\nHari/Tgl: \nJam: \nLokasi: \n\nMohon konfirmasi kehadirannya. Terima kasih.`
  },
  {
    id: 'lolos',
    label: '✅ Lolos Berkas',
    color: 'bg-green-50 text-green-700 border-green-200',
    getMessage: (name: string, pos: string) => `Selamat Pagi/Siang *${name}*,\n\nSelamat! Berkas lamaran Anda untuk posisi *${pos}* telah lolos seleksi administrasi di PT Swapro International.\n\nMohon kesediaannya untuk menunggu jadwal interview selanjutnya yang akan kami informasikan segera.`
  },
  {
    id: 'revisi',
    label: '⚠️ Minta Revisi Data',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    getMessage: (name: string, _pos: string) => `Halo *${name}*,\n\nMohon maaf kami belum dapat memproses lamaran Anda lebih lanjut dikarenakan foto dokumen (KTP/CV) yang terlampir kurang jelas/buram.\n\nMohon kirimkan ulang foto dokumen yang jelas ke nomor ini agar bisa kami proses. Terima kasih.`
  },
  {
    id: 'tolak',
    label: '❌ Penolakan Halus',
    color: 'bg-red-50 text-red-700 border-red-200',
    getMessage: (name: string, pos: string) => `Halo *${name}*,\n\nTerima kasih telah melamar di PT Swapro International. Untuk saat ini kualifikasi Anda belum sesuai dengan kebutuhan kami untuk posisi *${pos}*.\n\nData Anda akan kami simpan untuk kebutuhan lowongan di masa mendatang. Sukses selalu!`
  },
  {
    id: 'custom',
    label: '💬 Chat Manual',
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    getMessage: (name: string, _pos: string) => `Halo ${name}, `
  }
];

interface DashboardProps {
  onLogout: () => void;
}

type TabType = 'dashboard' | 'talent_pool' | 'process' | 'interview' | 'rejected' | 'hired' | 'master_data' | 'monitoring';
type DetailTab = 'profile' | 'qualification' | 'documents' | 'journey';

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  // DATA STATES
  const [applicants, setApplicants] = useState<ApplicantDB[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false); // State for auto-healing process
  
  // DASHBOARD METRICS STATE
  const [dashboardMetrics, setDashboardMetrics] = useState({
      trend: [] as number[],
      education: [] as {label: string, value: number, color: string}[],
      positions: [] as {label: string, value: number}[],
      gender: { male: 0, female: 0 }
  });

  // PAGINATION & FILTER STATES
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterEducation, setFilterEducation] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // MONITORING (DRILL-DOWN) STATES
  const [monitorLevel, setMonitorLevel] = useState<'clients' | 'positions' | 'placements' | 'candidates'>('clients');
  const [monitorSelection, setMonitorSelection] = useState({
      client: null as JobClient | null,
      pos: null as JobPosition | null,
      place: null as JobPlacement | null
  });
  const [monitorCounts, setMonitorCounts] = useState<{client_id: number, position_id: number, placement_id: number}[]>([]);


  // SELECTION & MODAL STATES
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantDB | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('profile'); 
  
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<ApplicantDB>>({});
  
  // TIMELINE NOTES STATE (CRUD)
  const [timelineNotes, setTimelineNotes] = useState<TimelineNote[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  // INTERVIEW SESSIONS STATE (CHAIN SYSTEM)
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  
  // New Modal States
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  
  // Chain Logic States
  const [targetChainId, setTargetChainId] = useState<string>(''); // Which chain we are appending to (empty for new)
  const [stepType, setStepType] = useState<'interview' | 'slik' | 'pemberkasan' | 'join'>('interview');
  const [selectedInterviewId, setSelectedInterviewId] = useState<number | null>(null);

  // Dynamic Forms
  const [stepForm, setStepForm] = useState({
      // Shared
      date: '',
      time: '',
      pic: '', // interviewer / pemeriksa
      
      // Interview Specific
      location: '',
      client: '', // Stores ID as string
      position: '', // Stores ID as string
      placement: '', // Stores ID as string
      interviewer_job: '',

      // Join Specific
      contract_date: ''
  });

  const [resultForm, setResultForm] = useState({
      status: 'passed',
      note: '',
      kol_result: '' // For SLIK
  });

  // ACTION MENU STATE (FIX: Click toggle instead of hover)
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copyFormData, setCopyFormData] = useState({
    pic: 'SUNAN',
    sentra: '',
    cabang: '',
    posisi: ''
  });

  // WA Modal State
  const [waTarget, setWaTarget] = useState<ApplicantDB | null>(null);
  const [waStep, setWaStep] = useState<'selection' | 'editing'>('selection');
  const [waDraft, setWaDraft] = useState('');

  // MASTER DATA STATES
  const [clients, setClients] = useState<JobClient[]>([]);
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [placements, setPlacements] = useState<JobPlacement[]>([]);
  const [masterTab, setMasterTab] = useState<'clients' | 'positions' | 'placements' | 'maintenance'>('clients');

  const [newClient, setNewClient] = useState('');
  const [newPosition, setNewPosition] = useState({ name: '', client_id: '' });
  const [placementClientFilter, setPlacementClientFilter] = useState(''); 
  const [placementPositionFilter, setPlacementPositionFilter] = useState(''); 
  const [newPlacement, setNewPlacement] = useState({ label: '', recruiter_phone: '' }); 

  // Stats Counters
  const [stats, setStats] = useState({ total: 0, new: 0, process: 0, interview: 0, hired: 0, rejected: 0 });

  // --- FETCHING LOGIC ---
  const fetchDashboardData = useCallback(async () => {
      // Light fetch for analytics (using selection to minimize data)
      const { data: rawData } = await supabase
        .from('applicants')
        .select('created_at, tingkat_pendidikan, posisi_dilamar, jenis_kelamin');
      
      if (!rawData) return;

      // 1. Trend (Last 7 Days)
      const last7Days = Array.from({length: 7}, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split('T')[0];
      });
      const trendCounts = last7Days.map(date => 
          rawData.filter((r: any) => r.created_at.startsWith(date)).length
      );

      // 2. Education Distribution
      const eduCounts = rawData.reduce((acc: any, curr: any) => {
          acc[curr.tingkat_pendidikan] = (acc[curr.tingkat_pendidikan] || 0) + 1;
          return acc;
      }, {});
      const eduData = [
          { label: 'SMA/SMK', value: eduCounts['SMA/SMK'] || 0, color: '#3b82f6' },
          { label: 'D3', value: eduCounts['D3'] || 0, color: '#8b5cf6' },
          { label: 'S1', value: eduCounts['S1'] || 0, color: '#f59e0b' },
          { label: 'Lainnya', value: (eduCounts['SD']||0)+(eduCounts['SMP']||0)+(eduCounts['S2']||0), color: '#94a3b8' }
      ].filter(x => x.value > 0);

      // 3. Top Positions
      const posCounts = rawData.reduce((acc: any, curr: any) => {
          const pos = curr.posisi_dilamar || 'Unspecified';
          acc[pos] = (acc[pos] || 0) + 1;
          return acc;
      }, {});
      const topPos = Object.entries(posCounts)
          .map(([label, value]) => ({ label, value: value as number }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

      // 4. Gender
      const male = rawData.filter((r: any) => r.jenis_kelamin === 'Laki-laki').length;
      const female = rawData.filter((r: any) => r.jenis_kelamin === 'Perempuan').length;

      setDashboardMetrics({
          trend: trendCounts,
          education: eduData,
          positions: topPos,
          gender: { male, female }
      });
  }, []);

  const fetchApplicants = useCallback(async () => {
    if (activeTab === 'dashboard' || (activeTab === 'monitoring' && monitorLevel !== 'candidates')) return; // Skip fetching list if on dashboard

    setLoading(true);
    try {
      let query = supabase.from('applicants').select('*', { count: 'exact' });

      // Apply Tab Filters
      if (activeTab === 'talent_pool') query = query.or('status.eq.new,status.is.null');
      else if (activeTab === 'process') query = query.eq('status', 'process');
      else if (activeTab === 'interview') query = query.eq('status', 'interview');
      else if (activeTab === 'rejected') query = query.eq('status', 'rejected');
      else if (activeTab === 'hired') query = query.eq('status', 'hired');
      else if (activeTab === 'monitoring') {
          // IMPORTANT: Drill down filter
          if(monitorSelection.place) {
              query = query.eq('placement_id', monitorSelection.place.id);
          }
      }

      // Apply Search & Dropdown Filters
      if (searchTerm) {
        query = query.or(`nama_lengkap.ilike.%${searchTerm}%,mitra_klien.ilike.%${searchTerm}%,penempatan.ilike.%${searchTerm}%,nik.ilike.%${searchTerm}%`);
      }
      if (filterClient) {
        // NEW LOGIC: Filter by client_id for accuracy
        query = query.eq('client_id', filterClient);
      }
      if (filterEducation) {
        query = query.eq('tingkat_pendidikan', filterEducation);
      }

      // Apply Sorting
      query = query.order('created_at', { ascending: sortOrder === 'oldest' });

      // Apply Pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      
      if (error) throw error;
      
      setApplicants(data || []);
      if (count !== null) setTotalCount(count);

    } catch (err: any) {
      console.error('Error fetching applicants:', err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, searchTerm, filterClient, filterEducation, sortOrder, monitorLevel, monitorSelection]);

  const fetchStats = async () => {
    const getCount = async (statusFilter: string) => {
        let q = supabase.from('applicants').select('id', { count: 'exact', head: true });
        if (statusFilter === 'new') q = q.or('status.eq.new,status.is.null');
        else if (statusFilter === 'all') { /* no filter */ }
        else q = q.eq('status', statusFilter);
        const { count } = await q;
        return count || 0;
    };

    const [total, newCount, process, interview, hired, rejected] = await Promise.all([
        getCount('all'), getCount('new'), getCount('process'), getCount('interview'), getCount('hired'), getCount('rejected')
    ]);
    setStats({ total, new: newCount, process, interview, hired, rejected });
  };
  
  const fetchMonitorCounts = async () => {
      // Fetch light data for counting in monitoring view
      const { data } = await supabase.from('applicants').select('client_id, position_id, placement_id');
      if(data) setMonitorCounts(data as any);
  };

  const fetchMasterData = async () => {
      const { data: cl } = await supabase.from('job_clients').select('*').order('name');
      if (cl) setClients(cl);

      const { data: pos } = await supabase.from('job_positions').select('*').order('name');
      if (pos) setPositions(pos);

      const { data: place } = await supabase.from('job_placements').select('*').order('label');
      if (place) setPlacements(place);
  };

  const fetchInterviews = async (applicantId: number) => {
      const { data } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('applicant_id', applicantId)
        .order('created_at', { ascending: true }); // Order by creation to show chain properly
      if (data) setInterviews(data as InterviewSession[]);
  };

  // --- AUTO HEALING / DATA SYNC ---
  const handleDataAutoHealing = async () => {
     if(!window.confirm("Proses ini akan memindai seluruh data pelamar dan memperbaiki ID (Klien/Posisi/Penempatan) berdasarkan kesamaan nama.\n\nLanjutkan?")) return;
     
     setSyncing(true);
     try {
        // 1. Fetch ALL applicants (lightweight select)
        const { data: allApps } = await supabase.from('applicants').select('id, mitra_klien, posisi_dilamar, penempatan, client_id, position_id, placement_id');
        
        if (!allApps) return;

        let fixedCount = 0;
        
        // 2. Iterate and Fix
        for (const app of allApps) {
            let updates: any = {};
            let needsUpdate = false;

            // Step A: Fix Client ID
            const clientMatch = clients.find(c => c.name.trim().toLowerCase() === (app.mitra_klien || '').trim().toLowerCase());
            let activeClientId = app.client_id;
            
            if (clientMatch && app.client_id !== clientMatch.id) {
                updates.client_id = clientMatch.id;
                activeClientId = clientMatch.id;
                needsUpdate = true;
            }

            // Step B: Fix Position ID (Using Active Client ID)
            let activePosId = app.position_id;
            if (activeClientId) {
                const posMatch = positions.find(p => 
                    p.client_id === activeClientId && 
                    p.name.trim().toLowerCase() === (app.posisi_dilamar || '').trim().toLowerCase()
                );
                
                if (posMatch && app.position_id !== posMatch.id) {
                    updates.position_id = posMatch.id;
                    activePosId = posMatch.id;
                    needsUpdate = true;
                }
            }

            // Step C: Fix Placement ID (Using Active Position ID)
            if (activePosId) {
                const placeMatch = placements.find(p =>
                    p.position_id === activePosId &&
                    p.label.trim().toLowerCase() === (app.penempatan || '').trim().toLowerCase()
                );

                if (placeMatch && app.placement_id !== placeMatch.id) {
                    updates.placement_id = placeMatch.id;
                    needsUpdate = true;
                }
            }

            // Execute Update if needed
            if (needsUpdate) {
                await supabase.from('applicants').update(updates).eq('id', app.id);
                fixedCount++;
            }
        }

        alert(`Selesai! ${fixedCount} data pelamar berhasil diperbaiki dan disinkronkan.`);
        await fetchStats(); // Refresh stats
        await fetchMonitorCounts(); // Refresh monitor counts

     } catch (err: any) {
        alert("Terjadi kesalahan saat sinkronisasi: " + err.message);
     } finally {
        setSyncing(false);
     }
  };


  // --- EFFECT HOOKS ---
  
  // Initial Data Fetching (RUNS ONCE ON MOUNT TO ENSURE DROPDOWNS ARE FILLED)
  useEffect(() => {
    fetchMasterData(); // Fetch clients, positions, placements immediately
    fetchStats();
    if (activeTab === 'dashboard') {
        fetchDashboardData();
    } else {
        fetchApplicants();
    }
  }, []);

  // Filter Change Effect
  useEffect(() => {
    if (activeTab === 'dashboard') {
        fetchStats();
        fetchDashboardData();
    } else if (activeTab === 'master_data') {
        fetchMasterData();
    } else if (activeTab === 'monitoring') {
        fetchMonitorCounts();
        fetchMasterData();
        if(monitorLevel === 'candidates') {
            fetchApplicants();
        }
    } else {
        fetchApplicants();
        fetchStats();
    }
  }, [activeTab, fetchApplicants, fetchDashboardData, monitorLevel]);

  // Reset to Page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, filterClient, filterEducation]);

  // Clear selection when tab changes
  useEffect(() => {
    setSelectedIds([]);
    setIsActionMenuOpen(false); // Reset menu state on tab change
  }, [activeTab, currentPage]);

  // Update Note Input when selecting applicant (PARSE JSON) & Fetch Interviews
  useEffect(() => {
    if (selectedApplicant) {
      // 1. Fetch Timeline Notes
      if (selectedApplicant.internal_notes) {
          try {
              const parsed = JSON.parse(selectedApplicant.internal_notes);
              if(Array.isArray(parsed)) {
                  setTimelineNotes(parsed);
              } else {
                  setTimelineNotes([{ id: 'legacy', content: selectedApplicant.internal_notes, createdAt: selectedApplicant.created_at, author: 'HRD (Legacy)' }]);
              }
          } catch (e) {
              setTimelineNotes([{ id: 'legacy', content: selectedApplicant.internal_notes, createdAt: selectedApplicant.created_at, author: 'HRD (Legacy)' }]);
          }
      } else {
          setTimelineNotes([]);
      }
      
      // 2. Fetch Interview Sessions
      fetchInterviews(selectedApplicant.id);

      setNoteInput('');
      setEditingNoteId(null);
      setIsEditing(false);
      setIsActionMenuOpen(false); 
    }
  }, [selectedApplicant]);

  // Keydown for Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!selectedApplicant) return;
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'Escape') setSelectedApplicant(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedApplicant, applicants]);

  // Realtime Listener
  useEffect(() => {
    const channel = supabase.channel('realtime-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applicants' }, () => {
         // Hanya refetch jika sedang tidak dalam proses update internal untuk mencegah UI jumpy
         if (activeTab === 'dashboard') { fetchStats(); fetchDashboardData(); }
         else { fetchApplicants(); fetchStats(); }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_clients' }, fetchMasterData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_positions' }, fetchMasterData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_placements' }, fetchMasterData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interview_sessions' }, () => {
          if (selectedApplicant) fetchInterviews(selectedApplicant.id);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchApplicants, fetchDashboardData, activeTab, selectedApplicant]);


  // --- ACTIONS ---

  const updateStatus = async (id: number, newStatus: string) => {
    // 1. Optimistic Update (Update UI Immediately)
    const isStillValidInCurrentTab = (status: string) => {
        if (activeTab === 'talent_pool') return ['new', null, ''].includes(status);
        if (activeTab === 'process') return status === 'process';
        if (activeTab === 'interview') return status === 'interview';
        if (activeTab === 'rejected') return status === 'rejected';
        if (activeTab === 'hired') return status === 'hired';
        return true; // monitoring or other tabs usually show all
    };

    const isMatch = isStillValidInCurrentTab(newStatus);

    if (!isMatch && activeTab !== 'monitoring' && activeTab !== 'dashboard') {
        // Hapus dari list pelamar jika tidak lagi cocok dengan tab saat ini
        setApplicants(prev => prev.filter(a => a.id !== id));
        setTotalCount(prev => Math.max(0, prev - 1));
    } else {
        // Update status di dalam list tanpa menghapus
        setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    }

    // Jika pelamar yang diedit sedang dibuka di drawer, update juga statusnya di sana
    if (selectedApplicant?.id === id) {
        setSelectedApplicant(prev => prev ? { ...prev, status: newStatus } : null);
    }

    // 2. Perform Backend Update
    try {
        await supabase.from('applicants').update({ status: newStatus }).eq('id', id);
        // Refresh stats counter di sidebar
        fetchStats();
    } catch (err: any) {
        console.error("Gagal update status:", err.message);
        // Rollback? Optional, fetchApplicants() will eventually correct it
        fetchApplicants();
    }
  };

  // --- MONITORING NAVIGATION HANDLERS ---
  const handleClientClick = (client: JobClient) => {
      setMonitorSelection({...monitorSelection, client, pos: null, place: null});
      setMonitorLevel('positions');
  };
  const handlePositionClick = (pos: JobPosition) => {
      setMonitorSelection({...monitorSelection, pos, place: null});
      setMonitorLevel('placements');
  };
  const handlePlacementClick = (place: JobPlacement) => {
      setMonitorSelection({...monitorSelection, place});
      setMonitorLevel('candidates');
  };
  const handleMonitorBack = () => {
      if(monitorLevel === 'candidates') setMonitorLevel('placements');
      else if(monitorLevel === 'placements') setMonitorLevel('positions');
      else if(monitorLevel === 'positions') setMonitorLevel('clients');
  };
  
  // Count Helpers
  const getMonitorCount = (type: 'client' | 'pos' | 'place', id: number) => {
      if(type === 'client') return monitorCounts.filter(c => c.client_id === id).length;
      if(type === 'pos') return monitorCounts.filter(c => c.position_id === id).length;
      if(type === 'place') return monitorCounts.filter(c => c.placement_id === id).length;
      return 0;
  };

  // --- CRUD INTERVIEW SESSIONS (CHAIN LOGIC) ---
  const openNewChainModal = () => {
      setTargetChainId(''); // Empty means NEW CHAIN
      setStepType('interview'); // Always start with Interview
      // Reset Form with Defaults
      setStepForm({
          date: '', time: '', pic: '', 
          location: '', client: '', position: '', placement: '', interviewer_job: '', contract_date: ''
      });
      setIsStepModalOpen(true);
  };

  const openNextStepModal = (chainId: string) => {
      setTargetChainId(chainId);
      setStepType('interview'); // Default choice
      setStepForm({
          date: '', time: '', pic: '', 
          location: '', client: '', position: '', placement: '', interviewer_job: '', contract_date: ''
      });
      setIsStepModalOpen(true);
  };

  const openEditResultModal = (step: InterviewSession) => {
    setSelectedInterviewId(step.id);
    setResultForm({
        status: step.status,
        note: step.result_note || '',
        kol_result: step.meta_data?.kol_result || ''
    });
    setIsResultModalOpen(true);
  };

  const handleSaveStep = async () => {
      if(!selectedApplicant) return;
      if(!stepForm.date && stepType !== 'join') return alert("Tanggal wajib diisi"); // Join date might be different logic

      try {
          const newChainId = targetChainId || Date.now().toString(); // Generate ID if new
          const fullDate = new Date(`${stepForm.date}T${stepForm.time || '09:00'}`).toISOString();

          // Build Meta Data based on Type
          let metaData: any = {};
          if (stepType === 'interview') {
              // RESOLVE NAMES FROM IDS FOR DISPLAY
              const clientName = clients.find(c => c.id.toString() === stepForm.client)?.name || stepForm.client;
              const posName = positions.find(p => p.id.toString() === stepForm.position)?.name || stepForm.position;
              const placeName = placements.find(p => p.id.toString() === stepForm.placement)?.label || stepForm.placement;

              metaData = {
                  client: clientName,
                  position: posName,
                  placement: placeName,
                  interviewer_job: stepForm.interviewer_job
              };
          } else if (stepType === 'join') {
              metaData = {
                  contract_date: stepForm.contract_date
              };
          }

          // Insert
          await supabase.from('interview_sessions').insert({
              applicant_id: selectedApplicant.id,
              chain_id: newChainId,
              step_type: stepType,
              interview_date: fullDate,
              location: stepForm.location || '-',
              interviewer: stepForm.pic || '-', // Standardize column usage
              status: 'scheduled',
              meta_data: metaData
          });

          // Update Main Status based on step
          let newStatus = 'process';
          if (stepType === 'interview') newStatus = 'interview';
          if (stepType === 'join') newStatus = 'hired';
          
          if (selectedApplicant.status !== newStatus) {
              await updateStatus(selectedApplicant.id, newStatus);
          }

          // FIX: Explicitly fetch immediately to update UI (Realtime Fix)
          await fetchInterviews(selectedApplicant.id);

          setIsStepModalOpen(false);
          alert("Tahap berhasil dijadwalkan!");
      } catch (e: any) {
          alert("Error: " + e.message);
      }
  };

  const handleUpdateResult = async () => {
      if(!selectedInterviewId || !selectedApplicant) return;
      try {
          // Get current meta data to append KOL result if SLIK
          const currentStep = interviews.find(i => i.id === selectedInterviewId);
          let newMeta = currentStep?.meta_data || {};
          
          if (currentStep?.step_type === 'slik') {
              newMeta = { ...newMeta, kol_result: resultForm.kol_result };
          }

          await supabase.from('interview_sessions').update({
              status: resultForm.status,
              result_note: resultForm.note,
              meta_data: newMeta
          }).eq('id', selectedInterviewId);
          
          // FIX: Explicitly fetch immediately to update UI (Realtime Fix)
          await fetchInterviews(selectedApplicant.id);

          setIsResultModalOpen(false);
          setResultForm({ status: 'passed', note: '', kol_result: '' });
      } catch (e: any) { alert("Error: " + e.message); }
  };

  const deleteInterview = async (id: number) => {
      if(!selectedApplicant || !window.confirm("Hapus jadwal ini?")) return;
      await supabase.from('interview_sessions').delete().eq('id', id);
      // FIX: Realtime UI Update
      await fetchInterviews(selectedApplicant.id);
  };

  // Helper to group interviews by chain
  const groupedInterviews = interviews.reduce((groups, interview) => {
      const chain = interview.chain_id || 'legacy';
      if (!groups[chain]) groups[chain] = [];
      groups[chain].push(interview);
      return groups;
  }, {} as Record<string, InterviewSession[]>);

  const interviewChains = Object.entries(groupedInterviews) as [string, InterviewSession[]][];

  // --- CRUD TIMELINE NOTES ---
  const handleSaveTimelineNote = async () => {
    if (!selectedApplicant || !noteInput.trim()) return;
    setSavingNote(true);
    
    try {
        let updatedNotes: TimelineNote[] = [];

        if (editingNoteId) {
            // Update Existing
            updatedNotes = timelineNotes.map(n => n.id === editingNoteId ? { ...n, content: noteInput, updatedAt: new Date().toISOString() } : n);
        } else {
            // Create New
            const newNote: TimelineNote = {
                id: Date.now().toString(),
                content: noteInput,
                createdAt: new Date().toISOString(),
                author: 'HRD'
            };
            updatedNotes = [newNote, ...timelineNotes]; // Add to top
        }

        const jsonString = JSON.stringify(updatedNotes);
        const { error } = await supabase.from('applicants').update({ internal_notes: jsonString }).eq('id', selectedApplicant.id);
        
        if (error) throw error;
        
        setTimelineNotes(updatedNotes);
        setNoteInput('');
        setEditingNoteId(null);
        setSelectedApplicant(prev => prev ? { ...prev, internal_notes: jsonString } : null);

    } catch (err: any) {
        alert("Gagal menyimpan: " + err.message);
    } finally {
        setSavingNote(false);
    }
  };

  const handleEditTimelineNote = (note: TimelineNote) => {
      setNoteInput(note.content);
      setEditingNoteId(note.id);
      // Optional: focus input
  };

  const handleDeleteTimelineNote = async (noteId: string) => {
      if (!selectedApplicant || !window.confirm("Hapus catatan ini?")) return;
      const updatedNotes = timelineNotes.filter(n => n.id !== noteId);
      const jsonString = JSON.stringify(updatedNotes);
      
      await supabase.from('applicants').update({ internal_notes: jsonString }).eq('id', selectedApplicant.id);
      setTimelineNotes(updatedNotes);
      setSelectedApplicant(prev => prev ? { ...prev, internal_notes: jsonString } : null);
  };
  
  const handleCancelEditNote = () => {
      setNoteInput('');
      setEditingNoteId(null);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === applicants.length && applicants.length > 0) setSelectedIds([]); 
    else setSelectedIds(applicants.map(a => a.id));
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (!window.confirm(`Update ${selectedIds.length} data?`)) return;
    
    // Optimistic Bulk
    const validIds = selectedIds;
    setSelectedIds([]); // Clear selection early

    try {
        await supabase.from('applicants').update({ status: newStatus }).in('id', validIds);
        
        // Refetch fully to ensure everything is correct
        fetchApplicants();
        fetchStats();
    } catch (err: any) {
        console.error("Gagal update massal:", err.message);
        fetchApplicants();
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`HAPUS ${selectedIds.length} DATA?`)) return;
    const idsToDelete = selectedIds;
    setSelectedIds([]); // Clear selection

    try {
        await supabase.from('applicants').delete().in('id', idsToDelete);
        fetchApplicants();
        fetchStats();
    } catch (err: any) {
        console.error("Gagal hapus massal:", err.message);
        fetchApplicants();
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus permanen?")) return;
    
    // Optimistic Delete
    setApplicants(prev => prev.filter(a => a.id !== id));
    setTotalCount(prev => Math.max(0, prev - 1));
    if (selectedApplicant?.id === id) setSelectedApplicant(null);

    try {
        await supabase.from('applicants').delete().eq('id', id);
        fetchStats();
    } catch (err: any) {
        console.error("Gagal hapus:", err.message);
        fetchApplicants();
    }
  };

  const startEditing = () => { 
      if (selectedApplicant) { 
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
      setSelectedApplicant(prev => prev ? ({...prev, ...editFormData}) : null);
      alert("Data berhasil diperbarui!");
    } catch (err: any) { alert("Gagal update: " + err.message); }
  };

  // --- DRAWER NAVIGATION ---
  const currentApplicantIndex = selectedApplicant ? applicants.findIndex(a => a.id === selectedApplicant.id) : -1;

  const handleNext = () => {
      if (currentApplicantIndex > -1 && currentApplicantIndex < applicants.length - 1) {
          setSelectedApplicant(applicants[currentApplicantIndex + 1]);
      }
  };

  const handlePrev = () => {
      if (currentApplicantIndex > 0) {
          setSelectedApplicant(applicants[currentApplicantIndex - 1]);
      }
  };

  // --- EXCEL COPY & WA HANDLERS ---
  const openCopyModal = () => {
    if (!selectedApplicant) return;
    let shortPos = 'SO';
    const jobContext = getApplicantJobContext(selectedApplicant);
    const appliedPos = jobContext.position.toUpperCase();
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

  const handleOpenWa = (applicant: ApplicantDB) => {
    setWaTarget(applicant);
    setWaStep('selection');
  };

  const handleSelectTemplate = (template: typeof WA_TEMPLATES[0]) => {
    if (!waTarget) return;
    const jobContext = getApplicantJobContext(waTarget);
    const msg = template.getMessage(waTarget.nama_lengkap, jobContext.position);
    setWaDraft(msg);
    setWaStep('editing');
  };

  const handleSendWaFinal = () => {
    if (!waTarget) return;
    const phone = waTarget.no_hp.replace(/\D/g, '').replace(/^0/, '62');
    const link = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(waDraft)}`;
    window.open(link, '_blank');
    setWaTarget(null);
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
  const editClient = async (id: number, currentName: string) => {
    const newName = window.prompt("Ubah Nama Klien:", currentName);
    if(newName && newName !== currentName) {
        await supabase.from('job_clients').update({ name: newName }).eq('id', id);
    }
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
        await supabase.from('job_clients').delete().eq('id', id);
        alert("Klien dan data terkait berhasil dihapus.");
    } catch (err: any) { alert("GAGAL MENGHAPUS: " + err.message); }
  };

  const handleAddPosition = async () => {
    if(!newPosition.name.trim() || !newPosition.client_id) return alert("Isi nama dan pilih klien");
    await supabase.from('job_positions').insert({ 
        name: newPosition.name, 
        value: newPosition.name.toUpperCase(),
        client_id: parseInt(newPosition.client_id),
        is_active: true
    });
    setNewPosition({name: '', client_id: ''});
  };
  const togglePosition = async (id: number, currentStatus: boolean) => {
    await supabase.from('job_positions').update({ is_active: !currentStatus }).eq('id', id);
  };
  const editPosition = async (id: number, currentName: string) => {
    const newName = window.prompt("Ubah Nama Posisi:", currentName);
    if(newName && newName !== currentName) {
        await supabase.from('job_positions').update({ name: newName }).eq('id', id);
    }
  };
  const handleDeletePosition = async (id: number) => {
    if(!window.confirm("Yakin ingin menghapus Posisi ini? Semua Penempatan di dalamnya akan terhapus.")) return;
    await supabase.from('job_placements').delete().eq('position_id', id);
    const { error } = await supabase.from('job_positions').delete().eq('id', id);
    if(error) alert("Gagal hapus: " + error.message);
  };

  const handleAddPlacement = async () => {
     if(!newPlacement.label.trim() || !newPlacement.recruiter_phone.trim() || !placementPositionFilter) return alert("Pilih Klien, Posisi, dan lengkapi data");
     await supabase.from('job_placements').insert({
        label: newPlacement.label,
        value: newPlacement.label.replace(' - ', ' ').toUpperCase(),
        recruiter_phone: newPlacement.recruiter_phone,
        position_id: parseInt(placementPositionFilter),
        is_active: true
     });
     setNewPlacement({label: '', recruiter_phone: ''});
  };
  const togglePlacement = async (id: number, currentStatus: boolean) => {
    await supabase.from('job_placements').update({ is_active: !currentStatus }).eq('id', id);
  };
  const editPlacement = async (id: number, currentName: string) => {
    const newName = window.prompt("Ubah Nama Penempatan:", currentName);
    if(newName && newName !== currentName) {
        await supabase.from('job_placements').update({ label: newName }).eq('id', id);
    }
  };
  const handleDeletePlacement = async (id: number) => {
     if(!window.confirm("Yakin ingin menghapus Penempatan ini?")) return;
     const { error } = await supabase.from('job_placements').delete().eq('id', id);
     if(error) alert("Gagal hapus: " + error.message);
  };

  // --- HELPERS ---
  const getFileUrl = (path: string) => path ? supabase.storage.from('documents').getPublicUrl(path).data.publicUrl : '#';
  
  const getPlacementDetails = (p: JobPlacement) => {
      const pos = positions.find(pos => pos.id === p.position_id);
      const cli = pos ? clients.find(c => c.id === pos.client_id) : null;
      return { positionName: pos ? pos.name : 'Unknown Pos', clientName: cli ? cli.name : 'Unknown Client' };
  };

  // --- DYNAMIC RESOLVER FOR APPLICANT DATA ---
  const getApplicantJobContext = (app: ApplicantDB) => {
      // 1. Try to resolve via ID (The New Way)
      if (app.placement_id) {
          const placementMatch = placements.find(p => p.id === app.placement_id);
          const positionMatch = positions.find(p => p.id === app.position_id);
          const clientMatch = clients.find(c => c.id === app.client_id);

          return {
              client: clientMatch ? clientMatch.name : (app.mitra_klien || 'Unknown Client'),
              position: positionMatch ? positionMatch.name : (app.posisi_dilamar || 'Unknown Pos'),
              placement: placementMatch ? placementMatch.label : (app.penempatan || 'Unknown Placement'),
              isDynamic: true
          };
      }

      // 2. Fallback to Snapshot Text (Legacy Data)
      return {
          client: app.mitra_klien || '-',
          position: app.posisi_dilamar,
          placement: app.penempatan,
          isDynamic: false
      };
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

  // Status Badge Logic for Drawer
  const getStatusBadge = (status: string) => {
     const styles = {
        new: 'bg-blue-100 text-blue-700 border-blue-200',
        process: 'bg-amber-100 text-amber-700 border-amber-200',
        interview: 'bg-purple-100 text-purple-700 border-purple-200',
        hired: 'bg-green-100 text-green-700 border-green-200',
        rejected: 'bg-red-100 text-red-700 border-red-200'
     };
     // @ts-ignore
     return styles[status] || styles['new'];
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <img src="https://i.imgur.com/Lf2IC1Z.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-white">SWA ADMIN</span>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-brand-600 to-blue-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </button>

          <button onClick={() => setActiveTab('monitoring')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === 'monitoring' ? 'bg-slate-700 text-white border-l-4 border-brand-500' : 'hover:bg-slate-800'}`}>
            <LayoutGrid size={18} /> Monitoring Klien
          </button>

          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase">Pipeline</div>
          {['talent_pool', 'process', 'interview', 'hired', 'rejected'].map((tab) => (
             <button key={tab} onClick={() => setActiveTab(tab as any)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${activeTab === tab ? 'bg-slate-800 text-white shadow-md border-l-4 border-brand-500' : 'hover:bg-slate-800'}`}>
                <div className="flex items-center gap-3 capitalize">{tab.replace('_', ' ')}</div>
                {/* @ts-ignore */}
                <span className="bg-slate-700 text-xs px-2 py-0.5 rounded-full min-w-[24px] text-center">{stats[tab === 'talent_pool' ? 'new' : tab]}</span>
             </button>
          ))}
           <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase">System</div>
            <button onClick={() => setActiveTab('master_data')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${activeTab === 'master_data' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800'}`}>
            <Settings size={18} /> Master Data
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800"><button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-red-400 py-2 hover:bg-slate-800 rounded-lg"><LogOut size={16} /> Keluar</button></div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-8">
            <h1 className="text-2xl font-bold text-slate-900 capitalize tracking-tight flex items-center gap-2">
                {activeTab === 'dashboard' ? <LayoutDashboard className="text-brand-600"/> : activeTab.replace('_', ' ')}
                {activeTab === 'dashboard' && <span className="text-sm font-normal text-slate-500 ml-2 bg-slate-100 px-3 py-1 rounded-full">Statistik & Analisa</span>}
            </h1>
            {activeTab !== 'dashboard' && activeTab !== 'master_data' && (
                <div className="text-sm text-gray-500">
                    Total: <span className="font-bold text-slate-900">{totalCount}</span> Kandidat
                </div>
            )}
        </div>

        {activeTab === 'dashboard' ? (
            /* --- DASHBOARD ANALYTICS VIEW --- */
            <div className="space-y-6 animate-fadeIn">
                {/* 1. KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4"><User size={100}/></div>
                        <div className="text-blue-100 text-sm font-medium mb-1">Total Pelamar</div>
                        <div className="text-4xl font-bold">{stats.total}</div>
                        <div className="mt-4 text-xs bg-white/20 w-fit px-2 py-1 rounded">Semua Waktu</div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4"><FileText size={100}/></div>
                        <div className="text-indigo-100 text-sm font-medium mb-1">Baru Masuk</div>
                        <div className="text-4xl font-bold">{stats.new}</div>
                        <div className="mt-4 text-xs bg-white/20 w-fit px-2 py-1 rounded">Perlu Diproses</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-6 text-white shadow-lg shadow-amber-200 relative overflow-hidden">
                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4"><Loader2 size={100}/></div>
                        <div className="text-amber-50 text-sm font-medium mb-1">Sedang Proses</div>
                        <div className="text-4xl font-bold">{stats.process}</div>
                        <div className="mt-4 text-xs bg-white/20 w-fit px-2 py-1 rounded">Interview & Psikotes</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4"><CheckCircle size={100}/></div>
                        <div className="text-emerald-100 text-sm font-medium mb-1">Diterima</div>
                        <div className="text-4xl font-bold">{stats.hired}</div>
                        <div className="mt-4 text-xs bg-white/20 w-fit px-2 py-1 rounded">Karyawan Baru</div>
                    </div>
                </div>

                {/* 2. CHARTS ROW 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* TREND CHART */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <TrendingUp className="text-brand-600" size={20}/> Tren Pendaftaran (7 Hari Terakhir)
                        </h3>
                        <SimpleLineChart data={dashboardMetrics.trend} />
                        <div className="flex justify-between mt-4 text-xs text-gray-400 px-2">
                            <span>7 Hari Lalu</span>
                            <span>Hari Ini</span>
                        </div>
                    </div>

                    {/* EDUCATION CHART */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <PieChart className="text-purple-600" size={20}/> Kualifikasi Pendidikan
                        </h3>
                        <SimpleDonutChart data={dashboardMetrics.education} />
                    </div>
                </div>

                {/* 3. CHARTS ROW 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* TOP POSITIONS */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <BarChart3 className="text-indigo-600" size={20}/> 5 Posisi Terpopuler
                        </h3>
                        <SimpleBarChart data={dashboardMetrics.positions} />
                    </div>

                    {/* DEMOGRAPHICS */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Users className="text-pink-600" size={20}/> Demografi Gender
                        </h3>
                        <div className="flex items-center justify-center gap-8 h-40">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-2">
                                    <User size={32}/>
                                </div>
                                <div className="text-2xl font-bold text-slate-800">{dashboardMetrics.gender.male}</div>
                                <div className="text-xs text-gray-500">Laki-laki</div>
                            </div>
                            <div className="h-12 w-px bg-gray-200"></div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center text-pink-600 mx-auto mb-2">
                                    <User size={32}/>
                                </div>
                                <div className="text-2xl font-bold text-slate-800">{dashboardMetrics.gender.female}</div>
                                <div className="text-xs text-gray-500">Perempuan</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : activeTab === 'master_data' ? (
           /* --- MASTER DATA (SAME AS BEFORE) --- */
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
              <div className="border-b border-gray-200 flex bg-gray-50">
                 {['clients', 'positions', 'placements', 'maintenance'].map(tab => (
                    <button key={tab} onClick={() => setMasterTab(tab as any)} className={`px-6 py-3 text-sm font-bold uppercase ${masterTab === tab ? 'bg-white border-t-2 border-brand-600 text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        {tab === 'maintenance' ? <span className="flex items-center gap-2"><Database size={16}/> {tab}</span> : tab}
                    </button>
                 ))}
              </div>
              
              <div className="p-6">
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
                                       <td className="p-3 text-right flex justify-end gap-1">
                                          <button onClick={() => editClient(c.id, c.name)} className="text-brand-500 hover:bg-brand-50 p-1.5 rounded transition-colors" title="Edit Nama"><Pencil size={18}/></button>
                                          <button onClick={() => handleDeleteClient(c.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors" title="Hapus"><Trash2 size={18}/></button>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                    </div>
                 )}

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
                                            <td className="p-3 text-right flex justify-end gap-1">
                                                <button onClick={() => editPosition(p.id, p.name)} className="text-brand-500 hover:bg-brand-50 p-1.5 rounded transition-colors" title="Edit Nama"><Pencil size={18}/></button>
                                                <button onClick={() => handleDeletePosition(p.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={18}/></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                 )}

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
                                            <td className="p-3 text-right flex justify-end gap-1">
                                                <button onClick={() => editPlacement(p.id, p.label)} className="text-brand-500 hover:bg-brand-50 p-1.5 rounded transition-colors" title="Edit Nama"><Pencil size={18}/></button>
                                                <button onClick={() => handleDeletePlacement(p.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={18}/></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                 )}

                 {masterTab === 'maintenance' && (
                     <div className="max-w-2xl mx-auto text-center py-10">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 shadow-sm">
                            <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <RefreshCw size={40} className={syncing ? "animate-spin" : ""} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">Auto-Healing & Sinkronisasi Data</h3>
                            <p className="text-slate-600 mb-8 leading-relaxed max-w-lg mx-auto">
                                Fitur ini akan memindai seluruh data pelamar yang memiliki teks Klien/Posisi/Penempatan namun ID-nya kosong atau tidak sesuai. Sistem akan secara otomatis mencocokkan teks tersebut dengan Master Data dan memperbaiki struktur database.
                            </p>
                            
                            <button 
                                onClick={handleDataAutoHealing} 
                                disabled={syncing}
                                className="bg-brand-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                            >
                                {syncing ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Sedang Memproses...
                                    </>
                                ) : (
                                    <>
                                        <PlayCircle size={20} />
                                        Mulai Perbaikan Data
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-slate-400 mt-4">Disarankan dijalankan secara berkala atau setelah import data massal.</p>
                        </div>
                     </div>
                 )}
              </div>
           </div>
        ) : activeTab === 'monitoring' && monitorLevel !== 'candidates' ? (
            /* --- MONITORING HIERARCHICAL DRILL DOWN --- */
            <div className="space-y-6 animate-fadeIn">
                {/* Breadcrumb Navigation */}
                <div className="flex items-center text-sm font-medium mb-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <button onClick={() => {setMonitorLevel('clients'); setMonitorSelection({client:null, pos:null, place:null})}} className={`flex items-center ${monitorLevel === 'clients' ? 'text-brand-600 font-bold' : 'text-gray-500 hover:text-brand-600'}`}>
                        <LayoutGrid size={16} className="mr-1"/> Klien
                    </button>
                    {monitorSelection.client && (
                        <>
                            <ChevronRightIcon size={16} className="text-gray-300 mx-2"/>
                            <button onClick={() => {setMonitorLevel('positions'); setMonitorSelection({...monitorSelection, pos:null, place:null})}} className={`flex items-center ${monitorLevel === 'positions' ? 'text-brand-600 font-bold' : 'text-gray-500 hover:text-brand-600'}`}>
                                <Building2 size={16} className="mr-1"/> {monitorSelection.client.name}
                            </button>
                        </>
                    )}
                    {monitorSelection.pos && (
                        <>
                            <ChevronRightIcon size={16} className="text-gray-300 mx-2"/>
                            <button onClick={() => {setMonitorLevel('placements'); setMonitorSelection({...monitorSelection, place:null})}} className={`flex items-center ${monitorLevel === 'placements' ? 'text-brand-600 font-bold' : 'text-gray-500 hover:text-brand-600'}`}>
                                <Briefcase size={16} className="mr-1"/> {monitorSelection.pos.name}
                            </button>
                        </>
                    )}
                    {monitorSelection.place && (
                        <>
                            <ChevronRightIcon size={16} className="text-gray-300 mx-2"/>
                            <span className="flex items-center text-brand-600 font-bold">
                                <MapPin size={16} className="mr-1"/> {monitorSelection.place.label}
                            </span>
                        </>
                    )}
                    
                    {monitorLevel !== 'clients' && (
                        <button onClick={handleMonitorBack} className="ml-auto text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-600 flex items-center gap-1">
                            <ArrowLeft size={12}/> Kembali
                        </button>
                    )}
                </div>

                {/* LEVEL 1: CLIENTS GRID */}
                {monitorLevel === 'clients' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {clients.filter(c => c.is_active).map(client => {
                            const count = getMonitorCount('client', client.id);
                            return (
                                <button 
                                    key={client.id} 
                                    onClick={() => handleClientClick(client)}
                                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-200 transition-all text-left group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-brand-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                                    <Building2 className="text-brand-600 mb-3 relative z-10" size={28}/>
                                    <h3 className="font-bold text-gray-800 text-lg relative z-10 group-hover:text-brand-700">{client.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1 relative z-10">Mitra Perusahaan</p>
                                    
                                    <div className="mt-4 flex items-center justify-between relative z-10">
                                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md group-hover:bg-brand-100 group-hover:text-brand-700">
                                            {count} Pelamar
                                        </span>
                                        <ChevronRightIcon size={16} className="text-gray-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-transform"/>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* LEVEL 2: POSITIONS GRID */}
                {monitorLevel === 'positions' && monitorSelection.client && (
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {positions.filter(p => p.is_active && p.client_id === monitorSelection.client!.id).map(pos => {
                             const count = getMonitorCount('pos', pos.id);
                             return (
                                <button 
                                    key={pos.id} 
                                    onClick={() => handlePositionClick(pos)}
                                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all text-left group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                                    <Briefcase className="text-indigo-600 mb-3 relative z-10" size={28}/>
                                    <h3 className="font-bold text-gray-800 text-lg relative z-10 group-hover:text-indigo-700">{pos.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1 relative z-10">Posisi Tersedia</p>
                                    
                                    <div className="mt-4 flex items-center justify-between relative z-10">
                                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md group-hover:bg-indigo-100 group-hover:text-indigo-700">
                                            {count} Pelamar
                                        </span>
                                        <ChevronRightIcon size={16} className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-transform"/>
                                    </div>
                                </button>
                             )
                        })}
                        {positions.filter(p => p.is_active && p.client_id === monitorSelection.client!.id).length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-400 italic">Belum ada posisi untuk klien ini.</div>
                        )}
                     </div>
                )}

                {/* LEVEL 3: PLACEMENTS GRID */}
                {monitorLevel === 'placements' && monitorSelection.pos && (
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {placements.filter(p => p.is_active && p.position_id === monitorSelection.pos!.id).map(place => {
                             const count = getMonitorCount('place', place.id);
                             return (
                                <button 
                                    key={place.id} 
                                    onClick={() => handlePlacementClick(place)}
                                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all text-left group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                                    <MapPin className="text-emerald-600 mb-3 relative z-10" size={24}/>
                                    <h3 className="font-bold text-gray-800 text-base relative z-10 group-hover:text-emerald-700 leading-tight">{place.label}</h3>
                                    <p className="text-[10px] text-gray-400 mt-2 relative z-10 font-mono">{place.recruiter_phone}</p>
                                    
                                    <div className="mt-4 flex items-center justify-between relative z-10">
                                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md group-hover:bg-emerald-100 group-hover:text-emerald-700">
                                            {count} Kandidat
                                        </span>
                                        <ChevronRightIcon size={16} className="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-transform"/>
                                    </div>
                                </button>
                             )
                        })}
                        {placements.filter(p => p.is_active && p.position_id === monitorSelection.pos!.id).length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-400 italic">Belum ada penempatan untuk posisi ini.</div>
                        )}
                     </div>
                )}
            </div>
        ) : (
          /* --- OPERATIONAL TABLE VIEW (TALENT POOL, PROCESS, ETC, OR MONITORING LEVEL 4) --- */
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
              <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2 w-full md:w-auto">
                   
                   {/* ADDED: Back button for monitoring candidates view */}
                   {activeTab === 'monitoring' && (
                       <button 
                           onClick={handleMonitorBack}
                           className="p-2 border border-slate-300 rounded-lg text-slate-500 hover:bg-white hover:text-slate-700 transition-colors bg-white mr-2"
                           title="Kembali ke Penempatan"
                       >
                           <ArrowLeft size={18} />
                       </button>
                   )}

                   {/* Search & Filters */}
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Cari nama, nik..." 
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                   </div>
                   
                   {/* Hide Client Filter in Monitoring Mode (Already filtered) */}
                   {activeTab !== 'monitoring' && (
                       <select className="border p-2 rounded-lg text-sm" value={filterClient} onChange={e => setFilterClient(e.target.value)}>
                          <option value="">Semua Klien</option>
                          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                   )}

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

              <div className="overflow-x-auto min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
                        <Loader2 className="animate-spin" size={24}/> Memuat data...
                    </div>
                ) : (
                    <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-200 text-xs uppercase font-semibold">
                        <tr>
                        <th className="p-4 w-10"><button onClick={toggleSelectAll}><CheckSquare size={16} className={selectedIds.length > 0 ? "text-brand-400" : "text-slate-500"} /></button></th>
                        <th className="p-4">Tanggal</th>
                        <th className="p-4">Kandidat</th>
                        <th className="p-4">Posisi & Klien</th>
                        <th className="p-4">Kontak</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {applicants.map((app) => {
                            // Row Coloring Logic
                            let rowClass = "bg-white border-l-4 border-l-transparent hover:border-l-slate-300"; // Default (New)
                            
                            if (selectedIds.includes(app.id)) {
                                rowClass = "bg-blue-50/80 border-l-4 border-l-blue-500";
                            } else if (app.status === 'hired') {
                                rowClass = "bg-emerald-50/60 border-l-4 border-l-emerald-500 hover:bg-emerald-100/50";
                            } else if (app.status === 'rejected') {
                                rowClass = "bg-rose-50/60 border-l-4 border-l-rose-500 hover:bg-rose-100/50";
                            } else if (app.status === 'process') {
                                rowClass = "bg-amber-50/60 border-l-4 border-l-amber-500 hover:bg-amber-100/50";
                            } else if (app.status === 'interview') {
                                rowClass = "bg-purple-50/60 border-l-4 border-l-purple-500 hover:bg-purple-100/50";
                            }

                            // Notes indicator (Check json or string)
                            const hasNotes = app.internal_notes && app.internal_notes !== "[]" && app.internal_notes !== "";

                            // DYNAMIC RESOLVER FOR NAMES
                            const jobContext = getApplicantJobContext(app);

                            return (
                                <tr key={app.id} className={`transition-all hover:shadow-sm ${rowClass}`}>
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
                                    <div className="font-bold text-slate-900 cursor-pointer hover:text-brand-600" onClick={() => setSelectedApplicant(app)}>{app.nama_lengkap}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        {app.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'} • {app.umur} Th • {app.tingkat_pendidikan}
                                    </div>
                                    </td>
                                    <td className="p-4">
                                    <div className="text-xs font-bold text-gray-500 mb-0.5">{jobContext.client}</div>
                                    <div className="text-sm font-semibold text-brand-700">{jobContext.position}</div>
                                    <div className="text-xs text-slate-500">{jobContext.placement}</div>
                                    </td>
                                    <td className="p-4">
                                    <div className="text-sm text-slate-700">{app.no_hp}</div>
                                    <div className="text-xs text-slate-400">{app.kota}</div>
                                    </td>
                                    <td className="p-4">
                                    <select 
                                        value={app.status || 'new'} 
                                        onChange={(e) => updateStatus(app.id, e.target.value)}
                                        className={`text-xs font-bold px-2 py-1 rounded-full border-0 cursor-pointer outline-none bg-white/50 backdrop-blur-sm shadow-sm
                                            ${app.status === 'hired' ? 'text-green-700 ring-1 ring-green-200' : 
                                            app.status === 'rejected' ? 'text-red-700 ring-1 ring-red-200' :
                                            app.status === 'process' ? 'text-amber-700 ring-1 ring-amber-200' :
                                            app.status === 'interview' ? 'text-purple-700 ring-1 ring-purple-200' :
                                            'text-blue-600 ring-1 ring-blue-200'}
                                        `}
                                    >
                                        <option value="new">Baru</option>
                                        <option value="process">Proses</option>
                                        <option value="interview">Interview</option>
                                        <option value="hired">Diterima</option>
                                        <option value="rejected">Ditolak</option>
                                    </select>
                                    {hasNotes && <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-600"><StickyNote size={10}/> Ada Catatan</div>}
                                    </td>
                                    <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleOpenWa(app)} className="p-2 text-green-600 hover:bg-green-100 rounded-lg bg-white/80 shadow-sm" title="WhatsApp"><MessageCircle size={18} /></button>
                                        <button onClick={() => setSelectedApplicant(app)} className="p-2 text-brand-600 hover:bg-brand-100 rounded-lg bg-white/80 shadow-sm" title="Detail"><FileText size={18} /></button>
                                        <button onClick={() => handleDelete(app.id)} className="p-2 text-red-400 hover:bg-red-100 rounded-lg bg-white/80 shadow-sm" title="Hapus"><Trash2 size={18} /></button>
                                    </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {applicants.length === 0 && !loading && (
                        <tr><td colSpan={7} className="p-8 text-center text-slate-400">Tidak ada data ditemukan.</td></tr>
                        )}
                    </tbody>
                    </table>
                )}
              </div>
            </div>
        )}
      </main>

      {/* WA TEMPLATE MODAL */}
      {waTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <MessageCircle className="text-green-600" size={20}/> 
                  {waStep === 'selection' ? `Hubungi ${waTarget.nama_lengkap}` : 'Edit Pesan WhatsApp'}
              </h3>
              <button onClick={() => setWaTarget(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              {waStep === 'selection' ? (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 mb-2">Pilih template pesan:</p>
                    {WA_TEMPLATES.map(t => (
                        <button 
                        key={t.id}
                        onClick={() => handleSelectTemplate(t)}
                        className={`w-full text-left p-3 rounded-lg border flex items-center gap-3 transition-all hover:shadow-md ${t.color}`}
                        >
                        <div className="font-bold text-sm">{t.label}</div>
                        </button>
                    ))}
                  </div>
              ) : (
                  <div className="space-y-4">
                      <textarea 
                          className="w-full h-48 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500"
                          value={waDraft}
                          onChange={(e) => setWaDraft(e.target.value)}
                      />
                      <div className="flex gap-3">
                          <button 
                              onClick={() => setWaStep('selection')}
                              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-semibold flex items-center justify-center gap-2"
                          >
                              <ArrowLeft size={16} /> Kembali
                          </button>
                          <button 
                              onClick={handleSendWaFinal}
                              className="flex-[2] py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold flex items-center justify-center gap-2"
                          >
                              <Send size={16} /> Kirim WhatsApp
                          </button>
                      </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SIDE DRAWER IMPLEMENTATION --- */}
      
      {/* 1. Backdrop */}
      {selectedApplicant && (
        <div 
           className="fixed inset-0 z-[45] bg-slate-900/40 backdrop-blur-sm transition-opacity"
           onClick={() => setSelectedApplicant(null)}
        />
      )}

      {/* 2. Sliding Panel */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-[50] transform transition-transform duration-300 ease-in-out flex flex-col ${selectedApplicant ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedApplicant && (
            <>
               {/* DRAWER HEADER */}
               <div className="flex-none p-5 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
                   <div>
                       <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-bold text-gray-900">
                             {isEditing ? <input className="border rounded px-2" value={editFormData.nama_lengkap} onChange={e=>setEditFormData({...editFormData, nama_lengkap: e.target.value})} /> : selectedApplicant.nama_lengkap}
                          </h2>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusBadge(selectedApplicant.status || 'new')}`}>
                            {selectedApplicant.status || 'NEW'}
                          </span>
                       </div>
                       <p className="text-xs text-gray-500">
                         NIK: {selectedApplicant.nik} • {selectedApplicant.posisi_dilamar}
                       </p>
                   </div>
                   
                   <div className="flex items-center gap-3">
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button 
                                onClick={handlePrev} 
                                disabled={currentApplicantIndex <= 0}
                                className="p-1.5 hover:bg-white rounded-md disabled:opacity-30 transition-all text-gray-600"
                                title="Sebelumnya"
                            >
                                <ChevronLeft size={20}/>
                            </button>
                            <div className="w-px h-4 bg-gray-300 mx-1"></div>
                            <button 
                                onClick={handleNext} 
                                disabled={currentApplicantIndex === -1 || currentApplicantIndex >= applicants.length - 1}
                                className="p-1.5 hover:bg-white rounded-md disabled:opacity-30 transition-all text-gray-600"
                                title="Selanjutnya"
                            >
                                <ChevronRight size={20}/>
                            </button>
                        </div>
                        <button onClick={() => setSelectedApplicant(null)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                   </div>
               </div>

               {/* STICKY TABS */}
               <div className="flex border-b border-gray-100 bg-white px-2 sticky top-0 z-20 overflow-x-auto no-scrollbar">
                    {['profile', 'qualification', 'documents', 'journey'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveDetailTab(tab as DetailTab)} 
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap 
                                ${activeDetailTab === tab ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab === 'profile' && <User size={16} />}
                            {tab === 'qualification' && <Briefcase size={16} />}
                            {tab === 'documents' && <FileText size={16} />}
                            {tab === 'journey' && <History size={16} />}
                            <span className="capitalize">{tab === 'journey' ? 'Interview & Riwayat' : tab}</span>
                        </button>
                    ))}
               </div>

               {/* SCROLLABLE CONTENT */}
               <div className="flex-1 overflow-y-auto p-6 bg-slate-50 pb-24">
                    {/* ... (Previous Profile, Qualification, Docs Tabs Remain Unchanged) ... */}
                    {activeDetailTab === 'profile' && (
                        <div className="space-y-6 animate-fadeIn">
                             {/* ... (Existing profile content) ... */}
                             <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-5 rounded-xl shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                        
                                        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Building2 size={14}/> Informasi Lamaran
                                        </h3>
                                        
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 relative z-10">
                                            <div>
                                                <label className="text-[10px] font-medium text-slate-400 block mb-1">MITRA KLIEN</label>
                                                <div className="text-lg font-bold text-white tracking-tight">{getApplicantJobContext(selectedApplicant).client}</div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-medium text-slate-400 block mb-1">POSISI DILAMAR</label>
                                                <div className="text-base font-semibold text-brand-200">{getApplicantJobContext(selectedApplicant).position}</div>
                                            </div>
                                            <div className="col-span-2 pt-3 border-t border-white/10">
                                                <label className="text-[10px] font-medium text-slate-400 block mb-1">LOKASI PENEMPATAN</label>
                                                <div className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                                    <MapPin size={14} className="text-brand-400"/>
                                                    {getApplicantJobContext(selectedApplicant).placement}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                             <div className="bg-white p-5 rounded-xl border border-blue-600 shadow-sm">
                                <div className="flex justify-between items-center mb-4 border-b pb-2">
                                    <h3 className="font-bold text-gray-800 text-sm">Informasi Pribadi</h3>
                                    {!isEditing && <button onClick={startEditing} className="text-brand-600 text-xs hover:underline">Edit Data</button>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">{renderEditField("NIK (KTP)", "nik", "number")}</div>
                                    {renderEditField("No HP/WA", "no_hp")}
                                    {renderEditField("Umur", "umur", "number")}
                                    {renderEditField("Tempat Lahir", "tempat_lahir")}
                                    {renderEditField("Tanggal Lahir", "tanggal_lahir", "date")}
                                    {renderEditField("Jenis Kelamin", "jenis_kelamin", "text", ['Laki-laki', 'Perempuan'])}
                                    {renderEditField("Agama", "agama", "text", ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Lainnya'])}
                                    {renderEditField("Status Nikah", "status_perkawinan", "text", ['Belum Menikah', 'Menikah', 'Cerai'])}
                                    
                                    <div className="col-span-2 pt-4 border-t mt-2">
                                        <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase">Data Keluarga</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {renderEditField("Nama Ibu Kandung", "nama_ibu")}
                                            {renderEditField("Nama Ayah Kandung", "nama_ayah")}
                                        </div>
                                    </div>
                                </div>
                             </div>

                             <div className="bg-white p-5 rounded-xl border border-blue-600 shadow-sm">
                                <h3 className="font-bold text-gray-800 text-sm mb-4 border-b pb-2">Data Alamat & Lokasi</h3>
                                <div className="space-y-4">
                                    {renderEditField("Alamat Sesuai KTP", "alamat_ktp")}
                                    {renderEditField("Domisili Saat Ini", "alamat_domisili")}
                                    <div className="grid grid-cols-2 gap-4">
                                        {renderEditField("RT / RW", "rt_rw")}
                                        {renderEditField("Nomor Rumah", "nomor_rumah")}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                                        {renderEditField("Kelurahan", "kelurahan")}
                                        {renderEditField("Kecamatan", "kecamatan")}
                                        {renderEditField("Kota/Kab", "kota")}
                                        {renderEditField("Kode Pos", "kode_pos")}
                                    </div>
                                </div>
                             </div>

                             <div className="bg-white p-5 rounded-xl border border-blue-600 shadow-sm">
                                <h3 className="font-bold text-gray-800 text-sm mb-4 border-b pb-2">Motivasi & Lainnya</h3>
                                {isEditing ? (
                                     <textarea 
                                        className="w-full border p-2 rounded text-sm min-h-[100px]" 
                                        placeholder="Alasan melamar..."
                                        value={editFormData.alasan_melamar || ''} 
                                        onChange={e => setEditFormData({...editFormData, alasan_melamar: e.target.value})}
                                     />
                                ) : (
                                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 italic border border-gray-100 relative">
                                        <span className="text-3xl text-gray-300 absolute -top-2 left-2">“</span>
                                        <p className="px-4 relative z-10">{selectedApplicant.alasan_melamar || 'Tidak ada data alasan melamar.'}</p>
                                        <span className="text-3xl text-gray-300 absolute -bottom-4 right-2">”</span>
                                    </div>
                                )}
                             </div>
                        </div>
                    )}

                    {activeDetailTab === 'qualification' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-white p-5 rounded-xl border border-blue-600 shadow-sm">
                                <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2"><GraduationCap size={16}/> Pendidikan Terakhir</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {renderEditField("Jenjang", "tingkat_pendidikan")}
                                    {renderEditField("Jurusan", "jurusan")}
                                    <div className="col-span-2">{renderEditField("Nama Sekolah", "nama_sekolah")}</div>
                                    {renderEditField("Tahun Masuk", "tahun_masuk")}
                                    {renderEditField("Tahun Lulus", "tahun_lulus")}
                                    {renderEditField("IPK", "ipk")}
                                </div>
                            </div>
                            
                            <div className="bg-white p-5 rounded-xl border border-blue-600 shadow-sm">
                                <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2"><Briefcase size={16}/> Pengalaman Kerja</h3>
                                {selectedApplicant.has_pengalaman_kerja ? (
                                    <div className="space-y-3">
                                         {renderEditField("Perusahaan", "nama_perusahaan")}
                                         <div className="grid grid-cols-2 gap-4">
                                            {renderEditField("Jabatan", "posisi_jabatan")}
                                            {renderEditField("Periode", "periode_kerja")}
                                         </div>
                                         {renderEditField("Tugas", "deskripsi_tugas")}
                                         <div className="pt-2 border-t border-gray-100">
                                            <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase">Kontak Atasan</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {renderEditField("Nama Atasan", "nama_atasan")}
                                                {renderEditField("Jabatan", "jabatan_atasan")}
                                                <div className="col-span-2">{renderEditField("No HP Atasan", "no_hp_atasan")}</div>
                                            </div>
                                         </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 bg-gray-50 rounded text-gray-500 text-sm">Tidak ada pengalaman kerja (Fresh Graduate)</div>
                                )}
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-blue-600 shadow-sm">
                                <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2"><CheckCircle size={16}/> Aset & Dokumen</h3>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                     {['kendaraan_pribadi', 'sim_c', 'sim_a', 'ktp_asli', 'skck', 'npwp', 'riwayat_buruk_kredit'].map(key => {
                                         const isCredit = key === 'riwayat_buruk_kredit';
                                         // @ts-ignore
                                         const val = selectedApplicant[key];
                                         return (
                                            <div key={key} className={`flex items-center gap-2 p-2 rounded ${isCredit && val ? 'bg-red-50 text-red-700' : (!isCredit && val ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400')}`}>
                                                {val ? (isCredit ? <AlertCircle size={14}/> : <CheckCircle size={14}/>) : <X size={14}/>}
                                                <span className="uppercase">{key.replace(/_/g, ' ')}</span>
                                            </div>
                                         );
                                     })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeDetailTab === 'documents' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-white p-5 rounded-xl border border-blue-600 shadow-sm">
                                <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2"><FileText size={16}/> File Dokumen</h3>
                                <div className="grid gap-3">
                                     <a href={getFileUrl(selectedApplicant.cv_path)} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-3 border rounded-lg hover:border-brand-500 hover:shadow-md transition-all">
                                         <div className="w-10 h-10 bg-red-100 text-red-600 rounded flex items-center justify-center font-bold">PDF</div>
                                         <div className="flex-1">
                                             <div className="text-sm font-bold text-gray-800">Curriculum Vitae</div>
                                             <div className="text-xs text-gray-500">Klik untuk melihat file</div>
                                         </div>
                                         <Download size={18} className="text-gray-400"/>
                                     </a>
                                     <a href={getFileUrl(selectedApplicant.ktp_path)} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-3 border rounded-lg hover:border-brand-500 hover:shadow-md transition-all">
                                         <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded flex items-center justify-center font-bold">IMG</div>
                                         <div className="flex-1">
                                             <div className="text-sm font-bold text-gray-800">Foto KTP</div>
                                             <div className="text-xs text-gray-500">Klik untuk melihat file</div>
                                         </div>
                                         <Download size={18} className="text-gray-400"/>
                                     </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeDetailTab === 'journey' && (
                        <div className="space-y-8 animate-fadeIn pb-8">
                             
                             {/* 1. CHAIN INTERVIEW SYSTEM */}
                             <div className="space-y-6">
                                {interviewChains.length === 0 ? (
                                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-blue-600">
                                        <p className="text-gray-500 text-sm mb-4">Belum ada riwayat proses interview.</p>
                                        <button 
                                            onClick={openNewChainModal}
                                            className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 mx-auto hover:bg-brand-700 shadow-lg"
                                        >
                                            <Plus size={16}/> Mulai Proses Baru
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-end">
                                            <button 
                                                onClick={openNewChainModal}
                                                className="bg-brand-50 text-brand-600 border border-brand-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-brand-100 transition-colors"
                                            >
                                                <Plus size={14}/> Buat Sesi Baru
                                            </button>
                                        </div>

                                        {/* Render Chains */}
                                        {interviewChains
                                            .sort((a, b) => b[0].localeCompare(a[0])) // Sort by Chain ID (assuming timestamp) Descending
                                            .map(([chainId, steps], index) => {
                                                const lastStep = steps[steps.length - 1];
                                                const isChainActive = lastStep.status === 'passed';
                                                const isChainFailed = lastStep.status === 'failed' || lastStep.status === 'cancelled';
                                                
                                                return (
                                                    <div key={chainId} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                                Rangkaian Proses #{index + 1}
                                                            </div>
                                                            <div className="text-[10px] text-gray-400">
                                                                ID: {chainId.substring(0, 8)}...
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="p-6 relative">
                                                            {/* Vertical Line Connector */}
                                                            <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-gray-200 z-0"></div>

                                                            <div className="space-y-6 relative z-10">
                                                                {steps.map((step) => {
                                                                    const isPassed = step.status === 'passed';
                                                                    const isFailed = step.status === 'failed';
                                                                    const isCancelled = step.status === 'cancelled';
                                                                    
                                                                    // Icon Logic
                                                                    let StepIcon = Users;
                                                                    if (step.step_type === 'slik') StepIcon = CreditCard;
                                                                    if (step.step_type === 'pemberkasan') StepIcon = FileCheck;
                                                                    if (step.step_type === 'join') StepIcon = Flag;

                                                                    return (
                                                                        <div key={step.id} className="flex gap-4">
                                                                            {/* Step Marker */}
                                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 z-10 bg-white
                                                                                ${isPassed ? 'border-green-500 text-green-600' : 
                                                                                  isFailed ? 'border-red-500 text-red-600' : 
                                                                                  isCancelled ? 'border-gray-400 text-gray-400' :
                                                                                  'border-blue-500 text-blue-600'}
                                                                            `}>
                                                                                <StepIcon size={14} />
                                                                            </div>

                                                                            {/* Step Content Card */}
                                                                            <div className={`flex-1 rounded-lg border p-3 text-sm relative group
                                                                                ${isPassed ? 'bg-green-50 border-green-200' : 
                                                                                  isFailed ? 'bg-red-50 border-red-200' : 
                                                                                  isCancelled ? 'bg-gray-50 border-gray-200' :
                                                                                  'bg-white border-blue-200 shadow-sm'}
                                                                            `}>
                                                                                <div className="flex justify-between items-start mb-2">
                                                                                    <div>
                                                                                        <div className="text-xs font-bold text-gray-500 uppercase">{step.step_type}</div>
                                                                                        <div className="font-bold text-gray-900">{new Date(step.interview_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</div>
                                                                                    </div>
                                                                                    <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${isPassed ? 'bg-green-100 text-green-700 border-green-200' : isFailed ? 'bg-red-100 text-red-700 border-red-200' : isCancelled ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                                                                        {step.status === 'cancelled' ? 'DIBATALKAN' : step.status}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Dynamic Details */}
                                                                                <div className="text-xs text-gray-600 space-y-1 mb-2">
                                                                                    {step.step_type === 'interview' && (
                                                                                        <>
                                                                                            <div><span className="font-semibold">Posisi:</span> {step.meta_data?.position} - {step.meta_data?.client}</div>
                                                                                            <div><span className="font-semibold">PIC:</span> {step.interviewer} ({step.meta_data?.interviewer_job || 'HR'})</div>
                                                                                            <div><span className="font-semibold">Lokasi:</span> {step.location}</div>
                                                                                        </>
                                                                                    )}
                                                                                    {step.step_type === 'slik' && (
                                                                                        <>
                                                                                            <div><span className="font-semibold">Pemeriksa:</span> {step.interviewer}</div>
                                                                                            {step.meta_data?.kol_result && <div><span className="font-semibold">Hasil:</span> KOL {step.meta_data.kol_result}</div>}
                                                                                        </>
                                                                                    )}
                                                                                    {step.step_type === 'pemberkasan' && (
                                                                                        <div><span className="font-semibold">Admin:</span> {step.interviewer}</div>
                                                                                    )}
                                                                                    {step.step_type === 'join' && (
                                                                                        <div><span className="font-semibold">Mulai Kontrak:</span> {step.meta_data?.contract_date}</div>
                                                                                    )}
                                                                                </div>

                                                                                {step.result_note && (
                                                                                    <div className="pt-2 border-t border-gray-200/50 text-xs italic opacity-80">
                                                                                        "{step.result_note}"
                                                                                    </div>
                                                                                )}

                                                                                {/* Action Buttons - ALWAYS VISIBLE NOW */}
                                                                                <div className="mt-3 flex gap-2 border-t pt-2 border-gray-100/50">
                                                                                        <button onClick={() => openEditResultModal(step)} className="flex-1 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-xs font-bold hover:bg-gray-50 shadow-sm flex items-center justify-center gap-1">
                                                                                            {step.status === 'scheduled' ? <><CheckCircle size={12}/> Input Hasil</> : <><Edit3 size={12}/> Edit Hasil</>}
                                                                                        </button>
                                                                                        <button onClick={() => deleteInterview(step.id)} className="px-2 text-red-400 hover:bg-red-50 rounded border border-transparent hover:border-red-100" title="Hapus"><Trash2 size={14}/></button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}

                                                                {/* Logic: If Active OR Failed/Cancelled, allow "Next" or "Retry" */}
                                                                {(isChainActive || isChainFailed) && (
                                                                    <div className="flex gap-4">
                                                                        <div className="w-8 flex justify-center"><div className="w-0.5 h-8 bg-gray-200 border-l-2 border-dashed border-gray-300"></div></div>
                                                                        <button 
                                                                            onClick={() => openNextStepModal(chainId)}
                                                                            className={`flex-1 border-2 border-dashed rounded-lg p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all group
                                                                                ${isChainFailed 
                                                                                    ? 'border-amber-300 text-amber-600 bg-amber-50 hover:bg-amber-100' 
                                                                                    : 'border-gray-300 text-gray-400 bg-transparent hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50'}
                                                                            `}
                                                                        >
                                                                            {isChainFailed ? <RefreshCw size={16} className="group-hover:rotate-180 transition-transform"/> : <Plus size={16} className="group-hover:scale-110 transition-transform"/>}
                                                                            {isChainFailed ? 'Jadwalkan Ulang / Retry' : 'Lanjut Tahap Berikutnya'}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </>
                                )}
                             </div>

                             {/* 2. ACTIVITY LOG */}
                             <div className="bg-gray-50 p-6 rounded-xl border border-blue-600 shadow-sm mt-8">
                                <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                                    <StickyNote size={16}/> Catatan Aktivitas Lainnya
                                </h3>
                                {/* ... (Note Input & List remains unchanged) ... */}
                                <div className="mb-6 bg-white p-3 rounded-lg border border-blue-600 shadow-sm">
                                    <textarea 
                                        className="w-full text-sm p-2 bg-transparent outline-none min-h-[80px] placeholder:text-gray-400"
                                        placeholder="Tulis catatan aktivitas baru..."
                                        value={noteInput}
                                        onChange={(e) => setNoteInput(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
                                        {editingNoteId && (
                                            <button onClick={handleCancelEditNote} className="text-xs font-bold text-gray-500 px-3 py-1.5 hover:bg-gray-100 rounded">
                                                Batal Edit
                                            </button>
                                        )}
                                        <button 
                                            onClick={handleSaveTimelineNote}
                                            disabled={!noteInput.trim() || savingNote}
                                            className="bg-brand-600 text-white text-xs font-bold px-4 py-1.5 rounded hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {savingNote ? <Loader2 size={12} className="animate-spin"/> : <Send size={12}/>}
                                            {editingNoteId ? 'Update Catatan' : 'Posting Catatan'}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {timelineNotes.length === 0 ? (
                                        <div className="text-center py-6 text-gray-400 text-xs italic border border-dashed border-blue-600 rounded-lg">
                                            Belum ada catatan aktivitas tambahan.
                                        </div>
                                    ) : (
                                        timelineNotes.map((note) => (
                                            <div key={note.id} className="relative pl-6 animate-fadeIn group">
                                                {/* Vertical Line for Log */}
                                                <div className="absolute left-0 top-3 bottom-0 w-0.5 bg-gray-200 group-last:bottom-auto group-last:h-full"></div>
                                                <div className="absolute left-[-4px] top-3 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white shadow-sm z-10"></div>

                                                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                                                                {note.author || 'HRD'}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400">
                                                                {new Date(note.createdAt).toLocaleString('id-ID')}
                                                                {note.updatedAt && ' (diedit)'}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => handleEditTimelineNote(note)}
                                                                className="p-1 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded"
                                                                title="Edit"
                                                            >
                                                                <Edit3 size={12}/>
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteTimelineNote(note.id)}
                                                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 size={12}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                        {note.content}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                             </div>
                        </div>
                    )}
               </div>

               {/* STICKY ACTION FOOTER */}
               <div className="flex-none p-4 bg-white border-t border-gray-200 flex items-center gap-3 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] absolute bottom-0 w-full">
                   {/* ... (Unchanged) ... */}
                   {isEditing ? (
                       <>
                           <button onClick={saveChanges} className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all active:scale-95 flex justify-center items-center gap-2">
                               <Save size={18}/> Simpan Perubahan
                           </button>
                           <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
                               Batal
                           </button>
                       </>
                   ) : (
                       <>
                           <button onClick={() => handleOpenWa(selectedApplicant)} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 shadow-lg shadow-green-200 transition-all active:scale-95 flex justify-center items-center gap-2">
                               <MessageCircle size={18}/> WhatsApp
                           </button>
                           
                           <div className="flex gap-2">
                                <button onClick={openCopyModal} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 border border-indigo-200 transition-all" title="Salin Excel">
                                    <Copy size={20}/>
                                </button>
                                
                                <div className="relative">
                                     <button 
                                        onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                                        className={`p-3 rounded-xl border transition-all ${isActionMenuOpen ? 'bg-slate-100 border-slate-300' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                                     >
                                         <MoreVertical size={20}/>
                                     </button>
                                     
                                     {isActionMenuOpen && (
                                         <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 animate-fadeIn p-1 z-50">
                                            {['process', 'interview', 'hired', 'rejected'].map(s => (
                                            <button 
                                                key={s} 
                                                onClick={() => { updateStatus(selectedApplicant.id, s); setIsActionMenuOpen(false); }}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded capitalize"
                                            >
                                                Set: {s}
                                            </button>
                                            ))}
                                            <div className="h-px bg-gray-100 my-1"></div>
                                            <button onClick={() => { handleDelete(selectedApplicant.id); setIsActionMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">Hapus Permanen</button>
                                         </div>
                                     )}
                                </div>
                           </div>
                       </>
                   )}
               </div>
            </>
          )}
      </div>

      {/* --- MODALS --- */}

      {/* 1. Universal Step Modal (Flexible Form) */}
      {isStepModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-scaleIn max-h-[90vh] overflow-y-auto">
                  <div className="bg-slate-900 p-4 text-white flex justify-between items-center sticky top-0 z-10">
                      <h3 className="font-bold flex items-center gap-2">
                          <Calendar size={18}/> 
                          {targetChainId ? 'Lanjut Tahap Berikutnya' : 'Mulai Proses Baru'}
                      </h3>
                      <button onClick={() => setIsStepModalOpen(false)}><X size={18}/></button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                      {/* Step Type Selection (Only if continuing, or fixed to interview if new) */}
                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-1 block">Jenis Kegiatan</label>
                          <select 
                              className="w-full border p-2 rounded" 
                              value={stepType} 
                              onChange={e => setStepType(e.target.value as any)}
                              disabled={!targetChainId} // New chain always starts with interview? Or flexible? Let's keep flexible but default interview
                          >
                              <option value="interview">Interview</option>
                              {targetChainId && <option value="slik">Cek SLIK (BI Checking)</option>}
                              {targetChainId && <option value="pemberkasan">Pemberkasan</option>}
                              {targetChainId && <option value="join">Join / Sign Contract</option>}
                          </select>
                      </div>

                      {/* --- FORM FIELDS BASED ON TYPE --- */}
                      
                      {stepType === 'interview' && (
                          <>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-xs font-bold text-gray-500 mb-1 block">Tanggal</label>
                                      <input type="date" className="w-full border p-2 rounded" value={stepForm.date} onChange={e => setStepForm({...stepForm, date: e.target.value})} />
                                  </div>
                                  <div>
                                      <label className="text-xs font-bold text-gray-500 mb-1 block">Jam (WIB)</label>
                                      <input type="time" className="w-full border p-2 rounded" value={stepForm.time} onChange={e => setStepForm({...stepForm, time: e.target.value})} />
                                  </div>
                              </div>
                              
                              {/* Cascading Dropdowns */}
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">Klien & Posisi</label>
                                  <div className="grid grid-cols-2 gap-2">
                                      <select 
                                          className="border p-2 rounded text-xs w-full" 
                                          value={stepForm.client} 
                                          onChange={e => setStepForm({...stepForm, client: e.target.value, position: '', placement: ''})}
                                      >
                                          <option value="">- Klien -</option>
                                          {clients.filter(c => c.is_active).map(c => (
                                              <option key={c.id} value={c.id}>{c.name}</option>
                                          ))}
                                      </select>
                                      
                                      <select 
                                          className="border p-2 rounded text-xs w-full disabled:bg-gray-100" 
                                          value={stepForm.position} 
                                          onChange={e => setStepForm({...stepForm, position: e.target.value, placement: ''})}
                                          disabled={!stepForm.client}
                                      >
                                          <option value="">- Posisi -</option>
                                          {positions
                                              .filter(p => p.is_active && p.client_id.toString() === stepForm.client)
                                              .map(p => (
                                                  <option key={p.id} value={p.id}>{p.name}</option>
                                              ))
                                          }
                                      </select>
                                  </div>
                              </div>
                              
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">Penempatan & Lokasi Interview</label>
                                  <select 
                                      className="w-full border p-2 rounded mb-2 disabled:bg-gray-100" 
                                      value={stepForm.placement} 
                                      onChange={e => setStepForm({...stepForm, placement: e.target.value})}
                                      disabled={!stepForm.position}
                                  >
                                      <option value="">- Pilih Penempatan -</option>
                                      {placements
                                          .filter(p => p.is_active && p.position_id.toString() === stepForm.position)
                                          .map(p => (
                                              <option key={p.id} value={p.id}>{p.label}</option>
                                          ))
                                      }
                                  </select>
                                  
                                  <input className="w-full border p-2 rounded" placeholder="Lokasi Interview (Alamat Manual)..." value={stepForm.location} onChange={e => setStepForm({...stepForm, location: e.target.value})} />
                              </div>
                              
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">Interviewer (PIC)</label>
                                  <div className="grid grid-cols-2 gap-2">
                                      <input className="border p-2 rounded" placeholder="Nama..." value={stepForm.pic} onChange={e => setStepForm({...stepForm, pic: e.target.value})} />
                                      <input className="border p-2 rounded" placeholder="Jabatan..." value={stepForm.interviewer_job} onChange={e => setStepForm({...stepForm, interviewer_job: e.target.value})} />
                                  </div>
                              </div>
                          </>
                      )}

                      {stepType === 'slik' && (
                          <>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">Tanggal Pemeriksaan</label>
                                  <input type="date" className="w-full border p-2 rounded" value={stepForm.date} onChange={e => setStepForm({...stepForm, date: e.target.value})} />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">Pemeriksa (PIC)</label>
                                  <input className="w-full border p-2 rounded" placeholder="Nama Pemeriksa..." value={stepForm.pic} onChange={e => setStepForm({...stepForm, pic: e.target.value})} />
                              </div>
                          </>
                      )}

                      {stepType === 'pemberkasan' && (
                          <>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">Tanggal Penyerahan</label>
                                  <input type="date" className="w-full border p-2 rounded" value={stepForm.date} onChange={e => setStepForm({...stepForm, date: e.target.value})} />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">Penerima Dokumen (PIC)</label>
                                  <input className="w-full border p-2 rounded" placeholder="Nama Admin..." value={stepForm.pic} onChange={e => setStepForm({...stepForm, pic: e.target.value})} />
                              </div>
                          </>
                      )}

                      {stepType === 'join' && (
                          <>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">Tanggal Mulai Kontrak</label>
                                  <input type="date" className="w-full border p-2 rounded" value={stepForm.contract_date} onChange={e => setStepForm({...stepForm, contract_date: e.target.value})} />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">Tanggal Sign Contract</label>
                                  <input type="date" className="w-full border p-2 rounded" value={stepForm.date} onChange={e => setStepForm({...stepForm, date: e.target.value})} />
                              </div>
                          </>
                      )}

                      <button onClick={handleSaveStep} className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 mt-2">
                          Simpan Jadwal
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* 2. Result Modal */}
      {isResultModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-scaleIn">
                  <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                      <h3 className="font-bold flex items-center gap-2"><CheckCircle size={18}/> Update Hasil</h3>
                      <button onClick={() => setIsResultModalOpen(false)}><X size={18}/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-1 block">Keputusan</label>
                          <select 
                              className="w-full border p-2 rounded" 
                              value={resultForm.status} 
                              onChange={e => setResultForm({...resultForm, status: e.target.value})}
                          >
                              <option value="passed">✅ Lolos (Passed)</option>
                              <option value="failed">❌ Gagal (Failed)</option>
                              <option value="cancelled">⚠️ Dibatalkan</option>
                          </select>
                      </div>

                      {/* Special field for SLIK result in result modal? Or assume stored in note? Let's add specific */}
                      {interviews.find(i => i.id === selectedInterviewId)?.step_type === 'slik' && (
                          <div>
                              <label className="text-xs font-bold text-gray-500 mb-1 block">Hasil KOL</label>
                              <select 
                                  className="w-full border p-2 rounded" 
                                  value={resultForm.kol_result} 
                                  onChange={e => setResultForm({...resultForm, kol_result: e.target.value})}
                              >
                                  <option value="">- Pilih -</option>
                                  <option value="1">KOL 1 (Lancar)</option>
                                  <option value="2">KOL 2 (Dalam Perhatian)</option>
                                  <option value="3">KOL 3 (Kurang Lancar)</option>
                                  <option value="4">KOL 4 (Diragukan)</option>
                                  <option value="5">KOL 5 (Macet)</option>
                              </select>
                          </div>
                      )}

                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-1 block">Catatan / Alasan</label>
                          <textarea 
                              className="w-full border p-2 rounded min-h-[100px]" 
                              placeholder="Berikan alasan atau catatan..."
                              value={resultForm.note} 
                              onChange={e => setResultForm({...resultForm, note: e.target.value})} 
                          />
                      </div>
                      <button onClick={handleUpdateResult} className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 mt-2">
                          Update Hasil
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Copy Modal Dialog */}
      {isCopyModalOpen && (
         <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-scaleIn">
               <h3 className="font-bold text-lg mb-4">Salin Data ke Excel</h3>
               <div className="space-y-3 mb-4">
                  <div>
                     <label className="text-xs font-bold text-gray-500">PIC</label>
                     <select className="w-full border p-2 rounded" value={copyFormData.pic} onChange={e => setCopyFormData({...copyFormData, pic: e.target.value})}>
                        {PIC_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="text-xs font-bold text-gray-500">Sentra</label>
                     <input className="w-full border p-2 rounded" placeholder="Sentra..." value={copyFormData.sentra} onChange={e => setCopyFormData({...copyFormData, sentra: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-xs font-bold text-gray-500">Cabang</label>
                     <input className="w-full border p-2 rounded" placeholder="Cabang..." value={copyFormData.cabang} onChange={e => setCopyFormData({...copyFormData, cabang: e.target.value})} />
                  </div>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => setIsCopyModalOpen(false)} className="flex-1 bg-gray-100 py-2 rounded font-bold text-gray-600">Batal</button>
                  <button onClick={executeCopy} className="flex-1 bg-indigo-600 py-2 rounded font-bold text-white">Salin</button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};
