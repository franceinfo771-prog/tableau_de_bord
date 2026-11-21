@echo off
rem ---------------------------------------------------------------------------
rem  IA LOCALE  -  met la page a jour depuis le site, puis l'ouvre.
rem
rem  Deux fichiers sont telecharges, pas un :
rem    chat.html  la page de dialogue
rem    fiche.txt  la memoire du site qu'elle donne au modele
rem  Sans la fiche, la page s'ouvre sur "aucune fiche" et le modele ne sait rien.
rem
rem  Note technique : la version precedente de ce script avait des fins de
rem  ligne cassees et ne remplacait jamais le fichier. Celle-ci ecrit dans
rem  %%LOCALAPPDATA%%\TableauDeBord, pas sur le Bureau : plus de melange entre
rem  l'ancienne et la nouvelle version.
rem ---------------------------------------------------------------------------
setlocal
set "BASE=https://raw.githubusercontent.com/franceinfo771-prog/tableau_de_bord/main/pont-outils"
set "DOSSIER=%LOCALAPPDATA%\TableauDeBord"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$base = '%BASE%'; $dossier = '%DOSSIER%'; $erreur = 0;" ^
  "New-Item -ItemType Directory -Force -Path $dossier | Out-Null;" ^
  "foreach ($f in @('chat.html','fiche.txt')) {" ^
  "  try { Invoke-WebRequest -Uri ($base + '/' + $f) -OutFile (Join-Path $dossier $f) -UseBasicParsing }" ^
  "  catch { Write-Host ('Echec du telechargement : ' + $f); $erreur = 1 }" ^
  "}" ^
  "if ($erreur -eq 0) { Write-Host 'Page et fiche a jour.' } else { Write-Host 'La page n''a pas ete mise a jour.' }; exit $erreur"

if errorlevel 1 (
  echo.
  echo   Le telechargement a echoue.
  echo   Verifie la connexion, puis reessaie.
  echo.
  pause
  exit /b 1
)

start "" "%DOSSIER%\chat.html"
exit /b 0
