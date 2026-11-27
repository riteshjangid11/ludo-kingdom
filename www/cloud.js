/* =========================================================
   LUDO KINGDOM - FIREBASE CLOUD SAVE & ACCOUNT AUTH ENGINE
   Supports Google Sign-In (Native Capacitor 7 + Web Fallback)
   & Email/Password synced to Firebase Realtime Database
   ========================================================= */

window.LUDO_CLOUD = (() => {
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

  const LAST_SYNC_KEY = "ludo_kingdom_last_cloud_sync_v1";

  let auth = null;
  let db = null;
  let initPromise = null;
  let currentUser = null;
  let authTab = "signin"; // "signin" | "signup"
  let syncDebounceTimer = null;
  let isApplyingCloud = false;
  let isSyncing = false;
  let lastSyncedAt = Number(localStorage.getItem(LAST_SYNC_KEY) || 0);

  function showToast(msg) {
    if (window.LUDO_UI && typeof window.LUDO_UI.showToast === "function") {
      window.LUDO_UI.showToast(msg);
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

  async function ensureFirebaseAuth() {
    if (auth && db) return { auth, db };
    if (initPromise) return initPromise;

    initPromise = (async () => {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new Error("OFFLINE");
      }

      if (!window.firebase || typeof window.firebase.initializeApp !== "function") {
        await loadExternalScript("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
      }
      if (!window.firebase || typeof window.firebase.auth !== "function") {
        await loadExternalScript("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js");
      }
      if (!window.firebase || typeof window.firebase.database !== "function") {
        await loadExternalScript("https://www.gstatic.com/firebasejs/10.14.1/firebase-database-compat.js");
      }

      if (!window.firebase || typeof window.firebase.auth !== "function" || typeof window.firebase.database !== "function") {
        throw new Error("SDK_UNAVAILABLE");
      }

      if (!window.firebase.apps || window.firebase.apps.length === 0) {
        window.firebase.initializeApp(FIREBASE_CONFIG);
      }

      auth = window.firebase.auth();
      db = window.firebase.database();

      auth.onAuthStateChanged((user) => {
        const prevUid = currentUser ? currentUser.uid : null;
        currentUser = user || null;
        renderCloudUI();
        if (currentUser && currentUser.uid !== prevUid) {
          syncOnSignIn(currentUser, false).catch(() => {});
        }
      });

      return { auth, db };
    })();

    try {
      return await initPromise;
    } catch (err) {
      initPromise = null;
      throw err;
    }
  }

  function isFreshLocalSave(d) {
    if (!d || !d.profile || !d.inventory) return true;
    const p = d.profile;
    const inv = d.inventory;
    const unlockedExtras =
      (Array.isArray(inv.themes) ? inv.themes.length : 1) +
      (Array.isArray(inv.dice) ? inv.dice.length : 1) +
      (Array.isArray(inv.frames) ? inv.frames.length : 1) +
      (Array.isArray(inv.emojis) ? inv.emojis.length : 1);
    return (
      (p.matches || 0) === 0 &&
      (p.wins || 0) === 0 &&
      (p.cupsWon || 0) === 0 &&
      (p.coins || 0) <= 1050 &&
      (p.gems || 0) <= 55 &&
      unlockedExtras <= 4
    );
  }

  function unionArrays(a, b) {
    const out = [];
    const seen = new Set();
    [...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])].forEach((item) => {
      if (item && !seen.has(item)) {
        seen.add(item);
        out.push(item);
      }
    });
    return out;
  }

  function mergeSaveData(localData, cloudData, user) {
    if (!cloudData || !cloudData.profile) {
      return localData;
    }
    if (isFreshLocalSave(localData)) {
      return cloudData;
    }

    const lp = localData.profile || {};
    const cp = cloudData.profile || {};
    const preferCloudMeta = (cp.matches || 0) > (lp.matches || 0) || (cp.wins || 0) > (lp.wins || 0);
    const chosenName =
      lp.name && lp.name !== "Player_123"
        ? lp.name
        : cp.name && cp.name !== "Player_123"
          ? cp.name
          : (user && user.displayName ? user.displayName.slice(0, 14) : "Player_123");

    const mergedProfile = {
      ...(preferCloudMeta ? cp : lp),
      name: chosenName,
      avatar: lp.avatar && lp.avatar !== "🤴" ? lp.avatar : (cp.avatar || "🤴"),
      photo: lp.photo || cp.photo || "",
      coins: Math.max(Number(lp.coins) || 0, Number(cp.coins) || 0),
      gems: Math.max(Number(lp.gems) || 0, Number(cp.gems) || 0),
      spinTickets: Math.max(Number(lp.spinTickets) || 0, Number(cp.spinTickets) || 0),
      matches: Math.max(Number(lp.matches) || 0, Number(cp.matches) || 0),
      wins: Math.max(Number(lp.wins) || 0, Number(cp.wins) || 0),
      cupsWon: Math.max(Number(lp.cupsWon) || 0, Number(cp.cupsWon) || 0),
      streakDay: Math.max(Number(lp.streakDay) || 0, Number(cp.streakDay) || 0),
      lastRewardDate: (lp.lastRewardDate || "") >= (cp.lastRewardDate || "") ? (lp.lastRewardDate || "") : (cp.lastRewardDate || ""),
      lastSpinDate: (lp.lastSpinDate || "") >= (cp.lastSpinDate || "") ? (lp.lastSpinDate || "") : (cp.lastSpinDate || "")
    };

    const li = localData.inventory || {};
    const ci = cloudData.inventory || {};
    const mergedInventory = {
      themes: unionArrays(ci.themes, li.themes),
      dice: unionArrays(ci.dice, li.dice),
      frames: unionArrays(ci.frames, li.frames),
      emojis: unionArrays(ci.emojis, li.emojis),
      bundlesClaimed: unionArrays(ci.bundlesClaimed, li.bundlesClaimed)
    };

    const lm = localData.missions || {};
    const cm = cloudData.missions || {};
    const ll = lm.lifetime || {};
    const cl = cm.lifetime || {};
    const mergedLifetime = {
      roll6: Math.max(Number(ll.roll6) || 0, Number(cl.roll6) || 0),
      capture: Math.max(Number(ll.capture) || 0, Number(cl.capture) || 0),
      home: Math.max(Number(ll.home) || 0, Number(cl.home) || 0),
      win: Math.max(Number(ll.win) || 0, Number(cl.win) || 0),
      cup: Math.max(Number(ll.cup) || 0, Number(cl.cup) || 0)
    };

    const newerMissions = (lm.date || "") >= (cm.date || "") ? lm : cm;
    const mergedMissions = {
      date: newerMissions.date || "",
      dailyProgress: newerMissions.dailyProgress || { roll6: 0, capture: 0, home: 0, win: 0, cup: 0 },
      dailyClaimed: unionArrays(
        (lm.date === newerMissions.date) ? lm.dailyClaimed : [],
        (cm.date === newerMissions.date) ? cm.dailyClaimed : []
      ),
      lifetime: mergedLifetime,
      achievementsClaimed: unionArrays(cm.achievementsClaimed, lm.achievementsClaimed)
    };

    const mergedHistory = [];
    const seenHist = new Set();
    [...(Array.isArray(localData.history) ? localData.history : []), ...(Array.isArray(cloudData.history) ? cloudData.history : [])]
      .sort((a, b) => (b && b.ts ? b.ts : 0) - (a && a.ts ? a.ts : 0))
      .forEach((h) => {
        if (!h) return;
        const key = `${h.ts || 0}_${h.mode || ""}_${h.place || 0}`;
        if (!seenHist.has(key) && mergedHistory.length < 10) {
          seenHist.add(key);
          mergedHistory.push(h);
        }
      });

    return {
      profile: mergedProfile,
      settings: preferCloudMeta ? { ...(localData.settings || {}), ...(cloudData.settings || {}) } : { ...(cloudData.settings || {}), ...(localData.settings || {}) },
      inventory: mergedInventory,
      cup: preferCloudMeta ? (cloudData.cup || localData.cup) : (localData.cup || cloudData.cup),
      history: mergedHistory,
      missions: mergedMissions
    };
  }

  function sanitizeForCloud(data) {
    const copy = JSON.parse(JSON.stringify(data || {}));
    if (copy.profile && typeof copy.profile.photo === "string" && copy.profile.photo.length > 35000) {
      copy.profile.photo = "";
    }
    return copy;
  }

  async function uploadToCloud(user, data) {
    if (!db || !user || !data) return false;
    const payload = {
      saveData: sanitizeForCloud(data),
      updatedAt: Date.now(),
      email: user.email || "",
      provider: (user.providerData && user.providerData[0] && user.providerData[0].providerId) || "password"
    };
    await db.ref(`users/${user.uid}`).set(payload);
    lastSyncedAt = payload.updatedAt;
    try { localStorage.setItem(LAST_SYNC_KEY, String(lastSyncedAt)); } catch {}
    renderCloudUI();
    return true;
  }

  async function syncOnSignIn(user, showFeedback = true) {
    if (!user || !window.LUDO_UI || typeof window.LUDO_UI.exportSaveData !== "function") return;
    if (isSyncing) return;
    isSyncing = true;
    setCloudBusy(true, "Syncing your Ludo Kingdom progress...");

    try {
      await ensureFirebaseAuth();
      const localData = window.LUDO_UI.exportSaveData();
      const snap = await db.ref(`users/${user.uid}/saveData`).once("value");
      const cloudRaw = snap.exists() ? snap.val() : null;

      if (cloudRaw && typeof cloudRaw === "object") {
        const merged = mergeSaveData(localData, cloudRaw, user);
        isApplyingCloud = true;
        try {
          window.LUDO_UI.importCloudData(merged);
        } finally {
          isApplyingCloud = false;
        }
        await uploadToCloud(user, window.LUDO_UI.exportSaveData());
        if (showFeedback) showToast("Cloud progress restored & synced! ☁️");
      } else {
        // First time linking this account: adopt Google display name if still default
        if (user.displayName && localData.profile && localData.profile.name === "Player_123") {
          localData.profile.name = user.displayName.slice(0, 14);
          isApplyingCloud = true;
          try {
            window.LUDO_UI.importCloudData(localData);
          } finally {
            isApplyingCloud = false;
          }
        }
        await uploadToCloud(user, window.LUDO_UI.exportSaveData());
        if (showFeedback) showToast("Progress backed up to Cloud! ☁️");
      }
    } catch (err) {
      if (showFeedback) {
        showToast(friendlyAuthError(err));
      }
    } finally {
      isSyncing = false;
      setCloudBusy(false, "");
      renderCloudUI();
    }
  }

  function scheduleCloudSync(immediate = false) {
    if (isApplyingCloud || !currentUser) return;
    if (syncDebounceTimer) {
      clearTimeout(syncDebounceTimer);
      syncDebounceTimer = null;
    }
    const run = async () => {
      if (!currentUser || isApplyingCloud || !window.LUDO_UI || typeof window.LUDO_UI.exportSaveData !== "function") return;
      try {
        await ensureFirebaseAuth();
        await uploadToCloud(currentUser, window.LUDO_UI.exportSaveData());
      } catch {}
    };
    if (immediate) run();
    else syncDebounceTimer = setTimeout(run, 1800);
  }

  function friendlyAuthError(err) {
    const code = (err && err.code) || "";
    const msg = (err && err.message) || "";
    if (msg === "OFFLINE") return "No internet connection. Turn on Wi-Fi or mobile data.";
    if (code === "auth/invalid-email") return "Please enter a valid email address.";
    if (code === "auth/user-not-found" || code === "auth/invalid-credential" || code === "auth/wrong-password") {
      return "Incorrect email or password.";
    }
    if (code === "auth/email-already-in-use") return "An account already exists with this email. Tap Sign In.";
    if (code === "auth/weak-password") return "Password must be at least 6 characters.";
    if (code === "auth/popup-closed-by-user" || msg.toLowerCase().includes("cancel")) {
      return "Sign-in cancelled.";
    }
    if (code === "auth/network-request-failed") return "Network error. Check your internet and try again.";
    return msg ? msg.slice(0, 90) : "Cloud sign-in failed. Please try again.";
  }

  // ==================== GOOGLE SIGN-IN (NATIVE CAPACITOR 7 + WEB) ====================
  async function signInWithGoogle() {
    setCloudBusy(true, "Connecting to Google...");
    try {
      const { auth: fbAuth } = await ensureFirebaseAuth();
      const capPlugin = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.FirebaseAuthentication;

      if (capPlugin && typeof capPlugin.signInWithGoogle === "function") {
        const res = await capPlugin.signInWithGoogle();
        const idToken = res && res.credential && res.credential.idToken;
        if (!idToken) {
          throw new Error("Could not retrieve Google sign-in token.");
        }
        const credential = window.firebase.auth.GoogleAuthProvider.credential(idToken);
        const userCred = await fbAuth.signInWithCredential(credential);
        currentUser = userCred.user;
        await syncOnSignIn(currentUser, true);
      } else {
        const provider = new window.firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        const userCred = await fbAuth.signInWithPopup(provider);
        currentUser = userCred.user;
        await syncOnSignIn(currentUser, true);
      }
      renderCloudUI();
    } catch (err) {
      showToast(friendlyAuthError(err));
    } finally {
      setCloudBusy(false, "");
    }
  }

  // ==================== EMAIL & PASSWORD AUTH ====================
  async function handleEmailSubmit(e) {
    if (e) e.preventDefault();
    const emailEl = document.getElementById("input-cloud-email");
    const passEl = document.getElementById("input-cloud-password");
    const email = (emailEl ? emailEl.value : "").trim();
    const password = passEl ? passEl.value : "";

    if (!email || !email.includes("@")) {
      showToast("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      showToast("Password must be at least 6 characters.");
      return;
    }

    setCloudBusy(true, authTab === "signup" ? "Creating cloud account..." : "Signing in...");
    try {
      const { auth: fbAuth } = await ensureFirebaseAuth();
      let userCred;
      if (authTab === "signup") {
        userCred = await fbAuth.createUserWithEmailAndPassword(email, password);
      } else {
        userCred = await fbAuth.signInWithEmailAndPassword(email, password);
      }
      currentUser = userCred.user;
      if (passEl) passEl.value = "";
      await syncOnSignIn(currentUser, true);
      renderCloudUI();
    } catch (err) {
      showToast(friendlyAuthError(err));
    } finally {
      setCloudBusy(false, "");
    }
  }

  async function handlePasswordReset() {
    const emailEl = document.getElementById("input-cloud-email");
    const email = (emailEl ? emailEl.value : "").trim();
    if (!email || !email.includes("@")) {
      showToast("Type your email above first, then tap Forgot Password.");
      return;
    }
    setCloudBusy(true, "Sending password reset email...");
    try {
      const { auth: fbAuth } = await ensureFirebaseAuth();
      await fbAuth.sendPasswordResetEmail(email);
      showToast("Password reset link sent to your email!");
    } catch (err) {
      showToast(friendlyAuthError(err));
    } finally {
      setCloudBusy(false, "");
    }
  }

  async function handleManualSync() {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    await syncOnSignIn(currentUser, true);
  }

  async function handleSignOut() {
    setCloudBusy(true, "Signing out...");
    try {
      const capPlugin = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.FirebaseAuthentication;
      if (capPlugin && typeof capPlugin.signOut === "function") {
        await capPlugin.signOut().catch(() => {});
      }
      if (auth) await auth.signOut();
      currentUser = null;
      showToast("Signed out. Playing as Guest (local progress kept).");
      renderCloudUI();
    } catch {
      showToast("Could not sign out right now.");
    } finally {
      setCloudBusy(false, "");
    }
  }

  // ==================== UI RENDERING ====================
  function formatSyncTime(ts) {
    if (!ts) return "Not synced yet";
    const diffSec = Math.floor((Date.now() - ts) / 1000);
    if (diffSec < 60) return "Synced just now";
    if (diffSec < 3600) return `Synced ${Math.floor(diffSec / 60)}m ago`;
    const d = new Date(ts);
    return `Synced ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  function setCloudBusy(busy, msg = "") {
    const statusEl = document.getElementById("cloud-auth-status");
    if (statusEl) {
      statusEl.textContent = msg;
      statusEl.classList.toggle("hidden", !msg);
    }
    ["btn-cloud-google", "btn-cloud-email-submit", "btn-cloud-sync-now", "btn-cloud-signout"].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) btn.disabled = busy;
    });
  }

  function renderCloudUI() {
    const signedIn = Boolean(currentUser);
    const label = signedIn
      ? (currentUser.email || currentUser.displayName || "Cloud Account")
      : "Guest Mode (Device Only)";
    const syncSub = signedIn ? formatSyncTime(lastSyncedAt) : "Sign in to back up coins, themes & rank";

    // Profile modal card
    const profBadge = document.getElementById("profile-cloud-status");
    const profBtn = document.getElementById("btn-open-cloud-auth");
    if (profBadge) {
      profBadge.textContent = signedIn ? `☁️ ${label}` : "☁️ Guest • Not Backed Up";
      profBadge.classList.toggle("synced", signedIn);
    }
    if (profBtn) {
      profBtn.textContent = signedIn ? "Manage" : "Sign In";
    }

    // Settings modal row
    const setDesc = document.getElementById("settings-cloud-desc");
    const setBtn = document.getElementById("btn-settings-cloud");
    if (setDesc) setDesc.textContent = signedIn ? `${label} • ${syncSub}` : syncSub;
    if (setBtn) setBtn.textContent = signedIn ? "Synced ✓" : "Sign In";

    // Cloud Auth Modal views
    const guestPane = document.getElementById("cloud-view-guest");
    const signedPane = document.getElementById("cloud-view-signed");
    if (guestPane) guestPane.classList.toggle("hidden", signedIn);
    if (signedPane) signedPane.classList.toggle("hidden", !signedIn);

    const accEmail = document.getElementById("cloud-account-email");
    const accProvider = document.getElementById("cloud-account-provider");
    const accLastSync = document.getElementById("cloud-last-sync");
    if (signedIn) {
      const provId = (currentUser.providerData && currentUser.providerData[0] && currentUser.providerData[0].providerId) || "password";
      if (accEmail) accEmail.textContent = currentUser.email || currentUser.displayName || "Ludo Kingdom Player";
      if (accProvider) accProvider.textContent = provId === "google.com" ? "Signed in with Google" : "Signed in with Email & Password";
      if (accLastSync) accLastSync.textContent = formatSyncTime(lastSyncedAt);
    }

    // Auth mode tabs
    document.querySelectorAll("#cloud-auth-tabs .shop-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.ctab === authTab);
    });
    const submitBtn = document.getElementById("btn-cloud-email-submit");
    const forgotBtn = document.getElementById("btn-cloud-forgot");
    if (submitBtn) submitBtn.textContent = authTab === "signup" ? "Create Cloud Account" : "Sign In with Email";
    if (forgotBtn) forgotBtn.classList.toggle("hidden", authTab !== "signin");
  }

  function openAuthModal() {
    setCloudBusy(false, "");
    renderCloudUI();
    ensureFirebaseAuth().catch(() => {});
    if (window.LUDO_UI && typeof window.LUDO_UI.openModal === "function") {
      window.LUDO_UI.openModal("modal-cloud-auth");
    }
  }

  function bindCloudUI() {
    document.querySelectorAll("#cloud-auth-tabs .shop-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        authTab = btn.dataset.ctab === "signup" ? "signup" : "signin";
        renderCloudUI();
      });
    });

    const gBtn = document.getElementById("btn-cloud-google");
    if (gBtn) gBtn.addEventListener("click", signInWithGoogle);

    const form = document.getElementById("cloud-email-form");
    if (form) form.addEventListener("submit", handleEmailSubmit);

    const forgotBtn = document.getElementById("btn-cloud-forgot");
    if (forgotBtn) forgotBtn.addEventListener("click", handlePasswordReset);

    const syncBtn = document.getElementById("btn-cloud-sync-now");
    if (syncBtn) syncBtn.addEventListener("click", handleManualSync);

    const signOutBtn = document.getElementById("btn-cloud-signout");
    if (signOutBtn) signOutBtn.addEventListener("click", handleSignOut);

    const openFromProf = document.getElementById("btn-open-cloud-auth");
    if (openFromProf) openFromProf.addEventListener("click", openAuthModal);

    const openFromSettings = document.getElementById("btn-settings-cloud");
    if (openFromSettings) openFromSettings.addEventListener("click", openAuthModal);

    renderCloudUI();

    // Silently restore existing Firebase session in background if online
    if (typeof navigator === "undefined" || navigator.onLine !== false) {
      setTimeout(() => {
        ensureFirebaseAuth().catch(() => {});
      }, 1500);
    }
  }

  document.addEventListener("DOMContentLoaded", bindCloudUI);

  return {
    openAuthModal,
    scheduleCloudSync,
    syncNow: handleManualSync,
    ensureFirebaseAuth,
    getAuthState: () => ({
      signedIn: Boolean(currentUser),
      uid: currentUser ? currentUser.uid : null,
      email: currentUser ? currentUser.email : ""
    })
  };
})();
