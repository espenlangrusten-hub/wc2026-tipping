(function(){
'use strict';

var state = {
  password: null,
  activeTab: 'participants',
  teams: {},
  questions: [],
  groupMatches: [],
  participants: [],
};

var TABS = [
  { id: 'participants', label: 'Deltakere' },
  { id: 'results',      label: 'Resultater' },
  { id: 'questions',    label: 'Ekstraspørsmål' },
  { id: 'answers',      label: 'Fasit' },
  { id: 'scoring',      label: 'Poengregler' },
  { id: 'settings',     label: 'Innstillinger' },
  { id: 'recalc',       label: 'Beregn på nytt' },
];

// ── Login ──
async function attemptLogin() {
  var pw = document.getElementById('pw-input').value;
  var errEl = document.getElementById('pw-error');
  errEl.textContent = '';
  if (!pw) { errEl.textContent = 'Oppgi passord'; return; }
  try {
    var ok = await API.verifyAdmin(pw);
    if (!ok) { errEl.textContent = 'Feil passord'; return; }
    state.password = pw;
    sessionStorage.setItem('wc26_admin_pw', pw);
    document.getElementById('login').classList.add('hidden');
    document.getElementById('panel').classList.remove('hidden');
    renderPanel();
    await loadBaseData();
  } catch (err) { errEl.textContent = 'Feil: ' + err.message; }
}
window.attemptLogin = attemptLogin;

document.addEventListener('DOMContentLoaded', function() {
  var saved = sessionStorage.getItem('wc26_admin_pw');
  if (saved) { document.getElementById('pw-input').value = saved; attemptLogin(); }
  document.getElementById('pw-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') attemptLogin();
  });
});

async function loadBaseData() {
  try {
    var teams = await API.getTeams();
    state.teams = {};
    for (var i = 0; i < teams.length; i++) state.teams[teams[i].team_code] = teams[i];
    state.questions = await API.getQuestions();
    var r = await db.from('results_group').select('*').order('match_id');
    state.groupMatches = r.data || [];
    renderTabContent();
  } catch (err) { toast('Feil: ' + err.message, 'err'); }
}

// ── Tabs ──
function renderPanel() {
  document.getElementById('tabs').innerHTML = TABS.map(function(t) {
    return '<button class="tab ' + (t.id === state.activeTab ? 'active' : '') + '" onclick="switchTab(\'' + t.id + '\')">' + t.label + '</button>';
  }).join('');
}
window.switchTab = function(id) { state.activeTab = id; renderPanel(); renderTabContent(); };

function renderTabContent() {
  var c = document.getElementById('tab-content');
  switch (state.activeTab) {
    case 'participants': return renderParticipantsTab(c);
    case 'results':      return renderResultsTab(c);
    case 'questions':    return renderQuestionsTab(c);
    case 'answers':      return renderAnswersTab(c);
    case 'scoring':      return renderScoringTab(c);
    case 'settings':     return renderSettingsTab(c);
    case 'recalc':       return renderRecalcTab(c);
  }
}


// ════════════════════════════════════════════════
// PARTICIPANTS TAB
// ════════════════════════════════════════════════
function renderParticipantsTab(c) {
  c.innerHTML = '<div class="panel"><h3>Deltakere</h3><p class="panel-desc">Alle registrerte deltakere. Du kan redigere eller slette.</p><div id="participants-list" style="color:var(--muted);">Laster...</div></div>';
  loadParticipants();
}

