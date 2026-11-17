# LM Studio sur le poste à la maison

## L'idée

Installer LM Studio chez vous, y faire tourner un modèle en local, et
**piloter tout ça à distance** depuis votre poste du travail — sans jamais
cliquer dans une fenêtre distante.

Le pont rend ça possible : l'agent qui tourne chez vous sait installer un
logiciel, télécharger un modèle, le charger en mémoire et lancer le serveur
local. Moi, je lui envoie les ordres et je lis les résultats.

## Ce que LM Studio apporte

Un modèle de langage qui tourne **chez vous** :

- aucune donnée ne sort de la maison — vos textes ne vont sur aucun serveur ;
- fonctionne même sans internet ;
- gratuit, sans compte, sans abonnement.

LM Studio expose ensuite une API **compatible OpenAI** sur
`http://localhost:1234` : tout logiciel qui sait parler à OpenAI sait
parler à votre machine.

## La séquence, en pratique

### 1. Installer le pont (une fois, le soir)

Sur le poste à la maison :

```
irm https://raw.githubusercontent.com/franceinfo771-prog/tableau_de_bord/pont/pont-outils/INSTALLER.ps1 | iex
```

Puis votre jeton GitHub, puis votre phrase de passe.

### 2. Je relève la configuration de la machine

Le pont publie automatiquement les caractéristiques du poste (processeur,
AVX2, RAM, carte graphique, disque). Ça m'évite de vous demander des
chiffres à deviner, et c'est indispensable pour choisir un modèle
adapté.

### 3. J'installe LM Studio

L'agent exécute, dans l'ordre :

1. **Installation** — le script officiel (`llmster`, le démon headless),
   avec `winget` et l'installateur direct en secours ;
2. **Daemon** — `lms daemon up` ;
3. **Modèle** — `lms get <modèle>` ;
4. **Chargement** — `lms load <modèle> --gpu max --context-length 4096` ;
5. **Serveur** — `lms server start`, puis vérification sur
   `http://localhost:1234/v1/models`.

Un rapport part sur la branche `pont` ; je le lis et je vous dis ce qui a
marché.

### 4. On choisit le bon modèle

Ça dépend de votre machine, et c'est pour ça que le relevé vient d'abord :

| RAM de la machine | Modèle possible | Vitesse attendue |
|---|---|---|
| 8 Go | Phi-4-mini, Qwen2.5-1.5B | correcte, 5-10 tok/s |
| 16 Go | Qwen2.5-3B, Llama 3.2 3B, Gemma 3 4B | fluide, 10-20 tok/s |
| 32 Go | Qwen2.5-7B, Mistral 7B, gpt-oss-20B | confortable, 20-40 tok/s |
| 64 Go+ | Qwen2.5-14B, gpt-oss-20B en pleine mémoire | rapide |

Deux verdicts à ne pas oublier :

- **AVX2 est obligatoire.** Sans lui, llama.cpp ne démarre pas. Mon relevé
  le vérifie.
- **Un GPU dédié change tout.** Sur un Intel intégré, on compte 3 à 10
  tokens/seconde ; avec une carte NVIDIA, on passe à 25-40. Le relevé
  indique la VRAM disponible.

## Modèles recommandés pour commencer

| Modèle | Taille | Pour quoi |
|---|---|---|
| `qwen2.5-1.5b-instruct` | ~1 Go | Tester que tout marche. Rapide, léger. |
| `qwen2.5-3b-instruct` | ~2 Go | Le meilleur rapport qualité/taille en français. |
| `qwen2.5-7b-instruct` | ~4,7 Go | Vrai travail : rédaction, analyse. |
| `gpt-oss-20b` | ~12 Go | Raisonnement, si la machine le permet. |

Le choix se fait **après** le relevé, pas avant.

## Ce que LM Studio ne fait pas

- Il n'améliore pas automatiquement vos résultats : un modèle local de 3 Go
  est moins fin qu'un assistant en ligne.
- Sur CPU seul, c'est lent : quelques tokens par seconde. Utile pour de la
  confidentialité et du hors-ligne, pas pour de la vitesse.
- Le téléchargement d'un modèle pèse 1 à 13 Go sur le disque.

C'est exactement ce que votre projet « Découverte de logiciels IA » cherche
à mesurer : *ce qui marche / ce qui ne marche pas*.

## L'API locale, une fois le serveur lancé

```bash
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"<modele>","messages":[{"role":"user","content":"Bonjour"}]}'
```

Compatible OpenAI : les SDK Python, Node, les outils de codage acceptent
`http://localhost:1234/v1` comme base URL.

## En cas de souci

| Message | Solution |
|---|---|
| `winget n'est pas reconnu` | Sans importance : le script officiel prend le relais |
| Le téléchargement du modèle s'interrompt | Relancez `-Installer` : il reprend |
| `Aucune donnée n'est exposee` | Le serveur n'a pas démarré : `lms server status` |
| `AVX2 non supporte` | Le moteur llama.cpp ne peut pas tourner sur ce processeur |
| Le poste semble figé pendant le téléchargement | Normal : 1 à 13 Go à récupérer |
