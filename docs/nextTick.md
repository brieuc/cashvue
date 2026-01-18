# nextTick en Vue.js

## C'est quoi ?

`nextTick` est une fonction Vue qui exécute un callback après la prochaine mise à jour du DOM.

## Pourquoi c'est nécessaire ?

Vue met à jour le DOM de manière **asynchrone** pour optimiser les performances. Quand tu modifies une donnée réactive, le DOM n'est pas immédiatement mis à jour.

```ts
import { ref, nextTick } from 'vue'

const items = ref(['a', 'b']);

items.value.push('c');
console.log(document.querySelectorAll('li').length);  // 2 (pas encore 3 !)

nextTick(() => {
  console.log(document.querySelectorAll('li').length);  // 3 ✓
});
```

## Syntaxes

### Callback

```ts
nextTick(() => {
  // DOM à jour ici
});
```

### Async/await

```ts
await nextTick();
// DOM à jour ici
```

## Cas d'usage courants

### 1. Accéder à un élément après ajout

```ts
entries.value.push(newEntry);

nextTick(() => {
  const card = document.querySelector(`[data-id="${newEntry.id}"]`);
  card.scrollIntoView({ behavior: 'smooth' });
});
```

### 2. Focus sur un input après affichage

```ts
showInput.value = true;

nextTick(() => {
  inputRef.value.focus();
});
```

### 3. Mesurer un élément après changement de contenu

```ts
message.value = "Un texte beaucoup plus long...";

nextTick(() => {
  const height = element.value.offsetHeight;
});
```

## Différence avec setTimeout

| `nextTick` | `setTimeout(..., 0)` |
|------------|---------------------|
| Attend la mise à jour Vue | Attend le prochain cycle event loop |
| Garanti après le rendu Vue | Peut s'exécuter avant le rendu |
| Plus précis | Moins fiable |

```ts
// ❌ Pas fiable
setTimeout(() => {
  // Le DOM peut ne pas être à jour
}, 0);

// ✅ Fiable
nextTick(() => {
  // Le DOM est garanti à jour
});
```

## Résumé

- Utilise `nextTick` quand tu dois interagir avec le DOM après avoir modifié des données réactives
- Préfère `await nextTick()` pour un code plus lisible
- Ne l'utilise pas si tu n'as pas besoin d'accéder au DOM
