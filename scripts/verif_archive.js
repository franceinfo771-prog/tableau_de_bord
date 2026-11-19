#!/usr/bin/env node
/* Vérifie l'archive livrée (tableau-de-bord-AAAA-MM-JJ.zip) comme si elle venait
   d'être décompressée et ouverte par double-clic (file://) :
   - tous les fichiers annoncés sont là ;
   - les fichiers sont des copies exactes du dépôt ;
   - chaque lien interne pointe vers un fichier qui existe ;
   - COMMENCER-ICI.html mène bien au site ;
   - le site s'ouvre hors ligne : 6 projets, données complètes, aucune erreur JS.

   Usage : node scripts/verif_archive.js [chemin.zip] */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { JSDOM, VirtualConsole } = require('jsdom');

const RACINE = path.join(__dirname, '..');
let ok = 0;
let ko = 0;
function verifie(cond, libelle, detail) {
  if (cond) { ok++; console.log('  OK   ' + libelle); }
  else { ko++; console.log('  ECHEC ' + libelle + (detail ? ' -> ' + detail : '')); }
}

// Trouver le zip : argument, sinon le plus récent.
function trouverZip() {
  const arg = process.argv[2];
  if (arg) return path.resolve(arg);
  const zips = fs.readdirSync(RACINE)
    .filter(f => /^tableau-de-bord-\d{4}-\d{2}-\d{2}\.zip$/.test(f))
    .map(f => ({ f, m: fs.statSync(path.join(RACINE, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m);
  return zips.length ? path.join(RACINE, zips[0].f) : null;
}

function extraire(zipPath) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'verif-archive-'));
  execFileSync('unzip', ['-q', zipPath, '-d', tmp]);
  const entrees = fs.readdirSync(tmp).filter(f => fs.statSync(path.join(tmp, f)).isDirectory());
  return { tmp, racine: path.join(tmp, entrees[0]) };
}

function lister(dossier) {
  const out = [];
  (function marche(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) marche(p);
      else out.push(path.relative(dossier, p));
    }
  })(dossier);
  return out;
}

