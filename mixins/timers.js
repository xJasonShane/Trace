/**
 * 定时器管理 Mixin
 * 提供 _timers 数组用于收集 setTimeout 返回的 id，
 * 在组件/页面销毁时统一清理，避免内存泄漏。
 *
 * 使用方式：
 *   mixins: [timersMixin]
 *   this._timers.push(setTimeout(() => { ... }, 1000))
 *
 * 同时兼容页面（onUnload）和组件（beforeUnmount）。
 */
export default {
	created() {
		this._timers = []
	},
	onUnload() {
		this._clearTimers()
	},
	beforeUnmount() {
		this._clearTimers()
	},
	methods: {
		_clearTimers() {
			if (this._timers && this._timers.length) {
				this._timers.forEach(id => clearTimeout(id))
				this._timers = []
			}
		}
	}
}