async function loadParticipants() {
  try {
    state.participants = await API.adminListParticipants(state.password);
    var el = document.getElementById('participants-list');
    if (!state.participants || state.participants.length === 0) {
      el.innerHTML = '<p>Ingen deltakere registrert ennå.</p>';
      return;
    }
    var rows = state.participants.map(function(p) {
      var date = new Date(p.submitted_at).toLocaleString('nb-NO', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
      return '<tr data-pid="' + p.participant_id + '">' +
        '<td style="font-size:0.8125rem;">' + date + '</td>' +
        '<td><strong>' + escapeHTML(p.full_name) + '</strong><br><span style="font-size:0.75rem;color:var(--muted);">' + escapeHTML(p.email_lower) + '</span></td>' +
        '<td>' + escapeHTML(p.company) + '</td>' +
        '<td>' + escapeHTML(p.department) + '</td>' +
        '<td style="white-space:nowrap;">' +
          '<button class="btn btn-ghost" style="padding:0.25rem 0.5rem;font-size:0.75rem;" onclick="editParticipant(\'' + p.participant_id + '\')">✏️</button> ' +
          '<button class="btn btn-danger" style="padding:0.25rem 0.5rem;font-size:0.75rem;" onclick="deleteParticipant(\'' + p.participant_id + '\',\'' + escapeHTML(p.full_name).replace(/'/g, "\\'") + '\')">🗑</button>' +
        '</td></tr>';
    }).join('');
    el.innerHTML = '<div style="margin-bottom:0.75rem;font-family:JetBrains Mono,monospace;font-size:0.8125rem;color:var(--accent);">' + state.participants.length + ' deltakere</div>' +
      '<div style="overflow-x:auto;"><table class="admin-table"><thead><tr><th>Registrert</th><th>Navn / E-post</th><th>Arbeidssted</th><th>Avdeling</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  } catch (err) {
    document.getElementById('participants-list').innerHTML = '<p style="color:var(--err);">Feil: ' + escapeHTML(err.message) + '</p>';
  }
}

window.deleteParticipant = async function(pid, name) {
  if (!confirm('Slette deltaker "' + name + '" og alle deres tippinger?')) return;
  try {
    await API.adminDeleteParticipant(state.password, pid);
    toast(name + ' slettet', 'ok');
    loadParticipants();
  } catch (err) { toast('Feil: ' + err.message, 'err'); }
};

window.editParticipant = function(pid) {
  var p = state.participants.find(function(x) { return x.participant_id === pid; });
  if (!p) return;
  var modal = document.getElementById('participants-list');
  modal.innerHTML = '<div class="panel" style="max-width:400px;">' +
    '<h3>Rediger deltaker</h3>' +
    '<div style="margin-bottom:0.75rem;"><label style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:0.25rem;">Navn</label><input type="text" id="edit-name" value="' + escapeHTML(p.full_name) + '"></div>' +
    '<div style="margin-bottom:0.75rem;"><label style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:0.25rem;">Arbeidssted</label><input type="text" id="edit-company" value="' + escapeHTML(p.company) + '"></div>' +
    '<div style="margin-bottom:0.75rem;"><label style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:0.25rem;">Avdeling</label><input type="text" id="edit-dept" value="' + escapeHTML(p.department) + '"></div>' +
    '<div style="display:flex;gap:0.5rem;"><button class="btn btn-primary" onclick="saveParticipantEdit(\'' + pid + '\')">Lagre</button><button class="btn btn-ghost" onclick="loadParticipants()">Avbryt</button></div>' +
  '</div>';
};

window.saveParticipantEdit = async function(pid) {
  var name = document.getElementById('edit-name').value;
  var company = document.getElementById('edit-company').value;
  var dept = document.getElementById('edit-dept').value;
  try {
    await API.adminUpdateParticipant(state.password, pid, name, company, dept);
    toast('Oppdatert', 'ok');
    loadParticipants();
  } catch (err) { toast('Feil: ' + err.message, 'err'); }
};


// ════════════════════════════════════════════════
// RESULTS TAB
// ════════════════════════════════════════════════
function renderResultsTab(c) {
  var groups = ['A','B','C','D','E','F','G','H','I','J','K','L'];
  var html = '<div class="panel"><h3>Gruppespill-resultater</h3>' +
    '<p class="panel-desc">Skriv inn sluttresultat. Trykk Lagre for å oppdatere.</p>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1rem;">';
  for (var gi = 0; gi < groups.length; gi++) {
    var g = groups[gi];
    var matches = state.groupMatches.filter(function(m) { return m.group_code === g; });
    var rows = matches.map(function(m) {
      var ht = state.teams[m.home_team];
      var at = state.teams[m.away_team];
      return '<div class="match-row" data-mid="' + m.match_id + '">' +
        '<span class="match-id-cell">#' + m.match_id + '</span>' +
        '<span class="match-team-cell">' + (ht ? ht.name_no : m.home_team) + '</span>' +
        '<input class="match-score" type="number" min="0" data-field="home" value="' + (m.home_score != null ? m.home_score : '') + '" style="width:50px;">' +
        '<span class="match-vs">-</span>' +
        '<input class="match-score" type="number" min="0" data-field="away" value="' + (m.away_score != null ? m.away_score : '') + '" style="width:50px;">' +
        '<span class="match-team-cell">' + (at ? at.name_no : m.away_team) + '</span>' +
        '<span class="match-status">' + (m.status === 'final' ? '✓' : '') + '</span></div>';
    }).join('');
    html += '<div style="background:var(--paper);border:1px solid var(--line);border-radius:6px;padding:0.75rem;">' +
      '<div style="font-family:Oswald,sans-serif;font-weight:700;margin-bottom:0.5rem;color:var(--accent);">Gruppe ' + g + '</div>' + rows + '</div>';
  }
  html += '</div><button class="btn btn-primary" style="margin-top:1rem;" onclick="saveGroupResults()">Lagre alle gruppekamper</button></div>';
  c.innerHTML = html;
}

window.saveGroupResults = async function() {
  var rows = document.querySelectorAll('[data-mid]');
  var saved = 0;
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var mid = parseInt(row.dataset.mid);
    var hs = row.querySelector('[data-field="home"]').value;
    var as = row.querySelector('[data-field="away"]').value;
    if (hs !== '' && as !== '') {
      try { await API.adminUpdateGroupResult(state.password, mid, parseInt(hs), parseInt(as)); saved++; }
      catch (err) { toast('Feil #' + mid + ': ' + err.message, 'err'); }
    }
  }
  toast(saved + ' kamper lagret', 'ok');
  var r = await db.from('results_group').select('*').order('match_id');
  state.groupMatches = r.data || [];
  renderTabContent();
};


// ════════════════════════════════════════════════
// QUESTIONS TAB
// ════════════════════════════════════════════════
function renderQuestionsTab(c) {
  var rows = state.questions.map(function(q, i) {
    return '<tr>' +
      '<td style="font-family:JetBrains Mono,monospace;">' + q.q_id + '</td>' +
      '<td><input type="text" data-qfield="question_no" data-qid="' + q.q_id + '" value="' + escapeHTML(q.question_no || '') + '" style="width:100%;"></td>' +
      '<td><select data-qfield="answer_type" data-qid="' + q.q_id + '"><option value="text"' + (q.answer_type === 'text' ? ' selected' : '') + '>Tekst</option><option value="number"' + (q.answer_type === 'number' ? ' selected' : '') + '>Tall</option><option value="multi"' + (q.answer_type === 'multi' ? ' selected' : '') + '>Flervalg</option></select></td>' +
      '<td><input type="number" data-qfield="points" data-qid="' + q.q_id + '" value="' + q.points + '" style="width:60px;"></td>' +
      '<td><select data-qfield="round" data-qid="' + q.q_id + '"><option value="GROUP"' + (q.round === 'GROUP' ? ' selected' : '') + '>GROUP</option><option value="R32"' + (q.round === 'R32' ? ' selected' : '') + '>R32</option><option value="R16"' + (q.round === 'R16' ? ' selected' : '') + '>R16</option><option value="QF"' + (q.round === 'QF' ? ' selected' : '') + '>QF</option><option value="SF"' + (q.round === 'SF' ? ' selected' : '') + '>SF</option><option value="F"' + (q.round === 'F' ? ' selected' : '') + '>F</option><option value="TOTAL"' + (q.round === 'TOTAL' ? ' selected' : '') + '>TOTAL</option></select></td>' +
    '</tr>';
  }).join('');
  c.innerHTML = '<div class="panel"><h3>Ekstraspørsmål</h3>' +
    '<p class="panel-desc">Rediger spørsmålene her. For å legge til/slette spørsmål: bruk Supabase Table Editor → extra_questions.</p>' +
    '<table class="admin-table"><thead><tr><th>ID</th><th>Spørsmål</th><th>Type</th><th>Poeng</th><th>Runde</th></tr></thead><tbody>' + rows + '</tbody></table>' +
    '<button class="btn btn-primary" style="margin-top:1rem;" onclick="saveQuestions()">Lagre endringer</button></div>';
}

window.saveQuestions = async function() {
  var updates = [];
  var qids = {};
  document.querySelectorAll('[data-qfield]').forEach(function(el) {
    var qid = el.dataset.qid;
    if (!qids[qid]) qids[qid] = {};
    qids[qid][el.dataset.qfield] = el.value;
  });
  for (var qid in qids) {
    var q = qids[qid];
    try {
      await db.from('extra_questions').update({
        question_no: q.question_no,
        answer_type: q.answer_type,
        points: parseInt(q.points),
        round: q.round,
      }).eq('q_id', parseInt(qid));
    } catch (err) { toast('Feil Q' + qid + ': ' + err.message, 'err'); return; }
  }
  state.questions = await API.getQuestions();
  toast('Spørsmål oppdatert', 'ok');
};


// ════════════════════════════════════════════════
// ANSWERS TAB (fasit)
// ════════════════════════════════════════════════
function renderAnswersTab(c) {
  var rows = state.questions.map(function(q) {
    return '<tr>' +
      '<td style="font-family:JetBrains Mono,monospace;">#' + q.q_id + '</td>' +
      '<td>' + escapeHTML(q.question_no) + ' <span style="color:var(--accent);font-size:0.75rem;">(' + q.points + 'p)</span></td>' +
      '<td style="width:200px;"><input type="' + (q.answer_type === 'number' ? 'number' : 'text') + '" data-ansid="' + q.q_id + '" placeholder="Skriv inn fasit…"></td>' +
      '<td><button class="btn btn-ghost" style="padding:0.375rem 0.625rem;" onclick="saveOneAnswer(' + q.q_id + ')">Lagre</button></td>' +
    '</tr>';
  }).join('');
  c.innerHTML = '<div class="panel"><h3>Offisielle svar (fasit)</h3>' +
    '<p class="panel-desc">Fyll inn korrekt svar etter hvert som turneringen utspiller seg. For tekst-svar kan du angi flere gyldige svar med semikolon, f.eks. <code>Ronaldo;Mbappe</code>.</p>' +
    '<table class="admin-table"><thead><tr><th>ID</th><th>Spørsmål</th><th>Fasit</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>' +
    '<button class="btn btn-primary" style="margin-top:1rem;" onclick="saveAllAnswers()">Lagre alle svar</button></div>';
  // Load existing answers
  (async function() {
    var r = await db.from('official_answers').select('*');
    if (r.data) {
      for (var i = 0; i < r.data.length; i++) {
        var inp = document.querySelector('[data-ansid="' + r.data[i].q_id + '"]');
        if (inp) inp.value = r.data[i].answer_value || '';
      }
    }
  })();
}

window.saveOneAnswer = async function(qId) {
  var inp = document.querySelector('[data-ansid="' + qId + '"]');
  try {
    await API.adminUpdateAnswer(state.password, qId, inp.value);
    toast('Fasit for #' + qId + ' lagret', 'ok');
  } catch (err) { toast('Feil: ' + err.message, 'err'); }
};

window.saveAllAnswers = async function() {
  var inputs = document.querySelectorAll('[data-ansid]');
  var count = 0;
  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].value !== '') {
      try {
        await API.adminUpdateAnswer(state.password, parseInt(inputs[i].dataset.ansid), inputs[i].value);
        count++;
      } catch (err) { toast('Feil #' + inputs[i].dataset.ansid + ': ' + err.message, 'err'); return; }
    }
  }
  toast(count + ' svar lagret', 'ok');
};


