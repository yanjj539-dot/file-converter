<script setup lang="ts">
import { ArrowDown, ArrowUpRight, Plus } from 'lucide-vue-next'
import {
  actions,
  civicToolkits,
  collections,
  ecoMaterials,
  journalPosts,
  materialPassportFields,
  sustainabilityPrinciples
} from '~/data/site'

useSeoMeta({
  title: 'Green Civic / 城市绿色公益行动平台',
  description: '以产品目录、城市叙事和公益行动系统组织低碳生活、绿色出行、循环材料和公共空间环保改造。'
})

const page = ref<HTMLElement | null>(null)
const hero = ref<HTMLElement | null>(null)
const catalogue = ref<HTMLElement | null>(null)
const story = ref<HTMLElement | null>(null)
const featuredActions = actions.slice(0, 3)
const latestPosts = journalPosts.slice(0, 3)
const { addAction, openDrawer } = useActionDrawer()
const assetPath = useAssetPath()
const activeMaterialCategory = ref('全部材料')

const materialCategories = computed(() => [
  '全部材料',
  ...Array.from(new Set(ecoMaterials.map((material) => material.category)))
])

const filteredMaterials = computed(() =>
  activeMaterialCategory.value === '全部材料'
    ? ecoMaterials
    : ecoMaterials.filter((material) => material.category === activeMaterialCategory.value)
)

useHead({
  link: [
    { rel: 'preload', as: 'image', href: assetPath('/images/optimized/hero-civic-installation-320.webp'), type: 'image/webp', fetchpriority: 'high' },
    { rel: 'preload', as: 'image', href: assetPath('/images/optimized/action-system-render-320.webp'), type: 'image/webp', fetchpriority: 'high' },
    { rel: 'preload', as: 'image', href: assetPath('/images/optimized/community-action-editorial-320.webp'), type: 'image/webp', fetchpriority: 'high' },
    { rel: 'preload', as: 'image', href: assetPath('/images/optimized/engineering-linework-320.webp'), type: 'image/webp', fetchpriority: 'high' }
  ]
})

const heroFragments = [
  { title: '降温廊道', eyebrow: 'cooling corridor', image: '/images/hero-civic-installation.png', x: 22, y: 23, w: 112, tone: 'moss', depth: 0.18, rotate: -4, fade: 0.95 },
  { title: '循环站', eyebrow: 'material return', image: '/images/action-system-render.png', x: 58, y: 15, w: 82, tone: 'clay', depth: 0.28, rotate: 3, fade: 0.8 },
  { title: '骑行环线', eyebrow: 'bike loop', image: '/images/community-action-editorial.png', x: 73, y: 31, w: 126, tone: 'civic', depth: 0.2, rotate: 5, fade: 0.92 },
  { title: '分类实验台', eyebrow: 'sorting lab', image: '/images/engineering-linework.png', x: 43, y: 30, w: 74, tone: 'paper', depth: 0.34, rotate: -2, fade: 0.78 },
  { title: '旧物交换架', eyebrow: 'reuse shelf', image: '/images/action-system-render.png', x: 30, y: 56, w: 78, tone: 'clay', depth: 0.26, rotate: 4, fade: 0.8 },
  { title: '校园修理岛', eyebrow: 'repair island', image: '/images/community-action-editorial.png', x: 68, y: 63, w: 92, tone: 'civic', depth: 0.3, rotate: -5, fade: 0.84 },
  { title: '材料样本墙', eyebrow: 'material atlas', image: '/images/engineering-linework.png', x: 48, y: 77, w: 88, tone: 'paper', depth: 0.16, rotate: 2, fade: 0.78 },
  { title: '雨水补灌', eyebrow: 'water reuse', image: '/images/hero-civic-installation.png', x: 60, y: 86, w: 132, tone: 'moss', depth: 0.22, rotate: 0, fade: 0.86 },
  { title: '低碳账本', eyebrow: 'carbon ledger', image: '/images/engineering-linework.png', x: 81, y: 78, w: 170, tone: 'paper', depth: 0.1, rotate: -2, fade: 0.88 },
  { title: '街区补给', eyebrow: 'civic supply', image: '/images/action-system-render.png', x: 16, y: 74, w: 92, tone: 'clay', depth: 0.24, rotate: -4, fade: 0.9 },
  { title: '温度观测', eyebrow: 'field sensor', image: '/images/hero-civic-installation.png', x: 78, y: 8, w: 58, tone: 'moss', depth: 0.38, rotate: 6, fade: 0.84 },
  { title: '公益排班', eyebrow: 'stewardship', image: '/images/community-action-editorial.png', x: 38, y: 10, w: 66, tone: 'civic', depth: 0.32, rotate: -6, fade: 0.82 }
]

