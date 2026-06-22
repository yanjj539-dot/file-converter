export type CivicAction = {
  slug: string
  title: string
  subtitle: string
  collection: string
  type: string
  location: string
  image: string
  tone: string
  summary: string
  impact: string
  metrics: Array<{ label: string; value: string }>
  specs: Array<{ label: string; value: string }>
  modules: string[]
  process: string[]
  detail: string
}

export type JournalPost = {
  slug: string
  title: string
  category: string
  date: string
  excerpt: string
  image: string
  body: string[]
}

export const navItems = [
  { label: '行动目录', to: '/actions' },
  { label: '可持续专题', to: '/sustainability' },
  { label: 'Journal', to: '/journal' },
  { label: 'About', to: '/about' }
]

export const collections = [
  '城市环保',
  '低碳生活',
  '碳环保',
  '绿色出行',
  '垃圾分类',
  '循环材料',
  '公共空间环保改造',
  '校园 / 社区低碳行动'
]

export const actions: CivicAction[] = [
  {
    slug: 'cooling-corridor',
    title: '城市降温廊道',
    subtitle: '为热岛街区植入遮阴、雾化回收水和可维护绿荫节点。',
    collection: '公共空间环保改造',
    type: '空间改造',
    location: '老城街巷 / 公交接驳点',
    image: '/images/hero-civic-installation.png',
    tone: 'moss',
    summary: '把被暴晒的通勤路径改造成可停留、可维护、可被社区共管的低碳公共空间。',
    impact: '降低夏季步行热暴露，增加非机动车与步行意愿，推动绿色出行替代短距离驾车。',
    metrics: [
      { label: '覆盖距离', value: '1.8km' },
      { label: '共管志愿者', value: '86人' },
      { label: '年减排估算', value: '42t' }
    ],
    specs: [
      { label: '模块', value: '遮阴构架 / 雨水箱 / 耐旱绿植 / 微型监测' },
      { label: '周期', value: '45天完成首段部署' },
      { label: '维护', value: '社区认领 + 月度巡检' }
    ],
    modules: ['轻量钢构遮阴', '雨水回收补灌', '地表温度监测', '可替换植物槽'],
    process: ['测绘热暴露路段', '共创停留节点', '安装模块构件', '开放志愿巡检'],
    detail: '城市降温廊道不是单纯绿化工程，而是把热岛数据、慢行系统和社区协作放进同一个街区装置。每个节点都能被拆卸、补种、清洁和复用，适合从小尺度试点扩展到片区网络。'
  },
  {
    slug: 'material-return-station',
    title: '循环材料回收站',
    subtitle: '为社区建立可追踪、可展示、可兑换的材料回流系统。',
    collection: '循环材料',
    type: '材料系统',
    location: '社区入口 / 商业中庭',
    image: '/images/action-system-render.png',
    tone: 'clay',
    summary: '用产品目录式的分类模块，让纸、塑料、金属和旧织物从“扔掉”变成“回流”。',
    impact: '提升居民分类准确率，降低混投污染，让可再生材料进入本地公益再制造链路。',
    metrics: [
      { label: '日均回流', value: '320kg' },
      { label: '分类准确率', value: '91%' },
      { label: '兑换基金', value: '12万' }
    ],
    specs: [
      { label: '模块', value: '称重抽屉 / 标签识别 / 公益积分 / 材料样本墙' },
      { label: '周期', value: '28天搭建标准站' },
      { label: '维护', value: '物业协作 + 运营志愿者' }
    ],
    modules: ['称重分类抽屉', '回收去向屏', '积分兑换面板', '再生材料样本'],
    process: ['定义材料清单', '安装标准柜体', '绑定公益账户', '月度公开材料去向'],
    detail: '回收站采用克制的产品化语言，不把垃圾分类做成标语墙，而是让每一种材料都拥有清晰路径、实时重量和可验证去向。居民看到的是一套公共材料基础设施。'
  },
  {
    slug: 'bike-first-campus',
    title: '校园骑行优先计划',
    subtitle: '把校园短途出行改造成低碳、安静、有秩序的日常系统。',
    collection: '校园 / 社区低碳行动',
    type: '绿色出行',
    location: '大学校园 / 中学片区',
    image: '/images/community-action-editorial.png',
    tone: 'civic',
    summary: '以骑行停车、修理台、路线标识和低碳积分，把校园内燃油短途替换为自行车与步行。',
    impact: '减少校内短途机动车使用，降低噪声与拥堵，形成可复制的校园低碳行动模型。',
    metrics: [
      { label: '新增车位', value: '640个' },
      { label: '修理台', value: '12组' },
      { label: '参与班级', value: '74个' }
    ],
    specs: [
      { label: '模块', value: '骑行环线 / 维修岛 / 碳积分 / 安全提示' },
      { label: '周期', value: '一学期完成试运行' },
      { label: '维护', value: '学生社团 + 后勤部门' }
    ],
    modules: ['骑行路线系统', '公共修理台', '低碳积分卡', '夜间反光标识'],
    process: ['绘制校园慢行图', '设定停车点', '组织维修志愿队', '发布月度低碳榜'],
    detail: '校园骑行优先计划把低碳生活从倡议变成基础设施。它既服务日常通勤，也给学生社团提供长期运营议题，让环保行动不再停留于一次性活动。'
  },
  {
    slug: 'sorting-lab',
    title: '垃圾分类街区实验室',
    subtitle: '用真实材料样本、称重数据和居民反馈重做分类教育。',
    collection: '垃圾分类',
    type: '公共教育',
    location: '街道服务中心 / 菜市场旁',
    image: '/images/engineering-linework.png',
    tone: 'moss',
    summary: '一套面向成年人、商户和青少年的街区分类实验台，强调证据、对照和本地去向。',
    impact: '让居民理解错误分类的成本，并通过持续反馈降低湿垃圾污染和可回收物损耗。',
    metrics: [
      { label: '覆盖住户', value: '4200户' },
      { label: '误投下降', value: '36%' },
      { label: '课程场次', value: '58场' }
    ],
    specs: [
      { label: '模块', value: '材料实验台 / 分类问诊 / 数据墙 / 商户手册' },
      { label: '周期', value: '21天完成快闪部署' },
      { label: '维护', value: '街道 + 环保组织' }
    ],
    modules: ['材料样本抽屉', '误投诊断卡', '称重数据墙', '商户分类清单'],
    process: ['收集本地误投样本', '组织街区问诊', '建立周反馈', '沉淀分类手册'],
    detail: '街区实验室避免口号化教育，以真实样本和可触摸材料建立认知。居民可以看到混投如何影响后端处理，也能看到正确分类带来的可量化变化。'
  },
  {
    slug: 'low-carbon-market',
    title: '低碳市集补给站',
    subtitle: '把无包装补给、旧物交换和公益维修整合为周末城市服务。',
    collection: '低碳生活',
    type: '生活方式',
    location: '公园边界 / 社区广场',
    image: '/images/action-system-render.png',
    tone: 'clay',
    summary: '用高质量摊位系统承载补充装、修理、交换和低碳饮食，让公益活动具备长期运营感。',
    impact: '减少一次性包装使用，延长日用品生命周期，并为本地小店和志愿者建立协作场景。',
    metrics: [
      { label: '减少包装', value: '18k件' },
      { label: '维修物件', value: '1460件' },
      { label: '合作摊主', value: '39个' }
    ],
    specs: [
      { label: '模块', value: '补给台 / 维修桌 / 旧物架 / 公益收银' },
      { label: '周期', value: '14天形成一期活动' },
      { label: '维护', value: '社群排班 + 商户共建' }
    ],
    modules: ['可折叠补给台', '工具维修桌', '旧物交换架', '公益基金收银'],
    process: ['征集合作摊主', '制定物品规则', '搭建周末市集', '公开减量账本'],
    detail: '低碳市集不是热闹的临时摊位，而是一套可以重复部署的城市补给系统。它让低碳生活具备服务品质，同时保留公益行动的开放性。'
  },
  {
    slug: 'carbon-budget-club',
    title: '社区碳账本共学会',
    subtitle: '把家庭、楼栋和小店的低碳行为转化为共享账本和微型基金。',
    collection: '碳环保',
    type: '数据行动',
    location: '社区议事厅 / 线上共学',
    image: '/images/community-action-editorial.png',
    tone: 'civic',
    summary: '用可读的碳账本方法连接节能、绿色出行、旧物循环和公共空间共建。',
    impact: '让碳环保脱离抽象概念，成为居民可协作、可比较、可投入公益基金的日常实践。',
    metrics: [
      { label: '家庭样本', value: '560户' },
      { label: '共学周期', value: '8周' },
      { label: '公益基金', value: '9.4万' }
    ],
    specs: [
      { label: '模块', value: '家庭碳表 / 楼栋看板 / 行动积分 / 基金投票' },
      { label: '周期', value: '两个月一轮' },
      { label: '维护', value: '居民代表 + 专业顾问' }
    ],
    modules: ['家庭碳表', '楼栋行动看板', '积分规则', '公益基金投票'],
    process: ['建立基础样本', '每周记录行动', '楼栋公开复盘', '投票资助微改造'],
    detail: '社区碳账本把低碳生活转化为可讨论的公共数据。它不追求复杂精算，而是帮助居民看见选择之间的关系，并把节省出来的资源重新投入社区。'
  }
]

