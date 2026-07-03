import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import supabase from './api/db-client.js';

const app = express();
const PORT = 3001;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function getToken(req) {
  return req.headers.authorization?.replace('Bearer ', '');
}

async function getUserFromToken(req) {
  const token = getToken(req);
  if (!token) return null;
  const { data } = await supabase.auth.getUser(token);
  return data?.user || null;
}

// ─── Rooms ───────────────────────────────────────────────────
app.get('/api/rooms', async (req, res) => {
  try {
    const { code } = req.query;
    if (code) {
      const { data, error } = await supabase.from('rooms').select('*').eq('code', String(code).toUpperCase());
      if (error) throw error;
      return res.json(data && data.length > 0 ? data[0] : null);
    }
    const { data, error } = await supabase.from('rooms').select('*').eq('is_live', true).order('created_at', { ascending: false }).limit(20);
    if (error) throw error;
    return res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { name, description } = req.body;
    const code = generateCode();
    const { data: profile } = await supabase.from('profiles').select('username, avatar_url').eq('id', user.id).maybeSingle();
    const { data, error } = await supabase.from('rooms').insert({
      code, name: name || 'Untitled Room', description: description || '',
      host_id: user.id,
      host_name: profile?.username || user.email?.split('@')[0] || 'Streamer',
      host_avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
      is_live: true, viewer_count: 0
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rooms', async (req, res) => {
  try {
    const { id, is_live, viewer_count, name, video_id } = req.body;
    const updateData = {};
    if (is_live !== undefined) updateData.is_live = is_live;
    if (viewer_count !== undefined) updateData.viewer_count = viewer_count;
    if (name !== undefined) updateData.name = name;
    if (video_id !== undefined) updateData.video_id = video_id;
    const { data, error } = await supabase.from('rooms').update(updateData).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Profiles ────────────────────────────────────────────────
app.get('/api/profiles', async (req, res) => {
  try {
    const { userId } = req.query;
    if (userId) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error && error.code !== 'PGRST116') throw error;
      return res.json(data || null);
    }
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/profiles', async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { username, avatar_url } = req.body;
    const updateData = {};
    if (username) updateData.username = username;
    if (avatar_url) updateData.avatar_url = avatar_url;
    const { data, error } = await supabase.from('profiles').update(updateData).eq('id', user.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Chat ────────────────────────────────────────────────────
app.get('/api/chat', async (req, res) => {
  try {
    const { roomId } = req.query;
    let query = supabase.from('chat_messages').select('*');
    if (roomId) query = query.eq('room_id', parseInt(String(roomId)));
    query = query.order('created_at', { ascending: true }).limit(100);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { room_id, user_id, username, message, amount, color, is_super } = req.body;
    const { data, error } = await supabase.from('chat_messages').insert({
      room_id, user_id, username, message, amount: amount || 0, color: color || '#FF5A1F', is_super: is_super || false
    }).select().single();
    if (error) throw error;

    if (is_super && amount > 0 && user_id) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user_id).single();
      if (profile && profile.coins >= amount) {
        await supabase.from('profiles').update({ coins: profile.coins - amount }).eq('id', user_id);
      }
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Queue ───────────────────────────────────────────────────
app.get('/api/queue', async (req, res) => {
  try {
    const { roomId } = req.query;
    let query = supabase.from('queue_entries').select('*');
    if (roomId) query = query.eq('room_id', parseInt(String(roomId)));
    query = query.order('position', { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/queue', async (req, res) => {
  try {
    const { room_id, user_id, username, avatar_url, type } = req.body;
    const { count } = await supabase.from('queue_entries').select('*', { count: 'exact', head: true }).eq('room_id', room_id);
    const position = (count || 0) + 1;
    const { data, error } = await supabase.from('queue_entries').insert({
      room_id, user_id, username, avatar_url, type: type || 'free', position
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/queue', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('queue_entries').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Games & Leaderboard ────────────────────────────────────
app.get('/api/games', async (req, res) => {
  try {
    const { roomId, userId, gameType } = req.query;
    let query = supabase.from('game_scores').select('*');
    if (roomId) query = query.eq('room_id', parseInt(String(roomId)));
    if (userId) query = query.eq('user_id', userId);
    if (gameType) query = query.eq('game_type', gameType);
    query = query.order('created_at', { ascending: false }).limit(100);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/games', async (req, res) => {
  try {
    const { room_id, user_id, username, game_type, score } = req.body;
    const { data, error } = await supabase.from('game_scores').insert({
      room_id, user_id, username, game_type, score: score || 0
    }).select().single();
    if (error) throw error;

    const won = (score || 0) >= 100 ? 1 : 0;
    const { data: existing } = await supabase.from('leaderboard_entries').select('*').eq('user_id', user_id).eq('period', 'all').maybeSingle();
    if (existing) {
      await supabase.from('leaderboard_entries').update({
        total_points: existing.total_points + (score || 0),
        games_won: existing.games_won + won,
        streak: won ? existing.streak + 1 : 0,
        username
      }).eq('id', existing.id);
    } else {
      await supabase.from('leaderboard_entries').insert({
        user_id, username, total_points: score || 0, games_won: won, streak: won ? 1 : 0, period: 'all',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`
      });
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user_id).maybeSingle();
    if (profile) {
      await supabase.from('profiles').update({ points: profile.points + (score || 0) }).eq('id', user_id);
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const { period } = req.query;
    let query = supabase.from('leaderboard_entries').select('*');
    if (period) query = query.eq('period', period);
    else query = query.eq('period', 'all');
    query = query.order('total_points', { ascending: false }).limit(50);
    const { data, error } = await query;
    if (error) throw error;
    const ranked = (data || []).map((entry, i) => ({ ...entry, rank: i + 1 }));
    res.json(ranked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Art Submissions (Fan Drops) ─────────────────────────────
app.get('/api/art', async (req, res) => {
  try {
    const { roomId } = req.query;
    let query = supabase.from('art_submissions').select('*');
    if (roomId) query = query.eq('room_id', parseInt(String(roomId)));
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/art', async (req, res) => {
  try {
    const { room_id, user_id, username, avatar_url, image_url } = req.body;
    const { data, error } = await supabase.from('art_submissions').insert({
      room_id, user_id, username, avatar_url, image_url, status: 'pending'
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/art', async (req, res) => {
  try {
    const { id, status, rating } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (rating !== undefined) updateData.rating = rating;
    const { data, error } = await supabase.from('art_submissions').update(updateData).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Upload ──────────────────────────────────────────────────
app.post('/api/upload', async (req, res) => {
  try {
    const { fileName, fileBase64, contentType } = req.body;
    if (!fileName || !fileBase64) return res.status(400).json({ error: 'Missing file data' });
    const buffer = Buffer.from(fileBase64, 'base64');
    const { data, error } = await supabase.storage
      .from('art-uploads')
      .upload(fileName, buffer, { contentType, upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('art-uploads').getPublicUrl(fileName);
    res.json({ url: urlData.publicUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Auth Callback ───────────────────────────────────────────
app.post('/api/auth-callback', async (req, res) => {
  try {
    const { user_id, email } = req.body;
    if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

    const { data: existing } = await supabase.from('profiles').select('*').eq('id', user_id).maybeSingle();
    if (existing) return res.json(existing);

    const username = email ? email.split('@')[0] : 'User_' + user_id.substring(0, 6);
    const avatar_url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
    const { data, error } = await supabase.from('profiles').insert({
      id: user_id, username, avatar_url, coins: 200, points: 0, streak: 0
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[server] API running on http://localhost:${PORT}`);
});
