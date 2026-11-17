# Pas à pas — installation du pont

Guide clic par clic. Faites une étape, vérifiez, puis continuez.

Temps total : environ 10 minutes.

---

## Méthode express (si vous êtes à l'aise)

Sur le poste à la maison, ouvrez **PowerShell** (menu Démarrer → tapez
`powershell` → Entrée), puis collez cette ligne **entière** et validez :

```powershell
irm https://raw.githubusercontent.com/franceinfo771-prog/tableau_de_bord/pont/pont-outils/INSTALLER.ps1 | iex
```

Le script télécharge le pont, vérifie son empreinte et le lance. Il vous
demandera ensuite votre jeton GitHub et votre phrase de passe.

> Si vous préférez la méthode clic par clic, continuez ci-dessous.

---

## Étape 1 — Télécharger le fichier

Ouvrez ce lien dans votre navigateur, **sur le poste à la maison** :

```
https://raw.githubusercontent.com/franceinfo771-prog/tableau_de_bord/pont/pont-outils/PONT-START.bat
```

Le fichier s'appelle `PONT-START.bat`. Chrome le télécharge directement.

> **Si le navigateur affiche le texte du fichier au lieu de le télécharger** :
> faites un clic droit sur le lien → *Enregistrer le lien sous…* →
> choisissez **Bureau** → *Enregistrer*.

✅ **Où vous devez en être** : un fichier `PONT-START.bat` sur votre Bureau.

---

## Étape 2 — Débloquer le fichier

Windows bloque les fichiers téléchargés. Dites-le-lui de ne pas le faire.

1. Clic droit sur `PONT-START.bat` → **Propriétés**
2. En bas, cochez **✓ Débloquer** (la case apparaît seulement si le
   fichier est marqué « zone internet »)
3. Cliquez **OK**

✅ **Où vous devez en être** : la fenêtre de propriétés est fermée.

---

## Étape 3 — Créer votre jeton GitHub

C'est l'étape la plus longue, mais elle n'est à faire **qu'une fois**.

1. Ouvrez cette page :
   ```
   https://github.com/settings/personal-access-tokens/new
   ```
