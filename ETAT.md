# État des projets — Tableau de bord

> Version texte du tableau de bord visuel `index.html`.
> Dernière mise à jour : 16 novembre 2026.

## Vue d'ensemble

- **Projets suivis** : 6
- **Terminés** : 2 (`Notes de recherche`, `Les sites`)
- **Étapes faites** : 23 / 37 (**62 %**)
- **Veille** : 13 recherches consignées (6 retenues · 7 sans résultat)

## À faire maintenant (prochaine étape par projet ouvert)

1. **Une application de poche** (4/6 · 67 %) — Installer l'application sur un téléphone réel.
2. **Maquette — une porte qui fait joli** (2/4 · 50 %) — Regarder l'épreuve : ça tient ? ça se voit à un mètre ? ça se photographie ?
3. **Vélo électrique DIY** (4/9 · 44 %) — Acheter la manette — poignée à effet Hall, 3 fils, sortie 5 V.
4. **Découverte de logiciels IA** (1/6 · 17 %) — Choisir un outil à tester (Ollama ou LM Studio).

## Points ouverts (projets terminés)

- **Notes de recherche** (3/3 · 100 %) — Gardée privée pour l'instant (décidé le 15 novembre 2026).
- **Les sites** (9/9 · 100 %) — Décider de rafraîchir ou non la veille des deux bulletins (datée d'octobre 2026).

## Détail des 6 projets

### 1. Notes de recherche — 3 / 3 (100 %) · Terminé
- [x] La note unique écrite — les trois notes fondues en une
- [x] La version à lire (HTML) et la version texte pour le mail
- [x] Relue à froid : les six sources revérifiées une par une

### 2. Les sites — 9 / 9 (100 %) · Terminé
- [x] Retirer les deux notes mortes du site
- [x] Refermer le site aux moteurs — `robots.txt`, `noindex`
- [x] La page des projets, prête : 5 projets, un fichier
- [x] Y ajouter la veille — y compris les recherches sans résultat
- [x] Y ajouter la recherche accélérée
- [x] Y ajouter le condensé — huit lignes, claires et concises
- [x] Publier (`tableau_de_bord`)
- [x] Vérifier les deux autres adresses
- [x] Le poste de travail — une page, un double-clic

### 3. Une application de poche — 4 / 6 (67 %) · En cours
- [x] Les enregistrements faits
- [x] Le fichier unique assemblé
- [x] L'application construite, signée et vérifiée
- [x] Le paquet déposé et sauvegardé en privé
- [ ] Installer l'application sur un téléphone réel
- [ ] Une deuxième copie du paquet, ailleurs

### 4. Maquette — une porte qui fait joli — 2 / 4 (50 %) · En cours
- [x] La photo de référence
- [x] Une première épreuve montée
- [ ] Regarder l'épreuve : ça tient ? ça se voit à un mètre ? ça se photographie ?
- [ ] La phrase d'une ligne qui dit ce qu'elle montre

### 5. Vélo électrique DIY — 4 / 9 (44 %) · Commencé
- [x] Choix du vélo et du principe (friction arrière)
- [x] Liste d'achats chiffrée — deux options
- [x] Règles de câblage ZS-X11H — dont les trois pièges
- [x] Programme Arduino écrit et relu
- [ ] Acheter la manette — poignée à effet Hall, 3 fils, sortie 5 V
- [ ] Batterie et chargeur : offerts — à récupérer et vérifier
- [ ] Manette testée sur l'alimentation du labo, essai à vide
- [ ] Galet profilé et support mécanique
- [ ] Essai sur route sèche, 10 km

### 6. Découverte de logiciels IA — 1 / 6 (17 %) · Commencé
- [x] Inventaire de la machine (CPU/GPU, RAM, disque) — ce qu'elle peut faire tourner
  - Diagnostic : Intel Atom x5-Z8350 @ 1,44 GHz (4 cœurs) · 3,9 Go RAM · Intel HD Graphics (intégré, pas de GPU dédié) · 6,7 Go libres sur C: · Windows 10 Professionnel : modèles ≤ 1,5 milliard de paramètres en 4 bits, sur CPU — local réaliste en curiosité ; l'assistant en ligne (Arena, Claude, ChatGPT) rester le vrai outil quotidien.
- [ ] Choisir un outil à tester (Ollama ou LM Studio)
- [ ] Installer et lancer un premier modèle
- [ ] Le tester sur 2-3 tâches réelles du quotidien
- [ ] Noter ce qui marche / ce qui ne marche pas (taille des modèles, vitesse, qualité)
- [ ] Adopter l'outil retenu (local ou en ligne) dans l'usage courant

Idée : découvrir les logiciels IA — ceux qui tournent en local sur le PC (hors ligne, hors compte, données privées), et les assistants en ligne (Claude, ChatGPT, Gemini) — comprendre lequel sert à quoi.
Critère de fin : une configuration IA locale précise en place et maîtrisée — un assistant/LLM local installé, lancé, et utilisé pour au moins une tâche réelle, avec ses limites notées.
Point ouvert : lequel des assistants en ligne tester en premier — Claude, ChatGPT ou Gemini ?

## Journal récent

- **16 novembre 2026 (assistant)** : ajout d'`ASSISTANT.md` (consignes pour les sessions Arena) et d'un bloc « Premier message » copiable dans le site. IA — étape 1 cochée (inventaire).
- **16 novembre 2026 (nouveau projet)** : ajout de « Découverte de logiciels IA » — 0/6, à démarrer (IA locale + assistants en ligne).
- **16 novembre 2026** : mise en place du tableau de bord interactif (`index.html`), synchronisation à 22/31 étapes (71 %), suppression des anciens doublons et du script Cloudflare parasite.
- **16 novembre 2026 (mise à jour)** : les données passent dans `projets.json` (chargé au démarrage, secours hors ligne) ; bouton « Corriger » (écran à gros pavés : projets, étapes, veille) ; bouton « Enregistrer sur GitHub » publiant `projets.json` sur `main` via l'API GitHub, avec clé fine-grained stockée uniquement dans le navigateur (Brave).
- **15 novembre 2026 (16 h)** : vérification des deux autres adresses en ligne, mise à jour du poste de travail, projet « Les sites » passé à 9/9.
- **15 novembre 2026 (15 h 45)** : publication de la nouvelle page sur `https://franceinfo771-prog.github.io/tableau_de_bord/`.
