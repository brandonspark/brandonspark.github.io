#!/bin/sh
# Verify every lecture exercise: each solution must pass all of its hidden
# tests, and each starter must pass none. Run after authoring or editing any
# exercise. Needs a web-sml checkout (SML_SRC, default ~/browser_sml) for the
# Node-side runner.
set -e
cd "$(dirname "$0")"
SML_SRC=${SML_SRC:-$HOME/browser_sml}

python3 - <<'EOF' > /tmp/sml-exercises.json
import tomllib, json, pathlib, sys
out = []
for d in sorted(pathlib.Path('content/150').iterdir()):
    f = d / 'index.md'
    if not d.is_dir() or not f.exists():
        continue
    fm = f.read_text().split('+++')
    if len(fm) < 2:
        continue
    data = tomllib.loads(fm[1])
    for ex in data.get('extra', {}).get('exercises', []):
        if 'starter' in ex:
            out.append({'lecture': d.name, 'title': ex['title'], 'starter': ex['starter'],
                        'solution': ex.get('solution'), 'tests': ex['tests']})
json.dump(out, sys.stdout)
EOF

node verify-exercises.mjs /tmp/sml-exercises.json "$SML_SRC"
