# Audit CashVue — Architecture, Sécurité, TypeScript & Vue.js

*Audit du 2026-07-08 — branche `feature/tag_group`*

## Synthèse

L'application a de bonnes fondations : client API généré par Orval depuis l'OpenAPI (une seule source de vérité pour les types), composables par domaine métier, `tsconfig` strict complet, routes lazy-loadées, Docker multi-stage. Les points à traiter sont surtout :

1. **Le type-check du build ne vérifie rien** — 21 erreurs TypeScript réelles passent inaperçues (P0)
2. **Un bug de template dans `HomeView.vue`** casse silencieusement un binding (P0)
3. **Aucune authentification** sur une API qui expose des données financières personnelles (P0 si exposition au-delà du réseau local)
4. Beaucoup de code mort (composables, service worker, scaffold Vite) qui masque les vrais problèmes

---

## 🔴 Constats critiques (P0)

### 1. `npm run build` ne type-checke rien

Le script `build` exécute `vue-tsc --noEmit`, mais `tsconfig.json` est un fichier "solution" (`"files": []` + `references`). Dans cette configuration, `vue-tsc --noEmit` sans `--build` **ne vérifie aucun fichier** et sort en succès.

Preuve : `npx vue-tsc --noEmit` → exit 0, alors que `npx vue-tsc --noEmit -p tsconfig.app.json` → **21 erreurs**.

**Proposition** — dans `package.json` :

```json
"build": "vue-tsc --build && vite build",
"type-check": "vue-tsc --build"
```

### 2. Binding cassé dans `HomeView.vue` (ligne 9)

```html
<HeaderView :selected-period="selectedPeriod" :selected-tags="selectedTags" :search-text="searchText ":entries-updated="entriesChanged"></HeaderView>
```

Il manque un espace entre `"searchText "` et `:entries-updated`. ESLint le signale (`vue/no-parsing-error: missing-whitespace-between-attributes`). Conséquence probable : la prop `entriesUpdated` n'est pas bindée et le total du header ne se rafraîchit pas après ajout/modification d'une entrée.

### 3. API sans authentification

`openapi.json` ne déclare aucun `securityScheme`, le front ne gère aucun token/session, et l'API expose en lecture/écriture des données financières personnelles (`/entries`, `/computation`…).

**Propositions** (côté infra/backend, mais impacte le front) :
- Si usage strictement personnel : restreindre au réseau privé (VPN/Tailscale) ou mettre un **basic auth / OIDC au niveau du reverse proxy** (zéro changement de code).
- Sinon : ajouter une vraie authentification (session cookie `HttpOnly` + `SameSite`, ou OIDC). Côté front, centraliser la gestion du 401 dans `fetch-instance.ts` (redirection login).
- Dans tous les cas : **HTTPS obligatoire** en production.

---

## 🟠 Sécurité (P1)

### nginx.conf : aucun en-tête de sécurité

Le serveur ne pose ni en-têtes de sécurité, ni compression, ni cache. Proposition :

```nginx
server {
    listen 80;

    # En-têtes de sécurité
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; connect-src 'self'" always;
    # + HSTS si TLS terminé ici :
    # add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;

    location /cashtag/ {
        alias /app/;
        try_files $uri $uri/ /cashtag/index.html;

        # Cache long pour les assets hashés
        location ~* \.(js|css|woff2?)$ {
            add_header Cache-Control "public, max-age=31536000, immutable";
        }
    }

    location = /cashtag {
        return 301 /cashtag/;
    }
}
```

(La CSP est à ajuster : `connect-src` doit couvrir l'origine de l'API, `img-src` celle des uploads.)

### Dockerfile

- `FROM node:latest` : non reproductible et surface de vulnérabilités mouvante → épingler (`node:22-alpine`).
- `npm install` → **`npm ci`** (respecte le lockfile, builds reproductibles).
- **Pas de `.dockerignore`** : `COPY ./ .` embarque `node_modules` local, `.env`, `.git`, etc. dans le contexte de build. En créer un (`node_modules`, `dist`, `.git`, `*.md`, `.env*`…).
- `as build-stage` → `AS` (casse, warning BuildKit).
- Optionnel : image `nginxinc/nginx-unprivileged` pour ne pas tourner en root.

### `public/sw.js` : service worker orphelin et étranger au projet

