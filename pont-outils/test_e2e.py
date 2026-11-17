"""Test de bout en bout du pont, en passant par la vraie API GitHub.

Simule le poste a la maison : dechiffre la commande, l'execute, chiffre
la reponse, la renvoie. Verifie ensuite que le sandbox relit la reponse.

Usage : python3 test_e2e.py
"""

import base64
import json
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from crypto import open_envelope, seal  # noqa: E402

BRANCH = "pont"
OWNER = "franceinfo771-prog"
REPO = "tableau_de_bord"
BASE = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/pont"
PHRASE = "phrase-de-test-locale"

import importlib.util  # noqa: E402

spec = importlib.util.spec_from_file_location("pont_sandbox", os.path.join(HERE, "pont_sandbox.py"))
ps = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ps)


def etape(titre):
    print("\n=== %s ===" % titre)


def main():
    etape("1. Le sandbox chiffre une commande et la publie")
    ordre = {
        "id": "e2e-%d" % int(time.time()),
        "cmd": "echo bonjour-du-pont && hostname",
        "shell": "cmd",
        "ts": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    ps.gh_put("cmd.enc", seal(PHRASE, json.dumps(ordre, ensure_ascii=False)), "pont : commande (e2e)")
    print("   publiee :", ordre["id"])

    etape("2. Le poste dechiffre, execute, chiffre la reponse")
    payload = ps.gh_get("cmd.enc")
    enveloppe = base64.b64decode(payload["content"]).decode("utf-8")
    recu = json.loads(open_envelope(PHRASE, enveloppe))
    print("   commande recue :", recu["cmd"])

    sortie = subprocess.run(
        ["/bin/sh", "-c", recu["cmd"]], capture_output=True, timeout=30
    )
    resultat = {
        "id": recu["id"],
        "ok": sortie.returncode == 0,
        "code": sortie.returncode,
        "stdout": sortie.stdout.decode("utf-8", "replace"),
        "stderr": sortie.stderr.decode("utf-8", "replace"),
    }
    ps.gh_put("rep.enc", seal(PHRASE, json.dumps(resultat, ensure_ascii=False)), "pont : reponse (e2e)")
    print("   reponse publiee")

    etape("3. Le sandbox relit et dechiffre la reponse")
    rep = ps.gh_get("rep.enc")
    enveloppe = base64.b64decode(rep["content"]).decode("utf-8")
    lu = json.loads(open_envelope(PHRASE, enveloppe))
    print("   id       :", lu["id"])
    print("   ok       :", lu["ok"], "code", lu["code"])
    print("   sortie   :", lu["stdout"].strip().replace("\n", " | "))

    etape("4. Le contenu reste illisible sur GitHub (chiffre)")
    public = ps.gh_get("cmd.enc")
    brut = base64.b64decode(public["content"]).decode("utf-8")
    print("   contenu brut sur GitHub :", brut[:90], "...")
    assert "bonjour-du-pont" not in brut, "FUITE : la commande est en clair !"
    assert "hostname" not in brut, "FUITE : la commande est en clair !"
    print("   aucune commande en clair dans le depot : OK")

    etape("5. Une mauvaise phrase passe est refusee")
    try:
        open_envelope("mauvaise-phrase", brut)
        print("   PROBLEME : mauvaise phrase acceptee")
        return 1
    except ValueError as exc:
        print("   refus correct :", exc)

    etape("6. Une commande modifiee est refusee (signature)")
    falsifiee = json.loads(brut)
    faux = base64.b64decode(falsifiee["ct"])
    falsifiee["ct"] = base64.b64encode(bytes([faux[0] ^ 0xFF]) + faux[1:]).decode("ascii")
    try:
        open_envelope(PHRASE, json.dumps(falsifiee))
        print("   PROBLEME : donnee falsifiee acceptee")
        return 1
    except ValueError as exc:
        print("   refus correct :", exc)

    print("\nPONT VALIDE DE BOUT EN BOUT")
    return 0


if __name__ == "__main__":
    sys.exit(main())
