const fs=require('fs'), path=require('path');
const RACINE=path.join(__dirname,'..');
const {JSDOM}=require('jsdom');
const brut=fs.readFileSync(path.join(RACINE,'conversation.html'),'utf8');
const ok=[], ko=[];
const t=(n,c)=>(c?ok:ko).push(n);

const dom=new JSDOM(brut,{url:'https://exemple.test/conversation.html',runScripts:'dangerously',pretendToBeVisual:true});
const d=dom.window.document, w=dom.window;

// état initial
const lien=d.getElementById('porte');
t('bouton « Ouvrir la conversation » présent', !!lien && /ouvrir la conversation/i.test(lien.textContent));
t('la page ne contient aucune adresse vide', /https:\/\/arena\.ai\//.test(lien.href));
t('adresse par défaut = celle de l\'humain', lien.href===brut.match(/id="porte" href="([^"]+)"/)[1]);
t('le défaut n\'est pas l\'accueil nu', lien.href!=='https://arena.ai/');
t('ouverture dans un nouvel onglet', lien.getAttribute('target')==='_blank' && /noopener/.test(lien.getAttribute('rel')||''));
t('libellé de cible affiché', /arena\.ai/.test(d.getElementById('cible').textContent));
t('état initial : aucune adresse personnalisée', /aucune adresse personnalisée/i.test(d.getElementById('etat').textContent));

// enregistrer une adresse
const champ=d.getElementById('adresse');
champ.value='https://arena.ai/chat/abc-123';
d.getElementById('enregistrer').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
t('adresse personnalisée appliquée au bouton', lien.href==='https://arena.ai/chat/abc-123');
t('état mis à jour après enregistrement', /personnalisée enregistrée/i.test(d.getElementById('etat').textContent));
t('stockage local utilisé', w.localStorage.getItem('porte-conversation-adresse')==='https://arena.ai/chat/abc-123');

// ajout automatique du schéma
champ.value='arena.ai/mon-espace';
d.getElementById('enregistrer').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
t('https:// ajouté si absent', lien.href==='https://arena.ai/mon-espace');

// persistance : nouvelle page, même origine
const dom2=new JSDOM(brut,{url:'https://exemple.test/conversation.html',runScripts:'dangerously',pretendToBeVisual:true,
  beforeParse(win){ win.localStorage.setItem('porte-conversation-adresse','https://arena.ai/chat/persist'); }});
const d2=dom2.window.document;
t('adresse retrouvée au rechargement', d2.getElementById('porte').href==='https://arena.ai/chat/persist');
t('champ pré-rempli au rechargement', d2.getElementById('adresse').value==='https://arena.ai/chat/persist');

// retour au défaut
d.getElementById('defaut').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
t('retour au défaut (adresse inscrite)', lien.href===brut.match(/id="porte" href="([^"]+)"/)[1]);
t('stockage vidé après retour au défaut', w.localStorage.getItem('porte-conversation-adresse')===null);

// robustesse : stockage refusé
const dom3=new JSDOM(brut,{url:'https://exemple.test/conversation.html',runScripts:'dangerously',
  beforeParse(win){ Object.defineProperty(win,'localStorage',{get(){ throw new Error('refusé'); }}); }});
t('page utilisable si le stockage est refusé', dom3.window.document.getElementById('porte').href.startsWith('https://arena.ai/'));

// l'adresse en dur est celle de la conversation de l'humain, et elle reste modifiable
t('adresse inscrite en dur dans le HTML', /href="https:\/\/arena\.ai\/agent\/[0-9a-f-]{36}"/.test(brut));
t('le champ de réglage reste proposé', !!d.getElementById('adresse') && !!d.getElementById('enregistrer'));

// indépendance
t('aucun appel réseau dans la page', !/fetch\(|XMLHttpRequest|WebSocket/.test(brut));
t('aucune dépendance externe (script/lien)', !/<script[^>]+src=|<link[^>]+href="http/.test(brut));
t('un seul lien sortant, et c\'est la porte', (brut.match(/href="http[^"]*"/g)||[]).length===1);
t('index.html reste accessible depuis la page', !!d.querySelector('a[href="index.html"]'));

// le site public ne la référence pas
for(const f of ['index.html','accueil.html','atelier.html']){
  t(`${f} ne renvoie pas vers la porte`, !fs.readFileSync(path.join(RACINE,f),'utf8').includes('conversation.html'));
}

console.log(ok.map(x=>'  OK  '+x).join('\n'));
if(ko.length){ console.log('\nÉCHECS :\n'+ko.map(x=>'  KO  '+x).join('\n')); process.exit(1); }
console.log('\n'+ok.length+' vérifications réussies sur '+ok.length);
