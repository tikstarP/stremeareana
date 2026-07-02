import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { roomId, userId, gameType } = req.query;
      let query = supabase.from('game_scores').select('*');
      if (roomId) query = query.eq('room_id', parseInt(roomId));
      if (userId) query = query.eq('user_id', userId);
      if (gameType) query = query.eq('game_type', gameType);
      query = query.order('created_at', { ascending: false }).limit(100);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { room_id, user_id, username, game_type, score } = req.body;
      const { data, error } = await supabase.from('game_scores').insert({
        room_id, user_id, username, game_type, score: score || 0
      }).select().single();
      if (error) throw error;

      // Update leaderboard
      const { data: existing } = await supabase.from('leaderboard_entries').select('*').eq('user_id', user_id).eq('period', 'all').single();
      if (existing) {
        const won = score >= 100 ? 1 : 0;
        await supabase.from('leaderboard_entries').update({
          total_points: existing.total_points + score,
          games_won: existing.games_won + won,
          streak: won ? existing.streak + 1 : 0,
          username
        }).eq('id', existing.id);
      } else {
        const won = score >= 100 ? 1 : 0;
        await supabase.from('leaderboard_entries').insert({
          user_id, username, total_points: score, games_won: won, streak: won ? 1 : 0, period: 'all',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`
        });
      }

      // Update profile points
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user_id).single();
      if (profile) {
        await supabase.from('profiles').update({ points: profile.points + score }).eq('id', user_id);
      }

      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
