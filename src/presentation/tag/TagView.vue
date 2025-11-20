<script setup lang="ts">
import HeaderComponent from "@/components/HeaderComponent.vue";
import SectionLayout from "@/layouts/SectionLayout.vue";
import {useTag} from "@/composables/tag.composable.ts";
import {onMounted, ref} from "vue";
import type {Tag, TagInput} from "@/infrastructure/schemas/tag.schema.ts";
import type {TaskInput} from "@/infrastructure/schemas/task.schema.ts";
import TagList from "@/presentation/tag/components/TagList.vue";
import SearchComponent from "@/components/SearchComponent.vue";
import TagForm from "@/presentation/tag/components/TagForm.vue";
import Dialog from "primevue/dialog";
import {useI18n} from "vue-i18n";

//HOOKS

const {t, locale} = useI18n();
const {
  tags,
  loading,
  isListLoading,
  isCreateLoading,
  isEditLoading,
  isDeleteLoading,
  error,
  tasks,
  loadTags,
  createTag,
  updateTag,
  deleteTag,
  deleteMultipleTags
} = useTag()

//REFS

const currentFilter = ref<{ isDone?: boolean; tags?: Tag[]; search?: string }>({});
const isModalCreateVisible = ref(false);

//CONSTS/VARS

const handleTagCreated = async (tagData: TagInput) => {
  await createTag(tagData);
  isModalCreateVisible.value = false;
};

const handleSearch = (value: string) => {
  currentFilter.value.search = value || undefined;
  loadTags(currentFilter.value);
};

//METHODS

function openModal(value: boolean) {
  isModalCreateVisible.value = value;
}

function update(value: { id: number, tag: Tag}) {
  if (value.id) {
    updateTag(value.id, value.tag);
  }
}

function deleteMultiple(tags: Tag[]) {
  if (tags) {
    deleteMultipleTags(tags)
  }
}
</script>

<template>
  <HeaderComponent :title="t('tags.header.title')">
    <template #content>
      <SearchComponent :placeholder="t('tags.header.searchLabel')" :aria-label="t('tags.header.button.addTask.label')" @handleSearch="handleSearch" @visible="openModal"/>
    </template>
  </HeaderComponent>
  <SectionLayout>
    <template #header>
    </template>
    <template #content>
      <TagList :tags="tags" @update="update" @delete="deleteTag" @deleteMultiple="deleteMultiple" :loading="isListLoading"/>
    </template>
  </SectionLayout>

  <Dialog v-model:visible="isModalCreateVisible" modal :header="t('tags.modal.createTag.title')">
    <TagForm @create="handleTagCreated" :loading="isCreateLoading || isEditLoading"/>
  </Dialog>
</template>

<style scoped>

</style>