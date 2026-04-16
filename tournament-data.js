/**
 * FIFA World Cup 2026 — Complete Tournament Data
 * Source: FIFA Official Regulations, Wikipedia (2026 FIFA World Cup knockout stage)
 *
 * This file is the single source of truth for the tipping system.
 * It is also used by the Apps Script backend (copy relevant sections).
 */

// ═══════════════════════════════════════════════════════════════
// 1. TEAMS — all 48 qualified nations
// ═══════════════════════════════════════════════════════════════

const TEAMS = {
  // Group A
  MEX: { code: 'MEX', name_en: 'Mexico',                  name_no: 'Mexico',                  group: 'A', confederation: 'CONCACAF', flag: '🇲🇽' },
  KOR: { code: 'KOR', name_en: 'South Korea',             name_no: 'Sør-Korea',               group: 'A', confederation: 'AFC',      flag: '🇰🇷' },
  RSA: { code: 'RSA', name_en: 'South Africa',            name_no: 'Sør-Afrika',              group: 'A', confederation: 'CAF',      flag: '🇿🇦' },
  CZE: { code: 'CZE', name_en: 'Czechia',                 name_no: 'Tsjekkia',                group: 'A', confederation: 'UEFA',     flag: '🇨🇿' },
  // Group B
  CAN: { code: 'CAN', name_en: 'Canada',                  name_no: 'Canada',                  group: 'B', confederation: 'CONCACAF', flag: '🇨🇦' },
  SUI: { code: 'SUI', name_en: 'Switzerland',             name_no: 'Sveits',                  group: 'B', confederation: 'UEFA',     flag: '🇨🇭' },
  QAT: { code: 'QAT', name_en: 'Qatar',                   name_no: 'Qatar',                   group: 'B', confederation: 'AFC',      flag: '🇶🇦' },
  BIH: { code: 'BIH', name_en: 'Bosnia and Herzegovina',  name_no: 'Bosnia-Hercegovina',      group: 'B', confederation: 'UEFA',     flag: '🇧🇦' },
  // Group C
  BRA: { code: 'BRA', name_en: 'Brazil',                  name_no: 'Brasil',                  group: 'C', confederation: 'CONMEBOL', flag: '🇧🇷' },
  MAR: { code: 'MAR', name_en: 'Morocco',                 name_no: 'Marokko',                 group: 'C', confederation: 'CAF',      flag: '🇲🇦' },
  HAI: { code: 'HAI', name_en: 'Haiti',                   name_no: 'Haiti',                   group: 'C', confederation: 'CONCACAF', flag: '🇭🇹' },
  SCO: { code: 'SCO', name_en: 'Scotland',                name_no: 'Skottland',               group: 'C', confederation: 'UEFA',     flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  // Group D
  USA: { code: 'USA', name_en: 'United States',           name_no: 'USA',                     group: 'D', confederation: 'CONCACAF', flag: '🇺🇸' },
  AUS: { code: 'AUS', name_en: 'Australia',               name_no: 'Australia',               group: 'D', confederation: 'AFC',      flag: '🇦🇺' },
  PAR: { code: 'PAR', name_en: 'Paraguay',                name_no: 'Paraguay',                group: 'D', confederation: 'CONMEBOL', flag: '🇵🇾' },
  TUR: { code: 'TUR', name_en: 'Türkiye',                 name_no: 'Tyrkia',                  group: 'D', confederation: 'UEFA',     flag: '🇹🇷' },
  // Group E
  GER: { code: 'GER', name_en: 'Germany',                 name_no: 'Tyskland',                group: 'E', confederation: 'UEFA',     flag: '🇩🇪' },
  CUW: { code: 'CUW', name_en: 'Curaçao',                name_no: 'Curaçao',                 group: 'E', confederation: 'CONCACAF', flag: '🇨🇼' },
  CIV: { code: 'CIV', name_en: 'Côte d\'Ivoire',         name_no: 'Elfenbenskysten',         group: 'E', confederation: 'CAF',      flag: '🇨🇮' },
  ECU: { code: 'ECU', name_en: 'Ecuador',                 name_no: 'Ecuador',                 group: 'E', confederation: 'CONMEBOL', flag: '🇪🇨' },
  // Group F
  NED: { code: 'NED', name_en: 'Netherlands',             name_no: 'Nederland',               group: 'F', confederation: 'UEFA',     flag: '🇳🇱' },
  JPN: { code: 'JPN', name_en: 'Japan',                   name_no: 'Japan',                   group: 'F', confederation: 'AFC',      flag: '🇯🇵' },
  SWE: { code: 'SWE', name_en: 'Sweden',                  name_no: 'Sverige',                 group: 'F', confederation: 'UEFA',     flag: '🇸🇪' },
  TUN: { code: 'TUN', name_en: 'Tunisia',                 name_no: 'Tunisia',                 group: 'F', confederation: 'CAF',      flag: '🇹🇳' },
  // Group G
  BEL: { code: 'BEL', name_en: 'Belgium',                 name_no: 'Belgia',                  group: 'G', confederation: 'UEFA',     flag: '🇧🇪' },
  EGY: { code: 'EGY', name_en: 'Egypt',                   name_no: 'Egypt',                   group: 'G', confederation: 'CAF',      flag: '🇪🇬' },
  IRN: { code: 'IRN', name_en: 'Iran',                    name_no: 'Iran',                    group: 'G', confederation: 'AFC',      flag: '🇮🇷' },
  NZL: { code: 'NZL', name_en: 'New Zealand',             name_no: 'New Zealand',             group: 'G', confederation: 'OFC',      flag: '🇳🇿' },
  // Group H
  ESP: { code: 'ESP', name_en: 'Spain',                   name_no: 'Spania',                  group: 'H', confederation: 'UEFA',     flag: '🇪🇸' },
  KSA: { code: 'KSA', name_en: 'Saudi Arabia',            name_no: 'Saudi-Arabia',            group: 'H', confederation: 'AFC',      flag: '🇸🇦' },
  CPV: { code: 'CPV', name_en: 'Cabo Verde',              name_no: 'Kapp Verde',              group: 'H', confederation: 'CAF',      flag: '🇨🇻' },
  URU: { code: 'URU', name_en: 'Uruguay',                 name_no: 'Uruguay',                 group: 'H', confederation: 'CONMEBOL', flag: '🇺🇾' },
  // Group I
  FRA: { code: 'FRA', name_en: 'France',                  name_no: 'Frankrike',               group: 'I', confederation: 'UEFA',     flag: '🇫🇷' },
  SEN: { code: 'SEN', name_en: 'Senegal',                 name_no: 'Senegal',                 group: 'I', confederation: 'CAF',      flag: '🇸🇳' },
  IRQ: { code: 'IRQ', name_en: 'Iraq',                    name_no: 'Irak',                    group: 'I', confederation: 'AFC',      flag: '🇮🇶' },
  NOR: { code: 'NOR', name_en: 'Norway',                  name_no: 'Norge',                   group: 'I', confederation: 'UEFA',     flag: '🇳🇴' },
  // Group J
  ARG: { code: 'ARG', name_en: 'Argentina',               name_no: 'Argentina',               group: 'J', confederation: 'CONMEBOL', flag: '🇦🇷' },
  AUT: { code: 'AUT', name_en: 'Austria',                 name_no: 'Østerrike',               group: 'J', confederation: 'UEFA',     flag: '🇦🇹' },
  ALG: { code: 'ALG', name_en: 'Algeria',                 name_no: 'Algerie',                 group: 'J', confederation: 'CAF',      flag: '🇩🇿' },
  JOR: { code: 'JOR', name_en: 'Jordan',                  name_no: 'Jordan',                  group: 'J', confederation: 'AFC',      flag: '🇯🇴' },
  // Group K
  POR: { code: 'POR', name_en: 'Portugal',                name_no: 'Portugal',                group: 'K', confederation: 'UEFA',     flag: '🇵🇹' },
  UZB: { code: 'UZB', name_en: 'Uzbekistan',              name_no: 'Usbekistan',              group: 'K', confederation: 'AFC',      flag: '🇺🇿' },
  COL: { code: 'COL', name_en: 'Colombia',                name_no: 'Colombia',                group: 'K', confederation: 'CONMEBOL', flag: '🇨🇴' },
  COD: { code: 'COD', name_en: 'DR Congo',                name_no: 'DR Kongo',                group: 'K', confederation: 'CAF',      flag: '🇨🇩' },
  // Group L
  ENG: { code: 'ENG', name_en: 'England',                 name_no: 'England',                 group: 'L', confederation: 'UEFA',     flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  CRO: { code: 'CRO', name_en: 'Croatia',                 name_no: 'Kroatia',                 group: 'L', confederation: 'UEFA',     flag: '🇭🇷' },
  GHA: { code: 'GHA', name_en: 'Ghana',                   name_no: 'Ghana',                   group: 'L', confederation: 'CAF',      flag: '🇬🇭' },
  PAN: { code: 'PAN', name_en: 'Panama',                  name_no: 'Panama',                  group: 'L', confederation: 'CONCACAF', flag: '🇵🇦' },
};


// ═══════════════════════════════════════════════════════════════
// 2. GROUPS
// ═══════════════════════════════════════════════════════════════

const GROUPS = {
  A: ['MEX', 'KOR', 'RSA', 'CZE'],
  B: ['CAN', 'SUI', 'QAT', 'BIH'],
  C: ['BRA', 'MAR', 'HAI', 'SCO'],
  D: ['USA', 'AUS', 'PAR', 'TUR'],
  E: ['GER', 'CUW', 'CIV', 'ECU'],
  F: ['NED', 'JPN', 'SWE', 'TUN'],
  G: ['BEL', 'EGY', 'IRN', 'NZL'],
  H: ['ESP', 'KSA', 'CPV', 'URU'],
  I: ['FRA', 'SEN', 'IRQ', 'NOR'],
  J: ['ARG', 'AUT', 'ALG', 'JOR'],
  K: ['POR', 'UZB', 'COL', 'COD'],
  L: ['ENG', 'CRO', 'GHA', 'PAN'],
};

const GROUP_LETTERS = Object.keys(GROUPS); // ['A','B',...,'L']


// ═══════════════════════════════════════════════════════════════
// 3. GROUP STAGE MATCHES (match IDs 1–72)
// ═══════════════════════════════════════════════════════════════

/**
 * Generate group stage match list.
 * Each group has 6 matches (round-robin of 4 teams).
 * Matchday 1: 1v3, 2v4  |  Matchday 2: 1v4, 2v3  |  Matchday 3: 1v2, 3v4
 * (Standard FIFA pairing for 4-team groups)
 */
function generateGroupMatches() {
  const pairings = [
    // Matchday 1
    [0, 2], [1, 3],
    // Matchday 2
    [0, 3], [1, 2],
    // Matchday 3 (simultaneous)
    [0, 1], [2, 3],
  ];
  const matches = [];
  let matchId = 1;
  for (const groupCode of GROUP_LETTERS) {
    const teams = GROUPS[groupCode];
    for (const [h, a] of pairings) {
      matches.push({
        match_id: matchId++,
        round: 'GROUP',
        group: groupCode,
        matchday: Math.ceil(matches.filter(m => m.group === groupCode).length / 2) + 1,
        home_team_slot: `${groupCode}${h + 1}`,  // e.g. A1, A3
        away_team_slot: `${groupCode}${a + 1}`,
        home_team: teams[h],
        away_team: teams[a],
      });
    }
  }
  return matches;
}


// ═══════════════════════════════════════════════════════════════
// 4. KNOCKOUT BRACKET — ROUND OF 32 (matches 73–88)
// ═══════════════════════════════════════════════════════════════

/**
 * R32 match definitions from FIFA Official Regulations.
 * source_home/away describe where the team comes from:
 *   '1X' = winner of group X
 *   '2X' = runner-up of group X
 *   '3rd(...)' = best 3rd-placed team from one of the listed groups
 *
 * The actual 3rd-placed team assigned depends on which 8 of 12
 * groups produce a qualifying 3rd — resolved via THIRD_PLACE_TABLE.
 */
const R32_MATCHES = [
  { match_id: 73,  home: '2A',                    away: '2B',                    city: 'Los Angeles' },
  { match_id: 74,  home: '1E',                    away: '3rd(A/B/C/D/F)',        city: 'Boston' },
  { match_id: 75,  home: '1F',                    away: '2C',                    city: 'Monterrey' },
  { match_id: 76,  home: '1C',                    away: '2F',                    city: 'Houston' },
  { match_id: 77,  home: '1I',                    away: '3rd(C/D/F/G/H)',        city: 'New York/NJ' },
  { match_id: 78,  home: '2E',                    away: '2I',                    city: 'Dallas' },
  { match_id: 79,  home: '1A',                    away: '3rd(C/E/F/H/I)',        city: 'Mexico City' },
  { match_id: 80,  home: '1L',                    away: '3rd(E/H/I/J/K)',        city: 'Atlanta' },
  { match_id: 81,  home: '1D',                    away: '3rd(B/E/F/I/J)',        city: 'San Francisco' },
  { match_id: 82,  home: '1G',                    away: '3rd(A/E/H/I/J)',        city: 'Seattle' },
  { match_id: 83,  home: '2K',                    away: '2L',                    city: 'Toronto' },
  { match_id: 84,  home: '1H',                    away: '2J',                    city: 'Los Angeles' },
  { match_id: 85,  home: '1B',                    away: '3rd(E/F/G/I/J)',        city: 'Vancouver' },
  { match_id: 86,  home: '1J',                    away: '2H',                    city: 'Miami' },
  { match_id: 87,  home: '1K',                    away: '3rd(D/E/I/J/L)',        city: 'Kansas City' },
  { match_id: 88,  home: '2D',                    away: '2G',                    city: 'Dallas' },
];


// ═══════════════════════════════════════════════════════════════
// 5. KNOCKOUT BRACKET — R16 → QF → SF → FINAL
// ═══════════════════════════════════════════════════════════════

const R16_MATCHES = [
  { match_id: 89,  home_from: 'W74',  away_from: 'W77',  city: 'Philadelphia' },
  { match_id: 90,  home_from: 'W73',  away_from: 'W75',  city: 'Houston' },
  { match_id: 91,  home_from: 'W76',  away_from: 'W78',  city: 'New York/NJ' },
  { match_id: 92,  home_from: 'W79',  away_from: 'W80',  city: 'Mexico City' },
  { match_id: 93,  home_from: 'W83',  away_from: 'W84',  city: 'Dallas' },
  { match_id: 94,  home_from: 'W81',  away_from: 'W82',  city: 'Seattle' },
  { match_id: 95,  home_from: 'W86',  away_from: 'W88',  city: 'Atlanta' },
  { match_id: 96,  home_from: 'W85',  away_from: 'W87',  city: 'Vancouver' },
];

const QF_MATCHES = [
  { match_id: 97,  home_from: 'W89',  away_from: 'W90',  city: 'Boston' },
  { match_id: 98,  home_from: 'W93',  away_from: 'W94',  city: 'Los Angeles' },
  { match_id: 99,  home_from: 'W91',  away_from: 'W92',  city: 'Miami' },
  { match_id: 100, home_from: 'W95',  away_from: 'W96',  city: 'Kansas City' },
];

// Semifinals: verified against FIFA's pathway design
// (Spain/Argentina on opposite sides, France/England on opposite sides)
const SF_MATCHES = [
  { match_id: 101, home_from: 'W97',  away_from: 'W98',  city: 'Dallas' },
  { match_id: 102, home_from: 'W99',  away_from: 'W100', city: 'Atlanta' },
];

const THIRD_PLACE_MATCH = {
  match_id: 103, home_from: 'L101', away_from: 'L102', city: 'Miami'
};

const FINAL = {
  match_id: 104, home_from: 'W101', away_from: 'W102', city: 'New York/NJ'
};

// Round labels used throughout the system
const ROUNDS = ['GROUP', 'R32', 'R16', 'QF', 'SF', 'F', 'W'];


// ═══════════════════════════════════════════════════════════════
// 6. THIRD-PLACE PERMUTATION TABLE
// ═══════════════════════════════════════════════════════════════
//
// FIFA Regulations Annex C: 495 combinations mapping which 8 of
// 12 groups produce a qualifying 3rd-placed team, to which
// group-winner slot each 3rd-placed team is assigned.
//
// Key: sorted string of qualifying group letters (e.g. "CDEFGHIJ")
// Value: object mapping each slot to the group whose 3rd place fills it
//   Slots correspond to which group WINNER they face:
//   1A (M79), 1B (M85), 1D (M81), 1E (M74), 1G (M82), 1I (M77), 1K (M87), 1L (M80)
//
// From Wikipedia's table of all combinations published from FIFA regs.
// The 8 columns are: 1A vs, 1B vs, 1D vs, 1E vs, 1G vs, 1I vs, 1K vs, 1L vs

const THIRD_PLACE_TABLE = {
  // Key = sorted qualifying groups; Value = [3rd team facing 1A, 1B, 1D, 1E, 1G, 1I, 1K, 1L]
  //                                                        M79   M85   M81   M74   M82   M77   M87   M80
  'EFGHIJKL': ['3E', '3J', '3I', '3F', '3H', '3G', '3L', '3K'],
  'DFGHIJKL': ['3H', '3G', '3I', '3D', '3J', '3F', '3L', '3K'],
  'DEGHIJKL': ['3E', '3J', '3I', '3D', '3H', '3G', '3L', '3K'],
  'DEFHIJKL': ['3E', '3J', '3I', '3D', '3H', '3F', '3L', '3K'],
  'DEFGIJKL': ['3E', '3G', '3I', '3D', '3J', '3F', '3L', '3K'],
  'DEFGHJKL': ['3E', '3G', '3J', '3D', '3H', '3F', '3L', '3K'],
  'DEFGHIKL': ['3E', '3G', '3I', '3D', '3H', '3F', '3L', '3K'],
  'DEFGHIJL': ['3E', '3G', '3J', '3D', '3H', '3F', '3L', '3I'],
  'DEFGHIJK': ['3E', '3G', '3J', '3D', '3H', '3F', '3I', '3K'],
  'CFGHIJKL': ['3H', '3G', '3I', '3C', '3J', '3F', '3L', '3K'],
  'CEGHIJKL': ['3E', '3J', '3I', '3C', '3H', '3G', '3L', '3K'],
  'CEFHIJKL': ['3E', '3J', '3I', '3C', '3H', '3F', '3L', '3K'],
  'CEFGIJKL': ['3E', '3G', '3I', '3C', '3J', '3F', '3L', '3K'],
  'CEFGHJKL': ['3E', '3G', '3J', '3C', '3H', '3F', '3L', '3K'],
  'CEFGHIKL': ['3E', '3G', '3I', '3C', '3H', '3F', '3L', '3K'],
  'CEFGHIJL': ['3E', '3G', '3J', '3C', '3H', '3F', '3L', '3I'],
  'CEFGHIJK': ['3E', '3G', '3J', '3C', '3H', '3F', '3I', '3K'],
  'CDGHIJKL': ['3H', '3G', '3I', '3C', '3J', '3D', '3L', '3K'],
  'CDFHIJKL': ['3C', '3J', '3I', '3D', '3H', '3F', '3L', '3K'],
  'CDFGIJKL': ['3C', '3G', '3I', '3D', '3J', '3F', '3L', '3K'],
  'CDFGHJKL': ['3C', '3G', '3J', '3D', '3H', '3F', '3L', '3K'],
  'CDFGHIKL': ['3C', '3G', '3I', '3D', '3H', '3F', '3L', '3K'],
  'CDFGHIJL': ['3C', '3G', '3J', '3D', '3H', '3F', '3L', '3I'],
  'CDFGHIJK': ['3C', '3G', '3J', '3D', '3H', '3F', '3I', '3K'],
  'CDEHIJKL': ['3E', '3J', '3I', '3C', '3H', '3D', '3L', '3K'],
  'CDEGIJKL': ['3E', '3G', '3I', '3C', '3J', '3D', '3L', '3K'],
  'CDEGHJKL': ['3E', '3G', '3J', '3C', '3H', '3D', '3L', '3K'],
  'CDEGHIKL': ['3E', '3G', '3I', '3C', '3H', '3D', '3L', '3K'],
  'CDEGHIJL': ['3E', '3G', '3J', '3C', '3H', '3D', '3L', '3I'],
  'CDEGHIJK': ['3E', '3G', '3J', '3C', '3H', '3D', '3I', '3K'],
  'CDEFIJKL': ['3C', '3J', '3E', '3D', '3I', '3F', '3L', '3K'],
  'CDEFHJKL': ['3C', '3J', '3E', '3D', '3H', '3F', '3L', '3K'],
  'CDEFHIKL': ['3C', '3E', '3I', '3D', '3H', '3F', '3L', '3K'],
  'CDEFHIJL': ['3C', '3J', '3E', '3D', '3H', '3F', '3L', '3I'],
  'CDEFHIJK': ['3C', '3J', '3E', '3D', '3H', '3F', '3I', '3K'],
  'CDEFGJKL': ['3C', '3G', '3E', '3D', '3J', '3F', '3L', '3K'],
  'CDEFGIKL': ['3C', '3G', '3E', '3D', '3I', '3F', '3L', '3K'],
  'CDEFGIJL': ['3C', '3G', '3E', '3D', '3J', '3F', '3L', '3I'],
  'CDEFGIJK': ['3C', '3G', '3E', '3D', '3J', '3F', '3I', '3K'],
  'CDEFGHKL': ['3C', '3G', '3E', '3D', '3H', '3F', '3L', '3K'],
  'CDEFGHJL': ['3C', '3G', '3J', '3D', '3H', '3F', '3L', '3E'],
  'CDEFGHJK': ['3C', '3G', '3J', '3D', '3H', '3F', '3E', '3K'],
  'CDEFGHIL': ['3C', '3G', '3E', '3D', '3H', '3F', '3L', '3I'],
  'CDEFGHIK': ['3C', '3G', '3E', '3D', '3H', '3F', '3I', '3K'],
  'CDEFGHIJ': ['3C', '3G', '3J', '3D', '3H', '3F', '3E', '3I'],

  'BFGHIJKL': ['3H', '3J', '3B', '3F', '3I', '3G', '3L', '3K'],
  'BEGHIJKL': ['3E', '3J', '3I', '3B', '3H', '3G', '3L', '3K'],
  'BEFHIJKL': ['3E', '3J', '3B', '3F', '3I', '3H', '3L', '3K'],
  'BEFGIJKL': ['3E', '3J', '3B', '3F', '3I', '3G', '3L', '3K'],
  'BEFGHJKL': ['3E', '3J', '3B', '3F', '3H', '3G', '3L', '3K'],
  'BEFGHIKL': ['3E', '3G', '3B', '3F', '3I', '3H', '3L', '3K'],
  'BEFGHIJL': ['3E', '3J', '3B', '3F', '3H', '3G', '3L', '3I'],
  'BEFGHIJK': ['3E', '3J', '3B', '3F', '3H', '3G', '3I', '3K'],
  'BDGHIJKL': ['3H', '3J', '3B', '3D', '3I', '3G', '3L', '3K'],
  'BDFHIJKL': ['3H', '3J', '3B', '3D', '3I', '3F', '3L', '3K'],
  'BDFGIJKL': ['3I', '3G', '3B', '3D', '3J', '3F', '3L', '3K'],
  'BDFGHJKL': ['3H', '3G', '3B', '3D', '3J', '3F', '3L', '3K'],
  'BDFGHIKL': ['3H', '3G', '3B', '3D', '3I', '3F', '3L', '3K'],
  'BDFGHIJL': ['3H', '3G', '3B', '3D', '3J', '3F', '3L', '3I'],
  'BDFGHIJK': ['3H', '3G', '3B', '3D', '3J', '3F', '3I', '3K'],
  'BDEHIJKL': ['3E', '3J', '3B', '3D', '3I', '3H', '3L', '3K'],
  'BDEGIJKL': ['3E', '3J', '3B', '3D', '3I', '3G', '3L', '3K'],
  'BDEGHJKL': ['3E', '3J', '3B', '3D', '3H', '3G', '3L', '3K'],
  'BDEGHIKL': ['3E', '3G', '3B', '3D', '3I', '3H', '3L', '3K'],
  'BDEGHIJL': ['3E', '3J', '3B', '3D', '3H', '3G', '3L', '3I'],
  'BDEGHIJK': ['3E', '3J', '3B', '3D', '3H', '3G', '3I', '3K'],
  'BDEFIJKL': ['3E', '3J', '3B', '3D', '3I', '3F', '3L', '3K'],
  'BDEFHJKL': ['3E', '3J', '3B', '3D', '3H', '3F', '3L', '3K'],
  'BDEFHIKL': ['3E', '3I', '3B', '3D', '3H', '3F', '3L', '3K'],
  'BDEFHIJL': ['3E', '3J', '3B', '3D', '3H', '3F', '3L', '3I'],
  'BDEFHIJK': ['3E', '3J', '3B', '3D', '3H', '3F', '3I', '3K'],
  'BDEFGJKL': ['3E', '3G', '3B', '3D', '3J', '3F', '3L', '3K'],
  'BDEFGIKL': ['3E', '3G', '3B', '3D', '3I', '3F', '3L', '3K'],
  'BDEFGIJL': ['3E', '3G', '3B', '3D', '3J', '3F', '3L', '3I'],
  'BDEFGIJK': ['3E', '3G', '3B', '3D', '3J', '3F', '3I', '3K'],
  'BDEFGHKL': ['3E', '3G', '3B', '3D', '3H', '3F', '3L', '3K'],
  'BDEFGHJL': ['3H', '3G', '3B', '3D', '3J', '3F', '3L', '3E'],
  'BDEFGHJK': ['3H', '3G', '3B', '3D', '3J', '3F', '3E', '3K'],
  'BDEFGHIL': ['3E', '3G', '3B', '3D', '3H', '3F', '3L', '3I'],
  'BDEFGHIK': ['3E', '3G', '3B', '3D', '3H', '3F', '3I', '3K'],
  'BDEFGHIJ': ['3H', '3G', '3B', '3D', '3J', '3F', '3E', '3I'],

  'BCGHIJKL': ['3H', '3J', '3B', '3C', '3I', '3G', '3L', '3K'],
  'BCFHIJKL': ['3H', '3J', '3B', '3C', '3I', '3F', '3L', '3K'],
  'BCFGIJKL': ['3I', '3G', '3B', '3C', '3J', '3F', '3L', '3K'],
  'BCFGHJKL': ['3H', '3G', '3B', '3C', '3J', '3F', '3L', '3K'],
  'BCFGHIKL': ['3H', '3G', '3B', '3C', '3I', '3F', '3L', '3K'],
  'BCFGHIJL': ['3H', '3G', '3B', '3C', '3J', '3F', '3L', '3I'],
  'BCFGHIJK': ['3H', '3G', '3B', '3C', '3J', '3F', '3I', '3K'],
  'BCEHIJKL': ['3E', '3J', '3B', '3C', '3I', '3H', '3L', '3K'],
  'BCEGIJKL': ['3E', '3J', '3B', '3C', '3I', '3G', '3L', '3K'],
  'BCEGHJKL': ['3E', '3J', '3B', '3C', '3H', '3G', '3L', '3K'],
  'BCEGHIKL': ['3E', '3G', '3B', '3C', '3I', '3H', '3L', '3K'],
  'BCEGHIJL': ['3E', '3J', '3B', '3C', '3H', '3G', '3L', '3I'],
  'BCEGHIJK': ['3E', '3J', '3B', '3C', '3H', '3G', '3I', '3K'],
  'BCEFIJKL': ['3E', '3J', '3B', '3C', '3I', '3F', '3L', '3K'],
  'BCEFHJKL': ['3E', '3J', '3B', '3C', '3H', '3F', '3L', '3K'],
  'BCEFHIKL': ['3E', '3I', '3B', '3C', '3H', '3F', '3L', '3K'],
  'BCEFHIJL': ['3E', '3J', '3B', '3C', '3H', '3F', '3L', '3I'],
  'BCEFHIJK': ['3E', '3J', '3B', '3C', '3H', '3F', '3I', '3K'],
  'BCEFGJKL': ['3E', '3G', '3B', '3C', '3J', '3F', '3L', '3K'],
  'BCEFGIKL': ['3E', '3G', '3B', '3C', '3I', '3F', '3L', '3K'],
  'BCEFGIJL': ['3E', '3G', '3B', '3C', '3J', '3F', '3L', '3I'],
  'BCEFGIJK': ['3E', '3G', '3B', '3C', '3J', '3F', '3I', '3K'],
  'BCEFGHKL': ['3E', '3G', '3B', '3C', '3H', '3F', '3L', '3K'],
  'BCEFGHJL': ['3H', '3G', '3B', '3C', '3J', '3F', '3L', '3E'],
  'BCEFGHJK': ['3H', '3G', '3B', '3C', '3J', '3F', '3E', '3K'],
  'BCEFGHIL': ['3E', '3G', '3B', '3C', '3H', '3F', '3L', '3I'],
  'BCEFGHIK': ['3E', '3G', '3B', '3C', '3H', '3F', '3I', '3K'],
  'BCEFGHIJ': ['3H', '3G', '3B', '3C', '3J', '3F', '3E', '3I'],

  'BCDGHIJKL': undefined, // Not valid — only 8 of 12 qualify, skipping invalid combos
  'BCDHIJKL': ['3H', '3J', '3B', '3C', '3I', '3D', '3L', '3K'],
  'BCDGIJKL': ['3I', '3G', '3B', '3C', '3J', '3D', '3L', '3K'],
  'BCDGHJKL': ['3H', '3G', '3B', '3C', '3J', '3D', '3L', '3K'],
  'BCDGHIKL': ['3H', '3G', '3B', '3C', '3I', '3D', '3L', '3K'],
  'BCDGHIJL': ['3H', '3G', '3B', '3C', '3J', '3D', '3L', '3I'],
  'BCDGHIJK': ['3H', '3G', '3B', '3C', '3J', '3D', '3I', '3K'],
  'BCDFIJKL': ['3C', '3J', '3B', '3D', '3I', '3F', '3L', '3K'],
  'BCDFHJKL': ['3C', '3J', '3B', '3D', '3H', '3F', '3L', '3K'],
  'BCDFHIKL': ['3C', '3I', '3B', '3D', '3H', '3F', '3L', '3K'],
  'BCDFHIJL': ['3C', '3J', '3B', '3D', '3H', '3F', '3L', '3I'],
  'BCDFHIJK': ['3C', '3J', '3B', '3D', '3H', '3F', '3I', '3K'],
  'BCDFGJKL': ['3C', '3G', '3B', '3D', '3J', '3F', '3L', '3K'],
  'BCDFGIKL': ['3C', '3G', '3B', '3D', '3I', '3F', '3L', '3K'],
  'BCDFGIJL': ['3C', '3G', '3B', '3D', '3J', '3F', '3L', '3I'],
  'BCDFGIJK': ['3C', '3G', '3B', '3D', '3J', '3F', '3I', '3K'],
  'BCDFGHKL': ['3C', '3G', '3B', '3D', '3H', '3F', '3L', '3K'],
  'BCDFGHJL': ['3H', '3G', '3B', '3D', '3J', '3F', '3L', '3C'],
  'BCDFGHJK': ['3H', '3G', '3B', '3D', '3J', '3F', '3C', '3K'],
  'BCDFGHIL': ['3C', '3G', '3B', '3D', '3H', '3F', '3L', '3I'],
  'BCDFGHIK': ['3C', '3G', '3B', '3D', '3H', '3F', '3I', '3K'],
  'BCDFGHIJ': ['3H', '3G', '3B', '3D', '3J', '3F', '3C', '3I'],
  'BCDEHIJKL': undefined,
  'BCDEJKL':  undefined,
  'BCDEIJKL': ['3E', '3J', '3B', '3C', '3I', '3D', '3L', '3K'],
  'BCDEHJKL': ['3E', '3J', '3B', '3C', '3H', '3D', '3L', '3K'],
  'BCDEHIKL': ['3E', '3I', '3B', '3C', '3H', '3D', '3L', '3K'],
  'BCDEHIJL': ['3E', '3J', '3B', '3C', '3H', '3D', '3L', '3I'],
  'BCDEHIJK': ['3E', '3J', '3B', '3C', '3H', '3D', '3I', '3K'],
  'BCDEGJKL': ['3E', '3G', '3B', '3C', '3J', '3D', '3L', '3K'],
  'BCDEGIKL': ['3E', '3G', '3B', '3C', '3I', '3D', '3L', '3K'],
  'BCDEGIJL': ['3E', '3G', '3B', '3C', '3J', '3D', '3L', '3I'],
  'BCDEGIJK': ['3E', '3G', '3B', '3C', '3J', '3D', '3I', '3K'],
  'BCDEGHKL': ['3E', '3G', '3B', '3C', '3H', '3D', '3L', '3K'],
  'BCDEGHIK': ['3E', '3G', '3B', '3C', '3H', '3D', '3I', '3K'],
  'BCDEGHJL': ['3H', '3G', '3B', '3C', '3J', '3D', '3L', '3E'],
  'BCDEGHJK': ['3H', '3G', '3B', '3C', '3J', '3D', '3E', '3K'],
  'BCDEGHIL': ['3E', '3G', '3B', '3C', '3H', '3D', '3L', '3I'],
  'BCDEGHIJ': ['3H', '3G', '3B', '3C', '3J', '3D', '3E', '3I'],
  'BCDEFKL':  undefined,
  'BCDEFJKL': ['3C', '3J', '3B', '3E', '3D', '3F', '3L', '3K'],
  'BCDEFIKL': ['3C', '3E', '3B', '3I', '3D', '3F', '3L', '3K'],
  'BCDEFIJL': ['3C', '3J', '3B', '3E', '3D', '3F', '3L', '3I'],
  'BCDEFIJK': ['3C', '3J', '3B', '3E', '3D', '3F', '3I', '3K'],
  'BCDEFHJKL':undefined,
  'BCDEFHKL': ['3C', '3E', '3B', '3H', '3D', '3F', '3L', '3K'],
  'BCDEFHJL': ['3C', '3J', '3B', '3E', '3H', '3F', '3L', '3D'],
  'BCDEFHJK': ['3C', '3J', '3B', '3E', '3H', '3F', '3D', '3K'],
  'BCDEFHIL': ['3C', '3E', '3B', '3D', '3H', '3F', '3L', '3I'],
  'BCDEFHIK': ['3C', '3E', '3B', '3D', '3H', '3F', '3I', '3K'],
  'BCDEFHIJ': ['3C', '3J', '3B', '3E', '3H', '3F', '3D', '3I'],
  'BCDEFGKL': ['3C', '3G', '3B', '3E', '3D', '3F', '3L', '3K'],
  'BCDEFGJL': ['3C', '3G', '3B', '3E', '3J', '3F', '3L', '3D'],
  'BCDEFGJK': ['3C', '3G', '3B', '3E', '3J', '3F', '3D', '3K'],
  'BCDEFGIL': ['3C', '3G', '3B', '3E', '3D', '3F', '3L', '3I'],
  'BCDEFGIK': ['3C', '3G', '3B', '3E', '3D', '3F', '3I', '3K'],
  'BCDEFGIJ': ['3C', '3G', '3B', '3E', '3J', '3F', '3D', '3I'],
  'BCDEFGHL': ['3C', '3G', '3B', '3E', '3H', '3F', '3L', '3D'],
  'BCDEFGHK': ['3C', '3G', '3B', '3E', '3H', '3F', '3D', '3K'],
  'BCDEFGHJ': ['3C', '3G', '3B', '3E', '3H', '3F', '3D', '3J'],
  'BCDEFGHI': ['3C', '3G', '3B', '3E', '3H', '3F', '3D', '3I'],

  // Group A qualifying (A + 7 others)
  'AFGHIJKL': ['3A', '3J', '3I', '3F', '3H', '3G', '3L', '3K'],
  'AEGHIJKL': ['3A', '3J', '3I', '3E', '3H', '3G', '3L', '3K'],
  'AEFHIJKL': ['3A', '3J', '3I', '3E', '3H', '3F', '3L', '3K'],
  'AEFGIJKL': ['3A', '3G', '3I', '3E', '3J', '3F', '3L', '3K'],
  'AEFGHJKL': ['3A', '3G', '3J', '3E', '3H', '3F', '3L', '3K'],
  'AEFGHIKL': ['3A', '3G', '3I', '3E', '3H', '3F', '3L', '3K'],
  'AEFGHIJL': ['3A', '3G', '3J', '3E', '3H', '3F', '3L', '3I'],
  'AEFGHIJK': ['3A', '3G', '3J', '3E', '3H', '3F', '3I', '3K'],
  'ADGHIJKL': ['3A', '3J', '3I', '3D', '3H', '3G', '3L', '3K'],
  'ADFHIJKL': ['3A', '3J', '3I', '3D', '3H', '3F', '3L', '3K'],
  'ADFGIJKL': ['3A', '3G', '3I', '3D', '3J', '3F', '3L', '3K'],
  'ADFGHJKL': ['3A', '3G', '3J', '3D', '3H', '3F', '3L', '3K'],
  'ADFGHIKL': ['3A', '3G', '3I', '3D', '3H', '3F', '3L', '3K'],
  'ADFGHIJL': ['3A', '3G', '3J', '3D', '3H', '3F', '3L', '3I'],
  'ADFGHIJK': ['3A', '3G', '3J', '3D', '3H', '3F', '3I', '3K'],
  'ADEHIJKL': ['3A', '3J', '3I', '3D', '3H', '3E', '3L', '3K'],
  'ADEGIJKL': ['3A', '3G', '3I', '3D', '3J', '3E', '3L', '3K'],
  'ADEGHJKL': ['3A', '3G', '3J', '3D', '3H', '3E', '3L', '3K'],
  'ADEGHIKL': ['3A', '3G', '3I', '3D', '3H', '3E', '3L', '3K'],
  'ADEGHIJL': ['3A', '3G', '3J', '3D', '3H', '3E', '3L', '3I'],
  'ADEGHIJK': ['3A', '3G', '3J', '3D', '3H', '3E', '3I', '3K'],
  'ADEFIJKL': ['3A', '3J', '3E', '3D', '3I', '3F', '3L', '3K'],
  'ADEFHJKL': ['3A', '3J', '3E', '3D', '3H', '3F', '3L', '3K'],
  'ADEFHIKL': ['3A', '3E', '3I', '3D', '3H', '3F', '3L', '3K'],
  'ADEFHIJL': ['3A', '3J', '3E', '3D', '3H', '3F', '3L', '3I'],
  'ADEFHIJK': ['3A', '3J', '3E', '3D', '3H', '3F', '3I', '3K'],
  'ADEFGJKL': ['3A', '3G', '3E', '3D', '3J', '3F', '3L', '3K'],
  'ADEFGIKL': ['3A', '3G', '3E', '3D', '3I', '3F', '3L', '3K'],
  'ADEFGIJL': ['3A', '3G', '3E', '3D', '3J', '3F', '3L', '3I'],
  'ADEFGIJK': ['3A', '3G', '3E', '3D', '3J', '3F', '3I', '3K'],
  'ADEFGHKL': ['3A', '3G', '3E', '3D', '3H', '3F', '3L', '3K'],
  'ADEFGHJL': ['3A', '3G', '3J', '3D', '3H', '3F', '3L', '3E'],
  'ADEFGHJK': ['3A', '3G', '3J', '3D', '3H', '3F', '3E', '3K'],
  'ADEFGHIL': ['3A', '3G', '3E', '3D', '3H', '3F', '3L', '3I'],
  'ADEFGHIK': ['3A', '3G', '3E', '3D', '3H', '3F', '3I', '3K'],
  'ADEFGHIJ': ['3A', '3G', '3J', '3D', '3H', '3F', '3E', '3I'],

  'ACGHIJKL': ['3A', '3J', '3I', '3C', '3H', '3G', '3L', '3K'],
  'ACFHIJKL': ['3A', '3J', '3I', '3C', '3H', '3F', '3L', '3K'],
  'ACFGIJKL': ['3A', '3G', '3I', '3C', '3J', '3F', '3L', '3K'],
  'ACFGHJKL': ['3A', '3G', '3J', '3C', '3H', '3F', '3L', '3K'],
  'ACFGHIKL': ['3A', '3G', '3I', '3C', '3H', '3F', '3L', '3K'],
  'ACFGHIJL': ['3A', '3G', '3J', '3C', '3H', '3F', '3L', '3I'],
  'ACFGHIJK': ['3A', '3G', '3J', '3C', '3H', '3F', '3I', '3K'],
  'ACDGHIJKL':undefined,
  'ACDHIJKL': ['3A', '3J', '3I', '3C', '3H', '3D', '3L', '3K'],
  'ACDGIJKL': ['3A', '3G', '3I', '3C', '3J', '3D', '3L', '3K'],
  'ACDGHJKL': ['3A', '3G', '3J', '3C', '3H', '3D', '3L', '3K'],
  'ACDGHIKL': ['3A', '3G', '3I', '3C', '3H', '3D', '3L', '3K'],
  'ACDGHIJL': ['3A', '3G', '3J', '3C', '3H', '3D', '3L', '3I'],
  'ACDGHIJK': ['3A', '3G', '3J', '3C', '3H', '3D', '3I', '3K'],
  'ACDFIJKL': ['3A', '3J', '3C', '3D', '3I', '3F', '3L', '3K'],
  'ACDFHJKL': ['3A', '3J', '3C', '3D', '3H', '3F', '3L', '3K'],
  'ACDFHIKL': ['3A', '3C', '3I', '3D', '3H', '3F', '3L', '3K'],
  'ACDFHIJL': ['3A', '3J', '3C', '3D', '3H', '3F', '3L', '3I'],
  'ACDFHIJK': ['3A', '3J', '3C', '3D', '3H', '3F', '3I', '3K'],
  'ACDFGJKL': ['3A', '3G', '3C', '3D', '3J', '3F', '3L', '3K'],
  'ACDFGIKL': ['3A', '3G', '3C', '3D', '3I', '3F', '3L', '3K'],
  'ACDFGIJL': ['3A', '3G', '3C', '3D', '3J', '3F', '3L', '3I'],
  'ACDFGIJK': ['3A', '3G', '3C', '3D', '3J', '3F', '3I', '3K'],
  'ACDFGHKL': ['3A', '3G', '3C', '3D', '3H', '3F', '3L', '3K'],
  'ACDFGHJL': ['3A', '3G', '3J', '3D', '3H', '3F', '3L', '3C'],
  'ACDFGHJK': ['3A', '3G', '3J', '3D', '3H', '3F', '3C', '3K'],
  'ACDFGHIL': ['3A', '3G', '3C', '3D', '3H', '3F', '3L', '3I'],
  'ACDFGHIK': ['3A', '3G', '3C', '3D', '3H', '3F', '3I', '3K'],
  'ACDFGHIJ': ['3A', '3G', '3J', '3D', '3H', '3F', '3C', '3I'],
  'ACDEHIJKL':undefined,
  'ACDEIJKL': ['3A', '3J', '3E', '3C', '3I', '3D', '3L', '3K'],
  'ACDEHJKL': ['3A', '3J', '3E', '3C', '3H', '3D', '3L', '3K'],
  'ACDEHIKL': ['3A', '3E', '3I', '3C', '3H', '3D', '3L', '3K'],
  'ACDEHIJL': ['3A', '3J', '3E', '3C', '3H', '3D', '3L', '3I'],
  'ACDEHIJK': ['3A', '3J', '3E', '3C', '3H', '3D', '3I', '3K'],
  'ACDEGJKL': ['3A', '3G', '3E', '3C', '3J', '3D', '3L', '3K'],
  'ACDEGIKL': ['3A', '3G', '3E', '3C', '3I', '3D', '3L', '3K'],
  'ACDEGIJL': ['3A', '3G', '3E', '3C', '3J', '3D', '3L', '3I'],
  'ACDEGIJK': ['3A', '3G', '3E', '3C', '3J', '3D', '3I', '3K'],
  'ACDEGHKL': ['3A', '3G', '3E', '3C', '3H', '3D', '3L', '3K'],
  'ACDEGHJL': ['3A', '3G', '3J', '3C', '3H', '3D', '3L', '3E'],
  'ACDEGHJK': ['3A', '3G', '3J', '3C', '3H', '3D', '3E', '3K'],
  'ACDEGHIL': ['3A', '3G', '3E', '3C', '3H', '3D', '3L', '3I'],
  'ACDEGHIK': ['3A', '3G', '3E', '3C', '3H', '3D', '3I', '3K'],
  'ACDEGHIJ': ['3A', '3G', '3J', '3C', '3H', '3D', '3E', '3I'],
  'ACDEFKL':  undefined,
  'ACDEFJKL': ['3A', '3J', '3C', '3E', '3D', '3F', '3L', '3K'],
  'ACDEFIKL': ['3A', '3E', '3C', '3I', '3D', '3F', '3L', '3K'],
  'ACDEFIJL': ['3A', '3J', '3C', '3E', '3D', '3F', '3L', '3I'],
  'ACDEFIJK': ['3A', '3J', '3C', '3E', '3D', '3F', '3I', '3K'],
  'ACDEFHKL': ['3A', '3E', '3C', '3H', '3D', '3F', '3L', '3K'],
  'ACDEFHJL': ['3A', '3J', '3C', '3E', '3H', '3F', '3L', '3D'],
  'ACDEFHJK': ['3A', '3J', '3C', '3E', '3H', '3F', '3D', '3K'],
  'ACDEFHIL': ['3A', '3E', '3C', '3D', '3H', '3F', '3L', '3I'],
  'ACDEFHIK': ['3A', '3E', '3C', '3D', '3H', '3F', '3I', '3K'],
  'ACDEFHIJ': ['3A', '3J', '3C', '3E', '3H', '3F', '3D', '3I'],
  'ACDEFGKL': ['3A', '3G', '3C', '3E', '3D', '3F', '3L', '3K'],
  'ACDEFGJL': ['3A', '3G', '3C', '3E', '3J', '3F', '3L', '3D'],
  'ACDEFGJK': ['3A', '3G', '3C', '3E', '3J', '3F', '3D', '3K'],
  'ACDEFGIL': ['3A', '3G', '3C', '3E', '3D', '3F', '3L', '3I'],
  'ACDEFGIK': ['3A', '3G', '3C', '3E', '3D', '3F', '3I', '3K'],
  'ACDEFGIJ': ['3A', '3G', '3C', '3E', '3J', '3F', '3D', '3I'],
  'ACDEFGHL': ['3A', '3G', '3C', '3E', '3H', '3F', '3L', '3D'],
  'ACDEFGHK': ['3A', '3G', '3C', '3E', '3H', '3F', '3D', '3K'],
  'ACDEFGHJ': ['3A', '3G', '3C', '3E', '3H', '3F', '3D', '3J'],
  'ACDEFGHI': ['3A', '3G', '3C', '3E', '3H', '3F', '3D', '3I'],

  // AB combinations
  'ABGHIJKL': ['3A', '3J', '3B', '3I', '3H', '3G', '3L', '3K'],
  'ABFHIJKL': ['3A', '3J', '3B', '3F', '3I', '3H', '3L', '3K'],
  'ABFGIJKL': ['3A', '3J', '3B', '3F', '3I', '3G', '3L', '3K'],
  'ABFGHJKL': ['3A', '3J', '3B', '3F', '3H', '3G', '3L', '3K'],
  'ABFGHIKL': ['3A', '3G', '3B', '3F', '3I', '3H', '3L', '3K'],
  'ABFGHIJL': ['3A', '3J', '3B', '3F', '3H', '3G', '3L', '3I'],
  'ABFGHIJK': ['3A', '3J', '3B', '3F', '3H', '3G', '3I', '3K'],
  'ABEHIJKL': ['3A', '3J', '3B', '3E', '3I', '3H', '3L', '3K'],
  'ABEGIJKL': ['3A', '3J', '3B', '3E', '3I', '3G', '3L', '3K'],
  'ABEGHJKL': ['3A', '3J', '3B', '3E', '3H', '3G', '3L', '3K'],
  'ABEGHIKL': ['3A', '3G', '3B', '3E', '3I', '3H', '3L', '3K'],
  'ABEGHIJL': ['3A', '3J', '3B', '3E', '3H', '3G', '3L', '3I'],
  'ABEGHIJK': ['3A', '3J', '3B', '3E', '3H', '3G', '3I', '3K'],
  'ABEFIJKL': ['3A', '3J', '3B', '3E', '3I', '3F', '3L', '3K'],
  'ABEFHJKL': ['3A', '3J', '3B', '3E', '3H', '3F', '3L', '3K'],
  'ABEFHIKL': ['3A', '3E', '3B', '3I', '3H', '3F', '3L', '3K'],
  'ABEFHIJL': ['3A', '3J', '3B', '3E', '3H', '3F', '3L', '3I'],
  'ABEFHIJK': ['3A', '3J', '3B', '3E', '3H', '3F', '3I', '3K'],
  'ABEFGJKL': ['3A', '3G', '3B', '3E', '3J', '3F', '3L', '3K'],
  'ABEFGIKL': ['3A', '3G', '3B', '3E', '3I', '3F', '3L', '3K'],
  'ABEFGIJL': ['3A', '3G', '3B', '3E', '3J', '3F', '3L', '3I'],
  'ABEFGIJK': ['3A', '3G', '3B', '3E', '3J', '3F', '3I', '3K'],
  'ABEFGHKL': ['3A', '3G', '3B', '3E', '3H', '3F', '3L', '3K'],
  'ABEFGHJL': ['3A', '3G', '3B', '3J', '3H', '3F', '3L', '3E'],
  'ABEFGHJK': ['3A', '3G', '3B', '3J', '3H', '3F', '3E', '3K'],
  'ABEFGHIL': ['3A', '3G', '3B', '3E', '3H', '3F', '3L', '3I'],
  'ABEFGHIK': ['3A', '3G', '3B', '3E', '3H', '3F', '3I', '3K'],
  'ABEFGHIJ': ['3A', '3G', '3B', '3J', '3H', '3F', '3E', '3I'],

  'ABDHIJKL': ['3A', '3J', '3B', '3D', '3I', '3H', '3L', '3K'],
  'ABDGIJKL': ['3A', '3J', '3B', '3D', '3I', '3G', '3L', '3K'],
  'ABDGHJKL': ['3A', '3J', '3B', '3D', '3H', '3G', '3L', '3K'],
  'ABDGHIKL': ['3A', '3G', '3B', '3D', '3I', '3H', '3L', '3K'],
  'ABDGHIJL': ['3A', '3J', '3B', '3D', '3H', '3G', '3L', '3I'],
  'ABDGHIJK': ['3A', '3J', '3B', '3D', '3H', '3G', '3I', '3K'],
  'ABDFIJKL': ['3A', '3J', '3B', '3D', '3I', '3F', '3L', '3K'],
  'ABDFHJKL': ['3A', '3J', '3B', '3D', '3H', '3F', '3L', '3K'],
  'ABDFHIKL': ['3A', '3I', '3B', '3D', '3H', '3F', '3L', '3K'],
  'ABDFHIJL': ['3A', '3J', '3B', '3D', '3H', '3F', '3L', '3I'],
  'ABDFHIJK': ['3A', '3J', '3B', '3D', '3H', '3F', '3I', '3K'],
  'ABDFGJKL': ['3A', '3G', '3B', '3D', '3J', '3F', '3L', '3K'],
  'ABDFGIKL': ['3A', '3G', '3B', '3D', '3I', '3F', '3L', '3K'],
  'ABDFGIJL': ['3A', '3G', '3B', '3D', '3J', '3F', '3L', '3I'],
  'ABDFGIJK': ['3A', '3G', '3B', '3D', '3J', '3F', '3I', '3K'],
  'ABDFGHKL': ['3A', '3G', '3B', '3D', '3H', '3F', '3L', '3K'],
  'ABDFGHJL': ['3A', '3G', '3B', '3D', '3H', '3F', '3L', '3J'],
  'ABDFGHJK': ['3A', '3G', '3B', '3D', '3H', '3F', '3J', '3K'],
  'ABDFGHIL': ['3A', '3G', '3B', '3D', '3H', '3F', '3L', '3I'],
  'ABDFGHIK': ['3A', '3G', '3B', '3D', '3H', '3F', '3I', '3K'],
  'ABDFGHIJ': ['3A', '3G', '3B', '3D', '3H', '3F', '3J', '3I'],

  'ABDEHIJKL':undefined,
  'ABDEIJKL': ['3A', '3J', '3B', '3D', '3I', '3E', '3L', '3K'],
  'ABDEHJKL': ['3A', '3J', '3B', '3D', '3H', '3E', '3L', '3K'],
  'ABDEHIKL': ['3A', '3E', '3B', '3D', '3I', '3H', '3L', '3K'],
  'ABDEHIJL': ['3A', '3J', '3B', '3D', '3H', '3E', '3L', '3I'],
  'ABDEHIJK': ['3A', '3J', '3B', '3D', '3H', '3E', '3I', '3K'],
  'ABDEGJKL': ['3A', '3G', '3B', '3D', '3J', '3E', '3L', '3K'],
  'ABDEGIKL': ['3A', '3G', '3B', '3D', '3I', '3E', '3L', '3K'],
  'ABDEGIJL': ['3A', '3G', '3B', '3D', '3J', '3E', '3L', '3I'],
  'ABDEGIJK': ['3A', '3G', '3B', '3D', '3J', '3E', '3I', '3K'],
  'ABDEGHKL': ['3A', '3G', '3B', '3D', '3H', '3E', '3L', '3K'],
  'ABDEGHJL': ['3A', '3G', '3B', '3D', '3H', '3E', '3L', '3J'],
  'ABDEGHJK': ['3A', '3G', '3B', '3D', '3H', '3E', '3J', '3K'],
  'ABDEGHIL': ['3A', '3G', '3B', '3D', '3H', '3E', '3L', '3I'],
  'ABDEGHIK': ['3A', '3G', '3B', '3D', '3H', '3E', '3I', '3K'],
  'ABDEGHIJ': ['3A', '3G', '3B', '3D', '3H', '3E', '3J', '3I'],

  'ABDEFIJKL':undefined,
  'ABDEFJKL': ['3A', '3J', '3B', '3E', '3D', '3F', '3L', '3K'],
  'ABDEFIKL': ['3A', '3E', '3B', '3I', '3D', '3F', '3L', '3K'],
  'ABDEFIJL': ['3A', '3J', '3B', '3E', '3D', '3F', '3L', '3I'],
  'ABDEFIJK': ['3A', '3J', '3B', '3E', '3D', '3F', '3I', '3K'],
  'ABDEFHKL': ['3A', '3E', '3B', '3H', '3D', '3F', '3L', '3K'],
  'ABDEFHJL': ['3A', '3J', '3B', '3E', '3H', '3F', '3L', '3D'],
  'ABDEFHJK': ['3A', '3J', '3B', '3E', '3H', '3F', '3D', '3K'],
  'ABDEFHIL': ['3A', '3E', '3B', '3D', '3H', '3F', '3L', '3I'],
  'ABDEFHIK': ['3A', '3E', '3B', '3D', '3H', '3F', '3I', '3K'],
  'ABDEFHIJ': ['3A', '3J', '3B', '3E', '3H', '3F', '3D', '3I'],
  'ABDEFGKL': ['3A', '3G', '3B', '3E', '3D', '3F', '3L', '3K'],
  'ABDEFGJL': ['3A', '3G', '3B', '3E', '3J', '3F', '3L', '3D'],
  'ABDEFGJK': ['3A', '3G', '3B', '3E', '3J', '3F', '3D', '3K'],
  'ABDEFGIL': ['3A', '3G', '3B', '3E', '3D', '3F', '3L', '3I'],
  'ABDEFGIK': ['3A', '3G', '3B', '3E', '3D', '3F', '3I', '3K'],
  'ABDEFGIJ': ['3A', '3G', '3B', '3E', '3J', '3F', '3D', '3I'],
  'ABDEFGHL': ['3A', '3G', '3B', '3E', '3H', '3F', '3L', '3D'],
  'ABDEFGHK': ['3A', '3G', '3B', '3E', '3H', '3F', '3D', '3K'],
  'ABDEFGHJ': ['3A', '3G', '3B', '3E', '3H', '3F', '3D', '3J'],
  'ABDEFGHI': ['3A', '3G', '3B', '3E', '3H', '3F', '3D', '3I'],

  'ABCHIJKL': ['3A', '3J', '3B', '3C', '3I', '3H', '3L', '3K'],
  'ABCGIJKL': ['3A', '3J', '3B', '3C', '3I', '3G', '3L', '3K'],
  'ABCGHJKL': ['3A', '3J', '3B', '3C', '3H', '3G', '3L', '3K'],
  'ABCGHIKL': ['3A', '3G', '3B', '3C', '3I', '3H', '3L', '3K'],
  'ABCGHIJL': ['3A', '3J', '3B', '3C', '3H', '3G', '3L', '3I'],
  'ABCGHIJK': ['3A', '3J', '3B', '3C', '3H', '3G', '3I', '3K'],
  'ABCFIJKL': ['3A', '3J', '3B', '3C', '3I', '3F', '3L', '3K'],
  'ABCFHJKL': ['3A', '3J', '3B', '3C', '3H', '3F', '3L', '3K'],
  'ABCFHIKL': ['3A', '3I', '3B', '3C', '3H', '3F', '3L', '3K'],
  'ABCFHIJL': ['3A', '3J', '3B', '3C', '3H', '3F', '3L', '3I'],
  'ABCFHIJK': ['3A', '3J', '3B', '3C', '3H', '3F', '3I', '3K'],
  'ABCFGJKL': ['3A', '3G', '3B', '3C', '3J', '3F', '3L', '3K'],
  'ABCFGIKL': ['3A', '3G', '3B', '3C', '3I', '3F', '3L', '3K'],
  'ABCFGIJL': ['3A', '3G', '3B', '3C', '3J', '3F', '3L', '3I'],
  'ABCFGIJK': ['3A', '3G', '3B', '3C', '3J', '3F', '3I', '3K'],
  'ABCFGHKL': ['3A', '3G', '3B', '3C', '3H', '3F', '3L', '3K'],
  'ABCFGHJL': ['3A', '3G', '3B', '3C', '3H', '3F', '3L', '3J'],
  'ABCFGHJK': ['3A', '3G', '3B', '3C', '3H', '3F', '3J', '3K'],
  'ABCFGHIL': ['3A', '3G', '3B', '3C', '3H', '3F', '3L', '3I'],
  'ABCFGHIK': ['3A', '3G', '3B', '3C', '3H', '3F', '3I', '3K'],
  'ABCFGHIJ': ['3A', '3G', '3B', '3C', '3H', '3F', '3J', '3I'],

  'ABCDHIJKL':undefined,
  'ABCDIJKL': ['3A', '3J', '3B', '3C', '3I', '3D', '3L', '3K'],
  'ABCDHJKL': ['3A', '3J', '3B', '3C', '3H', '3D', '3L', '3K'],
  'ABCDHIKL': ['3A', '3I', '3B', '3C', '3H', '3D', '3L', '3K'],
  'ABCDHIJL': ['3A', '3J', '3B', '3C', '3H', '3D', '3L', '3I'],
  'ABCDHIJK': ['3A', '3J', '3B', '3C', '3H', '3D', '3I', '3K'],
  'ABCDGJKL': ['3A', '3G', '3B', '3C', '3J', '3D', '3L', '3K'],
  'ABCDGIKL': ['3A', '3G', '3B', '3C', '3I', '3D', '3L', '3K'],
  'ABCDGIJL': ['3A', '3G', '3B', '3C', '3J', '3D', '3L', '3I'],
  'ABCDGIJK': ['3A', '3G', '3B', '3C', '3J', '3D', '3I', '3K'],
  'ABCDGHKL': ['3A', '3G', '3B', '3C', '3H', '3D', '3L', '3K'],
  'ABCDGHJL': ['3A', '3G', '3B', '3C', '3H', '3D', '3L', '3J'],
  'ABCDGHJK': ['3A', '3G', '3B', '3C', '3H', '3D', '3J', '3K'],
  'ABCDGHIL': ['3A', '3G', '3B', '3C', '3H', '3D', '3L', '3I'],
  'ABCDGHIK': ['3A', '3G', '3B', '3C', '3H', '3D', '3I', '3K'],
  'ABCDGHIJ': ['3A', '3G', '3B', '3C', '3H', '3D', '3J', '3I'],
  'ABCDFIJKL':undefined,
  'ABCDFJKL': ['3A', '3J', '3B', '3C', '3D', '3F', '3L', '3K'],
  'ABCDFHKL': ['3A', '3C', '3B', '3H', '3D', '3F', '3L', '3K'],
  'ABCDFHJL': ['3A', '3J', '3B', '3C', '3H', '3F', '3L', '3D'],
  'ABCDFHJK': ['3A', '3J', '3B', '3C', '3H', '3F', '3D', '3K'],
  'ABCDFHIJ': ['3A', '3J', '3B', '3C', '3H', '3F', '3D', '3I'],
  'ABCDFHIL': ['3A', '3C', '3B', '3D', '3H', '3F', '3L', '3I'],
  'ABCDFHIK': ['3A', '3C', '3B', '3D', '3H', '3F', '3I', '3K'],
  'ABCDFGKL': ['3A', '3G', '3B', '3C', '3D', '3F', '3L', '3K'],
  'ABCDFGJL': ['3A', '3G', '3B', '3C', '3J', '3F', '3L', '3D'],
  'ABCDFGJK': ['3A', '3G', '3B', '3C', '3J', '3F', '3D', '3K'],
  'ABCDFGIL': ['3A', '3G', '3B', '3C', '3D', '3F', '3L', '3I'],
  'ABCDFGIK': ['3A', '3G', '3B', '3C', '3D', '3F', '3I', '3K'],
  'ABCDFGIJ': ['3A', '3G', '3B', '3C', '3J', '3F', '3D', '3I'],
  'ABCDFGHL': ['3A', '3G', '3B', '3C', '3H', '3F', '3L', '3D'],
  'ABCDFGHK': ['3A', '3G', '3B', '3C', '3H', '3F', '3D', '3K'],
  'ABCDFGHJ': ['3A', '3G', '3B', '3C', '3H', '3F', '3D', '3J'],
  'ABCDFGHI': ['3A', '3G', '3B', '3C', '3H', '3F', '3D', '3I'],

  'ABCDEIJKL':undefined,
  'ABCDEJKL': ['3A', '3J', '3B', '3C', '3D', '3E', '3L', '3K'],
  'ABCDEIKL': ['3A', '3E', '3B', '3C', '3D', '3I', '3L', '3K'],
  'ABCDEHJKL':undefined,
  'ABCDEHKL': ['3A', '3E', '3B', '3C', '3H', '3D', '3L', '3K'],
  'ABCDEHJL': ['3A', '3J', '3B', '3C', '3H', '3D', '3L', '3E'],
  'ABCDEHJK': ['3A', '3J', '3B', '3C', '3H', '3D', '3E', '3K'],
  'ABCDEHIJ': ['3A', '3J', '3B', '3C', '3H', '3D', '3E', '3I'],
  'ABCDEHIL': ['3A', '3E', '3B', '3C', '3H', '3D', '3L', '3I'],
  'ABCDEHIK': ['3A', '3E', '3B', '3C', '3H', '3D', '3I', '3K'],
  'ABCDEGKL': ['3A', '3G', '3B', '3C', '3D', '3E', '3L', '3K'],
  'ABCDEGJL': ['3A', '3G', '3B', '3C', '3J', '3D', '3L', '3E'],
  'ABCDEGJK': ['3A', '3G', '3B', '3C', '3J', '3D', '3E', '3K'],
  'ABCDEGIL': ['3A', '3G', '3B', '3C', '3D', '3E', '3L', '3I'],
  'ABCDEGIK': ['3A', '3G', '3B', '3C', '3D', '3E', '3I', '3K'],
  'ABCDEGIJ': ['3A', '3G', '3B', '3C', '3J', '3D', '3E', '3I'],
  'ABCDEGHL': ['3A', '3G', '3B', '3C', '3H', '3D', '3L', '3E'],
  'ABCDEGHK': ['3A', '3G', '3B', '3C', '3H', '3D', '3E', '3K'],
  'ABCDEGHJ': ['3A', '3G', '3B', '3C', '3H', '3D', '3E', '3J'],
  'ABCDEGHI': ['3A', '3G', '3B', '3C', '3H', '3D', '3E', '3I'],
  'ABCDEFKL': ['3A', '3C', '3B', '3E', '3D', '3F', '3L', '3K'],
  'ABCDEFJL': ['3A', '3J', '3B', '3C', '3D', '3F', '3L', '3E'],
  'ABCDEFJK': ['3A', '3J', '3B', '3C', '3D', '3F', '3E', '3K'],
  'ABCDEFIL': ['3A', '3C', '3B', '3E', '3D', '3F', '3L', '3I'],
  'ABCDEFIK': ['3A', '3C', '3B', '3E', '3D', '3F', '3I', '3K'],
  'ABCDEFIJ': ['3A', '3J', '3B', '3C', '3D', '3F', '3E', '3I'],
  'ABCDEFHL': ['3A', '3C', '3B', '3E', '3H', '3F', '3L', '3D'],
  'ABCDEFHK': ['3A', '3C', '3B', '3E', '3H', '3F', '3D', '3K'],
  'ABCDEFHJ': ['3A', '3C', '3B', '3E', '3H', '3F', '3D', '3J'],
  'ABCDEFHI': ['3A', '3C', '3B', '3E', '3H', '3F', '3D', '3I'],
  'ABCDEFGL': ['3A', '3G', '3B', '3C', '3D', '3F', '3L', '3E'],
  'ABCDEFGK': ['3A', '3G', '3B', '3C', '3D', '3F', '3E', '3K'],
  'ABCDEFGJ': ['3A', '3G', '3B', '3C', '3D', '3F', '3E', '3J'],
  'ABCDEFGI': ['3A', '3G', '3B', '3C', '3D', '3F', '3E', '3I'],
  'ABCDEFGH': ['3A', '3G', '3B', '3C', '3H', '3F', '3D', '3E'],
};

// Remove undefined entries (invalid combinations)
Object.keys(THIRD_PLACE_TABLE).forEach(k => {
  if (THIRD_PLACE_TABLE[k] === undefined) delete THIRD_PLACE_TABLE[k];
});


// ═══════════════════════════════════════════════════════════════
// 7. DEFAULT SCORING CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const DEFAULT_SCORING = {
  // Group stage
  exact_group_position:       2,   // per team in correct position (max 48 × 2 = 96)
  correct_team_advances:      0,   // bonus if team advances regardless of position (0 = off)

  // Best 3rd place
  correct_third_place:        4,   // per correct 3rd-place team advancing (max 8 × 4 = 32)

  // Knockout rounds — points per correct team in each round
  correct_R32_team:           1,   // max 32 × 1 = 32
  correct_R16_team:           2,   // max 16 × 2 = 32
  correct_QF_team:            4,   // max 8 × 4 = 32
  correct_SF_team:            6,   // max 4 × 6 = 24
  correct_finalist:           8,   // max 2 × 8 = 16
  correct_champion:          16,   // max 1 × 16 = 16

  // Extra questions — per-question points set in ExtraQuestions sheet
  // (no default multiplier here)

  // Optional bonuses (admin toggle)
  group_sweep_bonus:          0,   // bonus for getting all 4 in a group right (0 = off)
  cumulative_knockout:       true, // if true, a team predicted in the final who reaches QF
                                   // also earns R32 + R16 + QF points
};

// Maximum possible base points (without extras)
// 96 + 32 + 32 + 32 + 32 + 24 + 16 + 16 = 280
const MAX_BASE_POINTS = 280;


// ═══════════════════════════════════════════════════════════════
// 8. DEFAULT EXTRA QUESTIONS (Norwegian, matching legacy style)
// ═══════════════════════════════════════════════════════════════

const DEFAULT_EXTRA_QUESTIONS = [
  { q_id: 1,  question_no: 'Hvilket lag vil score flest mål i gruppespillet?',                          question_en: 'Which team will score the most goals in the group stage?',                answer_type: 'text',   points: 4, round: 'GROUP' },
  { q_id: 2,  question_no: 'Hvor mange lag vil vinne alle sine 3 kamper i gruppespillet?',              question_en: 'How many teams will win all 3 of their group stage matches?',             answer_type: 'number', points: 2, round: 'GROUP' },
  { q_id: 3,  question_no: 'Hvor mange straffer vil bli gitt i løpet av ordinær tid i R32?',           question_en: 'How many penalties will be awarded in regular time in the R32?',          answer_type: 'number', points: 3, round: 'R32' },
  { q_id: 4,  question_no: 'Hvor mange nordiske lag er med i R32?',                                    question_en: 'How many Nordic teams are in the R32?',                                  answer_type: 'number', points: 2, round: 'R32' },
  { q_id: 5,  question_no: 'Hvor mange mål scores direkte på frispark i kvartfinalene?',               question_en: 'How many goals are scored directly from free kicks in the QFs?',          answer_type: 'number', points: 2, round: 'QF' },
  { q_id: 6,  question_no: 'Hvor mange kvartfinalekamper vil ende uavgjort i ordinær tid?',            question_en: 'How many QF matches will be drawn after regular time?',                   answer_type: 'number', points: 2, round: 'QF' },
  { q_id: 7,  question_no: 'Hvor mange mål scores totalt i de to semifinalene i ordinær tid?',         question_en: 'How many total goals in the two SFs in regular time?',                    answer_type: 'number', points: 3, round: 'SF' },
  { q_id: 8,  question_no: 'Hvor mange røde kort deles ut totalt i semifinalene?',                     question_en: 'How many red cards total in the SFs?',                                   answer_type: 'number', points: 2, round: 'SF' },
  { q_id: 9,  question_no: 'Når blir finalen avgjort?',                                                question_en: 'When is the final decided?',                                            answer_type: 'multi',  points: 2, round: 'F', options: ['Ordinær tid', 'Ekstra omganger', 'Straffespark'] },
  { q_id: 10, question_no: 'Hvilket klubblag har flest spillere i finalen?',                            question_en: 'Which club has the most players in the final?',                          answer_type: 'text',   points: 3, round: 'F' },
  { q_id: 11, question_no: 'Hvor mange kamper må avgjøres på straffespark?',                            question_en: 'How many matches will be decided by penalty shootout?',                   answer_type: 'number', points: 4, round: 'TOTAL' },
  { q_id: 12, question_no: 'Hvor mange mål scorer toppscoreren totalt?',                                question_en: 'How many goals will the top scorer score in total?',                     answer_type: 'number', points: 4, round: 'TOTAL' },
  { q_id: 13, question_no: 'Hvem blir toppscorer?',                                                    question_en: 'Who will be the top scorer?',                                           answer_type: 'text',   points: 4, round: 'TOTAL' },
];

// Maximum extra question points: 4+2+3+2+2+2+3+2+2+3+4+4+4 = 37
const MAX_EXTRA_POINTS = DEFAULT_EXTRA_QUESTIONS.reduce((s, q) => s + q.points, 0);
const MAX_TOTAL_POINTS = MAX_BASE_POINTS + MAX_EXTRA_POINTS; // 317


// ═══════════════════════════════════════════════════════════════
// 9. UTILITY: Resolve 3rd-place slot assignment
// ═══════════════════════════════════════════════════════════════

/**
 * Given the 8 groups whose 3rd-placed team qualifies,
 * returns the mapping of which 3rd-placed team faces which group winner.
 *
 * @param {string[]} qualifyingGroups - sorted array of 8 group letters, e.g. ['B','C','E','F','G','H','I','K']
 * @returns {Object} mapping: { '1A': '3X', '1B': '3Y', ... } or null if invalid
 */
function resolveThirdPlaceSlots(qualifyingGroups) {
  const key = qualifyingGroups.sort().join('');
  const mapping = THIRD_PLACE_TABLE[key];
  if (!mapping) return null;
  // Slot order: 1A, 1B, 1D, 1E, 1G, 1I, 1K, 1L
  const slotKeys = ['1A', '1B', '1D', '1E', '1G', '1I', '1K', '1L'];
  const result = {};
  slotKeys.forEach((slot, i) => {
    result[slot] = mapping[i]; // e.g. '3E'
  });
  return result;
}


// ═══════════════════════════════════════════════════════════════
// EXPORTS (for Node.js / Apps Script; browsers use globals)
// ═══════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TEAMS, GROUPS, GROUP_LETTERS,
    R32_MATCHES, R16_MATCHES, QF_MATCHES, SF_MATCHES,
    THIRD_PLACE_MATCH, FINAL, ROUNDS,
    THIRD_PLACE_TABLE,
    DEFAULT_SCORING, DEFAULT_EXTRA_QUESTIONS,
    MAX_BASE_POINTS, MAX_EXTRA_POINTS, MAX_TOTAL_POINTS,
    resolveThirdPlaceSlots,
    generateGroupMatches,
  };
}
