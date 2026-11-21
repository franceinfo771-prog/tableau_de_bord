/* Sert le vrai projets.json aux pages rendues hors navigateur.
   Depuis que index.html ne porte plus de copie des données (décision du
   21/11), un script qui rend la page sans nourrir fetch obtient un tableau
   vide — et croit à une régression alors que la page fonctionne. */
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const PROJETS = fs.readFileSync(path.join(RACINE, 'projets.json'), 'utf8');

/** fetch de test : projets.json répond, tout le reste est injoignable. */
function fetchDeTest() {
  return (url) => {
    if (String(url).includes('projets.json')) {
      return Promise.resolve({
        ok: true, status: 200,
        json: () => Promise.resolve(JSON.parse(PROJETS)),
        text: () => Promise.resolve(PROJETS),
      });
    }
    return Promise.resolve({
      ok: false, status: 404,
      json: () => Promise.reject(new Error('404')),
      text: () => Promise.resolve(''),
    });
  };
}

module.exports = { fetchDeTest, PROJETS };
