/// <reference types="vite/client" />

import router from "@/router";
import { useAuthStore } from "@/stores/auth";

export const customFetch = async <T>(
  url: string,
  options?: RequestInit & { params?: Record<string, any> }
): Promise<T> => {
  const auth = useAuthStore();
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
      ...(options?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      ...options?.headers,
    },
  });

  if (response.status === 403) {
    auth.clear();
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
  }

  const data = response.ok ? await response.json() : undefined;

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
};
