import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { roomId } = req.query;
      let query = supabase.from('queue_entries').select('*');
      if (roomId) query = query.eq('room_id', parseInt(roomId));
      query = query.order('position', { ascending: true });
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { room_id, user_id, username, avatar_url, type } = req.body;
      const { count } = await supabase.from('queue_entries').select('*', { count: 'exact', head: true }).eq('room_id', room_id);
      const position = (count || 0) + 1;
      const { data, error } = await supabase.from('queue_entries').insert({
        room_id, user_id, username, avatar_url, type: type || 'free', position
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('queue_entries').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
