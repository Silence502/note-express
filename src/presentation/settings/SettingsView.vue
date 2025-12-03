<script setup lang="ts">
import Select from 'primevue/select';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import {computed, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import Button from "primevue/button";
import {taskStore} from "@/stores/taskStore.ts";
import {useDataParser} from "@/composables/dataParser.composable.ts";
import {emitter} from "@/services/eventBus.ts";
import {useSettings} from "@/composables/settings.composable.ts";
import ToggleSwitch from 'primevue/toggleswitch';
import InputText from "primevue/inputtext";
import {SettingsSchema, TypeId} from "@/infrastructure/schemas/settings.schema.ts";
import {zodResolver} from "@primevue/forms/resolvers/zod";
import {Form} from "@primevue/forms";
import {FormField} from "@primevue/forms";
import Message from "primevue/message";
import HeaderComponent from "@/components/HeaderComponent.vue";
import SectionLayout from "@/layouts/SectionLayout.vue";
import Panel from 'primevue/panel';

const version = ref(import.meta.env.VITE_APP_VERSION)

const emit = defineEmits<{
  (e: 'close'): void;
}>()

const {
  exportToCSV,
  importFromCSV,
  importedList
} = useDataParser()

const {
  settings,
  settingsValue,
  loading,
  error,
  isSettingsLoading,
  updateSettings,
  loadSettings
} = useSettings()

const {t, locale} = useI18n();
const useTasksStore = taskStore()

const fileInput = ref<HTMLInputElement | null>(null);
const selectedLocale = ref();
const settingsResolver = ref(zodResolver(SettingsSchema, undefined, {raw: true}))
const locales = ref([
  {name: 'FR', code: 'fr'},
  // {name: 'EN', code: 'en'},
  // {name: 'ES', code: 'es'},
  // {name: 'IT', code: 'it'},
  // {name: 'DE', code: 'de'},
  // {name: 'KR', code: 'kr'},
  // {name: 'JP', code: 'jp'},
]);

function changeLocale(newLocale: string): void {
  locale.value = newLocale
  localStorage.setItem('ne_language', newLocale)
}

const emitterUpdate = () => {
  emitter.emit('update-items', true);
};

/**
 * Asynchronous function to handle file import from an input event.
 *
 * This function processes the `change` event from a file input, retrieves the selected file,
 * and performs a CSV import operation. Upon successful import, it displays a success message
 * using `ElMessage` and triggers an update event to notify other parts of the application.
 * Errors during the import process are caught and logged to the console.
 *
 * @param {Event} e - The input event triggered by a file selection.
 */
const handleFileImport = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  emitterUpdate()

  importFromCSV(file).then(async () => {
    emitterUpdate.call(this)
    emit('close')
  });
};

const isDisplayIdChecked = computed({
  get: () => settings.value?.displayTaskIds || false,
  set: async (newValue: boolean) => {
    if (settings.value) {
      await updateSettings(settings.value.id, {displayTaskIds: newValue});
      await loadSettings(settings.value.id);
      emitterUpdate();
    }
  }
});

const handleDisplayIdChange = () => {
  isDisplayIdChecked.value = !isDisplayIdChecked.value;
}

const options = computed(() => {
  return [
    {label: t('settings.typeId.select.native.label'), value: TypeId.NATIVE},
    {label: t('settings.typeId.select.generated.label'), value: TypeId.GENERATED},
  ]
  // return Object.values(TypeId).map(type => ({label: type, value: type}))
})

const isTypeIdChange = computed({
  get: () => settings.value?.idType || TypeId.NATIVE,
  set: async (newValue: TypeId) => {
    if (settings.value) {
      await updateSettings(settings.value.id, {idType: newValue});
      await loadSettings(settings.value.id);
      emitterUpdate();
    }
  }
});

const onPrefixSubmit = (event: any) => {
  if (settingsValue.value) {
    updateSettings(settingsValue.value.id, {prefixId: String(event.values.prefixId).toUpperCase()})
  }
}

onMounted(() => {
  const locale = localStorage.getItem('ne_language')
  if (locale) {
    selectedLocale.value = locale
  }
})
</script>