const systemSteps = [
  {
    index: '01',
    title: '观察城市摩擦',
    text: '热岛、混投、短途开车、闲置材料和公共空间维护空缺，先被记录成可讨论的城市问题。'
  },
  {
    index: '02',
    title: '设计行动模块',
    text: '每个行动都被拆成构件、运营、志愿角色、数据指标和公开账本，像公共产品一样被部署。'
  },
  {
    index: '03',
    title: '建立共管网络',
    text: '社区、学校、商户和公益组织共同维护，让低碳行动从一次活动变成长期基础设施。'
  },
  {
    index: '04',
    title: '复盘并复制',
    text: '保留材料、预算、减排估算和居民反馈，为下一条街区、下一所校园提供可迁移样板。'
  }
]

useGsapReveals(page)

let motionCtx: { revert: () => void } | undefined
let storyCtx: { revert: () => void } | undefined
let media: { revert: () => void } | undefined
let pointerCleanup: (() => void) | undefined

onMounted(async () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  const { default: gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  motionCtx = gsap.context(() => {
    const tiles = gsap.utils.toArray<HTMLElement>('[data-float-tile]')
    const titleLines = gsap.utils.toArray<HTMLElement>('[data-hero-line]')

    gsap.set(tiles, { transformOrigin: '50% 50%', willChange: 'transform, opacity' })
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from(titleLines, { yPercent: 112, duration: 1.15, stagger: 0.1 })
      .from('[data-hero-kicker], [data-hero-actions]', { autoAlpha: 0, y: 18, duration: 0.7, stagger: 0.08 }, '-=0.65')
      .from(tiles, {
        autoAlpha: 0,
        y: 72,
        scale: 0.76,
        rotate: () => gsap.utils.random(-9, 9),
        duration: 1.05,
        stagger: { amount: 0.7, from: 'random' }
      }, '-=0.95')

    media = gsap.matchMedia()
    media.add('(min-width: 900px)', () => {
      if (hero.value) {
        const quickX = tiles.map((tile) => gsap.quickTo(tile, 'x', { duration: 0.55, ease: 'power3.out' }))
        const quickY = tiles.map((tile) => gsap.quickTo(tile, 'y', { duration: 0.55, ease: 'power3.out' }))
        const handlePointer = (event: PointerEvent) => {
          const rect = hero.value?.getBoundingClientRect()
          if (!rect) return
          const relX = (event.clientX - rect.left) / rect.width - 0.5
          const relY = (event.clientY - rect.top) / rect.height - 0.5
          tiles.forEach((tile, index) => {
            const depth = Number(tile.dataset.depth || 0.2)
            quickX[index](relX * depth * 92)
            quickY[index](relY * depth * 70)
          })
        }
        const handlePointerLeave = () => {
          tiles.forEach((_, index) => {
            quickX[index](0)
            quickY[index](0)
          })
        }
        hero.value.addEventListener('pointermove', handlePointer)
        hero.value.addEventListener('pointerleave', handlePointerLeave)
        pointerCleanup = () => {
          hero.value?.removeEventListener('pointermove', handlePointer)
          hero.value?.removeEventListener('pointerleave', handlePointerLeave)
        }

        gsap.timeline({
          scrollTrigger: {
            trigger: hero.value,
            start: 'top top',
            end: 'bottom top',
            scrub: 1
          }
        })
          .to('[data-hero-title]', { y: -88, scale: 0.94, autoAlpha: 0.42, ease: 'none' }, 0)
          .to(tiles, {
            y: (index) => (index % 2 === 0 ? -150 : -80),
            x: (index) => (index % 3 - 1) * 42,
            autoAlpha: 0.18,
            ease: 'none'
          }, 0)
      }

      if (catalogue.value) {
        const track = catalogue.value.querySelector<HTMLElement>('[data-catalogue-track]')
        if (track) {
          gsap.to(track, {
            x: () => {
              const travel = Math.max(0, track.scrollWidth - window.innerWidth + 96)
              return -travel
            },
            ease: 'none',
            scrollTrigger: {
              trigger: catalogue.value,
              start: 'top top',
              end: () => `+=${Math.max(track.scrollWidth, window.innerWidth * 1.4)}`,
              scrub: 0.9,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true
            }
          })
        }
      }
    })

    gsap.to('[data-marquee-track]', {
      xPercent: -50,
      duration: 24,
      repeat: -1,
      ease: 'none'
    })

  }, page.value ?? document.body)

  if (!story.value) {
    return
  }

  storyCtx = gsap.context(() => {
    media = media ?? gsap.matchMedia()
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
          { autoAlpha: 0.25, y: 42 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.25,
            scrollTrigger: {
              trigger: chapter,
              start: 'top 66%',
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
  pointerCleanup?.()
  media?.revert()
  storyCtx?.revert()
  motionCtx?.revert()
})

const addFeatured = () => {
  addAction({
    slug: featuredActions[0].slug,
    title: featuredActions[0].title,
    collection: featuredActions[0].collection
  })
}

const addCatalogueAction = (action: typeof actions[number]) => {
  addAction({
    slug: action.slug,
    title: action.title,
    collection: action.collection
  })
}
</script>

<template>
  <div ref="page">
    <section ref="hero" class="hero-catalogue min-h-screen overflow-hidden pt-24 md:pt-28">
      <div class="site-container relative min-h-[calc(100vh-6rem)]">
        <div class="hero-gridline" aria-hidden="true" />

        <div
          v-for="fragment in heroFragments"
          :key="fragment.title"
          class="float-tile"
          :class="`float-tile-${fragment.tone}`"
          :style="{
            left: `${fragment.x}%`,
            top: `${fragment.y}%`,
            width: `${fragment.w}px`,
            opacity: fragment.fade,
            transform: `translate(-50%, -50%) rotate(${fragment.rotate}deg)`
          }"
          :data-depth="fragment.depth"
          data-float-tile
        >
          <OptimizedImage
            :src="fragment.image"
            :alt="fragment.title"
            class="float-tile-image"
            image-class="object-cover"
            :sizes="`${Math.max(180, fragment.w * 2)}px`"
            priority
          />
          <span class="float-tile-caption">{{ fragment.eyebrow }}</span>
        </div>

        <div data-hero-title class="pointer-events-none absolute inset-x-0 top-[43%] z-10 -translate-y-1/2 text-center md:top-[48%]">
          <p data-hero-kicker class="mb-6 text-xs uppercase text-muted md:text-sm">Green Civic / Urban low-carbon public system</p>
          <h1 class="mx-auto max-w-[1220px] overflow-hidden text-[clamp(3rem,12vw,4.35rem)] font-medium leading-[0.92] text-ink md:text-[clamp(3.8rem,9.5vw,10.8rem)]">
            <span class="block overflow-hidden">
              <span data-hero-line class="block">Cities for people,</span>
            </span>
            <span class="block overflow-hidden">
              <span data-hero-line class="block">built for less carbon.</span>
            </span>
          </h1>
        </div>

        <div class="absolute bottom-8 left-0 right-0 z-20">
          <div class="flex flex-col gap-5 border-t border-ink/15 pt-5 md:flex-row md:items-end md:justify-between">
            <p data-hero-kicker class="max-w-xl text-base leading-7 text-muted md:pl-24 md:text-lg xl:pl-0">
              城市绿色公益行动平台，把降温廊道、垃圾分类、绿色出行、循环材料与社区共管整理成可参与、可复制、可公开追踪的城市行动目录。
            </p>
            <div data-hero-actions class="flex flex-wrap items-center gap-3">
              <NuxtLink to="/actions" class="focus-ring magnetic-button flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-sm text-paper">
                <span>浏览行动目录</span>
                <ArrowUpRight :size="16" stroke-width="1.7" aria-hidden="true" />
              </NuxtLink>
              <button class="focus-ring magnetic-button flex h-12 items-center gap-2 rounded-full border border-ink/15 bg-paper/80 px-5 text-sm backdrop-blur" type="button" @click="openDrawer">
                <Plus :size="16" stroke-width="1.7" aria-hidden="true" />
                <span>加入共建</span>
              </button>
              <ArrowDown class="hidden text-muted md:block" :size="17" stroke-width="1.7" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="border-y border-ink/15 py-4">
      <div class="marquee-row" aria-hidden="true">
        <div data-marquee-track class="marquee-track">
          <span v-for="item in [...collections, ...collections]" :key="`${item}-a`">{{ item }}</span>
        </div>
      </div>
    </section>

    <section ref="catalogue" class="catalogue-runway border-b border-ink/15">
      <div class="site-container py-20 lg:min-h-screen lg:py-24">
        <div class="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div class="lg:col-span-4">
            <SectionLabel label="Action catalogue" index="02" />
          </div>
          <div class="lg:col-span-8">
            <h2 data-reveal class="max-w-5xl text-5xl font-medium leading-none md:text-7xl">
              公益行动不是海报，而是一组可部署的城市产品。
            </h2>
          </div>
        </div>

        <div class="thin-scrollbar mt-14 overflow-x-auto lg:overflow-visible">
          <div data-catalogue-track class="catalogue-track">
            <article
              v-for="(action, index) in actions"
              :key="action.slug"
              class="catalogue-card group"
              data-reveal
            >
              <NuxtLink :to="`/actions/${action.slug}`" class="block">
                <div class="media-frame aspect-[4/5]">
                  <OptimizedImage
                    :src="action.image"
                    :alt="action.title"
                    image-class="h-full w-full object-cover"
                    sizes="(max-width: 899px) 78vw, 390px"
                  />
                </div>
              </NuxtLink>
              <div class="mt-5 flex items-start justify-between gap-4 border-t border-ink/15 pt-4">
                <div>
                  <p class="text-xs text-muted">{{ String(index + 1).padStart(2, '0') }} / {{ action.collection }}</p>
                  <h3 class="mt-3 text-3xl font-medium leading-none">{{ action.title }}</h3>
                </div>
                <button class="focus-ring catalogue-plus" type="button" aria-label="加入行动" @click="addCatalogueAction(action)">
                  <Plus :size="16" stroke-width="1.7" aria-hidden="true" />
                </button>
              </div>
              <p class="mt-5 min-h-20 text-sm leading-6 text-muted">{{ action.summary }}</p>
              <div class="mt-6 grid grid-cols-3 gap-2 border-t border-ink/15 pt-4">
                <div v-for="metric in action.metrics" :key="metric.label">
                  <p class="text-lg text-ink">{{ metric.value }}</p>
                  <p class="mt-1 text-[11px] leading-4 text-muted">{{ metric.label }}</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="section-y border-b border-ink/15">
      <div class="site-container">
        <div class="grid gap-10 md:grid-cols-12">
          <div class="md:col-span-4">
            <SectionLabel label="Civic operating system" index="03" />
          </div>
          <div class="md:col-span-8">
            <h2 data-reveal class="max-w-5xl text-5xl font-medium leading-none md:text-7xl">
              从街区问题，到可维护的公共环保系统。
            </h2>
          </div>
        </div>

        <div class="mt-16 grid gap-4 lg:grid-cols-4">
          <article v-for="step in systemSteps" :key="step.index" data-reveal class="system-step">
            <span>{{ step.index }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section ref="story" class="border-b border-ink/15">
      <div class="site-container grid gap-12 py-20 lg:grid-cols-12 lg:py-0">
        <div class="lg:sticky lg:top-0 lg:col-span-5 lg:flex lg:h-screen lg:flex-col lg:justify-center">
          <SectionLabel label="Long-form civic story" index="04" />
          <h2 class="mt-8 text-5xl font-medium leading-none md:text-7xl">行动从一段路开始，但要长成一套机制。</h2>
          <p class="mt-6 max-w-lg text-base leading-7 text-muted">
            Green Civic 的滚动叙事不是活动回顾，而是一条从观察、设计、部署到共管的城市行动链。
          </p>
          <div class="mt-10 h-48 w-px origin-top bg-ink/10">
            <div data-story-meter class="h-full w-px origin-top scale-y-0 bg-ink" />
          </div>
        </div>

        <div class="grid gap-16 lg:col-span-6 lg:col-start-7 lg:py-[24vh]">
          <article data-story-chapter class="story-chapter">
            <span>01 / Observe</span>
            <h3>先记录热、噪声、混投和短途机动车，而不是先画愿景图。</h3>
            <p>每个项目从真实街区数据和居民路线开始，让环保议题获得具体位置。</p>
          </article>
          <article data-story-chapter class="story-chapter">
            <span>02 / Prototype</span>
            <h3>用小尺度装置证明方法，再决定是否扩展成片区系统。</h3>
            <p>遮阴构架、材料回收站、骑行修理台都保持可拆卸和可维护，便于复用。</p>
          </article>
          <article data-story-chapter class="story-chapter">
            <span>03 / Govern</span>
            <h3>让公益行动有公开账本、志愿排班和长期共管角色。</h3>
            <p>项目建成只是开始。真正的可持续来自社区、学校、商户和专业组织的共管机制。</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section-y border-b border-ink/15">
      <div class="site-container">
        <div class="grid gap-10 lg:grid-cols-12">
          <div class="lg:col-span-5">
            <SectionLabel label="Material library" index="05" />
            <h2 data-reveal class="mt-8 text-5xl font-medium leading-none md:text-7xl">环保材料要像产品一样被比较、被维护、被追踪。</h2>
          </div>
          <div class="lg:col-span-6 lg:col-start-7">
            <p data-reveal class="text-xl leading-8 text-muted">
              Green Civic 把城市环保材料整理成可阅读的材料护照：来源、再生含量、适用场景、维护周期和下一站去向都必须公开。
            </p>
            <div data-reveal class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <span v-for="field in materialPassportFields" :key="field" class="passport-field">{{ field }}</span>
            </div>
          </div>
        </div>

        <div class="mt-14 grid gap-8 lg:grid-cols-12">
          <div class="lg:col-span-4">
            <div class="media-frame aspect-[4/5]" data-reveal>
              <OptimizedImage
                src="/images/engineering-linework.png"
                alt="环保材料护照工程线稿"
                image-class="h-full w-full object-cover"
                sizes="(max-width: 1023px) 100vw, 32vw"
              />
            </div>
          </div>

          <div class="lg:col-span-8">
            <div class="thin-scrollbar flex gap-2 overflow-x-auto border-b border-ink/15 pb-5" data-reveal>
              <button
                v-for="category in materialCategories"
                :key="category"
                type="button"
                class="focus-ring h-10 shrink-0 rounded-full border px-4 text-sm transition"
                :class="activeMaterialCategory === category ? 'border-ink bg-ink text-paper' : 'border-ink/15 text-muted hover:border-ink/30 hover:text-ink'"
                @click="activeMaterialCategory = category"
              >
                {{ category }}
              </button>
            </div>

            <div class="material-library-grid mt-6">
              <article
                v-for="material in filteredMaterials"
                :key="material.code"
                class="material-passport"
                :style="{ '--material-accent': material.color }"
                data-reveal
              >
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="font-mono text-xs text-muted">{{ material.code }} / {{ material.category }}</p>
                    <h3 class="mt-3 text-3xl font-medium leading-none">{{ material.name }}</h3>
                  </div>
                  <span class="material-swatch" aria-hidden="true" />
                </div>
                <p class="mt-5 text-sm leading-6 text-muted">{{ material.summary }}</p>

                <div class="mt-6 grid gap-3 border-t border-ink/15 pt-5 md:grid-cols-3">
                  <div>
                    <p class="text-[11px] uppercase text-muted">来源</p>
                    <p class="mt-2 text-sm leading-5">{{ material.source }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] uppercase text-muted">碳与周期</p>
                    <p class="mt-2 text-sm leading-5">{{ material.carbon }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] uppercase text-muted">维护</p>
                    <p class="mt-2 text-sm leading-5">{{ material.maintenance }}</p>
                  </div>
                </div>

                <div class="mt-5 flex flex-wrap gap-2">
                  <span v-for="application in material.applications" :key="application" class="material-chip">{{ application }}</span>
                </div>

                <div class="mt-6 grid gap-3 sm:grid-cols-2">
                  <div v-for="metric in material.metrics" :key="metric.label" class="passport-meter-row">
                    <div class="flex items-center justify-between gap-3 text-xs">
                      <span class="text-muted">{{ metric.label }}</span>
                      <span>{{ metric.value }}</span>
                    </div>
                    <span class="passport-meter" aria-hidden="true">
                      <span data-passport-meter />
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-y border-b border-ink/15 bg-[#ede7da]">
      <div class="site-container">
        <div class="grid gap-10 lg:grid-cols-12">
          <div class="lg:col-span-4">
            <SectionLabel label="Civic toolkits" index="06" />
          </div>
          <div class="lg:col-span-8">
            <h2 data-reveal class="max-w-5xl text-5xl font-medium leading-none md:text-7xl">
              真正能持续的公益，需要工具、账本和可复用模块。
            </h2>
          </div>
        </div>

        <div class="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article v-for="toolkit in civicToolkits" :key="toolkit.title" class="toolkit-card" data-toolkit-card data-reveal>
            <div class="flex items-start justify-between gap-4">
              <span class="toolkit-index">{{ toolkit.index }}</span>
              <span class="toolkit-metric">{{ toolkit.metric }}</span>
            </div>
            <h3 class="mt-14 text-3xl font-medium leading-none">{{ toolkit.title }}</h3>
            <p class="mt-5 text-sm leading-6 text-muted">{{ toolkit.summary }}</p>
            <div class="mt-8 grid gap-2">
              <span v-for="module in toolkit.modules" :key="module" class="toolkit-module">{{ module }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section-y border-b border-ink/15">
      <div class="site-container grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-5">
          <SectionLabel label="Sustainability system" index="07" />
          <h2 data-reveal class="mt-8 text-5xl font-medium leading-none md:text-7xl">可持续不是章节，是每个行动的结构。</h2>
        </div>
        <div class="grid gap-4 lg:col-span-6 lg:col-start-7">
          <div
            v-for="principle in sustainabilityPrinciples"
            :key="principle.title"
            data-reveal
            class="grid gap-4 border-t border-ink/15 py-7 md:grid-cols-5"
          >
            <h3 class="text-2xl font-medium md:col-span-2">{{ principle.title }}</h3>
            <p class="leading-7 text-muted md:col-span-3">{{ principle.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section-y border-b border-ink/15">
      <div class="site-container">
        <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel label="Journal" index="08" />
            <h2 data-reveal class="mt-8 text-5xl font-medium leading-none md:text-7xl">案例与田野记录</h2>
          </div>
          <NuxtLink to="/journal" class="focus-ring magnetic-button flex h-12 w-fit items-center gap-2 rounded-full border border-ink/15 px-5 text-sm">
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
              <OptimizedImage
                :src="post.image"
                :alt="post.title"
                image-class="h-full w-full object-cover"
                sizes="(max-width: 767px) 100vw, 33vw"
              />
            </div>
            <p class="mt-5 text-xs text-muted">{{ post.category }} / {{ post.date }}</p>
            <h3 class="mt-2 text-2xl font-medium">{{ post.title }}</h3>
            <p class="mt-4 text-sm leading-6 text-muted">{{ post.excerpt }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="border-b border-ink/15 py-12">
      <div class="site-container grid gap-8 md:grid-cols-12 md:items-center">
        <h2 class="text-4xl font-medium leading-none md:col-span-7 md:text-6xl">把你的街区放进行动清单。</h2>
        <div class="md:col-span-4 md:col-start-9">
          <p class="text-sm leading-6 text-muted">选择一个可落地的环保行动，或提交社区低碳共建意向。</p>
          <button class="focus-ring magnetic-button mt-6 flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-sm text-paper" type="button" @click="addFeatured">
            <Plus :size="16" stroke-width="1.7" aria-hidden="true" />
            <span>加入首个行动</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
