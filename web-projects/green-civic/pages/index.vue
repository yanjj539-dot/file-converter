<script setup lang="ts">
import { ArrowDown, ArrowUpRight, Plus } from 'lucide-vue-next'
import { actions, journalPosts, sustainabilityPrinciples } from '~/data/site'

useSeoMeta({
  title: 'Green Civic / 城市绿色公益行动平台',
  description: '以产品目录、城市叙事和公益行动系统组织低碳生活、绿色出行、循环材料和公共空间环保改造。'
})

const page = ref<HTMLElement | null>(null)
const story = ref<HTMLElement | null>(null)
const featuredActions = actions.slice(0, 3)
const latestPosts = journalPosts.slice(0, 3)
const { addAction, openDrawer } = useActionDrawer()

useGsapReveals(page)

let storyCtx: { revert: () => void } | undefined
let media: { revert: () => void } | undefined

onMounted(async () => {
  if (!story.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  const { default: gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  storyCtx = gsap.context(() => {
    media = gsap.matchMedia()
    media.add('(min-width: 900px)', () => {
      const chapters = gsap.utils.toArray<HTMLElement>('[data-story-chapter]')
      const meter = story.value?.querySelector<HTMLElement>('[data-story-meter]')
      gsap.to(meter, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: story.value,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true
        }
      })

      chapters.forEach((chapter) => {
        gsap.fromTo(
          chapter,
          { autoAlpha: 0.35 },
          {
            autoAlpha: 1,
            duration: 0.25,
            scrollTrigger: {
              trigger: chapter,
              start: 'top 58%',
              end: 'bottom 45%',
              scrub: true
            }
          }
        )
      })
    })
  }, story.value)
})

onBeforeUnmount(() => {
  media?.revert()
  storyCtx?.revert()
})

const addFeatured = () => {
  addAction({
    slug: featuredActions[0].slug,
    title: featuredActions[0].title,
    collection: featuredActions[0].collection
  })
}
</script>

