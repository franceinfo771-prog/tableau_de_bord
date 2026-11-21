@echo off
rem ---------------------------------------------------------------------------
rem  INSTALLER  -  pose les deux raccourcis sur le Bureau, puis se termine.
rem
rem  A lancer UNE SEULE FOIS, et il n'a besoin de rien d'autre :
rem  il telecharge lui-meme les deux fichiers depuis le site.
rem
rem  Lecon du 21/11 : la premiere version copiait des fichiers qu'elle croyait
rem  poses a cote d'elle. Sur le Bureau, il n'y avait personne. Un script ne
rem  doit jamais dependre de fichiers qu'il n'a pas apportes.
rem ---------------------------------------------------------------------------
setlocal
set "BASE=https://raw.githubusercontent.com/franceinfo771-prog/tableau_de_bord/main/pont-outils/raccourcis"
set "BUREAU=%USERPROFILE%\Desktop"

echo.
echo   Installation des deux raccourcis sur le Bureau...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$base='%BASE%'; $bureau='%BUREAU%'; $erreur=0;" ^
  "$paires=@(@('1-TABLEAU-DE-BORD.bat','1 - Tableau de bord.bat'),@('2-IA-LOCALE.bat','2 - IA locale.bat'));" ^
  "foreach ($p in $paires) {" ^
  "  try { Invoke-WebRequest -Uri ($base+'/'+$p[0]) -OutFile (Join-Path $bureau $p[1]) -UseBasicParsing; Write-Host ('   pose : ' + $p[1]) }" ^
  "  catch { Write-Host ('   ECHEC : ' + $p[1] + ' - ' + $_.Exception.Message); $erreur=1 }" ^
  "}; exit $erreur"

if errorlevel 1 (
  echo.
  echo   Un des deux fichiers n'a pas pu etre telecharge.
  echo   Verifie la connexion, puis relance ce fichier.
  echo.
  pause
  exit /b 1
)

echo.
echo   C'est fait. Deux fichiers sont sur le Bureau :
echo.
echo      1 - Tableau de bord     ouvre le tableau, toujours a jour
echo      2 - IA locale           met la page a jour, puis l'ouvre
echo.
echo   Tu peux jeter ce fichier INSTALLER : il a termine son travail.
echo.
pause
