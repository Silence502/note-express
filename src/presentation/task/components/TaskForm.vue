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
import {TypeId, type UserSettings} from "@/infrastructure/schemas/settings.schema.ts";
import {settingsStore} from "@/stores/settingsStore.ts";

const {t, locale} = useI18n();
const useSettingsStore = settingsStore()

const props = withDefaults(defineProps<{
  loading: boolean;
  initialTask?: Task;
  tags: Tag[];
}>(), {})

const emit = defineEmits<{
  (e: 'create', task: TaskInput): void
  (e: 'update', value: { id: number, task: Task }): void
}>()

const taskCreation = ref()
const taskResolver = ref(zodResolver(TaskSchema, undefined, {raw: true}))
const selectedTags = ref<Tag[]>([]);

const onFormSubmit = (event: any) => {
  if (props.initialTask) {
    emit('update', {id: props.initialTask.id! as number, task: event.values});
  } else {
    emit('create', event.values);
  }
};

</script>

<template>
  <Form id="task-creation-form"
        ref="taskCreation"
        class="flex flex-col gap-2"
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
    <div v-if="initialTask && useSettingsStore.data" class="text-content-secondary">{{t('common.idLabel')}}<span class="font-medium">{{useSettingsStore.data!.idType === TypeId.GENERATED ? initialTask.idGenerated : `${useSettingsStore.data!.prefixId}${initialTask.id}`}}</span></div>
    <div class="flex justify-end gap-2">
      <Button type="submit"
              :loading
              severity="primary"
              :aria-label="t('home.modal.createTask.form.button.submit')"
              :disabled="$form.title?.value === null || !$form.valid || loading"
              :label="t('home.modal.createTask.form.button.submit')"/>
    </div>
  </Form>
</template>

<style scoped>

</style>