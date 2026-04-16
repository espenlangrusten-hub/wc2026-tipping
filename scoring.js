/**
 * Scoring.gs — Pure scoring engine for WC2026 Tipping
 * All functions are pure: (predictions, actuals, config) → scores.
 * No Sheet I/O here — that lives in Leaderboard.gs.
 */

function scoreGroupStage(predictedGroups, actualGroups, config) {
  var details = [];
  var total = 0;
  var sweeps = 0;
  var groups = Object.keys(actualGroups);

  for (var g = 0; g < groups.length; g++) {
    var group = groups[g];
    var predicted = predictedGroups[group] || [];
    var actual = actualGroups[group] || [];
    var groupCorrect = 0;

    for (var pos = 0; pos < 4; pos++) {
      var correct = predicted[pos] === actual[pos];
      if (correct) {
        total += config.exact_group_position;
        groupCorrect++;
      }
      details.push({
        group: group, position: pos + 1,
        predicted_team: predicted[pos], actual_team: actual[pos],
        correct: correct, points: correct ? config.exact_group_position : 0
      });
    }
    if (groupCorrect === 4 && config.group_sweep_bonus > 0) {
      total += config.group_sweep_bonus;
      sweeps++;
    }
  }
  return { total: total, sweeps: sweeps, details: details };
}

function scoreThirdPlace(predictedThirds, actualThirds, config) {
  var actualSet = {};
  for (var i = 0; i < actualThirds.length; i++) actualSet[actualThirds[i]] = true;
  var details = [];
  var total = 0;
  var correctCount = 0;

  for (var j = 0; j < predictedThirds.length; j++) {
    var team = predictedThirds[j];
    var correct = !!actualSet[team];
    if (correct) { total += config.correct_third_place; correctCount++; }
    details.push({ team: team, correct: correct, points: correct ? config.correct_third_place : 0 });
  }
  return { total: total, correct_count: correctCount, details: details };
}

function scoreKnockout(predictedKO, actualKO, config) {
  var roundKeys = ['R32', 'R16', 'QF', 'SF', 'F', 'W'];
  var pointsMap = {
    R32: config.correct_R32_team, R16: config.correct_R16_team,
    QF: config.correct_QF_team, SF: config.correct_SF_team,
    F: config.correct_finalist, W: config.correct_champion
  };
  var details = [];
  var byRound = {};
  var total = 0;

  if (config.cumulative_knockout) {
    // Cumulative: a team predicted in the Final who reaches QF earns R32+R16+QF pts
    var predictedTeams = {};
    for (var r = 0; r < roundKeys.length; r++) {
      var teams = predictedKO[roundKeys[r]] || [];
      for (var t = 0; t < teams.length; t++) predictedTeams[teams[t]] = true;
    }

    for (var ri = 0; ri < roundKeys.length; ri++) {
      var round = roundKeys[ri];
      var actualTeams = {};
      var at = actualKO[round] || [];
      for (var ai = 0; ai < at.length; ai++) actualTeams[at[ai]] = true;
      var roundTotal = 0;

      var predKeys = Object.keys(predictedTeams);
      for (var pi = 0; pi < predKeys.length; pi++) {
        var team = predKeys[pi];
        if (actualTeams[team]) {
          // Check if predicted in this round or a later round
          var found = false;
          for (var fi = ri; fi < roundKeys.length; fi++) {
            var rTeams = predictedKO[roundKeys[fi]] || [];
            if (rTeams.indexOf(team) >= 0) { found = true; break; }
          }
          if (found) {
            roundTotal += pointsMap[round];
            details.push({ round: round, team: team, correct: true, points: pointsMap[round] });
          }
        }
      }
      byRound[round] = roundTotal;
      total += roundTotal;
    }
  } else {
    for (var ri2 = 0; ri2 < roundKeys.length; ri2++) {
      var round2 = roundKeys[ri2];
      var actualSet = {};
      var at2 = actualKO[round2] || [];
      for (var ai2 = 0; ai2 < at2.length; ai2++) actualSet[at2[ai2]] = true;
      var roundTotal2 = 0;

      var pred2 = predictedKO[round2] || [];
      for (var pi2 = 0; pi2 < pred2.length; pi2++) {
        var correct2 = !!actualSet[pred2[pi2]];
        if (correct2) roundTotal2 += pointsMap[round2];
        details.push({ round: round2, team: pred2[pi2], correct: correct2, points: correct2 ? pointsMap[round2] : 0 });
      }
      byRound[round2] = roundTotal2;
      total += roundTotal2;
    }
  }
  return { total: total, by_round: byRound, details: details };
}

