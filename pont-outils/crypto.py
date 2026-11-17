"""Chiffrement du pont sandbox <-> poste a la maison.

Format d'enveloppe (JSON) :
  {"v":1,"alg":"A256CBC-HS256",
   "kdf":{"p":"pbkdf2-hmac-sha256","i":200000,"s":"<sel base64>"},
   "iv":"<iv base64>","ct":"<corps base64>","mac":"<hmac base64>"}

  corps : AES-256-CBC + PKCS7
  mac  : HMAC-SHA256 sur (iv || corps), verifie AVANT dechiffrement

Le champ kdf.p indique l'algorithme de derivation employe par le poste
("pbkdf2-hmac-sha256" ou "pbkdf2-hmac-sha1" sur les .NET anciens) : le
cote sandbox suit toujours la valeur annoncee, donc les deux bouts
parlent toujours le meme dialecte.
"""

import base64
import hashlib
import hmac
import json
import os

from cryptography.hazmat.primitives import hashes, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

VERSION = 1
ALG = "A256CBC-HS256"
ITERATIONS = 200_000
KEY_LEN = 32
IV_LEN = 16
SALT_LEN = 16

DIGESTS = {"sha256": hashes.SHA256(), "sha1": hashes.SHA1()}


def _b64e(raw: bytes) -> str:
    return base64.b64encode(raw).decode("ascii")


def _b64d(txt: str) -> bytes:
    return base64.b64decode(txt.encode("ascii"))


def derive_key(passphrase: str, salt: bytes, digest: str = "sha256") -> bytes:
    if digest not in DIGESTS:
        raise ValueError("algorithme de derivation inconnu : %s" % digest)
    kdf = PBKDF2HMAC(
        algorithm=DIGESTS[digest],
        length=KEY_LEN,
        salt=salt,
        iterations=ITERATIONS,
    )
    return kdf.derive(passphrase.encode("utf-8"))


def _hmac(key: bytes, iv: bytes, ct: bytes) -> bytes:
    return hmac.new(key, iv + ct, hashlib.sha256).digest()


def seal(passphrase: str, plaintext: str, digest: str = "sha256") -> str:
    """Chiffre un texte -> chaine JSON prete a etre stockee dans le depot."""
    salt = os.urandom(SALT_LEN)
    iv = os.urandom(IV_LEN)
    key = derive_key(passphrase, salt, digest)

    padder = padding.PKCS7(128).padder()
    padded = padder.update(plaintext.encode("utf-8")) + padder.finalize()

    encryptor = Cipher(algorithms.AES(key), modes.CBC(iv)).encryptor()
    ct = encryptor.update(padded) + encryptor.finalize()

    envelope = {
        "v": VERSION,
        "alg": ALG,
        "kdf": {"p": "pbkdf2-hmac-%s" % digest, "i": ITERATIONS, "s": _b64e(salt)},
        "iv": _b64e(iv),
        "ct": _b64e(ct),
        "mac": _b64e(_hmac(key, iv, ct)),
    }
    return json.dumps(envelope, separators=(",", ":"), sort_keys=True)


def open_envelope(passphrase: str, envelope_json: str) -> str:
    """Verifie le MAC puis dechiffre. Leve ValueError si le texte est abime."""
    env = json.loads(envelope_json)
    if env.get("alg") != ALG:
        raise ValueError("algorithme inconnu : %s" % env.get("alg"))

    kdf = env.get("kdf") or {}
    digest = (kdf.get("p") or "pbkdf2-hmac-sha256").replace("pbkdf2-hmac-", "")
    salt = _b64d(kdf["s"])
    iv = _b64d(env["iv"])
    ct = _b64d(env["ct"])
    key = derive_key(passphrase, salt, digest)

    if not hmac.compare_digest(_hmac(key, iv, ct), _b64d(env["mac"])):
        raise ValueError("signature invalide : mauvaise phrase passe ou donnee alteree")

    decryptor = Cipher(algorithms.AES(key), modes.CBC(iv)).decryptor()
    padded = decryptor.update(ct) + decryptor.finalize()
    unpadder = padding.PKCS7(128).unpadder()
    return (unpadder.update(padded) + unpadder.finalize()).decode("utf-8")
