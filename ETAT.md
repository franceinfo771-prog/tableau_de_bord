# État des projets — Tableau de bord

> Version texte du tableau de bord visuel `index.html`.
> Dernière mise à jour : 21 novembre 2026.

## Reprendre la conversation (lire ceci d'abord)

> **Tu arrives — lis dans cet ordre, et rien d'autre :**
> 1. **cette section** (où en sont les choses, ce qui est vivant, ce qui attend) ;
> 2. **`projets.json`** (les données ; les chiffres s'en déduisent, ils ne se recopient pas) ;
> 3. **le journal, plus bas**, du plus récent au plus ancien ;
> 4. **le détail des projets** (les cases cochées) et **« La veille, rangée »**
>    (les 14 recherches et leur verdict).
>
> Les règles du projet, les garde-fous et ce qu'il ne faut pas refaire : `ASSISTANT.md`.
> **Un seul chemin, et ce n'est pas négociable** — les autres documents de la racine sont des
> traces datées.
>
> **Ne pas ouvrir `ARCHIVE-SESSION-17-11.md` ni `APERCU.md` pour connaître l'état** : ce sont des
> traces, elles disent des choses qui n'étaient vraies qu'à leur date. **Si un document contredit
> cette page, c'est cette page qui a raison.**
>
> Pour savoir **ce qui a déjà été fait, réussi ou raté** (le 21 novembre, avec les erreurs
> et leur coût) : `ETAT-DES-LIEUX.md`.

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
- **Le robot de la manette ne tourne PAS tout seul** (constat du 20/11, décision : laisser tel
  quel). Aucune exécution planifiée n'a jamais eu lieu — un seul passage, déclenché à la main le
  19/11. Le fichier est correct, les réglages du dépôt sont normaux : c'est le planificateur de
  GitHub qui ne réveille pas ce dépôt, et l'assistant n'a pas les droits pour le forcer. **Donc :
  ne jamais annoncer « alerte automatique chaque matin ».** Le tableau affiche le dernier relevé
  avec sa date, ce qui reste vrai. Quand l'humain regarde la boutique, il le dit en une phrase et
  la session met `alerte-manette.json` + `projets.json` à jour.
- Une copie complète du dossier est sur le Drive de l'humain (`tableau-de-bord-2026-11-19.zip`).

**Ce qui attend, et ce qui n'attend pas.** Rien n'attend une coche. Une commande est en cours :
la poignée AdreaPocket `5F36POIGELTROT` à 13,99 €, **en rupture au relevé du 19/11**. Le robot
ne se réveille pas : le relevé se fait à la main, quand l'humain regarde la boutique. Le vélo
est inutilisé l'hiver : la décision tenue est d'attendre le réapprovisionnement, pas de payer
plus cher ailleurs.

## Vue d'ensemble

- **Projets suivis** : 8
- **Terminés** : 2 (`Notes de recherche`, `Les sites`)
- **Étapes faites** : 33 / 49 (**67 %**)
- **Veille** : 14 recherches consignées (7 retenues · 7 sans résultat)

## Où ça en est (l'étape qui débloque la suite, par projet ouvert)

1. **Une application de poche** (4/6 · 67 %) — Installer l'application sur un téléphone réel.
2. **Maquette — une porte qui fait joli** (2/4 · 50 %) — Regarder l'épreuve : ça tient ? ça se voit à un mètre ? ça se photographie ?
3. **Vélo électrique DIY** (4/9 · 44 %) — Attendre la manette : AdreaPocket 5F36POIGELTROT, 13,99 €, **en rupture** au dernier relevé (19/11) — relevé à la main, le robot ne se réveille pas.
4. **Assistants en ligne** (2/5 · 40 %) — Les tester sur 2-3 tâches réelles du quotidien.
5. **Un lecteur local pour la mémoire du site** (2/5 · 40 %) — Poser au modèle une question dont la réponse est dans la fiche, puis une qui n'y est pas.

## Points ouverts (projets terminés)

- **Notes de recherche** (3/3 · 100 %) — Gardée privée pour l'instant (décidé le 15 novembre 2026).
- **Les sites** (10/10 · 100 %) — Abouti le 18 novembre 2026. La veille reste datée d'octobre : rafraîchie quand il y aura du nouveau, pas pour tenir un calendrier.

## Détail des projets

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
- [ ] Acheter la manette — poignée effet Hall **5 fils** : AdreaPocket 5F36POIGELTROT, 13,99 € (en rupture au 19/11 — attendre le retour, **relevé à la main**, aucun robot)
- [ ] Batterie et chargeur : offerts — à récupérer et vérifier
- [ ] Manette testée sur l'alimentation du labo, essai à vide
- [ ] Galet profilé et support mécanique
- [ ] Essai sur route sèche, 10 km

### 6. Assistants en ligne — 2 / 5 (40 %) · Commencé
- [x] Inventaire des machines — et verdict pour l'IA locale : **le PC de la maison est un vieux PC**, il ne peut pas faire tourner un modèle
  - **PC du travail** (diagnostic du 16 nov.) : Intel Atom x5-Z8350 @ 1,44 GHz (4 cœurs) · 3,9 Go RAM · Intel HD Graphics (intégré, pas de GPU dédié) · 6,7 Go libres sur C: · Windows 10 Professionnel.
  - **PC de la maison** : un vieux PC — **hors jeu pour un modèle local**. L'hypothèse « un ASUS bien supérieur » n'a jamais été vérifiée et est abandonnée.
- [x] Choisir les outils à tester — les assistants en ligne : Claude, ChatGPT, Gemini
- [ ] Les tester sur 2-3 tâches réelles du quotidien
- [ ] Noter ce qui marche pour chacun — pas seulement le classement, aussi les ratés
- [ ] Adopter celui qui sert vraiment, et laisser tomber les autres

> **Décision du 19 novembre 2026 — l'IA locale est abandonnée** (choix de l'humain) : le PC de la
> maison est un vieux PC. Retirées du projet : l'installation à distance, le modèle local, le tunnel
> Tailscale, la Freebox et l'imprimante. La raison est aussi dans `IA-LOCALE.md`. **Ne pas reproposer
> de faire tourner un modèle sur cette machine** sans qu'il le demande.

