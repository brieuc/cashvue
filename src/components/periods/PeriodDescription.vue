<template>
<div class="period-description">
  <p v-if="error" class="state">Description indisponible</p>
  <p v-else-if="rendered === undefined" class="state">Chargement…</p>
  <template v-else v-for="(part, i) in parts" :key="i">
    <img v-if="part.tag?.icon" class="tag-icon" :src="`${uploadsUrl}/${part.tag.icon}`" :alt="part.tag.title" :title="part.tag.title" />
    <template v-else>{{ part.text }}</template>
  </template>
</div>
</template>

<script setup lang="ts">
import { getRenderedDescription, type GetTagsParams, type TagDto } from '@/api/generated';
import { useTags } from '@/composables/useTags';
import { computed, onMounted, ref, watch } from 'vue';

const uploadsUrl = import.meta.env.VITE_UPLOADS_URL;

// Liste partagée avec le reste de l'application (chargée une seule fois)
const { tags, fetchTags } = useTags();
onMounted(() => {
  const params: GetTagsParams = { size: 1000, sort: ['sortingOrder:asc'] };
  fetchTags(params);
});

interface props {
  periodId?: number
}

const { periodId } = defineProps<props>();

// undefined = en cours de chargement
const rendered = ref<string>();
const error = ref(false);

// Le back n'évalue pas [tag:code] : on découpe le texte et on remplace chaque
// marqueur par l'icône du tag. Code inconnu ou tag sans icône : texte conservé.
interface Part { text: string; tag?: TagDto }
const TAG_MARKER = /\[tag:([^\]\s]+)\]/g;

const parts = computed<Part[]>(() => {
  const text = rendered.value ?? '';
  const result: Part[] = [];
  let last = 0;
  for (const m of text.matchAll(TAG_MARKER)) {
    if (m.index > last) result.push({ text: text.slice(last, m.index) });
    const tag = tags.value.find(t => t.code === m[1]);
    result.push(tag?.icon ? { text: m[0], tag } : { text: tag?.title ?? m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) result.push({ text: text.slice(last) });
  return result;
});

// Le back renvoie la description avec les {{ }} déjà remplacés par les montants.
watch(() => periodId, async (id) => {
  rendered.value = undefined;
  error.value = false;
  if (id === undefined) return;
  try {
    const response = await getRenderedDescription(id);
    // Réponse périmée si la période a changé entre-temps
    if (id !== periodId) return;
    if (response.status === 200) rendered.value = response.data.rendered ?? '';
    else error.value = true;
  } catch {
    if (id === periodId) error.value = true;
  }
}, { immediate: true });
</script>

<style scoped>
.period-description {
  max-height: 40vh;
  overflow-y: auto;
  /* Le défilement du panneau ne doit pas entraîner la page */
  overscroll-behavior: contain;
  padding: 0.75rem 1rem;
  background: white;
  border-bottom: 1px solid #e1e8ed;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
  font-size: 0.9rem;
  color: #2c3e50;
  overflow-wrap: break-word;
  word-break: break-word;
  /* La description est stockée avec ses \n (saisis dans le <textarea> de
     PeriodModal) ; par défaut ils sont collapsés au rendu. pre-line les
     respecte tout en laissant les lignes longues revenir à la ligne. */
  white-space: pre-line;
}

.tag-icon {
  width: 1.2em;
  height: 1.2em;
  vertical-align: middle;
  border-radius: 3px;
  object-fit: contain;
}

.state {
  margin: 0;
  color: #95a5a6;
}
</style>
