# ==============================================================
#   PONT ARENA - installation en une seule commande
#
#   A coller dans PowerShell (clic droit -> Coller) :
#
#     irm https://raw.githubusercontent.com/franceinfo771-prog/tableau_de_bord/pont/pont-outils/INSTALLER.ps1 | iex
#
#   Ce script telecharge PONT-START.bat, verifie son empreinte
#   SHA-256, puis le lance. Le jeton et la phrase de passe sont
#   demandes ensuite, par le script lui-meme.
#
#   Aucun secret ne transite ici : la phrase de passe est saisie
#   sur votre poste et n'en sort jamais.
# ==============================================================

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$UrlBat  = 'https://raw.githubusercontent.com/franceinfo771-prog/tableau_de_bord/pont/pont-outils/PONT-START.bat'
$Sha256  = 'ab15faeb2949961616522d110bc2390c69573b3a23d6f14a6c8ed4254d41f618'
$Cible   = Join-Path $env:LOCALAPPDATA 'Pont'
$Fichier = Join-Path $Cible 'PONT-START.bat'

Write-Host ''
Write-Host '  ==========================================================' -ForegroundColor Cyan
Write-Host '    PONT ARENA - installation' -ForegroundColor Cyan
Write-Host '  ==========================================================' -ForegroundColor Cyan
Write-Host ''

# --- 1. dossier cible ------------------------------------------------
if (-not (Test-Path $Cible)) {
    New-Item -ItemType Directory -Path $Cible -Force | Out-Null
    Write-Host "  Dossier cree : $Cible" -ForegroundColor DarkGray
}

# --- 2. telechargement -----------------------------------------------
$ok = $false
for ($essai = 1; $essai -le 3 -and -not $ok; $essai++) {
    try {
        Write-Host "  Telechargement ($essai/3)..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $UrlBat -OutFile $Fichier -UseBasicParsing -TimeoutSec 60
        $ok = $true
    } catch {
        Write-Host "  Echec : $_" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $ok) {
    Write-Host ''
    Write-Host '  [ERREUR] Telechargement impossible.' -ForegroundColor Red
    Write-Host '  Verifiez la connexion internet, puis relancez.' -ForegroundColor Red
    exit 1
}

# --- 3. verification de l'empreinte ---------------------------------
$empreinte = (Get-FileHash -Path $Fichier -Algorithm SHA256).Hash.ToLower()
if ($empreinte -ne $Sha256) {
    Write-Host ''
    Write-Host '  [ERREUR] Le fichier telecharge est corrompu.' -ForegroundColor Red
    Write-Host "  attendu : $Sha256" -ForegroundColor DarkGray
    Write-Host "  obtenu  : $empreinte" -ForegroundColor DarkGray
    exit 1
}
Write-Host '  Empreinte SHA-256 verifiee : le fichier est intact.' -ForegroundColor Green

# --- 4. lancement ----------------------------------------------------
Write-Host ''
Write-Host '  Lancement du pont...' -ForegroundColor Cyan
Write-Host ''
Start-Process -FilePath $Fichier -Wait
exit 0
