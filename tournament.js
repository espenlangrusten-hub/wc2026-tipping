/**
 * Tournament.gs — Group standings, tiebreakers, 3rd-place ranking,
 * and automatic bracket population for WC2026.
 *
 * Called by admin after entering match results.
 * Writes computed standings to Results_GroupTable and Bracket_Actual sheets.
 */

// ───────────────────────────────────────────────────────────────
// 1. COMPUTE GROUP TABLE FROM MATCH RESULTS
// ───────────────────────────────────────────────────────────────

/**
 * Compute standings for one group from its match results.
 *
 * @param {string}   groupCode   - e.g. 'A'
 * @param {string[]} teamCodes   - e.g. ['MEX','KOR','RSA','CZE']
 * @param {Object[]} matchResults - [{ home: 'MEX', away: 'KOR', home_score: 2, away_score: 1 }, ...]
 * @returns {Object[]} sorted standings: [{ team, P, W, D, L, GF, GA, GD, Pts }, ...]
 */
function computeGroupTable(groupCode, teamCodes, matchResults) {
  // Initialize stats
  var stats = {};
  for (var i = 0; i < teamCodes.length; i++) {
    stats[teamCodes[i]] = { team: teamCodes[i], group: groupCode, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0 };
  }

  // Process each match
  for (var m = 0; m < matchResults.length; m++) {
    var match = matchResults[m];
    if (match.home_score === null || match.away_score === null) continue;
    var h = stats[match.home];
    var a = stats[match.away];
    if (!h || !a) continue;

    h.P++; a.P++;
    h.GF += match.home_score; h.GA += match.away_score;
    a.GF += match.away_score; a.GA += match.home_score;

    if (match.home_score > match.away_score) {
      h.W++; h.Pts += 3; a.L++;
    } else if (match.home_score < match.away_score) {
      a.W++; a.Pts += 3; h.L++;
    } else {
      h.D++; a.D++; h.Pts += 1; a.Pts += 1;
    }
  }

  // Compute GD
  var teamArray = [];
  for (var t in stats) {
    stats[t].GD = stats[t].GF - stats[t].GA;
    teamArray.push(stats[t]);
  }

  // Sort by FIFA tiebreak rules:
  // 1. Points → 2. GD → 3. GF → 4. Head-to-head (simplified) → 5. Fair play (not modeled) → 6. Ranking
  teamArray.sort(function(a, b) {
    // Primary: points
    if (b.Pts !== a.Pts) return b.Pts - a.Pts;
    // Secondary: goal difference
    if (b.GD !== a.GD) return b.GD - a.GD;
    // Tertiary: goals for
    if (b.GF !== a.GF) return b.GF - a.GF;
    // Quaternary: head-to-head
    var h2h = headToHead(a.team, b.team, matchResults);
    if (h2h !== 0) return h2h;
    // Fallback: alphabetical (admin can override if needed)
    return a.team.localeCompare(b.team);
  });

  // Add position
  for (var p = 0; p < teamArray.length; p++) {
    teamArray[p].position = p + 1;
  }

  return teamArray;
}

/**
 * Head-to-head comparison. Returns <0 if teamA wins, >0 if teamB wins, 0 if tied.
 */
function headToHead(teamA, teamB, matchResults) {
  for (var i = 0; i < matchResults.length; i++) {
    var m = matchResults[i];
    if (m.home === teamA && m.away === teamB) {
      if (m.home_score > m.away_score) return -1; // A wins
      if (m.home_score < m.away_score) return 1;  // B wins
      return 0;
    }
    if (m.home === teamB && m.away === teamA) {
      if (m.home_score > m.away_score) return 1;
      if (m.home_score < m.away_score) return -1;
      return 0;
    }
  }
  return 0;
}


// ───────────────────────────────────────────────────────────────
// 2. RANK THIRD-PLACED TEAMS
// ───────────────────────────────────────────────────────────────

/**
 * From all 12 group tables, extract the 3rd-placed teams, rank them,
 * and return the best 8.
 *
 * FIFA tiebreak for 3rd-placed teams (different from within-group):
 * 1. Points → 2. GD → 3. GF → 4. Team conduct score → 5. FIFA ranking
 * (We model 1-3; admin can override 4-5 manually.)
 *
 * @param {Object[]} allGroupTables - array of group table arrays
 * @returns {Object} { all12: [...], best8: [...], qualifying_groups: ['B','C',...] }
 */
