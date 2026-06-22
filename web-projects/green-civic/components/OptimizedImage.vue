<script setup lang="ts">
defineOptions({
  inheritAttrs: false
})

const props = withDefaults(defineProps<{
  src: string
  alt: string
  imageClass?: string
  sizes?: string
  loading?: 'eager' | 'lazy'
  priority?: boolean
  natural?: boolean
  width?: number | string
  height?: number | string
}>(), {
  imageClass: '',
  sizes: '100vw',
  loading: 'lazy',
  priority: false,
  natural: false
})

const attrs = useAttrs()
const assetPath = useAssetPath()
const loaded = ref(false)
const failed = ref(false)
const image = ref<HTMLImageElement | null>(null)

const localImage = computed(() => /^\/images\/[^?#]+\.(png|jpe?g)$/i.test(props.src))
const stem = computed(() => {
  const filename = props.src.split('/').pop() ?? ''
  return filename.replace(/\.(png|jpe?g)$/i, '')
})

const optimizedSrcset = computed(() => {
  if (!localImage.value) return ''
  return [320, 640, 960, 1440]
    .map((width) => `${assetPath(`/images/optimized/${stem.value}-${width}.webp`)} ${width}w`)
    .join(', ')
})

const fallbackSrc = computed(() => assetPath(props.src))

const onLoad = () => {
  loaded.value = true
}

const onError = () => {
  failed.value = true
}

onMounted(() => {
  if (image.value?.complete && image.value.naturalWidth > 0) {
    loaded.value = true
  }
})
</script>

<template>
  <span
    class="optimized-image"
    :class="[attrs.class, { 'is-loaded': loaded, 'has-error': failed, 'is-natural': natural }]"
  >
    <picture v-if="!failed" class="optimized-image-picture">
      <source v-if="optimizedSrcset" type="image/webp" :srcset="optimizedSrcset" :sizes="sizes" />
      <img
        ref="image"
        :src="fallbackSrc"
        :alt="alt"
        :class="imageClass"
        :loading="priority ? 'eager' : loading"
        decoding="async"
        :fetchpriority="priority ? 'high' : undefined"
        :width="width"
        :height="height"
        @load="onLoad"
        @error="onError"
      />
    </picture>
    <span v-else class="optimized-image-fallback" aria-hidden="true">
      <span>IMAGE PENDING</span>
    </span>
  </span>
</template>
