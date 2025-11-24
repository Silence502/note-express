<script setup lang="ts">
import Card from "primevue/card";
import Button from "primevue/button";
import type {Task} from "@/infrastructure/schemas/task.schema.ts";
import {DateTime} from "luxon";
import Divider from "primevue/divider";
import Tag from "primevue/tag";
import Dialog from "primevue/dialog";
import TaskForm from "@/presentation/task/components/TaskForm.vue";
import {computed, ref} from "vue";
import type {Tag as TagObject} from "@/infrastructure/schemas/tag.schema.ts";
import {contrastColor} from "@/utils/colorConstrastManager.ts";
import Checkbox from "primevue/checkbox";
import {useI18n} from "vue-i18n";
import TaskInfo from "@/presentation/task/components/TaskInfo.vue";

const {t, locale} = useI18n();

const props = withDefaults(defineProps<{
  task: Task;
  loading: boolean
  isDragging?: boolean
  tags: TagObject[]
  filtered?: boolean
}>(), {
  filtered: false,
  isDragging: false
})

const emit = defineEmits<{
  (e: 'delete', value: number | undefined): void;
  (e: 'update', value: { id: number, task: Task }): void;
  (e: 'isDone', value: number): void;
  (e: 'isPriority', value: number): void;
  (e: 'dragstart', event: DragEvent): void;
  (e: 'dragover', event: DragEvent): void;
  (e: 'dragleave', event: DragEvent): void;
  (e: 'drop', event: DragEvent): void;
}>()

const isModalUpdateVisible = ref(false);
const isModalInfoVisible = ref(false);

const processedDescription = computed(() => {
  if (!props.task.description) return '';
  const urlRegex = /((https?:\/\/)?(www\.)?[^\s<>&]+\.[^\s<>&]+)/gi;

  return props.task.description
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(urlRegex, (url: string) => {
        let fullUrl = url.startsWith('www.') ? `https://${url}` : url;

        try {
          new URL(fullUrl);
          return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="external-link">${url}</a>`;
        } catch {
          return url;
        }
      });
})

const formattedDate = computed(() => {
  const date = props.task.isDone ? props.task.updatedAt : props.task.createdAt;
  return DateTime.fromJSDate(date)
      .setLocale(locale.value)
      .toLocaleString(DateTime.DATETIME_SHORT)
      .replace(' ', ' - ').replace(',', '');
});


function updateTask(value: { id: number, task: Task }) {
  emit('update', value);
  isModalUpdateVisible.value = false;
}

function openModal(task: Task) {
  if (task.isDone) {
    isModalInfoVisible.value = true;
  } else {
    isModalUpdateVisible.value = true;
  }
}

const getTaskTags = () => {
  return props.task.tags as TagObject[] || [];
}

const getTaskTagsName = () => {
  return getTaskTags().slice(2).map(tag => tag.name).join(', ');
}
</script>

<template>
  <Card class="bordered task-card"
        :class="{'no-content': task.description === null || !task.description, 'is-done': task.isDone, 'priority': task.priority }"
        :draggable="!task.isDone && !filtered"
        :id="task.id"
        :data-id="task.id"
        @dragstart="$emit('dragstart', $event)"
        @dragover="$emit('dragover', $event)"
        @dragleave="$emit('dragleave', $event)"
        @drop="$emit('drop', $event)">
    <template #header>
      <div class="w-full grid grid-cols-[auto_auto_auto] justify-end" :class="{'pointer-event-none': isDragging}">
        <div class="flex gap-1 items-center justify-end mr-2">
          <i class="pi !text-[10px]"
             :class="{'pi-check-circle text-green-700': task.isDone, 'pi-minus-circle': !task.isDone}"/>
          <span class="!text-xs text-[var(--color-neutral-500)]">{{ formattedDate }}
          </span>
        </div>
        <Button :icon="task.isDone ? 'pi pi-info-circle' : 'pi pi-pencil'"
                variant="text"
                :loading
                aria-label="Filter"
                size="small"
                rounded
                @click="openModal(task)"/>
        <Button icon="pi pi-trash"
                variant="text"
                :loading
                severity="danger"
                aria-label="Filter"
                size="small"
                rounded
                @click="$emit('delete', (task.id as number))"/>
      </div>
    </template>
    <template #title>
      <div class="flex gap-2 items-start" :class="{'pointer-event-none': isDragging}">
        <Checkbox v-model="task.isDone" @change="$emit('isDone', task.id as number)" binary/>
        <h4 class="text-sm" :class="{'line-through': task.isDone}">{{ task.title }}</h4>
      </div>
    </template>
    <template #content>
      <div
          v-if="task.description"
          class="m-0 text-content-secondary text-sm"
          :class="{'pointer-event-none': isDragging}"
          v-html="processedDescription"
      >
      </div>
    </template>
    <template #footer>
      <Divider :class="{'!pointer-event-none': isDragging}"/>
      <div
          class="text-neutral-600 w-full text-end text-xs grid grid-cols-[auto_1fr] gap-1 justify-between items-center" :class="{'pointer-event-none': isDragging}">
        <div class="flex gap-1 items-center">
          <Tag v-for="tag in getTaskTags().slice(0, 2)"
               :key="tag.id as number"
               :value="tag.name"
               :style="{backgroundColor: `#${tag.color}`, color: `${contrastColor(tag.color as string)}`}"/>

          <Tag v-if="getTaskTags().length > 2"
               v-tooltip="`${getTaskTagsName.call(this)}`"
               :value="`+${getTaskTags().length - 2}`"
               style="background-color: var(--p-chip-background); color: var(--p-chip-color);"/>
        </div>
        <div>
          <Button :disabled="task.isDone" class="h-6 max-w-6" :severity="task.priority ? 'danger' : 'secondary'"
                  variant="text" size="small"
                  :icon="task.priority ? 'pi pi-flag-fill' : 'pi pi-flag'"
                  @click="$emit('isPriority', task.id as number)"/>
        </div>
      </div>
    </template>
  </Card>

  <Dialog v-model:visible="isModalUpdateVisible" modal :header="t('home.modal.updateTask.title')">
    <TaskForm @update="updateTask" :tags="tags" :loading :initialTask="task"/>
  </Dialog>
  <Dialog v-model:visible="isModalInfoVisible" modal :header="t('home.modal.infoTask.title')">
    <TaskInfo :tags="tags" :task="task" />
  </Dialog>
</template>