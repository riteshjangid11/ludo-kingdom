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

  // ==================== MELODIOUS AUDIO & CUSTOM MP3 SOUND ENGINE ====================
  const SFX = (() => {
    let ctx = null;
    let masterBus = null;
    let noiseBuffer = null;
    let captureStopTimer = null;
    let winningActive = false;

    const CAPTURE_MAX_MS = 3000;
    const HOP_SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

    // Uniform balanced loudness target across all MP3 & synthesized SFX
    const UNIFORM_MP3_VOL = 0.46;

    function createTrack(src, { loop = false, volume = UNIFORM_MP3_VOL } = {}) {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.loop = loop;
      audio.volume = volume;
      return audio;
    }

    const tracks = {
      capture: createTrack("./capture.mp3", { loop: false, volume: UNIFORM_MP3_VOL }),
      home: createTrack("./get-home.mp3", { loop: false, volume: UNIFORM_MP3_VOL }),
      winning: createTrack("./winning.mp3", { loop: true, volume: UNIFORM_MP3_VOL })
    };

    function isSoundEnabled() {
      const settings = window.LUDO_UI ? window.LUDO_UI.getSettings() : { sound: true };
      return settings.sound !== false;
    }

    function getCtx() {
      if (!isSoundEnabled()) return null;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!ctx) {
        ctx = new AudioCtx();
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.setValueAtTime(-14, ctx.currentTime);
        comp.knee.setValueAtTime(12, ctx.currentTime);
        comp.ratio.setValueAtTime(4, ctx.currentTime);
        comp.attack.setValueAtTime(0.003, ctx.currentTime);
        comp.release.setValueAtTime(0.14, ctx.currentTime);

        const outGain = ctx.createGain();
        outGain.gain.setValueAtTime(0.95, ctx.currentTime);

        comp.connect(outGain);
        outGain.connect(ctx.destination);
        masterBus = comp;
      }
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      return ctx;
    }

    function getOutputNode(ac) {
      return masterBus || ac.destination;
    }

    function getNoiseBuffer(ac) {
      if (noiseBuffer && noiseBuffer.sampleRate === ac.sampleRate) return noiseBuffer;
      const len = Math.floor(ac.sampleRate * 0.045);
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.34));
      }
      noiseBuffer = buf;
      return buf;
    }

    // Warm marimba / bell / harp note level-matched to MP3 loudness
    function playMelodicNote(freq, duration = 0.16, volume = 0.34, delay = 0, harmonicMix = 0.24) {
      const ac = getCtx();
      if (!ac) return;
      const now = ac.currentTime + delay;
      const dest = getOutputNode(ac);

      const osc1 = ac.createOscillator();
      const gain1 = ac.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq, now);

      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.linearRampToValueAtTime(volume, now + 0.008);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(gain1);
      gain1.connect(dest);
      osc1.start(now);
      osc1.stop(now + duration + 0.02);

      if (harmonicMix > 0) {
        const osc2 = ac.createOscillator();
        const gain2 = ac.createGain();
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(freq * 2, now);

        gain2.gain.setValueAtTime(0.0001, now);
        gain2.gain.linearRampToValueAtTime(volume * harmonicMix, now + 0.006);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.65);

        osc2.connect(gain2);
        gain2.connect(dest);
        osc2.start(now);
        osc2.stop(now + duration * 0.7 + 0.02);
      }
    }

    // Crisp wooden dice rattle tap level-matched to MP3 tracks
    function playDiceHit(ac, delay, pitch, vol) {
      const now = ac.currentTime + delay;
      const dest = getOutputNode(ac);

      const src = ac.createBufferSource();
      src.buffer = getNoiseBuffer(ac);

      const filter = ac.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(pitch, now);
      filter.Q.setValueAtTime(2.6, now);

      const nGain = ac.createGain();
      nGain.gain.setValueAtTime(vol * 1.15, now);
      nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);

      src.connect(filter);
      filter.connect(nGain);
      nGain.connect(dest);
      src.start(now);

      const osc = ac.createOscillator();
      const oGain = ac.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(pitch * 0.34, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.2, now + 0.05);
      oGain.gain.setValueAtTime(0.0001, now);
      oGain.gain.linearRampToValueAtTime(vol * 0.68, now + 0.004);
      oGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.056);

      osc.connect(oGain);
      oGain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.06);
    }

    function stopTrack(audio) {
      if (!audio) return;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }

    function stopCapture() {
      if (captureStopTimer) {
        clearTimeout(captureStopTimer);
        captureStopTimer = null;
      }
      stopTrack(tracks.capture);
    }

    function stopHome() {
      stopTrack(tracks.home);
    }

    function stopWin() {
      winningActive = false;
      stopTrack(tracks.winning);
    }

    function stopAll() {
      stopCapture();
      stopHome();
      stopWin();
    }

    function isCapturePlaying() {
      const a = tracks.capture;
      return Boolean(a && !a.paused && !a.ended && a.currentTime > 0);
    }

    function syncSettings() {
      if (!isSoundEnabled()) {
        stopCapture();
        stopHome();
        try { tracks.winning.pause(); } catch {}
        return;
      }
      const winModal = document.getElementById("modal-win");
      const winVisible = winModal && !winModal.classList.contains("hidden");
      if (winningActive && winVisible && !document.hidden && tracks.winning.paused) {
        tracks.winning.play().catch(() => {});
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        stopCapture();
        stopHome();
        try { tracks.winning.pause(); } catch {}
      } else {
        const winModal = document.getElementById("modal-win");
        const winVisible = winModal && !winModal.classList.contains("hidden");
        if (winningActive && winVisible && isSoundEnabled()) {
          tracks.winning.play().catch(() => {});
        }
      }
    }

    function unlockAudio() {
      if (isSoundEnabled()) {
        getCtx();
      }
      Object.values(tracks).forEach((t) => {
        try {
          t.volume = UNIFORM_MP3_VOL;
          t.load();
        } catch {}
      });
    }

    return {
      unlockAudio,
      stopCapture,
      stopHome,
      stopWin,
      stopAll,
      syncSettings,
      handleVisibilityChange,
      dice() {
        const ac = getCtx();
        if (!ac) return;
        const hits = [
          { d: 0.0, p: 1380, v: 0.56 },
          { d: 0.075, p: 1680, v: 0.52 },
          { d: 0.16, p: 1290, v: 0.54 },
          { d: 0.255, p: 1560, v: 0.48 },
          { d: 0.355, p: 1180, v: 0.45 }
        ];
        hits.forEach((h) => playDiceHit(ac, h.d, h.p + (Math.random() * 110 - 55), h.v));
      },
      reroll() {
        const notes = [587.33, 739.99, 880.0, 1174.66, 1479.98];
        notes.forEach((n, idx) => playMelodicNote(n, 0.22, 0.32, idx * 0.055, 0.28));
      },
      hop(stepIdx = 0) {
        const freq = HOP_SCALE[Math.max(0, stepIdx) % HOP_SCALE.length];
        playMelodicNote(freq, 0.14, 0.34, 0, 0.22);
      },
      unlock() {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((n, idx) => playMelodicNote(n, 0.22, 0.34, idx * 0.055, 0.26));
      },
      safe() {
        const notes = [587.33, 739.99, 880.0, 1174.66];
        notes.forEach((n, idx) => playMelodicNote(n, 0.26, 0.32, idx * 0.05, 0.3));
      },
      capture() {
        if (!isSoundEnabled()) return;
        stopCapture();
        const a = tracks.capture;
        a.volume = UNIFORM_MP3_VOL;
        try {
          a.currentTime = 0;
          const p = a.play();
          captureStopTimer = setTimeout(() => stopCapture(), CAPTURE_MAX_MS);
          if (p && typeof p.catch === "function") {
            p.catch(() => {
              stopCapture();
              playMelodicNote(523.25, 0.12, 0.34, 0, 0.25);
              playMelodicNote(392.0, 0.15, 0.34, 0.07, 0.22);
              playMelodicNote(261.63, 0.24, 0.36, 0.14, 0.18);
            });
          }
        } catch {
          playMelodicNote(523.25, 0.12, 0.34, 0, 0.25);
          playMelodicNote(392.0, 0.15, 0.34, 0.07, 0.22);
          playMelodicNote(261.63, 0.24, 0.36, 0.14, 0.18);
        }
      },
      slideTick() {
        if (isCapturePlaying()) return;
        playMelodicNote(440.0, 0.06, 0.22, 0, 0.15);
      },
      home() {
        if (!isSoundEnabled()) return;
        stopHome();
        const a = tracks.home;
        a.volume = UNIFORM_MP3_VOL;
        try {
          a.currentTime = 0;
          const p = a.play();
          if (p && typeof p.catch === "function") {
            p.catch(() => {
              const notes = [523.25, 659.25, 783.99, 1046.5];
              notes.forEach((n, idx) => playMelodicNote(n, 0.26, 0.34, idx * 0.07, 0.28));
            });
          }
        } catch {
          const notes = [523.25, 659.25, 783.99, 1046.5];
          notes.forEach((n, idx) => playMelodicNote(n, 0.26, 0.34, idx * 0.07, 0.28));
        }
      },
      forfeit() {
        const notes = [392.0, 329.63, 261.63];
        notes.forEach((n, idx) => playMelodicNote(n, 0.22, 0.34, idx * 0.11, 0.14));
      },
      emoji() {
        playMelodicNote(783.99, 0.11, 0.3, 0, 0.25);
        playMelodicNote(1046.5, 0.15, 0.3, 0.06, 0.25);
      },
      playerFinish() {
        const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
        notes.forEach((n, idx) => playMelodicNote(n, 0.28, 0.36, idx * 0.08, 0.3));
      },
      win() {
        if (!isSoundEnabled()) return;
        stopCapture();
        stopHome();
        winningActive = true;
        const a = tracks.winning;
        a.volume = UNIFORM_MP3_VOL;
        a.loop = true;
        try {
          a.currentTime = 0;
          const p = a.play();
          if (p && typeof p.catch === "function") {
            p.catch(() => {
              const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
              notes.forEach((n, idx) => playMelodicNote(n, 0.32, 0.36, idx * 0.11, 0.3));
            });
          }
        } catch {
          const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
          notes.forEach((n, idx) => playMelodicNote(n, 0.32, 0.36, idx * 0.11, 0.3));
        }
      }
    };
  })();

  // ==================== CENTRAL GAME STATE ====================
  let state = createEmptyState();
  let rotQuarter = 0; // Clockwise 90-deg steps (0..3) so Human always sits in Bottom-Left!
  let sessionId = 0;
  let tokenEls = {};
  let turnTimerInterval = null;
  let autoMoveTimer = null;
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

  // ==================== PAUSE & ONLINE SYNC CONTROLLERS ====================
  let isPaused = false;
  let pauseWaiters = [];
  let timerMeta = null;     // { color, session, onTimeout, remainingMs, totalMs, startedAt }
  let autoMoveMeta = null;  // { callback, remainingMs, startedAt }

  let onlineSeq = 0;
  let onlineQueue = [];
  let onlineQueueBusy = false;
  let onlineActionSentSeq = 0;
  let hostWatchdogTimer = null;

  function generateSaveId() {
    return `match_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  }

  function createEmptyState() {
    return {
      active: false,
      saveId: "",
      mode: "vs-bot",
      roomCode: "",
      isPublic: false,
      localColor: null,
      localUid: "",
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
      dryYardRolls: { red: 0, green: 0, yellow: 0, blue: 0 },
      rerollUsed: { red: false, green: false, yellow: false, blue: false },
      tokens: BD.createInitialTokens("classic")
    };
  }

  // ==================== BOARD ROTATION (HUMAN ALWAYS BOTTOM-LEFT) ====================
  function computeBoardRotation() {
    let targetBottomLeftColor = "blue";
    if (state.mode === "online" && state.localColor) {
      targetBottomLeftColor = state.localColor;
    } else if (state.mode === "vs-bot") {
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
      : { sound: true, music: true, vibration: true, timer: true, autoMove: true, speed: "medium", theme: "classic", tokenSkin: "pin", frame: "bronze" };
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
    return new Promise((resolve) => {
      let remaining = Math.max(0, Number(ms) || 0);
      let timerId = null;
      let startedAt = 0;

      const finish = () => {
        cleanup();
        resolve();
      };

      const onPause = () => {
        if (timerId !== null) {
          clearTimeout(timerId);
          timerId = null;
          remaining = Math.max(0, remaining - (Date.now() - startedAt));
        }
      };

      const onResume = () => {
        if (!isPaused && timerId === null) {
          startedAt = Date.now();
          timerId = setTimeout(finish, remaining);
        }
      };

      const waiter = { onPause, onResume, cancel: finish };
      const cleanup = () => {
        if (timerId !== null) {
          clearTimeout(timerId);
          timerId = null;
        }
        const idx = pauseWaiters.indexOf(waiter);
        if (idx >= 0) pauseWaiters.splice(idx, 1);
      };

      pauseWaiters.push(waiter);
      if (!isPaused || state.mode === "online") {
        startedAt = Date.now();
        timerId = setTimeout(finish, remaining);
      }
    });
  }

  function flushPauseWaiters() {
    const copy = [...pauseWaiters];
    pauseWaiters = [];
    copy.forEach((w) => w.cancel());
  }

  function clearHostWatchdog() {
    if (hostWatchdogTimer) {
      clearTimeout(hostWatchdogTimer);
      hostWatchdogTimer = null;
    }
  }

  function scheduleAutoMove(delayMs, callback) {
    clearAutoMoveTimer();
    autoMoveMeta = {
      callback,
      remainingMs: Math.max(0, delayMs),
      startedAt: Date.now()
    };
    if (!isPaused || state.mode === "online") {
      autoMoveTimer = setTimeout(() => {
        const cb = autoMoveMeta ? autoMoveMeta.callback : null;
        autoMoveTimer = null;
        autoMoveMeta = null;
        if (typeof cb === "function") cb();
      }, autoMoveMeta.remainingMs);
    }
  }

  function pauseGame({ openMenu = true } = {}) {
    if (!state.active || state.phase === "GAME_OVER" || state.phase === "IDLE") return;
    if (state.mode === "online") {
      SFX.stopCapture();
      SFX.stopHome();
      return;
    }

    if (!isPaused) {
      isPaused = true;
      const gs = document.getElementById("game-screen");
      if (gs) gs.classList.add("game-paused");

      pauseWaiters.forEach((w) => w.onPause());

      if (turnTimerInterval && timerMeta) {
        clearInterval(turnTimerInterval);
        turnTimerInterval = null;
        timerMeta.remainingMs = Math.max(0, timerMeta.remainingMs - (Date.now() - timerMeta.startedAt));
      }

      if (autoMoveTimer && autoMoveMeta) {
        clearTimeout(autoMoveTimer);
        autoMoveTimer = null;
        autoMoveMeta.remainingMs = Math.max(0, autoMoveMeta.remainingMs - (Date.now() - autoMoveMeta.startedAt));
      }

      SFX.stopCapture();
      SFX.stopHome();
    }

    const resumeBtn = document.getElementById("btn-menu-resume");
    if (resumeBtn) resumeBtn.classList.remove("hidden");

    if (openMenu) {
      closeEmojiPopover();
      const pop = document.getElementById("game-menu-popover");
      if (pop) pop.classList.remove("hidden");
    }
  }

  function resumeGame() {
    const resumeBtn = document.getElementById("btn-menu-resume");
    if (resumeBtn) resumeBtn.classList.add("hidden");

    const gs = document.getElementById("game-screen");
    if (gs) gs.classList.remove("game-paused");

    if (!isPaused) return;
    isPaused = false;

    if (timerMeta && state.active && timerMeta.session === sessionId) {
      runTurnTimerInterval();
    }

    if (autoMoveMeta && state.active && !autoMoveTimer) {
      autoMoveMeta.startedAt = Date.now();
      autoMoveTimer = setTimeout(() => {
        const cb = autoMoveMeta ? autoMoveMeta.callback : null;
        autoMoveTimer = null;
        autoMoveMeta = null;
        if (typeof cb === "function") cb();
      }, autoMoveMeta.remainingMs);
    }

    pauseWaiters.forEach((w) => w.onResume());
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
    if (state.mode === "online") return false;
    if (state.players[color].isBot) return false;
    if (rolled === 6) return false;
    if (state.rerollUsed[color]) return false;
    return true;
  }

  function clearAutoMoveTimer() {
    if (autoMoveTimer) {
      clearTimeout(autoMoveTimer);
      autoMoveTimer = null;
    }
    autoMoveMeta = null;
  }

  function showRerollBtn(color) {
    // Keep legacy bottom-right pill permanently hidden; show compact chip directly on dice slot
    const legacyBtn = document.getElementById("btn-reroll");
    if (legacyBtn) legacyBtn.classList.add("hidden");

    document.querySelectorAll(".dice-reroll-chip").forEach((el) => el.classList.add("hidden"));
    const targetColor = color || getCurrentColor();
    if (!targetColor) return;
    const chip = document.getElementById(`reroll-chip-${targetColor}`);
    if (chip) chip.classList.remove("hidden");
  }

  function hideRerollBtn() {
    const legacyBtn = document.getElementById("btn-reroll");
    if (legacyBtn) legacyBtn.classList.add("hidden");
    document.querySelectorAll(".dice-reroll-chip").forEach((el) => el.classList.add("hidden"));
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
    clearAutoMoveTimer();
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

  // ==================== HD 3D DICE SKIN APPLICATION (HERO PNG + *_face.webp CUBE FACES) ====================
  const faceTileCache = new Map();

  function loadFaceTileAsset(skinId) {
    const url = `./assets/dice/${skinId}_face.webp`;
    if (faceTileCache.has(url)) return faceTileCache.get(url);

    const promise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ ok: true, src: url });
      img.onerror = () => resolve({ ok: false, src: "" });
      img.src = url;
    });

    faceTileCache.set(url, promise);
    return promise;
  }

  function applyFaceTileImagesToCube(diceBtn, tileSrc) {
    if (!diceBtn || !tileSrc) return;
    diceBtn.querySelectorAll(".cube-face").forEach((face) => {
      let tileImg = face.querySelector(".dice-face-tile-img");
      if (!tileImg) {
        tileImg = document.createElement("img");
        tileImg.className = "dice-face-tile-img";
        tileImg.alt = "";
        tileImg.setAttribute("aria-hidden", "true");
        face.insertBefore(tileImg, face.firstChild);
      }
      tileImg.src = tileSrc;
    });
    diceBtn.classList.add("hd-textured");
  }

  function clearFaceTileImagesFromCube(diceBtn) {
    if (!diceBtn) return;
    diceBtn.classList.remove("hd-textured");
    diceBtn.querySelectorAll(".dice-face-tile-img").forEach((el) => el.remove());
  }

  function applyDiceSkinToBox(diceBtn, skinId) {
    if (!diceBtn) return;
    const activeSkin = skinId || getSettings().diceSkin || "classic";
    diceBtn.dataset.diceSkin = activeSkin;
    Array.from(diceBtn.classList).forEach((cls) => {
      if (cls.startsWith("dice-skin-")) diceBtn.classList.remove(cls);
    });
    diceBtn.classList.add(`dice-skin-${activeSkin}`);

    const oldBg = diceBtn.querySelector(".dice-hd-art-bg");
    if (oldBg) oldBg.remove();
    const oldHero = diceBtn.querySelector(".dice-hd-hero-img");
    if (oldHero) oldHero.remove();
    clearFaceTileImagesFromCube(diceBtn);

    diceBtn.classList.remove("has-hd-skin", "hd-loaded");

    if (
      window.LUDO_UI &&
      typeof window.LUDO_UI.isHDDiceSkin === "function" &&
      window.LUDO_UI.isHDDiceSkin(activeSkin)
    ) {
      diceBtn.classList.add("has-hd-skin");

      // 1. Load flat blank HD face tile (*_face.webp) for all 6 spinning & landed cube faces
      loadFaceTileAsset(activeSkin).then((tileRes) => {
        if (!tileRes.ok || !diceBtn.isConnected || diceBtn.dataset.diceSkin !== activeSkin) return;
        applyFaceTileImagesToCube(diceBtn, tileRes.src);
      });

      // 2. Load angled HD 3D dice PNG for idle / ready-to-roll hero state
      if (typeof window.LUDO_UI.loadDiceAsset === "function") {
        window.LUDO_UI.loadDiceAsset(activeSkin).then((res) => {
          if (!res.ok || !diceBtn.isConnected || diceBtn.dataset.diceSkin !== activeSkin) return;
          if (!diceBtn.querySelector(".dice-hd-hero-img")) {
            const heroImg = document.createElement("img");
            heroImg.className = "dice-hd-hero-img";
            heroImg.src = res.src;
            heroImg.alt = "";
            heroImg.setAttribute("aria-hidden", "true");
            diceBtn.appendChild(heroImg);
          }
          diceBtn.classList.add("hd-loaded");
        });
      }
    }
  }

  function refreshDiceSkins(skinId) {
    const activeSkin = skinId || getSettings().diceSkin || "classic";
    BD.COLORS.forEach((color) => {
      const diceBtn = document.getElementById(`dice-${color}`);
      if (!diceBtn) return;
      if (state.mode === "online") {
        if (color === state.localColor) {
          if (state.players[color]) state.players[color].diceSkin = activeSkin;
          applyDiceSkinToBox(diceBtn, activeSkin);
        }
        return;
      }
      applyDiceSkinToBox(diceBtn, activeSkin);
    });
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
    const playerDiceSkin =
      state.mode === "online" && state.players[color] && state.players[color].diceSkin
        ? state.players[color].diceSkin
        : (getSettings().diceSkin || "classic");
    applyDiceSkinToBox(diceBtn, playerDiceSkin);

    diceBtn.addEventListener("click", () => {
      if (!state.active || isPaused || state.phase !== "WAITING_ROLL") return;
      if (color !== getCurrentColor()) return;
      if (state.mode === "online") {
        if (!isLocalOnlineHumanTurn()) return;
        submitOnlineRoll(color, sessionId);
        return;
      }
      if (state.players[color].isBot) return;
      rollDice(color, sessionId);
    });

    return diceBtn;
  }

  function resetDiceInstant(color, value = 6) {
    const diceBtn = document.getElementById(`dice-${color}`);
    if (!diceBtn) return;
    diceBtn.classList.remove("rolling");
    diceBtn.classList.add("dice-idle-hero");

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

    diceSpins[color].x += 2 + Math.floor(Math.random() * 2);
    diceSpins[color].y += 2 + Math.floor(Math.random() * 2);

    const finalX = diceSpins[color].x * 360 + angle.x;
    const finalY = diceSpins[color].y * 360 + angle.y;

    diceBtn.style.setProperty("--dice-spin-ms", `${durationMs}ms`);
    diceBtn.classList.remove("rolling", "dice-idle-hero");
    if (stage) {
      stage.classList.remove("dice-tumble-active");
      void stage.offsetWidth;
    }

    cube.style.transitionDuration = `${durationMs}ms`;
    cube.style.transform = `rotateX(${finalX}deg) rotateY(${finalY}deg)`;

    diceBtn.classList.add("rolling");
    if (stage) {
      stage.style.animationDuration = `${durationMs}ms`;
      void stage.offsetWidth;
    }

    return durationMs;
  }

  // ==================== 15-SECOND TURN TIMER (PAUSE-AWARE) ====================
  function clearTurnTimer() {
    clearAutoMoveTimer();
    clearHostWatchdog();
    if (turnTimerInterval) {
      clearInterval(turnTimerInterval);
      turnTimerInterval = null;
    }
    timerMeta = null;
    BD.COLORS.forEach((c) => {
      const fill = document.getElementById(`timer-${c}`);
      if (fill) {
        fill.style.width = "0%";
        fill.classList.remove("urgent");
      }
    });
  }

  function runTurnTimerInterval() {
    if (!timerMeta) return;
    if (turnTimerInterval) {
      clearInterval(turnTimerInterval);
      turnTimerInterval = null;
    }
    timerMeta.startedAt = Date.now();

    turnTimerInterval = setInterval(() => {
      if (!state.active || !timerMeta || timerMeta.session !== sessionId) {
        clearTurnTimer();
        return;
      }
      if (isPaused && state.mode !== "online") return;

      const elapsed = Date.now() - timerMeta.startedAt;
      const remaining = Math.max(0, timerMeta.remainingMs - elapsed);
      const pct = Math.min(100, (remaining / timerMeta.totalMs) * 100);

      const fill = document.getElementById(`timer-${timerMeta.color}`);
      if (fill) {
        fill.style.width = `${pct}%`;
        fill.classList.toggle("urgent", pct <= 30);
      }

      if (remaining <= 0) {
        const cb = timerMeta.onTimeout;
        clearTurnTimer();
        if (typeof cb === "function") cb();
      }
    }, 100);
  }

  function startTurnTimer(color, mySession, onTimeout, customDurationMs = TURN_LIMIT_MS, forceEnable = false) {
    clearTurnTimer();
    if (!forceEnable && state.mode !== "online" && !getSettings().timer && customDurationMs === TURN_LIMIT_MS) return;

    const fill = document.getElementById(`timer-${color}`);
    if (fill) {
      fill.style.width = "100%";
      fill.classList.remove("urgent");
    }

    timerMeta = {
      color,
      session: mySession,
      onTimeout,
      remainingMs: customDurationMs,
      totalMs: customDurationMs,
      startedAt: Date.now()
    };

    if (!isPaused || state.mode === "online") {
      runTurnTimerInterval();
    }
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

      if (state.mode === "online" && state.activeColors.includes(color) && state.players[color]) {
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
      const isOnline = state.mode === "online";
      const isBot = Boolean(player.isBot) && !isOnline;
      const showOnlineOpponentName = isOnline && Boolean(player.isOnlineOpponent);

      const panel = document.createElement("div");
      panel.id = `panel-${color}`;
      panel.className =
        `player-panel panel-${color}` +
        (isBot ? " bot-compact" : " compact-minimal") +
        (showOnlineOpponentName ? " has-online-name" : "");

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
        // Minimal Human Dock: Ornate Square Avatar + Dice Slot with Compact Re-Roll Chip (No Name Offline/AI)
        const diceSlotWrap = document.createElement("div");
        diceSlotWrap.className = "dice-slot-wrap";
        diceSlotWrap.appendChild(diceBtn);

        const rerollChip = document.createElement("button");
        rerollChip.type = "button";
        rerollChip.id = `reroll-chip-${color}`;
        rerollChip.className = "dice-reroll-chip hidden";
        rerollChip.title = "Re-roll dice (5 Gems)";
        rerollChip.setAttribute("aria-label", "Re-roll dice for 5 Gems");
        rerollChip.textContent = "↻ 5💎";
        rerollChip.addEventListener("click", (e) => {
          e.stopPropagation();
          handleRerollClick();
        });
        diceSlotWrap.appendChild(rerollChip);

        const info = document.createElement("div");
        info.className = "p-info" + (isRightSide ? " right-align" : "");

        const frameBox = document.createElement("div");
        frameBox.className = "avatar-frame-box frame-46";

        const avatarEl = document.createElement("span");
        avatarEl.id = `avatar-${color}`;
        avatarEl.className = "p-avatar square-avatar-inner";
        if (window.LUDO_UI && typeof window.LUDO_UI.renderAvatar === "function") {
          window.LUDO_UI.renderAvatar(avatarEl, player.avatar);
        } else {
          avatarEl.textContent = player.avatar || "🤴";
        }

        const frameOverlay = document.createElement("div");
        const activeFrame = player.frame || getSettings().frame || "bronze";
        frameOverlay.id = `frame-${color}`;
        frameOverlay.className = `frame-overlay frame-${activeFrame}`;
        frameOverlay.setAttribute("aria-hidden", "true");

        frameBox.appendChild(avatarEl);
        frameBox.appendChild(frameOverlay);
        if (window.LUDO_UI && typeof window.LUDO_UI.applyFrameVisual === "function") {
          window.LUDO_UI.applyFrameVisual(frameOverlay, activeFrame);
        }

        const meta = document.createElement("div");
        meta.className = "p-meta" + (isRightSide ? " right-align" : "");

        const nameEl = document.createElement("span");
        nameEl.id = `name-${color}`;
        nameEl.className = "p-name";
        nameEl.textContent = showOnlineOpponentName ? player.name : "";

        const teamEl = document.createElement("span");
        teamEl.id = `team-${color}`;
        if (state.isTeam2v2 && state.teams && state.teams[color]) {
          teamEl.className = "p-team-tag";
          teamEl.textContent = `TEAM ${state.teams[color]}`;
        } else {
          teamEl.className = "p-team-tag hidden";
        }

        meta.appendChild(nameEl);
        meta.appendChild(teamEl);

        const rankEl = document.createElement("span");
        rankEl.id = `rank-${color}`;
        rankEl.className = "p-rank hidden";

        if (isRightSide) {
          info.appendChild(meta);
          info.appendChild(frameBox);
          panel.appendChild(diceSlotWrap);
          panel.appendChild(info);
        } else {
          info.appendChild(frameBox);
          info.appendChild(meta);
          panel.appendChild(info);
          panel.appendChild(diceSlotWrap);
        }
        panel.appendChild(rankEl);
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
        const canLocalControl =
          state.mode === "online"
            ? isLocalOnlineHumanTurn()
            : Boolean(state.players[turnColor] && !state.players[turnColor].isBot);

        const isMovable =
          state.phase === "WAITING_MOVE" &&
          color === ctrlColor &&
          canLocalControl &&
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
        const canHumanRoll =
          isCurrent &&
          state.phase === "WAITING_ROLL" &&
          (state.mode === "online" ? isLocalOnlineHumanTurn() : Boolean(player && !player.isBot));
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
    SFX.stopCapture();
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

    if (state.mode === "online" && window.LUDO_ONLINE && typeof window.LUDO_ONLINE.markMatchFinished === "function") {
      window.LUDO_ONLINE.markMatchFinished();
    }

    SFX.win();
    if (window.LUDO_UI && typeof window.LUDO_UI.recordMatchResult === "function") {
      window.LUDO_UI.recordMatchResult({
        saveId: state.saveId,
        rankings,
        mode: state.mode,
        localColor: state.localColor,
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

  // ==================== ANTI-DROUGHT FAIR DICE BALANCER ====================
  function isStuckWithNoActiveTokens(ctrlColor) {
    const toks = state.tokens && state.tokens[ctrlColor];
    if (!Array.isArray(toks)) return false;
    const hasYardToken = toks.some((s) => s === -1);
    const hasBoardToken = toks.some((s) => s >= 0 && s < BD.HOME_STEP);
    return hasYardToken && !hasBoardToken;
  }

  function hasOpponentAdvancedFar(turnColor) {
    for (const c of state.activeColors) {
      if (c === turnColor) continue;
      const toks = state.tokens && state.tokens[c];
      if (!Array.isArray(toks)) continue;
      if (toks.some((s) => s >= 26)) return true;
    }
    return false;
  }

  function updateDryYardTracker(turnColor, rolled) {
    if (!state.dryYardRolls) state.dryYardRolls = { red: 0, green: 0, yellow: 0, blue: 0 };
    const ctrlColor = getControlledColor(turnColor);
    if (!isStuckWithNoActiveTokens(ctrlColor) || rolled === 6) {
      state.dryYardRolls[turnColor] = 0;
    } else {
      state.dryYardRolls[turnColor] = (state.dryYardRolls[turnColor] || 0) + 1;
    }
  }

  function rollBalancedDie(turnColor) {
    if (!state.dryYardRolls) state.dryYardRolls = { red: 0, green: 0, yellow: 0, blue: 0 };
    const ctrlColor = getControlledColor(turnColor);

    if (!isStuckWithNoActiveTokens(ctrlColor)) {
      state.dryYardRolls[turnColor] = 0;
      return Math.floor(Math.random() * 6) + 1;
    }

    const dry = state.dryYardRolls[turnColor] || 0;
    const behindOpponent = hasOpponentAdvancedFar(turnColor);

    // Smooth anti-drought probability curve so no player gets trapped in the box
    let sixChance = 1 / 6;
    if (behindOpponent) {
      if (dry >= 5) sixChance = 1.0;
      else if (dry === 4) sixChance = 0.72;
      else if (dry === 3) sixChance = 0.50;
      else if (dry === 2) sixChance = 0.34;
      else sixChance = 0.22;
    } else {
      if (dry >= 7) sixChance = 1.0;
      else if (dry === 6) sixChance = 0.65;
      else if (dry === 5) sixChance = 0.48;
      else if (dry === 4) sixChance = 0.35;
      else if (dry === 3) sixChance = 0.25;
      else sixChance = 1 / 6;
    }

    if (Math.random() < sixChance) {
      return 6;
    }
    return Math.floor(Math.random() * 5) + 1;
  }

  // ==================== ONLINE MULTIPLAYER SYNC ENGINE ====================
  function isLocalOnlineHumanTurn() {
    if (state.mode !== "online") return false;
    const cur = getCurrentColor();
    const p = cur ? state.players[cur] : null;
    return Boolean(cur && cur === state.localColor && p && !p.isBot && !p.left);
  }

  function isLocalOnlineHost() {
    if (state.mode !== "online" || !window.LUDO_ONLINE) return false;
    return window.LUDO_ONLINE.isHostForRoom(state.players, state.activeColors);
  }

  function shouldHostPlayOnlineColor(color) {
    if (state.mode !== "online" || !isLocalOnlineHost()) return false;
    const p = state.players[color];
    if (!p) return false;
    return Boolean(p.isBot || p.disconnected || p.left);
  }

  function submitOnlineRoll(color, mySession) {
    if (!state.active || mySession !== sessionId || state.mode !== "online") return;
    if (state.phase !== "WAITING_ROLL" || color !== getCurrentColor()) return;
    const nextSeq = onlineSeq + 1;
    if (onlineActionSentSeq === nextSeq) return;
    onlineActionSentSeq = nextSeq;

    clearTurnTimer();
    const diceBtn = document.getElementById(`dice-${color}`);
    if (diceBtn) {
      diceBtn.disabled = true;
      diceBtn.classList.remove("can-roll");
    }

    const rolled = rollBalancedDie(color);
    if (window.LUDO_ONLINE) {
      window.LUDO_ONLINE.pushAction(nextSeq, {
        type: "ROLL",
        color,
        rolled,
        byUid: state.localUid
      });
    }
  }

  function submitOnlineMove(turnColor, ctrlColor, tokenIndex, mySession) {
    if (!state.active || mySession !== sessionId || state.mode !== "online") return;
    if (state.phase !== "WAITING_MOVE" || turnColor !== getCurrentColor()) return;
    const nextSeq = onlineSeq + 1;
    if (onlineActionSentSeq === nextSeq) return;
    onlineActionSentSeq = nextSeq;

    clearTurnTimer();
    clearLandingPreviews();
    renderTokens([]);

    if (window.LUDO_ONLINE) {
      window.LUDO_ONLINE.pushAction(nextSeq, {
        type: "MOVE",
        turnColor,
        ctrlColor,
        tokenIndex,
        byUid: state.localUid
      });
    }
  }

  function scheduleHostOnlineTurnIfNeeded(mySession) {
    if (!state.active || mySession !== sessionId || state.mode !== "online") return;
    const color = getCurrentColor();
    const player = state.players[color];
    if (!player) return;
    const spd = getSpeed();

    if (state.phase === "WAITING_ROLL") {
      if (shouldHostPlayOnlineColor(color)) {
        const delay = player.isBot ? spd.botRollWait : 1400;
        clearHostWatchdog();
        hostWatchdogTimer = setTimeout(() => {
          hostWatchdogTimer = null;
          if (!state.active || mySession !== sessionId || state.phase !== "WAITING_ROLL") return;
          if (getCurrentColor() !== color) return;
          submitOnlineRoll(color, mySession);
        }, delay);
      } else if (isLocalOnlineHost() && color !== state.localColor) {
        const expectedSeq = onlineSeq;
        clearHostWatchdog();
        hostWatchdogTimer = setTimeout(() => {
          hostWatchdogTimer = null;
          if (!state.active || mySession !== sessionId || onlineSeq !== expectedSeq) return;
          if (state.phase === "WAITING_ROLL" && getCurrentColor() === color) {
            submitOnlineRoll(color, mySession);
          }
        }, TURN_LIMIT_MS + 4200);
      }
    } else if (state.phase === "WAITING_MOVE") {
      const ctrlColor = getControlledColor(color);
      const movable = getMovableTokenIndices(ctrlColor, state.diceValue);
      if (movable.length === 0) return;

      if (shouldHostPlayOnlineColor(color)) {
        const delay = player.isBot ? spd.botMoveWait : 1100;
        clearHostWatchdog();
        hostWatchdogTimer = setTimeout(() => {
          hostWatchdogTimer = null;
          if (!state.active || mySession !== sessionId || state.phase !== "WAITING_MOVE") return;
          if (getCurrentColor() !== color) return;
          const chosen = chooseBotMove(ctrlColor, movable, state.diceValue, true);
          submitOnlineMove(color, ctrlColor, chosen, mySession);
        }, delay);
      } else if (isLocalOnlineHost() && color !== state.localColor) {
        const expectedSeq = onlineSeq;
        clearHostWatchdog();
        hostWatchdogTimer = setTimeout(() => {
          hostWatchdogTimer = null;
          if (!state.active || mySession !== sessionId || onlineSeq !== expectedSeq) return;
          if (state.phase === "WAITING_MOVE" && getCurrentColor() === color) {
            const chosen = chooseBotMove(ctrlColor, movable, state.diceValue, true);
            submitOnlineMove(color, ctrlColor, chosen, mySession);
          }
        }, TURN_LIMIT_MS + 4200);
      }
    }
  }

  function handleIncomingOnlineAction(action) {
    if (!state.active || state.mode !== "online" || !action || typeof action.seq !== "number") return;
    if (action.seq <= onlineSeq) return;
    if (onlineQueue.some((a) => a.seq === action.seq)) return;
    onlineQueue.push(action);
    onlineQueue.sort((a, b) => a.seq - b.seq);
    drainOnlineQueue(sessionId);
  }

  async function drainOnlineQueue(mySession) {
    if (onlineQueueBusy) return;
    onlineQueueBusy = true;

    try {
      while (state.active && mySession === sessionId && onlineQueue.length > 0) {
        const next = onlineQueue[0];
        if (next.seq <= onlineSeq) {
          onlineQueue.shift();
          continue;
        }
        if (next.seq !== onlineSeq + 1) break;

        onlineQueue.shift();
        onlineSeq = next.seq;
        onlineActionSentSeq = Math.max(onlineActionSentSeq, onlineSeq);

        if (next.type === "ROLL") {
          await applyOnlineRollAction(next, mySession);
        } else if (next.type === "MOVE") {
          await executeMove(next.turnColor, next.ctrlColor, next.tokenIndex, mySession);
        }
      }
    } finally {
      onlineQueueBusy = false;
    }

    if (state.active && mySession === sessionId && onlineQueue.length > 0 && onlineQueue[0].seq === onlineSeq + 1) {
      drainOnlineQueue(mySession);
    }
  }

  async function applyOnlineRollAction(action, mySession) {
    const turnColor = action.color;
    const rolled = Math.min(6, Math.max(1, Number(action.rolled) || 1));
    if (!state.active || mySession !== sessionId || turnColor !== getCurrentColor()) return;

    clearTurnTimer();
    clearLandingPreviews();
    hideRerollBtn();

    const ctrlColor = getControlledColor(turnColor);
    const spd = getSpeed();
    const isMe = turnColor === state.localColor;
    prevConsecutiveSixes = state.consecutiveSixes;

    state.phase = "ROLLING";
    updateTurnUI();
    SFX.stopCapture();
    SFX.dice();
    if (isMe) vibrate(18);

    const spinDuration = spinDice3D(turnColor, rolled);
    await wait(spinDuration + 45);
    if (!state.active || mySession !== sessionId) return;

    const diceBtn = document.getElementById(`dice-${turnColor}`);
    if (diceBtn) diceBtn.classList.remove("rolling");

    state.diceValue = rolled;
    updateDryYardTracker(turnColor, rolled);
    if (rolled === 6 && isMe) trackMission("roll6", 1);

    if (rolled === 6) {
      if (isMe) vibrate([22, 30, 38]);
      if (diceBtn) {
        diceBtn.classList.remove("rolled-six");
        void diceBtn.offsetWidth;
        diceBtn.classList.add("rolled-six");
        setTimeout(() => {
          if (diceBtn.isConnected) diceBtn.classList.remove("rolled-six");
        }, 950);
      }
      state.consecutiveSixes += 1;
      if (state.consecutiveSixes >= 3) {
        SFX.forfeit();
        vibrate([45, 35, 45]);
        spawnBoardCallout(getRotatedYardCenter(turnColor), "3× SIXES! ❌", "callout-capture");
        state.consecutiveSixes = 0;
        await wait(spd.forfeitWait);
        if (!state.active || mySession !== sessionId) return;
        advanceToNextPlayer(mySession);
        return;
      }
      spawnBoardCallout(getRotatedYardCenter(turnColor), "BONUS 6! 🎲", "callout-bonus");
    } else {
      state.consecutiveSixes = 0;
    }

    const movable = getMovableTokenIndices(ctrlColor, rolled);
    if (movable.length === 0) {
      state.consecutiveSixes = 0;
      await wait(spd.noMoveWait);
      if (!state.active || mySession !== sessionId) return;
      advanceToNextPlayer(mySession);
      return;
    }

    state.phase = "WAITING_MOVE";
    renderTokens(movable);

    if (isLocalOnlineHumanTurn()) {
      renderLandingPreviews(ctrlColor, movable, rolled);

      const autoMoveEnabled = getSettings().autoMove !== false;
      const allInYard = movable.every((idx) => state.tokens[ctrlColor][idx] === -1);

      if (autoMoveEnabled && (allInYard || movable.length === 1)) {
        clearLandingPreviews();
        scheduleAutoMove(spd.autoMoveWait, () => {
          if (!state.active || mySession !== sessionId || state.phase !== "WAITING_MOVE") return;
          submitOnlineMove(turnColor, ctrlColor, movable[0], mySession);
        });
        return;
      }

      startTurnTimer(turnColor, mySession, () => {
        if (!state.active || mySession !== sessionId || state.phase !== "WAITING_MOVE") return;
        clearLandingPreviews();
        const autoIdx = chooseBotMove(ctrlColor, movable, rolled, true);
        submitOnlineMove(turnColor, ctrlColor, autoIdx, mySession);
      }, TURN_LIMIT_MS, true);
    } else {
      startTurnTimer(turnColor, mySession, null, TURN_LIMIT_MS, true);
      scheduleHostOnlineTurnIfNeeded(mySession);
    }
  }

  function handleOnlinePresenceChange(color, status) {
    if (!state.active || state.mode !== "online" || !state.players[color]) return;
    const p = state.players[color];
    const prevDisconnected = Boolean(p.disconnected);
    const prevLeft = Boolean(p.left);

    p.left = status === "left";
    p.disconnected = status === "offline" || status === "left";

    const panel = document.getElementById(`panel-${color}`);
    if (panel) panel.classList.toggle("offline-player", p.disconnected);

    if (p.left && !prevLeft && window.LUDO_UI) {
      window.LUDO_UI.showToast(`${p.name} left — Bot taking over`);
    } else if (p.disconnected && !prevDisconnected && !p.left && window.LUDO_UI) {
      window.LUDO_UI.showToast(`${p.name} disconnected — Bot assisting`);
    } else if (!p.disconnected && prevDisconnected && !p.left && window.LUDO_UI) {
      window.LUDO_UI.showToast(`${p.name} reconnected!`);
    }

    if (getCurrentColor() === color) {
      scheduleHostOnlineTurnIfNeeded(sessionId);
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

    if (state.mode === "online") {
      if (isLocalOnlineHumanTurn()) {
        startTurnTimer(color, mySession, () => {
          if (!state.active || mySession !== sessionId || state.phase !== "WAITING_ROLL") return;
          submitOnlineRoll(color, mySession);
        }, TURN_LIMIT_MS, true);
      } else {
        startTurnTimer(color, mySession, null, TURN_LIMIT_MS, true);
        scheduleHostOnlineTurnIfNeeded(mySession);
      }
      return;
    }

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
    SFX.stopCapture();
    SFX.dice();
    if (!player.isBot) vibrate(18);

    const rolled = rollBalancedDie(turnColor);
    updateDryYardTracker(turnColor, rolled);
    const spinDuration = spinDice3D(turnColor, rolled);

    await wait(spinDuration + 45);
    if (!state.active || mySession !== sessionId) return;

    const diceBtn = document.getElementById(`dice-${turnColor}`);
    if (diceBtn) diceBtn.classList.remove("rolling");

    state.diceValue = rolled;

    if (rolled === 6 && !player.isBot) trackMission("roll6", 1);

    if (rolled === 6) {
      if (!player.isBot) vibrate([22, 30, 38]);
      if (diceBtn) {
        diceBtn.classList.remove("rolled-six");
        void diceBtn.offsetWidth;
        diceBtn.classList.add("rolled-six");
        setTimeout(() => {
          if (diceBtn.isConnected) diceBtn.classList.remove("rolled-six");
        }, 950);
      }
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

    const hasAffordableReroll = offerReroll && playerGems >= REROLL_GEM_COST;

    if (movable.length === 0) {
      state.consecutiveSixes = 0;

      if (hasAffordableReroll) {
        state.phase = "WAITING_REROLL";
        showRerollBtn(turnColor);
        startTurnTimer(turnColor, mySession, () => {
          if (!state.active || mySession !== sessionId || state.phase !== "WAITING_REROLL") return;
          hideRerollBtn();
          advanceToNextPlayer(mySession);
        }, 2400);
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

    const autoMoveEnabled = getSettings().autoMove !== false;
    const allInYard = movable.every((idx) => state.tokens[ctrlColor][idx] === -1);

    if (autoMoveEnabled && (allInYard || movable.length === 1)) {
      if (allInYard || !hasAffordableReroll) {
        hideRerollBtn();
        clearLandingPreviews();
        scheduleAutoMove(spd.autoMoveWait, () => {
          if (!state.active || mySession !== sessionId || state.phase !== "WAITING_MOVE") return;
          executeMove(turnColor, ctrlColor, movable[0], mySession);
        });
        return;
      }

      // Single movable piece + affordable Re-Roll: show compact chip on dice briefly, then auto-move automatically
      showRerollBtn(turnColor);
      scheduleAutoMove(1150, () => {
        if (!state.active || mySession !== sessionId || state.phase !== "WAITING_MOVE") return;
        hideRerollBtn();
        clearLandingPreviews();
        executeMove(turnColor, ctrlColor, movable[0], mySession);
      });
      return;
    }

    if (hasAffordableReroll) showRerollBtn(turnColor);

    startTurnTimer(turnColor, mySession, () => {
      if (!state.active || mySession !== sessionId || state.phase !== "WAITING_MOVE") return;
      hideRerollBtn();
      clearLandingPreviews();
      const autoIdx = chooseBotMove(ctrlColor, movable, rolled, true);
      executeMove(turnColor, ctrlColor, autoIdx, mySession);
    });
  }

  function handleTokenClick(clickedColor, tokenIndex) {
    if (!state.active || isPaused || state.phase !== "WAITING_MOVE") return;
    const turnColor = getCurrentColor();
    const ctrlColor = getControlledColor(turnColor);
    if (clickedColor !== ctrlColor) return;

    const movable = getMovableTokenIndices(ctrlColor, state.diceValue);
    if (!movable.includes(tokenIndex)) return;

    if (state.mode === "online") {
      if (!isLocalOnlineHumanTurn()) return;
      submitOnlineMove(turnColor, ctrlColor, tokenIndex, sessionId);
      return;
    }

    if (state.players[turnColor].isBot) return;

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
        SFX.hop(s - 1);
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
      if (state.mode === "online" ? turnColor === state.localColor : !actingPlayer.isBot) trackMission("home", 1);
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
          SFX.playerFinish();
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
        const onlyBotsLeft = unfinishedColors.every((c) => state.players[c].isBot || state.players[c].left);

        if (unfinishedColors.length <= 1 || ((state.mode === "vs-bot" || state.mode === "online") && onlyBotsLeft)) {
          await finalizeMatch(mySession);
          return;
        }

        SFX.playerFinish();
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

        if (state.mode === "online" ? turnColor === state.localColor : !actingPlayer.isBot) trackMission("capture", capturedList.length);

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
  function resetPauseAndOnlineState() {
    isPaused = false;
    flushPauseWaiters();
    clearHostWatchdog();
    onlineSeq = 0;
    onlineQueue = [];
    onlineQueueBusy = false;
    onlineActionSentSeq = 0;
    const gs = document.getElementById("game-screen");
    if (gs) gs.classList.remove("game-paused");
    const resumeBtn = document.getElementById("btn-menu-resume");
    if (resumeBtn) resumeBtn.classList.add("hidden");
  }

  function startOnlineMatch(config) {
    sessionId += 1;
    const mySession = sessionId;

    resetPauseAndOnlineState();
    clearTurnTimer();
    clearAllEmojis();
    clearLandingPreviews();
    clearComboBanner();
    hideRerollBtn();
    SFX.stopAll();
    capturesThisTurn = 0;

    state = createEmptyState();
    state.active = true;
    state.saveId = "";
    state.mode = "online";
    state.roomCode = config.roomCode || "";
    state.isPublic = Boolean(config.isPublic);
    state.localColor = config.localColor;
    state.localUid = config.localUid;
    state.gameType = config.gameType || "classic";
    state.difficulty = "normal";
    state.stake = Number(config.stake) || 0;
    state.pot = Number(config.pot) || 0;
    state.activeColors = [...config.activeColors];
    state.players = config.players;
    state.finishedOrder = [];
    state.turnIndex = 0;
    state.tokens = BD.createInitialTokens(state.gameType);

    document.body.classList.add("mode-online");
    computeBoardRotation();
    buildBoardDOM();
    setupPlayerPanels();
    renderTokens([]);

    if (window.LUDO_ONLINE && typeof window.LUDO_ONLINE.setGameCallbacks === "function") {
      window.LUDO_ONLINE.setGameCallbacks({
        onAction: handleIncomingOnlineAction,
        onReaction: (msg) => {
          if (!state.active || state.mode !== "online") return;
          showEmojiBubble(msg.color, msg.content, true, Boolean(msg.isChat));
        },
        onPlayerPresenceChange: handleOnlinePresenceChange
      });
    }

    startTurn(mySession);
  }

  function startMatch(config) {
    sessionId += 1;
    const mySession = sessionId;

    resetPauseAndOnlineState();
    clearTurnTimer();
    clearAllEmojis();
    clearLandingPreviews();
    clearComboBanner();
    hideRerollBtn();
    SFX.stopAll();
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

    document.body.classList.toggle("mode-online", state.mode === "online");
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

    resetPauseAndOnlineState();
    clearTurnTimer();
    clearAllEmojis();
    clearLandingPreviews();
    clearComboBanner();
    hideRerollBtn();
    SFX.stopAll();
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

    document.body.classList.toggle("mode-online", state.mode === "online");
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
    resetPauseAndOnlineState();
    clearTurnTimer();
    clearAllEmojis();
    clearLandingPreviews();
    clearComboBanner();
    hideRerollBtn();
    SFX.stopAll();
    document.body.classList.remove("mode-online");
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
    if (state.mode === "online" && state.localColor) return state.localColor;
    let senderColor = getCurrentColor();
    if (state.mode === "vs-bot") {
      const humanColor = state.activeColors.find((c) => state.players[c] && !state.players[c].isBot);
      if (humanColor) senderColor = humanColor;
    }
    return senderColor;
  }

  function triggerBackgroundAutoPause() {
    const gameScreen = document.getElementById("game-screen");
    if (!gameScreen || !gameScreen.classList.contains("active")) return;
    if (!isMatchActive()) return;

    const winModal = document.getElementById("modal-win");
    const exitModal = document.getElementById("modal-exit-confirm");
    if (winModal && !winModal.classList.contains("hidden")) return;
    if (exitModal && !exitModal.classList.contains("hidden")) return;

    pauseGame({ openMenu: true });
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
          if (state.mode === "online" && window.LUDO_ONLINE) {
            window.LUDO_ONLINE.sendReaction(senderColor, emoji, false);
          }
          vibrate(15);
          closeEmojiPopover();
        }
      });
    }

    const quickChatBar = document.getElementById("quick-chat-bar");
    if (quickChatBar) {
      quickChatBar.addEventListener("click", (e) => {
        const btn = e.target.closest(".chat-pill-btn");
        if (!btn || !state.active) return;
        const msg = btn.dataset.chat;
        const senderColor = getReactionSenderColor();
        if (msg && senderColor) {
          showEmojiBubble(senderColor, msg, true, true);
          if (state.mode === "online" && window.LUDO_ONLINE) {
            window.LUDO_ONLINE.sendReaction(senderColor, msg, true);
          } else {
            scheduleBotChatReply(senderColor, msg);
          }
          vibrate(15);
          closeEmojiPopover();
        }
      });
    }

    const winModal = document.getElementById("modal-win");
    if (winModal) {
      winModal.addEventListener("click", (e) => {
        if (e.target.closest("button")) SFX.stopWin();
      });
    }

    const unlockOnce = () => {
      SFX.unlockAudio();
      document.removeEventListener("pointerdown", unlockOnce);
    };
    document.addEventListener("pointerdown", unlockOnce);

    // Instant Auto-Pause whenever game goes even slightly into background or loses focus
    document.addEventListener("visibilitychange", () => {
      SFX.handleVisibilityChange();
      if (document.hidden) triggerBackgroundAutoPause();
    });

    window.addEventListener("blur", () => {
      triggerBackgroundAutoPause();
    });

    window.addEventListener("pagehide", () => {
      SFX.stopAll();
      triggerBackgroundAutoPause();
      if (isMatchActive() && state.mode !== "online") persistMatchSnapshot();
    });

    const capApp = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (capApp && typeof capApp.addListener === "function") {
      capApp.addListener("appStateChange", (appState) => {
        if (appState && appState.isActive === false) {
          triggerBackgroundAutoPause();
        }
      });
      capApp.addListener("pause", () => {
        triggerBackgroundAutoPause();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", bindGameControls);

  return {
    startMatch,
    startOnlineMatch,
    resumeMatch,
    pauseGame,
    resumeGame,
    isGamePaused: () => isPaused,
    isOnlineMode: () => state.mode === "online",
    saveAndExit,
    stopMatch,
    isMatchActive,
    getCurrentSaveId,
    stopWinningAudio: () => SFX.stopWin(),
    stopCaptureAudio: () => SFX.stopCapture(),
    stopAllAudio: () => SFX.stopAll(),
    syncAudioSettings: () => SFX.syncSettings(),
    refreshPieceSkins,
    refreshDiceSkins,
    refreshPlayerFrames(frameId) {
      const f = frameId || getSettings().frame || "bronze";
      BD.COLORS.forEach((color) => {
        const el = document.getElementById(`frame-${color}`);
        if (!el) return;
        if (window.LUDO_UI && typeof window.LUDO_UI.applyFrameVisual === "function") {
          window.LUDO_UI.applyFrameVisual(el, f);
        } else {
          el.className = `frame-overlay frame-${f}`;
        }
      });
    },
    getState: () => JSON.parse(JSON.stringify(state))
  };
})();


