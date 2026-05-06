# 隐山 (Hidden Mountain) 中国风香薰品牌网页设计研究报告

## 一、研究方法与来源

| 来源 | URL | 收获 |
|------|-----|------|
| GitHub Ink Wash 项目 | https://github.com/smart-developer1791/go-fiber-auth-inkwash | 完整 CSS/SVG 水墨动画源码 |
| 花西子 Florasis 官网 | https://florasis.com | 中国风奢侈品牌 Shopify 电商站分析 |
| 故宫博物院官网 | https://dpm.org.cn/Home.html | 传统机构网站设计分析 |
| 优设网 新中式标签 | https://www.uisdc.com/tag/新中式 | 设计趋势文章与案例 |
| GitHub chinese-style 话题 | https://github.com/topics/chinese-style | 开源项目参考（如 taoyuan 410★） |

---

## 二、8 个可直接使用的 CSS/JS 特效（含源码）

### 效果 1：墨迹晕染扩散（Ink Spread）

**适用场景**：页面加载时的品牌 logo 出场、section 切换过渡

```css
@keyframes ink-spread {
  0%   { r: 0;   opacity: 0.8; }
  50%  {           opacity: 0.4; }
  100% { r: 80;  opacity: 0;   }
}

.ink-drop {
  animation: ink-spread 4s ease-out infinite;
}
.ink-drop-2 { animation-delay: 1s; }
.ink-drop-3 { animation-delay: 2s; }
```

```html
<svg>
  <defs>
    <filter id="ink-blur">
      <feGaussianBlur stdDeviation="3" />
    </filter>
  </defs>
  <circle class="ink-drop" cx="200" cy="150" r="0"
          fill="#1a1a1a" filter="url(#ink-blur)" />
</svg>
```

**技术要点**：使用 SVG circle + CSS `r` 动画 + `feGaussianBlur` 滤镜模拟墨在水中的扩散感。多个 circle 错开 delay 制造层次。

---

### 效果 2：毛笔笔触绘制动画（Brush Stroke Draw）

**适用场景**：标题装饰线、品牌 slogan 出现动效

```css
@keyframes brush-stroke {
  0%   { stroke-dashoffset: 1000; }
  100% { stroke-dashoffset: 0;    }
}

.brush-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: brush-stroke 3s ease forwards;
}
.brush-path-2 { animation-delay: 0.5s; }
.brush-path-3 { animation-delay: 1s;   }
```

```html
<path class="brush-path"
  d="M50,80 Q100,60 150,85 T250,75"
  stroke="#1a1a1a" stroke-width="3"
  fill="none" stroke-linecap="round" />
```

**技术要点**：利用 SVG `stroke-dasharray` + `stroke-dashoffset` 技巧。路径用 Q/T 贝塞尔曲线模拟毛笔笔触的不规则感。交错延迟制造一笔一划的书写感。

---

### 效果 3：山水画视差分层（Mountain Parallax Layers）

**适用场景**：Hero Banner 背景、品牌故事页面氛围

```css
@keyframes mountain-rise {
  0%   { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0);    opacity: 1; }
}

.mountain-layer   { animation: mountain-rise 2s ease forwards; }
.mountain-layer-2 { animation-delay: 0.3s; opacity: 0.5; }
.mountain-layer-3 { animation-delay: 0.6s; opacity: 0.3; }
```

```html
<!-- 远山（浅色，先升起） -->
<g class="mountain-layer mountain-layer-3">
  <path d="M0,700 Q320,500 620,620 T1240,560 T1920,660 L1920,1080 L0,1080 Z"
        fill="#3d3d3d" />
</g>
<!-- 中山 -->
<g class="mountain-layer mountain-layer-2">
  <path d="M0,760 Q260,560 580,690 T1160,620 T1920,740 L1920,1080 L0,1080 Z"
        fill="#2d2d2d" />
</g>
<!-- 近山（深色，最后升起） -->
<g class="mountain-layer">
  <path d="M0,820 Q220,650 520,760 T1080,700 T1920,820 L1920,1080 L0,1080 Z"
        fill="url(#mountain-gradient)" />
</g>
```

**技术要点**：3 层 SVG path 山脉，不同透明度与延迟制造远近层次。可结合 GSAP ScrollTrigger 实现滚动视差。

---

### 效果 4：云雾飘动 + 宣纸纹理（Mist & Rice Paper Texture）

**适用场景**：全局背景、页面过渡氛围

