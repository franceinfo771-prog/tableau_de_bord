"""Regenere la copie de secours de projets.json incluse dans index.html.

Le site doit fonctionner hors ligne : DEFAULT_DATA contient une copie
integrale des donnees. Elle doit rester identique a projets.json, sinon
le secours hors ligne affiche des chiffres faux.

Ce script reecrit uniquement le bloc DEFAULT_DATA, en gardant le style
du fichier (cles sans guillemets, chaines entre apostrophes).

Usage : python3 scripts/sync_donnees_embedded.py [--verifier]
"""

import io
import json
import os
import re
import subprocess
import sys

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(ICI)
INDEX = os.path.join(RACINE, "index.html")
DONNEES = os.path.join(RACINE, "projets.json")


def jsq(texte):
    """Une chaine JavaScript entre apostrophes."""
    if texte is None:
        return "null"
    if isinstance(texte, bool):
        return "true" if texte else "false"
    if isinstance(texte, (int, float)):
        return str(texte)
    echappe = (
        texte.replace("\\", "\\\\")
        .replace("'", "\\'")
        .replace("\n", "\\n")
        .replace("\r", "\\r")
    )
    return "'" + echappe + "'"


def cle(nom):
    """Une cle JavaScript : sans guillemets si c'est un identifiant."""
    if re.fullmatch(r"[A-Za-z_$][A-Za-z0-9_$]*", nom):
        return nom
    return jsq(nom)


def objets(liste, indentation, dans_tableau=False):
    """Serialise une liste d'objets, un par ligne, comme le fichier d'origine."""
    if not liste:
        return "[]"
    morceaux = []
    for element in liste:
        morceaux.append(" " * indentation + objet(element, indentation))
    return "[\n" + ",\n".join(morceaux) + "\n" + " " * (indentation - 2) + "]"


def objet(donnees, indentation):
    morceaux = []
    for nom, valeur in donnees.items():
        morceaux.append("%s: %s" % (cle(nom), valeur_js(valeur, indentation)))
    return "{ " + ", ".join(morceaux) + " }"


def projet(projet, indentation):
    """Un projet, sur plusieurs lignes comme dans le fichier d'origine."""
    pad = " " * indentation
    morceaux = [pad + "{"]
    for nom, valeur in projet.items():
        if nom == "etapes":
            morceaux.append("%s  etapes: [" % pad)
            for position, etape in enumerate(valeur):
                morceaux.append("%s    { t: %s, ok: %s%s }%s" % (
                    pad, jsq(etape.get("t", "")),
                    "true" if etape.get("ok") else "false",
                    ", custom: true" if etape.get("custom") else "",
                    "," if position < len(valeur) - 1 else ""))
            morceaux.append("%s  ]" % pad)
        else:
            morceaux.append("%s  %s: %s," % (pad, cle(nom), jsq(valeur)))
    morceaux.append(pad + "}")
    return "\n".join(morceaux)


def valeur_js(valeur, indentation):
    if isinstance(valeur, dict):
        return objet(valeur, indentation)
    if isinstance(valeur, list):
        if valeur and all(isinstance(x, str) for x in valeur):
            # simple liste de chaines : une par ligne
            morceaux = [" " * (indentation + 2) + jsq(x) for x in valeur]
            return "[\n" + ",\n".join(morceaux) + "\n" + " " * indentation + "]"
        if valeur and all(isinstance(x, list) for x in valeur):
            # paires de chaines : comme dans le fichier d'origine
            morceaux = []
            for paire in valeur:
                morceaux.append(" " * (indentation + 2) + "[" +
                                ", ".join(jsq(x) for x in paire) + "]")
            return "[\n" + ",\n".join(morceaux) + "\n" + " " * indentation + "]"
        return objets(valeur, indentation + 2)
    return jsq(valeur)


def bloc_default(donnees):
    morceaux = ["  const DEFAULT_DATA = {"]
    morceaux.append("    version: %s," % jsq(donnees.get("version", "")))

    morceaux.append("    projets: [")
    morceaux.append(",\n".join(projet(p, 6) for p in donnees["projets"]))
    morceaux.append("    ],")

    morceaux.append("    veille: [")
    morceaux.append(",\n".join("      { t: %s, s: %s, abouti: %s }" % (
        jsq(v.get("t", "")), jsq(v.get("s", "")),
        "true" if v.get("abouti") else "false") for v in donnees["veille"]))
    morceaux.append("    ],")

    morceaux.append("    condense: [")
    morceaux.append(",\n".join("      [%s, %s]" % (jsq(p[0]), jsq(p[1]))
                               for p in donnees["condense"]))
    morceaux.append("    ]")

    morceaux.append("  }")   # le point-virgule suit dans la page
    return "\n".join(morceaux)


def extraire(page):
    """Rend le bloc DEFAULT_DATA tel qu'il est dans la page."""
    debut = page.index("const DEFAULT_DATA = {")
    debut = page.rfind("\n", 0, debut) + 1   # debut de ligne, indentation comprise
    i = page.index("{", debut)
    niveau = 0
    for k in range(i, len(page)):
        if page[k] == "{":
            niveau += 1
        elif page[k] == "}":
            niveau -= 1
            if niveau == 0:
                return debut, k + 1
    raise RuntimeError("accolades non equilibrees")


def comparer(page, donnees):
    """Compare les donnees de la copie de secours a celles de projets.json.

    On compare le contenu, pas la mise en forme : le but est de verifier
    que le secours hors ligne montre les memes chiffres que le site.
    """
    debut, fin = extraire(page)
    source = page[debut:fin]
    temporaire = os.path.join("/tmp", "_sync_donnees_check.js")
    io.open(temporaire, "w", encoding="utf-8").write(
        "module.exports = " + source[source.index("{"):] + ";"
    )
    code = (
        'const d = require(%r);' % temporaire
        + 'const p = JSON.parse(require("fs").readFileSync(%r, "utf8"));' % DONNEES
        + 'console.log(JSON.stringify(d) === JSON.stringify(p) ? "identique" : "different");'
    )
    resultat = subprocess.run(["node", "-e", code], capture_output=True, text=True)
    return resultat.stdout.strip() == "identique"


def main():
    verifier = "--verifier" in sys.argv
    page = io.open(INDEX, encoding="utf-8").read()
    donnees = json.load(io.open(DONNEES, encoding="utf-8"))

    debut, fin = extraire(page)
    nouveau = bloc_default(donnees)
    if page[debut:fin] == nouveau:
        print("La copie de secours est deja a jour.")
        return 0

    if verifier:
        if comparer(page, donnees):
            print("La copie de secours est a jour (seule la mise en forme differe).")
            return 0
        print("DIVERGENCE : la copie de secours ne correspond pas a projets.json.")
        return 1

    page = page[:debut] + nouveau + page[fin:]
    io.open(INDEX, "w", encoding="utf-8", newline="\n").write(page)
    print("Copie de secours regeneree (%d projets, %d veille, %d condense)."
          % (len(donnees["projets"]), len(donnees["veille"]), len(donnees["condense"])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
