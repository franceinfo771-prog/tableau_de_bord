"""Verification de la logique PowerShell portee en Python.

On rejoue exactement les etapes de PONT-poste.ps1 (memes appels .NET,
memes entrees, meme ordre) pour verifier que le script produirait bien
les memes enveloppes que le moteur Python du cloud.

C'est un controle croise : la syntaxe a ete verifiee par un vrai
analyseur PowerShell (tree-sitter), ici on verifie la logique.
"""

import base64
import hashlib
import hmac
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from crypto import open_envelope, seal  # noqa: E402

PHRASE = "phrase-partagee"
ITER = 200000
IV_LEN = 16
SALT_LEN = 16
ok_global = True


# ---- portage fidele de Obtenir-CleDerivee (Rfc2898DeriveBytes) -------------
def rfc2898_like_dotnet(password, salt, iterations, digest):
    """Ce que fait System.Security.Cryptography.Rfc2898DeriveBytes."""
    return hashlib.pbkdf2_hmac(digest, password.encode("utf-8"), salt, iterations, 32)


def obtenir_cle_derivee(phrase, sel, digest):
    """Comme dans le script : si SHA-256 est possible on l'utilise,
    sinon on retombe sur SHA-1 — et on renvoie le digest RÉELLEMENT
    utilisé, comme le fait le script."""
    if digest == "sha256":
        try:
            rfc2898_like_dotnet(phrase, sel, ITER, "sha256")
            return {"Cle": rfc2898_like_dotnet(phrase, sel, ITER, "sha256"), "Digest": "sha256"}
        except Exception:  # noqa: BLE001
            pass
    return {"Cle": rfc2898_like_dotnet(phrase, sel, ITER, "sha1"), "Digest": "sha1"}


def chiffrer_texte(phrase, texte, digest):
    """Comme Chiffrer-Texte dans PONT-poste.ps1."""
    sel = os.urandom(SALT_LEN)
    iv = os.urandom(IV_LEN)
    derive = obtenir_cle_derivee(phrase, sel, digest)
    cle = derive["Cle"]
    digest = derive["Digest"]

    from cryptography.hazmat.primitives import padding
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

    padder = padding.PKCS7(128).padder()
    padded = padder.update(texte.encode("utf-8")) + padder.finalize()
    enc = Cipher(algorithms.AES(cle), modes.CBC(iv)).encryptor()
    corps = enc.update(padded) + enc.finalize()
    mac = hmac.new(cle, iv + corps, hashlib.sha256).digest()

    enveloppe = {
        "v": 1,
        "alg": "A256CBC-HS256",
        "kdf": {"p": "pbkdf2-hmac-%s" % digest, "i": ITER, "s": base64.b64encode(sel).decode()},
        "iv": base64.b64encode(iv).decode(),
        "ct": base64.b64encode(corps).decode(),
        "mac": base64.b64encode(mac).decode(),
    }
    return json.dumps(enveloppe, separators=(",", ":"), sort_keys=True)


def dechiffrer_texte(phrase, json_enveloppe):
    """Comme Dechiffrer-Texte dans PONT-poste.ps1."""
    env = json.loads(json_enveloppe)
    if env.get("alg") != "A256CBC-HS256":
        raise ValueError("Algorithme inconnu : %s" % env.get("alg"))
    digest = env["kdf"]["p"].replace("pbkdf2-hmac-", "")
    sel = base64.b64decode(env["kdf"]["s"])
    iv = base64.b64decode(env["iv"])
    corps = base64.b64decode(env["ct"])
    derive = obtenir_cle_derivee(phrase, sel, digest)
    if derive["Digest"] != digest:
        raise ValueError(
            "Commande chiffree en %s, mais ce poste ne derive qu'en %s."
            % (digest, derive["Digest"])
        )
    cle = derive["Cle"]
    mac_attendu = base64.b64decode(env["mac"])
    mac_calcule = hmac.new(cle, iv + corps, hashlib.sha256).digest()
    for i in range(len(mac_attendu)):
        if mac_attendu[i] != mac_calcule[i]:
            raise ValueError("Signature invalide : mauvaise phrase passe ou donnee alteree.")

    from cryptography.hazmat.primitives import padding
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

    dec = Cipher(algorithms.AES(cle), modes.CBC(iv)).decryptor()
    brut = dec.update(corps) + dec.finalize()
    un = padding.PKCS7(128).unpadder()
    return (un.update(brut) + un.finalize()).decode("utf-8")


def main():
    global ok_global
    print("=== 1. Le poste chiffre, le cloud dechiffre (aller-retour) ===")
    for digest in ("sha256", "sha1"):
        env = chiffrer_texte(PHRASE, "echo bonjour", digest)
        lu = open_envelope(PHRASE, env)
        statut = "OK" if lu == "echo bonjour" else "ECHEC"
        if statut == "ECHEC":
            ok_global = False
        print("   %-6s : cloud lit -> %s (%s)" % (digest, lu, statut))

    print("\n=== 2. Le cloud chiffre, le poste dechiffre (aller-retour) ===")
    for digest in ("sha256", "sha1"):
        env = seal(PHRASE, "echo bonjour", digest)
        lu = dechiffrer_texte(PHRASE, env)
        statut = "OK" if lu == "echo bonjour" else "ECHEC"
        if statut == "ECHEC":
            ok_global = False
        print("   %-6s : poste lit -> %s (%s)" % (digest, lu, statut))

    print("\n=== 3. Les deux sens au meme moment (enveloppe complete) ===")
    env = chiffrer_texte(PHRASE, json.dumps({"id": "x", "cmd": "dir"}), "sha256")
    cote_cloud = json.loads(open_envelope(PHRASE, env))
    cote_poste = json.loads(dechiffrer_texte(PHRASE, env))
    identique = cote_cloud == cote_poste
    if not identique:
        ok_global = False
    print("   cloud :", cote_cloud)
    print("   poste :", cote_poste)
    print("   identique :", identique)

    print("\n=== 4. Le poste refuse une mauvaise phrase ===")
    env = chiffrer_texte(PHRASE, "echo x", "sha256")
    try:
        dechiffrer_texte("mauvaise", env)
        print("   PROBLEME : acceptee")
        ok_global = False
    except ValueError as exc:
        print("   refus correct :", exc)

    print("\n=== 5. Le poste refuse un contenu modifie ===")
    env = json.loads(chiffrer_texte(PHRASE, "echo x", "sha256"))
    ct = bytearray(base64.b64decode(env["ct"]))
    ct[0] ^= 0xFF
    env["ct"] = base64.b64encode(bytes(ct)).decode()
    try:
        dechiffrer_texte(PHRASE, json.dumps(env))
        print("   PROBLEME : acceptee")
        ok_global = False
    except ValueError as exc:
        print("   refus correct :", exc)

    print("\n=== 6. Message avec accents et emoji (UTF-8) ===")
    message = "echo café — déjà vu ✓"
    env = chiffrer_texte(PHRASE, message, "sha256")
    lu = dechiffrer_texte(PHRASE, env)
    statut = "OK" if lu == message else "ECHEC"
    if statut == "ECHEC":
        ok_global = False
    print("   aller-retour :", statut, "->", lu)

    print("\nLOGIQUE DU SCRIPT VERIFIEE" if ok_global else "\nECHECS DETECTES")
    return 0 if ok_global else 1


if __name__ == "__main__":
    sys.exit(main())
