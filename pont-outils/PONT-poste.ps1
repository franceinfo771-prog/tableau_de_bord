<#
  PONT-poste.ps1 — agent du poste a la maison.
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
    [int]$IntervalleSecondes = 30
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$DossierScript = Split-Path -Parent $MyInvocation.MyCommand.Path
$FichierConfig = Join-Path $DossierScript 'pont-config.json'
$FichierCle    = Join-Path $DossierScript 'cle.txt'
$FichierEtat   = Join-Path $DossierScript 'pont-etat.txt'

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
    # Sans BOM : le BOM traînerait dans la lecture et ferait ré-exécuter
    # la dernière commande à chaque tour de boucle.
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
        } else {
            Write-Host "  $digest : ECHEC (obtenu $obtenu)" -ForegroundColor Red
            $ko++
        }
    }

    # Aller-retour complet sur cette machine.
    $enveloppe = Chiffrer-Texte 'phrase-de-test' 'echo bonjour' 'sha256'
    $relu = Dechiffrer-Texte 'phrase-de-test' $enveloppe
    if ($relu -eq 'echo bonjour') { Write-Host "  aller-retour : OK" -ForegroundColor Green }
    else { Write-Host "  aller-retour : ECHEC" -ForegroundColor Red; $ko++ }

    try {
        Dechiffrer-Texte 'mauvaise-phrase' $enveloppe | Out-Null
        Write-Host "  phrase erronee acceptee : ECHEC" -ForegroundColor Red; $ko++
    } catch { Write-Host "  phrase erronee refusee : OK" -ForegroundColor Green }

    if ($ko -eq 0) { Write-Host "Chiffrement valide sur ce poste." -ForegroundColor Green; exit 0 }
    Write-Host "Probleme de chiffrement ($ko echecs)." -ForegroundColor Red
    exit 1
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

function Tourner($config, [string]$phrase) {
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

if ($AutoTest) { Executer-AutoTest; exit 0 }

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

if ($UneFois) {
    Tourner $config $phrase | Out-Null
    exit 0
}

while ($true) {
    try { Tourner $config $phrase | Out-Null } catch { Write-Host "`nErreur : $_" -ForegroundColor Red }
    Start-Sleep -Seconds $IntervalleSecondes
}
