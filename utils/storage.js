/**
 * 本地存储工具
 * 封装 uni-app 的同步存储 API，提供统一的数据持久化接口
 */

const KEYS = {
	JOURNALS: 'trace_journals',
	LOCATIONS: 'trace_locations',
	PROFILE: 'trace_profile',
	SETTINGS: 'trace_settings'
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
		return value === '' ? defaultValue : value
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
 * 删除存储数据
 * @param {string} key 存储键名
 */
function remove(key) {
	try {
		uni.removeStorageSync(key)
	} catch (e) {
		console.error('删除存储失败:', key, e)
	}
}

/**
 * 生成唯一ID
 * @param {string} prefix 前缀
 * @returns {string} 唯一ID
 */
function generateId(prefix = 'id') {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export default {
	KEYS,
	get,
	set,
	remove,
	generateId
}
