<template>
	<view class="mood-select">
		<view
			v-for="mood in moods"
			:key="mood.emoji"
			class="mood-dot"
			:class="{ active: modelValue === mood.emoji }"
			@tap="selectMood(mood.emoji)"
		>
			<text class="mood-emoji">{{ mood.emoji }}</text>
		</view>
	</view>
</template>

<script>
import { MOODS } from '@/constants/mood.js'

export default {
	name: 'MoodSelect',
	props: {
		modelValue: {
			type: String,
			default: '😊'
		}
	},
	emits: ['update:modelValue', 'change'],
	data() {
		return {
			// 心情列表统一使用常量，避免与统计页/详情页标签不一致
			moods: MOODS
		}
	},
	methods: {
		selectMood(emoji) {
			this.$emit('update:modelValue', emoji)
			this.$emit('change', emoji)
		}
	}
}
</script>

<style lang="scss" scoped>
.mood-select {
	display: flex;
	gap: 20rpx;
}

.mood-dot {
	width: 76rpx;
	height: 76rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 4rpx solid transparent;
	transition: all 0.2s ease;
	background: var(--input-bg);
}

.mood-dot.active {
	border-color: var(--primary);
	background: var(--primary-soft);
	transform: scale(1.1);
	box-shadow: 0 0 0 6rpx var(--primary-soft);
}

.mood-emoji {
	font-size: 36rpx;
	line-height: 1;
}
</style>
