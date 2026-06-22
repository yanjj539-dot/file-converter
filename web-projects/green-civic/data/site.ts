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

export type EcoMaterial = {
  code: string
  name: string
  category: string
  source: string
  summary: string
  color: string
  carbon: string
  cycle: string
  maintenance: string
  applications: string[]
  metrics: Array<{ label: string; value: string }>
}

export type CivicToolkit = {
  index: string
  title: string
  summary: string
  metric: string
  modules: string[]
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
  '环保材料库',
  '雨洪管理',
  '修复与再利用',
  '生物基材料',
  '公共空间环保改造',
  '校园 / 社区低碳行动'
]

export const ecoMaterials: EcoMaterial[] = [
  {
    code: 'M-01',
    name: '再生铝型材',
    category: '循环金属',
    source: '拆建废铝 / 旧交通设施',
    summary: '适合遮阴构架、骑行修理岛和可拆卸导视系统，强度稳定，适合反复拆装与替换。',
    color: '#c9d1c9',
    carbon: '约 72% 制造碳降低',
    cycle: '8-15 年构件周期',
    maintenance: '季度紧固检查',
    applications: ['降温廊道', '骑行修理台', '可替换导视'],
    metrics: [
      { label: '再生含量', value: '78%' },
      { label: '回收次数', value: '多次' }
    ]
  },
  {
    code: 'M-02',
    name: '回收塑木板',
    category: '复合板材',
    source: '回收塑料 / 木粉边角料',
    summary: '用于社区座椅、旧物交换架和植物箱外壳，耐候性高，能降低公共设施频繁更换。',
    color: '#b58c70',
    carbon: '减少一次性木材消耗',
    cycle: '10-12 年户外周期',
    maintenance: '半年清洁与边角巡检',
    applications: ['社区座椅', '旧物交换架', '雨水植物箱'],
    metrics: [
      { label: '塑料回流', value: '64kg/组' },
      { label: '防腐涂料', value: '低需求' }
    ]
  },
  {
    code: 'M-03',
    name: '织物再制吸音毡',
    category: '再生织物',
    source: '旧衣回收 / 校服边角料',
    summary: '可放入低碳市集、校园修理岛和临时议事空间，兼具吸音、展示和材料教育属性。',
    color: '#d8c7aa',
    carbon: '旧衣不进入焚烧链路',
    cycle: '3-5 年室内外混合',
    maintenance: '可替换面层',
    applications: ['市集摊位', '材料图书馆', '共学空间'],
    metrics: [
      { label: '织物回流', value: '420kg/年' },
      { label: '噪声缓冲', value: '-6dB' }
    ]
  },
  {
    code: 'M-04',
    name: '透水再生骨料铺装',
    category: '雨洪材料',
    source: '建筑拆除骨料 / 再生玻璃',
    summary: '用于热岛街区的慢行道和口袋广场，降低积水、增强渗透，并改善夏季地表热感。',
    color: '#c7cfc3',
    carbon: '减少新采骨料',
    cycle: '6-10 年局部维护',
    maintenance: '年度孔隙清理',
    applications: ['透水步道', '公交站前场', '校园慢行环线'],
    metrics: [
      { label: '渗透率', value: '28%' },
      { label: '积水下降', value: '41%' }
    ]
  },
  {
    code: 'M-05',
    name: '生物炭种植基质',
    category: '生物基材料',
    source: '园林枝条 / 农业废弃物',
    summary: '适合雨水花园、耐旱植物槽和社区共管绿岛，提升土壤持水与碳固定能力。',
    color: '#8f8a72',
    carbon: '长期锁碳基质',
    cycle: '5 年补充一次',
    maintenance: '季节性补肥补水',
    applications: ['雨水花园', '降温植物槽', '校园菜园'],
    metrics: [
      { label: '持水提升', value: '32%' },
      { label: '有机废物利用', value: '1.2t' }
    ]
  },
  {
    code: 'M-06',
    name: '可拆卸雨水模块箱',
    category: '雨洪管理',
    source: '再生塑料箱体 / 标准连接件',
    summary: '用于屋檐、广场和校园绿带旁，收集雨水补灌植物箱，减少自来水灌溉。',
    color: '#b9cfce',
    carbon: '降低灌溉能耗',
    cycle: '8 年箱体周期',
    maintenance: '月度滤网清理',
    applications: ['雨水补灌', '降温廊道', '校园绿带'],
    metrics: [
      { label: '年节水', value: '35t' },
      { label: '维护时长', value: '18min/月' }
    ]
  },
  {
    code: 'M-07',
    name: '低碳石灰基涂层',
    category: '表面材料',
    source: '矿物基涂料 / 可维护面层',
    summary: '用于老旧墙面、社区分类室和遮阴构架背板，颜色克制，反射热量且便于局部修补。',
    color: '#eee8d8',
    carbon: '低 VOC / 可修补',
    cycle: '4 年维护周期',
    maintenance: '局部补刷',
    applications: ['街角墙面', '分类实验室', '导视背板'],
    metrics: [
      { label: '表面降温', value: '3-5°C' },
      { label: 'VOC', value: '低' }
    ]
  },
  {
    code: 'M-08',
    name: '菌丝体缓冲板',
    category: '生物基材料',
    source: '农业副产物 / 菌丝体生长材料',
    summary: '适合临时展陈、材料教育和社区共学空间，轻量、可降解，强调短周期活动后的去向。',
    color: '#e4d8bd',
    carbon: '生物基替代泡沫',
    cycle: '1-3 年室内应用',
    maintenance: '保持干燥',
    applications: ['材料展陈', '共学隔断', '临时市集'],
    metrics: [
      { label: '可降解', value: '可控' },
      { label: '重量降低', value: '45%' }
    ]
  }
]

