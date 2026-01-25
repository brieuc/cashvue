# TypeScript/JavaScript : Null Safety et opérateurs

## Opérateurs

### `!` — Non-null assertion (TypeScript uniquement)

Dit au compilateur que la valeur n'est pas `null`/`undefined`. **Ne fait rien au runtime** — si la valeur est `null`, ça crashe.

```ts
period!.startDate  // compile, mais crashe si period est null
```

### `?.` — Optional chaining

Retourne `undefined` si la valeur à gauche est `null` ou `undefined`, au lieu de crasher.

```ts
period?.startDate  // → undefined si period est null, sinon period.startDate
```

### `??` — Nullish coalescing

Fallback uniquement pour `null` et `undefined`.

```ts
0 ?? 42          // → 0
"" ?? "default"  // → ""
null ?? "fallback"  // → "fallback"
undefined ?? "fallback"  // → "fallback"
```

### `||` — Logical OR

Fallback pour toute valeur **falsy** : `null`, `undefined`, `0`, `""`, `false`, `NaN`.

```ts
0 || 42          // → 42
"" || "default"  // → "default"
null || "fallback"  // → "fallback"
```

### `??` vs `||`

| Expression | `??` | `||` |
|---|---|---|
| `0` | `0` | fallback |
| `""` | `""` | fallback |
| `false` | `false` | fallback |
| `NaN` | `NaN` | fallback |
| `null` | fallback | fallback |
| `undefined` | fallback | fallback |

Utiliser `??` quand `0`, `""` ou `false` sont des valeurs valides.

## Types spéciaux

### `undefined`

La valeur n'existe pas.

```ts
let x;              // undefined
obj.propInexistante // undefined
function foo() {}   // retourne undefined
```

### `NaN` (Not a Number)

Résultat d'une opération mathématique invalide. Son type est `number`.

```ts
typeof NaN        // → "number"
0 / 0             // → NaN
parseInt("abc")   // → NaN
Math.sqrt(-1)     // → NaN
```

Particularité : `NaN` n'est égal à rien, même pas à lui-même.

```ts
NaN === NaN       // → false
Number.isNaN(NaN) // → true (la bonne façon de tester)
```

## Conditions de nullité

### `!value` — Falsy check

`!value` est `true` pour **toutes** les valeurs falsy : `null`, `undefined`, `0`, `""`, `false`, `NaN`.

```ts
if (!period) // true si period est null, undefined, 0, "", false, NaN
```

Pour un objet, les seules valeurs falsy possibles sont `null` ou `undefined`, donc `!period` convient.

### `== null` vs `=== null`

`=== null` : strictement `null` uniquement.

`== null` : `null` **et** `undefined` (seul cas où `==` est recommandé).

```ts
null == null       // true
undefined == null  // true
0 == null          // false
"" == null         // false

null === null      // true
undefined === null // false
```

`== null` est un raccourci pour `=== null || === undefined`.

## Patterns recommandés

### Guard clause (recommandé)

```ts
if (!period) return;
// period est garanti non-null après ça
startDate: period.startDate,
endDate: period.endDate,
```

### Optional chaining + nullish coalescing

```ts
startDate: period?.startDate ?? null,
```

### A éviter

```ts
// Non-null assertion : dangereux, crashe silencieusement
startDate: period!.startDate,
```
