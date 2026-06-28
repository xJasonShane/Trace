<template>
	<view class="page" :class="themeClass">
		<!-- Hero 区域 -->
		<view class="hero">
			<view class="status-bar-spacer" :style="{ height: statusBarHeight + 'px' }"></view>
			<view class="hero-content">
				<view class="hero-pattern"></view>
				<view class="hero-icon">
					<Icon name="mountain" :size="96" color="#FFFFFF" :strokeWidth="1.4" />
				</view>
				<view class="hero-nav">
					<view class="nav-btn" @tap="goBack">
						<Icon name="back" :size="32" :color="themeFgColor" :strokeWidth="2" />
					</view>
					<view class="nav-btn" @tap="showMore">
						<Icon name="more" :size="32" :color="themeFgColor" :strokeWidth="2" />
					</view>
				</view>
			</view>
		</view>

		<!-- 地点信息 -->
		<view v-if="location" class="info-section">
			<view class="info-title">{{ location.name }}</view>
			<view class="info-sub">{{ location.address || '暂无地址' }} · 最近到访 {{ lastVisitDate }}</view>
			<view class="rating-row">
				<text class="rating-score">{{ overallRating }}</text>
				<StarRating :modelValue="overallRating" readonly size="sm" />
			</view>
		</view>

		<!-- 统计卡片 -->
		<view v-if="location" class="stats-card">
			<view class="stat">
				<text class="stat-val">{{ journalCount }}</text>
				<text class="stat-lbl">手账数</text>
			</view>
			<view class="stat">
				<text class="stat-val">{{ photoCount }}</text>
				<text class="stat-lbl">照片数</text>
			</view>
			<view class="stat">
				<text class="stat-val">{{ visitCount }}</text>
				<text class="stat-lbl">到访次数</text>
			</view>
		</view>

		<!-- 手账列表 -->
		<view v-if="location" class="journal-list">
			<view class="section-label">手账记录</view>
			<view
				v-for="(journal, index) in journals"
				:key="journal.id"
				class="journal-item"
				@tap="goToJournal(journal.id)"
			>
				<view class="ji-thumb" :class="'ph-' + getThumbClass(journal)">
					<image
						v-if="journal.photos && journal.photos.length > 0"
						:src="journal.photos[0]"
						mode="aspectFill"
						class="ji-thumb-img"
						lazy-load
					/>
					<Icon v-else name="mountain" :size="36" color="#FFFFFF" :strokeWidth="1.4" />
				</view>
				<view class="ji-body">
					<text class="ji-title">{{ journal.title }}</text>
					<text class="ji-excerpt">{{ journal.content || '暂无内容' }}</text>
					<text class="ji-date">{{ formatDate(journal.createdAt) }}</text>
				</view>
			</view>
			<view v-if="journals.length === 0" class="empty-state">
				<view class="empty-icon">
					<Icon name="emptyJournal" :size="72" :color="themeTertiaryColor" :strokeWidth="1.4" />
				</view>
				<text class="empty-title">还没有手账记录</text>
				<text class="empty-hint">点击右下角按钮，记录第一篇手账</text>
			</view>
		</view>

		<!-- 错误状态 -->
		<view v-if="!location && loaded" class="error-state">
			<text class="error-title">地点不存在</text>
			<text class="error-hint">该地点可能已被删除</text>
			<view class="error-btn" @tap="goBack">返回上一页</view>
		</view>

		<!-- FAB 按钮 -->
		<view v-if="location" class="fab" @tap="goToNewJournal">
			<Icon name="plus" :size="48" color="#FFFFFF" :strokeWidth="2" />
		</view>
	</view>
</template>

<script>
import Icon from '@/components/Icon.vue'
import StarRating from '@/components/StarRating.vue'
import { useJournalStore } from '@/store/journal.js'
import { useLocationStore } from '@/store/location.js'
import dateUtil from '@/utils/date.js'
import themeMixin from '@/mixins/theme.js'
import { getMoodColor } from '@/constants/mood.js'

