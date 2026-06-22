<script setup lang="ts">
import { ArrowLeft, X } from 'lucide-vue-next'
import { journalPosts } from '~/data/site'

const route = useRoute()
const post = journalPosts.find((item) => item.slug === route.params.slug)

if (!post) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Journal post not found'
  })
}

useSeoMeta({
  title: `${post.title} / Green Civic Journal`,
  description: post.excerpt
})

const page = ref<HTMLElement | null>(null)
const activeImage = ref<string | null>(null)
const gallery = [post.image, '/images/action-system-render.png', '/images/community-action-editorial.png'].filter(
  (image, index, all) => all.indexOf(image) === index
)

useGsapReveals(page)
</script>

<template>
  <div ref="page" class="pt-28 md:pt-32">
    <article class="site-container">
      <NuxtLink to="/journal" class="focus-ring inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft :size="16" stroke-width="1.7" aria-hidden="true" />
        <span>Journal</span>
      </NuxtLink>

      <header class="mt-10 grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-8">
          <p class="text-sm text-muted">{{ post.category }} / {{ post.date }}</p>
          <h1 class="mt-5 text-6xl font-medium leading-none md:text-8xl">{{ post.title }}</h1>
          <p class="mt-8 max-w-3xl text-xl leading-8 text-muted">{{ post.excerpt }}</p>
        </div>
      </header>

      <div class="mt-14 media-frame aspect-[16/9]" data-reveal>
        <img :src="post.image" :alt="post.title" class="h-full w-full object-cover" />
      </div>

      <div class="grid gap-12 py-20 lg:grid-cols-12">
        <div class="lg:col-span-3">
          <SectionLabel label="Article" index="01" />
        </div>
        <div class="lg:col-span-7 lg:col-start-5">
          <p v-for="paragraph in post.body" :key="paragraph" data-reveal class="mb-8 text-xl leading-9 text-ink/85">
            {{ paragraph }}
          </p>
        </div>
      </div>

      <section class="border-t border-ink/15 py-12">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel label="Gallery" index="02" />
            <h2 class="mt-6 text-4xl font-medium">现场图像</h2>
          </div>
        </div>
        <div class="mt-10 grid gap-4 md:grid-cols-3">
          <button
            v-for="image in gallery"
            :key="image"
            class="focus-ring media-frame aspect-[4/3] text-left"
            type="button"
            @click="activeImage = image"
          >
            <img :src="image" :alt="post.title" class="h-full w-full object-cover" loading="lazy" />
          </button>
        </div>
      </section>
    </article>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="activeImage" class="fixed inset-0 z-50 grid place-items-center bg-night/85 p-5" @click="activeImage = null">
          <button class="focus-ring absolute right-5 top-5 grid size-11 place-items-center rounded-full border border-paper/30 text-paper" type="button" aria-label="关闭图像">
            <X :size="18" stroke-width="1.7" aria-hidden="true" />
          </button>
          <img :src="activeImage" :alt="post.title" class="max-h-[86vh] max-w-[92vw] rounded object-contain" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
