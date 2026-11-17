<#
  INSTALL-LMSTUDIO.ps1 - installe LM Studio et un premier modele local.

  Execute par l'agent du pont, ou a la main :
      powershell -NoProfile -ExecutionPolicy Bypass -File INSTALL-LMSTUDIO.ps1

  Le script fait tout et publie un rapport sur la branche `pont` :
  ce que l'assistant lit, sans que l'utilisateur ait a recopier.

  Tout est ecrit en ASCII pour passer sans probleme dans le .bat.
#>

[CmdletBinding()]
param(
    [string]$Modele = '',
    [switch]$SansModele
)

$ErrorActionPreference = 'Continue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$DossierScript = Split-Path -Parent $MyInvocation.MyCommand.Path
$FichierConfig = Join-Path $DossierScript 'pont-config.json'
$Journal = Join-Path $DossierScript 'lmstudio-journal.txt'

$L = New-Object System.Collections.ArrayList
function Note([string]$ligne) {
    [void]$L.Add($ligne)
    Write-Host $ligne
    try {
        $utf8 = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::AppendAllText($Journal, $ligne + "`r`n", $utf8)
    } catch { }
}

function Ecrire-FichierUtf8([string]$chemin, [string]$contenu) {
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($chemin, $contenu, $utf8)
}

function Publier-Rapport([string]$texte) {
    try {
        $config = Get-Content $FichierConfig -Raw | ConvertFrom-Json
        $entetes = @{ 'Accept' = 'application/vnd.github+json'; 'User-Agent' = 'pont-arena' }
        if ($config.jetonGitHub) { $entetes['Authorization'] = "Bearer $($config.jetonGitHub)" }
        $api = "https://api.github.com/repos/$($config.depot)/contents/pont/lmstudio.txt"
        $sha = $null
        try {
            $existant = Invoke-RestMethod -Uri "$api`?ref=$($config.branche)" -Headers $entetes -Method Get -TimeoutSec 30
            if ($existant.sha) { $sha = $existant.sha }
        } catch { }
        $corps = [ordered]@{
            message = 'pont : installation LM Studio'
            content = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($texte))
            branch  = $config.branche
        }
        if ($sha) { $corps['sha'] = $sha }
        Invoke-RestMethod -Uri $api -Headers $entetes -Method Put `
            -ContentType 'application/json; charset=utf-8' `
            -Body ([System.Text.Encoding]::UTF8.GetBytes(($corps | ConvertTo-Json -Depth 5))) -TimeoutSec 30 | Out-Null
        return $true
    } catch {
        Write-Host "Publication impossible : $_" -ForegroundColor Yellow
        return $false
    }
}

Note '=== Installation de LM Studio ==='
Note ("date : " + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))

# --- 1. deja installe ? ----------------------------------------------
$lmsExistant = "$env:USERPROFILE\.lmstudio\bin\lms.exe"
$appExistante = Test-Path "$env:LOCALAPPDATA\LM-Studio"

if ($appExistante -or (Test-Path $lmsExistant)) {
    Note 'LM Studio est deja installe : etape d installation sautee.'
} else {
    Note 'Telechargement de LM Studio...'
    $telecharge = $false
    # methode 1 : winget (sil est present)
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Note '  tentative via winget...'
        try {
            $r = winget install --id ElementLabs.LMStudio --exact --accept-package-agreements --accept-source-agreements --silent 2>&1
            Note ("  winget : " + ($r | Out-String).Trim())
            if (Test-Path "$env:LOCALAPPDATA\LM-Studio") { $telecharge = $true }
        } catch { Note ("  winget a echoue : " + $_) }
    }
    # methode 2 : installateur officiel
    if (-not $telecharge) {
        Note '  tentative via l installateur officiel...'
        try {
            $urls = @(
                'https://releases.lmstudio.ai/windows/x86_64/latest/lmstudio-x64.exe',
                'https://releases.lmstudio.ai/windows/x86/latest/lmstudio.exe'
            )
            foreach ($u in $urls) {
                try {
                    $exe = Join-Path $env:TEMP 'lmstudio-installeur.exe'
                    Invoke-WebRequest -Uri $u -OutFile $exe -UseBasicParsing -TimeoutSec 900
                    Note ("  telecharge : " + $u)
                    $p = Start-Process -FilePath $exe -ArgumentList '/S' -PassThru -Wait
                    Note ("  code de sortie : " + $p.ExitCode)
                    if (Test-Path "$env:LOCALAPPDATA\LM-Studio") { $telecharge = $true; break }
                } catch { Note ("  echec : " + $_) }
            }
        } catch { Note ("  installateur officiel indisponible : " + $_) }
    }
    if ($telecharge) { Note 'LM Studio installe.' } else { Note 'ECHEC : LM Studio n a pas pu etre installe.' }
}

# --- 2. la CLI lms -----------------------------------------------------
$lms = $null
foreach ($c in @(
    "$env:USERPROFILE\.lmstudio\bin\lms.exe",
    "$env:LOCALAPPDATA\LM-Studio\resources\app\bin\lms.exe",
    "$env:LOCALAPPDATA\Programs\LM Studio\resources\app\bin\lms.exe"
)) {
    if (Test-Path $c) { $lms = $c; break }
}
if (-not $lms) {
    $trouve = Get-Command lms -ErrorAction SilentlyContinue
    if ($trouve) { $lms = $trouve.Source }
}
if ($lms) {
    Note ("CLI lms trouvee : " + $lms)
    try {
        $v = & $lms --version 2>&1
        Note ("  version : " + ($v | Out-String).Trim())
    } catch { Note ("  version illisible : " + $_) }
} else {
    Note 'CLI lms introuvable : LM Studio n est pas correctement installe.'
}

# --- 3. daemon + modele ------------------------------------------------
if ($lms -and -not $SansModele) {
    if (-not $Modele) { $Modele = 'qwen2.5-1.5b-instruct' }
    Note ("Modele choisi : " + $Modele)

    Note 'Demarrage du daemon...'
    try { & $lms daemon up 2>&1 | ForEach-Object { Note ("  " + $_) } } catch { Note ("  daemon : " + $_) }

    Note ("Telechargement du modele (peut prendre plusieurs minutes)...")
    try {
        & $lms get $Modele 2>&1 | ForEach-Object { Note ("  " + $_) }
    } catch { Note ("  telechargement : " + $_) }

    Note 'Chargement du modele...'
    try {
        & $lms load $Modele --gpu max --context-length 4096 --yes 2>&1 | ForEach-Object { Note ("  " + $_) }
    } catch { Note ("  chargement : " + $_) }

    Note 'Demarrage du serveur local...'
    try { & $lms server start 2>&1 | ForEach-Object { Note ("  " + $_) } } catch { Note ("  serveur : " + $_) }

    Start-Sleep -Seconds 3
    try {
        $r = Invoke-RestMethod -Uri 'http://localhost:1234/v1/models' -TimeoutSec 20
        Note 'Modeles exposes par le serveur :'
        foreach ($m in $r.data) { Note ("  - " + $m.id) }
    } catch { Note ("  serveur joignable ? : " + $_) }
}

# --- 4. rapport --------------------------------------------------------
$texte = ($L -join "`n")
Ecrire-FichierUtf8 (Join-Path $DossierScript 'lmstudio.txt') $texte
if (Publier-Rapport $texte) { Note 'Rapport publie pour votre assistant.' }

Note '=== Termine ==='
exit 0
