<script setup lang="ts">
import {useTasks} from "@/composables/task.composable";
import Dialog from "primevue/dialog";
import {computed, type ComputedRef, onMounted, onUnmounted, ref, watch} from "vue";
import type {Task, TaskInput} from "@/infrastructure/schemas/task.schema";
import TasksList from "@/presentation/task/components/TasksList.vue";
import SectionLayout from "@/layouts/SectionLayout.vue";
import TaskForm from "@/presentation/task/components/TaskForm.vue";
import SearchComponent from "@/components/SearchComponent.vue";
import HeaderComponent from "@/components/HeaderComponent.vue";
import {useTag} from "@/composables/tag.composable.ts";
import Divider from "primevue/divider";
import Button from "primevue/button";
import {useI18n} from "vue-i18n";
import { useConfirm } from "primevue/useconfirm";
import ProgressBar from "primevue/progressbar";
import {emitter} from "@/services/eventBus.ts";
import {settingsStore} from "@/stores/settingsStore.ts";

//HOOKS

const confirm = useConfirm();
const {
  tasks,
  loading,
  isDoneLoading,
  isListLoading,
  isCreateLoading,
  isEditLoading,
  currentFilter,
  error,
  doneTasks,
  pendingTasks,
  priorityTask,
  createTask,
  updateTask,
  toggleTaskDone,
  deleteTask,
  reorderTasks,
  loadTasks,
  deleteMultipleTasks,
  toggleTaskPriority,
} = useTasks();

const {
  tags
} = useTag()
const {t, locale} = useI18n();
const useSettingsStore = settingsStore()

//REF

const selectedTags = ref<number[]>([]);
const isModalCreateVisible = ref(false);
const draggedCard = ref<Task | null>(null)
const data = ref<Task[] | null>(null)
const isDragging = ref(false)

//COMPUTED

const showAllDone = computed(() => {
  return tasks.value.every(task => task.isDone) && !currentFilter.value.search && !currentFilter.value.tags?.length;
})
const showNotFound = computed(() => {
  return currentFilter.value.search && !tasks.value.length || currentFilter.value.tags?.length && !tasks.value.length
})
const showSpinner = computed(() => {
  return isListLoading.value;
})
const filteredTasks: ComputedRef<boolean> = computed(() => {
  return !!(currentFilter.value.search || currentFilter.value.tags?.length)
})

//CONST/VARS

const handleTaskCreated = async (taskData: TaskInput) => {
  await createTask(taskData);
  isModalCreateVisible.value = false;
};

const handleTaskUpdate = async (id: number, taskData: Partial<TaskInput>, isTimerUpdate?: boolean) => {
  await updateTask(id, taskData, isTimerUpdate);
};

const handleSearch = (value: string) => {
  currentFilter.value.search = value || undefined;
  loadTasks(currentFilter.value);
};

const handleFilter = (value: number[]) => {
  selectedTags.value = value;
  currentFilter.value.tags = selectedTags.value.length > 0 ? selectedTags.value : [];
  loadTasks(currentFilter.value);
};

const dragStart = (card: Task, e: DragEvent) => {
  const target = e.target as HTMLElement;
  isDragging.value = true;

  if (card && e.dataTransfer) {
    draggedCard.value = card;

    const ghost = target.closest('.p-card')?.cloneNode(true) as HTMLElement;
    if (!ghost) return;

    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    ghost.style.opacity = '0.5';
    ghost.style.transform = 'rotate(5deg)';
    ghost.style.cursor = 'grabbing';
    ghost.style.pointerEvents = 'none';
    ghost.style.backgroundColor = 'var(--background-color-secondary)';
    ghost.style.width = `${target.closest('.p-card')?.clientWidth}px`;

    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 50, 80);

    setTimeout(() => {
      document.body.removeChild(ghost);
    }, 0);
  }
};

const onDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = false;

  document.querySelectorAll('.drag-over').forEach(el => {
    el.classList.remove('drag-over');
  });

  if (!e.target) return;

  const targetElement = e.target as HTMLElement;
  if (targetElement.tagName === 'button' || targetElement.closest('button')) {
    return;
  }

  const cardElement = targetElement.closest<HTMLElement>('[data-id]');
  if (!cardElement?.dataset?.id) return;

  const targetCardId = parseInt(cardElement.dataset.id);
  if (isNaN(targetCardId)) return;

  if (!draggedCard.value) return;
  if (!data.value) return;

  const newOrder = [...data.value];
  const draggedIndex = newOrder.findIndex(c => c.id === draggedCard.value?.id);
  const targetIndex = newOrder.findIndex(c => c.id === targetCardId);

  if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed as Task);

    cardElement.classList.remove('drag-over');

    data.value = newOrder;

    reorderTasks(newOrder.map(task => task.id as number));
  }

  draggedCard.value = null;
};

const onDragOver = (e: DragEvent) => {
  const target = e.target as HTMLElement;
  const cardElement = target.closest<HTMLElement>('[data-id]');

  if (!cardElement?.dataset?.id) return;

  const targetCardId = parseInt(cardElement.dataset.id);
  if (isNaN(targetCardId)) return;

  if (cardElement.classList.contains('drag-over')) return;

  document.querySelectorAll('.drag-over').forEach(el => {
    el.classList.remove('drag-over');
  });

  cardElement.classList.add('drag-over');
}

