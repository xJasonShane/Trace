<div align="center">
  <img src="static/logo.png" alt="拾光手账 Logo" width="120" height="120">

  # 拾光手账 · Trace

  **用脚步丈量世界，用手账记录时光**

  一款基于地图的生活手账应用，记录您到访的每一个地点与每一段美好时光

  [![UniApp](https://img.shields.io/badge/UniApp-3.x-2B9939?logo=wechat&logoColor=white)](https://uniapp.dcloud.net.cn/)
  [![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
  [![Pinia](https://img.shields.io/badge/Pinia-2.x-FFD859?logo=pinia&logoColor=white)](https://pinia.vuejs.org/)
  [![Sass](https://img.shields.io/badge/Sass-1.x-CC6699?logo=sass&logoColor=white)](https://sass-lang.com/)
  [![License](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](#许可证)
  [![Version](https://img.shields.io/badge/version-0.0.1-orange.svg)](#版本历史)

</div>

---

## 📖 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [支持平台](#支持平台)
- [快速开始](#快速开始)
  - [环境要求](#环境要求)
  - [方式一：HBuilderX（推荐）](#方式一hbuilderx推荐)
  - [方式二：CLI 命令行](#方式二cli-命令行)
  - [项目结构](#项目结构)
- [使用指南](#使用指南)
  - [地图视图](#地图视图)
  - [创建手账](#创建手账)
  - [浏览与搜索](#浏览与搜索)
  - [数据统计](#数据统计)
  - [主题与设置](#主题与设置)
- [设计规范](#设计规范)
- [数据模型](#数据模型)
- [配置说明](#配置说明)
- [常见问题](#常见问题)
- [路线图](#路线图)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 🌟 项目简介

**拾光手账 (Trace)** 是一款以**地图为核心**的生活记录应用。它将您的足迹与手账紧密结合，让每一次出行、每一个到访的地点都能留下可追溯的美好记忆。

无论是旅行途中的风景、街角偶然发现的咖啡店，还是每日通勤路上的小确幸，都可以通过拾光手账以图文并茂的方式记录下来，并在地图上直观地呈现您的生活轨迹。

### 核心理念

- 🗺️ **地图优先** — 以空间视角组织记忆，让记录有迹可循
- 📔 **手账为体** — 丰富的图文表达，还原生活温度
- 🔒 **本地优先** — 数据存储在设备本地，隐私安全可控
- 🎨 **温暖设计** — 柔和的视觉风格，愉悦的使用体验

---

## ✨ 功能特性

### 🗺️ 地图视图

| 功能 | 说明 |
|------|------|
| 高德地图集成 | App 端集成高德地图 SDK，提供流畅的地图体验 |
| 地点标记 | 所有记录地点以标记形式展示，一目了然 |
| 地点详情 | 点击标记查看地点信息与关联手账列表 |
| 实时定位 | 一键回到当前位置，快速记录身边事物 |
| 智能去重 | 按名称 + 坐标智能匹配，避免重复创建地点 |
| 访问统计 | 自动记录地点访问次数与最近访问时间 |

### 📝 手账管理

| 功能 | 说明 |
|------|------|
| 完整 CRUD | 支持创建、编辑、删除手账记录 |
| 多图上传 | 支持多张照片，内置图片裁剪工具 |
| 心情表达 | 丰富的 emoji 心情选择，记录当下感受 |
| 四维评分 | 环境、景色、交通、体验四维度独立评分 |
| 综合评分 | 自动计算四维度平均值，直观反映整体体验 |
| 自定义标签 | 自由添加标签，灵活分类管理 |
| 智能分组 | 按日期自动分组（今天 / 昨天 / 本周 / 更早） |
| 条件筛选 | 支持按最近记录、含照片等条件快速筛选 |

### 📊 数据统计

| 功能 | 说明 |
|------|------|
| 月度趋势 | 最近 12 个月记录趋势可视化 |
| 心情分布 | 各类心情占比统计与可视化 |
| 连续打卡 | 自动追踪最长连续记录天数 |
| 本月概览 | 本月新增手账、地点、照片统计 |
| 照片统计 | 累计上传照片总数统计 |

### 🔍 智能搜索

- **多维度搜索**：支持标题、内容、地点名、标签全字段匹配
- **实时响应**：输入即时反馈，搜索结果秒级呈现
- **高亮匹配**：搜索结果直观展示匹配位置

### 👤 个人中心

- **资料管理**：昵称、头像、简介、城市、生日个性化设置
- **数据概览**：手账数、地点数、照片数一目了然
- **设置中心**：通知开关、主题切换、数据备份与恢复

### 🎨 主题切换

- **双模式支持**：浅色 / 深色模式自由切换
- **统一管理**：通过主题 Mixin + CSS 变量统一管控
- **自动适配**：文字、图标、背景等 UI 元素智能适配
- **丝滑过渡**：模式切换附带平滑过渡动画

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [UniApp](https://uniapp.dcloud.net.cn/) | 3.x | 跨平台开发框架，一套代码多端运行 |
| [Vue 3](https://vuejs.org/) | 3.x | 渐进式 JavaScript 框架，Composition API |
| [Pinia](https://pinia.vuejs.org/) | ^2.0.36 | Vue 官方状态管理库，模块化数据存储 |
| [Sass](https://sass-lang.com/) | ^1.62.0 | CSS 预处理器，变量与嵌套增强 |
| 高德地图 SDK | - | App 端地图与定位服务 |

---

## 📱 支持平台

| 平台 | 标识 | 说明 |
|------|------|------|
| 微信小程序 | `mp-weixin` | ✅ 完整支持 |
| 支付宝小程序 | `mp-alipay` | ✅ 完整支持 |
| 百度小程序 | `mp-baidu` | ✅ 完整支持 |
| 头条小程序 | `mp-toutiao` | ✅ 完整支持 |
| App (iOS) | `app-plus` | ✅ 集成高德地图与定位 |
| App (Android) | `app-plus` | ✅ 集成高德地图与定位 |
| H5 | `h5` | ✅ 浏览器运行（地图功能受限） |
| 快应用 | `quickapp` | ⚠️ 基础支持 |

> 💡 **提示**：地图功能在 App 端体验最佳；H5 端可使用基础手账管理功能。

---

## 🚀 快速开始

### 环境要求

| 依赖 | 最低版本 | 说明 |
|------|----------|------|
| Node.js | >= 14.0.0 | CLI 方式需要 |
| npm | >= 6.0.0 | 包管理器 |
| HBuilderX | 最新版本 | 推荐使用的 IDE |
| 微信开发者工具 | 最新版 | 运行微信小程序需安装 |

### 方式一：HBuilderX（推荐）

HBuilderX 是 DCloud 官方 IDE，对 uni-app 项目提供最佳支持，开箱即用。

**步骤：**

1. **安装 HBuilderX**
   - 前往 [HBuilderX 官网](https://www.dcloud.io/hbuilderx.html) 下载安装
   - 安装时选择「App 开发版」以获得完整插件支持

2. **获取项目代码**
   ```bash
   git clone https://github.com/your-username/trace.git
   cd trace
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **导入项目**
   - 打开 HBuilderX
   - 选择「文件」→「导入」→「从本地目录导入」
   - 选择项目根目录 `trace/`

5. **运行项目**

   | 目标平台 | 操作路径 |
   |----------|----------|
   | 微信小程序 | 运行 → 运行到小程序模拟器 → 微信开发者工具 |
   | App (Android) | 运行 → 运行到手机或模拟器 → 运行到 Android App 基座 |
   | App (iOS) | 运行 → 运行到手机或模拟器 → 运行到 iOS App 基座 |
   | H5 | 运行 → 运行到浏览器 → 选择浏览器 |
   | 支付宝小程序 | 运行 → 运行到小程序模拟器 → 支付宝小程序开发者工具 |

6. **配置地图 Key（App 端必需）**

   首次运行 App 端前，请参考 [配置说明 - 地图配置](#地图配置) 配置高德地图 Key，否则地图功能无法使用。

### 方式二：CLI 命令行

如果您习惯使用命令行工具，可以使用 `@dcloudio/uni-cli` 进行开发。

**步骤：**

1. **安装 uni-app CLI（全局）**
   ```bash
   npm install -g @dcloudio/uni-cli
   ```

2. **克隆并安装依赖**
   ```bash
   git clone https://github.com/your-username/trace.git
   cd trace
   npm install
   ```

3. **开发模式运行**

   ```bash
   # 微信小程序
   npm run dev:mp-weixin

   # H5
   npm run dev:h5

   # App
   npm run dev:app-plus

   # 支付宝小程序
   npm run dev:mp-alipay
   ```

4. **生产构建**

   ```bash
   # 微信小程序
   npm run build:mp-weixin

   # H5
   npm run build:h5

   # App
   npm run build:app-plus
   ```

> ⚠️ **注意**：CLI 方式需要在 `package.json` 中配置对应的脚本。如使用 HBuilderX 方式可忽略此步骤。

### 验证安装

成功运行后，您将看到：

- **首页（地图视图）**：显示地图界面与底部 Tab 导航
- **手账页**：显示空状态提示，可点击新建手账
- **统计页**：显示零数据状态
- **我的页**：显示默认用户资料

### 项目结构

```
Trace/
├── components/           # 可复用组件
│   ├── DeleteModal.vue   # 删除确认弹窗
│   ├── EmptyState.vue    # 空状态组件
│   ├── Icon.vue          # SVG 图标组件
│   ├── ImageCropper.vue  # 图片裁剪组件
│   ├── MoodSelect.vue    # 心情选择器
│   ├── PhotoUpload.vue   # 照片上传组件
│   ├── StarRating.vue    # 星级评分组件
│   └── TabBar.vue        # 底部导航栏
├── mixins/               # Vue Mixin
│   └── theme.js          # 主题切换 Mixin（浅色/深色模式）
├── pages/                # 页面目录
│   ├── index/            # 首页（地图视图）
│   ├── journal/          # 手账列表
│   ├── journal-detail/   # 手账详情
│   ├── journal-edit/     # 编辑/新建手账
│   ├── location-detail/  # 地点详情
│   ├── profile/          # 个人中心
│   ├── profile-edit/     # 编辑资料
│   ├── search/           # 搜索页
│   └── stats/            # 统计页
├── store/                # Pinia 状态管理
│   ├── journal.js        # 手账数据 Store
│   ├── location.js       # 地点数据 Store
│   └── profile.js        # 用户资料 Store
├── utils/                # 工具函数
│   ├── date.js           # 日期处理
│   ├── image.js          # 图片处理
│   └── storage.js        # 本地存储封装
├── static/               # 静态资源（图片、图标等）
├── App.vue               # 应用入口组件
├── main.js               # 主入口文件（Pinia 装配）
├── pages.json            # 页面路由配置
├── manifest.json         # 应用配置与平台参数
├── uni.scss              # 全局样式变量
└── uni.promisify.adaptor.js  # Promise 化适配器
```

---

## 📖 使用指南

### 地图视图

地图视图是应用的首页，也是您探索记录的入口。

**操作说明：**

1. **查看地点**：在地图上滑动浏览，彩色标记即为您记录过的地点
2. **查看详情**：点击地图标记，弹出地点信息卡片，再次点击进入地点详情页
3. **定位当前位置**：点击右下角定位按钮，地图将移动到您的当前位置
4. **搜索地点**：点击顶部搜索栏，输入关键词搜索已记录的地点
5. **新建手账**：点击底部「+」按钮，快速创建一条新的手账记录

> 💡 **小技巧**：长按地图上的某个位置，可以快速在该地点创建手账。

### 创建手账

**操作步骤：**

1. 点击底部 Tab 中间的「+」按钮，或在手账列表页点击「新建」
2. **选择地点**：
   - 方式一：自动获取当前位置作为记录地点
   - 方式二：在地图上手动选择位置
   - 方式三：从已有地点中选择
3. **填写内容**：
   - 输入手账标题
   - 填写详细内容
   - 上传照片（支持多张，可裁剪）
   - 选择心情 emoji
   - 进行四维度评分
   - 添加自定义标签
4. 点击「保存」完成创建

**评分系统说明：**

| 维度 | 含义 | 建议参考 |
|------|------|----------|
| 环境 | 周边环境舒适度 | 噪音、人流量、卫生状况 |
| 景色 | 视觉美观程度 | 风景、建筑、拍照出片率 |
| 交通 | 到达的便利程度 | 公共交通、停车、步行距离 |
| 体验 | 整体感受评价 | 服务、性价比、推荐度 |

### 浏览与搜索

**手账列表：**
- 按时间倒序展示所有手账
- 顶部可切换筛选条件（全部 / 最近 / 有照片）
- 点击手账卡片进入详情页
- 在手账详情页可编辑或删除

**搜索功能：**
1. 点击首页顶部搜索栏或 Tab 中的「搜索」
2. 输入关键词，实时显示匹配结果
3. 搜索范围包括：标题、内容、地点名称、标签
4. 点击搜索结果直接跳转到对应详情

### 数据统计

在「统计」页面，您可以查看：

- **本月数据**：本月新增的手账数、地点数、照片数
- **月度趋势图**：最近 12 个月的记录数量变化
- **心情分布**：各种心情的占比统计
- **连续记录**：最长连续打卡天数
- **累计数据**：手账总数、地点总数、照片总数

> 💡 **建议**：坚持记录，连续打卡天数会给您意想不到的成就感！

### 主题与设置

**切换主题：**
1. 进入「我的」页面
2. 找到「设置」→「主题模式」
3. 选择「浅色」或「深色」模式
4. 切换即时生效

**数据备份与恢复：**
1. 进入「我的」→「设置」→「数据备份」
2. 点击「创建备份」，系统将打包所有数据
3. 需要恢复时，点击「恢复备份」即可还原数据

> ⚠️ **重要**：备份数据存储在本地，卸载应用会一并清除。建议定期导出备份文件。

---

## 🎨 设计规范

### 核心色彩

| 用途 | 变量名 | 色值 | 说明 |
|------|--------|------|------|
| 背景色 | `$seed-bg` | `#FAF8F5` | 暖白基调 |
| 主文字 | `$seed-fg` | `#2D2A26` | 深棕色 |
| 主色调 | `$seed-primary` | `#E09080` | 珊瑚粉 |
| 辅助色 | `$seed-accent` | `#7FA3C8` | 淡蓝色 |
| 表面色 | `$seed-surface` | `#FFFFFF` | 纯白卡片 |

### 扩展色彩

| 用途 | 变量名 | 色值 |
|------|--------|------|
| 次要文字 | `$fg-secondary` | `#6E6A65` |
| 三级文字 | `$fg-tertiary` | `#A5A09A` |
| 边框 | `$border` | `#E0DCD7` |
| 辅助色-紫 | `$accent-tertiary` | `#B8A0D0` |
| 辅助色-绿 | `$accent-success` | `#8FB888` |
| 辅助色-金 | `$accent-warning` | `#DDB86A` |
| 评分色 | `$accent-rating` | `#D9A54A` |
| 危险色 | `$danger` | `#C8504A` |

### 地图配色

| 用途 | 变量名 | 色值 |
|------|--------|------|
| 水域 | `$map-water` | `#B5CCE3` |
| 深水 | `$map-water-deep` | `#9BB8D5` |
| 公园 | `$map-park` | `#B8D5AE` |
| 主干道 | `$map-road` | `#E0DCD7` |
| 次干道 | `$map-road-sub` | `#EAE6E1` |
| 建筑 | `$map-building` | `#EDEAE5` |
| 标签 | `$map-label` | `#B5B0AA` |

### 照片占位渐变

共 5 种色调，用于照片加载前的占位展示，按地点随机分配：

| 色调 | 渐变方向 | 色值 |
|------|----------|------|
| 暖色 `warm` | 上→下 | `#EDCFC6` → `#E4BFB4` → `#D9AFA2` |
| 蓝色 `blue` | 上→下 | `#BDD3E8` → `#ADC7E0` → `#9DBBD8` |
| 薰衣草 `lavender` | 上→下 | `#D2C5E2` → `#C3B6D8` → `#B5A8CE` |
| 绿色 `green` | 上→下 | `#C0D9B8` → `#B0CFA6` → `#9EC594` |
| 金色 `gold` | 上→下 | `#E2D4B8` → `#D8C8A8` → `#CEBC98` |

### 排版系统

| 属性 | 值 |
|------|------|
| 基准字号 | `28rpx` |
| 字体族 | `-apple-system, 'SF Pro Text', 'PingFang SC', 'Helvetica Neue', sans-serif` |
| 行高 | `1.5` |
| 卡片圆角 | `36rpx` |
| 小圆角 | `24rpx` |
| 胶囊圆角 | `999rpx` |
| 卡片阴影 | `0 2rpx 16rpx rgba(0, 0, 0, 0.06)` |
| 悬浮阴影 | `0 12rpx 48rpx rgba(0, 0, 0, 0.10)` |

### UI 设计特点

- 🎯 温暖的卡片式设计风格，亲和力强
- 🔶 柔和的圆角体系（24-36rpx），圆润舒适
- ✨ 丰富的视觉反馈与微动效
- 🌓 浅色 / 深色模式完整支持
- 📱 自定义导航栏（`navigationStyle: custom`），沉浸式体验

---

## 📦 数据模型

### 手账 (Journal)

Store 位置：[store/journal.js](store/journal.js)

```typescript
interface Journal {
  id: string              // 唯一标识，格式: jour_xxxxx
  locationId: string      // 关联地点 ID
  locationName: string    // 地点名称（冗余存储，便于列表展示）
  title: string           // 手账标题
  content: string         // 手账正文内容
  photos: string[]        // 照片路径数组（本地临时路径）
  mood: string            // 心情 emoji
  ratings: {
    environment: number   // 环境评分 1-5
    scenery: number       // 景色评分 1-5
    transport: number     // 交通评分 1-5
    experience: number    // 体验评分 1-5
  }
  overallRating: number   // 综合评分（四维度平均值，保留一位小数）
  tags: string[]          // 自定义标签数组
  createdAt: string       // 创建时间（ISO 格式字符串）
  updatedAt: string       // 更新时间（ISO 格式字符串）
}
```

**主要 Getter：**

| Getter | 返回类型 | 说明 |
|--------|----------|------|
| `sortedJournals` | `Journal[]` | 按创建时间降序排列 |
| `groupedJournals` | `Object` | 按日期分组（今天/昨天/本周/更早） |
| `journalsByLocation` | `Object` | 按地点 ID 分组 |
| `moodDistribution` | `Array` | 心情分布统计（含百分比） |
| `monthlyTrend` | `Array` | 最近 12 个月月度趋势 |
| `consecutiveDays` | `number` | 最长连续记录天数 |
| `thisMonthCount` | `number` | 本月新增数量 |
| `totalCount` | `number` | 手账总数 |
| `totalPhotos` | `number` | 照片总数 |

**主要 Action：**

| Action | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `addJournal` | `data: JournalInput` | `Journal` | 新增手账，自动计算综合评分 |
| `updateJournal` | `id: string, data: Partial<Journal>` | `Journal \| null` | 更新手账，评分变更时自动重算 |
| `deleteJournal` | `id: string` | `boolean` | 删除手账 |
| `getJournal` | `id: string` | `Journal \| undefined` | 获取手账详情 |
| `getJournalsByLocation` | `locationId: string` | `Journal[]` | 按地点获取手账 |
| `search` | `keyword: string` | `Journal[]` | 多维度搜索（标题/内容/地点/标签） |
| `filterBy` | `filter: 'recent' \| 'photos'` | `Journal[]` | 按条件筛选 |

### 地点 (Location)

Store 位置：[store/location.js](store/location.js)

```typescript
interface Location {
  id: string              // 唯一标识，格式: loc_xxxxx
  name: string            // 地点名称
  address: string         // 详细地址
  latitude: number        // 纬度
  longitude: number       // 经度
  coverColor: CoverColor  // 封面色调（warm/blue/lavender/green/gold）
  visitCount: number      // 访问次数
  lastVisitDate: string   // 最近访问日期
  journalCount: number    // 关联手账数量
  photoCount: number      // 关联照片数量
  createdAt: string       // 创建时间
}

type CoverColor = 'warm' | 'blue' | 'lavender' | 'green' | 'gold'
```

**主要 Getter：**

| Getter | 返回类型 | 说明 |
|--------|----------|------|
| `totalCount` | `number` | 地点总数 |
| `selectedLocation` | `Location \| null` | 当前选中地点 |
| `popularLocations` | `Location[]` | 按访问次数降序排列 |

**主要 Action：**

| Action | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `addLocation` | `data: LocationInput` | `Location` | 新增地点，随机分配封面色调 |
| `updateLocation` | `id: string, data: Partial<Location>` | `Location \| null` | 更新地点信息 |
| `deleteLocation` | `id: string` | `boolean` | 删除地点 |
| `getLocation` | `id: string` | `Location \| undefined` | 获取地点详情 |
| `search` | `keyword: string` | `Location[]` | 按名称/地址搜索地点 |
| `findOrCreate` | `data: LocationInput` | `Location` | 查找或创建地点（智能匹配） |
| `updateStats` | `locationId, journalCount, photoCount` | `void` | 更新地点统计数据 |
| `setSelected` | `id: string \| null` | `void` | 设置当前选中地点 |

### 用户资料 (Profile)

Store 位置：[store/profile.js](store/profile.js)

```typescript
interface Profile {
  nickname: string        // 昵称，默认 "小鹿同学"
  bio: string             // 个人简介
  city: string            // 所在城市
  birthday: string        // 生日
  avatar: string          // 头像路径
}

interface Settings {
  notifications: boolean  // 通知开关
  theme: 'light' | 'dark' // 主题模式
  backup: boolean         // 自动备份开关
}
```

**主要 Getter：**

| Getter | 返回类型 | 说明 |
|--------|----------|------|
| `journalCount` | `number` | 手账总数（从 journal store 获取） |
| `locationCount` | `number` | 地点总数（从 location store 获取） |
| `photoCount` | `number` | 照片总数（从 journal store 获取） |

**主要 Action：**

| Action | 参数 | 说明 |
|--------|------|------|
| `saveProfile` | `data: Partial<Profile>` | 保存用户资料 |
| `saveSettings` | `data: Partial<Settings>` | 保存设置项 |
| `updateAvatar` | `path: string` | 更新头像 |

---

## ⚙️ 配置说明

### 应用基础配置

在 `manifest.json` 中配置应用基础信息：

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `name` | `string` | 应用名称 | `"拾光手账"` |
| `appid` | `string` | DCloud 应用 ID | `"__UNI__00D0FC0"` |
| `description` | `string` | 应用描述 | `"地图生活手账"` |
| `versionName` | `string` | 版本名称 | `"0.0.1"` |
| `versionCode` | `string` | 版本号（整数） | `"100"` |
| `vueVersion` | `string` | Vue 版本 | `"3"` |

### 地图配置

本项目使用高德地图（Amap）SDK，App 端必须配置 Key 才能使用地图功能。

**获取高德 Key：**

1. 前往 [高德开放平台](https://lbs.amap.com/) 注册并创建应用
2. 添加「Android 平台」和「iOS 平台」的 Key
3. 分别获取两个平台的 AppKey

**配置位置**：`manifest.json` → `app-plus` → `distribute` → `sdkConfigs`

```json
{
  "app-plus": {
    "modules": {
      "Maps": {}
    },
    "distribute": {
      "sdkConfigs": {
        "maps": {
          "amap": {
            "appkey_ios": "your-ios-amap-key",
            "appkey_android": "your-android-amap-key"
          }
        },
        "geolocation": {
          "amap": {
            "__platform__": ["ios", "android"],
            "appkey_ios": "your-ios-amap-key",
            "appkey_android": "your-android-amap-key"
          }
        }
      }
    }
  }
}
```

**Android 权限**（已内置配置）：

| 权限 | 用途 |
|------|------|
| `ACCESS_FINE_LOCATION` | 精确定位 |
| `ACCESS_COARSE_LOCATION` | 粗略定位 |
| `CAMERA` | 拍照上传 |
| `READ_EXTERNAL_STORAGE` | 读取相册 |
| `WRITE_EXTERNAL_STORAGE` | 保存图片 |

### 微信小程序配置

在 `manifest.json` → `mp-weixin` 中配置：

| 字段 | 类型 | 说明 |
|------|------|------|
| `appid` | `string` | 微信小程序 AppID |
| `setting.urlCheck` | `boolean` | 是否校验合法域名（开发期建议 false） |
| `permission["scope.userLocation"].desc` | `string` | 位置权限申请说明 |

示例：

```json
{
  "mp-weixin": {
    "appid": "your-wechat-appid",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "minified": true
    },
    "usingComponents": true,
    "permission": {
      "scope.userLocation": {
        "desc": "你的位置信息将用于地图显示和地点记录"
      }
    }
  }
}
```

### 页面配置

在 `pages.json` 中配置页面路由与全局样式。完整页面列表请参考 [项目结构](#项目结构)。

全局样式配置：

| 字段 | 默认值 | 说明 |
|------|--------|------|
| `navigationStyle` | `custom` | 自定义导航栏 |
| `navigationBarTextStyle` | `black` | 状态栏文字颜色 |
| `navigationBarTitleText` | `拾光手账` | 导航栏标题 |
| `navigationBarBackgroundColor` | `#FAF8F5` | 导航栏背景色 |
| `backgroundColor` | `#FAF8F5` | 页面背景色 |

---

## ❓ 常见问题

### 地图不显示怎么办？

**可能原因及解决方案：**

1. **未配置高德地图 Key**
   - 检查 `manifest.json` 中 `sdkConfigs.maps.amap` 是否正确配置
   - 确认 Key 与应用包名/签名匹配

2. **网络问题**
   - 检查设备网络连接
   - 确认高德地图服务是否可用

3. **定位权限未开启**
   - 在系统设置中检查应用定位权限
   - 确认已授权「始终允许」或「使用时允许」

4. **H5 端限制**
   - H5 端地图功能有限，建议使用 App 端或小程序端

### 数据会丢失吗？

- 本应用数据存储在**设备本地**（`uni.setStorageSync`）
- 卸载应用、清除缓存会导致数据丢失
- 建议定期使用「数据备份」功能
- 未来版本将支持云端同步

### 如何导出数据？

目前版本暂不支持直接导出文件。您可以：

1. 使用「数据备份」功能在本地保存一份副本
2. 如需迁移数据，可通过手机备份 / 还原功能操作
3. 后续版本将支持 JSON / CSV 格式导出

### 支持哪些图片格式？

支持的格式：`JPG`、`PNG`、`WEBP`（取决于平台支持）
- 单张图片建议控制在 5MB 以内
- 最多支持 9 张图片 / 手账
- 图片支持裁剪后上传

### 如何切换深色模式？

路径：「我的」→「设置」→「主题模式」→ 选择「深色」

切换后即时生效，所有页面自动适配深色配色。

### 标签可以创建多少个？

每个手账最多添加 10 个标签，标签总数量没有限制。
建议标签简洁明了，便于搜索和分类。

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 贡献方式

1. **Fork 本仓库**
   ```bash
   git clone https://github.com/your-username/trace.git
   cd trace
   ```

2. **创建特性分支**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **提交更改**
   ```bash
   git commit -m "Add some AmazingFeature"
   ```

4. **推送到分支**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **提交 Pull Request**

### 代码规范

- 使用 ES6+ 语法，遵循 Vue 3 风格指南
- 组件命名使用 PascalCase
- 文件名使用 kebab-case（组件除外）
- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范

### 报告 Bug

提交 Issue 时请包含：

- 运行平台（微信小程序 / App / H5 等）
- 系统版本与设备型号
- 详细的复现步骤
- 预期行为与实际行为
- 截图或录屏（如有）

---

## 📄 许可证

本项目采用 **GPL-3.0** 许可证 - 详见 [LICENSE](LICENSE) 文件。

---

## 🙏 致谢

- [UniApp](https://uniapp.dcloud.net.cn/) - 优秀的跨平台开发框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Pinia](https://pinia.vuejs.org/) - 直观的 Vue 状态管理
- [高德地图](https://lbs.amap.com/) - 专业的地图服务平台
- [Sass](https://sass-lang.com/) - 强大的 CSS 扩展语言

---

<div align="center">
  <br>
  <p>用拾光手账，记录生活中的每一个美好瞬间 ✨</p>
  <p>
    <a href="#拾光手账--trace">返回顶部 ↑</a>
  </p>
</div>
