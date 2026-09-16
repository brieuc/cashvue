# `HeaderView.vue`

## Rôle
Un carrousel horizontal (swipe / scroll-snap) de panneaux résumant les dépenses : un panneau "total", éventuellement un panneau "jusqu'à aujourd'hui" si la période est en cours, puis un panneau par devise étrangère détectée dans les résultats.

## Props (`HeaderView.vue:34-41`)
| Prop | Type | Rôle |
|---|---|---|
| `selectedPeriod` | `PeriodDto \| undefined` | Période affichée (dates début/fin) |
| `selectedTags` | `TagDto[]` | Filtre par tags |
| `entriesUpdated` | `number` | Compteur incrémenté ailleurs pour signaler qu'il faut recharger (pas de valeur métier, juste un trigger) |
| `searchText` | `string` | Filtre texte libre |

## État interne
- `scrollContainer` (ligne 46) — ref DOM vers `.header-scroll`, le conteneur qui scrolle horizontalement.
- `activeIndex` (ligne 47) — index du panneau actuellement visible, sert à surligner le bon point (`.header-dot.active`).
- Deux instances de `useComputation()` (lignes 43-44) : une pour le total sur toute la période (`totalComputation`), une pour le total "à ce jour" (`toDateComputation`). Chaque instance encapsule son propre `fetchComputation` + `computationResponse` (voir `useComputation.ts:4-18`) — elles sont indépendantes pour pouvoir afficher les deux chiffres en parallèle.

## D'où viennent les données : `useComputation`
`fetchComputation(request)` appelle l'API générée `compute(...)` et stocke la réponse dans `computationResponse` si le statut est 200 (`useComputation.ts:8-14`). Pas de gestion d'erreur — un échec ou un statut ≠ 200 laisse simplement l'ancienne valeur (ou `undefined`).

## Rechargement des données — les 4 `watch` (lignes 108-122)
Chacun de ces changements déclenche `getComputation(...)` :
- `searchText` change
- `entriesUpdated` change (nouvelle entrée ajoutée/supprimée ailleurs dans l'app)
- `selectedPeriod` change
- `selectedTags` change

`getComputation` (lignes 129-148) :
1. Si pas de `period`, ne fait rien.
2. Construit une requête `ComputationRequestDto` avec `targetCurrencyCode: "CHF"` **fixe en dur** — tous les montants sont convertis en CHF côté API.
3. Appelle toujours `fetchTotalComputation(request)`.
4. Si la période est en cours (`endDate` dans le futur), appelle aussi `fetchToDateComputation` avec la même requête mais `endDate` remplacé par l'instant présent (via `nowAsPeriodDate()`, ligne 125-127, qui formate la date locale en `YYYY-MM-DDTHH:mm:ss`).

## Construction des panneaux : `panels` (computed, lignes 66-106)
C'est le cœur du composant — une liste de `PanelDescriptor { key, component, props }` reconstruite à chaque changement des computations :

1. **Panneau "total"** (toujours présent) → `HeaderTotalPanel` avec `nbEntries`, `totalAmount` (valeur absolue via `absoluteAmount`, lignes 61-64 — évite d'afficher un montant négatif), `currency` = `targetCurrencyCode` de la réponse (donc "CHF", vu le hard-code ci-dessus).
2. **Panneau "to-date"** (seulement si `isPeriodOngoing` ET que `toDateComputation` a une valeur) → `HeaderToDatePanel`, mêmes props.
   - `isPeriodOngoing` (lignes 55-59) : vrai si `selectedPeriod.endDate` est dans le futur.
3. **Panneaux par devise** — parcourt `totalComputation.computationByCurrency` (un dict `code → détail`), trié par clé, et ajoute un `HeaderCurrencyPanel` par devise avec son propre `currencyCode`, `nbEntries`, `totalAmount`. C'est le détail par devise d'origine (avant conversion en CHF).

Les trois composants enfants (`HeaderTotalPanel`, `HeaderToDatePanel`, `HeaderCurrencyPanel`) sont de simples vues : ils affichent `nbEntries` + `formatAmount(totalAmount, currency)`, avec un label en plus pour les deux derniers.

## Le carrousel scroll-snap (template + CSS)
- `.header-scroll` (ligne 3) : `overflow-x: auto`, `scroll-snap-type: x mandatory` → chaque panneau (`.header-slide`, `flex: 0 0 100%`) occupe toute la largeur et s'accroche au scroll (`scroll-snap-align: start`). La scrollbar est masquée (`::-webkit-scrollbar { display: none }`).
- `@scroll="onScroll"` (ligne 3) déclenche `onScroll` (lignes 150-156) à chaque scroll : il recalcule `activeIndex = Math.round(scrollLeft / clientWidth)` — donc à combien de "largeurs d'écran" on a scrollé = quel panneau est actif.
- Les points en bas (`.header-dots`, affichés seulement `v-if="panels.length > 1"`) sont générés un par panneau ; celui dont l'index correspond à `activeIndex` reçoit la classe `active`.
- Cliquer un point appelle `scrollToPanel(index)` (lignes 158-165) qui fait un `scrollTo({ left: index * clientWidth, behavior: 'smooth' })` — donc navigation programmatique douce, en cohérence avec le scroll manuel.

## Points potentiellement surprenants
- `targetCurrencyCode: "CHF"` est codé en dur (ligne 138) — pas de prop ni de devise utilisateur configurable ici.
- Aucune gestion d'erreur réseau dans `useComputation` — un fetch qui échoue échoue silencieusement.
- `entriesUpdated` est un `number` utilisé uniquement comme signal de changement (pattern "bump a counter to trigger a watch"), sa valeur elle-même n'est jamais lue.
