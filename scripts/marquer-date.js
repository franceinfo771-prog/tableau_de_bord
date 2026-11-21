#!/usr/bin/env node
/**
 * Met la date du jour dans projets.json (champ `version`).
 *
 * Un chiffre écrit à la main dans une page ne se met jamais à jour : la page
 * affichait « État au 19 novembre » le 21, et « six projets » quand il y en
 * avait huit. La date est donc lue dans les données, et c'est ce script qui la
 * tient à jour — lancé à chaque fois que le contenu change.
 *
 * Usage : node scripts/marquer-date.js
 */
const fs = require('fs');
const path = require('path');
const FICHIER = path.join(__dirname, '..', 'projets.json');

const donnees = JSON.parse(fs.readFileSync(FICHIER, 'utf8'));
const jour = new Date().toISOString().slice(0, 10);
const avant = donnees.version;
donnees.version = jour;
fs.writeFileSync(FICHIER, JSON.stringify(donnees, null, 2) + '\n', 'utf8');
console.log('projets.json : version ' + avant + ' -> ' + jour);
