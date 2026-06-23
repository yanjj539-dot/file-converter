<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { civicLedgers, ecoMaterials, materialPassportFields, materialRoutes, sustainabilityPrinciples } from '~/data/site'

useSeoMeta({
  title: '可持续专题 / Green Civic',
  description: 'Green Civic 的材料回流、低碳运营和公共共管专题。'
})

const page = ref<HTMLElement | null>(null)
const featuredMaterials = ecoMaterials.slice(0, 8)
useGsapReveals(page)
</script>

<template>
  <div ref="page" class="pt-28 md:pt-32">
    <section class="site-container">
      <div class="grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <SectionLabel label="Sustainability" index="01" />
        </div>
        <div class="lg:col-span-8">
          <h1 class="text-6xl font-medium leading-none md:text-8xl">可持续专题</h1>
          <p class="mt-6 max-w-4xl text-xl leading-8 text-muted">
            Green Civic 将可持续放进材料、运营、维护和公共治理，而不是把它作为单独的宣传章节。
          </p>
        </div>
      </div>
    </section>

    <section class="site-container section-y">
      <div class="grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-7" data-reveal>
          <div class="media-frame aspect-[16/10] bg-[#ede7da]">
            <OptimizedImage
              src="/images/engineering-linework.png"
              alt="环保公共装置工程线稿"
              image-class="h-full w-full object-cover"
              sizes="(max-width: 1023px) 100vw, 58vw"
              priority
            />
          </div>
        </div>
        <div class="grid gap-4 lg:col-span-4 lg:col-start-9">
          <div data-reveal class="border-t border-ink/15 pt-5">
            <p class="text-5xl font-medium">74%</p>
            <p class="mt-3 text-sm leading-6 text-muted">项目构件可拆卸复用或进入回收链路。</p>
          </div>
          <div data-reveal class="border-t border-ink/15 pt-5">
            <p class="text-5xl font-medium">12个月</p>
            <p class="mt-3 text-sm leading-6 text-muted">所有示范行动都设置年度维护和公开复盘。</p>
          </div>
          <div data-reveal class="border-t border-ink/15 pt-5">
            <p class="text-5xl font-medium">4方</p>
            <p class="mt-3 text-sm leading-6 text-muted">居民、学校、商户和专业组织共同参与治理。</p>
          </div>
        </div>
      </div>
    </section>

    <section class="border-y border-ink/15 bg-[#ede7da]">
      <div class="site-container grid gap-12 py-20 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <SectionLabel label="Material passports" index="02" />
          <h2 class="mt-8 text-5xl font-medium leading-none md:text-7xl">每个环保材料都要写清楚来处和去处。</h2>
        </div>
        <div class="lg:col-span-8">
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <span v-for="field in materialPassportFields" :key="field" data-reveal class="passport-field bg-paper/60">{{ field }}</span>
          </div>

          <div class="mt-12 grid gap-4 md:grid-cols-2">
            <article
              v-for="material in featuredMaterials"
              :key="material.code"
              data-reveal
              class="material-cell"
            >
              <p class="text-xs text-muted">{{ material.code }} / {{ material.category }}</p>
              <h3 class="mt-3 text-2xl font-medium">{{ material.name }}</h3>
              <p class="mt-4 text-sm leading-6 text-muted">{{ material.summary }}</p>
              <div class="mt-5 flex flex-wrap gap-2">
                <span v-for="application in material.applications.slice(0, 2)" :key="application" class="material-chip">{{ application }}</span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="border-b border-ink/15">
      <div class="site-container grid gap-12 py-20 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <SectionLabel label="Material routes" index="03" />
          <h2 class="mt-8 text-5xl font-medium leading-none md:text-7xl">从废弃物到公共构件。</h2>
        </div>
        <div class="grid gap-4 lg:col-span-8 lg:grid-cols-2">
          <article
            v-for="route in materialRoutes"
            :key="route.from"
            data-reveal
            class="material-route min-h-[360px]"
          >
            <p class="font-mono text-xs text-muted">ROUTE / {{ route.from }}</p>
            <div class="mt-12 grid gap-5">
              <div>
                <span>PROCESS</span>
                <strong>{{ route.method }}</strong>
              </div>
              <div>
                <span>PUBLIC USE</span>
                <strong>{{ route.to }}</strong>
              </div>
            </div>
            <p class="mt-10 border-t border-ink/15 pt-5 text-sm leading-6 text-muted">{{ route.output }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="border-b border-ink/15">
      <div class="site-container grid gap-12 py-20 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <SectionLabel label="Operating principles" index="04" />
        </div>
        <div class="lg:col-span-8">
          <div
            v-for="principle in sustainabilityPrinciples"
            :key="principle.title"
            data-reveal
            class="grid gap-6 border-t border-ink/15 py-8 md:grid-cols-12"
          >
            <h2 class="text-4xl font-medium md:col-span-5">{{ principle.title }}</h2>
            <p class="text-lg leading-8 text-muted md:col-span-7">{{ principle.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="site-container section-y">
      <div class="grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-5">
          <SectionLabel label="Public maintenance" index="05" />
          <h2 class="mt-8 text-5xl font-medium leading-none md:text-7xl">可持续要被持续记录。</h2>
        </div>
        <div class="lg:col-span-6 lg:col-start-7">
          <div class="border-t border-ink/15">
            <article
              v-for="entry in civicLedgers"
              :key="`${entry.area}-${entry.action}`"
              data-reveal
              class="ledger-row"
            >
              <div>
                <p class="text-sm text-muted">{{ entry.area }}</p>
                <h3 class="mt-2 text-2xl font-medium">{{ entry.action }}</h3>
              </div>
              <p class="text-sm leading-6 text-muted">{{ entry.material }}</p>
              <div class="ledger-status">
                <span>{{ entry.status }}</span>
                <strong>{{ entry.metric }}</strong>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="site-container pb-28">
      <div class="grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-5">
          <SectionLabel label="Material policy" index="06" />
          <h2 class="mt-8 text-5xl font-medium leading-none md:text-7xl">每个构件都要知道下一站在哪里。</h2>
        </div>
        <div class="grid gap-5 lg:col-span-6 lg:col-start-7">
          <NuxtLink
            v-for="item in ['材料来源记录', '维护替换计划', '拆卸回收路径', '社区公开账本']"
            :key="item"
            to="/actions"
            data-reveal
            class="focus-ring flex items-center justify-between border-t border-ink/15 py-6 text-2xl"
          >
            <span>{{ item }}</span>
            <ArrowUpRight :size="18" stroke-width="1.7" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
