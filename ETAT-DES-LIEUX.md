# État des lieux — 21 novembre 2026

> **Ce que c'est.** Le compte rendu honnête d'une journée de travail — le 21 novembre 2026 —
> sur le site et sur l'IA locale. Ce qui a marché, ce qui a raté, ce qui a coûté du temps pour rien,
> et ce qui reste à faire. Écrit pour qu'une conversation neuve n'ait pas à refaire les
> mêmes erreurs — et pour qu'aucune réussite ne soit présentée comme plus grande qu'elle
> n'est.
>
> **L'état vivant, lui, est dans `ETAT.md`.** Ce fichier-ci est une **photo du 21 au soir** :
> il ne remplace pas l'état, il l'explique. Ce qui se passe après cette date ne s'y trouve pas.

---

## 1. Ce qui a marché

| Quoi | Preuve |
|---|---|
| **Ollama installé** sur le vieux PC | `llama3.2:1b`, 1,3 Go, version vérifiée, PATH réparé |
| **Il parle français** | phrases correctes, aucun charabia |
| **Il raconte une histoire** | cinq lignes cohérentes sur un chat qui apprend à nager |
| **Une page de dialogue locale** | `pont-outils/chat.html` — s'ouvre en double-clic, sert le modèle mot à mot |
| **La fiche mémoire** | 2,7 k caractères tirés d'`ETAT.md` et `projets.json`, jamais recopiés à la main |
| **La page lit un fichier du disque** | bouton « Ouvrir un fichier », rien ne sort de la machine |
| **Le site se publie sans faute** | 10 contrôles automatisés, tous verts à chaque fusion |

---

## 2. Ce qui a raté

| Quoi | Ce qui s'est vraiment passé |
|---|---|
| **Résumer un texte** | il refuse, puis tronque — même une leçon de collège. Refus appris, pas de la prudence |
| **Compter** | interrogé sur 33 / 49, il a répondu **23 sur 25**. Il a préféré recalculer que lire, a oublié deux projets, et son addition est fausse |
| **Retenir** | chaque session repart de zéro. Il n'a aucune mémoire entre deux messages |
| **Lire un long fichier** | 34 000 caractères d'`ETAT.md` : impossible. D'où la fiche de 2,7 k |
| **Être l'IA du site** | impossible : le site est une page statique, sans serveur. Un visiteur ne peut pas joindre `127.0.0.1` |
| **Rectifier le site** | impossible : il n'ouvre pas de fichiers, n'écrit pas de HTML, ne publie rien |

**Le défaut central, en une phrase : il produit des phrases plausibles avec l'aplomb d'une
réponse juste.** C'est ce qui le rend inutilisable pour du travail, et supportable pour
écrire des histoires.

---

## 3. Ce qui nous a coûté du temps pour rien

| Erreur | Combien de temps | Ce qu'on aurait dû faire |
|---|---|---|
| Croire que l'application Ollama contenait un chat | 4 allers-retours | vérifier avant de faire cliquer |
| Chercher le menu « Propriétés » du vieux PowerShell | 3 tentatives | demander tout de suite « y a-t-il des onglets en haut ? » |
| Faire fermer la fenêtre Ollama avec le X | 1 aller-retour | **le X quitte le serveur**, pas seulement la fenêtre |
| Relancer le serveur par `Start-Process` | 2 allers-retours | il ne transmet pas le réglage `OLLAMA_ORIGINS` — le test `curl` l'aurait dit |
| Le vieux `chat.html` resté sur le Bureau | 1 aller-retour | une seule ligne `Invoke-WebRequest` a suffi |

**La leçon** : deux vérifications valent mieux que dix essais. C'est `curl.exe` qui a donné
la réponse définitive (`Access-Control-Allow-Origin: *`), pas les redémarrages à l'aveugle.

---

## 4. Ce qui était faux dans les documents, et qui est corrigé

