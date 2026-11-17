<#
  PONT-poste.ps1 - agent du poste a la maison.
  Relit GitHub, dechiffre la commande en attente, l'execute, renvoie le resultat chiffres.

  Utilisation :
    powershell -ExecutionPolicy Bypass -File PONT-poste.ps1          (boucle, 30 s)
    powershell -ExecutionPolicy Bypass -File PONT-poste.ps1 -UneFois  (un seul tour)
    powershell -ExecutionPolicy Bypass -File PONT-poste.ps1 -AutoTest (verifie le chiffrement)

  Installation : ce seul fichier suffit. Au premier lancement, le pont
  demande le jeton GitHub et la phrase de passe, puis les ecrit sur ce poste :
    pont-config.json  { "jetonGitHub": "...", "depot": "franceinfo771-prog/tableau_de_bord", "branche": "pont" }
    cle.txt           la phrase passe (une seule ligne)

  Aucun secret n'est ecrit dans le depot : le jeton et la phrase restent sur ce poste.
#>

[CmdletBinding()]
param(
    [switch]$UneFois,
    [switch]$AutoTest,
    [switch]$Silencieux,
    [switch]$Releve,
    [switch]$Installer,
    [switch]$Tunnel,
    [switch]$SansModele,
    [ValidateSet('tailscale', 'cloudflare')]
    [string]$Methode = 'tailscale',
    [int]$Port = 1234,
    [string]$Modele = '',
    [int]$IntervalleSecondes = 30,
    [string]$RapportChemin = ''
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$DossierScript = Split-Path -Parent $MyInvocation.MyCommand.Path
$FichierConfig = Join-Path $DossierScript 'pont-config.json'
$FichierCle    = Join-Path $DossierScript 'cle.txt'
$FichierEtat   = Join-Path $DossierScript 'pont-etat.txt'
$FichierEtatInstall = Join-Path $DossierScript 'pont-etat-install.txt'

$ALG   = 'A256CBC-HS256'
$ITER  = 200000
$IVLEN = 16
$SALTLEN = 16

# ----------------------------------------------------------------- utilitaires

function Chiffrer-Base64([byte[]]$octets) { [Convert]::ToBase64String($octets) }
function Dechiffrer-Base64([string]$texte) { [Convert]::FromBase64String($texte) }

function Obtenir-CleDerivee([string]$phrase, [byte[]]$sel, [string]$digest) {
    # .NET Framework ancien : Rfc2898DeriveBytes ne fait que HMAC-SHA1.
    # .NET 4.7.2+ accepte HashAlgorithmName -> SHA256 possible.
    # IMPORTANT : on renvoie le digest REELLEMENT utilise, car l'enveloppe
    # doit l'annoncer : sinon l'autre bout derive la cle autrement et
    # la signature ne correspond plus.
    if ($digest -eq 'sha256') {
        try {
            $kdf = New-Object System.Security.Cryptography.Rfc2898DeriveBytes(
                $phrase, $sel, $ITER, [System.Security.Cryptography.HashAlgorithmName]::SHA256)
            $octets = $kdf.GetBytes(32)
            $kdf.Dispose()
            return @{ Cle = $octets; Digest = 'sha256' }
        } catch {
            # Ce poste ne sait faire que HMAC-SHA1 : on le signale.
        }
    }
    $kdf = New-Object System.Security.Cryptography.Rfc2898DeriveBytes($phrase, $sel, $ITER)
    $octets = $kdf.GetBytes(32)
    $kdf.Dispose()
    return @{ Cle = $octets; Digest = 'sha1' }
}

function Obtenir-Hmac([byte[]]$cle, [byte[]]$donnees) {
    $h = New-Object System.Security.Cryptography.HMACSHA256
    $h.Key = $cle
    $res = $h.ComputeHash($donnees)
    $h.Dispose()
    return ,$res
}

function Concatener([byte[]]$a, [byte[]]$b) {
    $tout = New-Object byte[] ($a.Length + $b.Length)
    [Array]::Copy($a, 0, $tout, 0, $a.Length)
    [Array]::Copy($b, 0, $tout, $a.Length, $b.Length)
    return ,$tout
}

function Chiffrer-Texte([string]$phrase, [string]$texte, [string]$digest) {
    $sel = New-Object byte[] $SALTLEN
    $iv  = New-Object byte[] $IVLEN
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($sel); $rng.GetBytes($iv); $rng.Dispose()

    $derive = Obtenir-CleDerivee $phrase $sel $digest
    $cle = $derive.Cle
    $digest = $derive.Digest   # le digest reellement applique

    $aes = [System.Security.Cryptography.Aes]::Create()
    $aes.KeySize = 256; $aes.BlockSize = 128
    $aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
    $aes.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7
    $aes.Key = $cle; $aes.IV = $iv

    $chiffreur = $aes.CreateEncryptor()
    $octets = [System.Text.Encoding]::UTF8.GetBytes($texte)
    $corps = $chiffreur.TransformFinalBlock($octets, 0, $octets.Length)
    $chiffreur.Dispose(); $aes.Dispose()

    $mac = Obtenir-Hmac $cle (Concatener $iv $corps)

    $enveloppe = [ordered]@{
        v   = 1
        alg = $ALG
        kdf = [ordered]@{ p = "pbkdf2-hmac-$digest"; i = $ITER; s = (Chiffrer-Base64 $sel) }
        iv  = (Chiffrer-Base64 $iv)
        ct  = (Chiffrer-Base64 $corps)
        mac = (Chiffrer-Base64 $mac)
    }
    return ($enveloppe | ConvertTo-Json -Compress -Depth 5)
}

function Dechiffrer-Texte([string]$phrase, [string]$json) {
    $env = $json | ConvertFrom-Json
    if ($env.alg -ne $ALG) { throw "Algorithme inconnu : $($env.alg)" }

    $digest = ($env.kdf.p -replace '^pbkdf2-hmac-', '')
    $sel  = Dechiffrer-Base64 $env.kdf.s
    $iv   = Dechiffrer-Base64 $env.iv
    $corps = Dechiffrer-Base64 $env.ct
    $derive = Obtenir-CleDerivee $phrase $sel $digest
    # Si l'enveloppe a ete ecrite en SHA-256 mais que ce poste ne sait
    # faire que SHA-1, la signature ne correspondra pas : on le dit
    # clairement plutot que d'echouer silencieusement.
    if ($derive.Digest -ne $digest) {
        throw "Commande chiffree en $digest, mais ce poste ne derive qu'en $($derive.Digest)."
    }
    $cle  = $derive.Cle

    $macAttendu = Dechiffrer-Base64 $env.mac
    $macCalcule = Obtenir-Hmac $cle (Concatener $iv $corps)
    for ($i = 0; $i -lt $macAttendu.Length; $i++) {
        if ($macAttendu[$i] -ne $macCalcule[$i]) { throw 'Signature invalide : mauvaise phrase passe ou donnee alteree.' }
    }

    $aes = [System.Security.Cryptography.Aes]::Create()
    $aes.KeySize = 256; $aes.BlockSize = 128
    $aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
    $aes.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7
    $aes.Key = $cle; $aes.IV = $iv

    $dechiffreur = $aes.CreateDecryptor()
    $brut = $dechiffreur.TransformFinalBlock($corps, 0, $corps.Length)
    $dechiffreur.Dispose(); $aes.Dispose()

    return [System.Text.Encoding]::UTF8.GetString($brut)
}

# ----------------------------------------------------------------- GitHub

function Obtenir-Entetes([string]$jeton) {
    $h = @{ 'Accept' = 'application/vnd.github+json'; 'User-Agent' = 'pont-arena' }
    if ($jeton) { $h['Authorization'] = "Bearer $jeton" }
    return $h
}

function Lire-CommandeEnAttente($config) {
    # On passe par l'API GitHub (meme domaine que l'ecriture) : ca marche
    # aussi pour un depot prive, et le jeton sert alors a la lecture.
    $url = "https://api.github.com/repos/$($config.depot)/contents/pont/cmd.enc?ref=$($config.branche)"
    try {
        $reponse = Invoke-RestMethod -Uri $url -Headers (Obtenir-Entetes $config.jetonGitHub) -Method Get -TimeoutSec 30
    } catch {
        return $null
    }
    if (-not $reponse.content) { return $null }
    # Le contenu renvoye par l'API est en base64 (avec retours a la ligne).
    $brut = ($reponse.content -replace '\s', '')
    return [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($brut))
}

function Ecrire-FichierPont($config, [string]$chemin, [string]$contenu, [string]$message) {
    $api = "https://api.github.com/repos/$($config.depot)/contents/pont/$chemin"
    $entetes = Obtenir-Entetes $config.jetonGitHub
    $sha = $null
    try {
        $existant = Invoke-RestMethod -Uri "$api`?ref=$($config.branche)" -Headers $entetes -Method Get -TimeoutSec 30
        if ($existant.sha) { $sha = $existant.sha }
    } catch { }

    $corps = [ordered]@{
        message = $message
        content = (Chiffrer-Base64 ([System.Text.Encoding]::UTF8.GetBytes($contenu)))
        branch  = $config.branche
    }
    if ($sha) { $corps['sha'] = $sha }

    Invoke-RestMethod -Uri $api -Headers $entetes -Method Put `
        -ContentType 'application/json; charset=utf-8' `
        -Body ([System.Text.Encoding]::UTF8.GetBytes(($corps | ConvertTo-Json -Depth 5))) -TimeoutSec 30 | Out-Null
}

function Ecrire-Reponse($config, [string]$contenu) {
    Ecrire-FichierPont $config 'rep.enc' $contenu 'pont : reponse du poste'
}

function Publier-FichierPontEnClair($config, [string]$chemin, [string]$contenu, [string]$message) {
    # Ecriture sans chiffrement, reservee au rapport d'autotest : il ne
    # contient aucun secret (ni jeton, ni phrase de passe) et l'assistant
    # doit pouvoir le lire sans connaitre la phrase de passe.
    $api = "https://api.github.com/repos/$($config.depot)/contents/pont/$chemin"
    $entetes = Obtenir-Entetes $config.jetonGitHub
    $sha = $null
    try {
        $existant = Invoke-RestMethod -Uri "$api`?ref=$($config.branche)" -Headers $entetes -Method Get -TimeoutSec 30
        if ($existant.sha) { $sha = $existant.sha }
    } catch { }

    $corps = [ordered]@{
        message = $message
        content = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($contenu))
        branch  = $config.branche
    }
    if ($sha) { $corps['sha'] = $sha }

    Invoke-RestMethod -Uri $api -Headers $entetes -Method Put `
        -ContentType 'application/json; charset=utf-8' `
        -Body ([System.Text.Encoding]::UTF8.GetBytes(($corps | ConvertTo-Json -Depth 5))) -TimeoutSec 30 | Out-Null
}

