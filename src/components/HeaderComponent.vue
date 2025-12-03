<script setup lang="ts">
import {ref} from "vue";
import ToggleTheme from "@/components/ToggleTheme.vue";
import Button from "primevue/button";
import {useRouter} from "vue-router";

const props = withDefaults(defineProps<{
  title: string | undefined
  back?: boolean
}>(), {
  back: false,
})

const router = useRouter();

const visibleRight = ref(false);
</script>

<template>
  <div class="w-full h-full flex justify-between items-center bg-[var(--p-content-background)]">
    <Button v-if="back" severity="secondary" variant="text" icon="pi pi-arrow-left" @click="router.go(-1)"/>
    <h1 v-if="title" class="px-2 pt-2">{{ title }}</h1>
    <div class="w-fit h-full flex px-2 pt-2 justify-start items-center gap-1">
      <ToggleTheme/>
    </div>
  </div>
  <header class="header-component shadow-sm">
    <slot name="content"/>
  </header>
</template>

<style scoped>

</style>