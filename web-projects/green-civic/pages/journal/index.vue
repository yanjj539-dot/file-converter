<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { journalPosts } from '~/data/site'

useSeoMeta({
  title: 'Journal / Green Civic',
  description: '城市绿色公益行动的案例文章、田野记录、材料研究与低碳出行观察。'
})

const page = ref<HTMLElement | null>(null)
const activeCategory = ref('全部')
const assetPath = useAssetPath()

useGsapReveals(page)

const categories = computed(() => ['全部', ...Array.from(new Set(journalPosts.map((post) => post.category)))])
const filteredPosts = computed(() =>
  activeCategory.value === '全部' ? journalPosts : journalPosts.filter((post) => post.category === activeCategory.value)
)
const heroPost = journalPosts[0]
</script>

<template>
  <div ref="page" class="pt-28 md:pt-32">
    <section class="site-container">
      <div class="grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <SectionLabel label="Journal" index="01" />
        </div>
        <div class="lg:col-span-8">
          <h1 class="text-6xl font-medium leading-none md:text-8xl">Journal</h1>
          <p class="mt-6 max-w-3xl text-xl leading-8 text-muted">
            记录城市环保行动中的田野观察、材料实验、运营复盘和社区共建方法。
          </p>
        </div>
      </div>
    </section>

    <section class="site-container mt-16">
      <NuxtLink :to="`/journal/${heroPost.slug}`" class="group grid gap-8 border-y border-ink/15 py-8 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <div class="media-frame aspect-[16/9]">
            <img :src="assetPath(heroPost.image)" :alt="heroPost.title" class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" />
          </div>
        </div>
        <div class="flex flex-col justify-between lg:col-span-4 lg:col-start-9">
          <div>
            <p class="text-sm text-muted">{{ heroPost.category }} / {{ heroPost.date }}</p>
            <h2 class="mt-5 text-4xl font-medium leading-tight md:text-5xl">{{ heroPost.title }}</h2>
            <p class="mt-5 leading-7 text-muted">{{ heroPost.excerpt }}</p>
          </div>
          <div class="mt-8 flex items-center gap-2 text-sm">
            <span>阅读全文</span>
            <ArrowUpRight :size="16" stroke-width="1.7" aria-hidden="true" />
          </div>
        </div>
      </NuxtLink>
    </section>

    <section class="site-container section-y">
      <div class="thin-scrollbar flex gap-2 overflow-x-auto border-b border-ink/15 pb-5">
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          class="focus-ring h-10 shrink-0 rounded-full border px-4 text-sm"
          :class="activeCategory === category ? 'border-ink bg-ink text-paper' : 'border-ink/15 text-muted hover:text-ink'"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>

      <div class="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="post in filteredPosts"
          :key="post.slug"
          :to="`/journal/${post.slug}`"
          data-reveal
          class="group border-t border-ink/15 pt-5"
        >
          <div class="media-frame aspect-[4/3]">
            <img :src="assetPath(post.image)" :alt="post.title" class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]" loading="lazy" />
          </div>
          <p class="mt-5 text-xs text-muted">{{ post.category }} / {{ post.date }}</p>
          <h2 class="mt-2 text-3xl font-medium">{{ post.title }}</h2>
          <p class="mt-4 text-sm leading-6 text-muted">{{ post.excerpt }}</p>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
