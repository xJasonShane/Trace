/**
 * 地点数据 Store
 * 管理地点的增删查改
 */
import { defineStore } from 'pinia'
import storage from '../utils/storage.js'
import dateUtil from '../utils/date.js'

export const useLocationStore = defineStore('location', {
	state: () => ({
		locations: storage.get(storage.KEYS.LOCATIONS, [])
	}),

	getters: {
		// 地点总数
		totalCount() {
			return this.locations.length
		}
	},

	actions: {
		// 保存到本地存储
		persist() {
			storage.set(storage.KEYS.LOCATIONS, this.locations)
		},

		// 新增地点
		addLocation(data) {
			const location = {
				id: data.id || storage.generateId('loc'),
				name: data.name || '未知地点',
				address: data.address || '',
				latitude: data.latitude || 0,
				longitude: data.longitude || 0,
				coverColor: data.coverColor || ['warm', 'blue', 'lavender', 'green', 'gold'][Math.floor(Math.random() * 5)],
				visitCount: data.visitCount || 1,
				lastVisitDate: data.lastVisitDate || dateUtil.formatDate(new Date()),
				journalCount: data.journalCount || 0,
				photoCount: data.photoCount || 0,
				createdAt: data.createdAt || dateUtil.formatDateTime(new Date())
			}
			this.locations.push(location)
			this.persist()
			return location
		},

		// 更新地点
		updateLocation(id, data) {
			const idx = this.locations.findIndex(l => l.id === id)
			if (idx === -1) return null
			this.locations[idx] = { ...this.locations[idx], ...data }
			this.persist()
			return this.locations[idx]
		},

		// 删除地点
		deleteLocation(id) {
			const idx = this.locations.findIndex(l => l.id === id)
			if (idx === -1) return false
			this.locations.splice(idx, 1)
			this.persist()
			return true
		},

		// 获取地点详情
		getLocation(id) {
			return this.locations.find(l => l.id === id)
		},

		// 搜索地点
		search(keyword) {
			const kw = keyword.toLowerCase().trim()
			if (!kw) return []
			return this.locations.filter(l =>
				l.name.toLowerCase().includes(kw) ||
				(l.address && l.address.toLowerCase().includes(kw))
			)
		},

		// 查找或创建地点
		findOrCreate(data) {
			let loc
			// 有坐标时按名称+坐标匹配，无坐标时仅按名称匹配
			if (data.latitude !== undefined && data.longitude !== undefined) {
				loc = this.locations.find(l =>
					l.name === data.name &&
					Math.abs(l.latitude - data.latitude) < 0.001 &&
					Math.abs(l.longitude - data.longitude) < 0.001
				)
			} else {
				loc = this.locations.find(l => l.name === data.name)
			}
			if (!loc) {
				loc = this.addLocation(data)
			}
			return loc
		},

		// 更新地点统计数据（仅更新统计字段，不递增到访次数）
		updateStats(locationId, journalCount, photoCount) {
			const loc = this.getLocation(locationId)
			if (loc) {
				loc.journalCount = journalCount
				loc.photoCount = photoCount
				loc.lastVisitDate = dateUtil.formatDate(new Date())
				this.persist()
			}
		}
	}
})
