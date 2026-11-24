/* =========================================================
   LUDO KINGDOM - CLEAN BOARD ENGINE, ROTATION & 3D HOP ARCS
   ========================================================= */

window.LUDO_GAME = (() => {
  const BD = window.BOARD_DATA;

  const COLOR_LABELS = {
    red: "Red",
    green: "Green",
    yellow: "Yellow",
    blue: "Blue"
  };

  // Base clockwise corner mapping: 0=TL(red), 1=TR(green), 2=BR(yellow), 3=BL(blue)
  const BASE_CORNER_INDEX = { red: 0, green: 1, yellow: 2, blue: 3 };
  const SLOT_KEYS = ["tl", "tr", "br", "bl"];
  const COLORS_CW = ["red", "green", "yellow", "blue"];
  const ARROW_DIRS = ["dir-right", "dir-down", "dir-left", "dir-up"];

  // 3x3 grid indices (0..8) lit up for each 3D cube face (1..6)
  const PIP_PATTERNS = {
    1: [4],
    2: [2, 6],
    3: [2, 4, 6],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };

  // Exact cube rotation angles to face each number toward the player
  const FACE_ANGLES = {
    1: { x: 0, y: 0 },
    2: { x: 0, y: -90 },
    3: { x: -90, y: 0 },
    4: { x: 90, y: 0 },
    5: { x: 0, y: 90 },
    6: { x: 0, y: 180 }
  };

  const BASE_YARD_CENTERS = {
    red: { left: 20, top: 20 },
    green: { left: 80, top: 20 },
    yellow: { left: 80, top: 80 },
    blue: { left: 20, top: 80 }
  };

  // 3 Tuned Speed Profiles (Slow, Medium, Fast)
  const SPEED_PROFILES = {
    slow: {
      hop: 285,
      unlockPause: 110,
      spin: 740,
      botRollWait: 760,
      botMoveWait: 650,
      noMoveWait: 920,
      bonusWait: 440,
      captureWait: 420,
      forfeitWait: 1100,
      autoMoveWait: 340
    },
    medium: {
      hop: 200,
      unlockPause: 80,
      spin: 620,
      botRollWait: 560,
      botMoveWait: 480,
      noMoveWait: 760,
      bonusWait: 360,
      captureWait: 340,
      forfeitWait: 980,
      autoMoveWait: 270
    },
    fast: {
      hop: 112,
      unlockPause: 55,
      spin: 420,
      botRollWait: 320,
      botMoveWait: 280,
      noMoveWait: 480,
      bonusWait: 220,
      captureWait: 220,
      forfeitWait: 640,
      autoMoveWait: 170
    }
  };

  const RANK_BADGES = ["🥇 1st", "🥈 2nd", "🥉 3rd", "4th"];
  const TURN_LIMIT_MS = 15000;
  const REROLL_GEM_COST = 5;

  // ==================== WEB AUDIO SOUND ENGINE (REALISTIC DICE CLACK) ====================
  const SFX = (() => {
    let ctx = null;
    let noiseBuffer = null;

    function getCtx() {
      const settings = window.LUDO_UI ? window.LUDO_UI.getSettings() : { sound: true };
      if (!settings.sound) return null;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!ctx) ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      return ctx;
    }

    function getNoiseBuffer(ac) {
      if (noiseBuffer && noiseBuffer.sampleRate === ac.sampleRate) return noiseBuffer;
      const len = Math.floor(ac.sampleRate * 0.045);
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.35));
      }
      noiseBuffer = buf;
      return buf;
    }

    function playTone(freq, duration, type = "sine", volume = 0.14, delay = 0) {
      const ac = getCtx();
      if (!ac) return;
      const now = ac.currentTime + delay;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(now);
      osc.stop(now + duration);
    }

    function playDiceHit(ac, delay, pitch, vol) {
      const now = ac.currentTime + delay;

      const src = ac.createBufferSource();
      src.buffer = getNoiseBuffer(ac);

      const filter = ac.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(pitch, now);
      filter.Q.setValueAtTime(4.2, now);

      const nGain = ac.createGain();
      nGain.gain.setValueAtTime(vol, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);

      src.connect(filter);
      filter.connect(nGain);
      nGain.connect(ac.destination);
      src.start(now);

      const osc = ac.createOscillator();
      const oGain = ac.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(pitch * 0.24, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.14, now + 0.032);
      oGain.gain.setValueAtTime(vol * 0.45, now);
      oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(oGain);
      oGain.connect(ac.destination);
      osc.start(now);
      osc.stop(now + 0.038);
    }

    return {
      dice() {
        const ac = getCtx();
        if (!ac) return;
        const hits = [
          { d: 0.0, p: 1750, v: 0.26 },
          { d: 0.075, p: 2150, v: 0.22 },
          { d: 0.16, p: 1620, v: 0.24 },
          { d: 0.26, p: 1980, v: 0.19 },
          { d: 0.37, p: 1480, v: 0.15 }
        ];
        hits.forEach((h) => playDiceHit(ac, h.d, h.p + (Math.random() * 140 - 70), h.v));
      },
      reroll() {
        playTone(587, 0.08, "sine", 0.13, 0);
        playTone(880, 0.12, "sine", 0.13, 0.06);
        playTone(1174, 0.16, "triangle", 0.12, 0.12);
      },
      hop() { playTone(540, 0.065, "sine", 0.12); },
      unlock() {
        playTone(440, 0.09, "triangle", 0.14, 0);
        playTone(660, 0.14, "triangle", 0.14, 0.08);
      },
      safe() {
        playTone(660, 0.09, "sine", 0.1, 0);
        playTone(880, 0.12, "sine", 0.1, 0.07);
      },
      capture() {
        playTone(640, 0.08, "sawtooth", 0.12, 0);
        playTone(390, 0.12, "sawtooth", 0.12, 0.07);
        playTone(210, 0.19, "sawtooth", 0.12, 0.15);
      },
      slideTick() { playTone(320, 0.032, "sine", 0.05); },
      home() {
        playTone(523, 0.1, "triangle", 0.14, 0);
        playTone(659, 0.1, "triangle", 0.14, 0.09);
        playTone(784, 0.2, "triangle", 0.15, 0.18);
      },
      forfeit() {
        playTone(280, 0.14, "sawtooth", 0.1, 0);
        playTone(190, 0.22, "sawtooth", 0.1, 0.14);
      },
      emoji() {
        playTone(720, 0.06, "sine", 0.09, 0);
        playTone(920, 0.08, "sine", 0.08, 0.05);
      },
      win() {
        const notes = [523, 659, 784, 1046];
        notes.forEach((n, idx) => playTone(n, 0.22, "triangle", 0.16, idx * 0.12));
      }
    };
  })();

  // ==================== CENTRAL GAME STATE ====================
  let state = createEmptyState();
  let rotQuarter = 0; // Clockwise 90-deg steps (0..3) so Human always sits in Bottom-Left!
  let sessionId = 0;
  let tokenEls = {};
  let turnTimerInterval = null;
  let comboBannerTimer = null;
  let emojiTimers = {};
  let prevConsecutiveSixes = 0;
  let capturesThisTurn = 0;
  let diceSpins = {
    red: { x: 0, y: 0 },
    green: { x: 0, y: 0 },
    yellow: { x: 0, y: 0 },
    blue: { x: 0, y: 0 }
  };

  function generateSaveId() {
    return `match_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  }

  function createEmptyState() {
    return {
      active: false,
      saveId: "",
      mode: "vs-bot",
      gameType: "classic",
      difficulty: "normal",
      isCup: false,
      cupRound: 0,
      cupTitle: "",
      isTeam2v2: false,
      teams: null,
      humanTeam: null,
      stake: 0,
      pot: 0,
      activeColors: [],
      players: {},
      finishedOrder: [],
      turnIndex: 0,
      diceValue: null,
      phase: "IDLE",
      consecutiveSixes: 0,
      rerollUsed: { red: false, green: false, yellow: false, blue: false },
      tokens: BD.createInitialTokens("classic")
    };
  }

  // ==================== BOARD ROTATION (HUMAN ALWAYS BOTTOM-LEFT) ====================
  function computeBoardRotation() {
    let targetBottomLeftColor = "blue";
    if (state.mode === "vs-bot") {
      const humanColor = state.activeColors.find((c) => state.players[c] && !state.players[c].isBot);
      if (humanColor) targetBottomLeftColor = humanColor;
    } else if (state.activeColors.length > 0) {
      targetBottomLeftColor = state.activeColors[0];
    }
    const baseIdx = BASE_CORNER_INDEX[targetBottomLeftColor] ?? 3;
    rotQuarter = (3 - baseIdx + 4) % 4;
  }

  function getCornerSlotForColor(color) {
    const baseIdx = BASE_CORNER_INDEX[color] ?? 0;
    return SLOT_KEYS[(baseIdx + rotQuarter) % 4];
  }

  function rotateGridCoord(r, c) {
    if (rotQuarter === 1) return [c, 14 - r];
    if (rotQuarter === 2) return [14 - r, 14 - c];
    if (rotQuarter === 3) return [14 - c, r];
    return [r, c];
  }

  function rotatePercentPos(pos) {
    if (!pos) return { left: 50, top: 50 };
    if (rotQuarter === 1) return { left: 100 - pos.top, top: pos.left };
    if (rotQuarter === 2) return { left: 100 - pos.left, top: 100 - pos.top };
    if (rotQuarter === 3) return { left: pos.top, top: 100 - pos.left };
    return { left: pos.left, top: pos.top };
  }

  function getRotatedTokenPos(color, idx, step) {
    return rotatePercentPos(BD.getTokenPercentPosition(color, idx, step));
  }

  function getRotatedTrackPos(globalTrackIdx) {
    return rotatePercentPos(BD.getTrackPercentPosition(globalTrackIdx));
  }

  function getRotatedYardCenter(color) {
    return rotatePercentPos(BASE_YARD_CENTERS[color] || { left: 50, top: 50 });
  }

  function getSettings() {
    return window.LUDO_UI
      ? window.LUDO_UI.getSettings()
      : { sound: true, music: true, vibration: true, timer: true, speed: "medium", theme: "classic", tokenSkin: "pin" };
  }

  function getSpeed() {
    const raw = getSettings().speed || "medium";
    const key = raw === "normal" ? "medium" : raw;
    return SPEED_PROFILES[key] || SPEED_PROFILES.medium;
  }

  function vibrate(pattern) {
    if (window.LUDO_UI && typeof window.LUDO_UI.vibrate === "function") {
      window.LUDO_UI.vibrate(pattern);
    }
  }

  function trackMission(statName, amount = 1) {
    if (window.LUDO_UI && typeof window.LUDO_UI.trackEvent === "function") {
      window.LUDO_UI.trackEvent(statName, amount);
    }
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function getCurrentColor() {
    return state.activeColors[state.turnIndex];
  }

  // ==================== 2v2 TEAM HELPERS ====================
  function isTeammate(colorA, colorB) {
    if (!state.isTeam2v2 || !state.teams) return false;
    return Boolean(colorA && colorB && state.teams[colorA] === state.teams[colorB]);
  }

  function getPartnerColor(color) {
    if (!state.isTeam2v2 || !state.teams) return null;
    const myTeam = state.teams[color];
    return state.activeColors.find((c) => c !== color && state.teams[c] === myTeam) || null;
  }

  function isTeamComplete(teamId) {
    if (!state.isTeam2v2 || !state.teams) return false;
    const members = state.activeColors.filter((c) => state.teams[c] === teamId);
    return members.length > 0 && members.every((c) => hasPlayerFinished(c));
  }

  function getControlledColor(turnColor) {
    if (!state.isTeam2v2) return turnColor;
    if (!hasPlayerFinished(turnColor)) return turnColor;
    const partner = getPartnerColor(turnColor);
    if (partner && !hasPlayerFinished(partner)) return partner;
    return turnColor;
  }

  // ==================== THEME-LOCKED STUDIO SPRITE / SVG PIECES ====================
  function applyVisualToTokenEl(tokEl, color) {
    if (!tokEl) return;
    const bodyEl = tokEl.querySelector(".token-body");
    if (!bodyEl) return;
    const settings = getSettings();
    const skin = window.LUDO_UI && typeof window.LUDO_UI.getPieceSkinForTheme === "function"
      ? window.LUDO_UI.getPieceSkinForTheme(settings.theme || "classic")
      : (settings.tokenSkin || "pin");

    if (window.LUDO_UI && typeof window.LUDO_UI.renderPieceVisual === "function") {
      window.LUDO_UI.renderPieceVisual(bodyEl, skin, color);
    }
  }

  function refreshPieceSkins() {
    BD.COLORS.forEach((color) => {
      const list = tokenEls[color];
      if (!Array.isArray(list)) return;
      list.forEach((el) => applyVisualToTokenEl(el, color));
    });
  }

  function triggerHopArc(color, tokenIndex, hopDurationMs) {
    const el = tokenEls[color] && tokenEls[color][tokenIndex];
    if (!el) return;
    el.classList.remove("hopping");
    void el.offsetWidth;
    el.style.setProperty("--hop-speed", `${hopDurationMs}ms`);
    el.classList.add("hopping");
    setTimeout(() => {
      if (el.isConnected) el.classList.remove("hopping");
    }, hopDurationMs + 30);
  }

  // ==================== MULTI-MATCH SAVE SNAPSHOT ====================
  function persistMatchSnapshot() {
    if (!state.active || state.phase === "GAME_OVER" || state.phase === "IDLE") return;
    if (!window.LUDO_UI || typeof window.LUDO_UI.saveMatchSnapshot !== "function") return;

    if (!state.saveId) state.saveId = generateSaveId();

    const snapshot = {
      saveId: state.saveId,
      mode: state.mode,
      gameType: state.gameType,
      difficulty: state.difficulty,
      isCup: state.isCup,
      cupRound: state.cupRound,
      cupTitle: state.cupTitle,
      isTeam2v2: state.isTeam2v2,
      teams: state.teams ? { ...state.teams } : null,
      humanTeam: state.humanTeam || null,
      stake: state.stake,
      pot: state.pot,
      activeColors: [...state.activeColors],
      players: JSON.parse(JSON.stringify(state.players)),
      finishedOrder: [...state.finishedOrder],
      turnIndex: state.turnIndex,
      consecutiveSixes: state.consecutiveSixes,
      rerollUsed: { ...state.rerollUsed },
      tokens: JSON.parse(JSON.stringify(state.tokens))
    };

    window.LUDO_UI.saveMatchSnapshot(snapshot);
  }

  // ==================== LUCKY RE-ROLL POWER-UP ====================
  function canOfferReroll(color, rolled) {
    if (!state.active || !color || !state.players[color]) return false;
    if (state.players[color].isBot) return false;
    if (rolled === 6) return false;
    if (state.rerollUsed[color]) return false;
    return true;
  }

  function showRerollBtn() {
    const btn = document.getElementById("btn-reroll");
    if (btn) btn.classList.remove("hidden");
  }

  function hideRerollBtn() {
    const btn = document.getElementById("btn-reroll");
    if (btn) btn.classList.add("hidden");
  }

  function handleRerollClick() {
    if (!state.active) return;
    if (state.phase !== "WAITING_MOVE" && state.phase !== "WAITING_REROLL") return;

    const color = getCurrentColor();
    const player = state.players[color];
    if (!player || player.isBot || state.rerollUsed[color]) return;

    if (!window.LUDO_UI || !window.LUDO_UI.spendGems(REROLL_GEM_COST)) return;

    state.rerollUsed[color] = true;
    state.consecutiveSixes = prevConsecutiveSixes;
    hideRerollBtn();
    clearTurnTimer();
    clearLandingPreviews();
    SFX.reroll();
    vibrate([20, 25, 35]);

    spawnBoardCallout(getRotatedYardCenter(color), "✨ RE-ROLL!", "callout-bonus");

    state.phase = "WAITING_ROLL";
    renderTokens([]);
    rollDice(color, sessionId);
  }

  // ==================== 3D CUBE DICE FACTORY & SPIN ====================
  function createDiceBoxElement(color) {
    const diceBtn = document.createElement("button");
    diceBtn.type = "button";
    diceBtn.id = `dice-${color}`;
    diceBtn.className = "dice-box";
    diceBtn.dataset.color = color;
    diceBtn.disabled = true;
    diceBtn.setAttribute("aria-label", `${COLOR_LABELS[color]} Dice`);

    const stage = document.createElement("div");
    stage.className = "dice-stage-3d";

    const cube = document.createElement("div");
    cube.className = "dice-cube";

    for (let faceVal = 1; faceVal <= 6; faceVal++) {
      const face = document.createElement("div");
      face.className = `cube-face face-${faceVal}`;
      const activePips = PIP_PATTERNS[faceVal];

      for (let i = 0; i < 9; i++) {
        const pip = document.createElement("span");
        pip.className = activePips.includes(i) ? "cube-pip on" : "cube-pip";
        face.appendChild(pip);
      }

      cube.appendChild(face);
    }

    stage.appendChild(cube);
    diceBtn.appendChild(stage);

    diceBtn.addEventListener("click", () => {
      if (!state.active || state.phase !== "WAITING_ROLL") return;
      if (color !== getCurrentColor() || state.players[color].isBot) return;
      rollDice(color, sessionId);
    });

    return diceBtn;
  }

  function resetDiceInstant(color, value = 6) {
    const diceBtn = document.getElementById(`dice-${color}`);
    if (!diceBtn) return;
    diceBtn.classList.remove("rolling");

    diceSpins[color] = { x: 0, y: 0 };
    const cube = diceBtn.querySelector(".dice-cube");
    if (!cube) return;

    const angle = FACE_ANGLES[value] || FACE_ANGLES[6];
    cube.style.transitionDuration = "0s";
    cube.style.transform = `rotateX(${angle.x}deg) rotateY(${angle.y}deg)`;
    void cube.offsetWidth;
  }

  function spinDice3D(color, targetValue) {
    const diceBtn = document.getElementById(`dice-${color}`);
    if (!diceBtn) return 600;

    const stage = diceBtn.querySelector(".dice-stage-3d");
    const cube = diceBtn.querySelector(".dice-cube");
    if (!cube) return 600;

    const durationMs = getSpeed().spin;
    const angle = FACE_ANGLES[targetValue] || FACE_ANGLES[1];

    diceSpins[color].x += 1 + Math.floor(Math.random() * 2);
    diceSpins[color].y += 1 + Math.floor(Math.random() * 2);

    const finalX = diceSpins[color].x * 360 + angle.x;
    const finalY = diceSpins[color].y * 360 + angle.y;

    diceBtn.classList.remove("rolling");
    void diceBtn.offsetWidth;
    if (stage) stage.style.animationDuration = `${durationMs}ms`;
    diceBtn.classList.add("rolling");

    cube.style.transitionDuration = `${durationMs}ms`;
    cube.style.transform = `rotateX(${finalX}deg) rotateY(${finalY}deg)`;

    return durationMs;
  }

  // ==================== 15-SECOND TURN TIMER ====================
  function clearTurnTimer() {
    if (turnTimerInterval) {
      clearInterval(turnTimerInterval);
      turnTimerInterval = null;
    }
    BD.COLORS.forEach((c) => {
      const fill = document.getElementById(`timer-${c}`);
      if (fill) {
        fill.style.width = "0%";
        fill.classList.remove("urgent");
      }
    });
  }

  function startTurnTimer(color, mySession, onTimeout, customDurationMs = TURN_LIMIT_MS) {
    clearTurnTimer();
    if (!getSettings().timer && customDurationMs === TURN_LIMIT_MS) return;

    const fill = document.getElementById(`timer-${color}`);
    const startedAt = Date.now();

    if (fill) {
      fill.style.width = "100%";
      fill.classList.remove("urgent");
    }

    turnTimerInterval = setInterval(() => {
      if (!state.active || mySession !== sessionId) {
        clearTurnTimer();
        return;
      }

      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, customDurationMs - elapsed);
      const pct = (remaining / customDurationMs) * 100;

      if (fill) {
        fill.style.width = `${pct}%`;
        fill.classList.toggle("urgent", pct <= 30);
      }

      if (remaining <= 0) {
        clearTurnTimer();
        onTimeout();
      }
    }, 100);
  }

  // ==================== EMOJI & QUICK CHAT REACTIONS ====================
  function showEmojiBubble(color, content, playSound = false, isChat = false) {
    const bubble = document.getElementById(`emoji-${color}`);
    if (!bubble) return;

    bubble.textContent = content;
    bubble.classList.toggle("chat-bubble", isChat);
    bubble.classList.remove("hidden");

    bubble.style.animation = "none";
    void bubble.offsetWidth;
    bubble.style.animation = "";

    if (playSound) SFX.emoji();

    clearTimeout(emojiTimers[color]);
    emojiTimers[color] = setTimeout(() => {
      bubble.classList.add("hidden");
    }, isChat ? 2600 : 2100);
  }

  function closeEmojiPopover() {
    const pop = document.getElementById("emoji-popover");
    if (pop) pop.classList.add("hidden");
  }

  function clearAllEmojis() {
    closeEmojiPopover();
    BD.COLORS.forEach((c) => {
      clearTimeout(emojiTimers[c]);
      const bubble = document.getElementById(`emoji-${c}`);
      if (bubble) {
        bubble.classList.add("hidden");
        bubble.classList.remove("chat-bubble");
      }
    });
  }

  function triggerBotReaction(botColor, mood, chance = 0.65) {
    if (!state.players[botColor] || !state.players[botColor].isBot) return;
    if (Math.random() > chance) return;

    const pools = {
      captured: ["😭", "😡"],
      attack: ["😂", "😎", "🔥"],
      happy: ["🔥", "👏", "😎"]
    };
    const list = pools[mood] || pools.happy;
    const pick = list[Math.floor(Math.random() * list.length)];
    showEmojiBubble(botColor, pick, false, false);
  }

  function scheduleBotChatReply(senderColor, chatMsg) {
    const botColors = state.activeColors.filter(
      (c) => c !== senderColor && state.players[c] && state.players[c].isBot
    );
    if (botColors.length === 0) return;

    const responder = botColors[Math.floor(Math.random() * botColors.length)];
    const partner = isTeammate(senderColor, responder);

    let replies = ["Game on! 🔥", "Watch this! 😎", "Good luck! 👏", "Let's roll! 🎲"];
    if (partner) replies = ["We got this! 🤝", "Nice teamwork! 🔥", "Right behind you! 💪"];
    else if (chatMsg.includes("Hurry")) replies = ["Rolling now! ⚡", "Hold on! 😅"];
    else if (chatMsg.includes("Watch Out")) replies = ["Try me! 😎", "Haha! 😂"];
    else if (chatMsg.includes("Good Game")) replies = ["Good Game! 👏", "Great match! 🔥"];

    const pick = replies[Math.floor(Math.random() * replies.length)];
    const mySession = sessionId;
    setTimeout(() => {
      if (!state.active || mySession !== sessionId) return;
      showEmojiBubble(responder, pick, false, true);
    }, 850);
  }

  // ==================== LANDING PREVIEWS, COMBO BANNERS & BOARD FX ====================
  function clearLandingPreviews() {
    const layer = document.getElementById("tokens-layer");
    if (!layer) return;
    layer.querySelectorAll(".landing-preview").forEach((el) => el.remove());
  }

  function renderLandingPreviews(ctrlColor, movableIndices, diceValue) {
    clearLandingPreviews();
    const layer = document.getElementById("tokens-layer");
    if (!layer || !movableIndices || movableIndices.length === 0) return;

    const seenTargets = new Set();

    movableIndices.forEach((idx) => {
      const currentStep = state.tokens[ctrlColor][idx];
      const targetStep = currentStep === -1 ? 0 : currentStep + diceValue;
      if (targetStep < 0 || targetStep > BD.FINAL_STEP) return;

      const pos = targetStep === BD.FINAL_STEP
        ? { left: 50, top: 50 }
        : getRotatedTokenPos(ctrlColor, idx, targetStep);

      const key = `${Math.round(pos.left * 10)}_${Math.round(pos.top * 10)}`;
      if (seenTargets.has(key)) return;
      seenTargets.add(key);

      const isCapture = wouldCaptureOpponent(ctrlColor, targetStep);
      const marker = document.createElement("div");
      marker.className = isCapture ? "landing-preview capture-target" : "landing-preview";
      marker.style.left = `${pos.left}%`;
      marker.style.top = `${pos.top}%`;
      layer.appendChild(marker);
    });
  }

  function showComboBanner(text, variantClass = "combo-capture") {
    const banner = document.getElementById("combo-banner");
    if (!banner) return;

    clearTimeout(comboBannerTimer);
    banner.className = `combo-banner ${variantClass}`;
    banner.textContent = text;

    banner.style.animation = "none";
    void banner.offsetWidth;
    banner.style.animation = "";

    comboBannerTimer = setTimeout(() => {
      banner.classList.add("hidden");
    }, 1380);
  }

  function clearComboBanner() {
    clearTimeout(comboBannerTimer);
    const banner = document.getElementById("combo-banner");
    if (banner) banner.classList.add("hidden");
  }

  function spawnHopSparkle(color, tokenIndex, step) {
    const layer = document.getElementById("tokens-layer");
    if (!layer) return;

    const pos = getRotatedTokenPos(color, tokenIndex, step);
    const sparkle = document.createElement("div");
    sparkle.className = "hop-sparkle";
    sparkle.style.left = `${pos.left}%`;
    sparkle.style.top = `${pos.top}%`;
    layer.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 480);
  }

  function spawnCaptureBurst(globalTrackIndex) {
    const layer = document.getElementById("tokens-layer");
    if (!layer) return;

    const pos = getRotatedTrackPos(globalTrackIndex);
    const burst = document.createElement("div");
    burst.className = "capture-burst";
    burst.style.left = `${pos.left}%`;
    burst.style.top = `${pos.top}%`;
    layer.appendChild(burst);

    setTimeout(() => burst.remove(), 540);
  }

  function spawnBoardCallout(pos, text, styleClass = "callout-bonus") {
    const layer = document.getElementById("tokens-layer");
    if (!layer || !pos) return;

    const clampedLeft = Math.min(82, Math.max(18, pos.left));
    const clampedTop = Math.min(88, Math.max(14, pos.top));

    const badge = document.createElement("div");
    badge.className = `board-callout ${styleClass}`;
    badge.textContent = text;
    badge.style.left = `${clampedLeft}%`;
    badge.style.top = `${clampedTop}%`;
    layer.appendChild(badge);

    setTimeout(() => badge.remove(), 1100);
  }

  // ==================== CAPTURE REVERSE-SLIDE ANIMATION ====================
  async function animateCapturedTokensBack(capturedList, mySession) {
    if (!capturedList || capturedList.length === 0) return;

    capturedList.forEach(({ color, idx }) => {
      const el = tokenEls[color] && tokenEls[color][idx];
      if (el) {
        el.classList.add("captured-slide");
        el.style.zIndex = "32";
      }
    });

    await Promise.all(capturedList.map(async ({ color, idx, fromStep }) => {
      const el = tokenEls[color] && tokenEls[color][idx];
      let step = fromStep;
      const stride = fromStep > 32 ? 3 : fromStep > 16 ? 2 : 1;
      let tickCounter = 0;

      while (step > 0) {
        if (!state.active || mySession !== sessionId) return;
        step = Math.max(0, step - stride);
        state.tokens[color][idx] = step;
        if (el) {
          const pos = getRotatedTokenPos(color, idx, step);
          el.style.left = `${pos.left}%`;
          el.style.top = `${pos.top}%`;
        }
        if (tickCounter % 2 === 0) SFX.slideTick();
        tickCounter += 1;
        await wait(44);
      }

      if (!state.active || mySession !== sessionId) return;
      state.tokens[color][idx] = -1;
      if (el) {
        const yardPos = getRotatedTokenPos(color, idx, -1);
        el.style.left = `${yardPos.left}%`;
        el.style.top = `${yardPos.top}%`;
      }
      await wait(75);
      if (el) el.classList.remove("captured-slide");
    }));
  }

  // ==================== BUILD ROTATED 15x15 BOARD DOM ====================
  function buildBoardDOM() {
    const board = document.getElementById("ludo-board");
    if (!board) return;
    board.innerHTML = "";

    // 4 Corner Yards Placed at Rotated Positions + Clean Yard Labels
    BD.COLORS.forEach((color) => {
      const slotKey = getCornerSlotForColor(color);
      const yard = document.createElement("div");
      yard.className = `yard yard-${color} yard-pos-${slotKey}`;
      yard.id = `yard-${color}`;

      if (state.activeColors.includes(color) && state.players[color]) {
        const lbl = document.createElement("span");
        lbl.className = "yard-label";
        lbl.textContent = state.players[color].name;
        yard.appendChild(lbl);
      }

      const inner = document.createElement("div");
      inner.className = "yard-inner";
      for (let i = 0; i < 4; i++) {
        const spot = document.createElement("div");
        spot.className = "yard-spot";
        inner.appendChild(spot);
      }

      yard.appendChild(inner);
      board.appendChild(yard);
    });

    // Center 3x3 Home Triangles Rotated to Match Home Lanes
    const topColor = COLORS_CW[(1 - rotQuarter + 4) % 4];
    const rightColor = COLORS_CW[(2 - rotQuarter + 4) % 4];
    const bottomColor = COLORS_CW[(3 - rotQuarter + 4) % 4];
    const leftColor = COLORS_CW[(0 - rotQuarter + 4) % 4];

    const center = document.createElement("div");
    center.className = "center-home";
    center.style.background = `conic-gradient(from -45deg, var(--${topColor}) 0deg 90deg, var(--${rightColor}) 90deg 180deg, var(--${bottomColor}) 180deg 270deg, var(--${leftColor}) 270deg 360deg)`;
    board.appendChild(center);

    // Individual Rotated Path Cells + Correctly Rotated Entry Arrows
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        if (BD.isReservedArea(r, c)) continue;
        const cell = document.createElement("div");
        let extraClass = BD.getCellClass(r, c) || "";

        if (extraClass.includes("arrow-red")) extraClass += ` ${ARROW_DIRS[(0 + rotQuarter) % 4]}`;
        else if (extraClass.includes("arrow-green")) extraClass += ` ${ARROW_DIRS[(1 + rotQuarter) % 4]}`;
        else if (extraClass.includes("arrow-yellow")) extraClass += ` ${ARROW_DIRS[(2 + rotQuarter) % 4]}`;
        else if (extraClass.includes("arrow-blue")) extraClass += ` ${ARROW_DIRS[(3 + rotQuarter) % 4]}`;

        const [rr, rc] = rotateGridCoord(r, c);
        cell.className = extraClass ? `cell ${extraClass}` : "cell";
        cell.style.gridRow = String(rr + 1);
        cell.style.gridColumn = String(rc + 1);
        board.appendChild(cell);
      }
    }

    // Tokens Overlay Layer
    const layer = document.createElement("div");
    layer.className = "tokens-layer";
    layer.id = "tokens-layer";
    board.appendChild(layer);

    tokenEls = {};
    state.activeColors.forEach((color) => {
      tokenEls[color] = [];
      const tokenCount = state.tokens[color].length;
      for (let i = 0; i < tokenCount; i++) {
        const tok = document.createElement("button");
        tok.type = "button";
        tok.className = `token token-${color}`;
        tok.dataset.color = color;
        tok.dataset.index = String(i);
        tok.setAttribute("aria-label", `${COLOR_LABELS[color]} Token ${i + 1}`);

        const shadow = document.createElement("span");
        shadow.className = "token-shadow";
        shadow.setAttribute("aria-hidden", "true");

        const body = document.createElement("span");
        body.className = "token-body";

        tok.appendChild(shadow);
        tok.appendChild(body);
        applyVisualToTokenEl(tok, color);

        tok.addEventListener("click", () => handleTokenClick(color, i));
        layer.appendChild(tok);
        tokenEls[color].push(tok);
      }
    });
  }

  // ==================== BUILD CLEAN POSITIONAL CORNER DOCKS (NO BOT PROFILES) ====================
  function setupPlayerPanels() {
    // Clear all 4 corner slots cleanly
    SLOT_KEYS.forEach((key) => {
      const slot = document.getElementById(`slot-${key}`);
      if (slot) slot.innerHTML = "";
    });

    BD.COLORS.forEach((color) => {
      if (!state.activeColors.includes(color) || !state.players[color]) return;

      const player = state.players[color];
      const slotKey = getCornerSlotForColor(color);
      const slotEl = document.getElementById(`slot-${slotKey}`);
      if (!slotEl) return;

      const isRightSide = slotKey === "tr" || slotKey === "br";
      const isBot = Boolean(player.isBot);

      const panel = document.createElement("div");
      panel.id = `panel-${color}`;
      panel.className = `player-panel panel-${color}` + (isBot ? " bot-compact" : "");

      // Floating Emoji / Quick Chat Bubble
      const bubble = document.createElement("div");
      bubble.id = `emoji-${color}`;
      bubble.className = "emoji-bubble hidden";
      panel.appendChild(bubble);

      const diceBtn = createDiceBoxElement(color);

      if (isBot) {
        // Clean Ludo King Bot Dock: Compact Color Pin + 3D Dice ONLY (No Profile Card!)
        const pin = document.createElement("span");
        pin.className = `bot-color-pin pin-${color}`;
        pin.textContent = "📍";

        const rankSpan = document.createElement("span");
        rankSpan.id = `rank-${color}`;
        rankSpan.className = "p-rank hidden";

        if (isRightSide) {
          panel.appendChild(diceBtn);
          panel.appendChild(pin);
        } else {
          panel.appendChild(pin);
          panel.appendChild(diceBtn);
        }
        panel.appendChild(rankSpan);
      } else {
        // Human Profile Dock (Always Bottom-Left vs Bots, or All Corners in Pass & Play)
        const info = document.createElement("div");
        info.className = "p-info" + (isRightSide ? " right-align" : "");

        const avatarEl = document.createElement("span");
        avatarEl.id = `avatar-${color}`;
        avatarEl.className = "p-avatar";
        if (window.LUDO_UI && typeof window.LUDO_UI.renderAvatar === "function") {
          window.LUDO_UI.renderAvatar(avatarEl, player.avatar);
        } else {
          avatarEl.textContent = player.avatar || "🤴";
        }

        const meta = document.createElement("div");
        meta.className = "p-meta" + (isRightSide ? " right-align" : "");

        const nameEl = document.createElement("span");
        nameEl.id = `name-${color}`;
        nameEl.className = "p-name";
        nameEl.textContent = player.name;

        const teamEl = document.createElement("span");
        teamEl.id = `team-${color}`;
        if (state.isTeam2v2 && state.teams && state.teams[color]) {
          teamEl.className = "p-team-tag";
          teamEl.textContent = `TEAM ${state.teams[color]}`;
        } else {
          teamEl.className = "p-team-tag hidden";
        }

        const rankEl = document.createElement("span");
        rankEl.id = `rank-${color}`;
        rankEl.className = "p-rank hidden";

        meta.appendChild(nameEl);
        meta.appendChild(teamEl);
        meta.appendChild(rankEl);

        if (isRightSide) {
          info.appendChild(meta);
          info.appendChild(avatarEl);
          panel.appendChild(diceBtn);
          panel.appendChild(info);
        } else {
          info.appendChild(avatarEl);
          info.appendChild(meta);
          panel.appendChild(info);
          panel.appendChild(diceBtn);
        }
      }

      // Slim Turn Timer Progress Strip
      const timerTrack = document.createElement("div");
      timerTrack.className = "turn-timer-track";
      const timerFill = document.createElement("div");
      timerFill.id = `timer-${color}`;
      timerFill.className = "turn-timer-fill";
      timerTrack.appendChild(timerFill);
      panel.appendChild(timerTrack);

      slotEl.appendChild(panel);
      resetDiceInstant(color, 6);
    });

    state.finishedOrder.forEach((color, idx) => {
      markPlayerFinishedUI(color, idx);
    });
  }

  // ==================== TOKEN RENDERING & STACKING ====================
  function renderTokens(movableIndices = []) {
    const turnColor = getCurrentColor();
    const ctrlColor = turnColor ? getControlledColor(turnColor) : null;
    const movableSet = new Set(movableIndices);

    const cellGroups = {};
    state.activeColors.forEach((color) => {
      state.tokens[color].forEach((step, idx) => {
        if (step < 0 || step >= BD.FINAL_STEP) return;
        const key = step <= 50
          ? `track_${BD.getGlobalTrackIndex(color, step)}`
          : `home_${color}_${step}`;
        if (!cellGroups[key]) cellGroups[key] = [];
        cellGroups[key].push({ color, idx });
      });
    });

    const CLUSTER_OFFSETS = [
      [{ x: 0, y: 0 }],
      [{ x: -1.3, y: 0 }, { x: 1.3, y: 0 }],
      [{ x: -1.3, y: -0.95 }, { x: 1.3, y: -0.95 }, { x: 0, y: 1.2 }],
      [{ x: -1.25, y: -1.15 }, { x: 1.25, y: -1.15 }, { x: -1.25, y: 1.15 }, { x: 1.25, y: 1.15 }]
    ];

    state.activeColors.forEach((color) => {
      state.tokens[color].forEach((step, idx) => {
        const el = tokenEls[color] && tokenEls[color][idx];
        if (!el) return;

        const pos = getRotatedTokenPos(color, idx, step);
        let offsetX = 0;
        let offsetY = 0;
        let scale = 1;

        if (step >= 0 && step < BD.FINAL_STEP) {
          const key = step <= 50
            ? `track_${BD.getGlobalTrackIndex(color, step)}`
            : `home_${color}_${step}`;
          const group = cellGroups[key] || [];
          if (group.length > 1) {
            const slot = group.findIndex((item) => item.color === color && item.idx === idx);
            const layout = CLUSTER_OFFSETS[Math.min(group.length, 4) - 1];
            const off = layout[slot % layout.length];
            offsetX = off.x;
            offsetY = off.y;
            scale = 0.78;
          }
        }

        el.style.left = `${pos.left + offsetX}%`;
        el.style.top = `${pos.top + offsetY}%`;

        const isFinished = step === BD.FINAL_STEP;
        const isMovable =
          state.phase === "WAITING_MOVE" &&
          color === ctrlColor &&
          state.players[turnColor] &&
          !state.players[turnColor].isBot &&
          movableSet.has(idx);

        el.classList.toggle("finished", isFinished);
        el.classList.toggle("movable", isMovable);

        if (isMovable) {
          el.style.zIndex = "35";
          el.style.pointerEvents = "auto";
          el.style.transform = "";
        } else {
          el.style.zIndex = isFinished ? "12" : "18";
          el.style.pointerEvents = "none";
          el.style.transform = isFinished
            ? "translate(-50%, -50%) scale(0.66)"
            : `translate(-50%, -50%) scale(${scale})`;
        }
      });
    });
  }

  function updateTurnUI() {
    const currentColor = getCurrentColor();
    const ctrlColor = currentColor ? getControlledColor(currentColor) : null;
    const player = state.players[currentColor];

    BD.COLORS.forEach((color) => {
      const panel = document.getElementById(`panel-${color}`);
      const diceBtn = document.getElementById(`dice-${color}`);
      const yard = document.getElementById(`yard-${color}`);
      const isCurrent = state.active && color === currentColor;

      if (panel) panel.classList.toggle("active-turn", isCurrent);
      if (yard) yard.classList.toggle("active-yard", state.active && color === ctrlColor);

      if (diceBtn) {
        const canHumanRoll = isCurrent && state.phase === "WAITING_ROLL" && player && !player.isBot;
        diceBtn.disabled = !canHumanRoll;
        diceBtn.classList.toggle("can-roll", canHumanRoll);
        if (!isCurrent) diceBtn.classList.remove("rolling");
      }
    });
  }

  function markPlayerFinishedUI(color, placeIndex) {
    const panel = document.getElementById(`panel-${color}`);
    const rankEl = document.getElementById(`rank-${color}`);
    if (panel) {
      panel.classList.add("finished-player");
      panel.classList.remove("active-turn");
    }
    if (rankEl) {
      rankEl.textContent = state.isTeam2v2 ? "🤝" : (RANK_BADGES[placeIndex] || `${placeIndex + 1}th`);
      rankEl.classList.remove("hidden");
    }
  }

  // ==================== RULE ENGINE ====================
  function getMovableTokenIndices(color, diceValue) {
    const valid = [];
    state.tokens[color].forEach((step, idx) => {
      if (step === -1 && diceValue === 6) {
        valid.push(idx);
      } else if (step >= 0 && step < BD.FINAL_STEP && step + diceValue <= BD.FINAL_STEP) {
        valid.push(idx);
      }
    });
    return valid;
  }

  function hasPlayerFinished(color) {
    return state.tokens[color].every((step) => step === BD.FINAL_STEP);
  }

  function getTotalProgress(color) {
    return state.tokens[color].reduce((sum, step) => sum + (step < 0 ? 0 : step + 1), 0);
  }

  function countThreatsAtTile(myColor, targetGlobalIdx) {
    if (targetGlobalIdx < 0 || BD.SAFE_TRACK_INDICES.has(targetGlobalIdx)) return 0;

    let threats = 0;
    for (const oppColor of state.activeColors) {
      if (oppColor === myColor || isTeammate(myColor, oppColor) || state.finishedOrder.includes(oppColor)) continue;
      for (const oppStep of state.tokens[oppColor]) {
        if (oppStep < 0 || oppStep > 50) continue;
        const oppGlobal = BD.getGlobalTrackIndex(oppColor, oppStep);
        const dist = (targetGlobalIdx - oppGlobal + 52) % 52;
        if (dist >= 1 && dist <= 6 && oppStep + dist <= 50) threats += 1;
      }
    }
    return threats;
  }

  function countStrikeTargetsAhead(myColor, myNewStep) {
    if (myNewStep < 0 || myNewStep > 50) return 0;
    const myGlobal = BD.getGlobalTrackIndex(myColor, myNewStep);
    let targets = 0;

    for (const oppColor of state.activeColors) {
      if (oppColor === myColor || isTeammate(myColor, oppColor) || state.finishedOrder.includes(oppColor)) continue;
      for (const oppStep of state.tokens[oppColor]) {
        if (oppStep < 0 || oppStep > 50 || BD.isSafeStep(oppColor, oppStep)) continue;
        const oppGlobal = BD.getGlobalTrackIndex(oppColor, oppStep);
        const dist = (oppGlobal - myGlobal + 52) % 52;
        if (dist >= 1 && dist <= 6 && myNewStep + dist <= 50) targets += 1;
      }
    }
    return targets;
  }

  function wouldCaptureOpponent(myColor, targetStep) {
    if (targetStep < 0 || targetStep > 50 || BD.isSafeStep(myColor, targetStep)) return false;
    const targetGlobal = BD.getGlobalTrackIndex(myColor, targetStep);

    for (const oppColor of state.activeColors) {
      if (oppColor === myColor || isTeammate(myColor, oppColor) || state.finishedOrder.includes(oppColor)) continue;
      for (const oppStep of state.tokens[oppColor]) {
        if (oppStep >= 0 && oppStep <= 50 && BD.getGlobalTrackIndex(oppColor, oppStep) === targetGlobal) return true;
      }
    }
    return false;
  }

  // ==================== EASY / NORMAL / PRO AI ENGINE ====================
  function chooseBotMove(color, movableIndices, diceValue, forceSmart = false) {
    if (movableIndices.length === 1) return movableIndices[0];

    const diff = forceSmart ? "normal" : state.difficulty;
    if (diff === "easy" && Math.random() < 0.48) {
      return movableIndices[Math.floor(Math.random() * movableIndices.length)];
    }

    const activeOnBoard = state.tokens[color].filter((s) => s >= 0 && s < BD.FINAL_STEP).length;
    let bestIdx = movableIndices[0];
    let bestScore = -Infinity;

    movableIndices.forEach((idx) => {
      const currentStep = state.tokens[color][idx];
      const newStep = currentStep === -1 ? 0 : currentStep + diceValue;
      let score = 0;

      if (newStep === BD.FINAL_STEP) score += diff === "pro" ? 160 : 135;
      if (wouldCaptureOpponent(color, newStep)) score += diff === "pro" ? 145 : diff === "easy" ? 70 : 115;
      if (currentStep <= 50 && newStep >= 51 && newStep < BD.FINAL_STEP) score += diff === "pro" ? 85 : 62;
      if (currentStep === -1) score += activeOnBoard === 0 ? 95 : diff === "pro" ? 56 : 45;
      if (newStep <= 50 && BD.isSafeStep(color, newStep)) score += diff === "pro" ? 60 : 45;
      if (diff === "pro" && currentStep >= 0 && currentStep <= 50 && BD.isSafeStep(color, currentStep)) score -= 18;

      if (diff !== "easy") {
        if (currentStep >= 0 && currentStep <= 50) {
          const curThreats = countThreatsAtTile(color, BD.getGlobalTrackIndex(color, currentStep));
          if (curThreats > 0) score += (diff === "pro" ? 72 : 54) * curThreats;
        }
        if (newStep >= 0 && newStep <= 50) {
          const newThreats = countThreatsAtTile(color, BD.getGlobalTrackIndex(color, newStep));
          if (newThreats > 0) {
            const progressPenalty = diff === "pro" ? newStep * 0.65 : 0;
            score -= (diff === "pro" ? 52 : 36) * newThreats + progressPenalty;
          }
        }
      }

      if (diff === "pro") score += countStrikeTargetsAhead(color, newStep) * 26;

      const noise = diff === "pro" ? Math.random() * 1.5 : diff === "easy" ? Math.random() * 25 : Math.random() * 4;
      score += newStep * (diff === "pro" ? 0.7 : 0.55) + noise;

      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    });

    return bestIdx;
  }

  // ==================== MATCH COMPLETION & PODIUM ====================
  async function finalizeMatch(mySession, winningTeam = null) {
    clearTurnTimer();
    clearLandingPreviews();
    hideRerollBtn();
    closeEmojiPopover();
    if (window.LUDO_UI && typeof window.LUDO_UI.closeGameMenu === "function") window.LUDO_UI.closeGameMenu();
    state.phase = "GAME_OVER";
    state.active = false;
    updateTurnUI();
    SFX.win();
    vibrate([40, 40, 80, 40, 120]);

    let finalColors;
    if (state.isTeam2v2 && winningTeam && state.teams) {
      const winners = state.activeColors.filter((c) => state.teams[c] === winningTeam);
      const losers = state.activeColors
        .filter((c) => state.teams[c] !== winningTeam)
        .sort((a, b) => getTotalProgress(b) - getTotalProgress(a));
      finalColors = [...winners, ...losers];
    } else {
      const remaining = state.activeColors
        .filter((c) => !state.finishedOrder.includes(c))
        .sort((a, b) => getTotalProgress(b) - getTotalProgress(a));
      finalColors = [...state.finishedOrder, ...remaining];
    }

    const rankings = finalColors.map((color, idx) => ({
      place: idx + 1,
      color,
      team: state.teams ? state.teams[color] : null,
      name: state.players[color].name,
      avatar: state.players[color].avatar,
      isBot: state.players[color].isBot
    }));

    await wait(520);
    if (mySession !== sessionId) return;

    if (window.LUDO_UI && typeof window.LUDO_UI.recordMatchResult === "function") {
      window.LUDO_UI.recordMatchResult({
        saveId: state.saveId,
        rankings,
        mode: state.mode,
        gameType: state.gameType,
        difficulty: state.difficulty,
        isCup: state.isCup,
        cupRound: state.cupRound,
        isTeam2v2: state.isTeam2v2,
        winningTeam,
        humanTeam: state.humanTeam,
        stake: state.stake,
        pot: state.pot
      });
    }
  }

  // ==================== TURN FLOW ====================
  async function startTurn(mySession) {
    if (!state.active || mySession !== sessionId) return;

    const color = getCurrentColor();
    const player = state.players[color];
    const spd = getSpeed();

    clearTurnTimer();
    clearLandingPreviews();
    hideRerollBtn();
    state.phase = "WAITING_ROLL";
    state.diceValue = null;
    updateTurnUI();
    renderTokens([]);

    if (player.isBot) {
      await wait(spd.botRollWait);
      if (!state.active || mySession !== sessionId) return;
      rollDice(color, mySession);
    } else {
      startTurnTimer(color, mySession, () => {
        if (!state.active || mySession !== sessionId || state.phase !== "WAITING_ROLL") return;
        rollDice(color, mySession);
      });
    }
  }

  async function rollDice(turnColor, mySession) {
    if (!state.active || mySession !== sessionId) return;
    if (state.phase !== "WAITING_ROLL" || turnColor !== getCurrentColor()) return;

    clearTurnTimer();
    clearLandingPreviews();
    hideRerollBtn();

    const player = state.players[turnColor];
    const ctrlColor = getControlledColor(turnColor);
    const spd = getSpeed();
    prevConsecutiveSixes = state.consecutiveSixes;

    state.phase = "ROLLING";
    updateTurnUI();
    SFX.dice();
    if (!player.isBot) vibrate(18);

    const rolled = Math.floor(Math.random() * 6) + 1;
    const spinDuration = spinDice3D(turnColor, rolled);

    await wait(spinDuration + 45);
    if (!state.active || mySession !== sessionId) return;

    const diceBtn = document.getElementById(`dice-${turnColor}`);
    if (diceBtn) diceBtn.classList.remove("rolling");

    state.diceValue = rolled;

    if (rolled === 6 && !player.isBot) trackMission("roll6", 1);

    if (rolled === 6) {
      state.consecutiveSixes += 1;
      if (state.consecutiveSixes >= 3) {
        SFX.forfeit();
        vibrate([45, 35, 45]);
        spawnBoardCallout(getRotatedYardCenter(turnColor), "3× SIXES! ❌", "callout-capture");
        triggerBotReaction(turnColor, "captured", 0.8);
        state.consecutiveSixes = 0;
        await wait(spd.forfeitWait);
        if (!state.active || mySession !== sessionId) return;
        advanceToNextPlayer(mySession);
        return;
      }
      spawnBoardCallout(getRotatedYardCenter(turnColor), "BONUS 6! 🎲", "callout-bonus");
      triggerBotReaction(turnColor, "happy", 0.45);
    } else {
      state.consecutiveSixes = 0;
    }

    const movable = getMovableTokenIndices(ctrlColor, rolled);
    const offerReroll = canOfferReroll(turnColor, rolled);
    const playerGems = window.LUDO_UI ? window.LUDO_UI.getProfile().gems : 0;

    if (movable.length === 0) {
      state.consecutiveSixes = 0;

      if (offerReroll && playerGems >= REROLL_GEM_COST) {
        state.phase = "WAITING_REROLL";
        showRerollBtn();
        startTurnTimer(turnColor, mySession, () => {
          if (!state.active || mySession !== sessionId || state.phase !== "WAITING_REROLL") return;
          hideRerollBtn();
          advanceToNextPlayer(mySession);
        }, 2800);
        return;
      }

      await wait(spd.noMoveWait);
      if (!state.active || mySession !== sessionId) return;
      advanceToNextPlayer(mySession);
      return;
    }

    state.phase = "WAITING_MOVE";
    renderTokens(movable);

    if (player.isBot) {
      await wait(spd.botMoveWait);
      if (!state.active || mySession !== sessionId) return;
      const chosenIdx = chooseBotMove(ctrlColor, movable, rolled);
      executeMove(turnColor, ctrlColor, chosenIdx, mySession);
      return;
    }

    renderLandingPreviews(ctrlColor, movable, rolled);
    if (offerReroll) showRerollBtn();

    const allInYard = movable.every((idx) => state.tokens[ctrlColor][idx] === -1);
    if (allInYard || (movable.length === 1 && (!offerReroll || playerGems < REROLL_GEM_COST))) {
      hideRerollBtn();
      clearLandingPreviews();
      await wait(spd.autoMoveWait);
      if (!state.active || mySession !== sessionId) return;
      executeMove(turnColor, ctrlColor, movable[0], mySession);
      return;
    }

    startTurnTimer(turnColor, mySession, () => {
      if (!state.active || mySession !== sessionId || state.phase !== "WAITING_MOVE") return;
      hideRerollBtn();
      clearLandingPreviews();
      const autoIdx = chooseBotMove(ctrlColor, movable, rolled, true);
      executeMove(turnColor, ctrlColor, autoIdx, mySession);
    });
  }

  function handleTokenClick(clickedColor, tokenIndex) {
    if (!state.active || state.phase !== "WAITING_MOVE") return;
    const turnColor = getCurrentColor();
    const ctrlColor = getControlledColor(turnColor);
    if (clickedColor !== ctrlColor || state.players[turnColor].isBot) return;

    const movable = getMovableTokenIndices(ctrlColor, state.diceValue);
    if (!movable.includes(tokenIndex)) return;

    clearTurnTimer();
    clearLandingPreviews();
    hideRerollBtn();
    executeMove(turnColor, ctrlColor, tokenIndex, sessionId);
  }

  async function executeMove(turnColor, ctrlColor, tokenIndex, mySession) {
    if (!state.active || mySession !== sessionId) return;

    clearTurnTimer();
    clearLandingPreviews();
    hideRerollBtn();

    const actingPlayer = state.players[turnColor];
    const dice = state.diceValue;
    const startStep = state.tokens[ctrlColor][tokenIndex];
    const spd = getSpeed();

    const wasThreatened =
      startStep >= 0 &&
      startStep <= 50 &&
      countThreatsAtTile(ctrlColor, BD.getGlobalTrackIndex(ctrlColor, startStep)) > 0;

    state.phase = "ANIMATING";
    renderTokens([]);

    if (startStep === -1) {
      state.tokens[ctrlColor][tokenIndex] = 0;
      SFX.unlock();
      if (!actingPlayer.isBot) vibrate(22);
      triggerHopArc(ctrlColor, tokenIndex, spd.hop);
      spawnHopSparkle(ctrlColor, tokenIndex, 0);
      renderTokens([]);
      await wait(spd.hop + spd.unlockPause);
    } else {
      for (let s = 1; s <= dice; s++) {
        if (!state.active || mySession !== sessionId) return;
        const prevStep = state.tokens[ctrlColor][tokenIndex];
        spawnHopSparkle(ctrlColor, tokenIndex, prevStep);
        state.tokens[ctrlColor][tokenIndex] = startStep + s;
        SFX.hop();
        triggerHopArc(ctrlColor, tokenIndex, spd.hop);
        renderTokens([]);
        await wait(spd.hop);
      }
    }

    if (!state.active || mySession !== sessionId) return;

    const landedStep = state.tokens[ctrlColor][tokenIndex];
    const landedPos = getRotatedTokenPos(ctrlColor, tokenIndex, landedStep);
    let capturedAny = false;
    let reachedHome = false;
    let playerJustFinished = false;

    if (landedStep === BD.FINAL_STEP) {
      reachedHome = true;
      SFX.home();
      vibrate([25, 30, 45]);
      spawnBoardCallout({ left: 50, top: 50 }, "HOME! 👑", "callout-home");
      showComboBanner("HOME! 👑", "combo-home");
      if (window.LUDO_UI) window.LUDO_UI.launchFireworks(1);
      if (!actingPlayer.isBot) trackMission("home", 1);
      triggerBotReaction(turnColor, "happy", 0.75);

      if (hasPlayerFinished(ctrlColor) && !state.finishedOrder.includes(ctrlColor)) {
        playerJustFinished = true;
        const placeIdx = state.finishedOrder.length;
        state.finishedOrder.push(ctrlColor);
        markPlayerFinishedUI(ctrlColor, placeIdx);

        if (state.isTeam2v2 && state.teams) {
          const teamId = state.teams[ctrlColor];
          if (isTeamComplete(teamId)) {
            await finalizeMatch(mySession, teamId);
            return;
          }
          SFX.win();
          if (window.LUDO_UI) {
            window.LUDO_UI.launchConfetti(55);
            window.LUDO_UI.showToast(`${state.players[ctrlColor].name} finished! Helping partner now 🤝`);
          }
          state.consecutiveSixes = 0;
          await wait(spd.bonusWait + 220);
          if (!state.active || mySession !== sessionId) return;
          startTurn(mySession);
          return;
        }

        const unfinishedColors = state.activeColors.filter((c) => !state.finishedOrder.includes(c));
        const onlyBotsLeft = unfinishedColors.every((c) => state.players[c].isBot);

        if (unfinishedColors.length <= 1 || (state.mode === "vs-bot" && onlyBotsLeft)) {
          await finalizeMatch(mySession);
          return;
        }

        SFX.win();
        if (window.LUDO_UI) {
          window.LUDO_UI.launchConfetti(55);
          window.LUDO_UI.showToast(`${state.players[ctrlColor].name} secured ${RANK_BADGES[placeIdx]}!`);
        }
        await wait(spd.captureWait + 220);
        if (!state.active || mySession !== sessionId) return;
        advanceToNextPlayer(mySession);
        return;
      }
    }

    if (startStep <= 50 && landedStep >= 51 && landedStep < BD.FINAL_STEP) {
      SFX.safe();
      showComboBanner(wasThreatened ? "SAFE ESCAPE! 🛡️" : "HOME STRETCH! 🚀", "combo-safe");
    }

    if (startStep >= 0 && landedStep >= 0 && landedStep <= 50 && BD.isSafeStep(ctrlColor, landedStep)) {
      SFX.safe();
      spawnBoardCallout(landedPos, "SAFE! 🛡️", "callout-safe");
      if (wasThreatened) showComboBanner("SAFE ESCAPE! 🛡️", "combo-safe");
    }

    if (landedStep >= 0 && landedStep <= 50 && !BD.isSafeStep(ctrlColor, landedStep)) {
      const landedGlobal = BD.getGlobalTrackIndex(ctrlColor, landedStep);
      const capturedVictims = new Set();
      const capturedList = [];

      state.activeColors.forEach((oppColor) => {
        if (oppColor === ctrlColor || isTeammate(ctrlColor, oppColor) || state.finishedOrder.includes(oppColor)) return;
        state.tokens[oppColor].forEach((oppStep, oppIdx) => {
          if (oppStep >= 0 && oppStep <= 50 && BD.getGlobalTrackIndex(oppColor, oppStep) === landedGlobal) {
            capturedAny = true;
            capturedVictims.add(oppColor);
            capturedList.push({ color: oppColor, idx: oppIdx, fromStep: oppStep });
          }
        });
      });

      if (capturedAny) {
        capturesThisTurn += capturedList.length;
        SFX.capture();
        vibrate([40, 30, 65]);
        spawnCaptureBurst(landedGlobal);
        spawnBoardCallout(getRotatedTrackPos(landedGlobal), "CAPTURED! 💥", "callout-capture");

        if (capturesThisTurn >= 2) showComboBanner("DOUBLE CAPTURE! 🔥", "combo-double");
        else showComboBanner("CAPTURE! 💥", "combo-capture");

        if (!actingPlayer.isBot) trackMission("capture", capturedList.length);

        triggerBotReaction(turnColor, "attack", 0.8);
        capturedVictims.forEach((victimColor) => triggerBotReaction(victimColor, "captured", 0.85));

        await animateCapturedTokensBack(capturedList, mySession);
        if (!state.active || mySession !== sessionId) return;
        renderTokens([]);
        await wait(spd.captureWait);
        if (!state.active || mySession !== sessionId) return;
      }
    }

    if (!playerJustFinished && (dice === 6 || capturedAny || reachedHome)) {
      if (capturedAny || reachedHome) state.consecutiveSixes = 0;
      await wait(spd.bonusWait);
      if (!state.active || mySession !== sessionId) return;
      startTurn(mySession);
    } else {
      advanceToNextPlayer(mySession);
    }
  }

  function advanceToNextPlayer(mySession) {
    if (!state.active || mySession !== sessionId) return;
    clearTurnTimer();
    clearLandingPreviews();
    hideRerollBtn();
    state.consecutiveSixes = 0;
    capturesThisTurn = 0;

    const total = state.activeColors.length;
    for (let step = 1; step <= total; step++) {
      const nextIdx = (state.turnIndex + step) % total;
      const nextColor = state.activeColors[nextIdx];

      if (state.isTeam2v2) {
        const ctrl = getControlledColor(nextColor);
        if (!hasPlayerFinished(ctrl)) {
          state.turnIndex = nextIdx;
          startTurn(mySession);
          return;
        }
      } else if (!state.finishedOrder.includes(nextColor)) {
        state.turnIndex = nextIdx;
        startTurn(mySession);
        return;
      }
    }
  }

  // ==================== PUBLIC CONTROLS ====================
  function startMatch(config) {
    sessionId += 1;
    const mySession = sessionId;

    clearTurnTimer();
    clearAllEmojis();
    clearLandingPreviews();
    clearComboBanner();
    hideRerollBtn();
    capturesThisTurn = 0;

    state = createEmptyState();
    state.active = true;
    state.saveId = config.saveId || generateSaveId();
    state.mode = config.mode || "vs-bot";
    state.gameType = config.gameType || "classic";
    state.difficulty = config.difficulty || "normal";
    state.isCup = Boolean(config.isCup);
    state.cupRound = Number(config.cupRound) || 0;
    state.cupTitle = config.cupTitle || "";
    state.isTeam2v2 = Boolean(config.isTeam2v2);
    state.teams = config.teams ? { ...config.teams } : null;
    state.humanTeam = config.humanTeam || null;
    state.stake = Number(config.stake) || 0;
    state.pot = Number(config.pot) || 0;
    state.activeColors = [...config.activeColors];
    state.players = config.players;
    state.finishedOrder = [];
    state.turnIndex = 0;
    state.tokens = BD.createInitialTokens(state.gameType);

    computeBoardRotation();
    buildBoardDOM();
    setupPlayerPanels();
    renderTokens([]);
    startTurn(mySession);
  }

  function resumeMatch(saved) {
    if (!saved || !Array.isArray(saved.activeColors)) return;

    sessionId += 1;
    const mySession = sessionId;

    clearTurnTimer();
    clearAllEmojis();
    clearLandingPreviews();
    clearComboBanner();
    hideRerollBtn();
    capturesThisTurn = 0;

    state = createEmptyState();
    state.active = true;
    state.saveId = saved.saveId || generateSaveId();
    state.mode = saved.mode || "vs-bot";
    state.gameType = saved.gameType || "classic";
    state.difficulty = saved.difficulty || "normal";
    state.isCup = Boolean(saved.isCup);
    state.cupRound = Number(saved.cupRound) || 0;
    state.cupTitle = saved.cupTitle || "";
    state.isTeam2v2 = Boolean(saved.isTeam2v2);
    state.teams = saved.teams ? { ...saved.teams } : null;
    state.humanTeam = saved.humanTeam || null;
    state.stake = Number(saved.stake) || 0;
    state.pot = Number(saved.pot) || 0;
    state.activeColors = [...saved.activeColors];
    state.players = saved.players;
    state.finishedOrder = Array.isArray(saved.finishedOrder) ? [...saved.finishedOrder] : [];
    state.turnIndex = Number(saved.turnIndex) || 0;
    state.consecutiveSixes = Number(saved.consecutiveSixes) || 0;
    state.rerollUsed = { red: false, green: false, yellow: false, blue: false, ...(saved.rerollUsed || {}) };
    state.tokens = saved.tokens;

    if (!state.isTeam2v2 && state.finishedOrder.includes(state.activeColors[state.turnIndex])) {
      const nextIdx = state.activeColors.findIndex((c) => !state.finishedOrder.includes(c));
      state.turnIndex = nextIdx >= 0 ? nextIdx : 0;
    }

    computeBoardRotation();
    buildBoardDOM();
    setupPlayerPanels();
    renderTokens([]);
    startTurn(mySession);
  }

  function saveAndExit() {
    persistMatchSnapshot();
    stopMatch();
  }

  function stopMatch() {
    sessionId += 1;
    clearTurnTimer();
    clearAllEmojis();
    clearLandingPreviews();
    clearComboBanner();
    hideRerollBtn();
    state.active = false;
    state.phase = "IDLE";

    BD.COLORS.forEach((color) => {
      const diceBtn = document.getElementById(`dice-${color}`);
      const yard = document.getElementById(`yard-${color}`);
      if (diceBtn) {
        diceBtn.disabled = true;
        diceBtn.classList.remove("can-roll", "rolling");
      }
      if (yard) yard.classList.remove("active-yard");
    });
  }

  function isMatchActive() {
    return Boolean(state.active && state.phase !== "IDLE" && state.phase !== "GAME_OVER");
  }

  function getCurrentSaveId() {
    return state.saveId || "";
  }

  function getReactionSenderColor() {
    let senderColor = getCurrentColor();
    if (state.mode === "vs-bot") {
      const humanColor = state.activeColors.find((c) => state.players[c] && !state.players[c].isBot);
      if (humanColor) senderColor = humanColor;
    }
    return senderColor;
  }

  // ==================== ONE-TIME DOM EVENT BINDINGS ====================
  function bindGameControls() {
    const rerollBtn = document.getElementById("btn-reroll");
    if (rerollBtn) rerollBtn.addEventListener("click", handleRerollClick);

    const toggleBtn = document.getElementById("btn-emoji-toggle");
    const popover = document.getElementById("emoji-popover");
    if (toggleBtn && popover) {
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!state.active) return;
        if (window.LUDO_UI && typeof window.LUDO_UI.closeGameMenu === "function") {
          window.LUDO_UI.closeGameMenu();
        }
        popover.classList.toggle("hidden");
        vibrate(10);
      });

      document.addEventListener("click", (e) => {
        if (popover.classList.contains("hidden")) return;
        if (!popover.contains(e.target) && !toggleBtn.contains(e.target)) {
          popover.classList.add("hidden");
        }
      });
    }

    const emojiBar = document.getElementById("emoji-bar");
    if (emojiBar) {
      emojiBar.addEventListener("click", (e) => {
        const btn = e.target.closest(".emoji-btn");
        if (!btn || !state.active) return;
        const emoji = btn.dataset.emoji;
        const senderColor = getReactionSenderColor();
        if (emoji && senderColor) {
          showEmojiBubble(senderColor, emoji, true, false);
          vibrate(15);
          closeEmojiPopover();
        }
      });
    }

    document.querySelectorAll("#quick-chat-bar .chat-pill-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!state.active) return;
        const msg = btn.dataset.chat;
        const senderColor = getReactionSenderColor();
        if (msg && senderColor) {
          showEmojiBubble(senderColor, msg, true, true);
          vibrate(15);
          closeEmojiPopover();
          scheduleBotChatReply(senderColor, msg);
        }
      });
    });

    window.addEventListener("pagehide", () => {
      if (isMatchActive()) persistMatchSnapshot();
    });
  }

  document.addEventListener("DOMContentLoaded", bindGameControls);

  return {
    startMatch,
    resumeMatch,
    saveAndExit,
    stopMatch,
    isMatchActive,
    getCurrentSaveId,
    refreshPieceSkins,
    getState: () => JSON.parse(JSON.stringify(state))
  };
})();


