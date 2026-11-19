#!/usr/bin/env node
/* Vérifie la page d'accueil de démonstration (accueil.html) :
   bouton d'entrée, raccourcis vers les sections, chiffres relus dans
   projets.json, et comportement hors ligne. Aucun navigateur requis. */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const RACINE = path.join(__dirname, '..');
const PAGE = fs.readFileSync(path.join(RACINE, 'accueil.html'), 'utf8');
const DONNEES = JSON.parse(fs.readFileSync(path.join(RACINE, 'projets.json'), 'utf8'));

// Chiffres attendus, calculés depuis projets.json.
const ETAPES = DONNEES.projets.flatMap(p => p.etapes || []);
const FAITES = ETAPES.filter(e => e && e.ok).length;
const FINIS = DONNEES.projets.filter(p => p.etapes && p.etapes.length && p.etapes.every(e => e.ok)).length;
const PCT = ETAPES.length ? Math.round(FAITES / ETAPES.length * 100) : 0;

let ok = 0;
let ko = 0;
function verifie(cond, libelle, detail) {
  if (cond) { ok++; console.log('  OK   ' + libelle); }
  else { ko++; console.log('  ECHEC ' + libelle + (detail ? ' -> ' + detail : '')); }
}

function charger(options) {
  const erreurs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => erreurs.push(String(e.message || e)));
  vc.on('error', (...a) => erreurs.push(a.map(String).join(' ')));
  const dom = new JSDOM(PAGE, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'https://x.test/tableau_de_bord/accueil.html',
    virtualConsole: vc,
    beforeParse(window) { window.fetch = options.fetch; },
  });
  return { dom, erreurs };
}

(async () => {
  // 1. Avec projets.json joignable
  console.log('== 1. accueil, projets.json joignable ==');
  const { dom, erreurs } = charger({
    fetch: async (url) => {
      if (String(url).startsWith('projets.json')) return { ok: true, json: async () => DONNEES };
      return { ok: false, json: async () => ({}) };
    },
  });
  const doc = dom.window.document;
  await new Promise(r => setTimeout(r, 300));

  verifie(erreurs.length === 0, 'aucune erreur JS', erreurs.slice(0, 2).join(' | '));
  verifie(doc.documentElement.lang === 'fr', 'page en français (lang="fr")');
  verifie(doc.querySelectorAll('h1').length === 1, 'un seul titre h1');
  const robots = doc.querySelector('meta[name="robots"]');
  verifie(!!robots && /noindex/.test(robots.content), 'noindex présent');
  verifie(/noindex/.test(fs.readFileSync(path.join(RACINE, 'accueil.html'), 'utf8')), 'noindex bien dans la page');

  const bouton = doc.querySelector('a.entrer');
  verifie(!!bouton, 'bouton « Entrer » présent');
  verifie(!!bouton && bouton.getAttribute('href') === 'index.html', 'le bouton mène à index.html',
    bouton ? bouton.getAttribute('href') : '');

  const liens = [...doc.querySelectorAll('.raccourcis a')];
  verifie(liens.length === 7, '7 raccourcis (5 sections + la page de veille + sa version courte)', String(liens.length));
  // Cinq raccourcis visent une section du tableau ; un mène à la page de veille.
  const sections = liens.filter(a => /^index\.html#[a-z-]+$/.test(a.getAttribute('href') || ''));
  const pages = liens.filter(a => /^[a-z-]+\.html$/.test(a.getAttribute('href') || ''));
  verifie(sections.length === 5, '5 raccourcis vers une section de index.html', String(sections.length));
  verifie(pages.length === 2 && pages.every(a => fs.existsSync(path.join(RACINE, a.getAttribute('href')))),
    '2 raccourcis vers des pages existantes', pages.map(a => a.getAttribute('href')).join(' '));

  // Les ancres visées doivent exister dans index.html.
  const index = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf8');
  const cibles = sections.map(a => a.getAttribute('href').split('#')[1]);
  const manquantes = cibles.filter(id => !index.includes('id="' + id + '"'));
  verifie(manquantes.length === 0, 'les sections visées existent dans index.html', manquantes.join(', '));

  // La page d'accueil doit renvoyer vers le tableau, et le tableau vers elle.
  const retours = [...index.split('\n')].filter(l => l.includes('href="accueil.html"'));
  verifie(retours.length >= 2, 'index.html renvoie vers accueil.html (nav + bas de page)', String(retours.length));

  const chiffres = [...doc.querySelectorAll('.chiffres strong')];
  verifie(chiffres.length === 4, '4 chiffres affichés', String(chiffres.length));
  if (chiffres.length === 4) {
    verifie(chiffres[0].textContent === String(DONNEES.projets.length), 'nombre de projets = ' + DONNEES.projets.length, chiffres[0].textContent);
    verifie(chiffres[1].textContent === String(FINIS), 'projets terminés = ' + FINIS, chiffres[1].textContent);
    verifie(chiffres[2].textContent === FAITES + ' / ' + ETAPES.length, 'étapes = ' + FAITES + ' / ' + ETAPES.length, chiffres[2].textContent);
    verifie(chiffres[2].nextElementSibling.textContent.includes(PCT + ' %'), 'pourcentage = ' + PCT + ' %', chiffres[2].nextElementSibling.textContent);
    verifie(chiffres[3].textContent === String((DONNEES.veille || []).length), 'veille = ' + (DONNEES.veille || []).length, chiffres[3].textContent);
  }
  dom.window.close();

  // 2. Les chiffres écrits dans la page doivent déjà être bons (secours hors ligne)
  console.log('\n== 2. accueil hors ligne (fetch impossible) ==');
  const horsLigne = charger({ fetch: async () => { throw new Error('hors ligne'); } });
  await new Promise(r => setTimeout(r, 200));
  const doc2 = horsLigne.dom.window.document;
  verifie(horsLigne.erreurs.length === 0, 'aucune erreur JS hors ligne', horsLigne.erreurs.slice(0, 2).join(' | '));
  const c2 = [...doc2.querySelectorAll('.chiffres strong')];
  verifie(c2.length === 4 && c2[2].textContent === FAITES + ' / ' + ETAPES.length,
    'les chiffres écrits dans la page restent justes', c2[2] ? c2[2].textContent : '');
  // Le texte écrit en dur dans le HTML doit aussi être à jour : on le relit sans JS.
  const sansJs = new JSDOM(PAGE);
  const d3 = sansJs.window.document;
  const c3 = [...d3.querySelectorAll('.chiffres strong')];
  verifie(c3.length === 4 && c3[2].textContent === FAITES + ' / ' + ETAPES.length,
    'chiffres écrits en dur à jour avec projets.json', c3[2] ? c3[2].textContent : '');
  const projetsEcrits = c3.length ? c3[0].textContent : '';
  verifie(projetsEcrits === String(DONNEES.projets.length), 'nombre de projets écrit en dur à jour', projetsEcrits);
  horsLigne.dom.window.close();

  console.log('\n' + (ko === 0 ? ok + ' vérifications réussies' : ok + ' ok, ' + ko + ' ECHEC(S)'));
  process.exit(ko === 0 ? 0 : 1);
})();
