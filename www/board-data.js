/* =========================================================
   LUDO KINGDOM - BOARD COORDINATES & PATH DATA (15x15 Grid)
   ========================================================= */

window.BOARD_DATA = (() => {
  // Turn order runs clockwise around the board
  const COLORS = ["red", "green", "yellow", "blue"];

  // 52 outer track tiles in clockwise order [row, col] (0-indexed: 0..14)
  // Index 0 is Red's start tile (6, 1)
  const MAIN_TRACK = [
    // Left arm top row (moving right)
    [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
    // Top arm left column (moving up)
    [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
    // Top edge (moving right)
    [0, 7], [0, 8],
    // Top arm right column (moving down)
    [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
    // Right arm top row (moving right)
    [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
    // Right edge (moving down)
    [7, 14], [8, 14],
    // Right arm bottom row (moving left)
    [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
    // Bottom arm right column (moving down)
    [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
    // Bottom edge (moving left)
    [14, 7], [14, 6],
    // Bottom arm left column (moving up)
    [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
    // Left arm bottom row (moving left)
    [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
    // Left edge (moving up)
    [7, 0], [6, 0]
  ];

  // Starting index on MAIN_TRACK for each player color
  const START_INDEX = {
    red: 0,      // [6, 1]
    green: 13,   // [1, 8]
    yellow: 26,  // [8, 13]
    blue: 39     // [13, 6]
  };

  // Directional entry arrows pointing into each color's home lane (step 50)
  const HOME_ENTRY_ARROWS = {
    red:    [7, 0],   // Points right into [7, 1]
    green:  [0, 7],   // Points down into [1, 7]
    yellow: [7, 14],  // Points left into [7, 13]
    blue:   [14, 7]   // Points up into [13, 7]
  };

  // All 8 safe squares on MAIN_TRACK (4 colored starts + 4 star squares)
  const SAFE_TRACK_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

  // The 4 neutral star squares (for rendering the star icon)
  const STAR_ONLY_INDICES = new Set([8, 21, 34, 47]);

  // 5-tile colored home stretches (steps 51..55 for each color)
  const HOME_STRETCH = {
    red:    [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
    green:  [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
    yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
    blue:   [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]]
  };

  // Exact yard token centers in 0..15 grid units (aligned with .yard-spot circles)
  const YARD_SPOTS = {
    red:    [[1.92, 1.92], [1.92, 4.08], [4.08, 1.92], [4.08, 4.08]],
    green:  [[1.92, 10.92], [1.92, 13.08], [4.08, 10.92], [4.08, 13.08]],
    yellow: [[10.92, 10.92], [10.92, 13.08], [13.08, 10.92], [13.08, 13.08]],
    blue:   [[10.92, 1.92], [10.92, 4.08], [13.08, 1.92], [13.08, 4.08]]
  };

  // Finished token parking spots inside each color's center triangle (step 56)
  const HOME_FINISH_SPOTS = {
    red:    [[6.85, 6.42], [7.28, 6.42], [7.72, 6.42], [8.15, 6.42]],
    green:  [[6.42, 6.85], [6.42, 7.28], [6.42, 7.72], [6.42, 8.15]],
    yellow: [[6.85, 8.58], [7.28, 8.58], [7.72, 8.58], [8.15, 8.58]],
    blue:   [[8.58, 6.85], [8.58, 7.28], [8.58, 7.72], [8.58, 8.15]]
  };

  // Create starting token arrays for Classic (4 tokens in yard) or Quick (2 tokens, 1 pre-unlocked)
  function createInitialTokens(gameType = "classic") {
    const startState = gameType === "quick" ? [0, -1] : [-1, -1, -1, -1];
    return {
      red: [...startState],
      green: [...startState],
      yellow: [...startState],
      blue: [...startState]
    };
  }

  // Active color combinations based on player count
  // 2 players sit diagonally opposite each other (classic Ludo rule)
  function getActiveColors(playerCount, preferredColor = "red") {
    if (playerCount === 2) {
      const oppositeMap = {
        red: ["red", "yellow"],
        green: ["green", "blue"],
        yellow: ["yellow", "red"],
        blue: ["blue", "green"]
      };
      return oppositeMap[preferredColor] || ["red", "yellow"];
    }
    if (playerCount === 3) {
      const startIdx = COLORS.indexOf(preferredColor);
      const list = [];
      for (let i = 0; i < 3; i++) {
        list.push(COLORS[(startIdx + i) % 4]);
      }
      return list;
    }
    const startIdx = COLORS.indexOf(preferredColor);
    const list = [];
    for (let i = 0; i < 4; i++) {
      list.push(COLORS[(startIdx + i) % 4]);
    }
    return list;
  }

  // Convert a player's step (0..50) into a global MAIN_TRACK index (0..51)
  // Returns -1 if token is in yard (-1), home stretch (51..55), or finished (56)
  function getGlobalTrackIndex(color, step) {
    if (step < 0 || step > 50) return -1;
    return (START_INDEX[color] + step) % 52;
  }

  // Check if a step is on a safe square (captures are blocked here)
  function isSafeStep(color, step) {
    if (step < 0 || step >= 51) return true;
    const globalIdx = getGlobalTrackIndex(color, step);
    return SAFE_TRACK_INDICES.has(globalIdx);
  }

  // Get exact [top%, left%] CSS coordinates for a MAIN_TRACK index (used for capture bursts)
  function getTrackPercentPosition(globalIdx) {
    const tile = MAIN_TRACK[globalIdx];
    if (!tile) return { top: 50, left: 50 };
    const [r, c] = tile;
    return { top: ((r + 0.5) / 15) * 100, left: ((c + 0.5) / 15) * 100 };
  }

  // Get exact [top%, left%] CSS coordinates for any token
  function getTokenPercentPosition(color, tokenIndex, step) {
    let r, c;

    if (step === -1) {
      [r, c] = YARD_SPOTS[color][tokenIndex];
      return { top: (r / 15) * 100, left: (c / 15) * 100 };
    }

    if (step >= 0 && step <= 50) {
      const globalIdx = getGlobalTrackIndex(color, step);
      [r, c] = MAIN_TRACK[globalIdx];
      return { top: ((r + 0.5) / 15) * 100, left: ((c + 0.5) / 15) * 100 };
    }

    if (step >= 51 && step <= 55) {
      [r, c] = HOME_STRETCH[color][step - 51];
      return { top: ((r + 0.5) / 15) * 100, left: ((c + 0.5) / 15) * 100 };
    }

    // step === 56 (Finished inside center home triangle)
    [r, c] = HOME_FINISH_SPOTS[color][tokenIndex];
    return { top: (r / 15) * 100, left: (c / 15) * 100 };
  }

  // Identify CSS class for any non-yard, non-center cell on the 15x15 grid
  function getCellClass(row, col) {
    for (const color of COLORS) {
      const [sr, sc] = MAIN_TRACK[START_INDEX[color]];
      if (sr === row && sc === col) return `start-${color}`;

      const homeCells = HOME_STRETCH[color];
      for (const [hr, hc] of homeCells) {
        if (hr === row && hc === col) return `home-${color}`;
      }

      const [ar, ac] = HOME_ENTRY_ARROWS[color];
      if (ar === row && ac === col) return `arrow-${color}`;
    }

    for (const starIdx of STAR_ONLY_INDICES) {
      const [tr, tc] = MAIN_TRACK[starIdx];
      if (tr === row && tc === col) return "safe-star";
    }

    return "";
  }

  // Check whether a [row, col] lies inside the 4 corner yards or center 3x3 home
  function isReservedArea(row, col) {
    const inRedYard = row < 6 && col < 6;
    const inGreenYard = row < 6 && col > 8;
    const inYellowYard = row > 8 && col > 8;
    const inBlueYard = row > 8 && col < 6;
    const inCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8;
    return inRedYard || inGreenYard || inYellowYard || inBlueYard || inCenter;
  }

  return {
    COLORS,
    MAIN_TRACK,
    START_INDEX,
    HOME_ENTRY_ARROWS,
    SAFE_TRACK_INDICES,
    HOME_STRETCH,
    FINAL_STEP: 56,
    createInitialTokens,
    getActiveColors,
    getGlobalTrackIndex,
    isSafeStep,
    getTrackPercentPosition,
    getTokenPercentPosition,
    getCellClass,
    isReservedArea
  };
})();


