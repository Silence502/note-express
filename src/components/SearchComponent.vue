<script setup lang="ts">
import Button from "primevue/button";
import {IconField, InputIcon, InputText} from "primevue";
import MultiSelect from "primevue/multiselect";
import {onBeforeMount, onMounted, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import type {Tag} from "@/infrastructure/schemas";
import Badge from 'primevue/badge';
import OverlayBadge from 'primevue/overlaybadge';
import {css} from "@primeuix/themes";

const {t, locale} = useI18n();

const props = withDefaults(defineProps<{
  placeholder?: string
  ariaLabel?: string
  filterAriaLabel?: string
  withFilter?: boolean
  values?: Tag[]
  modelValue?: any[]
}>(), {
  withFilter: false
})

const emit = defineEmits<{
  (e: 'handleSearch', value: string): void;
  (e: 'visible', value: boolean): void;
  (e: 'filter', value: any[]): void;
  (e: 'update:modelValue', value: Tag[]): void;
}>()

const searchQuery = ref('')
const selectedTags = ref<Tag[]>([]);

onBeforeMount(() => {
  const tags = localStorage.getItem('ne_tags')
  if (tags) {
    const storedTags = JSON.parse(tags) as Tag[]
    selectedTags.value = storedTags
    emit('update:modelValue', storedTags)
    emit('filter', storedTags)
  } else if (props.modelValue) {
    selectedTags.value = props.modelValue
  }
})

watch(() => props.modelValue, (newValue) => {
  if (newValue && JSON.stringify(newValue) !== JSON.stringify(selectedTags.value)) {
    selectedTags.value = newValue;
  }
})

watch(selectedTags, (newValue) => {
  emit('filter', newValue)
  emit('update:modelValue', newValue)
  localStorage.setItem('ne_tags', JSON.stringify(newValue))
}, {deep: true})
</script>

<template>
  <div class="flex gap-2 flex-row">
    <OverlayBadge severity="secondary"
                  v-if="withFilter"
                  :value="selectedTags.length"
                  size="small" class="filter-badge"
                  :class="{show: selectedTags.length > 0}">
      <MultiSelect size="small"
                   dropdown-icon="pi pi-filter"
                   class="filter"
                   :emptyMessage="t('home.header.button.filter.emptyMessage')"
                   optionLabel="name"
                   optionValue="id"
                   :options="values"
                   v-model="selectedTags"/>
    </OverlayBadge>
    <IconField class="w-full">
      <InputIcon class="pi pi-search"/>
      <InputText fluid
                 @input="$emit('handleSearch', searchQuery)"
                 v-model="searchQuery"
                 size="small"
                 :placeholder="placeholder"/>
    </IconField>
    <Button icon="pi pi-plus"
            size="small"
            class="w-[35px] min-w-[35px]"
            :aria-label="ariaLabel"
            @click="$emit('visible', true)"/>
  </div>
</template>

<style scoped>

</style>