```css
@keyframes mist-drift {
  0%,100% { transform: translateX(-5%); opacity: 0.3; }
  50%     { transform: translateX(5%);  opacity: 0.5; }
}

.mist-layer   { animation: mist-drift 8s  ease-in-out infinite; }
.mist-layer-2 { animation: mist-drift 10s ease-in-out infinite 2s; }
```

```html
<svg>
  <defs>
    <!-- 宣纸纹理：fractalNoise + 光照 -->
    <filter id="paper-texture">
      <feTurbulence type="fractalNoise" baseFrequency="0.04"
                    numOctaves="5" result="noise" />
      <feDiffuseLighting in="noise" lighting-color="#f5f5dc" surfaceScale="2">
        <feDistantLight azimuth="45" elevation="60" />
      </feDiffuseLighting>
    </filter>
    <!-- 云雾渐变 -->
    <linearGradient id="mist-gradient">
      <stop offset="0%"   stop-color="#f5f5dc" stop-opacity="0" />
      <stop offset="50%"  stop-color="#f5f5dc" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#f5f5dc" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" filter="url(#paper-texture)" opacity="0.08" />
  <rect class="mist-layer" x="-200" y="600" width="2400" height="120"
        fill="url(#mist-gradient)" />
</svg>
```

**技术要点**：SVG `feTurbulence` 滤镜生成仿宣纸纤维纹理（纯 CSS/SVG 无需图片）。云雾用渐变 + 水平漂移动画。背景色推荐米黄系 `#f5f5dc → #d4cfc4`。

---

### 效果 5：印章落下动画（Seal Stamp）

**适用场景**：品牌 logo、产品认证标识、"隐山"印章标志

```css
@keyframes seal-stamp {
  0%   { transform: scale(1.5) rotate(-10deg); opacity: 0;   }
  50%  { transform: scale(1.1) rotate(2deg);   opacity: 0.8; }
  100% { transform: scale(1)   rotate(0deg);   opacity: 1;   }
}

.seal {
  animation: seal-stamp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 1s;
  opacity: 0;
}
```

```html
<g class="seal">
  <rect x="0" y="0" width="60" height="60" fill="#c41e3a" rx="3" />
  <text x="30" y="38" text-anchor="middle" fill="#f5f5dc"
        font-size="20" font-family="'Noto Serif SC', serif">隐</text>
</g>
```

**技术要点**：缩放+旋转+透明度三重动画，`cubic-bezier` 缓动模拟真实盖章的"砸下去弹一下"手感。红色 `#c41e3a`（朱砂红）+ 米白 `#f5f5dc` 配色。

---

### 效果 6：竹叶摇曳 + 花瓣飘落（Living Landscape）

**适用场景**：全局装饰、侧边栏氛围、loading 页

```css
@keyframes bamboo-sway {
  0%,100% { transform: rotate(-1.5deg); }
  50%     { transform: rotate(1.5deg);  }
}
@keyframes petal-fall {
  0%   { transform: translateY(-100px) rotate(0deg);   opacity: 0; }
  10%  { opacity: 0.8; }
  100% { transform: translateY(100vh) rotate(360deg);  opacity: 0; }
}

.bamboo {
  animation: bamboo-sway 4s ease-in-out infinite;
  transform-origin: bottom center;
}
.bamboo-2 { animation-delay: 0.5s; }
.bamboo-3 { animation-delay: 1s;   }
.bamboo-4 { animation-delay: 1.5s; }

.petal {
  animation: petal-fall 8s linear infinite;
}
```

```html
<!-- 竹子：rect + path 叶片 -->
<g class="bamboo" transform="translate(100, 300)">
  <rect x="0" y="0" width="8" height="300" fill="#2d4a2d" rx="2" />
  <line x1="0" y1="50" x2="8" y2="50" stroke="#1a3a1a" /><!-- 竹节 -->
  <path d="M8,40 Q30,30 50,45 Q40,50 8,50" fill="#3d5a3d" /><!-- 竹叶 -->
</g>

<!-- 花瓣 -->
<g class="petal">
  <ellipse cx="0" cy="0" rx="8" ry="5" fill="#d4a5a5" opacity="0.6" />
</g>
```

**技术要点**：竹节用 line + rect，竹叶用 path。`transform-origin: bottom` 确保从根部摇摆。花瓣用 `translateY(100vh)` 全屏下落。建议在页面四角放置 3-5 丛竹子作为"画框"。

---

### 效果 7：锦鲤游动 + 水波纹（Koi Fish & Water Ripples）

