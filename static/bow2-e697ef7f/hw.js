// Performer homework page: every tick and note autosaves to the Apps Script endpoint.
// Progress is cached on this device and loaded back from the server on any device.
(function () {
  var cfg = JSON.parse(document.getElementById("hw-data").textContent);
  var STORE = "bow2hw:" + cfg.performer;
  var boxes = Array.prototype.slice.call(document.querySelectorAll("input.hw-item"));
  var note = document.getElementById("hw-note");
  var saveEls = Array.prototype.slice.call(document.querySelectorAll(".hw-save"));

  // checked/note: what's on screen. dirty: changed since the server last confirmed a save.
  // editedAt: client time of the latest edit, so the server can ignore out-of-order saves.
  var state = { checked: [], note: "", dirty: false, editedAt: 0, savedAt: null };
  var timer = null, inFlight = false, failures = 0, failed = false;

  try {
    var saved = JSON.parse(localStorage.getItem(STORE) || "null");
    if (saved) {
      if ("sentSig" in saved) { // page version with a Submit button
        saved.dirty = saved.sentSig !== JSON.stringify([saved.checked || [], (saved.note || "").trim()]) &&
                      ((saved.checked || []).length > 0 || !!(saved.note || "").trim());
        saved.savedAt = saved.sentAt || null;
        saved.editedAt = Date.now();
      }
      state = Object.assign(state, saved);
    }
  } catch (e) {}

  function apply() {
    boxes.forEach(function (b) { b.checked = state.checked.indexOf(b.dataset.id) >= 0; });
    note.value = state.note || "";
  }
  function checkedIds() { return boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.dataset.id; }); }
  function store() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }
  function fmt(iso) {
    return new Date(iso).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }
  function payload() {
    return JSON.stringify({
      performer: cfg.performer, name: cfg.name, clientTs: state.editedAt,
      checked: checkedIds(), unchecked: boxes.filter(function (b) { return !b.checked; }).map(function (b) { return b.dataset.id; }),
      note: note.value.trim()
    });
  }

  function render() {
    var done = checkedIds().length, total = boxes.length;
    document.getElementById("hw-count").textContent = done + " of " + total + " done";
    document.getElementById("hw-bar").style.width = (total ? (100 * done / total) : 0) + "%";
    document.querySelectorAll("article.song").forEach(function (a) {
      var bs = a.querySelectorAll("input.hw-item");
      a.classList.toggle("all-done", bs.length > 0 && Array.prototype.every.call(bs, function (b) { return b.checked; }));
    });
    var text, cls = "";
    if (!cfg.endpoint) { text = "Saving is off; ticks stay on this device"; }
    else if (state.dirty && failed) { text = "Not saved yet, retrying…"; cls = "err"; }
    else if (state.dirty) { text = "Saving…"; }
    else if (state.savedAt) { text = "✓ Saved"; cls = "ok"; }
    else { text = "Ticks save automatically"; }
    saveEls.forEach(function (el) {
      el.textContent = el.dataset.long && state.savedAt && !state.dirty ? "✓ All saved, last change " + fmt(state.savedAt) : text;
      el.className = "hw-save" + (cls ? " " + cls : "");
    });
  }

  function changed() {
    state.checked = checkedIds();
    state.note = note.value;
    state.dirty = true;
    state.editedAt = Date.now();
    store();
    render();
    schedule(1200);
  }

  function schedule(ms) {
    if (!cfg.endpoint) return;
    clearTimeout(timer);
    timer = setTimeout(flush, ms);
  }

  function flush() {
    if (!cfg.endpoint || !state.dirty) return;
    if (inFlight) { schedule(500); return; }
    inFlight = true;
    var sentEdit = state.editedAt;
    fetch(cfg.endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // text/plain avoids a CORS preflight Apps Script can't answer
      body: payload()
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (!res || !res.ok) throw new Error((res && res.error) || "rejected");
      failures = 0; failed = false;
      if (res.stale) { // another device saved something newer; show that instead
        state.dirty = false; state.savedAt = null; store(); loadServer(); return;
      }
      state.savedAt = res.ts || new Date().toISOString();
      if (state.editedAt === sentEdit) state.dirty = false; // nothing changed while it was sending
      store();
    }).catch(function () {
      failures++; failed = true;
      schedule(Math.min(60000, 4000 * failures));
    }).then(function () {
      inFlight = false;
      render();
      if (state.dirty && !failed) schedule(300);
    });
  }

  // Leaving the page with unsaved changes: hand them to the browser to deliver.
  var beaconed = 0;
  function beacon() {
    if (cfg.endpoint && state.dirty && navigator.sendBeacon && beaconed !== state.editedAt) {
      beaconed = state.editedAt; // visibilitychange and pagehide both fire on close; send once
      navigator.sendBeacon(cfg.endpoint, new Blob([payload()], { type: "text/plain;charset=utf-8" }));
    }
  }
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") beacon(); });
  window.addEventListener("pagehide", beacon);

  boxes.forEach(function (b) { b.addEventListener("change", changed); });
  note.addEventListener("input", changed);
  note.addEventListener("blur", function () { if (state.dirty) schedule(0); });

  apply();
  render();

  // Pick up progress saved from another device, unless this one has unsaved edits.
  function loadServer() {
    if (!cfg.endpoint) return;
    fetch(cfg.endpoint + "?performer=" + encodeURIComponent(cfg.performer)).then(function (r) { return r.json(); }).then(function (res) {
      var row = res && res.ok && res.row;
      if (row && !state.dirty && (!state.savedAt || row.ts > state.savedAt)) {
        state.checked = row.checked;
        state.note = row.note || "";
        state.savedAt = row.ts;
        state.editedAt = Math.max(state.editedAt, row.clientTs || 0);
        store();
        apply();
        render();
      }
    }).catch(function () {}).then(function () { if (state.dirty) schedule(0); });
  }
  loadServer();
})();
