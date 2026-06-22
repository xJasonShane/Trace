<template>
	<view class="page">
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
			<cover-view class="map-search" @tap="goSearch">
				<cover-image class="map-search-icon" :src="iconSrc('search', '#A5A09A', 2)" />
				<cover-view class="map-search-text">搜索地点或回忆…</cover-view>
			</cover-view>

			<!-- 定位按钮 -->
			<cover-view class="locate-btn" @tap="locate">
				<cover-image class="locate-icon" :src="iconSrc('locate', '#6E6A65', 2)" />
			</cover-view>

			<!-- 底部信息卡片 -->
			<cover-view v-if="selectedLocation" class="map-card" @tap="goLocationDetail">
				<cover-view class="mc-row">
					<cover-view class="mc-thumb" :class="'ph-' + (selectedLocation.coverColor || 'warm')">
						<cover-image class="mc-thumb-icon" :src="iconSrc('mountain', '#FFFFFF', 1.4)" />
					</cover-view>
					<cover-view class="mc-info">
						<cover-view class="mc-name">{{ selectedLocation.name }}</cover-view>
						<cover-view class="mc-sub">{{ selectedLocation.journalCount || 0 }} 篇手账 · 最近 {{ lastVisitText }}</cover-view>
						<cover-view class="mc-rating">
							<cover-view class="mc-score">5.0</cover-view>
							<cover-view class="mc-stars">★★★★★</cover-view>
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
import { useLocationStore } from '@/store/location.js'
import dateUtil from '@/utils/date.js'

// cover-view 内部无法使用自定义组件，需内联 SVG 图标路径
const COVER_ICONS = {
	search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
	locate: '<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>',
	mountain: '<path d="M3 20l5.5-9 4 6 3-4.5 5.5 7.5z"/><circle cx="17" cy="7" r="2.5"/>'
}

export default {
	components: { TabBar, Icon, StarRating },
	setup() {
		const locationStore = useLocationStore()
		return { locationStore }
	},
	data() {
		return {
			statusBarHeight: 0,
			center: { latitude: 30.27, longitude: 120.15 },
			selectedLocation: null,
			// 默认示例地点（无数据时使用）
			defaultLocations: [
				{ id: 'demo1', name: '西湖断桥', latitude: 30.26, longitude: 120.15, coverColor: 'warm', journalCount: 12, lastVisitDate: '2024-12-15' },
				{ id: 'demo2', name: '太子湾公园', latitude: 30.23, longitude: 120.13, coverColor: 'blue', journalCount: 8, lastVisitDate: '2024-03-28' },
				{ id: 'demo3', name: '灵隐寺', latitude: 30.24, longitude: 120.10, coverColor: 'lavender', journalCount: 5, lastVisitDate: '2024-07-08' }
			]
		}
	},
	computed: {
		displayLocations() {
			const locs = this.locationStore.locations
			return locs && locs.length > 0 ? locs : this.defaultLocations
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
		lastVisitText() {
			if (!this.selectedLocation || !this.selectedLocation.lastVisitDate) return '暂无'
			return dateUtil.formatRelative(this.selectedLocation.lastVisitDate)
		}
	},
	onLoad() {
		const sys = uni.getSystemInfoSync()
		this.statusBarHeight = sys.statusBarHeight || 20
		if (this.displayLocations.length > 0) {
			this.selectedLocation = this.displayLocations[0]
		}
	},
	onShow() {
		if (this.displayLocations.length > 0 && !this.selectedLocation) {
			this.selectedLocation = this.displayLocations[0]
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
			const markerId = e.detail.markerId
			const idx = markerId - 1
			if (idx >= 0 && idx < this.displayLocations.length) {
				const loc = this.displayLocations[idx]
				this.selectedLocation = loc
				this.center = { latitude: Number(loc.latitude), longitude: Number(loc.longitude) }
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
	background: #FAF8F5;
	position: relative;
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

/* 定位按钮 —— cover-view */
.locate-btn {
	position: absolute;
	right: 32rpx;
	bottom: 300rpx;
	z-index: 3;
	width: 80rpx;
	height: 80rpx;
	background: #FFFFFF;
	border: 1rpx solid #EDEAE5;
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
