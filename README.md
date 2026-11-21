# Tableau de bord — Mes projets

Tableau de bord autonome de suivi de six projets, de la veille et du condensé.

- **Site en ligne** : https://franceinfo771-prog.github.io/tableau_de_bord/
- **Version texte** : `ETAT.md`
- **Porte privée** : `conversation.html` — page non publiée dans les liens, `noindex`, un seul
  lien sortant (règle de l'adresse une fois). Vérifiée par `scripts/verif_porte.js`.
- **Aucune dépendance externe** : `index.html` + `projets.json`, utilisables en ligne comme hors ligne, sans compte ni script de suivi (`noindex, nofollow` + `robots.txt`).

## État au 19 novembre 2026

**7 projets · 3 terminés · 30 / 42 étapes faites (71 %) · 14 recherches de veille.**

| Projet | Avancement | Statut | Prochaine action / Point ouvert |
|---|---:|---|---|
| Notes de recherche | 3 / 3 (100 %) | ✅ Terminé | Gardée privée pour l'instant (décidé le 15/11) |
| Les sites | 10 / 10 (100 %) | ✅ Terminé (abouti le 18/11) | Veille datée d'octobre, rafraîchie quand il y aura du nouveau |
| Une application de poche | 4 / 6 (67 %) | 🟡 En cours | Installer l'application sur un téléphone réel |
| Maquette — une porte qui fait joli | 2 / 4 (50 %) | 🟡 En cours | Regarder l'épreuve : ça tient ? ça se voit à un mètre ? ça se photographie ? |
| Vélo électrique DIY | 4 / 9 (44 %) | 🟣 Commencé | Attendre la manette : AdreaPocket `5F36POIGELTROT`, 13,99 €, **en rupture** (relevé du 19/11, à la main) |
| Assistants en ligne | 2 / 5 (40 %) | 🟣 Commencé | Les tester sur 2-3 tâches réelles du quotidien |
| IA locale sur vieux PC — mesurée | 5 / 5 (100 %) | ✅ Terminé (21/11) | Verdict posé : Ollama tourne, ne rend pas de service |

## Données : `projets.json`

Les données affichées (projets, veille, condensé) vivent dans **`projets.json`**, à la racine du dépôt. `index.html` le charge au démarrage ; si le fichier est inaccessible (ouverture hors ligne), une copie de secours intégrée à la page prend le relais. Les modifications faites dans le navigateur sont gardées sur l'appareil (`localStorage`) et
peuvent être exportées en fichier JSON depuis le bouton **Sauvegarder**. Ce bouton **ne publie
rien** : la publication se fait depuis la session de travail (branche → PR → fusion).

## Ce que le site ne montre pas (19 novembre 2026)

Le tableau de bord est public ; son mode de fabrication ne l'est pas. Ont été retirés de
l'interface : l'encadré « Mon assistant Arena » et son premier message à copier, les boutons
« Enregistrer sur GitHub », la modale de réglage de la clé et les textes de statut de
publication. Le nom de l'hébergeur a aussi disparu de la note de confidentialité (le fait
reste dit, la marque non).

**L'outillage reste dans le code, muet.** Rien ne l'appelle : `scripts/verif_copie_commande.js`
(25 contrôles) vérifie qu'aucun de ces éléments ne réapparaît à l'écran. Conséquence assumée :
corriger une coche dans le navigateur ne publie plus rien — la modification reste sur
l'appareil et sera reportée à la prochaine mise à jour faite depuis la session de travail.

`atelier.html` (non liée depuis le site, mais présente à la racine) a été nettoyée de même :
« Activer GitHub Pages » devient « Mettre le site en ligne », la procédure d'activation et
l'adresse par défaut sont décrites sans marque. Le contrôle couvre toutes les pages publiques.

## Alerte de stock : la manette du vélo

La poignée retenue (AdreaPocket `5F36POIGELTROT`, 13,99 €) est en rupture. Plutôt que de
regarder la page à la main :

- `scripts/verifier_manette.py` lit la fiche produit (bibliothèque standard seule) et décide
  **rupture / disponible / inconnu** — jamais « disponible » sur une page illisible ;
- le robot (`outils/alerte-manette/alerte-manette.yml`) est prévu pour le lancer chaque matin à
  7 h 20 et publier `alerte-manette.json` — **mais il ne se réveille pas** : aucune exécution
  planifiée n'a jamais eu lieu (constat du 20/11, décision : laisser tel quel). Le relevé se fait
  donc à la main, et le tableau affiche le dernier relevé connu avec sa date ;
- le jour où la poignée revient, le même workflow **ouvre un ticket GitHub** (« En stock : la poignée
  du vélo ») — c'est lui qui envoie la notification par e-mail ; il se referme seul si la rupture revient ;
- `index.html` affiche ce relevé sur la carte du vélo — et **rien** si le fichier manque.

Le robot n'écrit **que** ce fichier (et des tickets, jamais du code) : c'est la seule exception,
bornée, à la règle « pas de modification directe sur `main` ».

