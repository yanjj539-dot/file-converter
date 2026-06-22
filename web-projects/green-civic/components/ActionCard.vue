<script setup lang="ts">
import { ArrowUpRight, Plus } from 'lucide-vue-next'
import type { CivicAction } from '~/data/site'

const props = defineProps<{
  action: CivicAction
  compact?: boolean
}>()

const { addAction } = useActionDrawer()
const assetPath = useAssetPath()

const add = () => {
  addAction({
    slug: props.action.slug,
    title: props.action.title,
    collection: props.action.collection
  })
}
</script>

<template>
  <article class="group grid min-h-[460px] border-t border-ink/15 pt-5 md:min-h-[520px]">
    <NuxtLink :to="`/actions/${action.slug}`" class="block">
      <div class="media-frame aspect-[4/3]">
        <img
          :src="assetPath(action.image)"
          :alt="action.title"
          class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
          loading="lazy"
        />
      </div>
    </NuxtLink>

    <div class="mt-5 flex h-full flex-col">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs text-muted">{{ action.collection }}</p>
          <h3 class="mt-2 text-2xl font-medium md:text-3xl">{{ action.title }}</h3>
        </div>
        <NuxtLink
          :to="`/actions/${action.slug}`"
          class="focus-ring grid size-10 shrink-0 place-items-center rounded-full border border-ink/15 transition group-hover:bg-ink group-hover:text-paper"
          aria-label="查看详情"
        >
          <ArrowUpRight :size="17" stroke-width="1.7" aria-hidden="true" />
        </NuxtLink>
      </div>

      <p class="mt-4 text-sm leading-6 text-muted md:text-base">{{ compact ? action.summary : action.subtitle }}</p>

      <div class="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
        <span class="rounded-full border border-ink/15 px-3 py-2 text-xs text-muted">{{ action.type }}</span>
        <button class="focus-ring flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm text-paper" type="button" @click="add">
          <Plus :size="15" stroke-width="1.7" aria-hidden="true" />
          <span>加入</span>
        </button>
      </div>
    </div>
  </article>
</template>
