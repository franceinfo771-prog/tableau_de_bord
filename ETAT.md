# État des projets — Tableau de bord

> Version texte du tableau de bord visuel `index.html`.
> Dernière mise à jour : 19 novembre 2026.

## Reprendre la conversation (lire ceci d'abord)

Cette section existe pour qu'une nouvelle conversation sur ce dépôt reparte **sans faire
répéter l'humain**. La lire en entier prend dix secondes.

**Où est quoi.** `projets.json` est la source de vérité (les chiffres ne se recopient pas à la
main : ils s'en déduisent). `index.html` en contient une copie de secours qui doit rester
identique. `ASSISTANT.md` porte les règles, dont la règle 0 — *le tableau suit, il ne commande
pas*. Ce fichier-ci (`ETAT.md`) est le journal des décisions déjà prises : avant de proposer
quelque chose, vérifier qu'on ne le propose pas une deuxième fois.

**Le ton, en une phrase.** Le site est un service, pas un devoir : jamais « à faire maintenant »,
jamais « il faut », jamais de case à cocher réclamée. Une étape faite est une trace, pas une dette.

**La seule chose que l'humain fait.** Il raconte, en une phrase et avec ses mots (« vélo :
manette commandée »). C'est **la session** qui met `projets.json` à jour, ouvre une branche,
public et fusionne. Ne jamais lui demander de cocher quelque chose sur le site, ni de tenir un
carnet : ce serait ajouter une manipulation.

**Ce qui est vivant, et qui ne dépend pas de cette conversation.**
- Le site est une page statique sans dépendance : il fonctionne sans session ouverte.
- Le robot de la manette lit la boutique chaque matin à 7 h 20 (Paris) et ne réécrit que
  `alerte-manette.json`. Limite connue : sur un dépôt public, GitHub désactive une tâche
  planifiée après 60 jours sans activité — si la rupture dure deux mois, relancer via
  « Enable workflow ». Après l'achat il ne sert plus à rien.
- Une copie complète du dossier est sur le Drive de l'humain (`tableau-de-bord-2026-11-19.zip`).

**Ce qui attend, et ce qui n'attend pas.** Rien n'attend une coche. Une commande est en cours :
la poignée AdreaPocket `5F36POIGELTROT` à 13,99 €, en rupture chez le fabricant, surveillée
chaque matin. Le vélo est inutilisé l'hiver : la décision tenue est d'attendre le
réapprovisionnement, pas de payer plus cher ailleurs.

## Vue d'ensemble

- **Projets suivis** : 6
- **Terminés** : 2 (`Notes de recherche`, `Les sites`)
- **Étapes faites** : 25 / 41 (**61 %**)
- **Veille** : 14 recherches consignées (7 retenues · 7 sans résultat)

## Où ça en est (l'étape qui débloque la suite, par projet ouvert)

1. **Une application de poche** (4/6 · 67 %) — Installer l'application sur un téléphone réel.
2. **Maquette — une porte qui fait joli** (2/4 · 50 %) — Regarder l'épreuve : ça tient ? ça se voit à un mètre ? ça se photographie ?
3. **Vélo électrique DIY** (4/9 · 44 %) — Attendre la manette : AdreaPocket 5F36POIGELTROT, 13,99 €, **en rupture** — alerte automatique chaque matin.
4. **Découverte de logiciels IA** (2/10 · 20 %) — Installer l'outil à distance sur le PC de la maison.

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
- [ ] Acheter la manette — poignée effet Hall **5 fils** : AdreaPocket 5F36POIGELTROT, 13,99 € (en rupture au 19/11 — attendre le retour, alerte quotidienne en place)
- [ ] Batterie et chargeur : offerts — à récupérer et vérifier
- [ ] Manette testée sur l'alimentation du labo, essai à vide
- [ ] Galet profilé et support mécanique
- [ ] Essai sur route sèche, 10 km

### 6. Découverte de logiciels IA — 2 / 10 (20 %) · Commencé
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

- **19 novembre 2026 — « L'IA locale » entre dans le tableau** : demande de l'humain, « l'IA locale
  dans le tableau, au courant du site ». Réponse : **une fiche d'état, pas un chat** — une page
  statique en HTTPS ne peut pas appeler une machine de la maison (contenu mixte), et le site
  n'a ni clé ni service derrière lui. La rubrique `#ia-locale`, dans la barre de navigation entre
  « Projets » et « Veille », dit où en est le projet `ia-decouverte` (2/9), ce que bloque l'étape
  suivante, la machine (ASUS), l'outil (LM Studio), le modèle (pas encore choisi), par où on la
  joint (le pont ; le tunnel plus tard) et les trois niveaux. **Dérivée de `projets.json`** :
  cocher une étape met la fiche à jour, rien n'est saisi deux fois. Nouveau fichier
  `IA-LOCALE.md` (la décision, l'architecture, ce qu'il ne faut pas refaire) et nouveau garde-fou
  `scripts/verif_ia_locale.js` — **26 contrôles**, dont « aucun champ de saisie »,
  « aucune adresse http:// », « aucune adresse de réseau local écrite en dur » et « aucune
  tournure d'injonction ». Deux corrections au passage : l'adresse `127.0.0.1:1234` ne s'écrit
  plus sur une page publique, et la colonne « Ce qu'il faut » devient **« Ce qui manque »**.

