# Vue 3 Props and Reactivity

## Are Props Refs?

No. Props are **reactive** but they are **not refs**.

```typescript
const props = defineProps<{ entry?: EntryDto }>()

// ❌ props.entry is not a ref
props.entry.value  // undefined, .value doesn't exist

// ✅ It's just a reactive property
props.entry  // direct access
```

## Consequences in Watch

```typescript
// ❌ Doesn't work - props.entry is not a ref
watch(props.entry, ...)

// ✅ Use a getter function
watch(() => props.entry, ...)
```

## Converting Props to Refs

If you need a ref from a prop, use `toRef` or `toRefs`:

```typescript
import { toRef, toRefs } from 'vue'

const props = defineProps<{ entry?: EntryDto, isOpen: boolean }>()

// Single prop → ref
const entryRef = toRef(props, 'entry')
watch(entryRef, ...)  // ✅ works without getter

// All props → refs
const { entry, isOpen } = toRefs(props)
watch(entry, ...)  // ✅ works
```

## Why Use toRef?

`toRef` creates a ref that:
- Stays synced with the original prop
- Can be passed to composables that expect refs
- Can be watched directly without a getter function

```typescript
// Useful for composables
const { entry } = toRefs(props)
useMyComposable(entry)  // composable expects a ref
```

## Comparison Table

| Type | Reactive? | Is a ref? | Direct watch? |
|---|---|---|---|
| `ref()` | Yes | Yes | `watch(myRef, ...)` ✅ |
| `props.x` | Yes | No | `watch(() => props.x, ...)` |
| `toRef(props, 'x')` | Yes | Yes | `watch(myRef, ...)` ✅ |
| `reactive().x` | Yes | No | `watch(() => obj.x, ...)` |

## Common Patterns

### Pattern 1: Watch a prop directly

```typescript
const props = defineProps<{ id: number }>()

watch(() => props.id, (newId) => {
  fetchData(newId)
})
```

### Pattern 2: Convert to ref for composables

```typescript
const props = defineProps<{ userId: number }>()
const userIdRef = toRef(props, 'userId')

// Pass to composable
const { user } = useUser(userIdRef)
```

### Pattern 3: Destructure with toRefs

```typescript
const props = defineProps<{ a: string, b: number, c: boolean }>()
const { a, b, c } = toRefs(props)

// Now a, b, c are all refs
watch(a, ...)  // ✅
watch(b, ...)  // ✅
```

## Important: Don't Destructure Props Directly

```typescript
const props = defineProps<{ count: number }>()

// ❌ Loses reactivity - count is now a plain number
const { count } = props
watch(() => count, ...)  // won't react to changes

// ✅ Keep reactivity with toRefs
const { count } = toRefs(props)
watch(count, ...)  // works
```

## Summary

- Props are reactive but not refs
- Use getter functions `() => props.x` when watching props
- Use `toRef()` or `toRefs()` to convert props to refs when needed
- Never destructure props directly if you need reactivity
