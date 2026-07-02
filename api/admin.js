import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  try {
    if (req.method === 'GET') {
      if (req.query.type === 'users') {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200);
        if (error) throw error;
        return res.status(200).json(data || []);
      }

      if (req.query.type === 'rooms') {
        const query = supabase.from('rooms').select('*').order('created_at', { ascending: false }).limit(200);
        if (req.query.live === 'true') query.eq('is_live', true);
        const { data, error } = await query;
        if (error) throw error;
        return res.status(200).json(data || []);
      }

      if (req.query.type === 'art') {
        const { data, error } = await supabase.from('art_submissions').select('*').order('created_at', { ascending: false }).limit(200);
        if (error) throw error;
        return res.status(200).json(data || []);
      }

      if (req.query.type === 'chat') {
        const { data, error } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(200);
        if (error) throw error;
        return res.status(200).json(data || []);
      }

      if (req.query.type === 'leaderboard') {
        const { data, error } = await supabase.from('leaderboard_entries').select('*, profiles(username, avatar_url)').order('total_points', { ascending: false }).limit(100);
        if (error) throw error;
        return res.status(200).json(data || []);
      }

      if (req.query.type === 'queue') {
        const { data, error } = await supabase.from('queue_entries').select('*').order('created_at', { ascending: false }).limit(200);
        if (error) throw error;
        return res.status(200).json(data || []);
      }

      const { data: userCount, error: userErr } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      const { data: roomCount, error: roomErr } = await supabase.from('rooms').select('id', { count: 'exact', head: true });
      const { data: artCount, error: artErr } = await supabase.from('art_submissions').select('id', { count: 'exact', head: true });
      const { data: chatCount, error: chatErr } = await supabase.from('chat_messages').select('id', { count: 'exact', head: true });
      const { data: queueCount, error: queueErr } = await supabase.from('queue_entries').select('id', { count: 'exact', head: true });
      if (userErr || roomErr || artErr || chatErr || queueErr) throw userErr || roomErr || artErr || chatErr || queueErr;

      return res.status(200).json({
        users: userCount?.length || 0,
        rooms: roomCount?.length || 0,
        art_submissions: artCount?.length || 0,
        chat_messages: chatCount?.length || 0,
        queue_entries: queueCount?.length || 0,
      });
    }

    if (req.method === 'DELETE') {
      if (req.query.type === 'room' && req.query.id) {
        const { error } = await supabase.from('rooms').delete().eq('id', parseInt(req.query.id));
        if (error) throw error;
        return res.status(200).json({ success: true });
      }
      if (req.query.type === 'user' && req.query.id) {
        const { error } = await supabase.from('profiles').delete().eq('id', req.query.id);
        if (error) throw error;
        await supabase.auth.admin.deleteUser(req.query.id);
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ error: 'Missing type or id' });
    }

    if (req.method === 'PUT') {
      if (req.query.type === 'art' && req.query.id) {
        const { status } = req.body;
        if (!['approved', 'rejected', 'pending'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
        const { data, error } = await supabase.from('art_submissions').update({ status }).eq('id', parseInt(req.query.id)).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      return res.status(400).json({ error: 'Invalid type' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Admin API error:', err);
    res.status(500).json({ error: err.message });
  }
}