function Publier-RapportAutoTest($config, [string]$texte) {
    # Permet a l'assistant de lire le resultat de l'autotest sans que
    # l'utilisateur ait a recopier quoi que ce soit. Le rapport ne
    # contient aucun secret : ni jeton, ni phrase de passe.
    try {
        Publier-FichierPontEnClair $config 'autotest.txt' $texte 'pont : rapport autotest'
        Write-Host "Rapport publie pour l'assistant." -ForegroundColor DarkGray
        return $true
    } catch {
        Write-Host "Rapport non publie (le jeton GitHub est-il correct ?) : $_" -ForegroundColor Yellow
        return $false
    }
}

function Obtenir-KdfDisponible {
    # .NET Framework 4.7.2+ sait faire PBKDF2-HMAC-SHA256 ; avant, uniquement
    # HMAC-SHA1. On annonce ici ce que ce poste sait faire, pour que le
    # cloud chiffre les commandes avec le meme algorithme.
    try {
        $kdf = New-Object System.Security.Cryptography.Rfc2898DeriveBytes(
            'test', (New-Object byte[] 16), 1, [System.Security.Cryptography.HashAlgorithmName]::SHA256)
        $kdf.Dispose()
        return 'sha256'
    } catch {
        return 'sha1'
    }
}

# ----------------------------------------------------------------- machine

