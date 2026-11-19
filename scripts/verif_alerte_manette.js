/* Vérifie l'alerte « manette du vélo » : le module Python de veille de stock,
 * le fichier publié alerte-manette.json, et l'affichage dans le tableau de bord.
 *
 *   node scripts/verif_alerte_manette.js
 *
 * Trois parties :
 *   1. le module Python sait décider (rupture / disponible / inconnu) — hors ligne ;
 *   2. le fichier publié est cohérent (état, date, lien) ;
 *   3. la carte du projet vélo affiche l'alerte, et seulement elle.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { JSDOM, VirtualConsole } = require('jsdom');

const RACINE = path.join(__dirname, '..');
const MODULE = path.join(RACINE, 'scripts', 'verifier_manette.py');
const FICHIER = path.join(RACINE, 'alerte-manette.json');
const PAGE = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf8');
// La source du workflow vit dans outils/ : GitHub refuse que l'application de
// l'assistant écrive dans .github/workflows/. scripts/activer_alerte.sh copie.
const WORKFLOW = fs.readFileSync(
  path.join(RACINE, 'outils', 'alerte-manette', 'alerte-manette.yml'), 'utf8');
const ACTIVATION = path.join(RACINE, 'scripts', 'activer_alerte.sh');

let ok = 0;
let ko = 0;
function verifie(cond, libelle, detail) {
  if (cond) { ok++; console.log('  OK   ' + libelle); }
  else { ko++; console.log('  ECHEC ' + libelle + (detail ? ' -> ' + detail : '')); }
}

console.log('== 1. le module de vérification décide correctement (hors ligne) ==');
const essai = `
import importlib.util, json
spec = importlib.util.spec_from_file_location("vm", ${JSON.stringify(MODULE)})
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
html = lambda corps: "<html><body>" + "x" * 600 + corps + "</body></html>"
cas = {
  "rupture": (html('<button id="add-to-cart">Ajouter au panier</button><span>Rupture de stock</span>'), 200),
  "disponible": (html('<button id="add-to-cart">Ajouter au panier</button>'), 200),
  "inconnu_vide": ("", 200),
  "inconnu_503": (html('<button id="add-to-cart">x</button>'), 503),
  "inconnu_forme": (html('<p>Bonjour</p>'), 200),
}
print(json.dumps({k: m.analyser(h, c)[0] for k, (h, c) in cas.items()}))
`;
let verdicts = {};
try {
  verdicts = JSON.parse(execFileSync('python3', ['-c', essai], { encoding: 'utf8' }));
} catch (e) {
  verifie(false, 'le module Python se charge', String(e.stderr || e.message).slice(0, 200));
}
verifie(verdicts.rupture === 'rupture', 'une page « Rupture de stock » -> rupture', verdicts.rupture);
verifie(verdicts.disponible === 'disponible', 'une page avec panier et sans rupture -> disponible', verdicts.disponible);
verifie(verdicts.inconnu_vide === 'inconnu', 'une page vide -> inconnu (on ne conclut pas)', verdicts.inconnu_vide);
verifie(verdicts.inconnu_503 === 'inconnu', 'une erreur serveur -> inconnu', verdicts.inconnu_503);
verifie(verdicts.inconnu_forme === 'inconnu', 'une page sans marqueur -> inconnu', verdicts.inconnu_forme);
verifie(!/cryptography|requests|bs4|beautifulsoup|lxml/i.test(fs.readFileSync(MODULE, 'utf8')),
  'le module n\'a besoin d\'aucune dépendance extérieure');

console.log('\n== 2. le fichier publié est cohérent ==');
let alerte = null;
try {
  alerte = JSON.parse(fs.readFileSync(FICHIER, 'utf8'));
  verifie(true, 'alerte-manette.json est un JSON valide');
} catch (e) {
  verifie(false, 'alerte-manette.json est un JSON valide', e.message);
}
if (alerte) {
  verifie(['rupture', 'disponible', 'inconnu'].includes(alerte.etat), 'état parmi rupture / disponible / inconnu', alerte.etat);
  verifie(/^5F36POIGELTROT$/.test(alerte.reference || ''), 'la référence est celle de la poignée retenue', alerte.reference);
  verifie(/^https:\/\/www\.adreapocket\.com\//.test(alerte.url || ''), 'le lien mène bien à AdreaPocket', alerte.url);
  verifie(/13,99/.test(alerte.prix || ''), 'le prix relevé est 13,99 €', alerte.prix);
  verifie(/^\d{4}-\d{2}-\d{2}T/.test(alerte.verifie_le || ''), 'la date de relevé est renseignée', alerte.verifie_le);
  verifie(/^\d{4}-\d{2}-\d{2}$/.test(alerte.depuis || ''), 'la date « depuis » est renseignée', alerte.depuis);
  verifie(alerte.a_acheter === (alerte.etat === 'disponible'),
    'le drapeau « à acheter » suit l\'état', String(alerte.a_acheter));
}

console.log('\n== 3. le robot a un rendez-vous chaque matin ==');
verifie(/cron:\s*'20 6 \* \* \*'/.test(WORKFLOW), 'vérification quotidienne à 7 h 20 (Paris)');
verifie(/workflow_dispatch/.test(WORKFLOW), 'on peut le lancer à la main');
verifie(/scripts\/verifier_manette\.py/.test(WORKFLOW), 'le workflow utilise bien le module');
verifie(/contents:\s*write/.test(WORKFLOW), 'le workflow a le droit de publier le résultat');
verifie(/continue-on-error:\s*true/.test(WORKFLOW),
  'une panne de la boutique ne fait pas échouer la vérification');
verifie(/issues:\s*write/.test(WORKFLOW), 'le workflow peut ouvrir un ticket de rappel');
verifie(/gh issue create/.test(WORKFLOW) && /gh issue close/.test(WORKFLOW),
  'le ticket est ouvert en stock et refermé en rupture');
verifie(/--a-acheter/.test(WORKFLOW), 'le ticket se décide sur le module, pas sur un texte');

console.log('\n== 3 bis. la source peut être activée d\'un seul geste ==');
const activation = fs.existsSync(ACTIVATION) ? fs.readFileSync(ACTIVATION, 'utf8') : '';
verifie(activation !== '', 'scripts/activer_alerte.sh existe');
verifie(/outils\/alerte-manette\/alerte-manette\.yml/.test(activation),
  'il copie bien la source de outils/ vers .github/workflows/');
verifie(/\.github\/workflows\/alerte-manette\.yml/.test(activation),
  'la cible est .github/workflows/alerte-manette.yml');
// Copie réelle dans un dossier temporaire : la source doit arriver intacte.
const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'alerte-'));
try {
  fs.mkdirSync(path.join(tmp, 'outils', 'alerte-manette'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'scripts'), { recursive: true });
  fs.copyFileSync(path.join(RACINE, 'outils', 'alerte-manette', 'alerte-manette.yml'),
    path.join(tmp, 'outils', 'alerte-manette', 'alerte-manette.yml'));
  fs.copyFileSync(ACTIVATION, path.join(tmp, 'scripts', 'activer_alerte.sh'));
  execFileSync('bash', [path.join(tmp, 'scripts', 'activer_alerte.sh')], { encoding: 'utf8' });
  const copie = fs.readFileSync(path.join(tmp, '.github', 'workflows', 'alerte-manette.yml'), 'utf8');
  verifie(copie === WORKFLOW, 'le script copie le fichier à l\'identique');
} catch (e) {
  verifie(false, 'le script copie le fichier à l\'identique', String(e.message).slice(0, 160));
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

// Le drapeau --a-acheter doit suivre le fichier publié : 0 = à commander, 1 = non.
let code = 0;
try { execFileSync('python3', [MODULE, '--a-acheter'], { encoding: 'utf8' }); }
catch (e) { code = e.status; }
const attendu = alerte && alerte.a_acheter ? 0 : 1;
verifie(code === attendu, 'le drapeau « à acheter » suit l\'état publié',
  'code ' + code + ' au lieu de ' + attendu);

console.log('\n== 4. le tableau de bord affiche l\'alerte ==');
function chargerAvec(alerteFournie, options) {
  const erreurs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => erreurs.push(String(e.message || e)));
  vc.on('error', (...a) => erreurs.push(a.map(String).join(' ')));
  const dom = new JSDOM(PAGE, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'https://x.test/tableau_de_bord/',
    virtualConsole: vc,
    beforeParse(w) {
      w.HTMLElement.prototype.scrollIntoView = function () {};
      w.fetch = async (url) => {
        if ((options && options.panne) || !String(url).startsWith('alerte-manette.json')) {
          return { ok: false, json: async () => ({}) };
        }
        return { ok: true, json: async () => alerteFournie };
      };
    },
  });
  return { dom, erreurs };
}

(async () => {
  const { dom, erreurs } = chargerAvec(alerte);
  await new Promise(r => setTimeout(r, 800));
  const doc = dom.window.document;
  verifie(erreurs.length === 0, 'aucune erreur JS', erreurs.slice(0, 2).join(' | '));
  const bloc = doc.querySelector('#proj-velo .alerte-manette');
  verifie(!!bloc, 'l\'alerte apparaît sur la carte du vélo');
  if (bloc) {
    verifie(bloc.className.includes(alerte.etat === 'disponible' ? 'ok' : 'rupture'),
      'la couleur suit l\'état', bloc.className);
    verifie(bloc.textContent.includes('5F36POIGELTROT'), 'la référence est affichée');
    verifie(bloc.textContent.includes('13,99'), 'le prix est affiché');
    verifie(!!bloc.querySelector('a[href^="https://www.adreapocket.com/"]'),
      'un lien mène à la fiche de la boutique');
    verifie(bloc.querySelector('a').getAttribute('rel').includes('noopener'),
      'le lien externe est ouvert proprement');
  }
  verifie(!doc.querySelector('#proj-notes .alerte-manette'), 'aucune alerte sur les autres projets');
  dom.window.close();

  // Fichier injoignable : pas de faux voyant, et aucune erreur.
  const panne = chargerAvec(alerte, { panne: true });
  await new Promise(r => setTimeout(r, 600));
  verifie(panne.erreurs.length === 0, 'aucune erreur JS quand le fichier est injoignable',
    panne.erreurs.slice(0, 2).join(' | '));
  verifie(!panne.dom.window.document.querySelector('.alerte-manette'),
    'aucune alerte affichée quand le fichier est injoignable');
  panne.dom.window.close();

  console.log('\n' + (ko === 0 ? ok + ' vérifications réussies' : ok + ' ok, ' + ko + ' ECHEC(S)'));
  process.exit(ko === 0 ? 0 : 1);
})();
