@echo off
REM ============================================================
REM  Pont Arena - poste a la maison
REM  Placez ce fichier et PONT-poste.ps1 dans un meme dossier
REM  (par exemple C:\pont) puis double-cliquez ici.
REM ============================================================
echo.
echo   === Pont Arena - installation ===
echo.

if not exist "PONT-poste.ps1" (
    echo   [ERREUR] PONT-poste.ps1 est introuvable dans ce dossier.
    echo   Placez-le a cote de ce fichier, puis relancez.
    echo.
    pause
    exit /b 1
)

if not exist "C:\pont" mkdir "C:\pont"
if not "%~dp0"=="C:\pont\" copy /Y "PONT-poste.ps1" "C:\pont\" >nul

cd /d "C:\pont"

echo.
echo   Etape 1/3 - test du chiffrement sur ce poste...
echo.
powershell -ExecutionPolicy Bypass -File "C:\pont\PONT-poste.ps1" -AutoTest
if errorlevel 1 (
    echo.
    echo   [ECHEC] Le chiffrement ne fonctionne pas sur cette machine.
    echo   Copiez le message ci-dessus et envoyez-le a votre assistant.
    echo.
    pause
    exit /b 1
)

echo.
echo   Etape 2/3 - lancement du pont.
echo   Au premier demarrage, il vous demandera :
echo     - votre jeton GitHub (permission Contents : Read and write
echo       sur franceinfo771-prog/tableau_de_bord uniquement)
echo     - votre phrase de passe du pont
echo.
echo   IMPORTANT : laissez cette fenetre ouverte, c'est elle qui
echo   va chercher les ordres de votre assistant.
echo.
pause

powershell -ExecutionPolicy Bypass -File "C:\pont\PONT-poste.ps1"

echo.
echo   Le pont s'est arrete. Relancez-le quand vous en avez besoin,
echo   ou installez une tache planifiee (guide dans LISEZ-MOI-PONT.md).
echo.
pause