### 7. IA locale sur vieux PC — ce qu'elle sait faire — 6 / 7 (86 %) · En cours
- [x] Ollama installé sur la vieille machine (chemin ajouté au PATH, version vérifiée)
- [x] Un modèle de 1 milliard de paramètres téléchargé et chargé — 1,3 Go
- [x] Conversation en français : phrases correctes, mais réponses vides de contenu
- [x] Résumé testé sur deux textes (un personnel, un neutre) : refusé dans les deux cas
- [x] Verdict écrit : fonctionne hors ligne, ne rend pas de service — gardé par curiosité
- [x] Une tâche réelle réussie — cinq lignes cohérentes sur un chat qui apprend à nager
- [ ] **Tourner sans réseau, prouvé** — couper le Wi-Fi, poser une question neuve, obtenir une réponse

> **Ce que la mesure a donné, sans arrondi** : Ollama tourne, parle français, **raconte une histoire
> de cinq lignes** avec un début et une fin — mais il **refuse ou tronque les résumés**, y compris
> sur une leçon de photosynthèse. Ce n'est donc pas « inutilisable » : c'est **« il raconte, il ne
> résume pas »**. Une seule chose reste à prouver : qu'il répond **sans réseau** — c'est l'étape
> ouverte, et il suffit de couper le Wi-Fi deux minutes. Le verdict du 20/11 (« abandonnée ») reste
> corrigé : elle a été essayée, et on sait maintenant exactement ce qu'elle sait faire.

### 8. Un lecteur local pour la mémoire du site — 2 / 5 (40 %) · En cours
- [x] Une fiche mémoire produite à partir d'`ETAT.md` et de `projets.json` — 2 723 caractères, pas 34 000
- [x] Une page qui lit un fichier choisi sur le disque, sans rien envoyer — 42 contrôles verts
- [ ] Le modèle répond à une question dont la réponse est **dans** la fiche
- [ ] Le modèle avoue qu'il ne sait pas quand la réponse **n'est pas** dans la fiche
- [ ] Verdict écrit : la mémoire à la maison sert-elle, oui ou non ?

