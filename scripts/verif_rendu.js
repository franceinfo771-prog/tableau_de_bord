/* Rendu headless du tableau de bord — exigé par ASSISTANT.md avant fusion.
 *
 *   node scripts/verif_rendu.js
 *
 * Vérifie : 0 erreur JS, le bon nombre de cartes de projets et de fiches
 * de veille, les boutons intacts, et l’absence de la zone « IA privée ».
 */

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const RACINE = path.join(__dirname, '..');
const page = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf8');
const donnees = JSON.parse(fs.readFileSync(path.join(RACINE, 'projets.json'), 'utf8'));

let ok = 0, ko = 0;
function verifie(condition, libelle, detail) {
  if (condition) { ok++; console.log('  OK   ' + libelle); }
  else { ko++; console.log('  ECHEC ' + libelle + (detail ? ' -> ' + detail : '')); }
}

const erreurs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => erreurs.push(String(e.message || e)));
vc.on('error', (...a) => erreurs.push(a.map(String).join(' ')));

const dom = new JSDOM(page, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'https://franceinfo771-prog.github.io/tableau_de_bord/',
  virtualConsole: vc,
});

const doc = dom.window.document;

// on laisse le script de demarrage s'executer
setTimeout(() => {
  console.log('== 1. erreurs JavaScript ==');
  verifie(erreurs.length === 0, 'aucune erreur JS', erreurs.slice(0, 3).join(' | '));

  console.log('== 2. contenu rendu ==');
  const cartes = doc.querySelectorAll('article.p');
  const fichesVeille = doc.querySelectorAll('#veille > *');
  const cartesProjet = cartes.length;

  verifie(cartesProjet === donnees.projets.length,
    'cartes de projets : ' + cartesProjet + ' (attendu ' + donnees.projets.length + ')');
  verifie(fichesVeille.length === donnees.veille.length,
    'fiches de veille : ' + fichesVeille.length + ' (attendu ' + donnees.veille.length + ')');

  console.log('== 3. boutons intacts ==');
  const attendus = ['btn-github-top', 'btn-github-big', 'btn-corriger', 'btn-top-add-proj',
                     'btn-print', 'btn-data', 'arena-copy', 'btn-gh-setup'];
  for (const id of attendus) {
    verifie(!!doc.getElementById(id), 'bouton #' + id);
  }

  console.log('== 4. retrait du chat local ; Arena reste accessible ==');
  verifie(!doc.querySelector('#ia-privee, #ia-install, #ia-cmd-copy, #ia-setup, #ia-url, #ia-token, #ia-chat, #ia-log, #ia-send'),
          'ni chat local, ni réglages, ni installation');
  verifie(!doc.querySelector('a[href="#ia-privee"]'), 'aucun lien vers la rubrique retirée');
  verifie(!!doc.querySelector('a.btn-arena[href="https://arena.ai/agent"]'), 'lien « Mon assistant Arena » présent');
  verifie(!doc.querySelector('#projects-list').textContent.includes('Mon IA privée'), 'aucune étape de branchement à la rubrique');

  console.log('== 5. aucune fuite de secret dans la page ==');
  const corps = doc.body.innerHTML;
  verifie(!/ghp_[A-Za-z0-9]{20,}/.test(corps), 'aucun jeton GitHub dans la page');
  verifie(!/github_pat_[A-Za-z0-9_]{20,}/.test(corps), 'aucun jeton fin-grained dans la page');
  verifie(!/lm-[A-Za-z0-9]{20,}/.test(corps), 'aucun jeton LM Studio dans la page');

  console.log('== 5 bis. alerte de la manette (fichier absent = pas de voyant) ==');
  verifie(!doc.querySelector('.alerte-manette'),
          'aucune alerte affichee quand alerte-manette.json est injoignable');

  console.log('== 6. donnees ==');
  const total = donnees.projets.reduce((n, p) => n + p.etapes.length, 0);
  const fait = donnees.projets.reduce((n, p) => n + p.etapes.filter(e => e.ok).length, 0);
  console.log('  etapes : ' + fait + '/' + total + ' (' + Math.round(100 * fait / total) + ' %)');

  dom.window.close();
  console.log('');
  console.log(ko === 0 ? ('  ' + ok + ' verifications passees, aucune erreur')
                        : ('  ' + ok + ' ok, ' + ko + ' ECHEC(S)'));
  process.exit(ko === 0 ? 0 : 1);
}, 900);
