/* =========================================================
   LUDO KINGDOM - FIREBASE REALTIME ONLINE MULTIPLAYER ENGINE
   ========================================================= */

window.LUDO_ONLINE = (() => {
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCcMLT3nukoJxMBscnxfzH4_Ea_bG5HvKs",
    authDomain: "ludo-kingdom-8302.firebaseapp.com",
    databaseURL: "https://ludo-kingdom-8302-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ludo-kingdom-8302",
    storageBucket: "ludo-kingdom-8302.firebasestorage.app",
    messagingSenderId: "833178377395",
    appId: "1:833178377395:web:6a68919737ac3de6d224c6",
    measurementId: "G-CB5LKBFTX3"
  };

  const UID_STORAGE_KEY = "ludo_kingdom_online_uid_v1";
  const MATCHMAKING_WAIT_SEC = 15;
  const ROOM_STALE_MS = 55000;

  const ALL_FRAMES = [
    "bronze", "silver", "royal_gold", "glacier_ice",
    "magma_obsidian", "cyber_neon", "pharaoh_sand", "dubai_emerald", "cosmic_void"
  ];

  const ALL_DICE_SKINS = [
    "classic", "tricolour", "ruby", "royal_crown", "glacier_crystal",
    "cursed_relic", "magma_obsidian", "cyber_core", "pharaoh_gold", "dubai_diamond", "cosmic_nebula"
  ];

  const BOT_POOL = [
    { name: "Aarav", avatar: "char_captain" },
    { name: "Priya", avatar: "char_party" },
    { name: "Kabir", avatar: "char_rajni" },
    { name: "Ananya", avatar: "char_kitten" },
    { name: "Rohan", avatar: "char_cricket" },
    { name: "Meera", avatar: "👸" },
    { name: "Vikram", avatar: "🦁" },
    { name: "Zoya", avatar: "🦊" }
  ];

  // Pick a random frame or dice skin for an online opponent:
  // 99% chance NOT to match the local player's equipped skin (1 in 100 can match!)
  function pickIndependentSkin(pool, avoidLocalId, usedOthersSet) {
    if (avoidLocalId && Math.random() < 0.01 && pool.includes(avoidLocalId)) {
      return avoidLocalId;
    }
    const distinctFromAll = pool.filter((id) => id !== avoidLocalId && (!usedOthersSet || !usedOthersSet.has(id)));
    if (distinctFromAll.length > 0) {
      return distinctFromAll[Math.floor(Math.random() * distinctFromAll.length)];
    }
    const distinctFromLocal = pool.filter((id) => id !== avoidLocalId);
    const list = distinctFromLocal.length > 0 ? distinctFromLocal : pool;
    return list[Math.floor(Math.random() * list.length)];
  }

  const COLOR_HEX = {
    red: "#e53935",
    green: "#22b14c",
    yellow: "#f7c316",
    blue: "#1e90ff"
  };

  let db = null;
  let firebaseReadyPromise = null;
  let myUid = getOrCreateUid();

  // Online modal UI state
  let activeOnlineTab = "quick";
  let quickState = { gameType: "classic", playerCount: 2, stake: 0 };
  let friendState = { gameType: "classic", playerCount: 2 };

  // Active room / match tracking
  let currentRoomCode = null;
  let currentBucket = null;
  let currentMyColor = null;
  let currentIsPublic = false;
  let currentRoomData = null;
  let matchLaunched = false;
  let matchJoinedAt = 0;

  let waitingListenerRef = null;
  let waitingListenerFn = null;
  let actionsListenerRef = null;
  let actionsListenerFn = null;
  let reactionsListenerRef = null;
  let reactionsListenerFn = null;
  let presenceListenerRef = null;
  let presenceListenerFn = null;
  let seatsListenerRef = null;
  let seatsListenerFn = null;
  let connListenerRef = null;
  let connListenerFn = null;

  let matchmakingInterval = null;
  let matchmakingSecondsLeft = MATCHMAKING_WAIT_SEC;
  let latestPresence = {};
  let latestSeats = {};

  let gameCallbacks = {
    onAction: null,
    onReaction: null,
    onPlayerPresenceChange: null
  };

  function getOrCreateUid() {
    try {
      let existing = localStorage.getItem(UID_STORAGE_KEY);
      if (existing && existing.length >= 6) return existing;
      existing = `lk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(UID_STORAGE_KEY, existing);
      return existing;
    } catch {
      return `lk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    }
  }

  function loadExternalScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === "true") {
          resolve();
          return;
        }
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Script load failed")), { once: true });
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => {
        s.dataset.loaded = "true";
        resolve();
      };
      s.onerror = () => reject(new Error("Script load failed"));
      document.head.appendChild(s);
    });
  }

  async function ensureFirebase() {
    if (db) return db;
    if (firebaseReadyPromise) return firebaseReadyPromise;

    firebaseReadyPromise = (async () => {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new Error("OFFLINE");
      }

      if (!window.firebase || typeof window.firebase.database !== "function") {
        await loadExternalScript("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
        await loadExternalScript("https://www.gstatic.com/firebasejs/10.14.1/firebase-database-compat.js");
      }

      if (!window.firebase || typeof window.firebase.database !== "function") {
        throw new Error("SDK_UNAVAILABLE");
      }

      if (!window.firebase.apps || window.firebase.apps.length === 0) {
        window.firebase.initializeApp(FIREBASE_CONFIG);
      }

      db = window.firebase.database();
      return db;
    })();

    try {
      return await firebaseReadyPromise;
    } catch (err) {
      firebaseReadyPromise = null;
      throw err;
    }
  }

  function showToast(msg) {
    if (window.LUDO_UI && typeof window.LUDO_UI.showToast === "function") {
      window.LUDO_UI.showToast(msg);
    }
  }

  function getSafeAvatar() {
    if (!window.LUDO_UI) return "🤴";
    const p = window.LUDO_UI.getProfile();
    if (p.photo && p.photo.length <= 18000) return p.photo;
    return p.avatar || "🤴";
  }

  function getLocalPlayerSeatInfo() {
    const p = window.LUDO_UI ? window.LUDO_UI.getProfile() : { name: "Player" };
    const s = window.LUDO_UI ? window.LUDO_UI.getSettings() : { frame: "bronze", diceSkin: "classic" };
    return {
      uid: myUid,
      name: (p.name || "Player").slice(0, 14),
      avatar: getSafeAvatar(),
      frame: s.frame || "bronze",
      diceSkin: s.diceSkin || "classic",
      isBot: false,
      left: false
    };
  }

  function generateRoomCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function formatRoomCode(code) {
    const clean = String(code || "").replace(/\D/g, "");
    if (clean.length === 6) return `${clean.slice(0, 3)} ${clean.slice(3)}`;
    return clean;
  }

  function clearMatchmakingTimer() {
    if (matchmakingInterval) {
      clearInterval(matchmakingInterval);
      matchmakingInterval = null;
    }
  }

  function detachWaitingListener() {
    if (waitingListenerRef && waitingListenerFn) {
      waitingListenerRef.off("value", waitingListenerFn);
    }
    waitingListenerRef = null;
    waitingListenerFn = null;
  }

  function detachMatchListeners() {
    if (actionsListenerRef && actionsListenerFn) {
      actionsListenerRef.off("child_added", actionsListenerFn);
    }
    if (reactionsListenerRef && reactionsListenerFn) {
      reactionsListenerRef.off("child_added", reactionsListenerFn);
    }
    if (presenceListenerRef && presenceListenerFn) {
      presenceListenerRef.off("value", presenceListenerFn);
    }
    if (seatsListenerRef && seatsListenerFn) {
      seatsListenerRef.off("value", seatsListenerFn);
    }
    if (connListenerRef && connListenerFn) {
      connListenerRef.off("value", connListenerFn);
    }
    actionsListenerRef = null;
    actionsListenerFn = null;
    reactionsListenerRef = null;
    reactionsListenerFn = null;
    presenceListenerRef = null;
    presenceListenerFn = null;
    seatsListenerRef = null;
    seatsListenerFn = null;
    connListenerRef = null;
    connListenerFn = null;
  }

  function bindPresenceForRoom(roomCode) {
    if (!db || !roomCode) return;
    if (connListenerRef && connListenerFn) {
      connListenerRef.off("value", connListenerFn);
    }
    const myPresRef = db.ref(`rooms/${roomCode}/presence/${myUid}`);
    connListenerRef = db.ref(".info/connected");
    connListenerFn = (snap) => {
      if (snap.val() === true) {
        myPresRef.onDisconnect().set(false).catch(() => {});
        myPresRef.set(true).catch(() => {});
      }
    };
    connListenerRef.on("value", connListenerFn);
  }

  // ==================== MODAL VIEW RENDERING ====================
  function setOnlineView(viewName) {
    const homeView = document.getElementById("online-view-home");
    const waitView = document.getElementById("online-view-waiting");
    if (homeView) homeView.classList.toggle("hidden", viewName !== "home");
    if (waitView) waitView.classList.toggle("hidden", viewName !== "waiting");
  }

  function setBusyState(busy, text = "") {
    const statusEl = document.getElementById("online-connect-status");
    const findBtn = document.getElementById("btn-online-find");
    const createBtn = document.getElementById("btn-online-create");
    const joinBtn = document.getElementById("btn-online-join");
    if (statusEl) {
      statusEl.textContent = text;
      statusEl.classList.toggle("hidden", !text);
    }
    if (findBtn) findBtn.disabled = busy;
    if (createBtn) createBtn.disabled = busy;
    if (joinBtn) joinBtn.disabled = busy;
  }

  function updateQuickPrizePreview() {
    const el = document.getElementById("online-prize-preview");
    if (!el) return;
    if (quickState.stake === 0) {
      el.textContent = "Free Online Match • 1st Place Reward: +300 Coins 🪙";
    } else {
      const pot = quickState.stake * quickState.playerCount;
      el.textContent = `Live Prize Pool: 🪙 ${pot.toLocaleString("en-IN")} (Winner takes pot!)`;
    }
  }

  function syncOnlineTabsUI() {
    document.querySelectorAll("#online-tabs .shop-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.otab === activeOnlineTab);
    });
    const quickPane = document.getElementById("online-tab-quick");
    const friendsPane = document.getElementById("online-tab-friends");
    if (quickPane) quickPane.classList.toggle("hidden", activeOnlineTab !== "quick");
    if (friendsPane) friendsPane.classList.toggle("hidden", activeOnlineTab !== "friends");

    document.querySelectorAll("#online-quick-type .choice-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.ogtype === quickState.gameType);
    });
    document.querySelectorAll("#online-quick-count .choice-btn").forEach((b) => {
      b.classList.toggle("active", Number(b.dataset.ocount) === quickState.playerCount);
    });
    document.querySelectorAll("#online-quick-stake .choice-btn").forEach((b) => {
      b.classList.toggle("active", Number(b.dataset.ostake) === quickState.stake);
    });
    document.querySelectorAll("#online-friend-type .choice-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.oftype === friendState.gameType);
    });
    document.querySelectorAll("#online-friend-count .choice-btn").forEach((b) => {
      b.classList.toggle("active", Number(b.dataset.ofcount) === friendState.playerCount);
    });

    updateQuickPrizePreview();
  }

  function renderWaitingRoomUI(room) {
    if (!room) return;
    const titleEl = document.getElementById("online-wait-title");
    const subEl = document.getElementById("online-wait-subtitle");
    const codeBox = document.getElementById("online-code-box");
    const codeVal = document.getElementById("online-code-value");
    const searchPill = document.getElementById("online-search-pill");
    const seatsList = document.getElementById("online-seats-list");
    const startBtn = document.getElementById("btn-online-start-now");
    const fillBotsBtn = document.getElementById("btn-online-fill-bots");

    const activeColors = Array.isArray(room.activeColors) ? room.activeColors : [];
    const seats = room.seats || {};
    const joinedCount = activeColors.filter((c) => Boolean(seats[c])).length;
    const isHost = room.hostUid === myUid;
    const formatLbl = room.gameType === "quick" ? "⚡ Quick" : "Classic";

    if (room.isPublic) {
      if (titleEl) titleEl.textContent = "Finding Online Players...";
      if (subEl) subEl.textContent = `${formatLbl} • ${room.playerCount}P` + (room.stake > 0 ? ` • Stake 🪙 ${room.stake}` : " • Free Match");
      if (codeBox) codeBox.classList.add("hidden");
      if (searchPill) {
        searchPill.classList.remove("hidden");
        searchPill.textContent = `🔍 Searching (${joinedCount}/${room.playerCount}) • ${Math.max(0, matchmakingSecondsLeft)}s`;
      }
      if (startBtn) startBtn.classList.add("hidden");
      if (fillBotsBtn) {
        fillBotsBtn.classList.toggle("hidden", !isHost);
        fillBotsBtn.textContent = joinedCount >= 2 ? "Start Now 🎲" : "⚡ Play Now (Fill Bots)";
      }
    } else {
      if (titleEl) titleEl.textContent = "Private Room Lobby";
      if (subEl) subEl.textContent = `${formatLbl} • ${room.playerCount} Players • Share code with friends`;
      if (codeBox) codeBox.classList.remove("hidden");
      if (codeVal) codeVal.textContent = formatRoomCode(room.code);
      if (searchPill) searchPill.classList.add("hidden");

      if (startBtn) {
        startBtn.classList.toggle("hidden", !isHost || joinedCount < 2);
        startBtn.textContent = joinedCount === room.playerCount
          ? "Start Match 🎲"
          : `Start Match (${joinedCount}/${room.playerCount}) 🎲`;
      }
      if (fillBotsBtn) {
        fillBotsBtn.classList.toggle("hidden", !isHost || joinedCount === room.playerCount);
        fillBotsBtn.textContent = "Fill Empty Seats with Bots 🤖";
      }
    }

    if (seatsList) {
      seatsList.innerHTML = "";
      activeColors.forEach((color) => {
        const seat = seats[color];
        const row = document.createElement("div");
        row.className = "online-seat-row" + (seat ? " filled" : " empty");

        const left = document.createElement("div");
        left.className = "online-seat-left";

        const dot = document.createElement("span");
        dot.className = "online-seat-color";
        dot.style.background = COLOR_HEX[color] || "#1e90ff";

        const av = document.createElement("span");
        av.className = "online-seat-avatar";
        if (seat && window.LUDO_UI && typeof window.LUDO_UI.renderAvatar === "function") {
          window.LUDO_UI.renderAvatar(av, seat.avatar);
        } else {
          av.textContent = seat ? (seat.avatar || "🤴") : "⏳";
        }

        const name = document.createElement("span");
        name.className = "online-seat-name";
        name.textContent = seat ? seat.name : "Waiting for player...";

        left.appendChild(dot);
        left.appendChild(av);
        left.appendChild(name);

        const tag = document.createElement("span");
        tag.className = "online-seat-tag";
        if (!seat) {
          tag.textContent = "OPEN";
          tag.classList.add("open");
        } else if (seat.uid === myUid) {
          tag.textContent = seat.uid === room.hostUid ? "YOU • HOST" : "YOU";
          tag.classList.add("me");
        } else if (seat.uid === room.hostUid) {
          tag.textContent = "HOST";
        } else {
          tag.textContent = "READY ✓";
          tag.classList.add("ready");
        }

        row.appendChild(left);
        row.appendChild(tag);
        seatsList.appendChild(row);
      });
    }
  }

  // ==================== ROOM CREATION, JOIN & MATCHMAKING ====================
  async function createRoom({ isPublic, gameType, playerCount, stake }) {
    const database = await ensureFirebase();
    const activeColors = window.BOARD_DATA.getActiveColors(playerCount, "blue");
    const hostColor = activeColors[0];
    const bucket = isPublic ? `${gameType}_${playerCount}_${stake}` : "";
    const seatInfo = getLocalPlayerSeatInfo();

    let code = "";
    for (let attempt = 0; attempt < 6; attempt++) {
      const candidate = generateRoomCode();
      const snap = await database.ref(`rooms/${candidate}/createdAt`).once("value");
      if (!snap.exists() || Date.now() - Number(snap.val()) > 3600000) {
        code = candidate;
        break;
      }
    }
    if (!code) code = generateRoomCode();

    const now = Date.now();
    const roomPayload = {
      code,
      isPublic: Boolean(isPublic),
      bucket,
      status: "waiting",
      gameType,
      playerCount,
      stake: Number(stake) || 0,
      pot: (Number(stake) || 0) * playerCount,
      hostUid: myUid,
      createdAt: now,
      startedAt: 0,
      activeColors,
      seats: {
        [hostColor]: seatInfo
      },
      presence: {
        [myUid]: true
      }
    };

    await database.ref(`rooms/${code}`).set(roomPayload);
    if (isPublic && bucket) {
      await database.ref(`matchmaking/${bucket}/${code}`).set({
        code,
        createdAt: now,
        playerCount,
        hostUid: myUid
      });
      database.ref(`matchmaking/${bucket}/${code}`).onDisconnect().remove().catch(() => {});
    }

    currentRoomCode = code;
    currentBucket = bucket;
    currentMyColor = hostColor;
    currentIsPublic = Boolean(isPublic);
    currentRoomData = roomPayload;
    matchLaunched = false;

    bindPresenceForRoom(code);
    watchWaitingRoom(code);

    if (isPublic) startMatchmakingCountdown(code);
    return code;
  }

  async function tryJoinExistingRoom(code) {
    const database = await ensureFirebase();
    const cleanCode = String(code || "").replace(/\D/g, "").trim();
    if (cleanCode.length !== 6) {
      return { ok: false, reason: "Please enter a valid 6-digit room code." };
    }

    const roomRef = database.ref(`rooms/${cleanCode}`);
    const snap = await roomRef.once("value");
    if (!snap.exists()) {
      return { ok: false, reason: "Room not found. Check the 6-digit code." };
    }

    const room = snap.val();
    if (!room || room.status !== "waiting") {
      return { ok: false, reason: "This room has already started or ended." };
    }

    if (room.stake > 0 && window.LUDO_UI) {
      const coins = window.LUDO_UI.getProfile().coins;
      if (coins < room.stake) {
        return { ok: false, reason: `Need 🪙 ${room.stake} coins to join this room.` };
      }
    }

    const activeColors = Array.isArray(room.activeColors) ? room.activeColors : [];
    const seatInfo = getLocalPlayerSeatInfo();
    let assignedColor = null;

    const txResult = await roomRef.child("seats").transaction((currentSeats) => {
      const seatsObj = currentSeats ? { ...currentSeats } : {};
      for (const c of activeColors) {
        if (seatsObj[c] && seatsObj[c].uid === myUid) {
          assignedColor = c;
          return seatsObj;
        }
      }
      const openColor = activeColors.find((c) => !seatsObj[c]);
      if (!openColor) return undefined;
      seatsObj[openColor] = seatInfo;
      assignedColor = openColor;
      return seatsObj;
    });

    if (!txResult.committed || !assignedColor) {
      return { ok: false, reason: "Room is already full!" };
    }

    currentRoomCode = cleanCode;
    currentBucket = room.bucket || "";
    currentMyColor = assignedColor;
    currentIsPublic = Boolean(room.isPublic);
    matchLaunched = false;

    bindPresenceForRoom(cleanCode);
    watchWaitingRoom(cleanCode);

    const updatedSeats = txResult.snapshot.val() || {};
    const filledCount = activeColors.filter((c) => Boolean(updatedSeats[c])).length;
    if (room.isPublic && filledCount >= room.playerCount) {
      if (room.bucket) {
        database.ref(`matchmaking/${room.bucket}/${cleanCode}`).remove().catch(() => {});
      }
      await roomRef.child("status").transaction((st) => (st === "waiting" ? "playing" : undefined));
      await roomRef.child("startedAt").set(Date.now()).catch(() => {});
    }

    return { ok: true, code: cleanCode };
  }

  async function findQuickMatch() {
    if (quickState.stake > 0 && window.LUDO_UI) {
      const coins = window.LUDO_UI.getProfile().coins;
      if (coins < quickState.stake) {
        showToast("Not enough coins! Grab free coins in Shop 🛒.");
        return;
      }
    }

    setBusyState(true, "Connecting to online server...");
    try {
      const database = await ensureFirebase();
      const bucket = `${quickState.gameType}_${quickState.playerCount}_${quickState.stake}`;
      const listSnap = await database.ref(`matchmaking/${bucket}`).once("value");
      const entries = listSnap.val() || {};
      const now = Date.now();

      const candidates = Object.values(entries)
        .filter((e) => e && e.code && e.hostUid !== myUid && (now - (e.createdAt || 0)) < ROOM_STALE_MS)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      Object.values(entries).forEach((e) => {
        if (e && e.code && (now - (e.createdAt || 0)) >= ROOM_STALE_MS) {
          database.ref(`matchmaking/${bucket}/${e.code}`).remove().catch(() => {});
        }
      });

      for (const cand of candidates) {
        const res = await tryJoinExistingRoom(cand.code);
        if (res.ok) {
          setBusyState(false, "");
          setOnlineView("waiting");
          return;
        }
      }

      await createRoom({
        isPublic: true,
        gameType: quickState.gameType,
        playerCount: quickState.playerCount,
        stake: quickState.stake
      });
      setBusyState(false, "");
      setOnlineView("waiting");
    } catch (err) {
      setBusyState(false, "");
      if (err && err.message === "OFFLINE") {
        showToast("No internet connection. Please turn on data or Wi-Fi.");
      } else {
        showToast("Could not connect to online server. Try again.");
      }
    }
  }

  async function createPrivateRoom() {
    setBusyState(true, "Creating private room...");
    try {
      await createRoom({
        isPublic: false,
        gameType: friendState.gameType,
        playerCount: friendState.playerCount,
        stake: 0
      });
      setBusyState(false, "");
      setOnlineView("waiting");
    } catch (err) {
      setBusyState(false, "");
      showToast(err && err.message === "OFFLINE"
        ? "No internet connection. Please turn on data or Wi-Fi."
        : "Could not create room. Check internet connection.");
    }
  }

  async function joinPrivateRoomFromInput() {
    const inp = document.getElementById("input-room-code");
    const rawCode = inp ? inp.value : "";
    setBusyState(true, "Joining room...");
    try {
      const res = await tryJoinExistingRoom(rawCode);
      setBusyState(false, "");
      if (!res.ok) {
        showToast(res.reason || "Could not join room.");
        return;
      }
      if (inp) inp.value = "";
      setOnlineView("waiting");
    } catch (err) {
      setBusyState(false, "");
      showToast(err && err.message === "OFFLINE"
        ? "No internet connection. Please turn on data or Wi-Fi."
        : "Could not join room. Check internet connection.");
    }
  }

  function startMatchmakingCountdown(roomCode) {
    clearMatchmakingTimer();
    matchmakingSecondsLeft = MATCHMAKING_WAIT_SEC;

    matchmakingInterval = setInterval(() => {
      if (!currentRoomCode || currentRoomCode !== roomCode || matchLaunched) {
        clearMatchmakingTimer();
        return;
      }
      matchmakingSecondsLeft -= 1;
      if (currentRoomData) renderWaitingRoomUI(currentRoomData);

      if (matchmakingSecondsLeft <= 0) {
        clearMatchmakingTimer();
        if (currentRoomData && currentRoomData.hostUid === myUid) {
          hostStartRoom(true);
        }
      }
    }, 1000);
  }

  async function hostStartRoom(fillEmptyWithBots = false) {
    if (!db || !currentRoomCode || !currentRoomData || matchLaunched) return;
    if (currentRoomData.hostUid !== myUid) return;

    const roomRef = db.ref(`rooms/${currentRoomCode}`);
    const activeColors = Array.isArray(currentRoomData.activeColors) ? [...currentRoomData.activeColors] : [];

    if (currentBucket) {
      db.ref(`matchmaking/${currentBucket}/${currentRoomCode}`).remove().catch(() => {});
    }

    if (fillEmptyWithBots) {
      const shuffledBots = [...BOT_POOL].sort(() => Math.random() - 0.5);
      const localSettings = window.LUDO_UI ? window.LUDO_UI.getSettings() : { frame: "bronze", diceSkin: "classic" };
      let botIdx = 0;

      await roomRef.child("seats").transaction((currentSeats) => {
        const seatsObj = currentSeats ? { ...currentSeats } : {};
        const usedFrames = new Set();
        const usedDice = new Set();
        Object.values(seatsObj).forEach((s) => {
          if (s && s.frame) usedFrames.add(s.frame);
          if (s && s.diceSkin) usedDice.add(s.diceSkin);
        });
        const avoidFrame = localSettings.frame || "bronze";
        const avoidDice = localSettings.diceSkin || "classic";

        activeColors.forEach((c) => {
          if (!seatsObj[c]) {
            const pick = shuffledBots[botIdx % shuffledBots.length];
            botIdx += 1;
            const botFrame = pickIndependentSkin(ALL_FRAMES, avoidFrame, usedFrames);
            const botDice = pickIndependentSkin(ALL_DICE_SKINS, avoidDice, usedDice);
            usedFrames.add(botFrame);
            usedDice.add(botDice);
            seatsObj[c] = {
              uid: `bot_${c}_${Date.now()}`,
              name: pick.name,
              avatar: pick.avatar,
              frame: botFrame,
              diceSkin: botDice,
              isBot: true,
              left: false
            };
          }
        });
        return seatsObj;
      });
    } else {
      const seatSnap = await roomRef.child("seats").once("value");
      const seatsObj = seatSnap.val() || {};
      const occupiedColors = activeColors.filter((c) => Boolean(seatsObj[c]));
      if (occupiedColors.length < 2) {
        showToast("Wait for at least 1 friend to join, or fill with bots!");
        return;
      }
      if (occupiedColors.length !== activeColors.length) {
        await roomRef.child("activeColors").set(occupiedColors);
        await roomRef.child("playerCount").set(occupiedColors.length);
      }
    }

    await roomRef.child("startedAt").set(Date.now()).catch(() => {});
    await roomRef.child("status").transaction((st) => (st === "waiting" ? "playing" : undefined));
  }

  function watchWaitingRoom(roomCode) {
    detachWaitingListener();
    if (!db || !roomCode) return;

    waitingListenerRef = db.ref(`rooms/${roomCode}`);
    waitingListenerFn = (snap) => {
      if (!snap.exists()) {
        if (!matchLaunched) {
          cleanupLocalRoomState();
          setOnlineView("home");
          showToast("Room closed by host.");
        }
        return;
      }

      const room = snap.val();
      currentRoomData = room;

      if (room.status === "waiting") {
        renderWaitingRoomUI(room);
        return;
      }

      if (room.status === "playing" && !matchLaunched) {
        matchLaunched = true;
        clearMatchmakingTimer();
        detachWaitingListener();
        startActiveOnlineMatch(room);
      }
    };

    waitingListenerRef.on("value", waitingListenerFn);
  }

  function startActiveOnlineMatch(room) {
    const activeColors = Array.isArray(room.activeColors) ? [...room.activeColors] : [];
    const seats = room.seats || {};
    const players = {};

    const localSettings = window.LUDO_UI ? window.LUDO_UI.getSettings() : { frame: "bronze", diceSkin: "classic" };
    const seenOppFrames = new Set();
    const seenOppDice = new Set();

    activeColors.forEach((color) => {
      const s = seats[color];
      if (!s) return;
      const isOpp = color !== currentMyColor;
      let chosenFrame = s.frame || "bronze";
      let chosenDice = s.diceSkin || "";

      if (!isOpp) {
        chosenFrame = localSettings.frame || chosenFrame;
        chosenDice = localSettings.diceSkin || chosenDice || "classic";
      } else {
        if (!chosenDice) {
          chosenDice = pickIndependentSkin(ALL_DICE_SKINS, localSettings.diceSkin || "classic", seenOppDice);
        }
        // If a bot joined from another host with matching local skin, keep 99% independent look
        if (s.isBot && chosenFrame === (localSettings.frame || "bronze") && Math.random() >= 0.01) {
          chosenFrame = pickIndependentSkin(ALL_FRAMES, localSettings.frame || "bronze", seenOppFrames);
        }
        if (s.isBot && chosenDice === (localSettings.diceSkin || "classic") && Math.random() >= 0.01) {
          chosenDice = pickIndependentSkin(ALL_DICE_SKINS, localSettings.diceSkin || "classic", seenOppDice);
        }
        seenOppFrames.add(chosenFrame);
        seenOppDice.add(chosenDice);
      }

      players[color] = {
        uid: s.uid,
        name: s.name || "Player",
        avatar: s.avatar || "🤴",
        frame: chosenFrame,
        diceSkin: chosenDice,
        isBot: Boolean(s.isBot),
        left: Boolean(s.left),
        disconnected: false,
        isOnlineOpponent: isOpp
      };
    });

    latestSeats = JSON.parse(JSON.stringify(seats));
    latestPresence = room.presence ? { ...room.presence } : {};
    matchJoinedAt = Date.now();

    const config = {
      mode: "online",
      roomCode: room.code,
      isPublic: Boolean(room.isPublic),
      localColor: currentMyColor,
      localUid: myUid,
      gameType: room.gameType || "classic",
      difficulty: "normal",
      isCup: false,
      cupRound: 0,
      isTeam2v2: false,
      teams: null,
      humanTeam: null,
      playerCount: activeColors.length,
      stake: Number(room.stake) || 0,
      pot: (Number(room.stake) || 0) * activeColors.length,
      activeColors,
      players
    };

    if (window.LUDO_UI && typeof window.LUDO_UI.enterOnlineGameScreen === "function") {
      window.LUDO_UI.enterOnlineGameScreen(config);
    }

    attachLiveMatchListeners(room.code, activeColors);
  }

  function attachLiveMatchListeners(roomCode, activeColors) {
    detachMatchListeners();
    if (!db || !roomCode) return;

    const roomRef = db.ref(`rooms/${roomCode}`);

    actionsListenerRef = roomRef.child("actions");
    actionsListenerFn = (snap) => {
      const action = snap.val();
      if (!action || typeof action.seq !== "number") return;
      if (typeof gameCallbacks.onAction === "function") {
        gameCallbacks.onAction(action);
      }
    };
    actionsListenerRef.on("child_added", actionsListenerFn);

    reactionsListenerRef = roomRef.child("reactions").limitToLast(1);
    reactionsListenerFn = (snap) => {
      const msg = snap.val();
      if (!msg || !msg.color || !msg.content) return;
      if ((msg.ts || 0) < matchJoinedAt - 1500) return;
      if (msg.byUid === myUid) return;
      if (typeof gameCallbacks.onReaction === "function") {
        gameCallbacks.onReaction(msg);
      }
    };
    reactionsListenerRef.on("child_added", reactionsListenerFn);

    const emitPresenceUpdates = () => {
      activeColors.forEach((color) => {
        const seat = latestSeats[color];
        if (!seat || seat.isBot || seat.uid === myUid) return;
        const isLeft = Boolean(seat.left);
        const isOnline = latestPresence[seat.uid] !== false;
        const status = isLeft ? "left" : (isOnline ? "online" : "offline");
        if (typeof gameCallbacks.onPlayerPresenceChange === "function") {
          gameCallbacks.onPlayerPresenceChange(color, status);
        }
      });
    };

    presenceListenerRef = roomRef.child("presence");
    presenceListenerFn = (snap) => {
      latestPresence = snap.val() || {};
      emitPresenceUpdates();
    };
    presenceListenerRef.on("value", presenceListenerFn);

    seatsListenerRef = roomRef.child("seats");
    seatsListenerFn = (snap) => {
      latestSeats = snap.val() || {};
      emitPresenceUpdates();
    };
    seatsListenerRef.on("value", seatsListenerFn);
  }

  // ==================== LIVE ACTION PUSH & REACTIONS ====================
  function pushAction(seq, payload) {
    if (!db || !currentRoomCode || !seq) return Promise.resolve(false);
    const ref = db.ref(`rooms/${currentRoomCode}/actions/${seq}`);
    const entry = {
      ...payload,
      seq,
      ts: Date.now()
    };
    return ref.transaction((curr) => (curr === null ? entry : undefined))
      .then((res) => Boolean(res && res.committed))
      .catch(() => false);
  }

  function sendReaction(color, content, isChat = false) {
    if (!db || !currentRoomCode) return;
    db.ref(`rooms/${currentRoomCode}/reactions`).push({
      color,
      content,
      isChat: Boolean(isChat),
      byUid: myUid,
      ts: Date.now()
    }).catch(() => {});
  }

  function isHostForRoom(players, activeColors) {
    if (!players || !Array.isArray(activeColors)) return false;
    for (const c of activeColors) {
      const p = players[c];
      if (!p || p.isBot || p.left || p.disconnected) continue;
      return p.uid === myUid;
    }
    for (const c of activeColors) {
      const p = players[c];
      if (!p || p.isBot || p.left) continue;
      return p.uid === myUid;
    }
    return false;
  }

  // ==================== CLEAN EXIT & CLEANUP ====================
  function cleanupLocalRoomState() {
    clearMatchmakingTimer();
    detachWaitingListener();
    detachMatchListeners();
    currentRoomCode = null;
    currentBucket = null;
    currentMyColor = null;
    currentIsPublic = false;
    currentRoomData = null;
    matchLaunched = false;
    latestPresence = {};
    latestSeats = {};
  }

  async function leaveWaitingRoom() {
    const code = currentRoomCode;
    const bucket = currentBucket;
    const color = currentMyColor;
    const isHost = currentRoomData && currentRoomData.hostUid === myUid;

    cleanupLocalRoomState();
    setOnlineView("home");

    if (!db || !code) return;
    try {
      if (isHost) {
        if (bucket) await db.ref(`matchmaking/${bucket}/${code}`).remove();
        await db.ref(`rooms/${code}`).remove();
      } else if (color) {
        await db.ref(`rooms/${code}/seats/${color}`).remove();
        await db.ref(`rooms/${code}/presence/${myUid}`).remove();
      }
    } catch {}
  }

  function leaveActiveMatch() {
    const code = currentRoomCode;
    const color = currentMyColor;
    const bucket = currentBucket;

    cleanupLocalRoomState();

    if (!db || !code) return;
    try {
      if (bucket) db.ref(`matchmaking/${bucket}/${code}`).remove().catch(() => {});
      if (color) db.ref(`rooms/${code}/seats/${color}/left`).set(true).catch(() => {});
      db.ref(`rooms/${code}/presence/${myUid}`).set(false).catch(() => {});
    } catch {}
  }

  function markMatchFinished() {
    const code = currentRoomCode;
    const bucket = currentBucket;

    cleanupLocalRoomState();

    if (!db || !code) return;
    try {
      if (bucket) db.ref(`matchmaking/${bucket}/${code}`).remove().catch(() => {});
      db.ref(`rooms/${code}/status`).set("finished").catch(() => {});
    } catch {}
  }

  function setGameCallbacks(cbs) {
    gameCallbacks = {
      onAction: cbs && cbs.onAction ? cbs.onAction : null,
      onReaction: cbs && cbs.onReaction ? cbs.onReaction : null,
      onPlayerPresenceChange: cbs && cbs.onPlayerPresenceChange ? cbs.onPlayerPresenceChange : null
    };
  }

  function openOnlineModal() {
    if (currentRoomCode && !matchLaunched) {
      setOnlineView("waiting");
    } else {
      setOnlineView("home");
    }
    setBusyState(false, "");
    syncOnlineTabsUI();
    if (window.LUDO_UI && typeof window.LUDO_UI.openModal === "function") {
      window.LUDO_UI.openModal("modal-online");
    }
  }

  function closeOnlineModal() {
    if (currentRoomCode && !matchLaunched) {
      leaveWaitingRoom();
    }
    if (window.LUDO_UI && typeof window.LUDO_UI.closeModal === "function") {
      window.LUDO_UI.closeModal("modal-online");
    }
  }

  // ==================== DOM EVENT BINDINGS ====================
  function bindOnlineUI() {
    document.querySelectorAll("#online-tabs .shop-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeOnlineTab = btn.dataset.otab;
        syncOnlineTabsUI();
      });
    });

    document.querySelectorAll("#online-quick-type .choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        quickState.gameType = btn.dataset.ogtype;
        syncOnlineTabsUI();
      });
    });

    document.querySelectorAll("#online-quick-count .choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        quickState.playerCount = Number(btn.dataset.ocount);
        syncOnlineTabsUI();
      });
    });

    document.querySelectorAll("#online-quick-stake .choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        quickState.stake = Number(btn.dataset.ostake);
        syncOnlineTabsUI();
      });
    });

    document.querySelectorAll("#online-friend-type .choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        friendState.gameType = btn.dataset.oftype;
        syncOnlineTabsUI();
      });
    });

    document.querySelectorAll("#online-friend-count .choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        friendState.playerCount = Number(btn.dataset.ofcount);
        syncOnlineTabsUI();
      });
    });

    const findBtn = document.getElementById("btn-online-find");
    if (findBtn) findBtn.addEventListener("click", findQuickMatch);

    const createBtn = document.getElementById("btn-online-create");
    if (createBtn) createBtn.addEventListener("click", createPrivateRoom);

    const joinBtn = document.getElementById("btn-online-join");
    if (joinBtn) joinBtn.addEventListener("click", joinPrivateRoomFromInput);

    const codeInput = document.getElementById("input-room-code");
    if (codeInput) {
      codeInput.addEventListener("input", () => {
        codeInput.value = codeInput.value.replace(/\D/g, "").slice(0, 6);
      });
    }

    const copyBtn = document.getElementById("btn-online-copy-code");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        if (!currentRoomCode) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(currentRoomCode)
            .then(() => showToast(`Room Code ${currentRoomCode} copied!`))
            .catch(() => showToast(`Room Code: ${currentRoomCode}`));
        } else {
          showToast(`Room Code: ${currentRoomCode}`);
        }
      });
    }

    const waBtn = document.getElementById("btn-online-share-wa");
    if (waBtn) {
      waBtn.addEventListener("click", () => {
        if (!currentRoomCode) return;
        const msg = encodeURIComponent(`Join my Ludo Kingdom match! 🎲\nRoom Code: ${currentRoomCode}`);
        window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener");
      });
    }

    const startNowBtn = document.getElementById("btn-online-start-now");
    if (startNowBtn) startNowBtn.addEventListener("click", () => hostStartRoom(false));

    const fillBotsBtn = document.getElementById("btn-online-fill-bots");
    if (fillBotsBtn) fillBotsBtn.addEventListener("click", () => hostStartRoom(true));

    const leaveWaitBtn = document.getElementById("btn-online-leave-wait");
    if (leaveWaitBtn) leaveWaitBtn.addEventListener("click", leaveWaitingRoom);

    const closeOnlineBtn = document.getElementById("btn-online-close");
    if (closeOnlineBtn) closeOnlineBtn.addEventListener("click", closeOnlineModal);
  }

  document.addEventListener("DOMContentLoaded", bindOnlineUI);

  return {
    openOnlineModal,
    closeOnlineModal,
    leaveWaitingRoom,
    leaveActiveMatch,
    markMatchFinished,
    pushAction,
    sendReaction,
    isHostForRoom,
    setGameCallbacks,
    getRoomInfo: () => ({
      roomCode: currentRoomCode,
      myColor: currentMyColor,
      myUid,
      isPublic: currentIsPublic
    })
  };
})();
