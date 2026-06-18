/**
 * 地点数据 Store
 * 管理地点的增删查改
 */
import { defineStore } from 'pinia'
import storage from '../utils/storage.js'
import dateUtil from '../utils/date.js'

export const useLocationStore = defineStore('location', {
	state: () => ({
		locations: storage.get(storage.KEYS.LOCATIONS, []),
		selectedLocationId: null
	}),

	getters: {
		// 地点总数
		totalCount() {
			return this.locations.length
		},

		// 当前选中的地点
		selectedLocation() {
			return this.locations.find(l => l.id === this.selectedLocationId)
		},

		// 按访问次数降序
		popularLocations() {
			return [...this.locations].sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))
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
				id: storage.generateId('loc'),
				name: data.name || '未知地点',
				address: data.address || '',
				latitude: data.latitude || 0,
				longitude: data.longitude || 0,
				coverColor: data.coverColor || ['warm', 'blue', 'lavender', 'green', 'gold'][Math.floor(Math.random() * 5)],
				visitCount: 1,
				lastVisitDate: dateUtil.formatDate(new Date()),
				journalCount: 0,
				photoCount: 0,
				createdAt: dateUtil.formatDateTime(new Date())
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
			let loc = this.locations.find(l =>
				l.name === data.name &&
				Math.abs(l.latitude - (data.latitude || 0)) < 0.001 &&
				Math.abs(l.longitude - (data.longitude || 0)) < 0.001
			)
			if (!loc) {
				loc = this.addLocation(data)
			}
			return loc
		},

		// 更新地点统计数据
		updateStats(locationId, journalCount, photoCount) {
			const loc = this.getLocation(locationId)
			if (loc) {
				loc.journalCount = journalCount
				loc.photoCount = photoCount
				loc.visitCount = (loc.visitCount || 0) + 1
				loc.lastVisitDate = dateUtil.formatDate(new Date())
				this.persist()
			}
		},

		// 设置选中地点
		setSelected(id) {
			this.selectedLocationId = id
		}
	}
})
