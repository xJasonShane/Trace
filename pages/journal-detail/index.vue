<template>
	<view class="page">
		<!-- Hero 区域 -->
		<view class="hero">
			<view class="status-bar-spacer" :style="{ height: statusBarHeight + 'px' }"></view>
			<view class="hero-content">
				<view class="hero-pattern"></view>
				<view class="hero-icon">
					<Icon name="mountain" :size="80" color="#C09080" :strokeWidth="1.4" />
				</view>
				<view class="hero-nav">
					<view class="nav-btn" @tap="goBack">
						<Icon name="back" :size="32" color="#2D2A26" :strokeWidth="2" />
					</view>
					<view class="nav-btn" @tap="goToEdit">
						<Icon name="edit" :size="30" color="#2D2A26" :strokeWidth="2" />
					</view>
				</view>
			</view>
		</view>

		<!-- 手账内容 -->
		<view v-if="journal" class="content">
			<!-- 标题与元信息 -->
			<view class="title-section">
				<text class="title">{{ journal.title }}</text>
				<view class="meta">
					<text class="meta-item">{{ formatDate(journal.createdAt) }}</text>
					<text class="meta-divider">·</text>
					<text class="meta-item">{{ journal.locationName || '未知地点' }}</text>
				</view>
			</view>

			<!-- 标签行 -->
			<view class="tags-row">
				<view class="mood-pill">
					<text class="mood-emoji">{{ journal.mood }}</text>
					<text class="mood-text">{{ moodLabel }}</text>
				</view>
				<view
					v-for="(tag, index) in journal.tags"
					:key="index"
					class="tag-item"
				>
					<text>{{ tag }}</text>
				</view>
			</view>

			<!-- 正文内容 -->
			<view class="content-text">{{ journal.content }}</view>

			<!-- 照片网格 -->
			<view v-if="journal.photos && journal.photos.length > 0" class="photo-grid">
				<view
					v-for="(photo, index) in journal.photos"
					:key="index"
					class="photo-item"
					@tap="previewPhoto(index)"
				>
					<image :src="photo" mode="aspectFill" class="photo-img" />
				</view>
			</view>

			<!-- 评分卡片 -->
			<view class="rating-card">
				<view class="rc-score">{{ overallRating }}</view>
				<view class="rc-body">
					<StarRating :modelValue="overallRating" readonly size="sm" />
					<text class="rc-label">心情 · {{ moodLabel }}</text>
				</view>
			</view>

			<!-- 评分维度 -->
			<view class="dim-ratings">
				<view class="dim-title">评分维度</view>
				<view
					v-for="dim in ratingDimensions"
					:key="dim.key"
					class="dim-row"
				>
					<text class="dim-label">{{ dim.label }}</text>
					<StarRating :modelValue="getRating(dim.key)" readonly size="sm" />
				</view>
			</view>
		</view>

		<!-- 错误状态 -->
		<view v-if="!journal && loaded" class="error-state">
			<text class="error-title">手账不存在</text>
			<text class="error-hint">该手账可能已被删除</text>
			<view class="error-btn" @tap="goBack">返回上一页</view>
		</view>
	</view>
</template>

<script>
import Icon from '@/components/Icon.vue'
import StarRating from '@/components/StarRating.vue'
import { useJournalStore } from '@/store/journal.js'
import dateUtil from '@/utils/date.js'

export default {
	components: { Icon, StarRating },
	data() {
		return {
			journalStore: useJournalStore(),
			journalId: '',
			statusBarHeight: 0,
			loaded: false,
			moodLabels: {
				'😊': '愉快',
				'🌸': '美好',
				'☀️': '阳光',
				'🌙': '宁静',
				'🍂': '怀旧'
			},
			ratingDimensions: [
				{ key: 'environment', label: '环境' },
				{ key: 'scenery', label: '风景' },
				{ key: 'transport', label: '交通' },
				{ key: 'experience', label: '体验' }
			]
		}
	},
	computed: {
		journal() {
			if (!this.journalId) return null
			return this.journalStore.getJournal(this.journalId)
		},
		overallRating() {
			if (!this.journal) return 0
			if (this.journal.overallRating) return this.journal.overallRating
			if (this.journal.ratings) {
				const vals = Object.values(this.journal.ratings)
				if (vals.length === 0) return 0
				return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
			}
			return 0
		},
		moodLabel() {
			if (!this.journal || !this.journal.mood) return '未设置'
			return this.moodLabels[this.journal.mood] || '未设置'
		}
	},
	onLoad(options) {
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight || 20
		if (options && options.id) {
			this.journalId = options.id
		}
		this.loaded = true
	},
	onShow() {
		// 从编辑页返回时刷新数据
		this.$forceUpdate()
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
		goToEdit() {
			uni.navigateTo({
				url: '/pages/journal-edit/index?id=' + this.journalId
			})
		},
		previewPhoto(index) {
			if (this.journal && this.journal.photos && this.journal.photos.length > 0) {
				uni.previewImage({
					urls: this.journal.photos,
					current: this.journal.photos[index]
				})
			}
		},
		getRating(key) {
			if (!this.journal || !this.journal.ratings) return 0
			return this.journal.ratings[key] || 0
		},
		formatDate(date) {
			return dateUtil.formatDateDot(date)
		}
	}
}
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	background: #FAF8F5;
	padding-bottom: 80rpx;
}

