/**
 * 手账数据 Store
 * 管理手账的增删查改
 */
import { defineStore } from 'pinia'
import storage from '../utils/storage.js'
import dateUtil from '../utils/date.js'
import { DEFAULT_RATINGS, calcOverallRating } from '../constants/rating.js'

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
		// 分母为有 mood 的手账数，避免无 mood 的手账导致百分比之和 < 100%
		moodDistribution() {
			const dist = {}
			let total = 0
			this.journals.forEach(j => {
				if (j.mood) {
					dist[j.mood] = (dist[j.mood] || 0) + 1
					total++
				}
			})
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
		// 优化：单次遍历通过 'YYYY-MM' key 计数，避免 O(12×n) 嵌套循环
		monthlyTrend() {
			const now = new Date()
			const buckets = new Map()
			for (let i = 0; i < 12; i++) {
				const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
				buckets.set(`${d.getFullYear()}-${d.getMonth()}`, 0)
			}
			this.journals.forEach(j => {
				const jd = new Date(j.createdAt)
				if (isNaN(jd.getTime())) return
				const key = `${jd.getFullYear()}-${jd.getMonth()}`
				if (buckets.has(key)) {
					buckets.set(key, buckets.get(key) + 1)
				}
			})
			const trend = []
			for (let i = 11; i >= 0; i--) {
				const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
				trend.push({ month: d.getMonth() + 1, count: buckets.get(`${d.getFullYear()}-${d.getMonth()}`) })
			}
			return trend
		},

		// 连续记录天数
		// 优化：直接用 Date 对象处理，避免字符串↔Date 反复转换
		consecutiveDays() {
			if (this.journals.length === 0) return 0
			// 用时间戳去重并排序（取每个日期的 0 点时间戳作为 key）
			const daySet = new Set()
			this.journals.forEach(j => {
				const d = new Date(j.createdAt)
				if (isNaN(d.getTime())) return
				const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
				daySet.add(dayStart)
			})
			const timestamps = Array.from(daySet).sort((a, b) => b - a) // 降序
			if (timestamps.length === 0) return 0
			let max = 1
			let current = 1
			for (let i = 1; i < timestamps.length; i++) {
				const diff = Math.round((timestamps[i - 1] - timestamps[i]) / 86400000)
				if (diff === 1) {
					current++
					if (current > max) max = current
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
				ratings: data.ratings || { ...DEFAULT_RATINGS },
				overallRating: data.ratings ? calcOverallRating(data.ratings) : 5,
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
				updated.overallRating = calcOverallRating(data.ratings)
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
				(j.title || '').toLowerCase().includes(kw) ||
				(j.content || '').toLowerCase().includes(kw) ||
				(j.locationName || '').toLowerCase().includes(kw) ||
				(j.tags && j.tags.some(t => t.toLowerCase().includes(kw)))
			)
		}
	}
})
