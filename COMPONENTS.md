# Flux de données entre composants

Carte des liens parent → enfant : qui **fournit** la donnée (propriétaire / écrivain) et qui la **lit**.
À tenir à jour quand un `defineProps`, `defineModel` ou `defineEmits` change.

Légende :
- `:prop` → lecture seule côté enfant (parent = source)
- `v-model[:nom]` → bidirectionnel ; l'enfant **écrit** via `defineModel`
- `@event` → l'enfant notifie le parent, qui réagit
- **État partagé** : `usePeriods()` a un état au niveau du module (singleton : `periods` partagé entre `PeriodSelection` et `PeriodList`). `useEntries()` et `useComputation()` créent un état **local** à chaque appel.

---

## HomeView (`src/views/HomeView.vue`) — route `/`

Composant racine de l'écran principal : **propriétaire de tout l'état de filtrage**. Les enfants ne se parlent jamais directement, tout transite par HomeView.

### État détenu (refs)
| Ref | Écrite par | Lue par |
|---|---|---|
| `selectedPeriod` | `PeriodSelection` (v-model) | watcher → `startDate`/`endDate` |
| `toDateOnly` | `PeriodSelection` (v-model:to-date) | watcher → `endDate` |
| `startDate` / `endDate` (init `undefined`) | watcher `[selectedPeriod, toDateOnly]` (utilise `effectiveEndDate` si `toDateOnly`) — **seul endroit où les dates sont calculées** | `HeaderView`, `EntryList`, `TagGrid` |
| `selectedTags` | `EntryFilter` (v-model:tags), watcher `selectedTagFromTagGrid` (push) | `HeaderView`, `EntryList`, `TagGrid`, watcher → `targetCurrencyCode` |
| `excludedTags` | `EntryFilter` (v-model:excluded-tags), watcher `selectedTagFromTagGrid` (push) | `HeaderView`, `EntryList`, `TagGrid` |
| `excludeMode` | `EntryFilter` (v-model:exclude-mode) | watcher `selectedTagFromTagGrid` (choisit la liste cible) |
| `searchText` | `EntryFilter` (v-model:search-text) | `HeaderView`, `EntryList`, `TagGrid` |
| `activeCurrency` (init `'CHF'`) | `HeaderView` (v-model:currency — panneau visible du carrousel) | `EntryList` (`:filtering-currency`) |
| `targetCurrencyCode` (init `'CHF'`) | watcher `selectedTags` : devise du dernier tag qui en a une, sinon `'CHF'` | `HeaderView`, `TagGrid` |
| `entriesChanged` (compteur) | `EntryList` (`@entries-changed` → `++`) | `HeaderView` (`:entries-updated`) → recalcul des totaux |
| `showTagGrid` | `EntryList` (`@toggle-view` → true), `TagGrid` (`@toggle-view` → false) | bascule `EntryList` ⇄ `TagGrid` |
| `selectedTagFromTagGrid` | `TagGrid` (v-model) | watcher → ajoute le tag à `selectedTags` ou `excludedTags` selon `excludeMode` |

### Enfants
```
HomeView
├── PeriodSelection   v-model=selectedPeriod, v-model:to-date=toDateOnly
├── HeaderView        :start-date :end-date :selected-tags :excluded-tags :search-text
│                     :entries-updated=entriesChanged :target-currency-code
│                     v-model:currency=activeCurrency
├── EntryList (v-if !showTagGrid)
│                     :tags=selectedTags :excluded-tags :start-date :end-date :search-text
│                     :filtering-currency=activeCurrency
│                     @entries-changed @toggle-view
├── TagGrid (v-else)  :tags :excluded-tags :start-date :end-date :search-text :target-currency-code
│                     v-model=selectedTagFromTagGrid @toggle-view
└── EntryFilter       v-model:search-text v-model:tags v-model:excluded-tags v-model:exclude-mode
```

### Chaînes de données notables
- **Période** : `PeriodSelection` → `selectedPeriod` + `toDateOnly` → (watcher HomeView) `startDate/endDate` → `HeaderView`/`EntryList`/`TagGrid`. Aucun enfant ne connaît `selectedPeriod`, `toDateOnly` ni `effectiveEndDate`.
- Tant qu'aucune période n'est chargée, `startDate`/`endDate` valent `undefined` : `HeaderView`, `EntryList` et `TagGrid` ne lancent aucune requête.
- **Devise** : `HeaderView` (carrousel) → `activeCurrency` → `EntryList` (filtre côté client uniquement, pas de requête).
- **Devise cible** : `selectedTags` → `targetCurrencyCode` → `HeaderView`/`TagGrid` (conversion côté back). `EntryList` ne la reçoit pas.
- **Rafraîchissement des totaux** : `EntryList` CRUD → `emit('entriesChanged')` → `entriesChanged++` → `HeaderView` watch → `getComputation()`.
- `PeriodSelection` émet aussi `select` mais HomeView ne l'écoute pas (seul le v-model est utilisé).

---

## HeaderView (`src/components/header/HeaderView.vue`)

Parent : `HomeView`. Affiche un carrousel horizontal de panneaux de totaux.

