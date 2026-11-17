"""PBKDF2 : twin Python de reference, en version SHA-1 et SHA-256.

But : valider l'algorithme avant de l'embarquer dans le script PowerShell
du poste a la maison. La version PowerShell utilise les classes .NET
(Rfc2898DeriveBytes, Aes, HMACSHA256) ; ce twin sert de reference.
"""

import hashlib
import hmac


def pbkdf2_manual(password: bytes, salt: bytes, iterations: int, length: int, digest="sha256"):
    """PBKDF2 ecrit a la main : U1 = PRF(P, S || INT(i)), puis XOR des Ui."""
    hash_size = hashlib.new(digest).digest_size
    blocks = (length + hash_size - 1) // hash_size

    out = bytearray()
    for block in range(1, blocks + 1):
        u = hmac.new(password, salt + block.to_bytes(4, "big"), digest).digest()
        acc = bytearray(u)
        for _ in range(1, iterations):
            u = hmac.new(password, u, digest).digest()
            for i in range(hash_size):
                acc[i] ^= u[i]
        out.extend(acc)
    return bytes(out[:length])


def pbkdf2_ref(password: bytes, salt: bytes, iterations: int, length: int, digest="sha256"):
    return hashlib.pbkdf2_hmac(digest, password, salt, iterations, length)


if __name__ == "__main__":
    cases = [
        (b"phrase-de-test", b"sel-0123456789ab", 1000, 32),
        ("mot de passe accentué é".encode("utf-8"), bytes(range(16)), 1000, 32),
        (b"x" * 40, b"y" * 16, 200000, 32),
    ]
    all_ok = True
    for digest in ("sha256", "sha1"):
        for pw, salt, it, ln in cases:
            a = pbkdf2_manual(pw, salt, it, ln, digest)
            b = pbkdf2_ref(pw, salt, it, ln, digest)
            ok = a == b
            all_ok &= ok
            print("%-6s sel=%-18r it=%-7d identique: %s" % (digest, salt[:16], it, ok))
    print("ALGORITHME VALIDE" if all_ok else "ECHEC : divergence")
