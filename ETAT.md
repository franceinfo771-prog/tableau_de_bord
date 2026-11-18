# État des projets — Tableau de bord

> Version texte du tableau de bord visuel `index.html`.
> Dernière mise à jour : 18 novembre 2026.

## Vue d'ensemble

- **Projets suivis** : 6
- **Terminés** : 2 (`Notes de recherche`, `Les sites`)
- **Étapes faites** : 25 / 41 (**61 %**)
- **Veille** : 13 recherches consignées (6 retenues · 7 sans résultat)

## À faire maintenant (prochaine étape par projet ouvert)

1. **Une application de poche** (4/6 · 67 %) — Installer l'application sur un téléphone réel.
2. **Maquette — une porte qui fait joli** (2/4 · 50 %) — Regarder l'épreuve : ça tient ? ça se voit à un mètre ? ça se photographie ?
3. **Vélo électrique DIY** (4/9 · 44 %) — Acheter la manette — poignée à effet Hall, 3 fils, sortie 5 V.
4. **Découverte de logiciels IA** (2/9 · 22 %) — Installer l'outil à distance sur le PC de la maison.

## Points ouverts (projets terminés)

- **Notes de recherche** (3/3 · 100 %) — Gardée privée pour l'instant (décidé le 15 novembre 2026).
- **Les sites** (10/10 · 100 %) — Abouti le 18 novembre 2026. La veille reste datée d'octobre : rafraîchie quand il y aura du nouveau, pas pour tenir un calendrier.

## Détail des 6 projets

### 1. Notes de recherche — 3 / 3 (100 %) · Terminé
- [x] La note unique écrite — les trois notes fondues en une
- [x] La version à lire (HTML) et la version texte pour le mail
- [x] Relue à froid : les six sources revérifiées une par une

### 2. Les sites — 10 / 10 (100 %) · Terminé
- [x] Retirer les deux notes mortes du site
- [x] Refermer le site aux moteurs — `robots.txt`, `noindex`
- [x] La page des projets, prête : 5 projets, un fichier
- [x] Y ajouter la veille — y compris les recherches sans résultat
- [x] Y ajouter la recherche accélérée
- [x] Y ajouter le condensé — huit lignes, claires et concises
- [x] Publier (`tableau_de_bord`)
- [x] Vérifier les deux autres adresses
- [x] Le poste de travail — une page, un double-clic
- [x] Projet abouti — bilan du 18 novembre 2026 : rien à ajouter, le site tient

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

### 6. Découverte de logiciels IA — 2 / 9 (22 %) · Commencé
- [x] Inventaire de la machine (CPU/GPU, RAM, disque) — ce qu'elle peut faire tourner
  - **PC du travail** (diagnostic du 16 nov.) : Intel Atom x5-Z8350 @ 1,44 GHz (4 cœurs) · 3,9 Go RAM · Intel HD Graphics (intégré, pas de GPU dédié) · 6,7 Go libres sur C: · Windows 10 Professionnel : modèles ≤ 1,5 milliard de paramètres en 4 bits, sur CPU — local réaliste en curiosité ; l'assistant en ligne (Arena, Claude, ChatGPT) rester le vrai outil quotidien.
  - **PC de la maison** (cible) : un **ASUS**, de configuration bien supérieure — l'inventaire exact sera relevé automatiquement par le pont, sans demande de caractéristiques à la main.
- [x] Choisir un outil à tester — **LM Studio**, choisi pour son démon *headless* (`llmster`) et sa CLI `lms` : installable et pilotable à distance, sans interface ni clic.
- [ ] Installer l'outil à distance sur le PC de la maison — agent `PONT-poste.ps1 -Installer` prêt (script officiel → `winget` → installateur direct) ; reste à lancer le pont sur l'ASUS.
- [ ] Installer et lancer un premier modèle — le modèle est choisi automatiquement selon la RAM relevée (1,5B / 3B / 7B / gpt-oss-20b)
- [ ] Ouvrir un accès privé depuis le travail — **Tailscale** : réseau privé entre les deux postes (WireGuard), aucun port ouvert sur la box ; `tailscale serve` publie l'API locale sur une adresse HTTPS privée. Détail dans `pont-outils/ESPACE-PRIVE.md`.
- [ ] Piloter l'environnement de la maison — la Freebox, l'imprimante, les autres postes du réseau : joignables uniquement depuis le réseau domestic, donc par le pont. Le relevé publie désormais l'adressage réseau de l'ASUS.
- [ ] Le tester sur 2-3 tâches réelles du quotidien
- [ ] Noter ce qui marche / ce qui ne marche pas (taille des modèles, vitesse, qualité)
- [ ] Adopter l'outil retenu (local ou en ligne) dans l'usage courant

Idée : découvrir les logiciels IA — ceux qui tournent en local sur le PC (hors ligne, hors compte, données privées), et les assistants en ligne (Claude, ChatGPT, Gemini) — comprendre lequel sert à quoi.
Critère de fin : une configuration IA locale précise en place et maîtrisée — un assistant/LLM local installé, lancé, et utilisé pour au moins une tâche réelle, avec ses limites notées.
Point ouvert : lequel des assistants en ligne tester en premier — Claude, ChatGPT ou Gemini ?

