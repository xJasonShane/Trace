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
				@tap="onMapTap"
				@click="onMapTap"
				show-location
			></map>

			<!-- 搜索栏（使用 cover-view 覆盖原生 map 组件） -->
			<cover-view class="map-search" :style="coverBoxStyle" @tap="goSearch">
				<cover-image class="map-search-icon" :src="iconSrc('search', searchIconColor, 2)" />
				<cover-view class="map-search-text" :style="coverSubStyle">搜索地点或回忆…</cover-view>
			</cover-view>

			<!-- 定位按钮 -->
			<cover-view class="map-locate-btn" :style="coverBoxStyle" @tap="locateCurrent">
				<cover-image class="map-locate-icon" :src="iconSrc('locate', locateIconColor, 2)" />
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
	mountain: '<path d="M3 20l5.5-9 4 6 3-4.5 5.5 7.5z"/><circle cx="17" cy="7" r="2.5"/>',
	locate: '<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>',
	plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'
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
			selectedLocation: null,
			markerTapPending: false
		}
	},
	computed: {
		searchIconColor() {
			return this.themeClass === 'theme-dark' ? '#6E6A65' : '#A5A09A'
		},
		locateIconColor() {
			return this.themeClass === 'theme-dark' ? '#A5A09A' : '#7A756F'
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
			// 标记为 marker 点击，防止 onMapTap 误触发
			this.markerTapPending = true
			setTimeout(() => { this.markerTapPending = false }, 300)

			// 确保 markerId 为数字类型（不同平台可能返回字符串）
			const detail = e.detail || e.mp && e.mp.detail || {}
			const markerId = Number(detail.markerId)
			if (isNaN(markerId)) {
				console.warn('[onMarkerTap] 无效的 markerId:', detail.markerId)
				return
			}
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
			} else {
				console.warn('[onMarkerTap] marker索引越界: idx=' + idx + ', locations.length=' + this.displayLocations.length)
			}
		},
		// 点击地图空白区域 — 添加新地点
		onMapTap(e) {
			if (this.markerTapPending) return
			// 兼容不同平台的事件数据格式：uni-app 下为 e.detail，微信小程序下可能为 e.mp.detail
			const detail = e.detail || (e.mp && e.mp.detail) || {}
			const lat = Number(detail.latitude)
			const lng = Number(detail.longitude)
			if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
				console.warn('[onMapTap] 未获取到有效坐标:', detail)
				return
			}
			// 跳转到新建手账页，携带坐标
			uni.navigateTo({
				url: '/pages/journal-edit/index?lat=' + lat + '&lng=' + lng
			})
		},
		// 定位到当前位置
		locateCurrent() {
			uni.getLocation({
				type: 'gcj02',
				success: (res) => {
					this.center = {
						latitude: res.latitude,
						longitude: res.longitude
					}
				},
				fail: () => {
					uni.showToast({ title: '定位失败，请检查定位权限', icon: 'none' })
				}
			})
		},
		goSearch() {
			uni.navigateTo({ url: '/pages/search/index' })
		},
		goLocationDetail() {
			if (this.selectedLocation) {
				uni.navigateTo({ url: '/pages/location-detail/index?id=' + this.selectedLocation.id })
			}
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

/* 定位按钮 */
.map-locate-btn {
	position: absolute;
	top: 24rpx;
	right: 32rpx;
	z-index: 3;
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #FFFFFF;
	border: 1rpx solid #EDEAE5;
}

.map-locate-icon {
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
