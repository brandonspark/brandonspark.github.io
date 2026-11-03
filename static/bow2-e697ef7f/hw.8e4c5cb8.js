// Performer homework page: every tick and note autosaves to Firebase (Firestore).
// Progress is cached on this device. On load the page keeps whichever copy is newest: this device's,
// Firebase's, or (during the move off Google Sheets) the old sheet's, and pushes it to Firebase if needed.
(function () {
  var cfg = JSON.parse(document.getElementById("hw-data").textContent);
  var db = window.BOWFS(cfg.fs);
  var STORE = "bow2hw:" + cfg.performer;
  var boxes = Array.prototype.slice.call(document.querySelectorAll("input.hw-item"));
  var note = document.getElementById("hw-note");
  var saveEls = Array.prototype.slice.call(document.querySelectorAll(".hw-save"));

  // checked/note: what's on screen. editedAt: device time of the latest edit; it orders saves
  // (Firebase refuses anything older than what it has). dirty: not yet confirmed saved.
  var state = { checked: [], note: "", dirty: false, editedAt: 0, savedAt: null };
  var timer = null, inFlight = false, failures = 0, failed = false, refused = false;

  try {
    var saved = JSON.parse(localStorage.getItem(STORE) || "null");
    if (saved) {
      if ("sentSig" in saved) { // page version with a Submit button
        saved.dirty = saved.sentSig !== JSON.stringify([saved.checked || [], (saved.note || "").trim()]) &&
                      ((saved.checked || []).length > 0 || !!(saved.note || "").trim());
        saved.savedAt = saved.sentAt || null;
        saved.editedAt = saved.editedAt || Date.now();
      }
      state = Object.assign(state, saved);
      if (typeof state.savedAt === "string") state.savedAt = Date.parse(state.savedAt) || null; // older pages stored an ISO time
    }
  } catch (e) {}

  function apply() {
    boxes.forEach(function (b) { b.checked = state.checked.indexOf(b.dataset.id) >= 0; });
    note.value = state.note || "";
  }
  function checkedIds() { return boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.dataset.id; }); }
  function hasContent() { return state.checked.length > 0 || !!(state.note || "").trim(); }
  function store() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }
  function fmt(ms) {
    return new Date(ms).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }
  function body() { return db.saveBody(cfg.performer, cfg.name, checkedIds(), note.value.trim(), state.editedAt, "site"); }

  function render() {
    var done = checkedIds().length, total = boxes.length;
    document.getElementById("hw-count").textContent = done + " of " + total + " done";
    document.getElementById("hw-bar").style.width = (total ? (100 * done / total) : 0) + "%";
    document.querySelectorAll("article.song").forEach(function (a) {
      var bs = a.querySelectorAll("input.hw-item");
      a.classList.toggle("all-done", bs.length > 0 && Array.prototype.every.call(bs, function (b) { return b.checked; }));
    });
    var text = "", cls = "";
    if (state.dirty && refused) { text = "Couldn't save. Tell Brandon"; cls = "err"; }
    else if (state.dirty && failed) { text = "Not saved yet, retrying…"; cls = "err"; }
    else if (state.dirty) { text = "Saving…"; }
    else if (state.savedAt) { text = "✓ Saved"; cls = "ok"; }
    saveEls.forEach(function (el) {
      el.textContent = el.dataset.long && state.savedAt && !state.dirty ? "✓ All saved, last change " + fmt(state.savedAt) : text;
      el.className = "hw-save" + (cls ? " " + cls : "");
    });
  }

  // Take a newer copy (from Firebase or the old sheet) and show it.
  function adopt(checked, noteText, ts) {
    state.checked = checked || [];
    state.note = noteText || "";
    state.editedAt = ts;
    state.savedAt = ts;
    state.dirty = false;
    store(); apply(); render();
  }

  function changed() {
    state.checked = checkedIds();
    state.note = note.value;
    state.dirty = true;
    state.editedAt = Math.max(Date.now(), state.editedAt + 1);
    refused = false;
    store(); render();
    schedule(1200);
  }

  function schedule(ms) {
    clearTimeout(timer);
    timer = setTimeout(flush, ms);
  }

  function flush() {
    if (!state.dirty || refused) return;
    if (inFlight) { schedule(500); return; }
    inFlight = true;
    var sentEdit = state.editedAt;
    db.commit(body()).then(function (status) {
      if (status === 200) {
        failures = 0; failed = false;
        state.savedAt = sentEdit;
        if (state.editedAt === sentEdit) state.dirty = false; // nothing changed while it was sending
        store();
        return;
      }
      if (status === 403) {
        // Refused: usually another device saved something newer. Check, and show that if so.
        return db.get("progress/" + cfg.performer).then(function (p) {
          if (p && p.clientTs >= state.editedAt) {
            return db.get("notes/" + cfg.performer).then(function (n) { adopt(p.checked, n && n.note, p.clientTs); });
          }
          refused = true; // not a newer copy, so the save itself is bad; don't retry in a loop
        });
      }
      throw new Error("HTTP " + status);
    }).catch(function () {
      failures++; failed = true;
      schedule(Math.min(60000, 3000 * failures));
    }).then(function () {
      inFlight = false;
      render();
      if (state.dirty && !failed && !refused) schedule(300);
    });
  }

  // Leaving the page with unsaved changes: hand them to the browser to deliver.
  var beaconed = 0;
  function beacon() {
    if (state.dirty && !refused && beaconed !== state.editedAt) {
      beaconed = state.editedAt; // visibilitychange and pagehide both fire on close; send once
      db.beacon(body());
    }
  }
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") beacon(); });
  window.addEventListener("pagehide", beacon);

  boxes.forEach(function (b) { b.addEventListener("change", changed); });
  note.addEventListener("input", changed);
  note.addEventListener("blur", function () { if (state.dirty) schedule(0); });

  apply();
  render();

  // Reconcile with Firebase: newest copy wins.
  var fbTs = 0;
  Promise.all([db.get("progress/" + cfg.performer), db.get("notes/" + cfg.performer)]).then(function (r) {
    var p = r[0], n = r[1];
    fbTs = Math.max(p ? p.clientTs : 0, n ? n.clientTs : 0);
    if (state.dirty && state.editedAt > fbTs) { schedule(0); return; } // unsaved edits here are newest: send them
    if (fbTs > state.editedAt) adopt(p ? p.checked : [], n ? n.note : "", fbTs);
    else if (fbTs === state.editedAt && fbTs) { state.dirty = false; state.savedAt = fbTs; store(); render(); }
    else if (hasContent() || fbTs > 0) { state.dirty = true; store(); render(); schedule(0); } // this device is newer
  }).catch(function () {
    if (state.dirty) schedule(2000);
  }).then(function () {
    // Temporary, while pages move off the Google Sheet: an old copy of this page might have saved
    // newer ticks there. If so, bring them over. (Removed once the sheet is retired.)
    if (!cfg.legacy) return;
    return fetch(cfg.legacy + "?performer=" + encodeURIComponent(cfg.performer)).then(function (r) { return r.json(); }).then(function (res) {
      var row = res && res.ok && res.row;
      var ts = row && Number(row.clientTs) || 0;
      if (row && ts > Math.max(state.editedAt, fbTs)) {
        adopt(row.checked, row.note, ts);
        state.dirty = true; store(); render(); schedule(0);
      }
    }).catch(function () {});
  });
})();
