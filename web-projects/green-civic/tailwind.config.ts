import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        paper: '#f4f1e8',
        ink: '#211f1d',
        muted: '#716d63',
        line: '#d9d3c5',
        moss: '#7f9c46',
        acid: '#d7f26b',
        clay: '#bf6f45',
        civic: '#8bb8b1',
        night: '#141412'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Microsoft YaHei', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'SimSun', 'serif']
      },
      boxShadow: {
        soft: '0 24px 80px rgba(33, 31, 29, 0.12)'
      }
    }
  },
  plugins: []
}
