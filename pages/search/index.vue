<template>
	<view class="page" :class="themeClass">
		<!-- 状态栏占位 -->
		<view class="statusbar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航 + 搜索框 -->
		<view class="nav-header">
			<view class="back" @tap="onBack">
				<Icon name="back" :size="36" :color="fg" :stroke-width="2" />
			</view>
			<view class="search-input-wrap">
				<Icon name="search" :size="32" :color="accent" :stroke-width="2" />
				<input
				class="search-input"
				v-model="keyword"
				placeholder="搜索地点或回忆…"
				:placeholder-style="placeholderStyle"
				:focus="autoFocus"
				confirm-type="search"
				@input="onInput"
				@confirm="onSearch"
			/>
				<view v-if="keyword" class="clear-btn" @tap="onClear">
					<view class="clear-icon">×</view>
				</view>
			</view>
		</view>

		<!-- 筛选标签栏 -->
		<scroll-view scroll-x class="filter-bar">
			<view
				v-for="tab in filterTabs"
				:key="tab.key"
				class="filter-item"
				:class="{ active: activeFilter === tab.key, inactive: activeFilter !== tab.key }"
				@tap="onFilter(tab.key)"
			>
				{{ tab.label }}
			</view>
		</scroll-view>

		<!-- 结果区域 -->
		<view class="search-results">
			<!-- 结果数量 -->
			<view v-if="keyword && resultList.length > 0" class="search-count">
				找到 {{ resultList.length }} 条结果
			</view>

			<!-- 结果列表 -->
			<view
				v-for="item in resultList"
				:key="item.type + '-' + item.id"
				class="list-card"
				hover-class="list-card-hover"
				:hover-stay-time="80"
				@tap="onCardTap(item)"
			>
				<view class="lc-thumb" :class="'ph-' + (item.coverColor || 'warm')">
					<Icon
						v-if="item.type === 'journal'"
						name="journal"
						:size="36"
						:color="strokeColor(item.coverColor)"
						:stroke-width="1.4"
					/>
					<Icon
						v-else
						name="map"
						:size="36"
						:color="strokeColor(item.coverColor)"
						:stroke-width="1.4"
					/>
				</view>
				<view class="lc-body">
					<view class="lc-title">
						<text
							v-for="(seg, i) in highlightText(item.title, keyword)"
							:key="i"
							:class="{ highlight: seg.highlight }"
						>{{ seg.text }}</text>
					</view>
					<view class="lc-loc">
						<text
							v-for="(seg, i) in highlightText(item.subtitle, keyword)"
							:key="i"
							:class="{ highlight: seg.highlight }"
						>{{ seg.text }}</text>
					</view>
					<view class="lc-date">{{ item.date }}</view>
				</view>
				<view class="lc-type-badge" :class="'badge-' + item.type">
					{{ item.type === 'journal' ? '手账' : '地点' }}
				</view>
			</view>

			<!-- 空结果 -->
			<view v-if="keyword && resultList.length === 0 && searched" class="empty-state">
				<view class="empty-icon">
					<Icon name="search" :size="72" :color="fgTertiary" :stroke-width="1.4" />
				</view>
				<view class="empty-title">没有找到结果</view>
				<view class="empty-desc">换个关键词试试吧</view>
			</view>

			<!-- 初始状态 -->
			<view v-if="!keyword" class="empty-state">
				<view class="empty-icon">
					<Icon name="search" :size="72" :color="fgTertiary" :stroke-width="1.4" />
				</view>
				<view class="empty-title">搜索手账和地点</view>
				<view class="empty-desc">输入关键词，寻找你的回忆</view>
			</view>
		</view>
	</view>
</template>

<script>
import Icon from '@/components/Icon.vue'
import { useJournalStore } from '@/store/journal.js'
import { useLocationStore } from '@/store/location.js'
import dateUtil from '@/utils/date.js'
import themeMixin from '@/mixins/theme.js'

