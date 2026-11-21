@echo off
rem ---------------------------------------------------------------------------
rem  INSTALLER  -  pose les deux raccourcis sur le Bureau, puis se termine.
rem
rem  A lancer UNE SEULE FOIS. Ensuite, il n'y a plus qu'a double-cliquer sur
rem  "1 - Tableau de bord" ou "2 - IA locale", poses sur le Bureau.
rem ---------------------------------------------------------------------------
setlocal
set "ICI=%~dp0"
set "BUREAU=%USERPROFILE%\Desktop"

echo.
echo   Installation des deux raccourcis sur le Bureau...
echo.

copy /Y "%ICI%1-TABLEAU-DE-BORD.bat" "%BUREAU%\1 - Tableau de bord.bat" >nul
if errorlevel 1 ( echo   Echec pour "1 - Tableau de bord". & pause & exit /b 1 )

copy /Y "%ICI%2-IA-LOCALE.bat" "%BUREAU%\2 - IA locale.bat" >nul
if errorlevel 1 ( echo   Echec pour "2 - IA locale". & pause & exit /b 1 )

echo   C'est fait. Deux fichiers sont sur le Bureau :
echo.
echo      1 - Tableau de bord     ouvre le tableau, toujours a jour
echo      2 - IA locale           met la page a jour, puis l'ouvre
echo.
echo   Tu peux jeter le vieux "RECUPERER-PAGE.bat" et l'ancien "chat.html"
echo   du Bureau : ils ne servent plus a rien.
echo.
pause
