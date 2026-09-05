# Tutoriel — Rediriger vers /login en l'absence de token

*Version didacticiel de `docs/auth-router-guard.md` — mêmes conclusions, présentées comme une suite d'étapes à exécuter.*

## Objectif

À la fin de ce tutoriel :

- toute navigation vers une route protégée sans token redirige automatiquement vers `/login` ;
- après connexion, l'utilisateur retombe sur la page qu'il visait au départ ;
- un token qui expire en cours de session (401 renvoyé par l'API) déconnecte l'utilisateur et le renvoie vers `/login`.

## Point de départ

L'app n'a aujourd'hui aucune authentification :

- `src/router/index.ts` n'a ni route `/login`, ni `meta.requiresAuth`, ni `beforeEach`.
- Aucun store de token.
- `src/api/fetch-instance.ts` (le mutator réellement branché à Orval) n'ajoute pas de header `Authorization` et ignore les 401.
- `src/views/LoginView.vue` existe mais est vide.

Trois pièces à assembler, dans cet ordre : un store Pinia pour le token, un guard de routeur, et une gestion du 401 dans `fetch-instance.ts`. Le guard seul ne suffit pas : il ne vérifie que la *présence* d'un token en local, pas sa validité réelle. Un token expiré resterait "présent" et laisserait l'utilisateur coincé face à des appels API qui échouent en boucle sans jamais le renvoyer vers `/login` — d'où la troisième étape.

---

## Étape 1 — Créer le store d'authentification

Créer `src/stores/auth.ts` :

```ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const STORAGE_KEY = 'auth_token';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(STORAGE_KEY));

  const isAuthenticated = computed(() => token.value !== null);

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem(STORAGE_KEY, newToken);
  }

  function logout() {
    token.value = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  return { token, isAuthenticated, setToken, logout };
});
```

**Points d'attention :**

- La lecture de `localStorage` se fait au moment de la création du store : le token survit à un reload de page sans appel réseau.
- `isAuthenticated` teste juste la présence d'un token, pas sa validité — c'est le rôle de l'étape 4 de couvrir le cas d'un token présent mais invalide côté serveur.

✅ **Checkpoint** : ce store se teste isolément (import + appel de `setToken`/`logout`), avant même de toucher au routeur.

---

## Étape 2 — Déclarer les routes et leur statut

Dans `src/router/index.ts`, marquer les routes protégées avec `meta: { requiresAuth: true }` et ajouter la route `/login` :

```ts
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import { useAuthStore } from '../stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: '/tags',
    name: 'tags',
    component: () => import('../components/tags/TagList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/periods',
    name: 'periods',
    component: () => import('../components/periods/PeriodList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/recurrences',
    name: 'recurrences',
    component: () => import('../components/recurrences/RecurrenceList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
```

`meta.requiresAuth` explicite sur chaque route protégée (plutôt qu'un flag global inversé du type `meta: { public: true }`) colle au style existant, où les routes sont déjà déclarées une par une.

✅ **Checkpoint** : rien ne bloque encore la navigation à ce stade, on a juste posé les étiquettes que le guard va lire à l'étape suivante.

---

## Étape 3 — Ajouter le guard de navigation

Toujours dans `src/router/index.ts`, avant `export default router` :

```ts
router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  // Déjà connecté et on tente d'aller sur /login : renvoyer à l'accueil
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'home' };
  }
});
```

**Pourquoi ça fonctionne :**

- `to` est la route *d'origine* que l'utilisateur essayait d'atteindre (ex. `/tags`). Le guard annule cette navigation et redirige vers `/login`, mais transmet `to.fullPath` en query string (`/login?redirect=%2Ftags`) pour ne pas perdre la destination — utile à l'étape 4.
- `useAuthStore()` doit être appelé **à l'intérieur** de la fonction du guard, pas au niveau module : à ce stade `app.use(pinia)` a déjà eu lieu dans `main.ts`, donc c'est sûr, mais un appel top-level du fichier casserait si le router était importé avant l'installation de Pinia.

✅ **Checkpoint** : videz `localStorage` (`auth_token`) puis rechargez une route protégée (`/tags` par ex.) — vous devez atterrir sur `/login?redirect=%2Ftags`.

---

## Étape 4 — Exploiter le paramètre `redirect` dans `LoginView.vue`

Dans `src/views/LoginView.vue`, après un login réussi :

```ts
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

async function onLoginSuccess(token: string) {
  auth.setToken(token);

  const redirect = route.query.redirect;
  router.push(typeof redirect === 'string' ? redirect : '/');
}
```

**Pourquoi le test `typeof redirect === 'string'` :**

- `route.query.redirect` n'existe que si l'utilisateur est arrivé sur `/login` via le guard (ou via le 401 de l'étape 5, qui pose la même query). Une navigation directe vers `/login` laisse cette valeur à `undefined`.
- Vue Router type `route.query[key]` en `string | string[] | null` (une query peut être répétée dans l'URL). Le test protège l'appel à `router.push`, qui attend une chaîne.

✅ **Checkpoint** : reproduisez le scénario de l'étape 3 (`/login?redirect=%2Ftags`), connectez-vous — vous devez atterrir sur `/tags` et non sur `/`.

---

## Étape 5 — Gérer l'expiration du token (401) dans `fetch-instance.ts`

`src/api/fetch-instance.ts` est le seul mutator réellement branché à Orval (`fetch-mutator.ts` est du code mort). Deux ajouts : poser le header `Authorization`, et réagir à un 401.

```ts
import router from '../router';
import { useAuthStore } from '../stores/auth';

export const customFetch = async <T>(
  url: string,
  options?: RequestInit & { params?: Record<string, any> }
): Promise<T> => {
  const auth = useAuthStore();
  let finalUrl = `${import.meta.env.VITE_API_URL}${url}`;

  // ... construction de finalUrl avec options.params, inchangé ...

  const response = await fetch(finalUrl, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    auth.logout();
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
  }

  const data = response.ok ? await response.json() : undefined;

  return { data, status: response.status, headers: response.headers } as T;
};
```

**Pourquoi ce mécanisme est nécessaire en plus du guard**, et pas redondant avec lui :

| | Guard (étape 3) | Gestion 401 (étape 5) |
|---|---|---|
| Moment | Avant toute requête réseau | Après une réponse serveur |
| Vérifie | La *présence* d'un token en local | La *validité réelle* du token côté serveur |
| Cas couvert | Utilisateur sans token du tout ; retour `/login` → `/home` si déjà connecté | Token présent mais expiré/révoqué en cours de session |

Le guard traite le cas le plus fréquent (pas de token) sans coût réseau. Le 401 traite le cas plus rare — token présent mais invalide — que le guard ne peut structurellement pas voir.

✅ **Checkpoint** : simulez un token invalide (mettez n'importe quelle chaîne dans `auth_token` en localStorage) et déclenchez un appel API depuis une route protégée — vous devez être déconnecté et renvoyé vers `/login`.

---

## Récapitulatif — ordre d'exécution

1. `useAuthStore` (étape 1) — testable isolément.
2. Routes + `meta.requiresAuth` (étape 2).
3. Guard (étape 3) — se déconnecter doit déjà renvoyer vers `/login` sur n'importe quelle route protégée.
4. `LoginView.vue` lit `redirect` (étape 4) — la boucle login → destination d'origine fonctionne.
5. Header `Authorization` + gestion du 401 (étape 5) — couvre l'expiration en cours de session.

## Ce que ce tutoriel ne couvre pas

- Le refresh token / renouvellement silencieux (si le backend en propose un).
- Le endpoint et le contrat de login côté API (dépend de ce qu'expose le backend).
- Le stockage du token : `localStorage` est simple mais lisible par tout script (XSS). Un cookie `HttpOnly` géré par le serveur est plus sûr mais change l'architecture (plus de header `Authorization` à poser manuellement) — à évaluer selon le niveau d'exposition de l'app.