- Il n'est **jamais enregistré** (`navigator.serviceWorker.register` absent du code) → code mort.
- Son contenu vient visiblement d'un autre projet : routes `/model/(food|sport|free)`, `/entry/YYYY-MM-DD`, qui ne correspondent pas à l'API CashVue (`/entries`, `/tags`, …), et pré-cache de `/` alors que l'app est servie sous `/cashtag/`.

**Proposition** : le supprimer. Si un mode offline est souhaité plus tard, repartir de `vite-plugin-pwa` (Workbox) plutôt que d'un SW manuel — et réfléchir à l'expiration du cache, car il s'agirait de mettre des données financières dans le cache navigateur.

### `fetch-instance.ts` : erreurs HTTP silencieuses

```ts
const data = response.ok ? await response.json() : undefined;
return { data, status, headers } as T;
```

- Une réponse 4xx/5xx renvoie `data: undefined` **casté en `T`** alors que les types générés déclarent `data` non-optionnel → le compilateur croit que `response.data.content` existe toujours (`useEntries.ts` ferait un `TypeError` sur une 500).
- Pas de timeout (`AbortSignal.timeout(...)`), pas de gestion centralisée des 401/403 (nécessaire dès qu'il y aura de l'auth).

**Proposition** :

```ts
const response = await fetch(finalUrl, { signal: AbortSignal.timeout(15_000), ...options, headers });
if (!response.ok) {
  throw new ApiError(response.status, await response.text().catch(() => ''));
}
```

…et laisser les composables attraper `ApiError` pour l'afficher à l'utilisateur.

### Divers

