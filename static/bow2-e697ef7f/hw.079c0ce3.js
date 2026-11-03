// Performer homework page: ticks and notes autosave to Firebase (Firestore).
//
// Safe with several devices and slow connections. Each device keeps
//   base:     the last copy it read from or wrote to Firebase (with that copy's version), and
//   touched:  only the boxes changed on this device and not yet saved (noteEdit for the note).
// What's shown and saved is base + touched. A save only goes through if Firebase still has the
// version this device read; if someone saved in between, the page re-reads and re-applies just its
// own changes, so nobody's ticks get overwritten by a stale copy.
(function () {
  var cfg = JSON.parse(document.getElementById("hw-data").textContent);
  var db = window.BOWFS(cfg.fs);
  var STORE = "bow2hw:" + cfg.performer;
  var boxes = Array.prototype.slice.call(document.querySelectorAll("input.hw-item"));
  var pageIds = boxes.map(function (b) { return b.dataset.id; });
  var onPage = {};
  pageIds.forEach(function (id) { onPage[id] = true; });
  var note = document.getElementById("hw-note");
  var saveEls = Array.prototype.slice.call(document.querySelectorAll(".hw-save"));

  var S = { v: 2, base: null, touched: {}, noteEdit: null, savedAt: null };
  var older = null; // progress saved by an older version of this page, merged once Firebase loads
  var loaded = false, timer = null, inFlight = false, failures = 0, failed = false, refused = false, conflicts = 0;

  try {
    var saved = JSON.parse(localStorage.getItem(STORE) || "null");
    if (saved && saved.v === 2) S = Object.assign(S, saved);
    else if (saved) older = { checked: saved.checked || [], note: saved.note || "",
                              ts: saved.editedAt || (saved.sentAt ? Date.parse(saved.sentAt) : 0) || 0 };
  } catch (e) {}

  function store() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} }
  function isDirty() { return Object.keys(S.touched).length > 0 || S.noteEdit !== null; }
  function setOf(list) { var o = {}; (list || []).forEach(function (id) { o[id] = true; }); return o; }

  // base + this device's changes. Ticks for items not on this page (e.g. from a newer page) are kept.
  function view() {
    var src = S.base ? S.base.checked : older ? older.checked : [];
    var has = setOf(src);
    Object.keys(S.touched).forEach(function (id) { if (S.touched[id]) has[id] = true; else delete has[id]; });
    var checked = pageIds.filter(function (id) { return has[id]; })
      .concat(src.filter(function (id) { return !onPage[id] && has[id]; }));
    var text = S.noteEdit !== null ? S.noteEdit : S.base ? S.base.note : older ? older.note : "";
    return { checked: checked, note: text };
  }
  // Forget local changes Firebase already has.
  function prune() {
    if (!S.base) return;
    var has = setOf(S.base.checked);
    Object.keys(S.touched).forEach(function (id) { if (!!has[id] === S.touched[id]) delete S.touched[id]; });
    if (S.noteEdit !== null && S.noteEdit.trim() === (S.base.note || "").trim()) S.noteEdit = null;
  }

  function apply() {
    var v = view(), has = setOf(v.checked);
    boxes.forEach(function (b) { b.checked = !!has[b.dataset.id]; });
    if (document.activeElement !== note) note.value = v.note;
  }
  function fmt(ms) {
    return new Date(ms).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }
  function render() {
    var done = boxes.filter(function (b) { return b.checked; }).length, total = boxes.length;
    document.getElementById("hw-count").textContent = done + " of " + total + " done";
    document.getElementById("hw-bar").style.width = (total ? (100 * done / total) : 0) + "%";
    document.querySelectorAll("article.song").forEach(function (a) {
      var bs = a.querySelectorAll("input.hw-item");
      a.classList.toggle("all-done", bs.length > 0 && Array.prototype.every.call(bs, function (b) { return b.checked; }));
    });
    var dirty = isDirty(), text = "", cls = "";
    if (dirty && refused) { text = "Couldn't save. Tell Brandon"; cls = "err"; }
    else if (dirty && failed) { text = "Not saved yet, retrying…"; cls = "err"; }
    else if (dirty) { text = "Saving…"; }
    else if (S.savedAt) { text = "✓ Saved"; cls = "ok"; }
    saveEls.forEach(function (el) {
      el.textContent = el.dataset.long && S.savedAt && !dirty ? "✓ All saved, last change " + fmt(S.savedAt) : text;
      el.className = "hw-save" + (cls ? " " + cls : "");
    });
  }

  // Read the latest copy (and its version) from Firebase.
  function loadBase() {
    return Promise.all([db.get("progress/" + cfg.performer), db.get("notes/" + cfg.performer)]).then(function (r) {
      var p = r[0], n = r[1];
      S.base = { checked: p ? p.checked || [] : [], note: n ? n.note || "" : "",
                 clientTs: Math.max(p ? p.clientTs || 0 : 0, n ? n.clientTs || 0 : 0),
                 pv: p ? p._updateTime : null, nv: n ? n._updateTime : null };
      loaded = true;
      prune();
      if (!isDirty() && S.base.clientTs) S.savedAt = S.base.clientTs;
    });
  }

  function schedule(ms) { clearTimeout(timer); timer = setTimeout(flush, ms); }

  function flush() {
    if (!isDirty() || refused) return;
    if (!loaded || inFlight) { schedule(500); return; }
    inFlight = true;
    var v = view(), sentTouched = JSON.parse(JSON.stringify(S.touched)), sentNote = S.noteEdit;
    var cts = Math.max(Date.now(), (S.base.clientTs || 0) + 1); // always newer than what we read
    var body = db.saveBody(cfg.performer, cfg.name, v.checked, v.note.trim(), cts, "site", { progress: S.base.pv, notes: S.base.nv });
    db.commit(body).then(function (r) {
      if (r.status === 200) {
        var wr = (r.body && r.body.writeResults) || [];
        S.base = { checked: v.checked, note: v.note.trim(), clientTs: cts,
                   pv: wr[0] && wr[0].updateTime, nv: wr[1] && wr[1].updateTime };
        Object.keys(sentTouched).forEach(function (id) { if (S.touched[id] === sentTouched[id]) delete S.touched[id]; });
        if (S.noteEdit === sentNote) S.noteEdit = null;
        prune();
        S.savedAt = cts; failures = 0; failed = false; conflicts = 0;
        store();
        return;
      }
      if (r.status === 400 || r.status === 409 || r.status === 403) {
        // Someone saved in between (or the rules refused): re-read, keep our own changes, try again.
        if (++conflicts > 4) { refused = true; return; }
        return loadBase().then(function () { store(); apply(); });
      }
      throw new Error("HTTP " + r.status);
    }).catch(function () {
      failures++; failed = true;
      schedule(Math.min(60000, 3000 * failures));
    }).then(function () {
      inFlight = false;
      render();
      if (isDirty() && !failed && !refused) schedule(300);
    });
  }

  function changedBox(e) {
    S.touched[e.target.dataset.id] = e.target.checked;
    refused = false; conflicts = 0;
    prune(); store(); render();
    schedule(1200);
  }
  function changedNote() {
    S.noteEdit = note.value;
    refused = false; conflicts = 0;
    prune(); store(); render();
    schedule(1500);
  }
  boxes.forEach(function (b) { b.addEventListener("change", changedBox); });
  note.addEventListener("input", changedNote);
  note.addEventListener("blur", function () { if (isDirty()) schedule(0); });

  // Leaving or hiding the page with unsaved changes: hand them to the browser to deliver. If that
  // copy was stale it's refused, and the changes stay here to be merged next time.
  var beaconed = null;
  function beacon() {
    if (!loaded || !isDirty() || refused) return;
    var v = view(), sig = JSON.stringify([v, S.base.pv]);
    if (beaconed === sig) return; // visibilitychange and pagehide both fire on close; send once
    beaconed = sig;
    db.beacon(db.saveBody(cfg.performer, cfg.name, v.checked, v.note.trim(), Math.max(Date.now(), (S.base.clientTs || 0) + 1),
                          "site", { progress: S.base.pv, notes: S.base.nv }));
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") { beacon(); return; }
    // Back on the page: pick up anything saved from another device meanwhile.
    if (!inFlight) loadBase().then(function () { store(); apply(); render(); if (isDirty()) schedule(0); }).catch(function () {});
  });
  window.addEventListener("pagehide", beacon);

  apply();
  render();

  function start(attempt) {
    loadBase().then(function () {
      if (older) {
        // An older version of this page saved progress here. If it's newer than Firebase's copy,
        // its differences are edits Firebase hasn't seen yet.
        if (older.ts > S.base.clientTs) {
          var has = setOf(S.base.checked), had = setOf(older.checked);
          pageIds.forEach(function (id) {
            if (!!had[id] !== !!has[id] && !(id in S.touched)) S.touched[id] = !!had[id];
          });
          if (S.noteEdit === null && (older.note || "").trim() !== (S.base.note || "").trim()) S.noteEdit = older.note;
          prune();
        }
        older = null;
      }
      store(); apply(); render();
      if (isDirty()) schedule(0);
      return legacy();
    }).catch(function () {
      setTimeout(function () { start(attempt + 1); }, Math.min(30000, 2000 * (attempt + 1)));
    });
  }

  // Temporary, while pages move off the Google Sheet: an old copy of this page might have saved
  // newer ticks there. Bring over any differences (removed once the sheet is retired).
  function legacy() {
    if (!cfg.legacy) return;
    return fetch(cfg.legacy + "?performer=" + encodeURIComponent(cfg.performer)).then(function (r) { return r.json(); }).then(function (res) {
      var row = res && res.ok && res.row;
      if (!row || !(Number(row.clientTs) > S.base.clientTs)) return;
      var has = setOf(S.base.checked), sheet = setOf(row.checked);
      pageIds.forEach(function (id) {
        if (!!sheet[id] !== !!has[id] && !(id in S.touched)) S.touched[id] = !!sheet[id];
      });
      if (S.noteEdit === null && (row.note || "").trim() !== (S.base.note || "").trim()) S.noteEdit = row.note || "";
      prune(); store(); apply(); render();
      if (isDirty()) schedule(0);
    }).catch(function () {});
  }

  start(0);
})();
