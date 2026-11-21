# Consignes pour l'assistant (Arena ou autre)

> **La source unique, quand deux documents se contredisent.** `ETAT.md` fait foi : c'est
> l'état vivant. `ARCHIVE-SESSION-17-11.md` et `APERCU.md` sont des **traces datées** —
> jamais l'état. `IA-LOCALE.md` est un **dossier d'impasse** que le 21/11 a démenti.
> Ce qui a déjà été fait, réussi ou raté, et ce que les erreurs ont coûté : `ETAT-DES-LIEUX.md`.
> Les chiffres ne se recopient jamais d'un document à l'autre : ils se lisent dans `projets.json`.

> Ce fichier est la **mémoire partagée** entre toutes les sessions de travail sur ce dépôt.
> Au démarrage d'une session : lis ce fichier, **puis suis l'ordre de lecture écrit en tête
> d'`ETAT.md`** (section « Reprendre la conversation ») : cette section, `projets.json`, le
> journal, le détail des projets, la veille rangée. **Un seul chemin, cinq étapes** — les huit
> documents de la racine ne se lisent pas au hasard. Une session neuve ne doit jamais faire
> répéter l'humain.

## Le dépôt en 4 points

- `index.html` — le tableau de bord (page unique, styles et logique inclus).
- `projets.json` — **les données** : projets (id, nom, idée, critère de fin, point ouvert, étapes), veille, condensé. C'est la **seule** source de vérité. `index.html` n'en contient plus aucune copie (décidé le 21/11) : s'il manque, la page affiche un avertissement au lieu de chiffres périmés.
- `ETAT.md` — l'état des lieux en texte (projets, étapes, points ouverts, journal).
- `scripts/etat.sh` — régénère `etat.json` (résumé technique, chiffres dérivés de `projets.json`).
- **Une seule page publique** : `index.html`. La page de présentation `accueil.html` a été supprimée le 21/11 — deux pages proches de nom, c'était un piège à confusions. L'adresse du site affiche le tableau, et rien d'autre.
- `IA-LOCALE.md` — **dossier de l'impasse** : l'IA locale a été arrêtée le 19/11 (le PC de la maison
  est un vieux PC). Le projet ne garde que les assistants en ligne. **Ne pas reproposer de faire
  tourner un modèle sur cette machine**, ni de rubrique « IA locale » dans le site.
- `conversation.html` — **page privée** (non liée, `noindex`) : la porte vers la conversation qui
  connaît le dépôt. Un seul lien sortant, réglable et gardé sur l'appareil. Elle n'est pas un
  chat : ne jamais y promettre une réponse de l'assistant. Contrôles : `scripts/verif_porte.js`.
- `archive/` — les deux modèles de l'archive (page de démarrage + mode d'emploi). `python3 scripts/construire_archive.py` fabrique `tableau-de-bord-AAAA-MM-JJ.zip`, qui n'est pas versionné.
- `alerte-manette.json` + `outils/alerte-manette/` + `scripts/verifier_manette.py` — alerte de stock de la manette du vélo : relevé quotidien publié dans le JSON, affiché sur la carte du vélo, et ticket GitHub ouvert le jour du retour en stock (`scripts/verif_alerte_manette.js`).
  **⚠ NE TOURNE PAS TOUT SEUL (constat du 20/11).** Le fichier est en place et valide
  (`.github/workflows/alerte-manette.yml`, 96 lignes, cron `20 6 * * *`, état `active`), mais
  **aucune exécution planifiée n'a jamais eu lieu** : un seul passage dans toute son histoire,
  le 19/11 à 10 h 47, déclenché à la main. Le 20/11 à 14 h 07 UTC — huit heures après le
  créneau — toujours rien. Les réglages Actions du dépôt sont normaux (vérifié sur capture),
  les permissions `contents: write` / `issues: write` sont déclarées dans le workflow, et un
  clic « Run workflow » de l'humain n'a rien produit non plus. **Conclusion : le planificateur
  de GitHub ne réveille pas ce dépôt.** L'application de l'assistant n'a pas les droits
  (`workflow run` et `workflow enable` répondent 403) : ne pas réessayer, ce n'est pas un
  réglage à trouver. **Décision de l'humain (20/11) : laisser tel quel.** Donc : ne pas annoncer
  « alerte automatique chaque matin », ne pas promettre un relevé quotidien. Le relevé se fait
  à la main quand l'humain regarde la boutique — il le dit en une phrase, la session met
  `alerte-manette.json` et `projets.json` à jour.
  **Limite connue** : l'application GitHub de l'assistant n'a pas le droit `workflows` — impossible d'écrire dans `.github/workflows/` (push refusé, API 403). Le fichier y a donc été posé à la main. La source versionnée vit dans `outils/alerte-manette/` ; **les deux ont divergé une fois** (96 lignes actives contre 110 dans la source, sans effet sur le comportement) : toute modification du robot doit toucher les deux, et `scripts/activer_alerte.sh` recopie la source. Ne pas réessayer de pousser `.github/workflows/` sans ce droit.