| Où | Ce qui était écrit | Correction |
|---|---|---|
| `ETAT.md` | « le robot vérifie **chaque matin à 7 h 20** » | il a tourné **une seule fois** (20/11, 15:29 UTC) |
| `ETAT.md` | « une alerte part **automatiquement** par e-mail » | supprimé — le relevé se fait à la main |
| `index.html` | la même phrase, dans la copie embarquée | corrigée aussi |
| `projets.json` | « alerte quotidienne en place » | remplacé |
| `ETAT.md` | projet IA locale en **6 / 8** | **6 / 7** (la fiche l'a révélé) |
| `ETAT.md` | « Détail des **6** projets » | « Détail des projets » (il y en avait sept) |

**Comment ces erreurs sont apparues** : en fabriquant la fiche mémoire, qui relit les données
au lieu de les recopier. C'est l'argument le plus fort en faveur du script.

---

## 5. Les chiffres, sans arrondi

| | |
|---|---|
| Projets suivis | **8** |
| Terminés | **2** (`Notes de recherche`, `Les sites`) |
| Étapes faites | **33 / 49 (67 %)** au moment des essais |
| Étapes faites, depuis | **37 / 50 (74 %)** — 4 projets terminés |
| Veille | 14 recherches — 7 retenues, 7 sans résultat |

**Le pourcentage baisse quand le travail progresse** : ajouter un projet ouvert fait monter
le dénominateur. C'est normal, et c'est plus juste qu'un chiffre qui flatte.

---

## 6. Les trois mesures du soir — et ce qu'elles disent

Les trois questions ont été posées au modèle local, dans `chat.html`, fiche chargée. Aucune
n'a été choisie pour le flatter.

### « Quels projets sont terminés ? »

Il a nommé *Notes de recherche* (3/3) et *Les sites* (10/10) — **chiffres justes** — puis
a enchaîné avec *Vélo électrique DIY (4/9, en cours)*, *Assistants en ligne (2/5, en cours)*
et *Un lecteur local (2/5, en cours)*, tous annoncés « en cours » **et rangés dans les
terminés**, dans la même ligne, sans voir la contradiction. Trois projets ont disparu
(*application de poche*, *Maquette*, *IA locale*).

### « Combien d'étapes du vélo sont faites ? »

La fiche dit, deux lignes plus haut : `Vélo électrique DIY : 4/9 (44 %), en cours`.
Il a répondu **2**, puis a inventé une étiquette, « nulle étape », et conclu par une
phrase qui ne veut rien dire : *« Vélo électrique DIY n'est pas inclus dans les 9 et 9
étapes du projet. »*

### Le diagnostic, et il n'est pas celui qu'on croyait

| Ce qu'on lui demande | Ce qu'il fait | Résultat |
|---|---|---|
| une **liste** | il la recopie | chiffres justes, **classement faux** |
| un **fait précis** | il le cherche | ne le trouve pas, **invente** |
| un **total** | il recalcule | 23/25 au lieu de 33/49 |

**Il recopie une liste. Il ne retrouve pas un fait.** Deux facultés différentes, et il
n'en a qu'une.

Conséquence : **raccourcir la fiche ne réglerait rien.** La réponse était à deux lignes,
sur une seule ligne de texte, et il l'a manquée. Le problème n'est pas la longueur.

Une nuance, pour être juste : la fiche donne le compte (`4/9`) mais pas *lesquelles* des
neuf étapes sont faites. Il avait donc le chiffre, pas le détail. N'empêche : il a ignoré
un chiffre écrit noir sur blanc et inventé « nulle étape ».

### « Quel est mon prénom ? » — et il a dit la vérité

Le mot *prénom* n'apparaît **nulle part** dans la fiche (vérifié : zéro occurrence). Sa réponse :

> « Je ne sais pas. Tu me dis que tu dissembles, mais je ne sais pas non plus. Tu as oublié de me
> dire ton prénom ! »

**Aucune invention, et une question à la place.** C'est la qualité qu'on ne lui connaissait pas.

### Le verdict, et il est meilleur que prévu

| Ce qu'il ne sait pas faire | Ce qu'il fait très bien |
|---|---|
| retrouver un fait dans un texte | **dire « je ne sais pas »** |
| classer une liste | **demander au lieu de deviner** |
| calculer | ne pas broder |

**Il recopie, il ne cherche pas — mais il ne ment pas.** Ce n'est pas la même chose qu'un modèle
qui invente. Pour un carnet de bord, c'est la qualité qui compte le plus.

Le projet **« Un lecteur local pour la mémoire du site » se termine à 5/5** sur ce verdict.

### « Quel est le point commun entre le vélo et la maquette ? » — hors réseau

Mode Avion **allumé** (le panneau le montre, `Activé`), question jamais posée. Sa réponse commence
par recopier **mot pour mot** une ligne de la fiche : `une porte qui fait joli (2/4 · 50 %) —
Regarder l'épreuve : ça tient ? ça se voit à un mètre ? ça se photographie ?`

**Cette phrase, il ne peut pas l'inventer. La preuve est faite : il tourne sans réseau, et il lit sa fiche.**

Puis il ajoute : *« L'objectif de former une maquette **pour le vélo** »*. **C'est faux.** La maquette
est une **porte couverte d'absorbants pyramidaux**, faite pour faire joli — elle n'a aucun rapport avec
le vélo. Deux projets voisins dans une liste, et il a fabriqué le lien. En puces, avec aplomb.

### Le verdict se resserre — et je dois corriger le mien

J'avais écrit, il y a une heure : **« il ne ment pas »**. C'était vrai quand il n'avait rien à dire.
**C'est faux dès qu'on lui demande de rapprocher deux choses.** Le verdict juste, en trois temps :

| Question | Sa réponse | Verdict |
|---|---|---|
| Combien de projets sont terminés ? | les trois, nommés | **il recopie juste** |
| Quel est mon prénom ? | « je ne sais pas » | **il ne ment pas quand il n'a rien** |
| Le point commun vélo / maquette | « une maquette pour le vélo » | **il invente dès qu'il raisonne** |

> **Il recopie, il ne cherche pas, et il ne raisonne pas.**

C'est plus étroit que ce que j'avais écrit, et c'est plus juste. Un verdict trop flatteur serait une
erreur de plus — exactement ce que ce document est censé empêcher.

### Une erreur de ma part, corrigée ici

J'avais annoncé deux fois que « Quel est le prix de la manette ? » prouverait l'invention,
parce que le prix ne serait pas dans la fiche. **C'est faux** : le prix y est, deux fois
(`AdreaPocket 5F36POIGELTROT` à `13,99 €`). S'il répond 13,99 €, il lit bien — ce test ne
prouve rien. Remplacé par « Quel est mon prénom ? », dont la réponse n'est nulle part.

---

## 7. Ce qui reste ouvert

- **Ne pas redemander à un 1 B de résumer un texte** : il refuse ou tronque, c'est mesuré deux fois.
- **Ne pas lui demander de compter** : il recalcule faux.
- **Ne pas présenter `chat.html` comme l'IA du site** : c'est un carnet de bord hors ligne.
- **Ne pas annoncer d'alerte automatique** : le robot ne se réveille pas tout seul.
- **Ne pas annoncer « relevé à 7 h 20 »** : il tourne l'après-midi, et rarement.

---

## 8. La phrase de la journée, celle qui mérite d'être gardée

> « Le site a déjà sa mémoire. Ce qui manque, ce n'est pas la mémoire, c'est un lecteur
> qui vit à la maison. »

Et sa suite, le même jour, une heure plus tard :

> « Donc il ne faut pas l'utiliser pour l'IA interne du site, en fait. »

**Les deux sont justes.** La mémoire est dans les fichiers ; le lecteur du dehors, c'est la
session qui les lit ; le lecteur du dedans sait écrire des histoires et rien de plus.
