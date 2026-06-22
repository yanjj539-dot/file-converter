<template>
  <div class="min-h-screen overflow-x-hidden">
    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
    <CarbonDock />
    <ActionDrawer />
  </div>
</template>