export const materialPassportFields = [
  '来源批次',
  '再生含量',
  '适用场景',
  '维护周期',
  '拆卸方法',
  '下一站去向'
]

export const civicToolkits: CivicToolkit[] = [
  {
    index: '01',
    title: '材料护照',
    summary: '给每一种环保材料建立来源、维护、替换和回流路径，让公共装置可以被追踪。',
    metric: '6 项字段',
    modules: ['来源批次', '再生含量', '维护周期', '拆卸去向']
  },
  {
    index: '02',
    title: '街区行动箱',
    summary: '把活动桌、称重器、导视牌、工具包和数据表收纳为可移动的公益行动组件。',
    metric: '4 小时部署',
    modules: ['折叠桌架', '称重模块', '低碳贴纸', '志愿排班卡']
  },
  {
    index: '03',
    title: '共管账本',
    summary: '把志愿排班、材料流向、维修记录和减排估算公开，让行动可以长期被维护。',
    metric: '每月复盘',
    modules: ['维护记录', '材料流向', '基金投票', '公开看板']
  },
  {
    index: '04',
    title: '低碳课程包',
    summary: '为校园和社区提供可复用的材料课、分类课、骑行课和碳账本共学课。',
    metric: '8 周周期',
    modules: ['材料样本', '任务卡', '教师手册', '居民反馈表']
  }
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
  },
  {
    slug: 'permeable-cool-pavement',
    title: '透水降温铺装样段',
    subtitle: '用再生骨料、浅色涂层和雨水补灌重做街角热岛地面。',
    collection: '雨洪管理',
    type: '材料系统',
    location: '公交站前场 / 校园慢行路',
    image: '/images/engineering-linework.png',
    tone: 'moss',
    summary: '把积水、热岛和慢行安全放在同一段铺装样本里，用数据决定是否扩展到整条街。',
    impact: '提升雨水渗透，降低夏季地表温度，并减少新采骨料在公共空间改造中的使用。',
    metrics: [
      { label: '渗透提升', value: '28%' },
      { label: '地表降温', value: '4.6°C' },
      { label: '再生骨料', value: '62%' }
    ],
    specs: [
      { label: '模块', value: '透水基层 / 再生骨料面层 / 雨水花园边带' },
      { label: '周期', value: '18天完成 120m² 样段' },
      { label: '维护', value: '年度孔隙清理 + 雨季巡检' }
    ],
    modules: ['再生骨料面层', '低碳浅色涂层', '雨水花园边带', '地表温度记录点'],
    process: ['测绘积水点', '铺设样段', '雨季观察渗透', '复盘扩展边界'],
    detail: '透水降温铺装样段把城市环保材料放到可验证的街角实验里。它不追求一次性大工程，而是通过小面积铺设、温度记录、雨季观察和居民反馈决定下一步扩展。'
  },
  {
    slug: 'refill-repair-library',
    title: '社区修复与补充装图书馆',
    subtitle: '把补充装、维修工具、旧物借用和材料样本合并成低碳生活服务台。',
    collection: '修复与再利用',
    type: '生活方式',
    location: '社区客厅 / 青年中心',
    image: '/images/action-system-render.png',
    tone: 'clay',
    summary: '让低碳生活拥有像图书馆一样稳定的开放时间、借还规则和可维护物品清单。',
    impact: '减少一次性包装，延长日用品寿命，并把闲置工具从个人柜子转化为社区共享资产。',
    metrics: [
      { label: '补充装', value: '12类' },
      { label: '共享工具', value: '96件' },
      { label: '包装减量', value: '2.8t' }
    ],
    specs: [
      { label: '模块', value: '补充装架 / 工具墙 / 维修预约 / 旧物借用表' },
      { label: '周期', value: '30天建立首个服务点' },
      { label: '维护', value: '馆员排班 + 商户补给' }
    ],
    modules: ['补充装分装架', '共享工具墙', '维修预约台', '材料样本抽屉'],
    process: ['整理高频物品', '建立借还规则', '招募修复志愿者', '公开减量数据'],
    detail: '社区修复与补充装图书馆把环保从购买选择变成公共服务。居民不需要每次重新寻找修理、补充装或借用渠道，只要进入一个稳定开放、规则清晰的社区节点。'
  },
  {
    slug: 'campus-compost-station',
    title: '校园厨余堆肥站',
    subtitle: '把食堂厨余、社团课程和校园花园连接成可见的有机循环。',
    collection: '生物基材料',
    type: '垃圾分类',
    location: '学校食堂后场 / 校园菜园',
    image: '/images/community-action-editorial.png',
    tone: 'civic',
    summary: '用封闭式堆肥箱、气味控制和课程排班，让厨余分类成为学生能参与的材料循环。',
    impact: '减少湿垃圾外运，把校园厨余转化为土壤改良材料，并形成可观察的低碳课程。',
    metrics: [
      { label: '厨余处理', value: '1.6t/月' },
      { label: '课程参与', value: '38班' },
      { label: '基质产出', value: '420kg' }
    ],
    specs: [
      { label: '模块', value: '封闭堆肥箱 / 生物炭基质 / 气味记录 / 课程卡' },
      { label: '周期', value: '6周形成首批基质' },
      { label: '维护', value: '后勤 + 社团轮值' }
    ],
    modules: ['厨余称重台', '封闭堆肥箱', '生物炭混拌桶', '校园花园回用区'],
    process: ['设定收集时间', '记录厨余重量', '混拌生物炭', '回用于校园种植'],
    detail: '校园厨余堆肥站把垃圾分类、生物基材料和生态教育放在同一条链路里。学生看到厨余从食堂进入堆肥箱，再回到校园花园，环保不再只是抽象的分类要求。'
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
  },
  {
    slug: 'permeable-material-samples',
    title: '透水铺装样本如何进入街区',
    category: 'Material',
    date: '2026.02',
    excerpt: '一块铺装样本要同时回答渗水、降温、维护和材料来源，而不是只看表面效果。',
    image: '/images/engineering-linework.png',
    body: [
      '透水材料在街区里失败，往往不是因为材料本身，而是因为没有明确维护周期。孔隙堵塞、边界沉降和清理责任都需要在部署前写进材料护照。',
      '我们把样段拆成基层、面层、边带和监测点四层，每层都记录材料来源和替换方法。这样居民看到的不只是新地面，而是一套可维护的城市环保系统。',
      '最终是否扩展到整条街，不由设计偏好决定，而由雨季积水记录、夏季地表温度和慢行安全反馈共同决定。'
    ]
  },
  {
    slug: 'textile-felt-reuse',
    title: '旧衣物再制毡的社区实验',
    category: 'Reuse',
    date: '2026.01',
    excerpt: '旧衣回收如果只停在捐赠箱，很难建立信任；变成可触摸材料后，居民更愿意分类。',
    image: '/images/action-system-render.png',
    body: [
      '社区旧衣回收经常遇到两个问题：居民不知道去向，运营方很难解释价值。再制吸音毡把回收结果变成可看、可摸、可安装的材料样本。',
      '第一批样本被用于低碳市集摊位背板和共学空间吸音墙。每块板都带有旧衣来源、重量、加工批次和后续替换方式。',
      '当回收物重新进入公共空间，居民对材料循环的理解会从“处理垃圾”转向“共同生产城市构件”。'
    ]
  },
  {
    slug: 'rainwater-module-maintenance',
    title: '一个雨水模块箱的维护账本',
    category: 'Operations',
    date: '2025.12',
    excerpt: '雨水回收装置的价值不在安装当天，而在滤网、补灌和巡检被长期记录之后。',
    image: '/images/hero-civic-installation.png',
    body: [
      '雨水模块箱看起来简单，但真正影响使用寿命的是滤网清理、溢流检查和植物补灌节奏。我们把这些事项写成月度账本，让志愿者可以接手。',
      '账本只保留必要字段：日期、天气、滤网状态、补灌量、异常照片和下次任务。它不追求复杂数字，而是让维护责任透明。',
      '这套方法后来被复制到校园绿带和社区降温廊道，成为小型雨洪设施持续运行的基础。'
    ]
  },
  {
    slug: 'material-passport-method',
    title: '低碳材料护照应该写什么',
    category: 'Method',
    date: '2025.11',
    excerpt: '环保材料不只需要被采购，还需要拥有来源、维护、拆卸和下一站去向。',
    image: '/images/engineering-linework.png',
    body: [
      '材料护照不是给专业人士看的长表格，而是帮助社区知道某个构件为什么被选用、如何维护、何时替换、替换后去哪里。',
      '最小可用版本只需要六项：来源批次、再生含量、适用场景、维护周期、拆卸方法和下一站去向。字段越少，越容易被长期执行。',
      '当材料护照进入行动详情页和现场标签，公共空间里的每个构件都能成为一次环保教育。'
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
