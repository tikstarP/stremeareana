import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { period } = req.query;
      let query = supabase.from('leaderboard_entries').select('*');
      if (period) query = query.eq('period', period);
      else query = query.eq('period', 'all');
      query = query.order('total_points', { ascending: false }).limit(50);
      const { data, error } = await query;
      if (error) throw error;
      // Add rank
      const ranked = (data || []).map((entry, i) => ({ ...entry, rank: i + 1 }));
      return res.status(200).json(ranked);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
