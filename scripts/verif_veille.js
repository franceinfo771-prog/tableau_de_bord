#!/usr/bin/env node
/* Vérifie la page de veille « veille-supermimic.html » (le robot humanoïde).
   Aucun navigateur requis (jsdom).

   Ce qui compte : la page existe, elle est propre (noindex, aucune image
   externe, aucun script), ses liens internes mènent quelque part, elle est
   reliée au tableau de bord et à la page d'accueil, et les chiffres qu'elle
   annonce sont ceux des sources (pas d'arrondi flatteur).

   Usage : node scripts/verif_veille.js */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const RACINE = path.join(__dirname, '..');
const NOM = 'veille-supermimic.html';
const COURT = 'veille-supermimic-court.html';
const PAGE = fs.readFileSync(path.join(RACINE, NOM), 'utf8');
const PAGE_COURTE = fs.readFileSync(path.join(RACINE, COURT), 'utf8');
const INDEX = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf8');
const ACCUEIL = fs.readFileSync(path.join(RACINE, 'accueil.html'), 'utf8');

let ok = 0;
let ko = 0;
function verifie(cond, libelle, detail) {
  if (cond) { ok++; console.log('  OK   ' + libelle); }
  else { ko++; console.log('  ECHEC ' + libelle + (detail ? ' -> ' + detail : '')); }
}

const erreurs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => erreurs.push(String(e.message || e)));
vc.on('error', (...a) => erreurs.push(a.map(String).join(' ')));

const dom = new JSDOM(PAGE, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'https://x.test/tableau_de_bord/' + NOM,
  virtualConsole: vc,
});
const doc = dom.window.document;

console.log('== 1. la page est propre ==');
verifie(erreurs.length === 0, 'aucune erreur JS', erreurs.slice(0, 2).join(' | '));
verifie(doc.documentElement.lang === 'fr', 'page en français (lang="fr")');
verifie(doc.querySelectorAll('h1').length === 1, 'un seul titre h1');
verifie(!!doc.title && doc.title.length > 15, 'titre de page renseigné', doc.title);
const robots = doc.querySelector('meta[name="robots"]');
verifie(!!robots && /noindex/.test(robots.content), 'noindex présent');
verifie(!!doc.querySelector('meta[name="description"]'), 'description présente');
verifie(doc.querySelectorAll('script').length === 0, 'aucun script (page 100 % statique)',
  String(doc.querySelectorAll('script').length));
verifie(!/<iframe|<object|<embed/i.test(PAGE), 'aucun cadre ni objet embarqué');

