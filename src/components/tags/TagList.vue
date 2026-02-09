<template>
<div class="header-bar">
  <h1>Tags</h1>
  <button class="add-btn" @click="selectedTag = newTag">+</button>
</div>
<div v-if="selectedTag">
  <TagModal :tag="selectedTag" @submit="handleSubmit" @close="close"></TagModal>
</div>
<div class="card" v-for="tag in tags" v-bind:key="tag.id" @click="selectTag(tag)">
  <TagView :tag="tag"></TagView>
</div>
</template>

<script setup lang="ts">
import { useTags } from '@/composables/useTags';
import TagView from './TagView.vue';
import { ref } from 'vue';
import TagModal from './TagModal.vue';
import { createTag, updateTag, type TagDto } from '@/api/generated';

const { tags } = useTags();
const selectedTag = ref<TagDto>();

const selectTag = (tag: TagDto) => {
  if (tag) {
    selectedTag.value = tag;
  }
};

const newTag : TagDto = {
  title: "",
  description: "",
  icon: "",
  hidden: false
};

const handleSubmit = (tag: TagDto) => {
  if (tag.id) {
    updateTag(tag.id, tag).then(response => {
      if (response.status === 200) {
        const index = tags.value.findIndex(t => tag.id === t.id);
        if (index !== -1) {
          tags.value[index] = response.data;
        }
      }
    })
  }
  else {
    createTag(tag).then(response => {
    if (response.status === 201) {
      const newTag = response.data;
      tags.value.unshift(newTag)
    }
  });}

  selectedTag.value = undefined;
};

const close = () => {
  selectedTag.value = undefined;
};

</script>

<style scoped>
.card {
  border-bottom: 0.1px solid #e1e8ed;
  padding: 1rem;
}
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.add-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: background 0.2s;
}
.add-btn:hover {
  background: #2980b9;
}

</style>
