<script setup lang="ts">
import { ArrowLeft, ArrowUpRight, Check, Plus } from 'lucide-vue-next'
import { actions } from '~/data/site'

const route = useRoute()
const action = actions.find((item) => item.slug === route.params.slug)

if (!action) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Action not found'
  })
}

useSeoMeta({
  title: `${action.title} / Green Civic`,
  description: action.summary
})

const page = ref<HTMLElement | null>(null)
const activeSpec = ref(0)
const { addAction } = useActionDrawer()
const relatedActions = actions.filter((item) => item.collection === action.collection && item.slug !== action.slug).slice(0, 2)

useGsapReveals(page)

const add = () => {
  addAction({
    slug: action.slug,
    title: action.title,
    collection: action.collection
  })
}
</script>

<template>
  <div ref="page" class="pt-28 md:pt-32">
    <section class="site-container">
      <NuxtLink to="/actions" class="focus-ring inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft :size="16" stroke-width="1.7" aria-hidden="true" />
        <span>行动目录</span>
      </NuxtLink>

      <div class="mt-10 grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <p class="text-sm text-muted">{{ action.collection }} / {{ action.type }}</p>
          <h1 class="mt-5 text-6xl font-medium leading-none md:text-8xl">{{ action.title }}</h1>
          <p class="mt-8 max-w-3xl text-xl leading-8 text-muted">{{ action.subtitle }}</p>
          <button class="focus-ring mt-10 flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-sm text-paper" type="button" @click="add">
            <Plus :size="16" stroke-width="1.7" aria-hidden="true" />
            <span>加入行动</span>
          </button>
        </div>
        <div class="lg:col-span-5" data-reveal>
          <div class="media-frame aspect-[4/5]">
            <img :src="action.image" :alt="action.title" class="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>

    <section class="site-container section-y">
      <div class="grid gap-12 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <SectionLabel label="Impact" index="01" />
        </div>
        <div class="lg:col-span-8">
          <p data-reveal class="max-w-4xl text-3xl leading-tight md:text-5xl">{{ action.impact }}</p>
          <div class="mt-12 grid gap-4 md:grid-cols-3">
            <div v-for="metric in action.metrics" :key="metric.label" data-reveal class="border-t border-ink/15 pt-5">
              <p class="text-4xl font-medium">{{ metric.value }}</p>
              <p class="mt-2 text-sm text-muted">{{ metric.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="border-y border-ink/15 bg-[#ede7da]">
      <div class="site-container grid gap-10 py-20 lg:grid-cols-12">
        <div class="lg:col-span-5">
          <SectionLabel label="System details" index="02" />
          <h2 class="mt-8 text-5xl font-medium leading-none md:text-7xl">像产品详情页一样理解公益行动。</h2>
        </div>
        <div class="lg:col-span-6 lg:col-start-7">
          <div class="border-t border-ink/15">
            <button
              v-for="(spec, index) in action.specs"
              :key="spec.label"
              class="focus-ring grid w-full grid-cols-[1fr_auto] gap-6 border-b border-ink/15 py-6 text-left"
              type="button"
              :aria-expanded="activeSpec === index"
              @click="activeSpec = activeSpec === index ? -1 : index"
            >
              <span>
                <span class="block text-sm text-muted">{{ spec.label }}</span>
                <span class="mt-2 block text-2xl font-medium">{{ spec.value }}</span>
              </span>
              <ArrowUpRight :size="18" stroke-width="1.7" aria-hidden="true" />
              <span v-if="activeSpec === index" class="col-span-2 text-sm leading-6 text-muted">
                该项会被纳入行动部署表，与预算、志愿排班和后续维护记录一起归档。
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="site-container section-y">
      <div class="grid gap-12 lg:grid-cols-12">
        <div class="lg:col-span-5">
          <SectionLabel label="Modules & process" index="03" />
          <p class="mt-8 text-xl leading-8 text-muted">{{ action.detail }}</p>
        </div>
        <div class="grid gap-8 lg:col-span-6 lg:col-start-7">
          <div>
            <h2 class="text-3xl font-medium">行动模块</h2>
            <div class="mt-6 grid gap-3">
              <div v-for="module in action.modules" :key="module" data-reveal class="flex items-center gap-3 border-t border-ink/15 py-4">
                <Check :size="17" stroke-width="1.7" aria-hidden="true" />
                <span>{{ module }}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 class="text-3xl font-medium">部署过程</h2>
            <ol class="mt-6 grid gap-3">
              <li v-for="(step, index) in action.process" :key="step" data-reveal class="grid grid-cols-[48px_1fr] border-t border-ink/15 py-4">
                <span class="font-mono text-sm text-muted">{{ String(index + 1).padStart(2, '0') }}</span>
                <span>{{ step }}</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <section v-if="relatedActions.length" class="site-container pb-28">
      <div class="border-t border-ink/15 pt-8">
        <h2 class="text-4xl font-medium">相关行动</h2>
      </div>
      <div class="mt-10 grid gap-8 md:grid-cols-2">
        <ActionCard v-for="related in relatedActions" :key="related.slug" :action="related" compact />
      </div>
    </section>
  </div>
</template>
