<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { navItems } from '~/data/site'

const { openDrawer } = useActionDrawer()
</script>

<template>
  <footer class="border-t border-ink/15 bg-night text-paper">
    <div class="site-container section-y">
      <div class="grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-6">
          <p class="text-sm text-paper/60">Green Civic / 城市绿色公益行动平台</p>
          <h2 class="mt-6 max-w-3xl text-5xl font-medium leading-none md:text-7xl">把低碳行动做成城市基础设施。</h2>
        </div>
        <div class="lg:col-span-3 lg:col-start-8">
          <p class="text-sm text-paper/60">站点结构</p>
          <nav class="mt-5 grid gap-3" aria-label="页脚导航">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="focus-ring flex items-center justify-between border-b border-paper/20 pb-3 text-sm"
            >
              <span>{{ item.label }}</span>
              <ArrowUpRight :size="15" stroke-width="1.7" aria-hidden="true" />
            </NuxtLink>
          </nav>
        </div>
        <div class="lg:col-span-2">
          <p class="text-sm text-paper/60">参与方式</p>
          <button class="focus-ring mt-5 flex h-12 items-center gap-2 rounded-full bg-paper px-5 text-sm text-ink" type="button" @click="openDrawer">
            <span>加入行动</span>
            <ArrowUpRight :size="15" stroke-width="1.7" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div class="mt-20 flex flex-col gap-4 border-t border-paper/15 pt-6 text-xs text-paper/50 md:flex-row md:items-center md:justify-between">
        <p>© 2026 Green Civic. Public environmental action platform.</p>
        <p>城市环保 / 绿色出行 / 循环材料 / 公益共建</p>
      </div>
    </div>
  </footer>
</template>