## Journal récent

- **18 novembre 2026 — archive avec mode d'emploi** : `scripts/construire_archive.py` fabrique `tableau-de-bord-2026-11-18.zip` (3 Mo), qui se rouvre sans réseau dans des années : page de démarrage, mode d'emploi imprimable (HTML + texte), site complet, code source, sauvegarde `.json`. Vérifié par `scripts/verif_archive.js` : 29 contrôles, dont l'ouverture réelle du site en `file://` (6 projets, 25/41, 13 veilles, aucune erreur).
- **18 novembre 2026 — préparation de la démonstration** : la barre du haut ne mange plus la moitié d'un écran de téléphone (liens et actions en deux rangées qui glissent du doigt, sous 560 px). Un clic sur un projet ne casse plus si le navigateur refuse de changer l'adresse (page ouverte par double-clic, page affichée dans un cadre). Deux cas ajoutés aux vérifications : vider puis refaire une coche ramène exactement l'état de départ.
- **18 novembre 2026 — page d'accueil de démonstration** : ajout d'`accueil.html`, une page de présentation en trois points (ce que c'est, ce qu'il faut essayer, les chiffres du jour) avec un bouton « Entrer dans le tableau de bord ». Le tableau renvoie vers elle par un lien « ← Accueil » dans la barre de navigation et un lien en bas de page. Les chiffres sont relus dans `projets.json`, avec des nombres de secours si le fichier n'est pas joignable.
- **18 novembre 2026 — ménage à la racine** : retrait de `Projets.html` et `Projets (2).html` (≈ 950 Ko), deux pages déposées à la main et jamais reliées au site. Le dépôt passe sous 2 Mo ; `index.html`, `atelier.html` et les pages de `geoula-a-televerser/` ne bougent pas.
- **18 novembre 2026 — projet « Les sites » abouti** (10/10) : le site ne montre aucune note morte, il n'est pas indexable, il dit « en construction » et il porte la veille, la recherche et le condensé. Question de la veille tranchée : on la garde datée d'octobre, elle sera rafraîchie quand il y aura du nouveau. Côté technique, une adresse terminée par `#proj-<id>` ouvre maintenant le bon projet au démarrage (PR #13).
- **18 novembre 2026** : retrait de la rubrique « Mon IA privée » et de l’étape qui demandait de la relier au site. Le lien « Mon assistant Arena » et le projet « Découverte de logiciels IA » sont conservés.
- **17 novembre 2026 (assistant)** : LM Studio retenu comme outil à tester, sur le **PC de la maison** (le PC du travail est trop modeste : Atom, 3,9 Go). Le pont a été étendu : publication automatique de la configuration de la machine au démarrage, installation de LM Studio à distance, et **déclencheur en clair** (`pont/installer.txt`) permettant de lancer l'installation depuis l'assistant sans connaître la phrase de passe — celle-ci ne quitte jamais le poste et n'entre pas dans le dépôt.
- **16 novembre 2026 (assistant)** : ajout d'`ASSISTANT.md` (consignes pour les sessions Arena) et d'un bloc « Premier message » copiable dans le site. IA — étape 1 cochée (inventaire).
- **16 novembre 2026 (nouveau projet)** : ajout de « Découverte de logiciels IA » — 0/6, à démarrer (IA locale + assistants en ligne).
- **16 novembre 2026** : mise en place du tableau de bord interactif (`index.html`), synchronisation à 22/31 étapes (71 %), suppression des anciens doublons et du script Cloudflare parasite.
- **16 novembre 2026 (mise à jour)** : les données passent dans `projets.json` (chargé au démarrage, secours hors ligne) ; bouton « Corriger » (écran à gros pavés : projets, étapes, veille) ; bouton « Enregistrer sur GitHub » publiant `projets.json` sur `main` via l'API GitHub, avec clé fine-grained stockée uniquement dans le navigateur (Brave).
- **15 novembre 2026 (16 h)** : vérification des deux autres adresses en ligne, mise à jour du poste de travail, projet « Les sites » passé à 9/9.
- **15 novembre 2026 (15 h 45)** : publication de la nouvelle page sur `https://franceinfo771-prog.github.io/tableau_de_bord/`.
- **18 novembre 2026 — le travail des projets entre dans l'archive** : `travail/` (32 fichiers, 10 Mo) rejoint le coffret — code Arduino du vélo, fiche technique, APK Hachkaba, archives des sites voyages et actualité, photos, mode d'emploi de God's Eye View. Les fichiers vivent dans `travaux/`, exclu par `.gitignore` : le dépôt est public, ils portent des liens Drive privés, une clé de signature et un mot de passe. Le script les recopie et écrit `travail/INDEX.html` ; sans `travaux/`, l'archive se construit quand même. `verif_archive.js` : 33 contrôles avec le travail, 30 sans.
