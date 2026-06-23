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
			moods: [
				{ emoji: '😊', label: '愉快' },
				{ emoji: '🌸', label: '美好' },
				{ emoji: '☀️', label: '阳光' },
				{ emoji: '🌙', label: '宁静' },
				{ emoji: '🍂', label: '怀旧' }
			]
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
	border-color: #E09080;
	background: rgba(224, 144, 128, 0.15);
	transform: scale(1.1);
	box-shadow: 0 0 0 6rpx rgba(224, 144, 128, 0.15);
}

.mood-emoji {
	font-size: 36rpx;
	line-height: 1;
}
</style>
