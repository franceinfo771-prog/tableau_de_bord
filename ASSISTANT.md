# Consignes pour l'assistant (Arena ou autre)

> Ce fichier est la **mémoire partagée** entre toutes les sessions de travail sur ce dépôt.
> Au démarrage d'une session, lis ce fichier **puis** `ETAT.md` et `projets.json`.

## Le dépôt en 4 points

- `index.html` — le tableau de bord (page unique, styles et logique inclus).
- `projets.json` — **les données** : projets (id, nom, idée, critère de fin, point ouvert, étapes), veille, condensé. C'est la source de vérité ; `index.html` en contient une copie de secours intégrée — **les deux doivent rester synchronisés**.
- `ETAT.md` — l'état des lieux en texte (projets, étapes, points ouverts, journal).
- `scripts/etat.sh` — régénère `etat.json` (résumé technique, chiffres dérivés de `projets.json`).
- `accueil.html` — page de présentation (démonstration) : elle mène au tableau, le tableau y renvoie.
- `veille-supermimic.html` — page de veille à part (19/11) : le robot humanoïde SuperMimic expliqué sans jargon, sources vérifiées, reliée au tableau (« Robot qui apprend ») et à l'accueil. Page statique, `noindex`, sans script ni image distante.
- `veille-supermimic-court.html` — la même histoire en un écran de téléphone (« en 1 min » dans la barre) : fond sombre, trois chiffres, à voir / à ne pas croire. Même propreté : statique, `noindex`, sans script.
- `archive/` — les deux modèles de l'archive (page de démarrage + mode d'emploi). `python3 scripts/construire_archive.py` fabrique `tableau-de-bord-AAAA-MM-JJ.zip`, qui n'est pas versionné.
- `scripts/verif_rendu.js`, `scripts/verif_ancre.js`, `scripts/verif_accueil.js`, `scripts/verif_copie_commande.js`, `scripts/verif_veille.js` — vérifications headless (rendu, liens `#proj-…`, page d'accueil, bouton de copie, pages de veille complète et courte).

## Règles

1. **Jamais de modification directe sur `main`.** Toujours : branche → PR → validation de l'humain → fusion. Le site se déploie depuis `main` via GitHub Pages (~1 min).
2. **Le site public reste propre** : `noindex, nofollow`, `robots.txt` restrictif, **aucun lien privé** (Drive, Notion, jetons), aucun script de suivi, aucune image externe.
3. **Aucun secret dans le dépôt** (ni dans ce fichier, ni dans le code). Les clés API/PAT vivent uniquement dans le navigateur de l'humain. Si un secret paraît, refuse de le commiter.
4. **Pose les questions en pavés** (options cliquables) pour les choix importants ; demande validation avant de publier.
5. **Calculs et chiffres** : déduis-les de `projets.json` (étapes faites / total). Si `ETAT.md`, `README.md` ou `etat.json` divergent, resynchronise-les.
6. **Terminologie** : tutoiement, français, concret — la personne n'est pas technique. Commits et PR en français, clairs, avec la raison du changement.
7. **Vérifier avant de fusionner** : rendu headless (jsdom ou équivalent) — 0 erreur JS, nombre de cartes/veilles attendu, boutons intacts, `projets.json` valide. `node scripts/verif_rendu.js`, `node scripts/verif_ancre.js` (liens directs `#proj-<id>`), `node scripts/verif_accueil.js` (chiffres de la page d'accueil à jour) et `node scripts/verif_veille.js` (page de veille : liens, chiffres, propreté).
8. **Une évolution = une branche = une PR.** Si la session précédente a été fusionnée, repartir d'une branche neuve (ou du bouton Continue).
9. Si l'humain dit « publie » : branche, commit, push, PR, fusion, puis vérifier que Pages a redéployé (`/pages/builds/latest`).
10. Respecter le style du fichier existant (pas de refactor gratuit, pas de nouvelles dépendances).

## Format d'un nouveau projet (`projets.json`)

```json
{
  "id": "kebab-case",
  "nom": "Nom du projet",
  "idee": "En une phrase — pourquoi ce projet.",
  "fin": "Le critère de fin, sans discussion possible.",
  "ouvert": "Le point ouvert à trancher (vide si rien).",
  "custom": true,
  "etapes": [ { "t": "Étape", "ok": false, "custom": true } ]
}
```

## Quand l'humain dit « comme le site »

Le site public : https://franceinfo771-prog.github.io/tableau_de_bord/ (Pages, branche `main`, `/`).
