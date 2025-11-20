<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string | undefined
}>(), {})
</script>

<template>
  <div class="w-full h-full bg-[var(--p-content-background)]">
    <h1 v-if="title" class="px-2 pt-2">{{ title }}</h1>
  </div>
  <header class="header-component shadow-sm">
    <slot name="content"/>
  </header>
</template>

<style scoped>

</style>