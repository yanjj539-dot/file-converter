<script setup lang="ts">
const { openDrawer, actions } = useActionDrawer()
</script>

<template>
  <button
    class="carbon-dock focus-ring"
    type="button"
    :aria-label="`打开加入行动抽屉，当前已选择 ${actions.length} 项行动`"
    @click="openDrawer"
  >
    <span class="carbon-dock-mark">CO2</span>
    <span class="carbon-dock-text">{{ actions.length }} 项行动</span>
  </button>
</template>
