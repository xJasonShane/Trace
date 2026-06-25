<template>
	<view class="page" :class="themeClass">
		<!-- 状态栏占位 -->
		<view class="statusbar-placeholder" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部标题 + 搜索 -->
		<view class="list-header">
			<text class="list-title">我的手账</text>
			<view class="list-search" @tap="goSearch">
				<Icon name="search" :size="30" :color="searchIconColor" :strokeWidth="2" />
				<text class="list-search-text">搜索手账…</text>
			</view>
		</view>

		<!-- 筛选标签栏 -->
		<scroll-view class="filter-bar" scroll-x :show-scrollbar="false">
			<view
				v-for="f in filters"
				:key="f.value"
				class="filter-item"
				:class="{ active: currentFilter === f.value }"
				@tap="setFilter(f.value)"
			>
				<text>{{ f.label }}</text>
			</view>
		</scroll-view>

		<!-- 内容区 -->
		<scroll-view class="content" scroll-y>
			<!-- 空状态 -->
			<EmptyState
				v-if="filteredJournals.length === 0"
				icon="emptyJournal"
				title="还没有手账"
				description="去外面走走吧，记录你生活中的每一个温暖瞬间"
				actionText="写第一篇手账"
				@action="goNewJournal"
			/>

			<!-- 列表 -->
			<view v-else class="list-body">
				<view v-for="(group, label) in groupedFiltered" :key="label" class="list-date-group">
					<text class="list-date-label">{{ label }}</text>
					<view
						v-for="j in group"
						:key="j.id"
						class="list-card"
						@tap="goDetail(j.id)"
					>
						<view class="lc-thumb" :class="'ph-' + getColorClass(j)">
							<image
								v-if="j.photos && j.photos.length > 0 && !thumbFailed[j.id]"
								class="lc-thumb-img"
								:src="j.photos[0]"
								mode="aspectFill"
								@error="onThumbError(j)"
							/>
							<Icon v-else name="mountain" :size="32" color="#FFFFFF" :strokeWidth="1.4" />
						</view>
						<view class="lc-body">
							<text class="lc-title">{{ j.title }}</text>
							<text class="lc-loc">{{ j.locationName || '未知地点' }}</text>
							<text class="lc-date">{{ formatRelative(j.createdAt) }}</text>
						</view>
						<view class="lc-delete" @tap.stop="confirmDelete(j)">
							<Icon name="trash" :size="30" color="#C8504A" :strokeWidth="1.8" />
						</view>
					</view>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-pad"></view>
		</scroll-view>

		<!-- FAB -->
		<view class="fab" @tap="goNewJournal">
			<Icon name="plus" :size="48" color="#FFFFFF" :strokeWidth="2" />
		</view>

		<!-- 删除确认弹窗 -->
		<DeleteModal
			:visible="deleteVisible"
			title="删除手账"
			:message="'确定要删除「' + deleteTargetTitle + '」吗？删除后无法恢复。'"
			@cancel="cancelDelete"
			@confirm="doDelete"
		/>

		<!-- TabBar -->
		<TabBar :active="1" />
	</view>
</template>

<script>
import TabBar from '@/components/TabBar.vue'
import Icon from '@/components/Icon.vue'
import EmptyState from '@/components/EmptyState.vue'
import DeleteModal from '@/components/DeleteModal.vue'
import themeMixin from '@/mixins/theme.js'
import { useJournalStore } from '@/store/journal.js'
import { useLocationStore } from '@/store/location.js'
import dateUtil from '@/utils/date.js'

