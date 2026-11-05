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
    // One document's fields, or null if it doesn't exist yet.
    get: function (path) {
      return fetch(BASE + "/" + path + "?" + Q).then(json).then(function (r) {
        if (r.status === 404) return null;
        if (r.status !== 200) throw new Error("HTTP " + r.status);
        return fields(r.body);
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
    // A save: ticks + note + a history entry, applied all-or-nothing.
    saveBody: function (slug, name, checked, note, clientTs, via) {
      return JSON.stringify({ writes: [
        write("progress/" + slug, { name: name, checked: checked, clientTs: clientTs }),
        write("notes/" + slug, { note: note, clientTs: clientTs }),
        write("progress/" + slug + "/history/" + rid(), { name: name, checked: checked, note: note, clientTs: clientTs, via: via || "site" })
      ] });
    },
    // Resolves to the HTTP status: 200 saved, 403 refused by the rules (e.g. something newer exists).
    commit: function (body) {
      return fetch(BASE + ":commit?" + Q, { method: "POST", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: body })
        .then(function (r) { return r.status; });
    },
    // Fire-and-forget save for when the tab is closing.
    beacon: function (body) {
      if (!navigator.sendBeacon) return false;
      return navigator.sendBeacon(BASE + ":commit?" + Q, new Blob([body], { type: "text/plain;charset=UTF-8" }));
    }
  };
};
