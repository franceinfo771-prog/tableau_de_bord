# Ce que vous verrez — et dans quel ordre

Repère pour le soir : à chaque étape, ce qui change à l'écran, et ce que
vous avez à faire. Vous n'avez à recopier **rien** : je lis les rapports
depuis le dépôt.

---

## Étape 0 — Vous ouvrez le mail sur l'ASUS

Un encadré bleu avec la commande PowerShell. Clic droit → Coller.

**À faire** : créer le jeton GitHub si ce n'est pas fait (lien dans le mail).

---

## Étape 1 — Vous lancez la commande

L'écran affiche, en quelques secondes :

```
==========================================================
  PONT ARENA
  Acces a votre poste a la maison depuis l'assistant
==========================================================

  Premiere installation : extraction du script...
  Script installe dans C:\Users\<vous>\AppData\Local\Pont\PONT-poste.ps1
```

Puis : `Connexion au depot : OK`, `Empreinte SHA-256 verifiee : le fichier est intact.`

**À faire** : rien. C'est normal que ça prenne dix secondes.

---

## Étape 2 — Le pont vous parle

```
  Jeton GitHub (fine-grained) :
```

→ Collez le jeton (`Ctrl+V`), Entrée. Il s'affiche en clair : c'est normal.

```
  Phrase de passe du pont (choisissez-la, ne la communiquez a personne) :
```

→ Tapez votre phrase. **Rien ne s'affiche** pendant la frappe : c'est masqué.

**À faire** : la phrase. Notez-la dans votre gestionnaire de mots de passe.

---

## Étape 3 — La preuve que tout marche

```
  Verification du chiffrement et publication du rapport...
  sha256 : OK
  sha1   : OK
  aller-retour : OK
  phrase erronee refusee : OK
  Chiffrement valide sur ce poste.

  Publication de la configuration de la machine...
  Configuration de la machine publiee.

  Pont en ecoute (Ctrl+C pour arreter). Depot : franceinfo771-prog/tableau_de_bord / pont
```

Puis des points qui s'affichent en boucle : `....` — le pont est en attente,
il interroge GitHub toutes les 30 secondes.

**À faire** : **laisser la fenêtre ouverte**. C'est elle qui me permet de
piloter le poste.

---

## Étape 4 — Ce que je vois, et ce que je fais

Sans que vous écriviez quoi que ce soit, je récupère `machine.txt` et je
lis la vraie configuration de l'ASUS : processeur, mémoire, carte
graphique, espace disque, réseau. Rien de tout ça n'a été supposé.

Je choisis ensuite le modèle **d'après ce que votre machine peut
réellement faire** — pas au hasard. Si la RAM est confortable, je vise un
modèle plus exigeant ; si elle est juste, je prends un modèle léger qui
tourne fluide.

---

## Étape 5 — L'installation se fait toute seule

Je déclenche l'installation. Sur l'ASUS, une nouvelle fenêtre s'ouvre et
traite : LM Studio, le modèle choisi, puis le serveur local.

C'est le moment le plus long (le modèle pèse plusieurs gigaoctets). Vous
pouvez laisser faire.

**À faire** : laisser tourner. Éventuellement vérifier que l'ASUS ne se
met pas en veille.

---

## Étape 6 — L'accès privé s'ouvre

Tailscale s'installe et rejoint un réseau privé entre vos deux postes.
**Aucun port n'est ouvert sur votre Freebox.** Si Tailscale demande une
validation dans le navigateur, un lien s'affiche : cliquez, validez,
revenez.

Une fois fait, j'obtiens une adresse privée du type
`https://asus-xxxx.ts.net` qui pointe vers l'API locale du modèle.

---

## Étape 7 — Vous voyez la première réponse

Sur le tableau de bord, dans la zone **« Mon IA privée »** :

```
https://franceinfo771-prog.github.io/tableau_de_bord/
```

Vous collez l'adresse privée et le jeton dans les réglages de la zone,
puis vous posez votre première question. La réponse s'écrit **au fil de
l'eau**, mot après mot.

Et le modèle répond **chez vous**, sur l'ASUS. Rien ne sort d'internet
pour la computation.

---

## Étape 8 — Ce que je documente

Je mets à jour le tableau de bord avec ce qui a vraiment été mesuré :
la vitesse réelle, la taille de modèle qui reste fluide, les limites
rencontrées. Sans embellir.

---

## Et ensuite, la suite

Le pont peut aussi piloter ce qui n'est joignable que depuis votre
réseau domestic : **la Freebox**, **l'imprimante**, les autres postes.

On regardera d'abord l'inventaire de la Freebox avant d'y toucher, comme
on a fait pour l'ASUS.

---

## Deux choses à garder en tête

**Le pont doit tourner.** C'est un agent : il faut une fenêtre ouverte sur
l'ASUS. On réglera une tâche planifiée pour qu'il démarre tout seul au
démarrage du poste — ensuite, vous n'aurez plus à y penser.

**La veille arrête tout.** Écran éteint et capot fermé, ça va. Mais une
veille réelle coupe le service : il faudra laisser l'ASUS vigil, ou
prévoir qui le réveille.

---

## Si ça coince

Le mail contient une méthode de secours. Et vous pouvez toujours m'écrire
un mot — même une simple photo d'écran de l'erreur. Je reprendrai à partir
de là.
