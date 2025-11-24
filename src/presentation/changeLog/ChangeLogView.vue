<script setup lang="ts">
import HeaderComponent from "@/components/HeaderComponent.vue";
import Button from "primevue/button";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import SectionLayout from "@/layouts/SectionLayout.vue";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Tag from "primevue/tag";
import {computed, ref} from "vue";

const version = ref(import.meta.env.VITE_APP_VERSION)

const {t, locale} = useI18n();
const router = useRouter();

enum TagType {
  PRIMARY = 'primary',
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
  INFO = 'info',
  NEUTRAL = 'neutral',
}

const tableData = computed(() => [
  {
    type: t('change-log.content.note1.type'),
    tagType: t('change-log.content.note1.tagType'),
    note: t('change-log.content.note1.note')
  },
  {
    type: t('change-log.content.note2.type'),
    tagType: t('change-log.content.note2.tagType'),
    note: t('change-log.content.note2.note')
  },
  {
    type: t('change-log.content.note3.type'),
    tagType: t('change-log.content.note3.tagType'),
    note: t('change-log.content.note3.note')
  },
  {
    type: t('change-log.content.note4.type'),
    tagType: t('change-log.content.note4.tagType'),
    note: t('change-log.content.note4.note')
  },
  {
    type: t('change-log.content.note5.type'),
    tagType: t('change-log.content.note5.tagType'),
    note: t('change-log.content.note5.note')
  },
  {
    type: t('change-log.content.note6.type'),
    tagType: t('change-log.content.note6.tagType'),
    note: t('change-log.content.note6.note')
  },
])
</script>

<template>
  <HeaderComponent :title="t('change-log.header.title')">
    <template #content>
      <div class="flex items-center gap-2">
        <Button severity="secondary" variant="text" icon="pi pi-arrow-left" @click="router.go(-1)"/>
        <h3 class="ml-2">{{ t('change-log.header.subtitle', {value: version}) }}</h3>
      </div>
    </template>
  </HeaderComponent>

  <SectionLayout>
    <template #content>
      <section>
        <DataTable :value="tableData"
                   stripedRows>
          <Column field="type" header="Type">
            <template #body="{data}">
              <Tag :severity="data.tagType" class="!text-sm">
                {{ data.type }}
              </Tag>
            </template>
          </Column>
          <Column field="note" header="Note"/>
        </DataTable>
      </section>
    </template>
  </SectionLayout>

</template>

<style scoped>

</style>