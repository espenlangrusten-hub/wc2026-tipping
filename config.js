/**
 * config.js — Supabase configuration
 *
 * FILL IN your Supabase project URL and anon key.
 * Find these in: Supabase Dashboard → Settings → API
 */

const SUPABASE_URL  = 'https://wnhwtzokykwxgmsqsisf.supabase.co';
const SUPABASE_ANON = 'sb_publishable_hJSal32v817PjjyVmujaEg_RSl6j3tJ';

const CONFIG = {
  LANG: 'no',
  LEADERBOARD_REFRESH_SEC: 300,
};

// Supabase client (loaded via CDN in HTML)
let supabase;

function initSupabase() {
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  } else {
    // Fallback: supabaseClient from older CDN naming
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  }
  return supabase;
}

// ── API helpers wrapping Supabase ──────────────────────────────

const API = {
  // Public reads — direct table queries via anon key + RLS
  async getTeams() {
    const { data, error } = await supabase.from('teams').select('*').order('group_code').order('team_code');
    if (error) throw new Error(error.message);
    return data;
  },

  async getTeamsByGroup() {
    const teams = await this.getTeams();
    const groups = {};
    for (const t of teams) {
      if (!groups[t.group_code]) groups[t.group_code] = [];
      groups[t.group_code].push(t);
    }
    return groups;
  },

  async getQuestions() {
    const { data, error } = await supabase.from('extra_questions').select('*').order('sort_order');
    if (error) throw new Error(error.message);
    return data;
  },

  async getConfig() {
    const { data, error } = await supabase.rpc('get_public_config');
    if (error) throw new Error(error.message);
    return data;
  },

  async getLeaderboard() {
    const { data, error } = await supabase.from('scores').select('*').order('rank');
    if (error) throw new Error(error.message);
    return data;
  },

  async getScoringConfig() {
    const { data, error } = await supabase.from('scoring_config').select('*');
    if (error) throw new Error(error.message);
    const config = {};
    for (const r of data) {
      let v = r.value;
      if (v === 'true') v = true;
      else if (v === 'false') v = false;
      else if (!isNaN(Number(v)) && v !== '') v = Number(v);
      config[r.key] = v;
    }
    return config;
  },

  // Submit entry — calls database function
  async submitEntry(payload) {
    const { data, error } = await supabase.rpc('submit_entry', { data: payload });
    if (error) throw new Error(error.message);
    return data;
  },

  // Admin: verify password
  async verifyAdmin(pwd) {
    const { data, error } = await supabase.rpc('verify_admin', { pwd });
    if (error) throw new Error(error.message);
    return data === true;
  },

  // Admin: get all scoring data
  async adminGetScoringData(pwd) {
    const { data, error } = await supabase.rpc('admin_get_scoring_data', { pwd });
    if (error) throw new Error(error.message);
    return data;
  },

  // Admin: write computed scores
  async adminWriteScores(pwd, scoresData) {
    const { data, error } = await supabase.rpc('admin_write_scores', {
      pwd, scores_data: scoresData,
    });
    if (error) throw new Error(error.message);
    return data;
  },

  // Admin: update group match result
  async adminUpdateGroupResult(pwd, matchId, homeScore, awayScore) {
    const { data, error } = await supabase.rpc('admin_update_group_result', {
      pwd, p_match_id: matchId, p_home_score: homeScore, p_away_score: awayScore,
    });
    if (error) throw new Error(error.message);
    return data;
  },

  // Admin: update knockout result
  async adminUpdateKOResult(pwd, matchId, homeScore, awayScore, winner, decidedIn) {
    const { data, error } = await supabase.rpc('admin_update_ko_result', {
      pwd, p_match_id: matchId, p_home_score: homeScore, p_away_score: awayScore,
      p_winner: winner, p_decided_in: decidedIn,
    });
    if (error) throw new Error(error.message);
    return data;
  },

  // Admin: update setting
  async adminUpdateSetting(pwd, key, value) {
    const { data, error } = await supabase.rpc('admin_update_setting', {
      pwd, p_key: key, p_value: value,
    });
    if (error) throw new Error(error.message);
    return data;
  },

  // Admin: update official answer
  async adminUpdateAnswer(pwd, qId, answer) {
    const { data, error } = await supabase.rpc('admin_update_answer', {
      pwd, p_q_id: qId, p_answer: answer,
    });
    if (error) throw new Error(error.message);
    return data;
  },
};
