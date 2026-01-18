# Arrow Function : retourner un objet

## Le problème

Quand tu veux retourner directement un objet avec une arrow function, les accolades `{}` posent problème car JS pense que c'est le corps de la fonction.

```typescript
// ❌ JS pense que { } est le corps de la fonction, pas un objet
const fn = () => { title: 'test' }  // retourne undefined!

// ✅ Les parenthèses disent "ceci est une expression (un objet)"
const fn = () => ({ title: 'test' })  // retourne { title: 'test' }
```

## Retour implicite (une seule expression)

Les parenthèses `({...})` sont nécessaires pour le retour implicite :

```typescript
const getFormValues = (entry?: EntryDto): CreateEntryRequest => ({
  title: entry?.title ?? '',
  amount: entry?.amount ?? null,
  currencyCode: entry?.currency?.code ?? 'CHF',
  description: entry?.description ?? '',
})
```

## Équivalent avec return explicite

```typescript
const getFormValues = (entry?: EntryDto): CreateEntryRequest => {
  return {
    title: entry?.title ?? '',
    amount: entry?.amount ?? null,
    currencyCode: entry?.currency?.code ?? 'CHF',
    description: entry?.description ?? '',
  }
}
```

## Avec un corps de fonction

Si tu as de la logique avant de retourner l'objet, utilise la syntaxe classique avec `return` :

```typescript
const getFormValues = (entry?: EntryDto): CreateEntryRequest => {
  // Corps de la fonction - tu fais ce que tu veux
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  const defaultDate = new Date(Date.now() - offset).toISOString().slice(0, 16)

  console.log('Initialisation du form...')

  // À la fin, return classique - pas besoin de parenthèses
  return {
    title: entry?.title ?? '',
    amount: entry?.amount ?? null,
    currencyCode: entry?.currency?.code ?? 'CHF',
    accountingDate: entry?.accountingDate ?? defaultDate,
    description: entry?.description ?? '',
  }
}
```

## Règle simple

Arrow function avec retour implicite :

| Expression | Retourne |
|---|---|
| `() => 5` | `5` |
| `() => "hello"` | `"hello"` |
| `() => ({ a: 1 })` | `{ a: 1 }` (parenthèses obligatoires) |

Avec `return`, pas besoin de parenthèses autour de l'objet.
