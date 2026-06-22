export const useGsapReveals = (scope?: Ref<HTMLElement | null>) => {
  let ctx: { revert: () => void } | undefined

  onMounted(async () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const { default: gsap } = await import('gsap')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    gsap.registerPlugin(ScrollTrigger)

    const root = scope?.value ?? document.body
    ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.from(element, {
          autoAlpha: 0,
          y: 26,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 88%',
            once: true
          }
        })
      })
    }, root)
  })

  onBeforeUnmount(() => {
    ctx?.revert()
  })
}