> **L'idée, dite simplement.** Le site a déjà sa mémoire — `projets.json`, `ETAT.md`,
> `ASSISTANT.md`. Ce qui manque, ce n'est pas la mémoire, c'est **un lecteur qui vit à la maison**.
> `pont-outils/chat.html` lit la fiche et la donne au modèle comme consigne. Rien ne sort de la
> machine. Mais un modèle de 1 milliard de paramètres est un lecteur distrait : la fiche fait
> 2 723 caractères, et c'est déjà beaucoup pour lui. Les trois dernières étapes sont là pour le
> mesurer, pas pour l'espérer.
>
> **Ce que ce n'est pas** — et l'humain l'a tranché le 21/11 : *« il ne faut pas l'utiliser pour
> l'IA interne du site »*. Il a raison, pour trois raisons qui ne dépendent d'aucune opinion. Le
> site est **une page statique chez GitHub** : aucun serveur n'y tourne, donc aucun modèle ne peut
> y être. Un visiteur ne peut pas joindre `127.0.0.1` — c'est l'intérieur de **ta** machine, pas
> la sienne. Et ce modèle **ne sait pas lire le site** : il ne lit pas de fichiers, il ne résume
> pas, il n'écrit pas de HTML. Il n'y aurait que le faire tourner dans le navigateur du visiteur
> (300 à 800 Mo au premier chargement), ce qui casse la règle « aucune dépendance ».
>
> **L'IA du site existe pourtant, et elle est déjà au courant.** C'est la session qui lit le
> dépôt ; sa mémoire, c'est `ETAT.md` et son ordre de lecture. Ce lecteur local est autre chose :
> **un carnet de bord hors ligne**, utile quand on n'a pas de réseau — pas un substitut.

## La veille, rangée (14 recherches)

> **Sept retenues, sept sans résultat** — et les impasses sont gardées exprès :
> une recherche notée « sans résultat » est une recherche qu'on ne refait pas deux fois.
> Cette liste est la version lisible de `projets.json` ; **le JSON reste la source de vérité**,
> c'est le site qui l'affiche.

