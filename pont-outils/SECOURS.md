# Secours — si la commande unique échoue

À ouvrir seulement en cas de blocage. Chaque méthode est **indépendante** :
si l'une marche, les autres sont inutiles.

---

## Méthode 1 — Réessayer la commande unique (le plus souvent suffisant)

Le plus souvent, l'échec vient du réseau ou d'un antivirus qui bloquait
l'accès à GitHub.

1. Vérifiez qu'Internet fonctionne sur l'ASUS (ouvrez une page web).
2. Relancez **exactement** la même commande :

```powershell
irm https://raw.githubusercontent.com/franceinfo771-prog/tableau_de_bord/pont/pont-outils/INSTALLER.ps1 | iex
```

L'installateur essaie déjà **deux sources** et **deux fois chacune** :
le lien brut, puis l'API GitHub. Si l'une passe, ça suffit.

---

## Méthode 2 — Télécharger le fichier à la main (si le blocage persiste)

1. Sur l'ASUS, ouvrez Chrome et allez à :

```
https://github.com/franceinfo771-prog/tableau_de_bord/raw/pont/pont-outils/PONT-START.bat
```

2. Chrome devrait **télécharger** le fichier. S'il l'affiche à l'écran :
   clic droit sur la page → *Enregistrer sous…* → choisissez **Bureau** →
   nom `PONT-START.bat` → **Enregistrer**.

3. Clic droit sur `PONT-START.bat` → **Propriétés** → en bas, cochez
   **✓ Débloquer** → **OK**.

   *Sans cette case cochée, Windows refuse de l'exécuter.*

4. **Double-cliquez** sur `PONT-START.bat`.

> Cette méthode contourne complètement PowerShell et le réseau en direct :
> le fichier est téléchargé par le navigateur.

---

## Méthode 3 — Si Windows refuse d'ouvrir le .bat

C'est rare, mais cela arrive quand l'association de fichier `.bat` a
été modifiée.

**Solution la plus simple** : faites un clic droit sur le fichier, puis
**Exécuter en tant qu'administrateur**.

Si le clic droit ne propose pas cette option, ou si une fenêtre s'ouvre et
se ferme aussitôt, ouvrez **PowerShell** (menu Démarrer → tapez `powershell`
→ Entrée), placez le fichier sur le Bureau, puis :

```powershell
cd "$env:USERPROFILE\Desktop"
.\PONT-START.bat
```

---

## Méthode 4 — Si l'antivirus bloque

Windows Defender ou un antivirus tiers peut refuser d'exécuter un `.bat`
issu d'Internet.

1. Ouvrez **Sécurité Windows** → **Protection contre les virus** →
   **Gérer les paramètres**.
2. Défilez jusqu'à **Protection contre les intrusions** → **Ajouter une
   exclusion** → **Dossier**.
3. Ajoutez le dossier : `C:\Users\<votre nom>\AppData\Local\Pont`
   (et, si le fichier est sur le Bureau, `C:\Users\<votre nom>\Desktop`).
4. Relancez la méthode 2 ou 1.

> Ne désactivez pas votre antivirus en entier : une exclusion ciblée
> suffit et elle est réversible.

---

## Méthode 5 — Si rien ne marche

Ne perdez pas de temps : **écrivez-moi ce que vous voyez**. Une photo de
l'écran ou le texte exact de l'erreur suffisent.

Je peux alors :
- publier une version corrigée du lanceur ;
- ou vous guider sur une méthode adaptée à cet ASUS précis (version de
  Windows, navigateur, antivirus).

---

## Ce qui ne va PAS se passer

Pour rassurer : **rien de tout cela ne casse le dépôt ni vos données.**

- Le pont écrit dans `C:\Users\<vous>\AppData\Local\Pont` — rien d'autre.
- Aucun droit administrateur n'est demandé.
- Vos secrets (jeton, phrase de passe) restent sur l'ASUS, jamais dans le dépôt.
- Si une méthode échoue, vous pouvez en essayer une autre : les fichiers
  déjà téléchargés sont simplement écrasés.
- Pour tout arrêter : fermez la fenêtre noire du pont, ou `Ctrl+C` dedans.

---

## Repères pour me dire ce qui bloque

| Ce que vous voyez | Ce que ça signifie |
|---|---|
| « Le terme `irm` n'est pas reconnu » | PowerShell trop ancien ou exécution restreinte → méthode 2 |
| « Une erreur s'est produite » au téléchargement | Réseau ou antivirus → méthode 2, puis 4 |
| Le fichier s'ouvre et se ferme aussitôt | Antivirus ou association `.bat` → méthode 3 |
| « Publication impossible » après le jeton | Jeton sans la permission *Contents: Read and write* → recréez-le à l'étape 3 du guide |
| « Signature invalide » | Phrase de passe différente de celle attendue → rien à faire côté poste, c'est mon côté |
