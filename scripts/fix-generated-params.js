/**
 * Script qui corrige le code généré par Orval pour gérer correctement
 * la sérialisation des query params complexes.
 *
 * Problème : Orval génère du code qui fait .toString() sur les objets,
 * ce qui produit "[object Object]" dans l'URL.
 *
 * Solution : On remplace la logique de sérialisation pour aplatir
 * correctement les objets imbriqués.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generatedFilePath = path.join(__dirname, '../src/api/generated.ts');

console.log('🔧 Correction du code généré par Orval...');

let content = fs.readFileSync(generatedFilePath, 'utf-8');

// Injecter la fonction helper au début du fichier (après les imports)
const helperFunction = `
/**
 * Aplatit un objet complexe en query params avec notation pointée.
 * Cette fonction corrige le problème de sérialisation d'Orval.
 */
const flattenQueryParams = (obj: any, parentKey = ''): URLSearchParams => {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    // Pour les DTOs de premier niveau (pageRequestDto, entrySpecificationDto),
    // on ne préfixe pas avec leur nom, on descend directement dans leurs propriétés
    const isTopLevelDto = !parentKey && (
      key === 'pageRequestDto' ||
      key === 'entrySpecificationDto' ||
      key.toLowerCase().endsWith('dto')
    );

    if (isTopLevelDto && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      // On descend dans le DTO sans ajouter son nom comme préfixe
      const nested = flattenQueryParams(value, '');
      nested.forEach((val, nestedKey) => params.append(nestedKey, val));
      return;
    }

    const paramKey = parentKey ? \`\${parentKey}.\${key}\` : key;

    if (Array.isArray(value)) {
      // Pour les tableaux, on répète le paramètre
      value.forEach(item => {
        if (item !== null && item !== undefined) {
          params.append(paramKey, String(item));
        }
      });
    } else if (value instanceof Date) {
      params.append(paramKey, value.toISOString());
    } else if (typeof value === 'object') {
      // Objet imbriqué : récursion
      const nested = flattenQueryParams(value, paramKey);
      nested.forEach((val, nestedKey) => params.append(nestedKey, val));
    } else {
      params.append(paramKey, String(value));
    }
  });

  return params;
};
`;

// Insérer le helper après les imports (après "import { customFetch }")
const importRegex = /(import { customFetch } from '.\/fetch-mutator';)/;
content = content.replace(importRegex, `$1\n${helperFunction}`);

// Remplacer toutes les fonctions getGetXXXUrl qui construisent les query params
// Pattern à rechercher :
// const normalizedParams = new URLSearchParams();
// Object.entries(params || {}).forEach(([key, value]) => {
//   if (value !== undefined) {
//     normalizedParams.append(key, value === null ? 'null' : value.toString())
//   }
// });
// const stringifiedParams = normalizedParams.toString();

const oldSerializationPattern = /const normalizedParams = new URLSearchParams\(\);\s*Object\.entries\(params \|\| \{\}\)\.forEach\(\(\[key, value\]\) => \{\s*if \(value !== undefined\) \{\s*normalizedParams\.append\(key, value === null \? 'null' : value\.toString\(\)\)\s*\}\s*\}\);\s*const stringifiedParams = normalizedParams\.toString\(\);/g;

const newSerialization = `const normalizedParams = flattenQueryParams(params || {});
  const stringifiedParams = normalizedParams.toString();`;

content = content.replace(oldSerializationPattern, newSerialization);

// Écrire le fichier corrigé
fs.writeFileSync(generatedFilePath, content, 'utf-8');

console.log('✅ Code généré corrigé avec succès !');
console.log('   Les query params complexes seront maintenant correctement aplatis.');
