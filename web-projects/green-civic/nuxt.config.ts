export default defineNuxtConfig({
  compatibilityDate: '2026-06-21',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@vueuse/nuxt'],
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true
  },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      htmlAttrs: {
        lang: 'zh-CN'
      },
      title: 'Green Civic / 城市绿色公益行动平台',
      meta: [
        {
          name: 'description',
          content: '面向城市环保、低碳生活、绿色出行和社区公益行动的高级公共品牌网站。'
        },
        { name: 'theme-color', content: '#f4f1e8' }
      ]
    }
  }
})
