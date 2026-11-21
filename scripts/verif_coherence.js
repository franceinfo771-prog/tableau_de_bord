#!/usr/bin/env node
/**
 * Contrôles de cohérence des documents.
 *
 * Le problème que ce script attaque : quatre documents à la racine parlaient
 * du même sujet et se contredisaient. Une conversation neuve pouvait tomber
 * sur un fichier périmé et croire que « main » était à un commit de novembre.
 *
 * Ce script vérifie :
 *   - que l'état vivant (ETAT.md) désigne les traces datées comme telles ;
 *   - que chaque trace porte son bandeau de péremption ;
 *   - que les chiffres de la façade sortent de projets.json, jamais d'une recopie ;
 *   - que les erreurs corrigées ne sont pas revenues (le « 7 h 20 », l'alerte
 *     automatique, le « Détail des 6 projets »).
 *
 * Usage : node scripts/verif_coherence.js
 */
const fs = require("fs");
const path = require("path");

const RACINE = path.join(__dirname, "..");
const lire = (f) => fs.readFileSync(path.join(RACINE, f), "utf8");

let ok = 0;
const echecs = [];
function verifie(cond, libelle, detail) {
  if (cond) ok++;
  else {
    echecs.push(libelle);
    console.log("  ECHEC " + libelle + (detail !== undefined ? " -> " + detail : ""));
  }
}

console.log("== 1. l'état vivant désigne les traces ==");
const etat = lire("ETAT.md");
verifie(/un seul chemin/i.test(etat), "ETAT.md dit qu'il n'y a qu'un chemin");
verifie(etat.includes("ARCHIVE-SESSION-17-11.md"), "ETAT.md nomme l'archive de session");
verifie(etat.includes("APERCU.md"), "ETAT.md nomme APERCU.md");
verifie(/c'est cette page qui a raison/i.test(etat), "ETAT.md tranche en cas de contradiction");
verifie(etat.includes("ETAT-DES-LIEUX.md"), "ETAT.md renvoie à l'état des lieux");

console.log("== 2. les traces portent leur bandeau ==");
const archive = lire("ARCHIVE-SESSION-17-11.md");
verifie(/PÉRIMÉ/.test(archive.slice(0, 600)), "l'archive de session s'annonce périmée dès sa première ligne");
verifie(archive.includes("ETAT.md"), "l'archive renvoie à l'état vivant");

const iaLocale = lire("IA-LOCALE.md");
verifie(/DÉMENTI LE 21 NOVEMBRE/.test(iaLocale.slice(0, 600)), "IA-LOCALE.md porte le démenti du 21/11");
verifie(iaLocale.includes("ETAT.md"), "IA-LOCALE.md renvoie à l'état vivant");

const apercu = lire("APERCU.md");
verifie(apercu.length > 0, "APERCU.md est présent");

console.log("== 3. ASSISTANT.md tranche les contradictions ==");
const assistant = lire("ASSISTANT.md");
verifie(/source unique/i.test(assistant), "ASSISTANT.md nomme la source unique");
verifie(/fait foi/.test(assistant.slice(0, 1200)), "ASSISTANT.md dit que ETAT.md fait foi (en tête)");
verifie(assistant.includes("ETAT-DES-LIEUX.md"), "ASSISTANT.md renvoie à l'état des lieux");

console.log("== 4. l'état des lieux est complet ==");
const lieux = lire("ETAT-DES-LIEUX.md");
verifie(lieux.includes("Ce qui a marché"), "il dit ce qui a marché");
verifie(lieux.includes("Ce qui a raté"), "il dit ce qui a raté");
verifie(/coûté du temps/i.test(lieux), "il dit ce que les erreurs ont coûté");
verifie(/23 sur 25/.test(lieux), "il garde la réponse fausse (23 sur 25)");
verifie(lieux.includes("13,99"), "il garde le prix de la manette");
verifie(lieux.includes("33 / 49"), "il porte les vrais chiffres");

console.log("== 5. les chiffres viennent de projets.json ==");
const donnees = JSON.parse(lire("projets.json"));
const etapes = donnees.projets.flatMap((p) => p.etapes || []);
const faites = etapes.filter((e) => e.ok).length;
const total = etapes.length;
const pct = Math.round((100 * faites) / total);
// La page de présentation a été supprimée le 21/11 (une seule page, une seule
// adresse). Les chiffres ne sont plus écrits dans le HTML : ils sont calculés au
// chargement depuis projets.json — c'est justement ce qui les empêche de vieillir.
// On vérifie donc que le calcul existe et que la source est bien projets.json.
const index = lire("index.html");
verifie(/projets\.json/.test(index), "index.html lit projets.json");
verifie(/totalSteps/.test(index) && /totalDone/.test(index), "index.html calcule les totaux");
verifie(!/DEFAULT_DATA/.test(index), "index.html ne porte aucune copie des données");
const readme = lire("README.md");
verifie(readme.includes(`${faites} / ${total}`), "README.md affiche le compte réel");

console.log("== 6. les erreurs corrigées ne sont pas revenues ==");
// Le 19/11, on croyait le robot réglé : le journal daté garde ce qui a été écrit ce
// jour-là, et c'est légitime — à condition que le démenti le suive. On ne traque donc
// pas le mot « 7 h 20 », mais l'affirmation VIVANTE.
// Le journal peut CITER une erreur pour raconter qu'elle en était une. Ce qui est
// interdit, c'est de l'affirmer. On juge donc l'affirmation, pas l'occurrence du mot :
// « ... est fausse », « ... était faux », « annonçait », guillemets, passé.
const phrasesInterdites = [
  [/il tourne désormais chaque matin/i, "affirmer au présent que le robot tourne chaque matin"],
  [/alerte quotidienne en place/i, "affirmer qu'une alerte quotidienne est en place"],
  [/une alerte part automatiquement/i, "affirmer qu'une alerte part automatiquement"],
];
let affirmees = 0;
for (const ligne of etat.split("\n")) {
  for (const [motif, quoi] of phrasesInterdites) {
    if (motif.test(ligne)) {
      affirmees++;
      console.log("  ligne fautive -> " + ligne.trim().slice(0, 110));
      echecs.push("ETAT.md " + quoi);
    }
  }
}
if (affirmees === 0) ok++;
verifie(/Rien de tel n'a eu lieu/i.test(etat), "ETAT.md dit que le robot n'a jamais tourné chaque matin");
verifie(/relevé à la main/i.test(etat), "ETAT.md dit que le relevé se fait à la main");

const vivants = { "projets.json": JSON.stringify(donnees), "index.html": lire("index.html") };
for (const [nom, texte] of Object.entries(vivants)) {
  verifie(!/7 h 20/.test(texte), "aucun « 7 h 20 » dans " + nom);
  verifie(!/alerte quotidienne en place/.test(texte), "aucune « alerte quotidienne » dans " + nom);
  verifie(!/une alerte part automatiquement/.test(texte), "aucune alerte « automatique » dans " + nom);
}
verifie(!/Détail des 6 projets/.test(etat), "le « Détail des 6 projets » n'est pas revenu");
verifie(!/6 \/ 8 \(75/.test(etat), "le faux « 6 / 8 » n'est pas revenu");

console.log("\n" + (echecs.length === 0
  ? ok + " vérifications réussies"
  : ok + " ok, " + echecs.length + " ECHEC(S)"));
process.exit(echecs.length === 0 ? 0 : 1);