export default {
	components: { Icon },
	mixins: [themeMixin],
	data() {
		return {
			statusBarHeight: 20,
			keyword: '',
			activeFilter: 'all',
			autoFocus: false,
			searched: false,
			journalResults: [],
			locationResults: [],
			tagResults: [],
			debounceTimer: null,
			filterTabs: [
				{ key: 'all', label: '全部' },
				{ key: 'location', label: '地点' },
				{ key: 'journal', label: '手账' },
				{ key: 'tag', label: '标签' }
			],
			accent: '#E09080'
		}
	},
	computed: {
		fg() {
			return this.themeFgColor
		},
		fgTertiary() {
			return this.themeTertiaryColor
		},
		placeholderStyle() {
			return this.themeClass === 'theme-dark' ? 'color: #6E6A65;' : 'color: #A5A09A;'
		},
		resultList() {
			if (this.activeFilter === 'location') return this.locationResults
			if (this.activeFilter === 'journal') return this.journalResults
			if (this.activeFilter === 'tag') return this.tagResults
			return [...this.journalResults, ...this.locationResults]
		}
	},
	onLoad(options) {
		const sysInfo = uni.getSystemInfoSync()
		this.statusBarHeight = sysInfo.statusBarHeight || 20

		if (options && options.keyword) {
			this.keyword = decodeURIComponent(options.keyword)
			this.doSearch()
		} else {
			this.autoFocus = true
		}
	},
	onUnload() {
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer)
			this.debounceTimer = null
		}
	},
	methods: {
		onInput() {
			if (this.debounceTimer) clearTimeout(this.debounceTimer)
			this.debounceTimer = setTimeout(() => {
				this.doSearch()
			}, 300)
		},
		onSearch() {
			if (this.debounceTimer) clearTimeout(this.debounceTimer)
			this.doSearch()
		},
		onClear() {
			this.keyword = ''
			this.journalResults = []
			this.locationResults = []
			this.tagResults = []
			this.searched = false
			this.autoFocus = true
		},
		doSearch() {
			const kw = this.keyword.trim()
			if (!kw) {
				this.journalResults = []
				this.locationResults = []
				this.tagResults = []
				this.searched = false
				return
			}
			const journalStore = useJournalStore()
			const locationStore = useLocationStore()

			const journals = journalStore.search(kw)
			const locations = locationStore.search(kw)

			this.journalResults = journals.map(j => ({
				id: j.id,
				type: 'journal',
				title: j.title || '',
				subtitle: j.locationName || '',
				date: dateUtil.formatDateDot(j.createdAt),
				coverColor: this.coverColorOf(j),
				raw: j
			}))

			this.locationResults = locations.map(l => ({
				id: l.id,
				type: 'location',
				title: l.name || '',
				subtitle: l.address || '',
				date: l.lastVisitDate ? dateUtil.formatDateDot(l.lastVisitDate) : '',
				coverColor: l.coverColor || 'warm',
				raw: l
			}))

			const kwLower = kw.toLowerCase()
			this.tagResults = journalStore.sortedJournals
				.filter(j => j.tags && j.tags.some(t => String(t).toLowerCase().includes(kwLower)))
				.map(j => ({
					id: j.id,
					type: 'journal',
					title: j.title || '',
					subtitle: (j.tags || []).slice(0, 3).join(' · '),
					date: dateUtil.formatDateDot(j.createdAt),
					coverColor: this.coverColorOf(j),
					raw: j
				}))

			this.searched = true
		},
		coverColorOf(journal) {
			const moodMap = {
				'😊': 'warm',
				'🌸': 'lavender',
				'☀️': 'gold',
				'🌙': 'blue',
				'🍂': 'green'
			}
			return moodMap[journal.mood] || 'warm'
		},
		onFilter(key) {
			this.activeFilter = key
		},
		onBack() {
			uni.navigateBack()
		},
		onCardTap(item) {
			if (item.type === 'journal') {
				uni.navigateTo({
					url: '/pages/journal-detail/index?id=' + encodeURIComponent(item.id)
				})
			} else if (item.type === 'location') {
				uni.navigateTo({
					url: '/pages/location-detail/index?id=' + encodeURIComponent(item.id)
				})
			}
		},
		highlightText(text, keyword) {
			if (!text) return [{ text: '', highlight: false }]
			const str = String(text)
			if (!keyword) return [{ text: str, highlight: false }]
			const kw = keyword.toLowerCase()
			const lower = str.toLowerCase()
			const result = []
			let lastIndex = 0
			let idx = lower.indexOf(kw, lastIndex)
			while (idx !== -1) {
				if (idx > lastIndex) {
					result.push({ text: str.substring(lastIndex, idx), highlight: false })
				}
				result.push({ text: str.substring(idx, idx + kw.length), highlight: true })
				lastIndex = idx + kw.length
				idx = lower.indexOf(kw, lastIndex)
			}
			if (lastIndex < str.length) {
				result.push({ text: str.substring(lastIndex), highlight: false })
			}
			return result
		},
		strokeColor(coverColor) {
			const map = {
				warm: '#C09080',
				blue: '#7A9AB5',
				lavender: '#9880B0',
				green: '#C09080',
				gold: '#B8A068'
			}
			return map[coverColor] || '#C09080'
		}
	}
}
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	background: var(--bg);
	display: flex;
	flex-direction: column;
}

