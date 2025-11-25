<script setup lang="ts">
import {RouterView} from 'vue-router'
import MainLayout from "@/layouts/MainLayout.vue";
import FooterComponent from "@/components/FooterComponent.vue";
import {onMounted} from "vue";
import Toast from "primevue/toast";
import {settingsStore} from "@/stores/settingsStore.ts";
import {useSettings} from "@/composables/settings.composable.ts";

const html = document.getElementsByTagName('html')[0]

const useSettingsStore = settingsStore()

const {
  settings,
} = useSettings()

onMounted(() => {
  if (!settings.value)
    useSettingsStore.setData(settings.value)
  const theme = localStorage.getItem('ne_theme')
  if (theme === 'dark') {
    html!.classList.add('dark');
  }
})
</script>

<template>
  <MainLayout>
    <template #content>
      <RouterView/>
    </template>
  </MainLayout>
  <FooterComponent/>
  <Toast class="!w-[calc(100vw-40px)] !bottom-[68px]" position="bottom-left"/>
</template>

<style scoped></style>
