# L'IA locale — décision d'arrêt (19 novembre 2026)

> **ARRÊTÉ LE 19 NOVEMBRE 2026.** L'humain a tranché : le PC de la maison est **un vieux PC**,
> il ne peut pas faire tourner un modèle. L'IA locale est abandonnée, le projet ne garde que
> les **assistants en ligne**. La rubrique « L'IA locale » a été **retirée du site** — une
> fiche qui reste en vitrine pour dire « abandonné » devient un reproche.
>
> Ce fichier reste comme **dossier de l'impasse** : il explique pourquoi on s'est arrêté, pour
> qu'aucune session ne repropose de refaire tourner un modèle sur cette machine. Ne pas le
> prendre pour une spécification à rejouer.
>
> ---
>
> *(Ce qui suit décrit l'état du 19 novembre avant la décision — gardé pour la traçabilité.)*


> **Ce que c'est.** Une rubrique du tableau de bord, `#ia-locale`, qui dit où en est
> l'IA privée : quelle machine, quel outil, quel modèle, ce qui reste, et surtout
> *comment on la joint* — par le pont ou par le tunnel. Elle ne parle pas, elle ne se
> connecte à rien : c'est une fiche d'état, pas un chat.
>
> **Décidé le 19 novembre 2026**, sur la demande de l'humain : « l'IA locale dans le
> tableau, au courant du site ». Concrètement : que le tableau ne présente plus ce
> projet comme une simple liste d'étapes parmi les autres, mais dise en clair ce qui
> est en place, ce qui manque, et par où l'on passe.

---

## 1. Ce qui est en place aujourd'hui

| Élément | État |
|---|---|
| Inventaire de la machine | **fait** (ASUS, PC de la maison) |
| Outil retenu | **LM Studio**, pour son démon headless pilotable à distance |
| Installation à distance | **pas faite** — c'est l'étape qui bloque la suite |
| Modèle téléchargé | non — dépend de la RAM relevée |
| Pont vers le PC de la maison | **écrit et testé**, dans `pont-outils/` ; pas encore lancé sur le poste |
| Tunnel (Tailscale) | non installé sur l'ASUS |

**Où ça bloque, en une phrase :** rien n'est installé sur l'ASUS, donc le pont n'a
rien à piloter — et le modèle n'existe pas encore.

---

## 2. Les trois niveaux, et ce qu'ils donnent

| | Ce que ça donne | Ce qu'il faut |
|---|---|---|
| **1. Le pont** | piloter l'ASUS et son réseau : Freebox, imprimante, autres postes | la commande sur l'ASUS + la phrase de passe |
| **2. + le modèle local** | interroger le modèle qui tourne sur l'ASUS, sur place | le modèle téléchargé et chargé |
| **3. + le tunnel** | **toi** interrogeant le modèle depuis le navigateur | Tailscale installé sur l'ASUS |

Le niveau 2 n'a pas besoin du tunnel : le pont interroge LM Studio en
`127.0.0.1:1234` sur place et relaie la réponse. Le tunnel ne sert qu'au dialogue
direct, plus fluide (le pont attend le tour de boucle, ~30 s).

---

## 3. Pourquoi le site ne peut pas être le chat

Trois raisons, toutes vérifiées :

1. **Le contenu mixte.** Le site est en HTTPS ; un navigateur interdit à une page
   HTTPS d'appeler `http://192.168.x.x:1234`. Il faudrait du HTTPS sur l'ASUS — donc
   Tailscale (niveau 3), pas une simple adresse locale.
2. **Le réseau.** L'ASUS n'est pas joignable depuis Internet : aucun port n'est ouvert
   sur la box, et c'est voulu.
3. **La règle du projet.** `ASSISTANT.md` interdit toute dépendance extérieure et tout
   secret dans la page. Or un site statique ne sait pas garder une clé.

**Conséquence tenue :** la rubrique est une **fiche**, pas un chat. Elle dit où en est
l'IA locale et par où on la joint. Si un jour le niveau 3 est en place, un simple lien
vers l'adresse Tailscale suffira — le site n'aura rien d'autre à connaître.

---

## 4. Ce que la fiche affiche

- **Où ça en est** : l'étape qui bloque (installer sur l'ASUS), dite une fois.
- **La machine** : ASUS, à la maison.
- **L'outil** : LM Studio.
- **Le modèle** : pas encore choisi — dépend de la RAM relevée.
- **Comment on la joint** : par le pont aujourd'hui ; par le tunnel après le niveau 3.
- **Le point ouvert** : service toujours disponible (VPS) ou outil qu'on active quand on
  en a besoin (l'ASUS) — **pas tranché**.

Elle est **dérivée du projet** `ia-decouverte` de `projets.json` : cocher une étape là-bas
met la fiche à jour. Aucune donnée nouvelle, aucune saisie en double.

---

## 5. Les contrôles

`scripts/verif_ia_locale.js` vérifie, sur le rendu réel de la page :

- la rubrique existe et s'affiche ;
- ses chiffres correspondent à `projets.json` (étapes faites / total) ;
- elle nomme l'outil retenu et la machine ;
- elle ne contient **ni champ de saisie, ni bouton d'envoi, ni adresse `http://`** —
  preuve qu'elle ne peut pas devenir un chat par accident ;
- les mentions d'Arena et de GitHub restent hors de la façade ;
- elle n'est pas une injonction : aucun « à faire », aucun « il faut ».

---

## 6. Ce qu'il ne faut pas refaire

- **Ne pas rebrancher de chat dans le site** (zone `#ia-privee`, installation guidée,
  réglage d'adresse et de jeton) : retiré le 18/11, contrôlé par `verif_rendu.js`.
- **Ne pas remettre l'étape** « Brancher la zone Mon IA privée du tableau de bord sur
  l'API » : retirée du projet, `normalizeData` la filtre encore.
- **Ne pas proposer le tunnel comme prérequis** : le niveau 2 suffit pour interroger le
  modèle par le pont, et c'est le chemin le plus court.