export default {
	components: { Icon, StarRating },
	mixins: [themeMixin],
	setup() {
		const journalStore = useJournalStore()
		const locationStore = useLocationStore()
		return { journalStore, locationStore }
	},
	data() {
		return {
			locationId: '',
			statusBarHeight: 0,
			loaded: false
		}
	},
	created() {
		this._timers = []
	},
	onUnload() {
		if (this._timers) {
			this._timers.forEach(id => clearTimeout(id))
			this._timers = []
		}
	},
	computed: {
		location() {
			if (!this.locationId) return null
			return this.locationStore.getLocation(this.locationId)
		},
		journals() {
			if (!this.locationId) return []
			return this.journalStore.getJournalsByLocation(this.locationId)
		},
		overallRating() {
			if (this.journals.length === 0) return 0
			const sum = this.journals.reduce((s, j) => s + (j.overallRating || 0), 0)
			return Math.round((sum / this.journals.length) * 10) / 10
		},
		journalCount() {
			return this.journals.length
		},
		photoCount() {
			return this.journals.reduce((sum, j) => sum + (j.photos ? j.photos.length : 0), 0)
		},
		visitCount() {
			return this.location ? (this.location.visitCount || 0) : 0
		},
		lastVisitDate() {
			if (!this.location || !this.location.lastVisitDate) return '暂无'
			return dateUtil.formatDateDot(this.location.lastVisitDate)
		}
	},
	onLoad(options) {
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight || 20
		// 重置状态，避免上一次的预设数据残留
		this.locationId = ''
		this.loaded = false
		if (options && options.id) {
			this.locationId = options.id
		}
		this.loaded = true
	},
	onShow() {
		// 从编辑页返回时，校验当前地点是否仍然存在，避免显示已删除地点的残留数据
		if (this.locationId && !this.locationStore.getLocation(this.locationId)) {
			this.locationId = ''
			this.loaded = true
		}
	},
	methods: {
		goBack() {
			const pages = getCurrentPages()
			if (pages.length > 1) {
				uni.navigateBack()
			} else {
				uni.reLaunch({ url: '/pages/index/index' })
			}
		},
		goToJournal(id) {
			uni.navigateTo({
				url: '/pages/journal-detail/index?id=' + id
			})
		},
		goToNewJournal() {
			uni.navigateTo({
				url: '/pages/journal-edit/index?locationId=' + this.locationId
			})
		},
		showMore() {
			uni.showActionSheet({
				itemList: ['编辑地点信息', '删除地点'],
				success: (res) => {
					if (res.tapIndex === 0) {
						uni.showToast({ title: '编辑功能开发中', icon: 'none' })
					} else if (res.tapIndex === 1) {
						this.confirmDelete()
					}
				}
			})
		},
		confirmDelete() {
			uni.showModal({
				title: '删除地点',
				content: `确定要删除「${this.location.name}」吗？相关手账将保留但不再关联此地点。`,
				confirmColor: '#C8504A',
				success: (res) => {
					if (res.confirm) {
						this.locationStore.deleteLocation(this.locationId)
						uni.showToast({ title: '已删除', icon: 'success' })
						this._timers.push(setTimeout(() => this.goBack(), 1200))
					}
				}
			})
		},
		formatDate(date) {
			return dateUtil.formatDateDot(date)
		},
		getThumbClass(journal) {
			// 基于心情映射颜色，保证同一手账颜色稳定，不随列表顺序变化
			return getMoodColor(journal.mood)
		}
	}
}
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	background: var(--bg);
	padding-bottom: 200rpx;
}

