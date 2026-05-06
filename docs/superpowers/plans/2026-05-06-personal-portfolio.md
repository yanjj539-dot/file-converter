# 个人主页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个风格与 Xiaomi MiMo Orbit 相似的个人主页，单个 `index.html` 文件，零依赖，直接双击可打开。

**Architecture:** 单文件 HTML，所有 CSS 内联在 `<style>` 标签，所有 JS 内联在 `<script>` 标签。页面分 5 个区块：导航栏、Hero 首屏、关于我+技能、FAQ、Footer。

**Tech Stack:** HTML5, CSS3 (custom properties, grid, flexbox, keyframes), 原生 JavaScript (无框架)

---

## 文件结构

```
index.html   ← 唯一输出文件，覆盖项目根目录已有的同名文件
```

---

### Task 1: HTML 骨架 + CSS 变量 + 背景

**Files:**
- Modify: `index.html`（完整替换）

- [ ] **Step 1: 写出完整 HTML 骨架，包含 CSS 变量和背景效果**

将 `index.html` 替换为以下内容：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Alex Chen · Portfolio</title>
<style>
  :root {
    --bg: #0a0a0f;
    --primary: #6366f1;
    --primary-end: #8b5cf6;
    --text: #f8fafc;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --border: rgba(255,255,255,0.06);
    --border-accent: rgba(99,102,241,0.3);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* 背景网格 */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  /* 中心光晕 */
  body::after {
    content: '';
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 400px;
    background: radial-gradient(ellipse, rgba(99,102,241,0.12), transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* 渐变文字工具类 */
  .gradient-text {
    background: linear-gradient(135deg, var(--primary), var(--primary-end));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* 胶囊标签工具类 */
  .tag {
    display: inline-block;
    background: rgba(99,102,241,0.1);
    border: 1px solid var(--border-accent);
    color: #818cf8;
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 11px;
    letter-spacing: 2px;
  }

  /* 光标闪烁 */
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .cursor {
    color: var(--primary);
    animation: blink 1s step-end infinite;
  }

  /* 所有内容层级高于背景 */
  nav, main, footer { position: relative; z-index: 1; }
</style>
</head>
<body>
  <nav id="navbar"></nav>
  <main>
    <section id="hero"></section>
    <section id="about"></section>
    <section id="faq"></section>
  </main>
  <footer id="footer"></footer>
  <script>
    // JS will be added in later tasks
  </script>
</body>
</html>
```

- [ ] **Step 2: 在浏览器打开 index.html，确认背景为深黑色，有细网格线，无报错**

用文件管理器双击 `index.html`，页面应显示纯黑背景 + 细紫色网格。

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: html skeleton with css variables and grid background"
```

---

### Task 2: 导航栏

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 在 `<style>` 末尾追加导航栏样式**

在 `</style>` 前插入：

```css
  /* ── 导航栏 ── */
  #navbar {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    border-bottom: 1px solid var(--border);
    transition: background 0.3s, backdrop-filter 0.3s;
    z-index: 100;
  }

  #navbar.scrolled {
    background: rgba(10,10,15,0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  .nav-logo-icon {
    width: 28px; height: 28px;
    background: linear-gradient(135deg, var(--primary), var(--primary-end));
    border-radius: 7px;
    flex-shrink: 0;
  }

  .nav-logo-name {
    color: var(--text);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 28px;
    list-style: none;
  }

  .nav-links a {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 13px;
    transition: color 0.2s;
  }

  .nav-links a:hover { color: var(--text); }

  .nav-lang {
    background: rgba(99,102,241,0.12);
    border: 1px solid var(--border-accent);
    color: #818cf8;
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 11px;
    letter-spacing: 1px;
    cursor: pointer;
  }
```

- [ ] **Step 2: 将 `<nav id="navbar"></nav>` 替换为完整导航 HTML**

```html
  <nav id="navbar">
    <a class="nav-logo" href="#">
      <div class="nav-logo-icon"></div>
      <span class="nav-logo-name">Alex Chen</span>
    </a>
    <ul class="nav-links">
      <li><a href="#about">关于</a></li>
      <li><a href="#about">技能</a></li>
      <li><a href="#faq">FAQ</a></li>
      <li><a href="#footer">联系</a></li>
      <li><span class="nav-lang">EN</span></li>
    </ul>
  </nav>
```

- [ ] **Step 3: 将 `<script>` 内容替换为导航滚动监听**

```html
  <script>
    // 导航毛玻璃
    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
    });
  </script>
```

- [ ] **Step 4: 刷新浏览器，确认导航栏固定在顶部，向下滚动后出现毛玻璃效果**

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: fixed navbar with scroll blur effect"
```

---

### Task 3: Hero 首屏

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 在 `<style>` 末尾追加 Hero 样式**

在 `</style>` 前插入：

```css
  /* ── Hero ── */
  #hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 80px 24px 60px;
  }

  .hero-badge {
    margin-bottom: 24px;
  }

  .hero-title {
    font-size: clamp(32px, 6vw, 56px);
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -1px;
    margin-bottom: 14px;
  }

  .hero-subtitle {
    color: var(--text-secondary);
    font-size: clamp(14px, 2vw, 18px);
    margin-bottom: 10px;
  }

  .hero-desc {
    color: var(--text-muted);
    font-size: 14px;
    max-width: 480px;
    margin: 0 auto 32px;
    line-height: 1.7;
  }

  .hero-cta {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 56px;
    flex-wrap: wrap;
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--primary), var(--primary-end));
    color: #fff;
    border: none;
    padding: 11px 28px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99,102,241,0.35);
  }

  .btn-secondary {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid rgba(255,255,255,0.12);
    padding: 11px 28px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }

  .btn-secondary:hover {
    border-color: var(--border-accent);
    color: var(--text);
  }

  .hero-stats {
    display: flex;
    gap: 40px;
    align-items: center;
  }

  .stat {
    text-align: center;
  }

  .stat-number {
    font-size: 28px;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 4px;
  }

  .stat-label {
    color: var(--text-muted);
    font-size: 11px;
    letter-spacing: 1px;
  }

  .stat-divider {
    width: 1px;
    height: 36px;
    background: var(--border);
  }
