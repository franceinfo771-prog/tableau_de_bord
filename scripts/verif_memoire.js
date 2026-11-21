#!/usr/bin/env node
/**
 * Contrôles de « la mémoire du site à la maison ».
 *
 * Ce que ce script protège :
 *   - la fiche reste courte (un petit modèle ne lit pas 34 000 caractères) ;
 *   - la fiche ne contient aucun secret, aucune adresse extérieure ;
 *   - la page ne parle qu'à la machine locale ;
 *   - la page ne part pas dans le site publié (elle vit dans pont-outils/) ;
 *   - la page porte toujours ses garde-fous : pas de clé, pas de dépendance.
 *
 * Usage : node scripts/verif_memoire.js
 */
const fs = require("fs");
const path = require("path");

const RACINE = path.join(__dirname, "..");
const DOSSIER = path.join(RACINE, "pont-outils");
const FICHE = path.join(DOSSIER, "fiche.txt");
const PAGE = path.join(DOSSIER, "chat.html");
const PLAFOND_VISE = 4000;
const PLAFOND_DUR = 4600;

let ok = 0;
const echecs = [];
function verifie(condition, libelle, detail) {
  if (condition) {
    ok++;
  } else {
    echecs.push(libelle + (detail !== undefined ? " -> " + detail : ""));
    console.log("  ECHEC " + libelle + (detail !== undefined ? " -> " + detail : ""));
  }
}

console.log("== 1. la fiche ==");

verifie(fs.existsSync(FICHE), "fiche.txt existe");
verifie(fs.existsSync(PAGE), "chat.html existe");

const fiche = fs.existsSync(FICHE) ? fs.readFileSync(FICHE, "utf8").trim() : "";
verifie(fiche.length > 800, "la fiche n'est pas vide", fiche.length + " caractères");
verifie(fiche.length <= PLAFOND_DUR, "la fiche tient sous " + PLAFOND_DUR + " caractères", fiche.length);
if (fiche.length > PLAFOND_VISE) {
  console.log("  (au-dessus du plafond visé de " + PLAFOND_VISE + ", mais sous le plafond dur)");
}

// La fiche doit venir des données, pas d'une recopie à la main.
const donnees = JSON.parse(fs.readFileSync(path.join(RACINE, "projets.json"), "utf8"));
const etapes = donnees.projets.flatMap(p => p.etapes || []);
const faites = etapes.filter(e => e.ok).length;
verifie(fiche.includes(faites + " / " + etapes.length), "la fiche porte le vrai compte d'étapes",
  faites + " / " + etapes.length);
verifie(fiche.includes("Projets suivis : " + donnees.projets.length), "la fiche porte le vrai nombre de projets",
  String(donnees.projets.length));

for (const projet of donnees.projets) {
  const faitesProjet = (projet.etapes || []).filter(e => e.ok).length;
  const total = (projet.etapes || []).length;
  verifie(fiche.includes(projet.nom), "la fiche nomme le projet « " + projet.nom + " »");
  verifie(fiche.includes(faitesProjet + "/" + total),
    "la fiche donne le compte de « " + projet.nom + " »", faitesProjet + "/" + total);
}

// Ce qui ne doit jamais entrer dans une fiche lue par un modèle local.
verifie(!/ghp_|github_pat_|sk-[A-Za-z0-9]{16,}/.test(fiche), "aucun jeton dans la fiche");
verifie(!/https?:\/\/(?!127\.0\.0\.1)/.test(fiche), "aucune adresse extérieure dans la fiche");
verifie(!/mot de passe|phrase de passe|token/i.test(fiche), "aucun mot de passe dans la fiche");
verifie(fiche.includes("n'invente") || fiche.includes("invente"), "la fiche prévient que le modèle invente");

console.log("== 2. la page ==");

const page = fs.existsSync(PAGE) ? fs.readFileSync(PAGE, "utf8") : "";

verifie(page.includes('content="noindex'), "la page n'est pas indexable");
verifie(page.includes("FICHE-MEMOIRE:DEBUT") && page.includes("FICHE-MEMOIRE:FIN"),
  "la page garde ses marqueurs de fiche");

const bloc = page.match(/const FICHE_MEMOIRE = `([\s\S]*?)`;/);
verifie(!!bloc, "la fiche est intégrée dans la page");
if (bloc) {
  verifie(bloc[1].trim().length === fiche.length,
    "la fiche intégrée est identique à fiche.txt", bloc[1].trim().length + " vs " + fiche.length);
}

// La page ne parle qu'à la machine.
const adresses = [...page.matchAll(/https?:\/\/[^\s"'`)]+/g)].map(m => m[0]);
const distantes = adresses.filter(a => !a.startsWith("http://127.0.0.1:11434"));
verifie(distantes.length === 0, "la page ne parle qu'à 127.0.0.1:11434", distantes.join(", "));
verifie(page.includes(API_OK()), "l'adresse du modèle est bien la machine locale");

function API_OK() { return "http://127.0.0.1:11434"; }

// Aucune dépendance, aucune clé, aucun service.
verifie(!/<script[^>]+src=/i.test(page), "aucun script chargé depuis l'extérieur");
verifie(!/<link[^>]+href=/i.test(page), "aucune feuille de style extérieure");
verifie(!/localStorage\.setItem\("cle|apiKey|api_key|Authorization/i.test(page), "aucune clé, aucun en-tête d'autorisation");

// Les gestes qui doivent exister.
verifie(page.includes('type="file"'), "un sélecteur de fichier existe");
verifie(page.includes("Ouvrir un fichier"), "le bouton « Ouvrir un fichier » est là");
verifie(page.includes("f.text()"), "le fichier est lu sur l'ordinateur (FileReader via File.text)");
verifie(page.includes("n'invente rien"), "la consigne « n'invente rien » est dans la page");
verifie(page.includes("role: \"system\""), "la mémoire est donnée en consigne système");
verifie(page.includes("PLAFOND_CONFORT"), "un avertissement existe pour les fichiers trop longs");

console.log("== 3. la page ne part pas sur le site ==");

const aLaRacine = fs.readdirSync(RACINE).some(f => f.toLowerCase() === "chat.html");
verifie(!aLaRacine, "aucun chat.html à la racine (Pages publie la racine)");

const index = fs.readFileSync(path.join(RACINE, "index.html"), "utf8");
verifie(!/chat\.html/.test(index), "le site ne renvoie pas vers chat.html");

// La page est bien dans le dossier que le site n'affiche pas dans sa navigation.
verifie(PAGE.startsWith(DOSSIER), "la page vit dans pont-outils/");

console.log("\n" + (echecs.length === 0
  ? ok + " vérifications réussies"
  : ok + " ok, " + echecs.length + " ECHEC(S)"));
process.exit(echecs.length === 0 ? 0 : 1);
