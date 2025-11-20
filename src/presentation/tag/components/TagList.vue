<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Menu from "primevue/menu";
import type {Tag as TagObject} from "@/infrastructure/schemas/tag.schema.ts";
import {computed, ref} from "vue";
import Tag from "primevue/tag";
import {contrastColor} from "@/utils/colorConstrastManager.ts";
import TagForm from "@/presentation/tag/components/TagForm.vue";
import Dialog from "primevue/dialog";
import {useTasks} from "@/composables/task.composable.ts";
import FloatingBar from "@/components/FloatingBar.vue";
import {useI18n} from "vue-i18n";

const props = withDefaults(defineProps<{
  tags: TagObject[]
  loading: boolean
}>(), {})

const emit = defineEmits<{
  (e: 'delete', value: number): void;
  (e: 'deleteMultiple', value: TagObject[]): void;
  (e: 'update', value: { id: number, tag: TagObject }): void;
}>()

const {t, locale} = useI18n();
const {
  tasks
} = useTasks()

const isModalUpdateVisible = ref(false);
const isModalConfirmVisible = ref(false);
const selectedTags = ref<TagObject[]>([]);
const item = ref();
const menu = ref();
const items = ref([
  {
    items: [
      {
        label: t('tags.menu.edit.label'),
        icon: 'pi pi-pen-to-square',
        command: () => {
          isModalUpdateVisible.value = true;
        }
      },
      {
        label: t('tags.menu.delete.label'),
        icon: 'pi pi-trash',
        class: 'danger',
        command: () => {
          deleteTag(item.value!.id as number)
        }
      }
    ]
  }
]);

const nbTasks = computed(() => {
  return (tagId: number) => {
    return tasks.value.filter(task => {
      return task.tags && Array.isArray(task.tags) && task.tags.some((tag: any) => tag.id === tagId);
    }).length;
  }
});


function deleteTag(value: number) {
  if (value) {
    emit('delete', value)
  }
}

function updateTag(value: { id: number, tag: TagObject }) {
  emit('update', value);
  isModalUpdateVisible.value = false;
}

const selectRow = ((data: TagObject, event: Event) => {
  item.value = data;
  menu.value.toggle(event);
});

const deleteMultiple = () => {
  emit('deleteMultiple', selectedTags.value)
  selectedTags.value = [];
  isModalConfirmVisible.value = false;
}
</script>

<template>
  <DataTable :value="tags"
             v-model:selection="selectedTags"
             dataKey="id"
             stripedRows
             removableSort
             :loading="loading">
    <Column align-frozen="left" selectionMode="multiple" headerStyle="width: 3rem"></Column>
    <Column :sortable="true" field="name" :header="t('tags.table.name.head')">
      <template #body="{data}">
        <Tag v-tooltip="t('tags.table.name.row', {nb: nbTasks(data.id)})" :value="data.name" :style="{backgroundColor: `#${data.color}`, color: contrastColor(data.color)}"/>
      </template>
    </Column>
    <Column class="!text-end">
      <template #body="{ data }">
        <Button icon="pi pi-ellipsis-v" @click="selectRow(data, $event)" severity="secondary" rounded aria-haspopup="true" aria-controls="overlay_menu"></Button>
        <Menu class="no-header" ref="menu" id="overlay_menu" :model="items" :popup="true"/>
      </template>
    </Column>
    <template #empty>
      <p v-if="tags.length === 0">
        {{ t('tags.table.emptyState.message') }}
      </p>
    </template>
  </DataTable>

  <Dialog v-model:visible="isModalUpdateVisible" modal :header="t('tags.modal.updateTag.title')">
    <TagForm :initialTag="item" @update="updateTag" :loading/>
  </Dialog>
  <Dialog v-model:visible="isModalConfirmVisible" modal :header="t('tags.modal.confirmDelete.title')">
    <section class="flex flex-col gap-2">
      <div>{{t('tags.modal.confirmDelete.content', {nb: selectedTags.length})}}</div>
      <div class="flex justify-end gap-2 mt-2">
        <Button size="small" :label="t('common.cancel')" severity="secondary" @click="isModalConfirmVisible = false"/>
        <Button size="small" :label="t('common.delete')" @click="deleteMultiple" severity="danger"/>
      </div>
    </section>
  </Dialog>

  <FloatingBar :selected-items="selectedTags" @deleteMultiple="isModalConfirmVisible = true; selectedTags = $event;"/>
</template>

<style scoped>

</style>