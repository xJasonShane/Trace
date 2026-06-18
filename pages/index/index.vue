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

			<!-- 搜索栏 -->
			<view class="map-search" @tap="goSearch">
				<view class="map-search-inner">
					<Icon name="search" :size="32" color="#A5A09A" :strokeWidth="2" />
					<text class="map-search-text">搜索地点或回忆…</text>
				</view>
			</view>

			<!-- 定位按钮 -->
			<view class="locate-btn" @tap="locate">
				<Icon name="locate" :size="36" color="#6E6A65" :strokeWidth="2" />
			</view>

			<!-- 底部信息卡片 -->
			<view v-if="selectedLocation" class="map-card" @tap="goLocationDetail">
				<view class="mc-row">
					<view class="mc-thumb" :class="'ph-' + (selectedLocation.coverColor || 'warm')">
						<Icon name="mountain" :size="32" color="#FFFFFF" :strokeWidth="1.4" />
					</view>
					<view class="mc-info">
						<text class="mc-name">{{ selectedLocation.name }}</text>
						<text class="mc-sub">{{ selectedLocation.journalCount || 0 }} 篇手账 · 最近 {{ lastVisitText }}</text>
						<view class="mc-rating">
							<text class="mc-score">5.0</text>
							<StarRating :modelValue="5" size="sm" readonly />
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- TabBar -->
		<TabBar :active="0" />
	</view>
</template>

<script>
import TabBar from '@/components/TabBar.vue'
import Icon from '@/components/Icon.vue'
import StarRating from '@/components/StarRating.vue'
import { useLocationStore } from '@/store/location.js'
import dateUtil from '@/utils/date.js'

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

.map-area {
	flex: 1;
	position: relative;
	overflow: hidden;
}

.map {
	width: 100%;
	height: 100%;
}

.map-search {
	position: absolute;
	top: 24rpx;
	left: 32rpx;
	right: 32rpx;
	z-index: 3;
}

.map-search-inner {
	display: flex;
	align-items: center;
	gap: 16rpx;
	background: #FFFFFF;
	border: 1rpx solid #EDEAE5;
	border-radius: 24rpx;
	padding: 18rpx 24rpx;
	box-shadow: 0 12rpx 48rpx rgba(0, 0, 0, 0.10);
}

.map-search-text {
	font-size: 28rpx;
	color: #A5A09A;
}

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
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
}

.map-card {
	position: absolute;
	bottom: 152rpx;
	left: 32rpx;
	right: 32rpx;
	z-index: 3;
	background: #FFFFFF;
	border: 1rpx solid #EDEAE5;
	border-radius: 36rpx;
	padding: 24rpx;
	box-shadow: 0 12rpx 48rpx rgba(0, 0, 0, 0.10);
}

.mc-row {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.mc-thumb {
	width: 104rpx;
	height: 104rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.mc-thumb.ph-warm { background: linear-gradient(135deg, #EDCFC6, #D9AFA2); }
.mc-thumb.ph-blue { background: linear-gradient(135deg, #BDD3E8, #9DBBD8); }
.mc-thumb.ph-lavender { background: linear-gradient(135deg, #D2C5E2, #B5A8CE); }
.mc-thumb.ph-green { background: linear-gradient(135deg, #C0D9B8, #9EC594); }
.mc-thumb.ph-gold { background: linear-gradient(135deg, #E2D4B8, #CEBC98); }

.mc-info {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.mc-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #2D2A26;
}

.mc-sub {
	font-size: 24rpx;
	color: #7A756F;
}

.mc-rating {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-top: 4rpx;
}

.mc-score {
	font-family: ui-monospace, 'SF Mono', monospace;
	font-size: 30rpx;
	font-weight: 700;
	color: #D9A54A;
}
</style>
