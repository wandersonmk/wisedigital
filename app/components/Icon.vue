<template>
  <ClientOnly>
    <font-awesome-icon 
      :icon="icon" 
      :class="className"
    />
    <template #fallback>
      <span :class="className">{{ fallback }}</span>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  className?: string
  fallback?: string
}>()
</script>

