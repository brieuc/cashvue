# Reactive vs Ref : Reassignment in Vue 3

## The Problem

When using `reactive()`, you cannot reassign the variable directly.

```typescript
const form = reactive({ title: '', amount: null })

// ❌ Breaks reactivity - the template still points to the old object
form = { title: 'New', amount: 100 }
```

## Why?

When you do `form = newObject`:

1. You **reassign the variable** to a new object
2. The old reactive object is abandoned
3. `v-model` bindings in the template still point to the old object
4. Vue doesn't detect the change
5. Your UI doesn't update

## Solution 1: Use `Object.assign`

```typescript
const form = reactive({ title: '', amount: null })

// ✅ Mutates the existing reactive object
Object.assign(form, { title: 'New', amount: 100 })
```

This **modifies the properties** of the existing reactive object. Reactivity is preserved, Vue sees the changes, the template updates.

## Solution 2: Use `ref()` instead

```typescript
const form = ref({ title: '', amount: null })

// ✅ Works because you reassign .value, not the ref itself
form.value = { title: 'New', amount: 100 }
```

With `ref()`, the reactive wrapper is the ref itself, not the object inside. Reassigning `.value` is allowed and reactive.

## Comparison Table

| Type | Reassignment | Mutation |
|---|---|---|
| `ref()` | `myRef.value = newValue` ✅ | Works |
| `reactive()` | `myReactive = newValue` ❌ | Breaks reactivity |
| `reactive()` | `Object.assign(myReactive, ...)` ✅ | Works |

## Practical Example

```typescript
// With reactive - must use Object.assign
const form = reactive<FormData>({ title: '', amount: null })

watch(() => props.entry, (entry) => {
  Object.assign(form, getFormValues(entry))  // ✅
  // form = getFormValues(entry)  // ❌ Would break reactivity
})

// With ref - can reassign .value
const form = ref<FormData>({ title: '', amount: null })

watch(() => props.entry, (entry) => {
  form.value = getFormValues(entry)  // ✅
})
```

## Which to Choose?

| Use Case | Recommendation |
|---|---|
| Primitive values (string, number, boolean) | `ref()` |
| Objects that need full replacement | `ref()` |
| Objects that are only mutated property by property | `reactive()` |
| Forms with reset functionality | `ref()` (easier to reset) |

## Summary

- `reactive()` returns the object itself as reactive - reassigning the variable loses the reference
- `ref()` wraps the value - reassigning `.value` is detected and reactive
- When using `reactive()`, use `Object.assign()` to update multiple properties at once
