<script setup lang="ts">
import type {Tag as TagObject, Task} from "@/infrastructure/schemas";
import {DateTime} from "luxon";
import {useI18n} from "vue-i18n";
import Editor from "primevue/editor";
import {computed} from "vue";
import {contrastColor} from "@/utils/colorConstrastManager.ts";
import Tag from "primevue/tag";
import Divider from "primevue/divider";
import {getIntervalWithDuration} from "@/utils/common.ts";
import {TypeId, type UserSettings} from "@/infrastructure/schemas/settings.schema.ts";
import {settingsStore} from "@/stores/settingsStore.ts";

const {t, locale} = useI18n();
const useSettingsStore = settingsStore()

const props = withDefaults(defineProps<{
  task: Task;
  tags: TagObject[]
  settings?: UserSettings | null;
}>(), {})

const description = computed(() => props.task.description ?? undefined)

</script>

<template>
  <div class="flex flex-col gap-2">
    <Editor class="card-readonly" v-model="description" readonly editorStyle="height: 160px; width: 100%">
      <template v-slot:toolbar>
        <h3 class="!font-semibold">{{ task.title }}</h3>
      </template>
    </Editor>
    <div class="flex gap-1 flex-wrap items-center">
      <Tag v-for="tag in task.tags"
           :key="tag.id as number"
           :value="tag.name"
           :style="{backgroundColor: `#${tag.color}`, color: `${contrastColor(tag.color as string)}`}"/>

    </div>
    <Divider/>
    <div class="flex flex-col items-start w-full">
      <div  v-if="useSettingsStore.data?.displayTaskIds" class="text-content-secondary w-full grid grid-cols-2">
        <div class="flex justify-start">
          <div>{{ t('common.idLabel') }}</div>
        </div>
        <div class="flex justify-end">
          <div class="font-medium">{{ settings!.idType === TypeId.GENERATED ? task.idGenerated : `${settings!.prefixId}${task.id}` }}</div>
        </div>
      </div>
      <div class="text-content-secondary w-full grid grid-cols-2">
        <div class="flex justify-start">
          <div>{{ t('home.modal.infoTask.createdAt') }}</div>
        </div>
        <div class="flex justify-end">
          <div class="font-medium">{{ DateTime.fromJSDate(task.createdAt).setLocale(locale).toLocaleString(DateTime.DATETIME_MED) }}</div>
        </div>
      </div>
      <div class="text-content-secondary w-full grid grid-cols-2">
        <div class="flex justify-start">
          <div>{{ t('home.modal.infoTask.endedAt') }}</div>
        </div>
        <div class="flex justify-end">
          <div class="font-medium">{{ DateTime.fromJSDate(task.updatedAt).setLocale(locale).toLocaleString(DateTime.DATETIME_MED) }}</div>
        </div>
      </div>
      <div class="text-content-secondary w-full grid grid-cols-2">
        <div class="flex justify-start">
          <div>{{ t('home.modal.infoTask.timeIn') }}</div>
        </div>
        <div class="flex justify-end">
          <span class="font-medium">{{ getIntervalWithDuration(task, locale) }}</span>
        </div>
      </div>
      <div v-if="task.timer && task.timer.duration" class="text-content-secondary w-full grid grid-cols-2">
        <div class="flex justify-start">
          <div>{{ t('home.modal.infoTask.duration') }}</div>
        </div>
        <div class="flex justify-end">
          <div class="font-medium">{{ task.timer.duration }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>