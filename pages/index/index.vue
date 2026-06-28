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
				@callouttap="onMarkerTap"
				@tap="onMapTap"
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

			<!-- 遮罩层：卡片展开时显示，点击可关闭 -->
			<cover-view
				v-if="cardVisible"
				class="map-overlay"
				:style="overlayStyle"
				:animation="overlayAnimationData"
				@tap="dismissCard"
			/>

			<!-- 底部信息卡片 —— 缩略二级页面 -->
			<cover-view
				v-if="cardVisible"
				class="map-card"
				:style="coverBoxStyle"
				:animation="cardAnimationData"
			>
				<!-- 拖拽手柄 -->
				<cover-view class="mc-handle">
					<cover-view class="mc-handle-bar" />
				</cover-view>

				<!-- 手账封面图 -->
				<cover-view class="mc-cover">
					<cover-image
						v-if="recentJournalPhoto"
						class="mc-cover-img"
						:src="recentJournalPhoto"
					/>
					<cover-view v-else class="mc-cover-placeholder" :class="'ph-' + (selectedLocation.coverColor || 'warm')">
						<cover-image class="mc-cover-icon" :src="iconSrc('mountain', '#FFFFFF', 1.4)" />
					</cover-view>
				</cover-view>

				<!-- 手账标题 -->
				<cover-view class="mc-title" :style="coverNameStyle">{{ recentJournalTitle }}</cover-view>

				<!-- 地点名称 & 日期 -->
				<cover-view class="mc-meta" :style="coverSubStyle">
					{{ selectedLocation.name }} · {{ recentJournalTimeText }}
				</cover-view>

				<!-- 统计数据 -->
				<cover-view class="mc-stats" :style="coverSubStyle">
					<cover-view class="mc-stat">{{ journalCount }} 篇手账</cover-view>
					<cover-view class="mc-stat-divide">·</cover-view>
					<cover-view class="mc-stat">{{ photoCount }} 张照片</cover-view>
					<cover-view class="mc-stat-divide">·</cover-view>
					<cover-view class="mc-stat">到访 {{ visitCount }} 次</cover-view>
				</cover-view>

				<!-- 评分区域 -->
				<cover-view class="mc-rating">
					<cover-view class="mc-score">{{ ratingText }}</cover-view>
					<cover-view class="mc-stars">{{ starsText }}</cover-view>
				</cover-view>

				<!-- 内容摘要 -->
				<cover-view class="mc-excerpt" :style="coverSubStyle">{{ recentJournalExcerpt }}</cover-view>

				<!-- 操作按钮 -->
				<cover-view class="mc-actions">
					<cover-view class="mc-btn mc-btn-primary" @tap="goLocationDetail">
						<cover-view class="mc-btn-text">查看全部手账</cover-view>
					</cover-view>
					<cover-view class="mc-btn mc-btn-outline" @tap="goNewJournal">
						<cover-view class="mc-btn-text-outline">写新手账</cover-view>
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
import themeMixin from '@/mixins/theme.js'
import statusbarMixin from '@/mixins/statusbar.js'
import { useLocationStore } from '@/store/location.js'
import { useJournalStore } from '@/store/journal.js'
import { MOOD_COLOR_HEX } from '@/constants/mood.js'
import dateUtil from '@/utils/date.js'

// cover-view 内部无法使用自定义组件，需内联 SVG 图标路径
const COVER_ICONS = {
	search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
	mountain: '<path d="M3 20l5.5-9 4 6 3-4.5 5.5 7.5z"/><circle cx="17" cy="7" r="2.5"/>',
	locate: '<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>',
	plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'
}

