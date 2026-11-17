/* Verifie que le bouton "Copier la commande" met bien la commande dans
 * le presse-papiers, et que le bloc s'ouvre bien au clic.
 *
 *   node scripts/verif_copie_commande.js
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
  console.log('== bloc d\'installation du pont ==');
  const bloc = doc.getElementById('ia-install');
  const btn = doc.getElementById('ia-cmd-copy');
  const cmd = doc.getElementById('ia-cmd-text');

  verifie(!!bloc, 'le bloc existe');
  verifie(bloc.tagName === 'DETAILS', 'le bloc est un <details> repliable');
  verifie(!bloc.hasAttribute('open'), 'le bloc est replie au depart');

  console.log('== au clic sur le resume ==');
  bloc.querySelector('summary').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  verifie(bloc.hasAttribute('open'), 'le bloc s\'ouvre au clic');

  console.log('== au clic sur "Copier la commande" ==');
  btn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

  setTimeout(() => {
    verifie(presse === cmd.textContent.trim(), 'la commande est dans le presse-papiers');
    verifie(presse.startsWith('irm https://raw.githubusercontent.com/'), 'le presse-papiers contient la bonne commande');
    verifie(btn.textContent.indexOf('Copié') !== -1, 'le bouton confirme la copie');

    console.log('== la commande copiee est-elle celle publiee ? ==');
    const attendue = 'irm https://raw.githubusercontent.com/franceinfo771-prog/tableau_de_bord/pont/pont-outils/INSTALLER.ps1 | iex';
    verifie(presse === attendue, 'commande identique a celle publiee sur la branche pont');

    dom.window.close();
    console.log('');
    console.log(ko === 0 ? ('  ' + ok + ' verifications passees, aucune erreur')
                          : ('  ' + ok + ' ok, ' + ko + ' ECHEC(S)'));
    process.exit(ko === 0 ? 0 : 1);
  }, 120);
}, 900);
