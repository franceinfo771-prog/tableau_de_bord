"""Met a jour l'empreinte SHA-256 dans INSTALLER.ps1.

Le hash doit correspondre au PONT-START.bat reellement publie. Sans cela,
un fichier tronque ou remplace pourrait passer inaperçu.

Usage : python3 maj_hash.py <chemin/vers/PONT-START.bat>
"""

import hashlib
import io
import os
import re
import sys

ICI = os.path.dirname(os.path.abspath(__file__))
INSTALLER = os.path.join(ICI, "INSTALLER.ps1")


def main():
    if len(sys.argv) < 2:
        print("usage : maj_hash.py <PONT-START.bat>")
        return 1
    chemin = sys.argv[1]
    if not os.path.exists(chemin):
        print("introuvable :", chemin)
        return 1

    with open(chemin, "rb") as f:
        empreinte = hashlib.sha256(f.read()).hexdigest()

    texte = io.open(INSTALLER, "r", encoding="utf-8").read()
    nouveau, n = re.subn(
        r"(\$Sha256\s*=\s*')[0-9a-f]{64}(')",
        lambda m: m.group(1) + empreinte + m.group(2),
        texte,
    )
    if n != 1:
        print("ERREUR : ligne $Sha256 introuvable ou ambigue (%d)" % n)
        return 1

    io.open(INSTALLER, "w", encoding="utf-8", newline="\n").write(nouveau)
    print("Empreinte mise a jour :", empreinte)
    return 0


if __name__ == "__main__":
    sys.exit(main())