const onDragLeave = (e: DragEvent) => {
  const target = e.target as HTMLElement;
  const cardElement = target.closest<HTMLElement>('[data-id]');

  if (!cardElement?.dataset?.id) return;

  const rect = cardElement.getBoundingClientRect();
  const isStillOver = e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom;

  if (!isStillOver) {
    cardElement.classList.remove('drag-over');
  }

}

//METHODS

/**
 * Deletes multiple tasks after user confirmation.
 *
 * @param {Task[]} tasks - An array of tasks to be deleted.
 * @return {void} This function does not return a value.
 */
function deleteMultiple(tasks: Task[]): void {
  if (tasks) {
    confirm.require({
      message: t('home.message.deleteAll.description'),
      icon: 'pi pi-exclamation-triangle',
      acceptClass: 'p-button-danger',
      rejectProps: {
        label: t('home.message.deleteAll.no'),
        severity: 'secondary',
      },
      acceptProps: {
        label: t('home.message.deleteAll.yes'),
      },
      accept: () => {
        deleteMultipleTasks(tasks)
      }
    })
  }
}

/**
 * Opens or closes a modal by setting the visibility state.
 *
 * @param {boolean} value - A boolean value where `true` opens the modal and `false` closes it.
 * @return {void} This method does not return a value.
 */
function openModal(value: boolean): void {
  isModalCreateVisible.value = value;
}

/**
 * Updates an existing task with the provided identifier and task details.
 *
 * @param {Object} value - The object containing the task information.
 * @param {number} value.id - The unique identifier of the task to update.
 * @param {Task} value.task - The task details to be updated.
 * @return {void} Does not return a value.
 */
function update(value: { id: number, task: Task }): void {
  if (value.id) {
    handleTaskUpdate(value.id, value.task);
  }
}

function updateTimer(task: Task) {
  if (task.id) {
    handleTaskUpdate(task.id, task, true);
  }
}

const handleItemsUpdate = () => {
  loadTasks(currentFilter.value);
};

//LIFECYCLE

watch(tasks, (newTasks) => {
  data.value = newTasks;
}, {immediate: true});

onMounted(() => {
  emitter.on('update-items', handleItemsUpdate);
})

onUnmounted(() => {
  emitter.off('update-items', handleItemsUpdate);
})
</script>

<template>
  <HeaderComponent :title="t('home.header.title')">
    <template #content>
      <SearchComponent :values="tags" :withFilter="true" :filterAriaLabel="t('home.header.button.filter.label')" :placeholder="t('home.header.searchLabel')"
                       :ariaLabel="t('home.header.searchLabel')" @handleSearch="handleSearch" @visible="openModal" @filter="handleFilter" v-model:modelValue="selectedTags"/>
    </template>
  </HeaderComponent>
  <ProgressBar class="!absolute  w-full" v-if="showSpinner" mode="indeterminate" style="height: 4px"></ProgressBar>
  <SectionLayout @dragover.prevent @drop.prevent="onDrop">
    <template #header>
    </template>
    <template #content>
      <div v-if="showAllDone && !showSpinner" class="flex flex-col justify-center items-center gap-4 mt-4">
        <img class="img-all-done" src="@/assets/img/coffee_dark.webp" alt="Coffee">
        <p>{{ t('home.message.allDone') }}</p>
      </div>
      <TasksList v-if="pendingTasks.length"
                 :tasks="pendingTasks"
                 :loading="isListLoading"
                 :tags="tags"
                 :filtered="filteredTasks"
                 :isDragging="isDragging"
                 :drag-start="dragStart"
                 :on-drop="onDrop"
                 :on-drag-over="onDragOver"
                 :on-drag-leave="onDragLeave"
                 @isDone="toggleTaskDone"
                 @isPriority="toggleTaskPriority"
                 @timer="updateTimer"
                 @update="update"
                 @delete="deleteTask"/>
      <Divider v-if="doneTasks.length" class="divider-home">
        <Button icon="pi pi-trash" @click="deleteMultiple(doneTasks)" aria-label="Filter" variant="text" severity="danger" size="small" class=""/>
      </Divider>
      <TasksList v-if="doneTasks.length"
                 :tasks="doneTasks"
                 :loading="isDoneLoading"
                 :drag-start="dragStart"
                 :on-drop="onDrop"
                 :on-drag-over="onDragOver"
                 :on-drag-leave="onDragLeave"
                 :tags="tags"
                 @delete="deleteTask"
                 @isDone="toggleTaskDone"/>
      <div v-if="showNotFound && !showSpinner" class="flex flex-col justify-center items-center gap-4 mt-4">
        <p>{{t('home.message.notFound')}}</p>
      </div>
    </template>
  </SectionLayout>

  <Dialog v-model:visible="isModalCreateVisible" modal :header="t('home.modal.createTask.title')">
    <TaskForm @create="handleTaskCreated" :tags="tags" :loading="isCreateLoading || isEditLoading"/>
  </Dialog>
</template>

<style scoped>

</style>