**适用场景**：底部装饰、产品展示区背景、"隐山"水景意境

```css
@keyframes koi-swim {
  0%   { transform: translate(0,    0)     rotate(0deg);  }
  25%  { transform: translate(34px, -14px) rotate(-8deg); }
  50%  { transform: translate(72px, 6px)   rotate(6deg);  }
  75%  { transform: translate(28px, 18px)  rotate(8deg);  }
  100% { transform: translate(0,    0)     rotate(0deg);  }
}
@keyframes ripple {
  0%   { r: 5;  opacity: 0.6; }
  100% { r: 40; opacity: 0;   }
}

.koi { animation: koi-swim 12s ease-in-out infinite; }
.koi-2 { animation: koi-swim 15s ease-in-out infinite 2s; }
.water-ripple { animation: ripple 3s ease-out infinite; }
```

```html
<!-- 红色锦鲤 -->
<g class="koi">
  <ellipse cx="0" cy="0" rx="25" ry="10" fill="url(#koi-gradient)" />
  <path d="M20,0 Q35,-8 40,0 Q35,8 20,0" fill="#c41e3a" /> <!-- 尾巴 -->
  <circle cx="-15" cy="-3" r="2" /> <!-- 眼睛 -->
</g>
<!-- 水波纹 -->
<circle class="water-ripple" cx="0" cy="0" r="5" fill="none"
        stroke="#4a4a4a" stroke-width="0.5" />
```

**技术要点**：锦鲤用路径 keyframe 模拟游动轨迹（S 形）。双色渐变（朱砂红到浅红）模拟锦鲤花色。水波纹用 expanding circle + fading。

---

### 效果 8：CSS Scroll-Driven 水墨卷轴展开（Scroll Painting Reveal）

**适用场景**：产品故事长页面、品牌历史时间轴

```css
/* 使用现代 CSS scroll-driven animation */
.scroll-reveal-container {
  view-timeline-name: --section;
  view-timeline-axis: block;
}

.painting-panel {
  animation: ink-reveal linear forwards;
  animation-timeline: --section;
  animation-range: entry 0% entry 100%;
  clip-path: inset(0 100% 0 0);
}

@keyframes ink-reveal {
  from { clip-path: inset(0 100% 0 0); }  /* 完全隐藏 */
  to   { clip-path: inset(0 0%   0 0); }  /* 完全展开 */
}

/* 兼容方案：Intersection Observer + CSS custom properties */
.is-visible .painting-panel {
  --reveal: 1;
  clip-path: inset(0 calc((1 - var(--reveal)) * 100%) 0 0);
  transition: clip-path 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

```javascript
// GSAP ScrollTrigger 兼容方案（推荐用于生产环境）
gsap.registerPlugin(ScrollTrigger);

document.querySelectorAll('.painting-panel').forEach(panel => {
  gsap.fromTo(panel,
    { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
    {
      clipPath: 'inset(0 0% 0 0)',
      opacity: 1,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: panel,
        start: 'top 80%',
        end: 'top 30%',
        scrub: 0.5  // 跟随滚动进度
      }
    }
  );
});
```

**技术要点**：两种方案——现代方案用 CSS `view-timeline`（Chrome 115+），兼容方案用 GSAP ScrollTrigger。`clip-path: inset()` 实现从右到左（如卷轴展开）的画面揭示效果。

---

## 三、花西子 & 故宫文创 网站分析

### 花西子 (florasis.com)
- **类型**：Shopify 电商站
- **中国风特点**：
  - 配色：深青+金色+白色，产品命名大量使用东方意象（Flawless Jade, Lotus Radiance, Song Brocade）
  - 雕花浮雕产品图（Floral Engraving Phoenix Palette）作为视觉焦点
  - 宋锦、刺绣、游牧等文化主题系列页
  - 字体系 Serif + 标准 Shopify 字体，整体偏现代奢侈
- **可借鉴**：文化叙事产品线命名策略、东方花纹雕饰的产品展示方式

### 故宫博物院 (dpm.org.cn)
- **类型**：传统 CMS 官网
- **中国风特点**：
  - 红墙金瓦配色贯穿全站（#c41e3a 红 + #ffd700 金）
  - 首页大横幅轮播古画/建筑高清图
  - 信息架构清晰（导览/展览/教育/探索/文创六大板块）
  - "数字多宝阁""名画记"等沉浸式数字体验入口
- **可借鉴**：红金配色系统、高清文化资产作为视觉素材的思路

---

## 四、推荐配色方案

### 主配色（水墨色系）
| 颜色 | Hex | 用途 |
|------|-----|------|
| 宣纸白 | `#f5f5dc` | 主背景 |
| 浓墨 | `#1a1a1a` | 主文字 |
| 淡墨 | `#4a4a4a` | 次要文字/山脉 |
| 远山灰 | `#8a8a8a` | 装饰 |

