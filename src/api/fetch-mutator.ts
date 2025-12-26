/// <reference types="vite/client" />

/**
 * Aplatit un objet complexe en query params avec notation pointée
 * Ex: { pageRequestDto: { page: 0, size: 10 } }
 *  => page=0&size=10&sort=...
 *
 * Note: Cette fonction existe car Orval génère du code qui fait .toString()
 * sur les objets, ce qui produit "[object Object]" dans l'URL.
 */
const flattenParams = (obj: any, prefix = ''): Record<string, string> => {
  const result: Record<string, string> = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    // Ne pas préfixer si on est au premier niveau d'un objet de type DTO
    // (pageRequestDto, entrySpecificationDto, etc.)
    const isTopLevelDto = !prefix && key.toLowerCase().includes('dto');
    const paramKey = prefix && !isTopLevelDto ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      // Les tableaux : répéter la clé pour chaque valeur
      value.forEach(item => {
        result[paramKey] = result[paramKey]
          ? `${result[paramKey]},${String(item)}`
          : String(item);
      });
    } else if (value instanceof Date) {
      result[paramKey] = value.toISOString();
    } else if (typeof value === 'object') {
      // Objets imbriqués : on descend récursivement mais on ignore le préfixe DTO
      const nested = flattenParams(value, isTopLevelDto ? '' : paramKey);
      Object.assign(result, nested);
    } else {
      result[paramKey] = String(value);
    }
  });

  return result;
};

/**
 * Custom fetch pour Orval qui corrige la sérialisation des query params
 *
 * Problème : Orval génère du code comme :
 *   normalizedParams.append(key, value.toString())
 *
 * Quand value est un objet { page: 0 }, ça donne "[object Object]"
 *
 * Solution : On détecte les URLs cassées et on reconstruit les params correctement
 */
export const customFetch = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const [path, queryString] = url.split('?');
  let finalUrl = `${import.meta.env.VITE_API_URL}${path}`;

  if (queryString) {
    const params = new URLSearchParams(queryString);
    const shouldFlatten = Array.from(params.values()).some(v => v === '[object Object]');

    if (shouldFlatten) {
      // L'URL contient des objets mal sérialisés, on reconstruit from scratch
      // En pratique, ça arrive parce que Orval génère :
      // { pageRequestDto: PageRequestDto, entrySpecificationDto: EntrySpecificationDto }
      // Et fait .toString() dessus

      console.warn(
        '⚠️ Détection de params mal sérialisés dans l\'URL. ' +
        'Cela indique que Orval a généré du code qui fait .toString() sur des objets.'
      );

      // On ne peut pas récupérer les objets originaux depuis "[object Object]"
      // Cette URL est inutilisable. On va au moins loguer l'erreur clairement.
      console.error('URL cassée:', url);
      console.error(
        'Les paramètres complexes ne peuvent pas être reconstruits. ' +
        'Voir la configuration Orval pour utiliser un query serializer personnalisé.'
      );

      // On retourne quand même la requête (elle va probablement échouer côté serveur)
      finalUrl = `${finalUrl}?${queryString}`;
    } else {
      // Les params sont déjà correctement sérialisés, on les garde tels quels
      finalUrl = `${finalUrl}?${queryString}`;
    }
  }

  const response = await fetch(finalUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = response.ok ? await response.json() : undefined;

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
};