<template>
  <HeaderComponent :title="t('settings.title')">
    <template #content>
      <div class="flex items-center gap-2">
        <h3>{{ t('settings.subTitle') }}</h3>
      </div>
    </template>
  </HeaderComponent>
  <SectionLayout>
    <template #content>
      <Panel :header="t('settings.generalHeader')">
        <div class="flex flex-col gap-4">
          <div class="flex flex-row gap-2 justify-between items-center">
            <div class="flex flex-col gap-2">
              <label>{{ t('settings.locale.label') }}</label>
              <InputGroup class="!w-[140px]">
                <InputGroupAddon>
                  <i class="pi pi-globe"></i>
                </InputGroupAddon>
                <Select v-model="selectedLocale"
                        :options="locales"
                        @valueChange="isTypeIdChange"
                        size="small"
                        optionLabel="name"
                        optionValue="code"
                        :placeholder="t('settings.locale.placeholder')"
                        class="md:w-56"
                        @change="changeLocale(selectedLocale)"/>
              </InputGroup>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex flex-row gap-1 items-center">
                <label>{{ t('settings.importExport.label') }}</label>
                <i v-tooltip.left="t('settings.importExport.help')" class="!text-xs ml-1 pi pi-info-circle"/>
              </div>
              <div class="flex flex-row gap-1">
                <input
                    type="file"
                    accept=".csv"
                    @change="handleFileImport"
                    hidden
                    ref="fileInput"
                />
                <Button v-tooltip.top="t('settings.importExport.importTooltip')" severity="secondary" variant="text"
                        icon="pi pi-file-import" @click="fileInput?.click()"/>
                <Button v-tooltip.top="t('settings.importExport.exportTooltip')" severity="secondary" variant="text"
                        icon="pi pi-file-export"
                        @click="exportToCSV(useTasksStore.data)"/>
              </div>
            </div>
          </div>
          <router-link to="/change-log" @click="$emit('close')" class="!text-xs">{{ version }}</router-link>
        </div>
      </Panel>

      <Panel header="Gestion des identifiants">
        <div class="flex flex-col gap-4">
          <div class="flex flex-row gap-2 items-center" v-if="settingsValue">
            <ToggleSwitch
                id="display-id-switch"
                :model-value="isDisplayIdChecked"
                @update:model-value="handleDisplayIdChange">
              <template #handle="{ checked }">
                <i :class="['!text-xs pi', { 'pi-check': checked, 'pi-times': !checked }]"/>
              </template>
            </ToggleSwitch>
            <label for="display-id-switch">{{ t('settings.displayId.label') }}</label>
          </div>
          <div class="grid grid-rows-2 md:grid-cols-2 md:grid-rows-1 gap-2 items-center" v-if="settingsValue">
            <div class="flex flex-col gap-2 w-full">
              <label for="type-input">
                {{ t('settings.typeId.label') }}
                <i class="!text-xs ml-1 pi pi-info-circle"
                   v-tooltip.rigth="settings?.idType === TypeId.GENERATED ? t('settings.typeId.select.generated.info') : t('settings.typeId.select.native.info')"/>
              </label>
              <Select size="small"
                      id="type-input"
                      :options="options"
                      v-model="isTypeIdChange"
                      :disabled="!settings?.displayTaskIds"
                      optionLabel="label"
                      optionValue="value"/>
            </div>
            <Form id="prefix-form"
                  name="prefixId"
                  class="grid grid-cols-[1fr_max-content] gap-2 w-full items-end"
                  v-slot="$form"
                  @submit="onPrefixSubmit"
                  :initialValues="settingsValue"
                  :resolver="settingsResolver">
              <FormField class="flex flex-col gap-2" name="prefixId" :schema="SettingsSchema">
                <label for="prefix-input">
                  {{ t('settings.prefixId.label') }}
                  <i class="!text-xs ml-1 pi pi-info-circle" v-tooltip.left="t('settings.typeId.info')"/>
                </label>
                <InputText fluid :disabled="settings?.idType === TypeId.GENERATED || !settings?.displayTaskIds"
                           id="prefix-input"
                           :default-value="settings?.prefixId"
                           size="small"
                           class="uppercase"/>
                <Message v-if="$form.description?.invalid" severity="error" size="small" variant="simple">
                  {{ t($form.description?.error?.message, {nb: 2}) }}
                </Message>
              </FormField>
              <Button type="submit"
                      :disabled="$form.type?.value === null || !$form.valid || !settings?.displayTaskIds || settings?.idType === TypeId.GENERATED"
                      severity="primary"
                      size="small"
                      label="Valider"
                      icon="pi pi-check"/>
            </Form>
          </div>
        </div>
      </Panel>

      <Panel header="Chronomètre">

      </Panel>
    </template>
  </SectionLayout>
</template>

<style scoped>

</style>