### 点缀色
| 颜色 | Hex | 用途 |
|------|-----|------|
| 朱砂红 | `#c41e3a` | 印章/Logo/CTA按钮 |
| 泥金 | `#d4a574` | 标题装饰线/边框 |
| 石青 | `#4a6fa5` | 链接/蜻蜓/冷调点缀 |
| 竹青 | `#2d4a2d` | 竹子/自然元素 |

### 推荐 Google Font
- **Noto Serif SC**（思源宋体）：正文 + 标题
- **ZCOOL XiaoWei**（站酷小薇）：品牌标题
- **Ma Shan Zheng**（马山正）：书法装饰文字

---

## 五、推荐字体与排版

### 竖排文字实现
```css
.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 0.3em;
  font-family: 'Noto Serif SC', serif;
}
```

### 书法字体动画
```css
@keyframes calligraphy-reveal {
  from {
    clip-path: inset(0 100% 0 0);
    filter: blur(4px);
  }
  to {
    clip-path: inset(0 0 0 0);
    filter: blur(0);
  }
}

.calligraphy-title {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 3rem;
  color: #1a1a1a;
  animation: calligraphy-reveal 2s ease forwards;
}
```

---

## 六、对隐山（Hidden Mountain）香薰品牌的最佳效果推荐

按优先级排序：

| 优先级 | 效果 | 理由 |
|--------|------|------|
| ★★★★★ | 墨迹晕染扩散 | 香薰=气韵流动，墨迹扩散完美隐喻香气弥漫 |
| ★★★★★ | 云雾飘动+宣纸纹理 | 营造空灵、静谧的禅意氛围，契合香薰品牌调性 |
| ★★★★★ | 山水画视差分层 | "隐山"品牌名直接对应，三远法（高远/深远/平远）构图 |
| ★★★★☆ | 毛笔笔触绘制 | Logo/slogan 出场，强化东方书写感 |
| ★★★★☆ | 印章落下动画 | 品牌标识，可做"隐"字印章作为品质认证标志 |
| ★★★★☆ | 竹叶摇曳+花瓣飘落 | 沉浸式自然氛围，可用于产品详情页 |
| ★★★☆☆ | 滚动卷轴展开 | 适合品牌故事长页面，但需注意性能 |
| ★★★☆☆ | 锦鲤+水波纹 | 作为装饰元素点缀，不宜喧宾夺主 |

### 推荐整体设计策略
1. **首屏**：水墨山水视差背景 + 品牌名"隐山"书法体淡入 + 一座若隐若现的山峰 SVG
2. **滚动叙事**：用户下滚时，山峰逐渐清晰 → 云雾散开 → 产品出现（如香薰炉、精油瓶）
3. **产品展示区**：每款产品配一幅小品画（梅/兰/竹/菊对应不同香型）
4. **购买/CTA**：朱砂红印章式按钮，"结缘"而非"购买"
5. **全局氛围**：宣纸纹理背景 + 侧边竹影 + 鼠标跟随的淡淡墨迹尾迹

---

## 七、技术栈建议

| 层 | 推荐方案 |
|----|---------|
| 动画引擎 | GSAP (ScrollTrigger) + 纯 CSS @keyframes |
| 图形 | 内联 SVG（避免额外请求，可动态着色） |
| 框架 | 任意（方案纯 CSS/SVG，框架无关） |
| 字体加载 | Google Fonts + `font-display: swap` |
| 性能 | SVG `will-change` 仅用于动画元素，`prefers-reduced-motion` 降级 |

---

## 八、关键搜索 URL

1. GitHub Ink Wash 项目源码：https://github.com/smart-developer1791/go-fiber-auth-inkwash
2. GitHub chinese-style 话题：https://github.com/topics/chinese-style
3. 优设网 新中式标签：https://www.uisdc.com/tag/新中式
4. 花西子官网：https://florasis.com
5. 故宫博物院：https://dpm.org.cn/Home.html
6. CodePen chinese ink 搜索：https://codepen.io/search/pens?q=chinese+ink+animation
7. GitHub CSS animation 代码搜索：https://github.com/search?q=chinese+ink+CSS+animation&type=code