1. **La manette : effet Hall ou potentiomètre ?** — **retenue**. Prix relevés : 14,99 € à 17,75 € pour une poignée 3 fils. Le piège : certaines poignées à 3 fils sont des potentiomètres — contact frottant, dérive dans le temps. La fiche doit dire « effet Hall » ou « sans contact ».
2. **Les travaux savants sur le sujet de la note** — **retenue**. 7 requêtes OpenAlex · 57 408 travaux recensés · 93 liens de presse vus · 6 travaux retenus. Rapport de tri : un pour dix mille. Chercher « le sujet » ramène une araignée colombienne, parce que son descripteur s'appelle Perafán.
3. **Un chiffre de « 30 % de croyants » cité en secondaire** — sans résultat. Une étude parue dans une revue est citée en source secondaire. Auteurs et date introuvables, texte non lisible. Le chiffre est mentionné dans la note, pas retenu. La question du nombre reste indécidable.
4. **L'effectif d'une communauté discrète au XXᵉ siècle** — sans résultat. Aucun recensement fiable n'existe, et c'est cohérent : une communauté discrète ne se compte pas. Recherche arrêtée après trois sources qui se recopient.
5. **L'occultation : 873 ou 874 ?** — sans résultat. Les sources divergent sur le comput, et le calendrier lunaire rend la conversion approximative. Aucune ne tranche de façon vérifiable. La note laisse les deux dates.
6. **Le lien entre une attente messianique et la violence** — sans résultat. Recherche menée, puis écartée : les auteurs d'une revue (2026) nient explicitement tout lien causal direct. La thèse est donc fausse, pas seulement invérifiable.
7. **Les quatre références de la note, une par une** — **retenue**. Trois DOI interrogés en direct (Crossref) : les trois répondent, titres et revues exacts. Deux ISBN confirmés (Open Library, éditeur) : Glinter 2024, Studemund-Halévy 2022. Une erreur trouvée : une page d'écart, corrigée.
8. **La presse sur le sujet** — sans résultat. Times of Israel : accès refusé (403). Aucun article de presse n'apportait de fait que les six travaux ne portent déjà. Écartée.
9. **Les pages de type encyclopédie collaborative** — sans résultat. Écartées volontairement : dates inventées, sources non traçables. Le test est simple — si la page ne dit pas d'où elle tient son fait, le fait n'existe pas.
10. **La veille automatique — bulletins du 7 et du 8 novembre** — **retenue**. 331 articles analysés, 12 retenus, fenêtre de 7 jours. Rien qui concerne les projets en cours : c'est un flux généraliste, pas une veille ciblée.
11. **Les gains d'un vélo à friction** — **retenue**. Rendement 60-80 % contre 85-92 % pour un moyeu. Pneu usé en 500-1 500 km contre 2 000-5 000. Perte de 20 à 40 % d'autonomie. Convergent sur plusieurs sources techniques indépendantes.
12. **L'absorption réelle des mousses pyramidales — sans importance** — sans résultat. Recherche faite, puis mise hors du projet : la maquette est un objet d'aspect, pas un dispositif. NRC 0,70 à 1,00 selon l'épaisseur ; 0,18 à 0,24 à 125 Hz. Gardé pour mémoire, pas pour décider.
13. **Une application Android pour un fichier hors ligne** — **retenue**. Trois outils officiels suffisent : aapt2, d8, apksigner. Aucun magasin, aucun compte développeur, aucun frais. L'application a été construite et signée v1+v2+v3.
14. **Manette du vélo — prix relevés et modèle retenu (19/11)** — **retenue**. Choix : AdreaPocket 5F36POIGELTROT, 13,99 €, 5 fils (rouge +5 V, noir masse, blanc signal sur A0 ; 2 fils « Indicator »), guidon 22 mm (trou 22,2 mm). En rupture — décision d'attendre plutôt que payer plus cher, le vélo ne roulant pas en hiver. Comparatif du jour : MotoQuadElec 20 € (effet Hall 5 fils, stock Normandie, 2ᵉ connecteur = éclairage, pas coupe-circuit) ; MonsterBike62 25,99 € (bouton coupe-circuit, le plus sûr si AdreaPocket ne revient pas) ; Cdiscount 17-22 €. Anciennes réfs de la fiche du 13/11 : Enlybee B0DB6WCQVV 16,39 € (Amazon, indisponible) et Yosoo B08KY8HDN8 16,75 €. Alerte : le robot **est écrit et actif** sur le dépôt, mais **il ne se réveille pas tout seul** — un seul passage a eu lieu, le **20/11 à 15:29 UTC** (déclenchement planifié de GitHub, avec neuf heures de retard). Le relevé se fait **à la main**. **Ne jamais annoncer d'alerte automatique.**

## Journal récent

