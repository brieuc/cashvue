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
