<template>
	<image :src="iconSrc" :style="{ width: size + 'rpx', height: size + 'rpx' }" mode="aspectFit" />
</template>

<script>
/**
 * SVG 图标组件
 * 使用 data URI 方式渲染 SVG，兼容所有平台
 * 图标路径统一维护在 constants/icons.js
 */
import { ICON_PATHS } from '@/constants/icons.js'

export default {
	name: 'Icon',
	props: {
		name: {
			type: String,
			required: true
		},
		size: {
			type: Number,
			default: 40
		},
		color: {
			type: String,
			default: '#2D2A26'
		},
		strokeWidth: {
			type: Number,
			default: 1.5
		},
		fill: {
			type: String,
			default: 'none'
		}
	},
	computed: {
		iconSrc() {
			const paths = ICON_PATHS[this.name] || ''
			const fillValue = this.fill === 'currentColor' ? this.color : this.fill
			const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${fillValue}' stroke='${this.color}' stroke-width='${this.strokeWidth}' stroke-linecap='round' stroke-linejoin='round'>${paths}</svg>`
			return 'data:image/svg+xml,' + encodeURIComponent(svg)
		}
	}
}
</script>
