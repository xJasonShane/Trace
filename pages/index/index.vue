<template>
	<view class="page" :class="themeClass">
		<!-- 状态栏占位 -->
		<view class="statusbar-placeholder" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 地图区域 -->
		<view class="map-area">
			<map
				class="map"
				:latitude="center.latitude"
				:longitude="center.longitude"
				:markers="markers"
				:scale="13"
				@markertap="onMarkerTap"
				show-location
			></map>

			<!-- 搜索栏（使用 cover-view 覆盖原生 map 组件） -->
			<cover-view class="map-search" :style="coverBoxStyle" @tap="goSearch">
				<cover-image class="map-search-icon" :src="iconSrc('search', searchIconColor, 2)" />
				<cover-view class="map-search-text" :style="coverSubStyle">搜索地点或回忆…</cover-view>
			</cover-view>

			<!-- 定位按钮 —— 使用强调色背景，确保在地图上清晰可见 -->
			<cover-view class="locate-btn" :style="locateBtnStyle" @tap="locate">
				<cover-image class="locate-icon" :src="iconSrc('locate', '#FFFFFF', 2)" />
			</cover-view>

			<!-- 底部信息卡片 —— 有手账记录时显示精简预览 -->
			<cover-view v-if="selectedLocation" class="map-card" :style="coverBoxStyle" @tap="goLocationDetail">
				<cover-view class="mc-row">
					<cover-view class="mc-thumb" :class="'ph-' + (selectedLocation.coverColor || 'warm')">
						<cover-image v-if="recentJournalPhoto" class="mc-thumb-img" :src="recentJournalPhoto" />
						<cover-image v-else class="mc-thumb-icon" :src="iconSrc('mountain', '#FFFFFF', 1.4)" />
					</cover-view>
					<cover-view class="mc-info">
						<cover-view class="mc-name" :style="coverNameStyle">{{ selectedLocation.name }}</cover-view>
						<cover-view class="mc-sub" :style="coverSubStyle">{{ locationJournalCount }} 篇手账 · 最近 {{ recentJournalTimeText }}</cover-view>
						<cover-view class="mc-rating">
							<cover-view class="mc-score">{{ ratingText }}</cover-view>
							<cover-view class="mc-stars">{{ starsText }}</cover-view>
						</cover-view>
					</cover-view>
				</cover-view>
			</cover-view>
		</view>

		<!-- TabBar（非 fixed 模式，作为 flex 子元素避免被原生 map 覆盖） -->
		<TabBar :active="0" :fixed="false" />
	</view>
</template>

<script>
import TabBar from '@/components/TabBar.vue'
import Icon from '@/components/Icon.vue'
import StarRating from '@/components/StarRating.vue'
import themeMixin from '@/mixins/theme.js'
import { useLocationStore } from '@/store/location.js'
import { useJournalStore } from '@/store/journal.js'
import dateUtil from '@/utils/date.js'

// cover-view 内部无法使用自定义组件，需内联 SVG 图标路径
const COVER_ICONS = {
	search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
	locate: '<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>',
	mountain: '<path d="M3 20l5.5-9 4 6 3-4.5 5.5 7.5z"/><circle cx="17" cy="7" r="2.5"/>'
}

// 默认示例地点（首次启动时写入 store，确保所有页面可访问）
const DEFAULT_LOCATIONS = [
	{ id: 'demo1', name: '西湖断桥', latitude: 30.26, longitude: 120.15, coverColor: 'warm', address: '杭州市西湖区北山街' },
	{ id: 'demo2', name: '太子湾公园', latitude: 30.23, longitude: 120.13, coverColor: 'blue', address: '杭州市西湖区南山路' },
	{ id: 'demo3', name: '灵隐寺', latitude: 30.24, longitude: 120.10, coverColor: 'lavender', address: '杭州市西湖区灵隐路' }
]

