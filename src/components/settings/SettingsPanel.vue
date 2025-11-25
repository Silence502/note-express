<script setup lang="ts">
import Select from 'primevue/select';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import {computed, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import ToggleTheme from "@/components/ToggleTheme.vue";
import Button from "primevue/button";
import {taskStore} from "@/stores/taskStore.ts";
import {useDataParser} from "@/composables/dataParser.composable.ts";
import Divider from "primevue/divider";
import {emitter} from "@/services/eventBus.ts";
import {useSettings} from "@/composables/settings.composable.ts";
import ToggleSwitch from 'primevue/toggleswitch';


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
const locales = ref([
  {name: 'FR', code: 'fr'},
  {name: 'EN', code: 'en'},
  {name: 'ES', code: 'es'},
  {name: 'IT', code: 'it'},
  {name: 'DE', code: 'de'},
  {name: 'KR', code: 'kr'},
  {name: 'JP', code: 'jp'},
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

onMounted(() => {
  const locale = localStorage.getItem('ne_language')
  if (locale) {
    selectedLocale.value = locale
  }
})
</script>

<template>
  <section class="flex flex-col justify-end h-full gap-2">
    <div class="flex gap-2 flex-col justify-start">
      <div class="grid grid-cols-2 items-end gap-2">
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
<!--        <div class="flex flex-col gap-2 items-start" v-if="settingsValue">-->
<!--          <label for="prefix-input">{{ t('settings.prefixId.label') }}</label>-->
<!--          <InputText id="prefix-input" :default-value="settings?.prefixId" size="small" class="w-20"/>-->
<!--        </div>-->
      </div>
    </div>
    <Divider/>
    <div class="flex flex-row gap-2 justify-between items-center">
      <InputGroup class="!w-[140px]">
        <InputGroupAddon>
          <i class="pi pi-globe"></i>
        </InputGroupAddon>
        <Select v-model="selectedLocale"
                :options="locales"
                size="small"
                optionLabel="name"
                optionValue="code"
                :placeholder="t('settings.locale.placeholder')"
                class="md:w-56"
                @change="changeLocale(selectedLocale)"/>
      </InputGroup>
      <div class="flex flex-row gap-1">
        <input
            type="file"
            accept=".csv"
            @change="handleFileImport"
            hidden
            ref="fileInput"
        />
        <Button severity="secondary" variant="text" icon="pi pi-file-import" @click="fileInput?.click()"/>
        <Button severity="secondary" variant="text" icon="pi pi-file-export" @click="exportToCSV(useTasksStore.data)"/>
      </div>
      <ToggleTheme/>
    </div>
    <section>
      <router-link to="/change-log" @click="$emit('close')" class="!text-xs">{{ version }}</router-link>
    </section>
  </section>
</template>

<style scoped>

</style>