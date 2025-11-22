<script setup lang="ts">
import {ref, onMounted} from 'vue'
import Button from 'primevue/button';

const value = ref(false)
const html = document.getElementsByTagName('html')[0]

function toggleTheme() {
  if (!value.value) {
    value.value = true;
    html!.classList.add('dark');
    localStorage.setItem('ne_theme', 'dark');
  } else {
    value.value = false;
    html!.classList.remove('dark');
    localStorage.removeItem('ne_theme');
  }
}

onMounted(() => {
  const theme = localStorage.getItem('ne_theme')
  if (theme === 'dark') {
    value.value = true;
  }
})

</script>

<template>
  <div>
    <Button severity="secondary" variant="outlined" :icon="value ? 'pi pi-moon' : 'pi pi-sun'" @click="toggleTheme" />
  </div>
</template>

<style scoped>

</style>