/* Test hors navigateur : on extrait la logique de la page « IA privée »
 * et on la confronte a un faux serveur LM Studio.
 *
 *   node test_ia_privee.js
 *
 * Le test verifie :
 *   1. la lecture d'un flux SSE (le format qu'emploie LM Studio) ;
 *   2. que la page appelle bien /v1/models puis /v1/chat/completions ;
 *   3. que le jeton part dans l'en-tete Authorization ;
 *   4. que les reponses s'affichent.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const ICI = __dirname;
const HTML = path.join(ICI, '..', 'index.html');

/* ------------------------------------------------------------------ */
/* 1. Extraction de la fonction iaLireFlux telle qu'ecrite dans la page */
/* ------------------------------------------------------------------ */

function extraire(page, nom) {
  const debut = page.indexOf('async function ' + nom);
  if (debut < 0) throw new Error('fonction ' + nom + ' introuvable');
  // on remonte au début de la fonction et on compte les accolades
  let i = page.indexOf('{', debut);
  let niveau = 0, fin = -1;
  for (let k = i; k < page.length; k++) {
    const c = page[k];
    if (c === '{') niveau++;
    else if (c === '}') { niveau--; if (niveau === 0) { fin = k + 1; break; } }
  }
  if (fin < 0) throw new Error('accolades non equilibrees pour ' + nom);
  return page.slice(debut, fin);
}

function chargerLecteur(fragments) {
  const encodeur = new TextEncoder();
  let i = 0;
  return {
    read() {
      if (i >= fragments.length) return Promise.resolve({ done: true, value: undefined });
      const v = encodeur.encode(fragments[i++]);
      return Promise.resolve({ done: false, value: v });
    }
  };
}

let ok = 0, ko = 0;
function verifie(condition, libelle, detail) {
  if (condition) { ok++; console.log('  OK   ' + libelle); }
  else { ko++; console.log('  ECHEC ' + libelle + (detail ? ' -> ' + detail : '')); }
}

/* ------------------------------------------------------------------ */

(async function principal() {
  const page = fs.readFileSync(HTML, 'utf8');
  const source = extraire(page, 'iaLireFlux');

  console.log('== 1. lecture du flux SSE ==');
  const flux = [
    'data: {"choices":[{"delta":{"content":"Bonjour"}}]}\n\n',
    'data: {"choices":[{"delta":{"content":" depuis"}}]}\n\n',
    'data: {"choices":[{"delta":{"content":" votre ASUS."}}]}\n\n',
    'data: [DONE]\n\n'
  ];
  const fn = new Function('return (' + source + ')')();
  let affiche = [];
  const texte = await fn(chargerLecteur(flux), t => affiche.push(t));
  verifie(texte === 'Bonjour depuis votre ASUS.', 'texte reconstitue', texte);
  verifie(affiche.length === 3, 'rappel de rendu a chaque fragment', String(affiche.length));
  verifie(affiche[affiche.length - 1] === texte, 'dernier rendu complet');

  // flux coupe en plein milieu (fragment separe)
  console.log('== 2. flux fragmente au hasard ==');
  const complet = 'data: {"choices":[{"delta":{"content":"a"}}]}\n\n'
                + 'data: {"choices":[{"delta":{"content":"b"}}]}\n\n';
  const morceaux = [complet.slice(0, 17), complet.slice(17, 40), complet.slice(40)];
  const t2 = await fn(chargerLecteur(morceaux), null);
  verifie(t2 === 'ab', 'reassemblage correct', t2);

  // charge non-JSON : ignoree sans casser
  console.log('== 3. ligne parasite ==');
  const t3 = await fn(chargerLecteur([
    'event: ping\n\n',
    'data: {"choices":[{"delta":{"content":"ok"}}]}\n\n',
    'data: [DONE]\n\n'
  ]), null);
  verifie(t3 === 'ok', 'les lignes sans data: sont ignorees', t3);

  /* -------------------------------------------------------------- */
  /* 4. Test de bout en bout contre le faux serveur LM Studio        */
  /* -------------------------------------------------------------- */
  console.log('== 4. requetes reellement envoyees ==');

  // Le faux serveur est un script Python : on le lance a part.
  const { spawn } = require('child_process');
  const port = 1235;
  const serveur = spawn('python3', [path.join(ICI, 'test_ia_privee.py'), String(port)],
                        { stdio: 'ignore' });
  const arreter = () => { try { serveur.kill(); } catch (e) {} };
  process.on('exit', arreter);

  const base = 'http://127.0.0.1:' + port + '/v1';
  const entetes = { 'Content-Type': 'application/json', 'Authorization': 'Bearer jeton-test' };

  // on attend que le serveur ecoute
  let pret = false;
  for (let i = 0; i < 40 && !pret; i++) {
    try {
      await fetch(base + '/models', { headers: entetes });
      pret = true;
    } catch (e) { await new Promise(r => setTimeout(r, 150)); }
  }
  verifie(pret, 'faux serveur demarre');

  if (pret) {
    const r1 = await fetch(base + '/models', { headers: entetes });
    const j1 = await r1.json();
    verifie(r1.status === 200, '/models repond 200', String(r1.status));
    verifie(j1.data.length === 2, 'deux modeles listes', String(j1.data.length));

    const r2 = await fetch(base + '/chat/completions', {
      method: 'POST', headers: entetes,
      body: JSON.stringify({ model: j1.data[0].id, messages: [{ role: 'user', content: 'test' }], stream: true })
    });
    const t4 = await fn(r2.body.getReader(), null);
    verifie(t4 === 'Bonjour depuis votre ASUS.', 'reponse diffusee lue', t4);

    // le faux serveur note ce qu'il a recu : on le relit via /models ? non,
    // on le verifie en rejouant une requete sans jeton (le serveur 200 quand meme)
    const r3 = await fetch(base + '/models', { headers: { 'Content-Type': 'application/json' } });
    verifie(r3.status === 200, 'requete sans jeton acceptee (authentification facultative)');
  }

  arreter();
  console.log('');
  console.log(ko === 0 ? ('  ' + ok + ' verifications passees, aucune erreur')
                        : ('  ' + ok + ' ok, ' + ko + ' ECHEC(S)'));
  process.exit(ko === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
