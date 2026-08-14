/**
 * 本地存储工具
 * 封装 uni-app 的同步存储 API，提供统一的数据持久化接口
 */

/**
 * 应用数据格式版本（用于备份兼容性校验与数据迁移）
 * 升级数据结构时需同步提升此版本号，并在 migrate 中增加迁移规则
 */
const SCHEMA_VERSION = '1.0.0'

const KEYS = {
	JOURNALS: 'trace_journals',
	LOCATIONS: 'trace_locations',
	PROFILE: 'trace_profile',
	SETTINGS: 'trace_settings',
	BACKUP: 'trace_backup',
	AUTO_SNAPSHOT: 'trace_auto_snapshot',
	JOURNAL_DRAFT: 'trace_journal_draft',
	SEARCH_HISTORY: 'trace_search_history',
	// 数据格式版本号键：记录当前已应用的 schema 版本，用于判断是否需要迁移
	SCHEMA_VERSION: 'trace_schema_version'
}

/**
 * 各业务键的字段默认值
 * 用于迁移时补全老用户数据中缺失的字段（深度合并策略：仅补缺失字段，不覆盖已有值）
 */
const DEFAULTS = {
	journals: {
		id: '',
		locationId: '',
		locationName: '',
		title: '未命名手账',
		content: '',
		photos: [],
		mood: '',
		ratings: null,
		overallRating: 0,
		tags: [],
		createdAt: '',
		updatedAt: '',
		favorite: false
	},
	locations: {
		id: '',
		name: '未知地点',
		address: '',
		latitude: 0,
		longitude: 0,
		coverColor: 'warm',
		visitCount: 1,
		lastVisitDate: '',
		journalCount: 0,
		photoCount: 0,
		createdAt: ''
	},
	profile: {
		nickname: '小鹿同学',
		bio: '用脚步丈量世界，用手账记录时光',
		city: '杭州',
		birthday: '1998-06-15',
		avatar: ''
	},
	settings: {
		notifications: true,
		theme: 'light',
		backup: true,
		onboarded: false
	}
}

/**
 * 深度合并默认值到目标对象（仅补全缺失字段，不覆盖已有值）
 * 用于数据迁移：老用户数据缺少新增字段时回填默认值
 * @param {Object} defaults 默认值对象
 * @param {*} target 目标数据（可能是对象、数组或原始值）
 * @returns {*} 合并后的数据
 */
function _mergeDefaults(defaults, target) {
	// 数组类型直接返回原值（数组元素不做迁移，避免影响数据完整性）
	if (Array.isArray(defaults)) {
		return Array.isArray(target) ? target : defaults
	}
	// 默认值为对象时，递归合并
	if (defaults && typeof defaults === 'object') {
		const result = (target && typeof target === 'object' && !Array.isArray(target))
			? { ...target }
			: {}
		for (const key of Object.keys(defaults)) {
			if (target && typeof target === 'object' && key in target) {
				result[key] = _mergeDefaults(defaults[key], target[key])
			} else {
				result[key] = defaults[key]
			}
		}
		return result
	}
	// 原始值类型：target 为 undefined/null 时用默认值，否则保留 target
	return (target === undefined || target === null) ? defaults : target
}

/**
 * 执行数据迁移
 * 流程：
 *   1. 读取 trace_schema_version，与当前 SCHEMA_VERSION 比较
 *   2. 若版本一致则跳过迁移
 *   3. 否则按 DEFAULTS 深度合并补全各业务键缺失字段
 *   4. 所有键写入成功后，才写入新版本号；任一键写入失败则保留旧版本号，下次启动重试
 * @returns {boolean} 是否执行了迁移
 */