- **21 novembre 2026 — la mémoire du site, à la maison** : l'humain propose que l'IA interne
  « soit la mémoire du site à la maison ». Le mot est corrigé — **un modèle n'est pas une
  mémoire, c'est un lecteur** — et l'idée devient un projet : une page qui lit la fiche du site
  et la donne au modèle, sans rien envoyer. Trois pièces écrites : `pont-outils/fabriquer-fiche.py`
  (la fiche, **2 723 caractères** extraits de `ETAT.md` et `projets.json`, jamais recopiés à la
  main), `pont-outils/chat.html` (**la fiche est dedans**, donc la page marche en double-clic,
  plus un bouton « Ouvrir un fichier »), et `scripts/verif_memoire.js` (**42 contrôles** : la fiche
  reste courte et sans secret, la page ne parle qu'à `127.0.0.1`, aucun `chat.html` à la racine).
  Au passage, la fiche a révélé trois erreurs dans `ETAT.md` : le projet IA locale écrit « 6/8 »
  au lieu de **6/7**, et « Détail des **6** projets » alors qu'il y en avait sept. Corrigées.
  **8 projets · 33 / 49 (67 %)**, et il reste l'essai réel — c'est lui qui donnera le verdict.

- **21 novembre 2026 — non, ce ne sera pas l'IA du site** : l'humain conclut de lui-même
  *« donc il ne faut pas l'utiliser pour IA interne du site en fait »*. C'est juste, et c'est
  écrit tel quel : le site est **statique chez GitHub**, sans serveur ; un visiteur ne peut pas
  joindre `127.0.0.1` ; et le modèle **ne lit pas** les fichiers. Le projet est donc renommé
  **« Un lecteur local pour la mémoire du site »** — un carnet de bord hors ligne, pas un
  substitut. **L'IA du site, elle, existe déjà : c'est la session qui lit ce fichier.**
  Cette limite est écrite dans le bloc du projet, pas seulement ici.


- **21 novembre 2026 (suite) — ce qu'elle sait faire, et ce qui reste à prouver** : l'humain pousse
  plus loin. Ollama **réussit une tâche réelle** — cinq lignes cohérentes sur un chat qui apprend à
  nager — alors que le résumé échoue. Le verdict se nuance : **« il raconte, il ne résume pas »**.
  Mais la preuve du fonctionnement hors ligne n'est pas faite : il reste à couper le Wi-Fi et poser
  une question neuve. Le projet repasse donc **en cours** (6/7) et le tableau redescend à
  **31 / 44 (70 %)** — un chiffre juste vaut mieux qu'un chiffre flatteur. Au passage, un piège
  relevé : interrogé sur sa connexion, le modèle affirme « je n'ai pas besoin d'Internet » — il ne
  sait pas vérifier sa propre connexion, sa parole ne prouve rien.

- **21 novembre 2026 — l'IA locale, essayée pour de vrai** : l'humain rouvre l'idée abandonnée la
  veille (« reprendre une idée qui a échoué »), installe **Ollama** sur la vieille machine, et on
  mesure au lieu de supposer. Résultat : l'installation réussit (au prix d'un PATH à réparer), un
  modèle `llama3.2:1b` de 1,3 Go se charge, et **il parle un français correct**. Mais les deux
  tests de résumé échouent — y compris sur une leçon de photosynthèse : il refuse, puis résume en
  une phrase. **Verdict : fonctionne, ne rend pas de service.** Nouveau projet
  **« IA locale sur vieux PC — mesurée »**, 5/5, terminé le jour même : un projet qui finit sur un
  verdict est un projet réussi. Chiffres : **7 projets · 30 / 42 (71 %)**. Les contrôles qui
  supposaient 6 projets et 25/37 sont désormais dérivés de `projets.json` (quatre d'entre eux
  étaient figés en dur et ont dû être corrigés).

- **21 novembre 2026 — un seul chemin pour se mettre au courant** : demande de l'humain, « juste
  avoir le chemin du dernier état du site, des recherches qui sont dedans rangées ». Constat :
  huit documents à la racine, et une session qui arrive devait deviner lequel ouvrir. Ajout en
  tête de ce fichier d'un **encadré d'ordre de lecture** en cinq étapes (cette section →
  `projets.json` → journal → détail des projets → veille rangée), et d'une section
  **« La veille, rangée »** qui recopie les **14 recherches** avec leur verdict — les 7 retenues
  et les 7 sans résultat, impasses comprises, gardées exprès. `ASSISTANT.md` renvoie désormais à
  cet ordre au lieu de citer les fichiers en vrac. Aucun fichier de plus, aucun contenu
  dupliqué en double : `projets.json` reste la source de vérité, le tableau reste le site.

