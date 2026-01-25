<template>
<div>
    <button v-for="tag in availableTags" :key="tag.id" type="button" @click="toggleTag(tag)"
      :class="['tag-btn', { active: selectedTags?.some(t => t.id === tag.id) }]">
      {{ tag.title }}
    </button>
</div>
</template>

<script setup lang="ts">
import { type GetTagsParams, type TagDto } from '@/api/generated';
import { onMounted, computed, toRaw } from 'vue';
import { useTags } from '@/composables/useTags';

interface Props {
  selectedTags: Array<TagDto>
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggle: [data: Array<TagDto>]
}>()

const {fetchTags, tags} = useTags();

const availableTags = computed(() => tags.value);

const toggleTag = (selectedTag: TagDto | undefined) => {
  if (!selectedTag)
    return;

  const newSelectedTags = [...props.selectedTags];
  const index = newSelectedTags.findIndex((tag) => tag.id === selectedTag.id)

  if (index > -1) {
    newSelectedTags.splice(index, 1)
  } else {
    const tag = availableTags.value?.find((t) => t.id === selectedTag.id)
    if (tag) {
      newSelectedTags.push( {...toRaw(tag)} )
    }
  }

  emit('toggle', newSelectedTags);
}


const loadTags = () => {
  const params: GetTagsParams = {
    size: 1000,
    sort: ["sortingOrder:asc"]
  }
  fetchTags(params);
}

onMounted(() => {
  loadTags()
})

</script>