/* Hero 区域 */
.hero {
	background: linear-gradient(135deg, #E0C5BB 0%, #D4B5AA 50%, #C8A599 100%);
}

.hero-content {
	height: 320rpx;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

.hero-pattern {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background:
		repeating-linear-gradient(0deg, transparent, transparent 36rpx, rgba(255, 255, 255, 0.12) 36rpx, rgba(255, 255, 255, 0.12) 38rpx),
		repeating-linear-gradient(90deg, transparent, transparent 36rpx, rgba(255, 255, 255, 0.06) 36rpx, rgba(255, 255, 255, 0.06) 38rpx);
	pointer-events: none;
}

.hero-icon {
	opacity: 0.3;
	position: relative;
	z-index: 1;
}

.hero-nav {
	position: absolute;
	top: 24rpx;
	left: 24rpx;
	right: 24rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	z-index: 2;
}

.nav-btn {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.85);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

/* 地点信息 */
.info-section {
	padding: 28rpx 32rpx 0;
}

.info-title {
	font-size: 40rpx;
	font-weight: 600;
	color: var(--fg);
	letter-spacing: -0.02em;
	margin-bottom: 8rpx;
}

.info-sub {
	font-size: 26rpx;
	color: var(--text-secondary);
	margin-bottom: 20rpx;
}

.rating-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 8rpx;
}

.rating-score {
	font-family: ui-monospace, 'SF Mono', monospace;
	font-size: 36rpx;
	font-weight: 700;
	color: var(--star-active);
	letter-spacing: -0.02em;
}

/* 统计卡片 */
.stats-card {
	display: flex;
	background: var(--surface);
	border: 1rpx solid var(--border);
	border-radius: 28rpx;
	padding: 28rpx 0;
	margin: 24rpx 32rpx 0;
	box-shadow: 0 2rpx 16rpx var(--shadow);
}

.stat {
	flex: 1;
	text-align: center;
	position: relative;
}

.stat + .stat {
	border-left: 1rpx solid var(--border);
}

.stat-val {
	font-family: ui-monospace, 'SF Mono', monospace;
	font-size: 44rpx;
	font-weight: 800;
	color: var(--primary);
	letter-spacing: -0.02em;
	line-height: 1;
	display: block;
}

.stat-lbl {
	font-size: 22rpx;
	color: var(--text-secondary);
	margin-top: 8rpx;
	font-weight: 500;
	display: block;
}

/* 手账列表 */
.journal-list {
	padding: 32rpx;
}

.section-label {
	font-size: 32rpx;
	font-weight: 600;
	color: var(--fg);
	margin-bottom: 20rpx;
	padding-left: 8rpx;
	display: flex;
	align-items: center;
	gap: 16rpx;
	letter-spacing: -0.01em;
}

.section-label::before {
	content: '';
	display: inline-block;
	width: 8rpx;
	height: 32rpx;
	background: var(--primary);
	border-radius: 4rpx;
}

.journal-item {
	display: flex;
	gap: 20rpx;
	align-items: flex-start;
	padding: 24rpx 0;
	border-bottom: 1rpx solid var(--border);
}

.journal-item:last-child {
	border-bottom: none;
}

.ji-thumb {
	width: 112rpx;
	height: 112rpx;
	border-radius: 20rpx;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

.ji-thumb-img {
	width: 100%;
	height: 100%;
}

.ji-body {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
}

.ji-title {
	font-size: 28rpx;
	font-weight: 600;
	color: var(--fg);
	margin-bottom: 6rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.ji-excerpt {
	font-size: 24rpx;
	color: var(--text-secondary);
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	line-height: 1.5;
}

.ji-date {
	font-size: 22rpx;
	color: var(--text-tertiary);
	margin-top: 8rpx;
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 24rpx;
	text-align: center;
}

.empty-icon {
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
	background: var(--input-bg);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 24rpx;
}

.empty-title {
	font-size: 30rpx;
	font-weight: 600;
	color: var(--fg);
	margin-bottom: 8rpx;
}

.empty-hint {
	font-size: 24rpx;
	color: var(--text-secondary);
}

/* 错误状态（基础样式复用全局 .error-state，此处仅覆盖间距） */
.error-state {
	padding: 120rpx 24rpx;
}

/* FAB 按钮（覆盖全局 .fab 的 bottom 与 z-index） */
.fab {
	right: 32rpx;
	bottom: 64rpx;
	z-index: 100;
}
</style>
