# ==============================================================
#   TESTER-JETON.ps1 - verifier que votre jeton GitHub marche
#
#   A coller dans PowerShell sur n'importe quel ordinateur.
#   Il ne montre jamais le jeton : vous ne le collez que dans
#   une variable, et il n'est ecrit nulle part.
#
#   Le test fait trois choses :
#     1. il verifie que le jeton est reconnu ;
#     2. il verifie qu'il peut ECDIRE dans le depot (c'est ce que
#        le pont fera) ;
#     3. il efface immediatement ce qu'il a ecrit.
#
#   Si le resultat est "TOUT EST BON", vous pouvez y aller.
# ==============================================================

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Depot = 'franceinfo771-prog/tableau_de_bord'
$Fichier = 'pont/.test-jeton.txt'

Write-Host ''
Write-Host '  === Test du jeton GitHub ===' -ForegroundColor Cyan
Write-Host ''

# --- 1. le jeton est saisi sans etre affiche ------------------------
$jeton = Read-Host '  Collez votre jeton (rien ne s affiche)' -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($jeton)
try { $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
if (-not $token) { Write-Host '  Jeton vide : test annule.' -ForegroundColor Red; exit 1 }

$entetes = @{
    'Authorization' = "Bearer $token"
    'Accept'        = 'application/vnd.github+json'
    'User-Agent'    = 'pont-arena-test'
}

# --- 2. le jeton est-il reconnu ? ------------------------------------
Write-Host '  Verification du jeton...'
try {
    $r = Invoke-RestMethod -Uri "https://api.github.com/repos/$Depot" -Headers $entetes -TimeoutSec 30
    Write-Host "  Jeton reconnu. Compte : $($r.owner.login)" -ForegroundColor Green
} catch {
    Write-Host ''
    Write-Host '  [ERREUR] Jeton refuse.' -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor DarkGray
    Write-Host ''
    Write-Host '  Causes possibles :' -ForegroundColor Yellow
    Write-Host '   - le jeton est incorrect ou mal colle ;'
    Write-Host '   - il a expire ;'
    Write-Host '   - il a ete revoque.'
    exit 1
}

# --- 3. a-t-il le droit d ecrire ? ------------------------------------
Write-Host '  Test d ecriture...'
$ecrit = $false
try {
    $corps = @{
        message  = 'pont : test du jeton (supprime juste apres)'
        content  = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes('test'))
        branch   = 'pont'
    }
    $res = Invoke-RestMethod -Uri "https://api.github.com/repos/$Depot/contents/$Fichier" `
        -Headers $entetes -Method Put -ContentType 'application/json; charset=utf-8' `
        -Body ([System.Text.Encoding]::UTF8.GetBytes(($corps | ConvertTo-Json -Depth 5))) -TimeoutSec 30
    $ecrit = $true
    Write-Host '  Ecriture possible.' -ForegroundColor Green
} catch {
    Write-Host ''
    Write-Host '  [ERREUR] Le jeton est reconnu mais ne peut pas ecrire.' -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor DarkGray
    Write-Host ''
    Write-Host '  La permission manque :' -ForegroundColor Yellow
    Write-Host '   - Repository access : Only select repositories'
    Write-Host '   - tableau_de_bord doit etre coche'
    Write-Host '   - Repository permissions > Contents > Read and write'
    Write-Host ''
    Write-Host '  Reeditiez le jeton, puis relancez ce test.' -ForegroundColor Cyan
    exit 1
}

# --- 4. nettoyage immediat -------------------------------------------
if ($ecrit) {
    try {
        $sha = (Invoke-RestMethod -Uri "https://api.github.com/repos/$Depot/contents/$Fichier`?ref=pont" `
                -Headers $entetes -TimeoutSec 30).sha
        $sup = @{ message = 'pont : fin du test du jeton'; sha = $sha; branch = 'pont' }
        Invoke-RestMethod -Uri "https://api.github.com/repos/$Depot/contents/$Fichier" `
            -Headers $entetes -Method Delete -ContentType 'application/json; charset=utf-8' `
            -Body ([System.Text.Encoding]::UTF8.GetBytes(($sup | ConvertTo-Json -Depth 5))) -TimeoutSec 30 | Out-Null
        Write-Host '  Fichier de test supprime.' -ForegroundColor DarkGray
    } catch {
        Write-Host "  (nettoyage a faire a la main : $Fichier)" -ForegroundColor Yellow
    }
}

# --- 5. verdict ------------------------------------------------------
Write-Host ''
Write-Host '  ==========================================================' -ForegroundColor Green
Write-Host '    TOUT EST BON.' -ForegroundColor Green
Write-Host '    Votre jeton fonctionne et peut ecrire dans le depot.' -ForegroundColor Green
Write-Host '  ==========================================================' -ForegroundColor Green
Write-Host ''
Write-Host '  Vous pouvez maintenant lancer le pont sur le PC de la maison.' -ForegroundColor Cyan
Write-Host ''
$token = $null
exit 0
