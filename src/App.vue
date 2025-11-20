<script setup lang="ts">
import {RouterView} from 'vue-router'
import TaskView from "@/presentation/task/TaskView.vue";
import MainLayout from "@/layouts/MainLayout.vue";
import FooterComponent from "@/components/FooterComponent.vue";
import {onMounted} from "vue";
import Toast from "primevue/toast";
import ProgressBar from "primevue/progressbar";

const html = document.getElementsByTagName('html')[0]

onMounted(() => {
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
