"""Test de la negociation de l'algorithme de derivation (SHA-256 / SHA-1).

Simule un poste ancien qui ne sait faire que HMAC-SHA1 : le sandbox doit
utiliser SHA-1 des que le poste l'annonce, et le dechiffrement doit
reussir des deux cotes.
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
ok_global = True


def etape(t):
    print("\n=== %s ===" % t)


def dechiffrer_cote_poste(enveloppe_json, digest_poste):
    """Exactement ce que fait PONT-poste.ps1 (Rfc2898DeriveBytes)."""
    env = json.loads(enveloppe_json)
    salt = base64.b64decode(env["kdf"]["s"])
    iv = base64.b64decode(env["iv"])
    ct = base64.b64decode(env["ct"])
    key = hashlib.pbkdf2_hmac(digest_poste, PHRASE.encode("utf-8"), salt, env["kdf"]["i"], 32)
    if not hmac.compare_digest(
        hmac.new(key, iv + ct, hashlib.sha256).digest(), base64.b64decode(env["mac"])
    ):
        raise ValueError("signature invalide")
    from cryptography.hazmat.primitives import padding
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

    dec = Cipher(algorithms.AES(key), modes.CBC(iv)).decryptor()
    padded = dec.update(ct) + dec.finalize()
    un = padding.PKCS7(128).unpadder()
    return (un.update(padded) + un.finalize()).decode("utf-8")


def main():
    global ok_global

    etape("1. Poste SHA-1 : le sandbox chiffre en SHA-1")
    ordre = {"id": "kdf1", "cmd": "echo test", "shell": "cmd"}
    env = seal(PHRASE, json.dumps(ordre), "sha1")
    print("   enveloppe annonce :", json.loads(env)["kdf"]["p"])
    relu = dechiffrer_cote_poste(env, "sha1")
    print("   dechiffre par le poste :", relu)
    assert json.loads(relu)["cmd"] == "echo test"

    etape("2. Le sandbox relit la reponse du poste (rep.enc)")
    rep = {"id": "kdf1", "ok": True, "code": 0, "stdout": "coucou", "stderr": ""}
    env_rep = seal(PHRASE, json.dumps(rep), "sha1")
    lu = json.loads(open_envelope(PHRASE, env_rep))
    print("   reponse relue :", lu["stdout"], "| ok", lu["ok"])

    etape("3. Poste SHA-256 : dechiffrement correct aussi")
    env2 = seal(PHRASE, json.dumps(ordre), "sha256")
    relu2 = dechiffrer_cote_poste(env2, "sha256")
    print("   dechiffre par le poste :", relu2)

    etape("4. Si le poste ne sait faire que SHA-1, une enveloppe SHA-256 est refusee")
    try:
        dechiffrer_cote_poste(env2, "sha1")
        print("   PROBLEME : acceptée alors qu'elle ne devrait pas l'être")
        ok_global = False
    except ValueError as exc:
        print("   refus correct :", exc)

    etape("5. Le sandbox dechiffre les deux formes")
    for d in ("sha1", "sha256"):
        e = seal(PHRASE, "message " + d, d)
        assert open_envelope(PHRASE, e) == "message " + d
        print("   %-6s : aller-retour OK" % d)

    print("\nNEGOCIATION KDF VALIDEE")
    return 0 if ok_global else 1


if __name__ == "__main__":
    sys.exit(main())
