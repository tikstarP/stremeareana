import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { roomId } = req.query;
      let query = supabase.from('chat_messages').select('*');
      if (roomId) query = query.eq('room_id', parseInt(roomId));
      query = query.order('created_at', { ascending: true }).limit(100);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { room_id, user_id, username, message, amount, color, is_super } = req.body;
      const { data, error } = await supabase.from('chat_messages').insert({
        room_id, user_id, username, message, amount: amount || 0, color: color || '#FF5A1F', is_super: is_super || false
      }).select().single();
      if (error) throw error;

      // Deduct coins for super chat
      if (is_super && amount > 0 && user_id) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user_id).single();
        if (profile && profile.coins >= amount) {
          await supabase.from('profiles').update({ coins: profile.coins - amount }).eq('id', user_id);
        }
      }

      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
