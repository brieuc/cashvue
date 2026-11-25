# EntryModal : groupes de tags et réaction aux changements de tags

Notes de session (novembre 2026).

---

## 1. Référence ou copie d'un tableau

```ts
form.tags = tagGroup.tags ?? [];                            // même tableau (référence partagée)
selectedTagsFromTagGroup.value = [...tagGroup.tags ?? []];  // nouveau tableau (copie superficielle)
```

- **Référence** : `form.tags` et `tagGroup.tags` désignent le même tableau. Un `push` ou un `splice` sur l'un modifie l'autre.
- **Copie superficielle** : le tableau est nouveau, mais les objets `TagDto` qu'il contient sont partagés.
- `TagFilter` remplace toujours le tableau, il ne le modifie jamais sur place. Le partage de référence ne pose donc pas de problème en pratique.
- Deux tableaux distincts ne sont jamais `===`. Il faut **comparer les ids**.

### Comparer deux listes de tags (sans tenir compte de l'ordre)
```ts
const sameAsTagGroup = tags?.length === selectedTagsFromTagGroup.value?.length
  && !!tags?.every(t => selectedTagsFromTagGroup.value?.some(s => s.id === t.id));
```

---

## 2. Signature d'un `watch`

```ts
watch(() => form.tags, (tags, oldTags, onCleanup) => { … });
```

- `tags` = nouvelle valeur, `oldTags` = valeur précédente, `onCleanup` = permet d'annuler un traitement asynchrone (par exemple un fetch en cours).
- Avec un getter sans `deep`, le watch ne se déclenche **que si le tableau est remplacé**. Un `push` sur place ne le déclenche pas.
- Avec `deep: true` et une modification sur place, `tags === oldTags` : on ne peut pas les comparer.
- Avec `immediate: true`, `oldTags` vaut `undefined` au premier appel.

---

## 3. `watch` ou `@update:model-value` : surveiller une donnée ou écouter une action

### L'idée en une phrase
- Un **`watch`** surveille **une donnée**. Il se déclenche dès que la valeur change, **quelle que soit l'origine** du changement : l'utilisateur, le code, l'initialisation, un reset…
- Un **écouteur d'événement** (`@update:model-value`, `@entries-changed`, `@select`…) réagit à **une action** : il se déclenche seulement quand **un composant enfant précis** émet l'événement. Si le parent change la donnée lui-même, l'écouteur ne se déclenche pas.

Pour choisir, la question à se poser est : *« je dois réagir à la nouvelle valeur, d'où qu'elle vienne ? »* → `watch`. *« Je dois réagir à ce que l'utilisateur vient de faire dans tel composant ? »* → événement.

### Ce que cache `v-model`
`v-model` est un raccourci pour une prop et un écouteur :
```vue
<TagFilter v-model="form.tags" />
<!-- équivaut à -->
<TagFilter :model-value="form.tags" @update:model-value="v => form.tags = v" />
```
Côté enfant, `defineModel` déclare automatiquement la prop `modelValue` et l'emit `update:modelValue`. L'affectation `selectedTags.value = …` émet l'événement. Ajouter `@update:model-value="maFonction"` à côté de `v-model` ajoute simplement **un second écouteur** sur le même événement.

### Qui déclenche quoi : l'exemple de `form.tags` dans `EntryModal`
| Origine du changement | `watch(() => form.tags)` | `@update:model-value` sur `TagFilter` |
|---|---|---|
| L'utilisateur ajoute ou retire un tag dans `TagFilter` | ✅ | ✅ |
| `selectTagGroup` (affectation directe) | ✅ | ❌ |
| Ouverture d'une entry (`Object.assign(form, …)`) | ✅ | ❌ |
| Reset (cancel / submit) | ✅ | ❌ |

### Exemples du projet où le `watch` est le bon choix
- **Période → dates** (`HomeView`) : `watch([selectedPeriod, toDateNow], …)` calcule `startDate`/`endDate`. Il faut les recalculer **quelle que soit l'origine** : un choix de l'utilisateur dans `PeriodSelection`, mais aussi la période par défaut posée au chargement. Un écouteur d'événement raterait l'initialisation.
- **Tags → devise cible** (`HomeView`) : `watch(() => selectedTags, …, { deep: true })` déduit `targetCurrencyCode`. `selectedTags` est modifié par deux sources : `EntryFilter` (v-model, qui remplace le tableau) et le watch `selectedTagFromTagGrid` (qui fait des `push`). Le `watch` couvre les deux. Le `deep: true` est **indispensable** à cause des `push` : sans lui, une modification sur place ne déclenche pas le watch (cf. section 2).
- **Filtres → requêtes** : `HeaderView` surveille ses props pour relancer `getComputation()`, et `EntryList` utilise un `watchEffect` pour recharger les entrées. Ces composants ne savent pas qui a changé le filtre, et n'ont pas besoin de le savoir.