.statusbar {
	width: 100%;
}

.nav-header {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 8rpx 32rpx 16rpx;
}

.back {
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 20rpx;
	background: var(--input-bg);
	flex-shrink: 0;
}

.search-input-wrap {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 16rpx;
	background: var(--surface);
	border: 1.5rpx solid #E09080;
	border-radius: 20rpx;
	padding: 14rpx 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(224, 144, 128, 0.12);
}

.search-input {
	flex: 1;
	font-size: 28rpx;
	font-family: -apple-system, 'PingFang SC', sans-serif;
	color: var(--fg);
	background: transparent;
	min-width: 0;
}

.clear-btn {
	width: 36rpx;
	height: 36rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: rgba(165, 160, 154, 0.25);
	flex-shrink: 0;
}

.clear-icon {
	font-size: 28rpx;
	color: #FFFFFF;
	line-height: 1;
	margin-top: -4rpx;
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
	font-size: 24rpx;
	font-weight: 500;
}

.filter-item.active {
	background: rgba(224, 144, 128, 0.15);
	color: #E09080;
	font-weight: 600;
}

.filter-item.inactive {
	background: transparent;
	color: var(--text-secondary);
	border: 1rpx solid var(--border-light);
}

.search-results {
	padding: 0 32rpx;
	flex: 1;
}

.search-count {
	font-size: 24rpx;
	color: var(--text-secondary);
	margin-bottom: 16rpx;
	padding: 4rpx 0;
}

.list-card {
	position: relative;
	display: flex;
	gap: 20rpx;
	background: var(--surface);
	border: 1rpx solid var(--border);
	border-radius: 24rpx;
	padding: 20rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 16rpx var(--shadow);
}

.list-card-hover {
	transform: scale(0.98);
	background: #FAFAF8;
}

.lc-thumb {
	width: 120rpx;
	height: 120rpx;
	border-radius: 20rpx;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.ph-warm {
	background: linear-gradient(135deg, #EDCFC6, #D9AFA2);
}
.ph-blue {
	background: linear-gradient(135deg, #BDD3E8, #9DBBD8);
}
.ph-lavender {
	background: linear-gradient(135deg, #D2C5E2, #B5A8CE);
}
.ph-green {
	background: linear-gradient(135deg, #C0D9B8, #9EC594);
}
.ph-gold {
	background: linear-gradient(135deg, #E2D4B8, #CEBC98);
}

.lc-body {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.lc-title {
	font-size: 28rpx;
	font-weight: 600;
	color: var(--fg);
	margin-bottom: 6rpx;
	line-height: 1.4;
}

.lc-loc {
	font-size: 24rpx;
	color: var(--text-secondary);
	margin-bottom: 4rpx;
	line-height: 1.4;
}

.lc-date {
	font-size: 22rpx;
	color: var(--text-tertiary);
}

.lc-type-badge {
	position: absolute;
	top: 20rpx;
	right: 20rpx;
	padding: 4rpx 14rpx;
	border-radius: 999rpx;
	font-size: 20rpx;
	font-weight: 500;
}

.badge-journal {
	background: rgba(224, 144, 128, 0.15);
	color: #E09080;
}

.badge-location {
	background: rgba(127, 163, 200, 0.15);
	color: #7FA3C8;
}

.highlight {
	background: rgba(221, 184, 106, 0.3);
	border-radius: 4rpx;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 48rpx;
	text-align: center;
}

.empty-icon {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	background: var(--input-bg);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 32rpx;
}

.empty-title {
	font-size: 32rpx;
	font-weight: 600;
	color: var(--fg);
	margin-bottom: 12rpx;
}

.empty-desc {
	font-size: 26rpx;
	color: var(--text-secondary);
	line-height: 1.5;
}
</style>
