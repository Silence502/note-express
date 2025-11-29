<script setup lang="ts">
import {Form} from '@primevue/forms';
import {FormField} from '@primevue/forms';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import {ref} from "vue";
import {zodResolver} from "@primevue/forms/resolvers/zod";
import {type Task, type TaskInput, TaskSchema} from "@/infrastructure/schemas/task.schema.ts";
import MultiSelect from 'primevue/multiselect';
import type {Tag} from "@/infrastructure/schemas/tag.schema.ts";
import {useI18n} from "vue-i18n";
import Editor from 'primevue/editor';
import {TypeId} from "@/infrastructure/schemas/settings.schema.ts";
import {settingsStore} from "@/stores/settingsStore.ts";

const {t} = useI18n();
const useSettingsStore = settingsStore()

const props = withDefaults(defineProps<{
  loading: boolean;
  initialTask?: Task;
  tags: Tag[];
}>(), {})

const emit = defineEmits<{
  (e: 'create', task: TaskInput): void
  (e: 'update', value: { id: number, task: Task }): void
  (e: 'isFormDirty', value: boolean): void
}>()

const taskCreation = ref()
const taskResolver = ref(zodResolver(TaskSchema, undefined, {raw: true}))
const selectedTags = ref<Tag[]>([]);
const isDirty = ref(false)

const onFormSubmit = (event: any) => {
  if (props.initialTask) {
    emit('update', {id: props.initialTask.id! as number, task: event.values});
  } else {
    emit('create', event.values);
  }
};

function resetForm(form: any) {
  form.reset()
  isDirty.value = false;
  emit('isFormDirty', isDirty.value)
}

function changeForm() {
  isDirty.value = true
  emit('isFormDirty', isDirty.value)
}

function resetTimer(task: Task) {
  emit('update', {id: task.id! as number, task: {...task, timer: undefined}});
}

</script>

<template>
  <Form id="task-creation-form"
        ref="taskCreation"
        class="flex flex-col gap-2"
        @input="changeForm"
        v-slot="$form"
        :initialValues="initialTask"
        @submit="onFormSubmit"
        :resolver="taskResolver">
    <FormField name="title"
               :schema="TaskSchema">
      <InputText name="title"
                 fluid
                 autofocus
                 :placeholder="t('home.modal.createTask.form.placeholder.title')"/>
      <Message v-if="$form.title?.invalid" severity="error" size="small" variant="simple">{{ t($form.title?.error?.message, {nb: 100}) }}</Message>
    </FormField>
    <FormField name="description" class=""
               :schema="TaskSchema">
      <Editor editorStyle="height: 160px; width: 100%"
              name="description"
              :placeholder="t('home.modal.createTask.form.placeholder.description')">
        <template v-slot:toolbar>
          <span class="ql-formats">
              <button class="ql-bold"></button>
              <button class="ql-italic"></button>
              <button class="ql-underline"></button>
          </span>
        </template>
      </Editor>
      <Message v-if="$form.description?.invalid" severity="error" size="small" variant="simple">{{ t($form.description?.error?.message, {nb: 500}) }}</Message>
    </FormField>
    <FormField name="tags" :schema="TaskSchema">
      <MultiSelect v-model="selectedTags"
                   :options="tags"
                   display="chip"
                   optionLabel="name"
                   filter
                   :empty-message="t('common.emptyMessage')"
                   :placeholder="t('home.modal.createTask.form.placeholder.selectTags')"
                   :maxSelectedLabels="2"
                   class="w-full md:w-80"/>
    </FormField>
    <div v-if="initialTask">
      <div v-if="useSettingsStore.data?.displayTaskIds" class="text-content-secondary w-full grid grid-cols-2">
        <div class="flex justify-start">
          <div>{{ t('common.idLabel') }}</div>
        </div>
        <div class="flex justify-end">
          <div class="font-medium">{{ useSettingsStore.data!.idType === TypeId.GENERATED ? initialTask.idGenerated : `${useSettingsStore.data!.prefixId}${initialTask.id}` }}</div>
        </div>
      </div>

      <div class="text-content-secondary w-full grid grid-cols-2" v-if="initialTask!.timer?.duration">
        <div class="flex justify-start">
          <div>Temps d'exécution :</div>
        </div>
        <div class="flex justify-end">
          <div class="font-medium"><i v-if="initialTask!.isTimerRunning" v-tooltip.left="'Tâche en cours d\'exécution'" class="pi pi-stopwatch mr-2 !text-xs text-background-warning" />{{ initialTask!.timer?.duration }}</div>
        </div>
      </div>
    </div>
    <div class="flex gap-2">
      <Button v-if="initialTask && initialTask.timer?.duration"
              icon="pi pi-refresh"
              variant="text"
              severity="secondary"
              :disabled="initialTask.isTimerRunning"
              rounded
              :class="{'!cursor-not-allowed': initialTask.isTimerRunning}"
              v-tooltip.left="initialTask.isTimerRunning ? '' : 'Réinitialiser le compteur'"
              @click="resetTimer(initialTask)"
              type="button"/>
      <div class="flex gap-2 w-full justify-end">
        <Button type="button"
                :loading
                severity="secondary"
                @click="resetForm($form)"
                :aria-label="t('home.modal.createTask.form.button.submit')"
                :disabled="!$form.title?.dirty && !$form.description?.dirty && !$form.tags?.dirty"
                :label="t('common.cancel')"/>
        <Button type="submit"
                :loading
                severity="primary"
                :aria-label="t('home.modal.createTask.form.button.submit')"
                :disabled="$form.title?.value === null || !$form.valid || loading"
                :label="t('home.modal.createTask.form.button.submit')"/>
      </div>
    </div>
  </Form>
</template>

<style scoped>

</style>