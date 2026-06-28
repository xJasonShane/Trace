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
			backup: true
		})
	}),

	actions: {
		// 保存资料
		saveProfile(data) {
			this.profile = { ...this.profile, ...data }
			storage.set(storage.KEYS.PROFILE, this.profile)
		},

		// 更新设置
		saveSettings(data) {
			this.settings = { ...this.settings, ...data }
			storage.set(storage.KEYS.SETTINGS, this.settings)
		}
	}
})