### Entrées (props, toutes fournies par HomeView)
`startDate`, `endDate` (`string | undefined`, déjà calculées par HomeView), `selectedTags`, `excludedTags`, `entriesUpdated`, `searchText`, `targetCurrencyCode`.
Chacune (sauf `targetCurrencyCode`, non watchée) déclenche `getComputation()` → `useComputation().fetchComputation` (état local). Garde : rien n'est envoyé si `startDate` ou `endDate` est `undefined`.

### Sortie
- `v-model:currency` (`defineModel<string|null>('currency')`) : **écrit** la devise du panneau visible (`null` pour le panneau « total ») → `HomeView.activeCurrency` → `EntryList`.

### Enfants (via `<component :is>` + `v-bind="panel.props"`, lecture seule)
| Enfant | Props | Source |
|---|---|---|
| `HeaderTotalPanel` | `nbEntries`, `totalAmount`, `currency` | `totalComputation` (numberOfEntries, totalAmount, targetCurrencyCode) |
| `HeaderCurrencyPanel` (×N) | `currencyCode`, `nbEntries`, `totalAmount` | `totalComputation.computationByCurrency[code]` |

État local : `activeIndex` (mis à jour par le scroll / les dots) → watcher → `currency`.

---

## EntryList (`src/components/entries/EntryList.vue`)

Parent : `HomeView`. Liste des écritures + création/édition/suppression.

### Entrées (props, fournies par HomeView)
| Prop | Usage |
|---|---|
| `tags`, `excludedTags`, `startDate`, `endDate`, `searchText` | paramètres de `fetchEntries` ; lus dans `watchEffect` → rechargement automatique à chaque changement. Dates `string \| undefined` : pas de chargement tant qu'elles sont `undefined` |
| `filteringCurrency` | filtre côté client de `filteredSortedEntries` (pas envoyé au back) |

### Sorties (emits vers HomeView)
- `entriesChanged` : après create (201), edit (200), delete (204), duplicate.
- `toggleView` : bouton 🏷 → affiche `TagGrid`.

### Données
`entries` / `currentPage` viennent de `useEntries()` (**état local**, non partagé). EntryList est donc la seule source de la liste ; les modifications locales (push/splice/remplacement) évitent un rechargement.

### Enfants
| Enfant | Fourni par EntryList | Remonté à EntryList |
|---|---|---|
| `EntryView` (×N) | `:entry` | `@duplicate`, `@duplicate-to-now`, `@delete` (payload `EntryDto`) |
| `EntryModal` | `:is-open=isModalOpen`, `:entry=selectedEntry` (null = création) | `@close`, `@submit` (payload `CreateEntryRequest`) |

`EntryModal` contient lui-même un `TagFilter v-model="form.tags"`.

---

## TagFilter (`src/components/filter/TagFilter.vue`)

Sélecteur de tags réutilisable dans les formulaires.
Parents : `EntryModal` (`v-model="form.tags"`), `RecurrenceModal` (`v-model="form.tags"`).
(⚠ Ce n'est **pas** le filtre de HomeView — celui-ci est `EntryFilter`.)

### Entrée / sortie
- `defineModel` (défaut, `Array<TagDto>`) : le parent fournit la liste, TagFilter la **remplace** (jamais de mutation en place).

### Enfants
| Enfant | Fourni par TagFilter | Remonté à TagFilter |
|---|---|---|
| `SelectedTag` | `:tags=selectedTags` | `@remove(tag)` → filtre le tag hors du modèle |
| `TagSelection` | `:selected-tags=selectedTags` | `@toggle(tags)` → remplace le modèle par la nouvelle liste |

`TagSelection` charge elle-même la liste de tous les tags (tri `sortingOrder:asc`) et calcule la nouvelle sélection ; TagFilter ne fait que la réassigner.

> `EntryFilter` (HomeView) utilise les mêmes briques (`SelectedTag` / `ExcludedTag`, `TagSelection`, `TextFilter`) mais avec 4 modèles nommés : `tags`, `excludedTags`, `searchText`, `excludeMode`.

---

## PeriodView (`src/components/periods/PeriodView.vue`)

Composant de présentation pur (aucun emit, aucun état).
Parent : `PeriodList` (route des périodes), `<PeriodView :period="period">` dans un `v-for`.

- Entrée : `period: PeriodDto` (lecture seule) → affiche `title`, `startDate`–`endDate`, icône si `hidden`.
- Le clic est géré par `PeriodList` (sur la `.card` parente) → ouvre `PeriodModal` avec `selectedPeriod`.
- Source des données : `PeriodList` lit `usePeriods().periods` (**singleton partagé** avec `PeriodSelection` de HomeView : une période créée/modifiée dans PeriodList est visible dans la barre de sélection).

---

## Composants à documenter ensuite
`PeriodSelection`, `EntryFilter`, `TagGrid`, `EntryModal`, `EntryView`, `TagSelection`, `SelectedTag`, `ExcludedTag`, `TextFilter`, `PeriodList`, `PeriodModal`, `Recurrence*`, `Tag*`, `Currency*` / `Rate*`.
