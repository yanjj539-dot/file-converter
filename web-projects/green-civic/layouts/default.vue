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
