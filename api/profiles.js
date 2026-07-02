import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (req.method === 'GET') {
      const userId = req.query.userId;
      if (userId) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'PUT') {
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) return res.status(401).json({ error: 'Invalid token' });
      const { username, avatar_url } = req.body;
      const updateData = {};
      if (username) updateData.username = username;
      if (avatar_url) updateData.avatar_url = avatar_url;
      const { data, error } = await supabase.from('profiles').update(updateData).eq('id', user.id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
