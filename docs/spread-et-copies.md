# Spread, copie superficielle et objets imbriqués en JavaScript

## Le spread operator `{...obj}`

Crée une **copie superficielle** (shallow copy) d'un objet :

```ts
const original = { name: 'Alice', age: 30 };
const copy = { ...original };

copy.name = 'Bob';
console.log(original.name); // 'Alice' ✅ pas affecté
```

## Le problème : objets imbriqués

Avec des objets/tableaux imbriqués, seule la **référence** est copiée :

```ts
const original = {
  name: 'Alice',
  tags: ['dev', 'js']
};
const copy = { ...original };

copy.tags.push('vue');
console.log(original.tags); // ['dev', 'js', 'vue'] ⚠️ MODIFIÉ !
```

Le spread copie la référence vers le même tableau en mémoire.

## Object.assign : même comportement

```ts
const copy = Object.assign({}, original);  // copie superficielle
const copy = { ...original };               // équivalent
```

Les deux ont le même problème avec les objets imbriqués.

## Solutions pour une copie profonde

### 1. `structuredClone` (moderne, recommandé)

```ts
const copy = structuredClone(original);
copy.tags.push('vue');
console.log(original.tags); // ['dev', 'js'] ✅
```

### 2. JSON parse/stringify (ancienne méthode)

```ts
const copy = JSON.parse(JSON.stringify(original));
```

⚠️ Limitations : ne gère pas les `Date`, `undefined`, fonctions, etc.

### 3. Spread imbriqué (manuel)

```ts
const copy = {
  ...original,
  tags: [...original.tags]
};
```

Fastidieux si beaucoup de niveaux.

## Résumé

| Méthode | Copie profonde | Support navigateur |
|---------|----------------|-------------------|
| `{...obj}` | ❌ Non | ✅ Tous |
| `Object.assign()` | ❌ Non | ✅ Tous |
| `structuredClone()` | ✅ Oui | ✅ Moderne (2022+) |
| `JSON.parse/stringify` | ✅ Oui* | ✅ Tous |

*avec limitations sur certains types

## Cas pratique Vue.js

```ts
// ❌ Problème potentiel
const defaultForm = { title: '', tags: [] };
Object.assign(form, defaultForm);
form.tags.push('test'); // modifie defaultForm.tags !

// ✅ Solution
Object.assign(form, structuredClone(defaultForm));
```
