"""Test du mode 'autotest publie'.

Verifie que le rapport d'autotest est produit, ecrit sur le poste et
publie en clair sur GitHub (pour que l'assistant le lise sans que
l'utilisateur recopie l'ecran).
"""

import base64
import json
import os
import sys
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import importlib.util  # noqa: E402

spec = importlib.util.spec_from_file_location("ps", os.path.join(HERE, "pont_sandbox.py"))
ps = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ps)

TOKEN = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
REPO = "franceinfo771-prog/tableau_de_bord"
BRANCHE = "pont"

ok = True


def api_get(chemin):
    url = "https://api.github.com/repos/%s/contents/%s?ref=%s" % (REPO, chemin, BRANCHE)
    req = urllib.request.Request(url)
    if TOKEN:
        req.add_header("Authorization", "Bearer " + TOKEN)
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("User-Agent", "pont-arena")
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def main():
    global ok
    print("=== 1. Le sandbox publie un rapport d'autotest simule ===")
    rapport = "\n".join([
        "sha256 : OK",
        "sha1 : OK",
        "aller-retour : OK",
        "phrase erronee refusee : OK",
        "poste : Microsoft Windows NT 10.0.19045.0",
        "runtime : .NET Framework 4.8.4715.0",
        "kdf disponible : sha256",
        "RESULTAT : OK",
    ])
    ps.gh_put("autotest.txt", rapport, "pont : rapport autotest")
    print("   publie.")

    print("\n=== 2. L'assistant le relit en clair, sans phrase de passe ===")
    donnees = api_get("pont/autotest.txt")
    contenu = base64.b64decode(donnees["content"].replace("\n", "")).decode("utf-8")
    print("   ---")
    for ligne in contenu.splitlines():
        print("   " + ligne)
    print("   ---")
    if "RESULTAT : OK" in contenu:
        print("   rapport lisible : OK")
    else:
        print("   PROBLEME : rapport illisible")
        ok = False

    print("\n=== 3. Le rapport ne contient aucun secret ===")
    interdits = ["ghp_", "github_pat_", "jetonGitHub", "phrase-de-test"]
    for mot in interdits:
        if mot in contenu:
            print("   FUITE : %s" % mot)
            ok = False
    print("   aucun secret detecte : %s" % ("OK" if ok else "ECHEC"))

    print("\n=== 4. Le pont peut lire ce rapport en mode 'etat' ===")
    ps.cmd_etat()

    print("\nRAPPORT D'AUTOTEST VALIDE" if ok else "\nECHECS DETECTES")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