- **21 novembre 2026 — quatre documents se contredisaient : un seul état désormais** : peur exprimée
  par l'humain, « j'ai peur des confusions dans les conversations ». Le constat était juste : à la
  racine, `SESSION-ETAT.md` annonçait encore une branche `arena/ebda441b`, un commit `65c6562` et un
  `main` à `2fda254` — périmé de plusieurs jours ; `IA-LOCALE.md` affirmait l'IA locale abandonnée,
  démenti le 21 ; `APERCU.md` décrivait la démo du 18/11 (6 projets, 25/41). **Une session neuve
  pouvait donc travailler sur un état faux, en toute bonne foi.** Quatre corrections : (1) l'encadré
  d'ordre de lecture d'`ETAT.md` dit maintenant **« si un document contredit cette page, c'est cette
  page qui a raison »** et interdit nommément les deux traces ; (2) `SESSION-ETAT.md` devient
  **`ARCHIVE-SESSION-17-11.md`**, avec bandeau `⚠ PÉRIMÉ` ; (3) `IA-LOCALE.md` et `APERCU.md` portent
  leur bandeau (démenti / figé) et renvoient tous les trois à `ETAT.md` ; (4) `ASSISTANT.md` ouvre sur
  une **règle d'arbitrage** — `ETAT.md` fait foi, les chiffres se lisent dans `projets.json`, jamais
  recopiés. Nouveau fichier, **`ETAT-DES-LIEUX.md`** : la photo datée du 21 novembre, qui dit ce qui a
  marché, ce qui a raté, ce que les erreurs ont coûté et ce qu'on ne refera pas. Nouveau garde-fou,
  **`scripts/verif_coherence.js` — 35 contrôles** : il vérifie les bandeaux, l'arbitrage, la présence
  des chiffres réels dans la façade, et **que les erreurs corrigées ne reviennent pas**.

  Au passage, une erreur vivante trouvée et corrigée : le projet « Vélo » annonçait encore qu'une
  alerte quotidienne était en place, alors que le robot ne se réveille pas ; et le paragraphe du
  19/11 affirmait, au présent, que le relevé partait chaque matin à 7 h 20 — trois lignes après
  avoir été démenti. Le paragraphe est repassé au passé. **Une erreur peut donc survivre dans le
  document même qui la démentit** : c'est la raison d'être de ce contrôle.

  Deux erreurs de ma part, consignées parce qu'elles sont instructives : j'ai daté ce compte rendu
  « 21 **et 22** novembre » alors que le 22 n'avait pas eu lieu — corrigé ; et mon premier contrôle
  interdisait le simple mot « 7 h 20 », ce qui aurait obligé à **falsifier le journal daté du 19/11**.
  Un contrôle doit viser l'affirmation vivante, pas effacer l'histoire. Et quand une règle stricte
  attrape une phrase légitime, c'est la **phrase** qu'on reformule — pas le contrôle qu'on relâche.

- **20 novembre 2026 — le robot de la manette ne se réveille pas** : test mené jusqu'au bout sur
  demande de l'humain (« on teste ça »). Le workflow est `active`, le fichier complet et valide, le
  cron correct, la page Settings → Actions sans bandeau d'alerte (vérifié sur capture) — et pourtant
  **zéro exécution planifiée depuis sa création** : un seul passage, le 19/11 à 10 h 47, déclenché à
  la main. Le 20/11 à 14 h 07 UTC (8 h après le créneau), toujours rien ; un clic « Run workflow »
  de l'humain n'a rien produit. L'application de l'assistant reçoit 403 sur `workflow run` et
  `workflow enable` : on n'y a pas accès. **Décision de l'humain : laisser tel quel.** Conséquence
  documentée partout (`ASSISTANT.md`, section « Reprendre la conversation » ci-dessus, ce journal) :
  **ne plus annoncer d'alerte automatique** ; le relevé se fait à la main, le tableau affichant le
  dernier relevé connu avec sa date. Aucun fichier du site n'est modifié : il n'y a rien à corriger
  dans le tableau, seulement une promesse à ne pas répéter.

