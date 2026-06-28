<template>
	<view class="star-rating" @tap.stop="handleTap">
		<view
			v-for="i in 5"
			:key="i"
			class="star-item"
			@tap.stop="setRating(i)"
		>
			<Icon
				name="star"
				:size="starSize"
				:color="i <= modelValue ? '#D9A54A' : inactiveStarColor"
				:fill="i <= modelValue ? '#D9A54A' : 'none'"
				:strokeWidth="0.8"
			/>
		</view>
		<text v-if="showScore && modelValue > 0" class="rating-score">{{ modelValue }}</text>
	</view>
</template>

<script>
import Icon from './Icon.vue'
import themeMixin from '@/mixins/theme.js'

export default {
	name: 'StarRating',
	components: { Icon },
	mixins: [themeMixin],
	props: {
		modelValue: {
			type: Number,
			default: 0
		},
		readonly: {
			type: Boolean,
			default: false
		},
		size: {
			type: String,
			default: 'md',
			validator: (v) => ['sm', 'md', 'lg'].includes(v)
		},
		showScore: {
			type: Boolean,
			default: false
		}
	},
	emits: ['update:modelValue', 'change'],
	computed: {
		starSize() {
			const sizes = { sm: 24, md: 32, lg: 44 }
			return sizes[this.size] || 32
		},
		inactiveStarColor() {
			return this.themeClass === 'theme-dark' ? '#44403C' : '#E0DCD7'
		}
	},
	methods: {
		setRating(value) {
			if (this.readonly) return
			this.$emit('update:modelValue', value)
			this.$emit('change', value)
		},
		handleTap() {}
	}
}
</script>

<style lang="scss" scoped>
.star-rating {
	display: inline-flex;
	align-items: center;
	gap: 6rpx;
}

.star-item {
	display: flex;
	align-items: center;
}

.rating-score {
	font-family: ui-monospace, 'SF Mono', monospace;
	font-size: 30rpx;
	font-weight: 700;
	color: #D9A54A;
	margin-left: 16rpx;
	letter-spacing: -0.02em;
}
</style>
