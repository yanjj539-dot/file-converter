<script setup lang="ts">
import { Check, Minus, Send, X } from 'lucide-vue-next'

const { isOpen, actions, closeDrawer, removeAction, clearActions } = useActionDrawer()
const submitted = ref(false)
const form = reactive({
  name: '',
  contact: '',
  area: '',
  note: ''
})

watch(isOpen, (value) => {
  if (value) {
    submitted.value = false
    document.documentElement.style.overflow = 'hidden'
  } else {
    document.documentElement.style.overflow = ''
  }
})

onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
})

const submit = () => {
  submitted.value = true
  form.name = ''
  form.contact = ''
  form.area = ''
  form.note = ''
  clearActions()
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" class="fixed inset-0 z-50 drawer-mask" @click="closeDrawer" />
    </Transition>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="isOpen"
        class="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[520px] flex-col border-l border-ink/15 bg-paper shadow-soft"
        aria-label="加入行动抽屉"
      >
        <div class="flex items-center justify-between border-b border-ink/15 p-5">
          <div>
            <p class="text-xs text-muted">Green Civic</p>
            <h2 class="mt-1 text-2xl font-medium">加入行动</h2>
          </div>
          <button class="focus-ring grid size-11 place-items-center rounded-full border border-ink/15" type="button" aria-label="关闭" @click="closeDrawer">
            <X :size="18" stroke-width="1.7" aria-hidden="true" />
          </button>
        </div>

        <div class="thin-scrollbar flex-1 overflow-y-auto p-5">
          <div v-if="submitted" class="border border-ink/15 bg-[#f8f5ec] p-5">
            <Check :size="26" stroke-width="1.7" aria-hidden="true" />
            <h3 class="mt-6 text-2xl font-medium">行动申请已记录</h3>
            <p class="mt-3 text-sm leading-6 text-muted">我们会以社区、学校或机构为单位整理下一轮共建清单，并公开可参与的时间表。</p>
          </div>

          <template v-else>
            <div class="border-b border-ink/15 pb-5">
              <p class="text-sm leading-6 text-muted">已选择的行动会随表单一起提交，便于建立街区、校园或社区的共建清单。</p>
            </div>

            <div class="py-5">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-medium">行动清单</h3>
                <span class="text-xs text-muted">{{ actions.length }} 项</span>
              </div>

              <div v-if="actions.length" class="mt-4 grid gap-3">
                <div
                  v-for="item in actions"
                  :key="item.slug"
                  class="flex items-start justify-between gap-4 border border-ink/15 bg-[#f8f5ec] p-4"
                >
                  <div>
                    <p class="text-sm font-medium">{{ item.title }}</p>
                    <p class="mt-1 text-xs text-muted">{{ item.collection }}</p>
                  </div>
                  <button
                    class="focus-ring grid size-8 shrink-0 place-items-center rounded-full border border-ink/15"
                    type="button"
                    aria-label="移除行动"
                    @click="removeAction(item.slug)"
                  >
                    <Minus :size="14" stroke-width="1.7" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <p v-else class="mt-4 border border-dashed border-ink/20 p-4 text-sm leading-6 text-muted">
                可从行动目录或详情页加入一个具体项目，也可以直接提交社区共建意向。
              </p>
            </div>

            <form class="grid gap-4 border-t border-ink/15 pt-5" @submit.prevent="submit">
              <label class="grid gap-2 text-sm">
                <span>姓名 / 组织</span>
                <input v-model="form.name" class="focus-ring h-12 rounded border border-ink/15 bg-transparent px-3" required />
              </label>
              <label class="grid gap-2 text-sm">
                <span>联系方式</span>
                <input v-model="form.contact" class="focus-ring h-12 rounded border border-ink/15 bg-transparent px-3" required />
              </label>
              <label class="grid gap-2 text-sm">
                <span>所在社区 / 学校 / 街区</span>
                <input v-model="form.area" class="focus-ring h-12 rounded border border-ink/15 bg-transparent px-3" />
              </label>
              <label class="grid gap-2 text-sm">
                <span>共建意向</span>
                <textarea v-model="form.note" class="focus-ring min-h-28 resize-none rounded border border-ink/15 bg-transparent p-3" />
              </label>
              <button class="focus-ring flex h-12 items-center justify-center gap-2 rounded bg-ink px-4 text-sm text-paper" type="submit">
                <Send :size="16" stroke-width="1.7" aria-hidden="true" />
                <span>提交意向</span>
              </button>
            </form>
          </template>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
