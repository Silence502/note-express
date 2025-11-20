<script setup lang="ts">
import TaskCard from "@/presentation/task/components/TaskCard.vue";
import type {Task} from "@/infrastructure/schemas/task.schema.ts";
import type {Tag} from "@/infrastructure/schemas/tag.schema.ts";

const props = withDefaults(defineProps<{
  tasks: Task[]
  loading: boolean
  tags: Tag[]
  filtered?: boolean
  onDragOver?: (event: DragEvent) => void;
  onDragLeave?: (event: DragEvent) => void;
  onDrop?: (event: DragEvent) => void;
  dragStart?: (task: Task, event: DragEvent) => void;
}>(), {
  filtered: false
})

const emit = defineEmits<{
  (e: 'delete', value: number): void;
  (e: 'update', value: {id: number, task: Task}): void;
  (e: 'isDone', value: number): void;
  (e: 'isPriority', value: number): void;
}>()
</script>

<template>
  <TaskCard v-for="task in tasks"
            :key="(task.id as number)"
            :task="task"
            :tags="tags"
            :filtered="filtered"
            :loading
            @dragover.prevent="onDragOver"
            @dragleave="onDragLeave"
            @drop.prevent="onDrop"
            @dragstart="dragStart && dragStart(task, $event)"
            @isDone="$emit('isDone', Number($event))"
            @isPriority="$emit('isPriority', Number($event))"
            @update="$emit('update', $event)"
            @delete="$emit('delete', Number($event))"/>
</template>

<style scoped>

</style>