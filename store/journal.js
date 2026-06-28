/**
 * 手账数据 Store
 * 管理手账的增删查改
 */
import { defineStore } from 'pinia'
import storage from '../utils/storage.js'
import dateUtil from '../utils/date.js'

export const useJournalStore = defineStore('journal', {
	state: () => ({
		journals: storage.get(storage.KEYS.JOURNALS, []),
		loading: false
	}),

	getters: {
		// 按日期降序排列
		sortedJournals() {
			return [...this.journals].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
		},

		// 总数
		totalCount() {
			return this.journals.length
		},

		// 照片总数
		totalPhotos() {
			return this.journals.reduce((sum, j) => sum + (j.photos ? j.photos.length : 0), 0)
		},

		// 心情分布
		moodDistribution() {
			const dist = {}
			this.journals.forEach(j => {
				if (j.mood) {
					dist[j.mood] = (dist[j.mood] || 0) + 1
				}
			})
			const total = this.journals.length
			const result = []
			for (const [mood, count] of Object.entries(dist)) {
				result.push({
					mood,
					count,
					percentage: total > 0 ? Math.round((count / total) * 100) : 0
				})
			}
			return result.sort((a, b) => b.count - a.count)
		},

		// 月度趋势（最近12个月）
		monthlyTrend() {
			const now = new Date()
			const trend = []
			for (let i = 11; i >= 0; i--) {
				const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
				const month = d.getMonth()
				const year = d.getFullYear()
				const count = this.journals.filter(j => {
					const jd = new Date(j.createdAt)
					return jd.getFullYear() === year && jd.getMonth() === month
				}).length
				trend.push({ month: month + 1, count })
			}
			return trend
		},

		// 连续记录天数
		consecutiveDays() {
			if (this.journals.length === 0) return 0
			const dates = [...new Set(this.journals.map(j => dateUtil.formatDate(j.createdAt)))].sort().reverse()
			let max = 1
			let current = 1
			for (let i = 1; i < dates.length; i++) {
				const prev = new Date(dates[i - 1])
				const curr = new Date(dates[i])
				const diff = Math.floor((prev - curr) / 86400000)
				if (diff === 1) {
					current++
					max = Math.max(max, current)
				} else {
					current = 1
				}
			}
			return max
		},

		// 本月新增
		thisMonthCount() {
			const now = new Date()
			return this.journals.filter(j => {
				const d = new Date(j.createdAt)
				return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
			}).length
		}
	},

	actions: {
		// 保存到本地存储
		persist() {
			storage.set(storage.KEYS.JOURNALS, this.journals)
		},

		// 新增手账
		addJournal(data) {
			const now = dateUtil.formatDateTime(new Date())
			const journal = {
				id: storage.generateId('jour'),
				locationId: data.locationId || '',
				locationName: data.locationName || '',
				title: data.title || '未命名手账',
				content: data.content || '',
				photos: data.photos || [],
				mood: data.mood || '😊',
				ratings: data.ratings || {
					environment: 5,
					scenery: 5,
					transport: 5,
					experience: 5
				},
				overallRating: data.ratings ? calcOverall(data.ratings) : 5,
				tags: data.tags || [],
				createdAt: data.createdAt || now,
				updatedAt: now
			}
			this.journals.unshift(journal)
			this.persist()
			return journal
		},

		// 更新手账
		updateJournal(id, data) {
			const idx = this.journals.findIndex(j => j.id === id)
			if (idx === -1) return null
			const updated = {
				...this.journals[idx],
				...data,
				updatedAt: dateUtil.formatDateTime(new Date())
			}
			if (data.ratings) {
				updated.overallRating = calcOverall(data.ratings)
			}
			this.journals[idx] = updated
			this.persist()
			return updated
		},

		// 删除手账
		deleteJournal(id) {
			const idx = this.journals.findIndex(j => j.id === id)
			if (idx === -1) return false
			this.journals.splice(idx, 1)
			this.persist()
			return true
		},

		// 获取手账详情
		getJournal(id) {
			return this.journals.find(j => j.id === id)
		},

		// 按地点获取手账
		getJournalsByLocation(locationId) {
			return this.sortedJournals.filter(j => j.locationId === locationId)
		},

		// 搜索手账
		search(keyword) {
			const kw = keyword.toLowerCase().trim()
			if (!kw) return []
			return this.sortedJournals.filter(j =>
				j.title.toLowerCase().includes(kw) ||
				j.content.toLowerCase().includes(kw) ||
				j.locationName.toLowerCase().includes(kw) ||
				(j.tags && j.tags.some(t => t.toLowerCase().includes(kw)))
			)
		}
	}
})

/**
 * 计算综合评分
 */
function calcOverall(ratings) {
	const vals = Object.values(ratings)
	return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
}