**En service depuis le 19/11 à 10 h 47.** Le premier passage a réussi : la fiche a été lue depuis
les serveurs GitHub, le verdict `rupture` publié dans un commit signé « Alerte manette » (`07458b2`).
Un relevé par jour, donc un commit par jour — c'est voulu, cela garde aussi la tâche planifiée
éveillée (GitHub l'endort après ~60 jours sans activité sur le dépôt).

**Deux fichiers, un seul robot.** GitHub n'autorise pas l'application de l'assistant à écrire dans
`.github/workflows/` (droit `workflows` absent) : la copie **active** a donc été posée à la main
dans l'onglet Actions, et la **source** versionnée vit dans `outils/alerte-manette/`. Toute
modification doit passer par les deux ; `scripts/activer_alerte.sh` recopie la source et
`--etat` dit si la copie active existe.

Test hors ligne : `python3 scripts/verifier_manette.py --simuler disponible`, puis
`python3 scripts/verifier_manette.py --lire`.

## Page d'accueil de démonstration : `accueil.html`

Une page de présentation, pensée pour montrer le tableau de bord à quelqu'un qui ne le connaît pas : trois phrases sur ce que c'est, les trois choses à essayer (ouvrir un projet, cocher une étape, chercher), les chiffres du jour, puis un bouton **Entrer dans le tableau de bord**. Elle relit `projets.json` pour afficher des chiffres justes, et garde des nombres écrits en dur si le fichier n'est pas joignable (ouverture par double-clic). Le tableau renvoie vers elle par un lien **← Accueil** dans la barre de navigation.

## Fonctionnalités de `index.html`

- **Corriger** (bouton en haut) : écran à gros pavés pour corriger un projet (titre, idée, critère de fin, point ouvert, suppression), les étapes d'un projet (renommer, cocher, monter/descendre, ajouter, supprimer), ajouter un nouveau projet, corriger ou ajouter une fiche de veille.
- **Sauvegarder** (bouton en haut) : exporte l'état de l'appareil en fichier JSON, l'importe,
  copie un résumé texte ou réinitialise. **Ne publie rien** — la publication passe par la
  session de travail (branche → PR → fusion). Vérifié par `scripts/verif_sauvegarde.js`.
- **Où ça en est** : affiche, pour chaque projet ouvert, l'étape qui débloque la suite. C'est
  un repère, pas une consigne (voir la règle 0 d'`ASSISTANT.md`).
- **Pas d'IA locale** (décision du 19/11) : le PC de la maison est un vieux PC, il ne peut pas
  faire tourner un modèle. Le projet ne garde que les assistants en ligne. La rubrique qui
  existait quelques heures a été retirée ; `scripts/verif_ia_locale.js` (**18 contrôles**)
  empêche son retour et vérifie que la décision reste écrite.
- **Cases interactives** : cocher/décocher une étape recalcule immédiatement les barres, les pourcentages et l'étape suivante, avec mémorisation locale (`localStorage`). Cocher est un confort, jamais une obligation : le tableau suit.
- **Ajout rapide** : ajout d'étapes, de projets ou d'entrées de veille localement.
- **Sauvegarde portable** : export/import en JSON, copie du résumé en texte brut, impression PDF propre.
- **Recherche locale** : recherche instantanée sans réseau dans toute la page.
- **Lien direct vers un projet** : une adresse terminée par `#proj-<id>` (ex. `…#proj-velo`) ouvre le projet au démarrage, déplie ses étapes et fait défiler jusqu'à lui. Le changement d'ancre après coup (`hashchange`) et les liens de l'aperçu, de « Où ça en est » ou de la recherche font la même chose ; si un filtre masquait le projet, il revient à « Tous ».

## Archive « coffret » (mode d'emploi inclus)

```bash
python3 scripts/construire_archive.py     # produit tableau-de-bord-AAAA-MM-JJ.zip
node scripts/verif_archive.js            # vérifie l'archive comme si on l'ouvrait par double-clic
```

L'archive se suffit à elle-même : `COMMENCER-ICI.html` (page de démarrage), `MODE-D-EMPLOI.html` et `LISEZ-MOI.txt` (le mode d'emploi, imprimable), `site/` (le site complet, hors ligne), `travail/` (les fichiers des projets), `technique/` (code, données, consignes, scripts) et `archives/` (sauvegardes `.json`). Elle fonctionne sans réseau et s'ouvre aussi bien sous Windows que sous Mac ou Linux. Les modèles des deux pages vivent dans `archive/`.

### `travail/` — le travail des projets, hors Git

`travail/` réunit les fichiers des projets rangés dans le Drive : code Arduino du vélo, fiches techniques, APK, archives des sites, photos. Ils sont rangés dans `travaux/` à la racine, **exclu par `.gitignore`** — ce dépôt est public et ces fichiers portent des liens Drive privés, une clé de signature et un mot de passe. `scripts/construire_archive.py` les recopie dans `travail/` avec un sommaire `travail/INDEX.html`. Si `travaux/` est absent, l'archive se construit sans cette partie (30 vérifications au lieu de 33) : rien n'échoue.

## Ouvrir en local

```bash
python3 -m http.server 8000
# Ouvrir http://localhost:8000
```

## Vérifier avant de publier
```bash
node scripts/verif_rendu.js        # rendu headless : 0 erreur JS, comptes, boutons intacts
node scripts/verif_ancre.js        # liens #proj-…, sauts, brouillon local, cochage
node scripts/verif_accueil.js      # page de présentation : bouton, raccourcis, chiffres
node scripts/verif_alerte_manette.js  # alerte de stock : module Python, fichier publié, affichage
node scripts/verif_sauvegarde.js   # bouton Sauvegarder : export, import, reset, aucune publication
node scripts/verif_porte.js        # porte privée : un seul lien sortant, réglage gardé
node scripts/verif_ia_locale.js    # l'IA locale reste arrêtée : ni rubrique, ni chat, ni modèle
node scripts/verif_archive.js      # archive livrée : contenu, liens, ouverture hors ligne
node scripts/verif_copie_commande.js  # façade : aucune mention d'Arena/GitHub/clé ne doit s'afficher
python3 scripts/sync_donnees_embedded.py --verifier
```

## Mettre à jour `etat.json`

```bash
./scripts/etat.sh
```
