/* =========================================================
   LUDO KINGDOM - FULL-SCREEN THEMES, BUNDLES & STUDIO ENGINE
   ========================================================= */

window.LUDO_UI = (() => {
  const STORAGE_KEY = "ludo_kingdom_save_v7";
  const LEGACY_KEYS = [
    "ludo_kingdom_save_v6",
    "ludo_kingdom_save_v5",
    "ludo_kingdom_save_v4",
    "ludo_kingdom_save_v3",
    "ludo_kingdom_save_v2"
  ];
  const SAVED_MATCHES_KEY = "ludo_kingdom_saved_matches_v2";
  const LEGACY_MATCH_KEY = "ludo_kingdom_saved_match_v1";
  const MAX_SAVED_MATCHES = 10;
  const MAX_HISTORY_ITEMS = 10;

  const SOCIAL_LINKS = {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    gameUrl: window.location.href
  };

  // 5 Studio 3D Asset Packs (Loaded from assets/<pack>/)
  const STUDIO_PACKS = new Set(["candy", "egypt", "oasis", "halloween", "winter"]);

  // Every Theme Locks Directly to Its Own Matching Piece Set (No Separate Piece Mixing)
  const THEME_TO_PIECE_SKIN = {
    classic: "pin",
    candy: "candy",
    egypt: "egypt",
    oasis: "oasis",
    halloween: "halloween",
    winter: "winter",
    pearl: "crown",
    lava: "lava",
    galaxy: "galaxy",
    neon: "gemini",
    dark: "gem"
  };

  function getPieceSkinForTheme(themeId) {
    return THEME_TO_PIECE_SKIN[themeId] || "pin";
  }

  // Illustrated Character Avatars + Emoji Avatars (Available directly in Profile Edit)
  const ILLUSTRATED_AVATARS = {
    char_rajni: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#1e3a8a"/><circle cx="32" cy="27" r="14" fill="#d99b66"/><path d="M18 24 Q32 10 46 24 L46 29 Q32 22 18 29 Z" fill="#1e293b"/><rect x="20" y="24" width="10" height="6" rx="2" fill="#0f172a"/><rect x="34" y="24" width="10" height="6" rx="2" fill="#0f172a"/><line x1="30" y1="26" x2="34" y2="26" stroke="#f5c542" stroke-width="2"/><path d="M22 33 Q32 42 42 33 L40 40 Q32 45 24 40 Z" fill="#334155"/><path d="M14 60 Q18 44 32 44 Q46 44 50 60 Z" fill="#dc2626"/></svg>`,
    char_party: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#701a75"/><path d="M16 46 Q14 14 32 14 Q50 14 48 46 Z" fill="#4a1d1f"/><circle cx="32" cy="29" r="13" fill="#f5c29b"/><path d="M19 25 Q26 20 32 25 Q38 20 45 25 L43 31 Q32 28 21 31 Z" fill="#f43f5e"/><circle cx="26" cy="27" r="2.2" fill="#ffffff"/><circle cx="38" cy="27" r="2.2" fill="#ffffff"/><path d="M27 36 Q32 40 37 36" fill="none" stroke="#be123c" stroke-width="2.2" stroke-linecap="round"/><path d="M16 62 Q20 46 32 46 Q44 46 48 62 Z" fill="#ec4899"/></svg>`,
    char_kitten: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#0284c7"/><polygon points="16,28 20,10 30,22" fill="#f8fafc"/><polygon points="48,28 44,10 34,22" fill="#f8fafc"/><polygon points="19,25 21,14 27,22" fill="#fda4af"/><polygon points="45,25 43,14 37,22" fill="#fda4af"/><circle cx="32" cy="34" r="16" fill="#ffffff"/><circle cx="26" cy="32" r="2.6" fill="#0f172a"/><circle cx="38" cy="32" r="2.6" fill="#0f172a"/><polygon points="30,36 34,36 32,39" fill="#fb7185"/><path d="M26 17 L32 21 L38 17 L36 13 L32 16 L28 13 Z" fill="#f43f5e"/></svg>`,
    char_joker: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#312e81"/><circle cx="16" cy="24" r="7" fill="#38bdf8"/><circle cx="48" cy="24" r="7" fill="#f43f5e"/><circle cx="32" cy="31" r="14" fill="#fef3c7"/><circle cx="32" cy="32" r="4" fill="#ef4444"/><path d="M23 38 Q32 46 41 38" fill="none" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/><polygon points="20,18 32,6 44,18" fill="#facc15"/><circle cx="32" cy="6" r="3" fill="#ef4444"/></svg>`,
    char_captain: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#1d4ed8"/><circle cx="32" cy="31" r="13" fill="#eab38f"/><path d="M14 22 Q32 14 50 22 L46 15 Q32 10 18 15 Z" fill="#1e40af"/><ellipse cx="32" cy="22" rx="20" ry="4" fill="#2563eb"/><circle cx="27" cy="29" r="2" fill="#0f172a"/><circle cx="37" cy="29" r="2" fill="#0f172a"/><path d="M16 62 Q20 46 32 46 Q44 46 48 62 Z" fill="#3b82f6"/></svg>`,
    char_cricket: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#0f172a"/><circle cx="32" cy="32" r="13" fill="#d99b66"/><path d="M18 28 A14 14 0 0 1 46 28 Z" fill="#1d4ed8"/><rect x="22" y="28" width="20" height="9" rx="2" fill="none" stroke="#94a3b8" stroke-width="1.6"/><line x1="28" y1="28" x2="28" y2="37" stroke="#94a3b8" stroke-width="1.2"/><line x1="36" y1="28" x2="36" y2="37" stroke="#94a3b8" stroke-width="1.2"/><path d="M16 62 Q20 47 32 47 Q44 47 48 62 Z" fill="#2563eb"/></svg>`
  };

  const PROFILE_AVATARS = [
    "🤴", "👸", "char_rajni", "char_party", "char_kitten",
    "char_joker", "char_captain", "char_cricket", "🦁", "🐯",
    "🦊", "🐼", "🐉", "🥷", "👑"
  ];

  // ==================== FULL-SCREEN THEMES, DICE, FRAMES & EMOJIS CATALOG ====================
  // 3 Normal Themes + 5 Custom HD Themes
  const THEMES_CATALOG = [
    { id: "classic", name: "Default", bg: "linear-gradient(135deg,#1d75c8,#0d458a)", boardBg: "#ffffff", price: 0, currency: "coins" },
    { id: "lava", name: "Lava World", bg: "linear-gradient(135deg,#2b0d09,#ff571a,#ffd54f)", boardBg: "#1b0e0e", price: 3000, currency: "coins" },
    { id: "galaxy", name: "Galaxy", bg: "linear-gradient(135deg,#0d072b,#8a4cff,#4ddbff)", boardBg: "#10092e", price: 3500, currency: "coins" },
    { id: "candy", name: "Candy Land", isStudio: true, bg: "linear-gradient(135deg,#74c7ff,#ff85c0,#ffe352)", boardBg: "#ffeef8", price: 6000, currency: "coins" },
    { id: "winter", name: "Winter Land", isStudio: true, bg: "linear-gradient(135deg,#0c264d,#7dd3fc,#ffffff)", boardBg: "#e6f6ff", price: 8000, currency: "coins" },
    { id: "halloween", name: "Halloween", isStudio: true, bg: "linear-gradient(135deg,#2c144f,#ff8c1a)", boardBg: "#24153d", price: 10000, currency: "coins" },
    { id: "egypt", name: "Golden Egypt", isStudio: true, bg: "linear-gradient(135deg,#ffe58f,#b57e2d)", boardBg: "#f5e2a8", price: 50, currency: "gems" },
    { id: "oasis", name: "Dubai Oasis", isStudio: true, bg: "linear-gradient(135deg,#1d74b8,#f3dec1)", boardBg: "#f3dec1", price: 75, currency: "gems" }
  ];

  // 3 Normal Dice + 8 Full HD 3D Dice
  const DICE_CATALOG = [
    { id: "classic", name: "Default", top: "#ffffff", bot: "#d8e1f2", border: "#8a9bc4", pip: "#14203b", pipOne: "#e53935", glow: "rgba(255,224,102,0.7)", price: 0, currency: "coins" },
    { id: "tricolour", name: "Tri-Colour", top: "#ff9933", bot: "#138808", border: "#ffffff", pip: "#0b1636", pipOne: "#000080", glow: "rgba(255,165,51,0.75)", price: 750, currency: "coins" },
    { id: "ruby", name: "Ruby", top: "#ff5c6c", bot: "#9e0b22", border: "#ffd166", pip: "#ffffff", pipOne: "#ffe793", glow: "rgba(255,76,108,0.8)", price: 1200, currency: "coins" },
    { id: "royal_crown", name: "Royal Crown", isHD: true, top: "#fff6bd", bot: "#b87408", border: "#ffe885", pip: "#3d1c00", pipOne: "#b91c1c", glow: "rgba(255,215,0,0.95)", price: 2500, currency: "coins" },
    { id: "glacier_crystal", name: "Glacier Crystal", isHD: true, top: "#e8faff", bot: "#1e88c7", border: "#bae6fd", pip: "#072c4d", pipOne: "#0284c7", glow: "rgba(125,211,252,0.95)", price: 4500, currency: "coins" },
    { id: "cursed_relic", name: "Cursed Relic", isHD: true, top: "#522985", bot: "#1a0b2e", border: "#ff9838", pip: "#ffb74d", pipOne: "#4ade80", glow: "rgba(192,132,252,0.95)", price: 5000, currency: "coins" },
    { id: "magma_obsidian", name: "Magma Obsidian", isHD: true, top: "#382522", bot: "#0e0706", border: "#ff571a", pip: "#ff9e2c", pipOne: "#ff3b1f", glow: "rgba(255,87,26,0.95)", price: 6000, currency: "coins" },
    { id: "cyber_core", name: "Cyber Core", isHD: true, top: "#15254d", bot: "#050a18", border: "#25f4ee", pip: "#25f4ee", pipOne: "#ff2e93", glow: "rgba(37,244,238,0.95)", price: 6500, currency: "coins" },
    { id: "pharaoh_gold", name: "Pharaoh's Gold", isHD: true, top: "#ffe08a", bot: "#9e6514", border: "#40e0d0", pip: "#0d5c63", pipOne: "#0891b2", glow: "rgba(245,183,38,0.95)", price: 30, currency: "gems" },
    { id: "dubai_diamond", name: "Dubai Diamond", isHD: true, top: "#ffffff", bot: "#9fd8f5", border: "#50c878", pip: "#065f46", pipOne: "#0ea5e9", glow: "rgba(110,231,255,0.95)", price: 40, currency: "gems" },
    { id: "cosmic_nebula", name: "Cosmic Nebula", isHD: true, top: "#4b1d96", bot: "#0c0624", border: "#c084fc", pip: "#7ce8ff", pipOne: "#fde047", glow: "rgba(192,132,252,0.95)", price: 45, currency: "gems" }
  ];

  // 9 Square Profile Frames
  const FRAMES_CATALOG = [
    { id: "bronze", name: "Bronze", price: 0, currency: "coins" },
    { id: "silver", name: "Silver", price: 750, currency: "coins" },
    { id: "royal_gold", name: "Royal Gold", price: 1500, currency: "coins" },
    { id: "glacier_ice", name: "Glacier Ice", price: 3000, currency: "coins" },
    { id: "magma_obsidian", name: "Magma Obsidian", price: 4000, currency: "coins" },
    { id: "cyber_neon", name: "Cyber Neon", price: 5500, currency: "coins" },
    { id: "pharaoh_sand", name: "Pharaoh's Sand", price: 30, currency: "gems" },
    { id: "dubai_emerald", name: "Dubai Emerald", price: 40, currency: "gems" },
    { id: "cosmic_void", name: "Cosmic Void", price: 45, currency: "gems" }
  ];

  const EMOJI_PACKS = [
    {
      id: "classic",
      name: "Default",
      emojis: ["😂", "🔥", "👏", "😎", "😭", "😡"],
      chats: ["Nice Move! 🔥", "Close Call! 😅", "Hurry Up! ⏳", "Good Game! 👏", "Watch Out! 👀"],
      price: 0,
      currency: "coins"
    },
    {
      id: "royal",
      name: "Ludo King",
      emojis: ["👑", "🤑", "🏆", "💎", "🕺", "🤩"],
      chats: ["Royal Roll! 👑", "Bow to the King! 🏆", "Jackpot Move! 💎", "Well Played! 👏", "My Board! 😎"],
      price: 450,
      currency: "coins"
    },
    {
      id: "festival",
      name: "Holi & Diya",
      emojis: ["🪔", "🎨", "🧨", "🥳", "💃", "✨"],
      chats: ["Festive Vibes! 🪔", "Boom! 🧨", "Colorful Move! 🎨", "Party Time! 🥳", "Shining Bright! ✨"],
      price: 600,
      currency: "coins"
    },
    {
      id: "spooky",
      name: "Spooky Ice",
      emojis: ["🎃", "👻", "🥶", "⛄", "💀", "⚡"],
      chats: ["Boo! 👻", "Ice Cold! 🥶", "Spooky Roll! 🎃", "Frozen Out! ⛄", "Shocking! ⚡"],
      price: 15,
      currency: "gems"
    }
  ];

  // ==================== SHOP CATALOG (OFFER BUNDLES, COINS & GEMS ONLY) ====================
  const SHOP_BUNDLES = [
    {
      id: "bundle_candy",
      title: "Candy Feast Offer",
      tag: "BEST VALUE",
      themeId: "candy",
      themeName: "Candy Land 3D",
      coins: 2500,
      gems: 35,
      price: 500,
      currency: "coins",
      bg: "linear-gradient(135deg,#74c7ff,#ff85c0)",
      icon: "🍭"
    },
    {
      id: "bundle_egypt",
      title: "Pharaoh Treasure Offer",
      tag: "HOT DEAL",
      themeId: "egypt",
      themeName: "Golden Egypt 3D",
      coins: 0,
      gems: 60,
      price: 700,
      currency: "coins",
      bg: "linear-gradient(135deg,#ffe58f,#b57e2d)",
      icon: "⚱️"
    },
    {
      id: "bundle_halloween",
      title: "Spooky Night Offer",
      tag: "LIMITED",
      themeId: "halloween",
      themeName: "Halloween 3D",
      coins: 3500,
      gems: 40,
      price: 15,
      currency: "gems",
      bg: "linear-gradient(135deg,#2c144f,#ff8c1a)",
      icon: "🎃"
    },
    {
      id: "bundle_winter",
      title: "Frost Kingdom Offer",
      tag: "POPULAR",
      themeId: "winter",
      themeName: "Winter Land 3D",
      coins: 2000,
      gems: 50,
      price: 650,
      currency: "coins",
      bg: "linear-gradient(135deg,#0c264d,#7dd3fc)",
      icon: "❄️"
    }
  ];

  const SHOP_COINS = [
    { id: "pack_c1000", name: "+1,000 Coins", preview: "🪙", bg: "linear-gradient(135deg,#ffe27a,#c58b16)", amount: 1000 },
    { id: "pack_c3000", name: "+3,000 Coins", preview: "🪙", bg: "linear-gradient(135deg,#ffd54f,#b36b00)", amount: 3000 },
    { id: "pack_c5000", name: "+5,000 Coins", preview: "💰", bg: "linear-gradient(135deg,#ffca28,#a85f00)", amount: 5000 },
    { id: "pack_c10000", name: "+10,000 Coins", preview: "👑", bg: "linear-gradient(135deg,#fff0a6,#9c5200)", amount: 10000 }
  ];

  const SHOP_GEMS = [
    { id: "pack_g25", name: "+25 Gems", preview: "💎", bg: "linear-gradient(135deg,#56c8ff,#1456b8)", amount: 25 },
    { id: "pack_g60", name: "+60 Gems", preview: "💎", bg: "linear-gradient(135deg,#38bdf8,#1e40af)", amount: 60 },
    { id: "pack_g120", name: "+120 Gems", preview: "💠", bg: "linear-gradient(135deg,#a86bff,#5115b8)", amount: 120 },
    { id: "pack_g250", name: "+250 Gems", preview: "✨", bg: "linear-gradient(135deg,#ff6ec7,#7b1fa2)", amount: 250 }
  ];

  const PIECE_PALETTES = {
    red: { main: "#e53935", light: "#ff8582", dark: "#961212", accent: "#ffd6d6" },
    green: { main: "#22b14c", light: "#7df299", dark: "#0e6628", accent: "#d4ffe0" },
    yellow: { main: "#f7c316", light: "#fff08a", dark: "#b07900", accent: "#fff8cc" },
    blue: { main: "#1e90ff", light: "#85ccff", dark: "#0a49a3", accent: "#d6eeff" }
  };

  // ==================== AUTOMATIC WHITE-BACKGROUND REMOVER FOR 3D SPRITES ====================
  const spriteCache = new Map();

  function loadTransparentSprite(url) {
    if (spriteCache.has(url)) return spriteCache.get(url);

    const promise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const size = 128;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, size, size);

          const imgData = ctx.getImageData(0, 0, size, size);
          const d = imgData.data;

          const visited = new Uint8Array(size * size);
          const stack = [];
          const isNearWhite = (idx) => d[idx] > 234 && d[idx + 1] > 234 && d[idx + 2] > 234;

          for (let x = 0; x < size; x++) stack.push(x, (size - 1) * size + x);
          for (let y = 0; y < size; y++) stack.push(y * size, y * size + (size - 1));

          while (stack.length > 0) {
            const p = stack.pop();
            if (p < 0 || p >= size * size || visited[p]) continue;
            visited[p] = 1;
            const idx = p * 4;
            if (!isNearWhite(idx)) continue;

            d[idx + 3] = 0;
            const x = p % size;
            const y = (p / size) | 0;
            if (x > 0) stack.push(p - 1);
            if (x < size - 1) stack.push(p + 1);
            if (y > 0) stack.push(p - size);
            if (y < size - 1) stack.push(p + size);
          }

          for (let p = 0; p < size * size; p++) {
            const idx = p * 4;
            if (d[idx + 3] === 0) continue;
            if (d[idx] > 224 && d[idx + 1] > 224 && d[idx + 2] > 224) {
              const neighbors = [p - 1, p + 1, p - size, p + size];
              for (const n of neighbors) {
                if (n >= 0 && n < size * size && d[n * 4 + 3] === 0) {
                  d[idx + 3] = 95;
                  break;
                }
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);
          resolve({ ok: true, src: canvas.toDataURL("image/png"), clipped: false });
        } catch {
          resolve({ ok: true, src: url, clipped: true });
        }
      };
      img.onerror = () => resolve({ ok: false, src: "", clipped: false });
      img.src = url;
    });

    spriteCache.set(url, promise);
    return promise;
  }

  // ==================== AUTOMATIC TRANSPARENT LOADER FOR HD DICE & ORNATE FRAMES ====================
  const HD_DICE_IDS = new Set([
    "royal_crown", "glacier_crystal", "cursed_relic", "magma_obsidian",
    "cyber_core", "pharaoh_gold", "dubai_diamond", "cosmic_nebula"
  ]);
  const hdAssetCache = new Map();

  function isHDDiceSkin(diceId) {
    return HD_DICE_IDS.has(diceId);
  }

  function getDiceAssetUrl(diceId) {
    return HD_DICE_IDS.has(diceId) ? `./assets/dice/${diceId}.webp` : "";
  }

  function loadTransparentDarkAsset(url, punchCenter = false) {
    const cacheKey = `${url}|${punchCenter ? "frame" : "dice"}`;
    if (hdAssetCache.has(cacheKey)) return hdAssetCache.get(cacheKey);

    const promise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const size = 256;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, size, size);

          const imgData = ctx.getImageData(0, 0, size, size);
          const d = imgData.data;

          // If the PNG already has real alpha transparency, use original crisp URL directly
          const tlAlpha = d[(2 * size + 2) * 4 + 3];
          const centerAlpha = d[(Math.floor(size / 2) * size + Math.floor(size / 2)) * 4 + 3];
          if (tlAlpha < 230 && (!punchCenter || centerAlpha < 230)) {
            resolve({ ok: true, src: url });
            return;
          }

          const visited = new Uint8Array(size * size);
          const colorDist = (idx, r, g, b) => {
            const dr = d[idx] - r;
            const dg = d[idx + 1] - g;
            const db = d[idx + 2] - b;
            return Math.sqrt(dr * dr + dg * dg + db * db);
          };

          const floodRegion = (seedPoints, maxSeedDist, maxStepDist) => {
            const stack = [];
            let sumR = 0, sumG = 0, sumB = 0, count = 0;
            for (const p of seedPoints) {
              if (p < 0 || p >= size * size) continue;
              const idx = p * 4;
              sumR += d[idx];
              sumG += d[idx + 1];
              sumB += d[idx + 2];
              count += 1;
            }
            if (count === 0) return;
            const sR = sumR / count;
            const sG = sumG / count;
            const sB = sumB / count;

            for (const p of seedPoints) {
              if (p < 0 || p >= size * size || visited[p]) continue;
              const idx = p * 4;
              if (colorDist(idx, sR, sG, sB) <= maxSeedDist) {
                visited[p] = 1;
                d[idx + 3] = 0;
                stack.push(p);
              }
            }

            while (stack.length > 0) {
              const p = stack.pop();
              const pIdx = p * 4;
              const pR = d[pIdx], pG = d[pIdx + 1], pB = d[pIdx + 2];
              const x = p % size;
              const y = (p / size) | 0;

              const neighbors = [];
              if (x > 0) neighbors.push(p - 1);
              if (x < size - 1) neighbors.push(p + 1);
              if (y > 0) neighbors.push(p - size);
              if (y < size - 1) neighbors.push(p + size);

              for (const n of neighbors) {
                if (visited[n]) continue;
                const nIdx = n * 4;
                if (colorDist(nIdx, sR, sG, sB) <= maxSeedDist && colorDist(nIdx, pR, pG, pB) <= maxStepDist) {
                  visited[n] = 1;
                  d[nIdx + 3] = 0;
                  stack.push(n);
                }
              }
            }
          };

          // 1. Flood-fill outer background from top & left edges (avoids tiny bottom-right corner mark)
          const outerSeeds = [];
          for (let x = 0; x < size; x++) {
            outerSeeds.push(x);
            if (x < size * 0.78) outerSeeds.push((size - 1) * size + x);
          }
          for (let y = 0; y < size; y++) {
            outerSeeds.push(y * size);
            if (y < size * 0.78) outerSeeds.push(y * size + (size - 1));
          }
          floodRegion(outerSeeds, 52, 24);

          // 2. For square profile frames, also punch out the solid dark-navy interior window cleanly
          if (punchCenter) {
            const c = Math.floor(size / 2);
            const centerSeeds = [
              c * size + c,
              (c - 8) * size + c,
              (c + 8) * size + c,
              c * size + (c - 8),
              c * size + (c + 8)
            ];
            floodRegion(centerSeeds, 52, 24);
          }

          // 3. Soft 1px edge feathering on pixels touching transparent background
          const sR = d[0], sG = d[1], sB = d[2];
          for (let p = 0; p < size * size; p++) {
            const idx = p * 4;
            if (d[idx + 3] === 0) continue;
            if (colorDist(idx, sR, sG, sB) < 68) {
              const x = p % size;
              const y = (p / size) | 0;
              if (
                (x > 0 && d[(p - 1) * 4 + 3] === 0) ||
                (x < size - 1 && d[(p + 1) * 4 + 3] === 0) ||
                (y > 0 && d[(p - size) * 4 + 3] === 0) ||
                (y < size - 1 && d[(p + size) * 4 + 3] === 0)
              ) {
                d[idx + 3] = 90;
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);
          resolve({ ok: true, src: canvas.toDataURL("image/png") });
        } catch {
          // On file:// CORS restriction, dice can still display directly, while frames fall back to CSS border
          resolve(punchCenter ? { ok: false, src: "" } : { ok: true, src: url });
        }
      };
      img.onerror = () => resolve({ ok: false, src: "" });
      img.src = url;
    });

    hdAssetCache.set(cacheKey, promise);
    return promise;
  }

  function loadDiceAsset(diceId) {
    const url = getDiceAssetUrl(diceId);
    if (!url) return Promise.resolve({ ok: false, src: "" });
    return loadTransparentDarkAsset(url, false);
  }

  function applyFrameVisual(overlayEl, frameId) {
    if (!overlayEl) return;
    const fId = frameId || "bronze";
    overlayEl.dataset.targetFrame = fId;
    overlayEl.className = `frame-overlay frame-${fId}`;
    overlayEl.innerHTML = "";
    const parentBox = overlayEl.closest(".avatar-frame-box");
    if (parentBox) parentBox.classList.remove("has-png-frame");

    loadTransparentDarkAsset(`./assets/frames/${fId}.webp`, true).then((res) => {
      if (!res.ok || !overlayEl.isConnected || overlayEl.dataset.targetFrame !== fId) return;
      overlayEl.classList.add("has-png-frame");
      if (parentBox) parentBox.classList.add("has-png-frame");
      const img = document.createElement("img");
      img.className = "frame-png-img";
      img.src = res.src;
      img.alt = "";
      overlayEl.innerHTML = "";
      overlayEl.appendChild(img);
    });
  }

  function checkStudioBackdropExists(themeId) {
    if (!STUDIO_PACKS.has(themeId)) {
      document.body.classList.remove("has-studio-bg");
      return;
    }
    const probe = new Image();
    probe.onload = () => document.body.classList.add("has-studio-bg");
    probe.onerror = () => document.body.classList.remove("has-studio-bg");
    probe.src = `./assets/${themeId}/bg.webp`;
  }

  function getTokenSVG(skinId = "pin", color = "red") {
    const p = PIECE_PALETTES[color] || PIECE_PALETTES.red;

    switch (skinId) {
      case "pin":
        return `
          <svg class="token-svg" viewBox="0 0 64 64" aria-hidden="true">
            <path d="M32 61 C32 61 11 40 11 25 A21 21 0 1 1 53 25 C53 40 32 61 32 61 Z"
                  fill="#ffffff" stroke="#1e293b" stroke-width="3.2" stroke-linejoin="round"/>
            <circle cx="32" cy="25" r="12.5" fill="${p.main}" stroke="${p.dark}" stroke-width="2"/>
            <circle cx="28" cy="21" r="4" fill="${p.light}" opacity="0.85"/>
          </svg>`;

      case "crown":
        return `
          <svg class="token-svg" viewBox="0 0 64 64" aria-hidden="true">
            <path d="M8 48 L12 20 L24 32 L32 12 L40 32 L52 20 L56 48 Z"
                  fill="${p.main}" stroke="#ffe793" stroke-width="3.6" stroke-linejoin="round"/>
            <rect x="8" y="47" width="48" height="9" rx="4.5" fill="#f5c542" stroke="#8a5a00" stroke-width="2.2"/>
            <circle cx="32" cy="11" r="4.2" fill="#ffe793"/>
          </svg>`;

      case "gem":
        return `
          <svg class="token-svg" viewBox="0 0 64 64" aria-hidden="true">
            <polygon points="18,10 46,10 58,25 32,58 6,25" fill="${p.main}" stroke="#ffffff" stroke-width="3.2" stroke-linejoin="round"/>
            <polygon points="18,10 46,10 38,25 26,25" fill="${p.light}" opacity="0.88"/>
            <polygon points="26,25 38,25 32,58" fill="${p.dark}" opacity="0.55"/>
          </svg>`;

      case "gemini":
        return `
          <svg class="token-svg" viewBox="0 0 64 64" aria-hidden="true">
            <path d="M32 4 C35 22 42 29 60 32 C42 35 35 42 32 60 C29 42 22 35 4 32 C22 29 29 22 32 4 Z"
                  fill="${p.main}" stroke="#ffffff" stroke-width="3.2" stroke-linejoin="round"/>
            <circle cx="32" cy="32" r="6" fill="#ffffff"/>
          </svg>`;

      case "lava":
        return `
          <svg class="token-svg" viewBox="0 0 64 64" aria-hidden="true">
            <path d="M32 4 C40 16 52 24 52 38 C52 50 43 59 32 59 C21 59 12 50 12 38 C12 28 18 21 22 14 C23 20 26 22 28 18 C29 12 30 8 32 4 Z"
                  fill="${p.main}" stroke="#ffcf66" stroke-width="3" stroke-linejoin="round"/>
            <ellipse cx="32" cy="44" rx="6" ry="8" fill="#fff6cc"/>
          </svg>`;

      case "galaxy":
        return `
          <svg class="token-svg" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="18" fill="${p.main}" stroke="#ffffff" stroke-width="2.8"/>
            <ellipse cx="32" cy="33" rx="28" ry="8.5" transform="rotate(-22 32 33)" fill="none" stroke="#ffe793" stroke-width="4.2"/>
          </svg>`;

      case "candy":
        return `
          <svg class="token-svg" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="25" fill="${p.main}" stroke="#ffffff" stroke-width="3.5"/>
            <path d="M32 32 m-2 -2 a5 5 0 0 1 9 2 a10 10 0 0 1 -16 7 a15 15 0 0 1 -2 -20 a20 20 0 0 1 26 -3"
                  fill="none" stroke="#ffffff" stroke-width="4.4" stroke-linecap="round"/>
          </svg>`;

      case "egypt":
        return `
          <svg class="token-svg" viewBox="0 0 64 64" aria-hidden="true">
            <polygon points="32,6 54,18 48,50 32,59 16,50 10,18" fill="#f5c542" stroke="#7a4c00" stroke-width="3.2"/>
            <polygon points="32,13 47,22 42,45 32,52 22,45 17,22" fill="${p.main}" stroke="#fff0a6" stroke-width="2.2"/>
          </svg>`;

      case "oasis":
        return `
          <svg class="token-svg" viewBox="0 0 64 64" aria-hidden="true">
            <path d="M24 10 C42 16 50 32 48 50 L24 50 Z" fill="${p.main}" stroke="#ffffff" stroke-width="3"/>
            <path d="M12 50 Q32 58 52 50 L48 56 Q32 61 16 56 Z" fill="#f5c542" stroke="#ffffff" stroke-width="1.8"/>
          </svg>`;

      case "halloween":
        return `
          <svg class="token-svg" viewBox="0 0 64 64" aria-hidden="true">
            <ellipse cx="32" cy="35" rx="23" ry="19" fill="${p.main}" stroke="#ffe793" stroke-width="3"/>
            <rect x="29" y="10" width="6" height="8" rx="2" fill="#22c55e"/>
            <path d="M21 41 Q32 48 43 41" fill="none" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/>
          </svg>`;

      case "winter":
        return `
          <svg class="token-svg" viewBox="0 0 64 64" aria-hidden="true">
            <g stroke="${p.main}" stroke-width="5" stroke-linecap="round">
              <line x1="32" y1="8" x2="32" y2="56"/>
              <line x1="11" y1="20" x2="53" y2="44"/>
              <line x1="53" y1="20" x2="11" y2="44"/>
            </g>
            <circle cx="32" cy="32" r="8" fill="#ffffff" stroke="${p.main}" stroke-width="3"/>
          </svg>`;

      default:
        return `
          <svg class="token-svg" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="25" fill="${p.main}" stroke="#ffffff" stroke-width="4.2"/>
            <circle cx="32" cy="32" r="13" fill="${p.accent}" opacity="0.92"/>
          </svg>`;
    }
  }

  function renderPieceVisual(containerEl, skinId, color) {
    if (!containerEl) return;
    containerEl.innerHTML = getTokenSVG(skinId, color);

    if (STUDIO_PACKS.has(skinId)) {
      const spriteUrl = `./assets/${skinId}/piece-${color}.webp`;
      loadTransparentSprite(spriteUrl).then((res) => {
        if (!res.ok || !containerEl.isConnected) return;
        const img = document.createElement("img");
        img.className = "token-sprite-img" + (res.clipped ? " sprite-clip-round" : "");
        img.src = res.src;
        img.alt = "";
        containerEl.innerHTML = "";
        containerEl.appendChild(img);
      });
    }
  }

  function getThemeSceneryHTML(themeId) {
    if (themeId === "pearl") {
      return `
        <svg class="scenery-svg scenery-top" viewBox="0 0 400 130" preserveAspectRatio="none">
          <path d="M0 16 Q100 58 200 22 Q300 58 400 16" fill="none" stroke="#f5d57a" stroke-width="2.5"/>
          <path d="M60 128 Q200 72 340 128" fill="none" stroke="#f0d78c" stroke-width="4" opacity="0.7"/>
        </svg>`;
    }
    if (themeId === "lava") {
      return `
        <svg class="scenery-svg scenery-bottom" viewBox="0 0 400 150" preserveAspectRatio="none">
          <polygon points="-10,150 70,58 145,150" fill="#1f0a08"/>
          <polygon points="245,150 326,48 410,150" fill="#1c0806"/>
          <path d="M70 58 L78 96 L64 130" fill="none" stroke="#ff6a00" stroke-width="3.5" class="scenery-pulse"/>
        </svg>`;
    }
    if (themeId === "galaxy") {
      return `
        <svg class="scenery-svg scenery-left scenery-float" viewBox="0 0 130 130">
          <circle cx="56" cy="58" r="24" fill="#9d5cff" opacity="0.85"/>
          <ellipse cx="56" cy="58" rx="44" ry="11" transform="rotate(-22 56 58)" fill="none" stroke="#7ce8ff" stroke-width="4" opacity="0.8"/>
        </svg>`;
    }
    return "";
  }

  function renderThemeScenery(themeId) {
    const container = document.getElementById("theme-scenery");
    if (!container) return;
    container.innerHTML = getThemeSceneryHTML(themeId);
  }

  // ==================== SLOW, SUBTLE AMBIENT PARTICLE ENGINE ====================
  const THEME_FX = (() => {
    let canvas = null;
    let ctx = null;
    let currentTheme = "classic";
    let particles = [];
    let rafId = null;
    let running = false;

    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : Math.min(window.innerWidth, 480);
      const h = parent ? parent.clientHeight : window.innerHeight;
      if (w > 0 && h > 0) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    function createParticle(theme, randomY = true) {
      const w = (canvas && canvas.width) || 400;
      const h = (canvas && canvas.height) || 760;
      const upward = theme === "lava" || theme === "egypt" || theme === "oasis" || theme === "halloween";
      const y = randomY ? Math.random() * h : (upward ? h + 12 : -12);

      if (theme === "winter") {
        return { x: Math.random() * w, y, vx: (Math.random() - 0.5) * 0.2, vy: 0.22 + Math.random() * 0.35, size: 1.6 + Math.random() * 2.4, sway: Math.random() * Math.PI * 2, color: "#ffffff", alpha: 0.48 + Math.random() * 0.35 };
      }
      if (theme === "halloween") {
        const colors = ["#ff9838", "#c084fc", "#fde047"];
        return { x: Math.random() * w, y, vx: (Math.random() - 0.5) * 0.18, vy: -(0.14 + Math.random() * 0.25), size: 1.6 + Math.random() * 2.4, sway: Math.random() * Math.PI * 2, color: colors[Math.floor(Math.random() * colors.length)], alpha: 0.4 + Math.random() * 0.38 };
      }
      if (theme === "candy") {
        const colors = ["#ff4d94", "#ffd633", "#4cd964", "#44b5ff", "#ffffff"];
        return { x: Math.random() * w, y, vx: (Math.random() - 0.5) * 0.18, vy: 0.18 + Math.random() * 0.28, size: 1.8 + Math.random() * 2.2, sway: Math.random() * Math.PI * 2, color: colors[Math.floor(Math.random() * colors.length)], alpha: 0.4 + Math.random() * 0.35 };
      }
      if (theme === "lava") {
        return { x: Math.random() * w, y, vx: (Math.random() - 0.5) * 0.28, vy: -(0.32 + Math.random() * 0.55), size: 1.8 + Math.random() * 2.6, sway: Math.random() * Math.PI * 2, color: Math.random() < 0.5 ? "#ff6600" : "#ffd54f", alpha: 0.5 + Math.random() * 0.35 };
      }
      if (theme === "galaxy") {
        return { x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, size: 1 + Math.random() * 2, sway: Math.random() * Math.PI * 2, color: Math.random() < 0.5 ? "#ffffff" : "#a470ff", alpha: 0.55, twinkle: true };
      }
      return { x: Math.random() * w, y, vx: (Math.random() - 0.5) * 0.15, vy: upward ? -0.18 : 0.16, size: 1.5 + Math.random() * 2, sway: Math.random() * Math.PI * 2, color: "#ffe793", alpha: 0.34 + Math.random() * 0.32 };
    }

    function seedParticles(theme) {
      particles = [];
      const count = theme === "galaxy" ? 36 : 18;
      for (let i = 0; i < count; i++) particles.push(createParticle(theme, true));
    }

    function tick() {
      if (!running || !ctx || !canvas) {
        rafId = null;
        return;
      }
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.sway += 0.018;
        if (p.twinkle) {
          ctx.globalAlpha = 0.2 + (Math.sin(p.sway) * 0.5 + 0.5) * 0.65;
        } else {
          p.x += p.vx + Math.sin(p.sway) * 0.14;
          p.y += p.vy;
          if (p.y > h + 14 || p.y < -14 || p.x > w + 14 || p.x < -14) {
            particles[i] = createParticle(currentTheme, false);
            continue;
          }
          ctx.globalAlpha = p.alpha;
        }
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(tick);
    }

    function init() {
      canvas = document.getElementById("theme-bg-canvas");
      if (!canvas) return;
      ctx = canvas.getContext("2d");
      resize();
      window.addEventListener("resize", resize);
    }

    function setTheme(themeId) {
      currentTheme = themeId || "classic";
      resize();
      seedParticles(currentTheme);
    }

    function start() {
      if (!canvas || running || document.hidden) return;
      resize();
      if (particles.length === 0) seedParticles(currentTheme);
      running = true;
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    return { init, setTheme, start, stop };
  })();

  const STREAK_REWARDS = [
    { day: 1, icon: "🪙", label: "+300 Coins", coins: 300, gems: 0 },
    { day: 2, icon: "💎", label: "+10 Gems", coins: 0, gems: 10 },
    { day: 3, icon: "🪙", label: "+500 Coins", coins: 500, gems: 0 },
    { day: 4, icon: "💎", label: "+15 Gems", coins: 0, gems: 15 },
    { day: 5, icon: "🪙", label: "+800 Coins", coins: 800, gems: 0 },
    { day: 6, icon: "💎", label: "+25 Gems", coins: 0, gems: 25 },
    { day: 7, icon: "👑", label: "+2,500 Coins & +50 Gems", coins: 2500, gems: 50 }
  ];

  const RANK_TIERS = [
    { name: "Bronze", icon: "🥉", minWins: 0 },
    { name: "Silver", icon: "🥈", minWins: 3 },
    { name: "Gold", icon: "🥇", minWins: 7 },
    { name: "Diamond", icon: "💎", minWins: 15 },
    { name: "Ludo Emperor", icon: "👑", minWins: 30 }
  ];

  const CUP_ROUNDS = [
    { round: 1, title: "Quarterfinal", playerCount: 2, difficulty: "easy", rewardCoins: 300 },
    { round: 2, title: "Semifinal", playerCount: 3, difficulty: "normal", rewardCoins: 500 },
    { round: 3, title: "Grand Final", playerCount: 4, difficulty: "pro", rewardCoins: 3000, rewardGems: 40 }
  ];

  const SPIN_PRIZES = [
    { label: "🪙 200", amount: 200, currency: "coins" },
    { label: "💎 10", amount: 10, currency: "gems" },
    { label: "🪙 500", amount: 500, currency: "coins" },
    { label: "💎 25", amount: 25, currency: "gems" },
    { label: "🪙 100", amount: 100, currency: "coins" },
    { label: "🪙 1000", amount: 1000, currency: "coins" },
    { label: "💎 50", amount: 50, currency: "gems" },
    { label: "🪙 2000", amount: 2000, currency: "coins" }
  ];

  const DAILY_MISSIONS_DEF = [
    { id: "d_roll6", title: "Roll five 6s", stat: "roll6", target: 5, reward: 300, currency: "coins" },
    { id: "d_capture", title: "Capture 3 opponents", stat: "capture", target: 3, reward: 400, currency: "coins" },
    { id: "d_home", title: "Bring 4 tokens Home", stat: "home", target: 4, reward: 12, currency: "gems" },
    { id: "d_win", title: "Win 2 matches", stat: "win", target: 2, reward: 600, currency: "coins" }
  ];

  const ACHIEVEMENTS_DEF = [
    { id: "a_first_win", title: "First Victory", stat: "win", target: 1, reward: 300, currency: "coins" },
    { id: "a_cup_champ", title: "Win a Kingdom Cup 🏆", stat: "cup", target: 1, reward: 30, currency: "gems" },
    { id: "a_hunter", title: "Capture 10 Opponents", stat: "capture", target: 10, reward: 20, currency: "gems" },
    { id: "a_roller", title: "Roll twenty-five 6s", stat: "roll6", target: 25, reward: 600, currency: "coins" },
    { id: "a_home_hero", title: "Bring 20 Tokens Home", stat: "home", target: 20, reward: 25, currency: "gems" },
    { id: "a_legend", title: "Win 10 Matches", stat: "win", target: 10, reward: 50, currency: "gems" }
  ];

  const SPLASH_TIPS = [
    "Tip: Open Themes on the right side of the home screen to explore 3D worlds!",
    "Tip: Check Shop → 🎁 Offers for Theme + Coins + Gems combo bundles!",
    "Tip: Tap ••• in the bottom-left during a match for Music, Sound, Save & Home.",
    "Tip: Select Pass & Play inside PLAY to choose between Single or 2v2 Team Up!"
  ];

  const COLOR_HEX = { red: "#e53935", green: "#22b14c", yellow: "#f7c316", blue: "#1e90ff" };
  const COLOR_NAMES = { red: "Red", green: "Green", yellow: "Yellow", blue: "Blue" };
  const MEDALS = ["🥇", "🥈", "🥉", "4️⃣"];

  function getDateKey(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function cloneDefaults() {
    return {
      profile: {
        name: "Player_123",
        avatar: "🤴",
        photo: "",
        coins: 1000,
        gems: 50,
        spinTickets: 0,
        matches: 0,
        wins: 0,
        cupsWon: 0,
        streakDay: 0,
        lastRewardDate: "",
        lastSpinDate: ""
      },
      settings: {
        sound: true,
        music: true,
        vibration: true,
        timer: true,
        autoMove: true,
        speed: "medium",
        theme: "classic",
        diceSkin: "classic",
        tokenSkin: "pin",
        frame: "bronze",
        emojiPack: "classic"
      },
      inventory: {
        themes: ["classic"],
        dice: ["classic"],
        frames: ["bronze"],
        emojis: ["classic"],
        bundlesClaimed: []
      },
      cup: {
        active: false,
        round: 1,
        gameType: "quick",
        humanColor: "blue"
      },
      history: [],
      missions: {
        date: getDateKey(0),
        dailyProgress: { roll6: 0, capture: 0, home: 0, win: 0, cup: 0 },
        dailyClaimed: [],
        lifetime: { roll6: 0, capture: 0, home: 0, win: 0, cup: 0 },
        achievementsClaimed: []
      }
    };
  }

  let appData = loadData();
  let selectedAvatarTemp = appData.profile.avatar;
  let selectedPhotoTemp = appData.profile.photo;
  let activeShopTab = "bundles";
  let activeThemesTab = "themes";
  let activeProfileTab = "edit";
  let activeMissionTab = "daily";

  let setupState = {
    mode: "vs-bot",
    passStyle: "single", // "single" | "team"
    gameType: "classic",
    difficulty: "normal",
    playerCount: 2,
    humanColor: "blue",
    teamPlay: "local",   // "local" | "bot"
    teamPair: "ry",
    stake: 0
  };

  let lastMatchConfig = null;
  let winNextAction = "replay";
  let toastTimer = null;
  let resetConfirmArmed = false;
  let resetConfirmTimer = null;
  let deleteAllArmed = false;
  let deleteAllTimer = null;
  let wheelRotation = 0;
  let isSpinning = false;
  let deferredInstallPrompt = null;
  let shopReturnScreen = "home-screen";
  let pendingPurchaseAction = null;

  // ==================== AVATAR / PHOTO RENDERER ====================
  function isImageAvatar(val) {
    return typeof val === "string" && val.startsWith("data:image/");
  }

  function getActiveAvatarValue() {
    return appData.profile.photo || appData.profile.avatar;
  }

  function renderAvatar(el, value) {
    if (!el) return;
    el.innerHTML = "";
    if (isImageAvatar(value)) {
      const img = document.createElement("img");
      img.className = "avatar-img";
      img.src = value;
      img.alt = "Profile";
      el.appendChild(img);
    } else if (ILLUSTRATED_AVATARS[value]) {
      el.innerHTML = ILLUSTRATED_AVATARS[value];
      const svg = el.querySelector("svg");
      if (svg) svg.classList.add("avatar-img");
    } else {
      el.textContent = value || "🤴";
    }
  }

  function compressGalleryPhoto(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Read failed"));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Invalid image"));
        img.onload = () => {
          const size = 160;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
          resolve(canvas.toDataURL("image/jpeg", 0.78));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // ==================== ROYAL RANK LADDER ====================
  function getRankInfo(wins = appData.profile.wins) {
    let currentIdx = 0;
    for (let i = 0; i < RANK_TIERS.length; i++) {
      if (wins >= RANK_TIERS[i].minWins) currentIdx = i;
    }
    const current = RANK_TIERS[currentIdx];
    const next = RANK_TIERS[currentIdx + 1] || null;
    if (!next) return { current, next: null, pct: 100, remaining: 0 };
    const span = next.minWins - current.minWins;
    const progress = wins - current.minWins;
    return {
      current,
      next,
      pct: Math.min(100, Math.round((progress / span) * 100)),
      remaining: Math.max(0, next.minWins - wins)
    };
  }

  // ==================== STORAGE & MIGRATION ====================
  function loadData() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      let isLegacy = false;
      if (!raw) {
        for (const oldKey of LEGACY_KEYS) {
          raw = localStorage.getItem(oldKey);
          if (raw) { isLegacy = true; break; }
        }
      }
      if (!raw) return cloneDefaults();

      const parsed = JSON.parse(raw);
      const base = cloneDefaults();

      const validThemeIds = new Set(THEMES_CATALOG.map((t) => t.id));
      const validDiceIds = new Set(DICE_CATALOG.map((d) => d.id));
      const validFrameIds = new Set(FRAMES_CATALOG.map((f) => f.id));
      const validEmojiIds = new Set(EMOJI_PACKS.map((e) => e.id));

      const mergedSettings = { ...base.settings, ...(parsed.settings || {}) };
      if (mergedSettings.speed === "normal") mergedSettings.speed = "medium";
      if (!["slow", "medium", "fast"].includes(mergedSettings.speed)) mergedSettings.speed = "medium";
      if (mergedSettings.theme === "classicpin") mergedSettings.theme = "classic";
      if (!validThemeIds.has(mergedSettings.theme)) mergedSettings.theme = "classic";
      if (!validDiceIds.has(mergedSettings.diceSkin)) mergedSettings.diceSkin = "classic";
      if (!validFrameIds.has(mergedSettings.frame)) mergedSettings.frame = "bronze";
      if (!validEmojiIds.has(mergedSettings.emojiPack)) mergedSettings.emojiPack = "classic";
      if (typeof mergedSettings.autoMove !== "boolean") mergedSettings.autoMove = true;
      mergedSettings.tokenSkin = getPieceSkinForTheme(mergedSettings.theme);

      const rawThemes = ((parsed.inventory && parsed.inventory.themes) || [])
        .map((id) => (id === "classicpin" ? "classic" : id))
        .filter((id) => validThemeIds.has(id));
      const mergedThemes = Array.from(new Set(["classic", ...rawThemes]));
      if (!mergedThemes.includes(mergedSettings.theme)) mergedThemes.push(mergedSettings.theme);

      const rawDice = ((parsed.inventory && parsed.inventory.dice) || []).filter((id) => validDiceIds.has(id));
      const mergedDice = Array.from(new Set(["classic", ...rawDice]));

      const rawFrames = ((parsed.inventory && parsed.inventory.frames) || []).filter((id) => validFrameIds.has(id));
      const mergedFrames = Array.from(new Set(["bronze", ...rawFrames]));

      const rawEmojis = ((parsed.inventory && parsed.inventory.emojis) || []).filter((id) => validEmojiIds.has(id));
      const mergedEmojis = Array.from(new Set(["classic", ...rawEmojis]));

      const merged = {
        profile: { ...base.profile, ...(parsed.profile || {}) },
        settings: mergedSettings,
        inventory: {
          themes: mergedThemes,
          dice: mergedDice,
          frames: mergedFrames,
          emojis: mergedEmojis,
          bundlesClaimed: Array.isArray(parsed.inventory && parsed.inventory.bundlesClaimed)
            ? [...parsed.inventory.bundlesClaimed]
            : []
        },
        cup: { ...base.cup, ...(parsed.cup || {}) },
        history: Array.isArray(parsed.history) ? parsed.history.slice(0, MAX_HISTORY_ITEMS) : [],
        missions: {
          date: (parsed.missions && parsed.missions.date) || getDateKey(0),
          dailyProgress: { ...base.missions.dailyProgress, ...((parsed.missions && parsed.missions.dailyProgress) || {}) },
          dailyClaimed: [...((parsed.missions && parsed.missions.dailyClaimed) || [])],
          lifetime: { ...base.missions.lifetime, ...((parsed.missions && parsed.missions.lifetime) || {}) },
          achievementsClaimed: [...((parsed.missions && parsed.missions.achievementsClaimed) || [])]
        }
      };

      if (merged.profile.wins > merged.missions.lifetime.win) merged.missions.lifetime.win = merged.profile.wins;
      if (merged.profile.cupsWon > merged.missions.lifetime.cup) merged.missions.lifetime.cup = merged.profile.cupsWon;

      if (merged.missions.date !== getDateKey(0)) {
        merged.missions.date = getDateKey(0);
        merged.missions.dailyProgress = { roll6: 0, capture: 0, home: 0, win: 0, cup: 0 };
        merged.missions.dailyClaimed = [];
      }

      if (isLegacy) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch {}
      }

      return merged;
    } catch {
      return cloneDefaults();
    }
  }

  function saveData() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appData)); } catch {}
  }

  function ensureDailyReset() {
    const today = getDateKey(0);
    if (appData.missions.date !== today) {
      appData.missions.date = today;
      appData.missions.dailyProgress = { roll6: 0, capture: 0, home: 0, win: 0, cup: 0 };
      appData.missions.dailyClaimed = [];
      saveData();
    }
  }

  // ==================== MULTI-MATCH SAVED GAMES ====================
  function getSavedMatches() {
    try {
      let raw = localStorage.getItem(SAVED_MATCHES_KEY);
      if (!raw) {
        const legacyRaw = localStorage.getItem(LEGACY_MATCH_KEY);
        if (legacyRaw) {
          const single = JSON.parse(legacyRaw);
          if (single && Array.isArray(single.activeColors) && single.tokens) {
            single.saveId = single.saveId || `match_${Date.now()}`;
            single.savedAt = single.savedAt || Date.now();
            const migrated = [single];
            localStorage.setItem(SAVED_MATCHES_KEY, JSON.stringify(migrated));
            localStorage.removeItem(LEGACY_MATCH_KEY);
            return migrated;
          }
        }
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((m) => m && Array.isArray(m.activeColors) && m.tokens) : [];
    } catch {
      return [];
    }
  }

  function writeSavedMatches(list) {
    try { localStorage.setItem(SAVED_MATCHES_KEY, JSON.stringify(list.slice(0, MAX_SAVED_MATCHES))); } catch {}
    updateResumeButton();
  }

  function saveMatchSnapshot(snapshot) {
    if (!snapshot || !Array.isArray(snapshot.activeColors)) return;
    const list = getSavedMatches();
    const id = snapshot.saveId || `match_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const entry = { ...snapshot, saveId: id, savedAt: Date.now() };
    const filtered = list.filter((m) => m.saveId !== id);
    filtered.unshift(entry);
    writeSavedMatches(filtered);
  }

  function deleteSavedMatch(saveId) {
    if (!saveId) return;
    writeSavedMatches(getSavedMatches().filter((m) => m.saveId !== saveId));
  }

  function clearAllSavedMatches() {
    try {
      localStorage.removeItem(SAVED_MATCHES_KEY);
      localStorage.removeItem(LEGACY_MATCH_KEY);
    } catch {}
    updateResumeButton();
  }

  function updateResumeButton() {
    const btn = document.getElementById("btn-resume-match");
    const label = document.getElementById("resume-btn-label");
    if (!btn) return;
    const count = getSavedMatches().length;
    btn.classList.toggle("hidden", count === 0);
    if (label) label.textContent = count === 1 ? "▶ SAVED MATCHES (1)" : `▶ SAVED MATCHES (${count})`;
  }

  function formatShortDate(ts) {
    try {
      return new Date(ts).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
    } catch {
      return "Recent";
    }
  }

  function openSavedMatchesModal() {
    deleteAllArmed = false;
    const delAllBtn = document.getElementById("btn-delete-all-saves");
    if (delAllBtn) delAllBtn.textContent = "🗑️ Delete All Saved Matches";
    renderSavedMatchesList();
    openModal("modal-saved-matches");
  }

  function renderSavedMatchesList() {
    const container = document.getElementById("saved-matches-list");
    const delAllBtn = document.getElementById("btn-delete-all-saves");
    if (!container) return;

    const list = getSavedMatches();
    container.innerHTML = "";
    if (delAllBtn) delAllBtn.classList.toggle("hidden", list.length === 0);

    if (list.length === 0) {
      const empty = document.createElement("div");
      empty.className = "saved-empty-msg";
      empty.textContent = "No saved matches yet. Tap ••• → Save & Resume Later during any game!";
      container.appendChild(empty);
      return;
    }

    list.forEach((match) => {
      const card = document.createElement("div");
      card.className = "saved-match-card";

      const top = document.createElement("div");
      top.className = "saved-match-top";

      const modeName = match.isCup
        ? `🏆 Cup Round ${match.cupRound || 1}`
        : match.isTeam2v2
          ? "🤝 2v2 Team Up"
          : match.mode === "pass-play"
            ? "Pass & Play"
            : "Vs Computer";
      const formatName = match.gameType === "quick" ? "⚡ Quick" : "Classic";

      const title = document.createElement("span");
      title.className = "saved-match-title";
      title.textContent = `${modeName} • ${formatName}`;

      const time = document.createElement("span");
      time.className = "saved-match-time";
      time.textContent = formatShortDate(match.savedAt);

      top.appendChild(title);
      top.appendChild(time);

      const turnColor = match.activeColors[match.turnIndex] || match.activeColors[0];
      const turnPlayer = (match.players && match.players[turnColor] && match.players[turnColor].name) || COLOR_NAMES[turnColor];
      const meta = document.createElement("div");
      meta.className = "saved-match-meta";
      meta.textContent = `${match.activeColors.length} Players • Next Turn: ${turnPlayer}` + (match.pot > 0 ? ` • Pot 🪙 ${match.pot}` : "");

      const actions = document.createElement("div");
      actions.className = "saved-match-actions";

      const resumeBtn = document.createElement("button");
      resumeBtn.type = "button";
      resumeBtn.className = "btn-primary small-btn";
      resumeBtn.textContent = "▶ Resume Match";
      resumeBtn.addEventListener("click", () => {
        closeModal("modal-saved-matches");
        lastMatchConfig = {
          saveId: match.saveId,
          mode: match.mode,
          gameType: match.gameType,
          difficulty: match.difficulty || "normal",
          isCup: Boolean(match.isCup),
          cupRound: match.cupRound || 1,
          isTeam2v2: Boolean(match.isTeam2v2),
          teams: match.teams || null,
          humanTeam: match.humanTeam || null,
          playerCount: match.activeColors.length,
          stake: match.stake || 0,
          pot: match.pot || 0,
          activeColors: [...match.activeColors],
          players: match.players
        };
        showScreen("game-screen");
        if (window.LUDO_GAME && typeof window.LUDO_GAME.resumeMatch === "function") {
          window.LUDO_GAME.resumeMatch(match);
        }
      });

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn-danger small-btn";
      delBtn.textContent = "🗑️";
      delBtn.addEventListener("click", () => {
        deleteSavedMatch(match.saveId);
        renderSavedMatchesList();
        showToast("Saved match deleted.");
      });

      actions.appendChild(resumeBtn);
      actions.appendChild(delBtn);

      card.appendChild(top);
      card.appendChild(meta);
      card.appendChild(actions);
      container.appendChild(card);
    });
  }

  // ==================== CONFETTI & FIREWORKS CANVAS ====================
  const FX = (() => {
    let canvas = null;
    let ctx = null;
    let particles = [];
    let rafId = null;
    const COLORS = ["#ff4c4c", "#ffd633", "#4cd964", "#3db5ff", "#ff66c4", "#ffffff", "#f5c542"];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function init() {
      canvas = document.getElementById("fx-canvas");
      if (!canvas) return;
      ctx = canvas.getContext("2d");
      resize();
      window.addEventListener("resize", resize);
    }

    function loop() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.rot += p.vRot;
        p.life -= p.decay;

        if (p.life <= 0 || p.y > canvas.height + 30) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.circle) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }

      if (particles.length > 0) rafId = requestAnimationFrame(loop);
      else rafId = null;
    }

    function startLoop() {
      if (!rafId && canvas) rafId = requestAnimationFrame(loop);
    }

    function launchConfetti(count = 95) {
      if (!canvas) return;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -15 - Math.random() * 140,
          vx: (Math.random() - 0.5) * 4.5,
          vy: 2.2 + Math.random() * 4.2,
          gravity: 0.08,
          w: 6 + Math.random() * 6,
          h: 8 + Math.random() * 7,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.22,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          life: 1,
          decay: 0.006 + Math.random() * 0.004,
          circle: false
        });
      }
      startLoop();
    }

    function launchFireworks(bursts = 3) {
      if (!canvas) return;
      for (let b = 0; b < bursts; b++) {
        setTimeout(() => {
          if (!canvas) return;
          const cx = canvas.width * (0.22 + Math.random() * 0.56);
          const cy = canvas.height * (0.18 + Math.random() * 0.34);
          for (let i = 0; i < 34; i++) {
            const angle = (Math.PI * 2 * i) / 34 + Math.random() * 0.15;
            const speed = 2.2 + Math.random() * 4.5;
            particles.push({
              x: cx,
              y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              gravity: 0.06,
              w: 5 + Math.random() * 4,
              h: 5 + Math.random() * 4,
              rot: 0,
              vRot: 0,
              color: COLORS[Math.floor(Math.random() * COLORS.length)],
              life: 1,
              decay: 0.016 + Math.random() * 0.01,
              circle: true
            });
          }
          startLoop();
        }, b * 280);
      }
    }

    return { init, launchConfetti, launchFireworks };
  })();

  // ==================== HOME PAGE BACKGROUND MUSIC (MP3) ====================
  const MUSIC = (() => {
    const bgm = new Audio("./background-music.mp3");
    bgm.loop = true;
    bgm.preload = "auto";
    bgm.volume = 0.55;

    let retryBound = false;

    function isLobbyScreenActive() {
      const active = document.querySelector(".screen.active");
      if (!active) return false;
      return active.id !== "game-screen" && active.id !== "splash-screen";
    }

    function shouldPlay() {
      return Boolean(appData.settings.music && !document.hidden && isLobbyScreenActive());
    }

    function bindGestureRetry() {
      if (retryBound) return;
      retryBound = true;
      const retry = () => {
        retryBound = false;
        document.removeEventListener("pointerdown", retry);
        document.removeEventListener("click", retry);
        sync();
      };
      document.addEventListener("pointerdown", retry, { once: true });
      document.addEventListener("click", retry, { once: true });
    }

    function start() {
      if (!shouldPlay()) {
        stop(false);
        return;
      }
      if (!bgm.paused) return;
      const p = bgm.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => bindGestureRetry());
      }
    }

    function stop(resetPosition = false) {
      try {
        bgm.pause();
        if (resetPosition) bgm.currentTime = 0;
      } catch {}
    }

    function sync() {
      if (shouldPlay()) start();
      else stop(false);
    }

    function unlockAndSync() {
      try {
        if (bgm.readyState === 0) bgm.load();
      } catch {}
      sync();
    }

    return { start, stop, sync, unlockAndSync };
  })();

  // ==================== MELODIOUS UI SOUND EFFECTS ====================
  const UI_SFX = (() => {
    let ctx = null;

    function getCtx() {
      if (!appData.settings.sound) return null;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!ctx) ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      return ctx;
    }

    function playChime(freq, duration = 0.14, volume = 0.08, delay = 0, harmonicMix = 0.24) {
      const ac = getCtx();
      if (!ac) return;
      const now = ac.currentTime + delay;

      const osc1 = ac.createOscillator();
      const gain1 = ac.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq, now);
      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.linearRampToValueAtTime(volume, now + 0.007);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc1.connect(gain1);
      gain1.connect(ac.destination);
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
        gain2.connect(ac.destination);
        osc2.start(now);
        osc2.stop(now + duration * 0.7 + 0.02);
      }
    }

    return {
      tap() {
        playChime(659.25, 0.085, 0.048, 0, 0.2);
      },
      reward() {
        const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
        notes.forEach((n, idx) => playChime(n, 0.26, 0.095, idx * 0.06, 0.28));
      },
      spinStart() {
        const notes = [440.0, 554.37, 659.25, 880.0];
        notes.forEach((n, idx) => playChime(n, 0.16, 0.075, idx * 0.05, 0.22));
      },
      error() {
        playChime(392.0, 0.12, 0.075, 0, 0.14);
        playChime(329.63, 0.18, 0.075, 0.085, 0.14);
      }
    };
  })();

  // ==================== SPARKLES, HAPTICS, SCREENS & MODALS ====================
  function spawnLobbySparkles() {
    const container = document.getElementById("lobby-sparkles");
    if (!container || container.childElementCount > 0) return;

    for (let i = 0; i < 12; i++) {
      const dot = document.createElement("span");
      dot.className = "sparkle-dot";
      const size = 2.5 + Math.random() * 4;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.animationDuration = `${11 + Math.random() * 10}s`;
      dot.style.animationDelay = `${Math.random() * 9}s`;
      container.appendChild(dot);
    }
  }

  function vibrate(pattern = 20) {
    if (!appData.settings.vibration) return;
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try { navigator.vibrate(pattern); } catch {}
    }
  }

  function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    const target = document.getElementById(screenId);
    if (target) target.classList.add("active");

    if (screenId === "game-screen") {
      MUSIC.stop(true);
      THEME_FX.setTheme(appData.settings.theme || "classic");
      THEME_FX.start();
    } else {
      THEME_FX.stop();
      if (window.LUDO_GAME && typeof window.LUDO_GAME.stopWinningAudio === "function") {
        window.LUDO_GAME.stopWinningAudio();
      }
      MUSIC.sync();
    }
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("hidden");
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("hidden");
  }

  function closeAllModals() {
    document.querySelectorAll(".modal-overlay").forEach((m) => m.classList.add("hidden"));
  }

  function closeGameMenu() {
    const pop = document.getElementById("game-menu-popover");
    if (pop) pop.classList.add("hidden");
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add("hidden"), 2500);
  }

  // ==================== SPLASH LOADING SCREEN (4-SECOND MINIMUM DELAY) ====================
  function runSplashScreen() {
    const bar = document.getElementById("splash-bar");
    const status = document.getElementById("splash-status");
    const percent = document.getElementById("splash-percent");
    const tip = document.getElementById("splash-tip");

    if (tip) tip.textContent = SPLASH_TIPS[Math.floor(Math.random() * SPLASH_TIPS.length)];

    const MIN_DURATION_MS = 4000;
    const startedAt = performance.now ? performance.now() : Date.now();

    function step() {
      const now = performance.now ? performance.now() : Date.now();
      const elapsed = now - startedAt;
      const ratio = Math.min(1, elapsed / MIN_DURATION_MS);

      let pct;
      if (ratio < 0.88) {
        pct = Math.floor((ratio / 0.88) * 95);
      } else if (ratio < 1) {
        pct = 95 + Math.floor(((ratio - 0.88) / 0.12) * 5);
      } else {
        pct = 100;
      }

      if (bar) bar.style.width = `${pct}%`;
      if (percent) percent.textContent = `${pct}%`;

      if (status) {
        if (pct < 35) status.textContent = "Loading Studio Worlds...";
        else if (pct < 72) status.textContent = "Preparing 3D Dice & Frames...";
        else if (pct < 100) status.textContent = "Entering Ludo Kingdom...";
        else status.textContent = "Ready!";
      }

      if (ratio < 1) {
        requestAnimationFrame(step);
      } else {
        setTimeout(() => showScreen("home-screen"), 180);
      }
    }

    requestAnimationFrame(step);
  }

  // ==================== HOME, EMOJI BAR & SETTINGS SYNC ====================
  function getPlayerLevel() {
    return 1 + Math.floor(appData.profile.wins / 2);
  }

  function isDailyRewardAvailable() {
    return appData.profile.lastRewardDate !== getDateKey(0);
  }

  function isFreeSpinAvailable() {
    return appData.profile.lastSpinDate !== getDateKey(0);
  }

  function getTotalAvailableSpins() {
    return (isFreeSpinAvailable() ? 1 : 0) + (appData.profile.spinTickets || 0);
  }

  function countClaimableMissions() {
    ensureDailyReset();
    let count = 0;
    DAILY_MISSIONS_DEF.forEach((m) => {
      const val = appData.missions.dailyProgress[m.stat] || 0;
      if (val >= m.target && !appData.missions.dailyClaimed.includes(m.id)) count += 1;
    });
    ACHIEVEMENTS_DEF.forEach((a) => {
      const val = appData.missions.lifetime[a.stat] || 0;
      if (val >= a.target && !appData.missions.achievementsClaimed.includes(a.id)) count += 1;
    });
    return count;
  }

  function renderEquippedEmojiBar() {
    const bar = document.getElementById("emoji-bar");
    const chatBar = document.getElementById("quick-chat-bar");
    const packId = appData.settings.emojiPack || "classic";
    const pack = EMOJI_PACKS.find((p) => p.id === packId) || EMOJI_PACKS[0];

    if (bar) {
      bar.innerHTML = "";
      pack.emojis.forEach((emoji) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "emoji-btn";
        btn.dataset.emoji = emoji;
        btn.textContent = emoji;
        bar.appendChild(btn);
      });
    }

    if (chatBar && Array.isArray(pack.chats)) {
      chatBar.innerHTML = "";
      pack.chats.forEach((msg) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chat-pill-btn";
        btn.dataset.chat = msg;
        btn.textContent = msg;
        chatBar.appendChild(btn);
      });
    }
  }

  function applyEquippedFrameOverlays() {
    const activeFrame = appData.settings.frame || "bronze";
    const homeTopFrame = document.getElementById("home-top-frame");
    const homeCardFrame = document.getElementById("home-avatar-frame");
    const profileFrame = document.getElementById("profile-frame-preview");

    if (homeTopFrame) applyFrameVisual(homeTopFrame, activeFrame);
    if (homeCardFrame) applyFrameVisual(homeCardFrame, activeFrame);
    if (profileFrame) applyFrameVisual(profileFrame, activeFrame);

    if (window.LUDO_GAME && typeof window.LUDO_GAME.refreshPlayerFrames === "function") {
      window.LUDO_GAME.refreshPlayerFrames(activeFrame);
    }
  }

  function renderHomeUI() {
    const p = appData.profile;
    const rank = getRankInfo(p.wins);
    const activeAvatar = getActiveAvatarValue();

    renderAvatar(document.getElementById("home-avatar"), activeAvatar);
    renderAvatar(document.getElementById("home-top-avatar"), activeAvatar);
    applyEquippedFrameOverlays();

    const nameEl = document.getElementById("home-player-name");
    const rankEl = document.getElementById("home-rank-badge");
    const lvlEl = document.getElementById("home-player-level");
    if (nameEl) nameEl.textContent = p.name;
    if (rankEl) rankEl.textContent = `${rank.current.icon} ${rank.current.name}`;
    if (lvlEl) lvlEl.textContent = getPlayerLevel();

    const dailyBadge = document.getElementById("daily-badge");
    if (dailyBadge) dailyBadge.classList.toggle("hidden", !isDailyRewardAvailable());

    const spinBadge = document.getElementById("spin-badge");
    const availSpins = getTotalAvailableSpins();
    if (spinBadge) {
      spinBadge.textContent = availSpins > 1 ? String(availSpins) : "!";
      spinBadge.classList.toggle("hidden", availSpins === 0);
    }

    const missionBadge = document.getElementById("missions-badge");
    const claimable = countClaimableMissions();
    if (missionBadge) {
      missionBadge.textContent = claimable > 0 ? String(claimable) : "!";
      missionBadge.classList.toggle("hidden", claimable === 0);
    }

    updateResumeButton();
  }

  function applySettingsUI() {
    const s = appData.settings;
    const activeTheme = s.theme || "classic";
    const lockedPieceSkin = getPieceSkinForTheme(activeTheme);
    s.tokenSkin = lockedPieceSkin;

    document.body.classList.remove(
      "theme-classic", "theme-candy", "theme-egypt", "theme-oasis",
      "theme-halloween", "theme-winter", "theme-pearl",
      "theme-lava", "theme-galaxy", "theme-neon", "theme-dark"
    );
    document.body.classList.add(`theme-${activeTheme}`);

    document.body.classList.remove(
      "dice-skin-classic", "dice-skin-tricolour", "dice-skin-ruby",
      "dice-skin-royal_crown", "dice-skin-glacier_crystal", "dice-skin-cursed_relic",
      "dice-skin-magma_obsidian", "dice-skin-cyber_core", "dice-skin-pharaoh_gold",
      "dice-skin-dubai_diamond", "dice-skin-cosmic_nebula",
      "dice-skin-gold", "dice-skin-neon", "dice-skin-diya", "dice-skin-pumpkin", "dice-skin-football"
    );
    document.body.classList.add(`dice-skin-${s.diceSkin || "classic"}`);

    document.body.classList.remove(
      "frame-bronze", "frame-silver", "frame-royal_gold", "frame-glacier_ice",
      "frame-magma_obsidian", "frame-cyber_neon", "frame-pharaoh_sand",
      "frame-dubai_emerald", "frame-cosmic_void"
    );
    document.body.classList.add(`frame-${s.frame || "bronze"}`);

    document.body.classList.remove(
      "token-skin-pin", "token-skin-candy", "token-skin-egypt", "token-skin-oasis",
      "token-skin-halloween", "token-skin-winter", "token-skin-crown",
      "token-skin-lava", "token-skin-galaxy", "token-skin-gemini", "token-skin-gem"
    );
    document.body.classList.add(`token-skin-${lockedPieceSkin}`);

    document.body.classList.remove("speed-slow", "speed-medium", "speed-fast");
    document.body.classList.add(`speed-${s.speed || "medium"}`);

    checkStudioBackdropExists(activeTheme);
    renderThemeScenery(activeTheme);
    THEME_FX.setTheme(activeTheme);
    renderEquippedEmojiBar();
    applyEquippedFrameOverlays();

    const toggleSound = document.getElementById("toggle-sound");
    const toggleMusic = document.getElementById("toggle-music");
    const toggleVibration = document.getElementById("toggle-vibration");
    const toggleTimer = document.getElementById("toggle-timer");
    const toggleAutoMove = document.getElementById("toggle-automove");
    const selectSpeed = document.getElementById("select-speed");
    const menuSound = document.getElementById("btn-menu-sound");
    const menuMusic = document.getElementById("btn-menu-music");

    if (toggleSound) toggleSound.checked = s.sound;
    if (toggleMusic) toggleMusic.checked = s.music;
    if (toggleVibration) toggleVibration.checked = s.vibration;
    if (toggleTimer) toggleTimer.checked = s.timer;
    if (toggleAutoMove) toggleAutoMove.checked = s.autoMove !== false;
    if (selectSpeed) selectSpeed.value = s.speed || "medium";
    if (menuSound) menuSound.textContent = s.sound ? "🔊 Sound: On" : "🔇 Sound: Off";
    if (menuMusic) menuMusic.textContent = s.music ? "🎵 Music: On" : "🔇 Music: Off";

    MUSIC.sync();
    if (window.LUDO_GAME && typeof window.LUDO_GAME.syncAudioSettings === "function") {
      window.LUDO_GAME.syncAudioSettings();
    }

    if (window.LUDO_GAME && typeof window.LUDO_GAME.refreshPieceSkins === "function") {
      window.LUDO_GAME.refreshPieceSkins();
    }
    if (window.LUDO_GAME && typeof window.LUDO_GAME.refreshDiceSkins === "function") {
      window.LUDO_GAME.refreshDiceSkins(s.diceSkin || "classic");
    }
  }

  // ==================== PURCHASE CONFIRMATION & FULL ITEM PREVIEW ====================
  function openBuyConfirm({ title, desc, priceText, onConfirm }) {
    pendingPurchaseAction = typeof onConfirm === "function" ? onConfirm : null;
    const titleEl = document.getElementById("buy-confirm-title");
    const descEl = document.getElementById("buy-confirm-desc");
    const priceEl = document.getElementById("buy-confirm-price");
    if (titleEl) titleEl.textContent = title || "Confirm Purchase";
    if (descEl) descEl.textContent = desc || "Do you want to buy this item?";
    if (priceEl) priceEl.textContent = priceText || "";
    openModal("modal-buy-confirm");
  }

  function buildRotating3DDicePreview(item) {
    const pipPatterns = {
      1: [4],
      2: [2, 6],
      3: [2, 4, 6],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
    };

    const scene = document.createElement("div");
    scene.className = "preview-dice-scene";

    const cube = document.createElement("div");
    cube.className = "preview-dice-cube";
    cube.style.setProperty("--p-top", item.top);
    cube.style.setProperty("--p-bot", item.bot);
    cube.style.setProperty("--p-border", item.border || "#ffffff");
    cube.style.setProperty("--p-pip", item.pip);
    cube.style.setProperty("--p-pip-one", item.pipOne || item.pip);

    for (let f = 1; f <= 6; f++) {
      const face = document.createElement("div");
      face.className = `p-face pf-${f}`;
      const lit = pipPatterns[f];
      for (let i = 0; i < 9; i++) {
        const pip = document.createElement("span");
        pip.className = lit.includes(i) ? "p-pip on" : "p-pip";
        face.appendChild(pip);
      }
      cube.appendChild(face);
    }

    scene.appendChild(cube);
    return scene;
  }

  function openItemPreview(category, item) {
    const owned = appData.inventory[category].includes(item.id);
    const isEquipped =
      (category === "themes" && appData.settings.theme === item.id) ||
      (category === "dice" && appData.settings.diceSkin === item.id) ||
      (category === "frames" && appData.settings.frame === item.id) ||
      (category === "emojis" && appData.settings.emojiPack === item.id);

    const titleEl = document.getElementById("preview-title");
    const visualEl = document.getElementById("preview-visual");
    const subtitleEl = document.getElementById("preview-subtitle");
    const extraEl = document.getElementById("preview-extra");
    const actionBtn = document.getElementById("btn-preview-action");

    titleEl.textContent = item.name;
    visualEl.innerHTML = "";
    extraEl.innerHTML = "";

    if (category === "themes") {
      const banner = document.createElement("div");
      banner.className = "preview-theme-banner portrait-banner";
      if (item.isStudio) {
        banner.style.backgroundImage = `url("./assets/${item.id}/bg.webp"), ${item.bg}`;
      } else {
        banner.style.background = item.bg;
      }
      visualEl.appendChild(banner);

      const piecesRow = document.createElement("div");
      piecesRow.className = "preview-pieces-row";
      ["red", "green", "yellow", "blue"].forEach((clr) => {
        const slot = document.createElement("div");
        slot.className = "preview-piece-slot";
        renderPieceVisual(slot, getPieceSkinForTheme(item.id), clr);
        piecesRow.appendChild(slot);
      });
      visualEl.appendChild(piecesRow);
      subtitleEl.textContent = item.isStudio
        ? "Full HD Studio world background with 4 exclusive matching 3D pieces."
        : "Board theme with matching colored pieces and ambient effects.";
    } else if (category === "dice") {
      const fallbackCube = buildRotating3DDicePreview(item);
      visualEl.appendChild(fallbackCube);
      if (item.isHD) {
        loadDiceAsset(item.id).then((res) => {
          if (!res.ok || !fallbackCube.isConnected) return;
          const hdStage = document.createElement("div");
          hdStage.className = "preview-dice-hd-stage";
          if (item.glow) hdStage.style.setProperty("--thumb-glow", item.glow);
          const img = document.createElement("img");
          img.className = "preview-dice-hd-img";
          img.src = res.src;
          img.alt = item.name;
          hdStage.appendChild(img);
          fallbackCube.replaceWith(hdStage);
        });
      }
      subtitleEl.textContent = item.isHD
        ? "Full HD 3D Dice with signature color glow burst whenever you roll a 6!"
        : "Classic 3D cube dice skin usable across every board theme.";
    } else if (category === "frames") {
      const box = document.createElement("div");
      box.className = "avatar-frame-box frame-130";
      const inner = document.createElement("div");
      inner.className = "square-avatar-inner";
      renderAvatar(inner, getActiveAvatarValue());
      const overlay = document.createElement("div");
      overlay.className = `frame-overlay frame-${item.id}`;
      box.appendChild(inner);
      box.appendChild(overlay);
      visualEl.appendChild(box);
      applyFrameVisual(overlay, item.id);
      subtitleEl.textContent = "Square profile frame displayed on your Home card, Profile & In-Game corner.";
    } else if (category === "emojis") {
      const eGrid = document.createElement("div");
      eGrid.className = "preview-emoji-grid";
      item.emojis.forEach((em) => {
        const cell = document.createElement("div");
        cell.className = "preview-emoji-cell";
        cell.textContent = em;
        eGrid.appendChild(cell);
      });
      visualEl.appendChild(eGrid);
      subtitleEl.textContent = "Includes all 6 emoji reactions and custom quick-chat lines:";

      if (Array.isArray(item.chats) && item.chats.length > 0) {
        const chatList = document.createElement("div");
        chatList.className = "preview-chat-list";
        item.chats.forEach((line) => {
          const chip = document.createElement("span");
          chip.className = "preview-chat-chip";
          chip.textContent = line;
          chatList.appendChild(chip);
        });
        extraEl.appendChild(chatList);
      }
    }

    actionBtn.disabled = false;
    actionBtn.onclick = null;

    if (isEquipped) {
      actionBtn.textContent = "Equipped ✓";
      actionBtn.disabled = true;
    } else if (owned) {
      actionBtn.textContent = `Equip ${item.name}`;
      actionBtn.onclick = () => {
        equipCollectionItem(category, item);
        closeModal("modal-item-preview");
      };
    } else {
      const icon = item.currency === "gems" ? "💎" : "🪙";
      const priceLabel = `${icon} ${item.price.toLocaleString("en-IN")}`;
      actionBtn.textContent = `Unlock for ${priceLabel}`;
      actionBtn.onclick = () => {
        closeModal("modal-item-preview");
        openBuyConfirm({
          title: `Buy ${item.name}?`,
          desc: `Unlock ${item.name} and equip it immediately?`,
          priceText: priceLabel,
          onConfirm: () => buyCollectionItem(category, item)
        });
      };
    }

    openModal("modal-item-preview");
  }

  // ==================== FULL-SCREEN 4-TAB CUSTOMIZATION SCREEN ====================
  function openThemesScreen(tab = "themes") {
    activeThemesTab = tab;
    renderThemesScreen();
    showScreen("themes-screen");
  }

  function renderThemesScreen() {
    document.getElementById("themes-coins").textContent = appData.profile.coins.toLocaleString("en-IN");
    document.getElementById("themes-gems").textContent = appData.profile.gems.toLocaleString("en-IN");

    document.querySelectorAll("#themes-tabs .inv-cat-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === activeThemesTab);
    });

    const titleMap = { themes: "Themes", dice: "Dice", frames: "Frames", emojis: "Emojis" };
    const screenTitleEl = document.getElementById("themes-screen-title");
    if (screenTitleEl) screenTitleEl.textContent = titleMap[activeThemesTab] || "Themes";

    const grid = document.getElementById("themes-grid");
    grid.innerHTML = "";

    const list = activeThemesTab === "themes"
      ? THEMES_CATALOG
      : activeThemesTab === "dice"
        ? DICE_CATALOG
        : activeThemesTab === "frames"
          ? FRAMES_CATALOG
          : EMOJI_PACKS;

    list.forEach((item) => {
      const owned = appData.inventory[activeThemesTab].includes(item.id);
      const isEquipped =
        (activeThemesTab === "themes" && appData.settings.theme === item.id) ||
        (activeThemesTab === "dice" && appData.settings.diceSkin === item.id) ||
        (activeThemesTab === "frames" && appData.settings.frame === item.id) ||
        (activeThemesTab === "emojis" && appData.settings.emojiPack === item.id);

      const card = document.createElement("div");
      card.className = "lk-card" + (isEquipped ? " equipped" : "");

      const title = document.createElement("div");
      title.className = "lk-card-title";
      title.textContent = item.name;

      const box = document.createElement("div");
      box.className = "lk-card-box";

      if (activeThemesTab === "themes") {
        const thumb = document.createElement("div");
        thumb.className = "lk-theme-thumb";
        if (item.isStudio) {
          thumb.style.backgroundImage = `url("./assets/${item.id}/bg.webp"), ${item.bg}`;
          const hdTag = document.createElement("span");
          hdTag.className = "lk-hd-tag";
          hdTag.textContent = "HD";
          thumb.appendChild(hdTag);
        } else {
          thumb.style.background = item.bg;
        }
        box.appendChild(thumb);
      } else if (activeThemesTab === "dice") {
        const diceThumb = document.createElement("div");
        diceThumb.className = "lk-dice-thumb" + (item.isHD ? " hd-dice-thumb" : "");
        diceThumb.style.background = `linear-gradient(145deg, ${item.top}, ${item.bot})`;
        if (item.border) diceThumb.style.borderColor = item.border;
        if (item.glow) diceThumb.style.setProperty("--thumb-glow", item.glow);
        const pipIndices = [0, 2, 4, 6, 8];
        for (let i = 0; i < 9; i++) {
          const pip = document.createElement("span");
          pip.className = "lk-dice-pip";
          pip.style.background = pipIndices.includes(i) ? item.pip : "transparent";
          diceThumb.appendChild(pip);
        }
        box.appendChild(diceThumb);
        if (item.isHD) {
          loadDiceAsset(item.id).then((res) => {
            if (!res.ok || !diceThumb.isConnected) return;
            const hdWrap = document.createElement("div");
            hdWrap.className = "lk-dice-hd-wrap";
            if (item.glow) hdWrap.style.setProperty("--thumb-glow", item.glow);
            const img = document.createElement("img");
            img.className = "lk-dice-hd-img";
            img.src = res.src;
            img.alt = item.name;
            hdWrap.appendChild(img);
            diceThumb.replaceWith(hdWrap);
          });
          const hdTag = document.createElement("span");
          hdTag.className = "lk-hd-tag";
          hdTag.textContent = "3D HD";
          box.appendChild(hdTag);
        }
      } else if (activeThemesTab === "frames") {
        box.classList.add("frame-card-box");
        const framePreview = document.createElement("div");
        framePreview.className = "avatar-frame-box frame-card";
        const avInner = document.createElement("div");
        avInner.className = "square-avatar-inner";
        renderAvatar(avInner, getActiveAvatarValue());
        const overlay = document.createElement("div");
        overlay.className = `frame-overlay frame-${item.id}`;
        framePreview.appendChild(avInner);
        framePreview.appendChild(overlay);
        box.appendChild(framePreview);
        applyFrameVisual(overlay, item.id);
      } else {
        const emojiThumb = document.createElement("div");
        emojiThumb.className = "lk-emoji-thumb";
        item.emojis.slice(0, 4).forEach((em) => {
          const sp = document.createElement("span");
          sp.textContent = em;
          emojiThumb.appendChild(sp);
        });
        box.appendChild(emojiThumb);
      }

      if (!owned) {
        const lock = document.createElement("span");
        lock.className = "lk-lock-badge";
        lock.textContent = "🔒";
        box.appendChild(lock);
      }

      card.appendChild(title);
      card.appendChild(box);

      if (isEquipped) {
        const check = document.createElement("div");
        check.className = "lk-check-badge";
        check.textContent = "✓ EQUIPPED";
        card.appendChild(check);
      } else if (owned) {
        const pill = document.createElement("div");
        pill.className = "lk-action-pill equip-ready";
        pill.textContent = "EQUIP";
        card.appendChild(pill);
      } else {
        const pill = document.createElement("div");
        pill.className = "lk-action-pill";
        const icon = item.currency === "gems" ? "💎" : "🪙";
        pill.innerHTML = `<span class="lk-price-icon">${icon}</span><span>${item.price.toLocaleString("en-IN")}</span>`;
        card.appendChild(pill);
      }

      card.addEventListener("click", () => {
        openItemPreview(activeThemesTab, item);
      });

      grid.appendChild(card);
    });
  }

  function buyCollectionItem(category, item) {
    const balanceKey = item.currency === "gems" ? "gems" : "coins";
    if (appData.profile[balanceKey] < item.price) {
      UI_SFX.error();
      showToast(`Not enough ${balanceKey}! Tap + to grab more in Shop.`);
      vibrate([30, 40, 30]);
      return;
    }

    appData.profile[balanceKey] -= item.price;
    if (!appData.inventory[category].includes(item.id)) {
      appData.inventory[category].push(item.id);
    }

    equipCollectionItem(category, item, true);
    UI_SFX.reward();
    FX.launchFireworks(1);
    vibrate([25, 30, 50]);
    showToast(`Unlocked & equipped ${item.name}!`);
  }

  function equipCollectionItem(category, item, silent = false) {
    if (category === "themes") {
      appData.settings.theme = item.id;
      appData.settings.tokenSkin = getPieceSkinForTheme(item.id);
    }
    if (category === "dice") appData.settings.diceSkin = item.id;
    if (category === "frames") appData.settings.frame = item.id;
    if (category === "emojis") appData.settings.emojiPack = item.id;

    saveData();
    applySettingsUI();
    renderHomeUI();
    renderThemesScreen();
    if (!silent) showToast(`${item.name} equipped!`);
  }

  // ==================== FULL-SCREEN SHOP SCREEN (OFFERS, BUY COINS & BUY GEMS) ====================
  function openShopScreen(tab = "bundles", returnTo = "home-screen") {
    activeShopTab = tab;
    shopReturnScreen = returnTo || "home-screen";
    renderShopScreen();
    showScreen("shop-screen");
  }

  function openShopModal(tab = "bundles") {
    const activeScreen = document.querySelector(".screen.active");
    const fromId = activeScreen && activeScreen.id && activeScreen.id !== "shop-screen" ? activeScreen.id : "home-screen";
    openShopScreen(tab, fromId);
  }

  function renderShopScreen() {
    document.getElementById("shop-coins").textContent = appData.profile.coins.toLocaleString("en-IN");
    document.getElementById("shop-gems").textContent = appData.profile.gems.toLocaleString("en-IN");

    document.querySelectorAll("#shop-tabs .shop-tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.tab === activeShopTab);
    });

    const grid = document.getElementById("shop-grid");
    grid.innerHTML = "";

    if (activeShopTab === "bundles") {
      SHOP_BUNDLES.forEach((b) => {
        const claimed = appData.inventory.bundlesClaimed.includes(b.id);

        const card = document.createElement("div");
        card.className = "shop-card bundle-card";

        const top = document.createElement("div");
        top.className = "bundle-top";
        top.innerHTML = `<span class="bundle-title">${b.title}</span><span class="bundle-tag">${b.tag}</span>`;

        const mid = document.createElement("div");
        mid.className = "bundle-mid";

        const thumb = document.createElement("div");
        thumb.className = "bundle-thumb";
        thumb.style.backgroundImage = `url("./assets/${b.themeId}/bg.webp"), ${b.bg}`;
        thumb.textContent = "";

        const itemsCol = document.createElement("div");
        itemsCol.className = "bundle-items";
        const themeLine = `<span>🎨 ${b.themeName} + Exclusive Pieces</span>`;
        const coinsLine = b.coins > 0 ? `<span>🪙 +${b.coins.toLocaleString("en-IN")} Coins</span>` : "";
        const gemsLine = b.gems > 0 ? `<span>💎 +${b.gems} Gems</span>` : "";
        itemsCol.innerHTML = themeLine + coinsLine + gemsLine;

        mid.appendChild(thumb);
        mid.appendChild(itemsCol);

        const btn = document.createElement("button");
        btn.type = "button";
        if (claimed) {
          btn.className = "shop-btn equipped";
          btn.textContent = "Bundle Owned ✓";
          btn.disabled = true;
        } else {
          const icon = b.currency === "gems" ? "💎" : "🪙";
          const priceLabel = `${icon} ${b.price.toLocaleString("en-IN")}`;
          btn.className = "shop-btn free-claim";
          btn.textContent = `Get Offer • ${priceLabel}`;
          btn.addEventListener("click", () => {
            openBuyConfirm({
              title: b.title,
              desc: `Unlock ${b.themeName} bundle with bonus rewards?`,
              priceText: priceLabel,
              onConfirm: () => buyOfferBundle(b)
            });
          });
        }

        card.appendChild(top);
        card.appendChild(mid);
        card.appendChild(btn);
        grid.appendChild(card);
      });
      return;
    }

    const packs = activeShopTab === "gems" ? SHOP_GEMS : SHOP_COINS;
    packs.forEach((pack) => {
      const card = document.createElement("div");
      card.className = "shop-card";

      const preview = document.createElement("div");
      preview.className = "shop-preview";
      preview.textContent = pack.preview;
      preview.style.background = pack.bg;

      const name = document.createElement("div");
      name.className = "shop-item-name";
      name.textContent = pack.name;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shop-btn free-claim";
      btn.textContent = "Claim FREE ✨";
      btn.addEventListener("click", () => {
        if (activeShopTab === "gems") appData.profile.gems += pack.amount;
        else appData.profile.coins += pack.amount;
        saveData();
        renderHomeUI();
        renderShopScreen();
        if (document.getElementById("themes-screen").classList.contains("active")) renderThemesScreen();
        UI_SFX.reward();
        vibrate(20);
        showToast(`Added ${pack.name}!`);
      });

      card.appendChild(preview);
      card.appendChild(name);
      card.appendChild(btn);
      grid.appendChild(card);
    });
  }

  function buyOfferBundle(bundle) {
    const balanceKey = bundle.currency === "gems" ? "gems" : "coins";
    if (appData.profile[balanceKey] < bundle.price) {
      UI_SFX.error();
      showToast(`Need ${bundle.price} ${balanceKey}! Grab packs in the ${balanceKey === "gems" ? "💎 Buy Gems" : "🪙 Buy Coins"} tab.`);
      vibrate([30, 40, 30]);
      return;
    }

    appData.profile[balanceKey] -= bundle.price;
    appData.profile.coins += bundle.coins;
    appData.profile.gems += bundle.gems;

    if (!appData.inventory.themes.includes(bundle.themeId)) {
      appData.inventory.themes.push(bundle.themeId);
    }
    if (!appData.inventory.bundlesClaimed.includes(bundle.id)) {
      appData.inventory.bundlesClaimed.push(bundle.id);
    }

    appData.settings.theme = bundle.themeId;
    appData.settings.tokenSkin = getPieceSkinForTheme(bundle.themeId);

    saveData();
    applySettingsUI();
    renderHomeUI();
    renderShopScreen();
    if (document.getElementById("themes-screen").classList.contains("active")) renderThemesScreen();

    UI_SFX.reward();
    FX.launchConfetti(90);
    FX.launchFireworks(2);
    vibrate([25, 30, 60]);
    showToast(`${bundle.title} Unlocked & Equipped!`);
  }

  // ==================== PROFILE, ROYAL RANK, AVATAR PICKER & FIXED-HEIGHT HISTORY ====================
  function syncProfilePreview() {
    const previewEl = document.getElementById("profile-photo-preview");
    const frameEl = document.getElementById("profile-frame-preview");
    const removeBtn = document.getElementById("btn-remove-photo");
    renderAvatar(previewEl, selectedPhotoTemp || selectedAvatarTemp);
    if (frameEl) applyFrameVisual(frameEl, appData.settings.frame || "bronze");
    if (removeBtn) removeBtn.classList.toggle("hidden", !selectedPhotoTemp);
  }

  function openAvatarPickerModal() {
    const grid = document.getElementById("avatar-grid");
    if (!grid) return;
    grid.innerHTML = "";

    // Slot 1: Gallery Photo picker directly inside Avatars grid
    const galleryBtn = document.createElement("button");
    galleryBtn.type = "button";
    galleryBtn.className = "avatar-option gallery-slot-option" + (selectedPhotoTemp ? " selected" : "");
    galleryBtn.title = "Choose photo from Gallery";
    galleryBtn.innerHTML = `<span>📷</span><small>Gallery</small>`;
    galleryBtn.addEventListener("click", () => {
      const fileInput = document.getElementById("input-profile-photo");
      if (fileInput) fileInput.click();
    });
    grid.appendChild(galleryBtn);

    PROFILE_AVATARS.forEach((avId) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "avatar-option" + (!selectedPhotoTemp && avId === selectedAvatarTemp ? " selected" : "");
      renderAvatar(btn, avId);
      btn.addEventListener("click", () => {
        selectedAvatarTemp = avId;
        selectedPhotoTemp = "";
        syncProfilePreview();
        closeModal("modal-avatar-picker");
        showToast("Avatar selected! Tap Save Profile.");
      });
      grid.appendChild(btn);
    });
    openModal("modal-avatar-picker");
  }

  function renderProfileTab() {
    document.querySelectorAll("#profile-tabs .shop-tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.ptab === activeProfileTab);
    });
    document.getElementById("profile-tab-edit").classList.toggle("hidden", activeProfileTab !== "edit");
    document.getElementById("profile-tab-history").classList.toggle("hidden", activeProfileTab !== "history");
    if (activeProfileTab === "history") renderMatchHistoryList();
  }

  function renderMatchHistoryList() {
    const container = document.getElementById("match-history-list");
    if (!container) return;
    container.innerHTML = "";

    const list = appData.history || [];
    if (list.length === 0) {
      const empty = document.createElement("div");
      empty.className = "saved-empty-msg";
      empty.textContent = "No completed matches yet. Play a match to see your history here!";
      container.appendChild(empty);
      return;
    }

    list.forEach((item) => {
      const card = document.createElement("div");
      card.className = "history-card" + (item.won ? " win" : "");
      card.innerHTML = `
        <div class="history-top">
          <span class="history-mode">${item.modeLabel}</span>
          <span class="history-badge ${item.won ? "win" : "loss"}">${item.resultLabel}</span>
        </div>
        <div class="history-meta">
          <span>${item.rewardLabel}</span>
          <span>${formatShortDate(item.ts)}</span>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function openProfileModal(tab = "edit") {
    const p = appData.profile;
    activeProfileTab = tab;
    selectedAvatarTemp = p.avatar;
    selectedPhotoTemp = p.photo || "";

    document.getElementById("input-player-name").value = p.name;
    syncProfilePreview();

    const rank = getRankInfo(p.wins);
    document.getElementById("profile-rank-title").textContent = `${rank.current.icon} ${rank.current.name}`;
    document.getElementById("profile-rank-next").textContent = rank.next
      ? `${rank.remaining} win${rank.remaining === 1 ? "" : "s"} to ${rank.next.name}`
      : "Max Rank Reached! 👑";
    document.getElementById("profile-rank-bar").style.width = `${rank.pct}%`;

    document.getElementById("stat-matches").textContent = p.matches;
    document.getElementById("stat-wins").textContent = p.wins;
    document.getElementById("stat-cups").textContent = p.cupsWon || 0;

    renderProfileTab();
    openModal("modal-profile");
  }

  function saveProfileChanges() {
    const rawName = document.getElementById("input-player-name").value.trim();
    appData.profile.name = rawName.length >= 2 ? rawName.slice(0, 14) : "Player_123";
    appData.profile.avatar = selectedAvatarTemp;
    appData.profile.photo = selectedPhotoTemp;
    saveData();
    renderHomeUI();
    closeModal("modal-profile");
    showToast("Profile saved!");
  }

  // ==================== DAILY REWARD CALENDAR ====================
  function getNextClaimableStreakDay() {
    const today = getDateKey(0);
    const yesterday = getDateKey(-1);
    const last = appData.profile.lastRewardDate;
    const savedDay = appData.profile.streakDay || 0;

    if (last === today) return { day: Math.max(1, savedDay), canClaim: false };
    if (last === yesterday) return { day: savedDay >= 7 ? 1 : savedDay + 1, canClaim: true };
    return { day: 1, canClaim: true };
  }

  function openRewardsModal() {
    renderStreakCalendar();
    openModal("modal-rewards");
  }

  function renderStreakCalendar() {
    const grid = document.getElementById("streak-grid");
    const statusText = document.getElementById("reward-status-text");
    const claimBtn = document.getElementById("btn-claim-reward");
    if (!grid) return;

    const { day: activeDay, canClaim } = getNextClaimableStreakDay();
    grid.innerHTML = "";

    STREAK_REWARDS.forEach((item) => {
      const tile = document.createElement("div");
      const isClaimed = canClaim ? item.day < activeDay : item.day <= activeDay;
      const isToday = canClaim && item.day === activeDay;

      tile.className = "streak-day"
        + (item.day === 7 ? " day-7" : "")
        + (isClaimed ? " claimed" : "")
        + (isToday ? " today" : "");

      tile.innerHTML = `
        <span class="streak-day-lbl">${item.day === 7 ? "Day 7 • Jackpot" : `Day ${item.day}`}</span>
        <span class="streak-day-icon">${isClaimed ? "✅" : item.icon}</span>
        <span class="streak-day-reward">${item.label}</span>
      `;
      grid.appendChild(tile);
    });

    if (canClaim) {
      const todayReward = STREAK_REWARDS[activeDay - 1];
      statusText.textContent = `Day ${activeDay} ready! Claim ${todayReward.label} now.`;
      claimBtn.disabled = false;
      claimBtn.textContent = `Claim Day ${activeDay} Reward 🎁`;
    } else {
      statusText.textContent = `Day ${activeDay} claimed! Come back tomorrow for Day ${activeDay >= 7 ? 1 : activeDay + 1}.`;
      claimBtn.disabled = true;
      claimBtn.textContent = "Claimed Today ✓";
    }
  }

  function claimDailyReward() {
    const { day, canClaim } = getNextClaimableStreakDay();
    if (!canClaim) return;

    const reward = STREAK_REWARDS[day - 1];
    appData.profile.coins += reward.coins;
    appData.profile.gems += reward.gems;
    appData.profile.streakDay = day;
    appData.profile.lastRewardDate = getDateKey(0);
    saveData();
    renderHomeUI();
    renderStreakCalendar();

    UI_SFX.reward();
    FX.launchConfetti(day === 7 ? 130 : 65);
    FX.launchFireworks(day === 7 ? 3 : 1);
    vibrate([25, 30, 55]);
    showToast(`Claimed: ${reward.label}!`);
  }

  // ==================== KINGDOM CUP ====================
  function openCupModal() {
    const cup = appData.cup;
    const round = Math.min(3, Math.max(1, cup.round || 1));

    for (let r = 1; r <= 3; r++) {
      const stage = document.getElementById(`cup-stage-${r}`);
      if (!stage) continue;
      stage.classList.toggle("done", cup.active && r < round);
      stage.classList.toggle("current", r === round);
    }

    document.getElementById("cup-options-box").classList.toggle("hidden", cup.active && round > 1);
    document.querySelectorAll("#cup-game-type .choice-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.cuptype === cup.gameType);
    });
    document.querySelectorAll("#cup-color-picker .color-dot").forEach((dot) => {
      dot.classList.toggle("active", dot.dataset.color === (cup.humanColor || "blue"));
    });

    const roundInfo = CUP_ROUNDS[round - 1];
    const startBtn = document.getElementById("btn-cup-start");
    const resetBtn = document.getElementById("btn-cup-reset");
    const note = document.getElementById("cup-status-note");

    if (cup.active && round > 1) {
      note.textContent = `You reached ${roundInfo.title}! Beat ${roundInfo.playerCount - 1} ${roundInfo.difficulty.toUpperCase()} bots to advance.`;
      startBtn.textContent = `Play Round ${round}: ${roundInfo.title} 🏆`;
      resetBtn.classList.remove("hidden");
    } else {
      note.textContent = "Win 3 knockout rounds in a row to lift the Kingdom Cup!";
      startBtn.textContent = "Start Round 1: Quarterfinal 🏆";
      resetBtn.classList.add("hidden");
    }

    openModal("modal-cup");
  }

  function launchCupRound() {
    const cup = appData.cup;
    cup.active = true;
    const round = Math.min(3, Math.max(1, cup.round || 1));
    const roundDef = CUP_ROUNDS[round - 1];
    saveData();

    const humanColor = cup.humanColor || "blue";
    const activeColors = window.BOARD_DATA.getActiveColors(roundDef.playerCount, humanColor);
    const botNames = ["Computer 2", "Computer 3", "Computer 4"];
    const players = {};
    let botIdx = 0;

    activeColors.forEach((color) => {
      const isHuman = color === humanColor;
      players[color] = {
        name: isHuman ? appData.profile.name : botNames[botIdx++] || `Computer ${botIdx + 1}`,
        avatar: isHuman ? getActiveAvatarValue() : "🤖",
        frame: isHuman ? (appData.settings.frame || "bronze") : "bronze",
        isBot: !isHuman
      };
    });

    launchMatch({
      mode: "vs-bot",
      gameType: cup.gameType || "quick",
      difficulty: roundDef.difficulty,
      isCup: true,
      cupRound: round,
      cupTitle: roundDef.title,
      isTeam2v2: false,
      playerCount: roundDef.playerCount,
      stake: 0,
      pot: 0,
      activeColors,
      players
    });
  }

  // ==================== LUCKY SPIN WHEEL ====================
  function buildSpinWheelLabels() {
    const wheel = document.getElementById("spin-wheel");
    if (!wheel || wheel.querySelector(".wheel-label")) return;

    SPIN_PRIZES.forEach((prize, idx) => {
      const label = document.createElement("span");
      label.className = "wheel-label";
      label.textContent = prize.label;
      const sliceCenterAngle = idx * 45 + 22.5;
      label.style.transform = `rotate(${sliceCenterAngle - 90}deg) translate(32px, -50%)`;
      wheel.appendChild(label);
    });
  }

  function renderSpinModalState() {
    const availSpins = getTotalAvailableSpins();
    const spinCoinsEl = document.getElementById("spin-coins");
    const spinGemsEl = document.getElementById("spin-gems");
    const spinTicketsEl = document.getElementById("spin-tickets");
    if (spinCoinsEl) spinCoinsEl.textContent = appData.profile.coins.toLocaleString("en-IN");
    if (spinGemsEl) spinGemsEl.textContent = appData.profile.gems.toLocaleString("en-IN");
    if (spinTicketsEl) spinTicketsEl.textContent = String(availSpins);

    const btn = document.getElementById("btn-spin-now");
    const status = document.getElementById("spin-status-text");
    const buySection = document.getElementById("spin-buy-section");
    const buyOptions = document.getElementById("spin-buy-options");
    const buyToggleBtn = document.getElementById("btn-toggle-buy-spins");
    if (isSpinning) return;

    // Hide Buy Spins completely whenever player already has 1+ spin available
    if (buySection) {
      if (availSpins > 0) {
        buySection.classList.add("hidden");
        if (buyOptions) buyOptions.classList.add("hidden");
        if (buyToggleBtn) buyToggleBtn.textContent = "Buy Spins 🎟️";
      } else {
        buySection.classList.remove("hidden");
      }
    }

    if (isFreeSpinAvailable()) {
      status.textContent = "Your daily FREE spin is ready!";
      btn.disabled = false;
      btn.textContent = "SPIN FOR FREE 🎡";
    } else if ((appData.profile.spinTickets || 0) > 0) {
      status.textContent = `You have ${appData.profile.spinTickets} Spin${appData.profile.spinTickets === 1 ? "" : "s"} ready!`;
      btn.disabled = false;
      btn.textContent = `USE SPIN (${appData.profile.spinTickets} Left) 🎡`;
    } else {
      status.textContent = "No spins left. Tap Buy Spins below or come back tomorrow!";
      btn.disabled = true;
      btn.textContent = "No Spins Left";
    }
  }

  function openSpinModal() {
    buildSpinWheelLabels();
    const buyOptions = document.getElementById("spin-buy-options");
    const buyToggleBtn = document.getElementById("btn-toggle-buy-spins");
    if (buyOptions) buyOptions.classList.add("hidden");
    if (buyToggleBtn) buyToggleBtn.textContent = "Buy Spins 🎟️";
    renderSpinModalState();
    openModal("modal-spin");
  }

  function buyExtraSpins(spinsCount, cost, currency) {
    if (isSpinning) return;
    const balanceKey = currency === "gems" ? "gems" : "coins";
    if (appData.profile[balanceKey] < cost) {
      showToast(`Not enough ${balanceKey}! Open Shop 🛒 for Coins & Gems.`);
      vibrate([30, 40, 30]);
      return;
    }

    appData.profile[balanceKey] -= cost;
    appData.profile.spinTickets = (appData.profile.spinTickets || 0) + spinsCount;
    saveData();
    renderHomeUI();
    renderSpinModalState();
    vibrate(25);
    showToast(`Added +${spinsCount} Extra Spin${spinsCount > 1 ? "s" : ""}! 🎟️`);
  }

  function handleSpinWheel() {
    if (isSpinning || getTotalAvailableSpins() <= 0) return;
    isSpinning = true;

    if (isFreeSpinAvailable()) appData.profile.lastSpinDate = getDateKey(0);
    else appData.profile.spinTickets = Math.max(0, (appData.profile.spinTickets || 0) - 1);

    saveData();
    renderHomeUI();

    const wheel = document.getElementById("spin-wheel");
    const btn = document.getElementById("btn-spin-now");
    const status = document.getElementById("spin-status-text");

    btn.disabled = true;
    btn.textContent = "Spinning...";
    status.textContent = "Good luck! 🍀";
    document.getElementById("spin-tickets").textContent = String(getTotalAvailableSpins());
    UI_SFX.spinStart();
    vibrate(25);

    const prizeIdx = Math.floor(Math.random() * SPIN_PRIZES.length);
    const prize = SPIN_PRIZES[prizeIdx];

    const sliceCenter = prizeIdx * 45 + 22.5;
    const jitter = (Math.random() - 0.5) * 20;
    const targetMod = (360 - ((sliceCenter + jitter + 360) % 360)) % 360;
    const currentMod = ((wheelRotation % 360) + 360) % 360;
    const delta = (targetMod - currentMod + 360) % 360;
    wheelRotation += 5 * 360 + delta;

    wheel.style.transform = `rotate(${wheelRotation}deg)`;

    setTimeout(() => {
      if (prize.currency === "gems") appData.profile.gems += prize.amount;
      else appData.profile.coins += prize.amount;

      saveData();
      renderHomeUI();
      isSpinning = false;
      renderSpinModalState();

      status.textContent = `Congratulations! You won ${prize.label}! 🎉`;
      UI_SFX.reward();
      FX.launchConfetti(80);
      FX.launchFireworks(2);
      vibrate([30, 40, 80]);
      showToast(`Lucky Spin Won: ${prize.label}!`);
    }, 4300);
  }

  // ==================== MISSIONS & ACHIEVEMENTS ====================
  function trackEvent(statName, amount = 1) {
    ensureDailyReset();
    if (!Object.prototype.hasOwnProperty.call(appData.missions.lifetime, statName)) return;

    if (Object.prototype.hasOwnProperty.call(appData.missions.dailyProgress, statName)) {
      appData.missions.dailyProgress[statName] += amount;
    }
    appData.missions.lifetime[statName] += amount;
    saveData();
    renderHomeUI();
  }

  function openMissionsModal() {
    ensureDailyReset();
    renderMissionsList();
    openModal("modal-missions");
  }

  function renderMissionsList() {
    document.querySelectorAll("#missions-tabs .shop-tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.mtab === activeMissionTab);
    });

    const list = document.getElementById("missions-list");
    list.innerHTML = "";

    const isDaily = activeMissionTab === "daily";
    const defs = isDaily ? DAILY_MISSIONS_DEF : ACHIEVEMENTS_DEF;
    const progressMap = isDaily ? appData.missions.dailyProgress : appData.missions.lifetime;
    const claimedList = isDaily ? appData.missions.dailyClaimed : appData.missions.achievementsClaimed;

    defs.forEach((item) => {
      const current = Math.min(item.target, progressMap[item.stat] || 0);
      const pct = Math.round((current / item.target) * 100);
      const claimed = claimedList.includes(item.id);
      const ready = current >= item.target && !claimed;

      const card = document.createElement("div");
      card.className = "mission-card" + (ready ? " claimable" : "");

      card.innerHTML = `
        <div class="mission-header">
          <span class="mission-title">${item.title}</span>
          <span class="mission-reward">${item.currency === "gems" ? "💎" : "🪙"} +${item.reward}</span>
        </div>
        <div class="mission-bar-track"><div class="mission-bar-fill" style="width:${pct}%"></div></div>
      `;

      const footer = document.createElement("div");
      footer.className = "mission-footer";
      const prog = document.createElement("span");
      prog.className = "mission-progress-text";
      prog.textContent = `${current} / ${item.target}`;

      const btn = document.createElement("button");
      btn.type = "button";
      if (claimed) {
        btn.className = "mission-claim-btn claimed";
        btn.textContent = "Claimed ✓";
        btn.disabled = true;
      } else if (ready) {
        btn.className = "mission-claim-btn";
        btn.textContent = "Claim";
        btn.addEventListener("click", () => claimMissionReward(isDaily, item));
      } else {
        btn.className = "mission-claim-btn locked";
        btn.textContent = "In Progress";
        btn.disabled = true;
      }

      footer.appendChild(prog);
      footer.appendChild(btn);
      card.appendChild(footer);
      list.appendChild(card);
    });
  }

  function claimMissionReward(isDaily, item) {
    const claimedList = isDaily ? appData.missions.dailyClaimed : appData.missions.achievementsClaimed;
    if (claimedList.includes(item.id)) return;

    claimedList.push(item.id);
    if (item.currency === "gems") appData.profile.gems += item.reward;
    else appData.profile.coins += item.reward;

    saveData();
    renderHomeUI();
    renderMissionsList();
    UI_SFX.reward();
    FX.launchFireworks(1);
    vibrate([25, 30, 45]);
    showToast(`Claimed ${item.currency === "gems" ? "💎" : "🪙"} +${item.reward}!`);
  }

  function spendGems(amount) {
    if (appData.profile.gems < amount) {
      showToast(`Need ${amount} Gems! Open Shop 🛒 to grab Gems.`);
      vibrate([30, 40, 30]);
      return false;
    }
    appData.profile.gems -= amount;
    saveData();
    renderHomeUI();
    return true;
  }

  // ==================== MATCH SETUP (VS BOT OR PASS & PLAY -> SINGLE / TEAM UP) ====================
  function isEffectiveTeam2v2() {
    return setupState.mode === "pass-play" && setupState.passStyle === "team";
  }

  function updatePrizePreview() {
    const el = document.getElementById("setup-prize-preview");
    if (!el) return;

    if (isEffectiveTeam2v2()) {
      if (setupState.stake === 0) {
        el.textContent = "Free 2v2 Team Match • Team Win Reward: +350 Coins 🪙";
      } else {
        el.textContent = `Team Prize Pool: 🪙 ${(setupState.stake * 2).toLocaleString("en-IN")} (Win with partner!)`;
      }
      return;
    }

    if (setupState.stake === 0) {
      const diffBonus = setupState.difficulty === "pro" ? 350 : setupState.difficulty === "easy" ? 200 : 250;
      el.textContent = `Free Match • 1st Place Reward: +${diffBonus} Coins 🪙`;
    } else {
      const pot = setupState.stake * setupState.playerCount;
      el.textContent = `Prize Pool: 🪙 ${pot.toLocaleString("en-IN")} (1st wins pot!)`;
    }
  }

  function syncSetupVisibility() {
    const isPass = setupState.mode === "pass-play";
    const isTeam = isEffectiveTeam2v2();
    const isBot = setupState.mode === "vs-bot";
    const isTeamBot = isTeam && setupState.teamPlay === "bot";

    document.getElementById("setup-pass-style-section").classList.toggle("hidden", !isPass);
    document.getElementById("setup-team-section").classList.toggle("hidden", !isTeam);
    document.getElementById("setup-team-pair-wrap").classList.toggle("hidden", !isTeamBot);
    document.getElementById("setup-player-count-section").classList.toggle("hidden", isTeam);
    document.getElementById("setup-difficulty-section").classList.toggle("hidden", !(isBot || isTeamBot));
    document.getElementById("setup-color-section").classList.toggle("hidden", !isBot);
    document.getElementById("setup-stake-section").classList.toggle("hidden", !(isBot || isTeamBot));

    if (!isBot && !isTeamBot) setupState.stake = 0;

    updatePrizePreview();
    renderPassPlayNameInputs();
  }

  function openSetupModal(mode) {
    setupState.mode = mode;
    if (mode === "pass-play") setupState.stake = 0;

    document.getElementById("setup-title").textContent = mode === "vs-bot" ? "Play vs Computer" : "Pass & Play Setup";

    document.querySelectorAll("#setup-pass-style .choice-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.passstyle === setupState.passStyle);
    });
    document.querySelectorAll("#setup-game-type .choice-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.gametype === setupState.gameType);
    });
    document.querySelectorAll("#setup-team-play .choice-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.teamplay === setupState.teamPlay);
    });
    document.querySelectorAll("#setup-team-pair .choice-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.teampair === setupState.teamPair);
    });
    document.querySelectorAll("#setup-player-count .choice-btn").forEach((btn) => {
      btn.classList.toggle("active", Number(btn.dataset.count) === setupState.playerCount);
    });
    document.querySelectorAll("#setup-difficulty-picker .choice-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.diff === setupState.difficulty);
    });
    document.querySelectorAll("#setup-color-picker .color-dot").forEach((dot) => {
      dot.classList.toggle("active", dot.dataset.color === setupState.humanColor);
    });
    document.querySelectorAll("#setup-stake-picker .choice-btn").forEach((btn) => {
      btn.classList.toggle("active", Number(btn.dataset.stake) === setupState.stake);
    });

    syncSetupVisibility();
    openModal("modal-setup");
  }

  function renderPassPlayNameInputs() {
    const container = document.getElementById("setup-names-container");
    container.innerHTML = "";

    const isTeam = isEffectiveTeam2v2();
    const showNames = (setupState.mode === "pass-play" && !isTeam) || (isTeam && setupState.teamPlay === "local");
    if (!showNames) {
      container.classList.add("hidden");
      return;
    }

    container.classList.remove("hidden");
    const count = isTeam ? 4 : setupState.playerCount;
    const activeColors = window.BOARD_DATA.getActiveColors(count, "blue");
    const teamTag = { red: "Team A", yellow: "Team A", green: "Team B", blue: "Team B" };

    activeColors.forEach((color, idx) => {
      const row = document.createElement("div");
      row.className = "name-input-row";

      const badge = document.createElement("span");
      badge.className = "color-badge";
      badge.style.background = COLOR_HEX[color];

      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 12;
      input.className = "text-input";
      input.dataset.color = color;
      input.value = idx === 0 ? appData.profile.name : `Player ${idx + 1}`;
      input.placeholder = isTeam ? `${COLOR_NAMES[color]} (${teamTag[color]})` : `${COLOR_NAMES[color]} Name`;

      row.appendChild(badge);
      row.appendChild(input);
      container.appendChild(row);
    });
  }

  function buildMatchConfigFromSetup() {
    const gameType = setupState.gameType;

    if (isEffectiveTeam2v2()) {
      const teams = { red: "A", yellow: "A", green: "B", blue: "B" };
      const isBotTeam = setupState.teamPlay === "bot";
      const humanColor = setupState.teamPair === "gb" ? "blue" : "red";
      const partnerColor = humanColor === "red" ? "yellow" : "green";
      const humanTeam = teams[humanColor];
      const activeColors = window.BOARD_DATA.getActiveColors(4, isBotTeam ? humanColor : "blue");
      const stake = isBotTeam ? setupState.stake : 0;
      const pot = stake * 2;
      const players = {};

      if (isBotTeam) {
        let oppIdx = 1;
        activeColors.forEach((color) => {
          const isHuman = color === humanColor;
          const isPartner = color === partnerColor;
          players[color] = {
            name: isHuman ? appData.profile.name : isPartner ? "Partner Bot" : `Computer ${oppIdx++ + 1}`,
            avatar: isHuman ? getActiveAvatarValue() : isPartner ? "🤝" : "🤖",
            frame: isHuman ? (appData.settings.frame || "bronze") : "bronze",
            isBot: !isHuman
          };
        });
      } else {
        const inputs = document.querySelectorAll("#setup-names-container input");
        const customNames = {};
        inputs.forEach((inp) => { customNames[inp.dataset.color] = inp.value.trim(); });
        const localAvatars = [getActiveAvatarValue(), "😎", "🔥", "⭐"];
        activeColors.forEach((color, idx) => {
          players[color] = {
            name: customNames[color] || `Player ${idx + 1}`,
            avatar: localAvatars[idx % localAvatars.length],
            frame: idx === 0 ? (appData.settings.frame || "bronze") : "bronze",
            isBot: false
          };
        });
      }

      return {
        mode: isBotTeam ? "vs-bot" : "pass-play",
        gameType,
        difficulty: isBotTeam ? setupState.difficulty : "normal",
        isCup: false,
        cupRound: 0,
        isTeam2v2: true,
        teams,
        humanTeam: isBotTeam ? humanTeam : null,
        playerCount: 4,
        stake,
        pot,
        activeColors,
        players
      };
    }

    const mode = setupState.mode;
    const difficulty = mode === "vs-bot" ? setupState.difficulty : "normal";
    const count = setupState.playerCount;
    const stake = mode === "vs-bot" ? setupState.stake : 0;
    const pot = stake * count;
    const startColor = mode === "vs-bot" ? setupState.humanColor : "blue";
    const activeColors = window.BOARD_DATA.getActiveColors(count, startColor);

    const players = {};
    if (mode === "vs-bot") {
      let botNum = 2;
      activeColors.forEach((color) => {
        const isHuman = color === setupState.humanColor;
        players[color] = {
          name: isHuman ? appData.profile.name : `Computer ${botNum++}`,
          avatar: isHuman ? getActiveAvatarValue() : "🤖",
          frame: isHuman ? (appData.settings.frame || "bronze") : "bronze",
          isBot: !isHuman
        };
      });
    } else {
      const inputs = document.querySelectorAll("#setup-names-container input");
      const customNames = {};
      inputs.forEach((inp) => { customNames[inp.dataset.color] = inp.value.trim(); });
      const localAvatars = [getActiveAvatarValue(), "😎", "🔥", "⭐"];
      activeColors.forEach((color, idx) => {
        players[color] = {
          name: customNames[color] || `Player ${idx + 1}`,
          avatar: localAvatars[idx % localAvatars.length],
          frame: idx === 0 ? (appData.settings.frame || "bronze") : "bronze",
          isBot: false
        };
      });
    }

    return {
      mode,
      gameType,
      difficulty,
      isCup: false,
      cupRound: 0,
      isTeam2v2: false,
      teams: null,
      humanTeam: null,
      playerCount: count,
      stake,
      pot,
      activeColors,
      players
    };
  }

  function launchMatch(config) {
    if (config.stake > 0) {
      if (appData.profile.coins < config.stake) {
        showToast("Not enough coins! Open Shop 🛒 to grab free coins.");
        vibrate([30, 40, 30]);
        return false;
      }
      appData.profile.coins -= config.stake;
      saveData();
      renderHomeUI();
    }

    lastMatchConfig = config;
    closeAllModals();
    closeGameMenu();
    showScreen("game-screen");

    if (window.LUDO_GAME && typeof window.LUDO_GAME.startMatch === "function") {
      window.LUDO_GAME.startMatch(config);
    }
    return true;
  }

  // ==================== VICTORY, PODIUM & MATCH HISTORY ====================
  function recordMatchResult({ saveId, rankings, mode, gameType, difficulty, isCup, cupRound, isTeam2v2, winningTeam, humanTeam, stake, pot }) {
    if (saveId) deleteSavedMatch(saveId);
    appData.profile.matches += 1;

    const first = rankings[0];
    const humanEntry = rankings.find((r) => !r.isBot) || first;
    const humanPlace = humanEntry.place;
    const humanWonFirst = isTeam2v2
      ? (!humanTeam || winningTeam === humanTeam)
      : (mode === "pass-play" || humanPlace === 1);

    let coinsEarned = 0;
    let gemsEarned = 0;
    let titleText = `${first.name} Wins!`;
    let subText = `${gameType === "quick" ? "Quick Ludo" : "Classic Ludo"} • Final Standings`;
    const playAgainBtn = document.getElementById("btn-play-again");
    winNextAction = "replay";
    if (playAgainBtn) playAgainBtn.textContent = "Play Again";

    if (isTeam2v2) {
      const teamLabel = winningTeam === "A" ? "Team A (Red + Yellow)" : "Team B (Green + Blue)";
      titleText = `🤝 ${teamLabel} Wins!`;
      subText = "2v2 Partner Victory!";
      if (humanWonFirst) {
        coinsEarned = stake > 0 ? pot : 350;
        FX.launchConfetti(130);
        FX.launchFireworks(3);
      } else {
        coinsEarned = stake > 0 ? 0 : 75;
      }
    } else if (isCup) {
      const round = cupRound || appData.cup.round || 1;
      const roundDef = CUP_ROUNDS[round - 1] || CUP_ROUNDS[0];

      if (humanWonFirst) {
        if (round < 3) {
          coinsEarned = roundDef.rewardCoins;
          appData.cup.active = true;
          appData.cup.round = round + 1;
          titleText = `Cleared ${roundDef.title}! 🎉`;
          subText = `Advanced to Round ${round + 1}: ${CUP_ROUNDS[round].title}!`;
          winNextAction = "cup-next";
          if (playAgainBtn) playAgainBtn.textContent = `Play ${CUP_ROUNDS[round].title} 🏆`;
          FX.launchConfetti(110);
          FX.launchFireworks(3);
        } else {
          coinsEarned = roundDef.rewardCoins;
          gemsEarned = roundDef.rewardGems || 40;
          appData.profile.cupsWon = (appData.profile.cupsWon || 0) + 1;
          appData.cup.active = false;
          appData.cup.round = 1;
          trackEvent("cup", 1);
          titleText = "🏆 KINGDOM CUP CHAMPION!";
          subText = "You conquered all 3 knockout rounds!";
          winNextAction = "cup-restart";
          if (playAgainBtn) playAgainBtn.textContent = "New Cup 🏆";
          FX.launchConfetti(180);
          FX.launchFireworks(5);
        }
      } else {
        coinsEarned = 75;
        appData.cup.active = false;
        appData.cup.round = 1;
        titleText = `Eliminated in ${roundDef.title}`;
        subText = "Better luck next tournament!";
        winNextAction = "cup-restart";
        if (playAgainBtn) playAgainBtn.textContent = "Retry Cup 🏆";
        FX.launchConfetti(35);
      }
    } else if (mode === "pass-play") {
      coinsEarned = 150;
      FX.launchConfetti(110);
      FX.launchFireworks(3);
    } else if (stake > 0) {
      if (humanPlace === 1) coinsEarned = pot;
      else if (humanPlace === 2 && rankings.length >= 3) coinsEarned = Math.floor(stake * 0.5);
      if (humanWonFirst) { FX.launchConfetti(120); FX.launchFireworks(3); }
    } else {
      const freeWin = difficulty === "pro" ? 350 : difficulty === "easy" ? 200 : 250;
      if (humanPlace === 1) coinsEarned = freeWin;
      else if (humanPlace === 2 && rankings.length >= 3) coinsEarned = 100;
      else coinsEarned = 50;
      if (humanWonFirst) { FX.launchConfetti(120); FX.launchFireworks(3); }
    }

    const oldRank = getRankInfo(appData.profile.wins).current.name;
    if (humanWonFirst) {
      appData.profile.wins += 1;
      trackEvent("win", 1);
    }
    const newRank = getRankInfo(appData.profile.wins).current;
    if (newRank.name !== oldRank) {
      setTimeout(() => showToast(`Rank Up! ${newRank.icon} ${newRank.name}!`), 900);
    }

    const modeLabel = isCup
      ? `🏆 Cup Round ${cupRound || 1}`
      : isTeam2v2
        ? "🤝 2v2 Team Up"
        : mode === "pass-play"
          ? "Pass & Play"
          : "Vs Computer";
    const resultLabel = isTeam2v2
      ? (humanWonFirst ? "TEAM WIN" : "TEAM LOSS")
      : (humanWonFirst ? "WIN 🥇" : `#${humanPlace}`);
    const rewardLabel = gemsEarned > 0
      ? `+${coinsEarned.toLocaleString("en-IN")} 🪙  +${gemsEarned} 💎`
      : `+${coinsEarned.toLocaleString("en-IN")} 🪙`;

    appData.history.unshift({
      ts: Date.now(),
      modeLabel: `${modeLabel} • ${gameType === "quick" ? "Quick" : "Classic"}`,
      won: humanWonFirst,
      resultLabel,
      rewardLabel
    });
    appData.history = appData.history.slice(0, MAX_HISTORY_ITEMS);

    appData.profile.coins += coinsEarned;
    appData.profile.gems += gemsEarned;
    saveData();
    renderHomeUI();

    document.getElementById("win-trophy-icon").textContent = humanWonFirst ? "🏆" : "🎖️";
    document.getElementById("win-title").textContent = titleText;
    document.getElementById("win-subtitle").textContent = subText;

    const list = document.getElementById("win-rankings-list");
    list.innerHTML = "";
    rankings.forEach((entry, idx) => {
      const row = document.createElement("div");
      const isWinnerRow = isTeam2v2 ? (entry.team === winningTeam) : (idx === 0);
      row.className = "rank-row" + (isWinnerRow ? " first-place" : "");

      const left = document.createElement("div");
      left.className = "rank-left";

      const medal = document.createElement("span");
      medal.className = "rank-medal";
      medal.textContent = isTeam2v2 ? (entry.team === winningTeam ? "🏆" : "🥈") : (MEDALS[idx] || `${idx + 1}.`);

      const av = document.createElement("span");
      av.className = "rank-avatar-mini";
      renderAvatar(av, entry.avatar);

      const name = document.createElement("span");
      name.className = "rank-name";
      name.textContent = entry.name;

      left.appendChild(medal);
      left.appendChild(av);
      left.appendChild(name);

      const tag = document.createElement("span");
      tag.className = "rank-color-tag";
      tag.style.background = COLOR_HEX[entry.color];
      tag.textContent = isTeam2v2 ? `Team ${entry.team}` : COLOR_NAMES[entry.color];

      row.appendChild(left);
      row.appendChild(tag);
      list.appendChild(row);
    });

    const rewardPill = document.getElementById("win-coins-earned");
    if (gemsEarned > 0) {
      rewardPill.textContent = `+${coinsEarned.toLocaleString("en-IN")} Coins & +${gemsEarned} Gems! 🏆`;
    } else if (coinsEarned > 0) {
      rewardPill.textContent = `+${coinsEarned.toLocaleString("en-IN")} Coins Earned! 🪙`;
    } else {
      rewardPill.textContent = "Stake Lost — Better Luck Next Time!";
    }

    openModal("modal-win");
  }

  // ==================== SOCIAL & PWA ====================
  function handleShare() {
    const shareText = `Play Ludo Kingdom with me! ${SOCIAL_LINKS.gameUrl}`;
    if (navigator.share) {
      navigator.share({ title: "Ludo Kingdom", text: "Come play Ludo Kingdom!", url: SOCIAL_LINKS.gameUrl }).catch(() => {});
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText)
        .then(() => showToast("Game link copied!"))
        .catch(() => showToast("Share Ludo Kingdom with friends!"));
    } else {
      showToast("Share Ludo Kingdom with friends!");
    }
  }

  function initPWA() {
    if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }

    const installBtn = document.getElementById("btn-install-app");
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      if (installBtn) installBtn.classList.remove("hidden");
    });

    if (installBtn) {
      installBtn.addEventListener("click", async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        try { await deferredInstallPrompt.userChoice; } catch {}
        deferredInstallPrompt = null;
        installBtn.classList.add("hidden");
      });
    }
  }

  // ==================== EVENT BINDING ====================
  function bindEvents() {
    const unlockOnce = () => {
      MUSIC.unlockAndSync();
      document.removeEventListener("pointerdown", unlockOnce);
    };
    document.addEventListener("pointerdown", unlockOnce);

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn || btn.disabled) return;
      if (btn.classList.contains("dice-box") || btn.classList.contains("token") ||
          btn.classList.contains("emoji-btn") || btn.classList.contains("chat-pill-btn") ||
          btn.id === "btn-claim-reward" || btn.id === "btn-spin-now" ||
          btn.classList.contains("mission-claim-btn")) {
        return;
      }
      UI_SFX.tap();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        MUSIC.stop(false);
        THEME_FX.stop();
      } else {
        MUSIC.sync();
        const gameScreen = document.getElementById("game-screen");
        if (gameScreen && gameScreen.classList.contains("active")) THEME_FX.start();
      }
    });

    window.addEventListener("pagehide", () => {
      MUSIC.stop(false);
    });

    // Home Main Play Picker + Play Online
    document.getElementById("btn-play-main").addEventListener("click", () => openModal("modal-play-picker"));
    document.getElementById("btn-play-online").addEventListener("click", () => openModal("modal-online"));

    document.getElementById("btn-pick-vs-bot").addEventListener("click", () => {
      closeModal("modal-play-picker");
      openSetupModal("vs-bot");
    });
    document.getElementById("btn-pick-pass-play").addEventListener("click", () => {
      closeModal("modal-play-picker");
      openSetupModal("pass-play");
    });
    document.getElementById("btn-pick-tournament").addEventListener("click", () => {
      closeModal("modal-play-picker");
      openCupModal();
    });

    // Full-Screen 4-Tab Customization Screen
    document.getElementById("btn-open-themes").addEventListener("click", () => openThemesScreen("themes"));
    document.getElementById("btn-themes-back").addEventListener("click", () => {
      renderHomeUI();
      showScreen("home-screen");
    });
    document.getElementById("btn-themes-add-coins").addEventListener("click", () => openShopScreen("coins", "themes-screen"));
    document.getElementById("btn-themes-add-gems").addEventListener("click", () => openShopScreen("gems", "themes-screen"));

    document.querySelectorAll("#themes-tabs .inv-cat-btn").forEach((tabBtn) => {
      tabBtn.addEventListener("click", () => {
        activeThemesTab = tabBtn.dataset.tab;
        renderThemesScreen();
      });
    });

    // Full-Screen Shop (Offers, Buy Coins, Buy Gems)
    document.getElementById("btn-open-shop").addEventListener("click", () => openShopScreen("bundles", "home-screen"));
    document.getElementById("btn-shop-back").addEventListener("click", () => {
      const target = shopReturnScreen || "home-screen";
      renderHomeUI();
      if (target === "themes-screen") renderThemesScreen();
      showScreen(target);
    });
    document.querySelectorAll("#shop-tabs .shop-tab").forEach((tabBtn) => {
      tabBtn.addEventListener("click", () => {
        activeShopTab = tabBtn.dataset.tab;
        renderShopScreen();
      });
    });

    // Purchase Confirmation Modal
    document.getElementById("btn-buy-cancel").addEventListener("click", () => {
      pendingPurchaseAction = null;
      closeModal("modal-buy-confirm");
    });
    document.getElementById("btn-buy-ok").addEventListener("click", () => {
      const fn = pendingPurchaseAction;
      pendingPurchaseAction = null;
      closeModal("modal-buy-confirm");
      if (typeof fn === "function") fn();
    });

    // Separate Avatar Picker Button inside Profile
    document.getElementById("btn-open-avatar-picker").addEventListener("click", openAvatarPickerModal);

    // Profile, Rank & History
    document.getElementById("btn-profile-edit").addEventListener("click", () => openProfileModal("edit"));
    document.getElementById("card-open-profile").addEventListener("click", () => openProfileModal("edit"));
    document.getElementById("btn-save-profile").addEventListener("click", saveProfileChanges);

    document.querySelectorAll("#profile-tabs .shop-tab").forEach((tabBtn) => {
      tabBtn.addEventListener("click", () => {
        activeProfileTab = tabBtn.dataset.ptab;
        renderProfileTab();
      });
    });

    document.getElementById("input-profile-photo").addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      try {
        const compressed = await compressGalleryPhoto(file);
        selectedPhotoTemp = compressed;
        syncProfilePreview();
        document.querySelectorAll("#avatar-grid .avatar-option").forEach((el) => el.classList.remove("selected"));
        closeModal("modal-avatar-picker");
        showToast("Photo loaded! Tap Save Profile.");
      } catch {
        showToast("Could not load image. Please pick another photo.");
      }
    });

    document.getElementById("btn-remove-photo").addEventListener("click", () => {
      selectedPhotoTemp = "";
      syncProfilePreview();
      showToast("Photo removed.");
    });

    // Saved Matches Manager
    document.getElementById("btn-resume-match").addEventListener("click", openSavedMatchesModal);
    document.getElementById("btn-delete-all-saves").addEventListener("click", (e) => {
      const btn = e.currentTarget;
      if (!deleteAllArmed) {
        deleteAllArmed = true;
        btn.textContent = "Tap Again to Confirm Delete All";
        clearTimeout(deleteAllTimer);
        deleteAllTimer = setTimeout(() => {
          deleteAllArmed = false;
          btn.textContent = "🗑️ Delete All Saved Matches";
        }, 3500);
        return;
      }
      clearAllSavedMatches();
      deleteAllArmed = false;
      btn.textContent = "🗑️ Delete All Saved Matches";
      renderSavedMatchesList();
      closeModal("modal-saved-matches");
      showToast("All saved matches deleted!");
    });

    // Kingdom Cup
    document.querySelectorAll("#cup-game-type .choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        appData.cup.gameType = btn.dataset.cuptype;
        saveData();
        document.querySelectorAll("#cup-game-type .choice-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
    document.querySelectorAll("#cup-color-picker .color-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        appData.cup.humanColor = dot.dataset.color;
        saveData();
        document.querySelectorAll("#cup-color-picker .color-dot").forEach((d) => d.classList.remove("active"));
        dot.classList.add("active");
      });
    });
    document.getElementById("btn-cup-start").addEventListener("click", launchCupRound);
    document.getElementById("btn-cup-reset").addEventListener("click", () => {
      appData.cup.active = false;
      appData.cup.round = 1;
      saveData();
      openCupModal();
      showToast("Kingdom Cup reset to Round 1.");
    });

    // Lucky Spin Wheel & Extra Spins
    document.getElementById("btn-lucky-spin").addEventListener("click", openSpinModal);
    document.getElementById("btn-spin-now").addEventListener("click", handleSpinWheel);
    const toggleBuySpinsBtn = document.getElementById("btn-toggle-buy-spins");
    if (toggleBuySpinsBtn) {
      toggleBuySpinsBtn.addEventListener("click", () => {
        const opts = document.getElementById("spin-buy-options");
        if (!opts) return;
        const willShow = opts.classList.contains("hidden");
        opts.classList.toggle("hidden", !willShow);
        toggleBuySpinsBtn.textContent = willShow ? "Hide Spin Packs ▲" : "Buy Spins 🎟️";
        vibrate(12);
      });
    }
    document.querySelectorAll(".spin-buy-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        buyExtraSpins(Number(btn.dataset.spins), Number(btn.dataset.cost), btn.dataset.currency);
      });
    });

    // Daily Missions & Achievements
    document.getElementById("btn-missions").addEventListener("click", openMissionsModal);
    document.querySelectorAll("#missions-tabs .shop-tab").forEach((tabBtn) => {
      tabBtn.addEventListener("click", () => {
        activeMissionTab = tabBtn.dataset.mtab;
        renderMissionsList();
      });
    });

    // Settings (Including Social Media Links)
    document.getElementById("btn-settings").addEventListener("click", () => {
      resetConfirmArmed = false;
      document.getElementById("btn-reset-data").textContent = "Reset Stats, Coins & Shop";
      applySettingsUI();
      openModal("modal-settings");
    });
    document.getElementById("toggle-sound").addEventListener("change", (e) => {
      appData.settings.sound = e.target.checked;
      saveData();
      applySettingsUI();
    });
    document.getElementById("toggle-music").addEventListener("change", (e) => {
      appData.settings.music = e.target.checked;
      saveData();
      applySettingsUI();
    });
    document.getElementById("toggle-vibration").addEventListener("change", (e) => {
      appData.settings.vibration = e.target.checked;
      saveData();
      if (e.target.checked) vibrate(25);
    });
    document.getElementById("toggle-timer").addEventListener("change", (e) => {
      appData.settings.timer = e.target.checked;
      saveData();
    });
    document.getElementById("toggle-automove").addEventListener("change", (e) => {
      appData.settings.autoMove = e.target.checked;
      saveData();
    });
    document.getElementById("select-speed").addEventListener("change", (e) => {
      appData.settings.speed = e.target.value;
      saveData();
      applySettingsUI();
    });

    document.getElementById("btn-reset-data").addEventListener("click", (e) => {
      const btn = e.currentTarget;
      if (!resetConfirmArmed) {
        resetConfirmArmed = true;
        btn.textContent = "Tap Again to Confirm Reset";
        clearTimeout(resetConfirmTimer);
        resetConfirmTimer = setTimeout(() => {
          resetConfirmArmed = false;
          btn.textContent = "Reset Stats, Coins & Shop";
        }, 3500);
        return;
      }
      appData = cloneDefaults();
      clearAllSavedMatches();
      saveData();
      applySettingsUI();
      renderHomeUI();
      resetConfirmArmed = false;
      btn.textContent = "Reset Stats, Coins & Shop";
      closeModal("modal-settings");
      showToast("All stats, coins & shop items reset!");
    });

    // Setup Choices (Including Pass & Play -> Single / Team Up 2v2)
    document.querySelectorAll("#setup-pass-style .choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        setupState.passStyle = btn.dataset.passstyle;
        document.querySelectorAll("#setup-pass-style .choice-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        syncSetupVisibility();
      });
    });
    document.querySelectorAll("#setup-game-type .choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        setupState.gameType = btn.dataset.gametype;
        document.querySelectorAll("#setup-game-type .choice-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
    document.querySelectorAll("#setup-team-play .choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        setupState.teamPlay = btn.dataset.teamplay;
        document.querySelectorAll("#setup-team-play .choice-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        syncSetupVisibility();
      });
    });
    document.querySelectorAll("#setup-team-pair .choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        setupState.teamPair = btn.dataset.teampair;
        document.querySelectorAll("#setup-team-pair .choice-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
    document.querySelectorAll("#setup-player-count .choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        setupState.playerCount = Number(btn.dataset.count);
        document.querySelectorAll("#setup-player-count .choice-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        updatePrizePreview();
        renderPassPlayNameInputs();
      });
    });
    document.querySelectorAll("#setup-difficulty-picker .choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        setupState.difficulty = btn.dataset.diff;
        document.querySelectorAll("#setup-difficulty-picker .choice-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        updatePrizePreview();
      });
    });
    document.querySelectorAll("#setup-color-picker .color-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        setupState.humanColor = dot.dataset.color;
        document.querySelectorAll("#setup-color-picker .color-dot").forEach((d) => d.classList.remove("active"));
        dot.classList.add("active");
      });
    });
    document.querySelectorAll("#setup-stake-picker .choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        setupState.stake = Number(btn.dataset.stake);
        document.querySelectorAll("#setup-stake-picker .choice-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        updatePrizePreview();
      });
    });
    document.getElementById("btn-start-match").addEventListener("click", () => {
      launchMatch(buildMatchConfigFromSetup());
    });

    // Daily Reward Button
    document.getElementById("btn-daily-bonus").addEventListener("click", openRewardsModal);
    document.getElementById("btn-claim-reward").addEventListener("click", claimDailyReward);

    // Social Links (Inside Settings)
    document.getElementById("btn-social-fb").addEventListener("click", () => window.open(SOCIAL_LINKS.facebook, "_blank", "noopener"));
    document.getElementById("btn-social-ig").addEventListener("click", () => window.open(SOCIAL_LINKS.instagram, "_blank", "noopener"));
    document.getElementById("btn-social-wa").addEventListener("click", () => {
      const text = encodeURIComponent(`Come play Ludo Kingdom! ${SOCIAL_LINKS.gameUrl}`);
      window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
    });
    document.getElementById("btn-social-share").addEventListener("click", handleShare);

    // Single ••• In-Game Menu (Music, Sound, Save & Resume Later, Home)
    const menuBtn = document.getElementById("btn-game-menu");
    const menuPop = document.getElementById("game-menu-popover");
    if (menuBtn && menuPop) {
      menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const emojiPop = document.getElementById("emoji-popover");
        if (emojiPop) emojiPop.classList.add("hidden");
        menuPop.classList.toggle("hidden");
        vibrate(10);
      });

      document.addEventListener("click", (e) => {
        if (!menuPop.classList.contains("hidden") && !menuPop.contains(e.target) && !menuBtn.contains(e.target)) {
          menuPop.classList.add("hidden");
        }
      });
    }

    document.getElementById("btn-menu-music").addEventListener("click", () => {
      appData.settings.music = !appData.settings.music;
      saveData();
      applySettingsUI();
      showToast(appData.settings.music ? "Music On 🎵" : "Music Off 🔇");
    });

    document.getElementById("btn-menu-sound").addEventListener("click", () => {
      appData.settings.sound = !appData.settings.sound;
      saveData();
      applySettingsUI();
      showToast(appData.settings.sound ? "Sound On 🔊" : "Sound Off 🔇");
    });

    document.getElementById("btn-menu-save").addEventListener("click", () => {
      closeGameMenu();
      if (window.LUDO_GAME && typeof window.LUDO_GAME.saveAndExit === "function") {
        window.LUDO_GAME.saveAndExit();
      }
      renderHomeUI();
      showScreen("home-screen");
      showToast("Match saved! Tap Saved Matches to resume anytime.");
    });

    document.getElementById("btn-menu-home").addEventListener("click", () => {
      closeGameMenu();
      const matchActive = window.LUDO_GAME && window.LUDO_GAME.isMatchActive();
      if (!matchActive) {
        renderHomeUI();
        showScreen("home-screen");
        return;
      }
      const desc = document.getElementById("exit-confirm-desc");
      if (lastMatchConfig && lastMatchConfig.stake > 0) {
        desc.textContent = `Save for Later to resume anytime, or Quit now (forfeits 🪙 ${lastMatchConfig.stake.toLocaleString("en-IN")} stake).`;
      } else {
        desc.textContent = "Save this match to your Saved Matches list, or quit completely.";
      }
      openModal("modal-exit-confirm");
    });

    document.getElementById("btn-exit-save").addEventListener("click", () => {
      closeModal("modal-exit-confirm");
      if (window.LUDO_GAME && typeof window.LUDO_GAME.saveAndExit === "function") {
        window.LUDO_GAME.saveAndExit();
      }
      renderHomeUI();
      showScreen("home-screen");
      showToast("Saved! Open Saved Matches anytime.");
    });

    document.getElementById("btn-exit-leave").addEventListener("click", () => {
      closeModal("modal-exit-confirm");
      if (window.LUDO_GAME) {
        const activeId = typeof window.LUDO_GAME.getCurrentSaveId === "function"
          ? window.LUDO_GAME.getCurrentSaveId()
          : null;
        if (activeId) deleteSavedMatch(activeId);
        if (typeof window.LUDO_GAME.stopMatch === "function") window.LUDO_GAME.stopMatch();
      }
      renderHomeUI();
      showScreen("home-screen");
    });

    // Victory Modal Actions
    document.getElementById("btn-play-again").addEventListener("click", () => {
      if (window.LUDO_GAME && typeof window.LUDO_GAME.stopWinningAudio === "function") {
        window.LUDO_GAME.stopWinningAudio();
      }
      if (winNextAction === "cup-next") {
        closeModal("modal-win");
        launchCupRound();
        return;
      }
      if (winNextAction === "cup-restart") {
        closeModal("modal-win");
        openCupModal();
        return;
      }
      if (lastMatchConfig) {
        const started = launchMatch(lastMatchConfig);
        if (!started) {
          closeModal("modal-win");
          openSetupModal(lastMatchConfig.isTeam2v2 ? "pass-play" : lastMatchConfig.mode);
        }
      } else {
        closeModal("modal-win");
        showScreen("home-screen");
      }
    });

    document.getElementById("btn-win-home").addEventListener("click", () => {
      if (window.LUDO_GAME && typeof window.LUDO_GAME.stopWinningAudio === "function") {
        window.LUDO_GAME.stopWinningAudio();
      }
      closeModal("modal-win");
      renderHomeUI();
      showScreen("home-screen");
    });

    document.querySelectorAll("[data-close]").forEach((btn) => {
      btn.addEventListener("click", () => closeModal(btn.dataset.close));
    });

    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay && overlay.id !== "modal-win" && !(overlay.id === "modal-spin" && isSpinning)) {
          overlay.classList.add("hidden");
        }
      });
    });
  }

  // ==================== ANDROID BACK BUTTON HANDLER ====================
  function handleHardwareBack() {
    const emojiPop = document.getElementById("emoji-popover");
    if (emojiPop && !emojiPop.classList.contains("hidden")) {
      emojiPop.classList.add("hidden");
      return;
    }

    const menuPop = document.getElementById("game-menu-popover");
    if (menuPop && !menuPop.classList.contains("hidden")) {
      menuPop.classList.add("hidden");
      return;
    }

    const priorityModals = [
      "modal-buy-confirm",
      "modal-item-preview",
      "modal-avatar-picker",
      "modal-exit-app",
      "modal-exit-confirm"
    ];
    for (const id of priorityModals) {
      const el = document.getElementById(id);
      if (el && !el.classList.contains("hidden")) {
        if (id === "modal-buy-confirm") pendingPurchaseAction = null;
        el.classList.add("hidden");
        return;
      }
    }

    const openOverlays = Array.from(document.querySelectorAll(".modal-overlay:not(.hidden)"));
    if (openOverlays.length > 0) {
      const topOverlay = openOverlays[openOverlays.length - 1];
      if (topOverlay.id === "modal-spin" && isSpinning) return;
      if (topOverlay.id === "modal-win") {
        if (window.LUDO_GAME && typeof window.LUDO_GAME.stopWinningAudio === "function") {
          window.LUDO_GAME.stopWinningAudio();
        }
        topOverlay.classList.add("hidden");
        renderHomeUI();
        showScreen("home-screen");
        return;
      }
      topOverlay.classList.add("hidden");
      return;
    }

    const activeScreen = document.querySelector(".screen.active");
    const screenId = activeScreen ? activeScreen.id : "";

    if (screenId === "splash-screen") return;

    if (screenId === "shop-screen") {
      const target = shopReturnScreen || "home-screen";
      renderHomeUI();
      if (target === "themes-screen") renderThemesScreen();
      showScreen(target);
      return;
    }

    if (screenId === "themes-screen") {
      renderHomeUI();
      showScreen("home-screen");
      return;
    }

    if (screenId === "game-screen") {
      const homeBtn = document.getElementById("btn-menu-home");
      if (homeBtn) homeBtn.click();
      return;
    }

    if (screenId === "home-screen") {
      openModal("modal-exit-app");
    }
  }

  function initBackButtonHandler() {
    const exitBtn = document.getElementById("btn-app-exit-confirm");
    if (exitBtn) {
      exitBtn.addEventListener("click", () => {
        closeModal("modal-exit-app");
        const capApp = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
        if (capApp && typeof capApp.exitApp === "function") {
          capApp.exitApp();
        } else {
          showToast("Close this tab to exit Ludo Kingdom.");
        }
      });
    }

    const capApp = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (capApp && typeof capApp.addListener === "function") {
      capApp.addListener("backButton", () => handleHardwareBack());
    }

    try {
      window.history.pushState({ ludoGuard: true }, "");
      window.addEventListener("popstate", () => {
        handleHardwareBack();
        try { window.history.pushState({ ludoGuard: true }, ""); } catch {}
      });
    } catch {}

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") handleHardwareBack();
    });
  }

  function init() {
    FX.init();
    THEME_FX.init();
    spawnLobbySparkles();
    applySettingsUI();
    renderHomeUI();
    bindEvents();
    initBackButtonHandler();
    initPWA();
    runSplashScreen();
  }

  document.addEventListener("DOMContentLoaded", init);

  return {
    getProfile: () => ({ ...appData.profile }),
    getSettings: () => ({ ...appData.settings }),
    getPieceSkinForTheme,
    renderPieceVisual,
    getTokenSVG,
    renderAvatar,
    applyFrameVisual,
    loadDiceAsset,
    getDiceAssetUrl,
    isHDDiceSkin,
    vibrate,
    spendGems,
    trackEvent,
    launchConfetti: (n) => FX.launchConfetti(n),
    launchFireworks: (b) => FX.launchFireworks(b),
    saveMatchSnapshot,
    deleteSavedMatch,
    clearAllSavedMatches,
    showScreen,
    openModal,
    closeModal,
    closeGameMenu,
    showToast,
    recordMatchResult
  };
})();


