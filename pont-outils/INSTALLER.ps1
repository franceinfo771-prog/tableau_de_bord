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
# Secours : l'API GitHub sert le fichier en 'application/vnd.github.raw',
# ce qui force le telechargement au lieu de l'afficher dans le navigateur.
$UrlApi  = 'https://api.github.com/repos/franceinfo771-prog/tableau_de_bord/contents/pont-outils/PONT-START.bat?ref=pont'
$Sha256  = '0fdde9cbfd343303f85e179b1f66bf9ebe5db6e74193215bfe6a85d6662991e7'
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

# --- 2. test de connexion --------------------------------------------
# On verifie d'abord que le site est joignable : sinon l'erreur de
# telechargement serait incomprehensible ("une erreur s'est produite").
try {
    $tete = Invoke-WebRequest -Uri $UrlBat -Method Head -UseBasicParsing -TimeoutSec 20
    Write-Host '  Connexion au depot : OK' -ForegroundColor Green
} catch {
    Write-Host '  Connexion directe bloquee, tentative par l API GitHub...' -ForegroundColor Yellow
}

# --- 3. telechargement -----------------------------------------------
# On essaie plusieurs sources : le lien brut d'abord, puis l'API.
$Sources = @(
    @{ Nom = 'lien brut'; Url = $UrlBat; Entete = $null },
    @{ Nom = 'API GitHub'; Url = $UrlApi; Entete = 'application/vnd.github.raw' }
)

$ok = $false
foreach ($source in $Sources) {
    if ($ok) { break }
    for ($essai = 1; $essai -le 2 -and -not $ok; $essai++) {
        try {
            Write-Host "  Telechargement via $($source.Nom) ($essai/2)..." -ForegroundColor Cyan
            if ($source.Entete) {
                Invoke-WebRequest -Uri $source.Url -OutFile $Fichier -UseBasicParsing `
                    -Headers @{ 'Accept' = $source.Entete } -TimeoutSec 60
            } else {
                Invoke-WebRequest -Uri $source.Url -OutFile $Fichier -UseBasicParsing -TimeoutSec 60
            }
            $ok = $true
        } catch {
            Write-Host "  Echec : $_" -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
    }
}

if (-not $ok) {
    Write-Host ''
    Write-Host '  [ERREUR] Telechargement impossible.' -ForegroundColor Red
    Write-Host '  Verifiez la connexion internet du poste, puis relancez.' -ForegroundColor Red
    Write-Host '  Si un antivirus bloque, autorisez PowerShell dans ses reglages.' -ForegroundColor Red
    exit 1
}

# --- 4. verification de l'empreinte ---------------------------------
$empreinte = (Get-FileHash -Path $Fichier -Algorithm SHA256).Hash.ToLower()
if ($empreinte -ne $Sha256) {
    Write-Host ''
    Write-Host '  [ERREUR] Le fichier telecharge est corrompu.' -ForegroundColor Red
    Write-Host "  attendu : $Sha256" -ForegroundColor DarkGray
    Write-Host "  obtenu  : $empreinte" -ForegroundColor DarkGray
    exit 1
}
Write-Host '  Empreinte SHA-256 verifiee : le fichier est intact.' -ForegroundColor Green

# --- 5. lancement ----------------------------------------------------
# Au second lancement, le pont est deja installe : on ne retelecharge
# rien, on relance seulement.
$dejaLa = Test-Path (Join-Path $Cible 'PONT-poste.ps1')
if ($dejaLa) {
    Write-Host '  Pont deja installe : relance seulement.' -ForegroundColor DarkGray
}

Write-Host ''
Write-Host '  Lancement du pont...' -ForegroundColor Cyan
Write-Host ''
Start-Process -FilePath $Fichier -Wait
exit 0