function migrate() {
	const currentVersion = get(KEYS.SCHEMA_VERSION, '')
	if (currentVersion === SCHEMA_VERSION) return false

	// 逐键补全缺失字段；任一写入失败则中止并返回，保留旧版本号以便下次重试
	if (DEFAULTS.journals) {
		const journals = get(KEYS.JOURNALS, [])
		if (Array.isArray(journals)) {
			const merged = journals.map(j => _mergeDefaults(DEFAULTS.journals, j))
			if (!set(KEYS.JOURNALS, merged)) return false
		}
	}
	if (DEFAULTS.locations) {
		const locations = get(KEYS.LOCATIONS, [])
		if (Array.isArray(locations)) {
			const merged = locations.map(l => _mergeDefaults(DEFAULTS.locations, l))
			if (!set(KEYS.LOCATIONS, merged)) return false
		}
	}
	if (DEFAULTS.profile) {
		const profile = get(KEYS.PROFILE, {})
		const merged = _mergeDefaults(DEFAULTS.profile, profile)
		if (!set(KEYS.PROFILE, merged)) return false
	}
	if (DEFAULTS.settings) {
		const settings = get(KEYS.SETTINGS, {})
		const merged = _mergeDefaults(DEFAULTS.settings, settings)
		if (!set(KEYS.SETTINGS, merged)) return false
	}

	// 所有业务键写入成功后，写入新版本号
	if (!set(KEYS.SCHEMA_VERSION, SCHEMA_VERSION)) return false
	return true
}

/**
 * 读取存储数据
 * @param {string} key 存储键名
 * @param {*} defaultValue 默认值
 * @returns {*} 存储的数据或默认值
 */
function get(key, defaultValue = null) {
	try {
		const value = uni.getStorageSync(key)
		// uni.getStorageSync 在 key 不存在时返回空字符串 ''，此处判定为无数据
		// 注：本项目存储的都是对象/数组，不会存储原始空字符串，因此该判断安全
		return value === '' || value === null || value === undefined ? defaultValue : value
	} catch (e) {
		console.error('读取存储失败:', key, e)
		return defaultValue
	}
}

// 上次存储写入错误提示时间，用于去重（3秒内只弹一次）
let _lastStorageErrorAt = 0
/**
 * 显示存储写入错误提示（去重，3秒内只弹一次）
 */
function _notifyStorageError() {
	const now = Date.now()
	if (now - _lastStorageErrorAt < 3000) return
	_lastStorageErrorAt = now
	try {
		uni.showModal({
			title: '存储写入失败',
			content: '本地数据保存失败，可能因存储空间不足导致数据未能持久化。请清理手机存储空间后重试，重要数据建议先备份。',
			showCancel: false,
			confirmText: '我知道了'
		})
	} catch (modalErr) {
		// 某些平台（如测试环境）showModal 不可用，回退到 toast
		uni.showToast({ title: '存储写入失败，请清理空间后重试', icon: 'none', duration: 3000 })
	}
}

/**
 * 写入存储数据
 * @param {string} key 存储键名
 * @param {*} value 存储的值
 * @returns {boolean} 是否写入成功
 */
function set(key, value) {
	try {
		uni.setStorageSync(key, value)
		return true
	} catch (e) {
		console.error('写入存储失败:', key, e)
		_notifyStorageError()
		return false
	}
}

/**
 * 异步读取存储数据（基于 uni.getStorage，避免阻塞主线程）
 * 适用于大对象或非首屏必需数据的读取场景
 * @param {string} key 存储键名
 * @param {*} defaultValue 默认值
 * @returns {Promise<*>} 存储的数据或默认值
 */
function getAsync(key, defaultValue = null) {
	return new Promise((resolve) => {
		uni.getStorage({
			key,
			success: (res) => {
				const value = res.data
				resolve(value === '' || value === null || value === undefined ? defaultValue : value)
			},
			fail: () => resolve(defaultValue)
		})
	})
}

/**
 * 异步写入存储数据（基于 uni.setStorage）
 * @param {string} key 存储键名
 * @param {*} value 存储的值
 * @returns {Promise<boolean>} 是否写入成功
 */
function setAsync(key, value) {
	return new Promise((resolve) => {
		uni.setStorage({
			key,
			data: value,
			success: () => resolve(true),
			fail: (e) => {
				console.error('异步写入存储失败:', key, e)
				_notifyStorageError()
				resolve(false)
			}
		})
	})
}

/**
 * 异步获取备份信息
 * @returns {Promise<Object>}
 */
function getBackupInfoAsync() {
	return getAsync(KEYS.BACKUP, null).then(backup => {
		if (!backup) {
			return { exists: false, timestamp: '', version: '', counts: { journals: 0, locations: 0 }, valid: false }
		}
		const check = validateBackup(backup)
		return {
			exists: true,
			timestamp: backup.timestamp || '',
			version: backup.version || SCHEMA_VERSION,
			valid: check.valid,
			counts: {
				journals: (backup.data && backup.data.journals) ? backup.data.journals.length : 0,
				locations: (backup.data && backup.data.locations) ? backup.data.locations.length : 0
			}
		}
	})
}

