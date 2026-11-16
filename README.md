# Tableau de bord — Mes projets

Tableau de bord autonome de suivi de cinq projets, de la veille et du condensé.

- **Site en ligne** : https://franceinfo771-prog.github.io/tableau_de_bord/
- **Version texte** : `ETAT.md`
- **Aucune dépendance externe** : un seul fichier `index.html` utilisable en ligne comme hors ligne, sans compte ni script de suivi (`noindex, nofollow` + `robots.txt`).

## État au 16 novembre 2026

**5 projets · 2 terminés · 22 / 31 étapes faites (71 %) · 13 recherches de veille.**

| Projet | Avancement | Statut | Prochaine action / Point ouvert |
|---|---:|---|---|
| Notes de recherche | 3 / 3 (100 %) | ✅ Terminé | Gardée privée pour l'instant (décidé le 15/11) |
| Les sites | 9 / 9 (100 %) | ✅ Terminé | Point ouvert : rafraîchir la veille des deux bulletins ou la laisser datée d'octobre |
| Une application de poche | 4 / 6 (67 %) | 🟡 En cours | Installer l'application sur un téléphone réel |
| Maquette — une porte qui fait joli | 2 / 4 (50 %) | 🟡 En cours | Regarder l'épreuve : ça tient ? ça se voit à un mètre ? ça se photographie ? |
| Vélo électrique DIY | 4 / 9 (44 %) | 🟣 Commencé | Acheter la manette — poignée à effet Hall, 3 fils, sortie 5 V |

## Fonctionnalités de `index.html`

- **À faire maintenant** : affiche la prochaine étape prioritaire de chaque projet ouvert.
- **Cases interactives** : cocher/décocher une étape recalcule immédiatement les barres, les pourcentages et la prochaine action, avec mémorisation locale (`localStorage`).
- **Ajout rapide** : ajout d'étapes, de projets ou d'entrées de veille localement.
- **Sauvegarde portable** : export/import en JSON, copie du résumé en texte brut, impression PDF propre.
- **Recherche locale** : recherche instantanée sans réseau dans toute la page.

## Ouvrir en local

```bash
python3 -m http.server 8000
# Ouvrir http://localhost:8000
```

## Mettre à jour `etat.json`

```bash
./scripts/etat.sh
```
