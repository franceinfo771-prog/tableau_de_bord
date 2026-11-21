> # ⚠ PÉRIMÉ — NE PAS LIRE POUR CONNAÎTRE L'ÉTAT
>
> Ce fichier décrit la session **du 17 novembre 2026** : il annonce une branche
> `arena/ebda441b`, un commit `65c6562` et un `main` à `2fda254`. **Tout cela est faux
> depuis longtemps.** Il est conservé comme **trace** de ce qui a été tenté ce jour-là,
> pas comme état.
>
> **L'état vivant est dans `ETAT.md`.** Ce qui a réussi ou raté depuis : `ETAT-DES-LIEUX.md`.

# Mémoire de session — Passerelle IA locale (PC travail → ASUS maison)

## État actuel

Branche de session : `arena/ebda441b-tableau-de-bord` (poussée, commit `65c6562`).
Branche distante `pont` : commit **`c77c024`** (artefacts du pont + tests + secours
+ chargement adaptatif du modèle).
Branche `main` : `2fda254d` (inchangée, PR #10 déjà fusionnée).

Le worktree temporaire a été supprimé. Le dossier `pont/` reste exclu du
suivi Git (`.git/info/exclude`) — il est la source de travail locale.

**Attention** : le dossier `pont/` est exclu, mais il contient des fichiers
que `pont-outils/` doit refléter. Après toute modification de `pont/`,
recopier vers `pont-outils/` avant de publier.

## Publication via worktree (procédure fiable)

Ne jamais faire de `git checkout` pour mettre à jour la branche `pont` : cela
écraserait `pont/` (exclu du suivi, donc non restauré par Git).

```
git fetch -q origin +refs/heads/pont:refs/remotes/origin/pont
git worktree add -f /tmp/wtN origin/pont
cp pont/<fichier> /tmp/wtN/pont-outils/
cd /tmp/wtN && git add -A && git commit && git push origin HEAD:refs/heads/pont
cd /home/user/tableau_de_bord && git worktree remove --force /tmp/wtN
```

Toujours vérifier `git ls-remote origin refs/heads/pont` après : la branche
`pont` a déjà été poussée par erreur pendant un test e2e.

## Ce qui a été publié dans cette session

### Branche `pont` (`ec0606a`)
- `pont-outils/PONT-poste.ps1` : ajout du relevé réseau (`ip_locale`,
  `passerelle`, `dns`, `nom_hote`) dans `Publier-Machine`.
- `pont-outils/PONT-START.bat` : reconstruit depuis la source ; empreinte
  **`d8d71dcd254d9a16f5e12ef27a43c49007692d9ced01b31d15f5d1da459e6af1`**.
- `pont-outils/INSTALLER.ps1` : hash annoncé synchronisé avec le BAT.
- `pont-outils/ESPACE-PRIVE.md` : architecture complète réécrite (passerelle,
  Tailscale, LM Studio, CORS/jeton, secrets hors dépôt, déplacement de l'hôte,
  performances et limites).
- `pont-outils/PAS-A-PAS.md` : section sur la phrase de passe + rappel de ce
  que le pont peut piloter à la maison.

Vérifié **en ligne** via l'API GitHub : hash servi = hash annoncé, script
embarqué identique à `PONT-poste.ps1`, `Demarrer-ServeurLocal` présent,
0 appel bloquant à `lms server start`, attente Tailscale = 60 × 5 s.

### Branche de session (`8572873`)
- `ETAT.md` : section IA complétée (2/10), PC du travail distingué de l'ASUS,
  nouvelle étape « piloter l'environnement de la maison ».
- `projets.json` : nouvelle étape + question ouverte mise à jour (24/41, 59 %).
- `index.html` : copie de secours `DEFAULT_DATA` resynchronisée.
- `etat.json` : régénéré (40 fichiers suivis).

## Contrôles finaux (tous verts)
- PowerShell tree-sitter : 0 erreur (1289 lignes).
- ASCII pur pour le `.ps1` et le `.bat` ; BAT en CRLF.
- `verifier_bat.py` (nouveau, dans `pont/`) : aucun appel bloquant.
- Test IA `pont/test_ia_privee.js` : **10/10**.
- Rendu DOM `scripts/verif_rendu.js` : **20/20**.
- `scripts/sync_donnees_embedded.py --verifier` : à jour.
- `test_kat.py` : **sha256 OK, sha1 OK** → l'autotest affichera « OK » sur un
  poste Windows réel (le KAT du script PowerShell est reproduit exactement).
- Chargement du modèle adaptatif : `--gpu max`, puis `--gpu auto`, puis sans
  réglage GPU. Un ASUS sans GPU dédié peut refuser `--gpu max` ; le modèle se
  charge quand même.
- `test_e2e.py` : chiffrement, refus de mauvaise phrase, refus de falsification,
  puis **nettoyage des artefacts**.
- Aucun secret dans le diff (`pont-kat-2016` est un vecteur de test à clé connue
  dans l'autotest ; `pont-config.json` est un gabarit).

## Vérifications en ligne (via l'API GitHub, pas en local)
- Hash du BAT servi = hash annoncé dans `INSTALLER.ps1` : `a8335a63…2fac`.
- Script embarqué dans le `.bat` == `PONT-poste.ps1` publié : identique.
- `ip_locale`, `passerelle`, `dns`, `nom_hote` présents dans le script servi.
- `Demarrer-ServeurLocal` présent, **0** appel bloquant à `lms server start`.
- Dossier `pont/` distant : **vide** (aucune commande de test en attente).

## Point de vigilance corrigé
Le test e2e écrivait réellement `pont/cmd.enc` et `pont/rep.enc` dans le dépôt.
Un poste réel démarrant juste après aurait exécuté `echo bonjour-du-pont &&
hostname` au lieu d'attendre un ordre. Corrigé : `gh_delete` ajouté à
`pont_sandbox.py`, le test refuse de tourner si une commande est en attente et
nettoie ses propres artefacts. Nettoyage poussé dans `d7601f4`.

## Environnement
- `cryptography` n'est pas installable dans le Python système (PEP 668).
  Utiliser `/tmp/venv/bin/python` pour `pont/pont_sandbox.py`.
- `jsdom` installé via `npm install --no-save` (non commité, `.gitignore`).
- `node_modules/` temporairement présent dans le dépôt de travail — ignoré.

## Prochaine action — une seule, sur l'ASUS

L'utilisateur ouvrira le mail reçu à la maison, puis lancera dans PowerShell :

```
irm https://raw.githubusercontent.com/franceinfo771-prog/tableau_de_bord/pont/pont-outils/INSTALLER.ps1 | iex
```

**Un mail a été envoyé** à `franceinfo771@gmail.com` (17 nov. 2026, 02:23)
— objet *« La commande PowerShell à lancer sur le PC de la maison » —
avec la commande, ce qui va être demandé, la méthode de secours et les
deux points rassurants. HTML + version texte. Aucun secret dedans.

**Aucun droit administrateur n'est requis.** Le pont écrit dans
`C:\Users\<vous>\AppData\Local\Pont` et nulle part ailleurs.

Si la commande échoue : `pont-outils/SECOURS.md` (aussi publié sur la branche
`pont`) donne cinq méthodes indépendantes, de la plus simple à la plus
exhaustive, plus un tableau « ce que vous voyez → ce que ça veut dire ».

### Le test aura lieu à midi, pas le soir
L'utilisateur testera l'installation vers 12 h (heure de Paris) le 17 nov. 2026.
La surveillance (démarrée à 11 h 25, durée 3 h → jusqu'à 14 h 25) couvre ce
créneau. Le téléchargement du modèle (1 à 5 Go) est la seule étape longue :
il se fait via `lms get`, qui gère la reprise, et le pont ne l'attend pas
bloqué — il publie son rapport même si le téléchargement n'est pas fini.

### Surveillance en cours
`pont/surveiller_pont.py` tourne en arrière-plan (process_id
`surveillance-du-pont-0a3df28b`) : il interroge l'API GitHub toutes les
30 s et s'arrête dès que `pont/autotest.txt` **et** `pont/machine.txt`
sont arrivés. Les rapports sont copiés dans `pont/surveillance/`.
L'agent peut donc reprendre la main sans que l'utilisateur prévienne.

### Fichiers que le pont publiera
`pont/autotest.txt` · `pont/machine.txt` · `pont/lmstudio.txt` · `pont/tunnel.txt`

### Après l'amorçage — enchaînement sans recopie de rapports
1. `python3 pont/pont_sandbox.py machine` → lire la configuration réelle ;
2. choisir le modèle selon la RAM relevée (1,5B / 3B / 7B / gpt-oss-20b) ;
3. déclencher `pont/installer.txt` → installer LM Studio + modèle + serveur ;
4. `python3 pont/pont_sandbox.py tunnel --methode tailscale` → Tailscale Serve ;
5. coller l'URL privée et le jeton dans la zone « Mon IA privée » du site ;
6. vérifier de bout en bout et documenter performances et limites.

## Note sur l'outillage Gmail
Les appels `call_connector_tool` avec Gmail exigent les arguments sous
forme de **chaîne JSON** (pas d'objet) : `{"input": "{\"to\": [...]}"}`.
Passer un objet échoue avec « to : Instance type object, Expected array ».
Un mail de test a été envoyé pour valider le format, puis mis à la
corbeille (soft delete) — il n'apparaît plus dans les envois.

## Points de vigilance
- Aucun rapport machine réel n'existe : ne rien affirmer d'activé avant que
  l'ASUS ait lancé le pont.
- `lmstudio.ai` est inaccessible depuis le cloud ; le téléchargement se fait
  depuis l'ASUS.
- Ne pas exposer LM Studio sur `0.0.0.0` sans jeton ni pare-feu.
- Le tunnel Cloudflare rapide donne une URL aléatoire et publique : il ne
  remplace pas Tailscale pour une adresse stable.
- L'ASUS doit rester allumé, branché et éveillé ; la veille réelle interrompt
  le service.
- TeamViewer est abandonné : ne pas le reproposer.
- Publier les fichiers du pont via un worktree sur `origin/pont`
  (`git worktree add -f /tmp/wt_pont origin/pont`), pas par un checkout qui
 écraserait `pont/`.