// 默认示例手账（与示例地点关联，确保各页面数据一致）
const DEFAULT_JOURNALS = [
	{
		id: 'demo_j1',
		locationId: 'demo1',
		locationName: '西湖断桥',
		title: '断桥残雪，冬日西湖',
		content: '冬日的西湖格外宁静，断桥上覆盖着薄薄的积雪。站在桥上远眺，湖面如镜，远山朦胧，仿佛置身水墨画中。偶尔有几只水鸟掠过湖面，留下淡淡的涟漪。',
		photos: [],
		mood: '😊',
		ratings: { environment: 5, scenery: 5, transport: 4, experience: 5 },
		tags: ['冬日', '雪景', '西湖'],
		createdAt: '2024-12-15 10:30',
		updatedAt: '2024-12-15 10:30'
	},
	{
		id: 'demo_j2',
		locationId: 'demo1',
		locationName: '西湖断桥',
		title: '春日断桥漫步',
		content: '春天来了，断桥两岸的柳树抽出新芽，桃花盛开。沿着白堤漫步，微风拂面，花香沁人。湖面上游船点点，远处的雷峰塔在夕阳下熠熠生辉。',
		photos: [],
		mood: '🌸',
		ratings: { environment: 5, scenery: 4, transport: 4, experience: 5 },
		tags: ['春日', '漫步', '花季'],
		createdAt: '2024-03-20 14:00',
		updatedAt: '2024-03-20 14:00'
	},
	{
		id: 'demo_j3',
		locationId: 'demo2',
		locationName: '太子湾公园',
		title: '郁金香花海',
		content: '太子湾公园的郁金香开了，大片大片的花海让人陶醉。红的、黄的、紫的、粉的，色彩缤纷。微风吹过，花海起伏如波浪，空气中弥漫着淡淡的花香。',
		photos: [],
		mood: '☀️',
		ratings: { environment: 5, scenery: 5, transport: 3, experience: 4 },
		tags: ['花海', '郁金香', '春日'],
		createdAt: '2024-03-28 09:15',
		updatedAt: '2024-03-28 09:15'
	},
	{
		id: 'demo_j4',
		locationId: 'demo3',
		locationName: '灵隐寺',
		title: '古刹禅意',
		content: '清晨的灵隐寺，香烟袅袅，钟声悠扬。沿着石阶而上，古木参天，斑驳的树影洒在青石板上。飞来峰的石窟造像庄严精美，让人感叹古人的智慧与匠心。',
		photos: [],
		mood: '🌙',
		ratings: { environment: 5, scenery: 4, transport: 3, experience: 5 },
		tags: ['古刹', '禅意', '人文'],
		createdAt: '2024-07-08 08:00',
		updatedAt: '2024-07-08 08:00'
	}
]

// 计算综合评分
function calcOverall(ratings) {
	const vals = Object.values(ratings)
	return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
}

