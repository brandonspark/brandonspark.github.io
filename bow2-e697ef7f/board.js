// Landing-page scoreboard: ranks everyone by share of homework ticked. Reads ticks only (no notes).
(function () {
  var cfg = JSON.parse(document.getElementById("sb-data").textContent);
  var list = document.getElementById("sb-list");
  var hero = document.getElementById("sb-hero");
  var heroSub = document.getElementById("sb-hero-sub");
  var rowsBySlug = {};
  Array.prototype.forEach.call(list.children, function (li) { rowsBySlug[li.dataset.slug] = li; });

  function ago(iso) {
    var s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 90) return "active just now";
    if (s < 3600) return "active " + Math.round(s / 60) + "m ago";
    if (s < 86400 * 1.5) return "active " + Math.round(s / 3600) + "h ago";
    return "active " + Math.round(s / 86400) + "d ago";
  }

  function render(rows) {
    var latest = {};
    rows.forEach(function (r) { if (!latest[r.performer] || r.ts > latest[r.performer].ts) latest[r.performer] = r; });
    var people = cfg.performers.map(function (p) {
      var sub = latest[p.slug], ticked = {}, done = 0;
      if (sub) sub.checked.forEach(function (id) { ticked[id] = true; });
      p.ids.forEach(function (id) { if (ticked[id]) done++; });
      return { p: p, done: done, total: p.ids.length, frac: p.ids.length ? done / p.ids.length : 0, ts: sub && done ? sub.ts : null };
    });
    // Highest share first; ties go to whoever has more ticked, then alphabetical.
    people.sort(function (a, b) { return (b.frac - a.frac) || (b.done - a.done) || a.p.name.localeCompare(b.p.name); });

    var rank = 0, prev = null, allDone = 0, allTotal = 0, started = 0;
    people.forEach(function (x, i) {
      allDone += x.done; allTotal += x.total; if (x.done) started++;
      if (prev === null || x.frac !== prev) rank = i + 1;
      prev = x.frac;
      var li = rowsBySlug[x.p.slug];
      var pct = Math.round(100 * x.frac);
      var rankText = !x.done ? "–" : rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : String(rank);
      li.querySelector(".sb-rank").textContent = rankText;
      li.querySelector(".sb-fill").style.width = pct + "%";
      li.querySelector(".sb-pct").textContent = pct + "%";
      li.querySelector(".sb-meta").textContent = x.done + " of " + x.total + " · " +
        (x.done === x.total && x.total ? "✓ Done" : x.ts ? ago(x.ts) : "not started");
      li.classList.toggle("done", x.done === x.total && x.total > 0);
      li.classList.toggle("idle", !x.done);
      li.querySelector("a").setAttribute("aria-label", x.p.name + ": " + pct + " percent, " + x.done + " of " + x.total + " ticked");
      li.title = x.p.name + ": " + x.done + " of " + x.total + " ticked" + (x.ts ? ", " + ago(x.ts) : "");
      list.appendChild(li); // re-order in place
    });
    hero.textContent = (allTotal ? Math.round(100 * allDone / allTotal) : 0) + "%";
    heroSub.textContent = "of the cast's homework is done · " + started + " of " + people.length + " have started";
  }

  // Show the last scores this device saw right away; the live ones replace them a moment later.
  var CACHE = "bow2hw:scores";
  try {
    var cached = JSON.parse(localStorage.getItem(CACHE) || "null");
    if (cached && cached.rows) render(cached.rows);
  } catch (e) {}

  function load() {
    if (!cfg.endpoint) return;
    fetch(cfg.endpoint + "?scores=1").then(function (r) { return r.json(); }).then(function (res) {
      if (!res || !res.ok) return;
      render(res.rows || []);
      try { localStorage.setItem(CACHE, JSON.stringify({ rows: res.rows || [], at: Date.now() })); } catch (e) {}
    }).catch(function () {});
  }
  load();
  setInterval(function () { if (document.visibilityState === "visible") load(); }, 60000);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") load(); });
})();
