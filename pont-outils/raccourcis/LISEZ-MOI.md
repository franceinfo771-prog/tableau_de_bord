# Deux raccourcis sur le Bureau

Trois fichiers, un seul geste à faire. Après, tu n'as plus jamais à ouvrir PowerShell.

## Ce qu'il faut faire, une fois

1. Ouvre ce dossier sur le site :
   `https://github.com/franceinfo771-prog/tableau_de_bord/tree/main/pont-outils/raccourcis`
2. Clique sur **`INSTALLER.bat`**, puis sur le bouton **`Download raw file`** (la flèche en haut à droite).
3. Double-clique le fichier téléchargé. Windows demandera peut-être une confirmation : accepte.
4. C'est fini.

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
