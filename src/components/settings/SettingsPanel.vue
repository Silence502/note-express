<script setup lang="ts">
import Select from 'primevue/select';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import {onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import ToggleTheme from "@/components/ToggleTheme.vue";
const version = ref(import.meta.env.VITE_APP_VERSION)

const {t, locale} = useI18n();

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
  <section class="flex flex-col justify-center h-full">
    <section class="flex flex-row gap-2 justify-between items-center">
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
    </section>
    <section>
      <router-link to="/change-log" @click="$emit('close')" class="!text-xs">{{version}}</router-link>
    </section>
  </section>
</template>

<style scoped>

</style>