### Exemples du projet où l'événement est le bon choix
- **Tags modifiés par l'utilisateur** (`EntryModal`) : on veut charger les groupes et proposer un titre quand l'utilisateur clique un tag, mais **pas** à l'ouverture d'une entry ni après `selectTagGroup` → `@update:model-value` (cf. section 4).
- **CRUD des entrées** (`EntryList` → `HomeView`) : `@entries-changed` est émis seulement après un create, un edit, un delete ou un duplicate. C'est une action, pas une donnée. `HomeView` la transforme ensuite en donnée (`entriesChanged++`), que `HeaderView` surveille avec un `watch`. On voit les deux mécanismes s'enchaîner : **événement → état → watch**.
- **Choix d'une période** (`PeriodSelection`) : en plus de son `v-model`, le composant émet `select` au clic. Aujourd'hui `HomeView` ne l'écoute pas. Pour réagir **uniquement** à un clic de l'utilisateur, par exemple fermer un panneau seulement dans ce cas et pas au chargement, `@select` serait le bon outil plutôt qu'un `watch(selectedPeriod)`.

### Un cas intermédiaire : un watch utilisé comme un événement
`TagGrid` transmet le groupe de tags cliqué via `v-model` → `selectedTagFromTagGrid`. Dans `HomeView`, un `watch` ajoute ces tags aux filtres, puis remet la valeur à `undefined` :
```ts
watch(selectedTagFromTagGrid, (tagsToAdd) => {
  if (!tagsToAdd?.length) return;
  // … push dans selectedTags / excludedTags
  selectedTagFromTagGrid.value = undefined;  // « consomme » l'action
});
```
Ça fonctionne, mais c'est une **action déguisée en donnée** : la ref ne sert qu'à transporter un clic, d'où la remise à `undefined` (sans elle, cliquer deux fois la même carte ne déclencherait rien). Un événement dédié (`emit('selectTags', tags)` → `@select-tags="addTags"`) exprimerait la même chose sans ref intermédiaire ni reset.

### Pièges à retenir
- **`watch` sans `deep`** sur un tableau : il ne voit que le **remplacement** du tableau, pas les `push`/`splice`.
- **Écouteur à côté de `v-model`** : utiliser l'**argument reçu**, sans relire la donnée du parent, pour ne pas dépendre de l'ordre d'exécution des écouteurs.
- **Ne pas cumuler** un `watch` et un écouteur pour la même logique : en cas d'action de l'utilisateur, les deux s'exécuteraient.
- **Un événement ne couvre jamais l'initialisation** : si une logique doit aussi tourner au chargement (comme les dates de la période), il faut un `watch` (avec `immediate: true` si nécessaire) ou un appel explicite.

---

## 4. Ne réagir qu'aux changements de tags faits par l'utilisateur

### Besoin
Le `watch(() => form.tags)` se déclenche pour **toute** modification :
- ouverture d'une entry existante (`Object.assign(form, getFormEntry(entry))`) ;
- reset du formulaire (cancel / submit) ;
- sélection d'un groupe de tags (`selectTagGroup`) ;
- ajout ou retrait d'un tag par l'utilisateur dans `TagFilter`.

On ne veut réagir **qu'au dernier cas**.

### Pistes écartées
- **Comparer les références** : `toRaw(tags) === toRaw(props.entry?.tags)`. Ça repose sur le fait que `getFormEntry` ne copie pas les tags, ce qui est fragile.
- **Drapeau `isInitializing`** : mis à `true` autour de l'`Object.assign`, puis remis à `false` au `nextTick`. Ça ajoute de l'état à maintenir.

### Solution retenue : écouter l'événement plutôt que la donnée
```vue
<TagFilter v-model="form.tags" @update:model-value="onTagsChanged" />
```
```ts
const onTagsChanged = (tags: TagDto[]) => {
  // uniquement sur action de l'utilisateur dans TagFilter
};
```

- **Rien à déclarer dans `TagFilter`** : `defineModel` crée automatiquement la prop `modelValue` et l'emit `update:modelValue`. Chaque `selectedTags.value = …` émet cet événement.
- `v-model` et `@update:model-value` coexistent : Vue appelle les deux écouteurs. Dans `onTagsChanged`, **utiliser l'argument reçu** plutôt que relire `form.tags`.
- Toute affectation directe de `form.tags` dans `EntryModal` (ouverture d'une entry, reset, `selectTagGroup`) **ne passe pas par `TagFilter`**. Elle n'émet donc rien, et `onTagsChanged` n'est pas appelé.
- Supprimer le `watch(() => form.tags)` si sa logique est déplacée dans `onTagsChanged`, sinon les deux s'exécutent.

### Conséquence pour `selectTagGroup`
La recherche du groupe correspondant et la suggestion de titre ne se font plus automatiquement après la sélection d'un groupe. Si on veut les garder, on les appelle directement. Le groupe sélectionné correspond forcément aux tags, donc `matchTagGroup` est inutile :
```ts
if (tagGroup.id != null) fetchTitleSuggestionsForTagGroup(tagGroup.id).then(s => titleSuggestions.value = s);
```
Le contournement `tagGroups.value = []` n'est plus nécessaire pour éviter le rechargement. On peut le garder pour masquer la liste des groupes après la sélection.
