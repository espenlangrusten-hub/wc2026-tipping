/**
 * submit.js — Registration form logic.
 *
 * Flow:
 *  1. Load teams + questions + config from API
 *  2. Render personal info, 12 group cards (drag-drop), thirds picker, bracket, extras
 *  3. Track completion state → enable submit button when all required
 *  4. Submit JSON → show confirmation
 */

(function() {
  'use strict';

  // ── State ────────────────────────────────────────────────────
  const state = {
    teams: {},              // team_code → team object
    groups: {},             // group_code → [team objects]
    questions: [],
    config: { submission_open: true, deadline_iso: null },
    prediction: {
      personal: { full_name: '', email: '', company: '', department: '' },
      groups: {},           // 'A' → ['MEX','KOR','RSA','CZE']
      thirds: [],           // 8 team codes
      knockout: { R32: {}, R16: {}, QF: {}, SF: {}, F: {}, W: null },  // match_id → team_code
      extras: {},
    },
  };

  const GROUP_CODES = ['A','B','C','D','E','F','G','H','I','J','K','L'];

  // FIFA team code → ISO 3166-1 alpha-2 (for flag-icons CSS)
  const TEAM_ISO = {
    MEX:'mx',KOR:'kr',RSA:'za',CZE:'cz',CAN:'ca',SUI:'ch',QAT:'qa',BIH:'ba',
    BRA:'br',MAR:'ma',HAI:'ht',SCO:'gb-sct',USA:'us',AUS:'au',PAR:'py',TUR:'tr',
    GER:'de',CUW:'cw',CIV:'ci',ECU:'ec',NED:'nl',JPN:'jp',SWE:'se',TUN:'tn',
    BEL:'be',EGY:'eg',IRN:'ir',NZL:'nz',ESP:'es',KSA:'sa',CPV:'cv',URU:'uy',
    FRA:'fr',SEN:'sn',IRQ:'iq',NOR:'no',ARG:'ar',AUT:'at',ALG:'dz',JOR:'jo',
    POR:'pt',UZB:'uz',COL:'co',COD:'cd',ENG:'gb-eng',CRO:'hr',GHA:'gh',PAN:'pa',
  };

  function teamFlag(code) {
    var iso = TEAM_ISO[code];
    if (!iso) return '';
    return '<span class="fi fi-' + iso + '" style="font-size:1.1em;"></span>';
  }

  // R32 match structure (matches FIFA bracket)
  // For each R32 match, define which "slot" fills each side
  // Home slots: 1X = winner of group X, 2X = runner-up
  // Third slots: T_FROM(A,B,C,D,F) etc — depends on which groups' 3rds qualify
  const R32_STRUCTURE = [
    { id: 73,  home_slot: '2A',         away_slot: '2B' },
    { id: 74,  home_slot: '1E',         away_slot: 'T_E_FROM_ABCDF' },
    { id: 75,  home_slot: '1F',         away_slot: '2C' },
    { id: 76,  home_slot: '1C',         away_slot: '2F' },
    { id: 77,  home_slot: '1I',         away_slot: 'T_I_FROM_CDFGH' },
    { id: 78,  home_slot: '2E',         away_slot: '2I' },
    { id: 79,  home_slot: '1A',         away_slot: 'T_A_FROM_CEFHI' },
    { id: 80,  home_slot: '1L',         away_slot: 'T_L_FROM_EHIJK' },
    { id: 81,  home_slot: '1D',         away_slot: 'T_D_FROM_BEFIJ' },
    { id: 82,  home_slot: '1G',         away_slot: 'T_G_FROM_AEHIJ' },
    { id: 83,  home_slot: '2K',         away_slot: '2L' },
    { id: 84,  home_slot: '1H',         away_slot: '2J' },
    { id: 85,  home_slot: '1B',         away_slot: 'T_B_FROM_EFGIJ' },
    { id: 86,  home_slot: '1J',         away_slot: '2H' },
    { id: 87,  home_slot: '1K',         away_slot: 'T_K_FROM_DEIJL' },
    { id: 88,  home_slot: '2D',         away_slot: '2G' },
  ];

  const R16_STRUCTURE = [
    { id: 89, home_from: 74, away_from: 77 }, { id: 90, home_from: 73, away_from: 75 },
    { id: 91, home_from: 76, away_from: 78 }, { id: 92, home_from: 79, away_from: 80 },
    { id: 93, home_from: 83, away_from: 84 }, { id: 94, home_from: 81, away_from: 82 },
    { id: 95, home_from: 86, away_from: 88 }, { id: 96, home_from: 85, away_from: 87 },
  ];
  const QF_STRUCTURE = [
    { id: 97, home_from: 89, away_from: 90 }, { id: 98, home_from: 93, away_from: 94 },
    { id: 99, home_from: 91, away_from: 92 }, { id: 100, home_from: 95, away_from: 96 },
  ];
  const SF_STRUCTURE = [
    { id: 101, home_from: 97, away_from: 98 },
    { id: 102, home_from: 99, away_from: 100 },
  ];
  const FINAL_STRUCTURE = { id: 104, home_from: 101, away_from: 102 };


  // ── Bootstrap ────────────────────────────────────────────────
  async function init() {
    try {
      const [teams, groups, questions, config] = await Promise.all([
        API.getTeams(), API.getTeamsByGroup(), API.getQuestions(), API.getConfig(),
      ]);
      state.teams = {};
      for (const t of teams) state.teams[t.team_code] = t;
      state.groups = groups;
      state.questions = questions;
      state.config = config;

      // Initialize default group rankings (team order as drawn)
      for (const g of GROUP_CODES) {
        state.prediction.groups[g] = (state.groups[g] || []).map(t => t.team_code);
      }

      render();
    } catch (err) {
      document.getElementById('app').innerHTML =
        `<div style="padding:2rem; text-align:center; color:var(--err);">
           <h2>Klarte ikke laste data</h2>
           <p>${escapeHTML(err.message)}</p>
           <p style="margin-top:1rem; color:var(--muted); font-size:0.875rem;">Sjekk API-konfigurasjonen i config.js</p>
         </div>`;
    }
  }

  // ── Render top-level ─────────────────────────────────────────
  function render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      ${renderHeader()}
      ${renderDeadline()}
      <div class="progress" id="progress"></div>

      <form id="tipping-form" onsubmit="return false;">
        ${renderPersonalSection()}
        ${renderGroupsSection()}
        ${renderThirdsSection()}
        ${renderBracketSection()}
        ${renderExtrasSection()}
      </form>

      ${renderSubmitBar()}
    `;

    // Initialize drag-drop for each group
    for (const g of GROUP_CODES) {
      const list = document.getElementById(`group-list-${g}`);
      if (list) {
        Sortable.create(list, {
          animation: 150,
          ghostClass: 'sortable-ghost',
          chosenClass: 'sortable-chosen',
          onEnd: () => updateGroupRanking(g),
        });
      }
    }

    // Attach personal field listeners
    ['full_name', 'email', 'company', 'department'].forEach(f => {
      const el = document.getElementById('field-' + f);
      if (el) el.addEventListener('input', () => {
        state.prediction.personal[f] = el.value.trim();
        updateProgress();
      });
    });

    // Extra question listeners
    for (const q of state.questions) {
      const el = document.getElementById('q-' + q.q_id);
      if (el) el.addEventListener('input', () => {
        state.prediction.extras[q.q_id] = el.value;
        updateProgress();
      });
    }

    updateProgress();
    if (state.config && !state.config.submission_open) lockForm();
  }

  function renderHeader() {
    return `
      <header>
        <div class="brand">VM<span class="brand-accent">26</span></div>
        <div class="tagline">Tipping · Canada · Mexico · USA</div>
      </header>
    `;
  }

  function renderDeadline() {
    const d = state.config && state.config.deadline_iso ? new Date(state.config.deadline_iso) : null;
    const open = state.config && state.config.submission_open;
    return `
      <div class="deadline-strip ${open ? '' : 'closed'}" id="deadline-strip">
        <span>${open ? 'FRIST' : 'STENGT'}</span>
        <span class="deadline-countdown" id="countdown">${d ? formatDeadline(d) : '—'}</span>
      </div>
    `;
  }

  function formatDeadline(d) {
    return d.toLocaleString('nb-NO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  // ── Section 1: Personal info ─────────────────────────────────
  function renderPersonalSection() {
    return `
      <section class="section" id="sec-personal">
        <div class="section-num">01 · Deltaker</div>
        <h2 class="section-title">Hvem er du?</h2>
        <p class="section-desc">Alle felt er obligatoriske. E-postadressen brukes for å unngå duplikate innleveringer.</p>
        <div class="field">
          <label for="field-full_name">Fullt navn <span class="req">*</span></label>
          <input type="text" id="field-full_name" placeholder="Fornavn Etternavn" autocomplete="name">
        </div>
        <div class="field">
          <label for="field-email">E-post <span class="req">*</span></label>
          <input type="email" id="field-email" placeholder="navn@firma.no" autocomplete="email">
        </div>
        <div class="two-col">
          <div class="field">
            <label for="field-company">Arbeidssted <span class="req">*</span></label>
            <input type="text" id="field-company" placeholder="f.eks. Oslo" autocomplete="organization">
          </div>
          <div class="field">
            <label for="field-department">Avdeling <span class="req">*</span></label>
            <input type="text" id="field-department" placeholder="f.eks. Equity Research">
          </div>
        </div>
      </section>
    `;
  }

  // ── Section 2: Group rankings ────────────────────────────────
  function renderGroupsSection() {
    const cards = GROUP_CODES.map(g => {
      const teams = state.groups[g] || [];
      const items = teams.map((t, i) => `
        <li class="team-item" data-team="${t.team_code}">
          <span class="pos-badge">${i + 1}</span>
          <span class="team-flag">${teamFlag(t.team_code)}</span>
          <span class="team-name">${escapeHTML(t.name_no || t.name_en)}</span>
          <span class="drag-handle">⋮⋮</span>
        </li>
      `).join('');
      return `
        <div class="group-card">
          <div class="group-card-header">
            <span class="group-label">Gr. ${g}</span>
            <span class="group-hint">Dra for å rangere</span>
          </div>
          <ul class="team-list" id="group-list-${g}">${items}</ul>
        </div>
      `;
    }).join('');

    return `
      <section class="section">
        <div class="section-num">02 · Gruppespill</div>
        <h2 class="section-title">Rangér lagene</h2>
        <p class="section-desc">Dra-og-slipp lagene i ønsket rekkefølge. Øverste = 1. plass i gruppen.</p>
        <div class="groups-grid">${cards}</div>
      </section>
    `;
  }

  function updateGroupRanking(groupCode) {
    const list = document.getElementById(`group-list-${groupCode}`);
    const items = Array.from(list.children);
    const ranking = items.map(li => li.dataset.team);
    state.prediction.groups[groupCode] = ranking;

    // Update position badges
    items.forEach((li, i) => {
      li.querySelector('.pos-badge').textContent = i + 1;
    });

    // Rerender thirds picker (3rd-placed teams have changed)
    const thirdsContainer = document.getElementById('thirds-container');
    if (thirdsContainer) thirdsContainer.innerHTML = renderThirdsInner();
    // Rerender bracket (teams have shifted)
    const bracketContainer = document.getElementById('bracket-container');
    if (bracketContainer) bracketContainer.innerHTML = renderBracketInner();

    updateProgress();
  }

  // ── Section 3: Best 8 thirds ─────────────────────────────────
  function renderThirdsSection() {
    return `
      <section class="section">
        <div class="section-num">03 · Beste 8 treere</div>
        <h2 class="section-title">Hvilke 8 av 12 treere går videre?</h2>
        <p class="section-desc">De 8 beste 3.-plassene går til R32. Velg hvilke 8 av dine predikerte 3.-plasser du tror går videre.</p>
        <div id="thirds-container">${renderThirdsInner()}</div>
      </section>
    `;
  }

  function renderThirdsInner() {
    const selected = new Set(state.prediction.thirds);
    const chips = GROUP_CODES.map(g => {
      const thirdCode = state.prediction.groups[g] && state.prediction.groups[g][2];
      const team = state.teams[thirdCode];
      const isSel = selected.has(thirdCode);
      return `
        <div class="third-chip ${isSel ? 'selected' : ''}"
             data-team="${thirdCode}"
             onclick="toggleThird('${thirdCode}')">
          <span class="grp-letter">${g}</span>
          <span class="team-flag" style="font-size:0.9rem;">${team ? teamFlag(thirdCode) : ''}</span>
          <span>${team ? escapeHTML(team.name_no || team.name_en) : '—'}</span>
        </div>
      `;
    }).join('');
    const count = state.prediction.thirds.length;
    return `
      <div class="thirds-counter ${count === 8 ? 'full' : ''}">VALGT ${count} / 8</div>
      <div class="thirds-grid">${chips}</div>
    `;
  }

  window.toggleThird = function(teamCode) {
    const idx = state.prediction.thirds.indexOf(teamCode);
    if (idx >= 0) {
      state.prediction.thirds.splice(idx, 1);
    } else if (state.prediction.thirds.length < 8) {
      state.prediction.thirds.push(teamCode);
    } else {
      return; // max reached
    }
    document.getElementById('thirds-container').innerHTML = renderThirdsInner();
    document.getElementById('bracket-container').innerHTML = renderBracketInner();
    updateProgress();
  };


  // ── Section 4: Bracket ───────────────────────────────────────
  function renderBracketSection() {
    return `
      <section class="section">
        <div class="section-num">04 · Sluttspill</div>
        <h2 class="section-title">Bygg din bracket</h2>
        <p class="section-desc">Klikk på laget du tror vinner hver kamp. Vinnerne går videre til neste runde.</p>
        <div id="bracket-container">${renderBracketInner()}</div>
      </section>
    `;
  }

  function renderBracketInner() {
    // Resolve R32 teams from group rankings + thirds
    const r32Teams = resolveR32Teams();

    let html = '<div class="bracket-round">';
    html += '<div class="round-label">Round of 32 — 16 kamper</div>';
    for (const m of R32_STRUCTURE) {
      const home = r32Teams[m.id] ? r32Teams[m.id].home : null;
      const away = r32Teams[m.id] ? r32Teams[m.id].away : null;
      const winner = state.prediction.knockout.R32[m.id];
      html += renderMatch(m.id, home, away, winner, 'R32');
    }
    html += '</div>';

    // R16
    html += '<div class="bracket-round">';
    html += '<div class="round-label">Round of 16 — 8 kamper</div>';
    for (const m of R16_STRUCTURE) {
      const home = state.prediction.knockout.R32[m.home_from] || null;
      const away = state.prediction.knockout.R32[m.away_from] || null;
      const winner = state.prediction.knockout.R16[m.id];
      html += renderMatch(m.id, home, away, winner, 'R16');
    }
    html += '</div>';

    // QF
    html += '<div class="bracket-round">';
    html += '<div class="round-label">Kvartfinaler — 4 kamper</div>';
    for (const m of QF_STRUCTURE) {
      const home = state.prediction.knockout.R16[m.home_from] || null;
      const away = state.prediction.knockout.R16[m.away_from] || null;
      const winner = state.prediction.knockout.QF[m.id];
      html += renderMatch(m.id, home, away, winner, 'QF');
    }
    html += '</div>';

    // SF
    html += '<div class="bracket-round">';
    html += '<div class="round-label">Semifinaler — 2 kamper</div>';
    for (const m of SF_STRUCTURE) {
      const home = state.prediction.knockout.QF[m.home_from] || null;
      const away = state.prediction.knockout.QF[m.away_from] || null;
      const winner = state.prediction.knockout.SF[m.id];
      html += renderMatch(m.id, home, away, winner, 'SF');
    }
    html += '</div>';

    // Final
    html += '<div class="bracket-round">';
    html += '<div class="round-label">Finale</div>';
    const finalHome = state.prediction.knockout.SF[FINAL_STRUCTURE.home_from] || null;
    const finalAway = state.prediction.knockout.SF[FINAL_STRUCTURE.away_from] || null;
    const finalWinner = state.prediction.knockout.F[FINAL_STRUCTURE.id];
    html += renderMatch(FINAL_STRUCTURE.id, finalHome, finalAway, finalWinner, 'F');
    html += '</div>';

    // Champion
    const champion = state.prediction.knockout.W;
    html += `
      <div class="winner-card">
        <div class="label">🏆 VM-VINNER</div>
        <div class="champ ${champion ? '' : 'empty'}">${champion ? escapeHTML(state.teams[champion].name_no || state.teams[champion].name_en) : 'Velg vinner av finalen ↑'}</div>
      </div>
    `;

    return html;
  }

  function resolveR32Teams() {
    const bracket = {};
    const usedThirds = new Set();

    // Third-place slots with their allowed source groups
    // Ordered by most constrained first to minimize conflicts
    const thirdSlots = [
      { id: 74,  allowed: 'ABCDF' },  // faces 1E
      { id: 77,  allowed: 'CDFGH' },  // faces 1I
      { id: 79,  allowed: 'CEFHI' },  // faces 1A
      { id: 80,  allowed: 'EHIJK' },  // faces 1L
      { id: 81,  allowed: 'BEFIJ' },  // faces 1D
      { id: 82,  allowed: 'AEHIJ' },  // faces 1G
      { id: 85,  allowed: 'EFGIJ' },  // faces 1B
      { id: 87,  allowed: 'DEIJL' },  // faces 1K
    ];

    // Sort by number of matching available thirds (most constrained first)
    thirdSlots.sort((a, b) => {
      const aCount = state.prediction.thirds.filter(code => {
        const t = state.teams[code];
        return t && a.allowed.includes(t.group_code);
      }).length;
      const bCount = state.prediction.thirds.filter(code => {
        const t = state.teams[code];
        return t && b.allowed.includes(t.group_code);
      }).length;
      return aCount - bCount;
    });

    // Assign thirds without duplicates
    const thirdAssignments = {};
    for (const slot of thirdSlots) {
      for (const code of state.prediction.thirds) {
        if (usedThirds.has(code)) continue;
        const team = state.teams[code];
        if (team && slot.allowed.includes(team.group_code)) {
          thirdAssignments[slot.id] = code;
          usedThirds.add(code);
          break;
        }
      }
    }

    // Build full bracket
    for (const m of R32_STRUCTURE) {
      let home, away;

      if (m.home_slot.startsWith('T_')) {
        home = thirdAssignments[m.id] || null;
      } else {
        const pos = parseInt(m.home_slot.charAt(0));
        const group = m.home_slot.charAt(1);
        home = state.prediction.groups[group] && state.prediction.groups[group][pos - 1];
      }

      if (m.away_slot.startsWith('T_')) {
        away = thirdAssignments[m.id] || null;
      } else {
        const pos = parseInt(m.away_slot.charAt(0));
        const group = m.away_slot.charAt(1);
        away = state.prediction.groups[group] && state.prediction.groups[group][pos - 1];
      }

      bracket[m.id] = { home, away };
    }
    return bracket;
  }

  function renderMatch(id, home, away, winner, round) {
    const homeTeam = state.teams[home];
    const awayTeam = state.teams[away];
    const homeLabel = homeTeam ? `${teamFlag(home)} ${escapeHTML(homeTeam.name_no || homeTeam.name_en)}` : '<em>Venter…</em>';
    const awayLabel = awayTeam ? `${teamFlag(away)} ${escapeHTML(awayTeam.name_no || awayTeam.name_en)}` : '<em>Venter…</em>';
    const homeClass = !home ? 'empty' : (winner === home ? 'winner' : '');
    const awayClass = !away ? 'empty' : (winner === away ? 'winner' : '');
    return `
      <div class="matchup">
        <div class="match-team ${homeClass}" ${home ? `onclick="pickWinner(${id}, '${home}', '${round}')"` : ''}>
          <span class="match-id">#${id}</span>${homeLabel}
        </div>
        <div class="match-vs">VS</div>
        <div class="match-team ${awayClass}" ${away ? `onclick="pickWinner(${id}, '${away}', '${round}')"` : ''}>
          ${awayLabel}
        </div>
      </div>
    `;
  }

  window.pickWinner = function(matchId, teamCode, round) {
    // Setting a winner in R32 propagates to R16 onwards, so clear downstream picks
    state.prediction.knockout[round][matchId] = teamCode;

    // If this is the Final, also set the champion
    if (round === 'F') state.prediction.knockout.W = teamCode;

    // Clear any downstream picks where the previous choice no longer fits
    clearDownstream(round, matchId, teamCode);

    document.getElementById('bracket-container').innerHTML = renderBracketInner();
    updateProgress();
  };

  function clearDownstream(changedRound, matchId, newWinner) {
    // Build list of rounds after the changed round
    const order = ['R32', 'R16', 'QF', 'SF', 'F'];
    const startIdx = order.indexOf(changedRound) + 1;

    // Find which match in the next round depends on this
    let affectedMatchId = matchId;
    for (let i = startIdx; i < order.length; i++) {
      const nextRound = order[i];
      let structure;
      if (nextRound === 'R16') structure = R16_STRUCTURE;
      else if (nextRound === 'QF') structure = QF_STRUCTURE;
      else if (nextRound === 'SF') structure = SF_STRUCTURE;
      else if (nextRound === 'F') structure = [FINAL_STRUCTURE];
      else break;

      const nextMatch = structure.find(s => s.home_from === affectedMatchId || s.away_from === affectedMatchId);
      if (!nextMatch) break;

      const prevWinnerInNext = state.prediction.knockout[nextRound][nextMatch.id];
      // If the previous winner picked in the next round is no longer in this match, clear it
      if (prevWinnerInNext) {
        const home = state.prediction.knockout[order[i - 1]][nextMatch.home_from];
        const away = state.prediction.knockout[order[i - 1]][nextMatch.away_from];
        if (prevWinnerInNext !== home && prevWinnerInNext !== away) {
          delete state.prediction.knockout[nextRound][nextMatch.id];
          if (nextRound === 'F') state.prediction.knockout.W = null;
        }
      }
      affectedMatchId = nextMatch.id;
    }
  }


  // ── Section 5: Extra questions ───────────────────────────────
  function renderExtrasSection() {
    const questions = state.questions.map(q => {
      const txt = q.question_no || q.question_en;
      let input;
      if (q.answer_type === 'number') {
        input = `<input type="number" id="q-${q.q_id}" min="0">`;
      } else if (q.answer_type === 'multi' && q.options) {
        const opts = q.options.map(o => `<option value="${escapeHTML(o)}">${escapeHTML(o)}</option>`).join('');
        input = `<select id="q-${q.q_id}"><option value="">Velg…</option>${opts}</select>`;
      } else {
        input = `<input type="text" id="q-${q.q_id}">`;
      }
      return `
        <div class="question">
          <div class="question-meta">
            <span>#${q.q_id}</span>
            <span class="pts">${q.points}p</span>
            <span>${q.round}</span>
          </div>
          <div class="question-text">${escapeHTML(txt)}</div>
          ${input}
        </div>
      `;
    }).join('');
    return `
      <section class="section">
        <div class="section-num">05 · Ekstraspørsmål</div>
        <h2 class="section-title">13 bonus-spørsmål</h2>
        <p class="section-desc">Totalt 37 ekstrapoeng å hente. Svar på alle før du leverer.</p>
        ${questions}
      </section>
    `;
  }


  // ── Submit bar ───────────────────────────────────────────────
  function renderSubmitBar() {
    return `
      <div class="submit-bar">
        <div class="completion-text">
          <span id="completion-status">Fyller ut…</span>
        </div>
        <button type="button" class="btn-submit" id="btn-submit" disabled onclick="submitForm()">
          Lever
        </button>
      </div>
    `;
  }

  // ── Progress + completion tracking ───────────────────────────
  function updateProgress() {
    const status = checkCompletion();
    const counter = document.getElementById('completion-status');
    const btn = document.getElementById('btn-submit');
    const prog = document.getElementById('progress');

    // 5 section dots
    if (prog) {
      prog.innerHTML = [1,2,3,4,5].map(i => {
        const cls = status.sections[i-1] === 'complete' ? 'complete'
                  : status.sections[i-1] === 'active' ? 'active' : '';
        return `<div class="progress-dot ${cls}"></div>`;
      }).join('');
    }

    if (counter) counter.innerHTML = `<span class="count">${status.complete}</span> / ${status.total} fullført`;
    if (btn) btn.disabled = !status.valid;
  }

  function checkCompletion() {
    const s = state.prediction;
    const checks = {
      personal: !!(s.personal.full_name && s.personal.email && s.personal.company && s.personal.department),
      groups: Object.keys(s.groups).length === 12 && Object.values(s.groups).every(g => g.length === 4),
      thirds: s.thirds.length === 8,
      bracket: Object.keys(s.knockout.R32).length === 16
            && Object.keys(s.knockout.R16).length === 8
            && Object.keys(s.knockout.QF).length === 4
            && Object.keys(s.knockout.SF).length === 2
            && Object.keys(s.knockout.F).length === 1
            && !!s.knockout.W,
      extras: state.questions.every(q => {
        const v = s.extras[q.q_id];
        return v !== undefined && v !== null && v !== '';
      }),
    };
    const ks = [checks.personal, checks.groups, checks.thirds, checks.bracket, checks.extras];
    const sections = ks.map(k => k ? 'complete' : 'active');
    return {
      sections,
      complete: ks.filter(Boolean).length,
      total: 5,
      valid: ks.every(Boolean),
    };
  }

  // ── Submit ───────────────────────────────────────────────────
  window.submitForm = async function() {
    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span> Sender…';

    try {
      const payload = {
        full_name: state.prediction.personal.full_name,
        email: state.prediction.personal.email,
        company: state.prediction.personal.company,
        department: state.prediction.personal.department,
        prediction: {
          groups: state.prediction.groups,
          thirds: state.prediction.thirds,
          knockout: {
            R32: Object.values(state.prediction.knockout.R32),
            R16: Object.values(state.prediction.knockout.R16),
            QF: Object.values(state.prediction.knockout.QF),
            SF: Object.values(state.prediction.knockout.SF),
            F: Object.values(state.prediction.knockout.F),
            W: [state.prediction.knockout.W],
          },
          extras: state.prediction.extras,
        },
      };

      const resp = await API.submitEntry(payload);
      showConfirmation(resp);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Lever';
      alert('Feil ved innsending: ' + err.message);
    }
  };

  function showConfirmation(resp) {
    document.getElementById('app').innerHTML = `
      <div class="confirmation">
        <div style="font-size:3rem; margin-bottom:1rem;">⚽</div>
        <h2>Takk, ${escapeHTML(state.prediction.personal.full_name)}!</h2>
        <p style="color:var(--muted);">Din innlevering er mottatt og registrert.</p>
        <div class="confirmation-code">${resp.confirmation_code}</div>
        <p style="font-size:0.875rem; color:var(--muted);">
          Ta skjermbilde av koden for referanse.<br>
          Resultater publiseres fortløpende på rapportsiden.
        </p>
        <p style="margin-top:2rem; font-family:'JetBrains Mono',monospace; font-size:0.8125rem;">
          11. juni 2026 → 19. juli 2026
        </p>
      </div>
    `;
    window.scrollTo(0, 0);
  }

  function lockForm() {
    document.getElementById('tipping-form').style.pointerEvents = 'none';
    document.getElementById('tipping-form').style.opacity = '0.5';
    const btn = document.getElementById('btn-submit');
    if (btn) { btn.disabled = true; btn.textContent = 'Fristen er passert'; }
  }

  // ── Utils ────────────────────────────────────────────────────
  function escapeHTML(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Kick off
  document.addEventListener('DOMContentLoaded', init);
})();
