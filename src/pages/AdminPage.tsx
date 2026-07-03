import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Home, Image as ImageIcon, MessageSquare, Clock, LogOut, Trash2, Check, X, RefreshCw, Search, Shield, ListOrdered } from 'lucide-react';
import MoltenBackground from '../components/MoltenBackground';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../context/AppContext';
import Toast from '../components/Toast';

type Tab = 'overview' | 'users' | 'rooms' | 'art' | 'chat' | 'queue';

interface Stats { users: number; rooms: number; art_submissions: number; chat_messages: number; queue_entries: number; }

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useApp();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [art, setArt] = useState<any[]>([]);
  const [chat, setChat] = useState<any[]>([]);
  const [queue, setQueueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const token = user?.aud === 'authenticated' ? user?.aud : null;

  const authHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const { default: supabase } = await import('../lib/supabase');
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return { Authorization: `Bearer ${session.access_token}` };
    return {};
  }, []);

  const fetchData = useCallback(async (endpoint: string) => {
    const headers = await authHeaders();
    const res = await fetch(`/api/admin?${endpoint}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  }, [authHeaders]);

  const loadStats = useCallback(async () => {
    try { setStats(await fetchData('')); } catch { addToast({ message: 'Failed to load stats', type: 'error' }); }
  }, [fetchData, addToast]);

  const loadUsers = useCallback(async () => {
    try { setUsers(await fetchData('type=users')); } catch { addToast({ message: 'Failed to load users', type: 'error' }); }
  }, [fetchData, addToast]);

  const loadRooms = useCallback(async () => {
    try { setRooms(await fetchData('type=rooms')); } catch { addToast({ message: 'Failed to load rooms', type: 'error' }); }
  }, [fetchData, addToast]);

  const loadArt = useCallback(async () => {
    try { setArt(await fetchData('type=art')); } catch { addToast({ message: 'Failed to load art', type: 'error' }); }
  }, [fetchData, addToast]);

  const loadChat = useCallback(async () => {
    try { setChat(await fetchData('type=chat')); } catch { addToast({ message: 'Failed to load chat', type: 'error' }); }
  }, [fetchData, addToast]);

  const loadQueue = useCallback(async () => {
    try { setQueueData(await fetchData('type=queue')); } catch { addToast({ message: 'Failed to load queue', type: 'error' }); }
  }, [fetchData, addToast]);

  useEffect(() => {
    if (!authLoading && user) {
      setLoading(false);
      loadStats();
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (tab === 'users') loadUsers();
    if (tab === 'rooms') loadRooms();
    if (tab === 'art') loadArt();
    if (tab === 'chat') loadChat();
    if (tab === 'queue') loadQueue();
  }, [tab]);

  const deleteRoom = async (id: number) => {
    const headers = await authHeaders();
    const res = await fetch(`/api/admin?type=room&id=${id}`, { method: 'DELETE', headers });
    if (res.ok) { addToast({ message: 'Room deleted', type: 'success' }); loadRooms(); loadStats(); }
    else addToast({ message: 'Failed to delete', type: 'error' });
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    const headers = await authHeaders();
    const res = await fetch(`/api/admin?type=user&id=${id}`, { method: 'DELETE', headers });
    if (res.ok) { addToast({ message: 'User deleted', type: 'success' }); loadUsers(); loadStats(); }
    else addToast({ message: 'Failed to delete', type: 'error' });
  };

  const updateArtStatus = async (id: number, status: string) => {
    const headers = await authHeaders();
    const res = await fetch(`/api/admin?type=art&id=${id}`, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (res.ok) { addToast({ message: `Art ${status}`, type: 'success' }); loadArt(); }
    else addToast({ message: 'Failed to update', type: 'error' });
  };

  if (authLoading) return <div className="min-h-screen bg-transparent flex items-center justify-center"><div className="w-8 h-8 border-2 border-arcade-yellow border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return (
    <div className="min-h-screen bg-transparent flex items-center justify-center"><MoltenBackground />
      <div className="relative z-10 text-center"><Shield className="w-12 h-12 text-arcade-pink mx-auto mb-4" /><p className="text-neutral-400">Sign in to access admin panel</p></div>
    </div>
  );

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'rooms', label: 'Rooms', icon: Home },
    { id: 'art', label: 'Art', icon: ImageIcon },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'queue', label: 'Queue', icon: ListOrdered },
  ];

  const filtered = (items: any[], fields: string[]) =>
    items.filter(item => fields.some(f => String(item[f] || '').toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <Toast />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-arcade-yellow" />
            <h1 className="font-display text-xl font-bold"><span className="gradient-text">Admin Panel</span></h1>
          </div>
          <button onClick={() => { loadStats(); if (tab === 'users') loadUsers(); if (tab === 'rooms') loadRooms(); if (tab === 'art') loadArt(); }}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-text-primary text-xs font-semibold flex items-center gap-1.5"
          ><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar mb-6 pb-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[44px] ${tab === t.id ? 'bg-arcade-yellow/15 text-arcade-yellow border border-arcade-yellow/30' : 'bg-white/[0.03] text-neutral-400 border border-transparent hover:text-text-primary'}`}
            ><t.icon className="w-3.5 h-3.5" /> {t.label}</button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-yellow/40 transition-all"
          />
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Users', value: stats?.users || 0, icon: Users, color: 'text-arcade-blue', bg: 'bg-arcade-blue/10' },
              { label: 'Rooms', value: stats?.rooms || 0, icon: Home, color: 'text-arcade-green', bg: 'bg-arcade-green/10' },
              { label: 'Art Submissions', value: stats?.art_submissions || 0, icon: ImageIcon, color: 'text-arcade-purple', bg: 'bg-arcade-purple/10' },
              { label: 'Chat Messages', value: stats?.chat_messages || 0, icon: MessageSquare, color: 'text-arcade-pink', bg: 'bg-arcade-pink/10' },
              { label: 'Queue Entries', value: stats?.queue_entries || 0, icon: ListOrdered, color: 'text-arcade-yellow', bg: 'bg-arcade-yellow/10' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white/[0.06]`}>
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                <p className="text-2xl font-bold text-text-primary">{s.value}</p>
                <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {filtered(users, ['username', 'email', 'id']).map(u => (
              <div key={u.id} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06] flex items-center gap-3">
                <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} alt="" className="w-8 h-8 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{u.username || 'No name'}</p>
                  <p className="text-[10px] text-text-muted truncate">{u.email || u.id}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-text-muted shrink-0">
                  <span>{u.coins || 0} 🎲</span>
                  <span>{u.points || 0} pts</span>
                </div>
                <button onClick={() => deleteUser(u.id)} className="min-h-[44px] px-2 py-1 rounded-lg text-neutral-500 hover:text-red-400 transition-all" aria-label="Delete user"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {users.length === 0 && <p className="text-center text-text-muted text-sm py-8">No users</p>}
          </motion.div>
        )}

        {/* Rooms */}
        {tab === 'rooms' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {filtered(rooms, ['name', 'code', 'host_name', 'id']).map(r => (
              <div key={r.id} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06] flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${r.is_live ? 'bg-arcade-green/20 text-arcade-green' : 'bg-neutral-500/20 text-neutral-500'}`}>
                  {r.is_live ? 'ON' : 'OFF'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{r.name} <span className="text-text-muted font-mono">@{r.code}</span></p>
                  <p className="text-[10px] text-text-muted truncate">{r.host_name} · {r.viewer_count || 0} viewers</p>
                </div>
                <button onClick={() => deleteRoom(r.id)} className="min-h-[44px] px-2 py-1 rounded-lg text-neutral-500 hover:text-red-400 transition-all" aria-label="Delete room"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {rooms.length === 0 && <p className="text-center text-text-muted text-sm py-8">No rooms</p>}
          </motion.div>
        )}

        {/* Art */}
        {tab === 'art' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {filtered(art, ['username', 'type', 'status']).map(a => (
              <div key={a.id} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06] flex items-center gap-3">
                {a.image_url ? <img src={a.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center text-lg">{a.emoji || '💬'}</div>}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{a.username} · {a.type}</p>
                  <p className="text-[10px] text-text-muted truncate">{a.message || a.emoji || 'No text'}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  a.status === 'approved' ? 'bg-arcade-green/15 text-arcade-green' : a.status === 'rejected' ? 'bg-red-500/15 text-red-400' : 'bg-arcade-yellow/15 text-arcade-yellow'
                }`}>{a.status}</span>
                {a.status !== 'approved' && <button onClick={() => updateArtStatus(a.id, 'approved')} className="min-h-[44px] px-2 py-1 rounded-lg text-neutral-500 hover:text-arcade-green transition-all" aria-label="Approve"><Check className="w-4 h-4" /></button>}
                {a.status !== 'rejected' && <button onClick={() => updateArtStatus(a.id, 'rejected')} className="min-h-[44px] px-2 py-1 rounded-lg text-neutral-500 hover:text-red-400 transition-all" aria-label="Reject"><X className="w-4 h-4" /></button>}
              </div>
            ))}
            {art.length === 0 && <p className="text-center text-text-muted text-sm py-8">No submissions</p>}
          </motion.div>
        )}

        {/* Chat */}
        {tab === 'chat' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {filtered(chat, ['username', 'message']).map(c => (
              <div key={c.id} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: c.color || '#FFF2DD' }}>{c.username}</span>
                  {c.is_super && <span className="px-1 py-0.5 rounded bg-arcade-yellow/20 text-arcade-yellow text-[9px] font-bold">Super</span>}
                  <span className="text-[9px] text-text-muted ml-auto">{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-text-primary">{c.message}</p>
              </div>
            ))}
            {chat.length === 0 && <p className="text-center text-text-muted text-sm py-8">No messages</p>}
          </motion.div>
        )}

        {/* Queue */}
        {tab === 'queue' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {filtered(queue, ['username', 'type']).map(q => (
              <div key={q.id} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06] flex items-center gap-3">
                <img src={q.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${q.user_id}`} alt="" className="w-8 h-8 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{q.username}</p>
                  <p className="text-[10px] text-text-muted">Room #{q.room_id} · {q.type}</p>
                </div>
                <span className="text-[10px] text-text-muted">{new Date(q.created_at).toLocaleString()}</span>
              </div>
            ))}
            {queue.length === 0 && <p className="text-center text-text-muted text-sm py-8">No queue entries</p>}
          </motion.div>
        )}

        <p className="text-center text-[10px] text-neutral-600 mt-8">Logged in as {user.email}</p>
      </div>
    </div>
  );
}
