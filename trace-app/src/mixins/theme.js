/**
 * 主题 Mixin
 * 提供 themeClass 计算属性，在根 view 上绑定 :class="themeClass" 即可切换主题
 * 同时提供主题相关的颜色计算属性，供 Icon 组件等使用
 */
import { useProfileStore } from '@/store/profile.js'

export default {
	computed: {
		themeClass() {
			const store = useProfileStore()
			return store.settings.theme === 'dark' ? 'theme-dark' : 'theme-light'
		},
		// 主文字颜色（用于 Icon color）
		themeFgColor() {
			return this.themeClass === 'theme-dark' ? '#E8E4E0' : '#2D2A26'
		},
		// 次要文字颜色
		themeSecondaryColor() {
			return this.themeClass === 'theme-dark' ? '#A5A09A' : '#7A756F'
		},
		// 三级文字颜色（浅灰）
		themeTertiaryColor() {
			return this.themeClass === 'theme-dark' ? '#6E6A65' : '#A5A09A'
		}
	}
}
