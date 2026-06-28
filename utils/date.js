/**
 * 日期处理工具
 */

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date|string|number} date
 * @returns {string}
 */
function formatDate(date) {
	const d = new Date(date)
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}-${m}-${day}`
}

/**
 * 格式化日期为 YYYY.MM.DD
 * @param {Date|string|number} date
 * @returns {string}
 */
function formatDateDot(date) {
	const d = new Date(date)
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}.${m}.${day}`
}

/**
 * 格式化日期时间
 * @param {Date|string|number} date
 * @returns {string} YYYY-MM-DD HH:mm
 */
function formatDateTime(date) {
	const d = new Date(date)
	const dateStr = formatDate(d)
	const h = String(d.getHours()).padStart(2, '0')
	const min = String(d.getMinutes()).padStart(2, '0')
	return `${dateStr} ${h}:${min}`
}

/**
 * 获取相对时间描述
 * @param {Date|string|number} date
 * @returns {string} 如 "2小时前"、"昨天"、"3天前"
 */
function formatRelative(date) {
	const d = new Date(date)
	const now = new Date()
	const diff = now - d
	const minutes = Math.floor(diff / 60000)
	const hours = Math.floor(diff / 3600000)
	const days = Math.floor(diff / 86400000)

	if (minutes < 1) return '刚刚'
	if (minutes < 60) return `${minutes}分钟前`
	if (hours < 24) return `${hours}小时前`
	if (days === 1) return '昨天'
	if (days < 7) return `${days}天前`
	if (days < 30) return `${Math.floor(days / 7)}周前`
	return formatDate(d)
}

/**
 * 获取日期分组标签
 * @param {Date|string|number} date
 * @returns {string} "今天"、"昨天"、"上周"、"更早"
 */
function getDateGroup(date) {
	const d = new Date(date)
	const now = new Date()
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
	const diffDays = Math.floor((today - target) / 86400000)

	if (diffDays === 0) return '今天'
	if (diffDays === 1) return '昨天'
	if (diffDays < 7) return '本周'
	if (diffDays < 14) return '上周'
	if (diffDays < 30) return '本月'
	return '更早'
}

export default {
	formatDate,
	formatDateDot,
	formatDateTime,
	formatRelative,
	getDateGroup
}
