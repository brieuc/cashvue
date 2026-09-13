# watchEffect asynchrone + destructuration réactive des props (Vue 3.5)

## Le cas concret (EntryList.vue)

```typescript
const { filteringTags, startDate, endDate, searchText } = defineProps<{
  filteringTags: TagDto[];
  startDate: string,
  endDate: string,
  searchText: string
}>();

const loadEntries = async () => {
  const params: GetEntriesParams = {
      startDate: startDate,
      endDate: endDate,
      tagIds: filteringTags.map(tagDto => tagDto.id!),
      searchText: searchText,
      page: 0,
      size: 100
  };
  await fetchEntries(params)
}

watchEffect(async () => {
  loadEntries();
})
```

Question : ce `watchEffect` se relance-t-il à chaque changement de n'importe quel `ref`/état réactif du composant ?

**Non.** `watchEffect` ne traque que les dépendances réactives **lues de façon synchrone** pendant l'exécution du callback, jusqu'au premier `await` rencontré. Il ne "voit" pas tout l'état du composant, seulement ce qui est effectivement lu dans son corps.

## Pourquoi ça fonctionne quand même ici

Le callback du `watchEffect` ne fait qu'appeler `loadEntries()` — **sans `await`** devant l'appel. `loadEntries` est une fonction `async`, mais tout le code écrit avant son premier `await` s'exécute de façon **synchrone** dès l'appel :

```typescript
const loadEntries = async () => {
  const params: GetEntriesParams = {
      startDate: startDate,        // lecture synchrone
      endDate: endDate,            // lecture synchrone
      tagIds: filteringTags.map(...), // lecture synchrone
      searchText: searchText,      // lecture synchrone
      page: 0,
      size: 100
  };
  await fetchEntries(params) // ← la fonction "se met en pause" ici
}
```

Ces lectures de `startDate`, `endDate`, `filteringTags`, `searchText` se produisent donc **avant** la pause créée par `await`, donc pendant que Vue a encore le `watchEffect` actif comme "effet en cours de tracking". Elles sont enregistrées comme dépendances.

Résultat : ce `watchEffect` se relance uniquement quand `startDate`, `endDate`, `filteringTags` ou `searchText` changent — pas quand `entries`, `loading`, `error`, `isModalOpen`, `selectedEntry`, etc. changent, puisque ces derniers ne sont jamais lus dans le callback.

⚠️ Piège général avec `watchEffect(async () => {...})` : toute lecture réactive faite **après** un `await` n'est **plus** trackée (l'effet actif de Vue n'existe plus une fois que le micro-task a repris après la pause). C'est une limite connue des effets asynchrones dans Vue.

## Le rôle de Vue 3.5 : destructuration réactive des props

Le code lit directement `startDate`, `filteringTags`, etc. — des variables obtenues en **déstructurant** `defineProps()` :

```typescript
const { filteringTags, startDate, endDate, searchText } = defineProps<{...}>();
```

### Avant Vue 3.5

Déstructurer les props comme ça capturait des **valeurs figées** au moment de l'appel (perte de réactivité) :

```typescript
// ❌ avant 3.5 : startDate est une simple string, plus jamais mise à jour
const { startDate } = defineProps<{ startDate: string }>();
```

Dans ce cas, le `watchEffect` n'aurait lu qu'une valeur statique une seule fois, et ne se serait **jamais** relancé après le montage — même si le prop changeait vraiment côté parent.

### Depuis Vue 3.5

Le compilateur transforme cette déstructuration en accès réactifs sous le capot (équivalent à `props.startDate` à chaque lecture) :

```typescript
// ✅ depuis 3.5 : chaque lecture de startDate est un vrai accès réactif
const { startDate } = defineProps<{ startDate: string }>();
```

Donc chaque lecture de `startDate` dans `loadEntries()` redevient une vraie dépendance traquée par `watchEffect`, et le comportement redevient équivalent à un `watch` implicite sur ces 4 props.

C'est exactement ce que documentait le commentaire du code source :

```typescript
watchEffect(async() => {
  // runs only once before 3.5
  // re-runs when the "foo" prop changes in 3.5+
  loadEntries();
})
```

Ce projet utilise `vue@^3.5.18`, donc ce comportement "3.5+" s'applique.

## Résumé

- `watchEffect` traque uniquement les **lectures synchrones** faites avant le premier `await` du callback (ou de toute fonction appelée sans `await` depuis ce callback).
- Une écriture seule (`x.value = ...`) ne crée jamais de dépendance.
- Avant Vue 3.5, déstructurer `defineProps()` perdait la réactivité — un `watchEffect` lisant ces variables ne se relançait jamais.
- Depuis Vue 3.5, la déstructuration de `defineProps()` reste réactive : chaque lecture compte comme un vrai accès réactif, donc `watchEffect` (ou `watch`) réagit normalement aux changements de props.
- Voir aussi [[vue-watch-vs-watchEffect]] et [[vue-props-reactivity]] pour les bases du tracking de dépendances.