function Releve-Machine {
    # Caracteristiques de la machine, publiees en clair : aucun secret.
    # Sert a choisir un modele local adapte (LM Studio, Ollama).
    $L = New-Object System.Collections.ArrayList
    function Note([string]$cle, $valeur) { [void]$L.Add("$cle = $valeur") }

    Note 'date' (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
    Note 'machine' $env:COMPUTERNAME
    Note 'os' ([System.Environment]::OSVersion.VersionString)
    try { Note 'edition' (Get-CimInstance Win32_OperatingSystem).Caption } catch { }
    try { Note 'arch' $env:PROCESSOR_ARCHITECTURE } catch { }

    try {
        $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
        Note 'cpu' $cpu.Name
        Note 'coeurs' $cpu.NumberOfCores
        Note 'threads' $cpu.NumberOfLogicalProcessors
    } catch { Note 'cpu' 'inconnu' }

    # AVX2 est indispensable pour llama.cpp (le moteur de LM Studio).
    $avx2 = 'non'
    try {
        $x = (Get-ItemProperty -Path 'HKLM:\HARDWARE\DESCRIPTION\System\CentralProcessor\0' -ErrorAction Stop).Identifier
        if ($x -match 'AVX2') { $avx2 = 'oui' }
    } catch { }
    Note 'avx2' $avx2

    try {
        $os = Get-CimInstance Win32_OperatingSystem
        Note 'ram_totale_go' ([math]::Round($os.TotalVisibleMemorySize / 1048576, 1))
        Note 'ram_libre_go' ([math]::Round($os.FreePhysicalMemory / 1048576, 1))
    } catch { Note 'ram_totale_go' 'inconnu' }

    try {
        $gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1
        Note 'gpu' $gpu.Name
        Note 'gpu_vram_mo' $gpu.AdapterRAM
    } catch { Note 'gpu' 'inconnu' }

    try {
        $disque = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
        Note 'disque_c_libre_go' ([math]::Round($disque.FreeSpace / 1073741824, 1))
        Note 'disque_c_total_go' ([math]::Round($disque.Size / 1073741824, 1))
    } catch { }

    try { Note 'powershell' $PSVersionTable.PSVersion.ToString() } catch { }
    $winget = 'absent'
    if (Get-Command winget -ErrorAction SilentlyContinue) { $winget = 'present' }
    Note 'winget' $winget

    foreach ($chemin in @("$env:LOCALAPPDATA\LM-Studio", "$env:USERPROFILE\.lmstudio\bin\lms.exe")) {
        if (Test-Path $chemin) { Note 'lmstudio' $chemin }
    }

    return ($L -join "`n")
}

function Publier-Machine($config) {
    $texte = Releve-Machine
    Write-Host $texte
    try {
        Publier-FichierPontEnClair $config 'machine.txt' $texte 'pont : configuration de la machine'
        Write-Host ''
        Write-Host 'Configuration de la machine publiee.' -ForegroundColor Green
    } catch {
        Write-Host "Publication impossible : $_" -ForegroundColor Yellow
    }
}

# ----------------------------------------------------------------- LM Studio

function Trouver-Lms {
    foreach ($c in @(
        "$env:USERPROFILE\.lmstudio\bin\lms.exe",
        "$env:LOCALAPPDATA\LM-Studio\resources\app\bin\lms.exe",
        "$env:LOCALAPPDATA\Programs\LM Studio\resources\app\bin\lms.exe"
    )) {
        if (Test-Path $c) { return $c }
    }
    $t = Get-Command lms -ErrorAction SilentlyContinue
    if ($t) { return $t.Source }
    return $null
}

function Installer-LmStudio {
    # Installe LM Studio et le daemon headless, puis un premier modele.
    # Retourne un rapport texte, publie ensuite sur la branche pont.
    $L = New-Object System.Collections.ArrayList
    function Note([string]$ligne) {
        [void]$L.Add($ligne)
        Write-Host $ligne
    }

    Note '=== Installation de LM Studio ==='
    Note ("date : " + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))

    # --- 1. installation -----------------------------------------------
    $dejaLa = (Test-Path "$env:LOCALAPPDATA\LM-Studio") -or (Test-Path "$env:USERPROFILE\.lmstudio\bin\lms.exe")
    if ($dejaLa) {
        Note 'LM Studio est deja installe : installation sautee.'
    } else {
        $installe = $false

        # methode 1 : le script officiel (installe llmster, le daemon headless)
        Note 'Installation via le script officiel...'
        try {
            $sortie = & (New-Object System.Net.WebClient).DownloadString('https://lmstudio.ai/install.ps1')
            $script = [scriptblock]::Create($sortie)
            & $script 2>&1 | ForEach-Object { Note ("  " + $_) }
            $installe = $true
        } catch { Note ("  script officiel : " + $_) }

        # methode 2 : winget (apercu graphique)
        if (-not $installe -and (Get-Command winget -ErrorAction SilentlyContinue)) {
            Note 'Installation via winget...'
            try {
                $r = winget install --id ElementLabs.LMStudio --exact `
                    --accept-package-agreements --accept-source-agreements --silent 2>&1
                foreach ($l in $r) { Note ("  " + $l) }
            } catch { Note ("  winget : " + $_) }
        }

        # methode 3 : installateur officiel en direct
        if (-not $installe) {
            Note 'Telechargement de l installateur officiel...'
            foreach ($u in @(
                'https://releases.lmstudio.ai/windows/x86_64/latest/lmstudio-x64.exe',
                'https://installers.lmstudio.ai/win32/x64/latest/LM-Studio-x64.exe'
            )) {
                try {
                    $exe = Join-Path $env:TEMP 'lmstudio-installeur.exe'
                    Invoke-WebRequest -Uri $u -OutFile $exe -UseBasicParsing -TimeoutSec 1800
                    Note ("  telecharge : " + $u)
                    $p = Start-Process -FilePath $exe -ArgumentList '/S' -PassThru -Wait
                    Note ("  code de sortie : " + $p.ExitCode)
                    $installe = $true
                    break
                } catch { Note ("  echec : " + $_) }
            }
        }

        if ($installe) { Note 'LM Studio installe.' } else { Note 'ECHEC : installation impossible.' }
    }

    # --- 2. la CLI lms --------------------------------------------------
    $lms = Trouver-Lms
    if ($lms) {
        Note ("CLI lms : " + $lms)
        try {
            $v = & $lms --version 2>&1
            Note ("  version : " + (($v | Out-String).Trim()))
        } catch { }
    } else {
        Note 'CLI lms introuvable.'
    }

    return @($L, $lms)
}

function Demarrer-ServeurLocal($lms, [int]$port) {
    # lms server start reste au premier plan : l'appeler directement
    # figerait le pont, et le rapport d'installation ne partirait
    # jamais. On le lance donc en arriere-plan, puis on attend que le
    # port reponde.
    $L = New-Object System.Collections.ArrayList
    function Note([string]$ligne) {
        [void]$L.Add($ligne)
        Write-Host $ligne
    }

    if (-not $lms) {
        Note 'CLI lms introuvable : serveur non demarre.'
        return ($L -join "`n")
    }

    try {
        Invoke-RestMethod -Uri "http://127.0.0.1:$port/v1/models" -TimeoutSec 5 | Out-Null
        Note "Serveur deja en ecoute sur le port $port."
        return ($L -join "`n")
    } catch { }

    Note 'Demarrage du serveur local en arriere-plan...'
    try {
        $log = Join-Path $env:TEMP 'lms-serveur.log'
        Start-Process -FilePath $lms -ArgumentList @('server','start','--port',"$port") `
            -RedirectStandardOutput $log -RedirectStandardError "$log.err" `
            -WindowStyle Hidden | Out-Null
    } catch {
        Note ("  " + $_)
        return ($L -join "`n")
    }

    for ($i = 0; $i -lt 40; $i++) {
        Start-Sleep -Seconds 1
        try {
            Invoke-RestMethod -Uri "http://127.0.0.1:$port/v1/models" -TimeoutSec 5 | Out-Null
            Note "Serveur en ecoute sur le port $port."
            break
        } catch { }
    }

    return ($L -join "`n")
}

function Choisir-Modele {
    # Deduit un modele adapte a la machine. Un modele qui ne tient pas en
    # memoire ne demarre simplement pas : on se base donc sur la RAM.
    $ramGo = 0
    try {
        $os = Get-CimInstance Win32_OperatingSystem
        $ramGo = [math]::Round($os.TotalVisibleMemorySize / 1048576, 1)
    } catch { }

    # La VRAM annoncee par WMI est plafonnee a 4 Go et se revele fausse
    # sur les cartes recentes : on ne s'y fie pas pour choisir un modele
    # qu'on veut charger integralement en memoire.
    $vramGo = 0
    try {
        $g = Get-CimInstance Win32_VideoController | Select-Object -First 1
        $mo = [math]::Round($g.AdapterRAM / 1048576, 0)
        if ($mo -gt 0 -and $mo -lt 4096) { $vramGo = [math]::Round($mo / 1024, 1) }
    } catch { }

    Write-Host "  memoire : ${ramGo} Go   vram detectee : ${vramGo} Go" -ForegroundColor DarkGray

    # budget : la memoire totale moins 2 Go pour le systeme et les
    # navigateurs. On ne retient pas la VRAM : elle peut etre annoncee
    # de travers, et un modele a cheval sur les deux se met a swapper.
    $budget = $ramGo - 2
    if ($budget -lt 2) { $budget = 2 }

    Write-Host "  budget memoire pour le modele : ${budget} Go" -ForegroundColor DarkGray

    if ($budget -ge 14) { return 'gpt-oss-20b' }
    if ($budget -ge 8)  { return 'qwen2.5-7b-instruct' }
    if ($budget -ge 4)  { return 'qwen2.5-3b-instruct' }
    return 'qwen2.5-1.5b-instruct'
}

function Charger-Modele($lms, [string]$modele) {
    $L = New-Object System.Collections.ArrayList
    function Note([string]$ligne) {
        [void]$L.Add($ligne)
        Write-Host $ligne
    }

    if (-not $lms) { return ($L -join "`n") }
    if (-not $modele) { $modele = Choisir-Modele }
    Note ("Modele : " + $modele)

    Note 'Demarrage du daemon...'
    try { & $lms daemon up 2>&1 | ForEach-Object { Note ("  " + $_) } } catch { Note ("  " + $_) }

    Note 'Telechargement du modele (quelques minutes)...'
    try { & $lms get $modele 2>&1 | ForEach-Object { Note ("  " + $_) } } catch { Note ("  " + $_) }

    Note 'Chargement du modele...'
    try {
        & $lms load $modele --gpu max --context-length 4096 --yes 2>&1 | ForEach-Object { Note ("  " + $_) }
    } catch { Note ("  " + $_) }

    $serveur = Demarrer-ServeurLocal $lms 1234
    foreach ($ligne in ($serveur -split "`n")) { if ($ligne) { Note $ligne } }

    try {
        $r = Invoke-RestMethod -Uri 'http://127.0.0.1:1234/v1/models' -TimeoutSec 25
        Note 'Modeles exposes sur http://127.0.0.1:1234 :'
        foreach ($m in $r.data) { Note ("  - " + $m.id) }
    } catch { Note ("  serveur joignable ? : " + $_) }

    return ($L -join "`n")
}

function Publier-Capacite($config) {
    $kdf = Obtenir-KdfDisponible
    try {
        Ecrire-FichierPont $config 'pont-kdf.txt' $kdf 'pont : capacite de chiffrement du poste'
        Write-Host "Chiffrement annonce : $kdf" -ForegroundColor DarkGray
    } catch {
        Write-Host "Capacite non publiee : $_" -ForegroundColor DarkGray
    }
    return $kdf
}

# ----------------------------------------------------------------- execution

function Executer-Commande([string]$commande, [string]$coque) {
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $true
    try { $psi.StandardOutputEncoding = [System.Text.Encoding]::UTF8 } catch { }
    try { $psi.StandardErrorEncoding = [System.Text.Encoding]::UTF8 } catch { }

    if ($coque -eq 'powershell') {
        $psi.FileName = 'powershell.exe'
        $psi.Arguments = '-NoProfile -NonInteractive -ExecutionPolicy Bypass -Command ' + $commande
    } else {
        $psi.FileName = 'cmd.exe'
        $psi.Arguments = '/c ' + $commande
    }

    $proc = New-Object System.Diagnostics.Process
    $proc.StartInfo = $psi
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    $tacheOut = $proc.StandardOutput.ReadToEndAsync()
    $tacheErr = $proc.StandardError.ReadToEndAsync()
    $proc.Start() | Out-Null
    $proc.WaitForExit()
    $sortie = $tacheOut.Result
    $err = $tacheErr.Result
    $code = $proc.ExitCode

    if ($sortie.Length -gt 20000) { $sortie = $sortie.Substring(0, 20000) }
    if ($err.Length -gt 8000) { $err = $err.Substring(0, 8000) }

    return [ordered]@{
        ok     = ($code -eq 0)
        code   = $code
        stdout = $sortie
        stderr = $err
    }
}

# ----------------------------------------------------------------- autotest

function Lire-Etat {
    if (-not (Test-Path $FichierEtat)) { return '' }
    $brut = [System.IO.File]::ReadAllText($FichierEtat)
    if ($brut.Length -gt 0 -and $brut[0] -eq [char]0xFEFF) { $brut = $brut.Substring(1) }
    return $brut.Trim()
}

function Ecrire-Etat([string]$id) {
    # Sans BOM : le BOM trainnerait dans la lecture et ferait re-executer
    # la derniere commande a chaque tour de boucle.
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($FichierEtat, $id, $utf8)
}

function Executer-AutoTest() {
    Write-Host "Verification du chiffrement sur ce poste..." -ForegroundColor Cyan
    $phrase = 'pont-kat-2016'
    $sel = [byte[]](0x00,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x88,0x99,0xAA,0xBB,0xCC,0xDD,0xEE,0xFF)
    $iv  = [byte[]](0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0A,0x0B,0x0C,0x0D,0x0E,0x0F)
    $attenduSha256 = 'gqlfjulaukYzeBBV5uTHPfASpJRPnCy8Npg+epG5o/I='
    $attenduSha1   = 'YmFb7YeQqdF9vdJZ0NQl6/GDz1a5Cl9YF6Amtm7IRuY='

    $rapport = New-Object System.Collections.ArrayList
    $ko = 0
    foreach ($essai in @(@('sha256', $attenduSha256), @('sha1', $attenduSha1))) {
        $digest = $essai[0]; $attendu = $essai[1]
        $derive = Obtenir-CleDerivee $phrase $sel $digest
        $cle = $derive.Cle
        $aes = [System.Security.Cryptography.Aes]::Create()
        $aes.KeySize = 256; $aes.BlockSize = 128
        $aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
        $aes.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7
        $aes.Key = $cle; $aes.IV = $iv
        $chiffreur = $aes.CreateEncryptor()
        $octets = [System.Text.Encoding]::UTF8.GetBytes('pont-selftest-ok')
        $corps = $chiffreur.TransformFinalBlock($octets, 0, $octets.Length)
        $chiffreur.Dispose(); $aes.Dispose()
        $obtenu = Chiffrer-Base64 $corps
        if ($obtenu -eq $attendu) {
            Write-Host "  $digest : OK" -ForegroundColor Green
            [void]$rapport.Add("$digest : OK")
        } else {
            Write-Host "  $digest : ECHEC (obtenu $obtenu)" -ForegroundColor Red
            [void]$rapport.Add("$digest : ECHEC (obtenu $obtenu)")
            $ko++
        }
    }

    # Aller-retour complet sur cette machine.
    $enveloppe = Chiffrer-Texte 'phrase-de-test' 'echo bonjour' 'sha256'
    $relu = Dechiffrer-Texte 'phrase-de-test' $enveloppe
    if ($relu -eq 'echo bonjour') {
        Write-Host "  aller-retour : OK" -ForegroundColor Green
        [void]$rapport.Add('aller-retour : OK')
    } else {
        Write-Host "  aller-retour : ECHEC" -ForegroundColor Red
        [void]$rapport.Add('aller-retour : ECHEC')
        $ko++
    }

    try {
        Dechiffrer-Texte 'mauvaise-phrase' $enveloppe | Out-Null
        Write-Host "  phrase erronee acceptee : ECHEC" -ForegroundColor Red
        [void]$rapport.Add('phrase erronee acceptee : ECHEC')
        $ko++
    } catch {
        Write-Host "  phrase erronee refusee : OK" -ForegroundColor Green
        [void]$rapport.Add('phrase erronee refusee : OK')
    }

    # Informations sur la machine : utile pour diagnostiquer un echec.
    $os = ''
    try { $os = [System.Environment]::OSVersion.VersionString } catch { }
    $dotnet = ''
    try { $dotnet = [System.Runtime.InteropServices.RuntimeInformation]::FrameworkDescription } catch { }
    $kdf = Obtenir-KdfDisponible
    [void]$rapport.Add("poste : $os")
    [void]$rapport.Add("runtime : $dotnet")
    [void]$rapport.Add("kdf disponible : $kdf")

    if ($ko -eq 0) {
        Write-Host "Chiffrement valide sur ce poste." -ForegroundColor Green
        [void]$rapport.Add('RESULTAT : OK')
    } else {
        Write-Host "Probleme de chiffrement ($ko echecs)." -ForegroundColor Red
        [void]$rapport.Add("RESULTAT : ECHEC ($ko)")
    }

    # Le rapport est ecrit sur le poste et, si possible, publie pour que
    # l'assistant puisse le lire sans que l'utilisateur recopie quoi que ce soit.
    $texte = ($rapport -join "`n")
    $chemin = $RapportChemin
    if (-not $chemin) { $chemin = Join-Path $DossierScript 'rapport-autotest.txt' }
    try {
        Ecrire-FichierUtf8 $chemin $texte
        Write-Host "Rapport ecrit : $chemin" -ForegroundColor DarkGray
    } catch {
        Write-Host "Rapport non ecrit : $_" -ForegroundColor DarkGray
    }

    return @($ko, $texte)
}

# ----------------------------------------------------------------- boucle

function Lire-FichierTexte([string]$chemin) {
    if (-not (Test-Path $chemin)) { return '' }
    $brut = [System.IO.File]::ReadAllText($chemin)
    if ($brut.Length -gt 0 -and $brut[0] -eq [char]0xFEFF) { $brut = $brut.Substring(1) }
    return $brut.Trim()
}

function Lire-Config {
    if (-not (Test-Path $FichierConfig)) { throw "Fichier manquant : $FichierConfig" }
    $brut = [System.IO.File]::ReadAllText($FichierConfig)
    if ($brut.Length -gt 0 -and $brut[0] -eq [char]0xFEFF) { $brut = $brut.Substring(1) }
    return ($brut | ConvertFrom-Json)
}

function Lire-Cle {
    if (-not (Test-Path $FichierCle)) { throw "Fichier manquant : $FichierCle" }
    $brut = [System.IO.File]::ReadAllText($FichierCle)
    if ($brut.Length -gt 0 -and $brut[0] -eq [char]0xFEFF) { $brut = $brut.Substring(1) }
    $phrase = $brut.Trim()
    if (-not $phrase) { throw "Le fichier cle.txt est vide." }
    return $phrase
}

function Ecrire-FichierUtf8([string]$chemin, [string]$contenu) {
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($chemin, $contenu, $utf8)
}

function Demander-Jeton {
    Write-Host ""
    Write-Host "  Jeton GitHub (fine-grained) : " -NoNewline -ForegroundColor Cyan
    $saisie = Read-Host
    $saisie = $saisie.Trim()
    if (-not $saisie) { throw "Jeton vide." }
    return $saisie
}

function Demander-Phrase {
    Write-Host ""
    Write-Host "  Phrase de passe du pont (choisissez-la, ne la communiquez a personne) :" -ForegroundColor Cyan
    $saisie = Read-Host -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($saisie)
    try { $phrase = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
    if (-not $phrase) { throw "Phrase vide." }
    return $phrase
}

function Preparer-Configuration {
    # Un seul fichier a copier suffit : si la config ou la cle manquent,
    # on les demande une fois et on les ecrit sur le poste.
    $config = $null
    $phrase = ''

    if (Test-Path $FichierConfig) {
        try { $config = Lire-Config } catch { $config = $null }
        if ($config -and -not $config.jetonGitHub) { $config = $null }
    }

    if (-not $config) {
        Write-Host ""
        Write-Host "=== Premiere installation du pont ===" -ForegroundColor Yellow
        Write-Host "Le depot : franceinfo771-prog/tableau_de_bord (branche pont)" -ForegroundColor DarkGray
        Write-Host "Permission requise sur le jeton : Contents -> Read and write" -ForegroundColor DarkGray
        $jeton = Demander-Jeton
        $config = [pscustomobject]@{
            jetonGitHub = $jeton
            depot      = 'franceinfo771-prog/tableau_de_bord'
            branche    = 'pont'
        }
        $json = @{
            jetonGitHub = $config.jetonGitHub
            depot      = $config.depot
            branche    = $config.branche
        } | ConvertTo-Json
        Ecrire-FichierUtf8 $FichierConfig $json
        Write-Host "  Configuration ecrite dans $FichierConfig" -ForegroundColor Green
    } else {
        Write-Host "Configuration trouvee : $FichierConfig" -ForegroundColor DarkGray
    }

    if (Test-Path $FichierCle) {
        try { $phrase = Lire-Cle } catch { $phrase = '' }
    }

    if (-not $phrase) {
        $phrase = Demander-Phrase
        Ecrire-FichierUtf8 $FichierCle $phrase
        Write-Host "  Phrase enregistree dans $FichierCle" -ForegroundColor Green
    } else {
        Write-Host "Phrase trouvee : $FichierCle" -ForegroundColor DarkGray
    }

    return @($config, $phrase)
}

function Lire-DeclencheurInstallation($config) {
    # Declencheur en clair : l'assistant publie le nom du modele a
    # installer, le pont le voit et agit. Aucun secret dans ce fichier,
    # donc aucune phrase de passe n'est necessaire cote assistant.
    $url = "https://api.github.com/repos/$($config.depot)/contents/pont/installer.txt?ref=$($config.branche)"
    try {
        $reponse = Invoke-RestMethod -Uri $url -Headers (Obtenir-Entetes $config.jetonGitHub) -Method Get -TimeoutSec 30
    } catch {
        return $null
    }
    if (-not $reponse.content) { return $null }
    $brut = ($reponse.content -replace '\s', '')
    try {
        return [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($brut))
    } catch {
        return $null
    }
}

function Executer-DeclencheurInstallation($config, [string]$demande) {
    # La demande est un JSON : { "id": "...", "modele": "..." }.
    $ordre = $null
    try { $ordre = $demande | ConvertFrom-Json } catch { $ordre = $null }
    if (-not $ordre -or -not $ordre.id) { return $false }

    $dernier = ''
    if (Test-Path $FichierEtatInstall) { $dernier = (Get-Content $FichierEtatInstall -Raw -ErrorAction SilentlyContinue) }
    if ($dernier -and $dernier.Trim() -eq $ordre.id) { return $false }

    Write-Host "`nDemande dinstallation recue : $($ordre.id)" -ForegroundColor Cyan

    # Une demande peut porter une action particuliere : installation
    # du modele, ouverture du tunnel prive, ou les deux.
    if ($ordre.action -eq 'tunnel') {
        $port = 1234
        if ($ordre.port) { $port = [int]$ordre.port }
        $methode = 'tailscale'
        if ($ordre.methode) { $methode = $ordre.methode }

        $lms = Trouver-Lms
        if ($lms) {
            try { & $lms daemon up 2>&1 | Out-Null } catch { }
            Demarrer-ServeurLocal $lms $port | Out-Null
        }

        if ($methode -eq 'cloudflare') {
            $cf = Trouver-Cloudflared
            if (-not $cf) {
                $rapport = 'cloudflared introuvable sur ce poste.'
            } else {
                $rapport = Activer-TunnelCloudflare $cf $port
            }
        } else {
            $install = Installer-Tailscale
            $rapport = $install[0] -join "`n"
            $rapport = $rapport + "`n" + (Activer-Tunnel $install[1] $port)
        }
        try {
            Publier-FichierPontEnClair $config 'tunnel.txt' $rapport 'pont : tunnel prive'
            Write-Host 'Rapport du tunnel publie.' -ForegroundColor Green
        } catch {
            Write-Host "Publication impossible : $_" -ForegroundColor Yellow
        }
        try {
            $utf8 = New-Object System.Text.UTF8Encoding($false)
            [System.IO.File]::WriteAllText($FichierEtatInstall, $ordre.id, $utf8)
        } catch { }
        return $true
    }

    if ($ordre.modele) { Write-Host "  Modele demande : $($ordre.modele)" -ForegroundColor Cyan }

    $install = Installer-LmStudio
    $rapport = $install[0] -join "`n"
    $lms = $install[1]

    if ($ordre.sansModele) {
        Write-Host '  Installation seule : aucun modele demande.' -ForegroundColor DarkGray
        $rapport = $rapport + "`n=== Fin de l installation (aucun modele charge) ==="
    } elseif ($ordre.modele) {
        $rapport = $rapport + "`n" + (Charger-Modele $lms $ordre.modele) + "`n=== Fin ==="
    } else {
        $rapport = $rapport + "`n" + (Charger-Modele $lms '') + "`n=== Fin ==="
    }

    try {
        Publier-FichierPontEnClair $config 'lmstudio.txt' $rapport 'pont : installation LM Studio'
        Write-Host 'Rapport publie pour votre assistant.' -ForegroundColor Green
    } catch {
        Write-Host "Publication impossible : $_" -ForegroundColor Yellow
    }

    try {
        $utf8 = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($FichierEtatInstall, $ordre.id, $utf8)
    } catch { }
    return $true
}

# ----------------------------------------------------------------- tunnel

function Trouver-Tailscale {
    foreach ($c in @(
        "$env:ProgramFiles\Tailscale\tailscale.exe",
        "$env:ProgramFiles(x86)\Tailscale\tailscale.exe",
        "$env:LOCALAPPDATA\Tailscale\tailscale.exe"
    )) {
        if (Test-Path $c) { return $c }
    }
    $t = Get-Command tailscale -ErrorAction SilentlyContinue
    if ($t) { return $t.Source }
    return $null
}

function Installer-Tailscale {
    # Installe Tailscale : il cree un reseau prive entre vos appareils,
    # sans ouvrir le moindre port sur la box. C'est ce qui rend l'IA
    # accessible depuis le travail tout en restant introuvable
    # depuis internet.
    $L = New-Object System.Collections.ArrayList
    function Note([string]$ligne) {
        [void]$L.Add($ligne)
        Write-Host $ligne
    }

    $ts = Trouver-Tailscale
    if (-not $ts) {
        Note 'Installation de Tailscale...'
        try {
            $r = winget install --id Tailscale.Tailscale --exact `
                --accept-package-agreements --accept-source-agreements --silent 2>&1
            foreach ($l in $r) { Note ("  " + $l) }
        } catch { Note ("  winget : " + $_) }
        $ts = Trouver-Tailscale
    }

    if (-not $ts) {
        Note 'ECHEC : Tailscale introuvable apres installation.'
        return @($L, $null)
    }
    Note ("Tailscale : " + $ts)
    return @($L, $ts)
}

function Trouver-Cloudflared {
    foreach ($c in @(
        "$env:ProgramFiles\cloudflared\cloudflared.exe",
        "$env:LOCALAPPDATA\Programs\cloudflared\cloudflared.exe",
        "$env:USERPROFILE\.cloudflared\cloudflared.exe"
    )) {
        if (Test-Path $c) { return $c }
    }
    $t = Get-Command cloudflared -ErrorAction SilentlyContinue
    if ($t) { return $t.Source }
    return $null
}

function Activer-TunnelCloudflare($cf, [int]$port) {
    # cloudflared ouvre un tunnel vers le serveur local. Deux cas :
    #   - un tunnel nomme existe deja (config.yaml) : l adresse est fixe ;
    #   - sinon on ouvre un tunnel rapide : l adresse est aleatoire et
    #     change a chaque redemarrage.
    $L = New-Object System.Collections.ArrayList
    function Note([string]$ligne) {
        [void]$L.Add($ligne)
        Write-Host $ligne
    }

    if (-not $cf) {
        Note 'cloudflared introuvable sur ce poste.'
        return ($L -join "`n")
    }
    Note ("cloudflared : " + $cf)

    $cible = "http://127.0.0.1:$port"
    $config = Join-Path $env:USERPROFILE '.cloudflared\config.yaml'
    $configAlt = Join-Path $env:USERPROFILE '.cloudflared\config.yml'
    if (-not (Test-Path $config)) { $config = $configAlt }

    $url = ''
    $nomme = ''

    if (Test-Path $config) {
        try {
            $texte = Get-Content $config -Raw
            if ($texte -match '(?m)^\s*hostname:\s*(\S+)') { $url = $Matches[1] }
            if ($texte -match '(?m)^\s*tunnel:\s*(\S+)') { $nomme = $Matches[1] }
        } catch { }
    }

    if ($nomme -and $url) {
        Note ("Tunnel nomme : " + $nomme)
        Note ("Adresse : " + $url)
        try {
            Start-Process -FilePath $cf -ArgumentList @('tunnel','run',$nomme,'--no-autoupdate') `
                -WindowStyle Hidden | Out-Null
            Start-Sleep -Seconds 6
            Note 'Tunnel demarre.'
        } catch { Note ("  " + $_) }
        Note ''
        Note ('A coller dans la zone " Mon IA privee " du tableau de bord : ' + $url)
        return ($L -join "`n")
    }

    # Pas de tunnel nomme : on ouvre un tunnel rapide.
    Note 'Ouverture d un tunnel rapide...'
    $log = Join-Path $env:TEMP 'cloudflared-pont.log'
    $err = Join-Path $env:TEMP 'cloudflared-pont.err'
    try {
        Start-Process -FilePath $cf `
            -ArgumentList @('tunnel','--no-autoupdate','--url',$cible) `
            -RedirectStandardOutput $log -RedirectStandardError $err `
            -WindowStyle Hidden -PassThru | Out-Null
    } catch {
        Note ("  " + $_)
        return ($L -join "`n")
    }

    for ($i = 0; $i -lt 40; $i++) {
        Start-Sleep -Milliseconds 500
        foreach ($f in @($err, $log)) {
            if (Test-Path $f) {
                try {
                    $t = Get-Content $f -Raw
                    if ($t -match '(https://[a-z0-9\-]+\.trycloudflare\.com)') {
                        $url = $Matches[1]
                        break
                    }
                } catch { }
            }
        }
        if ($url) { break }
    }

    if ($url) {
        Note ("Adresse : " + $url)
        Note ''
        Note 'Attention : un tunnel rapide change d adresse a chaque redemarrage.'
        Note 'Pour une adresse stable, il faut un tunnel nomme.'
        Note ('A coller dans la zone " Mon IA privee " du tableau de bord : ' + $url)
    } else {
        Note "Adresse non obtenue. Journal : $err"
    }

    return ($L -join "`n")
}

function Activer-Tunnel($ts, [int]$port) {
    # tailscale up affiche une adresse d'authentification a ouvrir dans
    # un navigateur. On la remonte : l'utilisateur doit la valider une
    # fois, sur le poste de travail.
    $L = New-Object System.Collections.ArrayList
    function Note([string]$ligne) {
        [void]$L.Add($ligne)
        Write-Host $ligne
    }

    if (-not $ts) { Note 'Tailscale absent : tunnel impossible.'; return ($L -join "`n") }

    Note 'Connexion de ce poste au reseau prive...'
    # La forme "--timeout 20s" (avec espace) est acceptee partout ;
    # la forme "--timeout=20s" est rejetee par certains analyseurs.
    $sortie = & $ts up --timeout 20s 2>&1 | Out-String
    foreach ($l in ($sortie -split "`n")) { if ($l.Trim()) { Note ("  " + $l.Trim()) } }

    if ($sortie -match 'https://login\.tailscale\.com/\S+') {
        Note ''
        Note 'A OUVRIR DANS UN NAVIGATEUR pour valider :' -ForegroundColor Yellow
        Note ('  ' + $Matches[0]) -ForegroundColor White
    }

    # On attend que le poste rejoigne le reseau prive : l'utilisateur peut
    # valider le lien quand il veut, le pont s'en apercoit.
    Note 'En attente de la validation (5 minutes maximum)...'
    $connecte = $false
    for ($i = 0; $i -lt 60; $i++) {
        try {
            $etat = & $ts status --json 2>$null | Out-String
            if ($etat -match '"BackendState"\s*:\s*"Running"') { $connecte = $true; break }
        } catch { }
        Start-Sleep -Seconds 5
    }

    if ($connecte) {
        Note 'Poste connecte au reseau prive.'
    } else {
        Note 'Le poste n est pas encore connecte : ouvrez l adresse ci-dessus.'
        Note 'Puis relancez : tailscale serve --bg http://127.0.0.1:' + $port
    }

    Note ''
    Note 'Publication du serveur local sur une adresse prive en https...'
    try {
        $s = & $ts serve --bg "http://127.0.0.1:$port" 2>&1 | Out-String
        foreach ($l in ($s -split "`n")) { if ($l.Trim()) { Note ("  " + $l.Trim()) } }
    } catch { Note ("  " + $_) }

    Start-Sleep -Seconds 3
    $url = ''
    try {
        $st = & $ts serve status --json 2>$null | Out-String
        if ($st -match '"URL"\s*:\s*"(https://[^"]+)"') { $url = $Matches[1] }
    } catch { }
    if (-not $url) {
        try {
            $st = & $ts serve status 2>&1 | Out-String
            if ($st -match '(https://[A-Za-z0-9\.\-]+\.ts\.net)') { $url = $Matches[1] }
        } catch { }
    }

    if ($url) {
        Note ''
        Note ("Adresse prive : " + $url) -ForegroundColor Green
        Note 'A coller dans la zone " Mon IA privee " du tableau de bord.'
    } else {
        Note ''
        Note 'Adresse non obtenue : lancez " tailscale serve status " pour la voir.'
    }

    return ($L -join "`n")
}

function Tourner($config, [string]$phrase) {
    # D'abord le declencheur en clair : c'est lui qui porte les actions
    # lourdes (installation d'un modele) que l'assistant lance.
    try {
        $demande = Lire-DeclencheurInstallation $config
        if ($demande) {
            if (Executer-DeclencheurInstallation $config $demande) { return $true }
        }
    } catch {
        Write-Host "`nDeclencheur illisible : $_" -ForegroundColor Yellow
    }

    $enveloppe = Lire-CommandeEnAttente $config
    if (-not $enveloppe) { Write-Host '.' -NoNewline; return $false }

    try {
        $ordre = Dechiffrer-Texte $phrase $enveloppe | ConvertFrom-Json
    } catch {
        Write-Host "`nCommande illisible : $_" -ForegroundColor Yellow
        return $false
    }

    $dernierId = Lire-Etat
    if ($ordre.id -eq $dernierId) { Write-Host '.' -NoNewline; return $false }

    Write-Host "`nExecution de la commande $($ordre.id) : $($ordre.cmd)" -ForegroundColor Cyan
    $resultat = Executer-Commande $ordre.cmd $ordre.shell
    $resultat['id'] = $ordre.id

    try {
        Ecrire-Reponse $config ($resultat | ConvertTo-Json -Compress -Depth 5)
        Ecrire-Etat $ordre.id
        Write-Host "Reponse envoyee (code $($resultat.code))." -ForegroundColor Green
    } catch {
        Write-Host "Echec de l'envoi : $_" -ForegroundColor Red
    }
    return $true
}

if ($AutoTest) {
    $r = Executer-AutoTest
    exit ([int]$r[0])
}

if ($Releve) {
    try {
        $prepares = Preparer-Configuration
        Publier-Machine $prepares[0]
    } catch {
        Write-Host $_ -ForegroundColor Red
        exit 1
    }
    exit 0
}

if ($Tunnel) {
    try {
        $prepares = Preparer-Configuration
        $config = $prepares[0]

        # Le serveur LM Studio doit tourner avant que le tunnel ne serve
        # a quelque chose.
        $lms = Trouver-Lms
        if ($lms) {
            try { & $lms daemon up 2>&1 | Out-Null } catch { }
            Demarrer-ServeurLocal $lms $Port | Out-Null
        }

        if ($Methode -eq 'cloudflare') {
            $cf = Trouver-Cloudflared
            if (-not $cf) {
                Write-Host 'cloudflared introuvable sur ce poste.' -ForegroundColor Yellow
                $rapport = 'cloudflared introuvable.'
            } else {
                $rapport = Activer-TunnelCloudflare $cf $Port
            }
        } else {
            $install = Installer-Tailscale
            $rapport = $install[0] -join "`n"
            $rapport = $rapport + "`n" + (Activer-Tunnel $install[1] $Port)
        }

        try {
            Publier-FichierPontEnClair $config 'tunnel.txt' $rapport 'pont : tunnel prive'
            Write-Host ''
            Write-Host 'Rapport publie pour votre assistant.' -ForegroundColor Green
        } catch {
            Write-Host "Publication impossible : $_" -ForegroundColor Yellow
        }
    } catch {
        Write-Host $_ -ForegroundColor Red
        exit 1
    }
    exit 0
}

if ($Installer) {
    try {
        $prepares = Preparer-Configuration
        $config = $prepares[0]
        $install = Installer-LmStudio
        $rapport = $install[0] -join "`n"
        $lms = $install[1]

        if ($SansModele) {
            $rapport = $rapport + "`n=== Fin de l installation ==="
        } else {
            $suite = Charger-Modele $lms $Modele
            $rapport = $rapport + "`n" + $suite + "`n=== Fin ==="
        }

        try {
            Publier-FichierPontEnClair $config 'lmstudio.txt' $rapport 'pont : installation LM Studio'
            Write-Host ''
            Write-Host 'Rapport publie pour votre assistant.' -ForegroundColor Green
        } catch {
            Write-Host "Publication impossible : $_" -ForegroundColor Yellow
        }
    } catch {
        Write-Host $_ -ForegroundColor Red
        exit 1
    }
    exit 0
}

try {
    $prepares = Preparer-Configuration
    $config = $prepares[0]
    $phrase = $prepares[1]
} catch {
    Write-Host $_ -ForegroundColor Red
    Write-Host "Configuration impossible. Verifiez le jeton et relancez." -ForegroundColor Yellow
    exit 1
}

Write-Host "Pont en ecoute (Ctrl+C pour arreter). Depot : $($config.depot) / $($config.branche)" -ForegroundColor Cyan

# On annonce au cloud quel algorithme de derivation ce poste supporte.
$kdfLocal = Publier-Capacite $config

# On publie le rapport d'autotest : l'assistant peut ainsi confirmer que
# la machine est prete sans que l'utilisateur ait a recopier l'ecran.
if (-not $Silencieux) {
    Write-Host "Verification du chiffrement et publication du rapport..." -ForegroundColor Cyan
    $rapport = Executer-AutoTest
    Publier-RapportAutoTest $config $rapport[1]

    # On publie aussi la configuration de la machine : elle permet a
    # l'assistant de choisir un modele local adapte (LM Studio, Ollama)
    # sans avoir a demander les caracteristiques a l'utilisateur.
    Write-Host "Publication de la configuration de la machine..." -ForegroundColor Cyan
    Publier-Machine $config
}

if ($UneFois) {
    Tourner $config $phrase | Out-Null
    exit 0
}

while ($true) {
    try { Tourner $config $phrase | Out-Null } catch { Write-Host "`nErreur : $_" -ForegroundColor Red }
    Start-Sleep -Seconds $IntervalleSecondes
}
