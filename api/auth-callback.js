import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { user_id, email } = req.body;
      if (!user_id) return res.status(400).json({ error: 'Missing user_id' });
      
      // Check if profile exists
      const { data: existing } = await supabase.from('profiles').select('*').eq('id', user_id).single();
      if (existing) return res.status(200).json(existing);
      
      // Create profile
      const username = email ? email.split('@')[0] : 'User_' + user_id.substring(0, 6);
      const avatar_url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
const { data, error } = await supabase.from('profiles').insert({
        id: user_id, username, avatar_url, coins: 15, points: 0, streak: 0
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
