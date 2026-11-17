"""Pont cote sandbox : envoie des commandes au poste a la maison, lit les reponses.

Usage :
  python3 pont_sandbox.py envoyer "ipconfig /all" [--shell cmd|powershell]
  python3 pont_sandbox.py lire
  python3 pont_sandbox.py etat

Sans phrase de passe (rapports publies en clair par le poste) :
  python3 pont_sandbox.py machine              configuration du poste
  python3 pont_sandbox.py installer <modele>    installe LM Studio + modele
  python3 pont_sandbox.py rapport               rapport de l'installation
"""

import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from crypto import open_envelope, seal  # noqa: E402

OWNER = "franceinfo771-prog"
REPO = "tableau_de_bord"
BRANCH = "pont"
DIR = "pont"
BASE = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{DIR}"

HERE = os.path.dirname(os.path.abspath(__file__))
KEYFILE = os.path.join(HERE, "cle.txt")


def _headers():
    h = {"Accept": "application/vnd.github+json", "User-Agent": "pont-arena"}
    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if token:
        h["Authorization"] = "Bearer " + token
    return h


def _request(method, url, body=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, headers=_headers(), method=method)
    if data is not None:
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw = resp.read().decode("utf-8")
    return json.loads(raw) if raw.strip() else {}


def gh_get(path):
    try:
        return _request("GET", f"{BASE}/{path}?ref={BRANCH}")
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return None
        raise


def gh_put(path, text, message):
    existing = gh_get(path)
    body = {
        "message": message,
        "content": base64.b64encode(text.encode("utf-8")).decode("ascii"),
        "branch": BRANCH,
    }
    if existing:
        body["sha"] = existing["sha"]
    return _request("PUT", f"{BASE}/{path}", body)


def passphrase():
    if not os.path.exists(KEYFILE):
        sys.exit("cle.txt manquant dans %s" % HERE)
    key = open(KEYFILE, encoding="utf-8").read().strip()
    if not key:
        sys.exit("cle.txt vide")
    return key


def kdf_annonce():
    """Quel algorithme de derivation le poste supporte-t-il ?

    Le poste publie 'pont-kdf.txt' au demarrage ('sha256' ou 'sha1').
    On respecte toujours son annonce, sinon la signature ne correspondrait
    pas et la commande serait refusee.
    """
    payload = gh_get("pont-kdf.txt")
    if not payload:
        return "sha256"
    try:
        texte = base64.b64decode(payload["content"]).decode("utf-8").strip().lower()
    except Exception:  # noqa: BLE001
        return "sha256"
    return texte if texte in ("sha256", "sha1") else "sha256"


