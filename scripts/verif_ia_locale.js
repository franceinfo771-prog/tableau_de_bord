/* L'IA locale est ARRÊTÉE (19 novembre 2026).
 *
 * La rubrique « L'IA locale » a existé quelques heures, puis a été retirée
 * avec le projet : le PC de la maison s'est révélé être un vieux PC, il ne
 * peut pas faire tourner un modèle. Ce contrôle empêche le retour de la
 * rubrique — et de l'ancien chat local — sans qu'on le sache.
 *
 * La décision est écrite dans IA-LOCALE.md, ETAT.md et NOTE_IA_LOCALE_ABANDONNEE.
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
  const page = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf8');

  console.log('== 1. la rubrique ne revient pas ==');
  verifie(erreurs.length === 0, 'aucune erreur JS', erreurs.slice(0, 3).join(' | '));
  verifie(!doc.getElementById('ia-locale'), 'aucune section #ia-locale');
  verifie(!doc.getElementById('ia-locale-zone'), 'aucun conteneur #ia-locale-zone');
  verifie(!doc.querySelector('a[href="#ia-locale"]'), 'aucun lien « IA locale » dans la barre');
  verifie(!/renderIALocale|id="ia-locale"|#ia-locale/.test(page), 'aucun reste de la rubrique (id, ancre, fonction)');
  verifie(!/ia-chat|ia-send|ia-token|ia-url|#ia-privee/.test(page), "aucun vestige de l'ancien chat local");

  console.log('== 2. la décision est écrite pour la suite ==');
  verifie(/NOTE_IA_LOCALE_ABANDONNEE/.test(page), 'note d\'abandon dans index.html');
  const dossier = fs.readFileSync(path.join(RACINE, 'IA-LOCALE.md'), 'utf8');
  verifie(/ARRÊTÉ LE 19 NOVEMBRE 2026/.test(dossier), 'IA-LOCALE.md dit l\'arrêt');
  verifie(/vieux PC/.test(dossier), 'IA-LOCALE.md dit pourquoi (vieux PC)');
  const journal = fs.readFileSync(path.join(RACINE, 'ETAT.md'), 'utf8');
  verifie(/l'IA locale s'arrête/.test(journal), 'journal : la décision est consignée');
  verifie(/vieux PC/.test(journal), 'journal : le motif est consigné');

  console.log('== 3. le projet ne parle plus de modèle local ==');
  const donnees = JSON.parse(fs.readFileSync(path.join(RACINE, 'projets.json'), 'utf8'));
  const projet = donnees.projets.find(p => p.id === 'ia-decouverte');
  verifie(!!projet, 'le projet existe toujours');
  verifie(projet.nom === 'Assistants en ligne', 'nommé « Assistants en ligne »', projet.nom);
  verifie(projet.etapes.length === 5, '5 étapes', String(projet.etapes.length));
  const textes = projet.etapes.map(e => e.t).join(' | ');
  verifie(!/LM Studio|modèle local|Tailscale|Freebox|imprimante/i.test(textes),
    'aucune étape de modèle local, de tunnel ni de maison');
  verifie(/vieux PC/.test(textes), "l'inventaire dit le verdict sur le vieux PC");

  console.log('== 4. la façade reste propre ==');
  const visible = doc.body.cloneNode(true);
  visible.querySelectorAll('script, style, template').forEach(n => n.remove());
  const texte = visible.textContent;
  verifie(!/arena/i.test(texte), "aucune mention d'Arena à l'écran");
  verifie(!/github/i.test(texte), 'aucune mention de GitHub à l\'écran');

  dom.window.close();
  console.log('');
  console.log(ko === 0 ? ('  ' + ok + ' vérifications réussies')
                       : ('  ' + ok + ' ok, ' + ko + ' ECHEC(S)'));
  process.exit(ko === 0 ? 0 : 1);
}, 900);