// ════════════════════════════════════════════════
// SCORING TAB
// ════════════════════════════════════════════════
function renderScoringTab(c) {
  c.innerHTML = '<div class="panel"><h3>Poengregler</h3><p class="panel-desc">Gjeldende poengverdier per kategori.</p><div id="scoring-values" style="color:var(--muted);">Laster…</div></div>';
  (async function() {
    var cfg = await API.getScoringConfig();
    var el = document.getElementById('scoring-values');
    el.innerHTML = Object.entries(cfg).map(function(kv) {
      return '<div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--line);">' +
        '<span style="font-family:JetBrains Mono,monospace;font-size:0.8125rem;">' + kv[0] + '</span>' +
        '<input type="text" data-sckey="' + kv[0] + '" value="' + kv[1] + '" style="width:80px;text-align:right;">' +
      '</div>';
    }).join('') + '<button class="btn btn-primary" style="margin-top:1rem;" onclick="saveScoringConfig()">Lagre poengregler</button>';
  })();
}

window.saveScoringConfig = async function() {
  var inputs = document.querySelectorAll('[data-sckey]');
  for (var i = 0; i < inputs.length; i++) {
    try {
      await db.from('scoring_config').update({ value: inputs[i].value }).eq('key', inputs[i].dataset.sckey);
    } catch (err) { toast('Feil: ' + err.message, 'err'); return; }
  }
  toast('Poengregler lagret', 'ok');
};


