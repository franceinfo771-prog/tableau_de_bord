#!/usr/bin/env node
/* Vérifie la sélection d'un projet : lien #proj-… au démarrage, hashchange,
   sauts depuis l'aperçu, le focus et la recherche. Aucun navigateur requis (jsdom). */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const RACINE = path.join(__dirname, '..');
const PAGE = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf8');
const DONNEES = JSON.parse(fs.readFileSync(path.join(RACINE, 'projets.json'), 'utf8'));

let ok = 0;
let ko = 0;
function verifie(cond, libelle, detail) {
  if (cond) { ok++; console.log('  OK   ' + libelle); }
  else { ko++; console.log('  ECHEC ' + libelle + (detail ? ' -> ' + detail : '')); }
}

async function scenario(titre, url, options) {
  console.log('\n== ' + titre + ' ==');
  const erreurs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => erreurs.push(String(e.message || e)));
  vc.on('error', (...a) => erreurs.push(a.map(String).join(' ')));
  const dom = new JSDOM(PAGE, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url,
    virtualConsole: vc,
    beforeParse(window) {
      window.HTMLElement.prototype.scrollIntoView = function () {
        window.__scrolls = window.__scrolls || [];
        window.__scrolls.push(this.id || this.tagName);
      };
      if (options && options.avant) options.avant(window);
    },
  });
  const doc = dom.window.document;
  await new Promise(r => setTimeout(r, 600));
  await (options && options.apres ? options.apres(doc, dom.window) : async () => {});
  verifie(erreurs.length === 0, 'aucune erreur JS', erreurs.slice(0, 2).join(' | '));
  dom.window.close();
}

