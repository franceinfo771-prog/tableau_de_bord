#!/usr/bin/env python3
"""Alerte « manette du vélo » — vérifie si la poignée AdreaPocket est de nouveau en stock.

La poignée retenue (5F36POIGELTROT, 13,99 €) est en rupture de stock. Plutôt que de
regarder la page à la main chaque semaine, un robot la lit chaque matin et publie le
résultat dans `alerte-manette.json`.

Règle de décision — simple et prudente :

  1. Si la page ne se charge pas (site en panne, réseau, blocage), on **ne conclut
     rien** : `etat: "inconnu"`, et la dernière réponse connue est conservée.
  2. Si la page contient « Rupture de stock » ou « Ajouter au panier » désactivé,
     c'est une rupture -> `etat: "rupture"`.
  3. Si la page ne dit plus « rupture » ET propose un bouton « Ajouter au panier »
     actif, c'est disponible -> `etat: "disponible"`.
  4. Sinon : `inconnu` (on ne crie pas au loup sur une page qui a changé de forme).

Aucune dépendance : bibliothèque standard seulement.

Usage :
    python3 scripts/verifier_manette.py              # vérifie et écrit alerte-manette.json
    python3 scripts/verifier_manette.py --lire       # affiche l'alerte enregistrée
    python3 scripts/verifier_manette.py --a-acheter  # code 0 si la poignée est à commander
    python3 scripts/verifier_manette.py --simuler rupture|disponible|inconnu
                                                     # test hors ligne, sans toucher au réseau
"""

import datetime
import json
import os
import re
import sys
import urllib.error
import urllib.request

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.path.join(RACINE, "alerte-manette.json")

URL = ("https://www.adreapocket.com/fr/1485-poignee-accelerateur-5-fils-"
       "trottinette-electrique-36-volts.html")
NOM = "Poignée Accélérateur 5 Fils Trottinette Electrique 36 volts"
REFERENCE = "5F36POIGELTROT"
BOUTIQUE = "AdreaPocket"
PRIX = "13,99 €"

ENTETE = {
    # Un agent honnête : on se présente, on ne se cache pas.
    "User-Agent": ("Mozilla/5.0 (compatible; alerte-manette/1.0; "
                   "+https://github.com/franceinfo771-prog/tableau_de_bord)"),
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "fr-FR,fr;q=0.9",
}

# Marqueurs lus dans le HTML de la boutique.
RUPTURE = [
    r"rupture\s+de\s+stock",
    r"out\s*-?\s*of\s*-?\s*stock",
    r'class="[^"]*\bunavailable\b[^"]*"',
    r"n['’]est plus disponible",
]
PANIER = [
    r'id="add-to-cart"',
    r'name="add-to-cart"',
    r"ajouter\s+au\s+panier",
]


def maintenant():
    return datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat()


def lire_enregistre():
    try:
        with open(SORTIE, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def telecharger(url=URL, timeout=25):
    """Rend le HTML de la page, ou lève une exception."""
    requete = urllib.request.Request(url, headers=ENTETE)
    with urllib.request.urlopen(requete, timeout=timeout) as reponse:
        charset = reponse.headers.get_content_charset() or "utf-8"
        return reponse.read().decode(charset, errors="replace")


def analyser(html, code_http=200):
    """Décide l'état à partir du HTML. Fonction pure : facile à tester."""
    if not html or len(html) < 500:
        return "inconnu", "page vide ou trop courte"

    bas = html.lower()
    rupture = next((m for m in RUPTURE if re.search(m, bas)), None)
    panier = next((m for m in PANIER if re.search(m, bas)), None)

    if rupture:
        return "rupture", "la page dit « rupture de stock »"
    if code_http != 200:
        return "inconnu", "réponse HTTP %s" % code_http
    if panier:
        return "disponible", "la page propose « Ajouter au panier » et ne dit plus rupture"
    return "inconnu", "page chargée mais aucun marqueur reconnu (boutique modifiée ?)"


def construire(etat, detail, ancien=None, simule=False):
    """Construit l'objet publié, en gardant la mémoire des changements."""
    auj = datetime.date.today().isoformat()
    ancien = ancien or {}
    alerte = {
        "produit": NOM,
        "reference": REFERENCE,
        "boutique": BOUTIQUE,
        "prix": PRIX,
        "url": URL,
        "etat": etat,
        "detail": detail,
        "verifie_le": maintenant(),
        "simule": bool(simule),
    }
    # Mémoire : depuis quand, et le dernier changement observé.
    if ancien.get("etat") == etat:
        alerte["depuis"] = ancien.get("depuis") or auj
    else:
        alerte["depuis"] = auj
        if ancien.get("etat"):
            alerte["changement"] = "%s -> %s le %s" % (ancien["etat"], etat, auj)
    if "changement" not in alerte and ancien.get("changement"):
        alerte["changement"] = ancien["changement"]
    # Une alerte « disponible » n'est intéressante que si on l'a déjà signalée une fois.
    alerte["a_acheter"] = (etat == "disponible")
    return alerte


def ecrire(alerte):
    with open(SORTIE, "w", encoding="utf-8", newline="\n") as f:
        json.dump(alerte, f, ensure_ascii=False, indent=2)
        f.write("\n")


def resume(alerte):
    if not alerte:
        return "Aucune alerte enregistrée pour l'instant."
    lignes = [
        "%s — %s" % (alerte.get("produit", "?"), alerte.get("prix", "?")),
        "État : %s (%s)" % (alerte.get("etat", "?"), alerte.get("detail", "")),
        "Depuis le : %s" % alerte.get("depuis", "?"),
        "Vérifié le : %s" % alerte.get("verifie_le", "?"),
    ]
    if alerte.get("changement"):
        lignes.append("Dernier changement : %s" % alerte["changement"])
    if alerte.get("a_acheter"):
        lignes.append(">>> DE NOUVEAU DISPONIBLE — à commander : " + alerte.get("url", ""))
    return "\n".join(lignes)


def main(argv):
    if "--lire" in argv:
        print(resume(lire_enregistre()))
        return 0

    # Pour le workflow : 0 = il y a quelque chose à commander (on prévient), 1 = non.
    if "--a-acheter" in argv:
        return 0 if (lire_enregistre() or {}).get("a_acheter") else 1

    if "--simuler" in argv:
        valeur = argv[argv.index("--simuler") + 1]
        if valeur not in ("rupture", "disponible", "inconnu"):
            print("Valeurs acceptées : rupture, disponible, inconnu.")
            return 2
        alerte = construire(valeur, "simulation locale", lire_enregistre(), simule=True)
        ecrire(alerte)
        print(resume(alerte))
        print("\n(écrit dans %s — à titre de test)" % os.path.basename(SORTIE))
        return 0

    ancien = lire_enregistre()
    try:
        html = telecharger()
        etat, detail = analyser(html)
    except (urllib.error.URLError, TimeoutError, OSError, ValueError) as e:
        etat, detail = "inconnu", "page inaccessible (%s)" % type(e).__name__

    alerte = construire(etat, detail, ancien)
    ecrire(alerte)
    print(resume(alerte))

    # Code de sortie utile pour la CI : 0 = on a interrogé la boutique (même en rupture),
    # 1 = on n'a rien pu conclure. La CI ne doit pas crier sur une panne du site.
    return 0 if etat != "inconnu" else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