// ════════════════════════════════════════════════
// SETTINGS TAB (with model toggle)
// ════════════════════════════════════════════════
function renderSettingsTab(c) {
  c.innerHTML = '<div class="panel"><h3>Innstillinger</h3>' +
    '<div style="margin-bottom:1.5rem;">' +
      '<label style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:0.375rem;">Spillmodell</label>' +
      '<div style="display:flex;gap:0.5rem;" id="model-toggle"></div>' +
      '<p style="font-size:0.8125rem;color:var(--muted);margin-top:0.5rem;" id="model-desc"></p>' +
    '</div>' +
    '<div style="margin-bottom:1rem;"><label style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:0.375rem;">Frist (ISO UTC)</label><input type="text" id="set-deadline" placeholder="2026-06-11T15:00:00Z"></div>' +
    '<div style="margin-bottom:1rem;"><label style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:0.375rem;">Gjeldende runde</label><select id="set-round"><option>PRE</option><option>GROUP</option><option>R32</option><option>R16</option><option>QF</option><option>SF</option><option>F</option><option>COMPLETE</option></select></div>' +
    '<button class="btn btn-primary" onclick="saveSettings()">Lagre</button></div>';

  // Load current model
  (async function() {
    var cfg = await API.getConfig();
    var model = cfg.scoring_model || 'a';
    renderModelToggle(model);
    if (cfg.deadline_iso) document.getElementById('set-deadline').value = cfg.deadline_iso;
    if (cfg.current_round) document.getElementById('set-round').value = cfg.current_round;
  })();
}

