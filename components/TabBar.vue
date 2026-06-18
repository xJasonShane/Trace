<template>
	<view class="tabbar">
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
				:color="active === index ? '#E09080' : '#A5A09A'"
				:strokeWidth="active === index ? 2 : 1.5"
			/>
			<text class="tab-label">{{ tab.label }}</text>
			<view v-if="active === index" class="tab-dot"></view>
		</view>
	</view>
</template>

<script>
import Icon from './Icon.vue'

export default {
	name: 'TabBar',
	components: { Icon },
	props: {
		active: {
			type: Number,
			default: 0
		}
	},
	data() {
		return {
			tabs: [
				{ icon: 'map', label: '地图', path: '/pages/index/index' },
				{ icon: 'journal', label: '手账', path: '/pages/journal/index' },
				{ icon: 'stats', label: '统计', path: '/pages/stats/index' },
				{ icon: 'profile', label: '我的', path: '/pages/profile/index' }
			]
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
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	padding: 12rpx 16rpx 0;
	padding-bottom: env(safe-area-inset-bottom);
	border-top: 1rpx solid #EDEAE5;
	background: rgba(250, 248, 245, 0.96);
	z-index: 100;
}

.tab {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4rpx;
	padding: 10rpx 0 6rpx;
	color: #A5A09A;
	position: relative;
}

.tab.active {
	color: #E09080;
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
	background: #E09080;
	border-radius: 50%;
}
</style>
