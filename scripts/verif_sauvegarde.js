#!/usr/bin/env node
/**
 * Le bouton « Sauvegarder » ne doit pas revenir.
 *
 * Il a existé jusqu'au 21/11/2026 : il exportait un fichier .json que plus personne
 * ne lisait, et permettait de le réimporter. Il servait quand le site publiait
 * lui-même depuis le navigateur. Ce temps est fini — c'est la conversation qui
 * publie. Un bouton qui produit un fichier que personne n'ouvre est du décor,
 * et du décor sur une page publique, c'est un mensonge de plus.
 *
 * Ce contrôle remplace `verif_sauvegarde.js` (19 vérifications) qui testait
 * l'export, l'import et la réinitialisation d'une fenêtre désormais supprimée.
 *
 * Usage : node scripts/verif_sauvegarde.js
 */
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..');
const PAGE = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf8');

let ok = 0; const echecs = [];
function verifie(cond, libelle, detail) {
  if (cond) { ok++; console.log('  OK   ' + libelle); }
  else { echecs.push(libelle); console.log('  ECHEC ' + libelle + (detail ? ' -> ' + detail : '')); }
}

console.log('== 1. le bouton et sa fenêtre ont disparu ==');
for (const marqueur of ['id="btn-data"', 'modal-data', 'id="savebar"', 'id="sb-export"',
                        'id="m-export"', 'id="m-import-btn"', 'id="m-copy"', 'id="m-reset"']) {
  verifie(!PAGE.includes(marqueur), 'plus de ' + marqueur);
}

console.log('== 2. le code qui les faisait marcher est parti aussi ==');
for (const fn of ['exportJSON', 'resetState', 'openModal(\'modal-data\')']) {
  verifie(!PAGE.includes(fn), 'plus de ' + fn);
}

console.log('== 3. la page ne télécharge plus rien ==');
verifie(!/a\.download\s*=/.test(PAGE), 'aucun téléchargement déclenché par la page');
verifie(!/createObjectURL/.test(PAGE), 'aucun blob exporté');

console.log('== 4. la publication ne passe plus par le navigateur ==');
// L'outillage de publication (clé, envoi) vit encore dans le code, muet — choix de
// l'humain du 19/11 : rien ne casse, on peut revenir en arrière. Ce qui compte,
// c'est qu'il ne s'affiche pas : c'est `verif_copie_commande.js` qui le vérifie,
// sur le texte réellement visible. Ici, on contrôle seulement qu'aucun bouton
// visible ne mène à un envoi.
verifie(!/id="btn-publier"|id="btn-push"/.test(PAGE), 'aucun bouton de publication visible');

console.log('\n' + (echecs.length === 0 ? ok + ' vérifications réussies'
  : ok + ' ok, ' + echecs.length + ' ECHEC(S)'));
process.exit(echecs.length === 0 ? 0 : 1);
