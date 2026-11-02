// Status board: pulls every submission from the Apps Script endpoint (needs the admin key in #k=...).
(function () {
  var cfg = JSON.parse(document.getElementById("st-data").textContent);
  var main = document.getElementById("st-main");
  var summary = document.getElementById("st-summary");
  var when = document.getElementById("st-when");
  var ABBR = { PRIM: "PRIM", ENS: "ENS", HARM: "HARM", DANCE: "DANCE", NOTE: "★" };

  var m = location.hash.match(/k=([^&]+)/);
  var key = m ? decodeURIComponent(m[1]) : null;
  try {
    if (key) localStorage.setItem("bow2hw:key", key); else key = localStorage.getItem("bow2hw:key");
  } catch (e) {}

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k]; else if (k === "cls") n.className = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function fmt(iso) {
    return new Date(iso).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }
  var songTitle = {};
  cfg.songs.forEach(function (s) { songTitle[s.id] = s.title; });

  function render(rows) {
    var latest = {}, nSubs = {};
    rows.forEach(function (r) {
      nSubs[r.performer] = (nSubs[r.performer] || 0) + 1;
      if (!latest[r.performer] || r.ts > latest[r.performer].ts) latest[r.performer] = r;
    });

    var people = cfg.performers.map(function (p) {
      var sub = latest[p.slug];
      var ticked = {};
      if (sub) sub.checked.forEach(function (id) { ticked[id] = true; });
      var total = 0, done = 0, missing = [], bySong = {};
      p.songs.forEach(function (x) {
        var d = 0;
        x.items.forEach(function (it) {
          total++;
          if (ticked[it.id]) { done++; d++; } else missing.push(songTitle[x.song] + ": " + it.label);
        });
        bySong[x.song] = { role: x.role, note: x.note, done: d, total: x.items.length,
          missing: x.items.filter(function (it) { return !ticked[it.id]; }).map(function (it) { return it.label; }) };
      });
      return { p: p, sub: sub, n: nSubs[p.slug] || 0, total: total, done: done, missing: missing, bySong: bySong };
    });

    var submitted = people.filter(function (x) { return x.sub; }).length;
    var allItems = people.reduce(function (a, x) { return a + x.total; }, 0);
    var allDone = people.reduce(function (a, x) { return a + x.done; }, 0);
    summary.textContent = submitted + " of " + people.length + " performers have submitted · " +
      allDone + " of " + allItems + " items ticked overall";

    main.textContent = "";

    // Grid: performers × songs, like the cast sheet.
    var sections = [];
    cfg.songs.forEach(function (s) {
      var last = sections[sections.length - 1];
      if (last && last.name === s.section) last.n++; else sections.push({ name: s.section, n: 1 });
    });
    var secRow = el("tr", {}, [el("th", { cls: "who" })].concat(sections.map(function (s) {
      return el("th", { colspan: s.n, text: s.name });
    })).concat([el("th")]));
    var headRow = el("tr", {}, [el("th", { cls: "who", text: "Performer" })].concat(cfg.songs.map(function (s) {
      return el("th", { cls: "song-col", text: s.title });
    })).concat([el("th", { text: "Done" })]));
    var body = people.map(function (x) {
      var cells = cfg.songs.map(function (s) {
        var c = x.bySong[s.id];
        if (!c) return el("td");
        var cls = !x.sub ? "c-wait" : c.done === c.total ? "c-full" : c.done ? "c-part" : "c-none";
        var tip = c.missing.length ? "Not yet: " + c.missing.join(", ") : "All done";
        if (c.note) tip = c.note + " only. " + tip;
        return el("td", { cls: "cell " + cls, title: s.title + ": " + tip, text: ABBR[c.role] });
      });
      return el("tr", {}, [el("th", { cls: "who", text: x.p.name })].concat(cells).concat([
        el("td", { cls: "tot", text: x.sub ? x.done + "/" + x.total : "–" })]));
    });
    var readyRow = el("tr", {}, [el("th", { cls: "who", text: "Fully ready" })].concat(cfg.songs.map(function (s) {
      var on = people.filter(function (x) { return x.bySong[s.id]; });
      var ready = on.filter(function (x) { return x.sub && x.bySong[s.id].done === x.bySong[s.id].total; });
      return el("td", { text: ready.length + "/" + on.length });
    })).concat([el("td")]));
    main.appendChild(el("div", { cls: "grid-wrap" }, [el("table", { cls: "grid" }, [
      el("thead", {}, [secRow, headRow]), el("tbody", {}, body.concat([readyRow]))])]));
    main.appendChild(el("div", { cls: "legend" }, [
      el("span", {}, [el("i", { cls: "c-full" }), "everything ticked"]),
      el("span", {}, [el("i", { cls: "c-part" }), "some ticked"]),
      el("span", {}, [el("i", { cls: "c-none" }), "nothing ticked"]),
      el("span", {}, [el("i", { cls: "c-wait" }), "hasn't submitted"]),
      el("span", { text: "★ = featured moment only · hover a cell to see what's missing" })]));

    // Cards: who to chase, worst first.
    people.sort(function (a, b) {
      if (!!a.sub !== !!b.sub) return a.sub ? 1 : -1;
      return (a.done / a.total) - (b.done / b.total);
    });
    main.appendChild(el("h2", { cls: "section", text: "By performer" }));
    main.appendChild(el("div", { cls: "cards" }, people.map(function (x) {
      var link = cfg.base + x.p.slug + "/";
      var input = el("input", { value: link, readonly: "readonly", "aria-label": "Link for " + x.p.name });
      var copy = el("button", { type: "button", text: "Copy link" });
      copy.addEventListener("click", function () {
        input.select();
        (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).catch(function () { document.execCommand("copy"); });
        copy.textContent = "Copied";
        setTimeout(function () { copy.textContent = "Copy link"; }, 1500);
      });
      var pillCls = !x.sub ? "c-none" : x.done === x.total ? "c-full" : "c-part";
      return el("div", { cls: "pcard" }, [
        el("h3", {}, [x.p.name, el("span", { cls: "pill " + pillCls, text: x.sub ? x.done + " / " + x.total : "not submitted" })]),
        el("p", { cls: "meta", text: x.sub ? "Last submitted " + fmt(x.sub.ts) + (x.n > 1 ? " (" + x.n + " submissions)" : "") : "Nothing yet" }),
        x.sub && x.sub.note ? el("blockquote", { text: x.sub.note }) : null,
        x.sub && x.missing.length ? el("div", {}, [el("b", { text: "Not ticked:" }),
          el("ul", {}, x.missing.map(function (t) { return el("li", { text: t }); }))]) : null,
        el("div", { cls: "link" }, [input, copy])]);
    })));
  }

  function load() {
    if (!cfg.endpoint) { summary.textContent = "Submissions aren't switched on yet (no endpoint configured)."; render([]); return; }
    if (!key) { summary.textContent = "Open this page with the full link that ends in #k=…"; return; }
    summary.textContent = "Loading…";
    fetch(cfg.endpoint + "?key=" + encodeURIComponent(key)).then(function (r) { return r.json(); }).then(function (res) {
      if (!res.ok) throw new Error(res.error === "key" ? "wrong key" : res.error);
      render(res.rows || []);
      when.textContent = "Updated " + fmt(new Date().toISOString());
    }).catch(function (err) { summary.textContent = "Couldn't load responses (" + err.message + ")."; });
  }
  document.getElementById("st-refresh").addEventListener("click", load);
  window.addEventListener("hashchange", function () { location.reload(); });
  load();
})();
