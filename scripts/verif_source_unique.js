#!/usr/bin/env node
/**
 * Une seule source de données : projets.json.
 *
 * Décidé le 21/11 après avoir constaté qu'une copie de secours intégrée à
 * index.html avait conservé une heure de relevé fausse pendant deux jours,
 * alors que le robot ne tournait pas du tout. Une copie ne se trompe jamais
 * toute seule : elle vieillit.
 *
 * Ce contrôle vérifie :
 *   - qu'aucune page ne contient de liste de projets en dur ;
 *   - que index.html affiche un avertissement quand projets.json manque ;
 *   - que le script de synchronisation n'existe plus (sinon il recréerait la copie).
 *
 * Usage : node scripts/verif_source_unique.js
 */
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..');
const lire = (f) => fs.readFileSync(path.join(RACINE, f), 'utf8');

let ok = 0; const echecs = [];
function verifie(cond, libelle, detail) {
  if (cond) ok++;
  else { echecs.push(libelle); console.log('  ECHEC ' + libelle + (detail ? ' -> ' + detail : '')); }
}

console.log('== 1. aucune copie des données dans les pages ==');
const pages = ['index.html', 'atelier.html', 'conversation.html'];
const marqueurs = [/const DEFAULT_DATA\s*=\s*\{/, /const BASE_DATA\s*=\s*\{\s*\n\s*version:/, /DEFAULT_DATA/];
for (const page of pages) {
  const texte = lire(page);
  for (const m of marqueurs) {
    verifie(!m.test(texte), 'pas de copie des données dans ' + page, String(m));
  }
}

console.log("== 2. la page dit quand les données manquent ==");
const index = lire('index.html');
verifie(index.includes('projets.json'), 'index.html nomme projets.json comme source');
verifie(/donnees-absentes/.test(index), "index.html a un avertissement « données absentes »");
verifie(/afficherAvertissementDonnees/.test(index), "l'avertissement est branché sur l'échec du chargement");
verifie(/AUCUNES_DONNEES/.test(index), 'le démarrage part de données vides, pas d’une copie');

console.log('== 3. le script qui maintenait la copie a disparu ==');
verifie(!fs.existsSync(path.join(RACINE, 'scripts', 'sync_donnees_embedded.py')),
        'scripts/sync_donnees_embedded.py est supprimé');
const readme = lire('README.md');
verifie(!/sync_donnees_embedded/.test(readme), 'le README ne propose plus de le lancer');

console.log('== 4. un seul endroit sert les données aux contrôles ==');
verifie(fs.existsSync(path.join(RACINE, 'scripts', 'aide-donnees.js')),
        'scripts/aide-donnees.js existe');
for (const f of ['verif_rendu.js', 'verif_ancre.js', 'verif_sauvegarde.js', 'verif_copie_commande.js']) {
  verifie(/aide-donnees/.test(lire(path.join('scripts', f))), f + ' passe par aide-donnees.js');
}

console.log('\n' + (echecs.length === 0 ? ok + ' vérifications réussies'
  : ok + ' ok, ' + echecs.length + ' ECHEC(S)'));
process.exit(echecs.length === 0 ? 0 : 1);
