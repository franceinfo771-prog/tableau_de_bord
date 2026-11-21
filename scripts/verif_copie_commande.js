/* Vérifie que le site ne raconte pas sa fabrication.
 *
 * Le tableau de bord est public : il ne doit exposer ni Arena, ni GitHub,
 * ni la procédure de publication, ni la moindre clé. Ce contrôle remplace
 * l'ancien « le bouton Copier pour Arena fonctionne » : le bloc a été retiré
 * volontairement, et rien ne doit le faire revenir sans qu'on le sache.
 *
 * Usage : node scripts/verif_copie_commande.js
 */

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const RACINE = path.join(__dirname, '..');
const PAGE = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf-8');

const vc = new VirtualConsole();
vc.on('jsdomError', () => {});
vc.on('error', () => {});

let ko = 0;
let ok = 0;
function verifie(cond, libelle, detail) {
  if (cond) { console.log('  OK   ' + libelle); ok++; }
  else { console.log('  ECHEC ' + libelle + (detail ? ' -> ' + detail : '')); ko++; }
}

const dom = new JSDOM(PAGE, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'https://exemple.test/tableau/',
  virtualConsole: vc,
  beforeParse(window) { window.fetch = require('./aide-donnees').fetchDeTest(); },
});

setTimeout(() => {
  const doc = dom.window.document;
  const corps = doc.body.innerHTML;

  console.log('== 1. aucun élément de fabrication dans la page ==');
  const interdits = [
    ['#arena-box, .arena-box', 'l’encadré « Mon assistant Arena »'],
    ['#arena-prompt, #arena-copy', 'le premier message à copier'],
    ['#btn-github-top, #btn-github-big', 'les boutons d’enregistrement'],
    ['#modal-github', 'la modale de réglage de la clé'],
    ['#btn-gh-setup', 'le lien vers le réglage de la clé'],
    ['#gh-pending-text, #gh-hint-text', 'les textes de statut de publication'],
  ];
  for (const [sel, quoi] of interdits) {
    verifie(!doc.querySelector(sel), 'absent : ' + quoi, sel);
  }

  console.log('== 2. aucun mot qui trahit l’outillage en façade ==');
  // On ne regarde QUE ce qui s'affiche à l'écran : on retire le contenu des
  // balises <script>/<style>, qui ne s'affichent jamais. L'outillage reste
  // dans le code (choix assumé : rien ne casse), mais il est muet.
  const visible = doc.body.cloneNode(true);
  visible.querySelectorAll('script, style, template').forEach(n => n.remove());
  const texte = visible.textContent;
  verifie(!/arena/i.test(texte), 'aucune mention d’Arena dans le texte affiché');
  verifie(!/github/i.test(texte), 'aucune mention de GitHub dans le texte affiché');
  verifie(!/fine-grained|github_pat|ghp_/i.test(texte), 'aucune allusion à une clé de publication');
  // \b ne marche pas sur « prête » en français : on cible des tournures entières.
  verifie(!/branche\s+main|pull request|\bPR\s*#|demande de fusion/i.test(texte),
    'aucune allusion à la procédure interne');

  console.log('== 2 bis. les autres pages publiques non plus ==');
  // conversation.html n'est PAS dans cette liste, et c'est volontaire : cette page
  // privée existe pour mener à la conversation — Arena est son sujet, pas une fuite
  // d'outillage. verif_porte.js la contrôle, elle, sur ce point précis.
  for (const f of ['atelier.html']) {
    const brut = fs.readFileSync(path.join(RACINE, f), 'utf-8');
    const sansScript = brut.replace(/<script[\s\S]*?<\/script>/gi, ' ')
                           .replace(/<style[\s\S]*?<\/style>/gi, ' ');
    const textes = sansScript.replace(/<[^>]+>/g, ' ');
    const mots = ['arena', 'github', 'fine-grained', 'github_pat'];
    const trouves = mots.filter(m => new RegExp(m, 'i').test(textes));
    verifie(trouves.length === 0, f + ' : aucun mot d’outillage', trouves.join(', '));
  }

  console.log('== 2 ter. le site ne donne pas d’ordres ==');
  // Décision du 19/11 : le tableau suit le travail, il ne le réclame pas.
  // Ces tournures transformaient le suivi en contrainte.
  const ordres = [
    [/à faire maintenant/i, '« À faire maintenant »'],
    [/la seule chose à faire/i, '« la seule chose à faire »'],
    [/cochez les étapes/i, '« cochez les étapes »'],
    [/vous pouvez cocher/i, '« vous pouvez cocher »'],
  ];
  const visibles = (() => {
    const v = doc.body.cloneNode(true);
    v.querySelectorAll('script, style, template').forEach(n => n.remove());
    return v.textContent;
  })();
  for (const [re, quoi] of ordres) {
    verifie(!re.test(visibles), 'plus d’injonction : ' + quoi);
  }
  verifie(/suit, il ne commande pas/i.test(visibles),
    'la règle est dite en clair : le tableau suit, il ne commande pas');

  console.log('== 3. aucune fuite de secret dans la page ==');
  verifie(!/ghp_[A-Za-z0-9]{20,}/.test(corps), 'aucun jeton GitHub dans la page');
  verifie(!/github_pat_[A-Za-z0-9_]{20,}/.test(corps), 'aucun jeton fine-grained dans la page');
  verifie(!/lm-[A-Za-z0-9]{20,}/.test(corps), 'aucun jeton LM Studio dans la page');

  console.log('== 4. le site reste utilisable et honnête ==');
  verifie(!!doc.getElementById('btn-corriger'), 'le bouton Corriger est toujours là');
  verifie(!doc.getElementById('btn-data'), 'le bouton Sauvegarder ne revient pas');
  verifie(!!doc.getElementById('btn-print'), 'le bouton Imprimer est toujours là');
  const NB = JSON.parse(fs.readFileSync(path.join(RACINE,'projets.json'),'utf8')).projets.length;
  verifie(doc.querySelectorAll('.p').length === NB, 'les ' + NB + ' cartes de projets sont là',
    String(doc.querySelectorAll('.p').length));
  const noteCorriger = doc.getElementById('corriger-overlay');
  verifie(!noteCorriger || !/github/i.test(noteCorriger.textContent),
    'la fenêtre Corriger ne renvoie plus vers une publication');

  dom.window.close();
  console.log(ko === 0 ? ('\n' + ok + ' vérifications réussies')
                      : ('\n' + ok + ' ok, ' + ko + ' ECHEC(S)'));
  process.exit(ko === 0 ? 0 : 1);
}, 500);
