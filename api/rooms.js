import supabase from './db-client.js';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { code } = req.query;
      if (code) {
        const { data, error } = await supabase.from('rooms').select('*').eq('code', code.toUpperCase()).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      const { data, error } = await supabase.from('rooms').select('*').eq('is_live', true).order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) return res.status(401).json({ error: 'Invalid token' });
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
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, is_live, viewer_count, name, video_id, status } = req.body;
      const updateData = {};
      if (is_live !== undefined) updateData.is_live = is_live;
      if (viewer_count !== undefined) updateData.viewer_count = viewer_count;
      if (name !== undefined) updateData.name = name;
      if (video_id !== undefined) updateData.video_id = video_id;
      if (status !== undefined) updateData.status = status;
      const { data, error } = await supabase.from('rooms').update(updateData).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
