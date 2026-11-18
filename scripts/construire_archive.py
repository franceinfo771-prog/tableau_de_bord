"""Construit l'archive « coffret » du tableau de bord.

L'archive doit se rouvrir toute seule, sans réseau, dans des années :

    COMMENCER-ICI.html        la page de démarrage (point d'entrée)
    MODE-D-EMPLOI.html        le mode d'emploi à lire ou à imprimer
    site/                     le site complet, prêt à s'ouvrir (pages, images, données)
    technique/                code source, données, consignes, vérifications
    archives/                 les sauvegardes .json exportées depuis le site
    LISEZ-MOI.txt             le même mode d'emploi, en texte brut

Les deux modèles HTML vivent dans `archive/` (ils sont versionnés) ; tout le
reste est recopié depuis le dépôt. Un seul exemplaire des images, pour que
l'archive reste légère et s'ouvre aussi bien sous Windows.

Usage :
    python3 scripts/construire_archive.py [--sortie DOSSIER]
"""

import os
import shutil
import subprocess
import sys
import tempfile

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOM = "tableau-de-bord-2026-11-18"

# Fichiers du site, tels qu'ils sont publiés.
SITE = ["index.html", "accueil.html", "atelier.html", "projets.json", "robots.txt", ".nojekyll"]

# Pages secondaires publiées en plus (le « site complet »).
EXTRA = ["img", "geoula-a-televerser"]

# Ce qui part dans technique/.
TECHNIQUE = [
    "index.html", "accueil.html", "projets.json", "robots.txt", ".nojekyll",
    "scripts", "ASSISTANT.md", "ETAT.md", "README.md", "etat.json", "APERCU.md",
    "atelier.html", "geoula-a-televerser", "img",
]


def copier(src, dst_dir):
    """Copie un fichier ou un dossier (sans le bruit : __pycache__, node_modules…)."""
    base = os.path.basename(src)
    dst = os.path.join(dst_dir, base)
    if os.path.isdir(src):
        shutil.copytree(src, dst, ignore=shutil.ignore_patterns(
            "__pycache__", "node_modules", "*.pyc", ".DS_Store", "*.log"))
    else:
        shutil.copy2(src, dst)
    return dst


def main():
    sortie = None
    if "--sortie" in sys.argv:
        sortie = sys.argv[sys.argv.index("--sortie") + 1]
    tmp = tempfile.mkdtemp(prefix="archive-tdb-")
    paquet = os.path.join(tmp, NOM)
    os.makedirs(paquet)

    # 1. Les deux pages de l'archive.
    for modele, cible in [("MODELE-COMMENCER-ICI.html", "COMMENCER-ICI.html"),
                          ("MODELE-MODE-D-EMPLOI.html", "MODE-D-EMPLOI.html")]:
        shutil.copy2(os.path.join(RACINE, "archive", modele), os.path.join(paquet, cible))

    # 2. site/ : le site complet, prêt à s'ouvrir (pages, données, images).
    #    Un seul exemplaire des images : pas de lien symbolique, qui ne survit
    #    pas à l'extraction sous Windows.
    site = os.path.join(paquet, "site")
    os.makedirs(site)
    for f in SITE:
        chemin = os.path.join(RACINE, f)
        if os.path.exists(chemin):
            copier(chemin, site)
    for d in EXTRA:
        chemin = os.path.join(RACINE, d)
        if os.path.isdir(chemin):
            copier(chemin, site)

    # 4. technique/ : de quoi reprendre le travail.
    tech = os.path.join(paquet, "technique")
    os.makedirs(tech)
    for f in TECHNIQUE:
        chemin = os.path.join(RACINE, f)
        if os.path.exists(chemin):
            copier(chemin, tech)
    os.makedirs(os.path.join(tech, "archive"), exist_ok=True)
    for modele in ["MODELE-COMMENCER-ICI.html", "MODELE-MODE-D-EMPLOI.html"]:
        shutil.copy2(os.path.join(RACINE, "archive", modele), os.path.join(tech, "archive", modele))

    # 5. archives/ : les sauvegardes exportées depuis le site, s'il y en a.
    dest_archives = os.path.join(paquet, "archives")
    os.makedirs(dest_archives)
    shutil.copy2(os.path.join(RACINE, "projets.json"),
                 os.path.join(dest_archives, "projets-du-jour-2026-11-18.json"))
    with open(os.path.join(dest_archives, "LISEZ-MOI.txt"), "w", encoding="utf-8") as f:
        f.write(
            "Sauvegardes\n"
            "===========\n\n"
            "projets-du-jour-2026-11-18.json : l'état du tableau au moment de l'archive.\n\n"
            "C'est exactement le format du bouton « Sauvegarder → Exporter » du site.\n"
            "Pour le recharger plus tard : ouvrir le tableau, bouton « Sauvegarder »,\n"
            "puis « Importer », et choisir ce fichier.\n"
        )

    # 6. LISEZ-MOI.txt : la version texte du mode d'emploi.
    shutil.copy2(os.path.join(RACINE, "archive", "MODE-D-EMPLOI.txt"),
                 os.path.join(paquet, "LISEZ-MOI.txt"))

    # 7. Compression.
    base = os.path.join(sortie or RACINE, NOM)
    os.makedirs(os.path.dirname(base) or ".", exist_ok=True)
    zip_path = base + ".zip"
    if os.path.exists(zip_path):
        os.remove(zip_path)
    subprocess.run(["zip", "-r", "-q", zip_path, NOM], cwd=tmp, check=True)

    taille = os.path.getsize(zip_path) / 1024 / 1024
    print("Archive : %s (%.1f Mo)" % (zip_path, taille))
    shutil.rmtree(tmp)
    return 0


if __name__ == "__main__":
    sys.exit(main())