- **19 novembre 2026 — l'IA locale s'arrête, les assistants en ligne restent** : l'humain annonce
  que **le PC de la maison est un vieux PC** et demande de supprimer l'étape « Installer l'outil à
  distance ». Question posée (abandonner l'IA locale / viser un VPS / tenter en très petit) :
  **abandon de l'IA locale**, puis « Tailscale et la Freebox, on laisse tomber, je verrai plus
  tard ». Le projet `ia-decouverte` devient **« Assistants en ligne »** — 5 étapes, 2/5 (40 %) :
  inventaire (réécrit, avec le verdict sur le vieux PC), choix des outils en ligne (Claude,
  ChatGPT, Gemini), tests réels, notes, adoption. Retirées : installation à distance, modèle
  local, tunnel, Freebox et imprimante. **La rubrique « L'IA locale » est retirée du site** et de
  la barre de navigation (`renderIALocale`, styles, section) — décision assumée : une fiche qui
  reste pour dire « abandonné » est un reproche. Tableau : **25 / 37 (68 %)**. Deux erreurs
  corrigées au passage : `ETAT.md` et `README.md` annonçaient « 2 / 10 » pour un projet qui n'a
  que 9 étapes depuis le 18/11, et `verif_sauvegarde.js` comptait 41 étapes en dur — désormais
  dérivé de `projets.json`. La raison de l'arrêt est aussi dans `IA-LOCALE.md` et dans
  `index.html` (`NOTE_IA_LOCALE_ABANDONNEE`), là où une session future la lira.

- **19 novembre 2026 — « Corriger », c'est qui ? »** : en préparant son test, l'humain s'arrête sur
  le bouton « ✎ Corriger » du tableau : « en fait c'est toi qui corriges ». Vrai, et le site ne le
  disait pas. Trois retouches, aucune mécanique changée : la barre qui apparaît après une modif ne
  dit plus « modifications locales enregistrées » (ce qui laissait croire à une publication) mais
  **« Modifié sur cet appareil — rien n'est publié »** ; l'infobulle du bouton précise qu'on peut
  aussi le demander à son assistant ; et une entrée d'aide répond franchement — le bouton sert à
  corriger sur-le-champ, le dire à l'assistant est le chemin le plus simple, et le bouton n'est pas
  un devoir de plus. Contrôles inchangés : 15 + 44 + 25 + 26 + 19.

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

- **19 novembre 2026 — la manette : choix tranché et alerte « automatique »** : la fiche du 13/11 (Drive) dit **5 fils** (rouge +5 V, noir masse, blanc signal sur A0, + 2 fils) alors que le tableau demandait « 3 fils » — corrigé. Modèle retenu : **AdreaPocket 5F36POIGELTROT, 13,99 €** (guidon 22 mm, trou 22,2 mm), **en rupture** ; décision de l'humain : attendre plutôt que payer 20 à 26 € ailleurs, le vélo ne roulant pas en hiver. Nouveau module `scripts/verifier_manette.py` (standard seul, décision prudente : rupture / disponible / **inconnu** si la page ne répond pas) et workflow `outils/alerte-manette/alerte-manette.yml` qui le lance **chaque matin à 7 h 20** et publie `alerte-manette.json` ; le tableau de bord l'affiche sur la carte du vélo (et **rien** si le fichier manque). Le jour du retour en stock, il **ouvre un ticket GitHub** — c'est la notification par e-mail — et le referme si la rupture revient. `scripts/verif_alerte_manette.js` : 37 contrôles.

  **⚠ DÉMENTI LE 20/11 : il ne tourne PAS chaque matin** — aucune exécution planifiée n'a jamais eu
  lieu (voir le journal du 20/11). Le paragraphe qui suit décrit ce qui a fonctionné le 19/11, pas
  un service en marche.
  **Annoncé « en service » le 19/11 à 10 h 47 — puis démenti le 20/11.** Le workflow est actif sur `main` (`.github/workflows/alerte-manette.yml`, posé à la main dans l'onglet Actions) et son premier passage a réussi de bout en bout : la fiche a été lue depuis les serveurs GitHub, verdict `rupture`, et le robot a publié lui-même `alerte-manette.json` dans un commit signé « Alerte manette » (`07458b2`). Il **devait** tourner chaque matin à 7 h 20 et commiter un relevé par jour : c'était le projet, pas le fait. **Rien de tel n'a eu lieu** — une seule exécution planifiée, le 20/11 à 15 h 29 UTC, et le relevé se fait à la main depuis. Le principe retenu à l'époque (un fichier différent à chaque passage, pour que GitHub n'endorme pas la tâche après 60 jours) reste juste dans le mécanisme, pas dans le service. GitHub refuse à l'application de l'assistant l'écriture dans `.github/workflows/` (droit `workflows` absent) : c'est pourquoi la source versionnée vit dans `outils/alerte-manette/` et que la copie active a été posée à la main. Si l'on doit un jour modifier le robot, modifier la source **puis** la copie active, jamais l'une sans l'autre.

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
