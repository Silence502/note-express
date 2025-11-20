<script setup lang="ts">
import {Form} from '@primevue/forms';
import {FormField} from '@primevue/forms';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import {computed, onMounted, ref} from "vue";
import {zodResolver} from "@primevue/forms/resolvers/zod";
import {type Task, TaskSchema} from "@/infrastructure/schemas/task.schema.ts";
import {type Tag, type TagInput, TagSchema} from "@/infrastructure/schemas/tag.schema.ts";
import ColorPicker from 'primevue/colorpicker';
import {useI18n} from "vue-i18n";

const {t, locale} = useI18n();

const props = withDefaults(defineProps<{
  loading: boolean;
  initialTag?: Task;
}>(), {})

const emit = defineEmits<{
  (e: 'create', tag: TagInput): void
  (e: 'update', value: { id: number, tag: Tag }): void
}>()

const tagCreation = ref()
const tagResolver = ref(zodResolver(TagSchema, undefined, {raw: true}))
const defaultColor = ref(getComputedStyle(document.documentElement)
    .getPropertyValue('--p-primary-300')
    .replace('#', ''))


const onFormSubmit = (event: any) => {
  if (props.initialTag) {
    emit('update', {id: props.initialTag.id! as number, tag: event.values});
  } else {
    emit('create', event.values);
  }
};
</script>

<template>
  <Form id="tag-creation-form"
        ref="tagCreation"
        class="flex flex-col gap-2"
        v-slot="$form"
        :initialValues="initialTag"
        @submit="onFormSubmit"
        :resolver="tagResolver">
    <FormField name="name"
               :schema="TagSchema">
      <InputText name="name"
                 fluid
                 autofocus
                 :placeholder="t('tags.modal.createTag.form.placeholder.title')"/>
      <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{ $form.name?.error?.message }}</Message>
    </FormField>
    <FormField name="color"
               v-slot="$field"
               :schema="TagSchema">
      <div class="flex flex-row gap-2 items-center">
        <ColorPicker name="color" :default-color="defaultColor" v-model="$field.value" mode="simple" format="hex"/>
        <label for="color">{{ t('tags.modal.createTag.form.placeholder.color') }}</label>
        <Message v-if="$form.color?.invalid" severity="error" size="small" variant="simple">{{ $form.color.error?.message }}</Message>
      </div>
    </FormField>
    <div class="flex justify-end gap-2">
      <Button type="submit"
              :loading
              severity="primary"
              :aria-label="t('tags.modal.createTag.form.button.submit')"
              :disabled="$form.name?.value === null || !$form.valid || loading"
              :label="t('tags.modal.createTag.form.button.submit')"/>
    </div>
  </Form>
</template>

<style scoped>

</style>