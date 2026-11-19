# Alerte de stock — la manette du vélo

Ce dossier contient **la source du robot** qui surveille la poignée du vélo
(AdreaPocket `5F36POIGELTROT`, 13,99 €, en rupture au 19/11/2026).

## Pourquoi la source est ici et pas dans `.github/workflows/`

GitHub interdit à l'application utilisée par l'assistant de créer ou modifier un
fichier dans `.github/workflows/`. Le push est refusé, et l'API répond
« Resource not accessible by integration ». Le robot est donc écrit ici, à un
endroit normal, et **un seul geste** le met en place.

## L'activer (3 clics, une seule fois)

1. Onglet **Actions** du dépôt → bouton **New workflow** → lien
   **« set up a workflow yourself »**.
2. Effacer le contenu proposé, **coller** le contenu de
   `alerte-manette.yml` (ce dossier), puis **Commit changes** sur `main`.
3. Onglet **Actions** → « Alerte manette du vélo » → **Run workflow** pour un
   premier essai immédiat.

En local (ou dans une session Arena qui a le droit `workflows`) :

```bash
./scripts/activer_alerte.sh          # copie la source vers .github/workflows/
./scripts/activer_alerte.sh --etat   # dit si l'alerte est active
git add .github/workflows/alerte-manette.yml
git commit -m "Active l'alerte manette"
git push
```

## Ce que fait le robot

| Moment | Action |
|---|---|
| Chaque matin 7 h 20 (Paris) | `python3 scripts/verifier_manette.py` lit la fiche |
| Si l'état change | commit de `alerte-manette.json` sur `main` |
| Si la poignée revient | ouvre un ticket « En stock : la poignée du vélo » (notification e-mail) |
| Si la rupture revient | referme ce ticket |

Rien d'autre n'est modifié : ni le site, ni le code.

## À savoir

- Une panne de la boutique ne déclenche **aucune** fausse alerte : le module
  répond « inconnu » et ne touche pas au dernier état connu.
- GitHub désactive une tâche planifiée après ~60 jours **sans activité sur le
  dépôt** ; un simple passage ici (ou un clic sur « Run workflow ») la relance.
- Test hors ligne, sans réseau :
  `python3 scripts/verifier_manette.py --simuler disponible` puis `--lire`.
