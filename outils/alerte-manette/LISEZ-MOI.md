# Alerte de stock — la manette du vélo

Ce dossier contient **la source du robot** qui surveille la poignée du vélo
(AdreaPocket `5F36POIGELTROT`, 13,99 €, en rupture au 19/11/2026).

**État : en service depuis le 19/11/2026 à 10 h 47.** Le premier passage a réussi
de bout en bout — fiche lue depuis les serveurs GitHub, verdict `rupture`,
relevé publié dans un commit signé « Alerte manette » (`07458b2`).

## Pourquoi la source est ici et pas seulement dans `.github/workflows/`

GitHub interdit à l'application utilisée par l'assistant d'écrire dans
`.github/workflows/` : le push est refusé, l'API répond « Resource not
accessible by integration ». La copie **active** a donc été posée à la main dans
l'onglet Actions, et ce dossier garde la version **lisible, relue et
versionnée**. Les deux ont le même comportement — un contrôle automatique le
vérifie à chaque passage de `scripts/verif_alerte_manette.js`.

## Si l'on doit modifier le robot

Modifier **la source ici**, puis recopier vers la copie active :

```bash
./scripts/activer_alerte.sh          # recopie la source vers .github/workflows/
./scripts/activer_alerte.sh --etat   # dit si la copie active existe
git add .github/workflows/alerte-manette.yml
git commit -m "Met à jour le robot d'alerte manette"
git push
```

Si la session n'a pas le droit `workflows` (c'est le cas de l'assistant), le push
sera refusé : il faut alors recopier le fichier à la main dans l'onglet Actions,
et ne pas oublier de le faire — sinon la source et la copie active divergent.

## Le premier lancement (déjà fait, pour mémoire)

Onglet **Actions** → « Alerte manette du vélo » → **Run workflow** : c'est ce qui
a produit le commit du 19/11 à 10 h 47.

## Ce que fait le robot

| Moment | Action |
|---|---|
| Chaque matin 7 h 20 (Paris) | `python3 scripts/verifier_manette.py` lit la fiche |
| À chaque passage | commit de `alerte-manette.json` (l'heure du relevé change, donc un commit par jour) |
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
