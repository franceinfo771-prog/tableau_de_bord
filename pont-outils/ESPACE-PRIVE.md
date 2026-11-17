# L'espace IA privé — architecture

## Ce qu'on veut

Une page, dans le tableau de bord, où l'on pose une question et où la
réponse vient du **modèle qui tourne chez vous**, sur l'ASUS.

Rien ne part sur internet. La question va de votre navigateur au poste de
la maison, le modèle répond, la réponse revient par le même chemin.

---

## Les trois pièces

```
   Navigateur (poste du travail)
        │
        │  HTTPS
        ▼
   ┌─────────────────────────────────────┐
   │  tableau_de_bord (GitHub Pages)     │   ← l'interface, publique
   │  zone « Mon IA privée »             │     mais sans secret
   └─────────────────────────────────────┘
        │
        │  HTTPS, vers une adresse privée
        ▼
   https://asus.xxxx.ts.net              ← Tailscale Serve
        │
        │  proxy local
        ▼
   http://127.0.0.1:1234                ← LM Studio, lié à localhost
        │
        ▼
   le modèle (Qwen, gpt-oss…)
```

**Le site public ne fait rien de spécial.** GitHub Pages est un site
statique : il n'exécute aucun code. La page « Mon IA privée » est un
client mince — elle envoie une requête HTTP et affiche ce qui revient. Toute
l'intelligence est sur l'ASUS.

---

## Le piège à connaître : le contenu mixte

Votre tableau de bord est servi en **HTTPS** (GitHub Pages l'impose).

Un navigateur **interdit** à une page HTTPS d'appeler une adresse en
`http://`. C'est une règle de sécurité, sans exception et non
contournable par une option. Un lien direct vers
`http://192.168.x.x:1234` sera bloqué, même depuis votre propre réseau.

D'où le tunnel : l'ASUS doit être joignable **en HTTPS**.

---

## Pourquoi Tailscale

| | Tailscale | Cloudflare Tunnel | Redirection de port |
|---|---|---|---|
| Port ouvert sur la box | aucun | aucun | 443 |
| Visible depuis internet | non | oui (URL publique) | oui |
| HTTPS obtenu | oui, automatique | oui | à renouveler |
| Authentification | compte Tailscale | email, à configurer | à faire soi-même |

Tailscale crée un **réseau privé entre vos appareils** (WireGuard). Chaque
appareil a une adresse `100.x.x.x` que seuls les autres appareils du réseau
voient. Le poste du travail et l'ASUS se voient comme s'ils étaient sur le
même câble, même si l'un est au bureau et l'autre à la maison.

`tailscale serve` publie ensuite le port local sur une adresse HTTPS du
réseau privé, avec un certificat valide :

```powershell
tailscale serve --bg http://127.0.0.1:1234
# → https://asus.xxxx.ts.net
```

Point important : **LM Studio reste lié à `127.0.0.1`**. Tailscale fait le
pont. Le serveur n'est donc pas joignable depuis le réseau local de la
maison, ni depuis internet. Seuls vos appareils Tailscale y ont accès.

---

## Les secrets : où ils vivent

| Élément | Où il est stocké | Jamais |
|---|---|---|
| Adresse du serveur | navigateur (Brave, `localStorage`) | dans le dépôt |
| Jeton d'API LM Studio | navigateur (Brave, `localStorage`) | dans le dépôt |
| Conversation en cours | navigateur (Brave, `localStorage`) | dans le dépôt |
| Phrase de passe du pont | le poste à la maison (`cle.txt`) | dans le dépôt |
| Jeton GitHub | le poste à la maison + le navigateur | dans le dépôt |

C'est le même principe que la clé fine-grained GitHub déjà en place dans le
tableau de bord : **ce qui est secret reste sur votre machine**.

---

## LM Studio : ce qu'il faut savoir

- `lms daemon up` — le démon, sans interface.
- `lms get <modèle>` — télécharge.
- `lms load <modèle> --gpu max --context-length 4096` — charge en mémoire.
- `lms server start --port 1234 --cors` — le serveur.
- `lms server log` — journal des échanges (utile pour vérifier).
- `lms load --estimate-only` — vérifie la mémoire **avant** de charger.

L'authentification par jeton existe depuis LM Studio 0.4.0 : elle s'active
dans *Server Settings → Require Authentication*, et le jeton se crée dans
*Manage Tokens*. LM Studio le demande si le serveur est exposé au-delà de
`localhost`.

Le `--cors` est nécessaire parce que la page du tableau de bord et l'API
n'ont pas la même origine. LM Studio prévient que c'est un élargissement :
c'est acceptable ici, puisque le serveur n'est atteignable que par
Tailscale, et qu'un jeton peut s'ajouter par-dessus.

---

## Ce qui est déjà en place

- **Le pont** (`PONT-poste.ps1`) : relève la machine, installe LM Studio,
  choisit le modèle selon la RAM, ouvre le tunnel, publie les rapports.
- **Les déclencheurs en clair** : `pont/installer.txt` porte une demande
  (`modele`, `action: tunnel`). Aucun secret, donc l'assistant peut agir
  sans la phrase de passe — et l'utilisateur garde la main sur l'accord.
- **La zone « Mon IA privée »** (`index.html`) : interface de dialogue,
  diffusion en continu, réglages stockés dans le navigateur.
- **Les tests** (`test_ia_privee.js`) : la page est confrontée à un faux
  serveur LM Studio — lecture du flux SSE, chemin `/v1/chat/completions`,
  en-tête `Authorization`, réponse lue.

---

## Ce qui reste à faire, dans l'ordre

1. Sur l'ASUS, lancer le pont (une commande).
2. Relevé automatique → je sais la RAM, donc je choisis le modèle.
3. Installation de LM Studio + modèle, à distance.
4. Installation de Tailscale sur l'ASUS, puis sur le poste du travail
   (c'est le seul geste à faire de la main sur le bureau).
5. Ouverture du tunnel → l'adresse privée est publiée.
6. Coller l'adresse (et le jeton) dans la zone « Mon IA privée » du
   tableau de bord.

---

## Les limites, dites franchement

- **La vitesse.** Sans carte graphique dédiée, un modèle de 13 Go tourne à
  3-6 tokens/seconde. C'est utilisable pour reformuler, résumer, classer.
  Pas pour raisonner longtemps.
- **Le modèle reste en mémoire.** Il faut le laisser chargé ; l'ASUS doit
  être allumé.
- **Le tunnel dépend de Tailscale.** Si le service tombe, plus d'accès
  jusqu'au retour du service.
- **Un modèle local ne remplace pas un assistant en ligne** en qualité. Ce
  qu'il apporte : la vie privée et le hors-ligne.
