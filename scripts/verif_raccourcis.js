#!/usr/bin/env node
/**
 * Les deux raccourcis du Bureau.
 *
 * Le 21/11/2026, l'humain a demandé « un raccourci sur le tableau de bord à jour,
 * un autre sur une IA locale — mes idées en place ». Le vieux `RECUPERER-PAGE.bat`
 * avait échoué deux fois : fins de ligne cassées (`\r\r\n`), et il ne téléchargeait
 * que la page, pas la fiche.
 *
 * Ce contrôle vérifie ce qui a causé ces échecs, pour qu'ils ne reviennent pas.
 *
 * Usage : node scripts/verif_raccourcis.js
 */
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..');
const DOSSIER = path.join(RACINE, 'pont-outils', 'raccourcis');

let ok = 0; const echecs = [];
function verifie(cond, libelle, detail) {
  if (cond) { ok++; console.log('  OK   ' + libelle); }
  else { echecs.push(libelle); console.log('  ECHEC ' + libelle + (detail ? ' -> ' + detail : '')); }
}

console.log('== 1. les trois fichiers sont là ==');
for (const f of ['INSTALLER.bat', '1-TABLEAU-DE-BORD.bat', '2-IA-LOCALE.bat', 'LISEZ-MOI.md']) {
  verifie(fs.existsSync(path.join(DOSSIER, f)), f + ' existe');
}

console.log('== 2. les fins de ligne ne sont plus cassées ==');
// C'est la panne exacte de l'ancien script : des \r\r\n.
for (const f of ['INSTALLER.bat', '1-TABLEAU-DE-BORD.bat', '2-IA-LOCALE.bat']) {
  const brut = fs.readFileSync(path.join(DOSSIER, f));
  const cassees = brut.toString('binary').split('\r\r\n').length - 1;
  verifie(cassees === 0, f + ' : aucune fin de ligne cassée', String(cassees));
  verifie(brut.includes('\r\n'), f + ' : fins de ligne Windows (CRLF)');
}

console.log('== 3. les .bat restent en ASCII ==');
// Un .bat avec des accents s'affiche mal dans la console Windows (cp850).
for (const f of ['INSTALLER.bat', '1-TABLEAU-DE-BORD.bat', '2-IA-LOCALE.bat']) {
  const texte = fs.readFileSync(path.join(DOSSIER, f), 'latin1');
  verifie(/^[\x00-\x7F]*$/.test(texte), f + ' : 100 % ASCII');
}

console.log("== 4. l'IA locale télécharge la page ET sa fiche ==");
const ia = fs.readFileSync(path.join(DOSSIER, '2-IA-LOCALE.bat'), 'utf8');
verifie(/chat\.html/.test(ia), 'le script demande chat.html');
verifie(/fiche\.txt/.test(ia), 'le script demande fiche.txt');
verifie(/LOCALAPPDATA/.test(ia), 'les fichiers vont dans LOCALAPPDATA, pas sur le Bureau');
verifie(!/Desktop/.test(ia), 'le script n\u2019écrit plus sur le Bureau (source de la confusion)');

console.log('== 5. le tableau n\u2019a rien à télécharger ==');
const tableau = fs.readFileSync(path.join(DOSSIER, '1-TABLEAU-DE-BORD.bat'), 'utf8');
verifie(/franceinfo771-prog\.github\.io\/tableau_de_bord/.test(tableau), 'il ouvre la bonne adresse');
verifie(!/Invoke-WebRequest .*OutFile/.test(tableau), 'il ne télécharge aucun fichier');

console.log("== 6. l'ancien script ne peut plus nuire ==");
verifie(!fs.existsSync(path.join(RACINE, 'pont-outils', 'RECUPERER-PAGE.bat')),
        'RECUPERER-PAGE.bat est supprimé');
const lisezMoiPont = fs.readFileSync(path.join(RACINE, 'pont-outils', 'LISEZ-MOI.md'), 'utf8');
verifie(/INSTALLER\.bat/.test(lisezMoiPont), 'le LISEZ-MOI du pont-outils renvoie vers INSTALLER.bat');

console.log("== 7. la page sait lire une fiche posée à côté ==");
const chat = fs.readFileSync(path.join(RACINE, 'pont-outils', 'chat.html'), 'utf8');
verifie(/fetch\("fiche\.txt"/.test(chat), 'chat.html tente fiche.txt quand la fiche intégrée est vide');

console.log('\n' + (echecs.length === 0 ? ok + ' vérifications réussies'
  : ok + ' ok, ' + echecs.length + ' ECHEC(S)'));
process.exit(echecs.length === 0 ? 0 : 1);