- **`console.log` de données sensibles** : `JSON.stringify(formData)`, entries, tags… partout (`EntryList`, `HeaderView`, `HomeView`, `EntryModal` avec un `onUpdated` de debug). À retirer, ou à stripper au build : `esbuild: { drop: ['console', 'debugger'] }` dans `vite.config.ts`.
- **npm audit** : 34 vulnérabilités (12 critical) — toutes dans les **devDependencies** (chaîne orval/vitest/vite). Aucune dépendance de production affectée (vue, pinia, vue-router sont sains), donc pas de risque runtime, mais mettre à jour l'outillage (`npm audit fix`, monter orval/vitest).
- **`.env` committés** : ils ne contiennent que des URLs, c'est acceptable. Garder en tête que **toute variable `VITE_*` finit en clair dans le bundle** — ne jamais y mettre de secret.
- `index.html` : `<html lang="">` vide, `<title>Vite App</title>`, et surtout `src="/src/main.js"` alors que le fichier est `main.ts` (ça fonctionne grâce à la résolution Vite, mais c'est trompeur). Corriger les trois.

---

## 🟠 Architecture (P1–P2)

### Points forts à conserver

- Orval + OpenAPI comme source de vérité des types API, client regénérable (`generate:api`).
- Un composable par domaine (`useEntries`, `useTags`, `usePeriods`, …) : bonne granularité.
- `tsconfig.app.json` exemplaire : `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, etc.
- Routes lazy-loadées, alias `@`, Docker multi-stage.

### Code mort à supprimer (masque les vrais problèmes)

| Fichier | Problème |
|---|---|
| `src/composables/useRates.ts` | Importe `@/services/rates` et des types (`UseRatesReturn`, `CreateRateRequest`…) **qui n'existent pas** → 4 des 21 erreurs de type. Jamais utilisé. |
| `src/composables/useApi.ts` | Importe `UseApiReturn` inexistant, tout son corps est commenté. Utilisé uniquement par `useRates`. |
| `src/api/fetch-mutator.ts` | Non branché (orval pointe `fetch-instance.ts`), contient un `any`. |
| `public/sw.js` | Voir section sécurité. |
| `src/stores/counter.ts` | Scaffold Vite. Pinia est installé mais jamais utilisé réellement. |
| `src/components/__tests__/HelloWorld.spec.ts` | Teste un composant supprimé → **`npm run test:unit` échoue**. |
| `src/components/icons/*`, `AboutView.vue` | Scaffold Vite. |
| Blocs commentés (`//import`, `/* watch */`, `onUpdated` de debug…) | Dans quasiment chaque fichier — le contrôle de version garde l'historique, autant nettoyer. |

### État partagé : remplacer le "compteur d'événements" par un store

`HomeView` sert de hub : `selectedPeriod`, `selectedTags`, `searchText` descendent en props sur 2–3 niveaux, et la synchronisation `EntryList → HeaderView` passe par un compteur incrémenté (`entriesChanged: number`) rebindé en prop. C'est ce montage fragile qui a rendu le bug du binding (P0 n°2) invisible.

**Proposition** : un store Pinia `useFilterStore` (période, tags, texte) + un store/état `entries`. `HeaderView` et `EntryList` lisent le store directement ; la mise à jour du total devient un simple recalcul réactif, sans compteur ni prop drilling. Pinia est déjà installé et initialisé — il ne demande qu'à servir.

### Autres propositions

- **Pages vs composants** : `/tags`, `/periods`, `/recurrences` routent vers `src/components/**/XxxList.vue`. Convention Vue : les cibles de routes vivent dans `src/views/` (`TagsView.vue`, …), les composants réutilisables dans `components/`.
- **Duplication des modales** : `EntryModal`, `TagModal`, `PeriodModal`, `RecurrenceModal` répètent overlay/header/submit/reset. Extraire un `BaseModal.vue` (slot pour le corps) et, si tu veux aller plus loin, un composable `useCrudList` (loading/error/fetch/add/edit générique) pour les 4 écrans de liste.
- **Erreurs invisibles pour l'utilisateur** : `error` de `useEntries` n'est jamais affiché ; les `.then()` sans `catch` (`fetchTagGroups`, `fetchComputation`, `editEntry`…) avalent les échecs réseau. Prévoir un affichage (bandeau/toast) branché sur les erreurs des composables.
- `scripts/fix-generated-params.js` : hack post-génération Orval. Documenter son rôle dans le README, et vérifier si les versions récentes d'Orval permettent de s'en passer (sérialiseur de query params custom).

---

## 🟡 TypeScript (P1)

### Les 21 erreurs masquées (extraits significatifs)

- **`EntryList.vue:16`** — `:entry="selectedEntry"` passe `EntryDto | null` à une prop `EntryDto | undefined`. Choisir **`undefined`** partout pour les props Vue (`ref<EntryDto>()` au lieu de `ref<EntryDto | null>(null)`).
- **`EntryList.vue:16`** — `@submit="handleSubmit"` : la modale émet `CreateEntryRequest` (`amount: number | null`) mais le handler attend `EntryDto` (`amount: number`). Le formulaire et le DTO sont deux types différents : garder un type `EntryFormModel` pour le formulaire et **convertir explicitement au submit** (valider que `amount != null` à ce moment-là, ce qui supprime aussi le `as number` de `getFormEntry`).
- **`EntryModal.vue:44`** — `form.tags = group.tags` : `TagDto[] | undefined` assigné à `TagDto[]`.
- **`TagModal.vue:78`** — `undefined` assigné à `number` (`sortingOrder`).
- **`useApi.ts` / `useRates.ts`** — imports de types/modules inexistants (→ suppression, cf. architecture).
- Le reste : variables/imports inutilisés (`watch`, `createEntry`, `error`, `newPeriod`, …), signalés aussi par ESLint.

### Habitudes à corriger

- **Assertions non-nulles** : `tagDto.id!`, `selectedEntry.value.id!`, casts `as T`/`as number`. Préférer des gardes (`filter((id): id is number => id != null)` est déjà utilisé au bon endroit dans `EntryModal` — généraliser).
- **`catch (e)` → concaténation d'objet** : `'Erreur lors du chargement ' + e` produit `[object Object]`. Utiliser `e instanceof Error ? e.message : String(e)`.
- **ESLint trop laxiste** :
  - `pluginVue.configs['flat/essential']` → passer à **`'flat/recommended'`** (ordre des attributs, conventions de template).
  - Envisager `tseslint.configs.recommendedTypeChecked` pour attraper les promesses flottantes (`no-floating-promises` aurait signalé plusieurs `.then()` sans catch).
  - Le script `lint` fait `eslint . --fix` d'office : séparer `"lint": "eslint ."` (CI) et `"lint:fix": "eslint . --fix"`.
- **Aucune vérification automatisée** : ni CI ni hook. Au minimum, un hook pre-commit (ou une GitHub Action) qui enchaîne `type-check` + `lint` + `test:unit` — les trois sont actuellement cassés ou muets sans que rien ne le signale.

---

## 🟡 Vue.js (P2)

### Réactivité et effets

- **`watchEffect` de `EntryList` sans debounce ni annulation** : chaque frappe dans la recherche déclenche un `getEntries`. Les réponses peuvent revenir dans le désordre (race condition) et écraser la liste avec un résultat périmé. Proposition : debounce (~300 ms) + `AbortController` passé au fetch (le cleanup de `watchEffect` via `onWatcherCleanup`/argument `onCleanup` est fait pour ça).
- **`defaultForm` défini au niveau module** (`EntryModal.vue`) :
  - `accountingDate` est calculée **une fois au chargement de l'app** → une PWA laissée ouverte propose la date de la veille.
  - `tags: []` est **partagé par référence** : `Object.assign(form, defaultForm)` (sans spread, dans `handleSubmit` ligne 204) fait pointer `form.tags` sur le tableau du module — une mutation ultérieure polluerait tous les resets (cf. ta note `docs/spread-et-copies.md`).
  - Proposition : une factory `const makeDefaultForm = (): EntryFormModel => ({ ..., accountingDate: localDatetimeNow(), tags: [] })` et `Object.assign(form, makeDefaultForm())` partout.
- **Le watcher `form.tags` écrase le titre saisi** : `form.title = titleSuggestions.value[0]?.title ?? ''` remplace la saisie de l'utilisateur si les tags changent après coup. Ne pré-remplir que si `form.title` est vide (ou si le titre courant vient d'une suggestion).
- Les **props destructurées** (`const { startDate } = defineProps`) sont utilisées correctement avec `watch(() => x)` — bien vu (cohérent avec `docs/vue-props-reactivity.md`). Attention seulement : ce comportement exige Vue ≥ 3.5, verrouillé par le `package.json` actuel.

### Template et DOM

- **DOM direct** : `document.querySelector('[data-entry-id]')` dans `EntryList`. Utiliser des refs de template dans le `v-for` (`useTemplateRef` / fonction ref) — plus robuste, et compatible avec le scoping des styles.
- `App.vue` : le `setTimeout(... window.scrollTo(40))` au montage est un hack fragile (probablement pour masquer le nav sur mobile). À remplacer par du CSS/layout, ou à documenter.
- Deux boutons "submit" dans `EntryModal` (le bouton header `@click="handleSubmit"` et le `@submit.prevent` du form) : le bouton header est `type="submit"` mais **hors du `<form>`**, donc il ne bénéficie pas de la validation native (`required` sur la date et la devise n'est vérifié que via le submit du form). Utiliser l'attribut `form="entry-form"` sur le bouton, ou tout passer par `requestSubmit()`.
- Mélange FR/EN dans l'UI ("Mes Dépenses" / "New Entry" / "Cancel") et dans les commentaires. À unifier (ou préparer un vrai i18n si besoin un jour).

### Tests

Couverture actuelle : zéro (l'unique spec référence un composant supprimé, la suite échoue). Cibles à meilleur rendement :
1. `useEntries` / `useTagGroups` avec un mock de `fetch` (contrats simples, logique de statut).
2. `EntryModal` : logique du toggle +/− sur le montant, reset du formulaire, émission de `submit`.
3. La fonction de matching `matchTagGroup` (facile à extraire et tester en pur).

---

## Plan d'action proposé

| Priorité | Action | Effort |
|---|---|---|
| **P0** | `build`/`type-check` → `vue-tsc --build` | 5 min |
| **P0** | Corriger `HomeView.vue:9` (espace manquant) | 1 min |
| **P0** | Décision auth + HTTPS avant toute exposition publique | selon infra |
| **P1** | Supprimer le code mort (`useRates`, `useApi`, `fetch-mutator`, `sw.js`, `counter.ts`, spec cassé, scaffold) | 1 h |
| **P1** | Corriger les erreurs de type restantes (null/undefined, EntryFormModel) | 2–3 h |
| **P1** | `fetch-instance` : throw sur !ok, timeout, affichage des erreurs à l'utilisateur | 2 h |
| **P1** | nginx : en-têtes de sécurité + gzip + cache ; Dockerfile : pin + `npm ci` + `.dockerignore` | 1 h |
| **P1** | Retirer/stripper les `console.log` ; `npm audit fix` sur l'outillage | 30 min |
| **P2** | Store Pinia pour filtres + entries (supprime `entriesChanged` et le prop drilling) | 3–4 h |
| **P2** | Debounce + annulation de la recherche ; factory `makeDefaultForm` ; fix écrasement du titre | 2 h |
| **P2** | ESLint `flat/recommended` + type-checked, scripts lint/lint:fix, hook ou CI | 1 h |
| **P2** | Premiers tests unitaires (composables + EntryModal) | 3 h |
| **P3** | `index.html` (lang, title, main.ts), pages dans `views/`, `BaseModal`, unification FR/EN | au fil de l'eau |
