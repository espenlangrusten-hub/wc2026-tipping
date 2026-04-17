/**
 * config.js — Supabase configuration (fixed)
 */

const SUPABASE_URL  = 'https://wnhwtzokykwxgmsqsisf.supabase.co';
const SUPABASE_ANON = 'sb_publishable_hJSal32v817PjjyVmujaEg_RSl6j3tJ';

const CONFIG = {
  LANG: 'no',
  LEADERBOARD_REFRESH_SEC: 300,
};

// Use a different name to avoid shadowing window.supabase from CDN
var db = null;

function initSupabase() {
  try {
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    console.log('Supabase connected');
  } catch (err) {
    console.error('Supabase init failed:', err);
  }
  return db;
}

// API helpers
var API = {
  getTeams: async function() {
    var r = await db.from('teams').select('*').order('group_code').order('team_code');
    if (r.error) throw new Error(r.error.message);
    return r.data;
  },

  getTeamsByGroup: async function() {
    var teams = await this.getTeams();
    var groups = {};
    for (var i = 0; i < teams.length; i++) {
      var t = teams[i];
      if (!groups[t.group_code]) groups[t.group_code] = [];
      groups[t.group_code].push(t);
    }
    return groups;
  },

  getQuestions: async function() {
    var r = await db.from('extra_questions').select('*').order('sort_order');
    if (r.error) throw new Error(r.error.message);
    return r.data;
  },

  getConfig: async function() {
    var r = await db.rpc('get_public_config');
    if (r.error) throw new Error(r.error.message);
    return r.data;
  },

  getLeaderboard: async function() {
    var r = await db.from('scores').select('*').order('rank');
    if (r.error) throw new Error(r.error.message);
    return r.data;
  },

  getScoringConfig: async function() {
    var r = await db.from('scoring_config').select('*');
    if (r.error) throw new Error(r.error.message);
    var config = {};
    for (var i = 0; i < r.data.length; i++) {
      var row = r.data[i];
      var v = row.value;
      if (v === 'true') v = true;
      else if (v === 'false') v = false;
      else if (!isNaN(Number(v)) && v !== '') v = Number(v);
      config[row.key] = v;
    }
    return config;
  },

  submitEntry: async function(payload) {
    var r = await db.rpc('submit_entry', { data: payload });
    if (r.error) throw new Error(r.error.message);
    return r.data;
  },

  verifyAdmin: async function(pwd) {
    var r = await db.rpc('verify_admin', { pwd: pwd });
    if (r.error) throw new Error(r.error.message);
    return r.data === true;
  },

  adminGetScoringData: async function(pwd) {
    var r = await db.rpc('admin_get_scoring_data', { pwd: pwd });
    if (r.error) throw new Error(r.error.message);
    return r.data;
  },

  adminWriteScores: async function(pwd, scoresData) {
    var r = await db.rpc('admin_write_scores', { pwd: pwd, scores_data: scoresData });
    if (r.error) throw new Error(r.error.message);
    return r.data;
  },

  adminUpdateGroupResult: async function(pwd, matchId, homeScore, awayScore) {
    var r = await db.rpc('admin_update_group_result', {
      pwd: pwd, p_match_id: matchId, p_home_score: homeScore, p_away_score: awayScore
    });
    if (r.error) throw new Error(r.error.message);
    return r.data;
  },

  adminUpdateKOResult: async function(pwd, matchId, homeScore, awayScore, winner, decidedIn) {
    var r = await db.rpc('admin_update_ko_result', {
      pwd: pwd, p_match_id: matchId, p_home_score: homeScore, p_away_score: awayScore,
      p_winner: winner, p_decided_in: decidedIn
    });
    if (r.error) throw new Error(r.error.message);
    return r.data;
  },

  adminUpdateSetting: async function(pwd, key, value) {
    var r = await db.rpc('admin_update_setting', { pwd: pwd, p_key: key, p_value: value });
    if (r.error) throw new Error(r.error.message);
    return r.data;
  },

  adminUpdateAnswer: async function(pwd, qId, answer) {
    var r = await db.rpc('admin_update_answer', { pwd: pwd, p_q_id: qId, p_answer: answer });
    if (r.error) throw new Error(r.error.message);
    return r.data;
  },

  adminListParticipants: async function(pwd) {
    var r = await db.rpc('admin_list_participants', { pwd: pwd });
    if (r.error) throw new Error(r.error.message);
    return r.data || [];
  },

  adminDeleteParticipant: async function(pwd, participantId) {
    var r = await db.rpc('admin_delete_participant', { pwd: pwd, p_participant_id: participantId });
    if (r.error) throw new Error(r.error.message);
    return r.data;
  },

  adminUpdateParticipant: async function(pwd, participantId, name, company, dept) {
    var r = await db.rpc('admin_update_participant', {
      pwd: pwd, p_participant_id: participantId,
      p_full_name: name, p_company: company, p_department: dept
    });
    if (r.error) throw new Error(r.error.message);
    return r.data;
  },

  getAllMatches: async function() {
    var g = await db.from('results_group').select('*').order('match_id');
    var k = await db.from('results_knockout').select('*').order('match_id');
    return { group: g.data || [], knockout: k.data || [] };
  },
};
