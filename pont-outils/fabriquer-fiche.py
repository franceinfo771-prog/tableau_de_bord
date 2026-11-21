#!/usr/bin/env python3
"""Fabrique la fiche mémoire que lit la page de dialogue locale.

Pourquoi une fiche et pas ETAT.md entier ? Parce qu'un modèle de 1 milliard de
paramètres ne lit pas 34 000 caractères : il en oublie la moitié avant d'arriver
au bout. La fiche tient en 4 000 caractères — deux pages — et ne contient que ce
qui sert à répondre : les chiffres, les projets, ce qui est vivant.

Le script écrit deux choses :
  1. `pont-outils/fiche.txt` — la fiche en clair, pour la relire à la main ;
  2. le bloc entre les marqueurs `FICHE-MEMOIRE:DEBUT` et `FICHE-MEMOIRE:FIN`
     dans `pont-outils/chat.html` — pour que la page marche en double-clic,
     sans serveur et sans rien télécharger.

Aucun chiffre n'est recopié à la main : tout vient de `projets.json` et de
`ETAT.md`. Si les données changent, on relance ce script.

Usage :
    python3 pont-outils/fabriquer-fiche.py
"""
import json
import re
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
PLAFOND = 4000          # caractères visés pour la fiche
PLAFOND_DUR = 4600      # au-delà, le script échoue : la fiche serait illisible


def lire_projets():
    return json.loads((RACINE / "projets.json").read_text(encoding="utf-8"))


def bloc_etat(titre, texte, suivant="## "):
    """Extrait une section de ETAT.md à partir de son titre de niveau 2."""
    motif = re.compile(r"^" + re.escape(titre) + r"\s*$", re.M)
    m = motif.search(texte)
    if not m:
        return ""
    debut = m.end()
    fin = texte.find("\n" + suivant, debut)
    return texte[debut: fin if fin != -1 else len(texte)].strip()


def nettoyer(markdown):
    """Enlève ce qui n'apporte rien au modèle : citations, gras, puces."""
    lignes = []
    for ligne in markdown.splitlines():
        ligne = ligne.strip()
        if not ligne or ligne.startswith(">") or set(ligne) <= {"-", " "}:
            continue
        ligne = re.sub(r"^#{1,6}\s*", "", ligne)
        ligne = re.sub(r"\*\*(.+?)\*\*", r"\1", ligne)
        ligne = re.sub(r"`(.+?)`", r"\1", ligne)
        ligne = re.sub(r"\[(.)\]\((.*?)\)", r"\1", ligne)
        ligne = re.sub(r"^[-*]\s+", "- ", ligne)
        lignes.append(ligne)
    return lignes


def resume_projets(donnees):
    """Une ligne par projet : nom, avancement, étape suivante."""
    lignes = []
    for projet in donnees["projets"]:
        etapes = projet.get("etapes", [])
        faites = sum(1 for e in etapes if e.get("ok"))
        total = len(etapes)
        pct = round(100 * faites / total) if total else 0
        etat = "terminé" if total and faites == total else "en cours"
        lignes.append(f"- {projet['nom']} : {faites}/{total} ({pct} %), {etat}")

        restantes = [e["t"] for e in etapes if not e.get("ok")]
        if restantes:
            suite = re.sub(r"[`*]", "", restantes[0])
            if len(suite) > 90:
                suite = suite[:87] + "…"
            lignes.append(f"  Étape suivante : {suite}")
    return lignes


def construire():
    texte_etat = (RACINE / "ETAT.md").read_text(encoding="utf-8")
    donnees = lire_projets()

    lignes = []
    lignes.append("FICHE MÉMOIRE DU SITE — tableau de bord personnel")
    lignes.append("")
    lignes.append("Ce que c'est : un tableau de bord public, mais non indexé, qui suit des")
    lignes.append("projets personnels. Les données vivent dans projets.json ; ce fichier")
    lignes.append("les résume. Ce site se publie par commit sur main, jamais par")
    lignes.append("téléversement de fichier.")
    lignes.append("")

    lignes.append("CHIFFRES")
    for ligne in nettoyer(bloc_etat("## Vue d'ensemble", texte_etat)):
        lignes.append(ligne)
    lignes.append("")

    lignes.append("PROJETS")
    lignes.extend(resume_projets(donnees))
    lignes.append("")

    lignes.append("CE QUI EST VIVANT")
    for ligne in nettoyer(bloc_etat("## Où ça en est (l'étape qui débloque la suite, par projet ouvert)", texte_etat)):
        lignes.append(ligne)
    lignes.append("")

    lignes.append("RÈGLES DE TRAVAIL")
    lignes.append("- Tutoiement, une seule chose à la fois, ton doux et direct.")
    lignes.append("- Aucune clé, aucun service extérieur, aucune IA dans le site.")
    lignes.append("- Un projet est terminé quand toutes ses étapes sont cochées.")
    lignes.append("- Le site est un service, pas un devoir : jamais « il faut ».")
    lignes.append("- Les chiffres ne se recopient pas à la main : ils se déduisent.")
    lignes.append("")

    lignes.append("CE QU'IL NE FAUT PAS CROIRE")
    lignes.append("- L'IA locale (Ollama, modèle 1B) tourne sur la machine, mais elle")
    lignes.append("  ne résume pas. Elle raconte. Elle ne connaît rien du site")
    lignes.append("  au-delà de cette fiche, et elle invente si on lui demande")
    lignes.append("  autre chose.")
    lignes.append("- Les infos de ce site ne sont pas sensibles : ce sont des")
    lignes.append("  activités personnelles. Ce n'est pas un secret.")

    fiche = "\n".join(lignes).strip()

    if len(fiche) > PLAFOND_DUR:
        print(f"FICHE TROP LONGUE : {len(fiche)} caractères (plafond {PLAFOND_DUR})")
        return None, fiche
    return fiche, fiche


def ecrire_dans_page(fiche):
    page = RACINE / "pont-outils" / "chat.html"
    if not page.exists():
        print("chat.html absent : la fiche est écrite, la page reste à créer")
        return False
    contenu = page.read_text(encoding="utf-8")
    debut = contenu.find("/* FICHE-MEMOIRE:DEBUT */")
    fin = contenu.find("/* FICHE-MEMOIRE:FIN */")
    if debut == -1 or fin == -1:
        print("Marqueurs absents de chat.html : rien remplacé")
        return False
    # Le texte part dans un littéral gabarit : on neutralise ce qui le casserait.
    sur = fiche.replace("\\", "\\\\").replace("`", "'").replace("${", "$ {")
    nouveau = (
        contenu[:debut]
        + "/* FICHE-MEMOIRE:DEBUT */\nconst FICHE_MEMOIRE = `"
        + sur
        + "`;\n/* FICHE-MEMOIRE:FIN */"
        + contenu[fin + len("/* FICHE-MEMOIRE:FIN */"):]
    )
    page.write_text(nouveau, encoding="utf-8")
    return True


def main():
    fiche, _ = construire()
    if fiche is None:
        sys.exit(1)

    sortie = RACINE / "pont-outils" / "fiche.txt"
    sortie.write_text(fiche + "\n", encoding="utf-8")
    print(f"fiche.txt : {len(fiche)} caractères (plafond {PLAFOND})")

    if ecrire_dans_page(fiche):
        print("chat.html : fiche intégrée")

    if len(fiche) > PLAFOND:
        print("ATTENTION : au-dessus du plafond visé, mais sous le plafond dur")


if __name__ == "__main__":
    main()
