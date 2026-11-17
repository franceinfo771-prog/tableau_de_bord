/* Rendu headless du tableau de bord — exigé par ASSISTANT.md avant fusion.
 *
 *   node scripts/verif_rendu.js
 *
 * Vérifie : 0 erreur JS, le bon nombre de cartes de projets et de fiches
 * de veille, les boutons intacts, et la présence de la zone « IA privée ».
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

  console.log('== 4. zone « IA privée » ==');
  verifie(!!doc.getElementById('ia-privee'), 'section #ia-privee presente');
  verifie(!!doc.getElementById('ia-url'), 'champ adresse present');
  verifie(!!doc.getElementById('ia-token'), 'champ jeton present');
  verifie(!!doc.getElementById('ia-send'), 'bouton envoyer present');
  verifie(!!doc.getElementById('ia-log'), 'zone de messages presente');
  const navIa = Array.from(doc.querySelectorAll('.navlinks a'))
    .some(a => (a.getAttribute('href') || '') === '#ia-privee');
  verifie(navIa, 'lien de navigation vers la zone IA privee');

  console.log('== 4b. bloc d\'installation du pont ==');
  verifie(!!doc.getElementById('ia-install'), 'bloc #ia-install present');
  verifie(!!doc.getElementById('ia-cmd-text'), 'commande affichee dans la page');
  verifie(!!doc.getElementById('ia-cmd-copy'), 'bouton copier la commande present');
  const cmd = (doc.getElementById('ia-cmd-text') || {textContent: ''}).textContent.trim();
  verifie(cmd.startsWith('irm https://raw.githubusercontent.com/'), 'commande au bon format');
  verifie(cmd.includes('/pont/pont-outils/INSTALLER.ps1 | iex'), 'commande pointe vers INSTALLER.ps1');
  // La commande du site doit etre exactement celle publiee sur la branche pont.
  verifie(cmd === 'irm https://raw.githubusercontent.com/franceinfo771-prog/tableau_de_bord/pont/pont-outils/INSTALLER.ps1 | iex',
          'commande identique a celle publiee');

  console.log('== 5. aucune fuite de secret dans la page ==');
  const corps = doc.body.innerHTML;
  verifie(!/ghp_[A-Za-z0-9]{20,}/.test(corps), 'aucun jeton GitHub dans la page');
  verifie(!/github_pat_[A-Za-z0-9_]{20,}/.test(corps), 'aucun jeton fin-grained dans la page');
  verifie(!/lm-[A-Za-z0-9]{20,}/.test(corps), 'aucun jeton LM Studio dans la page');

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
