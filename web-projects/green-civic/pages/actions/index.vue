<script setup lang="ts">
import { Search, SlidersHorizontal } from 'lucide-vue-next'
import { actions, collections } from '~/data/site'

useSeoMeta({
  title: '行动目录 / Green Civic',
  description: '城市环保、绿色出行、垃圾分类、循环材料、公共空间环保改造与校园社区低碳行动目录。'
})

const page = ref<HTMLElement | null>(null)
const selectedCollection = ref('全部行动')
const selectedType = ref('全部类型')
const query = ref('')

useGsapReveals(page)

const types = computed(() => ['全部类型', ...Array.from(new Set(actions.map((action) => action.type)))])

const filteredActions = computed(() => {
  const keyword = query.value.trim().toLowerCase()

  return actions.filter((action) => {
    const collectionMatch = selectedCollection.value === '全部行动' || action.collection === selectedCollection.value
    const typeMatch = selectedType.value === '全部类型' || action.type === selectedType.value
    const keywordMatch =
      !keyword ||
      [action.title, action.subtitle, action.collection, action.type, action.location]
        .join(' ')
        .toLowerCase()
        .includes(keyword)

    return collectionMatch && typeMatch && keywordMatch
  })
})
</script>

<template>
  <div ref="page" class="pt-28 md:pt-32">
    <section class="site-container">
      <div class="grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <SectionLabel label="Catalogue" index="01" />
        </div>
        <div class="lg:col-span-8">
          <h1 class="text-6xl font-medium leading-none md:text-8xl">行动目录</h1>
          <p class="mt-6 max-w-3xl text-xl leading-8 text-muted">
            每个行动都以公共产品的方式描述：部署场景、材料模块、运营周期、共管角色和可衡量影响。
          </p>
        </div>
      </div>
    </section>

    <section class="site-container mt-16 border-t border-ink/15 pt-6">
      <div class="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div class="lg:col-span-3">
          <div class="flex items-center gap-2 text-sm text-muted">
            <SlidersHorizontal :size="16" stroke-width="1.7" aria-hidden="true" />
            <span>筛选</span>
          </div>
        </div>

        <div class="grid gap-4 lg:col-span-9">
          <div class="thin-scrollbar flex gap-2 overflow-x-auto pb-2">
            <button
              v-for="collection in ['全部行动', ...collections]"
              :key="collection"
              type="button"
              class="focus-ring h-10 shrink-0 rounded-full border px-4 text-sm"
              :class="selectedCollection === collection ? 'border-ink bg-ink text-paper' : 'border-ink/15 text-muted hover:text-ink'"
              @click="selectedCollection = collection"
            >
              {{ collection }}
            </button>
          </div>

          <div class="grid gap-3 md:grid-cols-[1fr_auto]">
            <label class="focus-within:border-ink flex h-12 items-center gap-3 rounded-full border border-ink/15 px-4">
              <Search :size="16" stroke-width="1.7" aria-hidden="true" />
              <input v-model="query" class="w-full bg-transparent text-sm outline-none" placeholder="搜索街区、材料或行动" />
            </label>
            <select v-model="selectedType" class="focus-ring h-12 rounded-full border border-ink/15 bg-paper px-4 text-sm">
              <option v-for="type in types" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <section class="site-container section-y">
      <div class="grid gap-x-8 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
        <ActionCard v-for="action in filteredActions" :key="action.slug" :action="action" compact data-reveal />
      </div>

      <div v-if="!filteredActions.length" class="border-t border-ink/15 py-20 text-center">
        <p class="text-lg text-muted">当前筛选下没有匹配行动。</p>
      </div>
    </section>
  </div>
</template>