<template>
  <div ref="page">
    <section class="min-h-screen pt-28 md:pt-32">
      <div class="site-container grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <SectionLabel label="Urban environmental action platform" index="01" />
          <h1 class="mt-8 max-w-5xl text-6xl font-medium leading-none text-ink md:text-8xl lg:text-[8rem]">
            Green Civic
          </h1>
          <p class="mt-6 max-w-2xl text-xl leading-8 text-muted md:text-2xl md:leading-9">
            城市绿色公益行动平台，将绿色出行、垃圾分类、循环材料与公共空间环保改造组织成可参与、可维护、可复制的城市系统。
          </p>
          <div class="mt-10 flex flex-wrap items-center gap-3">
            <NuxtLink to="/actions" class="focus-ring flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-sm text-paper">
              <span>浏览行动目录</span>
              <ArrowUpRight :size="16" stroke-width="1.7" aria-hidden="true" />
            </NuxtLink>
            <button class="focus-ring flex h-12 items-center gap-2 rounded-full border border-ink/15 px-5 text-sm" type="button" @click="openDrawer">
              <Plus :size="16" stroke-width="1.7" aria-hidden="true" />
              <span>加入共建</span>
            </button>
          </div>
        </div>

        <div class="lg:col-span-5 lg:pt-14" data-reveal>
          <div class="media-frame aspect-[4/5]">
            <img src="/images/hero-civic-installation.png" alt="抽象城市环保公共装置" class="h-full w-full object-cover" />
          </div>
          <div class="mt-4 grid grid-cols-3 gap-3 text-xs text-muted">
            <div class="border-t border-ink/15 pt-3">
              <span class="block text-2xl text-ink">12</span>
              城市试点
            </div>
            <div class="border-t border-ink/15 pt-3">
              <span class="block text-2xl text-ink">48k</span>
              居民触达
            </div>
            <div class="border-t border-ink/15 pt-3">
              <span class="block text-2xl text-ink">310t</span>
              年减排估算
            </div>
          </div>
        </div>
      </div>

      <div class="site-container mt-16 flex items-center justify-between border-t border-ink/15 py-5 text-xs text-muted">
        <span>公益行动 / 城市环保 / 低碳生活</span>
        <ArrowDown :size="16" stroke-width="1.7" aria-hidden="true" />
      </div>
    </section>

    <section class="section-y border-t border-ink/15">
      <div class="site-container">
        <div class="grid gap-10 md:grid-cols-12">
          <div class="md:col-span-4">
            <SectionLabel label="Action catalogue" index="02" />
          </div>
          <div class="md:col-span-8">
            <h2 data-reveal class="max-w-5xl text-5xl font-medium leading-none md:text-7xl">
              不用口号包装环保，把每个行动做成可部署的公共产品。
            </h2>
          </div>
        </div>

        <div class="mt-16 grid gap-8 md:grid-cols-3">
          <ActionCard v-for="action in featuredActions" :key="action.slug" :action="action" data-reveal />
        </div>
      </div>
    </section>

    <section ref="story" class="border-t border-ink/15">
      <div class="site-container grid gap-12 py-20 lg:grid-cols-12 lg:py-0">
        <div class="lg:sticky lg:top-0 lg:col-span-5 lg:flex lg:h-screen lg:flex-col lg:justify-center">
          <SectionLabel label="Long-form civic story" index="03" />
          <h2 class="mt-8 text-5xl font-medium leading-none md:text-7xl">从街区问题到公共基础设施。</h2>
          <p class="mt-6 max-w-lg text-base leading-7 text-muted">
            Green Civic 的叙事不是活动海报，而是一条从观察、设计、部署到共管的城市行动链。
          </p>
          <div class="mt-10 h-40 w-px origin-top bg-ink/10">
            <div data-story-meter class="h-full w-px origin-top scale-y-0 bg-ink" />
          </div>
        </div>

        <div class="grid gap-16 lg:col-span-6 lg:col-start-7 lg:py-[26vh]">
          <article data-story-chapter class="border-t border-ink/15 pt-8">
            <span class="text-sm text-muted">01 / Observe</span>
            <h3 class="mt-6 text-4xl font-medium">先记录热、噪声、混投和短途机动车，而不是先画愿景图。</h3>
            <p class="mt-6 leading-7 text-muted">每个项目从真实街区数据和居民路线开始，让环保议题获得具体位置。</p>
          </article>
          <article data-story-chapter class="border-t border-ink/15 pt-8">
            <span class="text-sm text-muted">02 / Prototype</span>
            <h3 class="mt-6 text-4xl font-medium">用小尺度装置证明方法，再决定是否扩展成片区系统。</h3>
            <p class="mt-6 leading-7 text-muted">遮阴构架、材料回收站、骑行修理台都保持可拆卸和可维护，便于复用。</p>
          </article>
          <article data-story-chapter class="border-t border-ink/15 pt-8">
            <span class="text-sm text-muted">03 / Govern</span>
            <h3 class="mt-6 text-4xl font-medium">让公益行动有公开账本、志愿排班和长期共管角色。</h3>
            <p class="mt-6 leading-7 text-muted">项目建成只是开始。真正的可持续来自社区、学校、商户和专业组织的共管机制。</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section-y border-t border-ink/15">
      <div class="site-container grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-5">
          <SectionLabel label="Sustainability system" index="04" />
          <h2 data-reveal class="mt-8 text-5xl font-medium leading-none md:text-7xl">可持续不是章节，是每个行动的结构。</h2>
        </div>
        <div class="grid gap-4 lg:col-span-6 lg:col-start-7">
          <div
            v-for="principle in sustainabilityPrinciples"
            :key="principle.title"
            data-reveal
            class="grid gap-4 border-t border-ink/15 py-6 md:grid-cols-5"
          >
            <h3 class="text-2xl font-medium md:col-span-2">{{ principle.title }}</h3>
            <p class="leading-7 text-muted md:col-span-3">{{ principle.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section-y border-t border-ink/15">
      <div class="site-container">
        <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel label="Journal" index="05" />
            <h2 data-reveal class="mt-8 text-5xl font-medium leading-none md:text-7xl">案例与田野记录</h2>
          </div>
          <NuxtLink to="/journal" class="focus-ring flex h-12 w-fit items-center gap-2 rounded-full border border-ink/15 px-5 text-sm">
            <span>查看全部</span>
            <ArrowUpRight :size="16" stroke-width="1.7" aria-hidden="true" />
          </NuxtLink>
        </div>

        <div class="mt-16 grid gap-8 md:grid-cols-3">
          <NuxtLink
            v-for="post in latestPosts"
            :key="post.slug"
            :to="`/journal/${post.slug}`"
            data-reveal
            class="group border-t border-ink/15 pt-5"
          >
            <div class="media-frame aspect-[4/3]">
              <img :src="post.image" :alt="post.title" class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]" loading="lazy" />
            </div>
            <p class="mt-5 text-xs text-muted">{{ post.category }} / {{ post.date }}</p>
            <h3 class="mt-2 text-2xl font-medium">{{ post.title }}</h3>
            <p class="mt-4 text-sm leading-6 text-muted">{{ post.excerpt }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="border-t border-ink/15 py-12">
      <div class="site-container grid gap-8 md:grid-cols-12 md:items-center">
        <h2 class="text-4xl font-medium leading-none md:col-span-7 md:text-6xl">把你的街区放进行动清单。</h2>
        <div class="md:col-span-4 md:col-start-9">
          <p class="text-sm leading-6 text-muted">选择一个可落地的环保行动，或提交社区低碳共建意向。</p>
          <button class="focus-ring mt-6 flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-sm text-paper" type="button" @click="addFeatured">
            <Plus :size="16" stroke-width="1.7" aria-hidden="true" />
            <span>加入首个行动</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
