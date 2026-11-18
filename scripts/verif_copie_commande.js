/* Vérifie le bouton « Copier » du premier message destiné à Arena.
 * Le bloc d’installation du chat local n’existe plus sur cette page.
 * Usage : node scripts/verif_copie_commande.js
 */

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const RACINE = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf-8');

const vc = new VirtualConsole();
vc.on('jsdomError', () => {});
vc.on('error', () => {});

let ko = 0;
let ok = 0;
function verifie(cond, libelle) {
  if (cond) { console.log('  OK   ' + libelle); ok++; }
  else { console.log('  ECHEC ' + libelle); ko++; }
}

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'https://franceinfo771-prog.github.io/tableau_de_bord/',
  virtualConsole: vc,
});

const { window } = dom;
const doc = window.document;

// On simule le presse-papiers : le navigateur moderne expose
// navigator.clipboard.writeText, que le jsdom ne fournit pas.
let presse = '';
Object.defineProperty(window.navigator, 'clipboard', {
  configurable: true,
  value: {
    writeText: (t) => { presse = t; return Promise.resolve(); },
  },
});

setTimeout(() => {
  const btn = doc.getElementById('arena-copy');
  const message = doc.getElementById('arena-prompt');
  verifie(!doc.getElementById('ia-cmd-copy'), 'aucun bouton de copie pour le chat retiré');
  verifie(!!(btn && message), 'le bouton et le premier message pour Arena existent');
  if(btn) btn.click();

  setTimeout(() => {
    verifie(!!presse && !!message && presse === message.textContent.trim(), 'le premier message est copié sans modification');
    verifie(!!btn && btn.textContent.includes('Copié'), 'le bouton confirme la copie');
    dom.window.close();
    console.log(ko === 0 ? ('  ' + ok + ' vérifications réussies') : ('  ' + ko + ' échec(s)'));
    process.exit(ko === 0 ? 0 : 1);
  }, 120);
}, 300);
