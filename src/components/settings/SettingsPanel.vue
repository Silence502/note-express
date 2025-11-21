<script setup lang="ts">
import Select from 'primevue/select';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import {onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import ToggleTheme from "@/components/ToggleTheme.vue";
import Button from "primevue/button";
import {taskStore} from "@/stores/taskStore.ts";
import {useDataParser} from "@/composables/dataParser.composable.ts";
import Divider from "primevue/divider";

const version = ref(import.meta.env.VITE_APP_VERSION)

const emit = defineEmits<{
  (e: 'close'): void;
}>()

const {
  exportToCSV
} = useDataParser()

const {t, locale} = useI18n();
const useTasks = taskStore()

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
      <h3>Import - export</h3>
      <div class="flex flex-row gap-2 justify-start items-center">
        <Button severity="secondary" variant="text" icon="pi pi-file-import" @click=""/>
        <Button severity="secondary" variant="text" icon="pi pi-file-export" @click="exportToCSV(useTasks.data)"/>
      </div>
    </div>
    <Divider />
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
      <ToggleTheme/>
    </div>
    <section>
      <router-link to="/change-log" @click="$emit('close')" class="!text-xs">{{ version }}</router-link>
    </section>
  </section>
</template>

<style scoped>

</style>