2. Si GitHub demande de vous reconnecter, faites-le.
3. Remplissez le haut de la page :
   - **Token name** (le nom) : `pont-arena`
   - **Expiration** (l'expiration) : `1 year` — le pont est un agent
     permanent, une expiration courte l'arrêterait sans prévenir
   - **Description** (la description) : `pont poste maison`
4. **Repository access** (l'accès aux dépôts) :
   - Choisissez **Only select repositories** (Seuls les dépôts sélectionnés)
   - Tapez `tableau_de_bord` dans le champ et sélectionnez-le dans la liste
5. **Permissions** (les autorisations) :
   - Tout en bas de la liste, section **Repository permissions**
   - Cherchez la ligne **Contents**
   - Dans son menu déroulant, choisissez **Read and write**
   - C'est la seule permission à modifier — laissez tout le reste à `No access`
     ou `Read-only`
6. Cliquez **Generate token** en haut
7. GitHub affiche le jeton **une seule fois**. Copiez-le
   (bouton **copy** en haut à droite de la zone du jeton).

> ⚠️ **Si vous perdez le jeton**, vous pouvez en créer un autre à tout
> moment : la page de la même URL en affiche la liste. Rien n'est cassé.

✅ **Où vous devez en être** : le jeton est dans votre presse-papiers.
Il commence par `github_pat_`.

---

## Étape 4 — Lancer le pont

1. **Double-cliquez** sur `PONT-START.bat`
2. Une fenêtre noire s'ouvre. C'est normal.
3. Elle affiche :

   ```
   ==========================================================
      PONT ARENA
      Acces a votre poste a la maison depuis l'assistant
   ==========================================================

     Premiere installation : extraction du script...
     Script installe dans C:\Users\<vous>\AppData\Local\Pont\PONT-poste.ps1
   ```

4. Puis elle demande :

   ```
     Jeton GitHub (fine-grained) : 
   ```

   → **Collez votre jeton** (`Ctrl+V`) et appuyez sur **Entrée**.

   *Il s'affiche en clair : c'est normal, et cela vous permet de vérifier
   la copie. Le jeton reste sur votre poste.*

5. Ensuite :

   ```
     Phrase de passe du pont (choisissez-la, ne la communiquez a personne) :
   ```

   → Tapez une phrase **longue et que personne ne devine**. Elle ne
   s'affiche pas pendant la frappe.

   ⚠️ **C'est important** : c'est cette phrase qui me permettra de chiffrer
   mes ordres. Choisissez-la maintenant, notez-la dans un endroit sûr
   (un mot de passe, votre gestionnaire de mots de passe). Si vous la
   perdez, il faudra reconfigurer le pont.

6. Le pont continue :

   ```
   Chiffrement annonce : sha256
   Verification du chiffrement sur ce poste...
     sha256 : OK
     sha1   : OK
     aller-retour : OK
     phrase erronee refusee : OK
   Chiffrement valide sur ce poste.
   ```

7. Enfin :

   ```
   Pont en ecoute (Ctrl+C pour arreter). Depot : ...
   ```

✅ **Où vous devez en être** : la fenêtre affiche des points qui
s'écoulent (`. . . .`) — c'est le pont qui attend mes ordres.

**Laissez cette fenêtre ouverte.** Vous pouvez la réduire avec le bouton
`—` en haut à droite, mais ne la fermez pas.

---

## Étape 5 — Prévenir votre assistant

Dites simplement :

> c'est fait

Je lirai le rapport publié par votre poste et je confirmerai que tout est
bon. **Vous n'avez rien à recopier.**

---

## Si ça coince

| Message | Cause | Solution |
|---|---|---|
| Le fichier s'ouvre dans un éditeur de texte | `.bat` associé à l'éditeur | Clic droit → *Ouvrir avec* → *Invite de commandes* |
| « Windows a protégé votre ordinateur » | Fichier bloqué | Étape 2 : *Propriétés* → *Débloquer* |
| « L'extraction est impossible » | Fichier altéré en route | Retéléchez-le (étape 1) |
| `powershell n'est pas reconnu` | PowerShell désactivé | Tapez `powershell` dans le menu Démarrer |
| `Unauthorized` / `Bad credentials` | Jeton erroné ou mal collé | Reprenez l'étape 3, régénérez un jeton, recommencez l'étape 4 |
| `404` ou `Not Found` | Mauvais dépôt dans la config | Vérifiez `pont-config.json` : `franceinfo771-prog/tableau_de_bord`, branche `pont` |
| « La commande n'est pas reconnue » | `cmd.exe` introuvable | Dites-le-moi, je corrige le script |

**Dans tous les cas** : copiez-moi le message exact affiché, et je corrige.

---

## Et ensuite, dans lepont quotidien

Vous n'avez **rien** à faire. Le pont tourne, il va chercher mes ordres
toutes les 30 secondes.

Si vous redémarrez le poste, relancez `PONT-START.bat` (ou installez la
tâche planifiée décrite dans `LISEZ-MOI-PONT.md` pour qu'il démarre tout
seul).

---

## Et ensuite, installer LM Studio

C'est **moi** qui m'en occupe : une fois le pont lancé, je lui demande
d'installer LM Studio et un modèle adapté à votre machine. Vous n'avez
rien à faire de plus.

Si vous voulez le lancer vous-même, sans m'attendre :

```powershell
& "$env:LOCALAPPDATA\Pont\PONT-START.bat" -Installer
```

Le modèle est alors choisi automatiquement selon la mémoire de la machine.
Pour en imposer un, ajoutez `-Modele` :

```powershell
& "$env:LOCALAPPDATA\Pont\PONT-START.bat" -Installer -Modele qwen2.5-3b-instruct
```

Le poste publie ensuite un rapport que je lis directement.

> **Téléchargement :** un modèle pèse de 1 à 13 Go. Sur une connexion
> lente, prévoyez le temps. Le poste peut seemer figé pendant
> l'opération — c'est normal.
