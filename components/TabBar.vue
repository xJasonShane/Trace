<template>
	<view class="tabbar" :class="{ 'tabbar-fixed': fixed, 'tabbar-static': !fixed }">
		<view
			v-for="(tab, index) in tabs"
			:key="index"
			class="tab"
			:class="{ active: active === index }"
			@tap="switchTab(index)"
		>
			<Icon
				:name="tab.icon"
				:size="40"
				:color="active === index ? activeColor : inactiveColor"
				:strokeWidth="active === index ? 2 : 1.5"
			/>
			<text class="tab-label">{{ tab.label }}</text>
			<view v-if="active === index" class="tab-dot"></view>
		</view>
	</view>
</template>

<script>
import Icon from './Icon.vue'
import themeMixin from '@/mixins/theme.js'

// 静态标签配置，无需响应式，冻结避免误修改
const TABS = Object.freeze([
	{ icon: 'map', label: '地图', path: '/pages/index/index' },
	{ icon: 'journal', label: '手账', path: '/pages/journal/index' },
	{ icon: 'stats', label: '统计', path: '/pages/stats/index' },
	{ icon: 'profile', label: '我的', path: '/pages/profile/index' }
])

export default {
	name: 'TabBar',
	components: { Icon },
	mixins: [themeMixin],
	props: {
		active: {
			type: Number,
			default: 0,
			validator: (v) => v >= 0 && v <= 3
		},
		// 是否使用 fixed 定位。在含原生组件（如 map）的页面中应设为 false，
		// 作为 flex 子元素布局，避免被原生组件覆盖。
		fixed: {
			type: Boolean,
			default: true
		}
	},
	setup() {
		return { tabs: TABS }
	},
	computed: {
		activeColor() {
			return '#E09080'
		},
		inactiveColor() {
			return this.themeClass === 'theme-dark' ? '#6E6A65' : '#A5A09A'
		}
	},
	methods: {
		switchTab(index) {
			if (this.active === index) return
			uni.reLaunch({ url: this.tabs[index].path })
		}
	}
}
</script>

<style lang="scss" scoped>
.tabbar {
	display: flex;
	box-sizing: border-box;
	padding: 12rpx 16rpx 0;
	padding-bottom: env(safe-area-inset-bottom);
	border-top: 1rpx solid var(--border);
	background: var(--overlay);
}

/* fixed 模式：浮动定位，适用于无原生组件的普通页面 */
.tabbar-fixed {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 100;
}

/* static 模式：作为 flex 子元素，适用于含原生组件（如 map）的页面，
   避免被原生组件层级覆盖 */
.tabbar-static {
	position: relative;
	flex-shrink: 0;
	width: 100%;
}

.tab {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4rpx;
	padding: 10rpx 0 6rpx;
	color: var(--text-tertiary);
	position: relative;
}

.tab.active {
	color: var(--primary);
}

.tab-label {
	font-size: 20rpx;
	font-weight: 500;
	letter-spacing: 0.02em;
}

.tab.active .tab-label {
	font-weight: 600;
}

.tab-dot {
	position: absolute;
	bottom: 2rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 8rpx;
	height: 8rpx;
	background: var(--primary);
	border-radius: 50%;
}
</style>