export default {
	components: { TabBar },
	mixins: [themeMixin, statusbarMixin],
	setup() {
		const locationStore = useLocationStore()
		const journalStore = useJournalStore()
		return { locationStore, journalStore }
	},
	data() {
		return {
			center: { latitude: 30.27, longitude: 120.15 },
			selectedLocation: null,
			markerTapPending: false,
			cardVisible: false,
			cardAnimationData: null,
			overlayAnimationData: null
		}
	},
	computed: {
		searchIconColor() {
			return this.themeTertiaryColor
		},
		locateIconColor() {
			return this.themeSecondaryColor
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
		// 当前选中地点的评分（复用 selectedLocationJournals 缓存，避免重复查询）
		currentRating() {
			const journals = this.selectedLocationJournals
			if (journals.length === 0) return 0
			const sum = journals.reduce((s, j) => s + (j.overallRating || 0), 0)
			return Math.round((sum / journals.length) * 10) / 10
		},
		// 选中地点的手账数量
		journalCount() {
			return this.selectedLocationJournals.length
		},
		// 选中地点的照片总数
		photoCount() {
			return this.selectedLocationJournals.reduce((sum, j) => sum + (j.photos ? j.photos.length : 0), 0)
		},
		// 选中地点的到访次数
		visitCount() {
			return this.selectedLocation ? (this.selectedLocation.visitCount || 1) : 0
		},
		ratingText() {
			return this.currentRating > 0 ? this.currentRating.toFixed(1) : '暂无'
		},
		starsText() {
			if (this.currentRating === 0) return ''
			const full = Math.round(this.currentRating)
			return '★★★★★'.slice(0, Math.max(1, Math.min(5, full)))
		},
		// 最近一篇手账的标题
		recentJournalTitle() {
			const journals = this.selectedLocationJournals
			return journals.length > 0 ? journals[0].title : ''
		},
		// 最近一篇手账的内容摘要（截取前80字）
		recentJournalExcerpt() {
			const journals = this.selectedLocationJournals
			if (journals.length === 0) return ''
			const content = journals[0].content || ''
			return content.length > 80 ? content.slice(0, 80) + '…' : content
		},
		// 遮罩层样式
		overlayStyle() {
			return 'background: rgba(0, 0, 0, 0.4);'
		}
	},
	onLoad() {
		// statusBarHeight 由 statusbarMixin 提供
	},
	onShow() {
		// 从二级页面返回时，刷新选中地点数据（手账可能已变更）
		if (this.selectedLocation) {
			const loc = this.locationStore.getLocation(this.selectedLocation.id)
			if (!loc) {
				// 地点已被删除
				this.cardVisible = false
				this.selectedLocation = null
			} else {
				const journals = this.journalStore.getJournalsByLocation(loc.id)
				if (journals.length === 0) {
					// 地点已无手账，清除选中状态
					this.cardVisible = false
					this.selectedLocation = null
				} else {
					// 更新为最新的地点对象引用
					this.selectedLocation = loc
				}
			}
		}
	},
	onUnload() {
		// 清理所有定时器，避免页面销毁后回调残留
		clearTimeout(this._markerTapTimer)
		clearTimeout(this._cardEnterTimer)
		clearTimeout(this._cardExitTimer)
	},
	methods: {
		// 生成 SVG data URI，供 cover-image 使用
		iconSrc(name, color, strokeWidth) {
			const paths = COVER_ICONS[name] || ''
			const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${color}' stroke-width='${strokeWidth}' stroke-linecap='round' stroke-linejoin='round'>${paths}</svg>`
			return 'data:image/svg+xml,' + encodeURIComponent(svg)
		},
		// marker 图标点击与 callout 气泡点击共用同一处理逻辑
		// callout 设置为 display:'ALWAYS' 常驻显示，会覆盖 marker 图标的点击区域，
		// 因此必须同时监听 @markertap 与 @callouttap，否则点击气泡将无响应
		onMarkerTap(e) {
			// 标记为 marker 点击，防止 onMapTap 误触发
			// 由于部分平台事件顺序为 tap -> markertap/callouttap，
			// 此标志位需在事件最早阶段设置，配合 onMapTap 内的延迟校验
			this.markerTapPending = true
			clearTimeout(this._markerTapTimer)
			this._markerTapTimer = setTimeout(() => { this.markerTapPending = false }, 400)

			// 兼容 markertap / callouttap 两种事件及多平台数据格式
			const detail = (e && (e.detail || (e.mp && e.mp.detail))) || {}
			const markerId = Number(detail.markerId)
			// marker id 从 1 开始，0 或 NaN 均视为无效
			if (!markerId || isNaN(markerId)) {
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
					// 无手账记录：直接跳转新建手账页（与空白区域点击创建手账流程一致）
					uni.navigateTo({
						url: '/pages/journal-edit/index?locationId=' + loc.id
					})
				} else {
					// 有手账记录：展开缩略二级页面，卡片内提供「写新手账」入口
					this.selectedLocation = loc
					this.cardVisible = true
					// 延迟一帧执行动画，确保原生 cover-view 渲染完成，避免首帧掉帧卡顿
					this._cardEnterTimer = setTimeout(() => {
						this.runCardEnterAnimation()
					}, 30)
				}
			} else {
				console.warn('[onMarkerTap] marker索引越界: idx=' + idx + ', locations.length=' + this.displayLocations.length)
			}
		},
		// 点击地图空白区域 — 添加新地点
		onMapTap(e) {
			// marker/callout 点击后短时屏蔽 map 空白点击，避免事件冒泡误触发新建流程
			if (this.markerTapPending) return
			// 兼容不同平台的事件数据格式：uni-app 下为 e.detail，微信小程序下可能为 e.mp.detail
			const detail = (e && (e.detail || (e.mp && e.mp.detail))) || {}
			// 仅当 detail 明确携带坐标时才转换；缺失字段直接判为无效，避免 Number(undefined)=NaN
			const lat = detail.latitude != null ? Number(detail.latitude) : NaN
			const lng = detail.longitude != null ? Number(detail.longitude) : NaN
			// 用 isNaN 判定，避免原代码 !lat 在赤道/本初子午线（lat=0 或 lng=0）处的误判
			if (isNaN(lat) || isNaN(lng)) {
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
		// 卡片进入动画：从底部滑入 + 遮罩淡入
		runCardEnterAnimation() {
			const animation = uni.createAnimation({
				duration: 350,
				timingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)'
			})
			// 遮罩淡入
			const overlayAnim = uni.createAnimation({ duration: 300 })
			overlayAnim.opacity(1).step()
			this.overlayAnimationData = overlayAnim.export()

			// 卡片从底部滑入
			animation.translateY(0).opacity(1).step()
			this.cardAnimationData = animation.export()
		},
		// 卡片退出动画：滑回底部 + 遮罩淡出
		runCardExitAnimation(callback) {
			const animation = uni.createAnimation({
				duration: 300,
				timingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)'
			})
			const overlayAnim = uni.createAnimation({ duration: 250 })
			overlayAnim.opacity(0).step()
			this.overlayAnimationData = overlayAnim.export()

			// 退出距离使用整个窗口高度，确保卡片完全移出屏幕底部
			const windowHeight = uni.getSystemInfoSync().windowHeight
			animation.translateY(windowHeight).opacity(0).step()
			this.cardAnimationData = animation.export()

			this._cardExitTimer = setTimeout(() => {
				this.cardVisible = false
				this.selectedLocation = null
				if (callback) callback()
			}, 300)
		},
		// 关闭卡片（点击遮罩层）
		dismissCard() {
			this.runCardExitAnimation()
		},
		// 从卡片内跳转新建手账（先收起卡片再跳转）
		goNewJournal() {
			const locId = this.selectedLocation ? this.selectedLocation.id : ''
			this.runCardExitAnimation(() => {
				uni.navigateTo({
					url: '/pages/journal-edit/index?locationId=' + locId
				})
			})
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
	padding: 24rpx 32rpx;
}

.map-search-icon {
	width: 32rpx;
	height: 32rpx;
	margin-right: 16rpx;
}

.map-search-text {
	font-size: 28rpx;
	color: #A5A09A;
	line-height: 32rpx;
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

/* 遮罩层 */
.map-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 4;
	opacity: 0;
}

/* 底部信息卡片 —— 缩略二级页面 */
.map-card {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 5;
	background: #FFFFFF;
	border-radius: 36rpx 36rpx 0 0;
	padding: 16rpx 32rpx 48rpx;
	transform: translateY(100%);
	opacity: 0;
}

/* 拖拽手柄 */
.mc-handle {
	display: flex;
	justify-content: center;
	padding: 12rpx 0 20rpx;
}

.mc-handle-bar {
	width: 64rpx;
	height: 8rpx;
	background: #E0DCD7;
	border-radius: 4rpx;
}

/* 封面图 */
.mc-cover {
	width: 100%;
	height: 320rpx;
	border-radius: 24rpx;
	overflow: hidden;
	margin-bottom: 24rpx;
}

.mc-cover-img {
	width: 100%;
	height: 100%;
}

.mc-cover-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.mc-cover-placeholder.ph-warm { background: #E3BFB4; }
.mc-cover-placeholder.ph-blue { background: #ADC8E0; }
.mc-cover-placeholder.ph-lavender { background: #C4B6D8; }
.mc-cover-placeholder.ph-green { background: #AFCFA6; }
.mc-cover-placeholder.ph-gold { background: #D8C5A8; }

.mc-cover-icon {
	width: 64rpx;
	height: 64rpx;
}

/* 标题 */
.mc-title {
	font-size: 34rpx;
	font-weight: 700;
	line-height: 44rpx;
	margin-bottom: 8rpx;
}

/* 元信息 */
.mc-meta {
	font-size: 24rpx;
	line-height: 32rpx;
	margin-bottom: 12rpx;
}

/* 统计数据行 */
.mc-stats {
	display: flex;
	flex-direction: row;
	align-items: center;
	flex-wrap: wrap;
	margin-bottom: 16rpx;
}

.mc-stat {
	font-size: 22rpx;
	line-height: 30rpx;
}

.mc-stat-divide {
	font-size: 22rpx;
	line-height: 30rpx;
	margin: 0 10rpx;
	opacity: 0.5;
}

/* 评分 */
.mc-rating {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 16rpx;
}

.mc-score {
	font-size: 36rpx;
	font-weight: 700;
	color: #D9A54A;
	margin-right: 16rpx;
}

.mc-stars {
	font-size: 28rpx;
	color: #D9A54A;
	letter-spacing: 4rpx;
}

/* 摘要 */
.mc-excerpt {
	font-size: 26rpx;
	line-height: 38rpx;
	margin-bottom: 24rpx;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 3;
	overflow: hidden;
}

/* 操作按钮 */
.mc-actions {
	display: flex;
	flex-direction: row;
	gap: 20rpx;
}

.mc-btn {
	flex: 1;
	height: 80rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.mc-btn-primary {
	background: #E09080;
}

.mc-btn-text {
	font-size: 28rpx;
	font-weight: 600;
	color: #FFFFFF;
}

.mc-btn-outline {
	background: transparent;
	border: 2rpx solid #E09080;
}

.mc-btn-text-outline {
	font-size: 28rpx;
	font-weight: 600;
	color: #E09080;
}
</style>