- **19 novembre 2026 — la porte privée vers la conversation** : l'humain cherchait « un endroit
  dans le site où parler avec Arena ». Réponse tenue : pas de chat dans le site (il faudrait une
  clé dans la page et un service extérieur — contraire aux règles, et n'importe qui pourrait
  parler à ses frais). À la place, une **page privée non publiée**, `conversation.html`, posée
  dans le dossier (donc servie par GitHub Pages, mais liée depuis nulle part et `noindex`). Elle
  contient un seul lien sortant — le bouton « Ouvrir la conversation » — dont l'adresse se règle
  une fois et se garde sur l'appareil (`localStorage`), avec arena.ai comme valeur par défaut.
  Aucun appel réseau, aucune dépendance, aucun secret. Contrôles : `scripts/verif_porte.js`
  (**21 vérifications**), qui garantit aussi que les trois pages publiques ne la référencent pas.
  À faire quand l'humain donnera l'adresse réelle : la coller sur la page, bouton Enregistrer.
  **Décision du même jour** : pas de vrai privé (exclusion de la publication) — l'humain
  tranche que le contenu n'est pas confidentiel (« que des projets que j'ai en tête, rien de
  très important ») et qu'il voit tout cela comme un exercice de gestion de projet. La page
  reste donc servie par Pages, `noindex` et liée depuis nulle part. Ne pas reproposer le
  retrait de la publication sans qu'il le demande.
  **19/11, même soir** : l'humain a fourni l'adresse (`https://arena.ai/agent/01a1f2f4-…-1ac4ff7da53a`)
  et demandé de l'inscrire en dur — c'est fait, dans le bouton, dans le défaut du script et dans
  le libellé affiché. Le champ de réglage reste, pour changer sans passer par une session.

- **19 novembre 2026 — de quoi reprendre sans faire répéter** : l'humain a posé la bonne
  question (« si j'utilise l'Arena du site, la conversation reprend le projet ? »). Le constat
  était honnête : les fichiers survivaient, mais une session neuve devait fouiller trois
  documents pour retrouver le fil, avec un vrai risque de redemander ce qui est déjà décidé.
  Ajout d'une section **« Reprendre la conversation »** en tête de ce fichier (où est quoi, le
  ton en une phrase, ce que fait l'humain, ce qui est vivant, ce qui attend) et d'une consigne
  d'entrée de session dans `ASSISTANT.md`. Corrigé au passage deux erreurs du `README.md` :
  il annonçait encore une publication par le bouton « Enregistrer sur GitHub » (retiré le 19/11,
  le bouton Sauvegarder n'exporte que localement) et un compte de contrôles périmé. Et la
  rubrique interne du même fichier `ETAT.md` ne dit plus « À faire maintenant », mais « Où ça
  en est » — la règle 0 vaut aussi pour les documents de travail.

- **19 novembre 2026 — le tableau ne donne plus d'ordres** : remarque de l'humain, « le site montre mes projets, mais c'est moi qui fais ; je ne veux pas qu'il soit une contrainte, ni devoir l'alimenter en cochant des étapes ». Le site disait bien l'inverse : section « À faire maintenant », chapô « la seule chose à faire ensuite », « cochez les étapes ». Corrigé en sept endroits — « Où ça en est », « le tableau suit, il ne commande pas », une entrée d'aide « Et si je ne coche jamais rien ? » qui répond franchement (il ne se passe rien de grave). Aucune mécanique changée : c'est un changement de voix. Règle ajoutée en tête d'`ASSISTANT.md` : **quand l'humain raconte un fait, c'est l'assistant qui met le tableau à jour** — il ne doit jamais attendre une coche.

- **19 novembre 2026 — un déploiement Pages en échec** : après la fusion de la PR #25, le *build* Pages a réussi mais l'étape **Deploy** a échoué (run `44527310213`, commit `8910d7f`) — panne passagère côté GitHub, sans rapport avec le contenu : le commit précédent s'était déployé normalement six minutes plus tôt. Le site a continué de servir la version précédente. Un nouveau commit relance le déploiement ; `gh run rerun` ne sait pas relancer un workflow Pages dynamique, et l'API de rebuild répond 403 au jeton de l'application. À savoir si cela se reproduit : pousser un petit changement suffit.

- **19 novembre 2026 — le bouton « Sauvegarder » vérifié** : après le retrait de la barre de publication, un doute légitime planait (« est-ce que ça marche encore ? »). Testé en conditions réelles avec un nouveau contrôle, `scripts/verif_sauvegarde.js` (**19 vérifications**) : la fenêtre s'ouvre, l'export produit un JSON valide de 6 projets / 14 veilles / 41 étapes, l'import le relit, le résumé texte se copie, la réinitialisation ramène à la référence. La sauvegarde **ne dépend pas** de la publication : elle est entièrement locale. Deux libellés qui parlaient encore de `projets.json` ont été neutralisés.

- **19 novembre 2026 — SuperMimic retiré du site** : demande de l'humain, « je voulais juste voir à quoi ressemble le logiciel SuperMimic, après avoir vu tu peux supprimer tout ce qui se rapporte ». Supprimés : les deux pages de veille (`veille-supermimic.html` et sa version d'une minute), la photo du robot (`img/humanoides.jpg`, `img/unitree-g1.jpg`), la bannière du tableau, les deux liens de la barre (« Robot qui apprend », « en 1 min »), le renvoi du pied de page et celui de l'accueil, l'étape « Voir SuperMimic de mes yeux » du projet IA (10 → 9 étapes) et la fiche de veille correspondante. `scripts/verif_veille.js` est supprimé. Chiffres resynchronisés : **25 / 41 étapes (61 %)**, **14 recherches de veille** (7 retenues).