console.log('\n== 2. rien ne vient de l\'extérieur (sauf les liens qu\'on clique) ==');
const images = [...doc.querySelectorAll('img')];
verifie(images.length >= 1, 'au moins une image', String(images.length));
const distantes = images.filter(i => /^(https?:)?\/\//.test(i.getAttribute('src') || ''));
verifie(distantes.length === 0, 'aucune image distante', distantes.map(i => i.src).join(' '));
const absentes = images.filter(i => {
  const src = (i.getAttribute('src') || '').split('?')[0];
  return src && !/^(https?:|data:)/.test(src) && !fs.existsSync(path.join(RACINE, src));
});
verifie(absentes.length === 0, 'chaque image existe dans le dépôt', absentes.map(i => i.getAttribute('src')).join(' '));
verifie(!/@import|fonts\.googleapis|<link[^>]+stylesheet/i.test(PAGE), 'aucune police ni feuille distante');

console.log('\n== 3. les liens ==');
for (const a of [...doc.querySelectorAll('a[href]')]) {
  const href = a.getAttribute('href');
  if (/^https?:/.test(href)) {
    verifie(!!a.getAttribute('rel') && /noopener/.test(a.getAttribute('rel')),
      'lien externe ouvert proprement : ' + href.replace(/^https?:\/\//, '').slice(0, 48));
    verifie(a.getAttribute('target') === '_blank', 'lien externe dans un nouvel onglet : ' + href.replace(/^https?:\/\//, '').slice(0, 40));
  } else if (/^#/.test(href)) {
    verifie(!!doc.getElementById(href.slice(1)), 'ancre interne valide : ' + href);
  } else {
    verifie(fs.existsSync(path.join(RACINE, href.split('#')[0])), 'page du dépôt existante : ' + href);
  }
}
const domaines = [...new Set([...doc.querySelectorAll('a[href^="http"]')]
  .map(a => new URL(a.getAttribute('href')).hostname))].sort();
verifie(domaines.every(d => /(^|\.)supermimic\.github\.io$|(^|\.)github\.com$|(^|\.)arxiv\.org$|(^|\.)commons\.wikimedia\.org$/.test(d)),
  'tous les liens externes vont aux sources (projet, article, code, photo)', domaines.join(', '));

console.log('\n== 4. les chiffres sont ceux des sources ==');
const texte = doc.body.textContent.replace(/\s+/g, ' ');
for (const attendu of ['3 h', '1000', '129 514', '21 000', '179', '9,8', 'CoRL']) {
  verifie(texte.includes(attendu), 'chiffre annoncé présent : ' + attendu);
}
verifie(/licence Apache 2\.0/i.test(texte) || /Apache 2\.0/.test(texte), 'la licence du code est dite (Apache 2.0)');
verifie(/propriétaire/i.test(texte), 'la licence de la démo est dite (propriétaire)');
const legende = doc.querySelector('.legende').textContent.replace(/\s+/g, ' ');
verifie(/Unitree G1/.test(legende), 'la légende nomme le robot (Unitree G1)');
verifie(/CC0|domaine public/i.test(legende), 'la légende donne la licence de la photo (CC0 / domaine public)');
verifie(/Sayanesy/.test(legende), 'la légende crédite l\'auteur de la photo');
verifie(/commons\.wikimedia\.org/.test(PAGE), 'la page donne le lien vers le fichier d\'origine');
verifie(/pas une image du projet/i.test(PAGE), 'la page précise que ce n\'est pas une image du projet');

console.log('\n== 5. la page est reliée au reste du site ==');
verifie(/href="veille-supermimic\.html"/.test(INDEX), 'index.html renvoie vers la page');
verifie(/href="veille-supermimic\.html"/.test(ACCUEIL), 'accueil.html renvoie vers la page');
verifie(/href="index\.html/.test(PAGE), 'la page renvoie vers le tableau de bord');
verifie(/index\.html#proj-ia-decouverte/.test(PAGE), 'la page est rattachée au projet « Découverte de logiciels IA »');
const donnees = JSON.parse(fs.readFileSync(path.join(RACINE, 'projets.json'), 'utf8'));
const ia = donnees.projets.find(p => p.id === 'ia-decouverte');
verifie(!!ia && ia.etapes.some(e => /SuperMimic/.test(e.t)),
  'l\'étape correspondante existe dans projets.json');
verifie(donnees.veille.some(v => /SuperMimic/.test(v.t)),
  'la recherche correspondante est consignée dans la veille');

dom.window.close();

// ------------------------------------------------------------------
// La version courte : même vigilance, mais sur une page d'une minute.
// ------------------------------------------------------------------
console.log('\n== 6. ' + COURT + ' (une minute) ==');
const erreursC = [];
const vcC = new VirtualConsole();
vcC.on('jsdomError', e => erreursC.push(String(e.message || e)));
vcC.on('error', (...a) => erreursC.push(a.map(String).join(' ')));
const domC = new JSDOM(PAGE_COURTE, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'https://x.test/tableau_de_bord/' + COURT,
  virtualConsole: vcC,
});
const docC = domC.window.document;
verifie(erreursC.length === 0, 'aucune erreur JS', erreursC.slice(0, 2).join(' | '));
verifie(docC.documentElement.lang === 'fr', 'page en français');
verifie(docC.querySelectorAll('h1').length === 1, 'un seul titre h1');
verifie(!!docC.title && docC.title.length > 15, 'titre de page renseigné', docC.title);
verifie(/noindex/.test((docC.querySelector('meta[name="robots"]') || {}).content || ''), 'noindex présent');
verifie(docC.querySelectorAll('script').length === 0, 'aucun script');
verifie(!/<iframe|<object|<embed/i.test(PAGE_COURTE), 'aucun cadre ni objet embarqué');
verifie(!/@import|fonts\.googleapis|<link[^>]+stylesheet/i.test(PAGE_COURTE), 'aucune police ni feuille distante');

const imgsC = [...docC.querySelectorAll('img')];
verifie(imgsC.every(i => {
  const src = (i.getAttribute('src') || '').split('?')[0];
  return src && !/^(https?:|\/\/)/.test(src) && fs.existsSync(path.join(RACINE, src));
}), 'les images sont locales et existent dans le dépôt', imgsC.map(i => i.getAttribute('src')).join(' '));

const cassesC = [];
for (const a of [...docC.querySelectorAll('a[href]')]) {
  const href = a.getAttribute('href');
  if (/^https?:/.test(href)) {
    if (!/noopener/.test(a.getAttribute('rel') || '') || a.getAttribute('target') !== '_blank') {
      cassesC.push('externe mal ouvert : ' + href);
    }
  } else if (/^#/.test(href)) {
    if (!docC.getElementById(href.slice(1))) cassesC.push('ancre morte : ' + href);
  } else if (!fs.existsSync(path.join(RACINE, href.split('#')[0]))) {
    cassesC.push('page absente : ' + href);
  }
}
verifie(cassesC.length === 0, 'tous les liens mènent quelque part', cassesC.slice(0, 3).join(' | '));
verifie(domainesC(docC).every(d => /(^|\.)supermimic\.github\.io$|(^|\.)github\.com$|(^|\.)arxiv\.org$|(^|\.)commons\.wikimedia\.org$/.test(d)),
  'les liens externes vont aux sources', domainesC(docC).join(', '));

function domainesC(d) {
  return [...new Set([...d.querySelectorAll('a[href^="http"]')].map(a => new URL(a.getAttribute('href')).hostname))].sort();
}

const texteC = docC.body.textContent.replace(/\s+/g, ' ');
verifie(/3 h/.test(texteC) && /1000/.test(texteC) && /129 514/.test(texteC),
  'les trois chiffres clés sont là');
verifie(/H100/.test(texteC), 'la carte professionnelle est nommée (H100)');
verifie(/Apache 2\.0/.test(texteC), 'la licence du code est dite');
verifie(/propriétaire/i.test(texteC), 'la licence de la démo est dite');
verifie(/Sayanesy|Wikimedia/.test(PAGE_COURTE), 'la photo est créditée');
verifie(/href="veille-supermimic\.html"/.test(PAGE_COURTE), 'la version courte renvoie à la version complète');
verifie(/href="veille-supermimic-court\.html"/.test(PAGE), 'la version complète renvoie à la version courte');
verifie(/href="veille-supermimic-court\.html"/.test(INDEX), 'le tableau de bord renvoie à la version courte');
verifie(/href="veille-supermimic-court\.html"/.test(ACCUEIL), 'la page d\'accueil renvoie à la version courte');
domC.window.close();

console.log('\n' + (ko === 0 ? ok + ' vérifications réussies' : ok + ' ok, ' + ko + ' ECHEC(S)'));
process.exit(ko === 0 ? 0 : 1);