function renderModelToggle(current) {
  var el = document.getElementById('model-toggle');
  var descEl = document.getElementById('model-desc');
  var models = [
    { id: 'a', label: 'A: Bracket & Rangering', desc: 'Deltakerne velger rekkefølge i grupper, beste treere, vinnere i sluttspill, og bonusspørsmål.' },
    { id: 'b', label: 'B: Resultat-tipping', desc: 'Deltakerne tipper eksakt resultat på alle kamper. Eksakt score = 3p, riktig utfall (seier/uavgjort) = 1p, feil = 0p. Pluss bonusspørsmål.' },
  ];
  el.innerHTML = models.map(function(m) {
    var active = m.id === current;
    return '<button class="btn ' + (active ? 'btn-primary' : 'btn-ghost') + '" style="flex:1;" onclick="setModel(\'' + m.id + '\')">' + m.label + '</button>';
  }).join('');
  descEl.textContent = models.find(function(m) { return m.id === current; }).desc;
}

window.setModel = async function(model) {
  try {
    await API.adminUpdateSetting(state.password, 'scoring_model', model);
    renderModelToggle(model);
    toast('Spillmodell satt til ' + model.toUpperCase(), 'ok');
  } catch (err) { toast('Feil: ' + err.message, 'err'); }
};

window.saveSettings = async function() {
  try {
    var dl = document.getElementById('set-deadline').value;
    var rnd = document.getElementById('set-round').value;
    if (dl) await API.adminUpdateSetting(state.password, 'deadline_iso', dl);
    if (rnd) await API.adminUpdateSetting(state.password, 'current_round', rnd);
    toast('Lagret', 'ok');
  } catch (err) { toast('Feil: ' + err.message, 'err'); }
};


