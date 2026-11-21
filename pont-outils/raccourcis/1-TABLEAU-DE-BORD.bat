@echo off
rem ---------------------------------------------------------------------------
rem  TABLEAU DE BORD  -  ouvre la page en ligne, toujours a jour.
rem
rem  La page lit projets.json a chaque ouverture : il n'y a rien a telecharger
rem  ni a mettre a jour. Ce raccourci fait donc une seule chose : ouvrir.
rem
rem  En cas de doute, il verifie que le site repond avant d'ouvrir le navigateur.
rem ---------------------------------------------------------------------------
setlocal
set "ADRESSE=https://franceinfo771-prog.github.io/tableau_de_bord/"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "try { $r = Invoke-WebRequest -Uri '%ADRESSE%' -UseBasicParsing -TimeoutSec 10; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"

if errorlevel 1 (
  echo.
  echo   Le site ne repond pas pour le moment.
  echo   Verifie la connexion, puis reessaie dans une minute.
  echo.
  pause
  exit /b 1
)

start "" "%ADRESSE%"
exit /b 0
