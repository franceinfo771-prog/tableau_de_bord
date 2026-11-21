# La mémoire du site, à la maison

Une page de dialogue qui lit la mémoire du site et la donne au petit modèle
qui tourne sur cette machine. **Rien ne sort d'ici** : la page parle seulement
à `127.0.0.1:11434`, et elle fonctionne en double-clic, sans serveur.

## Les trois pièces

| Fichier | Ce qu'il fait |
|---|---|
| `chat.html` | la page : la fiche du site est **dedans**, plus un bouton « Ouvrir un fichier » |
| `fabriquer-fiche.py` | produit la fiche à partir de `ETAT.md` et `projets.json` — rien n'est recopié à la main |
| `fiche.txt` | la fiche en clair, pour la relire avant de s'en servir |

## La mettre en place une fois

**Un seul fichier à lancer : `raccourcis/INSTALLER.bat`.** Il pose deux raccourcis sur le
Bureau — `1 - Tableau de bord` et `2 - IA locale`. Ensuite, un double-clic suffit, et
`2 - IA locale` télécharge **la page et sa fiche** dans `%LOCALAPPDATA%\TableauDeBord`,
puis l'ouvre. Détail et dépannage : `raccourcis/LISEZ-MOI.md`.

L'ancien `RECUPERER-PAGE.bat` est **supprimé** : il avait des fins de ligne cassées
(`\r\r\n`) et ne remplaçait jamais le fichier — deux essais, deux échecs.

1. clic droit sur `raccourcis/INSTALLER.bat` → **Exécuter** (ou double-clic) ;
2. double-clic sur `2 - IA locale` sur le Bureau ;
3. en haut à droite doit s'afficher `connecté · 1 modèle(s)`. Si c'est
   `hors service`, Ollama ne tourne pas : lance-le, puis recharge la page.

## La refaire quand le site change

```
python3 pont-outils/fabriquer-fiche.py
```

Le script réécrit `fiche.txt` et remplace le bloc entre les marqueurs
`FICHE-MEMOIRE:DEBUT` et `FICHE-MEMOIRE:FIN` dans `chat.html`.
Il échoue volontairement si la fiche dépasse **4 600 caractères** : au-delà,
le petit modèle ne la lit pas, il la survole.

## Les deux questions de l'essai

1. **dans la fiche** — « Combien d'étapes sont faites sur combien ? »
   → la réponse est le compte affiché par `ETAT.md` (au 21/11 : `34 / 50`) ;
2. **pas dans la fiche** — « Quel est le prix de la manette ? »
   → la fiche ne le dit pas. S'il répond `13,99 €`, **il a inventé**.

C'est la deuxième question qui donne le verdict. Un modèle qui invente est
plus dangereux qu'un modèle qui se tait.

## Pourquoi ce n'est pas « l'IA du site »

Tranché le 21/11. Trois raisons, aucune n'est une opinion :

1. le site est **une page statique chez GitHub** — aucun serveur n'y tourne, donc
   aucun modèle ne peut y être ;
2. un visiteur ne peut pas joindre `127.0.0.1` : c'est l'intérieur de **ta** machine,
   pas la sienne ;
3. ce modèle **ne sait pas lire le site** — il ne lit pas de fichiers, il ne résume
   pas, il n'écrit pas de HTML.

L'IA du site existe quand même : c'est la session qui lit `ETAT.md`. Cette page-ci
est **un carnet de bord hors ligne**, pas un substitut.

## Ce que cette page n'est pas

- **pas une mémoire** : un modèle ne stocke pas des faits, il produit des tournures.
  La mémoire, ce sont les fichiers ; le modèle n'est que le lecteur ;
- **pas une IA du site** : elle ne lit pas GitHub, elle ne publie rien, elle ne
  connaît que ce qu'on lui donne ;
- **pas un secret** : le site n'a rien de sensible, et cette page non plus.