export const journalPosts: JournalPost[] = [
  {
    slug: 'street-heat-observation',
    title: '一条暴晒街道的降温记录',
    category: 'Field Note',
    date: '2026.06',
    excerpt: '从热成像测绘到第一段遮阴构架完成，街区居民如何参与一条城市降温廊道。',
    image: '/images/hero-civic-installation.png',
    body: [
      '项目组没有从设计图纸开始，而是先在午后最热的两个小时里记录路面、墙面和公交站台的温度。居民指出真正难走的不是最长的路，而是没有阴影和停留点的短路段。',
      '降温节点采用可拆卸构件和耐旱绿植，先做 180 米样段，再用地表温度和停留人数判断下一段位置。这个过程让街区改造具备可见证据。',
      '最重要的改变来自维护机制。每个植物槽都有认领人，雨水箱有月度巡检记录，公共空间不再只是建成品，而是一件被共同照看的城市装置。'
    ]
  },
  {
    slug: 'material-library',
    title: '把回收物做成材料图书馆',
    category: 'Material',
    date: '2026.05',
    excerpt: '可回收材料不只需要被分类，也需要被看见、触摸和重新命名。',
    image: '/images/action-system-render.png',
    body: [
      '社区回收站最常见的问题是居民不知道材料去了哪里。我们把塑料、纸张、金属和织物的处理样本放在同一面材料墙上，让回收路径变成可观察的公共知识。',
      '材料图书馆没有使用过度教育化的图形，而是以编号、重量、去向和再制造样本构成信息层级。它更像一个小型产品展厅，而不是垃圾分类宣传栏。',
      '当居民知道一袋旧衣物会进入哪个再生链路，混投率明显下降。设计在这里承担的是信任建设，而不是装饰。'
    ]
  },
  {
    slug: 'campus-bike-loop',
    title: '校园里的第一条安静环线',
    category: 'Mobility',
    date: '2026.04',
    excerpt: '骑行优先不只是增加车位，而是重排校园的移动秩序。',
    image: '/images/community-action-editorial.png',
    body: [
      '调研显示，很多短途机动车并不是因为距离远，而是因为骑行停车点混乱、夜间路线不清晰、维修不方便。校园低碳行动必须先解决这些日常摩擦。',
      '第一条骑行环线把停车、维修、照明和积分放在一个系统里。学生社团负责周末维修台，后勤负责硬件巡检，院系负责低碳积分传播。',
      '这套机制最大的价值在于可复制。每个新校区只需要重新测绘动线和停车需求，就能复用同一套运营框架。'
    ]
  },
  {
    slug: 'carbon-ledger',
    title: '社区碳账本为什么要简单',
    category: 'Research',
    date: '2026.03',
    excerpt: '低碳数据如果无法进入居民议事，就很难成为公益行动。',
    image: '/images/engineering-linework.png',
    body: [
      '碳账本不适合一开始就做成复杂仪表盘。居民需要先理解哪些行为会被记录，记录结果如何影响公共基金，哪些数据只看趋势不做精确比较。',
      '我们把家庭记录压缩成四类：出行、能源、材料循环和共享行动。每周只更新一次，楼栋只公开汇总数据，减少隐私压力。',
      '当数据能进入社区投票，低碳行为才从个人选择变成公共资源。账本越清楚，议事越容易形成行动。'
    ]
  }
]

export const sustainabilityPrinciples = [
  {
    title: '材料回流',
    text: '所有装置优先使用可维护、可拆解、可替换的构件，并记录材料来源与后续去向。'
  },
  {
    title: '低碳运营',
    text: '行动计划从建设阶段延伸到日常排班、巡检、能耗、交通和资金公开。'
  },
  {
    title: '公共共管',
    text: '每个项目都设置居民、学校、商户或志愿组织可参与的长期共管节点。'
  }
]
