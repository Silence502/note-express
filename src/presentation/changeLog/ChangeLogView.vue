<script setup lang="ts">
import HeaderComponent from "@/components/HeaderComponent.vue";
import Button from "primevue/button";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";

const {t, locale} = useI18n();
const router = useRouter();
</script>

<template>
  <HeaderComponent :title="t('change-log.header.title')">
    <template #content>
      <div class="flex items-center gap-2">
        <Button severity="secondary" variant="text" icon="pi pi-arrow-left" @click="router.go(-1)"/>
        <h3 class="ml-2">{{t('change-log.header.subtitle')}}</h3>
      </div>
    </template>
  </HeaderComponent>
</template>

<style scoped>

</style>