```

- [ ] **Step 2: 将 `<section id="hero"></section>` 替换为完整 Hero HTML**

```html
    <section id="hero">
      <div class="hero-badge">
        <span class="tag">PORTFOLIO · 2026</span>
      </div>
      <h1 class="hero-title">
        Hi, I'm <span class="gradient-text" id="typed-name">Alex Chen</span><span class="cursor">_</span>
      </h1>
      <p class="hero-subtitle" id="typed-role">设计师 · 开发者 · 创造者</p>
      <p class="hero-desc">用代码和设计构建有温度的数字体验，专注于 UI/UX 与前端开发。</p>
      <div class="hero-cta">
        <a href="#footer" class="btn-primary">联系我 →</a>
        <a href="#" class="btn-secondary">查看简历</a>
      </div>
      <div class="hero-stats">
        <div class="stat">
          <div class="stat-number gradient-text">3+</div>
          <div class="stat-label">年经验</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <div class="stat-number gradient-text">20+</div>
          <div class="stat-label">完成项目</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <div class="stat-number gradient-text">∞</div>
          <div class="stat-label">创造热情</div>
        </div>
      </div>
    </section>
```

- [ ] **Step 3: 在 `<script>` 中追加打字机动效**

将 `<script>` 内容替换为：

```html
  <script>
    // 导航毛玻璃
    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
    });

    // 打字机动效
    const roles = ['设计师', '开发者', '创造者', 'Designer', 'Developer'];
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;
    const roleEl = document.getElementById('typed-role');

    function typeRole() {
      const current = roles[roleIndex];
      if (!deleting) {
        roleEl.textContent = current.slice(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(typeRole, 1800);
          return;
        }
      } else {
        roleEl.textContent = current.slice(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(typeRole, deleting ? 60 : 100);
    }

    setTimeout(typeRole, 1000);
  </script>
```

- [ ] **Step 4: 刷新浏览器，确认 Hero 全屏居中，副标题有打字机效果，按钮 hover 有上浮动画**

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: hero section with typewriter animation and stats"
```

---

### Task 4: 关于我 + 技能区块

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 在 `<style>` 末尾追加关于我区块样式**

在 `</style>` 前插入：

```css
  /* ── 关于我 + 技能 ── */
  #about {
    padding: 80px 40px;
    max-width: 960px;
    margin: 0 auto;
  }

  .section-label {
    color: #818cf8;
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 32px;
  }

  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  @media (max-width: 640px) {
    .about-grid { grid-template-columns: 1fr; }
    #about { padding: 60px 20px; }
  }

  .card {
    background: rgba(255,255,255,0.02);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px;
    transition: border-color 0.25s;
  }

  .card:hover { border-color: var(--border-accent); }

  .card-label {
    color: #818cf8;
    font-size: 10px;
    letter-spacing: 3px;
    margin-bottom: 14px;
  }

  .card p {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.75;
  }

  .skills-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .skill-tag {
    background: rgba(99,102,241,0.12);
    border: 1px solid rgba(99,102,241,0.25);
    color: #818cf8;
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 12px;
    transition: background 0.2s, border-color 0.2s;
  }

  .skill-tag:hover {
    background: rgba(99,102,241,0.22);
    border-color: rgba(99,102,241,0.5);
  }
```

- [ ] **Step 2: 将 `<section id="about"></section>` 替换为完整 HTML**

```html
    <section id="about">
      <p class="section-label">// 关于我 &amp; 技能</p>
      <div class="about-grid">
        <div class="card">
          <p class="card-label">ABOUT ME</p>
          <p>热爱设计与技术的交叉地带，相信好的产品应该既好看又好用。目前专注于 Web 前端开发和交互设计，喜欢探索新技术和创意表达。</p>
        </div>
        <div class="card">
          <p class="card-label">SKILLS</p>
          <div class="skills-cloud">
            <span class="skill-tag">React</span>
            <span class="skill-tag">TypeScript</span>
            <span class="skill-tag">Figma</span>
            <span class="skill-tag">CSS</span>
            <span class="skill-tag">Node.js</span>
            <span class="skill-tag">UI/UX</span>
            <span class="skill-tag">HTML5</span>
            <span class="skill-tag">Git</span>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 3: 刷新浏览器，确认两栏卡片正常显示，hover 时边框变紫色**

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: about me and skills section"
```

---

### Task 5: FAQ 折叠区块

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 在 `<style>` 末尾追加 FAQ 样式**

在 `</style>` 前插入：

```css
  /* ── FAQ ── */
  #faq {
    padding: 80px 40px;
    max-width: 960px;
    margin: 0 auto;
    border-top: 1px solid var(--border);
  }

  @media (max-width: 640px) {
    #faq { padding: 60px 20px; }
  }

  .faq-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .faq-item {
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.25s;
  }

  .faq-item.open {
    border-color: var(--border-accent);
    background: rgba(99,102,241,0.04);
  }

  .faq-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    cursor: pointer;
    user-select: none;
  }

  .faq-question-text {
    color: var(--text);
    font-size: 14px;
  }

  .faq-icon {
    color: var(--primary);
    font-size: 20px;
    font-weight: 300;
    line-height: 1;
    transition: transform 0.3s;
    flex-shrink: 0;
  }

  .faq-item.open .faq-icon { transform: rotate(45deg); }

  .faq-answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s ease;
  }

  .faq-answer-inner {
    padding: 0 20px 16px;
    color: var(--text-muted);
    font-size: 13px;
    line-height: 1.75;
  }
```

- [ ] **Step 2: 将 `<section id="faq"></section>` 替换为完整 HTML**

```html
    <section id="faq">
      <p class="section-label">// 常见问题</p>
      <div class="faq-list">
        <div class="faq-item">
          <div class="faq-question">
            <span class="faq-question-text">01 &nbsp; 你目前接受新项目合作吗？</span>
            <span class="faq-icon">+</span>
          </div>
          <div class="faq-answer">
            <div class="faq-answer-inner">是的，目前开放合作机会。欢迎通过下方联系方式与我取得联系，简单描述你的项目需求即可。</div>
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-question">
            <span class="faq-question-text">02 &nbsp; 你擅长哪类项目？</span>
            <span class="faq-icon">+</span>
          </div>
          <div class="faq-answer">
            <div class="faq-answer-inner">专注于 Web 应用、品牌视觉设计和交互原型，尤其擅长将复杂需求转化为简洁直观的用户界面。</div>
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-question">
            <span class="faq-question-text">03 &nbsp; 如何联系你？</span>
            <span class="faq-icon">+</span>
          </div>
          <div class="faq-answer">
            <div class="faq-answer-inner">可以通过页面底部的 Email 链接发送邮件，或在 GitHub / Twitter 上找到我。通常在 1-2 个工作日内回复。</div>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 3: 在 `<script>` 中追加 FAQ 折叠逻辑**

在 `setTimeout(typeRole, 1000);` 后追加：

```js
    // FAQ 折叠
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const answer = item.querySelector('.faq-answer');
        const isOpen = item.classList.contains('open');

        // 关闭所有
        document.querySelectorAll('.faq-item').forEach(i => {
          i.classList.remove('open');
          i.querySelector('.faq-answer').style.maxHeight = '0';
        });

        // 如果原来是关闭的，则打开
        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
```

- [ ] **Step 4: 刷新浏览器，点击 FAQ 条目，确认展开/折叠动画正常，图标旋转**

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: faq accordion with smooth animation"
```

---

### Task 6: Footer + 联系方式

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 在 `<style>` 末尾追加 Footer 样式**

在 `</style>` 前插入：

```css
  /* ── Footer ── */
  #footer {
    border-top: 1px solid var(--border);
    padding: 32px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 100%;
    flex-wrap: wrap;
    gap: 16px;
  }

  @media (max-width: 640px) {
    #footer {
      flex-direction: column;
      text-align: center;
      padding: 28px 20px;
    }
  }

  .footer-copy {
    color: var(--text-muted);
    font-size: 12px;
  }

  .footer-links {
    display: flex;
    gap: 20px;
    list-style: none;
  }

  .footer-links a {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 12px;
    transition: color 0.2s;
  }

  .footer-links a:hover { color: #818cf8; }
```

- [ ] **Step 2: 将 `<footer id="footer"></footer>` 替换为完整 HTML**

```html
  <footer id="footer">
    <span class="footer-copy">© 2026 Alex Chen · Built with ♥</span>
    <ul class="footer-links">
      <li><a href="#" target="_blank" rel="noopener">GitHub</a></li>
      <li><a href="#" target="_blank" rel="noopener">Twitter</a></li>
      <li><a href="mailto:hello@example.com">Email</a></li>
    </ul>
  </footer>
```

- [ ] **Step 3: 刷新浏览器，确认 Footer 正常显示，链接 hover 变紫色**

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: footer with contact links"
```

---

### Task 7: 最终验收

**Files:**
- Modify: `index.html`（如有细节调整）

- [ ] **Step 1: 完整通读页面**

在浏览器中从上到下检查：
1. 导航栏固定，滚动后毛玻璃效果出现
2. Hero 全屏居中，打字机动效循环运行，光标闪烁
3. 数字统计三列对齐，渐变色正确
4. 关于我 + 技能两栏卡片，hover 边框变紫
5. FAQ 三条，点击展开/折叠，图标旋转
6. Footer 版权 + 链接

- [ ] **Step 2: 检查移动端（缩小浏览器窗口到 375px 宽）**

确认：
- 导航链接不溢出（可接受换行或隐藏）
- 关于我 + 技能变为单列
- Hero 字体缩小但不溢出

- [ ] **Step 3: 最终 Commit**

```bash
git add index.html
git commit -m "feat: complete personal portfolio page"
```
