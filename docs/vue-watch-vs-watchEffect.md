# Watch vs WatchEffect dans Vue 3

## `watch` sans `immediate`

```typescript
watch(() => props.entry, (entry) => {
  console.log('entry a changé!', entry)
})
```

Le callback s'exécute **uniquement quand `props.entry` change**, pas au premier rendu. Si `props.entry` a déjà une valeur au montage, tu ne la vois pas.

## `watch` avec `immediate: true`

```typescript
watch(() => props.entry, (entry) => {
  console.log('entry a changé!', entry)
}, { immediate: true })
```

Le callback s'exécute **immédiatement au montage** + à chaque changement ensuite.

## `watchEffect`

```typescript
watchEffect(() => {
  console.log('entry:', props.entry)
})
```

- S'exécute **immédiatement** (comme `immediate: true`)
- Traque **automatiquement** toutes les dépendances réactives utilisées dans le callback
- Se ré-exécute dès que **n'importe quelle** dépendance change

## Tableau comparatif

| | Exécution initiale | Dépendances |
|---|---|---|
| `watch` | Non | Explicites (tu choisis quoi surveiller) |
| `watch` + `immediate` | Oui | Explicites |
| `watchEffect` | Oui | Automatiques (tout ce qui est lu dans le callback) |

## Exemple avec plusieurs refs

```typescript
const a = ref(1)
const b = ref(2)
const c = ref(3)

watchEffect(() => {
  console.log(a.value, b.value)
  // Vue traque automatiquement a et b car ils sont lus ici
  // c n'est pas traqué car jamais lu
})

a.value = 10  // → déclenche le watchEffect
b.value = 20  // → déclenche le watchEffect
c.value = 30  // → rien, c n'est pas une dépendance
```

## Lecture vs Écriture dans watchEffect

Vue traque uniquement les **lectures**, pas les **écritures**.

```typescript
const a = ref(1)
const b = ref(0)

watchEffect(() => {
  b.value = a.value * 2  // lit a, écrit b
})

a.value = 5  // → déclenche (a est lu)
b.value = 99 // → ne déclenche PAS (b est seulement écrit, jamais lu)
```

### Attention aux boucles infinies

Si tu **lis ET écris** la même ref :

```typescript
const count = ref(0)

watchEffect(() => {
  count.value = count.value + 1  // ⚠️ lit ET écrit count
  // → boucle infinie!
})
```

Vue détecte ça et te balance une erreur pour éviter de faire planter le navigateur.

## Résumé

- **Lecture** → crée une dépendance → re-déclenche si ça change
- **Écriture seule** → pas de dépendance → ne déclenche rien
- `watchEffect` est plus "magique" mais peut re-exécuter plus souvent que prévu
- `watch` est plus prévisible car tu contrôles exactement ce qui déclenche le callback
