<template>
	<view class="empty-state">
		<view class="empty-icon">
			<Icon :name="icon" :size="72" color="#A5A09A" :strokeWidth="1.4" />
		</view>
		<text class="empty-title">{{ title }}</text>
		<text class="empty-desc">{{ description }}</text>
		<view v-if="actionText" class="empty-btn" @tap="$emit('action')">
			<text class="empty-btn-text">{{ actionText }}</text>
		</view>
	</view>
</template>

<script>
import Icon from './Icon.vue'

export default {
	name: 'EmptyState',
	components: { Icon },
	props: {
		icon: {
			type: String,
			default: 'emptyJournal'
		},
		title: {
			type: String,
			default: '还没有手账'
		},
		description: {
			type: String,
			default: '去外面走走吧，记录你生活中的每一个温暖瞬间'
		},
		actionText: {
			type: String,
			default: '写第一篇手账'
		}
	},
	emits: ['action']
}
</script>

<style lang="scss" scoped>
.empty-state {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 48rpx;
	text-align: center;
}

.empty-icon {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	background: rgba(45, 42, 38, 0.07);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 32rpx;
}

.empty-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #2D2A26;
	margin-bottom: 12rpx;
}

.empty-desc {
	font-size: 26rpx;
	color: #7A756F;
	line-height: 1.5;
	margin-bottom: 40rpx;
	max-width: 440rpx;
}

.empty-btn {
	padding: 0 48rpx;
	height: 80rpx;
	background: #E09080;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 16rpx rgba(224, 144, 128, 0.3);
}

.empty-btn-text {
	font-size: 28rpx;
	font-weight: 600;
	color: #FFFFFF;
}
</style>
