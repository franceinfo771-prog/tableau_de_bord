@echo off
rem Recupere la page de dialogue local sur le Bureau.
rem Double-clic suffit. La page remplace celle du Bureau, rien d'autre.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s='https://raw.githubusercontent.com/franceinfo771-prog/tableau_de_bord/main/pont-outils/chat.html'; $d=Join-Path $env:USERPROFILE 'Desktop\chat.html'; Invoke-WebRequest -Uri $s -OutFile $d; Write-Host ''; Write-Host 'Page enregistree sur le Bureau :' $d; Write-Host ''; pause"
