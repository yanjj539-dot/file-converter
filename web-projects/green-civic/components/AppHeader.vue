<script setup lang="ts">
import { Menu, X, ArrowUpRight, Search } from 'lucide-vue-next'
import { navItems } from '~/data/site'

const route = useRoute()
const mobileOpen = ref(false)
const { openDrawer, actions } = useActionDrawer()

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  }
)
</script>

<template>
  <header class="fixed left-0 right-0 top-0 z-40 px-4 pt-4 md:px-8">
    <div class="mx-auto flex max-w-[1520px] items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/"
          class="pill focus-ring magnetic-button flex h-12 items-center gap-3 px-4 text-sm font-medium"
          aria-label="Green Civic 首页"
        >
          <span class="grid size-7 place-items-center rounded-full bg-ink text-xs text-paper">GC</span>
          <span class="hidden sm:inline">Green Civic</span>
        </NuxtLink>
        <NuxtLink
          to="/actions"
          class="pill focus-ring magnetic-button hidden size-12 place-items-center md:grid"
          aria-label="搜索行动目录"
        >
          <Search :size="18" stroke-width="1.7" aria-hidden="true" />
        </NuxtLink>
      </div>

      <nav class="pill hidden h-12 items-center gap-1 px-2 md:flex" aria-label="主导航">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="focus-ring rounded-full px-4 py-2 text-sm text-muted transition hover:text-ink"
          :class="{ 'bg-ink text-paper hover:text-paper': route.path === item.to || route.path.startsWith(`${item.to}/`) }"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <button
          class="pill focus-ring magnetic-button hidden h-12 items-center gap-2 px-4 text-sm font-medium md:flex"
          type="button"
          @click="openDrawer"
        >
          <span>加入行动</span>
          <span class="grid size-6 place-items-center rounded-full bg-acid text-xs text-ink">{{ actions.length }}</span>
          <ArrowUpRight :size="16" stroke-width="1.7" aria-hidden="true" />
        </button>

        <button
          class="pill focus-ring grid size-12 place-items-center md:hidden"
          type="button"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-navigation"
          aria-label="打开导航"
          @click="mobileOpen = !mobileOpen"
        >
          <X v-if="mobileOpen" :size="19" stroke-width="1.7" aria-hidden="true" />
          <Menu v-else :size="19" stroke-width="1.7" aria-hidden="true" />
        </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileOpen"
        id="mobile-navigation"
        class="site-container mt-3 border border-ink/15 bg-paper/95 p-3 shadow-soft backdrop-blur md:hidden"
      >
        <nav class="grid gap-1" aria-label="移动导航">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="focus-ring rounded px-3 py-3 text-sm"
            :class="{ 'bg-ink text-paper': route.path === item.to || route.path.startsWith(`${item.to}/`) }"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
        <button
          class="focus-ring mt-3 flex h-12 w-full items-center justify-between rounded bg-ink px-3 text-sm text-paper"
          type="button"
          @click="openDrawer"
        >
          <span>加入行动</span>
          <span class="rounded-full bg-acid px-2 py-1 text-xs text-ink">{{ actions.length }}</span>
        </button>
      </div>
    </Transition>
  </header>
</template>
