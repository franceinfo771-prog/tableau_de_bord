#!/usr/bin/env bash
# Régénère etat.json : résumé technique du dépôt tableau_de_bord.
# Usage :  ./scripts/etat.sh
set -euo pipefail

cd "$(dirname "$0")/.."

branch="$(git rev-parse --abbrev-ref HEAD)"
short_sha="$(git rev-parse --short HEAD)"
full_sha="$(git rev-parse HEAD)"
last_commit_message="$(git log -1 --pretty=%s)"
last_commit_date="$(git log -1 --pretty=%cI)"
tracked_files="$(git ls-files | wc -l | tr -d ' ')"
uncommitted="$(git status --porcelain | wc -l | tr -d ' ')"
generated_at="$(date -Iseconds)"

python3 - "$branch" "$short_sha" "$full_sha" "$last_commit_message" \
          "$last_commit_date" "$tracked_files" "$uncommitted" "$generated_at" <<'PY' > etat.json
import json, sys

branch, short_sha, full_sha, msg, cdate, files, dirty, gen = sys.argv[1:9]

_PROJ = json.load(open('projets.json', encoding='utf-8'))
_steps = [e for p in _PROJ['projets'] for e in p['etapes']]
_done = sum(1 for e in _steps if e.get('ok'))
_total = len(_steps)
_proj_done = sum(1 for p in _PROJ['projets'] if p['etapes'] and all(e.get('ok') for e in p['etapes']))
summary = {
    "projects_total": len(_PROJ['projets']),
    "projects_done": _proj_done,
    "steps_done": _done,
    "steps_total": _total,
    "progress_percent": round(_done / _total * 100) if _total else 0,
    "veille_count": len(_PROJ['veille']),
}
SUMMARY = summary


data = {
    "project": "tableau_de_bord",
    "branch": branch,
    "short_sha": short_sha,
    "full_sha": full_sha,
    "last_commit_message": msg,
    "last_commit_date": cdate,
    "tracked_files": int(files),
    "uncommitted_changes": int(dirty),
    "generated_at": gen,
    "summary": SUMMARY,
}

print(json.dumps(data, ensure_ascii=False, indent=2))
PY

echo "etat.json régénéré — branche $branch, commit $short_sha, $tracked_files fichier(s) suivi(s)."
