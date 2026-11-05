// Minimal Firestore REST helpers shared by the homework pages. No sign-in: the Firestore
// security rules decide what's allowed (valid cast names only, never an older save over a newer one).
// Requests use text/plain so browsers send them without a CORS preflight (and sendBeacon works).
window.BOWFS = function (fs) {
  var DOCS = "projects/" + fs.projectId + "/databases/(default)/documents";
  var BASE = "https://firestore.googleapis.com/v1/" + DOCS;
  var Q = "key=" + encodeURIComponent(fs.apiKey);

  function val(v) {
    if (typeof v === "number") return { integerValue: String(Math.round(v)) };
    if (typeof v === "string") return { stringValue: v };
    if (Array.isArray(v)) return { arrayValue: v.length ? { values: v.map(val) } : {} };
    throw new Error("unsupported value");
  }
  function unval(v) {
    if ("stringValue" in v) return v.stringValue;
    if ("integerValue" in v) return Number(v.integerValue);
    if ("timestampValue" in v) return v.timestampValue;
    if ("arrayValue" in v) return (v.arrayValue.values || []).map(unval);
    return null;
  }
  function fields(doc) {
    var out = {};
    Object.keys(doc.fields || {}).forEach(function (k) { out[k] = unval(doc.fields[k]); });
    return out;
  }
  function json(r) { return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; }); }
  function write(path, f) {
    var fl = {};
    Object.keys(f).forEach(function (k) { fl[k] = val(f[k]); });
    return { update: { name: DOCS + "/" + path, fields: fl }, updateTransforms: [{ fieldPath: "ts", setToServerValue: "REQUEST_TIME" }] };
  }
  function rid() {
    var a = new Uint8Array(10);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return Array.prototype.map.call(a, function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
  }

  return {
    // One document's fields (plus _updateTime, its version), or null if it doesn't exist yet.
    get: function (path) {
      return fetch(BASE + "/" + path + "?" + Q).then(json).then(function (r) {
        if (r.status === 404) return null;
        if (r.status !== 200) throw new Error("HTTP " + r.status);
        var f = fields(r.body); f._updateTime = r.body.updateTime; return f;
      });
    },
    // Every document in a collection, as [{id, ...fields}].
    list: function (coll) {
      return fetch(BASE + "/" + coll + "?pageSize=300&" + Q).then(json).then(function (r) {
        if (r.status !== 200) throw new Error("HTTP " + r.status);
        return (r.body.documents || []).map(function (d) {
          var f = fields(d); f.id = d.name.split("/").pop(); return f;
        });
      });
    },
    // A save: ticks + note + a history entry, applied all-or-nothing. "versions" makes it conditional:
    // it only goes through if neither document changed since we read it ({progress, notes}: an
    // _updateTime, or null for "must not exist yet"). Leave it out for an unconditional save.
    saveBody: function (slug, name, checked, note, clientTs, via, versions) {
      var p = write("progress/" + slug, { name: name, checked: checked, clientTs: clientTs });
      var n = write("notes/" + slug, { note: note, clientTs: clientTs });
      if (versions) {
        p.currentDocument = versions.progress ? { updateTime: versions.progress } : { exists: false };
        n.currentDocument = versions.notes ? { updateTime: versions.notes } : { exists: false };
      }
      return JSON.stringify({ writes: [p, n,
        write("progress/" + slug + "/history/" + rid(), { name: name, checked: checked, note: note, clientTs: clientTs, via: via || "site" })
      ] });
    },
    // Resolves to {status, body}. 200: saved (body.writeResults[i].updateTime are the new versions).
    // 400/409: someone saved in between (a condition failed). 403: refused by the rules.
    commit: function (body) {
      return fetch(BASE + ":commit?" + Q, { method: "POST", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: body })
        .then(json);
    },
    // Fire-and-forget save for when the tab is closing.
    beacon: function (body) {
      if (!navigator.sendBeacon) return false;
      return navigator.sendBeacon(BASE + ":commit?" + Q, new Blob([body], { type: "text/plain;charset=UTF-8" }));
    }
  };
};
