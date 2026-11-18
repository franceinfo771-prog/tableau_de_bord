# Tableau de bord — Mes projets

Tableau de bord autonome de suivi de six projets, de la veille et du condensé.

- **Site en ligne** : https://franceinfo771-prog.github.io/tableau_de_bord/
- **Version texte** : `ETAT.md`
- **Aucune dépendance externe** : `index.html` + `projets.json`, utilisables en ligne comme hors ligne, sans compte ni script de suivi (`noindex, nofollow` + `robots.txt`).

## État au 18 novembre 2026

**6 projets · 2 terminés · 25 / 41 étapes faites (61 %) · 13 recherches de veille.**

| Projet | Avancement | Statut | Prochaine action / Point ouvert |
|---|---:|---|---|
| Notes de recherche | 3 / 3 (100 %) | ✅ Terminé | Gardée privée pour l'instant (décidé le 15/11) |
| Les sites | 10 / 10 (100 %) | ✅ Terminé (abouti le 18/11) | Veille datée d'octobre, rafraîchie quand il y aura du nouveau |
| Une application de poche | 4 / 6 (67 %) | 🟡 En cours | Installer l'application sur un téléphone réel |
| Maquette — une porte qui fait joli | 2 / 4 (50 %) | 🟡 En cours | Regarder l'épreuve : ça tient ? ça se voit à un mètre ? ça se photographie ? |
| Vélo électrique DIY | 4 / 9 (44 %) | 🟣 Commencé | Acheter la manette — poignée à effet Hall, 3 fils, sortie 5 V |
| Découverte de logiciels IA | 2 / 9 (22 %) | 🟣 Commencé | Installer l'outil à distance sur le PC de la maison |

## Données : `projets.json`

Les données affichées (projets, veille, condensé) vivent dans **`projets.json`**, à la racine du dépôt. `index.html` le charge au démarrage ; si le fichier est inaccessible (ouverture hors ligne), une copie de secours intégrée à la page prend le relais. Les modifications faites dans le navigateur sont d'abord gardées sur l'appareil (`localStorage`), puis publiées sur `main` via le bouton **Enregistrer sur GitHub**.

## Page d'accueil de démonstration : `accueil.html`

Une page de présentation, pensée pour montrer le tableau de bord à quelqu'un qui ne le connaît pas : trois phrases sur ce que c'est, les trois choses à essayer (ouvrir un projet, cocher une étape, chercher), les chiffres du jour, puis un bouton **Entrer dans le tableau de bord**. Elle relit `projets.json` pour afficher des chiffres justes, et garde des nombres écrits en dur si le fichier n'est pas joignable (ouverture par double-clic). Le tableau renvoie vers elle par un lien **← Accueil** dans la barre de navigation.

## Fonctionnalités de `index.html`

- **Corriger** (bouton en haut) : écran à gros pavés pour corriger un projet (titre, idée, critère de fin, point ouvert, suppression), les étapes d'un projet (renommer, cocher, monter/descendre, ajouter, supprimer), ajouter un nouveau projet, corriger ou ajouter une fiche de veille.
- **Enregistrer sur GitHub** : gros bouton avec indicateur des modifications en attente ; met à jour `projets.json` directement sur `main` via l'API GitHub. La clé GitHub *fine-grained* est stockée uniquement dans le navigateur (Brave) de l'utilisateur — jamais dans le dépôt. Réglage guidé : bouton « Réglage de la clé GitHub » en haut du tableau (permission `Contents: Read and write` limitée au dépôt `tableau_de_bord`).
- **À faire maintenant** : affiche la prochaine étape prioritaire de chaque projet ouvert.
- **Cases interactives** : cocher/décocher une étape recalcule immédiatement les barres, les pourcentages et la prochaine action, avec mémorisation locale (`localStorage`).
- **Ajout rapide** : ajout d'étapes, de projets ou d'entrées de veille localement.
- **Sauvegarde portable** : export/import en JSON, copie du résumé en texte brut, impression PDF propre.
- **Recherche locale** : recherche instantanée sans réseau dans toute la page.
- **Lien direct vers un projet** : une adresse terminée par `#proj-<id>` (ex. `…#proj-velo`) ouvre le projet au démarrage, déplie ses étapes et fait défiler jusqu'à lui. Le changement d'ancre après coup (`hashchange`) et les liens de l'aperçu, du « À faire maintenant » ou de la recherche font la même chose ; si un filtre masquait le projet, il revient à « Tous ».

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
node scripts/verif_copie_commande.js
python3 scripts/sync_donnees_embedded.py --verifier
```

## Mettre à jour `etat.json`

```bash
./scripts/etat.sh
```
