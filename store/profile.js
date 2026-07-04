/**
 * 用户资料 Store
 */
import { defineStore } from 'pinia'
import storage from '../utils/storage.js'

export const useProfileStore = defineStore('profile', {
	state: () => ({
		profile: storage.get(storage.KEYS.PROFILE, {
			nickname: '小鹿同学',
			bio: '用脚步丈量世界，用手账记录时光',
			city: '杭州',
			birthday: '1998-06-15',
			avatar: ''
		}),
		settings: storage.get(storage.KEYS.SETTINGS, {
			notifications: true,
			theme: 'light',
			backup: true,
			// 首启引导是否已完成：首次启动后置为 true，后续不再展示
			onboarded: false
		})
	}),

	actions: {
		// 保存资料
		saveProfile(data) {
			const original = this.profile
			this.profile = { ...this.profile, ...data }
			if (!storage.set(storage.KEYS.PROFILE, this.profile)) {
				// 持久化失败：回滚内存状态
				this.profile = original
				return false
			}
			return true
		},

		// 更新设置
		saveSettings(data) {
			const original = this.settings
			this.settings = { ...this.settings, ...data }
			if (!storage.set(storage.KEYS.SETTINGS, this.settings)) {
				// 持久化失败：回滚内存状态
				this.settings = original
				return false
			}
			return true
		},

		/**
		 * 标记首启引导已完成
		 * 仅在尚未完成时写入，避免无谓的存储写入
		 * @returns {boolean} 是否成功
		 */
		markOnboarded() {
			if (this.settings.onboarded) return true
			return this.saveSettings({ onboarded: true })
		}
	}
})