// ════════════════════════════════════════════════
// RECALCULATE TAB
// ════════════════════════════════════════════════
function renderRecalcTab(c) {
  c.innerHTML = '<div class="recalc-card">' +
    '<div style="font-family:JetBrains Mono,monospace;font-size:0.6875rem;letter-spacing:0.2em;opacity:0.7;margin-bottom:0.5rem;">MASTER RECALCULATE</div>' +
    '<h3 style="font-family:Oswald,sans-serif;font-size:1.5rem;margin-bottom:0.75rem;font-weight:700;text-transform:uppercase;">Regn ut alle poeng på nytt</h3>' +
    '<p style="opacity:0.8;margin-bottom:1.5rem;font-size:0.9375rem;">Henter data → beregner poeng (modell A eller B) → skriver tilbake.</p>' +
    '<button class="btn btn-accent" id="btn-recalc" onclick="doRecalc()">⚡ Start beregning</button>' +
    '<div id="recalc-log" style="margin-top:1.25rem;font-family:JetBrains Mono,monospace;font-size:0.8125rem;text-align:left;max-width:500px;margin:1rem auto 0;"></div>' +
  '</div>';
}

window.doRecalc = async function() {
  var btn = document.getElementById('btn-recalc');
  var log = document.getElementById('recalc-log');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading"></span> Beregner…';
  log.innerHTML = '';
  function L(s) { log.innerHTML += s + '<br>'; }

  try {
    var t0 = Date.now();
    L('→ Henter data fra Supabase…');
    var allData = await API.adminGetScoringData(state.password);
    var parts = allData.participants || [];
    var model = allData.scoring_model || 'a';
    L('  Modell: ' + model.toUpperCase() + ', ' + parts.length + ' deltakere');

    var config = {};
    var sc = allData.scoring_config || {};
    for (var sk in sc) { var v = sc[sk]; if (v === 'true') v = true; else if (v === 'false') v = false; else if (!isNaN(Number(v)) && v !== '') v = Number(v); config[sk] = v; }

    var questions = (allData.extra_questions || []).map(function(q) { return { q_id: q.q_id, answer_type: q.answer_type, points: q.points }; });
    var officialAnswers = {};
    for (var oi = 0; oi < (allData.official_answers || []).length; oi++) officialAnswers[allData.official_answers[oi].q_id] = allData.official_answers[oi].answer_value;

    // Extra predictions
    var peByPid = {};
    for (var ei = 0; ei < (allData.predictions_extras || []).length; ei++) {
      var pe = allData.predictions_extras[ei];
      if (!peByPid[pe.participant_id]) peByPid[pe.participant_id] = {};
      peByPid[pe.participant_id][pe.q_id] = pe.answer_value;
    }

    var scored = [];

    if (model === 'b') {
      // ── MODEL B SCORING ──
      L('→ Model B: resultat-tipping…');
      var exactPts = config.model_b_exact_score || 3;
      var outcomePts = config.model_b_correct_outcome || 1;

      // Build actual results lookup: match_id → {home_score, away_score}
      var actuals = {};
      var allResults = (allData.results_group || []).concat(allData.results_knockout || []);
      for (var ri = 0; ri < allResults.length; ri++) {
        var r = allResults[ri];
        if (r.home_score != null && r.away_score != null) {
          actuals[r.match_id] = { home: r.home_score, away: r.away_score };
        }
      }

      // Index predictions by participant
      var predByPid = {};
      var pms = allData.predictions_match_scores || [];
      for (var mi = 0; mi < pms.length; mi++) {
        var pm = pms[mi];
        if (!predByPid[pm.participant_id]) predByPid[pm.participant_id] = {};
        predByPid[pm.participant_id][pm.match_id] = { home: pm.predicted_home_score, away: pm.predicted_away_score };
      }

      for (var pi = 0; pi < parts.length; pi++) {
        var p = parts[pi];
        var preds = predByPid[p.participant_id] || {};
        var matchPts = 0;
        var exactCount = 0;
        var outcomeCount = 0;

        for (var mid in actuals) {
          var actual = actuals[mid];
          var pred = preds[mid];
          if (!pred) continue;

          if (pred.home === actual.home && pred.away === actual.away) {
            matchPts += exactPts;
            exactCount++;
          } else {
            var predOutcome = pred.home > pred.away ? 'H' : pred.home < pred.away ? 'A' : 'D';
            var actOutcome = actual.home > actual.away ? 'H' : actual.home < actual.away ? 'A' : 'D';
            if (predOutcome === actOutcome) {
              matchPts += outcomePts;
              outcomeCount++;
            }
          }
        }

        var extraScore = scoreExtraQuestions(questions, peByPid[p.participant_id] || {}, officialAnswers);
        scored.push({
          participant_id: p.participant_id,
          name: p.full_name,
          company: p.company,
          department: p.department,
          scores: {
            total: matchPts + extraScore.total,
            total_no_extras: matchPts,
            group_pts: matchPts,
            third_pts: 0, R32_pts: 0, R16_pts: 0, QF_pts: 0, SF_pts: 0, F_pts: 0, W_pts: 0,
            extras_pts: extraScore.total,
            group_sweeps: 0,
          }
        });
      }
      L('  ' + Object.keys(actuals).length + ' kamper med resultat');

    } else {
      // ── MODEL A SCORING (existing logic) ──
      L('→ Model A: bracket/rangering…');
      var groupKeys = ['A','B','C','D','E','F','G','H','I','J','K','L'];
      var allGroupTables = {};
      var groupTableArrays = [];
      var teamsByGroup = {};
      var allTeams = await API.getTeams();
      for (var ti = 0; ti < allTeams.length; ti++) {
        if (!teamsByGroup[allTeams[ti].group_code]) teamsByGroup[allTeams[ti].group_code] = [];
        teamsByGroup[allTeams[ti].group_code].push(allTeams[ti].team_code);
      }
      var groupResults = allData.results_group || [];
      for (var gi = 0; gi < groupKeys.length; gi++) {
        var g = groupKeys[gi];
        var matches = groupResults.filter(function(m) { return m.group_code === g; }).map(function(m) { return { home: m.home_team, away: m.away_team, home_score: m.home_score, away_score: m.away_score }; });
        var table = computeGroupTable(g, teamsByGroup[g] || [], matches);
        allGroupTables[g] = table;
        groupTableArrays.push(table);
      }
      var thirdPlace = rankThirdPlacedTeams(groupTableArrays);
      var actualGroups = {};
      for (var gc in allGroupTables) actualGroups[gc] = allGroupTables[gc].map(function(t) { return t.team; });
      var actualKO = { R32: [], R16: [], QF: [], SF: [], F: [], W: [] };
      var koRes = allData.results_knockout || [];
      for (var ki = 0; ki < koRes.length; ki++) {
        var kr = koRes[ki];
        if (kr.winner) {
          var rnd = kr.round === '3rd' ? 'SF' : kr.round;
          if (kr.home_team && actualKO[rnd]) actualKO[rnd].push(kr.home_team);
          if (kr.away_team && actualKO[rnd]) actualKO[rnd].push(kr.away_team);
          if (kr.round === 'F') actualKO.W.push(kr.winner);
        }
      }
      for (var k in actualKO) actualKO[k] = [... new Set(actualKO[k])];
      var actuals = { groups: actualGroups, thirds: thirdPlace.best8.map(function(t) { return t.team; }), knockout: actualKO };

      var pgByPid = {}; var predGroups = allData.predictions_groups || [];
      for (var pgi = 0; pgi < predGroups.length; pgi++) { var pg = predGroups[pgi]; if (!pgByPid[pg.participant_id]) pgByPid[pg.participant_id] = {}; pgByPid[pg.participant_id][pg.group_code] = [pg.pos1_team, pg.pos2_team, pg.pos3_team, pg.pos4_team]; }
      var ptByPid = {}; var predThirds = allData.predictions_thirds || [];
      for (var pti = 0; pti < predThirds.length; pti++) { try { ptByPid[predThirds[pti].participant_id] = JSON.parse(predThirds[pti].picks_json); } catch (e) { ptByPid[predThirds[pti].participant_id] = []; } }
      var pkByPid = {}; var predKO = allData.predictions_knockout || [];
      for (var pki = 0; pki < predKO.length; pki++) { var pk = predKO[pki]; if (!pkByPid[pk.participant_id]) pkByPid[pk.participant_id] = { R32: [], R16: [], QF: [], SF: [], F: [], W: [] }; if (pkByPid[pk.participant_id][pk.round]) pkByPid[pk.participant_id][pk.round].push(pk.predicted_team); }

      for (var si = 0; si < parts.length; si++) {
        var p = parts[si];
        var prediction = { groups: pgByPid[p.participant_id] || {}, thirds: ptByPid[p.participant_id] || [], knockout: pkByPid[p.participant_id] || { R32: [], R16: [], QF: [], SF: [], F: [], W: [] }, extras: peByPid[p.participant_id] || {} };
        var scores = computeParticipantScore(prediction, actuals, questions, officialAnswers, config);
        scored.push({ participant_id: p.participant_id, name: p.full_name, company: p.company, department: p.department, scores: scores });
      }
    }

    var leaderboard = buildLeaderboard(scored);
    L('  ' + leaderboard.length + ' deltakere rangert');
    if (leaderboard.length > 0) L('  Leder: ' + leaderboard[0].name + ' (' + leaderboard[0].scores.total + 'p)');

    L('→ Skriver til database…');
    var scoresData = leaderboard.map(function(p) {
      return {
        participant_id: p.participant_id, rank: p.rank, full_name: p.name,
        company: p.company, department: p.department,
        total: p.scores.total, total_no_extras: p.scores.total_no_extras,
        group_pts: p.scores.group_pts, third_pts: p.scores.third_pts,
        r32_pts: p.scores.R32_pts || 0, r16_pts: p.scores.R16_pts || 0,
        qf_pts: p.scores.QF_pts || 0, sf_pts: p.scores.SF_pts || 0,
        f_pts: p.scores.F_pts || 0, w_pts: p.scores.W_pts || 0,
        extras_pts: p.scores.extras_pts, group_sweeps: p.scores.group_sweeps || 0,
      };
    });
    await API.adminWriteScores(state.password, scoresData);

    var elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    L(''); L('✓ Ferdig på ' + elapsed + 's');
    toast('Beregning fullført', 'ok');
  } catch (err) { L(''); L('✗ Feil: ' + err.message); toast('Feil: ' + err.message, 'err'); }
  finally { btn.disabled = false; btn.innerHTML = '⚡ Start beregning'; }
};


// ── Helpers ──
function toast(msg, type) {
  var el = document.createElement('div');
  el.className = 'toast ' + (type || '');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(function() { el.remove(); }, 3000);
}
function escapeHTML(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

})();
