#!/usr/bin/env bash
# Active (ou réactive) l'alerte de stock de la manette du vélo.
#
# GitHub n'autorise pas l'application de l'assistant à créer un fichier dans
# .github/workflows/ : la source du workflow vit donc dans
# outils/alerte-manette/alerte-manette.yml, et ce script en fait la copie.
#
# Usage :
#   ./scripts/activer_alerte.sh          # copie la source vers .github/workflows/
#   ./scripts/activer_alerte.sh --etat   # dit seulement si l'alerte est active
#
# Ensuite : git add .github/workflows/alerte-manette.yml && git commit && git push
# (puis fusion sur main — les tâches planifiées ne tournent que depuis main).
set -euo pipefail

cd "$(dirname "$0")/.."

source_alerte="outils/alerte-manette/alerte-manette.yml"
cible=".github/workflows/alerte-manette.yml"

if [ "${1:-}" = "--etat" ]; then
  if [ -f "$cible" ]; then
    echo "Alerte active : $cible présent."
  else
    echo "Alerte INACTIVE : $cible absent. Lancez ./scripts/activer_alerte.sh puis publiez."
  fi
  exit 0
fi

if [ ! -f "$source_alerte" ]; then
  echo "Source introuvable : $source_alerte" >&2
  exit 1
fi

mkdir -p "$(dirname "$cible")"
cp "$source_alerte" "$cible"
echo "Alerte copiée dans $cible."
echo "Il reste à la publier :"
echo "  git add $cible && git commit -m \"Active l'alerte manette\" && git push"