- **19 novembre 2026 — le site ne raconte plus sa fabrication** : demande de l'humain, « ça ne concerne que moi ». Retirés de la façade : l'encadré « Mon assistant Arena » et le premier message à copier, les deux boutons « Enregistrer sur GitHub », la modale de réglage de la clé et ses statuts, la mention « GitHub Pages » dans la note de confidentialité. L'outillage de publication **reste dans le code, muet** (choix de l'humain : rien ne casse, on peut revenir en arrière) — conséquence assumée : corriger une coche dans le navigateur ne publie plus rien. Sur la page veille SuperMimic, les liens vers le dépôt de code sont remplacés par « code source publié sous licence Apache 2.0 » ; page du projet et article arXiv restent cités. `atelier.html` nettoyée de même (« Mettre le site en ligne », procédure et adresse sans marque). Nouveau garde-fou : `scripts/verif_copie_commande.js`, réécrit, **22 contrôles** qui interdisent le retour de ces éléments à l'écran, sur les cinq pages publiques — avec une exception explicite : `supermimic.github.io`, adresse publique du sujet.

- **19 novembre 2026 — la manette : choix tranché et alerte automatique** : la fiche du 13/11 (Drive) dit **5 fils** (rouge +5 V, noir masse, blanc signal sur A0, + 2 fils) alors que le tableau demandait « 3 fils » — corrigé. Modèle retenu : **AdreaPocket 5F36POIGELTROT, 13,99 €** (guidon 22 mm, trou 22,2 mm), **en rupture** ; décision de l'humain : attendre plutôt que payer 20 à 26 € ailleurs, le vélo ne roulant pas en hiver. Nouveau module `scripts/verifier_manette.py` (standard seul, décision prudente : rupture / disponible / **inconnu** si la page ne répond pas) et workflow `outils/alerte-manette/alerte-manette.yml` qui le lance **chaque matin à 7 h 20** et publie `alerte-manette.json` ; le tableau de bord l'affiche sur la carte du vélo (et **rien** si le fichier manque). Le jour du retour en stock, il **ouvre un ticket GitHub** — c'est la notification par e-mail — et le referme si la rupture revient. `scripts/verif_alerte_manette.js` : 37 contrôles.

  **En service depuis 10 h 47.** Le workflow est actif sur `main` (`.github/workflows/alerte-manette.yml`, posé à la main dans l'onglet Actions) et son premier passage a réussi de bout en bout : la fiche a été lue depuis les serveurs GitHub, verdict `rupture`, et le robot a publié lui-même `alerte-manette.json` dans un commit signé « Alerte manette » (`07458b2`). Il tourne désormais chaque matin à 7 h 20 et commite un relevé par jour — l'heure changeant à chaque passage, le fichier diffère toujours : c'est aussi ce qui empêche GitHub d'endormir la tâche planifiée après 60 jours d'inactivité. GitHub refuse à l'application de l'assistant l'écriture dans `.github/workflows/` (droit `workflows` absent) : c'est pourquoi la source versionnée vit dans `outils/alerte-manette/` et que la copie active a été posée à la main. Si l'on doit un jour modifier le robot, modifier la source **puis** la copie active, jamais l'une sans l'autre.

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
