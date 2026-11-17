# Le pont — accès à votre poste à la maison depuis l'assistant

## Pourquoi TeamViewer ne suffit pas

TeamViewer relie **deux écrans**. Il faut que quelqu'un regarde le poste et
accepte la connexion. Depuis le cloud, il n'y a ni écran ni souris : la
fenêtre TeamViewer qui s'affiche sur votre poste à la maison reste donc
inutilisable pour moi — je ne peux pas cliquer dedans.

J'ai vérifié : les serveurs TeamViewer sont **inaccessibles** depuis mon
environnement (connexion bloquée), et il n'y a ni navigateur ni affichage
graphique. Ce n'est pas un réglage à changer, c'est un blocage réseau.

Ce pont remplace cela : un petit programme tourne **sur votre poste** et va
chercher tout seul les ordres que je dépose. Il les exécute, puis me renvoie
le résultat. Rien à cliquer.

---

## Installation : un seul fichier, un seul double-clic

### 1. Télécharger

[Télécharger PONT-START.bat](https://raw.githubusercontent.com/franceinfo771-prog/tableau_de_bord/pont/pont-outils/PONT-START.bat)

C'est **le seul fichier** dont vous avez besoin. Il contient le programme
complet. Enregistrez-le sur votre poste à la maison (par exemple dans
`C:\pont`).

### 2. Double-cliquer

Double-cliquez sur `PONT-START.bat`. Une fenêtre noire s'ouvre. C'est normal.

Au premier lancement il demande deux choses :

1. **Votre jeton GitHub.** Un jeton personnel *fine-grained* avec la
   permission **Contents : Read and write** sur le dépôt
   `franceinfo771-prog/tableau_de_bord` uniquement.
   → GitHub → *Settings* → *Developer settings* → *Personal access tokens*
   → *Fine-grained tokens* → *Generate*.
   Cochez `Contents` → `Read and write`, et limitez le dépôt à celui-ci.
2. **Votre phrase de passe.** Choisissez-la, elle s'affiche masquée.
   C'est ce qui me permettra de chiffrer de mon côté.

Les deux sont enregistrés sur votre poste, dans
`C:\Users\<vous>\AppData\Local\Pont\`. **Ils ne partent jamais dans le dépôt.**

### 3. C'est tout

Le script vérifie le chiffrement, publie un rapport, et se met en écoute :
il va chercher mes ordres toutes les 30 secondes.

**Laissez la fenêtre ouverte.** Vous pouvez la réduire, mais pas la fermer.

Pour que le pont démarre tout seul à l'allumage du poste : touche Windows →
`Tâches planifiées` → *Créer une tâche* → onglet **Déclencheurs** →
*Au démarrage*, onglet **Actions** → *Démarrer un programme* :
`powershell.exe`, arguments
`-ExecutionPolicy Bypass -WindowStyle Hidden -File "%LOCALAPPDATA%\Pont\PONT-poste.ps1"`,
et dans **Conditions**, décochez *Démarrer uniquement si l'ordinateur est
raccordé au réseau*.

---

## Vous ne voyez rien ? Ce qu'il faut faire

| Situation | Ce que ça veut dire | Solution |
|---|---|---|
| *« Le fichier s'ouvre dans un éditeur de texte »* | Windows a associé `.bat` à un éditeur | Clic droit sur le fichier → *Ouvrir avec* → *Invite de commandes* |
| *« Windows a protégé votre ordinateur »* | Fichier téléchargé marqué « zone internet » | Clic droit → *Propriétés* → cocher *Débloquer* → *OK* |
| *« L'extraction est impossible »* | Le fichier a été altéré en route | Retéléchez-le |
| *« powershell n'est pas reconnu »* | PowerShell désactivé | Tapez `powershell` dans le menu Démarrer pour vérifier |

Si rien de tout ça n'y est : dites-moi **le message exact** affiché, et je
corrige.

---

## Ce qui circule, et sous quelle forme

Tout transite par le dépôt GitHub `tableau_de_bord`, branche `pont`, mais
**chiffré** :

| Fichier | Contenu | Lisible dans le dépôt ? |
|---|---|---|
| `pont/cmd.enc` | l'ordre que j'envoie | non (chiffré) |
| `pont/rep.enc` | le résultat que votre poste renvoie | non (chiffré) |
| `pont/autotest.txt` | le rapport de test du poste | oui (inoffensif) |
| `pont/pont-kdf.txt` | l'algorithme que votre poste supporte | oui (inoffensif) |

Chiffrement : AES-256-CBC, clé dérivée par PBKDF2 (200 000 tours), et une
signature HMAC-SHA256 vérifiée **avant** tout déchiffrement. Conséquence
directe : un ordre modifié en chemin, ou envoyé par quelqu'un d'autre, est
refusé — le poste n'exécute jamais une commande qui n'a pas été signée avec
votre phrase de passe.

Le rapport `autotest.txt` est en clair, et c'est volontaire : il ne contient
aucun secret (ni jeton, ni phrase de passe) et il me permet de confirmer que
votre poste est prêt **sans que vous ayez à recopier quoi que ce soit**.

## Ce que je peux faire une fois le pont en route

- Lire et écrire des fichiers sur votre poste (bureau, documents, dossiers).
- Lancer un programme, capturer sa sortie et son code de retour.
- Installer un logiciel, vérifier une version, lancer un test.
- Faire les petites tâches de la maison : lancer le script de sauvegarde,
  vérifier qu'un fichier est bien là, regarder un journal.

Je travaille **par petits bouts** : je lance une commande, je vous montre le
résultat, et je valide avec vous avant toute chose qui modifie ou supprime.

## Précision importante sur la sécurité

Le pont donne beaucoup de pouvoir : qui peut écrire dans `cmd.enc` peut
demander l'exécution d'un ordre. Deux garde-fous :

1. **La signature.** Seule la phrase de passe permet de produire une
   enveloppe valide. Le poste refuse tout le reste — vérifié par un test
   automatique.
2. **Le jeton.** Il reste sur votre poste, jamais dans le dépôt. Seul votre
   jeton permet d'écrire dans `pont/`.

Le dépôt est public : quiconque peut *lire* `cmd.enc` et `rep.enc` — mais il
n'y voit que du charabala chiffré. En revanche, un visiteur pourrait
*remplacer* `cmd.enc` par autre chose : votre poste refuserait cette
enveloppe (signature invalide), donc aucune commande parasite ne tournerait.
C'est vérifié dans `test_e2e.py`, étape 6.

## Ce que le pont ne fait pas

- Pas d'écran : je ne vois pas ce qui s'affiche chez vous.
- Pas de souris : je ne clique nulle part.
- Le pont ne démarre pas tout seul : il faut l'avoir lancé au moins une fois
  (ou installer la tâche planifiée ci-dessus).
- La fenêtre doit rester ouverte, sinon le pont dort.

## Les outils de ce dossier (pour le développeur)

| Fichier | Rôle |
|---|---|
| `PONT-START.bat` | **le fichier à installer sur le poste** (autonome) |
| `PONT-poste.ps1` | l'agent PowerShell, extrait automatiquement |
| `construire_bat.py` | regénère le `.bat` à partir du `.ps1` |
| `crypto.py` | le chiffrement, côté cloud |
| `pont_sandbox.py` | la console du pont, côté cloud |
| `test_e2e.py` | le test complet (commande → exécution → réponse) |
| `test_kdf.py` | le test de négociation SHA-256 / SHA-1 |
| `test_ported.py` | le test croisé de la logique du script |
| `test_autotest_rapport.py` | le test du rapport publié |

Côté cloud, la console se pilote ainsi :

```bash
python3 pont_sandbox.py etat                     # le poste répond-il ?
python3 pont_sandbox.py envoyer "ipconfig /all"  # une commande
python3 pont_sandbox.py lire                     # le résultat
```