function rankThirdPlacedTeams(allGroupTables) {
  var thirds = [];

  for (var g = 0; g < allGroupTables.length; g++) {
    var table = allGroupTables[g];
    if (table.length >= 3) {
      thirds.push(table[2]); // position 3 (0-indexed: index 2)
    }
  }

  // Sort by: Points → GD → GF
  thirds.sort(function(a, b) {
    if (b.Pts !== a.Pts) return b.Pts - a.Pts;
    if (b.GD !== a.GD) return b.GD - a.GD;
    if (b.GF !== a.GF) return b.GF - a.GF;
    return a.team.localeCompare(b.team);
  });

  var best8 = thirds.slice(0, 8);
  var qualifyingGroups = best8.map(function(t) { return t.group; }).sort();

  return {
    all12: thirds,
    best8: best8,
    qualifying_groups: qualifyingGroups,
  };
}


// ───────────────────────────────────────────────────────────────
// 3. POPULATE KNOCKOUT BRACKET
// ───────────────────────────────────────────────────────────────

/**
 * Given computed group standings and the 3rd-place permutation table,
 * populate the R32 bracket with actual teams.
 *
 * @param {Object} groupStandings - { A: [1st, 2nd, 3rd, 4th], B: [...], ... }
 *                                  where each element has .team property
 * @param {string[]} qualifyingGroups - sorted array of 8 group letters
 * @param {Object} thirdPlaceTable - from tournament-data.js
 * @returns {Object} bracket - { match_id: { home_team, away_team } }
 */
function populateR32Bracket(groupStandings, qualifyingGroups, thirdPlaceTable) {
  // Helper: get team by group position
  function teamAt(groupCode, position) {
    var table = groupStandings[groupCode];
    return table ? table[position - 1].team : null;
  }

  // Resolve 3rd-place mapping
  var key = qualifyingGroups.join('');
  var thirdMapping = thirdPlaceTable[key];
  if (!thirdMapping) {
    throw new Error('No 3rd-place mapping found for combination: ' + key);
  }

  // Slot order for 3rd-place table: 1A, 1B, 1D, 1E, 1G, 1I, 1K, 1L
  var slotGroupWinners = ['A', 'B', 'D', 'E', 'G', 'I', 'K', 'L'];
  var thirdBySlot = {};
  for (var i = 0; i < slotGroupWinners.length; i++) {
    var slotKey = '1' + slotGroupWinners[i];
    var thirdRef = thirdMapping[i]; // e.g. '3E'
    var thirdGroup = thirdRef.charAt(1);
    thirdBySlot[slotKey] = teamAt(thirdGroup, 3);
  }

  // Now populate each R32 match
  // R32 match definitions (from tournament-data.js):
  var r32Defs = [
    { match_id: 73,  home: '2A', away: '2B' },
    { match_id: 74,  home: '1E', away: 'THIRD_1E' },
    { match_id: 75,  home: '1F', away: '2C' },
    { match_id: 76,  home: '1C', away: '2F' },
    { match_id: 77,  home: '1I', away: 'THIRD_1I' },
    { match_id: 78,  home: '2E', away: '2I' },
    { match_id: 79,  home: '1A', away: 'THIRD_1A' },
    { match_id: 80,  home: '1L', away: 'THIRD_1L' },
    { match_id: 81,  home: '1D', away: 'THIRD_1D' },
    { match_id: 82,  home: '1G', away: 'THIRD_1G' },
    { match_id: 83,  home: '2K', away: '2L' },
    { match_id: 84,  home: '1H', away: '2J' },
    { match_id: 85,  home: '1B', away: 'THIRD_1B' },
    { match_id: 86,  home: '1J', away: '2H' },
    { match_id: 87,  home: '1K', away: 'THIRD_1K' },
    { match_id: 88,  home: '2D', away: '2G' },
  ];

  function resolveSlot(slot) {
    if (slot.indexOf('THIRD_') === 0) {
      return thirdBySlot[slot.replace('THIRD_', '')];
    }
    var pos = parseInt(slot.charAt(0));
    var group = slot.charAt(1);
    return teamAt(group, pos);
  }

  var bracket = {};
  for (var m = 0; m < r32Defs.length; m++) {
    var def = r32Defs[m];
    bracket[def.match_id] = {
      home_team: resolveSlot(def.home),
      away_team: resolveSlot(def.away),
    };
  }

  return bracket;
}


