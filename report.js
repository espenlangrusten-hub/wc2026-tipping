/**
 * report.js — Public leaderboard page.
 *
 * - Fetches /leaderboard and renders table + charts
 * - Search filter (name), category filters (company, department)
 * - View toggle: total vs no_extras
 * - Click participant row → detail modal with breakdown
 * - Auto-refresh every 5 min
 */

(function() {
  'use strict';

  const state = {
    raw: [],
    view: 'total',    // 'total' or 'no_extras'
    search: '',
    company: '',
    dept: '',
    charts: {},
  };

  async function init() {
    await loadLeaderboard();
    attachControls();
    setInterval(loadLeaderboard, (CONFIG.LEADERBOARD_REFRESH_SEC || 300) * 1000);
  }

  async function loadLeaderboard() {
    try {
      const data = await API.getLeaderboard();
      state.raw = data || [];
      populateFilters();
      render();
      document.getElementById('generated-at').textContent =
        'Oppdatert ' + new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      document.getElementById('lb-body').innerHTML =
        `<tr><td colspan="6" class="empty-state">Klarte ikke laste: ${escapeHTML(err.message)}</td></tr>`;
    }
  }

  function attachControls() {
    document.getElementById('search').addEventListener('input', e => {
      state.search = e.target.value.toLowerCase().trim();
      render();
    });
    document.getElementById('filter-company').addEventListener('change', e => {
      state.company = e.target.value;
      render();
    });
    document.getElementById('filter-dept').addEventListener('change', e => {
      state.dept = e.target.value;
      render();
    });
    document.querySelectorAll('.tab').forEach(t => {
      t.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        state.view = t.dataset.view;
        render();
      });
    });
  }

  // ── Fuzzy matching helpers ───────────────────────────────────
  function levenshtein(a, b) {
    a = a.toLowerCase(); b = b.toLowerCase();
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var matrix = [];
    for (var i = 0; i <= b.length; i++) matrix[i] = [i];
    for (var j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (var i = 1; i <= b.length; i++) {
      for (var j = 1; j <= a.length; j++) {
        var cost = b.charAt(i-1) === a.charAt(j-1) ? 0 : 1;
        matrix[i][j] = Math.min(matrix[i-1][j]+1, matrix[i][j-1]+1, matrix[i-1][j-1]+cost);
      }
    }
    return matrix[b.length][a.length];
  }

  function clusterNames(names) {
    // Group similar names (Levenshtein ≤ 2) — pick the most common spelling as canonical
    var clusters = []; // [{canonical, variants: Set}]
    var sorted = Array.from(names).sort();
    for (var i = 0; i < sorted.length; i++) {
      var name = sorted[i];
      var found = false;
      for (var c = 0; c < clusters.length; c++) {
        if (levenshtein(name, clusters[c].canonical) <= 2) {
          clusters[c].variants.add(name);
          found = true;
          break;
        }
      }
      if (!found) {
        clusters.push({ canonical: name, variants: new Set([name]) });
      }
    }
    // Pick most common spelling as canonical
    return clusters.map(function(c) {
      var arr = Array.from(c.variants);
      return { display: arr.sort()[0], variants: c.variants };
    });
  }

  function populateFilters() {
    var companies = new Set();
    var depts = new Set();
    for (var i = 0; i < state.raw.length; i++) {
      var p = state.raw[i];
      if (p.company) companies.add(p.company);
      if (p.department) depts.add(p.department);
    }

    state.companyClusters = clusterNames(companies);
    state.deptClusters = clusterNames(depts);

    var cEl = document.getElementById('filter-company');
    var dEl = document.getElementById('filter-dept');
    var cur_c = cEl.value; var cur_d = dEl.value;
    cEl.innerHTML = '<option value="">Alle arbeidssteder</option>' +
      state.companyClusters.map(function(c) {
        return '<option value="' + escapeHTML(c.display) + '" ' + (c.display===cur_c?'selected':'') + '>' + escapeHTML(c.display) +
          (c.variants.size > 1 ? ' (' + c.variants.size + ')' : '') + '</option>';
      }).join('');
    dEl.innerHTML = '<option value="">Alle avdelinger</option>' +
      state.deptClusters.map(function(c) {
        return '<option value="' + escapeHTML(c.display) + '" ' + (c.display===cur_d?'selected':'') + '>' + escapeHTML(c.display) +
          (c.variants.size > 1 ? ' (' + c.variants.size + ')' : '') + '</option>';
      }).join('');
  }

  function filtered() {
    return state.raw.filter(function(p) {
      if (state.search && !String(p.full_name).toLowerCase().includes(state.search)) return false;
      if (state.company) {
        var match = false;
        for (var i = 0; i < state.companyClusters.length; i++) {
          if (state.companyClusters[i].display === state.company && state.companyClusters[i].variants.has(p.company)) {
            match = true; break;
          }
        }
        if (!match) return false;
      }
      if (state.dept) {
        var match2 = false;
        for (var j = 0; j < state.deptClusters.length; j++) {
          if (state.deptClusters[j].display === state.dept && state.deptClusters[j].variants.has(p.department)) {
            match2 = true; break;
          }
        }
        if (!match2) return false;
      }
      return true;
    });
  }

  function render() {
    const rows = filtered();

    // Re-rank if viewing "no_extras"
    const scoreField = state.view === 'total' ? 'total' : 'total_no_extras';
    const sorted = [...rows].sort((a, b) => (Number(b[scoreField]) || 0) - (Number(a[scoreField]) || 0));

    // Hero: top of current view
    const leader = sorted[0];
    if (leader) {
      document.getElementById('leader-name').textContent = leader.name;
      document.getElementById('leader-meta').textContent = [leader.company, leader.department].filter(Boolean).join(' · ');
      document.getElementById('leader-score').textContent = Number(leader[scoreField]) + 'p';
    }

    // Table
    const body = document.getElementById('lb-body');
    if (sorted.length === 0) {
      body.innerHTML = '<tr><td colspan="6" class="empty-state">Ingen treff</td></tr>';
    } else {
      body.innerHTML = sorted.map((p, i) => {
        const rank = i + 1;
        const rankClass = rank === 1 ? 'r1' : rank === 2 ? 'r2' : rank === 3 ? 'r3' : '';
        const koPts = (Number(p.r32_pts)||0) + (Number(p.r16_pts)||0) + (Number(p.qf_pts)||0)
                    + (Number(p.sf_pts)||0) + (Number(p.f_pts)||0) + (Number(p.w_pts)||0)
                    + (Number(p.third_pts)||0);
        return `
          <tr onclick="showDetail('${p.participant_id}')">
            <td class="rank ${rankClass}">${rank}</td>
            <td>
              <div class="participant-name">${escapeHTML(p.full_name)}</div>
              <div class="participant-meta">${escapeHTML([p.company, p.department].filter(Boolean).join(' · '))}</div>
            </td>
            <td class="num">${p.group_pts || 0}</td>
            <td class="num">${koPts}</td>
            <td class="num">${p.extras_pts || 0}</td>
            <td class="num total-pts">${Number(p[scoreField]) || 0}</td>
          </tr>
        `;
      }).join('');
    }

    renderCharts(sorted);
  }

  function renderCharts(sorted) {
    const scoreField = state.view === 'total' ? 'total' : 'total_no_extras';

    // Top 5 progression chart (from scores_history)
    renderProgressionChart(sorted);

    // Top 10 — stacked bar by category
    const top10 = sorted.slice(0, 10);
    const catCtx = document.getElementById('chart-categories').getContext('2d');
    if (state.charts.cat) state.charts.cat.destroy();
    state.charts.cat = new Chart(catCtx, {
      type: 'bar',
      data: {
        labels: top10.map(p => shortName(p.full_name)),
        datasets: [
          { label: 'Gruppe',    data: top10.map(p => Number(p.group_pts) || 0), backgroundColor: '#d4a843' },
          { label: '3. plass',  data: top10.map(p => Number(p.third_pts) || 0), backgroundColor: '#a78832' },
          { label: 'R32/R16',   data: top10.map(p => (Number(p.r32_pts)||0) + (Number(p.r16_pts)||0)), backgroundColor: '#6b7a8d' },
          { label: 'QF/SF',     data: top10.map(p => (Number(p.qf_pts)||0) + (Number(p.sf_pts)||0)), backgroundColor: '#94a3b8' },
          { label: 'Final/W',   data: top10.map(p => (Number(p.f_pts)||0) + (Number(p.w_pts)||0)), backgroundColor: '#e8443a' },
          { label: 'Extras',    data: top10.map(p => Number(p.extras_pts) || 0), backgroundColor: '#3ecf72' },
        ],
      },
      options: {
        indexAxis: 'y',
        plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, color: '#6b7a8d' } } },
        scales: {
          x: { stacked: true, ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#6b7a8d' }, grid: { color: '#232a38' } },
          y: { stacked: true, ticks: { font: { size: 11 }, color: '#c0b9a8' }, grid: { color: '#232a38' } },
        },
      },
    });
  }

  async function renderProgressionChart(sorted) {
    const distCtx = document.getElementById('chart-distribution').getContext('2d');
    if (state.charts.dist) state.charts.dist.destroy();

    // Get top 5 participant IDs from current leaderboard
    const top5 = sorted.slice(0, 5);
    if (top5.length === 0) return;
    const top5ids = top5.map(p => p.participant_id);

    // Fetch history from Supabase
    try {
      const { data: history, error } = await db
        .from('scores_history')
        .select('*')
        .in('participant_id', top5ids)
        .order('snapshot_at');

      if (error || !history || history.length === 0) {
        // No history yet — show empty state
        state.charts.dist = new Chart(distCtx, {
          type: 'line',
          data: { labels: ['Ingen data ennå'], datasets: [] },
          options: { plugins: { legend: { display: false } } },
        });
        return;
      }

      // Group by participant
      const byPid = {};
      const allTimes = new Set();
      for (const row of history) {
        if (!byPid[row.participant_id]) byPid[row.participant_id] = {};
        const timeLabel = new Date(row.snapshot_at).toLocaleDateString('nb-NO', { day: '2-digit', month: 'short' })
          + ' ' + new Date(row.snapshot_at).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
        byPid[row.participant_id][row.snapshot_at] = row.total;
        allTimes.add(row.snapshot_at);
      }

      // Sort timestamps
      const sortedTimes = Array.from(allTimes).sort();
      const labels = sortedTimes.map(t => {
        const d = new Date(t);
        return d.toLocaleDateString('nb-NO', { day: '2-digit', month: 'short' });
      });

      // Remove duplicate labels (keep time if same day)
      const seen = {};
      const uniqueLabels = labels.map((lbl, i) => {
        if (seen[lbl]) {
          const d = new Date(sortedTimes[i]);
          return d.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
        }
        seen[lbl] = true;
        return lbl;
      });

      // Build datasets — one line per participant
      const colors = ['#ff4d2d', '#0a0e1a', '#f59e0b', '#22c55e', '#6366f1'];
      const datasets = top5.map((p, i) => {
        const pid = p.participant_id;
        const data = sortedTimes.map(t => byPid[pid] && byPid[pid][t] != null ? byPid[pid][t] : null);
        return {
          label: shortName(p.full_name),
          data: data,
          borderColor: colors[i % colors.length],
          backgroundColor: colors[i % colors.length] + '20',
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.3,
          spanGaps: true,
        };
      });

      state.charts.dist = new Chart(distCtx, {
        type: 'line',
        data: { labels: uniqueLabels, datasets },
        options: {
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 10 }, usePointStyle: true, color: '#6b7a8d' } },
          },
          scales: {
            x: { ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#6b7a8d' }, grid: { color: '#232a38' } },
            y: {
              beginAtZero: true,
              ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#6b7a8d' },
              title: { display: true, text: 'Poeng', font: { size: 10 }, color: '#6b7a8d' },
              grid: { color: '#232a38' },
            },
          },
        },
      });
    } catch (err) {
      console.error('Failed to load progression:', err);
    }
  }

  function shortName(name) {
    const parts = String(name).split(/\s+/);
    if (parts.length < 2) return name;
    return parts[0] + ' ' + parts[parts.length - 1].charAt(0) + '.';
  }

  window.showDetail = function(pid) {
    const p = state.raw.find(x => x.participant_id === pid);
    if (!p) return;
    const cells = [
      ['Gruppe', p.group_pts],
      ['3. plass', p.third_pts],
      ['R32', p.r32_pts],
      ['R16', p.r16_pts],
      ['QF', p.qf_pts],
      ['SF', p.sf_pts],
      ['Finale', p.f_pts],
      ['Vinner', p.w_pts],
      ['Extras', p.extras_pts],
    ];
    document.getElementById('modal-content').innerHTML = `
      <h3>${escapeHTML(p.full_name)}</h3>
      <div style="color:var(--muted); font-size:0.875rem; margin-bottom:1rem;">
        ${escapeHTML([p.company, p.department].filter(Boolean).join(' · '))}
      </div>
      <div style="display:flex; gap:2rem; padding:1rem; background:#1a1f2e; border:1px solid var(--line); border-radius:8px; margin-bottom:1rem;">
        <div>
          <div style="font-family:'JetBrains Mono',monospace; font-size:0.6875rem; text-transform:uppercase; color:var(--muted);">Plassering</div>
          <div style="font-family:'JetBrains Mono',monospace; font-weight:700; font-size:2rem;">#${p.rank}</div>
        </div>
        <div>
          <div style="font-family:'JetBrains Mono',monospace; font-size:0.6875rem; text-transform:uppercase; color:var(--muted);">Total</div>
          <div style="font-family:'JetBrains Mono',monospace; font-weight:700; font-size:2rem; color:var(--accent);">${p.total}p</div>
        </div>
        <div>
          <div style="font-family:'JetBrains Mono',monospace; font-size:0.6875rem; text-transform:uppercase; color:var(--muted);">Uten extras</div>
          <div style="font-family:'JetBrains Mono',monospace; font-weight:700; font-size:2rem;">${p.total_no_extras}p</div>
        </div>
      </div>
      <div class="score-breakdown">
        ${cells.map(c => `
          <div class="score-cell">
            <div class="label">${c[0]}</div>
            <div class="val">${Number(c[1]) || 0}</div>
          </div>
        `).join('')}
      </div>
      <button onclick="closeModal()" style="margin-top:1.5rem; background:var(--accent); color:#080a10; border:none; padding:0.625rem 1rem; border-radius:6px; font-family:inherit; font-weight:600; cursor:pointer;">Lukk</button>
    `;
    document.getElementById('modal').classList.add('open');
  };

  window.closeModal = function() {
    document.getElementById('modal').classList.remove('open');
  };

  function escapeHTML(s) {
    if (s == null) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
