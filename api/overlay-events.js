import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { room_id, event_type, event_data } = req.body;
      if (!room_id || !event_type) return res.status(400).json({ error: 'room_id and event_type required' });
      const { data, error } = await supabase.from('overlay_events').insert({
        room_id, event_type, event_data: event_data || {}
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'GET') {
      const { roomId, since } = req.query;
      let query = supabase.from('overlay_events').select('*').order('created_at', { ascending: false }).limit(50);
      if (roomId) query = query.eq('room_id', parseInt(String(roomId)));
      if (since) query = query.gt('created_at', since);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json((data || []).reverse());
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
