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

  function populateFilters() {
    const companies = new Set();
    const depts = new Set();
    for (const p of state.raw) {
      if (p.company) companies.add(p.company);
      if (p.department) depts.add(p.department);
    }
    const cEl = document.getElementById('filter-company');
    const dEl = document.getElementById('filter-dept');
    const cur_c = cEl.value; const cur_d = dEl.value;
    cEl.innerHTML = '<option value="">Alle firma</option>' +
      Array.from(companies).sort().map(c => `<option ${c===cur_c?'selected':''}>${escapeHTML(c)}</option>`).join('');
    dEl.innerHTML = '<option value="">Alle avdelinger</option>' +
      Array.from(depts).sort().map(d => `<option ${d===cur_d?'selected':''}>${escapeHTML(d)}</option>`).join('');
  }

  function filtered() {
    return state.raw.filter(p => {
      if (state.search && !String(p.name).toLowerCase().includes(state.search)) return false;
      if (state.company && p.company !== state.company) return false;
      if (state.dept && p.department !== state.dept) return false;
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
        const koPts = (Number(p.R32_pts)||0) + (Number(p.R16_pts)||0) + (Number(p.QF_pts)||0)
                    + (Number(p.SF_pts)||0) + (Number(p.F_pts)||0) + (Number(p.W_pts)||0)
                    + (Number(p.third_pts)||0);
        return `
          <tr onclick="showDetail('${p.participant_id}')">
            <td class="rank ${rankClass}">${rank}</td>
            <td>
              <div class="participant-name">${escapeHTML(p.name)}</div>
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

    // Distribution histogram
    const values = sorted.map(p => Number(p[scoreField]) || 0);
    const buckets = buildHistogram(values, 10);
    const distCtx = document.getElementById('chart-distribution').getContext('2d');
    if (state.charts.dist) state.charts.dist.destroy();
    state.charts.dist = new Chart(distCtx, {
      type: 'bar',
      data: {
        labels: buckets.labels,
        datasets: [{
          label: 'Deltakere',
          data: buckets.counts,
          backgroundColor: '#0a0e1a',
          borderRadius: 2,
        }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { font: { family: 'JetBrains Mono', size: 10 } } },
          y: { ticks: { font: { family: 'JetBrains Mono', size: 10 } } },
        },
      },
    });

    // Top 10 — stacked bar by category
    const top10 = sorted.slice(0, 10);
    const catCtx = document.getElementById('chart-categories').getContext('2d');
    if (state.charts.cat) state.charts.cat.destroy();
    state.charts.cat = new Chart(catCtx, {
      type: 'bar',
      data: {
        labels: top10.map(p => shortName(p.name)),
        datasets: [
          { label: 'Gruppe',    data: top10.map(p => Number(p.group_pts) || 0), backgroundColor: '#0a0e1a' },
          { label: '3. plass',  data: top10.map(p => Number(p.third_pts) || 0), backgroundColor: '#374151' },
          { label: 'R32/R16',   data: top10.map(p => (Number(p.R32_pts)||0) + (Number(p.R16_pts)||0)), backgroundColor: '#6b7280' },
          { label: 'QF/SF',     data: top10.map(p => (Number(p.QF_pts)||0) + (Number(p.SF_pts)||0)), backgroundColor: '#9ca3af' },
          { label: 'Final/W',   data: top10.map(p => (Number(p.F_pts)||0) + (Number(p.W_pts)||0)), backgroundColor: '#ff4d2d' },
          { label: 'Extras',    data: top10.map(p => Number(p.extras_pts) || 0), backgroundColor: '#f59e0b' },
        ],
      },
      options: {
        indexAxis: 'y',
        plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } },
        scales: {
          x: { stacked: true, ticks: { font: { family: 'JetBrains Mono', size: 10 } } },
          y: { stacked: true, ticks: { font: { size: 11 } } },
        },
      },
    });
  }

  function buildHistogram(values, bucketCount) {
    if (values.length === 0) return { labels: [], counts: [] };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(1, max - min);
    const step = Math.ceil(range / bucketCount) || 1;
    const counts = new Array(bucketCount).fill(0);
    const labels = [];
    for (let i = 0; i < bucketCount; i++) {
      const lo = min + step * i;
      const hi = lo + step - 1;
      labels.push(`${lo}-${hi}`);
    }
    for (const v of values) {
      const idx = Math.min(bucketCount - 1, Math.floor((v - min) / step));
      counts[idx]++;
    }
    return { labels, counts };
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
      ['R32', p.R32_pts],
      ['R16', p.R16_pts],
      ['QF', p.QF_pts],
      ['SF', p.SF_pts],
      ['Finale', p.F_pts],
      ['Vinner', p.W_pts],
      ['Extras', p.extras_pts],
    ];
    document.getElementById('modal-content').innerHTML = `
      <h3>${escapeHTML(p.name)}</h3>
      <div style="color:var(--muted); font-size:0.875rem; margin-bottom:1rem;">
        ${escapeHTML([p.company, p.department].filter(Boolean).join(' · '))}
      </div>
      <div style="display:flex; gap:2rem; padding:1rem; background:white; border:1.5px solid var(--line); border-radius:8px; margin-bottom:1rem;">
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
      <button onclick="closeModal()" style="margin-top:1.5rem; background:var(--ink); color:var(--cream); border:none; padding:0.625rem 1rem; border-radius:6px; font-family:inherit; font-weight:600; cursor:pointer;">Lukk</button>
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
