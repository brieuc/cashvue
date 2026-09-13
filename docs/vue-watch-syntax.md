# Vue 3 Watch Syntax Explained

## Basic Structure

```typescript
watch(
  () => props.entry,   // 1st function: "what to watch"
  (entry) => { ... }   // 2nd function: "what to do when it changes"
)
```

## Breakdown

| Part | Role |
|---|---|
| `() => props.entry` | Getter function - returns the value to watch |
| `(entry) => { ... }` | Callback - receives the new value as parameter |

## Why a Function for the Getter?

```typescript
// ❌ Doesn't work - Vue can't track a raw value
watch(props.entry, ...)

// ✅ Works - Vue re-executes the function to detect changes
watch(() => props.entry, ...)
```

The function allows Vue to "re-evaluate" regularly and compare with the previous value.

## Full Callback Signature

```typescript
watch(() => props.entry, (newValue, oldValue) => {
  console.log('Before:', oldValue)
  console.log('After:', newValue)
})
```

You can also access the old value if needed.

## Watching Multiple Sources

```typescript
watch(
  [() => props.a, () => props.b],  // Array of getters
  ([newA, newB], [oldA, oldB]) => {
    console.log('a changed from', oldA, 'to', newA)
    console.log('b changed from', oldB, 'to', newB)
  }
)
```

## Options (3rd Parameter)

```typescript
watch(() => props.entry, (entry) => {
  // ...
}, {
  immediate: true,  // Run immediately on mount
  deep: true,       // Watch nested properties
  once: true,       // Run only once then stop
  flush: 'post'     // Timing: 'pre' | 'post' | 'sync'
})
```

| Option | Description |
|---|---|
| `immediate` | Execute callback immediately on mount |
| `deep` | Deeply watch nested object properties |
| `once` | Trigger only once, then auto-stop |
| `flush` | When to run: before DOM update, after, or sync |

## Watching a Ref (Simpler Syntax)

```typescript
const count = ref(0)

// No getter function needed for refs
watch(count, (newValue, oldValue) => {
  console.log('count changed:', newValue)
})
```

## Watching Reactive Object Property

```typescript
const state = reactive({ count: 0, name: 'test' })

// ❌ Won't work - state.count is just a number
watch(state.count, ...)

// ✅ Use a getter function
watch(() => state.count, (newCount) => {
  console.log('count is now:', newCount)
})
```

## ⚠️ Common Trap: Getter Returning a Ref Instead of Its Value

```typescript
const entries = ref<EntryDto[]>([])

// ❌ Never re-triggers after the first (immediate) run
watch(() => entries, (entries) => {
  console.log('entries changed', entries.value.length)
}, { immediate: true })
```

Here `entries` is already a `ref`. The getter `() => entries` returns **the ref object itself**, not its content. That ref object is created once and its identity **never changes** for the whole lifetime of the component — only `entries.value` (the array inside it) changes over time.

`watch` decides whether to re-run the callback by comparing what the getter returns between two executions. Since the getter always returns the exact same object reference, Vue sees "no change" every time, no matter how many times `entries.value` is reassigned or mutated. Only the `immediate: true` initial call ever fires.

Note the callback parameter is named `entries` too, shadowing the outer variable — since the getter returned the ref itself, that parameter *is* the ref, so `entries.value.length` inside the callback still "works" and doesn't throw. That's exactly what makes this bug sneaky: the code runs without errors, it just silently never reacts again.

### The fix: two valid options

```typescript
// ✅ Option 1 - pass the ref directly (Vue unwraps .value automatically,
// both for comparison and for the callback argument)
watch(entries, (newEntries) => {
  console.log('entries changed', newEntries.length)
}, { immediate: true })

// ✅ Option 2 - getter that reads .value explicitly
watch(() => entries.value, (newEntries) => {
  console.log('entries changed', newEntries.length)
}, { immediate: true })
```

Bonus with Option 1: a `ref` whose value is an object/array automatically gets **deep** watching in Vue 3. So it reacts both to reassignment (`entries.value = newArray`) and to in-place mutation (`entries.value.push(item)`), with no extra `{ deep: true }` needed.

### Rule of thumb

| Getter | What Vue compares | Re-triggers on `.value` change? |
|---|---|---|
| `() => myRef` | The ref object itself (never changes identity) | ❌ Never |
| `() => myRef.value` | The current value inside the ref | ✅ Yes |
| `myRef` (no getter, passed directly) | Vue unwraps `.value` for you | ✅ Yes (+ deep if object/array) |

## Stopping a Watcher

```typescript
const stop = watch(() => props.entry, (entry) => {
  // ...
})

// Later: stop watching
stop()
```

## Summary

- First argument: **what** to watch (getter function or ref)
- Second argument: **what to do** when it changes (callback)
- Third argument (optional): **options** (immediate, deep, etc.)