const scrolls = win => (win && win.__scrolls) || [];
const pause = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('== 1. lien direct vers un projet au démarrage ==');
  await scenario('ouverture de #proj-velo', 'https://x.test/tableau_de_bord/#proj-velo', {
    apres: async (doc, win) => {
      const carte = doc.getElementById('proj-velo');
      verifie(!!carte, 'la carte #proj-velo existe');
      const det = carte && carte.querySelector('details');
      verifie(!!(det && det.open), 'ses étapes sont dépliées au démarrage', det ? 'open=' + det.open : 'absente');
      verifie(scrolls(win).includes('proj-velo'), 'la page défile jusqu\'au projet', JSON.stringify(scrolls(win)));
    },
  });

  await scenario('démarrage normal, sans ancre', 'https://x.test/tableau_de_bord/', {
    apres: async (doc, win) => {
      verifie(doc.querySelectorAll('article.p').length === 6, '6 projets rendus');
      const ouverts = [...doc.querySelectorAll('article.p details')].filter(d => d.open);
      verifie(ouverts.length === 0, 'aucun projet déplié par défaut', ouverts.length + ' ouvert(s)');
      verifie(doc.getElementById('btn-toggle-all').textContent.includes('Tout déplier'), 'bouton = Tout déplier');
      verifie(scrolls(win).length === 0, 'aucun défilement imposé', JSON.stringify(scrolls(win)));
    },
  });

  console.log('\n== 2. ancre changée après le chargement ==');
  await scenario('hashchange vers #proj-maquette', 'https://x.test/tableau_de_bord/', {
    apres: async (doc, win) => {
      win.history.replaceState(null, '', '#proj-maquette');
      win.dispatchEvent(new win.HashChangeEvent('hashchange'));
      await pause(80);
      const det = doc.querySelector('#proj-maquette details');
      verifie(!!(det && det.open), 'maquette dépliée', det ? 'open=' + det.open : 'absente');
      verifie(scrolls(win).includes('proj-maquette'), 'défilement vers maquette', JSON.stringify(scrolls(win)));
    },
  });

  await scenario('ancres de section et ancre inconnue', 'https://x.test/tableau_de_bord/#projets', {
    apres: async (doc) => {
      verifie(doc.querySelectorAll('article.p').length === 6, '#projets : 6 cartes rendues');
      doc.getElementById('haut').scrollIntoView();
    },
  });

  await scenario('ancre de projet inexistante', 'https://x.test/tableau_de_bord/#proj-inexistant', {
    apres: async (doc) => {
      verifie(doc.querySelectorAll('article.p').length === 6, 'l\'ancre inconnue ne casse pas la page');
    },
  });

  console.log('\n== 3. sauts depuis la page ==');
  await scenario('aperçu avec le filtre « Terminés »', 'https://x.test/tableau_de_bord/', {
    apres: async (doc, win) => {
      doc.querySelector('[data-filter="done"]').click();
      verifie(doc.querySelectorAll('article.p').length === 2, 'filtre Terminés : 2 cartes');
      const lien = doc.querySelector('#overview .b[data-jump]') || doc.querySelector('[data-jump]');
      verifie(!!lien, 'un lien de saut est présent');
      if (!lien) return;
      const pid = lien.getAttribute('data-jump');
      lien.click();
      await pause(50);
      verifie(doc.querySelectorAll('article.p').length === 6, 'le filtre revient à Tous (6 cartes)');
      verifie(doc.querySelector('[data-filter="all"]').classList.contains('active'), 'pastille Tous active');
      const det = doc.querySelector('#proj-' + pid + ' details');
      verifie(!!(det && det.open), 'le projet ' + pid + ' est déplié');
      verifie(scrolls(win).includes('proj-' + pid), 'défilement vers ' + pid);
      verifie(win.location.hash === '#proj-' + pid, 'URL mise à jour en #proj-' + pid, win.location.hash);
    },
  });

  await scenario('lien d\'un résultat de recherche', 'https://x.test/tableau_de_bord/', {
    apres: async (doc, win) => {
      doc.querySelector('[data-filter="done"]').click();
      const q = doc.getElementById('q');
      q.value = 'vélo';
      q.dispatchEvent(new win.Event('input'));
      const lien = doc.querySelector('#res a[data-jump]');
      verifie(!!lien, 'un résultat pointe vers un projet');
      if (!lien) return;
      lien.click();
      await pause(50);
      verifie(doc.querySelectorAll('article.p').length === 6, 'le filtre revient à Tous');
      const det = doc.querySelector('#proj-velo details');
      verifie(!!(det && det.open), 'le projet vélo est déplié');
    },
  });

  console.log('\n== 4. brouillon local et cochage d\'une étape ==');
  await scenario('brouillon local repris au démarrage', 'https://x.test/tableau_de_bord/', {
    avant: (win) => {
      const copie = JSON.parse(JSON.stringify(DONNEES));
      copie.projets.find(p => p.id === 'poche').etapes[4].ok = true;
      win.localStorage.setItem('tdb_projets_v20261116', JSON.stringify(copie));
    },
    apres: async (doc) => {
      const cb = doc.querySelector('#proj-poche input[data-idx="4"]');
      verifie(!!(cb && cb.checked), 'la coche locale est affichée');
      verifie(doc.getElementById('kpi-grid').textContent.includes('25/40'), 'KPI = 25/40');
      verifie(doc.getElementById('savebar').classList.contains('on'), 'barre de sauvegarde visible');
    },
  });

  await scenario('cocher une étape met à jour les compteurs', 'https://x.test/tableau_de_bord/', {
    apres: async (doc) => {
      const cb = doc.querySelector('#proj-poche input[data-idx="4"]');
      verifie(!!cb, 'la case de l\'étape existe');
      if (!cb) return;
      const avant = cb.checked;
      cb.checked = !avant;
      cb.dispatchEvent(new doc.defaultView.Event('change', { bubbles: true }));
      await pause(30);
      verifie(doc.getElementById('kpi-grid').textContent.includes(avant ? '23/40' : '25/40'),
        'le KPI suit la coche');
      const det = doc.querySelector('#proj-poche details');
      verifie(!!(det && det.open), 'le projet reste déplié après la coche');
    },
  });

  console.log('\n' + (ko === 0 ? ok + ' vérifications réussies' : ok + ' ok, ' + ko + ' ECHEC(S)'));
  process.exit(ko === 0 ? 0 : 1);
})();
