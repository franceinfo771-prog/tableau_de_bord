/* La rubrique « L'IA locale » du tableau de bord.
 *
 *   node scripts/verif_ia_locale.js
 *
 * La rubrique est une FICHE D'ÉTAT, pas un chat : elle dit où en est la
 * machine qui doit faire tourner le modèle, et par où on la joint. Ce
 * contrôle garantit trois choses :
 *
 *   1. elle existe, s'affiche, et ses chiffres viennent de projets.json ;
 *   2. elle ne peut pas devenir un chat par accident — aucun champ de
 *      saisie, aucun bouton d'envoi, aucune adresse http:// (qu'une page
 *      HTTPS ne pourrait de toute façon pas appeler) ;
 *   3. elle ne trahit pas la fabrication du site et ne donne pas d'ordre.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const RACINE = path.join(__dirname, '..');
const page = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf8');
const donnees = JSON.parse(fs.readFileSync(path.join(RACINE, 'projets.json'), 'utf8'));

let ok = 0, ko = 0;
function verifie(cond, libelle, detail) {
  if (cond) { ok++; console.log('  OK   ' + libelle); }
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
  beforeParse(w) { w.fetch = async () => ({ ok: false, json: async () => ({}) }); },
});

setTimeout(() => {
  const doc = dom.window.document;
  const zone = doc.getElementById('ia-locale-zone');
  const projet = donnees.projets.find(p => p.id === 'ia-decouverte');

  console.log('== 1. la rubrique existe et se rend ==');
  verifie(erreurs.length === 0, 'aucune erreur JS', erreurs.slice(0, 3).join(' | '));
  verifie(!!doc.getElementById('ia-locale'), 'titre de section #ia-locale');
  verifie(!!doc.querySelector('a[href="#ia-locale"]'), 'lien « IA locale » dans la barre de navigation');
  verifie(!!zone && zone.children.length === 1, 'une carte rendue dans #ia-locale-zone');
  verifie(/L'IA privée, sur la machine de la maison/.test(zone.textContent), 'titre de la fiche');

  console.log('== 2. les chiffres viennent de projets.json ==');
  const etapes = projet.etapes;
  const faites = etapes.filter(e => e.ok).length;
  const badge = zone.querySelector('.ia-etat');
  verifie(!!badge && badge.textContent === faites + ' / ' + etapes.length + ' étapes',
    'compteur fidèle au projet (' + faites + ' / ' + etapes.length + ')',
    badge && badge.textContent);
  const prochaine = etapes.find(e => !e.ok);
  verifie(!prochaine || zone.textContent.includes(prochaine.t),
    "l'étape qui bloque est nommée");

  console.log('== 3. ce qu\'elle dit de concret ==');
  for (const [quoi, motif] of [
    ['la machine (ASUS)', /ASUS/],
    ['l\'outil retenu (LM Studio)', /LM Studio/],
    ['le modèle pas encore choisi', /Pas encore choisi/],
    ['par où on la joint', /pont/i],
    ['les trois niveaux', /Trois niveaux|trois niveaux/],
    ['le point ouvert du projet', /point ouvert/i],
  ]) {
    verifie(motif.test(zone.textContent), 'mentionne ' + quoi);
  }

  console.log('== 4. ce n\'est pas un chat (et ça ne peut pas le devenir) ==');
  verifie(zone.querySelectorAll('input, textarea, select, button').length === 0,
    'aucun champ de saisie ni bouton dans la fiche',
    zone.querySelectorAll('input, textarea, select, button').length + ' trouvé(s)');
  verifie(!/http:\/\//i.test(zone.innerHTML), 'aucune adresse http:// dans la fiche');
  verifie(!/127\.0\.0\.1|192\.168\./.test(zone.innerHTML),
    'aucune adresse de réseau local écrite en dur');
  verifie(!/fetch\(|XMLHttpRequest|WebSocket|EventSource/.test(page.slice(page.indexOf("function renderIALocale"), page.indexOf("function renderAll"))),
    'le code de la fiche n\'ouvre aucune connexion');
  verifie(!/#ia-privee|ia-chat|ia-send|ia-token|ia-url/.test(page), 'aucun vestige de l\'ancien chat local');

  console.log('== 5. la façade reste propre ==');
  const visible = doc.body.cloneNode(true);
  visible.querySelectorAll('script, style, template').forEach(n => n.remove());
  const texte = visible.textContent;
  verifie(!/arena/i.test(texte), 'aucune mention d\'Arena à l\'écran');
  verifie(!/github/i.test(texte), 'aucune mention de GitHub à l\'écran');

  console.log('== 6. elle ne donne pas d\'ordre ==');
  const fiche = zone.textContent;
  for (const tournure of [/à faire maintenant/i, /il faut/i, /vous devez/i, /cochez/i, /la seule chose à faire/i]) {
    verifie(!tournure.test(fiche), 'pas de tournure d\'injonction : ' + tournure);
  }
  verifie(/ne se connecte à rien/.test(fiche), 'dit franchement ce qu\'elle ne fait pas');

  dom.window.close();
  console.log('');
  console.log(ko === 0 ? ('  ' + ok + ' vérifications réussies')
                       : ('  ' + ok + ' ok, ' + ko + ' ECHEC(S)'));
  process.exit(ko === 0 ? 0 : 1);
}, 900);
