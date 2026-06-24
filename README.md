# 拾光手账 (Trace)

<div align="center">
  <img src="static/logo.png" alt="拾光手账 Logo" width="120" height="120">

  **用脚步丈量世界，用手账记录时光**

  一款基于地图的生活手账应用，记录您到访的每一个地点与美好时刻
</div>

---

## 功能特性

### 地图视图
- 集成高德地图 SDK，直观展示所有记录地点
- 点击标记查看地点详情与关联手账
- 支持地点搜索与实时定位
- 自动记录地点访问次数
- 按名称或坐标智能匹配，避免重复创建地点

### 手账管理
- 创建、编辑、删除手账记录
- 支持多张照片上传与裁剪
- 心情选择（emoji 表达）
- 四维度评分系统：环境、景色、交通、体验
- 自定义标签分类
- 按日期/地点智能分组
- 支持按最近记录、含照片等条件筛选

### 数据统计
- 月度记录趋势图（最近 12 个月）
- 心情分布可视化
- 连续记录天数追踪
- 本月新增统计概览
- 照片总数统计

### 智能搜索
- 支持标题、内容、地点名、标签多维度搜索
- 实时搜索结果展示

### 个人中心
- 用户资料管理（昵称、头像、简介、城市、生日）
- 头像自定义
- 数据统计概览（手账数、地点数、照片数）
- 通知、主题、备份等设置项

### 主题切换
- 支持浅色 / 深色模式切换
- 通过 theme mixin 统一管理主题色彩
- 自动适配文字、图标等 UI 元素颜色

---

## 技术栈

