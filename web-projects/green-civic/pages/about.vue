<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

useSeoMeta({
  title: 'About / Green Civic',
  description: 'Green Civic 的品牌叙事、方法论、组织结构和城市绿色公益行动路线。'
})

const page = ref<HTMLElement | null>(null)
const timeline = ref<HTMLElement | null>(null)

useGsapReveals(page)

let dragging = false
let startX = 0
let startScrollLeft = 0

const years = [
  { year: '2024', title: '街区观察', text: '从热岛、混投和短途机动车问题建立第一批城市样本。' },
  { year: '2025', title: '行动原型', text: '把遮阴构架、材料回收站和校园骑行环线打磨为可复用模块。' },
  { year: '2026', title: '公共平台', text: '以目录、Journal 和共建抽屉连接社区、学校与专业组织。' },
  { year: 'Next', title: '城市网络', text: '让每个行动拥有共管账本，并扩展成跨街区的低碳公益网络。' }
]

const startDrag = (event: PointerEvent) => {
  if (!timeline.value) return
  dragging = true
  startX = event.clientX
  startScrollLeft = timeline.value.scrollLeft
  timeline.value.setPointerCapture(event.pointerId)
}

const moveDrag = (event: PointerEvent) => {
  if (!dragging || !timeline.value) return
  timeline.value.scrollLeft = startScrollLeft - (event.clientX - startX)
}

const endDrag = () => {
  dragging = false
}
</script>

<template>
  <div ref="page" class="pt-28 md:pt-32">
    <section class="site-container">
      <div class="grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <SectionLabel label="About Green Civic" index="01" />
        </div>
        <div class="lg:col-span-8">
          <h1 class="text-6xl font-medium leading-none md:text-8xl">城市绿色公益行动平台</h1>
          <p class="mt-8 max-w-4xl text-2xl leading-9 text-muted">
            我们把环保公益从一次性倡议转化为可部署的公共系统：有材料、有动线、有维护、有账本，也有居民能够长期参与的位置。
          </p>
        </div>
      </div>
    </section>

    <section class="site-container section-y">
      <div class="grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-5" data-reveal>
          <div class="media-frame aspect-[4/5]">
            <OptimizedImage
              src="/images/community-action-editorial.png"
              alt="社区低碳行动现场"
              image-class="h-full w-full object-cover"
              sizes="(max-width: 1023px) 100vw, 42vw"
              priority
            />
          </div>
        </div>
        <div class="lg:col-span-6 lg:col-start-7">
          <SectionLabel label="Narrative" index="02" />
          <div class="mt-8 grid gap-8 text-xl leading-9 text-ink/85">
            <p data-reveal>
              城市环保经常被压缩成海报、口号或短期活动。Green Civic 关注的是更缓慢但更真实的部分：谁在使用街道，谁在维护设施，材料被送往哪里，居民如何知道自己的行动产生了影响。
            </p>
            <p data-reveal>
              平台以产品目录的方式组织公益行动，是为了让每个项目都能被理解、比较和复制。一个行动不只是一篇报道，而是包含场景、构件、过程和治理关系的完整系统。
            </p>
            <p data-reveal>
              我们避免把绿色视觉做成符号堆叠。更重要的是让公共空间、材料纹理、工程线稿和城市数据本身成为视觉证据。
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="border-y border-ink/15 bg-[#ede7da]">
      <div class="site-container py-20">
        <div class="grid gap-8 lg:grid-cols-12">
          <div class="lg:col-span-4">
            <SectionLabel label="Timeline" index="03" />
          </div>
          <div class="lg:col-span-8">
            <h2 class="text-5xl font-medium leading-none md:text-7xl">从观察到城市网络。</h2>
          </div>
        </div>

        <div
          ref="timeline"
          class="thin-scrollbar mt-14 flex cursor-grab gap-5 overflow-x-auto pb-4 active:cursor-grabbing"
          @pointerdown="startDrag"
          @pointermove="moveDrag"
          @pointerup="endDrag"
          @pointercancel="endDrag"
          @pointerleave="endDrag"
        >
          <article
            v-for="item in years"
            :key="item.year"
            class="grid min-h-[320px] w-[320px] shrink-0 border border-ink/15 bg-paper p-5 md:w-[420px]"
          >
            <p class="text-sm text-muted">{{ item.year }}</p>
            <div class="mt-auto">
              <h3 class="text-4xl font-medium">{{ item.title }}</h3>
              <p class="mt-4 leading-7 text-muted">{{ item.text }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="site-container section-y">
      <div class="grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-5">
          <SectionLabel label="Operating model" index="04" />
          <h2 data-reveal class="mt-8 text-5xl font-medium leading-none md:text-7xl">一个行动由四个角色共同完成。</h2>
        </div>
        <div class="grid gap-4 lg:col-span-6 lg:col-start-7">
          <div v-for="role in ['居民与学生', '社区与学校', '专业环保组织', '本地商户与维护方']" :key="role" data-reveal class="flex items-center justify-between border-t border-ink/15 py-6">
            <span class="text-2xl">{{ role }}</span>
            <ArrowRight :size="18" stroke-width="1.7" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
