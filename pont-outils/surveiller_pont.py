"""Surveille le depot pour detecter la publication des rapports du pont.

Quand le poste de la maison lance le pont, celui-ci publie :
  - pont/autotest.txt  : rapport de verification du chiffrement
  - pont/machine.txt   : configuration de la machine (CPU, RAM, GPU, reseau)

Ce script interroge l'API GitHub en boucle et s'arrete des que les deux
rapports sont arrives. Il permet a l'assistant de reprendre la main sans
que l'utilisateur ait a recopier quoi que ce soit.

Usage : python3 surveiller_pont.py [--intervalle 30] [--delai-max 7200]
"""

import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request

API = "https://api.github.com/repos/franceinfo771-prog/tableau_de_bord/contents/pont"
BRANCHE = "pont"
SORTIE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "surveillance")
JOURNAL = os.path.join(SORTIE, "journal.txt")

ATTENDUS = ("autotest.txt", "machine.txt")


def journal(message):
    ligne = "%s  %s" % (time.strftime("%H:%M:%S"), message)
    print(ligne, flush=True)
    os.makedirs(SORTIE, exist_ok=True)
    with open(JOURNAL, "a", encoding="utf-8") as f:
        f.write(ligne + "\n")


def lire(nom):
    """Retourne le contenu d'un fichier du dossier pont/, ou None."""
    url = "%s/%s?ref=%s" % (API, nom, BRANCHE)
    req = urllib.request.Request(
        url, headers={"User-Agent": "pont-surveillance", "Accept": "application/vnd.github+json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.load(r)
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return None
        raise
    except Exception:
        return None
    if not data.get("content"):
        return None
    try:
        return base64.b64decode(data["content"]).decode("utf-8", "replace")
    except Exception:
        return None


def main():
    intervalle = 30
    delai_max = 7200
    args = sys.argv[1:]
    for i, a in enumerate(args):
        if a == "--intervalle" and i + 1 < len(args):
            intervalle = int(args[i + 1])
        if a == "--delai-max" and i + 1 < len(args):
            delai_max = int(args[i + 1])

    journal("Surveillance demarree (intervalle %ds, duree max %d min)."
            % (intervalle, delai_max // 60))

    debut = time.time()
    attendu = set(ATTENDUS)
    vus = set()

    while True:
        for nom in sorted(attendu):
            if nom in vus:
                continue
            contenu = lire(nom)
            if contenu is None:
                continue
            vus.add(nom)
            os.makedirs(SORTIE, exist_ok=True)
            chemin = os.path.join(SORTIE, nom)
            with open(chemin, "w", encoding="utf-8") as f:
                f.write(contenu)
            journal("Recu : pont/%s (%d caracteres) -> %s"
                    % (nom, len(contenu), chemin))

        if vus >= attendu:
            journal("Les deux rapports sont arrives. Surveillance terminee.")
            return 0

        if time.time() - debut > delai_max:
            journal("Delai depasse sans rapport complet. Recu : %s"
                    % (sorted(vus) or "rien"))
            return 1

        time.sleep(intervalle)


if __name__ == "__main__":
    sys.exit(main())
