// Performer homework page: saves ticks on this device and submits them to the Apps Script endpoint.
(function () {
  var cfg = JSON.parse(document.getElementById("hw-data").textContent);
  var STORE = "bow2hw:" + cfg.performer;
  var boxes = Array.prototype.slice.call(document.querySelectorAll("input.hw-item"));
  var note = document.getElementById("hw-note");
  var send = document.getElementById("hw-send");
  var status = document.getElementById("hw-status");
  var state = { checked: [], note: "", sentAt: null, sentSig: null };

  try {
    var saved = JSON.parse(localStorage.getItem(STORE) || "null");
    if (saved) state = Object.assign(state, saved);
  } catch (e) {}
  boxes.forEach(function (b) { b.checked = state.checked.indexOf(b.dataset.id) >= 0; });
  note.value = state.note || "";

  function checkedIds() { return boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.dataset.id; }); }
  function sig() { return JSON.stringify([checkedIds(), note.value.trim()]); }
  function save() {
    state.checked = checkedIds();
    state.note = note.value;
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
  }
  function fmt(iso) {
    var d = new Date(iso);
    return d.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }
  function setStatus(text, cls) { status.textContent = text; status.className = "status" + (cls ? " " + cls : ""); }

  function render() {
    var done = checkedIds().length, total = boxes.length;
    document.getElementById("hw-count").textContent = done + " of " + total + " done";
    document.getElementById("hw-bar").style.width = (total ? (100 * done / total) : 0) + "%";
    document.querySelectorAll("article.song").forEach(function (a) {
      var bs = a.querySelectorAll("input.hw-item");
      var all = bs.length > 0 && Array.prototype.every.call(bs, function (b) { return b.checked; });
      a.classList.toggle("all-done", all);
    });
    if (!cfg.endpoint) {
      send.disabled = true;
      setStatus("Submitting isn't switched on yet. Your ticks are still saved on this device.", "");
    } else if (state.sentAt && state.sentSig === sig()) {
      setStatus("✓ Submitted " + fmt(state.sentAt) + " (" + done + " of " + total + "). Thank you!", "ok");
      send.textContent = "Submit again";
    } else if (state.sentAt) {
      setStatus("You've changed things since you last submitted (" + fmt(state.sentAt) + "). Submit again to update.", "");
      send.textContent = "Submit my update";
    } else {
      setStatus("", "");
    }
  }

  boxes.forEach(function (b) { b.addEventListener("change", function () { save(); render(); }); });
  note.addEventListener("input", function () { save(); render(); });

  send.addEventListener("click", function () {
    if (!cfg.endpoint) return;
    var checked = checkedIds();
    var unchecked = boxes.filter(function (b) { return !b.checked; }).map(function (b) { return b.dataset.id; });
    if (unchecked.length && !note.value.trim() &&
        !confirm(unchecked.length + " item" + (unchecked.length === 1 ? " is" : "s are") +
                 " still unticked. Submit anyway? (You can add a note about what you need help with.)")) return;
    var mySig = sig();
    send.disabled = true;
    setStatus("Sending…", "");
    fetch(cfg.endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // text/plain avoids a CORS preflight Apps Script can't answer
      body: JSON.stringify({ performer: cfg.performer, name: cfg.name, checked: checked, unchecked: unchecked, note: note.value.trim() })
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (!res || !res.ok) throw new Error((res && res.error) || "rejected");
      state.sentAt = res.ts || new Date().toISOString();
      state.sentSig = mySig;
      save();
      render();
    }).catch(function (err) {
      setStatus("Couldn't send (" + err.message + "). Your ticks are saved here, so try again in a minute, or screenshot this page and send it to Brandon.", "err");
    }).then(function () { send.disabled = !cfg.endpoint; });
  });

  render();
})();
