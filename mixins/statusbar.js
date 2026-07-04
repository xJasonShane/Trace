/**
 * 状态栏高度 Mixin
 * 自动获取系统状态栏高度，供页面顶部占位使用
 * 使用方式：mixins: [statusbarMixin]，模板中绑定 :style="{ height: statusBarHeight + 'px' }"
 *
 * 使用 created 钩子（而非 onLoad）以兼容组件与页面：
 * 组件没有 onLoad 生命周期，若用 onLoad 会导致组件中 statusBarHeight 始终为 0
 */
export default {
	data() {
		return {
			statusBarHeight: 0
		}
	},
	created() {
		try {
			const sys = uni.getSystemInfoSync()
			this.statusBarHeight = sys.statusBarHeight || 20
		} catch (e) {
			this.statusBarHeight = 20
		}
	}
}