- `scripts/verif_rendu.js`, `scripts/verif_ancre.js`, `scripts/verif_copie_commande.js`, `scripts/verif_sauvegarde.js`, `scripts/verif_alerte_manette.js`, `scripts/verif_ia_locale.js` — vérifications headless (rendu, liens `#proj-…`, page d'accueil, façade sans mention d'outillage, bouton Sauvegarder, alerte de stock).

## Règles

0. **Le tableau suit, il ne commande pas** (dit par l'humain le 19/11 : « je ne veux pas que le site soit une contrainte, je veux que ça m'aide sans me contraindre »). Rien dans le site ne doit sonner comme une obligation : pas de « à faire maintenant », pas de « la seule chose à faire », pas de « cochez ». Le suivi est un service, pas un devoir. **Conséquence pour l'assistant** : ne jamais attendre que l'humain coche. Quand il raconte un fait (« j'ai acheté la manette »), c'est **l'assistant** qui met `projets.json` à jour, ouvre la branche et publie. Le site se contente d'afficher. `scripts/verif_copie_commande.js` interdit le retour des tournures d'injonction.

1. **Jamais de modification directe sur `main`.** (Seule exception, bornée : le robot d'alerte commite le seul fichier `alerte-manette.json` et ouvre/ferme des tickets — jamais du code ni le site.) Toujours : branche → PR → validation de l'humain → fusion. Le site se déploie depuis `main` via GitHub Pages (~1 min).
2. **Le site public reste propre** : `noindex, nofollow`, `robots.txt` restrictif, **aucun lien privé** (Drive, Notion, jetons), aucun script de suivi, aucune image externe.
   **Et il ne raconte pas sa fabrication** (décidé le 19/11) : aucune mention d'Arena, de GitHub, de publication, de clé ni de branche dans ce qui s'affiche. L'outillage de publication reste dans le code, **muet** ; `scripts/verif_copie_commande.js` interdit son retour en façade. Les exceptions légitimes : une source publique citée dans la veille, et les documents techniques internes (`README.md`, `ETAT.md`, ce fichier) qui, eux, doivent tout dire.
3. **Aucun secret dans le dépôt** (ni dans ce fichier, ni dans le code). Les clés API/PAT vivent uniquement dans le navigateur de l'humain. Si un secret paraît, refuse de le commiter.
4. **Pose les questions en pavés** (options cliquables) pour les choix importants ; demande validation avant de publier.
5. **Calculs et chiffres** : déduis-les de `projets.json` (étapes faites / total). Si `ETAT.md`, `README.md` ou `etat.json` divergent, resynchronise-les.
6. **Terminologie** : tutoiement, français, concret — la personne n'est pas technique. Commits et PR en français, clairs, avec la raison du changement.
7. **Vérifier avant de fusionner** : rendu headless (jsdom ou équivalent) — 0 erreur JS, nombre de cartes/veilles attendu, boutons intacts, `projets.json` valide. `node scripts/verif_rendu.js`, `node scripts/verif_ancre.js` (liens directs `#proj-<id>`), `node scripts/verif_accueil.js` (chiffres de la page d'accueil à jour), `node scripts/verif_copie_commande.js` (aucune mention d'outillage en façade) et `node scripts/verif_alerte_manette.js` (alerte de stock : module Python, JSON publié, affichage).
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