export default {
	components: { TabBar, Icon, EmptyState, DeleteModal },
	mixins: [themeMixin],
	setup() {
		const journalStore = useJournalStore()
		const locationStore = useLocationStore()
		return { journalStore, locationStore }
	},
	data() {
		return {
			statusBarHeight: 0,
			currentFilter: 'all',
			filters: [
				{ label: '全部', value: 'all' },
				{ label: '最近', value: 'recent' },
				{ label: '收藏', value: 'favorite' },
				{ label: '有照片', value: 'photos' }
			],
			deleteVisible: false,
			deleteTargetId: '',
			deleteTargetTitle: '',
			// 记录首图加载失败的手账 id，避免直接修改 store 数据
			thumbFailed: {}
		}
	},
	computed: {
		searchIconColor() {
			return this.themeClass === 'theme-dark' ? '#6E6A65' : '#A5A09A'
		},
		filteredJournals() {
			const all = this.journalStore.sortedJournals
			if (this.currentFilter === 'recent') {
				return all.slice(0, 10)
			}
			if (this.currentFilter === 'photos') {
				return all.filter(j => j.photos && j.photos.length > 0)
			}
			if (this.currentFilter === 'favorite') {
				return all.filter(j => j.favorite)
			}
			return all
		},
		groupedFiltered() {
			const groups = {}
			this.filteredJournals.forEach(j => {
				const g = dateUtil.getDateGroup(j.createdAt)
				if (!groups[g]) groups[g] = []
				groups[g].push(j)
			})
			return groups
		}
	},
	onLoad(options) {
		const sys = uni.getSystemInfoSync()
		this.statusBarHeight = sys.statusBarHeight || 20
		// 支持从"我的页面"跳转时携带筛选条件
		if (options && options.filter && this.filters.some(f => f.value === options.filter)) {
			this.currentFilter = options.filter
		}
	},
	onShow() {
		// 数据从 store 获取，自动响应式更新
	},
	methods: {
		formatRelative(date) {
			return dateUtil.formatRelative(date)
		},
		getColorClass(j) {
			const moodMap = { '😊': 'warm', '🌸': 'blue', '☀️': 'gold', '🌙': 'lavender', '🍂': 'green' }
			return moodMap[j.mood] || 'warm'
		},
		setFilter(value) {
			this.currentFilter = value
		},
		goSearch() {
			uni.navigateTo({ url: '/pages/search/index' })
		},
		goDetail(id) {
			uni.navigateTo({ url: '/pages/journal-detail/index?id=' + id })
		},
		goNewJournal() {
			uni.navigateTo({ url: '/pages/journal-edit/index' })
		},
		confirmDelete(journal) {
			this.deleteTargetId = journal.id
			this.deleteTargetTitle = journal.title || '未命名手账'
			this.deleteVisible = true
		},
		cancelDelete() {
			this.deleteVisible = false
			this.deleteTargetId = ''
			this.deleteTargetTitle = ''
		},
		doDelete() {
			const id = this.deleteTargetId
			const journal = this.journalStore.getJournal(id)
			const locationId = journal ? journal.locationId : ''
			const success = this.journalStore.deleteJournal(id)
			this.deleteVisible = false
			this.deleteTargetId = ''
			this.deleteTargetTitle = ''
			if (success) {
				// 更新关联地点的统计数据
				if (locationId) {
					const journals = this.journalStore.getJournalsByLocation(locationId)
					const photoCount = journals.reduce(
						(sum, j) => sum + (j.photos ? j.photos.length : 0), 0
					)
					this.locationStore.updateStats(locationId, journals.length, photoCount)
				}
				uni.showToast({ title: '已删除', icon: 'success' })
			} else {
				uni.showToast({ title: '删除失败', icon: 'none' })
			}
		},
		onThumbError(journal) {
			// 图片加载失败时仅记录到本地状态，不修改 store 中的持久化数据
			this.thumbFailed[journal.id] = true
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
	overflow-x: hidden;
}

.statusbar-placeholder {
	width: 100%;
	flex-shrink: 0;
}

.list-header {
	padding: 8rpx 32rpx 20rpx;
}

.list-title {
	display: block;
	font-size: 44rpx;
	font-weight: 600;
	color: var(--fg);
	letter-spacing: -0.02em;
	margin-bottom: 16rpx;
}

.list-search {
	display: flex;
	align-items: center;
	gap: 16rpx;
	background: var(--input-bg);
	border-radius: 20rpx;
	padding: 16rpx 24rpx;
}

.list-search-text {
	font-size: 28rpx;
	color: var(--text-tertiary);
}

.filter-bar {
	white-space: nowrap;
	padding: 8rpx 32rpx 16rpx;
}

.filter-item {
	display: inline-flex;
	align-items: center;
	padding: 8rpx 24rpx;
	margin-right: 12rpx;
	border-radius: 999rpx;
	border: 1rpx solid var(--border-light);
	background: transparent;
	font-size: 24rpx;
	color: var(--text-secondary);
}

.filter-item.active {
	background: rgba(224, 144, 128, 0.15);
	border-color: transparent;
	color: #E09080;
	font-weight: 500;
}

.content {
	flex: 1;
	overflow-x: hidden;
	overflow-y: auto;
}

.list-body {
	padding: 0 32rpx;
}

.list-date-group {
	margin-bottom: 8rpx;
}

.list-date-label {
	display: block;
	font-size: 24rpx;
	font-weight: 600;
	color: var(--text-secondary);
	margin: 20rpx 0 12rpx;
	letter-spacing: 0.02em;
}

.list-card {
	display: flex;
	gap: 20rpx;
	background: var(--surface);
	border: 1rpx solid var(--border);
	border-radius: 28rpx;
	padding: 20rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 16rpx var(--shadow);
}

.lc-thumb {
	width: 120rpx;
	height: 120rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	overflow: hidden;
}

.lc-thumb-img {
	width: 100%;
	height: 100%;
	border-radius: 20rpx;
}

.lc-thumb.ph-warm { background: linear-gradient(135deg, #EDCFC6, #D9AFA2); }
.lc-thumb.ph-blue { background: linear-gradient(135deg, #BDD3E8, #9DBBD8); }
.lc-thumb.ph-lavender { background: linear-gradient(135deg, #D2C5E2, #B5A8CE); }
.lc-thumb.ph-green { background: linear-gradient(135deg, #C0D9B8, #9EC594); }
.lc-thumb.ph-gold { background: linear-gradient(135deg, #E2D4B8, #CEBC98); }

.lc-body {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.lc-title {
	font-size: 30rpx;
	font-weight: 600;
	color: var(--fg);
}

.lc-loc {
	font-size: 24rpx;
	color: var(--text-secondary);
}

.lc-date {
	font-size: 22rpx;
	color: var(--text-tertiary);
	margin-top: 4rpx;
}

.lc-delete {
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	border-radius: 16rpx;
}

.lc-delete:active {
	background: rgba(200, 80, 74, 0.1);
}

.fab {
	position: fixed;
	right: 40rpx;
	bottom: 160rpx;
	width: 104rpx;
	height: 104rpx;
	background: #E09080;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 28rpx rgba(224, 144, 128, 0.4);
	z-index: 50;
}

.bottom-pad {
	height: 140rpx;
}
</style>
