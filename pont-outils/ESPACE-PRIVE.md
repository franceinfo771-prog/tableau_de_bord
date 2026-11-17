# L'espace IA privé — architecture

## Ce qu'on veut

Deux choses, qui n'en font qu'une :

1. **une IA privée** — un modèle qui tourne chez vous, sur l'ASUS ;
2. **une passerelle vers votre environnement de la maison** — la Freebox,
   l'imprimante, les autres postes du réseau.

Et une interface : la zone « Mon IA privée » du tableau de bord, joignable
depuis le poste du travail.

---

## Le principe

La Freebox, l'imprimante et les autres machines du salon **ne sont
joignables que depuis le réseau domestic**. C'est exactement là que tourne
le pont.

Le pont *est* la passerelle. Ce n'est pas un écran distant : c'est un
protocole.

```
   Vous (n'importe où) → l'IA du site (Arena) → pont chiffré → l'ASUS
                                                              ├─→ la Freebox
                                                              ├─→ l'imprimante
                                                              ├─→ les autres postes
                                                              └─→ LM Studio → le modèle
```

---

## Les trois niveaux

| | Ce que ça donne | Ce qu'il faut |
|---|---|---|
| **1. Le pont** | je pilote l'ASUS et son réseau : Freebox, imprimante, autres machines | la commande sur l'ASUS + la phrase de passe |
| **2. + le modèle local** | j'interroge l'IA qui tourne sur l'ASUS, sur place | le modèle téléchargé et chargé |
| **3. + le tunnel** | **vous** interrogez le modèle depuis le navigateur du travail | Tailscale installé sur l'ASUS |

Le niveau 2 **n'a pas besoin du tunnel** : le pont interroge LM Studio en
`127.0.0.1:1234` sur place et relaye la réponse. Le tunnel ne sert qu'à ce
que *vous* parliez directement au modèle, dans l'onglet du site.

À vous de choisir si le dialogue direct vaut le coup : par le pont, chaque
échange attend le tour de boucle (30 s) ; par le tunnel, c'est fluide.

---

## Le piège à connaître : le contenu mixte

