/* Vérifie le bouton « Sauvegarder » du tableau de bord, en conditions réelles (jsdom) :
 * la fenêtre s'ouvre, l'export produit un JSON complet, l'import le relit,
 * le résumé texte se copie, et la réinitialisation ramène aux données publiées.
 *
 *   node scripts/verif_sauvegarde.js
 */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const RACINE = path.join(__dirname, '..');
const PAGE = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf8');

let ok = 0, ko = 0;
function verifie(cond, libelle, detail) {
  if (cond) { ok++; console.log('  OK   ' + libelle); }
  else { ko++; console.log('  ECHEC ' + libelle + (detail ? ' -> ' + detail : '')); }
}

const erreurs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => erreurs.push(String(e.message || e)));

// On capture ce que la page fabrique : le fichier exporté et le presse-papiers.
let fichier = null;
let presse = '';
const dom = new JSDOM(PAGE, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'https://exemple.test/tableau/',
  virtualConsole: vc,
  beforeParse(w) {
    w.fetch = async () => ({ ok: false, json: async () => ({}) });
    w.HTMLElement.prototype.scrollIntoView = function () {};
    // URL.createObjectURL : on récupère le Blob au lieu de télécharger.
    w.URL.createObjectURL = (blob) => { fichier = blob; return 'blob:test'; };
    w.URL.revokeObjectURL = () => {};
    // Le clic sur le lien de téléchargement ne doit rien faire de réel.
    const clicOrigine = w.HTMLAnchorElement.prototype.click;
    w.HTMLAnchorElement.prototype.click = function () {
      if (this.download) return;            // téléchargement : avalé
      return clicOrigine.apply(this, arguments);
    };
    Object.defineProperty(w.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: (t) => { presse = t; return Promise.resolve(); } },
    });
    w.confirm = () => true;
  },
});

setTimeout(async () => {
  const doc = dom.window.document;

  console.log('== 1. le bouton ouvre la fenêtre ==');
  const bouton = doc.getElementById('btn-data');
  verifie(!!bouton, 'le bouton « Sauvegarder » est présent');
  bouton.click();
  await new Promise(r => setTimeout(r, 150));
  verifie(doc.getElementById('modal-data').classList.contains('on'),
    'la fenêtre Sauvegarde et outils s’ouvre', doc.getElementById('modal-data').className);
  verifie(erreurs.length === 0, 'aucune erreur JS à l’ouverture', erreurs.slice(0, 2).join(' | '));

  console.log('== 2. l’export produit un JSON exploitable ==');
  doc.getElementById('m-export').click();
  await new Promise(r => setTimeout(r, 150));
  verifie(!!fichier, 'un fichier est bien fabriqué');
  let donnees = null;
  if (fichier) {
    const texte = await fichier.text();
    try { donnees = JSON.parse(texte); } catch (e) {}
    verifie(!!donnees, 'le fichier est du JSON valide');
    const NB_ATTENDUS = JSON.parse(fs.readFileSync(path.join(RACINE,'projets.json'),'utf8')).projets.length;
    verifie(donnees && Array.isArray(donnees.projets) && donnees.projets.length === NB_ATTENDUS,
      'il contient les ' + donnees.projets.length + ' projets', donnees ? String(donnees.projets.length) : '');
    verifie(donnees && Array.isArray(donnees.veille) && donnees.veille.length === 14,
      'il contient les quatorze recherches de veille', donnees ? String(donnees.veille.length) : '');
    verifie(donnees && Array.isArray(donnees.condense) && donnees.condense.length > 0,
      'il contient le condensé');
    const etapes = donnees ? donnees.projets.flatMap(p => p.etapes || []) : [];
    const attendues = JSON.parse(fs.readFileSync(path.join(RACINE,'projets.json'),'utf8'))
            .projets.reduce((n,p) => n + p.etapes.length, 0);
    verifie(etapes.length === attendues, 'les ' + attendues + ' étapes sont là', String(etapes.length));
    verifie(fichier.type === 'application/json' || /json/.test(fichier.type || ''),
      'le type du fichier est du JSON', fichier.type);
  }

  console.log('== 3. l’import relit ce qu’on vient d’exporter ==');
  // On simule un fichier choisi dans le sélecteur.
  if (donnees) {
    const fichierJson = new dom.window.File([JSON.stringify(donnees)], 'sauvegarde.json',
      { type: 'application/json' });
    const input = doc.getElementById('m-import-file');
    Object.defineProperty(input, 'files', { configurable: true, value: [fichierJson] });
    input.dispatchEvent(new dom.window.Event('change'));
    await new Promise(r => setTimeout(r, 250));
    verifie(doc.querySelectorAll('.p').length === donnees.projets.length, 'après import, les ' + donnees.projets.length + ' cartes sont rendues',
      String(doc.querySelectorAll('.p').length));
    verifie(erreurs.length === 0, 'aucune erreur JS à l’import', erreurs.slice(0, 2).join(' | '));
  }

  console.log('== 4. le résumé texte se copie ==');
  doc.getElementById('m-copy').click();
  await new Promise(r => setTimeout(r, 150));
  verifie(presse.includes('TABLEAU DE BORD'), 'le résumé commence par son titre');
  verifie(presse.includes('points ouverts') || presse.includes('Prochaine') || presse.split('\n').length > 6,
    'le résumé contient les projets', String(presse.split('\n').length) + ' lignes');

  console.log('== 5. la réinitialisation ramène à la référence ==');
  doc.getElementById('m-reset').click();
  await new Promise(r => setTimeout(r, 200));
  verifie(!doc.getElementById('modal-data').classList.contains('on'),
    'la fenêtre se referme après réinitialisation');
  verifie(erreurs.length === 0, 'aucune erreur JS à la réinitialisation', erreurs.slice(0, 2).join(' | '));

  console.log('== 6. la sauvegarde ne dépend pas de la publication ==');
  // On a retiré la barre GitHub : la sauvegarde doit rester entièrement locale.
  verifie(!/Enregistrer sur GitHub/.test(doc.body.innerHTML),
    'aucune mention de publication dans la fenêtre');
  verifie(!doc.querySelector('#modal-github'), 'aucune fenêtre de réglage de clé');
  const source = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf8');
  const blocExport = source.slice(source.indexOf("function exportJSON"), source.indexOf("function exportJSON") + 900);
  verifie(!/github|token|fetch\(/i.test(blocExport),
    'l’export n’appelle ni le réseau ni une clé');

  dom.window.close();
  console.log('\n' + (ko === 0 ? ok + ' vérifications réussies' : ok + ' ok, ' + ko + ' ECHEC(S)'));
  process.exit(ko === 0 ? 0 : 1);
}, 1200);
