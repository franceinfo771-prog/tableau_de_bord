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
  beforeParse(fenetre){ fenetre.fetch = require('./aide-donnees').fetchDeTest(); },
});


// rend la page avec un jeu de données donné, sans toucher au reste du contrôle
function rendre(donneesTest) {
  return new Promise(resolve => {
    const d = new JSDOM(page, {
      runScripts: 'dangerously', pretendToBeVisual: true,
      url: 'https://franceinfo771-prog.github.io/tableau_de_bord/',
      virtualConsole: new VirtualConsole(),
      beforeParse(fenetre) {
        fenetre.fetch = async (u) => String(u).includes('projets.json')
          ? { ok: true, status: 200, json: async () => donneesTest }
          : { ok: false, status: 404, json: async () => { throw new Error('404'); } };
      },
    });
    setTimeout(() => resolve(d), 900);
  });
}

const doc = dom.window.document;

// on laisse le script de demarrage s'executer
setTimeout(async () => {
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
  // « Sauvegarder » a été retiré le 21/11 : il exportait un fichier que plus
  // personne ne lit. Un contrôle doit vérifier ce qui DOIT être là, pas regretter
  // ce qui a été retiré exprès.
  const attendus = ['btn-corriger', 'btn-top-add-proj', 'btn-print'];
  verifie(!doc.getElementById('btn-data'), 'le bouton Sauvegarder ne revient pas');
  for (const id of attendus) {
    verifie(!!doc.getElementById(id), 'bouton #' + id);
  }

  console.log('== 4. le site ne montre pas sa fabrication ==');
  verifie(!doc.querySelector('#ia-privee, #ia-install, #ia-cmd-copy, #ia-setup, #ia-url, #ia-token, #ia-chat, #ia-log, #ia-send'),
          'ni chat local, ni réglages, ni installation');
  verifie(!doc.querySelector('a[href="#ia-privee"]'), 'aucun lien vers la rubrique retirée');
  // Retiré volontairement (19/11) : le public n'a pas à savoir avec quoi c'est fait.
  verifie(!doc.querySelector('a.btn-arena, .arena-box, #modal-github'), 'ni Arena, ni réglage GitHub en façade');
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

  // ── contrôle né de ce que l'humain a vu à l'écran le 21/11 :
  // « 8 projets suivis projets suivis au même endroit ». Le mot était à la fois
  // dans le texte statique et dans le span que le script remplit. On vérifie que
  // la phrase est complète avec 8 projets ET avec un seul, et qu'aucun mot ne
  // double dans la première phrase du chapô.
  console.log('== 7. le chapô ne bégaie pas ==');
  const phrase = (d) => (d.window.document.querySelector('.chapo').textContent || '')
    .replace(/\s+/g, ' ').trim();
  const complet = phrase(dom);
  verifie(!/\b(\w+)\s+\1\b/i.test(complet.split('.')[0]),
          'aucun mot doublé dans la première phrase', complet.slice(0, 60));
  verifie(/^\d+ projets? suivis?, au même endroit/.test(complet),
          'la phrase du chapô est complète', complet.slice(0, 60));
  dom.window.close();

  // et avec un seul projet, la phrase doit passer au singulier sans casser
  const un = JSON.parse(JSON.stringify(donnees));
  un.projets = [un.projets[0]];
  const domUn = await rendre(un);
  const phraseUn = phrase(domUn);
  verifie(/^Un projet suivi, au même endroit/.test(phraseUn),
          'un seul projet : la phrase passe au singulier', phraseUn.slice(0, 40));
  domUn.window.close();

  console.log(ko === 0 ? ('  ' + ok + ' vérifications passées, aucune erreur')
                       : ('  ' + ok + ' ok, ' + ko + ' ECHEC(S)'));
  process.exit(ko === 0 ? 0 : 1);
}, 900);
