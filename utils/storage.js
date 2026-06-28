/**
 * 本地存储工具
 * 封装 uni-app 的同步存储 API，提供统一的数据持久化接口
 */

const KEYS = {
	JOURNALS: 'trace_journals',
	LOCATIONS: 'trace_locations',
	PROFILE: 'trace_profile',
	SETTINGS: 'trace_settings',
	BACKUP: 'trace_backup'
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

/**
 * 写入存储数据
 * @param {string} key 存储键名
 * @param {*} value 存储的值
 */
function set(key, value) {
	try {
		uni.setStorageSync(key, value)
	} catch (e) {
		console.error('写入存储失败:', key, e)
	}
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
 * 创建数据备份
 * 收集所有业务数据并打包为备份对象，写入本地存储
 * @returns {{ success: boolean, message: string, timestamp: string }}
 */
function createBackup() {
	try {
		const backup = {
			version: '0.0.1',
			timestamp: new Date().toISOString(),
			data: {
				journals: get(KEYS.JOURNALS, []),
				locations: get(KEYS.LOCATIONS, []),
				profile: get(KEYS.PROFILE, {}),
				settings: get(KEYS.SETTINGS, {})
			}
		}
		set(KEYS.BACKUP, backup)
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
 * @returns {{ exists: boolean, timestamp: string, version: string, counts: { journals: number, locations: number } }}
 */
function getBackupInfo() {
	const backup = get(KEYS.BACKUP, null)
	if (!backup) {
		return { exists: false, timestamp: '', version: '', counts: { journals: 0, locations: 0 } }
	}
	return {
		exists: true,
		timestamp: backup.timestamp,
		version: backup.version || '0.0.1',
		counts: {
			journals: (backup.data && backup.data.journals) ? backup.data.journals.length : 0,
			locations: (backup.data && backup.data.locations) ? backup.data.locations.length : 0
		}
	}
}

/**
 * 从备份恢复数据
 * 将备份中的数据写回各业务存储键
 * @returns {{ success: boolean, message: string }}
 */
function restoreBackup() {
	try {
		const backup = get(KEYS.BACKUP, null)
		if (!backup || !backup.data) {
			return { success: false, message: '未找到备份数据' }
		}
		set(KEYS.JOURNALS, backup.data.journals || [])
		set(KEYS.LOCATIONS, backup.data.locations || [])
		set(KEYS.PROFILE, backup.data.profile || {})
		set(KEYS.SETTINGS, backup.data.settings || {})
		return { success: true, message: '恢复成功' }
	} catch (e) {
		console.error('恢复备份失败:', e)
		return { success: false, message: '恢复失败：' + (e.message || '未知错误') }
	}
}

export default {
	KEYS,
	get,
	set,
	generateId,
	createBackup,
	getBackupInfo,
	restoreBackup
}