// ───────────────────────────────────────────────────────────────
// 4. ADVANCE KNOCKOUT WINNERS
// ───────────────────────────────────────────────────────────────

/**
 * Given knockout match results, advance winners through the bracket.
 * Returns the complete bracket state including teams in R16, QF, SF, F.
 *
 * @param {Object} r32Bracket     - { match_id: { home_team, away_team } }
 * @param {Object} knockoutResults - { match_id: { home_score, away_score, winner, decided_in } }
 * @returns {Object} fullBracket  - { match_id: { home_team, away_team, winner } }
 */
function advanceKnockoutWinners(r32Bracket, knockoutResults) {
  var bracket = {};

  // Copy R32
  for (var id in r32Bracket) {
    bracket[id] = {
      home_team: r32Bracket[id].home_team,
      away_team: r32Bracket[id].away_team,
      winner: null,
    };
  }

  // Add results and determine winners
  for (var rid in knockoutResults) {
    var result = knockoutResults[rid];
    if (bracket[rid]) {
      bracket[rid].winner = result.winner;
    } else {
      bracket[rid] = { home_team: null, away_team: null, winner: result.winner };
    }
  }

  // Progression definitions: [match_id, home_from, away_from]
  var progressions = [
    // R16
    [89, 'W74', 'W77'], [90, 'W73', 'W75'],
    [91, 'W76', 'W78'], [92, 'W79', 'W80'],
    [93, 'W83', 'W84'], [94, 'W81', 'W82'],
    [95, 'W86', 'W88'], [96, 'W85', 'W87'],
    // QF
    [97, 'W89', 'W90'], [98, 'W93', 'W94'],
    [99, 'W91', 'W92'], [100, 'W95', 'W96'],
    // SF
    [101, 'W97', 'W98'], [102, 'W99', 'W100'],
    // 3rd place
    [103, 'L101', 'L102'],
    // Final
    [104, 'W101', 'W102'],
  ];

  function getTeamFromRef(ref) {
    var type = ref.charAt(0); // W or L
    var matchId = parseInt(ref.substring(1));
    var match = bracket[matchId];
    if (!match) return null;

    if (type === 'W') {
      return match.winner || null;
    } else {
      // Loser = the team that isn't the winner
      if (!match.winner) return null;
      return match.winner === match.home_team ? match.away_team : match.home_team;
    }
  }

  // Populate progression matches
  for (var p = 0; p < progressions.length; p++) {
    var prog = progressions[p];
    var matchId = prog[0];
    var homeTeam = getTeamFromRef(prog[1]);
    var awayTeam = getTeamFromRef(prog[2]);

    if (!bracket[matchId]) {
      bracket[matchId] = { home_team: null, away_team: null, winner: null };
    }
    bracket[matchId].home_team = homeTeam;
    bracket[matchId].away_team = awayTeam;

    // If result already entered, keep the winner
    if (knockoutResults[matchId]) {
      bracket[matchId].winner = knockoutResults[matchId].winner;
    }
  }

  return bracket;
}


// ───────────────────────────────────────────────────────────────
// 5. EXTRACT ACTUAL TEAMS BY ROUND (for scoring)
// ───────────────────────────────────────────────────────────────

/**
 * From a full bracket, extract which teams are in each round.
 * Used by the scoring engine to compare against predictions.
 *
 * @param {Object} fullBracket - from advanceKnockoutWinners
 * @returns {Object} { R32: ['MEX',...], R16: [...], QF: [...], SF: [...], F: [...], W: [...] }
 */