/**
 * 生成唯一ID
 * @param {string} prefix 前缀
 * @returns {string} 唯一ID
 */
function generateId(prefix = 'id') {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * 校验备份数据结构完整性
 * 检查必需字段、字段类型、数组元素基本结构
 * @param {Object} backup 备份对象
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateBackup(backup) {
	const errors = []
	if (!backup || typeof backup !== 'object') {
		errors.push('备份对象为空或类型错误')
		return { valid: false, errors }
	}
	if (!backup.timestamp || typeof backup.timestamp !== 'string') {
		errors.push('缺少时间戳或格式错误')
	}
	if (!backup.version || typeof backup.version !== 'string') {
		errors.push('缺少版本号或格式错误')
	}
	const data = backup.data
	if (!data || typeof data !== 'object') {
		errors.push('缺少 data 字段或类型错误')
		return { valid: false, errors }
	}
	// journals 必须是数组，且每个元素至少要有 id 与 title
	if (!Array.isArray(data.journals)) {
		errors.push('journals 字段不是数组')
	} else {
		const badIdx = data.journals.findIndex(j => !j || typeof j !== 'object' || typeof j.id !== 'string')
		if (badIdx !== -1) {
			errors.push(`journals[${badIdx}] 缺少 id 或结构错误`)
		}
	}
	// locations 必须是数组，且每个元素至少要有 id 与 name
	if (!Array.isArray(data.locations)) {
		errors.push('locations 字段不是数组')
	} else {
		const badIdx = data.locations.findIndex(l => !l || typeof l !== 'object' || typeof l.id !== 'string')
		if (badIdx !== -1) {
			errors.push(`locations[${badIdx}] 缺少 id 或结构错误`)
		}
	}
	if (data.profile != null && typeof data.profile !== 'object') {
		errors.push('profile 字段类型错误')
	}
	if (data.settings != null && typeof data.settings !== 'object') {
		errors.push('settings 字段类型错误')
	}
	return { valid: errors.length === 0, errors }
}

/**
 * 创建数据备份
 * 收集所有业务数据并打包为备份对象，写入本地存储
 * @returns {{ success: boolean, message: string, timestamp: string }}
 */
function createBackup() {
	try {
		const backup = {
			version: SCHEMA_VERSION,
			timestamp: new Date().toISOString(),
			data: {
				journals: get(KEYS.JOURNALS, []),
				locations: get(KEYS.LOCATIONS, []),
				profile: get(KEYS.PROFILE, {}),
				settings: get(KEYS.SETTINGS, {})
			}
		}
		// 写入前自校验
		const check = validateBackup(backup)
		if (!check.valid) {
			console.error('备份数据校验失败:', check.errors)
			return { success: false, message: '备份校验失败：' + check.errors.join('；') }
		}
		if (!set(KEYS.BACKUP, backup)) {
			return { success: false, message: '备份写入存储失败，请检查存储空间' }
		}
		return {
			success: true,
			message: '备份成功',
			timestamp: backup.timestamp
		}
	} catch (e) {
		console.error('创建备份失败:', e)
		return {
			success: false,
			message: '备份失败：' + (e.message || '未知错误')
		}
	}
}

/**
 * 获取备份信息（不包含完整数据，仅用于状态展示）
 * @returns {{ exists: boolean, timestamp: string, version: string, counts: { journals: number, locations: number }, valid: boolean }}
 */
function getBackupInfo() {
	const backup = get(KEYS.BACKUP, null)
	if (!backup) {
		return { exists: false, timestamp: '', version: '', counts: { journals: 0, locations: 0 }, valid: false }
	}
	const check = validateBackup(backup)
	return {
		exists: true,
		timestamp: backup.timestamp || '',
		version: backup.version || SCHEMA_VERSION,
		valid: check.valid,
		counts: {
			journals: (backup.data && backup.data.journals) ? backup.data.journals.length : 0,
			locations: (backup.data && backup.data.locations) ? backup.data.locations.length : 0
		}
	}
}

/**
 * 创建自动快照（恢复前调用，作为回滚点）
 * 与正式备份区分，写入 AUTO_SNAPSHOT 键
 * @returns {boolean} 是否成功
 */
function createAutoSnapshot() {
	try {
		const snapshot = {
			version: SCHEMA_VERSION,
			timestamp: new Date().toISOString(),
			reason: 'pre_restore',
			data: {
				journals: get(KEYS.JOURNALS, []),
				locations: get(KEYS.LOCATIONS, []),
				profile: get(KEYS.PROFILE, {}),
				settings: get(KEYS.SETTINGS, {})
			}
		}
		return set(KEYS.AUTO_SNAPSHOT, snapshot)
	} catch (e) {
		console.error('创建自动快照失败:', e)
		return false
	}
}

/**
 * 从备份恢复数据
 * 流程：1) 校验备份 → 2) 创建恢复前自动快照 → 3) 写入各业务键
 * 若备份校验失败则中止恢复，避免脏数据覆盖现有数据
 * @returns {{ success: boolean, message: string }}
 */
function restoreBackup() {
	try {
		const backup = get(KEYS.BACKUP, null)
		if (!backup || !backup.data) {
			return { success: false, message: '未找到备份数据' }
		}
		// 恢复前严格校验
		const check = validateBackup(backup)
		if (!check.valid) {
			console.error('恢复中止：备份校验失败', check.errors)
			return { success: false, message: '恢复失败：备份文件损坏（' + check.errors.join('；') + '）' }
		}
		// 恢复前自动快照，作为回滚点
		const snapshotOk = createAutoSnapshot()
		if (!snapshotOk) {
			return { success: false, message: '创建恢复前快照失败，已中止恢复以保护现有数据' }
		}
		// 逐项写入，任一失败则中止
		if (!set(KEYS.JOURNALS, backup.data.journals || [])) {
			return { success: false, message: '恢复失败：写入手账数据时存储错误' }
		}
		if (!set(KEYS.LOCATIONS, backup.data.locations || [])) {
			return { success: false, message: '恢复失败：写入地点数据时存储错误' }
		}
		if (!set(KEYS.PROFILE, backup.data.profile || {})) {
			return { success: false, message: '恢复失败：写入资料数据时存储错误' }
		}
		if (!set(KEYS.SETTINGS, backup.data.settings || {})) {
			return { success: false, message: '恢复失败：写入设置数据时存储错误' }
		}
		return { success: true, message: '恢复成功' }
	} catch (e) {
		console.error('恢复备份失败:', e)
		return { success: false, message: '恢复失败：' + (e.message || '未知错误') }
	}
}

/**
 * 从自动快照回滚（恢复失败时调用）
 * @returns {{ success: boolean, message: string }}
 */
function rollbackFromSnapshot() {
	try {
		const snapshot = get(KEYS.AUTO_SNAPSHOT, null)
		if (!snapshot || !snapshot.data) {
			return { success: false, message: '未找到自动快照' }
		}
		set(KEYS.JOURNALS, snapshot.data.journals || [])
		set(KEYS.LOCATIONS, snapshot.data.locations || [])
		set(KEYS.PROFILE, snapshot.data.profile || {})
		set(KEYS.SETTINGS, snapshot.data.settings || {})
		return { success: true, message: '回滚成功' }
	} catch (e) {
		console.error('回滚失败:', e)
		return { success: false, message: '回滚失败：' + (e.message || '未知错误') }
	}
}

/**
 * 读取搜索历史
 * @returns {string[]}
 */
function getSearchHistory() {
	return get(KEYS.SEARCH_HISTORY, [])
}

/**
 * 添加搜索关键词到历史（去重，最多10条）
 * @param {string} keyword
 */
function addSearchHistory(keyword) {
	const kw = keyword.trim()
	if (!kw) return
	const history = getSearchHistory()
	const idx = history.indexOf(kw)
	if (idx !== -1) {
		history.splice(idx, 1)
	}
	history.unshift(kw)
	if (history.length > 10) {
		history.splice(10)
	}
	set(KEYS.SEARCH_HISTORY, history)
}

/**
 * 清空搜索历史
 */
function clearSearchHistory() {
	set(KEYS.SEARCH_HISTORY, [])
}

export default {
	KEYS,
	SCHEMA_VERSION,
	get,
	set,
	getAsync,
	setAsync,
	generateId,
	createBackup,
	getBackupInfo,
	getBackupInfoAsync,
	validateBackup,
	createAutoSnapshot,
	restoreBackup,
	rollbackFromSnapshot,
	migrate,
	getSearchHistory,
	addSearchHistory,
	clearSearchHistory
}
