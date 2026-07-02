import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { roomId } = req.query;
      let query = supabase.from('art_submissions').select('*');
      if (roomId) query = query.eq('room_id', parseInt(roomId));
      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { room_id, user_id, username, avatar_url, image_url } = req.body;
      const { data, error } = await supabase.from('art_submissions').insert({
        room_id, user_id, username, avatar_url, image_url, status: 'pending'
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status, rating } = req.body;
      const updateData = {};
      if (status) updateData.status = status;
      if (rating !== undefined) updateData.rating = rating;
      const { data, error } = await supabase.from('art_submissions').update(updateData).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