function extractTeamsByRound(fullBracket) {
  var rounds = {
    R32: { from: 73, to: 88 },
    R16: { from: 89, to: 96 },
    QF:  { from: 97, to: 100 },
    SF:  { from: 101, to: 102 },
    F:   { from: 104, to: 104 },  // final only (skip 103 = 3rd place)
  };

  var result = { R32: [], R16: [], QF: [], SF: [], F: [], W: [] };

  for (var round in rounds) {
    var range = rounds[round];
    var teams = {};
    for (var id = range.from; id <= range.to; id++) {
      var match = fullBracket[id];
      if (match) {
        if (match.home_team) teams[match.home_team] = true;
        if (match.away_team) teams[match.away_team] = true;
      }
    }
    result[round] = Object.keys(teams);
  }

  // Winner
  if (fullBracket[104] && fullBracket[104].winner) {
    result.W = [fullBracket[104].winner];
  }

  return result;
}


// ───────────────────────────────────────────────────────────────
// 6. MASTER RECALCULATE
// ───────────────────────────────────────────────────────────────

/**
 * Master recalculation function.
 * Called by admin. Orchestrates everything:
 * 1. Read group match results → compute group tables
 * 2. Rank 3rd-placed teams → resolve bracket
 * 3. Read knockout results → advance winners
 * 4. For each participant, compute full score
 * 5. Build leaderboard
 * 6. Save snapshot
 *
 * This is the entry point called from Admin.gs.
 * Actual Sheet I/O is handled by helper functions in SheetIO.gs.
 */
function masterRecalculate() {
  // This function is a stub showing the orchestration flow.
  // Actual implementation will call SheetIO functions.

  // 1. Read group match results from sheet
  var groupMatchResults = readGroupMatchResults(); // from SheetIO.gs

  // 2. Compute group tables for all 12 groups
  var allGroupTables = {};
  var groupTableArrays = [];
  var groupKeys = ['A','B','C','D','E','F','G','H','I','J','K','L'];

  for (var g = 0; g < groupKeys.length; g++) {
    var groupCode = groupKeys[g];
    var groupTeams = getGroupTeams(groupCode); // from SheetIO.gs
    var groupMatches = groupMatchResults.filter(function(m) { return m.group === groupCode; });
    var table = computeGroupTable(groupCode, groupTeams, groupMatches);
    allGroupTables[groupCode] = table;
    groupTableArrays.push(table);
  }

  // 3. Rank 3rd-placed teams
  var thirdPlaceResult = rankThirdPlacedTeams(groupTableArrays);

  // 4. Populate R32 bracket
  var thirdPlaceTable = getThirdPlaceTable(); // from tournament-data.js
  var r32Bracket = populateR32Bracket(allGroupTables, thirdPlaceResult.qualifying_groups, thirdPlaceTable);

  // 5. Read knockout results and advance
  var knockoutResults = readKnockoutResults(); // from SheetIO.gs
  var fullBracket = advanceKnockoutWinners(r32Bracket, knockoutResults);

  // 6. Extract actual teams by round
  var actualTeamsByRound = extractTeamsByRound(fullBracket);

  // 7. Build actuals object for scoring
  var actuals = {
    groups: {},
    thirds: thirdPlaceResult.best8.map(function(t) { return t.team; }),
    knockout: actualTeamsByRound,
  };
  for (var gc in allGroupTables) {
    actuals.groups[gc] = allGroupTables[gc].map(function(t) { return t.team; });
  }

  // 8. Read all predictions and score each participant
  var participants = readAllParticipants(); // from SheetIO.gs
  var questions = readExtraQuestions();     // from SheetIO.gs
  var officialAnswers = readOfficialAnswers(); // from SheetIO.gs
  var config = readScoringConfig();        // from SheetIO.gs

  var scored = [];
  for (var p = 0; p < participants.length; p++) {
    var part = participants[p];
    var scores = computeParticipantScore(part.prediction, actuals, questions, officialAnswers, config);
    scored.push({
      participant_id: part.participant_id,
      name: part.name,
      company: part.company,
      department: part.department,
      scores: scores,
    });
  }

  // 9. Build and save leaderboard
  var leaderboard = buildLeaderboard(scored);
  writeLeaderboard(leaderboard);           // to SheetIO.gs
  writeGroupTables(allGroupTables);        // to SheetIO.gs
  writeBracket(fullBracket);               // to SheetIO.gs
  takeLeaderboardSnapshot(leaderboard);    // to SheetIO.gs

  return {
    participants_scored: scored.length,
    leader: leaderboard.length > 0 ? leaderboard[0].name : null,
    top_score: leaderboard.length > 0 ? leaderboard[0].scores.total : 0,
  };
}
