<template>
	<view class="page">
		<!-- 状态栏占位 -->
		<view class="statusbar-placeholder" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部标题 -->
		<view class="stats-header">
			<text class="stats-title">统计</text>
		</view>

		<scroll-view class="content" scroll-y>
			<!-- 汇总卡片 2x2 -->
			<view class="stats-summary">
				<view class="stats-card">
					<text class="sc-val">{{ totalCount }}</text>
					<text class="sc-lbl">总手账数</text>
					<view class="sc-trend up">
						<text>↑ {{ thisMonthCount }} 本月</text>
					</view>
				</view>
				<view class="stats-card">
					<text class="sc-val">{{ locationCount }}</text>
					<text class="sc-lbl">到访地点</text>
					<view class="sc-trend up">
						<text>↑ 持续探索</text>
					</view>
				</view>
				<view class="stats-card">
					<text class="sc-val">{{ photoCount }}</text>
					<text class="sc-lbl">照片总数</text>
					<view class="sc-trend up">
						<text>↑ 美好瞬间</text>
					</view>
				</view>
				<view class="stats-card">
					<text class="sc-val">{{ consecutiveDays }}</text>
					<text class="sc-lbl">连续天数</text>
					<view class="sc-trend down">
						<text>最长 {{ consecutiveDays }} 天</text>
					</view>
				</view>
			</view>

			<!-- 月度趋势柱状图 -->
			<view class="chart-card">
				<text class="chart-title">月度手账趋势</text>
				<view class="chart-bars">
					<view
						v-for="(item, idx) in monthlyTrend"
						:key="idx"
						class="bar-col"
					>
						<view class="bar-wrap">
							<view
								class="bar"
								:class="{ active: idx === monthlyTrend.length - 1 }"
								:style="{ height: getBarHeight(item.count) + 'rpx' }"
							></view>
						</view>
						<text class="bar-label">{{ item.month }}月</text>
					</view>
				</view>
			</view>

			<!-- 心情分布 -->
			<view class="mood-breakdown">
				<text class="mood-title">心情分布</text>
				<view
					v-for="(m, idx) in moodList"
					:key="idx"
					class="mood-bar-row"
				>
					<text class="mood-emoji">{{ m.mood }}</text>
					<view class="mood-track">
						<view
							class="mood-fill"
							:style="{ width: m.percentage + '%', background: m.color }"
						></view>
					</view>
					<text class="mood-pct">{{ m.percentage }}%</text>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-pad"></view>
		</scroll-view>

		<!-- TabBar -->
		<TabBar :active="2" />
	</view>
</template>

<script>
import TabBar from '@/components/TabBar.vue'
import { useJournalStore } from '@/store/journal.js'
import { useLocationStore } from '@/store/location.js'
import { useProfileStore } from '@/store/profile.js'