Le tableau de bord est servi en **HTTPS** (GitHub Pages l'impose).

Un navigateur **interdit** à une page HTTPS d'appeler une adresse en
`http://`. C'est une règle de sécurité, sans exception. Un lien direct vers
`http://192.168.x.x:1234` sera bloqué, même depuis votre propre réseau.

D'où le tunnel : l'ASUS doit être joignable **en HTTPS**.

---

## Pourquoi Tailscale

| | Tailscale | Redirection de port (Freebox) | Cloudflare Tunnel |
|---|---|---|---|
| Port ouvert sur la box | aucun | 443 impossible (Freebox OS réserve la redirection aux ports ≥ 49153) | aucun |
| IPv4 publique | pas nécessaire | il faut la demander (IP partagée par défaut) | pas nécessaire |
| HTTPS | certificat automatique | certificat auto-signé à installer dans Brave | automatique |
| Adresse | fixe | fixe (DynDNS) | fixe si tunnel nommé, **aléatoire sinon** |
| Visible d'internet | non | oui | oui |

Décision retenue : **Tailscale**. Le poste du travail l'a déjà ; le pont
l'installe seul sur l'ASUS (winget) ; il ne reste qu'un clic de validation.

Cloudflare reste un bon secours le jour où vous aurez un nom de domaine :
un tunnel nommé donne une adresse fixe et Cloudflare Access peut exiger un
code par email.

### Ce que la Freebox peut faire, et ce que ça ne remplace pas

La Freebox sait : donner un sous-domaine DynDNS stable, faire une
redirection de port (au-dessus de 49153), et héberger un serveur VPN
intégré (PPTP, L2TP/IPsec, OpenVPN).

Mais : pas de port 443, donc pas de Let's Encrypt par la méthode simple ;
pas de DNS-01 sans nom de domaine à vous ; donc un certificat auto-signé,
à installer à la main dans Brave sur le poste du travail. Et il faut
demander une IPv4 full-stack dans l'espace abonné.

C'est faisable, mais c'est plusieurs manipulations là où Tailscale donne
le même résultat sans rien demander à la Freebox — et laisse la box
fermée, ce qui vaut mieux.

---

## Les secrets : où ils vivent

| Élément | Où il est stocké | Jamais |
|---|---|---|
| Adresse du serveur | navigateur (Brave, `localStorage`) | dans le dépôt |
| Jeton d'API LM Studio | navigateur (Brave, `localStorage`) | dans le dépôt |
| Conversation en cours | navigateur (Brave, `localStorage`) | dans le dépôt |
| Phrase de passe du pont | le poste à la maison (`cle.txt`) et chez l'assistant (`pont/cle.txt`, hors dépôt) | dans le dépôt |
| Jeton GitHub | le poste à la maison + le navigateur | dans le dépôt |

C'est le même principe que la clé fine-grained GitHub déjà en place dans le
tableau de bord : **ce qui est secret reste sur votre machine**.

La phrase de passe est la clé maîtresse du canal chiffré. Le dépôt est
public : sans elle, quiconque le parcourt pourrait lire — ou écrire — dans
le canal entre l'assistant et votre ASUS.

---

## LM Studio : ce qu'il faut savoir

- `lms daemon up` — le démon, sans interface.
- `lms get <modèle>` — télécharge.
- `lms load <modèle> --gpu max --context-length 4096` — charge en mémoire.
- `lms server start --port 1234 --cors` — le serveur. **Il reste au premier
  plan** : le pont le lance en arrière-plan, sinon il se figerait.
- `lms server log` — journal des échanges.
- `lms load --estimate-only` — vérifie la mémoire **avant** de charger.

L'authentification par jeton existe depuis LM Studio 0.4.0 : *Server
Settings → Require Authentication*, puis *Manage Tokens*.

Le `--cors` est nécessaire parce que la page du tableau de bord et l'API
n'ont pas la même origine. C'est acceptable : le serveur n'est atteignable
que par le réseau privé, et un jeton peut s'ajouter par-dessus.

---

## Ce qui est déjà en place

- **Le pont** (`PONT-poste.ps1`) : relève la machine (CPU, AVX2, RAM, GPU,
  disque, **adressage réseau**), installe LM Studio, choisit le modèle
  selon la RAM, installe Tailscale, ouvre le tunnel, publie les rapports.
- **Les déclencheurs en clair** : `pont/installer.txt` porte une demande
  (`modele`, `action: tunnel`, `methode`). Aucun secret, donc l'assistant
  peut agir sans la phrase de passe — et l'utilisateur garde la main sur
  l'accord.
- **La zone « Mon IA privée »** (`index.html`) : dialogue en diffusion
  continue, réglages dans le navigateur.
- **Les tests** (`test_ia_privee.js`) : la page est confrontée à un faux
  serveur LM Studio.

---

## Les conditions, sans détour

1. **L'ASUS doit être allumé, branché et éveillé.** En veille, plus rien ne
   répond. Une fois le réglage « ne rien faire à la fermeture du capot »
   mis, il peut rester dans un tiroir, écran éteint.
2. **Le modèle doit tenir en RAM.** 16 Go → `gpt-oss-20b` ; 8 Go → un
   modèle plus petit. Le relevé le décide.
3. **Le pont doit tourner** — fenêtre ouverte (minimisée) ou tâche
   planifiée.
4. **La clé Tailscale expire tous les ~180 jours.** Un re-clic ce jour-là.

---

## Les limites, dites franchement

- **La vitesse.** Sans carte graphique dédiée, un modèle de 13 Go tourne à
  3-6 tokens/seconde : reformuler, résumer, classer — pas raisonner
  longtemps.
- **Le modèle reste en mémoire.** Il faut le laisser chargé.
- **Le tunnel dépend de Tailscale.** Si le service tombe, plus d'accès
  jusqu'à son retour.
- **Un modèle local ne remplace pas un assistant en ligne** en qualité. Ce
  qu'il apporte : la vie privée, le hors-ligne, et une IA qui tourne chez
  vous.
