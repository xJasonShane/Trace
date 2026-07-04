/**
 * 地点数据 Store
 * 管理地点的增删查改
 */
import { defineStore } from 'pinia'
import storage from '../utils/storage.js'
import dateUtil from '../utils/date.js'
import { randomCoverColor } from '../constants/cover.js'

export const useLocationStore = defineStore('location', {
	state: () => ({
		locations: storage.get(storage.KEYS.LOCATIONS, [])
	}),

	getters: {
		// 地点总数
		totalCount() {
			return this.locations.length
		},

		// 获取地点详情（curried getter）
		getLocation: (state) => (id) => state.locations.find(l => l.id === id),

		// 搜索地点（curried getter）
		search() {
			return (keyword) => {
				const kw = keyword.toLowerCase().trim()
				if (!kw) return []
				return this.locations.filter(l =>
					(l.name || '').toLowerCase().includes(kw) ||
					(l.address && l.address.toLowerCase().includes(kw))
				)
			}
		}
	},

	actions: {
		// 保存到本地存储
		persist() {
			return storage.set(storage.KEYS.LOCATIONS, this.locations)
		},

		// 新增地点
		addLocation(data) {
			const location = {
				id: data.id || storage.generateId('loc'),
				name: data.name || '未知地点',
				address: data.address || '',
				latitude: data.latitude || 0,
				longitude: data.longitude || 0,
				coverColor: data.coverColor || randomCoverColor(),
				visitCount: data.visitCount || 1,
				lastVisitDate: data.lastVisitDate || dateUtil.formatDate(new Date()),
				journalCount: data.journalCount || 0,
				photoCount: data.photoCount || 0,
				createdAt: data.createdAt || dateUtil.formatDateTime(new Date())
			}
			this.locations.push(location)
			if (!this.persist()) {
				// 持久化失败：回滚内存状态
				this.locations.pop()
				return null
			}
			return location
		},

		// 更新地点
		updateLocation(id, data) {
			const idx = this.locations.findIndex(l => l.id === id)
			if (idx === -1) return null
			const original = this.locations[idx]
			this.locations[idx] = { ...original, ...data }
			if (!this.persist()) {
				// 持久化失败：回滚内存状态
				this.locations[idx] = original
				return null
			}
			return this.locations[idx]
		},

		// 删除地点
		deleteLocation(id) {
			const idx = this.locations.findIndex(l => l.id === id)
			if (idx === -1) return false
			const removed = this.locations.splice(idx, 1)[0]
			if (!this.persist()) {
				// 持久化失败：回滚内存状态
				this.locations.splice(idx, 0, removed)
				return false
			}
			return true
		},

		// getLocation 与 search 已迁移为 getter（curried 形式）

		// 查找或创建地点
		findOrCreate(data) {
			let loc
			// 有坐标时按名称+坐标匹配，无坐标时仅按名称匹配
			// 坐标阈值 0.0005°（约 55m）：兼顾 GPS 漂移与区分邻近地点
			// 过大（如 0.001°≈111m）会误合并同街不同店铺；过小则 GPS 漂移导致重复创建
			if (data.latitude !== undefined && data.longitude !== undefined) {
				loc = this.locations.find(l =>
					l.name === data.name &&
					Math.abs(l.latitude - data.latitude) < 0.0005 &&
					Math.abs(l.longitude - data.longitude) < 0.0005
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
				const originalJournalCount = loc.journalCount
				const originalPhotoCount = loc.photoCount
				const originalLastVisit = loc.lastVisitDate
				loc.journalCount = journalCount
				loc.photoCount = photoCount
				loc.lastVisitDate = dateUtil.formatDate(new Date())
				if (!this.persist()) {
					// 持久化失败：回滚
					loc.journalCount = originalJournalCount
					loc.photoCount = originalPhotoCount
					loc.lastVisitDate = originalLastVisit
					return false
				}
			}
			return true
		}
	}
})
