# Deux raccourcis sur le Bureau

Un seul fichier à télécharger, un seul à lancer. Après, tu n'as plus jamais à ouvrir PowerShell.

## Ce qu'il faut faire, une fois

1. Une ligne dans PowerShell, qui récupère l'installeur :
   ```powershell
   Invoke-WebRequest -Uri "https://raw.githubusercontent.com/franceinfo771-prog/tableau_de_bord/main/pont-outils/raccourcis/INSTALLER.bat" -OutFile "$env:USERPROFILE\Desktop\INSTALLER.bat"
   ```
2. Double-clique `INSTALLER.bat` sur le Bureau. Il **télécharge lui-même** les deux
   fichiers et les pose à côté de lui. Windows demandera peut-être une confirmation : accepte.
3. C'est fini. Tu peux supprimer `INSTALLER.bat` : il a terminé son travail.

> **Leçon du 21 novembre 2026.** La première version de `INSTALLER.bat` ne téléchargeait
> rien : elle **copiait** des fichiers qu'elle croyait posés à côté d'elle. Seul sur le
> Bureau, il n'y avait personne à copier — d'où `Echec pour "1 - Tableau de bord"`.
> Un script ne doit jamais dépendre de fichiers qu'il n'a pas apportés.

## Ce que tu as sur le Bureau après

| Raccourci | Ce qu'il fait | Durée |
|---|---|---|
| **`1 - Tableau de bord`** | ouvre le tableau en ligne, toujours à jour | 2 secondes |
| **`2 - IA locale`** | met `chat.html` et `fiche.txt` à jour, puis l'ouvre | 5 secondes |

## Pourquoi deux fichiers pour l'IA locale et pas un

Le raccourci télécharge **la page et sa mémoire**. C'était l'erreur de l'ancienne version : elle ne récupérait que la page, donc la fiche restait celle d'avant — ou manquait.

Les deux arrivent dans `%LOCALAPPDATA%\TableauDeBord`, **pas sur le Bureau** : plus de mélange entre l'ancienne et la nouvelle version, plus de doute sur « est-ce que le fichier a été remplacé ».

## Pourquoi le tableau n'a rien à télécharger

La page lit `projets.json` **à chaque ouverture**. Il n'y a donc ni copie à rafraîchir, ni risque de chiffre périmé. Le raccourci vérifie seulement que le site répond, puis ouvre le navigateur.

## Après l'installation, tu peux jeter

- `RECUPERER-PAGE.bat` — il avait des fins de ligne cassées (`\r\r\n`) et ne remplaçait jamais le fichier. Deux essais, deux échecs : on l'abandonne.
- L'ancien `chat.html` posé sur le Bureau — la version qui compte est maintenant dans `%LOCALAPPDATA%`.

## Si quelque chose ne marche pas

| Symptôme | Cause probable |
|---|---|
| Le raccourci se ferme aussitôt | normal pour le tableau : le navigateur s'ouvre, la fenêtre noire se ferme |
| « Le site ne répond pas » | connexion coupée, ou site en reconstruction (attendre une minute) |
| La page s'ouvre sur « aucune fiche » | `fiche.txt` n'a pas été téléchargée : relance `2 - IA locale` |
| Windows affiche un avertissement bleu | fichier venu d'Internet, c'est normal : « Informations complémentaires » → « Exécuter quand même » |
