/**
 * 状态栏高度 Mixin
 * 自动获取系统状态栏高度，供页面顶部占位使用
 * 使用方式：mixins: [statusbarMixin]，模板中绑定 :style="{ height: statusBarHeight + 'px' }"
 */
export default {
	data() {
		return {
			statusBarHeight: 0
		}
	},
	onLoad() {
		try {
			const sys = uni.getSystemInfoSync()
			this.statusBarHeight = sys.statusBarHeight || 20
		} catch (e) {
			this.statusBarHeight = 20
		}
	}
}
