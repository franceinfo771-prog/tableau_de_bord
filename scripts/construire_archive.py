"""Construit l'archive « coffret » du tableau de bord.

L'archive doit se rouvrir toute seule, sans réseau, dans des années :

    COMMENCER-ICI.html        la page de démarrage (point d'entrée)
    MODE-D-EMPLOI.html        le mode d'emploi à lire ou à imprimer
    site/                     le site complet, prêt à s'ouvrir (pages, images, données)
    travail/                  les fichiers des projets, tels quels (voir plus bas)
    technique/                code source, données, consignes, vérifications
    archives/                 les sauvegardes .json exportées depuis le site
    LISEZ-MOI.txt             le même mode d'emploi, en texte brut

Les deux modèles HTML vivent dans `archive/` (ils sont versionnés) ; tout le
reste est recopié depuis le dépôt. Un seul exemplaire des images, pour que
l'archive reste légère et s'ouvre aussi bien sous Windows.

Le dossier `travail/` n'est PAS versionné : il vit dans `travaux/`, à la
racine, exclu par `.gitignore` (ces fichiers portent des liens Drive privés,
une clé de signature et un mot de passe — le dépôt est public). S'il est
absent, l'archive est construite sans lui, et le script le dit.

Usage :
    python3 scripts/construire_archive.py [--sortie DOSSIER]
"""

import os
import shutil
import subprocess
import sys
import tempfile

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOM = "tableau-de-bord-2026-11-19"

# Fichiers du site, tels qu'ils sont publiés.
SITE = ["index.html", "alerte-manette.json", "atelier.html", "projets.json", "robots.txt", ".nojekyll"]

# Pages secondaires publiées en plus (le « site complet »).
EXTRA = ["img", "geoula-a-televerser"]

# Le travail des projets, réuni depuis le Drive. NON versionné (voir plus haut).
# Chaque entrée : (dossier dans travaux/ , nom lisible dans l'archive).
TRAVAIL = [
    ("projet", "01-projet"),
    ("velo", "02-velo-electrique"),
    ("maquette", "03-maquette-portes"),
    ("voyages", "04-mes-voyages-a-bon-prix"),
    ("actualite", "05-actualite-avec-recul"),
    ("hachkaba", "06-hachkaba"),
    ("gods-eye", "07-gods-eye-view"),
    ("index-sites", "08-mes-sites-crees"),
    ("photos", "09-photos"),
]

# Ce qui part dans technique/.
TECHNIQUE = [
    "index.html", "alerte-manette.json", "projets.json", "robots.txt", ".nojekyll",
    "scripts", "ASSISTANT.md", "ETAT.md", "README.md", "etat.json", "APERCU.md",
    "atelier.html", "geoula-a-televerser", "img", "outils",
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


def page_sommaire(lignes):
    """Un sommaire HTML qui s'ouvre hors ligne et liste les fichiers du travail."""
    def poids(n):
        if n >= 1024 * 1024:
            return "%.1f Mo" % (n / 1024 / 1024)
        return "%.0f Ko" % (n / 1024)

    def echange(t):
        return (t.replace("&", "&amp;").replace("<", "&lt;")
                 .replace(">", "&gt;").replace('"', "&quot;"))

    groupes = {}
    for chemin, taille in lignes:
        dossier = chemin.split("/")[0]
        groupes.setdefault(dossier, []).append((chemin, taille))

    corps = []
    for dossier in sorted(groupes):
        corps.append("<h2>%s</h2>\n<ul>" % echange(dossier))
        for chemin, taille in groupes[dossier]:
            nom = chemin.split("/", 1)[1]
            corps.append('<li><a href="%s">%s</a> <span>%s</span></li>'
                         % (echange(chemin), echange(nom), poids(taille)))
        corps.append("</ul>")

    return """<!DOCTYPE html>
<html lang="fr">
<meta charset="utf-8">
<meta name="robots" content="noindex,nofollow">
<title>Travail des projets — sommaire</title>
<style>
 body{font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
      max-width:46rem;margin:0 auto;padding:2rem 1.25rem;color:#1c2024;background:#fbfbf9}
 h1{font-size:1.7rem;margin:0 0 .3rem}
 .intro{color:#555;margin:0 0 2rem}
 h2{font-size:1.05rem;margin:2rem 0 .5rem;padding-bottom:.3rem;
    border-bottom:1px solid #dcdfe3;text-transform:capitalize}
 ul{list-style:none;padding:0;margin:0}
 li{padding:.35rem 0;border-bottom:1px solid #f0f1f2;display:flex;
    justify-content:space-between;gap:1rem;flex-wrap:wrap}
 a{color:#0a58ca;text-decoration:none;word-break:break-all}
 a:hover{text-decoration:underline}
 span{color:#777;font-size:.85rem;white-space:nowrap}
 footer{margin-top:3rem;color:#777;font-size:.85rem}
</style>
<h1>Le travail des projets</h1>
<p class="intro">Tous les fichiers de tes projets, tels quels — ceux qui étaient
rangés dans ton Drive. Ce sont des copies : les originaux sont restés en place.
Rien ici n'a besoin d'Internet.</p>
%s
<footer>Archive du 19 novembre 2026. Ce sommaire s'ouvre sans réseau, sans
installation, et restera lisible dans dix ans : c'est du HTML, rien d'autre.</footer>
</html>
""" % "\n".join(corps)


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

    # 3. travail/ : les fichiers des projets, tels quels, avec un sommaire.
    #    Absent du dépôt (non versionné) : l'archive se construit sans lui
    #    plutôt que d'échouer.
    src_travail = os.path.join(RACINE, "travaux")
    travail = os.path.join(paquet, "travail")
    if os.path.isdir(src_travail):
        os.makedirs(travail)
        lignes = []
        for source, cible in TRAVAIL:
            dossier = os.path.join(src_travail, source)
            if not os.path.isdir(dossier):
                continue
            compte = copier(dossier, travail)
            shutil.move(compte, os.path.join(travail, cible))
            fichiers = sorted(
                f for f in os.listdir(os.path.join(travail, cible))
                if os.path.isfile(os.path.join(travail, cible, f))
            )
            for f in fichiers:
                lignes.append((cible + "/" + f, os.path.getsize(os.path.join(travail, cible, f))))
        with open(os.path.join(travail, "INDEX.html"), "w", encoding="utf-8") as f:
            f.write(page_sommaire(lignes))
        print("Travail : %d fichiers dans travail/ (%.1f Mo)"
              % (len(lignes), sum(t for _, t in lignes) / 1024 / 1024))
    else:
        print("Travail : dossier travaux/ absent — archive construite sans travail/ "
              "(voir scripts/construire_archive.py).")

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
                 os.path.join(dest_archives, "projets-du-jour-2026-11-19.json"))
    with open(os.path.join(dest_archives, "LISEZ-MOI.txt"), "w", encoding="utf-8") as f:
        f.write(
            "Sauvegardes\n"
            "===========\n\n"
            "projets-du-jour-2026-11-19.json : l'état du tableau au moment de l'archive.\n\n"
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
