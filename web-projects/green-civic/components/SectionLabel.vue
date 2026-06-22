<script setup lang="ts">
defineProps<{
  label: string
  index?: string
}>()
</script>

<template>
  <div class="flex items-center gap-3 text-xs text-muted md:text-sm">
    <span v-if="index" class="font-mono">{{ index }}</span>
    <span class="h-px w-10 bg-ink/20" />
    <span>{{ label }}</span>
  </div>
</template>
