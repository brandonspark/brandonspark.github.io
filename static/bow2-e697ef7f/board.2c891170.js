// Landing-page scoreboard: ranks everyone by share of homework ticked. Reads ticks only (notes live elsewhere).
// First paint: last scores this device saw, then a fast Firebase read; then live updates as people tick.
(function () {
  var cfg = JSON.parse(document.getElementById("sb-data").textContent);
  var list = document.getElementById("sb-list");
  var hero = document.getElementById("sb-hero");
  var heroSub = document.getElementById("sb-hero-sub");
  var rowsBySlug = {};
  Array.prototype.forEach.call(list.children, function (li) { rowsBySlug[li.dataset.slug] = li; });

  function ago(ms) {
    var s = (Date.now() - ms) / 1000;
    if (s < 90) return "active just now";
    if (s < 3600) return "active " + Math.round(s / 60) + "m ago";
    if (s < 86400 * 1.5) return "active " + Math.round(s / 3600) + "h ago";
    return "active " + Math.round(s / 86400) + "d ago";
  }

  function render(rows) {
    var latest = {};
    rows.forEach(function (r) { if (!latest[r.performer] || r.clientTs > latest[r.performer].clientTs) latest[r.performer] = r; });
    var people = cfg.performers.map(function (p) {
      var sub = latest[p.slug], ticked = {}, done = 0;
      if (sub) sub.checked.forEach(function (id) { ticked[id] = true; });
      p.ids.forEach(function (id) { if (ticked[id]) done++; });
      return { p: p, done: done, total: p.ids.length, frac: p.ids.length ? done / p.ids.length : 0, ts: sub && done ? sub.clientTs : null };
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

  // Show the last scores this device saw right away; fresh ones replace them a moment later.
  var CACHE = "bow2hw:scores2";
  try {
    var cached = JSON.parse(localStorage.getItem(CACHE) || "null");
    if (cached && cached.rows) render(cached.rows);
  } catch (e) {}

  function show(rows) {
    render(rows);
    try { localStorage.setItem(CACHE, JSON.stringify({ rows: rows, at: Date.now() })); } catch (e) {}
  }
  function asRow(id, d) { return { performer: id, checked: d.checked || [], clientTs: d.clientTs || 0 }; }

  var db = window.BOWFS(cfg.fs);
  function load() {
    return db.list("progress").then(function (docs) {
      show(docs.map(function (d) { return asRow(d.id, d); }));
    }).catch(function () {});
  }

  // Live updates through the Firebase library (loaded after first paint, ~190 KB, cached after).
  // If it can't load, fall back to re-reading every 20 seconds while the page is open.
  var polling = null;
  function poll() {
    if (polling) return;
    polling = setInterval(function () { if (document.visibilityState === "visible") load(); }, 20000);
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") load(); });
  }
  var SDK = "https://www.gstatic.com/firebasejs/" + cfg.sdk + "/";
  load().then(function () {
    return Promise.all([import(SDK + "firebase-app.js"), import(SDK + "firebase-firestore.js")]);
  }).then(function (m) {
    var app = m[0].initializeApp({ apiKey: cfg.fs.apiKey, projectId: cfg.fs.projectId, appId: cfg.fs.appId });
    var fsdb = m[1].getFirestore(app);
    m[1].onSnapshot(m[1].collection(fsdb, "progress"), function (snap) {
      show(snap.docs.map(function (d) { return asRow(d.id, d.data()); }));
    }, poll);
  }).catch(poll);
})();
