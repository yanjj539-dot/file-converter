<script setup lang="ts">
const assetPath = useAssetPath()

useHead({
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: assetPath('/favicon.svg') }
  ]
})
</script>

<template>
  <div class="min-h-screen overflow-x-hidden">
    <div class="site-progress" aria-hidden="true" />
    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
    <CarbonDock />
    <ActionDrawer />
  </div>
</template>