function scoreExtraQuestions(questions, predictions, officialAnswers) {
  var details = [];
  var total = 0;

  for (var i = 0; i < questions.length; i++) {
    var q = questions[i];
    var predicted = predictions[q.q_id];
    var official = officialAnswers[q.q_id];

    if (official === undefined || official === null || official === '') {
      details.push({ q_id: q.q_id, predicted: predicted, official: null, correct: null, points: 0 });
      continue;
    }

    var correct = false;
    if (q.answer_type === 'number') {
      correct = Number(predicted) === Number(official);
    } else if (q.answer_type === 'text') {
      var opts = String(official).split(';');
      var predNorm = String(predicted).trim().toLowerCase();
      for (var j = 0; j < opts.length; j++) {
        if (opts[j].trim().toLowerCase() === predNorm) { correct = true; break; }
      }
    } else {
      correct = String(predicted).trim().toLowerCase() === String(official).trim().toLowerCase();
    }

    var pts = correct ? q.points : 0;
    total += pts;
    details.push({ q_id: q.q_id, predicted: predicted, official: official, correct: correct, points: pts });
  }
  return { total: total, details: details };
}

function computeParticipantScore(prediction, actuals, questions, officialAnswers, config) {
  var gs = scoreGroupStage(prediction.groups, actuals.groups, config);
  var ts = scoreThirdPlace(prediction.thirds, actuals.thirds, config);
  var ks = scoreKnockout(prediction.knockout, actuals.knockout, config);
  var es = scoreExtraQuestions(questions, prediction.extras, officialAnswers);

  var totalNoExtras = gs.total + ts.total + ks.total;
  return {
    total: totalNoExtras + es.total,
    total_no_extras: totalNoExtras,
    group_pts: gs.total, third_pts: ts.total,
    R32_pts: ks.by_round.R32 || 0, R16_pts: ks.by_round.R16 || 0,
    QF_pts: ks.by_round.QF || 0, SF_pts: ks.by_round.SF || 0,
    F_pts: ks.by_round.F || 0, W_pts: ks.by_round.W || 0,
    extras_pts: es.total, group_sweeps: gs.sweeps,
    knockout_by_round: ks.by_round,
    details: { groups: gs.details, thirds: ts.details, knockout: ks.details, extras: es.details }
  };
}

function buildLeaderboard(scoredParticipants) {
  var sorted = scoredParticipants.slice().sort(function(a, b) {
    var d = (b.scores.total || 0) - (a.scores.total || 0);
    if (d !== 0) return d;
    d = (b.scores.total_no_extras || 0) - (a.scores.total_no_extras || 0);
    if (d !== 0) return d;
    d = (b.scores.group_pts || 0) - (a.scores.group_pts || 0);
    if (d !== 0) return d;
    d = (b.scores.W_pts || 0) - (a.scores.W_pts || 0);
    if (d !== 0) return d;
    return a.name.localeCompare(b.name);
  });

  var currentRank = 1;
  for (var i = 0; i < sorted.length; i++) {
    if (i > 0) {
      var prev = sorted[i - 1].scores;
      var curr = sorted[i].scores;
      // Only tie if ALL tiebreak fields match
      var tied = curr.total === prev.total
        && curr.total_no_extras === prev.total_no_extras
        && curr.group_pts === prev.group_pts
        && curr.W_pts === prev.W_pts;
      if (!tied) currentRank = i + 1;
    }
    sorted[i].rank = currentRank;
  }
  return sorted;
}