export default {
	components: { TabBar, Icon, StarRating },
	mixins: [themeMixin],
	setup() {
		const locationStore = useLocationStore()
		const journalStore = useJournalStore()
		return { locationStore, journalStore }
	},
	data() {
		return {
			statusBarHeight: 0,
			center: { latitude: 30.27, longitude: 120.15 },
			selectedLocation: null
		}
	},
	computed: {
		searchIconColor() {
			return this.themeClass === 'theme-dark' ? '#6E6A65' : '#A5A09A'
		},
		// 定位按钮使用强调色背景，保证在地图各种背景下均清晰可见
		locateBtnStyle() {
			return 'background: #E09080; border: 1rpx solid #D08878; box-shadow: 0 4rpx 16rpx rgba(224, 144, 128, 0.35);'
		},
		coverBoxStyle() {
			if (this.themeClass === 'theme-dark') {
				return 'background: #2A2724; border: 1rpx solid #3A3734;'
			}
			return 'background: #FFFFFF; border: 1rpx solid #EDEAE5;'
		},
		coverNameStyle() {
			return this.themeClass === 'theme-dark' ? 'color: #E8E4E0;' : 'color: #2D2A26;'
		},
		coverSubStyle() {
			return this.themeClass === 'theme-dark' ? 'color: #A5A09A;' : 'color: #7A756F;'
		},
		displayLocations() {
			return this.locationStore.locations
		},
		markers() {
			const colors = ['#E09080', '#7FA3C8', '#B8A0D0', '#8FB888', '#DDB86A']
			return this.displayLocations.map((loc, idx) => {
				return {
					id: idx + 1,
					latitude: Number(loc.latitude),
					longitude: Number(loc.longitude),
					title: loc.name,
					callout: {
						content: loc.name,
						color: '#FFFFFF',
						fontSize: 12,
						borderRadius: 8,
						bgColor: colors[idx % colors.length],
						padding: 6,
						display: 'ALWAYS'
					}
				}
			})
		},
		// 当前选中地点关联的手账列表（按创建时间降序）
		selectedLocationJournals() {
			if (!this.selectedLocation) return []
			return this.journalStore.getJournalsByLocation(this.selectedLocation.id)
		},
		// 最近一篇手账的首张图片，作为预览简图
		recentJournalPhoto() {
			const journals = this.selectedLocationJournals
			if (journals.length === 0) return ''
			const recent = journals[0]
			if (recent.photos && recent.photos.length > 0) {
				return recent.photos[0]
			}
			return ''
		},
		// 最近手账创建时间的相对描述
		recentJournalTimeText() {
			const journals = this.selectedLocationJournals
			if (journals.length === 0) return '暂无'
			return dateUtil.formatRelative(journals[0].createdAt)
		},
		// 当前选中地点的评分（从关联手账动态计算）
		currentRating() {
			if (!this.selectedLocation) return 0
			const journals = this.journalStore.getJournalsByLocation(this.selectedLocation.id)
			if (journals.length === 0) return 0
			const sum = journals.reduce((s, j) => s + (j.overallRating || 0), 0)
			return Math.round((sum / journals.length) * 10) / 10
		},
		// 当前选中地点的手账数量（动态计算）
		locationJournalCount() {
			if (!this.selectedLocation) return 0
			return this.journalStore.getJournalsByLocation(this.selectedLocation.id).length
		},
		ratingText() {
			return this.currentRating > 0 ? this.currentRating.toFixed(1) : '暂无'
		},
		starsText() {
			if (this.currentRating === 0) return ''
			const full = Math.round(this.currentRating)
			return '★★★★★'.slice(0, Math.max(1, Math.min(5, full)))
		}
	},
	onLoad() {
		const sys = uni.getSystemInfoSync()
		this.statusBarHeight = sys.statusBarHeight || 20

		const isFirstLaunch = this.locationStore.locations.length === 0

		// 首次启动时初始化示例地点
		if (isFirstLaunch) {
			DEFAULT_LOCATIONS.forEach(loc => {
				this.locationStore.addLocation(loc)
			})
		}

		// 首次启动时初始化示例手账，并同步地点统计
		if (isFirstLaunch && this.journalStore.journals.length === 0) {
			DEFAULT_JOURNALS.forEach(j => {
				const journal = {
					...j,
					overallRating: calcOverall(j.ratings)
				}
				this.journalStore.journals.push(journal)
			})
			this.journalStore.persist()

			// 同步各地点的手账数、照片数、最近到访日期
			DEFAULT_LOCATIONS.forEach(loc => {
				const journals = this.journalStore.getJournalsByLocation(loc.id)
				if (journals.length > 0) {
					const photoCount = journals.reduce(
						(sum, j) => sum + (j.photos ? j.photos.length : 0), 0
					)
					this.locationStore.updateStats(loc.id, journals.length, photoCount)
				}
			})
		}
	},
	onShow() {
		// 从二级页面返回时，刷新选中地点数据（手账可能已变更）
		if (this.selectedLocation) {
			const loc = this.locationStore.getLocation(this.selectedLocation.id)
			if (!loc) {
				// 地点已被删除
				this.selectedLocation = null
			} else {
				const journals = this.journalStore.getJournalsByLocation(loc.id)
				if (journals.length === 0) {
					// 地点已无手账，清除选中状态
					this.selectedLocation = null
				} else {
					// 更新为最新的地点对象引用
					this.selectedLocation = loc
				}
			}
		}
	},
	methods: {
		// 生成 SVG data URI，供 cover-image 使用
		iconSrc(name, color, strokeWidth) {
			const paths = COVER_ICONS[name] || ''
			const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${color}' stroke-width='${strokeWidth}' stroke-linecap='round' stroke-linejoin='round'>${paths}</svg>`
			return 'data:image/svg+xml,' + encodeURIComponent(svg)
		},
		onMarkerTap(e) {
			// 确保 markerId 为数字类型（不同平台可能返回字符串）
			const markerId = Number(e.detail.markerId)
			const idx = markerId - 1
			if (idx >= 0 && idx < this.displayLocations.length) {
				const loc = this.displayLocations[idx]
				this.center = { latitude: Number(loc.latitude), longitude: Number(loc.longitude) }

				// 根据是否有手账记录区分交互
				const journals = this.journalStore.getJournalsByLocation(loc.id)
				if (journals.length === 0) {
					// 无手账记录：隐藏预览卡片，跳转到添加手账界面
					this.selectedLocation = null
					uni.navigateTo({
						url: '/pages/journal-edit/index?locationId=' + loc.id
					})
				} else {
					// 有手账记录：显示精简预览卡片
					this.selectedLocation = loc
				}
			}
		},
		goSearch() {
			uni.navigateTo({ url: '/pages/search/index' })
		},
		goLocationDetail() {
			if (this.selectedLocation) {
				uni.navigateTo({ url: '/pages/location-detail/index?id=' + this.selectedLocation.id })
			}
		},
		locate() {
			uni.getLocation({
				type: 'gcj02',
				success: (res) => {
					this.center = { latitude: res.latitude, longitude: res.longitude }
				},
				fail: () => {
					uni.showToast({ title: '获取定位失败', icon: 'none' })
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.page {
	width: 100%;
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: var(--bg);
	position: relative;
	overflow-x: hidden;
}

.statusbar-placeholder {
	width: 100%;
	flex-shrink: 0;
}

/* 地图区域：flex:1 占据剩余空间，与 TabBar 各自独立，互不覆盖 */
.map-area {
	flex: 1;
	position: relative;
	overflow: hidden;
}

.map {
	width: 100%;
	height: 100%;
}

/* 搜索栏 —— cover-view 覆盖在原生 map 上 */
.map-search {
	position: absolute;
	top: 24rpx;
	left: 32rpx;
	right: 32rpx;
	z-index: 3;
	display: flex;
	flex-direction: row;
	align-items: center;
	background: #FFFFFF;
	border: 1rpx solid #EDEAE5;
	border-radius: 24rpx;
	padding: 18rpx 24rpx;
}

.map-search-icon {
	width: 32rpx;
	height: 32rpx;
	margin-right: 16rpx;
}

.map-search-text {
	font-size: 28rpx;
	color: #A5A09A;
	line-height: 1.5;
}

/* 定位按钮 —— cover-view，使用强调色背景 */
.locate-btn {
	position: absolute;
	right: 32rpx;
	bottom: 300rpx;
	z-index: 3;
	width: 80rpx;
	height: 80rpx;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.locate-icon {
	width: 36rpx;
	height: 36rpx;
}

/* 底部信息卡片 —— cover-view */
.map-card {
	position: absolute;
	bottom: 32rpx;
	left: 32rpx;
	right: 32rpx;
	z-index: 3;
	background: #FFFFFF;
	border: 1rpx solid #EDEAE5;
	border-radius: 36rpx;
	padding: 24rpx;
}

.mc-row {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.mc-thumb {
	width: 104rpx;
	height: 104rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

/* cover-view 在部分小程序平台不支持 linear-gradient，使用纯色保证兼容 */
.mc-thumb.ph-warm { background: #E3BFB4; }
.mc-thumb.ph-blue { background: #ADC8E0; }
.mc-thumb.ph-lavender { background: #C4B6D8; }
.mc-thumb.ph-green { background: #AFCFA6; }
.mc-thumb.ph-gold { background: #D8C5A8; }

.mc-thumb-icon {
	width: 32rpx;
	height: 32rpx;
}

.mc-thumb-img {
	width: 100%;
	height: 100%;
	border-radius: 20rpx;
}

.mc-info {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.mc-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #2D2A26;
	line-height: 1.5;
}

.mc-sub {
	font-size: 24rpx;
	color: #7A756F;
	line-height: 1.5;
	margin-top: 4rpx;
}

.mc-rating {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-top: 4rpx;
}

.mc-score {
	font-size: 30rpx;
	font-weight: 700;
	color: #D9A54A;
	margin-right: 16rpx;
}

.mc-stars {
	font-size: 22rpx;
	color: #D9A54A;
	letter-spacing: 2rpx;
}
</style>
