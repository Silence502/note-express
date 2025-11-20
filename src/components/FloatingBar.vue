<script setup lang="ts">
import Button from "primevue/button";
import Panel from "primevue/panel";
import type {Tag as TagObject} from "@/infrastructure/schemas";
import {useDraggable} from "@/composables/draggable.composable.ts";
import {useI18n} from "vue-i18n";

const {t, locale} = useI18n();

const props = withDefaults(defineProps<{
  selectedItems: TagObject[]
}>(), {})

const emit = defineEmits<{
  (e: 'deleteMultiple', value: TagObject[]): void;
}>()

const {
  isDragging,
  panelPosition,
  initialMousePosition,
  startDrag,
  onDrag,
  stopDrag,
} = useDraggable()
</script>

<template>
  <Panel
      v-if="selectedItems.length > 0"
      class="docked shadow-lg"
      :style="{ position: 'fixed', left: `${panelPosition.x}px`, bottom: `${panelPosition.y}px`, cursor: isDragging ? 'grabbing' : 'grab' }"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="stopDrag"
  >
    <template #default>
      <div class="flex gap-4 justify-start items-center">
        <Button icon="pi pi-trash" severity="danger" @click="$emit('deleteMultiple', selectedItems)" :aria-label="t('tags.floatingBar.button.ariaLabel')"/>
        <span>{{t('tags.floatingBar.button.label', {nb: selectedItems.length})}}</span>
      </div>
    </template>
  </Panel>
</template>

<style scoped>

</style>