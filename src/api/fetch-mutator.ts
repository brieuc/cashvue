/// <reference types="vite/client" />

const flattenParams = (obj: any, prefix = ''): URLSearchParams => {
  const searchParams = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    const paramKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      value.forEach(item => searchParams.append(paramKey, String(item)));
    } else if (value instanceof Date) {
      searchParams.append(paramKey, value.toISOString());
    } else if (typeof value === 'object') {
      const nested = flattenParams(value, paramKey);
      nested.forEach((val, nestedKey) => searchParams.append(nestedKey, val));
    } else {
      searchParams.append(paramKey, String(value));
    }
  });

  return searchParams;
};

export const customFetch = async <T>(url: string, options?: RequestInit): Promise<T> => {
  // Parse l'URL pour extraire les query params
  const [path, queryString] = url.split('?');
  let finalUrl = `${import.meta.env.VITE_API_URL}${path}`;

  // Si des query params existent, les re-flatten correctement
  if (queryString) {
    const params = new URLSearchParams(queryString);
    const paramsObj: any = {};

    params.forEach((value, key) => {
      // Essaie de détecter si c'est un objet sérialisé incorrectement
      if (value === '[object Object]') {
        // Skip les objets mal sérialisés, ils devraient être passés correctement
        return;
      }

      // Reconstruction de l'objet à partir des clés avec points
      const keys = key.split('.');
      let current = paramsObj;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      if (current[lastKey]) {
        // Si la clé existe déjà, on en fait un tableau
        if (Array.isArray(current[lastKey])) {
          current[lastKey].push(value);
        } else {
          current[lastKey] = [current[lastKey], value];
        }
      } else {
        current[lastKey] = value;
      }
    });

    const flattened = flattenParams(paramsObj);
    const flattenedString = flattened.toString();
    if (flattenedString) {
      finalUrl += `?${flattenedString}`;
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
