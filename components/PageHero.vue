<template>
	<view class="hero">
		<!-- 状态栏占位 -->
		<view class="status-bar-spacer" :style="{ height: statusBarHeight + 'px' }"></view>
		<view class="hero-content" :style="contentStyle">
			<view class="hero-pattern" :style="patternStyle"></view>
			<view class="hero-icon" :style="{ opacity: iconOpacity }">
				<slot name="icon" />
			</view>
			<view class="hero-nav">
				<slot name="nav" />
			</view>
		</view>
	</view>
</template>

<script>
import statusbarMixin from '@/mixins/statusbar.js'

/**
 * 页面顶部 Hero 区域
 * 抽取自 journal-detail 与 location-detail 的共用 Hero 样式
 * 通过 props 控制背景渐变、内容高度、装饰图标透明度与网格密度
 */
export default {
	name: 'PageHero',
	mixins: [statusbarMixin],
	props: {
		// 背景渐变 CSS 字符串，例如 'linear-gradient(135deg, #EDCFC6 0%, #D9AFA2 100%)'
		gradient: {
			type: String,
			default: 'linear-gradient(135deg, #EDCFC6 0%, #D9AFA2 100%)'
		},
		// hero-content 高度（rpx）
		contentHeight: {
			type: Number,
			default: 360
		},
		// 装饰图标透明度
		iconOpacity: {
			type: Number,
			default: 0.4
		},
		// 装饰网格间距（rpx）
		patternSpacing: {
			type: Number,
			default: 40
		},
		// 装饰网格线条透明度
		patternOpacity: {
			type: Number,
			default: 0.1
		}
	},
	computed: {
		// statusBarHeight 由 statusbarMixin 提供
		contentStyle() {
			return {
				background: this.gradient,
				height: this.contentHeight + 'rpx'
			}
		},
		patternStyle() {
			const sp = this.patternSpacing
			const op = this.patternOpacity
			return {
				background: `repeating-linear-gradient(0deg, transparent, transparent ${sp}rpx, rgba(255, 255, 255, ${op}) ${sp}rpx, rgba(255, 255, 255, ${op}) ${sp + 2}rpx), repeating-linear-gradient(90deg, transparent, transparent ${sp}rpx, rgba(255, 255, 255, ${op / 2}) ${sp}rpx, rgba(255, 255, 255, ${op / 2}) ${sp + 2}rpx)`
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.hero {
	width: 100%;
}

.hero-content {
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
	pointer-events: none;
}

.hero-icon {
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

/* .nav-btn 由 App.vue 全局样式定义，slot 中直接使用该类即可 */
</style>
