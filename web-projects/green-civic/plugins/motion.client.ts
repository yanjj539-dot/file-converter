import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

export default defineNuxtPlugin((nuxtApp) => {
  gsap.registerPlugin(ScrollTrigger)

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  let lenis: Lenis | null = null

  if (!reducedMotion && !coarsePointer) {
    lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: false
    })

    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => {
      lenis?.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)
  }

  window.addEventListener(
    'beforeunload',
    () => {
      lenis?.destroy()
    },
    { once: true }
  )

  nuxtApp.provide('gsap', gsap)
  nuxtApp.provide('ScrollTrigger', ScrollTrigger)
  nuxtApp.provide('lenis', lenis)
})
