"""Verifie que le KAT (vecteur de test a cle connue) du script PowerShell
reproduit exactement les empreintes attendues.

Ce test est important : il garantit que l'autotest affiche "OK" sur un
poste Windows reel, et donc que le rapport publie par le pont est
exploitable par l'assistant.

Usage : python3 test_kat.py
"""

import base64
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from crypto import derive_key  # noqa: E402
from cryptography.hazmat.primitives import padding  # noqa: E402
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes  # noqa: E402

# Valeurs reprises telles quelles de Executer-AutoTest dans PONT-poste.ps1
PHRASE = "pont-kat-2016"
SEL = bytes([0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77,
             0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF])
IV = bytes(range(0x00, 0x10))
TEXTE = b"pont-selftest-ok"

ATTENDU = {
    "sha256": "gqlfjulaukYzeBBV5uTHPfASpJRPnCy8Npg+epG5o/I=",
    "sha1": "YmFb7YeQqdF9vdJZ0NQl6/GDz1a5Cl9YF6Amtm7IRuY=",
}


def chiffrer(digest):
    cle = derive_key(PHRASE, SEL, digest)
    padder = padding.PKCS7(128).padder()
    padded = padder.update(TEXTE) + padder.finalize()
    chiffre = Cipher(algorithms.AES(cle), modes.CBC(IV)).encryptor()
    corps = chiffre.update(padded) + chiffre.finalize()
    return base64.b64encode(corps).decode("ascii")


def main():
    ko = 0
    for digest, attendu in ATTENDU.items():
        obtenu = chiffrer(digest)
        if obtenu == attendu:
            print("  %-7s : OK" % digest)
        else:
            print("  %-7s : ECHEC" % digest)
            print("      attendu %s" % attendu)
            print("      obtenu  %s" % obtenu)
            ko += 1
    if ko == 0:
        print("KAT VALIDE : l'autotest du pont affichera OK sur un poste Windows.")
        return 0
    print("%d divergence(s)." % ko)
    return 1


if __name__ == "__main__":
    sys.exit(main())