def cmd_envoyer(argv):
    if not argv:
        sys.exit("usage : envoyer \"<commande>\" [--shell cmd|powershell]")
    shell = "cmd"
    if "--shell" in argv:
        i = argv.index("--shell")
        shell = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
    command = " ".join(argv)
    order = {
        "id": time.strftime("%Y%m%d-%H%M%S") + "-" + os.urandom(2).hex(),
        "cmd": command,
        "shell": shell,
        "ts": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    digest = kdf_annonce()
    gh_put(
        "cmd.enc",
        seal(passphrase(), json.dumps(order, ensure_ascii=False), digest),
        "pont : commande",
    )
    print("Commande envoyee (id %s, kdf %s) :\n  %s" % (order["id"], digest, command))


def cmd_lire():
    payload = gh_get("rep.enc")
    if not payload:
        print("Aucune reponse pour l'instant.")
        return
    envelope = base64.b64decode(payload["content"]).decode("utf-8")
    result = json.loads(open_envelope(passphrase(), envelope))
    print("id      : %s" % result.get("id"))
    print("ok      : %s   (code %s)" % (result.get("ok"), result.get("code")))
    if result.get("stdout"):
        print("--- sortie ---")
        print(result["stdout"])
    if result.get("stderr"):
        print("--- erreurs ---")
        print(result["stderr"])


def cmd_etat(argv=None):
    cmd = gh_get("cmd.enc")
    rep = gh_get("rep.enc")
    print("commande en attente : %s" % ("oui" if cmd else "non"))
    print("reponse recue       : %s" % ("oui" if rep else "non"))
    print("poste en ligne      : %s" % ("oui (kdf %s)" % kdf_annonce() if gh_get("pont-kdf.txt") else "non"))
    if rep:
        envelope = base64.b64decode(rep["content"]).decode("utf-8")
        try:
            result = json.loads(open_envelope(passphrase(), envelope))
            print("dernier id          : %s" % result.get("id"))
            print("dernier ok          : %s" % result.get("ok"))
        except Exception as exc:  # noqa: BLE001
            print("reponse illisible   : %s" % exc)


def cmd_machine(argv):
    """Lit la configuration de la machine publiee en clair par le poste.

    Aucun secret ici : le rapport ne contient ni jeton ni phrase de passe.
    """
    payload = gh_get("machine.txt")
    if not payload:
        print("Aucune configuration publiee pour l'instant.")
        print("Le poste doit avoir demarre le pont au moins une fois.")
        return
    print(base64.b64decode(payload["content"]).decode("utf-8", errors="replace"))


def cmd_rapport(argv):
    """Lit le rapport d'installation LM Studio publie en clair."""
    payload = gh_get("lmstudio.txt")
    if not payload:
        print("Aucun rapport d'installation pour l'instant.")
        return
    print(base64.b64decode(payload["content"]).decode("utf-8", errors="replace"))


def cmd_installer(argv):
    """Demande au poste d'installer LM Studio et un modele.

    Le declencheur est en clair : c'est le nom du modele, rien de secret.
    Le poste le voit dans sa boucle, installe, charge le modele, lance le
    serveur, puis publie le rapport.

    Usage : installer [modele] [--sans-modele]
    """
    modele = ""
    sans_modele = False
    reste = []
    i = 0
    while i < len(argv):
        arg = argv[i]
        if arg == "--sans-modele":
            sans_modele = True
        elif arg == "--modele" and i + 1 < len(argv):
            modele = argv[i + 1]
            i += 1
        else:
            reste.append(arg)
        i += 1
    if reste:
        modele = " ".join(reste)

    demande = {
        "id": time.strftime("%Y%m%d-%H%M%S") + "-" + os.urandom(2).hex(),
        "modele": modele,
        "sansModele": sans_modele,
        "ts": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    if "--simulation" in argv:
        print("SIMULATION — rien n'a ete publie :")
        print(json.dumps(demande, ensure_ascii=False, indent=2))
        return
    gh_put(
        "installer.txt",
        json.dumps(demande, ensure_ascii=False, indent=2),
        "pont : demande d'installation LM Studio",
    )
    print("Installation demandee (id %s)." % demande["id"])
    if modele:
        print("  modele :", modele)
    else:
        print("  modele : choix automatique selon la memoire de la machine")
    print("Le poste s'en occupera a son prochain tour de boucle (30 s).")


def cmd_tunnel(argv):
    """Demande au poste d'ouvrir l'acces prive.

    Deux methodes :
      tailscale  (defaut) le poste installe Tailscale si besoin, se
                 connecte au reseau prive, puis publie le serveur local sur
                 une adresse https privee.
      cloudflare le poste utilise cloudflared, deja installe : soit un
                 tunnel nomme (adresse fixe), soit un tunnel rapide
                 (adresse aleatoire, changeante).

    Usage : tunnel [--methode tailscale|cloudflare] [--port 1234]
    """
    port = 1234
    methode = "tailscale"
    i = 0
    while i < len(argv):
        arg = argv[i]
        if arg == "--port" and i + 1 < len(argv):
            port = int(argv[i + 1]); i += 1
        elif arg == "--methode" and i + 1 < len(argv):
            methode = argv[i + 1]; i += 1
        elif arg in ("tailscale", "cloudflare"):
            methode = arg
        i += 1

    demande = {
        "id": time.strftime("%Y%m%d-%H%M%S") + "-" + os.urandom(2).hex(),
        "action": "tunnel",
        "methode": methode,
        "port": port,
        "ts": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    if "--simulation" in argv:
        print("SIMULATION — rien n'a ete publie :")
        print(json.dumps(demande, ensure_ascii=False, indent=2))
        return
    gh_put(
        "installer.txt",
        json.dumps(demande, ensure_ascii=False, indent=2),
        "pont : demande de tunnel prive",
    )
    print("Tunnel prive demande (id %s)." % demande["id"])
    print("  methode :", methode)
    print("  port    :", port)
    if methode == "tailscale":
        print("Le poste affichera une adresse d'authentification a ouvrir.")
    else:
        print("Le poste publiera l'adresse du tunnel.")


def cmd_tunnel_rapport(argv):
    """Lit le rapport du tunnel prive."""
    payload = gh_get("tunnel.txt")
    if not payload:
        print("Aucun rapport de tunnel pour l'instant.")
        return
    print(base64.b64decode(payload["content"]).decode("utf-8", errors="replace"))


COMMANDS = {
    "envoyer": cmd_envoyer,
    "lire": cmd_lire,
    "etat": cmd_etat,
    "machine": cmd_machine,
    "rapport": cmd_rapport,
    "installer": cmd_installer,
    "tunnel": cmd_tunnel,
    "tunnel-rapport": cmd_tunnel_rapport,
}


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDS:
        sys.exit("usage : pont_sandbox.py [envoyer|lire|etat] ...")
    COMMANDS[sys.argv[1]](sys.argv[2:])


if __name__ == "__main__":
    main()
