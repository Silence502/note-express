<script setup lang="ts">
import Button from 'primevue/button';
import {useRouter} from "vue-router";
import Drawer from "primevue/drawer";
import {ref} from "vue";
import {useI18n} from "vue-i18n";
import SettingsPanel from "@/components/settings/SettingsPanel.vue";

const {t, locale} = useI18n();
const router = useRouter();

const visibleRight = ref(false);
</script>

<template>
  <footer class="footer-component">
    <div class="flex justify-between items-center gap-2">
      <div class="w-fit h-full flex justify-start items-center gap-1">
        <Button severity="secondary"
                :variant="router.currentRoute.value.name === 'home' ? '' : 'text'"
                @click="router.push({ name: 'home'})"
                icon="pi pi-home"/>
        <Button severity="secondary"
                :variant="router.currentRoute.value.name === 'tags' ? '' : 'text'"
                @click="router.push({ name: 'tags'})"
                icon="pi pi-tag"/>
        <Button severity="secondary"
                variant="text"
                v-tooltip.top="'Coming soon'"
                disabled
                class="!cursor-not-allowed"
                icon="pi pi-clipboard"/>
      </div>
      <div class="w-fit h-full flex justify-start items-center gap-1">
        <Button severity="secondary"
                variant="text"
                @click="visibleRight = true"
                icon="pi pi-cog"/>
      </div>
    </div>
  </footer>

  <Drawer v-model:visible="visibleRight" :header="t('settings.title')" position="bottom" class="!h-fit">
    <SettingsPanel @close="visibleRight = false"/>
  </Drawer>
</template>

<style scoped>

</style>