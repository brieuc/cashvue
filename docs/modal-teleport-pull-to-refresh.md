# Modale et pull-to-refresh : `Teleport` et `overscroll-behavior`

## Symptôme

Dans `EntryModal`, le scroll horizontal de `TagFilter` (`SelectedTag` / `TagSelection`) ne marchait **parfois** pas. À la place, on voyait `EntryList` bouger derrière la modale, comme si c'était la fenêtre du fond qui recevait le geste.

## Cause

### Position à l'écran ≠ position dans le DOM

`EntryModal` est en `position: fixed`. **Visuellement**, elle passe au-dessus de tout. Dans le **DOM**, elle restait pourtant enfant de `PullToRefresh` :

```
HomeView
└── PullToRefresh (.pull-root)   ← écoute touchstart / touchmove
    └── EntryList
        └── EntryModal           ← position: fixed, mais toujours DANS .pull-root
```

Les événements DOM (`touchstart`, `touchmove`, `click`…) **remontent l'arbre du DOM** (bubbling), sans tenir compte de la position CSS. Un doigt posé sur un tag de la modale déclenchait donc aussi les handlers de `PullToRefresh`.

### Ce que faisait `PullToRefresh`

```ts
const onTouchStart = (e: TouchEvent) => {
  if (isRefreshing.value || (root.value?.scrollTop ?? 0) > 0) return
  startY = e.touches[0].clientY
  pulling.value = true                       // ① la liste est en haut → on « tire »
}

const onTouchMove = (e: TouchEvent) => {
  if (!pulling.value) return
  const delta = e.touches[0].clientY - startY
  if (delta <= 0 || ...) { ...; return }
  if (e.cancelable) e.preventDefault()       // ② bloque TOUT scroll natif, y compris horizontal
  pullDistance.value = Math.min(delta * RESISTANCE, MAX_PULL)  // ③ pousse la liste vers le bas
}
```

1. Si la liste des écritures est **tout en haut** (`scrollTop === 0`), le toucher démarre un « tirage ».
2. Dès que le doigt descend d'un pixel (`delta > 0`), `preventDefault()` **annule le scroll natif**. Le scroll horizontal des tags est donc bloqué.
3. `pullDistance` augmente, l'indicateur grandit et **pousse `EntryList` vers le bas**. C'est le mouvement visible derrière la modale.

### Pourquoi « parfois »

Les deux conditions doivent être réunies :
- la liste des écritures est scrollée **tout en haut** ;
- le swipe horizontal part un peu **en diagonale vers le bas**.

Un swipe parfaitement horizontal, ou qui remonte, ne déclenchait rien.

## Correctif

### 1. `<Teleport to="body">` dans `EntryList.vue`

```vue
<Teleport to="body">
  <EntryModal :is-open="isModalOpen" :entry="selectedEntry"
    @close="isModalOpen = false" @submit="handleSubmit" />
</Teleport>
```

`Teleport` rend le contenu **ailleurs dans le DOM** (ici directement sous `<body>`), tout en le laissant **au même endroit dans l'arbre des composants Vue** :

| Aspect | Effet du Teleport |
|---|---|
| DOM | La modale est sous `<body>`, hors de `.pull-root` → les touches ne remontent plus au pull-to-refresh |
| Props / emits | Inchangés : `EntryList` reste le parent Vue, `:entry`, `@submit`, `@close` fonctionnent pareil |
| Réactivité, `provide/inject` | Inchangés (ils suivent l'arbre de composants, pas le DOM) |
| Styles `scoped` | Fonctionnent toujours (les attributs `data-v-xxx` sont posés sur les éléments, où qu'ils soient) |
| CSS hérité du parent | La modale n'hérite plus des styles des conteneurs DOM d'`EntryList` (ici aucun impact) |

Autre bénéfice : une modale `fixed` placée dans un conteneur qui a un `transform`, un `filter` ou un `overflow` peut être rognée ou mal positionnée. Sous `<body>`, ce risque disparaît. C'est la pratique standard pour les modales en Vue.

### 2. `overscroll-behavior: contain` sur `.modal` (`EntryModal.vue`)

```css
.modal {
  max-height: 95vh;
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

Par défaut, quand un conteneur scrollable arrive en butée (tout en haut ou tout en bas), le navigateur **transmet le scroll au conteneur parent**, puis à la page : c'est le *scroll chaining*. `contain` limite le scroll à la modale. Arrivé au bout, il ne se propage plus et ne déclenche pas non plus le rebond ou le pull-to-refresh natif du navigateur.

## Alternative écartée

Faire ignorer les modales dans `PullToRefresh.onTouchStart` :

```ts
if ((e.target as Element).closest('.modal-overlay')) return
```

Ça fonctionne, mais ça dépend d'un nom de classe CSS et il faudrait y penser pour chaque nouvelle modale placée sous `PullToRefresh`. Le `Teleport` règle la cause plutôt que le symptôme.

## Piste d'amélioration non appliquée

`PullToRefresh` pourrait ne démarrer le tirage que pour un geste **majoritairement vertical** (`|dy| > |dx|`). Ça éviterait des faux déclenchements pendant un swipe horizontal dans la liste elle-même, hors modale.

## À retenir

- `position: fixed` change l'**affichage**, pas la **place dans le DOM**. Les événements suivent le DOM.
- Une modale placée sous un composant qui intercepte des gestes (`touchmove` + `preventDefault`) doit être **téléportée** hors de ce composant.
- Sur un conteneur scrollable dans une modale, `overscroll-behavior: contain` évite que le scroll « fuie » vers la page derrière.
