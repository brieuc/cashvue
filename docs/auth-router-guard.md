# Redirection vers /login en l'absence de token

*Doc du 2026-08-17 — branche `feature/tag_group`*

## Contexte

L'app n'a aujourd'hui **aucune authentification** (cf. `docs/audit-architecture-securite.md`, constat P0 n°3) :

- `src/router/index.ts` : aucune route `/login`, aucun `meta.requiresAuth`, aucun `beforeEach`.
- Aucun store de token (le seul store Pinia est `src/stores/counter.ts`, le scaffold Vite inutilisé).
- `src/api/fetch-instance.ts` (celui réellement branché à Orval) n'ajoute pas de header `Authorization` et ne gère pas les 401.
- `src/views/LoginView.vue` existe mais est un fichier vide (stub).

Cette doc décrit comment brancher `LoginView.vue` au routeur pour que toute navigation sans token redirige automatiquement vers l'écran de login, et comment garder ce comportement cohérent quand un token expire en cours de session.

## Vue d'ensemble

Trois pièces à assembler :

1. **Un store Pinia `useAuthStore`** — source de vérité pour le token, persisté en `localStorage`.
2. **Un `router.beforeEach`** — bloque la navigation vers les routes protégées si pas de token, redirige vers `/login`.
3. **Un branchement dans `fetch-instance.ts`** — pour couvrir le cas où le token existe mais est expiré/invalide côté serveur (le guard seul ne voit que l'état local, pas la validité réelle).

Sans le point 3, un token périmé laisserait l'utilisateur "coincé" : le guard le laisse passer (il y a bien une valeur en local storage) mais tous les appels API échouent en 401 sans jamais renvoyer vers `/login`.

### Pourquoi deux mécanismes de redirection

Le guard (point 2) et la gestion du 401 (point 3) sont complémentaires, pas redondants : ils interviennent à des moments différents et couvrent des scénarios différents.

- **Le guard est un contrôle local, avant toute requête réseau.** `auth.isAuthenticated` ne vérifie que la présence d'un token en `localStorage`, sans appel serveur. Il bloque la navigation avant même que le composant de la route protégée soit monté et déclenche ses appels API. Pour un utilisateur sans token du tout, ça évite le montage du composant, l'affichage transitoire de son état de chargement, et l'aller-retour réseau qui se solderait de toute façon par un 401.
- **Le 401 est la source de vérité côté serveur, après coup.** Le guard ne peut voir que la présence du token, pas sa validité réelle : un JWT expiré ou révoqué reste "présent" en local. Seul un appel API peut détecter cette invalidité — c'est le scénario d'un utilisateur déjà connecté dont le token devient invalide en cours de session.
- **Le guard couvre aussi un cas hors de portée du 401** : la redirection depuis `/login` vers `/home` pour un utilisateur déjà authentifié (deuxième condition du `beforeEach`) n'est déclenchée par aucun appel API. De même, une page protégée qui ne fait aucun appel réseau au montage ne serait jamais protégée si on ne comptait que sur la gestion des erreurs HTTP.

En résumé, le guard traite le cas le plus fréquent (pas de token du tout) de façon immédiate et sans coût réseau ; le 401 traite le cas plus rare mais réel (token présent mais invalide côté serveur) que le guard ne peut structurellement pas détecter.

## 1. Store d'authentification

`src/stores/auth.ts` (nouveau fichier) :

```ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

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

Points d'attention :

- `localStorage.getItem` au moment de la création du store : le token survit au reload de page sans appel réseau supplémentaire.
- `isAuthenticated` teste juste la *présence* d'un token, pas sa validité (un JWT expiré est toujours "présent"). La validité réelle est vérifiée par le serveur — d'où le point 3.
- Si le backend renvoie une expiration (`exp` d'un JWT, ou une date en réponse du login), on peut enrichir `isAuthenticated` pour comparer à `Date.now()` et éviter une navigation "optimiste" qui échouera de toute façon au premier appel API.

## 2. Routes et guard

`src/router/index.ts` :

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

export default router;
```

**Rôle de `to.fullPath` dans la redirection** : dans `return { name: 'login', query: { redirect: to.fullPath } }`, `to` désigne la route *d'origine* que l'utilisateur essayait d'atteindre (ex. `/tags`), pas la page de login. Le guard annule cette navigation et la remplace par `/login`, mais transmet `to.fullPath` en query string pour conserver la destination initiale — l'URL affichée devient `/login?redirect=%2Ftags`. Cette information permet à `LoginView.vue` de renvoyer l'utilisateur vers sa destination d'origine après connexion, plutôt que systématiquement vers `/`.

**Traitement du `redirect` dans `LoginView.vue`** :

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

Le `router.push` pointe vers la valeur de `route.query.redirect` quand elle existe (par exemple `/tags` si c'est cette route qui a déclenché la redirection initiale, `/periods` si c'était celle-là), et vers `/` sinon — la destination est posée dynamiquement par le guard, pas codée en dur dans `LoginView.vue`.

`route.query.redirect` n'est présente que si l'utilisateur est arrivé sur `/login` via le guard (ou via le traitement du 401 du point 3, qui pose la même query). Une navigation directe vers `/login` (lien direct, favori, URL tapée à la main) laisse `route.query.redirect` à `undefined`. Le typage de `route.query[key]` par Vue Router est `string | string[] | null` (une query peut être répétée dans l'URL, `?redirect=a&redirect=b`), d'où le test `typeof redirect === 'string'` avant de la transmettre à `router.push`.

Notes :

- `meta.requiresAuth` est explicite sur chaque route plutôt qu'un flag global inversé (`meta: { public: true }` sur `/login` et `/about`) — plus lisible, mais l'un ou l'autre fonctionne. Le choix ici colle au style existant (routes déjà déclarées une par une).
- `useAuthStore()` doit être appelé **à l'intérieur** du guard (pas au niveau module) : à ce stade, `app.use(pinia)` a déjà eu lieu dans `main.ts`, donc c'est safe, mais un appel top-level du fichier casserait si le router était importé avant l'installation de Pinia.
- Après un login réussi, `LoginView.vue` doit lire `route.query.redirect` et y naviguer (`router.push(String(route.query.redirect ?? '/'))`), sinon l'utilisateur atterrit toujours sur `/` après connexion.

## 3. Gestion du 401 dans `fetch-instance.ts`

`src/api/fetch-instance.ts` est le seul mutator réellement branché à Orval (`fetch-mutator.ts` est du code mort, cf. audit). Deux ajouts :

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

C'est le même endroit que celui déjà repéré dans l'audit (`docs/audit-architecture-securite.md`, section "erreurs HTTP silencieuses") pour centraliser la gestion des erreurs HTTP — logique de rassembler les deux plutôt que de les traiter séparément.

## Ordre de mise en œuvre suggéré

1. Créer `useAuthStore` (point 1) — testable isolément.
2. Implémenter `LoginView.vue` : formulaire, appel à l'endpoint de login, `auth.setToken(...)`, puis `router.push(redirect ?? '/')`.
3. Ajouter le guard (point 2) — à ce stade, se déconnecter (vider `localStorage`) doit déjà renvoyer vers `/login` en rechargeant n'importe quelle route protégée.
4. Brancher le header + le 401 dans `fetch-instance.ts` (point 3) — couvre l'expiration en cours de session.

## Ce que cette doc ne couvre pas

- Le refresh token / renouvellement silencieux (si le backend en propose un).
- Le endpoint et le contrat de login côté API (dépend de ce qu'expose le backend — pas encore vu dans le code exploré).
- Le stockage du token : `localStorage` est simple mais vulnérable au XSS (le token est lisible par tout script). Une alternative plus sûre est un cookie `HttpOnly` géré par le serveur, mais cela change l'architecture (plus de header `Authorization` à poser manuellement, le navigateur l'envoie seul) — à évaluer selon le niveau d'exposition de l'app (cf. audit, "API sans authentification").
