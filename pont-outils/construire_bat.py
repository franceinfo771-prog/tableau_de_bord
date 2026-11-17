"""Construit PONT-START.bat : un fichier .bat autonome.

Le .bat contient le script PowerShell du pont entre deux marqueurs.
Au premier lancement il s'extrait dans le dossier local de
l'utilisateur, puis il s'execute. L'utilisateur n'a donc qu'un seul
fichier a telecharger et a double-cliquer.

Le script PowerShell est converti en base64 pour eviter tout
probleme d'encodage (BOM, accents, fins de ligne) et pour que
le .bat reste en ASCII pur.

Les marqueurs n'utilisent ni < ni > ni & ni | : ils restent
inertes dans un fichier .bat.
"""

import base64
import io
import os
import textwrap

ICI = os.path.dirname(os.path.abspath(__file__))
PS1 = os.path.join(ICI, "PONT-poste.ps1")
BAT = os.path.join(ICI, "PONT-START.bat")

DEBUT = "#===PONT-PS1-BASE64-DEBUT==="
FIN = "#===PONT-PS1-BASE64-FIN==="

ENTETE = r"""@echo off
REM ==============================================================
REM   PONT ARENA - un seul fichier, un seul double-clic
REM
REM   Ce fichier contient tout ce qu'il faut. Au premier lancement
REM   il se deploie dans votre dossier personnel, puis il demande
REM   votre jeton GitHub et votre phrase de passe, verifie que tout
REM   marche, et publie un rapport pour votre assistant.
REM
REM   Pour arreter : fermez cette fenetre, ou Ctrl+C.
REM ==============================================================

setlocal EnableExtensions
chcp 65001 >nul 2>&1
title Pont Arena - poste a la maison

set "CIBLE=%LOCALAPPDATA%\Pont"
set "PS1=%CIBLE%\PONT-poste.ps1"
set "BAT=%~f0"

echo.
echo  ==========================================================
echo    PONT ARENA
echo    Acces a votre poste a la maison depuis l'assistant
echo  ==========================================================
echo.

REM --- extraction du script embarque ---------------------------------
if not exist "%PS1%" (
    echo   Premiere installation : extraction du script...
    if not exist "%CIBLE%" mkdir "%CIBLE%" >nul 2>&1

    powershell -NoProfile -ExecutionPolicy Bypass -Command "$b = [IO.File]::ReadAllText($env:BAT); $dm = '#===PONT-PS1-BASE64' + '-DEBUT==='; $fm = '#===PONT-PS1-BASE64' + '-FIN==='; $m = [regex]::Match($b, '(?s)' + [regex]::Escape($dm) + '(.*?)' + [regex]::Escape($fm)); if (-not $m.Success) { exit 2 }; $t = ($m.Groups[1].Value -replace '\s',''); [IO.File]::WriteAllBytes($env:PS1, [Convert]::FromBase64String($t))" >nul 2>&1

    if not exist "%PS1%" (
        echo.
        echo   [ERREUR] Extraction impossible.
        echo   Verifiez que le fichier n'a pas ete modifie en route.
        echo.
        pause
        exit /b 2
    )
    echo   Script installe dans %PS1%
    echo.
)

REM --- execution ----------------------------------------------------
powershell -NoProfile -ExecutionPolicy Bypass -File "%PS1%" %*
set "CODE=%ERRORLEVEL%"

echo.
if "%CODE%"=="0" (
    echo  ==========================================================
    echo    TERMINE.
    echo  ==========================================================
) else (
    echo  ==========================================================
    echo    Code de sortie : %CODE%
    echo    Copiez le message ci-dessus et envoyez-le a votre
    echo    assistant : il corrigera.
    echo  ==========================================================
)

pause
exit /b %CODE%
"""


def main():
    ps1 = io.open(PS1, "r", encoding="utf-8", newline="").read()
    # Fins de ligne CRLF, comme attendu sous Windows.
    ps1 = ps1.replace("\r\n", "\n").replace("\n", "\r\n")
    b64 = base64.b64encode(ps1.encode("utf-8")).decode("ascii")
    corps = "\n".join(textwrap.wrap(b64, 96))

    sortie = ENTETE + "\n" + DEBUT + "\n" + corps + "\n" + FIN + "\n"
    io.open(BAT, "w", encoding="ascii", newline="\r\n").write(sortie)

    print("Ecrit :", BAT, os.path.getsize(BAT), "octets")
    print("Script embarque :", len(ps1), "caracteres ->", len(b64), "caracteres base64")

    # Verification : on relit le .bat et on retrouve le script intact.
    relu = io.open(BAT, "r", encoding="ascii").read()
    s = relu.index(DEBUT) + len(DEBUT)
    e = relu.index(FIN)
    extrait = relu[s:e]
    assert "".join(extrait.split()) == b64, "le base64 ne correspond pas"
    decode = base64.b64decode("".join(extrait.split())).decode("utf-8")
    assert decode.replace("\r\n", "\n") == ps1.replace("\r\n", "\n"), "le script ne correspond pas"
    print("Verification : le script embarque est identique a l'original.")


if __name__ == "__main__":
    main()