export default {
	components: { TabBar },
	setup() {
		const journalStore = useJournalStore()
		const locationStore = useLocationStore()
		const profileStore = useProfileStore()
		return { journalStore, locationStore, profileStore }
	},
	data() {
		return {
			statusBarHeight: 0,
			// 默认5种心情（确保始终展示）
			defaultMoods: [
				{ mood: '😊', color: '#E09080' },
				{ mood: '🌸', color: '#7FA3C8' },
				{ mood: '☀️', color: '#DDB86A' },
				{ mood: '🌙', color: '#B8A0D0' },
				{ mood: '🍂', color: '#A5A09A' }
			]
		}
	},
	computed: {
		totalCount() {
			return this.journalStore.totalCount
		},
		locationCount() {
			return this.locationStore.totalCount
		},
		photoCount() {
			return this.profileStore.photoCount
		},
		consecutiveDays() {
			return this.journalStore.consecutiveDays
		},
		thisMonthCount() {
			return this.journalStore.thisMonthCount
		},
		monthlyTrend() {
			return this.journalStore.monthlyTrend
		},
		moodList() {
			const dist = this.journalStore.moodDistribution
			const map = {}
			dist.forEach(d => { map[d.mood] = d })
			return this.defaultMoods.map(dm => {
				const d = map[dm.mood]
				return {
					mood: dm.mood,
					color: dm.color,
					percentage: d ? d.percentage : 0
				}
			})
		},
		maxCount() {
			const counts = this.monthlyTrend.map(t => t.count)
			return Math.max(...counts, 1)
		}
	},
	onLoad() {
		const sys = uni.getSystemInfoSync()
		this.statusBarHeight = sys.statusBarHeight || 20
	},
	methods: {
		getBarHeight(count) {
			const minH = 20
			const maxH = 180
			if (count === 0) return minH
			return Math.max(minH, Math.round((count / this.maxCount) * maxH))
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
}

.statusbar-placeholder {
	width: 100%;
	flex-shrink: 0;
}

.stats-header {
	padding: 8rpx 32rpx 20rpx;
}

.stats-title {
	display: block;
	font-size: 44rpx;
	font-weight: 600;
	color: #2D2A26;
	letter-spacing: -0.02em;
}

.content {
	flex: 1;
	overflow: auto;
}

.stats-summary {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16rpx;
	padding: 0 32rpx;
	margin-bottom: 24rpx;
}

.stats-card {
	background: #FFFFFF;
	border: 1rpx solid #EDEAE5;
	border-radius: 28rpx;
	padding: 24rpx;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.sc-val {
	font-family: ui-monospace, 'SF Mono', monospace;
	font-size: 52rpx;
	font-weight: 700;
	color: #2D2A26;
	line-height: 1.1;
}

.sc-lbl {
	font-size: 24rpx;
	color: #7A756F;
	margin-top: 4rpx;
}

.sc-trend {
	display: inline-flex;
	align-items: center;
	gap: 4rpx;
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
	font-size: 22rpx;
	font-weight: 600;
	margin-top: 8rpx;
	align-self: flex-start;
}

.sc-trend.up {
	color: #4A8E40;
	background: #E0F0DC;
}

.sc-trend.down {
	color: #B8504A;
	background: #F2E0DD;
}

.chart-card {
	margin: 0 32rpx 24rpx;
	background: #FFFFFF;
	border: 1rpx solid #EDEAE5;
	border-radius: 28rpx;
	padding: 24rpx;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
}

.chart-title {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: #2D2A26;
	margin-bottom: 20rpx;
}

.chart-bars {
	display: flex;
	align-items: flex-end;
	gap: 8rpx;
	height: 240rpx;
}

.bar-col {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	height: 100%;
}

.bar-wrap {
	flex: 1;
	width: 100%;
	display: flex;
	align-items: flex-end;
	justify-content: center;
}

.bar {
	width: 70%;
	background: rgba(127, 163, 200, 0.25);
	border-radius: 8rpx;
	min-height: 20rpx;
}

.bar.active {
	background: #E09080;
}

.bar-label {
	font-size: 20rpx;
	color: #A5A09A;
	margin-top: 8rpx;
}

.mood-breakdown {
	padding: 0 32rpx;
	margin-bottom: 24rpx;
}

.mood-title {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: #2D2A26;
	margin-bottom: 20rpx;
	position: relative;
	padding-left: 20rpx;
}

.mood-title::before {
	content: '';
	position: absolute;
	left: 0;
	top: 50%;
	transform: translateY(-50%);
	width: 8rpx;
	height: 24rpx;
	background: #E09080;
	border-radius: 4rpx;
}

.mood-bar-row {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin-bottom: 16rpx;
}

.mood-emoji {
	font-size: 36rpx;
	width: 48rpx;
	text-align: center;
}

.mood-track {
	flex: 1;
	height: 20rpx;
	background: rgba(45, 42, 38, 0.07);
	border-radius: 10rpx;
	overflow: hidden;
}

.mood-fill {
	height: 100%;
	border-radius: 10rpx;
	transition: width 0.3s ease;
}

.mood-pct {
	font-family: ui-monospace, 'SF Mono', monospace;
	font-size: 24rpx;
	font-weight: 700;
	color: #6E6A65;
	width: 72rpx;
	text-align: right;
}

.bottom-pad {
	height: 140rpx;
}
</style>