/* Hero 区域 */
.hero {
	background: linear-gradient(135deg, #EDCFC6 0%, #D9AFA2 100%);
}

.hero-content {
	height: 360rpx;
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
		repeating-linear-gradient(0deg, transparent, transparent 40rpx, rgba(255, 255, 255, 0.1) 40rpx, rgba(255, 255, 255, 0.1) 42rpx),
		repeating-linear-gradient(90deg, transparent, transparent 40rpx, rgba(255, 255, 255, 0.05) 40rpx, rgba(255, 255, 255, 0.05) 42rpx);
	pointer-events: none;
}

.hero-icon {
	opacity: 0.4;
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

/* 内容区 */
.content {
	padding: 32rpx;
}

/* 标题与元信息 */
.title-section {
	margin-bottom: 20rpx;
}

.title {
	font-size: 40rpx;
	font-weight: 600;
	color: #2D2A26;
	letter-spacing: -0.01em;
	margin-bottom: 12rpx;
	display: block;
	line-height: 1.3;
}

.meta {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.meta-item {
	font-size: 24rpx;
	color: #7A756F;
}

.meta-divider {
	font-size: 24rpx;
	color: #A5A09A;
}

/* 标签行 */
.tags-row {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-bottom: 24rpx;
}

.mood-pill {
	display: inline-flex;
	align-items: center;
	gap: 8rpx;
	padding: 8rpx 20rpx;
	background: rgba(224, 144, 128, 0.15);
	color: #E09080;
	border-radius: 999rpx;
	font-size: 24rpx;
	font-weight: 500;
}

.mood-emoji {
	font-size: 28rpx;
	line-height: 1;
}

.mood-text {
	font-size: 24rpx;
}

.tag-item {
	display: inline-flex;
	padding: 8rpx 20rpx;
	background: transparent;
	color: #7A756F;
	border: 1rpx solid #E0DCD7;
	border-radius: 999rpx;
	font-size: 24rpx;
	font-weight: 500;
}

/* 正文内容 */
.content-text {
	font-size: 30rpx;
	line-height: 1.7;
	color: #6E6A65;
	margin-bottom: 28rpx;
	letter-spacing: 0.01em;
}

/* 照片网格 */
.photo-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12rpx;
	margin-bottom: 28rpx;
}

.photo-item {
	height: 240rpx;
	border-radius: 20rpx;
	overflow: hidden;
	background: linear-gradient(135deg, #EDEAE5, #E0DCD7);
}

.photo-img {
	width: 100%;
	height: 100%;
}

/* 评分卡片 */
.rating-card {
	background: #FFFFFF;
	border: 1rpx solid #EDEAE5;
	border-radius: 36rpx;
	padding: 32rpx;
	display: flex;
	align-items: center;
	gap: 32rpx;
	margin-bottom: 20rpx;
	position: relative;
	overflow: hidden;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
}

.rating-card::before {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	width: 6rpx;
	background: linear-gradient(180deg, #D9A54A, #E09080);
	border-radius: 0 4rpx 4rpx 0;
}

.rc-score {
	font-family: ui-monospace, 'SF Mono', monospace;
	font-size: 72rpx;
	font-weight: 800;
	color: #D9A54A;
	line-height: 1;
	letter-spacing: -0.03em;
}

.rc-body {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.rc-label {
	font-size: 24rpx;
	color: #7A756F;
	font-weight: 500;
}

/* 评分维度 */
.dim-ratings {
	background: #FFFFFF;
	border: 1rpx solid #EDEAE5;
	border-radius: 36rpx;
	padding: 24rpx 32rpx;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
}

.dim-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #2D2A26;
	margin-bottom: 16rpx;
	padding-bottom: 16rpx;
	border-bottom: 1rpx solid #EDEAE5;
}

.dim-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #EDEAE5;
}

.dim-row:last-child {
	border-bottom: none;
	padding-bottom: 0;
}

.dim-label {
	font-size: 28rpx;
	color: #2D2A26;
	font-weight: 500;
}

/* 错误状态 */
.error-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 160rpx 24rpx;
	text-align: center;
}

.error-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #2D2A26;
	margin-bottom: 8rpx;
}

.error-hint {
	font-size: 26rpx;
	color: #7A756F;
	margin-bottom: 32rpx;
}

.error-btn {
	padding: 16rpx 48rpx;
	background: #E09080;
	color: #FFFFFF;
	border-radius: 999rpx;
	font-size: 28rpx;
	font-weight: 500;
}
</style>