| 技术 | 说明 |
|------|------|
| [UniApp](https://uniapp.dcloud.net.cn/) | 跨平台开发框架 |
| [Vue 3](https://vuejs.org/) | 渐进式 JavaScript 框架 |
| [Pinia](https://pinia.vuejs.org/) | Vue 状态管理库 |
| [Sass](https://sass-lang.com/) | CSS 预处理器 |

---

## 支持平台

| 平台 | 说明 |
|------|------|
| 微信小程序 | `mp-weixin` |
| 支付宝小程序 | `mp-alipay` |
| 百度小程序 | `mp-baidu` |
| 头条小程序 | `mp-toutiao` |
| App (iOS/Android) | `app-plus`，集成高德地图与定位 |
| 快应用 | `quickapp` |

---

## 快速开始

### 环境要求

- Node.js >= 14.0.0
- HBuilderX（推荐最新版本）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/trace.git
   cd trace
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **使用 HBuilderX 打开项目**

4. **运行项目**
   - 微信小程序：点击「运行」→「运行到小程序模拟器」→「微信开发者工具」
   - App：点击「运行」→「运行到手机或模拟器」
   - H5：点击「运行」→「运行到浏览器」

---

## 项目结构

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
├── static/               # 静态资源
├── App.vue               # 应用入口
├── main.js               # 主入口文件
├── pages.json            # 页面配置
├── manifest.json         # 应用配置
├── uni.scss              # 全局样式变量
└── uni.promisify.adaptor.js  # Promise 适配器
```

---

## 设计规范

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

覆盖 5 种色调，用于照片加载前的占位展示：

| 色调 | 渐变组 |
|------|--------|
| 暖色 `$photo-warm` | `#EDCFC6` → `#E4BFB4` → `#D9AFA2` |
| 蓝色 `$photo-blue` | `#BDD3E8` → `#ADC7E0` → `#9DBBD8` |
| 薰衣草 `$photo-lavender` | `#D2C5E2` → `#C3B6D8` → `#B5A8CE` |
| 绿色 `$photo-green` | `#C0D9B8` → `#B0CFA6` → `#9EC594` |
| 金色 `$photo-gold` | `#E2D4B8` → `#D8C8A8` → `#CEBC98` |

### 排版

| 属性 | 值 |
|------|------|
| 基准字号 | `28rpx` |
| 字体族 | `-apple-system, 'SF Pro Display', 'PingFang SC', 'Helvetica Neue', sans-serif` |
| 卡片圆角 | `36rpx` |
| 小圆角 | `24rpx` |
| 胶囊圆角 | `999rpx` |
| 卡片阴影 | `0 2rpx 16rpx rgba(0, 0, 0, 0.06)` |
| 悬浮阴影 | `0 12rpx 48rpx rgba(0, 0, 0, 0.10)` |

### UI 特点

- 温暖的卡片式设计风格
- 柔和的圆角体系（24-36rpx）
- 丰富的视觉反馈与动效
- 浅色 / 深色模式完整支持
- 自定义导航栏（`navigationStyle: custom`）

---

## 数据模型

### 手账 (Journal)

Store 位置：[store/journal.js](store/journal.js)

```typescript
interface Journal {
  id: string              // 唯一标识，格式: jour_xxxxx
  locationId: string      // 关联地点 ID
  locationName: string    // 地点名称
  title: string           // 手账标题
  content: string         // 手账内容
  photos: string[]        // 照片路径数组
  mood: string            // emoji 心情
  ratings: {
    environment: number   // 环境评分 1-5
    scenery: number       // 景色评分 1-5
    transport: number     // 交通评分 1-5
    experience: number    // 体验评分 1-5
  }
  overallRating: number   // 综合评分（四维度平均值）
  tags: string[]          // 自定义标签
  createdAt: string       // 创建时间
  updatedAt: string       // 更新时间
}
```

**主要 Getter：**

| Getter | 说明 |
|--------|------|
| `sortedJournals` | 按创建时间降序排列 |
| `groupedJournals` | 按日期分组（今天/昨天/本周/更早） |
| `journalsByLocation` | 按地点 ID 分组 |
| `moodDistribution` | 心情分布统计（含百分比） |
| `monthlyTrend` | 最近 12 个月月度趋势 |
| `consecutiveDays` | 最长连续记录天数 |
| `thisMonthCount` | 本月新增数量 |
| `totalCount` | 手账总数 |
| `totalPhotos` | 照片总数 |

**主要 Action：**

| Action | 说明 |
|--------|------|
| `addJournal(data)` | 新增手账，自动计算综合评分 |
| `updateJournal(id, data)` | 更新手账，评分变更时自动重算 |
| `deleteJournal(id)` | 删除手账 |
| `getJournal(id)` | 获取手账详情 |
| `getJournalsByLocation(locationId)` | 按地点获取手账 |
| `search(keyword)` | 多维度搜索（标题/内容/地点/标签） |
| `filterBy(filter)` | 按条件筛选（recent/photos） |

### 地点 (Location)

Store 位置：[store/location.js](store/location.js)

```typescript
interface Location {
  id: string              // 唯一标识，格式: loc_xxxxx
  name: string            // 地点名称
  address: string         // 地址
  latitude: number        // 纬度
  longitude: number       // 经度
  coverColor: 'warm' | 'blue' | 'lavender' | 'green' | 'gold'  // 封面色调
  visitCount: number      // 访问次数
  lastVisitDate: string   // 最近访问日期
  journalCount: number    // 关联手账数
  photoCount: number      // 关联照片数
  createdAt: string       // 创建时间
}
```

**主要 Getter：**

| Getter | 说明 |
|--------|------|
| `totalCount` | 地点总数 |
| `selectedLocation` | 当前选中地点 |
| `popularLocations` | 按访问次数降序排列 |

**主要 Action：**

| Action | 说明 |
|--------|------|
| `addLocation(data)` | 新增地点，随机分配封面色调 |
| `updateLocation(id, data)` | 更新地点信息 |
| `deleteLocation(id)` | 删除地点 |
| `getLocation(id)` | 获取地点详情 |
| `search(keyword)` | 按名称/地址搜索地点 |
| `findOrCreate(data)` | 查找或创建地点（按名称+坐标智能匹配） |
| `updateStats(locationId, journalCount, photoCount)` | 更新地点统计数据 |
| `setSelected(id)` | 设置选中地点 |

### 用户资料 (Profile)

Store 位置：[store/profile.js](store/profile.js)

```typescript
interface Profile {
  nickname: string        // 昵称，默认 "小鹿同学"
  bio: string             // 简介
  city: string            // 城市
  birthday: string        // 生日
  avatar: string          // 头像路径
}

interface Settings {
  notifications: boolean  // 通知开关
  theme: 'light' | 'dark' // 主题模式
  backup: boolean         // 备份开关
}
```

**主要 Getter：**

| Getter | 说明 |
|--------|------|
| `journalCount` | 手账总数 |
| `locationCount` | 地点总数 |
| `photoCount` | 照片总数 |

**主要 Action：**

| Action | 说明 |
|--------|------|
| `saveProfile(data)` | 保存用户资料 |
| `saveSettings(data)` | 保存设置项 |
| `updateAvatar(path)` | 更新头像 |

---

## 配置说明

### 地图配置

本项目使用高德地图（Amap）SDK。在 `manifest.json` 中配置 App 端 Key：

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
            "appkey_ios": "your-ios-key",
            "appkey_android": "your-android-key"
          }
        },
        "geolocation": {
          "amap": {
            "__platform__": ["ios", "android"],
            "appkey_ios": "your-ios-key",
            "appkey_android": "your-android-key"
          }
        }
      }
    }
  }
}
```

### 微信小程序

在 `manifest.json` 中配置微信小程序参数：

```json
{
  "mp-weixin": {
    "appid": "your-appid",
    "setting": {
      "urlCheck": false
    },
    "permission": {
      "scope.userLocation": {
        "desc": "你的位置信息将用于地图显示和地点记录"
      }
    }
  }
}
```

### 应用信息

```json
{
  "name": "拾光手账",
  "appid": "__UNI__XXXXX",
  "description": "地图生活手账 — 用脚步丈量世界，用手账记录时光",
  "versionName": "0.0.1",
  "versionCode": 100
}
```

---

## 核心依赖

| 依赖 | 版本 | 类型 | 说明 |
|------|------|------|------|
| pinia | ^2.0.36 | dependency | 状态管理 |
| sass | ^1.62.0 | devDependency | CSS 预处理器 |

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 许可证

本项目采用 GPL-3.0 许可证 - 详见 [LICENSE](LICENSE) 文件

---

<div align="center">

**用拾光手账，记录生活中的每一个美好瞬间**

</div>