(async () => {
  const zip = trouverZip();
  if (!zip) {
    console.log('Aucune archive trouvée. Lancer : python3 scripts/construire_archive.py');
    process.exit(1);
  }
  console.log('== 1. contenu de l\'archive ==');
  console.log('  fichier : ' + path.basename(zip) + ' (' + (fs.statSync(zip).size / 1024 / 1024).toFixed(1) + ' Mo)');
  const { tmp, racine } = extraire(zip);

  const attendus = [
    'COMMENCER-ICI.html', 'MODE-D-EMPLOI.html', 'LISEZ-MOI.txt',
    'site/index.html', 'site/accueil.html', 'site/veille-supermimic.html', 'site/projets.json',
    'site/img/banniere.jpg', 'site/img/velo.jpg',
    'technique/index.html', 'technique/projets.json', 'technique/ASSISTANT.md',
    'technique/ETAT.md', 'technique/scripts/verif_rendu.js',
    'archives/projets-du-jour-2026-11-19.json',
  ];
  for (const f of attendus) {
    verifie(fs.existsSync(path.join(racine, f)), 'présent : ' + f);
  }

  const tous = lister(racine);
  verifie(tous.every(f => !f.includes('__pycache__') && !f.includes('node_modules')),
    'aucun déchet technique (__pycache__, node_modules)');
  const liens = [];
  (function marche(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isSymbolicLink()) liens.push(path.relative(racine, p));
      else if (e.isDirectory()) marche(p);
    }
  })(racine);
  verifie(liens.length === 0, 'aucun lien symbolique (ouverture Windows)', liens.join(', '));

  console.log('\n== 2. copies exactes du dépôt ==');
  for (const f of ['index.html', 'accueil.html', 'projets.json', 'img/banniere.jpg']) {
    const src = path.join(RACINE, f);
    const copie = path.join(racine, 'site', f);
    verifie(fs.existsSync(copie) && fs.readFileSync(src).equals(fs.readFileSync(copie)),
      'site/' + f + ' identique au dépôt');
  }

  console.log('\n== 3. liens internes ==');  const pages = ['COMMENCER-ICI.html', 'MODE-D-EMPLOI.html', 'site/accueil.html', 'site/index.html', 'site/veille-supermimic.html'];
  const casse = [];
  for (const page of pages) {
    const dossier = path.dirname(path.join(racine, page));
    const html = fs.readFileSync(path.join(racine, page), 'utf8');
    for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const cible = m[1];
      if (/^(https?:|mailto:|#|data:)/.test(cible)) continue;
      // Liens construits par le JavaScript du site (gabarits entre quotes) :
      // ils ne désignent aucun fichier à écrire sur le disque.
      if (/['"+]/.test(cible)) continue;
      const fichier = cible.split('#')[0];
      if (!fichier) continue;
      let resolu = path.resolve(dossier, fichier);
      if (!fs.existsSync(resolu) && !fs.existsSync(resolu + '.html')) casse.push(page + ' -> ' + cible);
    }
  }
  verifie(casse.length === 0, 'tous les liens internes mènent à un fichier existant', casse.slice(0, 4).join(' | '));

  // Le bouton de la page de démarrage doit viser la page d'accueil du site.
  const demarrage = fs.readFileSync(path.join(racine, 'COMMENCER-ICI.html'), 'utf8');
  verifie(/class="gros-bouton"\s+href="site\/accueil\.html"/.test(demarrage),
    'COMMENCER-ICI.html mène à site/accueil.html');

  console.log('\n== 3 bis. le travail des projets ==');
  const sommaire = path.join(racine, 'travail', 'INDEX.html');
  if (fs.existsSync(sommaire)) {
    const html = fs.readFileSync(sommaire, 'utf8');
    const cibles = [...html.matchAll(/<li><a href="([^"]+)"/g)].map(m => m[1]);
    const absents = cibles.filter(c => !fs.existsSync(path.join(racine, 'travail', c)));
    verifie(cibles.length > 0, 'travail/INDEX.html liste des fichiers', String(cibles.length));
    verifie(absents.length === 0, 'chaque fichier du sommaire existe vraiment',
      absents.slice(0, 3).join(' | '));
    // Le fichier le plus précieux : le programme du vélo doit être lisible.
    const velo = path.join(racine, 'travail', '02-velo-electrique', 'controleur_velo_zs_x11h.ino');
    verifie(fs.existsSync(velo) && fs.statSync(velo).size > 1000,
      'le programme Arduino du vélo est dans l\'archive');
    // Aucune archive imbriquée ne doit être vide (téléchargement raté).
    const vides = [];
    (function marche(d) {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) marche(p);
        else if (fs.statSync(p).size === 0) vides.push(path.relative(racine, p));
      }
    })(path.join(racine, 'travail'));
    verifie(vides.length === 0, 'aucun fichier vide dans travail/', vides.slice(0, 3).join(' | '));
  } else {
    verifie(true, 'pas de travail/ dans cette archive (dossier travaux/ absent à la construction)');
  }

  console.log('\n== 4. le site s\'ouvre hors ligne (file://) ==');
  const url = 'file://' + path.join(racine, 'site', 'index.html');
  const erreurs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => erreurs.push(String(e.message || e).split('\n')[0]));
  vc.on('error', (...a) => erreurs.push(a.map(String).join(' ').split('\n')[0]));
  const dom = new JSDOM(fs.readFileSync(path.join(racine, 'site', 'index.html'), 'utf8'), {
    runScripts: 'dangerously', pretendToBeVisual: true, url, virtualConsole: vc,
    beforeParse(w) { w.HTMLElement.prototype.scrollIntoView = function () {}; },
  });
  await new Promise(r => setTimeout(r, 900));
  const doc = dom.window.document;
  const donnes = JSON.parse(fs.readFileSync(path.join(RACINE, 'projets.json'), 'utf8'));
  const etapes = donnes.projets.flatMap(p => p.etapes);
  const faites = etapes.filter(e => e.ok).length;
  verifie(erreurs.length === 0, 'aucune erreur JS à l\'ouverture', erreurs.slice(0, 2).join(' | '));
  verifie(doc.querySelectorAll('article.p').length === donnes.projets.length,
    'les ' + donnes.projets.length + ' projets s\'affichent', String(doc.querySelectorAll('article.p').length));
  verifie(doc.getElementById('kpi-grid').textContent.includes(faites + '/' + etapes.length),
    'compteur juste hors ligne : ' + faites + '/' + etapes.length);
  verifie(doc.querySelectorAll('#veille .v').length === donnes.veille.length,
    'les ' + donnes.veille.length + ' fiches de veille s\'affichent');
  doc.getElementById('btn-toggle-all').click();
  await new Promise(r => setTimeout(r, 50));
  verifie([...doc.querySelectorAll('article.p details')].every(d => d.open), '« Tout déplier » fonctionne');
  dom.window.close();

  // La page d'accueil du site, ouverte en file://, ne doit pas lever d'erreur.
  const erreurs2 = [];
  const vc2 = new VirtualConsole();
  vc2.on('jsdomError', e => erreurs2.push(String(e.message || e).split('\n')[0]));
  vc2.on('error', (...a) => erreurs2.push(a.join(' ')));
  const dom2 = new JSDOM(fs.readFileSync(path.join(racine, 'site', 'accueil.html'), 'utf8'), {
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc2,
    url: 'file://' + path.join(racine, 'site', 'accueil.html'),
    beforeParse(w) { w.fetch = () => Promise.reject(new Error('hors ligne')); },
  });
  await new Promise(r => setTimeout(r, 300));
  verifie(erreurs2.length === 0, 'accueil : aucune erreur hors ligne', erreurs2.slice(0, 1).join(''));
  const chiffres = dom2.window.document.querySelectorAll('.chiffres strong');
  verifie(chiffres.length === 4 && chiffres[2].textContent === faites + ' / ' + etapes.length,
    'accueil : chiffres justes hors ligne', chiffres[2] ? chiffres[2].textContent : '');
  dom2.window.close();

  fs.rmSync(tmp, { recursive: true, force: true });

  console.log('\n' + (ko === 0 ? ok + ' vérifications réussies' : ok + ' ok, ' + ko + ' ECHEC(S)'));
  process.exit(ko === 0 ? 0 : 1);
})();
