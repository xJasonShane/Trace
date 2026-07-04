/**
 * 手账数据 Store
 * 管理手账的增删查改
 */
import { defineStore } from 'pinia'
import storage from '../utils/storage.js'
import dateUtil from '../utils/date.js'
import imageUtil from '../utils/image.js'
import { DEFAULT_RATINGS, calcOverallRating } from '../constants/rating.js'
import { useLocationStore } from './location.js'

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
		// 跨年场景下同月份数字（如 1月）需通过 year 字段区分，避免 UI 显示混淆
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
				trend.push({
					month: d.getMonth() + 1,
					year: d.getFullYear(),
					count: buckets.get(`${d.getFullYear()}-${d.getMonth()}`)
				})
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
		},

		// 按条件读取的纯查询方法以 curried getter 形式声明，
		// 调用语法 store.fn(arg) 与 action 一致，但语义上表明这是只读操作且不触发 mutation
		// 获取手账详情
		getJournal: (state) => (id) => state.journals.find(j => j.id === id),

		// 按地点获取手账（依赖 sortedJournals，使用 this 访问其他 getter）
		// 注：curried getter 在需要访问其他 getter 时必须用 method 形式（this 指向 store 实例）
		getJournalsByLocation() {
			return (locationId) => this.sortedJournals.filter(j => j.locationId === locationId)
		},

		// 按地点获取照片总数（依赖 getJournalsByLocation，避免页面层重复 reduce 计算）
		photosByLocation() {
			return (locationId) => this.getJournalsByLocation(locationId).reduce(
				(sum, j) => sum + (j.photos ? j.photos.length : 0),
				0
			)
		},

		// 搜索手账
		search() {
			return (keyword) => {
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
	},

	actions: {
		// 保存到本地存储
		persist() {
			return storage.set(storage.KEYS.JOURNALS, this.journals)
		},

		/**
		 * 同步指定地点的统计数据到 location store
		 * 跨 store 同步逻辑收敛至此，页面层只需调用一次
		 * 计算该地点的手账总数与照片总数，并调用 locationStore.updateStats
		 * @param {string} locationId - 地点ID
		 * @returns {boolean} locationStore.updateStats 的返回值；locationId 为空时返回 false
		 */
		syncLocationStats(locationId) {
			if (!locationId) return false
			const journals = this.getJournalsByLocation(locationId)
			const photoCount = journals.reduce(
				(sum, j) => sum + (j.photos ? j.photos.length : 0),
				0
			)
			const locationStore = useLocationStore()
			return locationStore.updateStats(locationId, journals.length, photoCount)
		},

		/**
		 * 解除地点与所有关联手账的关联关系
		 * 用于地点删除时，避免手账残留指向已删除地点的 locationId/locationName
		 * 批量更新所有匹配手账的 locationId/locationName 为空，并持久化
		 * @param {string} locationId - 被删除的地点ID
		 * @returns {number} 解除关联的手账数量
		 */
		unlinkLocation(locationId) {
			if (!locationId) return 0
			let count = 0
			this.journals.forEach(j => {
				if (j.locationId === locationId) {
					j.locationId = ''
					j.locationName = j.locationName || '已删除地点'
					count++
				}
			})
			if (count > 0) {
				this.persist()
			}
			return count
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
			if (!this.persist()) {
				// 持久化失败：回滚内存状态
				this.journals.shift()
				return null
			}
			return journal
		},

		// 更新手账
		updateJournal(id, data) {
			const idx = this.journals.findIndex(j => j.id === id)
			if (idx === -1) return null
			const original = this.journals[idx]
			const updated = {
				...original,
				...data,
				updatedAt: dateUtil.formatDateTime(new Date())
			}
			if (data.ratings) {
				updated.overallRating = calcOverallRating(data.ratings)
			}
			this.journals[idx] = updated
			if (!this.persist()) {
				// 持久化失败：回滚内存状态
				this.journals[idx] = original
				return null
			}
			// 照片列表变化时，清理被移除的旧照片文件
			if (data.photos && Array.isArray(original.photos)) {
				const removed = original.photos.filter(p => !updated.photos.includes(p))
				if (removed.length > 0) {
					this._cleanupJournalPhotos({ photos: removed })
				}
			}
			return updated
		},

		// 删除手账
		deleteJournal(id) {
			const idx = this.journals.findIndex(j => j.id === id)
			if (idx === -1) return false
			const removed = this.journals.splice(idx, 1)[0]
			if (!this.persist()) {
				// 持久化失败：回滚内存状态
				this.journals.splice(idx, 0, removed)
				return false
			}
			// 持久化成功后异步清理关联照片文件，避免存储泄漏（fire-and-forget）
			this._cleanupJournalPhotos(removed)
			return true
		},

		/**
		 * 清理手账关联的照片文件（内部方法）
		 * 异步执行，不阻塞删除流程；失败时仅打印日志，不影响业务
		 * 跨端兼容：
		 *   - App 端：永久路径形如 _doc/xxx、_documents/xxx、/store/xxx、/unpackage/xxx
		 *   - 微信小程序：永久路径形如 wxfile://store_xxx（区别于临时路径 wxfile://tmp_xxx）
		 *   - H5 端：blob:/data: 路径无需也无法清理，自动跳过
		 * @param {Object} journal 已删除的手账对象
		 */
		_cleanupJournalPhotos(journal) {
			if (!journal || !Array.isArray(journal.photos) || journal.photos.length === 0) return
			// 仅清理永久保存路径（uni.saveFile 返回的路径）
			// 临时路径（如 http://tmp/xxx.jpg、wxfile://tmp_xxx、blob:）无需清理
			const permanentPaths = journal.photos.filter(p => {
				if (typeof p !== 'string') return false
				// App 端永久路径前缀
				if (p.startsWith('_doc/') || p.startsWith('_documents/') || p.startsWith('/store') || p.includes('/unpackage/')) {
					return true
				}
				// 微信小程序永久路径前缀（wxfile://store_xxx），区别于临时路径 wxfile://tmp_xxx
				if (p.startsWith('wxfile://store_') || p.startsWith('http://store/') || p.startsWith('https://store/')) {
					return true
				}
				return false
			})
			permanentPaths.forEach(filePath => {
				imageUtil.removeFile(filePath).then(ok => {
					if (!ok) console.warn('清理照片文件失败:', filePath)
				}).catch(err => {
					console.warn('清理照片文件异常:', filePath, err)
				})
			})
		},

		// 获取手账详情、按地点获取手账、搜索 已迁移为 getter（curried 形式）

		// 保存草稿（用于未保存退出时恢复）
		saveDraft(draft) {
			if (!draft) return
			const payload = {
				form: draft,
				savedAt: dateUtil.formatDateTime(new Date())
			}
			storage.set(storage.KEYS.JOURNAL_DRAFT, payload)
		},

		// 读取草稿
		getDraft() {
			return storage.get(storage.KEYS.JOURNAL_DRAFT, null)
		},

		// 清除草稿
		clearDraft() {
			storage.set(storage.KEYS.JOURNAL_DRAFT, null)
		}
	}
})
