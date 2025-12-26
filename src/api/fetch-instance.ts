export const customFetch = async <T>(
  url: string,
  options?: RequestInit & { params?: Record<string, any> }
): Promise<T> => {
  let finalUrl = `${import.meta.env.VITE_API_URL}${url}`;

  // Convertir les params en query string
  if (options?.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          // Aplatir les objets imbriqués
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (subValue !== undefined && subValue !== null) {
              searchParams.append(`${key}.${subKey}`, String(subValue));
            }
          });
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    finalUrl += `?${searchParams.toString()}`;
  }

  const response = await fetch(finalUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) throw new Error(response.statusText);
  return response.json();
};
