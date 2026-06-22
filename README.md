# 拾光手账 (Trace)

<div align="center">
  <img src="static/logo.png" alt="拾光手账 Logo" width="120" height="120">

  **用脚步丈量世界，用手账记录时光**

  一款基于地图的生活手账应用，记录您到访的每一个地点与美好时刻
</div>

---

## ✨ 功能特性

### 🗺️ 地图视图
- 集成地图 SDK，直观展示所有记录地点
- 点击标记查看地点详情与关联手账
- 支持搜索地点与实时定位
- 自动记录地点访问次数

### 📝 手账管理
- 创建、编辑、删除手账记录
- 支持多张照片上传
- 心情选择（emoji 表达）
- 四维度评分系统：环境、景色、交通、体验
- 自定义标签分类
- 按日期/地点智能分组

### 📊 数据统计
- 月度记录趋势图（最近12个月）
- 心情分布可视化
- 连续记录天数追踪
- 本月新增统计概览

### 🔍 智能搜索
- 支持标题、内容、地点名、标签搜索
- 实时搜索建议

### 👤 个人中心
- 用户资料管理
- 头像自定义
- 数据统计概览

---

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| [UniApp](https://uniapp.dcloud.net.cn/) | 跨平台开发框架 |
| [Vue 3](https://vuejs.org/) | 渐进式 JavaScript 框架 |
| [Pinia](https://pinia.vuejs.org/) | Vue 状态管理库 |
| [Sass](https://sass-lang.com/) | CSS 预处理器 |

---

## 📱 支持平台

- 微信小程序
- 支付宝小程序
- App (iOS/Android)
- H5

---

## 🚀 快速开始

### 环境要求

- Node.js >= 14.0.0
- HBuilderX (推荐最新版本)

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

## 📁 项目结构

```
Trace/
├── components/           # 可复用组件
│   ├── DeleteModal.vue   # 删除确认弹窗
│   ├── EmptyState.vue    # 空状态组件
│   ├── Icon.vue          # SVG 图标组件
│   ├── MoodSelect.vue    # 心情选择器
│   ├── PhotoUpload.vue   # 照片上传组件
│   ├── StarRating.vue    # 星级评分组件
│   └── TabBar.vue        # 底部导航栏
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
└── uni.scss              # 全局样式变量
```

---

## 🎨 设计规范

### 配色方案

| 用途 | 颜色名称 | 色值 | 预览 |
|------|----------|------|------|
| 背景色 | 暖白色 | `#FAF8F5` | ![#FAF8F5](https://via.placeholder.com/16/FAF8F5/FAF8F5) |
| 主文字 | 深棕色 | `#2D2A26` | ![#2D2A26](https://via.placeholder.com/16/2D2A26/2D2A26) |
| 主色调 | 珊瑚粉 | `#E09080` | ![#E09080](https://via.placeholder.com/16/E09080/E09080) |
| 辅助色 | 淡蓝色 | `#7FA3C8` | ![#7FA3C8](https://via.placeholder.com/16/7FA3C8/7FA3C8) |
| 表面色 | 纯白色 | `#FFFFFF` | ![#FFFFFF](https://via.placeholder.com/16/FFFFFF/FFFFFF) |

### UI 特点

- 温暖的卡片式设计风格
- 柔和的圆角（20-36rpx）
- 丰富的视觉反馈与动效
- 兼容深色模式（预留）

---

## 💾 数据模型

### 手账 (Journal)

```typescript
interface Journal {
  id: string
  locationId: string
  locationName: string
  title: string
  content: string
  photos: string[]
  mood: string           // emoji 表情
  ratings: {
    environment: number  // 环境 1-5
    scenery: number      // 景色 1-5
    transport: number    // 交通 1-5
    experience: number   // 体验 1-5
  }
  overallRating: number  // 综合评分
  tags: string[]
  createdAt: string
  updatedAt: string
}
```

### 地点 (Location)

```typescript
interface Location {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  coverColor: 'warm' | 'blue' | 'lavender' | 'green' | 'gold'
  visitCount: number
  lastVisitDate: string
  journalCount: number
  photoCount: number
  createdAt: string
}
```

---

## 🔧 配置说明

### 地图配置

在 `manifest.json` 中配置地图服务商 API Key：

```json
{
  "mp-weixin": {
    "appid": "your-appid",
    "setting": {
      "urlCheck": false
    }
  }
}
```

### 应用信息

修改 `manifest.json` 中的应用信息：

```json
{
  "name": "拾光手账",
  "appid": "__UNI__XXXXX",
  "description": "地图生活手账应用",
  "versionName": "1.0.0",
  "versionCode": 100
}
```

---

## 📦 核心依赖

| 依赖 | 版本 | 说明 |
|------|------|------|
| pinia | ^2.0.36 | 状态管理 |
| sass | ^1.62.0 | CSS 预处理器 |

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

<div align="center">

**用拾光手账，记录生活中的每一个美好瞬间**

</div>